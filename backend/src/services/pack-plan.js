import { prisma } from '../db/prisma.js';
import { HttpError } from '../middleware/error.js';

const MAX_BAGS = 6;

// Multi-bulto por empaque (v0.24.0). Cuando bagsExpected > 1, el picker
// declara qué item va en qué bulto (pack plan) antes de imprimir. Después
// cada bulto se cierra por separado con un scan por bulto (mismo modelo
// que classified/loaded de v0.23.0).

// Crea o reemplaza el plan de empaque de un pedido. v0.24.2: cada assignment
// incluye qty — un item con qty>1 puede dividirse entre varios bultos y aparece
// N veces (una por bulto donde va).
//
// Falla si:
//   - N está fuera de [2, MAX_BAGS]
//   - la suma de qty por item != item.qty (no cubre todas las unidades, o
//     cubre de más)
//   - algún assignment.qty <= 0
//   - algún bagNumber fuera de [1, N]
//   - hay items B1 no asignados
//   - hay bultos sin items
//   - ya hay bag events tipo 'packed' registrados (=algún bulto ya se cerró)
export async function createPackPlan({ orderId, bagsExpected, assignments, actorId }) {
  if (!Number.isInteger(bagsExpected) || bagsExpected < 2 || bagsExpected > MAX_BAGS) {
    throw new HttpError(400, `bagsExpected debe estar entre 2 y ${MAX_BAGS}. Para single-bulto usa el pack directo.`, {
      max: MAX_BAGS,
    });
  }
  if (!Array.isArray(assignments) || assignments.length === 0) {
    throw new HttpError(400, 'Falta la distribución de items por bulto (assignments)');
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { select: { id: true, warehouse: true, qty: true } } },
  });
  if (!order) throw new HttpError(404, 'Order not found');
  if (order.status !== 'sequenced') {
    throw new HttpError(409, `El pedido no está en 'sequenced' (actual: ${order.status}). No se puede armar plan.`);
  }

  const closedBags = await prisma.orderBagEvent.count({
    where: { orderId, event: 'packed' },
  });
  if (closedBags > 0) {
    throw new HttpError(409, `Ya hay ${closedBags} bulto(s) cerrado(s). Primero descarta el plan actual (DELETE) para poder reasignar.`);
  }

  const b1Items = order.items.filter((it) => it.warehouse === 'B1');
  const b1ItemById = new Map(b1Items.map((it) => [it.id, it]));

  // Suma de qty por item (para validar contra item.qty) y por (item, bag)
  // para detectar duplicados de la misma pareja.
  const qtyByItem = new Map(); // orderItemId → suma de qty en el plan
  const seenItemBag = new Set(); // "itemId:bag" para detectar duplicados

  for (const a of assignments) {
    if (!Number.isInteger(a.orderItemId) || !b1ItemById.has(a.orderItemId)) {
      throw new HttpError(400, `Item ${a.orderItemId} no pertenece al pedido o no es B1`);
    }
    if (!Number.isInteger(a.bagNumber) || a.bagNumber < 1 || a.bagNumber > bagsExpected) {
      throw new HttpError(400, `Bulto ${a.bagNumber} fuera de rango [1..${bagsExpected}] en item ${a.orderItemId}`);
    }
    if (!Number.isInteger(a.qty) || a.qty <= 0) {
      throw new HttpError(400, `qty inválida (${a.qty}) para item ${a.orderItemId} en bulto ${a.bagNumber}`);
    }
    const key = `${a.orderItemId}:${a.bagNumber}`;
    if (seenItemBag.has(key)) {
      throw new HttpError(400, `Item ${a.orderItemId} tiene más de una asignación en el bulto ${a.bagNumber} — combina las qtys.`);
    }
    seenItemBag.add(key);
    qtyByItem.set(a.orderItemId, (qtyByItem.get(a.orderItemId) || 0) + a.qty);
  }

  // Validar que cada item B1 esté completamente cubierto (ni menos ni más).
  for (const it of b1Items) {
    const sum = qtyByItem.get(it.id) || 0;
    if (sum !== it.qty) {
      throw new HttpError(400, `Item ${it.id}: la suma de unidades asignadas (${sum}) debe igualar la qty total (${it.qty}).`, {
        orderItemId: it.id, expectedQty: it.qty, assignedQty: sum,
      });
    }
  }

  // Cada bulto debe tener al menos una asignación (no permitimos bultos vacíos).
  const bagsUsed = new Set(assignments.map((a) => a.bagNumber));
  const missingBags = [];
  for (let i = 1; i <= bagsExpected; i += 1) if (!bagsUsed.has(i)) missingBags.push(i);
  if (missingBags.length > 0) {
    throw new HttpError(400, `Bulto(s) sin items asignados: ${missingBags.join(', ')}. Cada bulto debe tener al menos un item.`);
  }

  // Reemplazamos el plan.
  await prisma.$transaction([
    prisma.orderItemBagAssignment.deleteMany({ where: { orderId } }),
    prisma.orderItemBagAssignment.createMany({
      data: assignments.map((a) => ({
        orderId,
        orderItemId: a.orderItemId,
        bagNumber: a.bagNumber,
        qty: a.qty,
      })),
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { bagsExpected },
    }),
    prisma.event.create({
      data: {
        type: 'order.pack_plan_created',
        actorId,
        orderId,
        payload: { bagsExpected, assignmentCount: assignments.length },
      },
    }),
  ]);

  return { ok: true, bagsExpected, assignmentCount: assignments.length };
}

// Descarta el plan de empaque para permitir reasignación.
//
// Comportamiento por status del pedido:
//   sequenced  → siempre permitido. Si hay bag events fantasma (residuos de
//                un plan roto por sync bulk pre-v0.25.3), los borra junto con
//                las asignaciones. Este es el camino de recuperación de
//                pedidos en estado inconsistente.
//   packed/+   → bloqueado. Hay que "Revertir un paso" primero (v0.25.1).
export async function deletePackPlan({ orderId, actorId }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });
  if (!order) throw new HttpError(404, 'Order not found');

  if (order.status !== 'sequenced') {
    throw new HttpError(409, `No se puede descartar el plan: el pedido está en "${order.status}". Usa "Revertir un paso" para volverlo a "En secuencia" primero.`, {
      currentStatus: order.status,
    });
  }

  const closedBags = await prisma.orderBagEvent.count({
    where: { orderId, event: 'packed' },
  });
  const count = await prisma.orderItemBagAssignment.count({ where: { orderId } });

  if (count === 0 && closedBags === 0) {
    return { ok: true, deleted: 0, bagEventsCleared: 0 };
  }

  await prisma.$transaction([
    prisma.orderItemBagAssignment.deleteMany({ where: { orderId } }),
    // Bag events fantasma: si el pedido está en sequenced pero tiene bag
    // events tipo 'packed', son residuos de un plan roto — se limpian junto
    // con las asignaciones para dejar el pedido listo para re-declarar plan.
    prisma.orderBagEvent.deleteMany({ where: { orderId, event: 'packed' } }),
    prisma.order.update({
      where: { id: orderId },
      data: { bagsExpected: 1 },
    }),
    prisma.event.create({
      data: {
        type: 'order.pack_plan_deleted',
        actorId,
        orderId,
        payload: { assignmentCount: count, bagEventsCleared: closedBags },
      },
    }),
  ]);
  return { ok: true, deleted: count, bagEventsCleared: closedBags };
}

// Cierra UN bulto del pedido. El picker marcó los items del bulto (itemIds)
// y presiona cerrar. Validamos que los itemIds coincidan con los items
// asignados a ese bulto (independiente de cuántas unidades tenga cada uno).
// Registramos el bag event `packed`; si con este cierre se completan los N
// bag events → transición a status='packed' + packedAt=now.
//
// Nota v0.24.2: los items pueden estar divididos entre bultos (mismo
// orderItemId con qty distinta en distintos bultos). El picker confirma
// los items presentes en el bulto — no la qty (esa la sabe el plan).
export async function closePackBag({ orderId, bagNumber, itemIds, actorId }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      bagAssignments: { where: { bagNumber }, select: { orderItemId: true, qty: true } },
    },
  });
  if (!order) throw new HttpError(404, 'Order not found');

  const bagsExpected = order.bagsExpected ?? 1;
  if (bagsExpected < 2) {
    throw new HttpError(409, 'Este pedido es single-bulto — usa POST /orders/:id/pack en su lugar.');
  }
  if (bagNumber < 1 || bagNumber > bagsExpected) {
    throw new HttpError(400, `Bulto ${bagNumber} fuera de rango [1..${bagsExpected}]`);
  }
  if (order.bagAssignments.length === 0) {
    throw new HttpError(409, `No hay plan de empaque para el bulto ${bagNumber}. Debe crearse el plan primero.`);
  }

  const expectedIds = new Set(order.bagAssignments.map((a) => a.orderItemId));
  const gotIds = new Set(itemIds || []);
  if (gotIds.size !== expectedIds.size) {
    throw new HttpError(409, `Debes confirmar los ${expectedIds.size} item(s) del bulto ${bagNumber}. Recibidos: ${gotIds.size}.`, {
      expectedItemIds: [...expectedIds],
    });
  }
  for (const id of gotIds) {
    if (!expectedIds.has(id)) {
      throw new HttpError(400, `Item ${id} no pertenece al bulto ${bagNumber}`);
    }
  }

  const now = new Date();
  const itemIdArr = [...expectedIds];

  await prisma.$transaction([
    prisma.orderItem.updateMany({
      where: { id: { in: itemIdArr }, orderId, pickedAt: null },
      data: { pickedAt: now },
    }),
    prisma.orderItem.updateMany({
      where: { id: { in: itemIdArr }, orderId },
      data: { packedAt: now },
    }),
    // Registrar el bulto como packed (idempotente por UNIQUE).
    prisma.orderBagEvent.upsert({
      where: {
        uq_order_bag_event: { orderId, bagNumber, event: 'packed' },
      },
      create: { orderId, bagNumber, event: 'packed', actorId },
      update: {},
    }),
    prisma.event.create({
      data: {
        type: 'order.bag_packed',
        actorId,
        orderId,
        payload: { bagNumber, itemIds: itemIdArr },
      },
    }),
  ]);

  // Recalcular cuántos bultos están cerrados. Si son N → cerrar pedido.
  const done = await prisma.orderBagEvent.count({
    where: { orderId, event: 'packed' },
  });
  const complete = done >= bagsExpected;
  let transitionedNow = false;

  if (complete && !order.packedAt) {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'packed',
          packedAt: now,
          packedById: actorId, // último actor que cerró
        },
      }),
      prisma.event.create({
        data: {
          type: 'order.packed',
          actorId,
          orderId,
          payload: { via: 'pack_plan', bagsExpected, itemIds: itemIdArr },
        },
      }),
    ]);
    transitionedNow = true;
  }

  return { ok: true, complete, progress: { done, total: bagsExpected }, transitionedNow };
}

// Devuelve el plan de empaque para un pedido: qué items van en qué bulto y
// con qué qty, y qué bultos ya están cerrados. La UI usa esto para
// renderizar el modo ejecución (con qty por bulto v0.24.2).
export async function getPackPlanFor(orderId) {
  const assignments = await prisma.orderItemBagAssignment.findMany({
    where: { orderId },
    orderBy: [{ bagNumber: 'asc' }, { orderItemId: 'asc' }],
    select: { orderItemId: true, bagNumber: true, qty: true },
  });
  if (assignments.length === 0) return null;
  const packedEvents = await prisma.orderBagEvent.findMany({
    where: { orderId, event: 'packed' },
    include: { actor: { select: { displayName: true, username: true } } },
    orderBy: { bagNumber: 'asc' },
  });
  return {
    assignments,
    bagsPacked: packedEvents.map((e) => ({
      bag: e.bagNumber,
      at: e.createdAt,
      actorName: e.actor?.displayName || e.actor?.username || null,
    })),
  };
}
