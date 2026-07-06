import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Image as ImageIcon, Printer, AlertOctagon, UserX, CheckCircle2, RotateCcw, User } from 'lucide-react';
import clsx from 'clsx';
import { ordersApi, sequencesApi } from '@/lib/sequences';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { ShippingBadge } from '@/components/ShippingBadge';
import { CustomerNote } from '@/components/CustomerNote';
import { CustomerBlock } from '@/components/CustomerBlock';
import { WcStatusBadge } from '@/components/WcStatusBadge';
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
  // ?bag=N viene del QR de un albarán multi-bulto — auto-abrimos ese
  // bulto en modo ejecución sin exigir que el picker lo elija a mano.
  const [searchParams] = useSearchParams();
  const bagFromUrl = (() => {
    const raw = searchParams.get('bag');
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  })();

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

  // ─── Multi-bulto v0.24.0/v0.24.2 ──────────────────────────────────────
  // assignments: distribución del picker por item. Cada item puede tener
  // qty>1 y dividirse en varios bultos. Estructura:
  //   Map<orderItemId, Map<bagNumber, qty>>
  // Ejemplo: item X con qty=2, 1 en bulto 1 y 1 en bulto 2:
  //   assignments.get(X) === Map { 1 => 1, 2 => 1 }
  const [assignments, setAssignments] = useState<Map<number, Map<number, number>>>(new Map());
  // splitOpen: qué items tienen abierto el widget de split (qty>1).
  const [splitOpen, setSplitOpen] = useState<Set<number>>(new Set());
  const [activeBag, setActiveBag] = useState<number | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

  // Setea "todo el item al bulto N" (caso más común, sin split).
  function setBagFor(itemId: number, bag: number | null, itemQty: number) {
    setAssignments((prev) => {
      const next = new Map(prev);
      if (bag == null) next.delete(itemId);
      else next.set(itemId, new Map([[bag, itemQty]]));
      return next;
    });
  }
  // Chips-unidad (v0.24.3): cada unidad del item es un chip que muestra su
  // bulto. Un tap cicla al siguiente bulto (Bn → B1). Convertimos entre el
  // formato interno Map<bag, qty> y el array de chips.
  function mapToChips(inner: Map<number, number> | undefined, totalQty: number, defaultBag: number): number[] {
    const chips: number[] = [];
    if (inner && inner.size > 0) {
      const sorted = [...inner.entries()].sort((a, b) => a[0] - b[0]);
      for (const [bag, q] of sorted) {
        for (let i = 0; i < q; i += 1) chips.push(bag);
      }
    }
    // Rellena las unidades que falten con el bulto default.
    while (chips.length < totalQty) chips.push(defaultBag);
    return chips.slice(0, totalQty);
  }
  function chipsToMap(chips: number[]): Map<number, number> {
    const m = new Map<number, number>();
    for (const b of chips) m.set(b, (m.get(b) ?? 0) + 1);
    return m;
  }
  // Cicla la unidad `chipIndex` de un item al siguiente bulto disponible
  // (Bn → B1). El default cuando aún no había asignación es 1.
  function cycleChip(itemId: number, chipIndex: number, itemQty: number) {
    setAssignments((prev) => {
      const next = new Map(prev);
      const chips = mapToChips(prev.get(itemId), itemQty, 1);
      const current = chips[chipIndex] ?? 1;
      const nextBag = current >= bagsCount ? 1 : current + 1;
      chips[chipIndex] = nextBag;
      next.set(itemId, chipsToMap(chips));
      return next;
    });
  }
  // Abre el split de un item, materializando los chips en el bulto principal
  // (o en 1 si aún no había elección). Al cerrar, borra la asignación.
  function toggleSplit(itemId: number, itemQty: number, defaultBag: number) {
    setSplitOpen((s) => {
      const isOpen = s.has(itemId);
      const nextOpen = new Set(s);
      if (isOpen) {
        nextOpen.delete(itemId);
        // Al colapsar: si el split había repartido en varios bultos, borramos
        // la asignación para que el picker vuelva a elegir en el dropdown.
        // Si todo está en un solo bulto, dejamos la asignación intacta.
        setAssignments((prev) => {
          const inner = prev.get(itemId);
          if (!inner || inner.size <= 1) return prev;
          const next = new Map(prev);
          next.delete(itemId);
          return next;
        });
      } else {
        nextOpen.add(itemId);
        // Al abrir: materializa qty chips en el bulto default (para que el
        // picker vea todos los chips desde el primer tap).
        setAssignments((prev) => {
          const next = new Map(prev);
          const chips = mapToChips(prev.get(itemId), itemQty, defaultBag);
          next.set(itemId, chipsToMap(chips));
          return next;
        });
      }
      return nextOpen;
    });
  }
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
      queryClient.invalidateQueries({ queryKey: ['sequence', seqId] });
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      queryClient.invalidateQueries({ queryKey: ['process'] });
      queryClient.invalidateQueries({ queryKey: ['picking-b2-today'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['order', ordId] });
      setRemoveOpen(false);
      navigate(`/sequences/${seqId}/packing`);
    },
    onError: (err: any) => setRemoveError(err.response?.data?.message || 'No se pudo sacar el pedido de la secuencia'),
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
    // Multi-bulto: si el pedido ya tiene plan guardado (assignments), lo
    // cargamos en el state para modo ejecución. Sino, empezamos vacío para
    // que el picker declare desde cero. v0.24.2: assignments trae qty.
    if (order.packPlan?.assignments?.length) {
      const m = new Map<number, Map<number, number>>();
      for (const a of order.packPlan.assignments) {
        let inner = m.get(a.orderItemId);
        if (!inner) { inner = new Map(); m.set(a.orderItemId, inner); }
        inner.set(a.bagNumber, a.qty);
      }
      setAssignments(m);
      // Auto-abrir el bulto que vino en ?bag=N (viene del QR del albarán
      // impreso). Solo si ese bulto existe en el plan y aún no está cerrado
      // — sino, dejamos la vista de selección para que el picker vea el
      // estado y elija otro bulto.
      if (bagFromUrl != null) {
        const bagsPackedSet = new Set(order.packPlan.bagsPacked?.map((b) => b.bag) ?? []);
        const bagsInPlan = new Set(order.packPlan.assignments.map((a) => a.bagNumber));
        if (bagsInPlan.has(bagFromUrl) && !bagsPackedSet.has(bagFromUrl)) {
          setActiveBag(bagFromUrl);
          // Pre-tildar items ya pickeados (re-entrada). Un item con qty>0 en
          // el bulto solicitado y ya empacado se muestra tildado.
          const preChecked = new Set<number>();
          for (const [itemId, inner] of m.entries()) {
            if ((inner.get(bagFromUrl) ?? 0) > 0) {
              const it = order.items.find((x) => x.id === itemId);
              if (it?.packedAt) preChecked.add(itemId);
            }
          }
          setChecked(preChecked);
        }
      }
    } else {
      setAssignments(new Map());
    }
  }, [order, bagFromUrl]);

  // Mutations multi-bulto (v0.24.0/v0.24.2)
  const createPlan = useMutation({
    mutationFn: async () => {
      setPlanError(null);
      // Aplana el Map<itemId, Map<bag, qty>> → array de assignments con qty.
      const arr: Array<{ orderItemId: number; bagNumber: number; qty: number }> = [];
      for (const [itemId, inner] of assignments.entries()) {
        for (const [bag, qty] of inner.entries()) {
          if (qty > 0) arr.push({ orderItemId: itemId, bagNumber: bag, qty });
        }
      }
      await ordersApi.createPackPlan(ordId, bagsCount, arr);
      // Inmediatamente abrir el PDF de albaranes con la distribución nueva.
      await ordersApi.openAlbaran(ordId, { bags: bagsCount });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order', ordId] }),
    onError: (err: any) => setPlanError(err.response?.data?.message || 'No se pudo crear el plan'),
  });

  const deletePlan = useMutation({
    mutationFn: () => ordersApi.deletePackPlan(ordId),
    onSuccess: () => {
      setActiveBag(null);
      setAssignments(new Map());
      queryClient.invalidateQueries({ queryKey: ['order', ordId] });
    },
    onError: (err: any) => setPlanError(err.response?.data?.message || 'No se pudo descartar el plan'),
  });

  const closeBag = useMutation({
    mutationFn: (args: { bag: number; itemIds: number[] }) =>
      ordersApi.closePackBag(ordId, args.bag, args.itemIds),
    onSuccess: (data) => {
      setActiveBag(null);
      setChecked(new Set());
      queryClient.invalidateQueries({ queryKey: ['order', ordId] });
      queryClient.invalidateQueries({ queryKey: ['sequence', seqId, 'pending-packing'] });
      // Si con este cierre se completó el pedido, volver a la lista.
      if (data.complete) {
        navigate(`/sequences/${seqId}/packing`);
      }
    },
    onError: (err: any) => setPackError(err.response?.data?.message || 'No se pudo cerrar el bulto'),
  });

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

  // ─── Multi-bulto v0.24.0 derivadas ────────────────────────────────────
  const hasPlan = !!order.packPlan?.assignments?.length;
  const bagsPackedSet = new Set(order.packPlan?.bagsPacked?.map((b) => b.bag) ?? []);
  // Modo declaración: bagsCount>1, sin plan, y el pedido aún es sequenced.
  const isDeclaring = !isPacked && bagsCount > 1 && !hasPlan && !onlyB2;
  // Modo ejecución: plan guardado; cada bulto se cierra por separado.
  const isExecuting = hasPlan && !isPacked;
  // Validación del plan a declarar. Cada item B1 debe estar cubierto por
  // completo (suma de qty por bulto == item.qty) Y cada bulto [1..N] debe
  // tener al menos una asignación.
  const declaredBagUsage = (() => {
    const usage = new Map<number, number>();
    for (const inner of assignments.values()) {
      for (const [bag, qty] of inner.entries()) {
        if (qty > 0) usage.set(bag, (usage.get(bag) || 0) + 1);
      }
    }
    return usage;
  })();
  // Helper: suma de qty asignada a un item.
  function assignedTotal(itemId: number) {
    const inner = assignments.get(itemId);
    if (!inner) return 0;
    let s = 0;
    for (const q of inner.values()) s += q;
    return s;
  }
  const allItemsAssigned = b1Items.length > 0
    && b1Items.every((it) => assignedTotal(it.id) === it.qty);
  const allBagsUsed = Array.from({ length: bagsCount }, (_, i) => i + 1).every((n) => (declaredBagUsage.get(n) || 0) > 0);
  const canCreatePlan = isDeclaring && allItemsAssigned && allBagsUsed;
  // En modo ejecución con activeBag elegido: items presentes en ese bulto
  // (los que tienen qty>0 asignada a activeBag) y flag de si están todos
  // tildados. La qty visible en la UI es la del bulto, no la total.
  const activeBagItems = activeBag != null
    ? b1Items
        .filter((it) => (assignments.get(it.id)?.get(activeBag) ?? 0) > 0)
        .map((it) => ({ ...it, bagQty: assignments.get(it.id)!.get(activeBag)! }))
    : [];
  const activeBagAllChecked = activeBagItems.length > 0
    && activeBagItems.every((it) => checked.has(it.id));

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
          <WcStatusBadge slug={order.wcStatus} />
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

      {/* ─── MODO DECLARACIÓN (multi-bulto v0.24.0) ───
          bagsCount>1 y sin plan: el picker asigna cada item a un bulto y
          después presiona "Imprimir albaranes" para congelar la distribución. */}
      {isDeclaring && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">
            Distribución por bulto ({b1Items.length} items en {bagsCount} bultos)
          </h3>
          <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-900 ring-1 ring-blue-200">
            Asigna cada producto al bulto donde irá. Al presionar <strong>Imprimir</strong>, se generan {bagsCount} albaranes,
            cada uno con solo los items de su bulto.
          </div>
          {b1Items.map((it) => {
            const inner = assignments.get(it.id);
            const total = assignedTotal(it.id);
            const isSplit = splitOpen.has(it.id) || (inner && inner.size > 1);
            // Cuando NO está en split, extraemos el único bulto asignado (si hay).
            const singleBag = !isSplit && inner && inner.size === 1
              ? [...inner.keys()][0] : null;
            return (
              <div key={it.id} className="card p-3 space-y-2">
                <div className="flex items-center gap-3">
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
                  {!isSplit && (
                    <select
                      value={singleBag ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setBagFor(it.id, v === '' ? null : Number(v), it.qty);
                      }}
                      className="ml-2 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm font-medium"
                    >
                      <option value="">Bulto…</option>
                      {Array.from({ length: bagsCount }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>Bulto {n}</option>
                      ))}
                    </select>
                  )}
                </div>
                {/* Split expandible: solo para items con qty>1. Cada unidad
                    es un chip. Tap cicla al siguiente bulto (Bn→B1). */}
                {it.qty > 1 && (
                  <div>
                    {!isSplit ? (
                      <button
                        type="button"
                        onClick={() => toggleSplit(it.id, it.qty, singleBag ?? 1)}
                        className="text-xs text-brand-700 hover:underline"
                      >
                        + Dividir en varios bultos
                      </button>
                    ) : (() => {
                      const chips = mapToChips(inner, it.qty, 1);
                      return (
                        <div className="rounded-md bg-slate-50 p-2 ring-1 ring-slate-200">
                          <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="text-slate-700">
                              <strong>Dividir ×{it.qty}</strong> · toca cada unidad para cambiar de bulto
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleSplit(it.id, it.qty, singleBag ?? 1)}
                              className="text-slate-500 hover:underline"
                            >
                              Cancelar split
                            </button>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {chips.map((bag, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => cycleChip(it.id, idx, it.qty)}
                                className="min-w-[52px] rounded-full bg-brand-600 px-3 py-1.5 text-sm font-bold text-white shadow-sm hover:bg-brand-700 active:scale-95"
                              >
                                B{bag}
                              </button>
                            ))}
                            <span className="ml-2 text-xs text-slate-600">
                              {total === it.qty ? '✓ ' : ''}{total}/{it.qty}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })}
          {!allItemsAssigned && (
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Todavía hay items sin asignar por completo. Cada item debe cubrir toda su cantidad.
            </div>
          )}
          {allItemsAssigned && !allBagsUsed && (
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Cada bulto debe tener al menos un item. Faltan bultos vacíos: {' '}
              {Array.from({ length: bagsCount }, (_, i) => i + 1).filter((n) => !declaredBagUsage.get(n)).join(', ')}.
            </div>
          )}
          {planError && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{planError}</div>
          )}
        </div>
      )}

      {/* ─── MODO EJECUCIÓN (multi-bulto v0.24.0) ───
          Plan guardado en BD. Aparecen cards por bulto: cada picker toca la
          suya y confirma los items de ese bulto antes de cerrarlo. */}
      {isExecuting && activeBag == null && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">
            Bultos del pedido ({(order.packPlan?.bagsPacked?.length ?? 0)}/{bagsCount} cerrados)
          </h3>
          <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-900 ring-1 ring-blue-200">
            Elige el bulto que estás preparando. Al cerrar todos los bultos, el pedido queda completo automáticamente.
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {Array.from({ length: bagsCount }, (_, i) => i + 1).map((n) => {
              const closed = bagsPackedSet.has(n);
              // Items con qty > 0 en este bulto. Si un item se dividió, ambos
              // bultos lo cuentan (con qty parcial cada uno).
              const itemsCount = b1Items.filter((it) => (assignments.get(it.id)?.get(n) ?? 0) > 0).length;
              const info = order.packPlan?.bagsPacked?.find((b) => b.bag === n);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    if (closed) return;
                    setActiveBag(n);
                    // Al abrir un bulto, precargamos checked con los items ya
                    // pickeados/empacados si los hay (re-entrada).
                    const preChecked = new Set<number>();
                    for (const it of b1Items) {
                      if ((assignments.get(it.id)?.get(n) ?? 0) > 0 && it.packedAt) preChecked.add(it.id);
                    }
                    setChecked(preChecked);
                  }}
                  disabled={closed}
                  className={clsx(
                    'card flex items-center justify-between gap-3 p-3 text-left transition',
                    closed
                      ? 'bg-emerald-50 ring-1 ring-emerald-200 cursor-not-allowed'
                      : 'hover:ring-2 hover:ring-brand-500',
                  )}
                >
                  <div>
                    <div className={clsx('text-base font-bold', closed ? 'text-emerald-800' : 'text-slate-800')}>
                      Bulto {n} de {bagsCount}
                    </div>
                    <div className="text-xs text-slate-600">
                      {itemsCount} item{itemsCount === 1 ? '' : 's'}
                    </div>
                    {closed && info && (
                      <div className="mt-0.5 text-[11px] text-emerald-700">
                        ✓ Cerrado {info.actorName ? `por ${info.actorName}` : ''} · {new Date(info.at).toLocaleTimeString('es-CL')}
                      </div>
                    )}
                  </div>
                  {closed ? (
                    <CheckCircle2 className="text-emerald-600" size={24} />
                  ) : (
                    <div className="text-xs text-brand-700">Abrir →</div>
                  )}
                </button>
              );
            })}
          </div>
          {(order.packPlan?.bagsPacked?.length ?? 0) === 0 && canManage && (
            <button
              type="button"
              onClick={() => {
                if (confirm('¿Descartar el plan actual y volver a la declaración? Nadie ha cerrado bultos aún.')) {
                  deletePlan.mutate();
                }
              }}
              disabled={deletePlan.isPending}
              className="w-full text-xs text-slate-600 hover:underline"
            >
              Descartar plan y reasignar
            </button>
          )}
        </div>
      )}

      {isExecuting && activeBag != null && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">
              Bulto {activeBag} de {bagsCount} · {activeBagItems.length} items
            </h3>
            <button
              type="button"
              onClick={() => { setActiveBag(null); setChecked(new Set()); }}
              className="text-xs text-slate-600 hover:underline"
            >
              Volver a bultos
            </button>
          </div>
          <ProgressBar
            value={activeBagItems.filter((it) => checked.has(it.id)).length}
            total={activeBagItems.length}
            label="Items del bulto confirmados"
          />
          {activeBagItems.map((it) => (
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
                {it.bagQty !== it.qty && (
                  <div className="mt-0.5 text-[11px] text-slate-500 italic">
                    {it.bagQty} de {it.qty} unidades — el resto va en otro bulto
                  </div>
                )}
              </div>
              <div className="text-lg font-bold text-brand-700">×{it.bagQty}</div>
              <input
                type="checkbox"
                checked={checked.has(it.id)}
                onChange={() => toggle(it.id)}
                className="ml-2 h-6 w-6 accent-brand-600"
              />
            </label>
          ))}
        </div>
      )}

      {/* ─── MODO SINGLE-BULTO (o pedido ya cerrado) ─── */}
      <div className={clsx((isDeclaring || isExecuting || onlyB2) ? 'hidden' : 'space-y-2')}>
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
          {/* Stepper de bultos: solo aparece cuando no hay plan multi-bulto
              en juego (single-bulto o antes de declarar plan). Con plan, la
              cantidad ya está fija y no se puede cambiar sin descartar. */}
          {!onlyB2 && !isExecuting && (
            <div className="mb-2 flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
              <div className="text-xs text-slate-600">
                ¿Cuántos bultos generaste?
                <div className="text-[10px] text-slate-400">
                  Si {'>'}1, cada bulto se empaca y cierra por separado (posible en paralelo entre pickers).
                </div>
              </div>
              <BagsStepper value={bagsCount} onChange={setBagsCount} max={6} disabled={pack.isPending || createPlan.isPending} />
            </div>
          )}

          {/* Aviso de items sin marcar según modo */}
          {!onlyB2 && !isDeclaring && !isExecuting && !allChecked && (
            <div className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Falta marcar items {warehouseLabel('B1')}. No se puede cerrar el pedido hasta confirmar todos.
            </div>
          )}
          {isExecuting && activeBag != null && !activeBagAllChecked && (
            <div className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Falta marcar items del bulto {activeBag}. No se puede cerrar hasta confirmar todos.
            </div>
          )}

          {packError && (
            <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
              {packError}
            </div>
          )}

          {/* Botón principal según el modo */}
          {isDeclaring && (
            <button
              onClick={() => { setPackError(null); setPlanError(null); createPlan.mutate(); }}
              disabled={!canCreatePlan || createPlan.isPending}
              className="btn-primary w-full"
            >
              <Printer size={18} />
              {createPlan.isPending ? 'Guardando plan e imprimiendo…' : `Imprimir ${bagsCount} albaranes`}
            </button>
          )}
          {isExecuting && activeBag != null && (
            <button
              onClick={() => {
                setPackError(null);
                const itemIds = activeBagItems.map((it) => it.id);
                closeBag.mutate({ bag: activeBag, itemIds });
              }}
              disabled={!activeBagAllChecked || closeBag.isPending}
              className="btn-primary w-full"
            >
              <CheckCircle2 size={18} />
              {closeBag.isPending ? 'Cerrando…' : `Cerrar bulto ${activeBag}`}
            </button>
          )}
          {!isDeclaring && !isExecuting && (
            <button
              onClick={() => {
                setPackError(null);
                // Confirmar SIEMPRE — incluso con N=1. El default "1" es el caso
                // peligroso si el picker olvida ajustar. Un tap extra vale
                // vs un bulto perdido.
                setConfirmPackBags(true);
              }}
              disabled={!allChecked || pack.isPending}
              className="btn-primary w-full"
            >
              <CheckCircle2 size={18} />
              {pack.isPending ? 'Cerrando…' : 'Cerrar pedido'}
            </button>
          )}
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

      {isPacked && canManage && order.status !== 'delivered' && (
        <div className="card space-y-3 border-dashed bg-amber-50 p-3 ring-1 ring-amber-200">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            Acciones del operador
          </div>

          {/* Sacar de secuencia: vuelve a pendientes — caso típico es
              "cliente no recibe en ruta". Permitido también para
              classified / loaded con confirmación reforzada en el modal. */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => { setRemoveError(null); setRemoveOpen(true); }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-300 hover:bg-red-50"
            >
              <UserX size={14} />
              Sacar de la secuencia (vuelve a pendientes)
            </button>
            <div className="text-[10px] text-amber-700">
              El pedido vuelve a la pila para entrar a una próxima secuencia. Se borra el registro de empaque y los items quedan sin marcar. La bolsa física tiene que volver a bodega.
            </div>
          </div>

          {/* Desempacar (solo packed/classified): revierte el estado dejándolo
              EN la misma secuencia para re-empaque. Útil para errores de
              cierre, NO para devoluciones de ruta. */}
          {(order.status === 'packed' || order.status === 'classified') && (
            <div className="space-y-1 border-t border-amber-200 pt-2">
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
                Desempacar (sigue en la misma secuencia)
              </button>
              <div className="text-[10px] text-amber-700">
                Borra el registro de quién/cuándo lo empacó y los items vuelven a estado sin marcar. Útil cuando se cerró por error o durante pruebas. La nota del cliente y el {warehouseLabel('B2')} cerrado no se tocan.
              </div>
            </div>
          )}
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
              setRemoveError(null);
              setRemoveOpen(true);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-100"
          >
            <UserX size={14} />
            Sacar de la secuencia (vuelve a pendientes)
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
        currentStatus={order.status}
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
