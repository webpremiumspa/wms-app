import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { requireCap, WMS_CAPS } from '../middleware/capabilities.js';
import { HttpError } from '../middleware/error.js';
import { prisma } from '../db/prisma.js';
import {
  createSequence,
  validateStock,
  getPickingReport,
  markPicked,
  getPendingPacking,
  closeSequenceB1,
} from '../services/sequences.js';

const router = Router();
router.use(requireAuth);

router.get('/', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.PICK_B1, WMS_CAPS.PICK_B2, WMS_CAPS.SUPERVISE), async (_req, res, next) => {
  try {
    const sequences = await prisma.sequence.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        _count: { select: { orders: true } },
        orders: {
          include: {
            order: {
              include: { items: { select: { warehouse: true, pickedAt: true } } },
            },
          },
        },
      },
    });
    // Calculamos progreso B1 y B2 (totales y pendientes) para alimentar la UI.
    const out = sequences.map((s) => {
      const items = s.orders.flatMap((so) => so.order.items);
      const b1 = items.filter((i) => i.warehouse === 'B1');
      const b2 = items.filter((i) => i.warehouse === 'B2');
      return {
        id: s.id,
        mode: s.mode,
        status: s.status,
        expectedBags: s.expectedBags,
        actualBags: s.actualBags,
        createdAt: s.createdAt,
        closedAt: s.closedAt,
        b1ClosedAt: s.b1ClosedAt,
        b2ClosedAt: s.b2ClosedAt,
        _count: s._count,
        b1: { total: b1.length, pending: b1.filter((i) => !i.pickedAt).length },
        b2: { total: b2.length, pending: b2.filter((i) => !i.pickedAt).length },
      };
    });
    res.json({ sequences: out });
  } catch (err) {
    next(err);
  }
});

// Eliminar una secuencia. Permite hacerlo siempre que la secuencia esté abierta,
// incluso si algunos pedidos ya pasaron de 'sequenced'. Revierte TODO ese
// progreso (status, timestamps, packer) para que los pedidos vuelvan a estar
// disponibles. Pedidos en 'delivered' se conservan (ya están finalizados por
// el sistema externo).
router.delete('/:id', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const seq = await prisma.sequence.findUnique({
      where: { id },
      include: { orders: { include: { order: true } } },
    });
    if (!seq) throw new HttpError(404, 'Sequence not found');

    const orderIds = seq.orders
      .filter((so) => so.order.status !== 'delivered')
      .map((so) => so.orderId);
    const skippedDelivered = seq.orders.filter((so) => so.order.status === 'delivered').length;

    await prisma.$transaction([
      // Revertir items: limpiar pickedAt y packedAt para los pedidos a resetear
      prisma.orderItem.updateMany({
        where: { orderId: { in: orderIds } },
        data: { pickedAt: null, packedAt: null },
      }),
      // Revertir pedidos al estado 'received' y limpiar timestamps WMS
      prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: {
          status: 'received',
          packedAt: null,
          packedById: null,
          classifiedAt: null,
          loadedAt: null,
        },
      }),
      // Borrar la secuencia (cascadea SequenceOrder)
      prisma.sequence.delete({ where: { id } }),
      prisma.event.create({
        data: {
          type: 'sequence.deleted',
          actorId: req.user.wpUserId,
          payload: {
            sequenceId: id,
            ordersReverted: orderIds.length,
            skippedDelivered,
          },
        },
      }),
    ]);

    res.json({ ok: true, ordersReverted: orderIds.length, skippedDelivered });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.PICK_B1, WMS_CAPS.PICK_B2, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const sequence = await prisma.sequence.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            order: {
              include: { items: { select: { warehouse: true, pickedAt: true } } },
            },
          },
        },
        createdBy: { select: { displayName: true, username: true } },
      },
    });
    if (!sequence) throw new HttpError(404, 'Sequence not found');

    // Agregar contadores B1/B2 al payload para que la UI muestre estado de cada flujo.
    const allItems = sequence.orders.flatMap((so) => so.order.items);
    const b1 = allItems.filter((i) => i.warehouse === 'B1');
    const b2 = allItems.filter((i) => i.warehouse === 'B2');
    sequence.b1 = { total: b1.length, pending: b1.filter((i) => !i.pickedAt).length };
    sequence.b2 = { total: b2.length, pending: b2.filter((i) => !i.pickedAt).length };

    // Limpiamos los items inflados para no enviar payload gigante (la UI
    // detalle pide items por pedido aparte).
    sequence.orders = sequence.orders.map((so) => ({
      orderId: so.orderId,
      order: { ...so.order, items: undefined },
    }));

    res.json({ sequence });
  } catch (err) {
    next(err);
  }
});

const validateSchema = z.object({
  orderIds: z.array(z.number().int().positive()).min(1),
});

router.post('/validate-stock', requireCap(WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const parsed = validateSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());
    const problems = await validateStock(parsed.data.orderIds);
    res.json({ problems });
  } catch (err) {
    next(err);
  }
});

const createSchema = z.object({
  orderIds: z.array(z.number().int().positive()).min(1),
  mode: z.enum(['by_sku', 'by_order']).optional(),
});

router.post('/', requireCap(WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());
    const seq = await createSequence({
      orderIds: parsed.data.orderIds,
      mode: parsed.data.mode || 'by_order',
      createdById: req.user.wpUserId,
    });
    res.status(201).json({ sequence: seq });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/picking-report', requireCap(WMS_CAPS.PICK_B1, WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const report = await getPickingReport(Number(req.params.id));
    res.json(report);
  } catch (err) {
    next(err);
  }
});

const pickSchema = z.object({
  productId: z.number().int().positive(),
  picked: z.boolean(),
});

router.patch('/:id/picking', requireCap(WMS_CAPS.PICK_B1), async (req, res, next) => {
  try {
    const parsed = pickSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());
    await markPicked({
      sequenceId: Number(req.params.id),
      productId: parsed.data.productId,
      picked: parsed.data.picked,
      actorId: req.user.wpUserId,
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/pending-packing', requireCap(WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const orders = await getPendingPacking(Number(req.params.id));
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

const closeSchema = z.object({
  actualBags: z.number().int().nonnegative().optional(),
});

// Cierre del flujo B1 (packing terminado). El cierre B2 va por /picking/b2/sequences/:id/close.
router.post('/:id/close-b1', requireCap(WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const parsed = closeSchema.safeParse(req.body ?? {});
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());
    const seq = await closeSequenceB1({
      sequenceId: Number(req.params.id),
      actorId: req.user.wpUserId,
      actualBags: parsed.data.actualBags,
    });
    res.json({ sequence: seq });
  } catch (err) {
    next(err);
  }
});

export default router;
