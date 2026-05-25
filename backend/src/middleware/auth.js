import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { prisma } from '../db/prisma.js';
import { HttpError } from './error.js';

// El plugin "JWT Authentication for WP REST API" firma con HS256 usando
// el secret de wp-config (JWT_AUTH_SECRET_KEY). El payload trae:
//   { iss, iat, nbf, exp, data: { user: { id, ... } } }
export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new HttpError(401, 'Missing bearer token');

    let payload;
    try {
      payload = jwt.verify(token, config.wp.jwtSecret, { algorithms: ['HS256'] });
    } catch {
      throw new HttpError(401, 'Invalid or expired token');
    }

    const wpUserId = Number(payload?.data?.user?.id);
    if (!wpUserId) throw new HttpError(401, 'Token missing user id');

    const user = await prisma.userMeta.findUnique({ where: { wpUserId } });
    if (!user || !user.active) throw new HttpError(403, 'User not provisioned in WMS');

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
}
