import { prisma } from '../db/prisma.js';
import { HttpError } from '../middleware/error.js';
import { wcGetProduct } from './woocommerce.js';

// Valida stock disponible en WC para los items B1 de la lista de pedidos.
// Devuelve array de problemas { wpOrderId, productId, sku, name, required, available }.
// Si WC no responde, agregamos un warning en lugar de bloquear todo el flujo.
export async function validateStock(orderIds) {
  const items = await prisma.orderItem.findMany({
    where: { orderId: { in: orderIds }, warehouse: 'B1' },
    include: { product: true, order: true },
  });

  // Sumamos cantidades requeridas por productId.
  const required = new Map();
  for (const it of items) {
    required.set(it.productId, (required.get(it.productId) || 0) + it.qty);
  }

  const problems = [];
  for (const [productId, qty] of required.entries()) {
    try {
      const p = await wcGetProduct(productId);
      const stock = typeof p.stock_quantity === 'number' ? p.stock_quantity : null;
      if (stock !== null && stock < qty) {
        const ordersAffected = items
          .filter((i) => i.productId === productId)
          .map((i) => ({ wpOrderId: i.order.wpOrderId, number: i.order.number, qty: i.qty }));
        problems.push({
          productId,
          sku: p.sku,
          name: p.name,
          required: qty,
          available: stock,
          orders: ordersAffected,
        });
      }
    } catch (err) {
      problems.push({ productId, warning: 'wc_unreachable', message: err.message });
    }
  }
  return problems;
}

// Crea una secuencia agnóstica de bodega con la lista de pedidos dada.
// Cada secuencia arrastra dos flujos de picking (B1 y B2) que cierran por
// separado. Marca los pedidos como 'sequenced' para que no entren en una
// segunda secuencia. El flujo de picking es siempre "por pedido": cada
// picker escanea el QR del albarán para tomar el pedido y empacarlo.
export async function createSequence({ orderIds, createdById, processId }) {
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    throw new HttpError(400, 'orderIds required');
  }

  // Resolver el proceso al que se asocia la secuencia:
  //   - Si el caller pasó processId explícito → validamos que esté open.
  //   - Si no, y hay UN solo proceso abierto → lo usamos automáticamente.
  //   - Si no, y hay 0 o 2+ abiertos → exigimos que se especifique processId.
  let targetProcessId = processId;
  if (targetProcessId) {
    const p = await prisma.deliveryProcess.findUnique({
      where: { id: targetProcessId },
      select: { id: true, status: true },
    });
    if (!p) throw new HttpError(404, `Proceso #${targetProcessId} no encontrado`);
    if (p.status !== 'open') throw new HttpError(409, `Proceso #${targetProcessId} está cerrado`);
  } else {
    const openProcesses = await prisma.deliveryProcess.findMany({
      where: { status: 'open' },
      select: { id: true, name: true },
      orderBy: { createdAt: 'asc' },
    });
    if (openProcesses.length === 0) {
      throw new HttpError(409, 'No hay un proceso de preparación y carga abierto. Crea uno antes de generar secuencias.');
    }
    if (openProcesses.length > 1) {
      throw new HttpError(409, 'Hay varios procesos abiertos. Indica a cuál asociar la secuencia.', { openProcesses });
    }
    targetProcessId = openProcesses[0].id;
  }

  return prisma.$transaction(async (tx) => {
    const orders = await tx.order.findMany({
      where: { id: { in: orderIds }, status: 'received' },
    });
    if (orders.length !== orderIds.length) {
      throw new HttpError(409, 'Some orders are not in "received" state or do not exist');
    }

    const seq = await tx.sequence.create({
      data: {
        processId: targetProcessId,
        createdById,
        expectedBags: orders.length,
        orders: {
          create: orders.map((o) => ({ orderId: o.id })),
        },
      },
    });

    await tx.order.updateMany({
      where: { id: { in: orderIds } },
      data: { status: 'sequenced' },
    });

    await tx.event.create({
      data: {
        type: 'sequence.created',
        actorId: createdById,
        payload: { sequenceId: seq.id, orderIds },
      },
    });

    return seq;
  });
}

// Lista TODOS los pedidos de la secuencia con su estado actual. La UI los
// muestra ordenados (no empacados arriba) y usa el conteo total para la barra
// de progreso. Incluye el claim del picker (pickedBy + claimedAt) para
// mostrar "tomado por X" en la lista.
export async function getPendingPacking(sequenceId) {
  const seq = await prisma.sequence.findUnique({ where: { id: sequenceId } });
  if (!seq) throw new HttpError(404, 'Sequence not found');

  const orders = await prisma.order.findMany({
    where: {
      sequenceLinks: { some: { sequenceId } },
      status: { in: ['sequenced', 'picked', 'packed', 'classified', 'loaded'] },
    },
    include: {
      items: { select: { id: true, warehouse: true } },
      pickedBy: { select: { wpUserId: true, displayName: true, username: true } },
    },
    orderBy: { id: 'asc' },
  });

  return orders.map((o) => {
    const b1 = o.items.filter((i) => i.warehouse === 'B1');
    return {
      id: o.id,
      number: o.number,
      customerName: o.customerName,
      shippingMethod: o.shippingMethod,
      route: o.route,
      stopPosition: o.stopPosition,
      hasB2Pending: o.hasB2Pending,
      status: o.status,
      itemCount: b1.length,
      claimedAt: o.claimedAt,
      pickedBy: o.pickedBy ? {
        wpUserId: o.pickedBy.wpUserId,
        displayName: o.pickedBy.displayName,
        username: o.pickedBy.username,
      } : null,
    };
  });
}

// Lista los pedidos con B2 pendiente en la secuencia. Cada pedido tiene su
// propia "cerradura B2" (orden.b2ClosedAt). El picker B2 entra a cada pedido,
// marca sus items B2 al ponerlos en la sub-bolsa, y cierra el B2 del pedido.
export async function getPendingPackingB2(sequenceId) {
  const seq = await prisma.sequence.findUnique({ where: { id: sequenceId } });
  if (!seq) throw new HttpError(404, 'Sequence not found');

  // Solo pedidos con hasB2Pending (tienen items B2) y que NO estén bloqueados
  // ni entregados. Mostramos los que ya cerraron B2 (al final) y los pendientes.
  const orders = await prisma.order.findMany({
    where: {
      sequenceLinks: { some: { sequenceId } },
      hasB2Pending: true,
      status: { in: ['sequenced', 'picked', 'packed', 'classified', 'loaded'] },
    },
    include: {
      items: { where: { warehouse: 'B2' }, select: { id: true, pickedAt: true } },
      b2ClosedBy: { select: { wpUserId: true, displayName: true, username: true } },
    },
    orderBy: { id: 'asc' },
  });

  return orders.map((o) => {
    const total = o.items.length;
    const pickedItems = o.items.filter((i) => i.pickedAt).length;
    return {
      id: o.id,
      number: o.number,
      customerName: o.customerName,
      shippingMethod: o.shippingMethod,
      route: o.route,
      stopPosition: o.stopPosition,
      status: o.status,
      itemCount: total,
      pickedCount: pickedItems,
      b2ClosedAt: o.b2ClosedAt,
      b2ClosedBy: o.b2ClosedBy ? {
        wpUserId: o.b2ClosedBy.wpUserId,
        displayName: o.b2ClosedBy.displayName,
        username: o.b2ClosedBy.username,
      } : null,
    };
  });
}

// Cierra el B2 de un pedido: setea pickedAt en los items B2 confirmados y
// marca b2ClosedAt/b2ClosedById en el pedido. Después chequea si la
// secuencia entera tiene su B2 completo (todos los pedidos con B2 cerrados +
// los sin B2 no aplican) y auto-cierra el flujo B2 de la secuencia.
//
// Acepta `confirmedOldSequence: boolean` análogo al pack B1 — si el picker
// confirmó que es una secuencia antigua, queda registrado en eventos.
export async function packOrderB2({ orderId, itemIds, actorId, confirmedOldSequence = false }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      sequenceLinks: { include: { sequence: { select: { id: true, b1ClosedAt: true, b2ClosedAt: true } } } },
    },
  });
  if (!order) throw new HttpError(404, 'Order not found');
  if (order.b2ClosedAt) throw new HttpError(409, 'Order B2 already closed');

  const b2Items = order.items.filter((i) => i.warehouse === 'B2');
  if (b2Items.length === 0) {
    throw new HttpError(409, 'Order has no B2 items');
  }

  const required = new Set(b2Items.map((i) => i.id));
  const confirmed = new Set(itemIds);
  const missing = [...required].filter((x) => !confirmed.has(x));

  // Si hay items faltantes, no se puede cerrar a menos que el pedido tenga
  // entrega parcial aprobada (igual que el flujo de carga: el cliente acepta
  // recibir sin esos items).
  if (missing.length > 0 && !order.allowPartialDelivery) {
    throw new HttpError(409, 'All B2 items must be checked before closing', { missingItemIds: missing });
  }

  // Pedido sin items B1: el picking B2 es a la vez la única acción de
  // preparación del pedido. En ese caso, al cerrar B2 lo avanzamos hasta
  // 'loaded' en una sola transición — no hay paso B1 que esperar, así que
  // mantenerlo en 'sequenced' o 'received' sería ruido en los kanban y la
  // dispatch. Cuando hay items B1, el status global lo decide el flujo B1
  // (en ese caso este endpoint solo cierra el sub-flujo B2 y no toca status).
  const b1Items = order.items.filter((i) => i.warehouse === 'B1');
  const onlyB2 = b1Items.length === 0;

  const now = new Date();
  const itemUpdates = confirmed.size > 0 ? [
    prisma.orderItem.updateMany({
      where: { id: { in: [...confirmed] }, orderId, warehouse: 'B2' },
      data: { pickedAt: now, packedAt: now },
    }),
  ] : [];

  const orderUpdateData = {
    b2ClosedAt: now,
    b2ClosedById: actorId,
  };
  if (onlyB2) {
    // Atajo: pedidos solo B2 ya quedaron "preparados" al cerrar B2 — no hay
    // bolsa B1 que armar ni clasificación que esperar. Avanzamos status a
    // 'loaded' y sellamos los timestamps de packing/classify/load para que
    // los kanban y reportes lo muestren correctamente.
    orderUpdateData.status = 'loaded';
    orderUpdateData.packedAt = now;
    orderUpdateData.packedById = actorId;
    orderUpdateData.classifiedAt = now;
    orderUpdateData.loadedAt = now;
  }

  await prisma.$transaction([
    ...itemUpdates,
    prisma.order.update({
      where: { id: orderId },
      data: orderUpdateData,
    }),
    prisma.event.create({
      data: {
        type: 'order.b2_packed',
        actorId,
        orderId,
        payload: { itemIds: [...confirmed], partial: missing.length > 0, onlyB2 },
      },
    }),
    ...(onlyB2
      ? [
          prisma.event.create({
            data: {
              type: 'order.loaded_b2_only',
              actorId,
              orderId,
              payload: { reason: 'no_b1_items' },
            },
          }),
        ]
      : []),
  ]);

  if (confirmedOldSequence) {
    await prisma.event.create({
      data: {
        type: 'order.b2_packed_from_old_sequence',
        actorId,
        orderId,
        payload: {},
      },
    });
  }

  // Auto-cerrar el flujo B2 de la(s) secuencia(s) si TODOS sus pedidos con B2
  // ya están cerrados. Recorre cada secuencia del pedido.
  const closedSequences = [];
  for (const link of order.sequenceLinks) {
    const seq = link.sequence;
    if (seq.b2ClosedAt) continue; // ya cerrada
    const sequenceId = seq.id;

    const pendingPedidos = await prisma.order.count({
      where: {
        sequenceLinks: { some: { sequenceId } },
        hasB2Pending: true,
        b2ClosedAt: null,
        status: { notIn: ['blocked', 'delivered'] },
      },
    });
    if (pendingPedidos === 0) {
      // B2 ya no cierra la secuencia (Fase A: secuencia cierra solo con B1).
      // Solo marca b2ClosedAt para indicar que el flujo B2 completó.
      await prisma.sequence.update({
        where: { id: sequenceId },
        data: { b2ClosedAt: now },
      });
      await prisma.event.create({
        data: {
          type: 'sequence.b2_closed',
          actorId,
          payload: { sequenceId, auto: true },
        },
      });
      closedSequences.push(sequenceId);
    }
  }

  return { ok: true, closedSequences };
}

// Cierra el flujo B1 de una secuencia: exige que todos los pedidos estén
// 'packed' (o más avanzados) y compara el conteo de bolsas físicas.
export async function closeSequenceB1({ sequenceId, actorId, actualBags }) {
  const seq = await prisma.sequence.findUnique({
    where: { id: sequenceId },
    include: { orders: { include: { order: true } } },
  });
  if (!seq) throw new HttpError(404, 'Sequence not found');
  if (seq.b1ClosedAt) throw new HttpError(409, 'B1 already closed');

  const packed = seq.orders.filter((so) => ['packed', 'classified', 'loaded', 'delivered'].includes(so.order.status)).length;
  if (typeof actualBags === 'number' && actualBags !== seq.expectedBags) {
    throw new HttpError(409, 'Bag count mismatch', {
      expected: seq.expectedBags,
      reported: actualBags,
      packed,
    });
  }
  if (packed !== seq.expectedBags) {
    throw new HttpError(409, 'Some orders are not packed yet', {
      expected: seq.expectedBags,
      packed,
    });
  }

  const now = new Date();
  // Fase A: el cierre B1 cierra la secuencia entera. El picking B2 ahora es
  // un proceso global del día/proceso, decouplado del cierre de secuencia.
  const updated = await prisma.sequence.update({
    where: { id: sequenceId },
    data: {
      b1ClosedAt: now,
      actualBags: packed,
      status: 'closed',
      closedAt: now,
    },
  });

  await prisma.event.create({
    data: {
      type: 'sequence.b1_closed',
      actorId,
      payload: { sequenceId, packed, expected: seq.expectedBags },
    },
  });

  return updated;
}

// Cierra el flujo B2 de una secuencia: exige que todos los items B2 de la
// secuencia estén pickeados.
export async function closeSequenceB2({ sequenceId, actorId }) {
  const seq = await prisma.sequence.findUnique({ where: { id: sequenceId } });
  if (!seq) throw new HttpError(404, 'Sequence not found');
  if (seq.b2ClosedAt) throw new HttpError(409, 'B2 already closed');

  const b2Items = await prisma.orderItem.findMany({
    where: {
      warehouse: 'B2',
      order: { sequenceLinks: { some: { sequenceId } } },
    },
    select: { id: true, pickedAt: true },
  });

  const total = b2Items.length;
  const pending = b2Items.filter((i) => !i.pickedAt).length;

  // Si la secuencia no tiene items B2 igual permitimos cerrarla — el flujo
  // queda en "no-op" y la secuencia entera puede cerrar cuando B1 también lo haga.
  if (pending > 0) {
    throw new HttpError(409, 'Some B2 items are still pending', { total, pending });
  }

  const now = new Date();
  const updated = await prisma.sequence.update({
    where: { id: sequenceId },
    data: { b2ClosedAt: now },
  });

  await prisma.event.create({
    data: {
      type: 'sequence.b2_closed',
      actorId,
      payload: { sequenceId, totalSkus: total },
    },
  });

  return updated;
}
