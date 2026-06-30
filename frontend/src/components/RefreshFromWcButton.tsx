import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { debugApi } from '@/lib/debug';

// Botón "Actualizar desde WC" para un pedido individual. Llama al endpoint
// /orders/by-wp/:wpOrderId/resync (mismo helper que dispara el webhook) que
// refresca ruta, parada, método de envío, conductor, vehículo, patente y
// datos del cliente (nombre, dirección, depto, comuna, teléfono, nota) desde
// WC. NO toca status, items ni timestamps WMS.
//
// Útil cuando el supervisor cambió algo en WC (ej. corrigió una ruta tras la
// asignación, o el cliente actualizó su dirección) y necesita reflejarlo en
// el WMS sin esperar a la próxima sincronización masiva.
export function RefreshFromWcButton({
  wpOrderId,
  orderIdLocal,
  size = 'md',
  variant = 'outline',
}: {
  wpOrderId: number;
  // Para invalidar la query del detalle del pedido tras actualizar.
  orderIdLocal?: number;
  size?: 'sm' | 'md';
  variant?: 'outline' | 'subtle';
}) {
  const queryClient = useQueryClient();
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const mut = useMutation({
    mutationFn: () => debugApi.resync(wpOrderId),
    onSuccess: () => {
      setMsg({ kind: 'ok', text: 'Pedido actualizado desde WC: ruta, parada, conductor, vehículo y datos del cliente.' });
      if (orderIdLocal) {
        queryClient.invalidateQueries({ queryKey: ['order', orderIdLocal] });
      }
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      queryClient.invalidateQueries({ queryKey: ['sequence'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'pending'] });
    },
    onError: (err: any) => {
      setMsg({ kind: 'err', text: err.response?.data?.message || err.message || 'No se pudo actualizar el pedido desde WC' });
    },
  });

  const sizeCls = size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs';
  const variantCls =
    variant === 'subtle'
      ? 'bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
      : 'bg-white text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50';

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => mut.mutate()}
        disabled={mut.isPending}
        className={`flex items-center justify-center gap-1.5 rounded-lg font-medium disabled:opacity-60 ${sizeCls} ${variantCls}`}
        title="Refresca ruta, parada, conductor, vehículo y datos del cliente desde WooCommerce. No toca items ni el estado del pedido."
      >
        <RefreshCw size={size === 'sm' ? 12 : 14} className={mut.isPending ? 'animate-spin' : ''} />
        {mut.isPending ? 'Actualizando…' : 'Actualizar desde WC'}
      </button>
      {msg && (
        <div
          className={`rounded-md px-2 py-1 text-[11px] ring-1 ${
            msg.kind === 'ok'
              ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
              : 'bg-red-50 text-red-700 ring-red-200'
          }`}
        >
          {msg.text}
        </div>
      )}
    </div>
  );
}
