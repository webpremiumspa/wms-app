import { Router } from 'express';
import crypto from 'node:crypto';
import { config } from '../config.js';
import { HttpError } from '../middleware/error.js';
import { syncOrder } from '../services/orders-sync.js';

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

    const status = payload.status;
    if (!['processing', 'on-hold', 'completed'].includes(status)) {
      return res.json({ ok: true, ignored: true, status });
    }

    const order = await syncOrder(payload.id, payload);
    res.json({ ok: true, orderId: order.id, hasB2Pending: order.hasB2Pending });
  } catch (err) {
    next(err);
  }
});

export default router;
