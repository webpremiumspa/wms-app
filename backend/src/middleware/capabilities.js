import { HttpError } from './error.js';

export const WMS_CAPS = Object.freeze({
  PACK_B1: 'wms_pack_b1', // picker + packer B1
  PACK_B2: 'wms_pack_b2', // picker + packer B2 (renombrado desde wms_pick_b2)
  LOAD: 'wms_load',       // operador de carga (clasificación + carga al vehículo)
  SUPERVISE: 'wms_supervise', // supervisor (dashboard + diagnóstico)
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
