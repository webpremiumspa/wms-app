import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { requireCap, WMS_CAPS } from '../middleware/capabilities.js';
import { HttpError } from '../middleware/error.js';
import { prisma } from '../db/prisma.js';
import {
  getPickingB2Report,
  markPickedB2,
  closeSequenceB2,
  getPickingB2BatchReport,
  markPickedB2Batch,
  closeSequenceB2BatchPartial,
} from '../services/sequences.js';

// Parsea 'ids' del query string: acepta "10,11,12" → [10,11,12]. Descarta NaN
// y duplicados. Lanza 400 si queda vacío.
function parseIdsQuery(raw) {
  if (!raw) throw new HttpError(400, 'Query ?ids=... required');
  const ids = String(raw)
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
  if (ids.length === 0) throw new HttpError(400, 'No valid ids in query');
  return [...new Set(ids)];
}

const router = Router();
router.use(requireAuth);

// Resumen de picking B2 por secuencia: una entrada por cada secuencia con
// flujo B2 abierto (b2_closed_at IS NULL) que tenga al menos un item B2.
// La página /picking lo usa para listar las tarjetas pendientes.
router.get('/summary', requireCap(WMS_CAPS.PICK_B2, WMS_CAPS.SUPERVISE), async (_req, res, next) => {
  try {
    const sequences = await prisma.sequence.findMany({
      where: { b2ClosedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          include: {
            order: {
              include: { items: { where: { warehouse: 'B2' }, select: { pickedAt: true } } },
            },
          },
        },
      },
    });

    const result = sequences
      .map((s) => {
        const items = s.orders.flatMap((so) => so.order.items);
        const totalItems = items.length;
        const pendingItems = items.filter((i) => !i.pickedAt).length;
        return {
          sequenceId: s.id,
          createdAt: s.createdAt,
          ordersCount: s.orders.length,
          totalItems,
          pendingItems,
        };
      })
      .filter((s) => s.totalItems > 0);

    res.json({ sequences: result });
  } catch (err) {
    next(err);
  }
});

// Reporte detallado del picking B2 de una secuencia específica.
router.get('/sequences/:id', requireCap(WMS_CAPS.PICK_B2, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const report = await getPickingB2Report(id);
    res.json(report);
  } catch (err) {
    next(err);
  }
});

const markSchema = z.object({
  productId: z.number().int().positive(),
  picked: z.boolean(),
});

router.patch('/sequences/:id', requireCap(WMS_CAPS.PICK_B2), async (req, res, next) => {
  try {
    const parsed = markSchema.safeParse(req.body || {});
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());
    await markPickedB2({
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

router.post('/sequences/:id/close', requireCap(WMS_CAPS.PICK_B2), async (req, res, next) => {
  try {
    const seq = await closeSequenceB2({
      sequenceId: Number(req.params.id),
      actorId: req.user.wpUserId,
    });
    res.json({ sequence: seq });
  } catch (err) {
    next(err);
  }
});

// ─── Batch endpoints (picking conjunto de N secuencias) ───────────────────
// El batch es efímero: vive en el query string del operador. Backend solo
// agrega items B2 a través de las secuencias seleccionadas.

router.get('/batch', requireCap(WMS_CAPS.PICK_B2, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const ids = parseIdsQuery(req.query.ids);
    const report = await getPickingB2BatchReport(ids);
    res.json(report);
  } catch (err) {
    next(err);
  }
});

const batchMarkSchema = z.object({
  sequenceIds: z.array(z.number().int().positive()).min(1),
  productId: z.number().int().positive(),
  picked: z.boolean(),
});

router.patch('/batch', requireCap(WMS_CAPS.PICK_B2), async (req, res, next) => {
  try {
    const parsed = batchMarkSchema.safeParse(req.body || {});
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());
    await markPickedB2Batch({
      sequenceIds: parsed.data.sequenceIds,
      productId: parsed.data.productId,
      picked: parsed.data.picked,
      actorId: req.user.wpUserId,
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

const batchCloseSchema = z.object({
  sequenceIds: z.array(z.number().int().positive()).min(1),
});

router.post('/batch/close', requireCap(WMS_CAPS.PICK_B2), async (req, res, next) => {
  try {
    const parsed = batchCloseSchema.safeParse(req.body || {});
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());
    const result = await closeSequenceB2BatchPartial({
      sequenceIds: parsed.data.sequenceIds,
      actorId: req.user.wpUserId,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
