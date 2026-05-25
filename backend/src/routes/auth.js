import { Router } from 'express';
import { z } from 'zod';
import { wpLogin, wpFetchMe, upsertUserFromWp } from '../services/wordpress.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());

    const { username, password } = parsed.data;
    const wpAuth = await wpLogin(username, password);
    const me = await wpFetchMe(wpAuth.token);
    const user = await upsertUserFromWp(me);

    const wmsCaps = Object.keys(user.capabilities || {});
    if (wmsCaps.length === 0) {
      throw new HttpError(403, 'User has no WMS capabilities assigned');
    }

    res.json({
      token: wpAuth.token,
      user: {
        id: user.wpUserId,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        capabilities: user.capabilities,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({
    user: {
      id: req.user.wpUserId,
      username: req.user.username,
      displayName: req.user.displayName,
      email: req.user.email,
      capabilities: req.user.capabilities,
    },
  });
});

export default router;
