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
  closeSequence,
} from '../services/sequences.js';

const router = Router();
router.use(requireAuth);

router.get('/', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.PICK_B1, WMS_CAPS.PICK_B2, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const sequences = await prisma.sequence.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { _count: { select: { orders: true } } },
    });
    res.json({ sequences });
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
        orders: { include: { order: true } },
        createdBy: { select: { displayName: true, username: true } },
      },
    });
    if (!sequence) throw new HttpError(404, 'Sequence not found');
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
  warehouse: z.enum(['B1', 'B2']),
  orderIds: z.array(z.number().int().positive()).min(1),
  mode: z.enum(['by_sku', 'by_order']).optional(),
});

router.post('/', requireCap(WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());
    const seq = await createSequence({
      warehouse: parsed.data.warehouse,
      orderIds: parsed.data.orderIds,
      mode: parsed.data.mode || 'by_sku',
      createdById: req.user.wpUserId,
    });
    res.status(201).json({ sequence: seq });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/picking-report', requireCap(WMS_CAPS.PICK_B1, WMS_CAPS.PICK_B2, WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
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

router.patch('/:id/picking', requireCap(WMS_CAPS.PICK_B1, WMS_CAPS.PICK_B2), async (req, res, next) => {
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

router.post('/:id/close', requireCap(WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const parsed = closeSchema.safeParse(req.body ?? {});
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());
    const seq = await closeSequence({
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
