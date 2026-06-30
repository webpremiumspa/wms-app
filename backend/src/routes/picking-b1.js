import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireCap, WMS_CAPS } from '../middleware/capabilities.js';
import { prisma } from '../db/prisma.js';

const router = Router();
router.use(requireAuth);

// Vista del día por proceso para BODEGA 1: lista todos los pedidos con items B1
// del proceso (independiente de la secuencia) + tabla informativa con los
// productos B1 agrupados por SKU. Misma forma que /picking/b2/today, distinto
// warehouse.
//
// Importante: NO sustituye al packing por pedido. El cierre B1 sigue siendo
// "por albarán" desde PackingOrder. Esta tabla es solo guía para recorrer la
// bodega una vez sabiendo el total de cada producto.
router.get('/today', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const processId = req.query.processId ? Number(req.query.processId) : null;

    // Pedidos en estados "vivos" del proceso. Sin filtrar `hasB2Pending`:
    // queremos TODOS los pedidos con items B1 (la mayoría) — los que solo
    // tienen B2 no aparecen porque no tienen items B1 que mostrar.
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['sequenced', 'picked', 'packed', 'classified', 'loaded'] },
        sequenceLinks: {
          some: {
            sequence: processId ? { processId } : {},
          },
        },
        items: { some: { warehouse: 'B1' } },
      },
      include: {
        items: {
          where: { warehouse: 'B1' },
          include: { product: true },
        },
        sequenceLinks: {
          include: { sequence: { select: { id: true, createdAt: true, processId: true } } },
        },
      },
      orderBy: [
        // Empacados al final (para que la lista visible sean los pendientes).
        { packedAt: 'asc' },
        { route: 'asc' },
        { stopPosition: 'asc' },
        { id: 'asc' },
      ],
    });

    // Lista de pedidos para el listado de cards.
    const orderList = orders.map((o) => {
      const seqLink = o.sequenceLinks[0];
      const total = o.items.length;
      const pickedCount = o.items.filter((i) => i.pickedAt).length;
      // En B1 la noción de "cerrado" es packedAt (se cerró el packing), no
      // hay un closedAt aparte. Devolvemos packedAt como `b1ClosedAt` para que
      // el frontend reuse la misma forma que B2.
      return {
        id: o.id,
        wpOrderId: o.wpOrderId,
        number: o.number,
        customerName: o.customerName,
        shippingMethod: o.shippingMethod,
        route: o.route,
        stopPosition: o.stopPosition,
        status: o.status,
        itemCount: total,
        pickedCount,
        b1ClosedAt: o.packedAt,
        sequenceId: seqLink?.sequence.id ?? null,
        sequenceCreatedAt: seqLink?.sequence.createdAt ?? null,
      };
    });

    // Tabla agrupada por productId: para cada SKU B1 sumamos cantidades de
    // TODOS los pedidos visibles (cerrados/abiertos). Los cerrados aparecen
    // tachados pero no se esconden, así la tabla no se "achica" en paralelo.
    const byProduct = new Map();
    for (const o of orders) {
      for (const it of o.items) {
        const key = it.productId;
        if (!byProduct.has(key)) {
          byProduct.set(key, {
            productId: it.productId,
            sku: it.product?.sku ?? null,
            name: it.product?.name ?? `Producto ${it.productId}`,
            thumbnailUrl: it.product?.thumbnailUrl ?? null,
            totalQty: 0,
            pendingQty: 0,
            orders: [],
          });
        }
        const row = byProduct.get(key);
        row.totalQty += it.qty;
        if (!it.pickedAt) row.pendingQty += it.qty;
        row.orders.push({
          wpOrderId: o.wpOrderId,
          number: o.number,
          qty: it.qty,
          done: !!it.pickedAt,
        });
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

export default router;
