import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireCap, WMS_CAPS } from '../middleware/capabilities.js';
import { HttpError } from '../middleware/error.js';
import { prisma } from '../db/prisma.js';
import { getPendingPackingB2 } from '../services/sequences.js';

const router = Router();
router.use(requireAuth);

// Resumen de picking B2 por secuencia: una entrada por cada secuencia con
// flujo B2 abierto que tenga al menos un pedido con B2 pendiente.
// La página /picking lo usa para listar las tarjetas pendientes.
router.get('/summary', requireCap(WMS_CAPS.PACK_B2, WMS_CAPS.SUPERVISE), async (_req, res, next) => {
  try {
    const sequences = await prisma.sequence.findMany({
      where: { b2ClosedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          include: {
            order: {
              select: {
                id: true,
                hasB2Pending: true,
                b2ClosedAt: true,
                status: true,
              },
            },
          },
        },
      },
    });

    const result = sequences
      .map((s) => {
        const ordersWithB2 = s.orders
          .map((so) => so.order)
          .filter((o) => o.hasB2Pending && !['blocked', 'delivered'].includes(o.status));
        const totalOrders = ordersWithB2.length;
        const pendingOrders = ordersWithB2.filter((o) => !o.b2ClosedAt).length;
        return {
          sequenceId: s.id,
          createdAt: s.createdAt,
          totalOrders,
          pendingOrders,
        };
      })
      .filter((s) => s.totalOrders > 0);

    res.json({ sequences: result });
  } catch (err) {
    next(err);
  }
});

// Lista de pedidos B2 pendientes en una secuencia (uno a uno, no agrupado).
router.get('/sequences/:id', requireCap(WMS_CAPS.PACK_B2, WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) throw new HttpError(400, 'Invalid sequence id');
    const orders = await getPendingPackingB2(id);
    const seq = await prisma.sequence.findUnique({
      where: { id },
      select: { id: true, createdAt: true, b2ClosedAt: true, status: true },
    });
    res.json({ sequence: seq, orders });
  } catch (err) {
    next(err);
  }
});

export default router;
