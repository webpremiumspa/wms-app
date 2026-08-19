import { Router } from 'express';
import { z } from 'zod';
import fs from 'node:fs';
import os from 'node:os';
import { requireAuth } from '../middleware/auth.js';
import { requireCap, WMS_CAPS } from '../middleware/capabilities.js';
import { HttpError } from '../middleware/error.js';
import { prisma } from '../db/prisma.js';
import { wcListOrders } from '../services/woocommerce.js';
import { syncOrder, ensureProducts, updateOrderMetaFromWc } from '../services/orders-sync.js';

// Log de debug temporal para sync. Se escribe a un archivo conocido para
// poder diagnosticar timeouts cuando passenger no expone stderr.
const SYNC_LOG = `${os.homedir()}/wms-sync.log`;
function slog(msg) {
  try {
    fs.appendFileSync(SYNC_LOG, `${new Date().toISOString()} ${msg}\n`);
  } catch {}
}

const router = Router();
router.use(requireAuth);

const syncSchema = z.object({
  after: z.string().optional(), // ISO 8601 o YYYY-MM-DD
  before: z.string().optional(),
  statuses: z.array(z.string()).optional(),
  // Si true, refresca TODOS los productos desde WC (no solo los nuevos).
  // Usar cuando se cambió la meta de bodega en WP y los items locales quedaron
  // con la bodega vieja cacheada.
  forceProductRefresh: z.boolean().optional(),
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
  const t0 = Date.now();
  slog('=== SYNC START ===');
  try {
    const parsed = syncSchema.safeParse(req.body || {});
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());

    const after = normalizeDate(parsed.data.after);
    const before = normalizeDate(parsed.data.before, true);
    const statuses = parsed.data.statuses?.length
      ? parsed.data.statuses
      : ['en-preparacion'];

    slog(`statuses=${statuses.join(',')} after=${after || '-'} before=${before || '-'}`);

    // Reset previo a la sincronización: borramos todos los pedidos que estén
    // actualmente en estado 'received' (pendientes de secuenciar) para que
    // la lista arranque de cero en cada sync. Sin este reset, quedaban
    // pedidos viejos que ya cambiaron de estado en WC (cancelados,
    // completados, en ruta) arrastrándose en la vista de Generar Secuencia.
    // Los pedidos que ya están en una secuencia (sequenced/packed/...) NO
    // se tocan: solo eliminamos los que están fuera del flujo activo.
    //
    // v0.25.14: excluimos pedidos con delivery_status='revived'. Son pedidos
    // que volvieron de reparto sin entregar y fueron reintegrados al pool
    // (por auto-revive vía webhook o revive manual del supervisor). Perder
    // esa marca al hacer sync bulk implicaba que el pedido se re-creaba
    // desde WC como nuevo, sin trazabilidad histórica y sin el chip
    // 'revived' que le recordaba al picker buscar la bolsa guardada.
    const cleared = await prisma.order.deleteMany({
      where: {
        status: 'received',
        NOT: { deliveryStatus: 'revived' },
      },
    });
    slog(`reset: cleared ${cleared.count} pending orders (status=received, revived preservados)`);

    // Paginación: WC permite hasta 100 por página. Tope de seguridad: 10 páginas (1000 pedidos).
    const wcOrders = [];
    let page = 1;
    const maxPages = 10;
    const tWc = Date.now();
    while (page <= maxPages) {
      const tPage = Date.now();
      const batch = await wcListOrders({
        ...(after ? { after } : {}),
        ...(before ? { before } : {}),
        status: statuses.join(','),
        per_page: 100,
        page,
        orderby: 'date',
        order: 'desc',
      });
      slog(`WC page ${page}: ${batch.length} orders in ${Date.now() - tPage}ms`);
      wcOrders.push(...batch);
      if (batch.length < 100) break;
      page += 1;
    }
    slog(`WC total: ${wcOrders.length} orders fetched in ${Date.now() - tWc}ms`);

    // Pre-fetch UNA vez todos los productos referenciados por todos los pedidos
    // (1 call HTTP a WC con ?include=ids... en lugar de N calls).
    const allProductIds = [];
    for (const wco of wcOrders) {
      for (const li of wco.line_items || []) {
        if (li.product_id > 0) allProductIds.push(li.product_id);
      }
    }
    const tProd = Date.now();
    await ensureProducts(allProductIds, { force: parsed.data.forceProductRefresh === true });
    slog(`ensureProducts done in ${Date.now() - tProd}ms (${new Set(allProductIds).size} unique productIds)`);

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
    let skipped = 0;
    let failed = 0;
    const errors = [];
    const orders = [];
    const skippedOrders = [];

    // Procesamos los pedidos en lotes paralelos. CloudLinux shared hosting
    // suele tener pool MySQL chico, así que 4 simultáneos es seguro.
    const CONCURRENCY = 4;
    const tSync = Date.now();
    for (let i = 0; i < wcOrders.length; i += CONCURRENCY) {
      const slice = wcOrders.slice(i, i + CONCURRENCY);
      const tBatch = Date.now();
      const results = await Promise.all(
        slice.map(async (wco) => {
          try {
            const wasExisting = existingWpIds.has(wco.id);
            const order = await syncOrder(wco.id, wco);
            return { ok: true, wco, wasExisting, order };
          } catch (err) {
            slog(`syncOrder ${wco.id} FAILED: ${err.message}`);
            return { ok: false, wco, err };
          }
        }),
      );
      slog(`batch ${i / CONCURRENCY + 1}/${Math.ceil(wcOrders.length / CONCURRENCY)} (${slice.length} orders) in ${Date.now() - tBatch}ms`);
      for (const r of results) {
        if (!r.ok) {
          failed += 1;
          errors.push({ wpOrderId: r.wco.id, message: r.err.message });
          continue;
        }
        const { order, wasExisting } = r;
        orders.push({
          wpOrderId: order.wpOrderId,
          number: order.number,
          status: order.status,
          isNew: !wasExisting,
          skipped: !!order.skipped,
        });
        if (order.skipped) {
          skipped += 1;
          skippedOrders.push({ wpOrderId: order.wpOrderId, number: order.number, status: order.status });
        } else if (wasExisting) updated += 1;
        else created += 1;
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

    slog(`=== SYNC DONE in ${Date.now() - t0}ms · created=${created} updated=${updated} skipped=${skipped} failed=${failed} ===`);
    res.json({
      total: wcOrders.length,
      synced,
      created,
      updated,
      skipped,
      failed,
      errors,
      orders,
      skippedOrders,
      takenBySequences,
      range: { after, before: before || null },
      statuses,
      // Cuántos pedidos pendientes viejos se borraron al inicio del sync.
      // El frontend lo puede mostrar para transparencia ("borré 12, traje 30").
      clearedPendingBefore: cleared.count,
    });
  } catch (err) {
    slog(`=== SYNC ERROR after ${Date.now() - t0}ms: ${err.message} ===`);
    next(err);
  }
});

// Refresca SOLO la metadata de ruta/parada/método de envío de los pedidos
// activos del WMS (no entregados). Útil cuando la app externa de rutas asigna
// rutas DESPUÉS del packing y queremos forzar la sincronización sin esperar
// el webhook.
//
// Acepta ?processId=N para scopear el refresh a un solo proceso. Sin el
// parámetro refresca TODOS los pedidos activos del WMS (compat con el botón
// global, si llega a existir uno).
router.post('/routes', requireCap(WMS_CAPS.SUPERVISE, WMS_CAPS.LOAD, WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const processIdRaw = req.query.processId;
    const processId = processIdRaw && /^\d+$/.test(String(processIdRaw)) ? Number(processIdRaw) : null;

    // Pedidos activos: cualquier estado menos delivered. Si viene processId,
    // los acotamos a las secuencias de ese proceso. Limitamos a 500 para que
    // el endpoint no se cuelgue si hubo backlog.
    const orders = await prisma.order.findMany({
      where: {
        status: { not: 'delivered' },
        ...(processId
          ? { sequenceLinks: { some: { sequence: { processId } } } }
          : {}),
      },
      select: { wpOrderId: true },
      take: 500,
    });
    if (orders.length === 0) {
      return res.json({ ok: true, total: 0, updated: 0, processId });
    }

    const ids = orders.map((o) => o.wpOrderId);
    const CHUNK = 100;
    let updated = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < ids.length; i += CHUNK) {
      const chunk = ids.slice(i, i + CHUNK);
      const wcOrders = await wcListOrders({
        include: chunk.join(','),
        per_page: chunk.length,
      });
      // Update parcial en paralelo dentro del chunk.
      const results = await Promise.all(
        wcOrders.map(async (wco) => {
          try {
            await updateOrderMetaFromWc(wco.id, wco);
            return { ok: true };
          } catch (err) {
            return { ok: false, wpOrderId: wco.id, message: err.message };
          }
        }),
      );
      for (const r of results) {
        if (r.ok) updated += 1;
        else {
          failed += 1;
          errors.push({ wpOrderId: r.wpOrderId, message: r.message });
        }
      }
    }

    res.json({ ok: true, total: ids.length, updated, failed, errors, processId });
  } catch (err) {
    next(err);
  }
});

export default router;
