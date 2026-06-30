import clsx from 'clsx';

// Mapea el slug WC al label legible. Los slugs viven en WC (admin de Pedidos);
// las etiquetas mostradas acá son lo que ve el cliente y el supervisor en
// WordPress. Si aparece un slug nuevo (estado custom), caemos al slug crudo.
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

// Color único por slug — paridad visual con OrderStatusBadge del lado WMS.
// La progresión va de tonos cálidos (atención/pago pendiente) a fríos
// (entrega completa) pasando por estados intermedios con tintes propios.
// Estados rotos (cancelled/refunded/failed) usan rojos/fucsias distintos
// entre sí para que el supervisor identifique de un vistazo qué tipo de
// problema es. Slug desconocido cae a slate.
const STYLES: Record<string, string> = {
  'pending':           'bg-rose-100    text-rose-800    ring-rose-200',
  'processing':        'bg-cyan-100    text-cyan-800    ring-cyan-200',
  'on-hold':           'bg-orange-100  text-orange-800  ring-orange-200',
  'completed':         'bg-emerald-100 text-emerald-800 ring-emerald-200',
  'cancelled':         'bg-red-100     text-red-800     ring-red-200',
  'refunded':          'bg-fuchsia-100 text-fuchsia-800 ring-fuchsia-200',
  'failed':            'bg-pink-100    text-pink-800    ring-pink-200',
  'en-preparacion':    'bg-green-100   text-green-800   ring-green-200',
  'en-ruta-pendiente': 'bg-indigo-100  text-indigo-800  ring-indigo-200',
  'en-ruta-express-y': 'bg-violet-100  text-violet-800  ring-violet-200',
  'entregado':         'bg-teal-100    text-teal-800    ring-teal-200',
};

export function WcStatusBadge({ slug }: { slug: string | null | undefined }) {
  if (!slug) return null;
  const label = WC_STATUS_LABELS[slug] || slug;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1',
        STYLES[slug] || 'bg-slate-100 text-slate-700 ring-slate-200',
      )}
    >
      WC: {label}
    </span>
  );
}
