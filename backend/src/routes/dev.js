import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { HttpError } from '../middleware/error.js';

const router = Router();

// Solo en development. Crea productos y pedidos sintéticos para probar
// el ciclo packing sin depender de WooCommerce.
router.post('/seed', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      throw new HttpError(403, 'Dev seed only available in NODE_ENV=development');
    }

    const adminWpUserId = Number(req.body?.adminWpUserId || 1);

    // Producto sintético con bodega.
    const products = [
      { wpProductId: 9001, sku: 'B1-CAJA', name: 'Caja chica', warehouse: 'B1' },
      { wpProductId: 9002, sku: 'B1-PAPEL', name: 'Resma papel A4', warehouse: 'B1' },
      { wpProductId: 9003, sku: 'B1-LAPIZ', name: 'Caja lápices x12', warehouse: 'B1' },
      { wpProductId: 9101, sku: 'B2-CARGADOR', name: 'Cargador USB-C 20W', warehouse: 'B2' },
      { wpProductId: 9102, sku: 'B2-CABLE', name: 'Cable USB-C 1m', warehouse: 'B2' },
    ];
    for (const p of products) {
      await prisma.productMeta.upsert({
        where: { wpProductId: p.wpProductId },
        create: { ...p, thumbnailUrl: null },
        update: { name: p.name, warehouse: p.warehouse },
      });
    }

    // Aseguramos un user en users_meta para FK (sequences.createdBy).
    await prisma.userMeta.upsert({
      where: { wpUserId: adminWpUserId },
      create: {
        wpUserId: adminWpUserId,
        username: 'seed-admin',
        displayName: 'Seed Admin',
        email: null,
        capabilities: {
          wms_pick_b1: true,
          wms_pack_b1: true,
          wms_pick_b2: true,
          wms_load: true,
          wms_deliver: true,
          wms_supervise: true,
        },
      },
      update: {},
    });

    // Pedidos sintéticos. El #5003 lleva B2 para probar la marca grande.
    const seedOrders = [
      { wpOrderId: 5001, number: '5001', route: 'R1', stopPosition: 1, customer: 'Ana Pérez', items: [{ id: 9001, q: 1 }, { id: 9002, q: 2 }] },
      { wpOrderId: 5002, number: '5002', route: 'R1', stopPosition: 2, customer: 'Luis Soto', items: [{ id: 9002, q: 1 }, { id: 9003, q: 3 }] },
      { wpOrderId: 5003, number: '5003', route: 'R2', stopPosition: 1, customer: 'María Ruiz', items: [{ id: 9001, q: 1 }, { id: 9101, q: 1 }, { id: 9102, q: 2 }] },
      { wpOrderId: 5004, number: '5004', route: 'R2', stopPosition: 2, customer: 'Pablo Gómez', items: [{ id: 9003, q: 2 }] },
    ];

    const created = [];
    for (const o of seedOrders) {
      const exists = await prisma.order.findUnique({ where: { wpOrderId: o.wpOrderId } });
      if (exists) continue;
      let hasB2 = false;
      const order = await prisma.order.create({
        data: {
          wpOrderId: o.wpOrderId,
          number: o.number,
          status: 'received',
          route: o.route,
          stopPosition: o.stopPosition,
          customerName: o.customer,
          customerAddress: 'Av. Demo 123, Santiago',
          items: {
            create: o.items.map((it) => {
              const prod = products.find((p) => p.wpProductId === it.id);
              if (prod?.warehouse === 'B2') hasB2 = true;
              return { productId: it.id, qty: it.q, warehouse: prod.warehouse };
            }),
          },
        },
      });
      await prisma.order.update({ where: { id: order.id }, data: { hasB2Pending: hasB2 } });
      created.push(order.wpOrderId);
    }

    res.json({ ok: true, productsSeeded: products.length, ordersCreated: created });
  } catch (err) {
    next(err);
  }
});

export default router;
