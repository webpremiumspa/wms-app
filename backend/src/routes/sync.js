import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { requireCap, WMS_CAPS } from '../middleware/capabilities.js';
import { HttpError } from '../middleware/error.js';
import { wcListOrders } from '../services/woocommerce.js';
import { syncOrder } from '../services/orders-sync.js';

const router = Router();
router.use(requireAuth);

const syncSchema = z.object({
  after: z.string().optional(), // ISO 8601 o YYYY-MM-DD
  before: z.string().optional(),
  statuses: z.array(z.string()).optional(),
});

// Normaliza fecha a ISO 8601 que WC acepta.
// 'YYYY-MM-DD' → 'YYYY-MM-DDT00:00:00' (con flag endOfDay para before).
function normalizeDate(value, endOfDay = false) {
  if (!value) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return endOfDay ? `${value}T23:59:59` : `${value}T00:00:00`;
  }
  return value;
}

router.post('/orders', requireCap(WMS_CAPS.SUPERVISE, WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const parsed = syncSchema.safeParse(req.body || {});
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());

    const after = normalizeDate(parsed.data.after) ||
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const before = normalizeDate(parsed.data.before, true);
    const statuses = parsed.data.statuses?.length
      ? parsed.data.statuses
      : ['processing', 'on-hold', 'completed'];

    // Paginación: WC permite hasta 100 por página. Tope de seguridad: 10 páginas (1000 pedidos).
    const wcOrders = [];
    let page = 1;
    const maxPages = 10;
    while (page <= maxPages) {
      const batch = await wcListOrders({
        after,
        ...(before ? { before } : {}),
        status: statuses.join(','),
        per_page: 100,
        page,
        orderby: 'date',
        order: 'desc',
      });
      wcOrders.push(...batch);
      if (batch.length < 100) break;
      page += 1;
    }

    let synced = 0;
    let failed = 0;
    const errors = [];
    const orders = [];

    // Procesar en lotes paralelos para acelerar (cada syncOrder hace pre-sync
    // de productos fuera de su tx, así que pueden correr concurrentemente sin
    // pelearse por la conexión).
    const CONCURRENCY = 4;
    for (let i = 0; i < wcOrders.length; i += CONCURRENCY) {
      const batch = wcOrders.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(batch.map((wco) => syncOrder(wco.id, wco)));
      results.forEach((r, idx) => {
        const wco = batch[idx];
        if (r.status === 'fulfilled') {
          orders.push({ wpOrderId: r.value.wpOrderId, number: r.value.number, status: r.value.status });
          synced += 1;
        } else {
          failed += 1;
          errors.push({ wpOrderId: wco.id, message: r.reason?.message || 'sync error' });
        }
      });
    }

    res.json({
      total: wcOrders.length,
      synced,
      failed,
      errors,
      orders,
      range: { after, before: before || null },
      statuses,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
