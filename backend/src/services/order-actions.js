import { prisma } from '../db/prisma.js';
import { HttpError } from '../middleware/error.js';

// Estados en los que YA es tarde para sacar un pedido de la secuencia:
// está clasificado, cargado o entregado — la bolsa ya salió del depósito.
const TOO_LATE_TO_REMOVE = ['classified', 'loaded', 'delivered'];

// Motivos válidos para remover un pedido. Sirven para auditoría (van al log
// de eventos) y para que el supervisor agrupe casos en el dashboard.
export const REMOVE_REASONS = Object.freeze([
  'sin_stock_b1',
  'sin_stock_b2',
  'producto_danado',
  'cliente_cancelo',
  'otro',
]);

// Saca un pedido de su secuencia: revierte items, marca como `blocked`, log
// con motivo. Decrementa expectedBags para que el cierre B1 cuadre.
//
// El pedido queda en estado `blocked` (no `received`) para distinguirlo de
// los pedidos "limpios" pendientes — el supervisor decide cuándo
// reactivarlo (cuando llegue stock, etc.).
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
    include: { order: true, sequence: true },
  });
  if (!link) throw new HttpError(404, 'Order is not in this sequence');

  if (TOO_LATE_TO_REMOVE.includes(link.order.status)) {
    throw new HttpError(409, 'Order is already classified or loaded — cannot remove from sequence', {
      currentStatus: link.order.status,
    });
  }

  await prisma.$transaction([
    prisma.orderItem.updateMany({
      where: { orderId },
      data: { pickedAt: null, packedAt: null },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'blocked',
        packedAt: null,
        packedById: null,
        pickedById: null,
        claimedAt: null,
        classifiedAt: null,
        loadedAt: null,
        allowPartialDelivery: false,
        partialDeliveryNote: null,
      },
    }),
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
        payload: { sequenceId, reasonCode, reasonText: reasonText || null },
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
export async function getOrderLoadability(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) throw new HttpError(404, 'Order not found');

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
