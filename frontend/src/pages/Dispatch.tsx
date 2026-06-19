import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Truck, CheckCircle2, AlertTriangle, RotateCcw, AlertOctagon, ShieldCheck, RefreshCw } from 'lucide-react';
import { dispatchApi, type DispatchOrder } from '@/lib/dispatch';
import { ordersApi } from '@/lib/sequences';
import { syncApi } from '@/lib/sync';
import { QRScanner } from '@/components/QRScanner';
import { Badge } from '@/components/Badge';
import { ShippingBadge } from '@/components/ShippingBadge';
import { Spinner } from '@/components/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';

export function Dispatch() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canApprovePartial = hasCap(user, CAPS.PACK_B1) || hasCap(user, CAPS.SUPERVISE);
  const [scanned, setScanned] = useState<DispatchOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [partialNote, setPartialNote] = useState('');
  const [showPartialForm, setShowPartialForm] = useState(false);
  const [partialError, setPartialError] = useState<string | null>(null);

  const scan = useMutation({
    mutationFn: (qr: string) => dispatchApi.scan(qr),
    onSuccess: (order) => {
      setError(null);
      setScanned(order);
      queryClient.invalidateQueries({ queryKey: ['dispatch-today'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'No se pudo procesar el QR');
    },
  });

  const markLoaded = useMutation({
    mutationFn: (orderId: number) => dispatchApi.loaded(orderId),
    onSuccess: () => {
      setScanned((s) => (s ? { ...s, status: 'loaded', loadedAt: new Date().toISOString() } : s));
      queryClient.invalidateQueries({ queryKey: ['dispatch-today'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'No se pudo confirmar la carga');
    },
  });

  const refreshRoutes = useMutation({
    mutationFn: () => syncApi.routes(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch-today'] });
    },
  });

  const approvePartial = useMutation({
    mutationFn: ({ orderId, note }: { orderId: number; note: string }) =>
      ordersApi.approvePartialDelivery(orderId, note),
    onSuccess: () => {
      // Re-escaneamos para refrescar el estado de loadability.
      if (scanned) {
        setScanned({
          ...scanned,
          partialApproved: true,
          partialDeliveryNote: partialNote || null,
          loadable: true,
        });
      }
      setShowPartialForm(false);
      setPartialNote('');
      setPartialError(null);
    },
    onError: (err: any) => {
      setPartialError(err.response?.data?.message || 'No se pudo aprobar la entrega parcial');
    },
  });

  const { data: summary } = useQuery({
    queryKey: ['dispatch-today'],
    queryFn: dispatchApi.today,
    refetchInterval: 4000,
  });

  function reset() {
    setScanned(null);
    setError(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Clasificación y carga</h2>
        <button
          type="button"
          onClick={() => refreshRoutes.mutate()}
          disabled={refreshRoutes.isPending}
          title="Vuelve a leer rutas y paradas desde WooCommerce. Útil si la app de rutas asignó después de empacar."
          className="flex items-center gap-1 rounded-lg bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={14} className={refreshRoutes.isPending ? 'animate-spin' : ''} />
          {refreshRoutes.isPending ? 'Refrescando…' : 'Refrescar rutas'}
        </button>
      </div>
      {refreshRoutes.data && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800 ring-1 ring-emerald-200">
          Rutas actualizadas: {refreshRoutes.data.updated} de {refreshRoutes.data.total} pedidos.
          {refreshRoutes.data.failed ? ` (${refreshRoutes.data.failed} fallidos)` : ''}
        </div>
      )}
      {refreshRoutes.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200">
          Error al refrescar rutas.
        </div>
      )}

      {!scanned && (
        <div className="card p-3">
          <QRScanner onScan={(text) => scan.mutate(text)} paused={scan.isPending} />
          {error && (
            <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
        </div>
      )}

      {scanned && (
        <div className="card space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Pedido</div>
              <div className="text-xl font-bold">#{scanned.number}</div>
            </div>
            <button onClick={reset} className="btn-ghost text-sm">
              <RotateCcw size={16} />
              Otro QR
            </button>
          </div>

          {scanned.route ? (
            <div className="rounded-xl bg-brand-50 p-4 ring-1 ring-brand-100">
              <div className="text-xs uppercase text-brand-700">Ruta · Parada</div>
              <div className="mt-1 flex items-baseline gap-3">
                <div className="text-4xl font-bold text-brand-800">{scanned.route}</div>
                {scanned.stopPosition != null && (
                  <div className="text-2xl font-semibold text-brand-700">· {scanned.stopPosition}</div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <AlertTriangle size={16} />
              Este pedido aún no tiene ruta asignada.
            </div>
          )}

          {/* Bloqueo B2: rojo grande, no se puede cargar */}
          {!scanned.loadable && scanned.missingB2Items.length > 0 && (
            <div className="rounded-lg bg-red-50 px-3 py-3 ring-2 ring-red-400">
              <div className="flex items-start gap-2">
                <AlertOctagon className="shrink-0 text-red-700" size={22} />
                <div className="flex-1">
                  <div className="text-base font-bold uppercase text-red-800">B2 incompleto — NO cargar</div>
                  <div className="mt-1 text-sm text-red-900">
                    Falta{scanned.missingB2Items.length === 1 ? '' : 'n'} <strong>{scanned.missingB2Items.length} item{scanned.missingB2Items.length === 1 ? '' : 's'}</strong> del granel B2:
                  </div>
                  <ul className="mt-1 list-disc pl-5 text-xs text-red-900">
                    {scanned.missingB2Items.map((it) => (
                      <li key={it.productId}>
                        {it.qty}× {it.name || `Producto ${it.productId}`} {it.sku && <span className="text-red-700">({it.sku})</span>}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 text-xs text-red-800">
                    Dejá la bolsa en el local hasta que se complete B2, o autorizá entrega parcial si el cliente acepta.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Entrega parcial ya aprobada */}
          {scanned.partialApproved && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-300">
              <div className="flex items-start gap-2">
                <ShieldCheck className="shrink-0 text-emerald-700" size={18} />
                <div className="flex-1 text-sm text-emerald-900">
                  <div className="font-semibold">Entrega parcial aprobada</div>
                  {scanned.partialDeliveryNote && <div className="text-xs">{scanned.partialDeliveryNote}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Aviso normal cuando hay B2 completo */}
          {scanned.hasB2Pending && scanned.loadable && !scanned.partialApproved && (
            <div className="rounded-lg bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900 ring-1 ring-amber-300">
              ⚠ Contiene productos pendientes de Bodega 2 (no olvidar el cargamento a granel)
            </div>
          )}

          <div className="text-sm text-slate-600">
            <div>{scanned.customerName || '—'}</div>
            {scanned.customerAddress && <div className="text-xs text-slate-500">{scanned.customerAddress}</div>}
            {scanned.shippingMethod && (
              <div className="mt-1"><ShippingBadge method={scanned.shippingMethod} /></div>
            )}
          </div>

          {scanned.status === 'loaded' ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <CheckCircle2 size={18} />
              Cargado al vehículo ✓
            </div>
          ) : (
            <>
              <button
                onClick={() => markLoaded.mutate(scanned.id)}
                disabled={markLoaded.isPending || !scanned.route || !scanned.loadable}
                className="btn-primary w-full"
              >
                <Truck size={18} />
                {markLoaded.isPending ? 'Marcando…' : 'Confirmar carga al vehículo'}
              </button>

              {/* Botón de aprobación parcial si está bloqueado y el operador tiene cap */}
              {!scanned.loadable && canApprovePartial && !showPartialForm && (
                <button
                  type="button"
                  onClick={() => { setPartialError(null); setShowPartialForm(true); }}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 ring-1 ring-emerald-300 hover:bg-emerald-100"
                >
                  <ShieldCheck size={14} />
                  Autorizar entrega parcial (cliente acepta sin estos items)
                </button>
              )}

              {showPartialForm && (
                <div className="mt-2 space-y-2 rounded-lg bg-white p-3 ring-1 ring-emerald-200">
                  <div className="text-xs font-medium text-slate-700">
                    Nota de aprobación (queda en el log)
                  </div>
                  <textarea
                    value={partialNote}
                    onChange={(e) => setPartialNote(e.target.value)}
                    placeholder="Ej: Cliente confirmó por WhatsApp a las 9:15."
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
                      onClick={() => approvePartial.mutate({ orderId: scanned.id, note: partialNote })}
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

      {/* Contadores por ruta — siempre visibles */}
      {summary && summary.length > 0 && (
        <div className="card space-y-3 p-4">
          <h3 className="text-sm font-semibold text-slate-700">Progreso por ruta</h3>
          {summary.map((r) => (
            <div key={r.route} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{r.route}</span>
                <div className="flex gap-2">
                  <Badge variant="blue">{r.classified}/{r.total} clasificados</Badge>
                  <Badge variant={r.loaded === r.total ? 'green' : 'gray'}>
                    {r.loaded}/{r.total} cargados
                  </Badge>
                  {r.b2Count > 0 && <Badge variant="amber">{r.b2Count} con B2</Badge>}
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-brand-600 transition-all"
                  style={{ width: `${r.total === 0 ? 0 : (r.loaded / r.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {!summary && <Spinner label="Cargando resumen…" />}
    </div>
  );
}
