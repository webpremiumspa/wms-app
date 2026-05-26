import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Truck, Printer, CheckCircle2, AlertTriangle, Image as ImageIcon, Home, LogIn } from 'lucide-react';
import { ordersApi } from '@/lib/sequences';
import { dispatchApi } from '@/lib/dispatch';
import { Spinner } from '@/components/Spinner';
import { B2Alert } from '@/components/B2Alert';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';

export function Scan() {
  const { wpOrderId } = useParams();
  const idNum = Number(wpOrderId);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const canLoad = hasCap(user, CAPS.LOAD);

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
            {order.route && <Badge variant="blue">{order.route}</Badge>}
            {order.stopPosition != null && <Badge variant="gray">Parada {order.stopPosition}</Badge>}
            <Badge variant={isLoaded ? 'green' : 'gray'}>{order.status}</Badge>
          </div>
          <div className="text-sm text-slate-700">{order.customerName || '—'}</div>
          {order.customerAddress && (
            <div className="text-xs text-slate-500">{order.customerAddress}</div>
          )}
        </div>

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
                  Inicia sesión para confirmar carga al vehículo o reimprimir el albarán.
                </div>
              </div>
              <Link to="/login" className="btn-primary w-full">
                <LogIn size={16} />
                Ingresar
              </Link>
            </div>
          )}
        </div>
      </div>
    </ScanShell>
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
