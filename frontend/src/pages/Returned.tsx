import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RotateCcw, AlertOctagon, ExternalLink, CheckCircle2 } from 'lucide-react';
import { ordersApi, type ReturnedOrder } from '@/lib/sequences';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { DeliveryStatusBadge } from '@/components/DeliveryStatusBadge';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { WcStatusBadge } from '@/components/WcStatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';

// v0.25.10: vista para SUPERVISE con los pedidos devueltos (WMS='loaded'
// sin metas WDG). Cada uno puede revivarse manualmente — el pedido pasa a
// 'received' con chip 'revived' para que reingrese al pool de secuenciación.
export function Returned() {
  const { user } = useAuth();
  const canSupervise = hasCap(user, CAPS.SUPERVISE);
  const queryClient = useQueryClient();
  const [confirmRevive, setConfirmRevive] = useState<ReturnedOrder | null>(null);
  const [reviveError, setReviveError] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', 'returned'],
    queryFn: () => ordersApi.listReturned(),
    enabled: canSupervise,
    refetchInterval: 15_000,
  });

  const revive = useMutation({
    mutationFn: (id: number) => ordersApi.reviveFromReturn(id),
    onSuccess: () => {
      setConfirmRevive(null);
      setReviveError(null);
      queryClient.invalidateQueries({ queryKey: ['orders', 'returned'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'pending'] });
    },
    onError: (err: any) => {
      setReviveError(err.response?.data?.message || 'No se pudo revivir el pedido');
    },
  });

  if (!canSupervise) {
    return (
      <div className="card p-4 text-sm text-slate-600">
        Esta vista requiere el rol de <strong>Supervisor</strong>.
      </div>
    );
  }

  if (isLoading) return <Spinner />;

  const list = orders || [];

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h1 className="text-lg font-semibold">Pedidos devueltos</h1>
        <p className="mt-1 text-xs text-slate-500">
          Pedidos cargados al vehículo que volvieron a bodega sin ser entregados. Su bolsa B1
          debe estar guardada con el albarán pegado. Revívelos manualmente cuando el
          sistema de rutas los reagende para que reingresen al pool de armado de secuencias.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="card p-6 text-center text-sm text-slate-500">
          <CheckCircle2 size={28} className="mx-auto text-emerald-500" />
          <div className="mt-2">Sin pedidos devueltos pendientes de revive.</div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs text-slate-600">
            {list.length} pedido{list.length === 1 ? '' : 's'} pendiente{list.length === 1 ? '' : 's'} de revive.
          </div>
          {list.map((o) => (
            <div key={o.id} className="card space-y-2 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">#{o.number}</span>
                {o.route && <Badge variant="blue">{o.route}</Badge>}
                {o.stopPosition != null && <Badge variant="gray">Parada {o.stopPosition}</Badge>}
                <OrderStatusBadge status={o.status} />
                <WcStatusBadge slug={o.wcStatus} />
                <DeliveryStatusBadge status={o.deliveryStatus} meta={o.deliveryMeta} />
              </div>
              <div className="text-xs text-slate-600">
                {o.customerName || '—'}
                {o.customerCity ? ` · ${o.customerCity}` : ''}
              </div>
              <div className="text-[11px] text-slate-500">
                Cargado: {o.loadedAt ? new Date(o.loadedAt).toLocaleString('es-CL') : '—'}
                {o.sequenceLinks[0]?.processName && (
                  <> · Proceso: <strong>{o.sequenceLinks[0].processName}</strong></>
                )}
                {o.sequenceLinks[0]?.sequenceId && (
                  <> · Secuencia #{o.sequenceLinks[0].sequenceId}</>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Link
                  to={`/tracking?q=${o.wpOrderId}`}
                  className="btn-ghost text-xs"
                >
                  <ExternalLink size={12} />
                  Ver seguimiento
                </Link>
                <button
                  type="button"
                  onClick={() => { setReviveError(null); setConfirmRevive(o); }}
                  disabled={revive.isPending}
                  className="flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-60"
                >
                  <RotateCcw size={12} />
                  Revivir pedido
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmRevive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md space-y-3 p-4">
            <div className="flex items-start gap-2">
              <AlertOctagon className="text-sky-600" size={22} />
              <div className="flex-1">
                <h3 className="font-semibold">¿Revivir pedido #{confirmRevive.number}?</h3>
                <p className="mt-1 text-sm text-slate-700">
                  El pedido volverá al pool de <strong>En secuencia</strong> para re-armar secuencia.
                  Se aplicará lo siguiente:
                </p>
                <ul className="mt-1 list-disc pl-5 text-xs text-slate-600">
                  <li>Pasa de <strong>Cargado</strong> a <strong>En preparación</strong> ({`status='received'`}).</li>
                  <li>Se borran los timestamps de picking, empaque, clasificación y carga.</li>
                  <li>Se limpian los registros de bultos (bag events) y el plan de empaque anterior.</li>
                  <li>Los items vuelven a estado sin marcar.</li>
                  <li>El chip pasa a <strong>Retomado</strong> (color celeste) para dejar rastro histórico.</li>
                </ul>
                <p className="mt-2 text-xs text-slate-500">
                  Verifica antes que la bolsa B1 original esté guardada en bodega. Al re-empacar,
                  el picker verá un banner con esta información.
                </p>
                {reviveError && (
                  <div className="mt-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-700">{reviveError}</div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmRevive(null)}
                disabled={revive.isPending}
                className="btn-ghost border border-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => revive.mutate(confirmRevive.id)}
                disabled={revive.isPending}
                className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
              >
                {revive.isPending ? 'Revivendo…' : 'Sí, revivir pedido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
