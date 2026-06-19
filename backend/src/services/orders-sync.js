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
//
// Con `force: true` ignora la cache local y refresca TODOS los productos
// desde WC. Útil cuando se cambió la meta de bodega en WP y hay que reflejar
// el cambio en items ya sincronizados.
export async function ensureProducts(productIds, { force = false } = {}) {
  const unique = [...new Set(productIds.filter((id) => Number.isInteger(id) && id > 0))];
  if (unique.length === 0) return;

  let toFetch;
  if (force) {
    toFetch = unique;
  } else {
    // Re-fetch los que no existen y los que tienen warehouse=null
    // (posiblemente importados antes con un meta mal interpretado).
    const existing = await prisma.productMeta.findMany({
      where: { wpProductId: { in: unique } },
      select: { wpProductId: true, warehouse: true },
    });
    const okIds = new Set(existing.filter((p) => p.warehouse !== null).map((p) => p.wpProductId));
    toFetch = unique.filter((id) => !okIds.has(id));
    if (toFetch.length === 0) return;
  }

  // Una sola llamada a WC para todos los productos a refrescar.
  let wcProducts = [];
  try {
    wcProducts = await wcGetProductsByIds(toFetch);
  } catch {
    // Si WC falla del todo, igual creamos placeholders para no bloquear.
  }

  const returnedIds = new Set(wcProducts.map((p) => p.id));
  for (const wcp of wcProducts) {
    await syncProduct(wcp.id, wcp);
  }
  // Lo que WC no devolvió (borrados, sin permisos, etc.) → placeholder.
  // En modo force, no creamos placeholder si ya existía localmente (no pisamos
  // datos buenos con un placeholder vacío).
  for (const id of toFetch) {
    if (!returnedIds.has(id)) {
      if (force) {
        const exists = await prisma.productMeta.findUnique({
          where: { wpProductId: id },
          select: { wpProductId: true },
        });
        if (!exists) await syncProduct(id, null);
      } else {
        await syncProduct(id, null);
      }
    }
  }
}

// Estados en los que el pedido ya tiene progreso operativo (picking o packing
// hechos, o ya despachado). Re-sincronizar destruiría los timestamps de
// pickedAt/packedAt, así que el sync los salta. Para modificar un pedido en
// estos estados hay que eliminar la secuencia primero (revierte el pedido a
// 'received') y volver a sincronizar.
const LOCKED_STATUSES = ['picked', 'packed', 'classified', 'loaded', 'delivered'];

// Upsert completo de un pedido WC, incluyendo items. Lee los metas de ruta y
// posición de carga, y calcula hasB2Pending mirando los items.
// Si el pedido ya está en un estado "locked", lo devuelve tal cual con
// `skipped: true` y no toca nada.
export async function syncOrder(wpOrderId, wcOrder = null) {
  const existing = await prisma.order.findUnique({
    where: { wpOrderId },
    select: { id: true, wpOrderId: true, number: true, status: true },
  });
  if (existing && LOCKED_STATUSES.includes(existing.status)) {
    return { ...existing, skipped: true };
  }

  const data = wcOrder || (await wcGetOrder(wpOrderId));

  // 1. Pre-sync de productos FUERA de la transacción (en 1 sola llamada a WC).
  const productIds = (data.line_items || [])
    .map((li) => li.product_id)
    .filter((id) => id > 0);
  await ensureProducts(productIds);

  const route = getMeta(data, config.meta.orderRoute) || null;
  const stopPositionRaw = getMeta(data, config.meta.orderStopPosition);
  const stopPosition = stopPositionRaw ? Number(stopPositionRaw) : null;
  const shippingMethod = data.shipping_lines?.[0]?.method_title || null;
  // Usamos date_created de WC como createdAt local: refleja cuándo se hizo el
  // pedido, no cuándo lo sincronizamos.
  const wcDate = data.date_created ? new Date(data.date_created) : new Date();

  // Pre-resolver bodega de cada producto del pedido en UNA sola query antes de
  // la transacción. Antes hacíamos 1 findUnique por item dentro de la tx (N+1).
  const lineItems = (data.line_items || []).filter((li) => li.product_id > 0);
  const uniqueProductIds = [...new Set(lineItems.map((li) => li.product_id))];
  const productMetas = uniqueProductIds.length
    ? await prisma.productMeta.findMany({
        where: { wpProductId: { in: uniqueProductIds } },
        select: { wpProductId: true, warehouse: true },
      })
    : [];
  const warehouseByProduct = new Map(productMetas.map((p) => [p.wpProductId, p.warehouse]));

  const itemsData = lineItems.map((li) => ({
    productId: li.product_id,
    qty: li.quantity,
    warehouse: warehouseByProduct.get(li.product_id) || 'B1',
  }));
  const hasB2 = itemsData.some((it) => it.warehouse === 'B2');

  // 2. Tx con solo escrituras locales. Tiempo extendido por las dudas.
  // Retry hasta 3 veces si MySQL devuelve deadlock (puede pasar bajo cargas
  // paralelas concurrentes en order_items por FK locks).
  return retryOnDeadlock(() => prisma.$transaction(
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
          shippingMethod,
          bagsExpected: 1,
          createdAt: wcDate,
          hasB2Pending: hasB2,
        },
        update: {
          number: String(data.number ?? data.id),
          route,
          stopPosition: Number.isFinite(stopPosition) ? stopPosition : null,
          customerName: [data.billing?.first_name, data.billing?.last_name].filter(Boolean).join(' ') || null,
          customerAddress: [data.shipping?.address_1, data.shipping?.city].filter(Boolean).join(', ') || null,
          shippingMethod,
          createdAt: wcDate,
          hasB2Pending: hasB2,
        },
      });

      await tx.orderItem.deleteMany({ where: { orderId: order.id } });

      if (itemsData.length > 0) {
        await tx.orderItem.createMany({
          data: itemsData.map((it) => ({ orderId: order.id, ...it })),
        });
      }

      return tx.order.findUnique({
        where: { id: order.id },
        include: { items: { include: { product: true } } },
      });
    },
    { maxWait: 10000, timeout: 15000 },
  ));
}

// Retry helper: MySQL puede tirar deadlock errors cuando varias transacciones
// paralelas tocan los mismos índices (FK locks en order_items). Reintentamos
// hasta 3 veces con backoff corto y aleatorio para evitar tormenta.
async function retryOnDeadlock(fn, attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      const msg = String(err?.message || '');
      const isDeadlock = msg.includes('deadlock') || msg.includes('Deadlock') || msg.includes('write conflict');
      if (!isDeadlock || i === attempts - 1) throw err;
      lastErr = err;
      await new Promise((r) => setTimeout(r, 50 + Math.random() * 150));
    }
  }
  throw lastErr;
}
