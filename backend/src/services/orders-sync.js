import { prisma } from '../db/prisma.js';
import { config } from '../config.js';
import { wcGetOrder, wcGetProduct, getMeta } from './woocommerce.js';

// Upsert de un producto en BD local. Si nos pasan el payload WC lo usamos;
// si no, hacemos pull a la WC API. Determina la bodega leyendo el meta
// configurado en META_PRODUCT_WAREHOUSE.
export async function syncProduct(wpProductId, wcProduct = null) {
  const data = wcProduct || (await wcGetProduct(wpProductId));
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

// Upsert completo de un pedido WC, incluyendo items. Lee los metas de ruta y
// posición de carga, y calcula hasB2Pending mirando los items.
export async function syncOrder(wpOrderId, wcOrder = null) {
  const data = wcOrder || (await wcGetOrder(wpOrderId));

  const route = getMeta(data, config.meta.orderRoute) || null;
  const stopPositionRaw = getMeta(data, config.meta.orderStopPosition);
  const stopPosition = stopPositionRaw ? Number(stopPositionRaw) : null;

  return prisma.$transaction(async (tx) => {
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

    // Reemplazo total de items para evitar drift cuando WC edita el pedido.
    await tx.orderItem.deleteMany({ where: { orderId: order.id } });

    let hasB2 = false;
    for (const li of data.line_items || []) {
      const productId = li.product_id;
      const product = await tx.productMeta.findUnique({ where: { wpProductId: productId } });
      if (!product) {
        // Si el producto aún no está sincronizado, lo traemos. Evita huecos.
        await syncProduct(productId);
      }
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
  });
}
