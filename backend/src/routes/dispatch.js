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

// Escaneo de QR en la mañana: decodifica, busca el pedido en BD local,
// devuelve ruta + posición + estado para que el operador clasifique/cargue.
router.post('/scan', requireCap(WMS_CAPS.LOAD, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const parsed = scanSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());

    const wpOrderId = parseQrPayload(parsed.data.qr);
    const order = await prisma.order.findUnique({
      where: { wpOrderId },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new HttpError(404, `Pedido ${wpOrderId} no encontrado en el WMS`);

    // Marca implícita de "clasificado" al escanear por primera vez en el ciclo
    // de carga. Si ya estaba clasificado o más adelante, no retrocede.
    if (order.status === 'packed') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'classified', classifiedAt: new Date() },
      });
      await prisma.event.create({
        data: { type: 'dispatch.classified', actorId: req.user.wpUserId, orderId: order.id },
      });
    }

    res.json({
      order: {
        id: order.id,
        wpOrderId: order.wpOrderId,
        number: order.number,
        status: order.status === 'packed' ? 'classified' : order.status,
        route: order.route,
        stopPosition: order.stopPosition,
        customerName: order.customerName,
        customerAddress: order.customerAddress,
        hasB2Pending: order.hasB2Pending,
        loadedAt: order.loadedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Confirma carga al vehículo (distinto a "clasificada" — la bolsa ya está
// físicamente arriba del camión). Optimización #10 del PDF.
router.post('/:orderId/loaded', requireCap(WMS_CAPS.LOAD), async (req, res, next) => {
  try {
    const id = Number(req.params.orderId);
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new HttpError(404, 'Order not found');
    if (!order.route) throw new HttpError(409, 'Order has no route assigned yet');
    if (order.status === 'loaded' || order.status === 'delivered') {
      return res.json({ ok: true, alreadyLoaded: true });
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { status: 'loaded', loadedAt: new Date() },
      }),
      prisma.event.create({
        data: { type: 'dispatch.loaded', actorId: req.user.wpUserId, orderId: id },
      }),
    ]);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Resumen del día por ruta: cuántos pedidos esperados, clasificados, cargados.
router.get('/today', requireCap(WMS_CAPS.LOAD, WMS_CAPS.SUPERVISE), async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['packed', 'classified', 'loaded'] },
        route: { not: null },
      },
      select: { id: true, number: true, route: true, stopPosition: true, status: true, hasB2Pending: true },
      orderBy: [{ route: 'asc' }, { stopPosition: 'asc' }],
    });

    const byRoute = new Map();
    for (const o of orders) {
      const r = byRoute.get(o.route) || {
        route: o.route,
        total: 0,
        classified: 0,
        loaded: 0,
        b2Count: 0,
        orders: [],
      };
      r.total += 1;
      if (o.status === 'classified' || o.status === 'loaded') r.classified += 1;
      if (o.status === 'loaded') r.loaded += 1;
      if (o.hasB2Pending) r.b2Count += 1;
      r.orders.push(o);
      byRoute.set(o.route, r);
    }

    res.json({ routes: Array.from(byRoute.values()).sort((a, b) => a.route.localeCompare(b.route)) });
  } catch (err) {
    next(err);
  }
});

export default router;
