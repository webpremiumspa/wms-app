import clsx from 'clsx';
import { RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { DeliveryStatus, DeliveryMeta } from '@/lib/types';

// v0.25.9: chip que refleja el estado de entrega derivado de metas WDG.
// Aparece en listas de pedidos y en el detalle del pedido para que el
// operador sepa si un pedido ya fue entregado antes, entregado parcialmente
// o devuelto sin entregar (importante: si es 'returned', la bolsa B1 debe
// estar guardada en bodega — el picker no debe armar nueva).
export function DeliveryStatusBadge({
  status,
  meta,
  size = 'sm',
}: {
  status: DeliveryStatus | undefined;
  meta?: DeliveryMeta;
  size?: 'sm' | 'md';
}) {
  if (!status) return null;

  const isSm = size === 'sm';
  const baseClass = clsx(
    'inline-flex items-center gap-1 rounded-full font-semibold ring-1',
    isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
  );

  if (status === 'delivered') {
    return (
      <span
        className={clsx(baseClass, 'bg-emerald-100 text-emerald-800 ring-emerald-200')}
        title={meta?.by ? `Entregado por ${meta.by}${meta.date ? ` el ${meta.date}` : ''}` : 'Entregado'}
      >
        <CheckCircle2 size={isSm ? 12 : 14} />
        Entregado antes
      </span>
    );
  }

  if (status === 'partial') {
    return (
      <span
        className={clsx(baseClass, 'bg-amber-100 text-amber-900 ring-amber-200')}
        title={meta?.by ? `Entrega parcial por ${meta.by}${meta.date ? ` el ${meta.date}` : ''}` : 'Entrega parcial previa'}
      >
        <AlertTriangle size={isSm ? 12 : 14} />
        Entrega parcial previa
      </span>
    );
  }

  if (status === 'returned') {
    return (
      <span
        className={clsx(baseClass, 'bg-red-100 text-red-800 ring-red-300')}
        title="Este pedido fue devuelto sin entregar. La bolsa B1 debe estar guardada en bodega — verificar antes de armar una nueva."
      >
        <RotateCcw size={isSm ? 12 : 14} />
        Devuelto · buscar bolsa
      </span>
    );
  }

  return null;
}
