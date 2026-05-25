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
    const sig = req.header('x-wc-webhook-signature');
    const raw = req.body; // Buffer (express.raw)
    if (!verifyWcSignature(raw, sig)) throw new HttpError(401, 'Bad webhook signature');

    const payload = JSON.parse(raw.toString('utf8'));

    // WC dispara webhooks por varios estados; nos quedamos con los que importan
    // al WMS (processing/on-hold/completed). Ignoramos cancelled/refunded.
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
