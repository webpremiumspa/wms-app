import { prisma } from '../db/prisma.js';
import { config } from '../config.js';
import { wcGetOrder, wcGetProduct, wcGetProductsByIds, getMeta } from './woocommerce.js';

// Normaliza el valor del meta de bodega. Soporta los formatos comunes:
//   "B1"/"B2" (recomendado), "1"/"2" (numérico string como en algunos plugins),
//   1/2 (number), "b1"/"b2" (case insensitive). Cualquier otra cosa → null.
function normalizeWarehouse(value) {
  if (value == null) return null;
  const s = String(value).trim().toUpperCase();
  if (s === 'B1' || s === '1') return 'B1';
  if (s === 'B2' || s === '2') return 'B2';
  return null;
}

// Upsert de producto en BD local. Si WC no responde (404, timeout, etc.) creamos
// un placeholder para no bloquear el sync del pedido completo.
export async function syncProduct(wpProductId, wcProduct = null) {
  let data = wcProduct;
  if (!data) {
    try {
      data = await wcGetProduct(wpProductId);
    } catch {
      data = {
        id: wpProductId,
        sku: null,
        name: `Producto #${wpProductId}`,
        images: [],
        meta_data: [],
      };
    }
  }
  const warehouseValue = getMeta(data, config.meta.productWarehouse);
  const warehouse = normalizeWarehouse(warehouseValue);

  return prisma.productMeta.upsert({
    where: { wpProductId: data.id },
    create: {
      wpProductId: data.id,
      sku: data.sku || null,
      name: data.name,
      warehouse,
      thumbnailUrl: data.images?.[0]?.src || null,
    },
    update: {
      sku: data.sku || null,
      name: data.name,
      warehouse,
      thumbnailUrl: data.images?.[0]?.src || null,
      syncedAt: new Date(),
    },
  });
}

// Pre-sincroniza un conjunto de productIds: detecta los que faltan, los pide a
// WC en una sola llamada batch (?include=...) y los upsertea uno por uno (DB
// writes son rápidos, lo lento era WC). Reduce N llamadas HTTP a 1.
export async function ensureProducts(productIds) {
  const unique = [...new Set(productIds.filter((id) => Number.isInteger(id) && id > 0))];
  if (unique.length === 0) return;

  // Re-fetch tanto los que no existen como los que sí pero con warehouse=null
  // (posiblemente importados antes con un meta mal interpretado).
  const existing = await prisma.productMeta.findMany({
    where: { wpProductId: { in: unique } },
    select: { wpProductId: true, warehouse: true },
  });
  const okIds = new Set(existing.filter((p) => p.warehouse !== null).map((p) => p.wpProductId));
  const missing = unique.filter((id) => !okIds.has(id));
  if (missing.length === 0) return;

  // Una sola llamada a WC para todos los productos faltantes.
  let wcProducts = [];
  try {
    wcProducts = await wcGetProductsByIds(missing);
  } catch {
    // Si WC falla del todo, igual creamos placeholders para no bloquear.
  }

  const returnedIds = new Set(wcProducts.map((p) => p.id));
  for (const wcp of wcProducts) {
    await syncProduct(wcp.id, wcp);
  }
  // Lo que WC no devolvió (borrados, sin permisos, etc.) → placeholder
  for (const id of missing) {
    if (!returnedIds.has(id)) await syncProduct(id, null);
  }
}

// Upsert completo de un pedido WC, incluyendo items. Lee los metas de ruta y
// posición de carga, y calcula hasB2Pending mirando los items.
export async function syncOrder(wpOrderId, wcOrder = null) {
  const data = wcOrder || (await wcGetOrder(wpOrderId));

  // 1. Pre-sync de productos FUERA de la transacción (en 1 sola llamada a WC).
  const productIds = (data.line_items || [])
    .map((li) => li.product_id)
    .filter((id) => id > 0);
  await ensureProducts(productIds);

  const route = getMeta(data, config.meta.orderRoute) || null;
  const stopPositionRaw = getMeta(data, config.meta.orderStopPosition);
  const stopPosition = stopPositionRaw ? Number(stopPositionRaw) : null;
  // Usamos date_created de WC como createdAt local: refleja cuándo se hizo el
  // pedido, no cuándo lo sincronizamos.
  const wcDate = data.date_created ? new Date(data.date_created) : new Date();

  // 2. Tx con solo escrituras locales. Tiempo extendido por las dudas.
  return prisma.$transaction(
    async (tx) => {
      const order = await tx.order.upsert({
        where: { wpOrderId: data.id },
        create: {
          wpOrderId: data.id,
          number: String(data.number ?? data.id),
          status: 'received',
          route,
          stopPosition: Number.isFinite(stopPosition) ? stopPosition : null,
          customerName: [data.billing?.first_name, data.billing?.last_name].filter(Boolean).join(' ') || null,
          customerAddress: [data.shipping?.address_1, data.shipping?.city].filter(Boolean).join(', ') || null,
          bagsExpected: 1,
          createdAt: wcDate,
        },
        update: {
          number: String(data.number ?? data.id),
          route,
          stopPosition: Number.isFinite(stopPosition) ? stopPosition : null,
          customerName: [data.billing?.first_name, data.billing?.last_name].filter(Boolean).join(' ') || null,
          customerAddress: [data.shipping?.address_1, data.shipping?.city].filter(Boolean).join(', ') || null,
          createdAt: wcDate,
        },
      });

      await tx.orderItem.deleteMany({ where: { orderId: order.id } });

      let hasB2 = false;
      for (const li of data.line_items || []) {
        const productId = li.product_id;
        if (!productId || productId <= 0) continue;
        const p = await tx.productMeta.findUnique({ where: { wpProductId: productId } });
        const warehouse = p?.warehouse || 'B1';
        if (warehouse === 'B2') hasB2 = true;

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId,
            qty: li.quantity,
            warehouse,
          },
        });
      }

      return tx.order.update({
        where: { id: order.id },
        data: { hasB2Pending: hasB2 },
        include: { items: { include: { product: true } } },
      });
    },
    { maxWait: 10000, timeout: 15000 },
  );
}
