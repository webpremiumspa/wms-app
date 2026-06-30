import { Router } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import { config } from '../config.js';
import { prisma } from '../db/prisma.js';
import { HttpError } from '../middleware/error.js';
import { syncOrder, syncProduct, updateOrderMetaFromWc } from '../services/orders-sync.js';

// Log temporal de webhooks para diagnosticar por qué los cambios en WC no
// se reflejan en el WMS. Cada entrega deja una línea en ~/wms-webhook.log con:
//   - timestamp
//   - topic + wpId
//   - shipping.address_1 / billing.address_1 / shipping.city / billing.city
//     que recibió en el payload
//   - lo que quedó guardado en BD después del update (customerAddress + city)
// Quitar este bloque una vez que esté diagnosticado.
const WEBHOOK_LOG = `${os.homedir()}/wms-webhook.log`;
function wlog(msg) {
  try {
    fs.appendFileSync(WEBHOOK_LOG, `${new Date().toISOString()} ${msg}\n`);
  } catch {
    /* nunca rompemos el webhook por un fallo de log */
  }
}

const router = Router();

function verifyWcSignature(rawBody, signature) {
  if (!config.wc.webhookSecret) return false;
  const expected = crypto
    .createHmac('sha256', config.wc.webhookSecret)
    .update(rawBody)
    .digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature || ''));
  } catch {
    return false;
  }
}

router.post('/wc/order', async (req, res, next) => {
  try {
    // WC's webhook.created "ping" usa application/x-www-form-urlencoded
    // (body = "webhook_id=N") y NO trae firma HMAC. Lo único que pide es
    // un 2xx para marcar el webhook como activo.
    const ctype = (req.header('content-type') || '').toLowerCase();
    if (!ctype.includes('application/json')) {
      return res.json({ ok: true, ping: true });
    }

    const raw = req.body;
    if (!Buffer.isBuffer(raw) || raw.length === 0) {
      return res.json({ ok: true, ping: true });
    }

    const sig = req.header('x-wc-webhook-signature');
    if (!verifyWcSignature(raw, sig)) throw new HttpError(401, 'Bad webhook signature');

    let payload;
    try {
      payload = JSON.parse(raw.toString('utf8'));
    } catch {
      throw new HttpError(400, 'Invalid JSON payload');
    }

    // Estrategia:
    //   - Si el pedido YA está en el WMS → update parcial de metadata
    //     (route/stopPosition/shippingMethod). Eso permite que la app externa
    //     de rutas asigne la ruta DESPUÉS del packing y se refleje sin importar
    //     el estado actual del pedido WC ni el "lock" del WMS.
    //   - Si no está en el WMS y el estado es 'en-preparacion' → syncOrder
    //     completo (crea el pedido).
    //   - Si no está en WMS y otro estado → ignoramos, no es para nosotros.
    const wpId = payload.id;
    const status = payload.status;
    const existing = await prisma.order.findUnique({
      where: { wpOrderId: wpId },
      select: { id: true, status: true },
    });

    // [DEBUG TEMPORAL] qué llegó del payload (solo los campos relevantes
    // para entender por qué no actualiza customerAddress).
    wlog(`order.updated wpId=${wpId} status=${status} existing=${existing ? existing.id : 'NO'} ship_a1="${payload.shipping?.address_1 ?? ''}" bill_a1="${payload.billing?.address_1 ?? ''}" ship_city="${payload.shipping?.city ?? ''}" bill_city="${payload.billing?.city ?? ''}"`);

    if (existing) {
      await updateOrderMetaFromWc(wpId, payload);
      // [DEBUG TEMPORAL] qué quedó en BD inmediatamente después del update.
      const after = await prisma.order.findUnique({
        where: { wpOrderId: wpId },
        select: { customerName: true, customerAddress: true, customerAddress2: true, customerCity: true, customerPhone: true, wcStatus: true },
      });
      wlog(`order.updated POST-UPDATE wpId=${wpId} db.customerAddress="${after?.customerAddress ?? ''}" db.customerCity="${after?.customerCity ?? ''}" db.customerName="${after?.customerName ?? ''}" db.wcStatus="${after?.wcStatus ?? ''}"`);
      return res.json({ ok: true, action: 'meta-updated', orderId: existing.id });
    }

    if (status === 'en-preparacion') {
      const order = await syncOrder(wpId, payload);
      return res.json({ ok: true, action: 'created', orderId: order.id, hasB2Pending: order.hasB2Pending });
    }

    res.json({ ok: true, ignored: true, status });
  } catch (err) {
    next(err);
  }
});

// Webhook de producto: WC dispara product.updated (y product.created) cuando
// se edita un producto en el admin. Lo escuchamos para que cambios en la meta
// `_wms_bodega` (B1/B2), el nombre, sku o imagen se reflejen en el WMS sin
// esperar al próximo sync masivo. Sin este webhook, el WMS quedaba con la
// bodega vieja cacheada en ProductMeta y los pedidos nuevos heredaban el
// valor obsoleto.
//
// Configuración WC: WooCommerce → Ajustes → Avanzado → Webhooks → Añadir
//   - Tema: "Producto actualizado" (y opcional: "Producto creado")
//   - URL: https://wms.chimuelo.cl/api/hooks/wc/product
//   - Versión API: WC API v3
//   - Secret: mismo que el de pedido (config.wc.webhookSecret)
router.post('/wc/product', async (req, res, next) => {
  try {
    // Ping de WC al crear el webhook: form-urlencoded sin firma. Devolvemos
    // 2xx para que WC marque el webhook como activo.
    const ctype = (req.header('content-type') || '').toLowerCase();
    if (!ctype.includes('application/json')) {
      return res.json({ ok: true, ping: true });
    }

    const raw = req.body;
    if (!Buffer.isBuffer(raw) || raw.length === 0) {
      return res.json({ ok: true, ping: true });
    }

    const sig = req.header('x-wc-webhook-signature');
    if (!verifyWcSignature(raw, sig)) throw new HttpError(401, 'Bad webhook signature');

    let payload;
    try {
      payload = JSON.parse(raw.toString('utf8'));
    } catch {
      throw new HttpError(400, 'Invalid JSON payload');
    }

    const wpProductId = payload.id;
    if (!Number.isInteger(wpProductId) || wpProductId <= 0) {
      return res.json({ ok: true, ignored: true, reason: 'invalid id' });
    }

    // syncProduct hace upsert con la meta de bodega normalizada desde el
    // payload — no hace una llamada adicional a WC porque ya tenemos el
    // producto completo en `payload`.
    const product = await syncProduct(wpProductId, payload);
    res.json({ ok: true, wpProductId, warehouse: product.warehouse });
  } catch (err) {
    next(err);
  }
});

export default router;
