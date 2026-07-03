import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { requireCap, WMS_CAPS } from '../middleware/capabilities.js';
import { HttpError } from '../middleware/error.js';
import { prisma } from '../db/prisma.js';
import { parseQrPayload } from '../services/qr.js';
import { getOrderLoadability } from '../services/order-actions.js';
import { maybeAutoCloseProcess } from '../services/processes.js';
import { registerBagEvent, undoBagEvent } from '../services/bag-events.js';

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

// Schema de body para classify/loaded — bag opcional (multi-bulto).
const bagBodySchema = z.object({
  bag: z.number().int().min(1).max(20).optional(),
});

// Clasificación: separación física por ruta de los pedidos empacados. El
// operador escanea el QR y confirma. Transición packed → classified.
//
// Multi-bulto: si el pedido tiene bagsExpected > 1, el body debe traer
// { bag: N }. Cada scan registra ese bulto en OrderBagEvent. El pedido
// pasa a classified solo cuando se registraron los N bultos. Ver
// services/bag-events.js para la lógica exacta.
//
// Single-bulto (bagsExpected = 1): funciona como siempre — un scan
// clasifica el pedido completo.
router.post('/:orderId/classify', requireCap(WMS_CAPS.LOAD), async (req, res, next) => {
  try {
    const id = Number(req.params.orderId);
    const parsed = bagBodySchema.safeParse(req.body || {});
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new HttpError(404, 'Order not found');

    // Idempotencia: si ya está clasificado o más adelante, no hacer nada.
    if (['classified', 'loaded', 'delivered'].includes(order.status)) {
      return res.json({ ok: true, alreadyClassified: true, complete: true });
    }
    if (order.status !== 'packed') {
      throw new HttpError(409, `Cannot classify order in status "${order.status}". Must be packed first.`);
    }
    if (!order.route) throw new HttpError(409, 'Order has no route assigned yet');

    const bagsExpected = Math.max(1, order.bagsExpected ?? 1);
    const bag = parsed.data.bag ?? (bagsExpected === 1 ? 1 : null);
    if (bag == null) {
      throw new HttpError(400, `Pedido multi-bulto: especifica el bulto a clasificar (bag=1..${bagsExpected}).`, {
        multiBag: true, bagsExpected,
      });
    }

    const result = await registerBagEvent({
      orderId: id,
      bagNumber: bag,
      event: 'classified',
      actorId: req.user.wpUserId,
    });

    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
});

// Confirma carga al vehículo. Mismo modelo multi-bulto que /classify: cada
// scan registra UN bulto; el pedido pasa a loaded solo cuando los N están
// registrados. Sigue sin bloquear por B2 incompleto (v0.19.0).
router.post('/:orderId/loaded', requireCap(WMS_CAPS.LOAD), async (req, res, next) => {
  try {
    const id = Number(req.params.orderId);
    const parsed = bagBodySchema.safeParse(req.body || {});
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new HttpError(404, 'Order not found');
    if (!order.route) throw new HttpError(409, 'Order has no route assigned yet');
    if (['loaded', 'delivered'].includes(order.status)) {
      return res.json({ ok: true, alreadyLoaded: true, complete: true });
    }
    if (order.status !== 'classified') {
      throw new HttpError(409, `Cannot load order in status "${order.status}". Must be classified first.`);
    }

    const bagsExpected = Math.max(1, order.bagsExpected ?? 1);
    const bag = parsed.data.bag ?? (bagsExpected === 1 ? 1 : null);
    if (bag == null) {
      throw new HttpError(400, `Pedido multi-bulto: especifica el bulto a cargar (bag=1..${bagsExpected}).`, {
        multiBag: true, bagsExpected,
      });
    }

    const result = await registerBagEvent({
      orderId: id,
      bagNumber: bag,
      event: 'loaded',
      actorId: req.user.wpUserId,
    });

    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
});

// Deshacer un bulto registrado. Ventana 30s desde el registro, solo el mismo
// actor puede deshacerlo (protegido en el servicio). Si el pedido ya había
// transicionado a classified/loaded por completar los N, este undo también
// revierte el status. Deja evento auditable 'bag.unclassified'/'bag.unloaded'.
const undoQuerySchema = z.object({ event: z.enum(['classified', 'loaded']) });
router.post('/:orderId/bag/:bag/undo', requireCap(WMS_CAPS.LOAD), async (req, res, next) => {
  try {
    const id = Number(req.params.orderId);
    const bag = Number(req.params.bag);
    const parsed = undoQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new HttpError(400, 'Missing or invalid ?event=classified|loaded');

    const result = await undoBagEvent({
      orderId: id,
      bagNumber: bag,
      event: parsed.data.event,
      actorId: req.user.wpUserId,
    });
    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
});

// Resumen del día por ruta: cuántos pedidos esperados, clasificados, cargados.
// Multi-bulto: además del conteo por pedido, agregamos sub-conteos por bulto
// (bagsTotal, bagsClassified, bagsLoaded) para que la UI del scan pueda
// mostrar "1/3 bultos" cuando el pedido ya avanzó pero aún no se completó.
router.get('/today', requireCap(WMS_CAPS.LOAD, WMS_CAPS.SUPERVISE), async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['packed', 'classified', 'loaded'] },
        route: { not: null },
      },
      select: {
        id: true,
        number: true,
        route: true,
        stopPosition: true,
        status: true,
        hasB2Pending: true,
        bagsExpected: true,
      },
      orderBy: [{ route: 'asc' }, { stopPosition: 'asc' }],
    });

    // Conteo agregado de bultos ya registrados por (orderId, event). Un solo
    // groupBy evita el N+1 sobre order_bag_events.
    const orderIds = orders.map((o) => o.id);
    let bagCounts = new Map(); // key: `${orderId}:${event}`, value: count
    if (orderIds.length > 0) {
      const grouped = await prisma.orderBagEvent.groupBy({
        by: ['orderId', 'event'],
        where: { orderId: { in: orderIds } },
        _count: { _all: true },
      });
      for (const g of grouped) {
        bagCounts.set(`${g.orderId}:${g.event}`, g._count._all);
      }
    }

    const byRoute = new Map();
    for (const o of orders) {
      const r = byRoute.get(o.route) || {
        route: o.route,
        total: 0,
        classified: 0,
        loaded: 0,
        b2Count: 0,
        // Sub-conteos por bulto — suman todos los bultos de la ruta.
        bagsTotal: 0,
        bagsClassified: 0,
        bagsLoaded: 0,
        orders: [],
      };
      const bagsExpected = Math.max(1, o.bagsExpected ?? 1);
      const clsCount = Math.min(bagsExpected, bagCounts.get(`${o.id}:classified`) || 0);
      const ldCount = Math.min(bagsExpected, bagCounts.get(`${o.id}:loaded`) || 0);

      r.total += 1;
      if (o.status === 'classified' || o.status === 'loaded') r.classified += 1;
      if (o.status === 'loaded') r.loaded += 1;
      if (o.hasB2Pending) r.b2Count += 1;
      r.bagsTotal += bagsExpected;
      // Si el pedido ya está classified/loaded, contamos como bagsExpected
      // completos (los bultos se registran al llegar al último, pero
      // pedidos ya completos podrían no tener eventos por bulto si el
      // pedido es single-bulto — en ese caso asumimos completos).
      r.bagsClassified += o.status === 'classified' || o.status === 'loaded'
        ? bagsExpected
        : clsCount;
      r.bagsLoaded += o.status === 'loaded' ? bagsExpected : ldCount;
      r.orders.push(o);
      byRoute.set(o.route, r);
    }

    res.json({ routes: Array.from(byRoute.values()).sort((a, b) => a.route.localeCompare(b.route)) });
  } catch (err) {
    next(err);
  }
});

export default router;
