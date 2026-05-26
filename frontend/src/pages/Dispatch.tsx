import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Truck, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import { dispatchApi, type DispatchOrder } from '@/lib/dispatch';
import { QRScanner } from '@/components/QRScanner';
import { Badge } from '@/components/Badge';
import { Spinner } from '@/components/Spinner';

export function Dispatch() {
  const queryClient = useQueryClient();
  const [scanned, setScanned] = useState<DispatchOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      <h2 className="text-xl font-semibold">Clasificación y carga</h2>

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

          {scanned.hasB2Pending && (
            <div className="rounded-lg bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900 ring-1 ring-amber-300">
              ⚠ Contiene productos pendientes de Bodega 2 (no olvidar el cargamento a granel)
            </div>
          )}

          <div className="text-sm text-slate-600">
            <div>{scanned.customerName || '—'}</div>
            {scanned.customerAddress && <div className="text-xs text-slate-500">{scanned.customerAddress}</div>}
          </div>

          {scanned.status === 'loaded' ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <CheckCircle2 size={18} />
              Cargado al vehículo ✓
            </div>
          ) : (
            <button
              onClick={() => markLoaded.mutate(scanned.id)}
              disabled={markLoaded.isPending || !scanned.route}
              className="btn-primary w-full"
            >
              <Truck size={18} />
              {markLoaded.isPending ? 'Marcando…' : 'Confirmar carga al vehículo'}
            </button>
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
