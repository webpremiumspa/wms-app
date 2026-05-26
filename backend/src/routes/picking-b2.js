import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { requireCap, WMS_CAPS } from '../middleware/capabilities.js';
import { HttpError } from '../middleware/error.js';
import { prisma } from '../db/prisma.js';

const router = Router();
router.use(requireAuth);

// Reporte auto-generado: todos los items B2 pendientes de pickear de pedidos
// que ya están en el ciclo (no descartados/cancelados). Agrupa por productId.
router.get('/today', requireCap(WMS_CAPS.PICK_B2, WMS_CAPS.SUPERVISE), async (_req, res, next) => {
  try {
    const items = await prisma.orderItem.findMany({
      where: {
        warehouse: 'B2',
        order: { status: { in: ['received', 'sequenced', 'picked', 'packed', 'classified', 'loaded'] } },
      },
      include: { product: true, order: { select: { number: true } } },
    });

    const groups = new Map();
    for (const it of items) {
      const g = groups.get(it.productId) || {
        productId: it.productId,
        sku: it.product?.sku,
        name: it.product?.name,
        thumbnailUrl: it.product?.thumbnailUrl,
        qty: 0,
        totalCount: 0,
        pickedCount: 0,
        ordersNumbers: [],
      };
      g.qty += it.qty;
      g.totalCount += 1;
      if (it.pickedAt) g.pickedCount += 1;
      g.ordersNumbers.push(it.order.number);
      groups.set(it.productId, g);
    }

    const rows = Array.from(groups.values()).map((g) => ({
      productId: g.productId,
      sku: g.sku,
      name: g.name,
      thumbnailUrl: g.thumbnailUrl,
      qty: g.qty,
      picked: g.pickedCount === g.totalCount && g.totalCount > 0,
      ordersCount: g.totalCount,
    }));

    rows.sort((a, b) => a.name.localeCompare(b.name));
    const allPicked = rows.length > 0 && rows.every((r) => r.picked);

    res.json({ items: rows, allPicked, totalSkus: rows.length });
  } catch (err) {
    next(err);
  }
});

const markSchema = z.object({
  productId: z.number().int().positive(),
  picked: z.boolean(),
});

router.patch('/today/:productId', requireCap(WMS_CAPS.PICK_B2), async (req, res, next) => {
  try {
    const parsed = markSchema.safeParse({
      productId: Number(req.params.productId),
      picked: req.body?.picked,
    });
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());

    const at = parsed.data.picked ? new Date() : null;
    await prisma.orderItem.updateMany({
      where: {
        productId: parsed.data.productId,
        warehouse: 'B2',
        order: { status: { in: ['received', 'sequenced', 'picked', 'packed', 'classified', 'loaded'] } },
      },
      data: { pickedAt: at },
    });

    await prisma.event.create({
      data: {
        type: parsed.data.picked ? 'picking_b2.item_picked' : 'picking_b2.item_unpicked',
        actorId: req.user.wpUserId,
        payload: { productId: parsed.data.productId },
      },
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
