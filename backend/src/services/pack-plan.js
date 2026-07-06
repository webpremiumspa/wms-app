import { prisma } from '../db/prisma.js';
import { HttpError } from '../middleware/error.js';

const MAX_BAGS = 6;

// Multi-bulto por empaque (v0.24.0). Cuando bagsExpected > 1, el picker
// declara qué item va en qué bulto (pack plan) antes de imprimir. Después
// cada bulto se cierra por separado con un scan por bulto (mismo modelo
// que classified/loaded de v0.23.0).

// Crea o reemplaza el plan de empaque de un pedido. Fallo si:
//   - N está fuera de [2, MAX_BAGS] (los pedidos single-bulto no usan plan)
//   - assignments no cubren TODOS los items B1 del pedido, o traen items ajenos
//   - algún bagNumber está fuera de [1, N]
//   - ya hay bag events tipo 'packed' registrados (=algún bulto ya se cerró)
//     → hay que borrar el plan primero via deletePackPlan
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
    include: { items: { select: { id: true, warehouse: true } } },
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
  const b1ItemIds = new Set(b1Items.map((it) => it.id));

  // Validar que assignments cubran exactamente los items B1 (ni menos ni más).
  const assignedIds = new Set();
  for (const a of assignments) {
    if (!Number.isInteger(a.orderItemId) || !b1ItemIds.has(a.orderItemId)) {
      throw new HttpError(400, `Item ${a.orderItemId} no pertenece al pedido o no es B1`);
    }
    if (assignedIds.has(a.orderItemId)) {
      throw new HttpError(400, `Item ${a.orderItemId} asignado más de una vez`);
    }
    assignedIds.add(a.orderItemId);
    if (!Number.isInteger(a.bagNumber) || a.bagNumber < 1 || a.bagNumber > bagsExpected) {
      throw new HttpError(400, `Bulto ${a.bagNumber} fuera de rango [1..${bagsExpected}] en item ${a.orderItemId}`);
    }
  }
  if (assignedIds.size !== b1Items.length) {
    throw new HttpError(400, `Faltan items B1 por asignar (asignados: ${assignedIds.size}, esperados: ${b1Items.length}).`);
  }

  // Comprobar que todos los bultos [1..N] tienen al menos un item — un bulto
  // vacío no tiene sentido (el picker declaró 3 bultos pero solo usó 2).
  const bagsUsed = new Set(assignments.map((a) => a.bagNumber));
  const missingBags = [];
  for (let i = 1; i <= bagsExpected; i += 1) if (!bagsUsed.has(i)) missingBags.push(i);
  if (missingBags.length > 0) {
    throw new HttpError(400, `Bulto(s) sin items asignados: ${missingBags.join(', ')}. Cada bulto debe tener al menos un item.`);
  }

  // Reemplazamos el plan: borrar cualquier asignación previa y crear las nuevas
  // en una transacción. También sincronizamos bagsExpected en Order.
  await prisma.$transaction([
    prisma.orderItemBagAssignment.deleteMany({ where: { orderId } }),
    prisma.orderItemBagAssignment.createMany({
      data: assignments.map((a) => ({
        orderId,
        orderItemId: a.orderItemId,
        bagNumber: a.bagNumber,
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

// Descarta el plan de empaque para permitir reasignación. Falla si ya hay
// bultos cerrados — en ese caso hay que desempacar el pedido antes.
export async function deletePackPlan({ orderId, actorId }) {
  const closedBags = await prisma.orderBagEvent.count({
    where: { orderId, event: 'packed' },
  });
  if (closedBags > 0) {
    throw new HttpError(409, `No se puede descartar el plan: ya hay ${closedBags} bulto(s) cerrado(s). Desempaca el pedido primero.`);
  }
  const count = await prisma.orderItemBagAssignment.count({ where: { orderId } });
  if (count === 0) {
    return { ok: true, deleted: 0 };
  }
  await prisma.$transaction([
    prisma.orderItemBagAssignment.deleteMany({ where: { orderId } }),
    prisma.order.update({
      where: { id: orderId },
      data: { bagsExpected: 1 },
    }),
    prisma.event.create({
      data: {
        type: 'order.pack_plan_deleted',
        actorId,
        orderId,
        payload: { assignmentCount: count },
      },
    }),
  ]);
  return { ok: true, deleted: count };
}

// Cierra UN bulto del pedido. El picker marcó los items del bulto (itemIds)
// y presiona cerrar. Validamos que los itemIds coincidan exactamente con
// los items asignados a ese bulto, actualizamos pickedAt/packedAt en los
// items y registramos el bag event `packed`.
//
// Si con este cierre se completan los N bag events → transiciona el pedido
// a status='packed' + packedAt=now.
export async function closePackBag({ orderId, bagNumber, itemIds, actorId }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      bagAssignments: { where: { bagNumber }, select: { orderItemId: true } },
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
  // El plan debe existir (los assignments cubren todos los bultos).
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

// Devuelve el plan de empaque para un pedido: qué items van en qué bulto,
// qué bultos ya están cerrados. La UI usa esto para renderizar el modo
// ejecución.
export async function getPackPlanFor(orderId) {
  const assignments = await prisma.orderItemBagAssignment.findMany({
    where: { orderId },
    orderBy: [{ bagNumber: 'asc' }, { orderItemId: 'asc' }],
    select: { orderItemId: true, bagNumber: true },
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
