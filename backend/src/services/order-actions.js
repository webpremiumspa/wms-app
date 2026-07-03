import { prisma } from '../db/prisma.js';
import { HttpError } from '../middleware/error.js';

// Único estado en el que NO se puede sacar un pedido de una secuencia:
// ya está entregado (es un evento final). Antes también bloqueábamos
// classified/loaded, pero el caso real "cliente no recibe en ruta" exige
// poder rescatar la bolsa al volver al depósito, así que ese chequeo
// se hace ahora con confirmación reforzada en la UI, no como bloqueo duro.
const REMOVE_BLOCKED_STATUSES = ['delivered'];

// Motivos válidos para sacar un pedido de la secuencia. Algunos cierran el
// caso ("cliente_cancelo": el pedido no vuelve), otros lo reagendan
// implícitamente ("cliente_no_recibe", "direccion_incorrecta", etc.). En
// todos los casos el pedido vuelve a la pila de pendientes (status='received')
// y queda disponible para entrar a una próxima secuencia; el motivo viaja
// en el evento de auditoría para que el supervisor lo vea como contexto.
export const REMOVE_REASONS = Object.freeze([
  'cliente_no_recibe',
  'direccion_incorrecta',
  'sin_stock_b1',
  'sin_stock_b2',
  'producto_danado',
  'cliente_cancelo',
  'otro',
]);

// Saca un pedido de su secuencia: revierte items, lo devuelve a status
// 'received' (lista para próxima secuencia) y deja un evento de auditoría
// con el motivo. Decrementa expectedBags de la secuencia parent para que
// el cierre B1 cuadre.
//
// Antes el pedido quedaba en `blocked` esperando reactivación manual,
// pero nunca hubo botón "Reactivar" en la UI, así que en la práctica era
// un viaje de ida. Ahora vuelve directo a `received` con un contexto
// audit-trail. Si hay que excluirlo de la próxima secuencia, el supervisor
// lo ve por el badge "Removido del proceso X · motivo Y" en la lista de
// pendientes y simplemente no lo marca.
export async function removeOrderFromSequence({
  sequenceId,
  orderId,
  reasonCode,
  reasonText,
  actorId,
}) {
  if (!REMOVE_REASONS.includes(reasonCode)) {
    throw new HttpError(400, 'Invalid reasonCode', { allowed: REMOVE_REASONS });
  }

  const link = await prisma.sequenceOrder.findUnique({
    where: { sequenceId_orderId: { sequenceId, orderId } },
    include: { order: true, sequence: { select: { id: true, processId: true } } },
  });
  if (!link) throw new HttpError(404, 'Order is not in this sequence');

  if (REMOVE_BLOCKED_STATUSES.includes(link.order.status)) {
    throw new HttpError(409, 'Pedido ya entregado — no se puede sacar de la secuencia.', {
      currentStatus: link.order.status,
    });
  }

  const previousStatus = link.order.status;

  // Contamos los bag events del pedido para dejarlos en el payload de
  // auditoría antes de borrarlos. Sin este borrado, si el pedido vuelve a
  // entrar a otra secuencia, los eventos viejos arruinan el conteo de la
  // nueva ronda (el UNIQUE los hace idempotentes pero contaminan el done).
  const bagEventsCount = await prisma.orderBagEvent.count({ where: { orderId } });

  await prisma.$transaction([
    prisma.orderItem.updateMany({
      where: { orderId },
      data: { pickedAt: null, packedAt: null },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'received',
        packedAt: null,
        packedById: null,
        pickedById: null,
        claimedAt: null,
        b2ClosedAt: null,
        b2ClosedById: null,
        classifiedAt: null,
        loadedAt: null,
        bagsExpected: 1,
        allowPartialDelivery: false,
        partialDeliveryNote: null,
      },
    }),
    // Borrar bag events: el pedido vuelve a 'received' y quedaría inconsistente
    // que aún tenga bultos "clasificados" o "cargados" en la tabla.
    prisma.orderBagEvent.deleteMany({ where: { orderId } }),
    prisma.sequenceOrder.delete({
      where: { sequenceId_orderId: { sequenceId, orderId } },
    }),
    prisma.sequence.update({
      where: { id: sequenceId },
      data: { expectedBags: { decrement: 1 } },
    }),
    prisma.event.create({
      data: {
        type: 'sequence.order_removed',
        actorId,
        orderId,
        payload: {
          sequenceId,
          processId: link.sequence.processId ?? null,
          reasonCode,
          reasonText: reasonText || null,
          previousStatus,
          bagEventsCleared: bagEventsCount,
        },
      },
    }),
  ]);

  return { ok: true, bagEventsCleared: bagEventsCount };
}

// Desempacar: revierte un pedido empacado (o ya clasificado) al estado
// `sequenced` para que el picker lo vuelva a tomar. Útil cuando se cerró
// por error o durante pruebas. NO se permite si el pedido ya fue cargado
// al vehículo (la bolsa salió físicamente del depósito) ni entregado.
//
// Lo que limpia:
//  - Items: pickedAt, packedAt → null (se vuelve a marcar todo)
//  - Order: status='sequenced', packedAt/By, classifiedAt, pickedById,
//    claimedAt → null; bagsExpected → 1 (se redeclara al recerrar)
//
// Lo que NO toca:
//  - b2ClosedAt/By — el flujo B2 es independiente; si quedó cerrado, se
//    mantiene cerrado (revertirlo es un proceso aparte).
//  - allowPartialDelivery, partialDeliveryNote — son decisiones del
//    supervisor que sobreviven al desempaque.
const TOO_LATE_TO_UNPACK = ['loaded', 'delivered'];
const UNPACKABLE_STATUSES = ['packed', 'classified'];

export async function unpackOrder({ orderId, actorId }) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new HttpError(404, 'Order not found');

  if (TOO_LATE_TO_UNPACK.includes(order.status)) {
    throw new HttpError(409, 'Pedido ya cargado o entregado — no se puede desempacar.', {
      currentStatus: order.status,
    });
  }
  if (!UNPACKABLE_STATUSES.includes(order.status)) {
    throw new HttpError(409, `Pedido en estado "${order.status}" — solo se puede desempacar packed o classified.`, {
      currentStatus: order.status,
    });
  }

  // Bag events del pedido — se borran junto con la reversión. Sin esto, si
  // el pedido se vuelve a empacar (nueva cuenta de bultos) y clasificar,
  // los eventos viejos podrían sumarse al progreso y saltear scans reales.
  const bagEventsCount = await prisma.orderBagEvent.count({ where: { orderId } });

  const prevSnapshot = {
    status: order.status,
    bagsExpected: order.bagsExpected,
    packedAt: order.packedAt,
    packedById: order.packedById,
    classifiedAt: order.classifiedAt,
    bagEventsCleared: bagEventsCount,
  };

  await prisma.$transaction([
    prisma.orderItem.updateMany({
      where: { orderId },
      data: { pickedAt: null, packedAt: null },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'sequenced',
        packedAt: null,
        packedById: null,
        classifiedAt: null,
        pickedById: null,
        claimedAt: null,
        bagsExpected: 1,
      },
    }),
    prisma.orderBagEvent.deleteMany({ where: { orderId } }),
    prisma.event.create({
      data: {
        type: 'order.unpacked',
        actorId,
        orderId,
        payload: prevSnapshot,
      },
    }),
  ]);

  return { ok: true, bagEventsCleared: bagEventsCount };
}

// Reabrir el cierre B2 de un pedido: limpia b2ClosedAt/By y resetea los
// items B2 a sin pickear. Útil cuando se cerró B2 por error/prueba.
// No toca el flujo B1 (status, packedAt, etc.). Bloqueado para pedidos
// loaded/delivered (la bolsa ya salió a entrega).
export async function reopenB2({ orderId, actorId }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { select: { id: true, warehouse: true } } },
  });
  if (!order) throw new HttpError(404, 'Order not found');

  if (TOO_LATE_TO_UNPACK.includes(order.status)) {
    throw new HttpError(409, 'Pedido ya cargado o entregado — no se puede reabrir B2.', {
      currentStatus: order.status,
    });
  }
  if (!order.b2ClosedAt) {
    throw new HttpError(409, 'B2 de este pedido no está cerrado — no hay nada que reabrir.');
  }

  const b2ItemIds = order.items.filter((i) => i.warehouse === 'B2').map((i) => i.id);

  await prisma.$transaction([
    prisma.orderItem.updateMany({
      where: { id: { in: b2ItemIds } },
      data: { pickedAt: null, packedAt: null },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: {
        b2ClosedAt: null,
        b2ClosedById: null,
      },
    }),
    prisma.event.create({
      data: {
        type: 'order.b2_reopened',
        actorId,
        orderId,
        payload: {
          previousB2ClosedAt: order.b2ClosedAt,
          previousB2ClosedById: order.b2ClosedById,
        },
      },
    }),
  ]);

  return { ok: true };
}

// Reactiva un pedido bloqueado: vuelve a `received` para que entre en la
// próxima sincronización / secuencia.
export async function unblockOrder({ orderId, actorId }) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new HttpError(404, 'Order not found');
  if (order.status !== 'blocked') {
    throw new HttpError(409, 'Order is not blocked', { currentStatus: order.status });
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: 'received' },
    }),
    prisma.event.create({
      data: {
        type: 'order.unblocked',
        actorId,
        orderId,
        payload: {},
      },
    }),
  ]);
  return { ok: true };
}

// Autoriza entrega parcial: el cliente acepta recibir el pedido aunque falten
// items B2. El bloqueo en dispatch se omite y el albarán muestra el aviso.
export async function approvePartialDelivery({ orderId, note, actorId }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) throw new HttpError(404, 'Order not found');
  if (['delivered'].includes(order.status)) {
    throw new HttpError(409, 'Order already delivered');
  }
  if (!order.hasB2Pending) {
    throw new HttpError(409, 'Order has no B2 items — partial delivery not applicable');
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        allowPartialDelivery: true,
        partialDeliveryNote: note || null,
      },
    }),
    prisma.event.create({
      data: {
        type: 'order.partial_delivery_approved',
        actorId,
        orderId,
        payload: { note: note || null },
      },
    }),
  ]);
  return { ok: true };
}

// Revoca la aprobación de entrega parcial (por si se aprobó por error y el
// cliente cambió de opinión, o llegó el stock antes de cargar).
export async function revokePartialDelivery({ orderId, actorId }) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new HttpError(404, 'Order not found');
  if (!order.allowPartialDelivery) {
    throw new HttpError(409, 'Order does not have partial delivery approved');
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { allowPartialDelivery: false, partialDeliveryNote: null },
    }),
    prisma.event.create({
      data: {
        type: 'order.partial_delivery_revoked',
        actorId,
        orderId,
        payload: {},
      },
    }),
  ]);
  return { ok: true };
}

// Toma (claim) un pedido para que un picker empiece a empacarlo. Se llama
// cuando el picker escanea el QR del albarán impreso (o cuando entra al
// pedido desde la lista). Modelo "último escaneo gana": si el pedido ya está
// tomado por otro picker, la asignación SE REASIGNA al actor que llama.
// Quien tiene la pantalla del pedido abierto cuando otro reasigna verá el
// error al intentar cerrar (validación en POST /:id/pack).
export async function claimOrder({ orderId, actorId }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { pickedBy: { select: { wpUserId: true, displayName: true, username: true } } },
  });
  if (!order) throw new HttpError(404, 'Order not found');

  // Estados en los que el claim aplica (todavía no se cerró el packing).
  const CLAIMABLE_STATUSES = ['sequenced'];
  if (!CLAIMABLE_STATUSES.includes(order.status)) {
    throw new HttpError(409, 'Order is not in a claimable state', {
      currentStatus: order.status,
    });
  }

  // Idempotente: si ya es del mismo actor, no hace falta UPDATE.
  if (order.pickedById === actorId) {
    return { ok: true, alreadyClaimed: true, claimedAt: order.claimedAt };
  }

  const now = new Date();
  const previousPicker = order.pickedBy
    ? { wpUserId: order.pickedBy.wpUserId, displayName: order.pickedBy.displayName, username: order.pickedBy.username }
    : null;

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { pickedById: actorId, claimedAt: now },
    }),
    prisma.event.create({
      data: {
        type: previousPicker ? 'order.claim_reassigned' : 'order.claimed',
        actorId,
        orderId,
        payload: previousPicker ? { previousPickerId: previousPicker.wpUserId } : {},
      },
    }),
  ]);
  return { ok: true, claimedAt: now, reassignedFrom: previousPicker };
}

// Chequea si un pedido se puede clasificar/cargar. Devuelve detalles del
// bloqueo cuando no es loadable (la UI los muestra). Si está aprobado para
// entrega parcial, siempre devuelve loadable=true.
//
// Estados válidos para clasificar/cargar: 'packed', 'classified', 'loaded'.
// Cualquier estado previo (received, sequenced, picked) significa que el
// pedido no fue empacado (o se le borró la secuencia y volvió atrás) — no
// se puede cargar al vehículo hasta que pase por packing.
const LOAD_READY_STATUSES = ['packed', 'classified', 'loaded'];

export async function getOrderLoadability(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) throw new HttpError(404, 'Order not found');

  if (!LOAD_READY_STATUSES.includes(order.status)) {
    return {
      loadable: false,
      partialApproved: false,
      missingB2Items: [],
      reason: 'not_packed',
    };
  }

  if (order.allowPartialDelivery) {
    const missingB2 = order.items
      .filter((it) => it.warehouse === 'B2' && !it.pickedAt)
      .map((it) => ({
        productId: it.productId,
        sku: it.product?.sku || null,
        name: it.product?.name || null,
        qty: it.qty,
      }));
    return {
      loadable: true,
      partialApproved: true,
      partialDeliveryNote: order.partialDeliveryNote,
      missingB2Items: missingB2,
    };
  }

  if (!order.hasB2Pending) {
    return { loadable: true, partialApproved: false, missingB2Items: [] };
  }

  // hasB2Pending=true → revisar si TODOS los items B2 están pickeados.
  const missingB2 = order.items
    .filter((it) => it.warehouse === 'B2' && !it.pickedAt)
    .map((it) => ({
      productId: it.productId,
      sku: it.product?.sku || null,
      name: it.product?.name || null,
      qty: it.qty,
    }));

  if (missingB2.length === 0) {
    return { loadable: true, partialApproved: false, missingB2Items: [] };
  }

  return {
    loadable: false,
    partialApproved: false,
    missingB2Items: missingB2,
    reason: 'b2_incomplete',
  };
}
