import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { requireCap, WMS_CAPS } from '../middleware/capabilities.js';
import { HttpError } from '../middleware/error.js';
import { prisma } from '../db/prisma.js';
import { parseQrPayload } from '../services/qr.js';
import { getOrderLoadability } from '../services/order-actions.js';
import { maybeAutoCloseProcess } from '../services/processes.js';

const router = Router();
router.use(requireAuth);

const scanSchema = z.object({ qr: z.string().min(1) });

// Escaneo de QR en la mañana: decodifica, busca el pedido en BD local,
// devuelve ruta + posición + estado para que el operador clasifique/cargue.
//
// Bloqueo B2: si el pedido tiene items B2 sin pickear y NO está aprobado para
// entrega parcial, NO se marca como clasificado. La respuesta incluye
// `loadable: false` + `missingB2Items` para que la UI muestre el banner rojo.
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

    const loadability = await getOrderLoadability(order.id);

    // El scan ya NO clasifica automáticamente. La clasificación es ahora un
    // paso explícito vía POST /dispatch/:id/classify, separado del proceso de
    // carga al vehículo. Esto refleja la operación real: primero se agrupan
    // los pedidos por ruta (clasificación), después se cargan los camiones.
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
        customerNote: order.customerNote,
        shippingMethod: order.shippingMethod,
        hasB2Pending: order.hasB2Pending,
        loadedAt: order.loadedAt,
        classifiedAt: order.classifiedAt,
        loadable: loadability.loadable,
        partialApproved: loadability.partialApproved,
        partialDeliveryNote: order.partialDeliveryNote,
        missingB2Items: loadability.missingB2Items,
        blockReason: loadability.reason || null,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Clasificación: separación física por ruta de los pedidos empacados. El
// operador escanea el QR y confirma. Transición packed → classified. Requiere
// ruta asignada y B2 completo (o entrega parcial aprobada).
router.post('/:orderId/classify', requireCap(WMS_CAPS.LOAD), async (req, res, next) => {
  try {
    const id = Number(req.params.orderId);
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new HttpError(404, 'Order not found');
    if (order.status === 'classified' || order.status === 'loaded' || order.status === 'delivered') {
      return res.json({ ok: true, alreadyClassified: true });
    }
    if (order.status !== 'packed') {
      throw new HttpError(409, `Cannot classify order in status "${order.status}". Must be packed first.`);
    }
    if (!order.route) throw new HttpError(409, 'Order has no route assigned yet');

    const loadability = await getOrderLoadability(id);
    if (!loadability.loadable) {
      throw new HttpError(409, 'Order has B2 items missing and partial delivery is not approved', {
        missingB2Items: loadability.missingB2Items,
        blockReason: loadability.reason,
      });
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { status: 'classified', classifiedAt: new Date() },
      }),
      prisma.event.create({
        data: { type: 'dispatch.classified', actorId: req.user.wpUserId, orderId: id },
      }),
    ]);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Confirma carga al vehículo. Bloqueo B2 también aplica acá — sin entrega
// parcial aprobada y con items B2 faltantes, devuelve 409 con detalles.
router.post('/:orderId/loaded', requireCap(WMS_CAPS.LOAD), async (req, res, next) => {
  try {
    const id = Number(req.params.orderId);
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new HttpError(404, 'Order not found');
    if (!order.route) throw new HttpError(409, 'Order has no route assigned yet');
    if (order.status === 'loaded' || order.status === 'delivered') {
      return res.json({ ok: true, alreadyLoaded: true });
    }
    if (order.status !== 'classified') {
      throw new HttpError(409, `Cannot load order in status "${order.status}". Must be classified first.`);
    }

    const loadability = await getOrderLoadability(id);
    if (!loadability.loadable) {
      throw new HttpError(409, 'Order has B2 items missing and partial delivery is not approved', {
        missingB2Items: loadability.missingB2Items,
        blockReason: loadability.reason,
      });
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

    // Auto-cierre del proceso si este era el último pedido pendiente.
    // Busca el processId de la secuencia del pedido (cualquiera; debería
    // ser único porque solo hay 1 proceso abierto a la vez).
    const seqLink = await prisma.sequenceOrder.findFirst({
      where: { orderId: id },
      select: { sequence: { select: { processId: true } } },
    });
    if (seqLink?.sequence?.processId) {
      await maybeAutoCloseProcess({
        processId: seqLink.sequence.processId,
        actorId: req.user.wpUserId,
      });
    }

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
