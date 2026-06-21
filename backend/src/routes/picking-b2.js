import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireCap, WMS_CAPS } from '../middleware/capabilities.js';
import { HttpError } from '../middleware/error.js';
import { prisma } from '../db/prisma.js';
import { getPendingPackingB2 } from '../services/sequences.js';

const router = Router();
router.use(requireAuth);

// Resumen de picking B2 por secuencia: una entrada por cada secuencia con
// flujo B2 abierto que tenga al menos un pedido con B2 pendiente.
// La página /picking lo usa para listar las tarjetas pendientes.
router.get('/summary', requireCap(WMS_CAPS.PACK_B2, WMS_CAPS.SUPERVISE), async (_req, res, next) => {
  try {
    const sequences = await prisma.sequence.findMany({
      where: { b2ClosedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          include: {
            order: {
              select: {
                id: true,
                hasB2Pending: true,
                b2ClosedAt: true,
                status: true,
              },
            },
          },
        },
      },
    });

    const result = sequences
      .map((s) => {
        const ordersWithB2 = s.orders
          .map((so) => so.order)
          .filter((o) => o.hasB2Pending && !['blocked', 'delivered'].includes(o.status));
        const totalOrders = ordersWithB2.length;
        const pendingOrders = ordersWithB2.filter((o) => !o.b2ClosedAt).length;
        return {
          sequenceId: s.id,
          createdAt: s.createdAt,
          totalOrders,
          pendingOrders,
        };
      })
      .filter((s) => s.totalOrders > 0);

    res.json({ sequences: result });
  } catch (err) {
    next(err);
  }
});

// Vista del día: lista TODOS los pedidos con B2 pendiente cruzando todas las
// secuencias abiertas + una tabla informativa con los productos B2 agrupados
// por SKU (para que el picker pueda recorrer la bodega una sola vez sabiendo
// el total que necesita de cada producto).
//
// Cada pedido sigue cerrándose por separado (link a su vista per-pedido).
// La tabla agrupada es SOLO informativa, no es un picking consolidado.
router.get('/today', requireCap(WMS_CAPS.PACK_B2, WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    // Si pasan processId, filtramos por proceso. Si no, mantiene compat con
    // el modo global (todas las secuencias abiertas).
    const processId = req.query.processId ? Number(req.query.processId) : null;
    const orders = await prisma.order.findMany({
      where: {
        hasB2Pending: true,
        b2ClosedAt: null,
        status: { in: ['sequenced', 'picked', 'packed', 'classified', 'loaded'] },
        sequenceLinks: {
          some: {
            sequence: {
              b2ClosedAt: null,
              ...(processId ? { processId } : {}),
            },
          },
        },
      },
      include: {
        items: {
          where: { warehouse: 'B2' },
          include: { product: true },
        },
        sequenceLinks: {
          include: { sequence: { select: { id: true, createdAt: true, processId: true } } },
        },
      },
      orderBy: [{ route: 'asc' }, { stopPosition: 'asc' }, { id: 'asc' }],
    });

    // Lista de pedidos para el listado de cards.
    const orderList = orders.map((o) => {
      const seqLink = o.sequenceLinks[0];
      const total = o.items.length;
      const pickedCount = o.items.filter((i) => i.pickedAt).length;
      return {
        id: o.id,
        number: o.number,
        customerName: o.customerName,
        shippingMethod: o.shippingMethod,
        route: o.route,
        stopPosition: o.stopPosition,
        status: o.status,
        itemCount: total,
        pickedCount,
        b2ClosedAt: o.b2ClosedAt,
        sequenceId: seqLink?.sequence.id ?? null,
        sequenceCreatedAt: seqLink?.sequence.createdAt ?? null,
      };
    });

    // Tabla informativa: por cada productId, sumar qty pendiente + lista de
    // pedidos que lo necesitan. Items ya pickeados no cuentan en el total
    // pendiente porque ya están en la sub-bolsa.
    const byProduct = new Map();
    for (const o of orders) {
      for (const it of o.items) {
        if (it.pickedAt) continue;
        const key = it.productId;
        if (!byProduct.has(key)) {
          byProduct.set(key, {
            productId: it.productId,
            sku: it.product?.sku ?? null,
            name: it.product?.name ?? `Producto ${it.productId}`,
            thumbnailUrl: it.product?.thumbnailUrl ?? null,
            totalQty: 0,
            orders: [],
          });
        }
        const row = byProduct.get(key);
        row.totalQty += it.qty;
        row.orders.push({ wpOrderId: o.wpOrderId, number: o.number, qty: it.qty });
      }
    }
    const summary = Array.from(byProduct.values()).sort((a, b) =>
      (a.sku || '').localeCompare(b.sku || '') || a.name.localeCompare(b.name),
    );

    res.json({ orders: orderList, summary });
  } catch (err) {
    next(err);
  }
});

// Lista de pedidos B2 pendientes en una secuencia (uno a uno, no agrupado).
router.get('/sequences/:id', requireCap(WMS_CAPS.PACK_B2, WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) throw new HttpError(400, 'Invalid sequence id');
    const orders = await getPendingPackingB2(id);
    const seq = await prisma.sequence.findUnique({
      where: { id },
      select: { id: true, createdAt: true, b2ClosedAt: true, status: true },
    });
    res.json({ sequence: seq, orders });
  } catch (err) {
    next(err);
  }
});

export default router;
