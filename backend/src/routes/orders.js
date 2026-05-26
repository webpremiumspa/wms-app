import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { requireCap, WMS_CAPS } from '../middleware/capabilities.js';
import { HttpError } from '../middleware/error.js';
import { prisma } from '../db/prisma.js';
import { renderAlbaranPdf } from '../services/pdf.js';

const router = Router();
router.use(requireAuth);

// Borra todos los pedidos pendientes (status='received', sin haber entrado a
// secuencia). Útil cuando se importan con metadata vieja y conviene volver a
// sincronizar desde cero.
router.delete('/pending', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (_req, res, next) => {
  try {
    const result = await prisma.order.deleteMany({ where: { status: 'received' } });
    res.json({ deleted: result.count });
  } catch (err) {
    next(err);
  }
});

router.get('/pending', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const orders = await prisma.order.findMany({
      where: { status: 'received' },
      take: limit,
      orderBy: { createdAt: 'asc' },
      include: { items: true },
    });
    res.json({
      orders: orders.map((o) => ({
        id: o.id,
        wpOrderId: o.wpOrderId,
        number: o.number,
        customerName: o.customerName,
        route: o.route,
        hasB2Pending: o.hasB2Pending,
        itemCount: o.items.length,
        createdAt: o.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.PICK_B1, WMS_CAPS.SUPERVISE, WMS_CAPS.DELIVER, WMS_CAPS.LOAD), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        packedBy: { select: { displayName: true, username: true } },
      },
    });
    if (!order) throw new HttpError(404, 'Order not found');
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

const packSchema = z.object({
  itemIds: z.array(z.number().int().positive()).min(1),
});

// Packing: el operador confirma los items B1 introducidos en la bolsa.
// El sistema bloquea si quedan items B1 sin marcar (optimización #8).
router.post('/:id/pack', requireCap(WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const parsed = packSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new HttpError(404, 'Order not found');
    if (order.status === 'packed') throw new HttpError(409, 'Order already packed');

    const b1Items = order.items.filter((i) => i.warehouse === 'B1');
    const required = new Set(b1Items.map((i) => i.id));
    const confirmed = new Set(parsed.data.itemIds);
    const missing = [...required].filter((x) => !confirmed.has(x));
    if (missing.length > 0) {
      throw new HttpError(409, 'All B1 items must be checked before packing', { missingItemIds: missing });
    }

    const now = new Date();
    // Soporta modo 'by_order': si los items aún no tenían pickedAt (porque no
    // hubo paso previo de picking), lo seteamos ahora junto al packedAt.
    // Idempotente: no pisa pickedAt si ya estaba.
    await prisma.$transaction([
      prisma.orderItem.updateMany({
        where: { id: { in: [...confirmed] }, orderId: id, pickedAt: null },
        data: { pickedAt: now },
      }),
      prisma.orderItem.updateMany({
        where: { id: { in: [...confirmed] }, orderId: id },
        data: { packedAt: now },
      }),
      prisma.order.update({
        where: { id },
        data: {
          status: 'packed',
          packedAt: now,
          packedById: req.user.wpUserId,
        },
      }),
      prisma.event.create({
        data: {
          type: 'order.packed',
          actorId: req.user.wpUserId,
          orderId: id,
          payload: { itemIds: [...confirmed] },
        },
      }),
    ]);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Genera el albarán imprimible (PDF A4) con QR y, si corresponde,
// marca grande de "Bodega 2 pendiente" + listado de items B2.
router.get('/:id/albaran.pdf', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new HttpError(404, 'Order not found');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="albaran-${order.number}.pdf"`);
    await renderAlbaranPdf(order, res);
  } catch (err) {
    next(err);
  }
});

export default router;
