import { prisma } from '../db/prisma.js';
import { HttpError } from '../middleware/error.js';
import { wcGetProduct } from './woocommerce.js';

// Valida stock disponible en WC para los items B1 de la lista de pedidos.
// Devuelve array de problemas { wpOrderId, productId, sku, name, required, available }.
// Si WC no responde, agregamos un warning en lugar de bloquear todo el flujo.
export async function validateStock(orderIds) {
  const items = await prisma.orderItem.findMany({
    where: { orderId: { in: orderIds }, warehouse: 'B1' },
    include: { product: true, order: true },
  });

  // Sumamos cantidades requeridas por productId.
  const required = new Map();
  for (const it of items) {
    required.set(it.productId, (required.get(it.productId) || 0) + it.qty);
  }

  const problems = [];
  for (const [productId, qty] of required.entries()) {
    try {
      const p = await wcGetProduct(productId);
      const stock = typeof p.stock_quantity === 'number' ? p.stock_quantity : null;
      if (stock !== null && stock < qty) {
        const ordersAffected = items
          .filter((i) => i.productId === productId)
          .map((i) => ({ wpOrderId: i.order.wpOrderId, number: i.order.number, qty: i.qty }));
        problems.push({
          productId,
          sku: p.sku,
          name: p.name,
          required: qty,
          available: stock,
          orders: ordersAffected,
        });
      }
    } catch (err) {
      problems.push({ productId, warning: 'wc_unreachable', message: err.message });
    }
  }
  return problems;
}

// Crea una secuencia para una bodega con la lista de pedidos dada.
// Marca los pedidos como 'sequenced' para que no entren en una segunda
// secuencia (optimización #3 del PDF).
// mode: 'by_sku' (default, agrupado por SKU) o 'by_order' (pedido por pedido).
export async function createSequence({ warehouse, orderIds, createdById, mode = 'by_sku' }) {
  if (!['B1', 'B2'].includes(warehouse)) throw new HttpError(400, 'Invalid warehouse');
  if (!['by_sku', 'by_order'].includes(mode)) throw new HttpError(400, 'Invalid mode');
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    throw new HttpError(400, 'orderIds required');
  }

  return prisma.$transaction(async (tx) => {
    const orders = await tx.order.findMany({
      where: { id: { in: orderIds }, status: 'received' },
    });
    if (orders.length !== orderIds.length) {
      throw new HttpError(409, 'Some orders are not in "received" state or do not exist');
    }

    const seq = await tx.sequence.create({
      data: {
        warehouse,
        mode,
        createdById,
        expectedBags: orders.length,
        orders: {
          create: orders.map((o) => ({ orderId: o.id })),
        },
      },
    });

    await tx.order.updateMany({
      where: { id: { in: orderIds } },
      data: { status: 'sequenced' },
    });

    await tx.event.create({
      data: {
        type: 'sequence.created',
        actorId: createdById,
        payload: { sequenceId: seq.id, warehouse, orderIds },
      },
    });

    return seq;
  });
}

// Reporte agrupado por SKU para una secuencia: muestra cantidad total a recolectar.
// Incluye thumbnail y nombre para que el picker no se equivoque entre variantes (#14).
export async function getPickingReport(sequenceId) {
  const seq = await prisma.sequence.findUnique({ where: { id: sequenceId } });
  if (!seq) throw new HttpError(404, 'Sequence not found');

  const items = await prisma.orderItem.findMany({
    where: {
      order: { sequenceLinks: { some: { sequenceId } } },
      warehouse: seq.warehouse,
    },
    include: { product: true },
  });

  // Agrupamos por productId. Marcamos como picked si TODOS los order_items del
  // SKU en la secuencia ya tienen pickedAt.
  const groups = new Map();
  for (const it of items) {
    const g = groups.get(it.productId) || {
      productId: it.productId,
      sku: it.product?.sku,
      name: it.product?.name,
      thumbnailUrl: it.product?.thumbnailUrl,
      qty: 0,
      pickedCount: 0,
      totalCount: 0,
    };
    g.qty += it.qty;
    g.totalCount += 1;
    if (it.pickedAt) g.pickedCount += 1;
    groups.set(it.productId, g);
  }

  const rows = Array.from(groups.values()).map((g) => ({
    productId: g.productId,
    sku: g.sku,
    name: g.name,
    thumbnailUrl: g.thumbnailUrl,
    qty: g.qty,
    picked: g.pickedCount === g.totalCount && g.totalCount > 0,
  }));

  const allPicked = rows.length > 0 && rows.every((r) => r.picked);

  return { sequence: seq, items: rows, allPicked };
}

// Marca un SKU como recolectado dentro de la secuencia: propaga pickedAt a todos
// los order_items correspondientes en los pedidos de la secuencia.
export async function markPicked({ sequenceId, productId, actorId, picked }) {
  const seq = await prisma.sequence.findUnique({ where: { id: sequenceId } });
  if (!seq) throw new HttpError(404, 'Sequence not found');
  if (seq.status !== 'open') throw new HttpError(409, 'Sequence is closed');

  const at = picked ? new Date() : null;
  await prisma.orderItem.updateMany({
    where: {
      productId,
      warehouse: seq.warehouse,
      order: { sequenceLinks: { some: { sequenceId } } },
    },
    data: { pickedAt: at },
  });

  await prisma.event.create({
    data: {
      type: picked ? 'sequence.item_picked' : 'sequence.item_unpicked',
      actorId,
      payload: { sequenceId, productId },
    },
  });

  // Si todos los items B1 de un pedido están pickeados, marcamos el pedido picked.
  // (Sólo aplica a secuencias B1 — en B2 el flujo es distinto.)
  if (seq.warehouse === 'B1' && picked) {
    const orders = await prisma.order.findMany({
      where: { sequenceLinks: { some: { sequenceId } }, status: 'sequenced' },
      include: { items: true },
    });
    for (const o of orders) {
      const b1Items = o.items.filter((i) => i.warehouse === 'B1');
      const allPicked = b1Items.length > 0 && b1Items.every((i) => i.pickedAt);
      if (allPicked) {
        await prisma.order.update({ where: { id: o.id }, data: { status: 'picked' } });
      }
    }
  }
}

// Lista los pedidos listos para empacar dentro de una secuencia.
// En modo 'by_order' el picker recoge y empaca en un solo paso, por eso
// `ready` siempre es true (no requiere picking previo).
export async function getPendingPacking(sequenceId) {
  const seq = await prisma.sequence.findUnique({ where: { id: sequenceId } });
  if (!seq) throw new HttpError(404, 'Sequence not found');

  const orders = await prisma.order.findMany({
    where: {
      sequenceLinks: { some: { sequenceId } },
      status: { in: ['picked', 'sequenced'] },
    },
    include: { items: { include: { product: true } } },
    orderBy: { id: 'asc' },
  });

  return orders.map((o) => {
    const b1 = o.items.filter((i) => i.warehouse === 'B1');
    const allPicked = b1.length > 0 && b1.every((i) => i.pickedAt);
    const ready = seq.mode === 'by_order' ? true : allPicked;
    return {
      id: o.id,
      number: o.number,
      customerName: o.customerName,
      hasB2Pending: o.hasB2Pending,
      status: o.status,
      ready,
      itemCount: b1.length,
    };
  });
}

// Cierra una secuencia: compara conteo esperado vs real (bolsas empacadas)
// y bloquea si hay discrepancia (optimización #13).
export async function closeSequence({ sequenceId, actorId, actualBags }) {
  const seq = await prisma.sequence.findUnique({
    where: { id: sequenceId },
    include: { orders: { include: { order: true } } },
  });
  if (!seq) throw new HttpError(404, 'Sequence not found');
  if (seq.status === 'closed') throw new HttpError(409, 'Sequence already closed');

  const packed = seq.orders.filter((so) => so.order.status === 'packed').length;
  if (typeof actualBags === 'number' && actualBags !== seq.expectedBags) {
    throw new HttpError(409, 'Bag count mismatch', {
      expected: seq.expectedBags,
      reported: actualBags,
      packed,
    });
  }
  if (packed !== seq.expectedBags) {
    throw new HttpError(409, 'Some orders are not packed yet', {
      expected: seq.expectedBags,
      packed,
    });
  }

  const updated = await prisma.sequence.update({
    where: { id: sequenceId },
    data: { status: 'closed', closedAt: new Date(), actualBags: packed },
  });

  await prisma.event.create({
    data: {
      type: 'sequence.closed',
      actorId,
      payload: { sequenceId, packed, expected: seq.expectedBags },
    },
  });

  return updated;
}
