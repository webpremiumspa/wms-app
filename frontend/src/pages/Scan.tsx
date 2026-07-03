import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

function parseQrToWpId(raw: string): number | null {
  const trimmed = raw.trim();
  const urlMatch = trimmed.match(/\/scan\/(\d+)(?:[/?#]|$)/);
  if (urlMatch) return Number(urlMatch[1]);
  const wmsMatch = trimmed.match(/^WMS:(\d+)$/);
  if (wmsMatch) return Number(wmsMatch[1]);
  return null;
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
  // Nota: se sacaron showPartialForm / partialNote / partialError junto con
  // el bloqueo de carga por B2 incompleto. El endpoint POST /orders/:id/
  // partial-delivery sigue existiendo, pero no se llama desde Scan.
  const [actionError, setActionError] = useState<string | null>(null);
  // Si el pedido tiene >1 bultos, el cargador/clasificador debe confirmar
  // uno por uno. En la operación real las bolsas van a un sector y las
  // cajas a otro, así que exigir "los tengo todos a la vista" era imposible
  // de cumplir. Con checks por bulto individual el conductor puede tildar
  // "Bulto 1 de 3" mientras está en la zona de bolsas, después "Bulto 3 de 3"
  // cuando pasa por la zona de cajas, etc. Al tildar todos se habilita el
  // botón de clasificar/cargar.
  const [confirmedBags, setConfirmedBags] = useState<Set<number>>(new Set());
  function toggleBag(n: number) {
    setConfirmedBags((s) => {
      const next = new Set(s);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

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

  const classify = useMutation({
    mutationFn: () => dispatchApi.classify(order!.id),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['order-public', idNum] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-today'] });
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'No se pudo clasificar el pedido');
    },
  });

  const markLoaded = useMutation({
    mutationFn: () => dispatchApi.loaded(order!.id),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['order-public', idNum] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-today'] });
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'No se pudo confirmar la carga');
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
      navigate(`/sequences/${order.openSequenceId}/packing/${order.id}`, { replace: true });
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
      navigate(`/sequences/${order.openSequenceId}/packing/${order.id}`);
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
  // Bloqueo blando multi-bulto: si N>1, exigir tildar los N checkboxes antes
  // de clasificar/cargar. allBagsConfirmed es true cuando el operador tildó
  // cada bulto (por su número 1..N).
  const bagsCount = order.bagsExpected ?? 1;
  const requiresBagsConfirm = bagsCount > 1 && (showClassifyFlow || showLoadFlow);
  const allBagsConfirmed = !requiresBagsConfirm || (() => {
    for (let i = 1; i <= bagsCount; i += 1) if (!confirmedBags.has(i)) return false;
    return true;
  })();

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

        {/* ─────────── Banner multi-bulto (clasificación / carga) ───────────
            Un checkbox por bulto. Las bolsas y las cajas viven en zonas
            distintas del deposito; el conductor tilda cada bulto a medida
            que lo ubica. Solo se habilita el boton al tildar los N. */}
        {requiresBagsConfirm && (
          <div className="rounded-lg bg-blue-50 px-3 py-3 ring-2 ring-blue-400">
            <div className="flex items-start gap-2">
              <Package className="shrink-0 text-blue-700" size={22} />
              <div className="flex-1">
                <div className="text-base font-bold uppercase text-blue-900">
                  Pedido con {bagsCount} bultos
                </div>
                <div className="mt-1 text-sm text-blue-900">
                  Tilda cada bulto a medida que lo ubicas (bolsas y cajas suelen estar en zonas distintas).
                  Confirma los <strong>{bagsCount}</strong> antes de {showLoadFlow ? 'cargar al vehículo' : 'clasificar'}.
                </div>
                <div className="mt-2 space-y-1.5">
                  {Array.from({ length: bagsCount }, (_, idx) => idx + 1).map((n) => {
                    const checked = confirmedBags.has(n);
                    return (
                      <label
                        key={n}
                        className={clsx(
                          'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 ring-1 transition',
                          checked
                            ? 'bg-emerald-50 ring-emerald-300'
                            : 'bg-white ring-blue-300 hover:bg-blue-100/40',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleBag(n)}
                          className="h-5 w-5 accent-blue-600"
                        />
                        <span className={clsx('text-sm font-medium', checked ? 'text-emerald-900' : 'text-blue-900')}>
                          Bulto <strong>{n} de {bagsCount}</strong>
                          {checked && ' ✓'}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-blue-800">
                    {confirmedBags.size}/{bagsCount} confirmados
                  </span>
                  {confirmedBags.size < bagsCount && (
                    <button
                      type="button"
                      onClick={() => setConfirmedBags(new Set(Array.from({ length: bagsCount }, (_, idx) => idx + 1)))}
                      className="text-blue-700 underline hover:text-blue-900"
                    >
                      Marcar todos
                    </button>
                  )}
                  {confirmedBags.size > 0 && (
                    <button
                      type="button"
                      onClick={() => setConfirmedBags(new Set())}
                      className="text-slate-500 underline hover:text-slate-700"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
            </div>
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
              onClick={() => classify.mutate()}
              disabled={classify.isPending || !order.route || !allBagsConfirmed}
              className="btn-primary w-full"
            >
              <CheckCircle2 size={18} />
              {classify.isPending ? 'Clasificando…' : 'Confirmar clasificación'}
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
              onClick={() => markLoaded.mutate()}
              disabled={markLoaded.isPending || !order.route || !allBagsConfirmed}
              className="btn-primary w-full"
            >
              <Truck size={18} />
              {markLoaded.isPending ? 'Marcando…' : 'Confirmar carga al vehículo'}
            </button>
          </div>
        )}

        {/* Nota: hasta v0.18.2 aquí había un form para aprobar entrega
            parcial cuando el B2 estaba incompleto. Ya no aplica porque el
            /loaded no bloquea. El endpoint POST /orders/:id/partial-delivery
            sigue existiendo por si se aprueba por otro medio (queda como
            pieza opcional para preservar el badge y la sección del albarán). */}

        {/* ─────────── Éxito clasificación / carga ─────────── */}
        {justClassified && (
          <SuccessCard
            title="✓ Pedido clasificado"
            description={`Pedido #${order.number} agrupado en la ruma de ${order.route || 'su ruta'}.`}
          />
        )}
        {justLoaded && (
          <SuccessCard
            title="✓ Cargado al vehículo"
            description={`Pedido #${order.number} subido a la camioneta de ${order.route || 'su ruta'}.`}
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
