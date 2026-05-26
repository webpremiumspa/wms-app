import axios from 'axios';
import { config } from '../config.js';
import { prisma } from '../db/prisma.js';
import { HttpError } from '../middleware/error.js';

const wp = axios.create({
  baseURL: config.wp.baseUrl,
  timeout: 15000,
  headers: {
    // User-Agent estándar; Cloudflare WAF a veces bloquea el default de axios.
    'User-Agent': 'Mozilla/5.0 (compatible; WMS-Chimuelo/1.0)',
    Accept: 'application/json',
  },
});

// Pide token al plugin JWT del WP. Devuelve { token, user_id, user_email, user_nicename, user_display_name }.
export async function wpLogin(username, password) {
  try {
    const { data } = await wp.post('/wp-json/jwt-auth/v1/token', { username, password });
    return data;
  } catch (err) {
    const status = err.response?.status || 502;
    const wpData = err.response?.data;
    const wpMessage = typeof wpData?.message === 'string' ? wpData.message.replace(/<[^>]+>/g, '') : null;
    const wpCode = wpData?.code || null;
    const contentType = err.response?.headers?.['content-type'] || null;
    const message = wpMessage
      ? `WP (${wpCode || status}): ${wpMessage}`
      : `WordPress auth failed (HTTP ${status}, content-type: ${contentType || 'unknown'}, url: ${config.wp.baseUrl}/wp-json/jwt-auth/v1/token)`;
    throw new HttpError(status === 403 ? 401 : status, message, { wpCode, wpStatus: status, contentType });
  }
}

// Trae el usuario con capabilities. Requiere context=edit y un token válido.
export async function wpFetchMe(token) {
  const { data } = await wp.get('/wp-json/wp/v2/users/me?context=edit', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

// Provisiona/actualiza el espejo local del usuario. Solo se guardan
// las capabilities relevantes al WMS para no inflar la BD.
const WMS_CAP_PREFIX = 'wms_';

export async function upsertUserFromWp(wpUser) {
  const allCaps = wpUser?.capabilities || {};
  const capabilities = Object.fromEntries(
    Object.entries(allCaps).filter(([k, v]) => v && k.startsWith(WMS_CAP_PREFIX)),
  );
  return prisma.userMeta.upsert({
    where: { wpUserId: wpUser.id },
    create: {
      wpUserId: wpUser.id,
      username: wpUser.slug || wpUser.username || `user-${wpUser.id}`,
      displayName: wpUser.name || wpUser.username || `user-${wpUser.id}`,
      email: wpUser.email || null,
      capabilities,
      lastLoginAt: new Date(),
    },
    update: {
      displayName: wpUser.name || undefined,
      email: wpUser.email || undefined,
      capabilities,
      lastLoginAt: new Date(),
    },
  });
}
