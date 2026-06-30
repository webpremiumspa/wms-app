import clsx from 'clsx';
import { orderStatusLabel } from '@/lib/labels';
import type { OrderStatus } from '@/lib/types';

// Color distinto por estado para que el operador identifique de un vistazo
// dónde está cada pedido en el flujo. La progresión va de gris frío (apenas
// llegado) a verde (entregado) cruzando por azul/violeta/ámbar a medida que
// avanza. Bloqueado es el único rojo — siempre quiere atención.
const STYLES: Record<OrderStatus, string> = {
  received:   'bg-slate-100  text-slate-700  ring-slate-200',
  sequenced:  'bg-sky-100    text-sky-800    ring-sky-200',
  picked:     'bg-indigo-100 text-indigo-800 ring-indigo-200',
  packed:     'bg-blue-100   text-blue-800   ring-blue-200',
  classified: 'bg-amber-100  text-amber-800  ring-amber-200',
  loaded:     'bg-teal-100   text-teal-800   ring-teal-200',
  delivered:  'bg-emerald-100 text-emerald-800 ring-emerald-200',
  blocked:    'bg-red-100    text-red-800    ring-red-200',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1',
        STYLES[status] || 'bg-slate-100 text-slate-700 ring-slate-200',
      )}
    >
      {orderStatusLabel(status)}
    </span>
  );
}
