import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
} from 'lucide-react';
import { ordersApi } from '@/lib/sequences';
import { dispatchApi } from '@/lib/dispatch';
import { orderStatusLabel, warehouseLabel } from '@/lib/labels';
import { Spinner } from '@/components/Spinner';
import { B2Alert } from '@/components/B2Alert';
import { Badge } from '@/components/Badge';
import { ShippingBadge } from '@/components/ShippingBadge';
import { CustomerNote } from '@/components/CustomerNote';
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
  const canApprovePartial = canPack || hasCap(user, CAPS.SUPERVISE);

  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [showPartialForm, setShowPartialForm] = useState(false);
  const [partialNote, setPartialNote] = useState('');
  const [partialError, setPartialError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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

  const approvePartial = useMutation({
    mutationFn: () => ordersApi.approvePartialDelivery(order!.id, partialNote),
    onSuccess: () => {
      setShowPartialForm(false);
      setPartialNote('');
      setPartialError(null);
      queryClient.invalidateQueries({ queryKey: ['order-public', idNum] });
    },
    onError: (err: any) => {
      setPartialError(err.response?.data?.message || 'No se pudo aprobar la entrega parcial');
    },
  });

  // Auto-redirect a packing/picking-b2 si solo aplica una de esas acciones.
  // Para 'classify' y 'load' no redirige — se muestran en esta misma pantalla.
  const navAction: 'pack' | 'pickB2' | null = (() => {
    if (!user || !order) return null;
    const opts: Array<'pack' | 'pickB2'> = [];
    if (canPack && order.packable && order.openSequenceId) opts.push('pack');
    if (canPickB2 && order.b2Pickable && order.openSequenceId) opts.push('pickB2');
    return opts.length === 1 ? opts[0] : null;
  })();

  const showSelectorNow = (() => {
    if (!user || !order) return false;
    const opts: number = (canPack && order.packable && order.openSequenceId ? 1 : 0)
      + (canPickB2 && order.b2Pickable && order.openSequenceId ? 1 : 0);
    return opts >= 2;
  })();

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

  function pickSelectorAction(kind: 'pack' | 'pickB2') {
    setShowSelector(false);
    if (!order) return;
    if (kind === 'pack' && order.openSequenceId) {
      navigate(`/sequences/${order.openSequenceId}/packing/${order.id}`);
    } else if (kind === 'pickB2' && order.openSequenceId) {
      navigate(`/sequences/${order.openSequenceId}/picking-b2/${order.id}`);
    }
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

  return (
    <ScanShell>
      <div className="space-y-4 pb-4">
        {/* Header */}
        <div className="card space-y-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-bold">#{order.number}</span>
            <Badge variant={isAlreadyLoaded ? 'green' : 'gray'}>{orderStatusLabel(order.status)}</Badge>
            <ShippingBadge method={order.shippingMethod} />
          </div>
          <div className="text-sm text-slate-700">{order.customerName || '—'}</div>
          {order.customerAddress && (
            <div className="text-xs text-slate-500">{order.customerAddress}</div>
          )}
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

        {/* ─────────── Bloqueo B2 (para clasificación / carga) ─────────── */}
        {(showClassifyFlow || showLoadFlow) && !order.loadable && (order.missingB2Items?.length ?? 0) > 0 && (
          <div className="rounded-lg bg-red-50 px-3 py-3 ring-2 ring-red-400">
            <div className="flex items-start gap-2">
              <AlertOctagon className="shrink-0 text-red-700" size={22} />
              <div className="flex-1">
                <div className="text-base font-bold uppercase text-red-800">{warehouseLabel('B2')} incompleto — NO {showLoadFlow ? 'cargar' : 'clasificar'}</div>
                <div className="mt-1 text-sm text-red-900">
                  Falta{(order.missingB2Items!.length === 1 ? '' : 'n')} <strong>{order.missingB2Items!.length} item{order.missingB2Items!.length === 1 ? '' : 's'}</strong> del granel {warehouseLabel('B2')}:
                </div>
                <ul className="mt-1 list-disc pl-5 text-xs text-red-900">
                  {order.missingB2Items!.map((it) => (
                    <li key={it.productId}>
                      {it.qty}× {it.name || `Producto ${it.productId}`} {it.sku && <span className="text-red-700">({it.sku})</span>}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 text-xs text-red-800">
                  Dejá la bolsa hasta que se complete {warehouseLabel('B2')}, o autorizá entrega parcial si el cliente acepta.
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
              <div className="text-base font-semibold text-slate-800">Confirmá que este pedido fue separado a su ruma de ruta.</div>
            </div>
            <RouteProgressHero routes={routesProgress || []} mode="classified" highlightRoute={order.route} />
            <RouteProgressPills routes={routesProgress || []} mode="classified" highlightRoute={order.route} />
            {/* Warning suave: secuencia aún no 100% empacada */}
            {order.sequenceProgress && order.sequenceProgress.pendingPack > 0 && (
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-300">
                <strong>⚠ Hay {order.sequenceProgress.pendingPack} pedido{order.sequenceProgress.pendingPack === 1 ? '' : 's'} de la secuencia #{order.sequenceProgress.sequenceId} sin empacar aún.</strong>
                <div className="mt-0.5 text-xs">Podés clasificar este, pero idealmente esperá a que termine el packing.</div>
              </div>
            )}
            {actionError && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</div>
            )}
            <button
              onClick={() => classify.mutate()}
              disabled={classify.isPending || !order.route || !order.loadable}
              className="btn-primary w-full"
            >
              <CheckCircle2 size={18} />
              {classify.isPending ? 'Clasificando…' : 'Confirmar clasificación'}
            </button>
            {!order.loadable && canApprovePartial && !showPartialForm && (
              <button
                type="button"
                onClick={() => { setPartialError(null); setShowPartialForm(true); }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 ring-1 ring-emerald-300 hover:bg-emerald-100"
              >
                <ShieldCheck size={14} />
                Autorizar entrega parcial (cliente acepta sin estos items)
              </button>
            )}
          </div>
        )}

        {/* ─────────── CARGA ─────────── */}
        {showLoadFlow && (
          <div className="card space-y-3 p-4 ring-1 ring-emerald-100">
            <div>
              <div className="text-xs uppercase text-emerald-700">Acción · Carga al vehículo</div>
              <div className="text-base font-semibold text-slate-800">Confirmá que esta bolsa subió a la camioneta.</div>
            </div>
            <RouteProgressHero routes={routesProgress || []} mode="loaded" highlightRoute={order.route} />
            <RouteProgressPills routes={routesProgress || []} mode="loaded" highlightRoute={order.route} />
            {/* Warning suave: secuencia aún no 100% clasificada */}
            {order.sequenceProgress && order.sequenceProgress.pendingClassify > 0 && (
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-300">
                <strong>⚠ Hay {order.sequenceProgress.pendingClassify} pedido{order.sequenceProgress.pendingClassify === 1 ? '' : 's'} de la secuencia #{order.sequenceProgress.sequenceId} sin clasificar aún.</strong>
                <div className="mt-0.5 text-xs">Podés cargar este, pero idealmente esperá a que termine la clasificación.</div>
              </div>
            )}
            {actionError && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</div>
            )}
            <button
              onClick={() => markLoaded.mutate()}
              disabled={markLoaded.isPending || !order.route || !order.loadable}
              className="btn-primary w-full"
            >
              <Truck size={18} />
              {markLoaded.isPending ? 'Marcando…' : 'Confirmar carga al vehículo'}
            </button>
            {!order.loadable && canApprovePartial && !showPartialForm && (
              <button
                type="button"
                onClick={() => { setPartialError(null); setShowPartialForm(true); }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 ring-1 ring-emerald-300 hover:bg-emerald-100"
              >
                <ShieldCheck size={14} />
                Autorizar entrega parcial (cliente acepta sin estos items)
              </button>
            )}
          </div>
        )}

        {/* Form de aprobación parcial (compartido por classify y load flow) */}
        {(showClassifyFlow || showLoadFlow) && showPartialForm && (
          <div className="card space-y-2 p-3 ring-1 ring-emerald-200">
            <div className="text-xs font-medium text-slate-700">Nota de aprobación (queda en el log)</div>
            <textarea
              value={partialNote}
              onChange={(e) => setPartialNote(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Ej: Cliente acepta sin Beneful 10kg — quedó en deuda para el próximo envío."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            {partialError && (
              <div className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-700">{partialError}</div>
            )}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setShowPartialForm(false); setPartialNote(''); }}
                className="text-xs text-slate-600 hover:underline"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => approvePartial.mutate()}
                disabled={approvePartial.isPending}
                className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {approvePartial.isPending ? 'Aprobando…' : 'Confirmar aprobación'}
              </button>
            </div>
          </div>
        )}

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
                onClick={() => ordersApi.openAlbaran(order.id).catch((e) => console.error(e))}
                className="btn-ghost w-full border border-slate-300"
              >
                <Printer size={18} />
                Reimprimir albarán
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

      {/* Modal selector cuando hay 2+ acciones de PACKING posibles
          (cap B1 + cap B2 sobre el mismo pedido). Las acciones load/classify
          NO entran al selector porque ahora se ejecutan inline. */}
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
              {canPack && order.packable && (
                <SelectorAction
                  icon={<ClipboardCheck size={20} />}
                  title={`Empacar ${warehouseLabel('B1')}`}
                  description={`Armar la bolsa con los items de ${warehouseLabel('B1')} y cerrar el pedido.`}
                  onClick={() => pickSelectorAction('pack')}
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
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="flex h-14 items-center border-b border-slate-200 bg-white px-4">
        <div className="text-base font-bold text-brand-800">WMS Chimuelo</div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-4">{children}</main>
    </div>
  );
}
