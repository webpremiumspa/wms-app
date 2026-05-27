import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { requireCap, WMS_CAPS } from '../middleware/capabilities.js';
import { HttpError } from '../middleware/error.js';
import { prisma } from '../db/prisma.js';
import { wcListOrders } from '../services/woocommerce.js';
import { syncOrder, ensureProducts } from '../services/orders-sync.js';

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

    // Pre-fetch UNA vez todos los productos referenciados por todos los pedidos
    // (1 call HTTP a WC con ?include=ids... en lugar de N calls).
    const allProductIds = [];
    for (const wco of wcOrders) {
      for (const li of wco.line_items || []) {
        if (li.product_id > 0) allProductIds.push(li.product_id);
      }
    }
    await ensureProducts(allProductIds);

    // Detectar cuáles WC orders ya existían en WMS antes del sync para
    // diferenciar "nuevos" de "actualizados" en la respuesta.
    const existingWpIds = new Set(
      (
        await prisma.order.findMany({
          where: { wpOrderId: { in: wcOrders.map((o) => o.id) } },
          select: { wpOrderId: true },
        })
      ).map((o) => o.wpOrderId),
    );

    let created = 0;
    let updated = 0;
    let failed = 0;
    const errors = [];
    const orders = [];

    for (const wco of wcOrders) {
      try {
        const wasExisting = existingWpIds.has(wco.id);
        const order = await syncOrder(wco.id, wco);
        orders.push({
          wpOrderId: order.wpOrderId,
          number: order.number,
          status: order.status,
          isNew: !wasExisting,
        });
        if (wasExisting) updated += 1;
        else created += 1;
      } catch (err) {
        failed += 1;
        errors.push({ wpOrderId: wco.id, message: err.message });
      }
    }

    const synced = created + updated;

    // Para los pedidos que ya existían y NO están en estado 'received' (es
    // decir, están enganchados a una secuencia), agrupamos por secuencia para
    // que el usuario sepa dónde encontrarlos.
    const wpIdsNotReceived = orders
      .filter((o) => !o.isNew && o.status !== 'received')
      .map((o) => o.wpOrderId);

    const takenBySequences = [];
    if (wpIdsNotReceived.length > 0) {
      const taken = await prisma.order.findMany({
        where: { wpOrderId: { in: wpIdsNotReceived } },
        select: {
          wpOrderId: true,
          number: true,
          sequenceLinks: {
            include: { sequence: { select: { id: true, status: true } } },
          },
        },
      });
      const bySeq = new Map();
      for (const o of taken) {
        for (const link of o.sequenceLinks) {
          const s = link.sequence;
          if (!bySeq.has(s.id)) {
            bySeq.set(s.id, { id: s.id, status: s.status, orders: [] });
          }
          bySeq.get(s.id).orders.push({ wpOrderId: o.wpOrderId, number: o.number });
        }
      }
      takenBySequences.push(...Array.from(bySeq.values()).sort((a, b) => a.id - b.id));
    }

    res.json({
      total: wcOrders.length,
      synced,
      created,
      updated,
      failed,
      errors,
      orders,
      takenBySequences,
      range: { after, before: before || null },
      statuses,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
