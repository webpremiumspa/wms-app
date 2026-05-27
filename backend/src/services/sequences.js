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

// Crea una secuencia agnóstica de bodega con la lista de pedidos dada.
// Cada secuencia arrastra dos flujos de picking (B1 y B2) que cierran por
// separado. Marca los pedidos como 'sequenced' para que no entren en una
// segunda secuencia.
// mode: 'by_sku' (agrupado por SKU) o 'by_order' (recorre pedido por pedido).
//       Aplica solo al picking B1 — el B2 siempre es agrupado por SKU.
export async function createSequence({ orderIds, createdById, mode = 'by_order' }) {
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
        payload: { sequenceId: seq.id, orderIds },
      },
    });

    return seq;
  });
}

// Reporte agrupado por SKU para el picking B1 de una secuencia.
export async function getPickingReport(sequenceId) {
  const seq = await prisma.sequence.findUnique({ where: { id: sequenceId } });
  if (!seq) throw new HttpError(404, 'Sequence not found');

  const items = await prisma.orderItem.findMany({
    where: {
      order: { sequenceLinks: { some: { sequenceId } } },
      warehouse: 'B1',
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

// Marca un SKU B1 como recolectado dentro de la secuencia: propaga pickedAt a
// todos los order_items B1 correspondientes.
export async function markPicked({ sequenceId, productId, actorId, picked }) {
  const seq = await prisma.sequence.findUnique({ where: { id: sequenceId } });
  if (!seq) throw new HttpError(404, 'Sequence not found');
  if (seq.b1ClosedAt) throw new HttpError(409, 'B1 picking is already closed for this sequence');

  const at = picked ? new Date() : null;
  await prisma.orderItem.updateMany({
    where: {
      productId,
      warehouse: 'B1',
      order: { sequenceLinks: { some: { sequenceId } } },
    },
    data: { pickedAt: at },
  });

  await prisma.event.create({
    data: {
      type: picked ? 'sequence.item_picked' : 'sequence.item_unpicked',
      actorId,
      payload: { sequenceId, productId, warehouse: 'B1' },
    },
  });

  // Si todos los items B1 de un pedido están pickeados, marcamos el pedido picked.
  if (picked) {
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

// Lista TODOS los pedidos de la secuencia con su estado actual. La UI los
// muestra ordenados (no empacados arriba) y usa el conteo total para la barra
// de progreso. En modo 'by_order' el picker recoge y empaca en un solo paso,
// por eso `ready` siempre es true (no requiere picking previo).
export async function getPendingPacking(sequenceId) {
  const seq = await prisma.sequence.findUnique({ where: { id: sequenceId } });
  if (!seq) throw new HttpError(404, 'Sequence not found');

  const orders = await prisma.order.findMany({
    where: {
      sequenceLinks: { some: { sequenceId } },
      status: { in: ['sequenced', 'picked', 'packed', 'classified', 'loaded'] },
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

// Reporte de picking B2 para UNA secuencia. Agrupa los items B2 por productId
// con su cantidad total a sacar del granel. Se marca picked si TODOS los items
// B2 de ese productId dentro de la secuencia tienen pickedAt.
export async function getPickingB2Report(sequenceId) {
  const seq = await prisma.sequence.findUnique({ where: { id: sequenceId } });
  if (!seq) throw new HttpError(404, 'Sequence not found');

  const items = await prisma.orderItem.findMany({
    where: {
      warehouse: 'B2',
      order: { sequenceLinks: { some: { sequenceId } } },
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
    ordersCount: g.totalCount,
  }));

  rows.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const allPicked = rows.length > 0 && rows.every((r) => r.picked);

  return { sequence: seq, items: rows, allPicked, totalSkus: rows.length };
}

// Marca un SKU B2 como recolectado dentro de la secuencia. Propaga pickedAt a
// todos los items B2 con ese productId que pertenezcan a pedidos de la secuencia.
export async function markPickedB2({ sequenceId, productId, actorId, picked }) {
  const seq = await prisma.sequence.findUnique({ where: { id: sequenceId } });
  if (!seq) throw new HttpError(404, 'Sequence not found');
  if (seq.b2ClosedAt) throw new HttpError(409, 'B2 picking is already closed for this sequence');

  const at = picked ? new Date() : null;
  await prisma.orderItem.updateMany({
    where: {
      productId,
      warehouse: 'B2',
      order: { sequenceLinks: { some: { sequenceId } } },
    },
    data: { pickedAt: at },
  });

  await prisma.event.create({
    data: {
      type: picked ? 'sequence.item_picked' : 'sequence.item_unpicked',
      actorId,
      payload: { sequenceId, productId, warehouse: 'B2' },
    },
  });
}

// ─── Picking B2 en BATCH (varias secuencias a la vez) ─────────────────────
// El equipo B2 puede consolidar el picking de N secuencias en una sola corrida
// matinal. El batch es efímero (no persiste como entidad): vive en la URL/UI
// del operador. Cada secuencia mantiene su propio cierre B2 independiente.
//
// Reglas:
//  - Solo secuencias con b2_closed_at = NULL pueden entrar al batch.
//  - Al cerrar, se cierran SOLO las secuencias que quedaron 100% pickeadas.
//    Las que tengan items B2 sin marcar quedan abiertas para otra ronda.
async function validateBatchSequences(sequenceIds) {
  if (!Array.isArray(sequenceIds) || sequenceIds.length === 0) {
    throw new HttpError(400, 'sequenceIds required');
  }
  const seqs = await prisma.sequence.findMany({
    where: { id: { in: sequenceIds } },
    select: { id: true, b2ClosedAt: true },
  });
  if (seqs.length !== sequenceIds.length) {
    throw new HttpError(404, 'Some sequences do not exist');
  }
  const alreadyClosed = seqs.filter((s) => s.b2ClosedAt !== null).map((s) => s.id);
  if (alreadyClosed.length > 0) {
    throw new HttpError(409, 'Some sequences have B2 already closed', { alreadyClosed });
  }
  return seqs;
}

export async function getPickingB2BatchReport(sequenceIds) {
  await validateBatchSequences(sequenceIds);

  const items = await prisma.orderItem.findMany({
    where: {
      warehouse: 'B2',
      order: { sequenceLinks: { some: { sequenceId: { in: sequenceIds } } } },
    },
    include: {
      product: true,
      order: {
        select: {
          number: true,
          sequenceLinks: { select: { sequenceId: true } },
        },
      },
    },
  });

  // Agrupar por productId, sumando qty entre secuencias.
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
      orderNumbers: new Set(),
    };
    g.qty += it.qty;
    g.totalCount += 1;
    if (it.pickedAt) g.pickedCount += 1;
    g.orderNumbers.add(it.order.number);
    groups.set(it.productId, g);
  }

  const rows = Array.from(groups.values()).map((g) => ({
    productId: g.productId,
    sku: g.sku,
    name: g.name,
    thumbnailUrl: g.thumbnailUrl,
    qty: g.qty,
    picked: g.pickedCount === g.totalCount && g.totalCount > 0,
    ordersCount: g.orderNumbers.size,
  }));
  rows.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const allPicked = rows.length > 0 && rows.every((r) => r.picked);
  return { sequenceIds, items: rows, allPicked, totalSkus: rows.length };
}

export async function markPickedB2Batch({ sequenceIds, productId, actorId, picked }) {
  await validateBatchSequences(sequenceIds);

  const at = picked ? new Date() : null;
  await prisma.orderItem.updateMany({
    where: {
      productId,
      warehouse: 'B2',
      order: { sequenceLinks: { some: { sequenceId: { in: sequenceIds } } } },
    },
    data: { pickedAt: at },
  });

  await prisma.event.create({
    data: {
      type: picked ? 'sequence.item_picked' : 'sequence.item_unpicked',
      actorId,
      payload: { sequenceIds, productId, warehouse: 'B2', batch: true },
    },
  });
}

// Cierre flexible: cierra B2 solo en las secuencias 100% pickeadas. Reporta
// las que quedaron incompletas para que el operador sepa cuáles siguen vivas.
export async function closeSequenceB2BatchPartial({ sequenceIds, actorId }) {
  await validateBatchSequences(sequenceIds);

  // Para cada secuencia, contar items B2 totales y pendientes.
  const breakdown = await Promise.all(
    sequenceIds.map(async (sequenceId) => {
      const items = await prisma.orderItem.findMany({
        where: {
          warehouse: 'B2',
          order: { sequenceLinks: { some: { sequenceId } } },
        },
        select: { pickedAt: true },
      });
      const total = items.length;
      const pending = items.filter((i) => !i.pickedAt).length;
      return { sequenceId, total, pending };
    }),
  );

  const now = new Date();
  const closed = [];
  const stillPending = [];

  for (const b of breakdown) {
    if (b.pending === 0) {
      // Secuencias sin items B2 también se cierran (no-op de picking pero el
      // flujo queda marcado como completo).
      const seq = await prisma.sequence.findUnique({
        where: { id: b.sequenceId },
        select: { b1ClosedAt: true },
      });
      await prisma.sequence.update({
        where: { id: b.sequenceId },
        data: {
          b2ClosedAt: now,
          ...(seq?.b1ClosedAt ? { status: 'closed', closedAt: now } : {}),
        },
      });
      await prisma.event.create({
        data: {
          type: 'sequence.b2_closed',
          actorId,
          payload: { sequenceId: b.sequenceId, totalSkus: b.total, batch: true },
        },
      });
      closed.push(b.sequenceId);
    } else {
      stillPending.push({ sequenceId: b.sequenceId, total: b.total, pending: b.pending });
    }
  }

  return { closed, stillPending };
}

// Cierra el flujo B1 de una secuencia: exige que todos los pedidos estén
// 'packed' (o más avanzados) y compara el conteo de bolsas físicas.
export async function closeSequenceB1({ sequenceId, actorId, actualBags }) {
  const seq = await prisma.sequence.findUnique({
    where: { id: sequenceId },
    include: { orders: { include: { order: true } } },
  });
  if (!seq) throw new HttpError(404, 'Sequence not found');
  if (seq.b1ClosedAt) throw new HttpError(409, 'B1 already closed');

  const packed = seq.orders.filter((so) => ['packed', 'classified', 'loaded', 'delivered'].includes(so.order.status)).length;
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

  const now = new Date();
  const updated = await prisma.sequence.update({
    where: { id: sequenceId },
    data: {
      b1ClosedAt: now,
      actualBags: packed,
      // Si B2 ya estaba cerrado, la secuencia entera pasa a closed.
      ...(seq.b2ClosedAt ? { status: 'closed', closedAt: now } : {}),
    },
  });

  await prisma.event.create({
    data: {
      type: 'sequence.b1_closed',
      actorId,
      payload: { sequenceId, packed, expected: seq.expectedBags },
    },
  });

  return updated;
}

// Cierra el flujo B2 de una secuencia: exige que todos los items B2 de la
// secuencia estén pickeados.
export async function closeSequenceB2({ sequenceId, actorId }) {
  const seq = await prisma.sequence.findUnique({ where: { id: sequenceId } });
  if (!seq) throw new HttpError(404, 'Sequence not found');
  if (seq.b2ClosedAt) throw new HttpError(409, 'B2 already closed');

  const b2Items = await prisma.orderItem.findMany({
    where: {
      warehouse: 'B2',
      order: { sequenceLinks: { some: { sequenceId } } },
    },
    select: { id: true, pickedAt: true },
  });

  const total = b2Items.length;
  const pending = b2Items.filter((i) => !i.pickedAt).length;

  // Si la secuencia no tiene items B2 igual permitimos cerrarla — el flujo
  // queda en "no-op" y la secuencia entera puede cerrar cuando B1 también lo haga.
  if (pending > 0) {
    throw new HttpError(409, 'Some B2 items are still pending', { total, pending });
  }

  const now = new Date();
  const updated = await prisma.sequence.update({
    where: { id: sequenceId },
    data: {
      b2ClosedAt: now,
      ...(seq.b1ClosedAt ? { status: 'closed', closedAt: now } : {}),
    },
  });

  await prisma.event.create({
    data: {
      type: 'sequence.b2_closed',
      actorId,
      payload: { sequenceId, totalSkus: total },
    },
  });

  return updated;
}
