import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Image as ImageIcon, AlertOctagon, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { ordersApi } from '@/lib/sequences';
import { pickingB2Api } from '@/lib/dispatch';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { ShippingBadge } from '@/components/ShippingBadge';
import { CustomerNote } from '@/components/CustomerNote';
import { ProgressBar } from '@/components/ProgressBar';
import { ProgressHero } from '@/components/RouteProgressPills';
import { warehouseLabel } from '@/lib/labels';

export function PickingB2Order() {
  const { id, orderId } = useParams();
  const seqId = Number(id);
  const ordId = Number(orderId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', ordId],
    queryFn: () => ordersApi.get(ordId),
  });

  // Datos B2 de la secuencia para el widget de progreso. Se refresca para
  // reflejar pedidos que otros pickers van cerrando en paralelo.
  const { data: seqB2 } = useQuery({
    queryKey: ['picking-b2-sequence', seqId],
    queryFn: () => pickingB2Api.forSequence(seqId),
    refetchInterval: 4000,
  });

  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [packError, setPackError] = useState<string | null>(null);
  // Modal bloqueante: la secuencia es de hace más de 1 día.
  const [oldSeqModal, setOldSeqModal] = useState<{ createdAt: string } | null>(null);
  const [confirmedOldSeq, setConfirmedOldSeq] = useState(false);

  const currentSequence = order?.sequenceLinks?.find((l) => l.sequenceId === seqId)?.sequence;

  function isFromTodayOrYesterday(iso?: string): boolean {
    if (!iso) return true;
    const d = new Date(iso);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return d >= yesterday;
  }

  useEffect(() => {
    if (!order || !currentSequence) return;
    if (confirmedOldSeq) return;
    if (oldSeqModal) return;
    if (!isFromTodayOrYesterday(currentSequence.createdAt)) {
      setOldSeqModal({ createdAt: currentSequence.createdAt });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, currentSequence?.createdAt]);

  function acceptOldSequence() {
    setConfirmedOldSeq(true);
    setOldSeqModal(null);
  }
  function cancelOldSequence() {
    setOldSeqModal(null);
    navigate(`/sequences/${seqId}/picking-b2`);
  }

  useEffect(() => {
    if (!order) return;
    // Pre-marca items B2 que ya tienen pickedAt (re-entrada al pedido).
    const initial = new Set<number>();
    order.items.forEach((i) => {
      if (i.warehouse === 'B2' && i.pickedAt) initial.add(i.id);
    });
    setChecked(initial);
  }, [order]);

  const pack = useMutation({
    mutationFn: () => ordersApi.packB2(ordId, [...checked], confirmedOldSeq || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', ordId] });
      queryClient.invalidateQueries({ queryKey: ['picking-b2-sequence', seqId] });
      queryClient.invalidateQueries({ queryKey: ['picking-b2-summary'] });
      // El listado per-proceso usa key ['picking-b2-today', processId | 'global'].
      // Invalidamos todas las keys que empiecen con 'picking-b2-today' para
      // refrescar sin importar el processId.
      queryClient.invalidateQueries({ queryKey: ['picking-b2-today'] });
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      queryClient.invalidateQueries({ queryKey: ['process'] });
      // Volver al picking del proceso parent (si lo sabemos), conservando
      // el filtro de ruta del pedido recién cerrado (queda en `?route=`).
      // Si el pedido no tiene ruta, deja la lista en "Todas".
      const processId = order?.sequenceLinks?.find((l) => l.sequenceId === seqId)?.sequence?.processId;
      if (processId) {
        const routeQS = order?.route ? `?route=${encodeURIComponent(order.route)}` : '';
        navigate(`/processes/${processId}/picking-b2${routeQS}`);
      } else {
        navigate('/processes');
      }
    },
    onError: (err: any) => {
      setPackError(err.response?.data?.message || 'No se pudo cerrar B2 del pedido');
    },
  });

  const b2Items = useMemo(() => order?.items.filter((i) => i.warehouse === 'B2') || [], [order]);

  if (isLoading || !order) return <Spinner />;

  const isB2Closed = !!order.b2ClosedAt;
  const allChecked = b2Items.length === 0 || b2Items.every((i) => checked.has(i.id));

  function toggle(itemId: number) {
    setChecked((s) => {
      const next = new Set(s);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  return (
    <div className="space-y-4 pb-4">
      {(() => {
        const processId = order.sequenceLinks?.find((l) => l.sequenceId === seqId)?.sequence?.processId;
        // Mismo criterio que al cerrar: si vamos al per-proceso, llevamos
        // el filtro de ruta del pedido en `?route=`.
        const routeQS = order.route ? `?route=${encodeURIComponent(order.route)}` : '';
        const backTo = processId ? `/processes/${processId}/picking-b2${routeQS}` : '/processes';
        return (
          <Link to={backTo} className="btn-ghost text-sm">
            <ChevronLeft size={16} />
            Lista de pedidos
          </Link>
        );
      })()}

      {/* Widget grande de progreso de cierres B2 de la secuencia */}
      {seqB2 && (() => {
        const total = seqB2.orders.length;
        const done = seqB2.orders.filter((o) => !!o.b2ClosedAt).length;
        return (
          <ProgressHero
            title={`Secuencia #${seqId}`}
            done={done}
            total={total}
            verb={`${warehouseLabel('B2')} cerrados`}
          />
        );
      })()}

      <div className="card space-y-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-semibold">Pedido #{order.number}</span>
          {order.route && <Badge variant="blue">{order.route}</Badge>}
          {order.stopPosition != null && <Badge variant="gray">Parada {order.stopPosition}</Badge>}
          {order.allowPartialDelivery && <Badge variant="green">Entrega parcial aprobada</Badge>}
          <ShippingBadge method={order.shippingMethod} />
          {isB2Closed && <Badge variant="green">{warehouseLabel('B2')} cerrado</Badge>}
        </div>
        <div className="text-sm text-slate-600">{order.customerName || '—'}</div>
        {order.customerAddress && <div className="text-xs text-slate-500">{order.customerAddress}</div>}
        <CustomerNote note={order.customerNote} />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-200 pt-2 text-xs text-slate-500">
          {order.createdAt && (
            <span>
              Pedido del{' '}
              <strong className="text-slate-700">
                {new Date(order.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
              </strong>
            </span>
          )}
          {currentSequence && (
            <span>
              Secuencia <strong className="text-slate-700">#{currentSequence.id}</strong> · creada el{' '}
              <strong className="text-slate-700">
                {new Date(currentSequence.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
              </strong>
            </span>
          )}
        </div>
      </div>

      <div className="card flex items-start gap-3 bg-amber-50 p-4 ring-1 ring-amber-200">
        <AlertOctagon className="shrink-0 text-amber-700" />
        <div className="text-sm text-amber-900">
          <div className="font-semibold">Items a sacar del granel {warehouseLabel('B2')}</div>
          <div>
            Arma una <strong>sub-bolsa</strong> con estos items y átala a la bolsa {warehouseLabel('B1')} del pedido (o etiquétala con el número).
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">Items a recolectar ({warehouseLabel('B2')})</h3>
        <ProgressBar
          value={[...checked].filter((id) => b2Items.some((i) => i.id === id)).length}
          total={b2Items.length}
          label="Items confirmados"
        />
        {b2Items.map((it) => (
          <label
            key={it.id}
            className={clsx(
              'card flex items-center gap-3 p-3',
              checked.has(it.id) && 'bg-emerald-50/60 ring-1 ring-emerald-200',
            )}
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-amber-100">
              {it.product.thumbnailUrl ? (
                <img src={it.product.thumbnailUrl} alt={it.product.name} className="h-full w-full object-cover" />
              ) : (
                <ImageIcon size={20} className="text-amber-700" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium break-words">{it.lineName || it.product.name}</div>
              <div className="text-xs text-amber-700">{it.product.sku || '—'}</div>
            </div>
            <div className="text-lg font-bold text-amber-700">×{it.qty}</div>
            <input
              type="checkbox"
              checked={checked.has(it.id)}
              onChange={() => toggle(it.id)}
              className="ml-2 h-6 w-6 accent-amber-600"
              disabled={isB2Closed}
            />
          </label>
        ))}
      </div>

      {!isB2Closed && (
        <div className="sticky bottom-20 z-10 bg-slate-100 pt-2 md:bottom-0">
          {!allChecked && !order.allowPartialDelivery && (
            <div className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Falta marcar items {warehouseLabel('B2')}. No se puede cerrar el pedido hasta confirmar todos (a menos que tenga entrega parcial aprobada).
            </div>
          )}
          {packError && (
            <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">{packError}</div>
          )}
          <button
            onClick={() => { setPackError(null); pack.mutate(); }}
            disabled={(!allChecked && !order.allowPartialDelivery) || pack.isPending}
            className="btn-primary w-full"
          >
            <CheckCircle2 size={18} />
            {pack.isPending ? 'Cerrando…' : `Cerrar ${warehouseLabel('B2')} del pedido`}
          </button>
        </div>
      )}

      {isB2Closed && order.b2ClosedAt && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-200">
          {warehouseLabel('B2')} cerrado el {new Date(order.b2ClosedAt).toLocaleString('es-CL')}
          {order.b2ClosedBy && <> por {order.b2ClosedBy.displayName || order.b2ClosedBy.username}</>}.
        </div>
      )}

      {/* Modal bloqueante: secuencia antigua */}
      {oldSeqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md space-y-3 p-4">
            <div className="flex items-start gap-2">
              <AlertOctagon className="text-red-600" size={22} />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">Albarán de secuencia antigua</h3>
                <p className="mt-1 text-sm text-slate-700">
                  La secuencia <strong>#{currentSequence?.id}</strong> fue creada el{' '}
                  <strong>
                    {new Date(oldSeqModal.createdAt).toLocaleDateString('es-CL', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </strong>{' '}— no es de hoy ni de ayer.
                </p>
                <p className="mt-2 text-xs text-slate-600">
                  Verifica que el albarán sea el correcto antes de pickear. Si es un papel viejo reciclado, devuélvelo al supervisor.
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Si continúas, queda registrado en el log que pickeaste B2 desde una secuencia antigua.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={cancelOldSequence} className="btn-ghost border border-slate-300">
                Cancelar y volver
              </button>
              <button
                onClick={acceptOldSequence}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Continuar de todos modos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
