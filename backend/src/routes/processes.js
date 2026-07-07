import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { requireCap, WMS_CAPS } from '../middleware/capabilities.js';
import { HttpError } from '../middleware/error.js';
import { prisma } from '../db/prisma.js';
import {
  createProcess,
  closeProcess,
  getActiveProcess,
  listOpenProcesses,
  listProcesses,
} from '../services/processes.js';

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  name: z.string().min(1).max(200),
  scheduledAt: z.string().optional(), // ISO 8601
});

// Lista todos los procesos (default: últimos 50). Disponible para cualquier
// rol operativo — el calendario y la lista lateral lo usan.
router.get('/', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.PACK_B2, WMS_CAPS.LOAD, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 500);
    const processes = await listProcesses({ limit });
    res.json({ processes });
  } catch (err) {
    next(err);
  }
});

// Proceso activo más antiguo (legacy: cuando había max 1 abierto). Se usa
// para mostrar el contexto principal. Para listar TODOS los abiertos en
// paralelo, usar /processes/open.
router.get('/active', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.PACK_B2, WMS_CAPS.LOAD, WMS_CAPS.SUPERVISE), async (_req, res, next) => {
  try {
    const process = await getActiveProcess();
    res.json({ process });
  } catch (err) {
    next(err);
  }
});

// Lista de procesos abiertos (sin tope). El frontend la usa en Inicio para
// mostrar una card por cada uno.
router.get('/open', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.PACK_B2, WMS_CAPS.LOAD, WMS_CAPS.SUPERVISE), async (_req, res, next) => {
  try {
    const processes = await listOpenProcesses();
    res.json({ processes });
  } catch (err) {
    next(err);
  }
});

// Detalle de un proceso: incluye secuencias con su progreso y los pedidos
// agregados por status (para kanban).
router.get('/:id', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.PACK_B2, WMS_CAPS.LOAD, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) throw new HttpError(400, 'Invalid process id');
    const process = await prisma.deliveryProcess.findUnique({
      where: { id },
      include: {
        createdBy: { select: { wpUserId: true, displayName: true, username: true } },
        sequences: {
          orderBy: { createdAt: 'asc' },
          include: {
            _count: { select: { orders: true } },
            orders: {
              include: {
                order: {
                  select: {
                    id: true,
                    wpOrderId: true,
                    number: true,
                    status: true,
                    route: true,
                    stopPosition: true,
                    // driverName: nombre del repartidor asignado a la ruta
                    // (sincronizado desde WC via _wdg_driver_name). Se usa
                    // para el filtro rápido "R1 - Juan / R2 - Pedro / ...".
                    driverName: true,
                    customerName: true,
                    shippingMethod: true,
                    hasB2Pending: true,
                    // packedAt + b2ClosedAt: necesarios para que el kanban
                    // detecte "Parcial" (un lado cerrado, el otro no) y
                    // pinte los pills B1/B2 en cada card.
                    packedAt: true,
                    b2ClosedAt: true,
                    // Multi-bulto: bagsExpected para saber cuántos hay en
                    // total y computar el progreso más abajo.
                    bagsExpected: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!process) throw new HttpError(404, 'Process not found');

    // Estructura plana de pedidos del proceso para kanban.
    const orders = process.sequences.flatMap((s) =>
      s.orders.map((so) => ({ ...so.order, sequenceId: s.id })),
    );

    // Multi-bulto: progreso de clasificación/carga por pedido. Un solo
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
    for (const o of orders) {
      o.bagsClassifiedCount = bagCounts.get(`${o.id}:classified`) || 0;
      o.bagsLoadedCount = bagCounts.get(`${o.id}:loaded`) || 0;
    }

    // KPI agregado por status.
    const byStatus = {
      received: 0,
      sequenced: 0,
      picked: 0,
      packed: 0,
      classified: 0,
      loaded: 0,
      delivered: 0,
      blocked: 0,
    };
    for (const o of orders) byStatus[o.status] = (byStatus[o.status] || 0) + 1;

    res.json({
      process: {
        ...process,
        sequences: process.sequences.map((s) => ({
          id: s.id,
          createdAt: s.createdAt,
          status: s.status,
          b1ClosedAt: s.b1ClosedAt,
          b2ClosedAt: s.b2ClosedAt,
          closedAt: s.closedAt,
          expectedBags: s.expectedBags,
          actualBags: s.actualBags,
          orderCount: s._count.orders,
        })),
      },
      orders,
      byStatus,
      totals: { orders: orders.length, sequences: process.sequences.length },
    });
  } catch (err) {
    next(err);
  }
});

// Crear nuevo proceso. Solo PACK_B1 o SUPERVISE.
router.post('/', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body || {});
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());
    const process = await createProcess({
      name: parsed.data.name,
      scheduledAt: parsed.data.scheduledAt,
      actorId: req.user.wpUserId,
    });
    res.json({ process });
  } catch (err) {
    next(err);
  }
});

// Cerrar proceso manualmente (override). Solo SUPERVISE.
router.post('/:id/close', requireCap(WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) throw new HttpError(400, 'Invalid process id');
    const result = await closeProcess({ processId: id, actorId: req.user.wpUserId });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
