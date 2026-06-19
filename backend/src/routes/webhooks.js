import { Router } from 'express';
import crypto from 'node:crypto';
import { config } from '../config.js';
import { prisma } from '../db/prisma.js';
import { HttpError } from '../middleware/error.js';
import { syncOrder, updateOrderMetaFromWc } from '../services/orders-sync.js';

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

    if (existing) {
      await updateOrderMetaFromWc(wpId, payload);
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

export default router;
