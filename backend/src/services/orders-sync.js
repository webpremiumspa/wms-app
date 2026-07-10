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
//
// v0.25.3: agregamos 'sequenced' al array. Antes NO estaba, entonces el sync
// bulk hacía deleteMany de items en pedidos ya secuenciados, y por CASCADE se
// borraban las OrderItemBagAssignment silenciosamente (sin evento auditable).
// Un caso real: pedido con pack_plan_created + bag_packed bulto 1 perdió sus
// asignaciones al correr un sync bulk mientras seguía como 'en-preparacion'
// en WC. Ver commit v0.25.3 para el detalle.
const LOCKED_STATUSES = ['sequenced', 'picked', 'packed', 'classified', 'loaded', 'delivered'];

// v0.25.10: helper para derivar delivery_status desde metas WDG del sistema
// externo de rutas. Devuelve { deliveryStatus, deliveryMeta }.
//
// El "revive" (bajar loaded → received para re-secuenciar) ya NO es
// automático — es una acción manual del supervisor via
// POST /orders/:id/revive-from-return. Solo actualizamos el chip acá.
//
// Regla simplificada (v0.25.10):
//   'delivered' → meta _wdg_delivered=1
//   'partial'   → meta _wdg_partial=1
//   'returned'  → WMS='loaded' y no hay metas WDG (el sistema de rutas
//                 no marcó nada → pedido no entregado / devuelto)
//   null        → cualquier otro estado
export function computeDeliveryStatus(wcData, existingWmsStatus = null) {
  const wdgDelivered = getMeta(wcData, '_wdg_delivered') === '1';
  const wdgPartial = getMeta(wcData, '_wdg_partial') === '1';
  if (wdgDelivered) {
    return {
      deliveryStatus: 'delivered',
      deliveryMeta: {
        by: getMeta(wcData, '_wdg_delivered_by') || null,
        date: getMeta(wcData, '_wdg_delivered_date') || null,
      },
    };
  }
  if (wdgPartial) {
    return {
      deliveryStatus: 'partial',
      deliveryMeta: {
        by: getMeta(wcData, '_wdg_partial_by') || null,
        date: getMeta(wcData, '_wdg_partial_date') || null,
      },
    };
  }
  // Devuelto (informativo): el pedido está cargado en el WMS y no tiene
  // metas WDG. Chip visible; el revive lo dispara el supervisor manual.
  if (existingWmsStatus === 'loaded') {
    return {
      deliveryStatus: 'returned',
      deliveryMeta: { detectedAt: new Date().toISOString() },
    };
  }
  return { deliveryStatus: null, deliveryMeta: null };
}

// Upsert completo de un pedido WC, incluyendo items. Lee los metas de ruta y
// posición de carga, y calcula hasB2Pending mirando los items.
// Si el pedido ya está en un estado "locked", NO recreamos items (evita
// romper plan de empaque, bag events, picks). En su lugar hacemos un update
// parcial safe de metadata via updateOrderMetaFromWc — así se refleja la
// ruta/driver/dirección aunque el pedido esté a medio empacar. Dejamos
// evento auditable order.wc_synced con action='meta-only'.
export async function syncOrder(wpOrderId, wcOrder = null) {
  const existing = await prisma.order.findUnique({
    where: { wpOrderId },
    select: {
      id: true, wpOrderId: true, number: true, status: true,
      packedAt: true, classifiedAt: true, loadedAt: true, bagsExpected: true,
    },
  });
  if (existing && LOCKED_STATUSES.includes(existing.status)) {
    // v0.25.10: sin revive automático — el chip 'returned' aparece solo por
    // la lógica de updateOrderMetaFromWc. El supervisor revive con el botón
    // manual en la vista de Devueltos / Tracking.
    await updateOrderMetaFromWc(wpOrderId, wcOrder);
    await prisma.event.create({
      data: {
        type: 'order.wc_synced',
        orderId: existing.id,
        payload: { action: 'meta-only', currentStatus: existing.status },
      },
    });
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
  // Driver / vehículo desde woo-delivery-groups. Parseo defensivo por si el
  // plugin cambia el formato más adelante.
  const driverIdRaw = getMeta(data, '_wdg_driver_id');
  const driverId = driverIdRaw && !Number.isNaN(Number(driverIdRaw)) ? Number(driverIdRaw) : null;
  const driverName = getMeta(data, '_wdg_driver_name') || null;
  const vehicle = getMeta(data, '_wdg_vehicle') || null;
  const patente = getMeta(data, '_wdg_patente') || null;
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
    // Capturamos el nombre completo del line_item (incluye variante en WC).
    // Truncamos a 255 para respetar el VARCHAR.
    lineName: typeof li.name === 'string' ? li.name.slice(0, 255) : null,
  }));
  const hasB2 = itemsData.some((it) => it.warehouse === 'B2');

  // 2. Tx con solo escrituras locales. Tiempo extendido por las dudas.
  // Retry hasta 3 veces si MySQL devuelve deadlock (puede pasar bajo cargas
  // paralelas concurrentes en order_items por FK locks).
  return retryOnDeadlock(() => prisma.$transaction(
    async (tx) => {
      // Campos del cliente normalizados. Estrategia: priorizar shipping,
      // caer a billing si shipping está vacío. En Chile muchos pedidos
      // tienen solo el bloque billing porque el cliente NO marca "enviar
      // a una dirección distinta", así que el envío llega a la dirección
      // de facturación. Si solo leemos shipping, el albarán pierde depto,
      // dirección o comuna.
      const customerName = [data.shipping?.first_name || data.billing?.first_name,
                            data.shipping?.last_name  || data.billing?.last_name]
        .filter(Boolean)
        .join(' ') || null;
      const cleanStr = (v, max) => {
        if (typeof v !== 'string') return null;
        const t = v.trim();
        return t ? t.slice(0, max) : null;
      };
      const pick = (sh, bi, max) => cleanStr(sh, max) || cleanStr(bi, max);
      const customerAddress  = pick(data.shipping?.address_1, data.billing?.address_1, 500);
      const customerAddress2 = pick(data.shipping?.address_2, data.billing?.address_2, 255);
      const customerCity     = pick(data.shipping?.city,      data.billing?.city,      120);
      const customerPhone    = pick(data.billing?.phone,      data.shipping?.phone,    40);

      // Estado WC tal cual (slug). Lo guardamos para mostrarlo como chip de
      // contexto independiente del status interno del WMS.
      const wcStatusSlug = typeof data.status === 'string' && data.status.trim() ? data.status.trim().slice(0, 60) : null;

      // v0.25.9: delivery_status desde metas WDG. Solo aplicamos si son
      // metas explícitas (delivered/partial). El caso 'returned' se maneja
      // en el revive de syncOrder — acá no lo tocamos para no pisar lo que
      // ya se seteó arriba.
      const wdgDelivered = getMeta(data, '_wdg_delivered') === '1';
      const wdgPartial = getMeta(data, '_wdg_partial') === '1';
      const explicitDelivery = wdgDelivered
        ? {
            deliveryStatus: 'delivered',
            deliveryStatusUpdatedAt: new Date(),
            deliveryMeta: {
              by: getMeta(data, '_wdg_delivered_by') || null,
              date: getMeta(data, '_wdg_delivered_date') || null,
            },
          }
        : wdgPartial
          ? {
              deliveryStatus: 'partial',
              deliveryStatusUpdatedAt: new Date(),
              deliveryMeta: {
                by: getMeta(data, '_wdg_partial_by') || null,
                date: getMeta(data, '_wdg_partial_date') || null,
              },
            }
          : null;

      const order = await tx.order.upsert({
        where: { wpOrderId: data.id },
        create: {
          wpOrderId: data.id,
          number: String(data.number ?? data.id),
          status: 'received',
          wcStatus: wcStatusSlug,
          wcStatusUpdatedAt: wcStatusSlug ? new Date() : null,
          route,
          stopPosition: Number.isFinite(stopPosition) ? stopPosition : null,
          customerName,
          customerAddress,
          customerAddress2,
          customerCity,
          customerPhone,
          customerNote: typeof data.customer_note === 'string' && data.customer_note.trim() ? data.customer_note.trim() : null,
          shippingMethod,
          driverId,
          driverName,
          vehicle,
          patente,
          bagsExpected: 1,
          createdAt: wcDate,
          hasB2Pending: hasB2,
          ...(explicitDelivery || {}),
        },
        update: {
          number: String(data.number ?? data.id),
          wcStatus: wcStatusSlug,
          wcStatusUpdatedAt: wcStatusSlug ? new Date() : null,
          route,
          stopPosition: Number.isFinite(stopPosition) ? stopPosition : null,
          customerName,
          customerAddress,
          customerAddress2,
          customerCity,
          customerPhone,
          customerNote: typeof data.customer_note === 'string' && data.customer_note.trim() ? data.customer_note.trim() : null,
          shippingMethod,
          driverId,
          driverName,
          vehicle,
          patente,
          createdAt: wcDate,
          hasB2Pending: hasB2,
          ...(explicitDelivery || {}),
        },
      });

      await tx.orderItem.deleteMany({ where: { orderId: order.id } });

      if (itemsData.length > 0) {
        await tx.orderItem.createMany({
          data: itemsData.map((it) => ({ orderId: order.id, ...it })),
        });
      }

      // Rastro auditable: cada vez que el sync recrea items del pedido dejamos
      // constancia. Combinado con la guardia LOCKED_STATUSES arriba, esto
      // solo se dispara cuando el pedido es nuevo o está en 'received' — es
      // seguro recrear items en esos casos porque aún no hay plan de empaque
      // ni bag events que romper.
      await tx.event.create({
        data: {
          type: 'order.wc_synced',
          orderId: order.id,
          payload: { action: 'full', itemCount: itemsData.length },
        },
      });

      return tx.order.findUnique({
        where: { id: order.id },
        include: { items: { include: { product: true } } },
      });
    },
    { maxWait: 10000, timeout: 15000 },
  ));
}

// Update parcial: solo route, stopPosition y shippingMethod. Se usa cuando un
// pedido ya está en el WMS y solo queremos refrescar la metadata (ej. webhook
// disparado por la app externa de rutas después que el pedido ya fue empacado).
// NO toca items, status, timestamps de picker — esa info es del WMS.
// SÍ refresca datos del cliente (nombre, dirección, depto, comuna, teléfono,
// nota) — esos datos pertenecen a WC, no al WMS, y si el cliente corrige su
// dirección debemos verla actualizada (ej. para reimprimir el albarán o
// llamar al cliente desde Tracking).
export async function updateOrderMetaFromWc(wpOrderId, wcOrder = null) {
  const data = wcOrder || (await wcGetOrder(wpOrderId));
  const route = getMeta(data, config.meta.orderRoute) || null;
  const stopPositionRaw = getMeta(data, config.meta.orderStopPosition);
  const stopPosition = stopPositionRaw ? Number(stopPositionRaw) : null;
  const shippingMethod = data.shipping_lines?.[0]?.method_title || null;
  const driverIdRaw = getMeta(data, '_wdg_driver_id');
  const driverId = driverIdRaw && !Number.isNaN(Number(driverIdRaw)) ? Number(driverIdRaw) : null;
  const driverName = getMeta(data, '_wdg_driver_name') || null;
  const vehicle = getMeta(data, '_wdg_vehicle') || null;
  const patente = getMeta(data, '_wdg_patente') || null;

  // Datos del cliente — misma normalización que syncOrder: shipping
  // primero, billing como fallback (en Chile muchos pedidos no marcan
  // "enviar a dirección distinta" y todo queda en billing).
  const cleanStr = (v, max) => {
    if (typeof v !== 'string') return null;
    const t = v.trim();
    return t ? t.slice(0, max) : null;
  };
  const pick = (sh, bi, max) => cleanStr(sh, max) || cleanStr(bi, max);
  const customerName = [data.shipping?.first_name || data.billing?.first_name,
                        data.shipping?.last_name  || data.billing?.last_name]
    .filter(Boolean)
    .join(' ') || null;
  const customerAddress  = pick(data.shipping?.address_1, data.billing?.address_1, 500);
  const customerAddress2 = pick(data.shipping?.address_2, data.billing?.address_2, 255);
  const customerCity     = pick(data.shipping?.city,      data.billing?.city,      120);
  const customerPhone    = pick(data.billing?.phone,      data.shipping?.phone,    40);
  const customerNote = typeof data.customer_note === 'string' && data.customer_note.trim()
    ? data.customer_note.trim()
    : null;

  const existing = await prisma.order.findUnique({
    where: { wpOrderId: data.id },
    select: { id: true, status: true },
  });
  if (!existing) return null;

  // Estado WC tal cual (slug WC), refrescado en cada webhook. Mantiene el
  // chip sincronizado en la UI sin tocar el status interno del WMS.
  const wcStatusSlug = typeof data.status === 'string' && data.status.trim() ? data.status.trim().slice(0, 60) : null;

  // v0.25.9: derivar delivery_status desde metas WDG. En este path (metadata
  // safe, pedido locked) NO hacemos revive — eso lo hace syncOrder al
  // detectarlo. Solo actualizamos el campo para que el chip se refresque.
  const delivery = computeDeliveryStatus(data, existing.status);
  const now = new Date();

  return prisma.order.update({
    where: { id: existing.id },
    data: {
      route,
      stopPosition: Number.isFinite(stopPosition) ? stopPosition : null,
      shippingMethod,
      driverId,
      driverName,
      vehicle,
      patente,
      customerName,
      customerAddress,
      customerAddress2,
      customerCity,
      customerPhone,
      customerNote,
      wcStatus: wcStatusSlug,
      wcStatusUpdatedAt: wcStatusSlug ? new Date() : null,
      // Solo actualizamos si hay cambio real: no queremos pisar delivery_status
      // con null cuando el pedido aún no tiene metas WDG.
      ...(delivery.deliveryStatus != null ? {
        deliveryStatus: delivery.deliveryStatus,
        deliveryStatusUpdatedAt: now,
        deliveryMeta: delivery.deliveryMeta,
      } : {}),
    },
  });
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
