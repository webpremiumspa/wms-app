import { HttpError } from '../middleware/error.js';

// QR puede venir en dos formatos:
//   - URL navegable: https://wms.chimuelo.cl/scan/123 (nuevo)
//   - Legacy: WMS:123 (albaranes impresos antes del cambio)
// Esta función extrae el wpOrderId numérico de cualquiera de los dos.
export function parseQrPayload(raw) {
  if (typeof raw !== 'string' || raw.length === 0) {
    throw new HttpError(400, 'QR vacío');
  }
  const trimmed = raw.trim();

  // Formato URL nuevo: .../scan/<id>
  const urlMatch = trimmed.match(/\/scan\/(\d+)(?:[/?#]|$)/);
  if (urlMatch) return Number(urlMatch[1]);

  // Formato legacy WMS:<id>
  const wmsMatch = trimmed.match(/^WMS:(\d+)$/);
  if (wmsMatch) return Number(wmsMatch[1]);

  throw new HttpError(400, `QR no reconocido: "${trimmed.slice(0, 60)}"`);
}
