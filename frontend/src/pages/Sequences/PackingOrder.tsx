import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Image as ImageIcon, Printer, AlertOctagon, UserX, CheckCircle2, Lock, User } from 'lucide-react';
import clsx from 'clsx';
import { ordersApi, sequencesApi } from '@/lib/sequences';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { ProgressBar } from '@/components/ProgressBar';
import { RemoveOrderModal } from '@/components/RemoveOrderModal';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';

export function PackingOrder() {
  const { id, orderId } = useParams();
  const seqId = Number(id);
  const ordId = Number(orderId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canManage = hasCap(user, CAPS.PACK_B1) || hasCap(user, CAPS.SUPERVISE);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', ordId],
    queryFn: () => ordersApi.get(ordId),
  });

  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [partialNote, setPartialNote] = useState('');
  const [partialError, setPartialError] = useState<string | null>(null);
  const [showPartialForm, setShowPartialForm] = useState(false);
  const [claimBlock, setClaimBlock] = useState<{ pickedBy?: { displayName?: string; username?: string }; claimedAt?: string } | null>(null);

  // Intentamos tomar (claim) el pedido al entrar a esta pantalla. Si ya está
  // tomado por otro picker, el backend devuelve 409 y mostramos el bloqueo.
  // Si está empacado/clasificado/cargado/entregado, el claim no aplica.
  const claim = useMutation({
    mutationFn: () => ordersApi.claim(ordId),
    onSuccess: () => {
      setClaimBlock(null);
      queryClient.invalidateQueries({ queryKey: ['order', ordId] });
      queryClient.invalidateQueries({ queryKey: ['sequence', seqId, 'pending-packing'] });
    },
    onError: (err: any) => {
      const details = err.response?.data?.details;
      if (err.response?.status === 409 && details?.claimedBy) {
        setClaimBlock({ pickedBy: details.claimedBy, claimedAt: details.claimedAt });
      }
    },
  });

  // Solo claim si el pedido está en 'sequenced' (estado claim-able). El backend
  // valida también, pero evitamos llamadas innecesarias.
  useEffect(() => {
    if (!order) return;
    if (order.status !== 'sequenced') return;
    // Si ya es del propio usuario o nadie lo tiene, llamamos al claim (es
    // idempotente y registra evento solo si cambia el estado).
    if (order.pickedBy && order.pickedBy.wpUserId !== user?.id) {
      // ya tomado por otro — mostramos bloqueo sin intentar claim.
      setClaimBlock({
        pickedBy: { displayName: order.pickedBy.displayName, username: order.pickedBy.username },
        claimedAt: order.claimedAt || undefined,
      });
      return;
    }
    claim.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, order?.status, order?.pickedBy?.wpUserId]);

  const releaseClaim = useMutation({
    mutationFn: () => ordersApi.releaseClaim(ordId),
    onSuccess: () => {
      setClaimBlock(null);
      claim.mutate();
    },
  });

  const removeOrder = useMutation({
    mutationFn: ({ reasonCode, reasonText }: { reasonCode: string; reasonText: string }) =>
      sequencesApi.removeOrder(seqId, ordId, reasonCode, reasonText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequence', seqId, 'pending-packing'] });
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      navigate(`/sequences/${seqId}/packing`);
    },
    onError: (err: any) => setRemoveError(err.response?.data?.message || 'No se pudo remover el pedido'),
  });

  const approvePartial = useMutation({
    mutationFn: (note: string) => ordersApi.approvePartialDelivery(ordId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', ordId] });
      setShowPartialForm(false);
      setPartialNote('');
      setPartialError(null);
    },
    onError: (err: any) => setPartialError(err.response?.data?.message || 'No se pudo aprobar la entrega parcial'),
  });

  const revokePartial = useMutation({
    mutationFn: () => ordersApi.revokePartialDelivery(ordId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order', ordId] }),
  });

  useEffect(() => {
    if (!order) return;
    // Pre-marca items que ya tienen packedAt (re-entrada al pedido).
    const initial = new Set<number>();
    order.items.forEach((i) => { if (i.packedAt) initial.add(i.id); });
    setChecked(initial);
  }, [order]);

  const pack = useMutation({
    mutationFn: () => ordersApi.pack(ordId, [...checked]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', ordId] });
      queryClient.invalidateQueries({ queryKey: ['sequence', seqId, 'pending-packing'] });
      navigate(`/sequences/${seqId}/packing`);
    },
  });

  const b1Items = useMemo(() => order?.items.filter((i) => i.warehouse === 'B1') || [], [order]);
  const b2Items = useMemo(() => order?.items.filter((i) => i.warehouse === 'B2') || [], [order]);

  if (isLoading || !order) return <Spinner />;

  // Si no hay items B1, el pedido se cierra sin pedir checkboxes (solo B2 a granel).
  const allChecked = b1Items.length === 0 || b1Items.every((i) => checked.has(i.id));
  const onlyB2 = b1Items.length === 0;
  const isPacked = order.status === 'packed' || order.status === 'classified' || order.status === 'loaded' || order.status === 'delivered';

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
      <Link to={`/sequences/${seqId}/packing`} className="btn-ghost text-sm">
        <ChevronLeft size={16} />
        Lista de pedidos
      </Link>

      <div className="card space-y-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-semibold">Pedido #{order.number}</span>
          {order.route && <Badge variant="blue">{order.route}</Badge>}
          {order.stopPosition != null && <Badge variant="gray">Parada {order.stopPosition}</Badge>}
          {order.hasB2Pending && <Badge variant="amber">Bodega 2 pendiente</Badge>}
          {order.allowPartialDelivery && <Badge variant="green">Entrega parcial aprobada</Badge>}
          {isPacked && <Badge variant="green">Empacado</Badge>}
        </div>
        <div className="text-sm text-slate-600">{order.customerName || '—'}</div>
        {order.customerAddress && <div className="text-xs text-slate-500">{order.customerAddress}</div>}
      </div>

      {/* Bloqueo por claim: si el pedido ya está tomado por OTRO picker,
          mostramos quién y desactivamos la UI. Supervisor puede liberar. */}
      {claimBlock && (
        <div className="card flex items-start gap-3 bg-red-50 p-4 ring-2 ring-red-300">
          <Lock className="shrink-0 text-red-700" size={22} />
          <div className="flex-1 text-sm text-red-900">
            <div className="font-bold uppercase">Pedido tomado por otro picker</div>
            <div className="mt-1">
              Lo está preparando <strong>{claimBlock.pickedBy?.displayName || claimBlock.pickedBy?.username || 'otro usuario'}</strong>
              {claimBlock.claimedAt && (
                <> desde las {new Date(claimBlock.claimedAt).toLocaleTimeString('es-CL')}</>
              )}.
            </div>
            <div className="mt-1 text-xs">
              No podés modificar este pedido hasta que el picker lo cierre o un supervisor libere el claim.
            </div>
            {canManage && hasCap(user, CAPS.SUPERVISE) && (
              <button
                type="button"
                onClick={() => releaseClaim.mutate()}
                disabled={releaseClaim.isPending}
                className="mt-2 rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-200"
              >
                {releaseClaim.isPending ? 'Liberando…' : 'Liberar claim (supervisor)'}
              </button>
            )}
          </div>
        </div>
      )}

      {order.pickedBy && order.pickedBy.wpUserId === user?.id && order.status === 'sequenced' && !claimBlock && (
        <div className="card flex items-start gap-3 bg-emerald-50 p-3 ring-1 ring-emerald-200">
          <User className="shrink-0 text-emerald-700" size={16} />
          <div className="flex-1 text-xs text-emerald-900">
            <span className="font-semibold">Tomaste este pedido</span>
            {order.claimedAt && <> a las {new Date(order.claimedAt).toLocaleTimeString('es-CL')}</>}. Empacalo y cerralo; queda registrado a tu nombre.
          </div>
        </div>
      )}

      {order.allowPartialDelivery && (
        <div className="card flex items-start gap-3 bg-emerald-50 p-3 ring-1 ring-emerald-200">
          <CheckCircle2 className="shrink-0 text-emerald-700" size={18} />
          <div className="flex-1 text-sm text-emerald-900">
            <div className="font-semibold">Entrega parcial aprobada</div>
            {order.partialDeliveryNote && <div className="text-xs">{order.partialDeliveryNote}</div>}
            <div className="text-xs">El pedido se puede cargar al vehículo aunque falten items B2 al momento de la entrega.</div>
          </div>
          {canManage && !isPacked && (
            <button
              type="button"
              onClick={() => revokePartial.mutate()}
              disabled={revokePartial.isPending}
              className="shrink-0 text-xs text-emerald-700 underline"
            >
              Revocar
            </button>
          )}
        </div>
      )}

      {order.hasB2Pending && (
        <div className="card flex items-start gap-3 bg-amber-50 p-4 ring-1 ring-amber-200">
          <AlertOctagon className="shrink-0 text-amber-700" />
          <div className="text-sm text-amber-900">
            <div className="font-semibold">Este pedido tiene productos de Bodega 2.</div>
            <div>Solo empaca los items <strong>B1</strong> en la bolsa. Los B2 quedan listados en el albarán para retirar del cargamento a granel en cada entrega.</div>
          </div>
        </div>
      )}

      {onlyB2 ? (
        <div className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-700 ring-1 ring-slate-200">
          Este pedido <strong>no tiene items de Bodega 1</strong>. No hay nada que empacar físicamente en la bolsa — el albarán se imprime para que el repartidor tome todo desde el cargamento a granel de Bodega 2.
        </div>
      ) : null}

      <div className={onlyB2 ? 'hidden' : 'space-y-2'}>
        <h3 className="text-sm font-semibold text-slate-700">Items a empacar (Bodega 1)</h3>
        <ProgressBar value={[...checked].filter((id) => b1Items.some((i) => i.id === id)).length} total={b1Items.length} label="Items confirmados" />
        {b1Items.map((it) => (
          <label
            key={it.id}
            className={clsx(
              'card flex items-center gap-3 p-3',
              checked.has(it.id) && 'bg-emerald-50/60 ring-1 ring-emerald-200',
            )}
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
              {it.product.thumbnailUrl ? (
                <img src={it.product.thumbnailUrl} alt={it.product.name} className="h-full w-full object-cover" />
              ) : (
                <ImageIcon size={20} className="text-slate-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{it.product.name}</div>
              <div className="text-xs text-slate-500">{it.product.sku || '—'}</div>
            </div>
            <div className="text-lg font-bold text-brand-700">×{it.qty}</div>
            <input
              type="checkbox"
              checked={checked.has(it.id)}
              onChange={() => toggle(it.id)}
              className="ml-2 h-6 w-6 accent-brand-600"
              disabled={isPacked || !!claimBlock}
            />
          </label>
        ))}
      </div>

      {b2Items.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-amber-800">A granel desde Bodega 2 (no empacar aquí)</h3>
          {b2Items.map((it) => (
            <div key={it.id} className="card flex items-center gap-3 bg-amber-50/50 p-3 ring-1 ring-amber-200">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-amber-100">
                {it.product.thumbnailUrl ? (
                  <img src={it.product.thumbnailUrl} alt={it.product.name} className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon size={18} className="text-amber-700" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{it.product.name}</div>
                <div className="text-xs text-amber-700">{it.product.sku || '—'}</div>
              </div>
              <div className="font-bold text-amber-800">×{it.qty}</div>
            </div>
          ))}
        </div>
      )}

      {!isPacked && (
        <div className="sticky bottom-20 z-10 bg-slate-100 pt-2 md:bottom-0">
          {!onlyB2 && !allChecked && (
            <div className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Falta marcar items B1. No se puede cerrar el pedido hasta confirmar todos.
            </div>
          )}
          <button
            onClick={() => pack.mutate()}
            disabled={!allChecked || pack.isPending || !!claimBlock}
            className="btn-primary w-full"
          >
            <CheckCircle2 size={18} />
            {pack.isPending ? 'Cerrando…' : 'Cerrar pedido'}
          </button>
        </div>
      )}

      {isPacked && (
        <button
          type="button"
          onClick={() => ordersApi.openAlbaran(ordId).catch((e) => console.error(e))}
          className="btn-ghost w-full border border-slate-300"
        >
          <Printer size={18} />
          Reimprimir albarán
        </button>
      )}

      {canManage && !isPacked && (
        <div className="card space-y-3 border-dashed bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Acciones del operador</div>
          <button
            type="button"
            onClick={() => { setRemoveError(null); setRemoveOpen(true); }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-100"
          >
            <UserX size={14} />
            Remover de la secuencia (sin stock / dañado / cancelado)
          </button>

          {order.hasB2Pending && !order.allowPartialDelivery && (
            <>
              {!showPartialForm ? (
                <button
                  type="button"
                  onClick={() => { setPartialError(null); setShowPartialForm(true); }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100"
                >
                  <CheckCircle2 size={14} />
                  Aprobar entrega parcial (cliente acepta sin items B2)
                </button>
              ) : (
                <div className="space-y-2 rounded-lg bg-white p-3 ring-1 ring-emerald-200">
                  <div className="text-xs font-medium text-slate-700">
                    Confirmá la nota (queda registrada en el log)
                  </div>
                  <textarea
                    value={partialNote}
                    onChange={(e) => setPartialNote(e.target.value)}
                    placeholder="Ej: Cliente aceptó por WhatsApp 14:30. Faltante se entrega el lunes."
                    rows={2}
                    className="input text-sm"
                    maxLength={500}
                  />
                  {partialError && (
                    <div className="rounded bg-red-50 px-2 py-1 text-xs text-red-700">{partialError}</div>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowPartialForm(false); setPartialNote(''); }}
                      className="text-xs text-slate-600 hover:underline"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => approvePartial.mutate(partialNote)}
                      disabled={approvePartial.isPending}
                      className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {approvePartial.isPending ? 'Aprobando…' : 'Confirmar aprobación'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <RemoveOrderModal
        open={removeOpen}
        orderNumber={order.number}
        onClose={() => { setRemoveOpen(false); setRemoveError(null); }}
        onConfirm={(reasonCode, reasonText) => removeOrder.mutate({ reasonCode, reasonText })}
        isPending={removeOrder.isPending}
        error={removeError}
      />
    </div>
  );
}
