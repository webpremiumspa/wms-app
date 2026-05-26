import { prisma } from '../db/prisma.js';
import { config } from '../config.js';
import { wcGetOrder, wcGetProduct, getMeta } from './woocommerce.js';

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
  const warehouse = warehouseValue === 'B1' || warehouseValue === 'B2' ? warehouseValue : null;

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

// Pre-sincroniza los productos referenciados en un pedido WC. CORRE FUERA DE LA
// TRANSACCIÓN del pedido para evitar que las llamadas a WC API (lentas vía
// Cloudflare) excedan el timeout de Prisma.
async function ensureProductsFromOrder(orderData, concurrency = 5) {
  const productIds = [...new Set(
    (orderData.line_items || [])
      .map((li) => li.product_id)
      .filter((id) => Number.isInteger(id) && id > 0),
  )];
  if (productIds.length === 0) return;

  const existing = await prisma.productMeta.findMany({
    where: { wpProductId: { in: productIds } },
    select: { wpProductId: true },
  });
  const existingIds = new Set(existing.map((p) => p.wpProductId));
  const missingIds = productIds.filter((id) => !existingIds.has(id));

  // Fetch en paralelo controlado (no abrumar WC + Cloudflare).
  for (let i = 0; i < missingIds.length; i += concurrency) {
    const batch = missingIds.slice(i, i + concurrency);
    await Promise.all(batch.map((id) => syncProduct(id)));
  }
}

// Upsert completo de un pedido WC, incluyendo items. Lee los metas de ruta y
// posición de carga, y calcula hasB2Pending mirando los items.
export async function syncOrder(wpOrderId, wcOrder = null) {
  const data = wcOrder || (await wcGetOrder(wpOrderId));

  // 1. Pre-sync de productos FUERA de la transacción.
  await ensureProductsFromOrder(data);

  const route = getMeta(data, config.meta.orderRoute) || null;
  const stopPositionRaw = getMeta(data, config.meta.orderStopPosition);
  const stopPosition = stopPositionRaw ? Number(stopPositionRaw) : null;

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
        },
        update: {
          number: String(data.number ?? data.id),
          route,
          stopPosition: Number.isFinite(stopPosition) ? stopPosition : null,
          customerName: [data.billing?.first_name, data.billing?.last_name].filter(Boolean).join(' ') || null,
          customerAddress: [data.shipping?.address_1, data.shipping?.city].filter(Boolean).join(', ') || null,
        },
      });

      // Reemplazo total de items para evitar drift si WC editó el pedido.
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
