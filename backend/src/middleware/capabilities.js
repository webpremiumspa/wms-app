import { HttpError } from './error.js';

export const WMS_CAPS = Object.freeze({
  PICK_B1: 'wms_pick_b1',
  PACK_B1: 'wms_pack_b1',
  PICK_B2: 'wms_pick_b2',
  LOAD: 'wms_load',
  DELIVER: 'wms_deliver',
  SUPERVISE: 'wms_supervise',
});

export function hasCap(user, cap) {
  const caps = user?.capabilities;
  if (!caps) return false;
  if (Array.isArray(caps)) return caps.includes(cap);
  return Boolean(caps[cap]);
}

export function requireCap(...required) {
  return (req, _res, next) => {
    const ok = required.some((cap) => hasCap(req.user, cap));
    if (!ok) return next(new HttpError(403, `Requires capability: ${required.join(' or ')}`));
    next();
  };
}
