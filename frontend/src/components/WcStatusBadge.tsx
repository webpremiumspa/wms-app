import { Badge } from './Badge';

// Mapea el slug WC al label legible. Los slugs viven en WC (admin de Pedidos);
// los etiquetas mostradas acá son lo que ve el cliente y el supervisor en
// WordPress. Si aparecen slugs nuevos (estados custom), caemos al slug crudo.
const WC_STATUS_LABELS: Record<string, string> = {
  'pending': 'Pago pendiente',
  'processing': 'Procesando',
  'on-hold': 'En espera',
  'completed': 'Completado',
  'cancelled': 'Cancelado',
  'refunded': 'Reembolsado',
  'failed': 'Fallido',
  'en-preparacion': 'En preparación',
  'en-ruta-pendiente': 'En ruta pendiente',
  'en-ruta-express-y': 'En ruta express',
  'entregado': 'Entregado',
};

// Color del chip por slug. La regla es contextual:
//   verde  → estados "todo OK / listo" (completed, en-preparacion, entregado)
//   azul   → estados "en marcha" (processing, en-ruta-*)
//   ámbar  → estados que requieren atención (on-hold, pending)
//   rojo   → estados que detuvieron el flujo (cancelled, refunded, failed)
function variantFor(slug: string): 'green' | 'blue' | 'amber' | 'red' | 'gray' {
  if (['completed', 'en-preparacion', 'entregado'].includes(slug)) return 'green';
  if (['processing', 'en-ruta-pendiente', 'en-ruta-express-y'].includes(slug)) return 'blue';
  if (['on-hold', 'pending'].includes(slug)) return 'amber';
  if (['cancelled', 'refunded', 'failed'].includes(slug)) return 'red';
  return 'gray';
}

export function WcStatusBadge({ slug }: { slug: string | null | undefined }) {
  if (!slug) return null;
  const label = WC_STATUS_LABELS[slug] || slug;
  return (
    <Badge variant={variantFor(slug)}>
      WC: {label}
    </Badge>
  );
}
