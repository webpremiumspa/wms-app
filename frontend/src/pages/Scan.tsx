import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Truck, Printer, CheckCircle2, AlertTriangle, Image as ImageIcon, Home, LogIn, ClipboardCheck, Camera, X } from 'lucide-react';
import { ordersApi } from '@/lib/sequences';
import { dispatchApi } from '@/lib/dispatch';
import { orderStatusLabel } from '@/lib/labels';
import { Spinner } from '@/components/Spinner';
import { B2Alert } from '@/components/B2Alert';
import { Badge } from '@/components/Badge';
import { ShippingBadge } from '@/components/ShippingBadge';
import { QRScanner } from '@/components/QRScanner';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';

// Extrae wpOrderId del payload del QR. Soporta URL nueva (/scan/<id>) y
// legacy (WMS:<id>). Devuelve null si no reconoce el formato.
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

  // Endpoint público: no requiere auth, devuelve datos del pedido + items.
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order-public', idNum],
    queryFn: () => ordersApi.getPublicByWpId(idNum),
    enabled: Number.isFinite(idNum) && idNum > 0,
  });

  const markLoaded = useMutation({
    mutationFn: () => dispatchApi.loaded(order!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order-public', idNum] }),
  });

  // Computa qué acciones aplican a este pedido para este usuario.
  // Si solo aplica 1 → auto-redirect (sin pregunta).
  // Si aplican 2+ → mostramos selector para que el operador elija.
  // Si 0 → landing normal con info del pedido.
  const availableActions: Array<'pack' | 'pickB2' | 'load'> = (() => {
    if (!user || !order) return [];
    const actions: Array<'pack' | 'pickB2' | 'load'> = [];
    if (canPack && order.packable && order.openSequenceId) actions.push('pack');
    if (canPickB2 && order.b2Pickable && order.openSequenceId) actions.push('pickB2');
    if (canLoad && ['packed', 'classified'].includes(order.status)) actions.push('load');
    return actions;
  })();

  useEffect(() => {
    if (!user || !order || availableActions.length === 0) return;
    // Una sola acción → auto-redirect a la vista correspondiente (excepto
    // 'load' que es un botón en la misma página, no una navegación).
    if (availableActions.length === 1) {
      const only = availableActions[0];
      if (only === 'pack') {
        navigate(`/sequences/${order.openSequenceId}/packing/${order.id}`, { replace: true });
      } else if (only === 'pickB2') {
        navigate(`/sequences/${order.openSequenceId}/picking-b2/${order.id}`, { replace: true });
      }
      // 'load' → se queda en /scan y muestra el botón estándar.
      return;
    }
    // 2+ acciones → mostrar selector.
    setShowSelector(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, order?.id, order?.status, availableActions.length]);

  function pickAction(kind: 'pack' | 'pickB2' | 'load') {
    setShowSelector(false);
    if (!order) return;
    if (kind === 'pack' && order.openSequenceId) {
      navigate(`/sequences/${order.openSequenceId}/packing/${order.id}`);
    } else if (kind === 'pickB2' && order.openSequenceId) {
      navigate(`/sequences/${order.openSequenceId}/picking-b2/${order.id}`);
    }
    // 'load' → no navega; el usuario verá el botón "Confirmar carga al vehículo"
    // junto con el banner B2 si aplica (queda en /scan).
  }

  if (!Number.isFinite(idNum) || idNum <= 0) {
    return <ScanShell><div className="card p-6 text-center text-red-700">ID de pedido inválido en la URL.</div></ScanShell>;
  }
  if (isLoading) return <ScanShell><Spinner /></ScanShell>;
  if (error || !order) {
    return (
      <ScanShell>
        <div className="space-y-3">
          <div className="card p-6 text-center text-slate-600">
            Pedido <strong>#{wpOrderId}</strong> no encontrado en el WMS.
          </div>
        </div>
      </ScanShell>
    );
  }

  const b1Items = order.items.filter((i) => i.warehouse === 'B1');
  const b2Items = order.items.filter((i) => i.warehouse === 'B2');
  const isLoaded = order.status === 'loaded' || order.status === 'delivered';

  return (
    <ScanShell>
      <div className="space-y-4 pb-4">
        {/* Header con datos clave */}
        <div className="card space-y-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-bold">#{order.number}</span>
            <Badge variant={isLoaded ? 'green' : 'gray'}>{orderStatusLabel(order.status)}</Badge>
            <ShippingBadge method={order.shippingMethod} />
          </div>
          <div className="text-sm text-slate-700">{order.customerName || '—'}</div>
          {order.customerAddress && (
            <div className="text-xs text-slate-500">{order.customerAddress}</div>
          )}
        </div>

        {/* Bloque grande de ruta — clave para el operador de clasificación.
            Si el pedido todavía no tiene ruta, lo decimos explícitamente
            (acá sí, porque al escanear es momento de saberlo). */}
        {order.route ? (
          <div className="rounded-xl bg-brand-50 p-4 ring-1 ring-brand-100">
            <div className="text-xs uppercase tracking-wide text-brand-700">Ruta · Parada</div>
            <div className="mt-1 flex items-baseline gap-3">
              <div className="text-4xl font-bold text-brand-800">{order.route}</div>
              {order.stopPosition != null && (
                <div className="text-2xl font-semibold text-brand-700">· {order.stopPosition}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200">
            <AlertTriangle size={16} />
            Este pedido aún no tiene ruta asignada.
          </div>
        )}

        {/* Alerta gigante con sonido + vibración si hay B2 */}
        {order.hasB2Pending && (
          <B2Alert
            items={b2Items.map((i) => ({
              sku: i.product.sku,
              name: i.product.name,
              qty: i.qty,
              thumbnailUrl: i.product.thumbnailUrl,
            }))}
          />
        )}

        {/* Contenido en la bolsa */}
        <div className="card p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Contenido en la bolsa</h3>
          {b1Items.length === 0 ? (
            <div className="text-sm text-slate-500">Sin items B1.</div>
          ) : (
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
                    <div className="truncate font-medium">{it.product.name}</div>
                    <div className="text-xs text-slate-500">{it.product.sku || '—'}</div>
                  </div>
                  <div className="font-bold text-brand-700">×{it.qty}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Acciones */}
        <div className="space-y-2">
          {user ? (
            <>
              {canPack && order.packable && order.openSequenceId && (
                <button
                  onClick={() => navigate(`/sequences/${order.openSequenceId}/packing/${order.id}`)}
                  className="btn-primary w-full"
                >
                  <ClipboardCheck size={18} />
                  Empacar este pedido
                </button>
              )}
              {canPickB2 && order.b2Pickable && order.openSequenceId && !order.packable && (
                <button
                  onClick={() => navigate(`/sequences/${order.openSequenceId}/picking-b2/${order.id}`)}
                  className="btn-primary w-full"
                >
                  <ClipboardCheck size={18} />
                  Pickear B2 de este pedido
                </button>
              )}
              {canLoad && order.status === 'packed' && (
                <button
                  onClick={() => markLoaded.mutate()}
                  disabled={markLoaded.isPending}
                  className="btn-primary w-full"
                >
                  <Truck size={18} />
                  {markLoaded.isPending ? 'Marcando…' : 'Confirmar carga al vehículo'}
                </button>
              )}
              {canLoad && isLoaded && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  <CheckCircle2 size={18} />
                  Cargado al vehículo ✓
                </div>
              )}
              <button
                type="button"
                onClick={() => ordersApi.openAlbaran(order.id).catch((e) => console.error(e))}
                className="btn-ghost w-full border border-slate-300"
              >
                <Printer size={18} />
                Reimprimir albarán
              </button>

              {/* Para repartidores y operadores de carga: cámara embebida para
                  escanear el siguiente pedido sin volver a abrir la cámara
                  externa cada vez. */}
              {/* Cualquier usuario logueado puede usar el escáner embebido —
                  útil para repartidores que no tienen un cap específico. */}
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
                  {order.packable
                    ? 'Inicia sesión para empacar este pedido (queda registrado a tu nombre).'
                    : order.status === 'packed'
                    ? 'Inicia sesión para confirmar carga al vehículo o reimprimir el albarán.'
                    : 'Inicia sesión para acceder a este pedido.'}
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

      {/* Modal selector cuando el usuario tiene 2+ acciones posibles para
          este pedido (ej. caps B1+B2, o B2+Load). Si solo aplica 1 acción,
          el useEffect ya redirigió. Si 0, no se muestra. */}
      {showSelector && availableActions.length >= 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md space-y-3 p-4">
            <div>
              <h3 className="text-base font-semibold">¿Qué quieres hacer con este pedido?</h3>
              <p className="mt-1 text-xs text-slate-500">
                Tu cuenta tiene varios roles aplicables a #{order.number}. Elige una acción.
              </p>
            </div>

            <div className="space-y-2">
              {availableActions.includes('pack') && (
                <SelectorAction
                  icon={<ClipboardCheck size={20} />}
                  title="Empacar B1"
                  description="Armar la bolsa con los items de Bodega 1 y cerrar el pedido."
                  onClick={() => pickAction('pack')}
                />
              )}
              {availableActions.includes('pickB2') && (
                <SelectorAction
                  icon={<ClipboardCheck size={20} />}
                  title="Pickear B2"
                  description="Armar la sub-bolsa con los items de Bodega 2 y cerrar el B2."
                  onClick={() => pickAction('pickB2')}
                />
              )}
              {availableActions.includes('load') && (
                <SelectorAction
                  icon={<Truck size={20} />}
                  title="Cargar al vehículo"
                  description="Confirmar que la bolsa está cargada en la camioneta de la ruta."
                  onClick={() => pickAction('load')}
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

// Shell minimal sin sidebar, accesible sin login.
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
