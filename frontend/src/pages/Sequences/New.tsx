import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ChevronLeft, RefreshCw, CheckCircle2, X, Trash2, CheckSquare } from 'lucide-react';
import { sequencesApi } from '@/lib/sequences';
import { syncApi, type SyncResult } from '@/lib/sync';
import { orderStatusLabel, sequenceStatusLabel } from '@/lib/labels';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { ShippingBadge } from '@/components/ShippingBadge';
import type { StockProblem } from '@/lib/types';
import clsx from 'clsx';

export function SequenceNew() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [problems, setProblems] = useState<StockProblem[] | null>(null);

  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const { data: pending, isLoading } = useQuery({
    queryKey: ['orders', 'pending'],
    queryFn: sequencesApi.pendingOrders,
  });

  const pendingList = pending?.orders ?? [];
  const pendingTotal = pending?.total ?? 0;
  const pendingTruncated = pending?.truncated ?? false;

  const orderIds = useMemo(() => [...selected], [selected]);

  const sync = useMutation({
    // forceProductRefresh siempre on: garantiza que el sync detecte cambios
    // de bodega B1/B2 en productos de WC sin depender del cache local.
    mutationFn: () => syncApi.orders({ forceProductRefresh: true }),
    onSuccess: (result) => {
      setSyncResult(result);
      queryClient.invalidateQueries({ queryKey: ['orders', 'pending'] });
    },
  });

  const clearPending = useMutation({
    mutationFn: () => sequencesApi.clearPending(),
    onSuccess: () => {
      setSelected(new Set());
      setSyncResult(null);
      setProblems(null);
      queryClient.invalidateQueries({ queryKey: ['orders', 'pending'] });
    },
  });

  const validate = useMutation({
    mutationFn: () => sequencesApi.validateStock(orderIds),
    onSuccess: (problems) => setProblems(problems),
  });

  const create = useMutation({
    mutationFn: () => sequencesApi.create(orderIds),
    onSuccess: (seq) => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'pending'] });
      navigate(`/sequences/${seq.id}`);
    },
    onError: (err: any) => {
      // mostrado más abajo
      console.error('createSequence error', err);
    },
  });

  function toggle(id: number) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setProblems(null);
  }

  const blocking = (problems || []).filter((p) => !p.warning);
  const canCreate = orderIds.length > 0 && (!problems || blocking.length === 0);

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="btn-ghost text-sm">
        <ChevronLeft size={16} />
        Volver
      </button>
      <h2 className="text-xl font-semibold">Generar secuencia</h2>
      <p className="text-sm text-slate-500">
        Selecciona los pedidos que entran en la próxima secuencia. La secuencia arrastra tanto el picking B1 (para empacar) como el picking B2 (a granel); cada flujo cierra por separado.
      </p>

      {/* Bloque de sincronización manual desde WC */}
      <div className="card space-y-3 p-4 ring-1 ring-brand-100">
        <div className="flex items-center gap-2">
          <RefreshCw size={16} className="text-brand-700" />
          <h3 className="font-semibold text-slate-800">Sincronizar desde WooCommerce</h3>
        </div>
        <p className="text-xs text-slate-500">
          Trae al WMS todos los pedidos en estado <em>en-preparación</em> desde WooCommerce. Los duplicados se actualizan sin crear copias.
        </p>

        <button
          onClick={() => sync.mutate()}
          disabled={sync.isPending}
          className="btn-primary w-full sm:w-auto"
        >
          <RefreshCw size={16} className={sync.isPending ? 'animate-spin' : ''} />
          {sync.isPending ? 'Sincronizando…' : 'Sincronizar pedidos en preparación'}
        </button>

        {pendingTotal > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs">
            <span className="text-slate-600">
              ¿Los pedidos importados tienen fecha o datos incorrectos? Bórralos y vuelve a sincronizar.
            </span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Esto borrará los ${pendingTotal} pedidos pendientes del WMS (los que aún no entraron a una secuencia). Vas a tener que volver a sincronizar. ¿Continuar?`)) {
                  clearPending.mutate();
                }
              }}
              disabled={clearPending.isPending}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-red-700 hover:bg-red-50"
            >
              <Trash2 size={14} />
              {clearPending.isPending ? 'Borrando…' : 'Borrar pendientes'}
            </button>
          </div>
        )}

        {sync.error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {(sync.error as any).response?.data?.message || 'Error al sincronizar con WooCommerce'}
          </div>
        )}

        {syncResult && (
          <div
            className={clsx(
              'rounded-lg px-3 py-2 text-sm ring-1',
              syncResult.failed > 0
                ? 'bg-amber-50 text-amber-900 ring-amber-200'
                : 'bg-emerald-50 text-emerald-800 ring-emerald-200',
            )}
          >
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <div>
                <div>
                  WC tenía <strong>{syncResult.total}</strong> pedido{syncResult.total === 1 ? '' : 's'} en preparación.
                </div>
                <div className="text-xs">
                  <strong>{syncResult.created}</strong> nuevo{syncResult.created === 1 ? '' : 's'} · <strong>{syncResult.updated}</strong> actualizado{syncResult.updated === 1 ? '' : 's'}
                  {syncResult.skipped > 0 && <> · <strong>{syncResult.skipped}</strong> saltado{syncResult.skipped === 1 ? '' : 's'} (ya en picking/packing)</>}
                  {syncResult.failed > 0 && <> · <strong>{syncResult.failed}</strong> fallido{syncResult.failed === 1 ? '' : 's'}</>}
                </div>
                {syncResult.skipped > 0 && (
                  <div className="mt-2 rounded-md bg-slate-50 px-2 py-1.5 text-xs text-slate-700 ring-1 ring-slate-200">
                    <div className="font-medium">Pedidos bloqueados (no se modificaron):</div>
                    <div className="mt-0.5">
                      {syncResult.skippedOrders.slice(0, 8).map((o) => `#${o.number} (${orderStatusLabel(o.status)})`).join(', ')}
                      {syncResult.skippedOrders.length > 8 && ` … y ${syncResult.skippedOrders.length - 8} más`}
                    </div>
                    <div className="mt-1 text-slate-500">
                      Estos pedidos ya tienen progreso (picking, packing o despacho). Para modificarlos hay que eliminar la secuencia primero — vuelven a estar pendientes y podrás sincronizarlos de nuevo.
                    </div>
                  </div>
                )}
                {syncResult.takenBySequences.length > 0 && (
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="font-medium text-amber-800">
                      Algunos pedidos no aparecen abajo porque están en otras secuencias:
                    </div>
                    {syncResult.takenBySequences.map((s) => (
                      <div key={s.id} className="ml-1">
                        <Link
                          to={`/sequences/${s.id}`}
                          className="font-semibold text-brand-700 underline hover:text-brand-800"
                        >
                          Secuencia #{s.id}
                        </Link>
                        <span className="text-slate-600">
                          {' '}({sequenceStatusLabel(s.status).toLowerCase()}){': '}
                          {s.orders.map((o) => `#${o.number}`).join(', ')}
                        </span>
                      </div>
                    ))}
                    <div className="text-slate-600">
                      Si quieres usarlos en una secuencia nueva, abre la secuencia que los tiene y elimínala (solo permite si aún no se hizo picking).
                    </div>
                  </div>
                )}
              </div>
            </div>
            {syncResult.failed > 0 && (
              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs">
                {syncResult.errors.slice(0, 3).map((e) => (
                  <li key={e.wpOrderId}>#{e.wpOrderId}: {e.message}</li>
                ))}
                {syncResult.errors.length > 3 && (
                  <li>… y {syncResult.errors.length - 3} más</li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Lista de pedidos pendientes */}
      {isLoading ? (
        <Spinner />
      ) : pendingList.length === 0 ? (
        <div className="card p-6 text-center text-slate-500">
          No hay pedidos pendientes para secuenciar.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">
              {pendingList.length} pedido{pendingList.length === 1 ? '' : 's'} pendientes · {selected.size} seleccionado{selected.size === 1 ? '' : 's'}
            </span>
            <div className="flex items-center gap-3">
              {selected.size < pendingList.length && (
                <button
                  type="button"
                  onClick={() => {
                    setSelected(new Set(pendingList.map((o) => o.id)));
                    setProblems(null);
                  }}
                  className="flex items-center gap-1 text-brand-700 hover:underline"
                >
                  <CheckSquare size={14} />
                  Seleccionar todos
                </button>
              )}
              {selected.size > 0 && (
                <button
                  type="button"
                  onClick={() => { setSelected(new Set()); setProblems(null); }}
                  className="flex items-center gap-1 text-brand-700 hover:underline"
                >
                  <X size={14} />
                  Limpiar selección
                </button>
              )}
            </div>
          </div>
          {pendingTruncated && (
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
              Mostrando {pendingList.length} de {pendingTotal} pedidos pendientes. Si necesitas ver el resto, contactá soporte para aumentar el límite.
            </div>
          )}
        <div className="space-y-2">
          {pendingList.map((o) => {
            const isSel = selected.has(o.id);
            return (
              <button
                key={o.id}
                onClick={() => toggle(o.id)}
                className={clsx(
                  'card flex w-full items-center justify-between p-3 text-left',
                  isSel && 'ring-2 ring-brand-600',
                )}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">#{o.number}</span>
                    {o.route && <Badge variant="blue">{o.route}</Badge>}
                    {o.hasB2Pending && <Badge variant="amber">B2</Badge>}
                    <ShippingBadge method={o.shippingMethod} />
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {new Date(o.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })} · {o.customerName || '—'} · {o.itemCount} items
                  </div>
                </div>
                <input type="checkbox" readOnly checked={isSel} className="h-5 w-5" />
              </button>
            );
          })}
        </div>
        </>
      )}

      {problems && (
        <div className="card space-y-2 p-4">
          {blocking.length === 0 ? (
            <div className="text-sm text-emerald-700">
              Stock OK para los {orderIds.length} pedidos seleccionados.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle size={18} />
                <span className="font-semibold">Faltantes de stock</span>
              </div>
              <ul className="space-y-1 text-sm text-slate-700">
                {blocking.map((p) => (
                  <li key={p.productId}>
                    <span className="font-medium">{p.name}</span> ({p.sku}) — requiere {p.required}, disponible {p.available}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500">
                Quita los pedidos afectados o repón stock antes de generar la secuencia.
              </p>
            </>
          )}
        </div>
      )}

      {create.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {(create.error as any).response?.data?.message || (create.error as any).message || 'No se pudo generar la secuencia'}
          {(create.error as any).response?.data?.details && (
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs">
              {JSON.stringify((create.error as any).response.data.details, null, 2)}
            </pre>
          )}
        </div>
      )}

      <div className="sticky bottom-20 z-10 flex flex-col gap-2 bg-slate-100 pt-2 md:bottom-0 md:flex-row">
        <button
          onClick={() => validate.mutate()}
          disabled={orderIds.length === 0 || validate.isPending}
          className="btn-ghost flex-1 border border-slate-300"
        >
          {validate.isPending ? 'Validando…' : `Validar stock (${orderIds.length})`}
        </button>
        <button
          onClick={() => create.mutate()}
          disabled={!canCreate || create.isPending}
          className="btn-primary flex-1"
        >
          {create.isPending ? 'Creando…' : `Generar secuencia (${orderIds.length})`}
        </button>
      </div>
    </div>
  );
}
