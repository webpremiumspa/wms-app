import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { requireCap, WMS_CAPS } from '../middleware/capabilities.js';
import { HttpError } from '../middleware/error.js';
import { prisma } from '../db/prisma.js';
import { parseQrPayload } from '../services/qr.js';

const router = Router();
router.use(requireAuth);

const scanSchema = z.object({ qr: z.string().min(1) });

// Escaneo en destino: solo lectura (la entrega la registra el sistema externo
// como dice el PDF). Devuelve contenido + flag de B2 para que el frontend
// emita la alerta activa de productos a sacar del granel.
router.post('/scan', requireCap(WMS_CAPS.DELIVER, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const parsed = scanSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());

    const wpOrderId = parseQrPayload(parsed.data.qr);
    const order = await prisma.order.findUnique({
      where: { wpOrderId },
      include: {
        items: { include: { product: true } },
      },
    });
    if (!order) throw new HttpError(404, `Pedido ${wpOrderId} no encontrado en el WMS`);

    const b1Items = order.items.filter((i) => i.warehouse === 'B1');
    const b2Items = order.items.filter((i) => i.warehouse === 'B2');

    await prisma.event.create({
      data: { type: 'delivery.scanned', actorId: req.user.wpUserId, orderId: order.id },
    });

    res.json({
      order: {
        id: order.id,
        wpOrderId: order.wpOrderId,
        number: order.number,
        route: order.route,
        stopPosition: order.stopPosition,
        customerName: order.customerName,
        customerAddress: order.customerAddress,
        hasB2Pending: order.hasB2Pending,
        b1Items: b1Items.map((i) => ({
          id: i.id,
          qty: i.qty,
          sku: i.product?.sku,
          name: i.product?.name,
          thumbnailUrl: i.product?.thumbnailUrl,
        })),
        b2Items: b2Items.map((i) => ({
          id: i.id,
          qty: i.qty,
          sku: i.product?.sku,
          name: i.product?.name,
          thumbnailUrl: i.product?.thumbnailUrl,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
