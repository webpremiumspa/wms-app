import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Image as ImageIcon, Printer, AlertOctagon, UserX, CheckCircle2, RotateCcw, User } from 'lucide-react';
import clsx from 'clsx';
import { ordersApi, sequencesApi } from '@/lib/sequences';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { ShippingBadge } from '@/components/ShippingBadge';
import { CustomerNote } from '@/components/CustomerNote';
import { CustomerBlock } from '@/components/CustomerBlock';
import { ProgressBar } from '@/components/ProgressBar';
import { ProgressHero } from '@/components/RouteProgressPills';
import { RemoveOrderModal } from '@/components/RemoveOrderModal';
import { BagsStepper } from '@/components/BagsStepper';
import { ConfirmBagsModal } from '@/components/ConfirmBagsModal';
import { useAuth } from '@/hooks/useAuth';
import { warehouseLabel } from '@/lib/labels';
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

  // Datos de la secuencia para el widget de progreso. Se refresca para
  // reflejar pedidos que otros pickers van cerrando en paralelo.
  const { data: seqData } = useQuery({
    queryKey: ['sequence', seqId],
    queryFn: () => sequencesApi.get(seqId),
    refetchInterval: 4000,
  });

  const [checked, setChecked] = useState<Set<number>>(new Set());
  // Cantidad de bultos físicos. Se inicia en 1 (caso más común) y el picker
  // sube cuando el contenido no entra en una sola bolsa. Tras empaque, la UI
  // sincroniza con order.bagsExpected y permite editar para reimprimir.
  const [bagsCount, setBagsCount] = useState(1);
  const [bagsError, setBagsError] = useState<string | null>(null);
  // Modales de confirmación de bultos (evita errores por tap accidental).
  // - confirmPackBags: antes de cerrar el pedido con N>1.
  // - confirmReprintBags: antes de actualizar y reimprimir con N distinto al guardado.
  const [confirmPackBags, setConfirmPackBags] = useState(false);
  const [confirmReprintBags, setConfirmReprintBags] = useState(false);
  // Desempacar: revierte un pedido cerrado por error/prueba al estado
  // 'sequenced' para que pueda volver a tomarse.
  const [confirmUnpack, setConfirmUnpack] = useState(false);
  const [unpackError, setUnpackError] = useState<string | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [partialNote, setPartialNote] = useState('');
  const [partialError, setPartialError] = useState<string | null>(null);
  const [showPartialForm, setShowPartialForm] = useState(false);
  const [packError, setPackError] = useState<string | null>(null);
  const [reassignedFrom, setReassignedFrom] = useState<{ displayName?: string; username?: string } | null>(null);
  // Confirmación previa cuando el pedido ya está tomado por OTRO picker:
  // antes de reasignar, mostramos un modal "¿tomarlo igual?". Solo si el
  // usuario confirma se ejecuta el claim.
  const [confirmTakeOver, setConfirmTakeOver] = useState<{
    displayName?: string;
    username?: string;
    claimedAt?: string;
  } | null>(null);
  // Si la secuencia es de hace más de 1 día, mostramos un modal bloqueante
  // ("¿estás seguro? este albarán podría ser viejo reciclado"). El picker
  // tiene que confirmar explícitamente; queda registrado en eventos.
  const [oldSeqModal, setOldSeqModal] = useState<{ createdAt: string } | null>(null);
  const [confirmedOldSeq, setConfirmedOldSeq] = useState(false);

  const claim = useMutation({
    mutationFn: () => ordersApi.claim(ordId),
    onSuccess: (data) => {
      if (data.reassignedFrom) {
        setReassignedFrom({
          displayName: data.reassignedFrom.displayName,
          username: data.reassignedFrom.username,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['order', ordId] });
      queryClient.invalidateQueries({ queryKey: ['sequence', seqId, 'pending-packing'] });
    },
  });

  // Busca la secuencia actual entre los links del pedido. Es la que está en
  // el seqId de la URL (la que el picker decidió procesar).
  const currentSequence = order?.sequenceLinks?.find((l) => l.sequenceId === seqId)?.sequence;

  // Chequea si una fecha cae HOY o AYER (por día calendario, no por 24h).
  function isFromTodayOrYesterday(iso?: string): boolean {
    if (!iso) return true; // sin fecha → no podemos juzgar, no bloqueamos
    const d = new Date(iso);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return d >= yesterday;
  }

  // Detector de secuencia antigua: bloquea con modal antes de cualquier acción.
  useEffect(() => {
    if (!order || !currentSequence) return;
    if (confirmedOldSeq) return; // ya confirmado
    if (oldSeqModal) return; // ya mostrado
    if (!isFromTodayOrYesterday(currentSequence.createdAt)) {
      setOldSeqModal({ createdAt: currentSequence.createdAt });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, currentSequence?.createdAt]);

  useEffect(() => {
    if (!order) return;
    if (order.status !== 'sequenced') return;
    if (oldSeqModal) return; // esperar confirmación de secuencia antigua
    // Idempotente si el usuario ya es el claimer actual.
    if (order.pickedBy?.wpUserId === user?.id) return;

    if (order.pickedBy) {
      // Otro picker lo tiene → confirmar antes de reasignar.
      setConfirmTakeOver({
        displayName: order.pickedBy.displayName,
        username: order.pickedBy.username,
        claimedAt: order.claimedAt || undefined,
      });
      return;
    }

    // Nadie lo tiene → claim directo, sin confirmación.
    claim.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, order?.status, order?.pickedBy?.wpUserId, oldSeqModal]);

  function acceptTakeOver() {
    setConfirmTakeOver(null);
    claim.mutate();
  }

  function cancelTakeOver() {
    setConfirmTakeOver(null);
    navigate(`/sequences/${seqId}/packing`);
  }

  function acceptOldSequence() {
    setConfirmedOldSeq(true);
    setOldSeqModal(null);
  }

  function cancelOldSequence() {
    setOldSeqModal(null);
    navigate(`/sequences/${seqId}/packing`);
  }

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
    // Sincroniza el stepper con lo guardado en BD (1 por default si nunca se
    // empacó). Esto permite que tras empaque el stepper muestre el valor
    // actual y se pueda ajustar para reimprimir.
    setBagsCount(Math.max(1, order.bagsExpected ?? 1));
  }, [order]);

  const pack = useMutation({
    mutationFn: () => ordersApi.pack(ordId, [...checked], confirmedOldSeq || undefined, bagsCount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', ordId] });
      queryClient.invalidateQueries({ queryKey: ['sequence', seqId, 'pending-packing'] });
      navigate(`/sequences/${seqId}/packing`);
    },
    onError: (err: any) => {
      setPackError(err.response?.data?.message || 'No se pudo cerrar el pedido');
    },
  });

  // Desempacar: revierte el pedido a 'sequenced'. Solo disponible si está
  // en packed/classified (no en loaded/delivered).
  const unpack = useMutation({
    mutationFn: () => ordersApi.unpack(ordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', ordId] });
      queryClient.invalidateQueries({ queryKey: ['sequence', seqId] });
      queryClient.invalidateQueries({ queryKey: ['sequence', seqId, 'pending-packing'] });
      queryClient.invalidateQueries({ queryKey: ['process'] });
      queryClient.invalidateQueries({ queryKey: ['picking-b2-today'] });
      setConfirmUnpack(false);
      // Volvemos a la lista: el pedido reaparece como 'sequenced'.
      navigate(`/sequences/${seqId}/packing`);
    },
    onError: (err: any) => {
      setUnpackError(err.response?.data?.message || 'No se pudo desempacar');
    },
  });

  // Actualiza bultos en BD post-empaque y reimprime con la nueva cantidad.
  // Si el valor no cambió, solo reimprime.
  const reprint = useMutation({
    mutationFn: async () => {
      setBagsError(null);
      const currentSaved = order?.bagsExpected ?? 1;
      if (bagsCount !== currentSaved) {
        await ordersApi.updateBags(ordId, bagsCount);
      }
      await ordersApi.openAlbaran(ordId, { bags: bagsCount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', ordId] });
    },
    onError: (err: any) => {
      setBagsError(err.response?.data?.message || 'No se pudo reimprimir el albarán');
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

      {/* Widget grande de progreso de la secuencia (excluye bloqueados) */}
      {seqData && (() => {
        const active = seqData.orders.filter(({ order: o }) => o.status !== 'blocked');
        const packed = active.filter(({ order: o }) => ['packed', 'classified', 'loaded', 'delivered'].includes(o.status)).length;
        return (
          <ProgressHero
            title={`Secuencia #${seqId}`}
            done={packed}
            total={active.length}
            verb="empacados"
          />
        );
      })()}

      <div className="card space-y-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-semibold">Pedido #{order.number}</span>
          {order.route && <Badge variant="blue">{order.route}</Badge>}
          {order.stopPosition != null && <Badge variant="gray">Parada {order.stopPosition}</Badge>}
          {order.hasB2Pending && <Badge variant="amber">{warehouseLabel('B2')} pendiente</Badge>}
          {order.allowPartialDelivery && <Badge variant="green">Entrega parcial aprobada</Badge>}
          <ShippingBadge method={order.shippingMethod} />
          {isPacked && <Badge variant="green">Empacado</Badge>}
        </div>
        <CustomerBlock
          name={order.customerName}
          address={order.customerAddress}
          address2={order.customerAddress2}
          city={order.customerCity}
          phone={order.customerPhone}
        />
        <CustomerNote note={order.customerNote} />
        {/* Doble verificación visual: fecha del pedido WC + secuencia. Ayuda
            a detectar albaranes viejos reciclados antes de empacar. */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-200 pt-2 text-xs text-slate-500">
          {order.createdAt && (
            <span>
              Pedido del <strong className="text-slate-700">{new Date(order.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
            </span>
          )}
          {currentSequence && (
            <span>
              Secuencia <strong className="text-slate-700">#{currentSequence.id}</strong> · creada el{' '}
              <strong className="text-slate-700">{new Date(currentSequence.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Aviso informativo si el pedido fue reasignado desde otro picker
          (modelo "último escaneo gana"). Solo aparece en la primera carga. */}
      {reassignedFrom && order.status === 'sequenced' && (
        <div className="card flex items-start gap-3 bg-amber-50 p-3 ring-1 ring-amber-200">
          <User className="shrink-0 text-amber-700" size={16} />
          <div className="flex-1 text-xs text-amber-900">
            <span className="font-semibold">Tomaste este pedido</span> — antes lo tenía{' '}
            <strong>{reassignedFrom.displayName || reassignedFrom.username || 'otro picker'}</strong>.
            Al cerrarlo quedará registrado a tu nombre.
          </div>
        </div>
      )}

      {!reassignedFrom && order.pickedBy && order.pickedBy.wpUserId === user?.id && order.status === 'sequenced' && (
        <div className="card flex items-start gap-3 bg-emerald-50 p-3 ring-1 ring-emerald-200">
          <User className="shrink-0 text-emerald-700" size={16} />
          <div className="flex-1 text-xs text-emerald-900">
            <span className="font-semibold">Tomaste este pedido</span>
            {order.claimedAt && <> a las {new Date(order.claimedAt).toLocaleTimeString('es-CL')}</>}. Empácalo y ciérralo; queda registrado a tu nombre.
          </div>
        </div>
      )}

      {order.allowPartialDelivery && (
        <div className="card flex items-start gap-3 bg-emerald-50 p-3 ring-1 ring-emerald-200">
          <CheckCircle2 className="shrink-0 text-emerald-700" size={18} />
          <div className="flex-1 text-sm text-emerald-900">
            <div className="font-semibold">Entrega parcial aprobada</div>
            {order.partialDeliveryNote && <div className="text-xs">{order.partialDeliveryNote}</div>}
            <div className="text-xs">El pedido se puede cargar al vehículo aunque falten items {warehouseLabel('B2')} al momento de la entrega.</div>
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
            <div className="font-semibold">Este pedido tiene productos de {warehouseLabel('B2')}.</div>
            <div>Solo empaca los items <strong>{warehouseLabel('B1')}</strong> en la bolsa. Los {warehouseLabel('B2')} quedan listados en el albarán para retirar del cargamento a granel en cada entrega.</div>
          </div>
        </div>
      )}

      {onlyB2 ? (
        <div className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-700 ring-1 ring-slate-200">
          Este pedido <strong>no tiene items de {warehouseLabel('B1')}</strong>. No hay nada que empacar físicamente en la bolsa — el albarán se imprime para que el repartidor tome todo desde el cargamento a granel de {warehouseLabel('B2')}.
        </div>
      ) : null}

      <div className={onlyB2 ? 'hidden' : 'space-y-2'}>
        <h3 className="text-sm font-semibold text-slate-700">Items a empacar ({warehouseLabel('B1')})</h3>
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
              <div className="font-medium break-words">{it.lineName || it.product.name}</div>
              <div className="text-xs text-slate-500">{it.product.sku || '—'}</div>
            </div>
            <div className="text-lg font-bold text-brand-700">×{it.qty}</div>
            <input
              type="checkbox"
              checked={checked.has(it.id)}
              onChange={() => toggle(it.id)}
              className="ml-2 h-6 w-6 accent-brand-600"
              disabled={isPacked}
            />
          </label>
        ))}
      </div>

      {b2Items.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-amber-800">A granel desde {warehouseLabel('B2')} (no empacar aquí)</h3>
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
                <div className="font-medium break-words">{it.lineName || it.product.name}</div>
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
              Falta marcar items {warehouseLabel('B1')}. No se puede cerrar el pedido hasta confirmar todos.
            </div>
          )}
          {/* Stepper de bultos: el picker declara cuántas bolsas físicas
              generó al empacar. Si N>1, al cerrar se imprimen N albaranes
              pre-numerados (1 de N, 2 de N, …). */}
          {!onlyB2 && (
            <div className="mb-2 flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
              <div className="text-xs text-slate-600">
                ¿Cuántos bultos generaste?
                <div className="text-[10px] text-slate-400">
                  Si {'>'}1, el albarán saldrá numerado por bulto.
                </div>
              </div>
              <BagsStepper value={bagsCount} onChange={setBagsCount} disabled={pack.isPending} />
            </div>
          )}
          {packError && (
            <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
              {packError}
            </div>
          )}
          <button
            onClick={() => {
              setPackError(null);
              // Confirmar SIEMPRE — incluso con N=1. El default "1" es el caso
              // peligroso: si el picker olvida ajustar el stepper, un pedido
              // multi-bulto sale con un solo albarán y bolsas huérfanas. El
              // tap extra vale la pena vs un bulto perdido.
              setConfirmPackBags(true);
            }}
            disabled={!allChecked || pack.isPending}
            className="btn-primary w-full"
          >
            <CheckCircle2 size={18} />
            {pack.isPending ? 'Cerrando…' : 'Cerrar pedido'}
          </button>
        </div>
      )}

      {isPacked && (
        <div className="card space-y-2 p-3 ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              Bultos declarados: <strong className="text-slate-800">{order.bagsExpected ?? 1}</strong>
              <div className="text-[10px] text-slate-400">
                Cambia el valor y reimprime para emitir albaranes con la nueva numeración.
              </div>
            </div>
            <BagsStepper value={bagsCount} onChange={setBagsCount} disabled={reprint.isPending} />
          </div>
          {bagsError && (
            <div className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-700 ring-1 ring-red-200">{bagsError}</div>
          )}
          <button
            type="button"
            onClick={() => {
              // Si está cambiando el valor guardado, confirmar antes
              // (riesgo: imprimir más papel o sobreescribir cuenta correcta).
              // Reimprimir sin cambio no necesita confirmación.
              if (bagsCount !== (order.bagsExpected ?? 1)) {
                setConfirmReprintBags(true);
              } else {
                reprint.mutate();
              }
            }}
            disabled={reprint.isPending}
            className="btn-ghost w-full border border-slate-300"
          >
            <Printer size={18} />
            {reprint.isPending
              ? 'Generando PDF…'
              : bagsCount !== (order.bagsExpected ?? 1)
                ? `Guardar (${bagsCount} bultos) y reimprimir`
                : `Reimprimir albarán${bagsCount > 1 ? ` (${bagsCount} bultos)` : ''}`}
          </button>
        </div>
      )}

      {isPacked && canManage && (order.status === 'packed' || order.status === 'classified') && (
        <div className="card space-y-2 border-dashed bg-amber-50 p-3 ring-1 ring-amber-200">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            Acciones del operador
          </div>
          {unpackError && (
            <div className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-700 ring-1 ring-red-200">
              {unpackError}
            </div>
          )}
          <button
            type="button"
            onClick={() => { setUnpackError(null); setConfirmUnpack(true); }}
            disabled={unpack.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-amber-800 ring-1 ring-amber-300 hover:bg-amber-100 disabled:opacity-60"
          >
            <RotateCcw size={14} />
            Desempacar (revertir a "En secuencia")
          </button>
          <div className="text-[10px] text-amber-700">
            Borra el registro de quién/cuándo lo empacó y los items vuelven a estado sin marcar. Útil cuando se cerró por error o durante pruebas. La nota del cliente y el {warehouseLabel('B2')} cerrado no se tocan.
          </div>
        </div>
      )}

      {confirmUnpack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md space-y-3 p-4">
            <div className="flex items-start gap-2">
              <AlertOctagon className="text-red-600" size={22} />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">¿Desempacar #{order.number}?</h3>
                <p className="mt-1 text-sm text-slate-700">
                  El pedido vuelve a estado <strong>En secuencia</strong> y se borrará:
                </p>
                <ul className="mt-1 list-disc pl-5 text-xs text-slate-600">
                  <li>Quién y cuándo lo empacó</li>
                  <li>Items confirmados (marcados como pickeados/empacados)</li>
                  <li>
                    Cuenta de bultos
                    {(order.bagsExpected ?? 1) > 1 && <> (vuelve de {order.bagsExpected} a 1)</>}
                  </li>
                  {order.status === 'classified' && (
                    <li>Marca de clasificado (vuelve antes de la clasificación)</li>
                  )}
                </ul>
                <p className="mt-2 text-xs text-slate-500">
                  NO se tocan: la nota del cliente, el {warehouseLabel('B2')} cerrado (si lo cerraste) ni la aprobación de entrega parcial. Otro picker (o tú) puede volver a tomar el pedido.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmUnpack(false)}
                disabled={unpack.isPending}
                className="btn-ghost border border-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => unpack.mutate()}
                disabled={unpack.isPending}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {unpack.isPending ? 'Desempacando…' : 'Sí, desempacar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmBagsModal
        open={confirmPackBags}
        bagsCount={bagsCount}
        mode="pack"
        orderNumber={order.number}
        isPending={pack.isPending}
        onCancel={() => setConfirmPackBags(false)}
        onConfirm={() => {
          setConfirmPackBags(false);
          pack.mutate();
        }}
      />
      <ConfirmBagsModal
        open={confirmReprintBags}
        bagsCount={bagsCount}
        mode="update"
        fromCount={order.bagsExpected ?? 1}
        orderNumber={order.number}
        isPending={reprint.isPending}
        onCancel={() => setConfirmReprintBags(false)}
        onConfirm={() => {
          setConfirmReprintBags(false);
          reprint.mutate();
        }}
      />


      {canManage && !isPacked && (
        <div className="card space-y-3 border-dashed bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Acciones del operador</div>
          <button
            type="button"
            onClick={() => {
              const msg = `¿Confirmas remover el pedido #${order.number} de la secuencia? Pasará a estado Bloqueado y se perderá el progreso de picking/packing. En el siguiente paso te pediremos el motivo.`;
              if (window.confirm(msg)) {
                setRemoveError(null);
                setRemoveOpen(true);
              }
            }}
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
                  Aprobar entrega parcial (cliente acepta sin items {warehouseLabel('B2')})
                </button>
              ) : (
                <div className="space-y-2 rounded-lg bg-white p-3 ring-1 ring-emerald-200">
                  <div className="text-xs font-medium text-slate-700">
                    Confirma la nota (queda registrada en el log)
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

      {/* Modal bloqueante: la secuencia es de hace más de 1 día. Podría ser
          un albarán impreso viejo, reciclado por error. */}
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
                  Verifica que el albarán sea el correcto antes de empacar. Si es un papel viejo reciclado por error, devuélvelo al supervisor.
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Si continúas, queda registrado en el log de auditoría que empacaste desde una secuencia antigua.
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

      {/* Modal de confirmación: este pedido ya lo tiene otro picker.
          Bloqueamos el render normal hasta que el usuario decida. */}
      {confirmTakeOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md space-y-3 p-4">
            <div className="flex items-start gap-2">
              <User className="text-amber-600" size={22} />
              <div className="flex-1">
                <h3 className="font-semibold">Pedido tomado por otro picker</h3>
                <p className="mt-1 text-sm text-slate-700">
                  Este pedido lo tiene <strong>{confirmTakeOver.displayName || confirmTakeOver.username || 'otro usuario'}</strong>
                  {confirmTakeOver.claimedAt && (
                    <> desde las {new Date(confirmTakeOver.claimedAt).toLocaleTimeString('es-CL')}</>
                  )}.
                </p>
                <p className="mt-2 text-xs text-slate-600">
                  Si lo tomas tú, el picker anterior verá un error cuando intente cerrarlo. Confirma solo si estás seguro (ej. te dijo que dejó de trabajarlo).
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={cancelTakeOver} className="btn-ghost border border-slate-300">
                Volver atrás
              </button>
              <button
                onClick={acceptTakeOver}
                className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
              >
                Tomarlo igual
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
