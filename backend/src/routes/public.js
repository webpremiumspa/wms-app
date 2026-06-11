import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { HttpError } from '../middleware/error.js';

const router = Router();

// Endpoints públicos (sin auth). Pensados para el scan del QR del albarán
// desde la cámara del móvil, sin obligar al repartidor a loguearse cada vez.
// Solo retornan datos necesarios para la entrega; las acciones de modificación
// (mark loaded, etc.) siguen requiriendo auth.
router.get('/orders/:wpOrderId', async (req, res, next) => {
  try {
    const wpOrderId = Number(req.params.wpOrderId);
    if (!wpOrderId) throw new HttpError(400, 'Invalid wpOrderId');
    const order = await prisma.order.findUnique({
      where: { wpOrderId },
      include: {
        items: { include: { product: true } },
        sequenceLinks: { include: { sequence: { select: { id: true, status: true } } } },
      },
    });
    if (!order) throw new HttpError(404, `Pedido ${wpOrderId} no encontrado`);

    // Indica si el pedido es "empacable" (está en una secuencia abierta y en
    // estado sequenced). El frontend usa esto para mostrar el botón "Empacar
    // este pedido" después de escanear el QR del albarán.
    const openSequenceId = order.sequenceLinks
      .map((l) => l.sequence)
      .find((s) => s.status === 'open')?.id || null;
    const packable = order.status === 'sequenced' && openSequenceId != null;
    // Indica si el pedido necesita picking B2 (tiene items B2, no está cerrado
    // B2 todavía, y está en un estado activo). El picker B2 escanea el QR y
    // entra a esta vista.
    const b2Pickable = order.hasB2Pending
      && order.b2ClosedAt == null
      && openSequenceId != null
      && !['blocked', 'delivered'].includes(order.status);

    res.json({
      order: {
        id: order.id,
        wpOrderId: order.wpOrderId,
        number: order.number,
        status: order.status,
        route: order.route,
        stopPosition: order.stopPosition,
        customerName: order.customerName,
        customerAddress: order.customerAddress,
        hasB2Pending: order.hasB2Pending,
        allowPartialDelivery: order.allowPartialDelivery,
        partialDeliveryNote: order.partialDeliveryNote,
        packable,
        b2Pickable,
        openSequenceId,
        items: order.items.map((it) => ({
          id: it.id,
          qty: it.qty,
          warehouse: it.warehouse,
          product: {
            sku: it.product?.sku,
            name: it.product?.name,
            thumbnailUrl: it.product?.thumbnailUrl,
          },
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
