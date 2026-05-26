import { HttpError } from '../middleware/error.js';

// QR contiene "WMS:<wpOrderId>" — generado en services/pdf.js al imprimir albarán.
// Esta función valida y extrae el wpOrderId numérico.
export function parseQrPayload(raw) {
  if (typeof raw !== 'string' || raw.length === 0) {
    throw new HttpError(400, 'QR vacío');
  }
  const trimmed = raw.trim();
  const match = trimmed.match(/^WMS:(\d+)$/);
  if (!match) {
    throw new HttpError(400, `QR no es del WMS: "${trimmed.slice(0, 40)}"`);
  }
  return Number(match[1]);
}
