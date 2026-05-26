import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';
import { requireAuth } from '../middleware/auth.js';
import { requireCap, WMS_CAPS } from '../middleware/capabilities.js';
import { HttpError } from '../middleware/error.js';
import { prisma } from '../db/prisma.js';
import { renderAlbaranPdf } from '../services/pdf.js';
import { wcGetProduct } from '../services/woocommerce.js';
import { config } from '../config.js';

const router = Router();
router.use(requireAuth);

// Borra todos los pedidos pendientes (status='received', sin haber entrado a
// secuencia). Útil cuando se importan con metadata vieja y conviene volver a
// sincronizar desde cero.
router.delete('/pending', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (_req, res, next) => {
  try {
    const result = await prisma.order.deleteMany({ where: { status: 'received' } });
    res.json({ deleted: result.count });
  } catch (err) {
    next(err);
  }
});

router.get('/pending', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const orders = await prisma.order.findMany({
      where: { status: 'received' },
      take: limit,
      orderBy: { createdAt: 'asc' },
      include: { items: true },
    });
    res.json({
      orders: orders.map((o) => ({
        id: o.id,
        wpOrderId: o.wpOrderId,
        number: o.number,
        customerName: o.customerName,
        route: o.route,
        hasB2Pending: o.hasB2Pending,
        itemCount: o.items.length,
        createdAt: o.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// Lookup por wpOrderId (el ID que viene del QR escaneado).
router.get('/by-wp/:wpOrderId', requireCap(WMS_CAPS.LOAD, WMS_CAPS.DELIVER, WMS_CAPS.SUPERVISE, WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const wpOrderId = Number(req.params.wpOrderId);
    if (!wpOrderId) throw new HttpError(400, 'Invalid wpOrderId');
    const order = await prisma.order.findUnique({
      where: { wpOrderId },
      include: {
        items: { include: { product: true } },
        packedBy: { select: { displayName: true, username: true } },
      },
    });
    if (!order) throw new HttpError(404, `Pedido ${wpOrderId} no encontrado en el WMS`);
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.PICK_B1, WMS_CAPS.SUPERVISE, WMS_CAPS.DELIVER, WMS_CAPS.LOAD), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        packedBy: { select: { displayName: true, username: true } },
      },
    });
    if (!order) throw new HttpError(404, 'Order not found');
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

const packSchema = z.object({
  // Puede venir vacío en pedidos que solo tienen items de Bodega 2 (no hay nada
  // que empacar físicamente desde B1, pero el pedido igual se cierra para
  // imprimir el albarán que lleva los items a sacar del granel).
  itemIds: z.array(z.number().int().positive()),
});

// Packing: el operador confirma los items B1 introducidos en la bolsa.
// El sistema bloquea si quedan items B1 sin marcar (optimización #8).
router.post('/:id/pack', requireCap(WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const parsed = packSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new HttpError(404, 'Order not found');
    if (order.status === 'packed') throw new HttpError(409, 'Order already packed');

    const b1Items = order.items.filter((i) => i.warehouse === 'B1');
    const required = new Set(b1Items.map((i) => i.id));
    const confirmed = new Set(parsed.data.itemIds);
    // Solo verificamos completitud si el pedido tiene items B1. Si solo tiene
    // B2, no hay nada que empacar y el pedido se cierra directo.
    if (b1Items.length > 0) {
      const missing = [...required].filter((x) => !confirmed.has(x));
      if (missing.length > 0) {
        throw new HttpError(409, 'All B1 items must be checked before packing', { missingItemIds: missing });
      }
    }

    const now = new Date();
    // Soporta modo 'by_order': si los items aún no tenían pickedAt (porque no
    // hubo paso previo de picking), lo seteamos ahora junto al packedAt.
    // Idempotente: no pisa pickedAt si ya estaba.
    const itemUpdates = confirmed.size > 0 ? [
      prisma.orderItem.updateMany({
        where: { id: { in: [...confirmed] }, orderId: id, pickedAt: null },
        data: { pickedAt: now },
      }),
      prisma.orderItem.updateMany({
        where: { id: { in: [...confirmed] }, orderId: id },
        data: { packedAt: now },
      }),
    ] : [];

    await prisma.$transaction([
      ...itemUpdates,
      prisma.order.update({
        where: { id },
        data: {
          status: 'packed',
          packedAt: now,
          packedById: req.user.wpUserId,
        },
      }),
      prisma.event.create({
        data: {
          type: 'order.packed',
          actorId: req.user.wpUserId,
          orderId: id,
          payload: { itemIds: [...confirmed], onlyB2: b1Items.length === 0 },
        },
      }),
    ]);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Diagnóstico de un producto: muestra qué dice WC + qué tenemos local. Útil
// para entender por qué un item sigue marcado como B1 cuando deberia ser B2.
router.get('/debug-product/:wpProductId', requireCap(WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const wpId = Number(req.params.wpProductId);
    if (!wpId) throw new HttpError(400, 'Invalid wpProductId');

    const local = await prisma.productMeta.findUnique({ where: { wpProductId: wpId } });
    let wc = null;
    let wcError = null;
    try {
      const data = await wcGetProduct(wpId);
      wc = {
        id: data.id,
        sku: data.sku,
        name: data.name,
        meta_data_count: (data.meta_data || []).length,
        meta_data: data.meta_data || [],
        warehouseMetaKey: config.meta.productWarehouse,
        warehouseMetaFound: (data.meta_data || []).find((m) => m.key === config.meta.productWarehouse) || null,
      };
    } catch (e) {
      wcError = e.message;
    }
    res.json({ wpProductId: wpId, configKey: config.meta.productWarehouse, local, wc, wcError });
  } catch (err) {
    next(err);
  }
});

// Endpoint de diagnóstico: para cada item de un pedido, reporta si tiene
// thumbnailUrl, si se puede fetchear, qué content-type y tamaño tiene, y si
// es JPEG/PNG. Útil para entender por qué las fotos aparecen vacías en el PDF.
router.get('/:id/debug-images', requireCap(WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new HttpError(404, 'Order not found');

    const results = [];
    for (const it of order.items) {
      const url = it.product?.thumbnailUrl;
      const row = {
        sku: it.product?.sku || null,
        name: it.product?.name || null,
        thumbnailUrl: url || null,
      };
      if (!url) {
        row.error = 'thumbnailUrl es null en BD (probable: producto sin imagen en WC o sync no la capturó)';
      } else {
        try {
          const r = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 8000,
            headers: { Accept: 'image/jpeg, image/png, image/*;q=0.8', 'User-Agent': 'WMS-Debug/1.0' },
            validateStatus: () => true,
          });
          const buf = Buffer.from(r.data);
          row.httpStatus = r.status;
          row.contentType = r.headers['content-type'] || null;
          row.sizeBytes = buf.length;
          row.firstBytesHex = buf.slice(0, 8).toString('hex');
          row.isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
          row.isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
          row.pdfkitCompatible = row.isPng || row.isJpeg;
        } catch (e) {
          row.error = e.message;
        }
      }
      results.push(row);
    }
    res.json({ orderId: order.id, number: order.number, items: results });
  } catch (err) {
    next(err);
  }
});

// Genera el albarán imprimible (PDF A4) con QR y, si corresponde,
// marca grande de "Bodega 2 pendiente" + listado de items B2.
router.get('/:id/albaran.pdf', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new HttpError(404, 'Order not found');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="albaran-${order.number}.pdf"`);
    await renderAlbaranPdf(order, res);
  } catch (err) {
    next(err);
  }
});

export default router;
