import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import {
  Truck,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Home,
  LogIn,
  ClipboardCheck,
  Camera,
  X,
  AlertOctagon,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { ordersApi } from '@/lib/sequences';
import { dispatchApi } from '@/lib/dispatch';
import { warehouseLabel } from '@/lib/labels';
import { Spinner } from '@/components/Spinner';
import { B2Alert } from '@/components/B2Alert';
import { ShippingBadge } from '@/components/ShippingBadge';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { CustomerNote } from '@/components/CustomerNote';
import { CustomerBlock } from '@/components/CustomerBlock';
import { QRScanner } from '@/components/QRScanner';
import { RouteProgressPills, RouteProgressHero } from '@/components/RouteProgressPills';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';

// Extrae el wpOrderId de un texto QR. Acepta:
//   /scan/<id>            (nuevo formato URL)
//   /scan/<id>?bag=N      (multi-bulto, el bag lo lee el consumer aparte)
//   WMS:<id>              (legacy)
function parseQrToWpId(raw: string): number | null {
  const trimmed = raw.trim();
  const urlMatch = trimmed.match(/\/scan\/(\d+)(?:[/?#]|$)/);
  if (urlMatch) return Number(urlMatch[1]);
  const wmsMatch = trimmed.match(/^WMS:(\d+)$/);
  if (wmsMatch) return Number(wmsMatch[1]);
  return null;
}

// Extrae el bag number del query string del scan escaneado (si viene).
// Ej. /scan/123?bag=2 → 2. Se usa cuando el conductor pega la URL en el
// scanner y necesitamos leer el bag desde el texto directamente.
export function parseQrToBagNumber(raw: string): number | null {
  const m = raw.match(/[?&]bag=(\d+)(?:&|$|#)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function Scan() {
  const { wpOrderId } = useParams();
  const idNum = Number(wpOrderId);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const canLoad = hasCap(user, CAPS.LOAD);
  const canPack = hasCap(user, CAPS.PACK_B1);
  const canPickB2 = hasCap(user, CAPS.PACK_B2);

  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Multi-bulto: el número del bulto activo viene por ?bag=N en la URL del
  // QR escaneado. Si no viene (albarán viejo pre-multi-bulto), la vista
  // muestra un fallback donde el operador elige a mano cuál es.
  const [searchParams] = useSearchParams();
  const bagFromQuery = (() => {
    const raw = searchParams.get('bag');
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  })();
  // Si el usuario elige el bulto vía fallback UI, guardamos su elección
  // aquí (equivalente a haber venido con ?bag=N).
  const [manualBag, setManualBag] = useState<number | null>(null);
  const activeBag = bagFromQuery ?? manualBag;

  // Info del último bulto que registré en este mismo scan — se usa para la
  // card "Deshacer" con countdown. Al deshacer o al pasar los 30s, se limpia.
  const [lastRegisteredBag, setLastRegisteredBag] = useState<{
    bag: number;
    event: 'classified' | 'loaded';
    at: number;
  } | null>(null);
  // Countdown "Deshacer" — tick cada segundo mientras hay algo por deshacer.
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    if (!lastRegisteredBag) return;
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, [lastRegisteredBag]);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order-public', idNum],
    queryFn: () => ordersApi.getPublicByWpId(idNum),
    enabled: Number.isFinite(idNum) && idNum > 0,
  });

  const { data: routesProgress } = useQuery({
    queryKey: ['dispatch-today'],
    queryFn: () => dispatchApi.today(),
    enabled: !!user && canLoad && !!order && ['packed', 'classified', 'loaded'].includes(order.status),
    refetchInterval: 8_000,
  });

  // Clasificar un bulto. Si el pedido es multi-bulto, se pasa el bag.
  // El backend devuelve progress { done, total } y complete: true cuando se
  // registró el último bulto (recién ahí transiciona a status='classified').
  const classify = useMutation({
    mutationFn: (bag?: number) => dispatchApi.classify(order!.id, bag),
    onSuccess: (_data, bag) => {
      setActionError(null);
      if (bag) setLastRegisteredBag({ bag, event: 'classified', at: Date.now() });
      queryClient.invalidateQueries({ queryKey: ['order-public', idNum] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-today'] });
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'No se pudo clasificar el pedido');
    },
  });

  const markLoaded = useMutation({
    mutationFn: (bag?: number) => dispatchApi.loaded(order!.id, bag),
    onSuccess: (_data, bag) => {
      setActionError(null);
      if (bag) setLastRegisteredBag({ bag, event: 'loaded', at: Date.now() });
      queryClient.invalidateQueries({ queryKey: ['order-public', idNum] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-today'] });
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'No se pudo confirmar la carga');
    },
  });

  // Deshacer bulto — solo dentro de la ventana 30s desde el registro.
  const undoBag = useMutation({
    mutationFn: (args: { bag: number; event: 'classified' | 'loaded' }) =>
      dispatchApi.undoBag(order!.id, args.bag, args.event),
    onSuccess: () => {
      setActionError(null);
      setLastRegisteredBag(null);
      queryClient.invalidateQueries({ queryKey: ['order-public', idNum] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-today'] });
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'No se pudo deshacer el bulto');
    },
  });

  // Nota: la mutación approvePartial se eliminó junto con el bloqueo de
  // carga por B2 incompleto. El endpoint sigue disponible en ordersApi si
  // hace falta en otro lugar.

  // Acciones potenciales que aplican al usuario para este pedido, en orden
  // de prioridad para el modal (classify primero — permite despachar aunque
  // B2 siga abierto; pickB2 y pack pueden esperar). 'classify' se renderiza
  // inline en esta misma vista (showClassifyFlow), así que si es la única
  // opción NO navegamos: dejamos que el flujo classify aparezca aquí mismo.
  const availableActions: Array<'classify' | 'pickB2' | 'pack'> = (() => {
    if (!user || !order) return [];
    const list: Array<'classify' | 'pickB2' | 'pack'> = [];
    // classify: exige status='packed' + cap load. La ruta no la exigimos
    // aquí — si falta, el flujo inline muestra el aviso "sin ruta asignada"
    // y el botón queda deshabilitado.
    if (canLoad && order.status === 'packed') list.push('classify');
    if (canPickB2 && order.b2Pickable && order.openSequenceId) list.push('pickB2');
    if (canPack && order.packable && order.openSequenceId) list.push('pack');
    return list;
  })();

  // Auto-redirect solo cuando queda 1 acción que efectivamente tiene su vista
  // separada. classify vive inline en Scan, entonces no navega.
  const navAction: 'pack' | 'pickB2' | null = (() => {
    if (availableActions.length !== 1) return null;
    const only = availableActions[0];
    return only === 'pack' || only === 'pickB2' ? only : null;
  })();

  const showSelectorNow = availableActions.length >= 2;

  useEffect(() => {
    if (!user || !order) return;
    if (navAction === 'pack') {
      navigate(`/sequences/${order.openSequenceId}/packing/${order.id}${bagFromQuery ? `?bag=${bagFromQuery}` : ''}`, { replace: true });
    } else if (navAction === 'pickB2') {
      navigate(`/sequences/${order.openSequenceId}/picking-b2/${order.id}`, { replace: true });
    } else if (showSelectorNow) {
      setShowSelector(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, order?.id, order?.status]);

  function pickSelectorAction(kind: 'classify' | 'pack' | 'pickB2') {
    setShowSelector(false);
    if (!order) return;
    if (kind === 'pack' && order.openSequenceId) {
      navigate(`/sequences/${order.openSequenceId}/packing/${order.id}${bagFromQuery ? `?bag=${bagFromQuery}` : ''}`);
    } else if (kind === 'pickB2' && order.openSequenceId) {
      navigate(`/sequences/${order.openSequenceId}/picking-b2/${order.id}`);
    }
    // kind === 'classify': quedamos en esta vista. showClassifyFlow renderiza
    // el bloque de clasificación con el botón "Confirmar clasificación".
  }

  if (!Number.isFinite(idNum) || idNum <= 0) {
    return <ScanShell><div className="card p-6 text-center text-red-700">ID de pedido inválido en la URL.</div></ScanShell>;
  }
  if (isLoading) return <ScanShell><Spinner /></ScanShell>;
  if (error || !order) {
    return (
      <ScanShell>
        <div className="card p-6 text-center text-slate-600">
          Pedido <strong>#{wpOrderId}</strong> no encontrado en el WMS.
        </div>
      </ScanShell>
    );
  }

  const b1Items = order.items.filter((i) => i.warehouse === 'B1');
  const b2Items = order.items.filter((i) => i.warehouse === 'B2');

  // Estados derivados para la UI
  const justClassified = classify.isSuccess && order.status === 'classified';
  const justLoaded = markLoaded.isSuccess && order.status === 'loaded';
  const showClassifyFlow = canLoad && order.status === 'packed' && !justClassified;
  const showLoadFlow = canLoad && order.status === 'classified' && !justLoaded;
  const isAlreadyLoaded = order.status === 'loaded' || order.status === 'delivered';

  const noRouteYet = !order.route && (showClassifyFlow || showLoadFlow);
  const isBlocked = order.status === 'blocked';
  const isNotPacked = ['received', 'sequenced', 'picked'].includes(order.status) && !order.packable && !order.b2Pickable;

  // Multi-bulto: derivadas del progreso por bulto que trae el response.
  const bagsCount = order.bagsExpected ?? 1;
  const isMultiBag = bagsCount > 1 && (showClassifyFlow || showLoadFlow);
  const activeEvent: 'classified' | 'loaded' | null = showClassifyFlow
    ? 'classified'
    : showLoadFlow
      ? 'loaded'
      : null;
  const bagsForEvent = activeEvent === 'classified'
    ? (order.bagsClassified ?? [])
    : activeEvent === 'loaded'
      ? (order.bagsLoaded ?? [])
      : [];
  const doneBags = new Set(bagsForEvent.map((b) => b.bag));
  const remainingBags = Array.from({ length: bagsCount }, (_, i) => i + 1).filter((n) => !doneBags.has(n));
  // El bulto activo (viene del ?bag= del QR o de la elección manual del
  // operador). Si el operador no eligió, mostramos el fallback UI para que
  // pique un botón "Bulto N de M".
  const needsBagPick = isMultiBag && activeBag == null;
  // Habilitar botón de acción: no procesando + ruta OK + (single-bulto o activeBag válido).
  const canFire = !classify.isPending && !markLoaded.isPending && !!order.route
    && (!isMultiBag || (activeBag != null && !doneBags.has(activeBag)));

  // Countdown deshacer derivado (no hook).
  const undoRemainingMs = lastRegisteredBag ? Math.max(0, 30000 - (nowTick - lastRegisteredBag.at)) : 0;
  const canUndo = !!lastRegisteredBag && undoRemainingMs > 0 && !undoBag.isPending;

  return (
    <ScanShell>
      <div className="space-y-4 pb-4">
        {/* Header */}
        <div className="card space-y-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-bold">#{order.number}</span>
            <OrderStatusBadge status={order.status} />
            <ShippingBadge method={order.shippingMethod} />
          </div>
          <CustomerBlock
            name={order.customerName}
            address={order.customerAddress}
            address2={order.customerAddress2}
            city={order.customerCity}
            phone={order.customerPhone}
          />
          <CustomerNote note={order.customerNote} />
        </div>

        {/* Ruta + parada (siempre visible si existe) */}
        {order.route && (
          <div className="rounded-xl bg-brand-50 p-4 ring-1 ring-brand-100">
            <div className="text-xs uppercase tracking-wide text-brand-700">Ruta · Parada</div>
            <div className="mt-1 flex items-baseline gap-3">
              <div className="text-4xl font-bold text-brand-800">{order.route}</div>
              {order.stopPosition != null && (
                <div className="text-2xl font-semibold text-brand-700">· {order.stopPosition}</div>
              )}
            </div>
          </div>
        )}

        {noRouteYet && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200">
            <AlertTriangle size={16} />
            Este pedido aún no tiene ruta asignada. No se puede clasificar/cargar hasta que la app de rutas la asigne.
          </div>
        )}

        {/* Alerta B2 visual (no bloqueante por sí sola; el bloqueo viene de loadable) */}
        {order.hasB2Pending && !showClassifyFlow && !showLoadFlow && (
          <B2Alert
            items={b2Items.map((i) => ({
              sku: i.product.sku,
              name: i.product.name,
              qty: i.qty,
              thumbnailUrl: i.product.thumbnailUrl,
            }))}
          />
        )}

        {/* Nota: hasta v0.18.2 aquí había un banner rojo que bloqueaba
            clasificar/cargar cuando faltaban items B2. La regla cambió: ahora
            el operador puede cargar aunque el B2 esté incompleto (decide el
            humano frente al camión). El listado informativo de items B2
            faltantes sigue mostrándose arriba vía B2Alert. */}

        {/* ─────────── Multi-bulto: identifica el bulto activo y muestra progreso ───────────
            Cada scan registra UN bulto (el que trae ?bag=N en el QR o el
            elegido en el fallback). El pedido pasa a classified/loaded solo
            al registrar los N. Ver services/bag-events.js. */}
        {isMultiBag && needsBagPick && (
          <div className="rounded-lg bg-amber-50 px-3 py-3 ring-2 ring-amber-400">
            <div className="flex items-start gap-2">
              <Package className="shrink-0 text-amber-700" size={22} />
              <div className="flex-1">
                <div className="text-base font-bold uppercase text-amber-900">
                  Pedido con {bagsCount} bultos · elige cuál estás procesando
                </div>
                <div className="mt-1 text-sm text-amber-900">
                  Este albarán no trae el número de bulto en el QR (albarán viejo o QR sin <code>?bag</code>).
                  Lee el rótulo físico ("BULTO X DE {bagsCount}") y toca el que corresponde.
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {Array.from({ length: bagsCount }, (_, i) => i + 1).map((n) => {
                    const already = doneBags.has(n);
                    return (
                      <button
                        key={n}
                        type="button"
                        disabled={already}
                        onClick={() => setManualBag(n)}
                        className={clsx(
                          'rounded-lg px-3 py-3 text-base font-bold ring-2 transition',
                          already
                            ? 'bg-emerald-100 text-emerald-800 ring-emerald-300 cursor-not-allowed opacity-70'
                            : 'bg-white text-amber-900 ring-amber-400 hover:bg-amber-100',
                        )}
                      >
                        Bulto <strong>{n} de {bagsCount}</strong>
                        {already && <span className="ml-1 text-emerald-700">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {isMultiBag && activeBag != null && (
          <div className={clsx(
            'rounded-lg px-3 py-3 ring-2',
            doneBags.has(activeBag)
              ? 'bg-emerald-50 ring-emerald-300'
              : 'bg-blue-50 ring-blue-400',
          )}>
            <div className="flex items-start gap-2">
              <Package className={clsx('shrink-0', doneBags.has(activeBag) ? 'text-emerald-700' : 'text-blue-700')} size={22} />
              <div className="flex-1">
                <div className={clsx('text-base font-bold uppercase', doneBags.has(activeBag) ? 'text-emerald-900' : 'text-blue-900')}>
                  Bulto {activeBag} de {bagsCount}
                  {doneBags.has(activeBag) && ' · registrado ✓'}
                </div>
                <div className={clsx('mt-1 text-sm', doneBags.has(activeBag) ? 'text-emerald-900' : 'text-blue-900')}>
                  Progreso {showLoadFlow ? 'de carga' : 'de clasificación'}:{' '}
                  <strong>{bagsForEvent.length}/{bagsCount}</strong>
                  {bagsForEvent.length > 0 && ' — bultos ya registrados: '}
                  {bagsForEvent.map((b, idx) => (
                    <span key={b.bag} className="font-medium">
                      #{b.bag}{idx < bagsForEvent.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                  {remainingBags.length > 0 && (
                    <>
                      {' · '}Faltan: {remainingBags.map((n, idx) => (
                        <span key={n} className="font-medium">
                          #{n}{idx < remainingBags.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </>
                  )}
                </div>
                {manualBag != null && bagFromQuery == null && (
                  <button
                    type="button"
                    onClick={() => setManualBag(null)}
                    className="mt-2 text-xs text-slate-600 underline hover:text-slate-900"
                  >
                    Cambiar bulto
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Card "Deshacer" con countdown 30s tras el último registro. Solo el
            mismo actor puede deshacer dentro de la ventana (validado server). */}
        {canUndo && lastRegisteredBag && (
          <div className="rounded-lg bg-slate-100 px-3 py-2 ring-1 ring-slate-300 flex items-center justify-between gap-2">
            <div className="text-xs text-slate-700">
              Registraste <strong>Bulto {lastRegisteredBag.bag} de {bagsCount}</strong> como {lastRegisteredBag.event === 'classified' ? 'clasificado' : 'cargado'}.
              Puedes deshacer por <strong>{Math.ceil(undoRemainingMs / 1000)}s</strong> más.
            </div>
            <button
              type="button"
              onClick={() => undoBag.mutate({ bag: lastRegisteredBag.bag, event: lastRegisteredBag.event })}
              disabled={undoBag.isPending}
              className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-slate-800 ring-1 ring-slate-400 hover:bg-slate-50 disabled:opacity-60"
            >
              <X size={12} className="inline" /> Deshacer
            </button>
          </div>
        )}

        {(showClassifyFlow || showLoadFlow) && order.partialApproved && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-300">
            <div className="flex items-start gap-2">
              <ShieldCheck className="shrink-0 text-emerald-700" size={18} />
              <div className="flex-1 text-sm text-emerald-900">
                <div className="font-semibold">Entrega parcial aprobada</div>
                {order.partialDeliveryNote && <div className="text-xs">{order.partialDeliveryNote}</div>}
              </div>
            </div>
          </div>
        )}

        {/* ─────────── CLASIFICACIÓN ─────────── */}
        {showClassifyFlow && (
          <div className="card space-y-3 p-4 ring-1 ring-brand-100">
            <div>
              <div className="text-xs uppercase text-brand-700">Acción · Clasificación</div>
              <div className="text-base font-semibold text-slate-800">Confirma que este pedido fue separado a su ruma de ruta.</div>
            </div>
            <RouteProgressHero routes={routesProgress || []} mode="classified" highlightRoute={order.route} />
            <RouteProgressPills routes={routesProgress || []} mode="classified" highlightRoute={order.route} />
            {/* Warning suave: secuencia aún no 100% empacada */}
            {order.sequenceProgress && order.sequenceProgress.pendingPack > 0 && (
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-300">
                <strong>⚠ Hay {order.sequenceProgress.pendingPack} pedido{order.sequenceProgress.pendingPack === 1 ? '' : 's'} de la secuencia #{order.sequenceProgress.sequenceId} sin empacar aún.</strong>
                <div className="mt-0.5 text-xs">Puedes clasificar este, pero idealmente espera a que termine el packing.</div>
              </div>
            )}
            {actionError && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</div>
            )}
            <button
              onClick={() => classify.mutate(isMultiBag ? activeBag ?? undefined : undefined)}
              disabled={!canFire}
              className="btn-primary w-full"
            >
              <CheckCircle2 size={18} />
              {classify.isPending
                ? 'Clasificando…'
                : isMultiBag && activeBag != null
                  ? `Confirmar clasificación del bulto ${activeBag}`
                  : 'Confirmar clasificación'}
            </button>
          </div>
        )}

        {/* ─────────── CARGA ─────────── */}
        {showLoadFlow && (
          <div className="card space-y-3 p-4 ring-1 ring-emerald-100">
            <div>
              <div className="text-xs uppercase text-emerald-700">Acción · Carga al vehículo</div>
              <div className="text-base font-semibold text-slate-800">Confirma que esta bolsa subió a la camioneta.</div>
            </div>
            <RouteProgressHero routes={routesProgress || []} mode="loaded" highlightRoute={order.route} />
            <RouteProgressPills routes={routesProgress || []} mode="loaded" highlightRoute={order.route} />
            {/* Warning suave: secuencia aún no 100% clasificada */}
            {order.sequenceProgress && order.sequenceProgress.pendingClassify > 0 && (
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-300">
                <strong>⚠ Hay {order.sequenceProgress.pendingClassify} pedido{order.sequenceProgress.pendingClassify === 1 ? '' : 's'} de la secuencia #{order.sequenceProgress.sequenceId} sin clasificar aún.</strong>
                <div className="mt-0.5 text-xs">Puedes cargar este, pero idealmente espera a que termine la clasificación.</div>
              </div>
            )}
            {actionError && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</div>
            )}
            <button
              onClick={() => markLoaded.mutate(isMultiBag ? activeBag ?? undefined : undefined)}
              disabled={!canFire}
              className="btn-primary w-full"
            >
              <Truck size={18} />
              {markLoaded.isPending
                ? 'Marcando…'
                : isMultiBag && activeBag != null
                  ? `Confirmar carga del bulto ${activeBag}`
                  : 'Confirmar carga al vehículo'}
            </button>
          </div>
        )}

        {/* Nota: hasta v0.18.2 aquí había un form para aprobar entrega
            parcial cuando el B2 estaba incompleto. Ya no aplica porque el
            /loaded no bloquea. El endpoint POST /orders/:id/partial-delivery
            sigue existiendo por si se aprueba por otro medio (queda como
            pieza opcional para preservar el badge y la sección del albarán). */}

        {/* ─────────── Éxito clasificación / carga ───────────
            Diferenciamos el mensaje según el pedido esté completo (todos los
            bultos) vs solo se registró uno más de multi-bulto. */}
        {justClassified && (
          <SuccessCard
            title="✓ Pedido clasificado (completo)"
            description={`Pedido #${order.number} agrupado en la ruma de ${order.route || 'su ruta'} — todos los ${bagsCount} bulto${bagsCount === 1 ? '' : 's'} confirmados.`}
          />
        )}
        {justLoaded && (
          <SuccessCard
            title="✓ Cargado al vehículo (completo)"
            description={`Pedido #${order.number} subido a la camioneta de ${order.route || 'su ruta'} — todos los ${bagsCount} bulto${bagsCount === 1 ? '' : 's'} confirmados.`}
          />
        )}

        {/* ─────────── Estados informativos ─────────── */}
        {isAlreadyLoaded && !justLoaded && (
          <div className="card space-y-1 p-4 ring-1 ring-emerald-200">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 size={18} />
              <strong>{order.status === 'delivered' ? 'Entregado' : 'Ya cargado al vehículo'}</strong>
            </div>
            {order.loadedAt && (
              <div className="text-xs text-slate-500">
                Cargado el {new Date(order.loadedAt).toLocaleString('es-CL')}.
              </div>
            )}
          </div>
        )}

        {isBlocked && (
          <div className="card space-y-1 p-4 ring-1 ring-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertOctagon size={18} />
              <strong>Pedido bloqueado</strong>
            </div>
            <div className="text-xs text-slate-500">
              Fue removido de su secuencia. Tiene que volver a entrar a una nueva secuencia.
            </div>
          </div>
        )}

        {isNotPacked && (
          <div className="card space-y-1 p-4 ring-1 ring-amber-200">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle size={18} />
              <strong>Pedido aún no empacado</strong>
            </div>
            <div className="text-xs text-slate-500">
              Tiene que pasar por packing antes de clasificar o cargar.
            </div>
          </div>
        )}

        {/* Contenido en la bolsa (siempre visible cuando hay items B1) */}
        {b1Items.length > 0 && (
          <div className="card p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Contenido en la bolsa</h3>
            <ul className="space-y-2">
              {b1Items.map((it) => (
                <li key={it.id} className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                    {it.product.thumbnailUrl ? (
                      <img src={it.product.thumbnailUrl} alt={it.product.name} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon size={18} className="text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium break-words">{it.lineName || it.product.name}</div>
                    <div className="text-xs text-slate-500">{it.product.sku || '—'}</div>
                  </div>
                  <div className="font-bold text-brand-700">×{it.qty}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Acciones secundarias / login */}
        <div className="space-y-2">
          {user ? (
            <>
              <button
                type="button"
                onClick={() => ordersApi.openAlbaran(order.id, bagsCount > 1 ? { bags: bagsCount } : undefined).catch((e) => console.error(e))}
                className="btn-ghost w-full border border-slate-300"
              >
                <Printer size={18} />
                {bagsCount > 1 ? `Reimprimir albarán (${bagsCount} bultos)` : 'Reimprimir albarán'}
              </button>
              {!showScanner && (
                <button
                  type="button"
                  onClick={() => { setShowScanner(true); setScanError(null); }}
                  className="btn-ghost w-full border border-slate-300"
                >
                  <Camera size={18} />
                  Escanear otro pedido
                </button>
              )}
              {showScanner && (
                <div className="card space-y-2 p-3 ring-1 ring-brand-100">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-700">Escáner</div>
                    <button
                      type="button"
                      onClick={() => setShowScanner(false)}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      <X size={14} className="inline" /> Cerrar
                    </button>
                  </div>
                  <QRScanner
                    onScan={(text) => {
                      const wpId = parseQrToWpId(text);
                      if (wpId == null) {
                        setScanError(`QR no reconocido: "${text.slice(0, 60)}"`);
                        return;
                      }
                      setShowScanner(false);
                      navigate(`/scan/${wpId}`);
                    }}
                  />
                  {scanError && (
                    <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{scanError}</div>
                  )}
                </div>
              )}
              <Link to="/" className="btn-ghost w-full border border-slate-300">
                <Home size={16} />
                Volver al inicio
              </Link>
            </>
          ) : (
            <div className="card space-y-2 p-4 ring-1 ring-amber-200">
              <div className="flex items-start gap-2 text-amber-800">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <div className="text-sm">
                  Inicia sesión para clasificar, cargar o reimprimir el albarán.
                </div>
              </div>
              <Link
                to={`/login?from=${encodeURIComponent(`/scan/${wpOrderId}`)}`}
                className="btn-primary w-full"
              >
                <LogIn size={16} />
                Ingresar
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Modal selector cuando hay 2+ acciones aplicables (ver
          availableActions). classify sí entra al selector cuando la cuenta
          tiene cap load además de otra cap — antes se auto-navegaba a
          pickB2 y el usuario quedaba trabado ahí sin poder despachar. */}
      {showSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md space-y-3 p-4">
            <div>
              <h3 className="text-base font-semibold">¿Qué quieres hacer con este pedido?</h3>
              <p className="mt-1 text-xs text-slate-500">
                Tu cuenta tiene varios roles aplicables a #{order.number}. Elige una acción.
              </p>
            </div>
            <div className="space-y-2">
              {/* Orden intencional: classify primero (permite despachar el
                  pedido aunque el B2 siga pendiente), luego pickB2, luego
                  pack. Coincide con availableActions arriba. */}
              {canLoad && order.status === 'packed' && (
                <SelectorAction
                  icon={<CheckCircle2 size={20} />}
                  title="Clasificar"
                  description={`Confirmar que el pedido está listo para su ruta. El ${warehouseLabel('B2')} pendiente NO bloquea — se completa aparte.`}
                  onClick={() => pickSelectorAction('classify')}
                />
              )}
              {canPickB2 && order.b2Pickable && (
                <SelectorAction
                  icon={<ClipboardCheck size={20} />}
                  title={`Pickear ${warehouseLabel('B2')}`}
                  description={`Armar la sub-bolsa con los items de ${warehouseLabel('B2')} y cerrar el ${warehouseLabel('B2')}.`}
                  onClick={() => pickSelectorAction('pickB2')}
                />
              )}
              {canPack && order.packable && (
                <SelectorAction
                  icon={<ClipboardCheck size={20} />}
                  title={`Empacar ${warehouseLabel('B1')}`}
                  description={`Armar la bolsa con los items de ${warehouseLabel('B1')} y cerrar el pedido.`}
                  onClick={() => pickSelectorAction('pack')}
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowSelector(false)}
              className="w-full text-xs text-slate-500 hover:underline"
            >
              Cancelar y ver detalle del pedido
            </button>
          </div>
        </div>
      )}
    </ScanShell>
  );
}

function SuccessCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="card space-y-1 p-4 ring-2 ring-emerald-300 bg-emerald-50">
      <div className="text-base font-bold text-emerald-800">{title}</div>
      <div className="text-xs text-emerald-700">{description}</div>
      <div className="pt-1 text-[11px] italic text-emerald-700">
        Escaneá el siguiente pedido con el botón de abajo para seguir.
      </div>
    </div>
  );
}

function SelectorAction({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-brand-300 hover:bg-brand-50"
    >
      <div className="rounded-lg bg-brand-50 p-2 text-brand-700">{icon}</div>
      <div className="flex-1">
        <div className="font-medium text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
    </button>
  );
}

function ScanShell({ children }: { children: React.ReactNode }) {
  // Esta pantalla la abren los conductores al escanear el QR del albarán.
  // El badge "Vista Conductor" hace explícito de qué vista se trata para
  // quien la abre sin contexto, y el title de la pestaña refleja lo mismo
  // (útil cuando el conductor tiene varias pestañas abiertas).
  return (
    <div className="min-h-screen bg-slate-100">
      <ScanDocumentTitle />
      <header className="flex h-14 items-center gap-2 border-b border-slate-200 bg-white px-4">
        <div className="text-base font-bold text-brand-800">WMS Chimuelo</div>
        <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-200">
          Vista Conductor
        </span>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-4">{children}</main>
    </div>
  );
}

// Setea el title de la pestaña a "Vista Conductor · #<orderNumber>" mientras
// la vista está montada. Lee el wpOrderId de la URL para que el title
// refleje el pedido actual; al desmontar restaura el title original. Es un
// componente para poder usar hooks sin reescribir Scan al envoltorio.
function ScanDocumentTitle() {
  const { wpOrderId } = useParams();
  useEffect(() => {
    const previous = document.title;
    document.title = wpOrderId ? `Vista Conductor · #${wpOrderId}` : 'Vista Conductor';
    return () => { document.title = previous; };
  }, [wpOrderId]);
  return null;
}
