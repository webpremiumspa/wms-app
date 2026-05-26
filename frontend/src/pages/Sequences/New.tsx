import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ChevronLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { sequencesApi } from '@/lib/sequences';
import { syncApi, type SyncResult } from '@/lib/sync';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import type { StockProblem, Warehouse } from '@/lib/types';
import clsx from 'clsx';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function yesterdayISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function SequenceNew() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [warehouse] = useState<Warehouse>('B1');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [problems, setProblems] = useState<StockProblem[] | null>(null);

  // Sync state
  const [afterDate, setAfterDate] = useState(yesterdayISO());
  const [beforeDate, setBeforeDate] = useState(todayISO());
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const { data: pending, isLoading } = useQuery({
    queryKey: ['orders', 'pending'],
    queryFn: sequencesApi.pendingOrders,
  });

  const orderIds = useMemo(() => [...selected], [selected]);

  const sync = useMutation({
    mutationFn: () => syncApi.orders({
      after: afterDate || undefined,
      before: beforeDate || undefined,
    }),
    onSuccess: (result) => {
      setSyncResult(result);
      queryClient.invalidateQueries({ queryKey: ['orders', 'pending'] });
    },
  });

  const validate = useMutation({
    mutationFn: () => sequencesApi.validateStock(orderIds),
    onSuccess: (problems) => setProblems(problems),
  });

  const create = useMutation({
    mutationFn: () => sequencesApi.create(warehouse, orderIds),
    onSuccess: (seq) => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'pending'] });
      navigate(`/sequences/${seq.id}`);
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
      <h2 className="text-xl font-semibold">Generar secuencia · Bodega {warehouse}</h2>
      <p className="text-sm text-slate-500">
        Selecciona los pedidos que entran en la próxima secuencia. Validaremos stock antes de crearla.
      </p>

      {/* Bloque de sincronización manual desde WC */}
      <div className="card space-y-3 p-4 ring-1 ring-brand-100">
        <div className="flex items-center gap-2">
          <RefreshCw size={16} className="text-brand-700" />
          <h3 className="font-semibold text-slate-800">Sincronizar desde WooCommerce</h3>
        </div>
        <p className="text-xs text-slate-500">
          Trae al WMS los pedidos en estado <em>processing</em>/<em>on-hold</em> dentro del rango. Los duplicados se actualizan sin crear copias.
        </p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Desde</span>
            <input
              type="date"
              className="input mt-1"
              value={afterDate}
              onChange={(e) => setAfterDate(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Hasta</span>
            <input
              type="date"
              className="input mt-1"
              value={beforeDate}
              onChange={(e) => setBeforeDate(e.target.value)}
            />
          </label>
          <div className="flex items-end">
            <button
              onClick={() => sync.mutate()}
              disabled={sync.isPending}
              className="btn-primary w-full"
            >
              <RefreshCw size={16} className={sync.isPending ? 'animate-spin' : ''} />
              {sync.isPending ? 'Sincronizando…' : 'Sincronizar'}
            </button>
          </div>
        </div>

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
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>
                Sincronización completa: <strong>{syncResult.synced}</strong> de {syncResult.total} pedidos importados
                {syncResult.failed > 0 && ` · ${syncResult.failed} fallidos`}.
              </span>
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
      ) : (pending?.length ?? 0) === 0 ? (
        <div className="card p-6 text-center text-slate-500">
          No hay pedidos pendientes para secuenciar.
        </div>
      ) : (
        <div className="space-y-2">
          {pending!.map((o) => {
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
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">#{o.number}</span>
                    {o.route && <Badge variant="blue">{o.route}</Badge>}
                    {o.hasB2Pending && <Badge variant="amber">B2</Badge>}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {o.customerName || '—'} · {o.itemCount} items
                  </div>
                </div>
                <input type="checkbox" readOnly checked={isSel} className="h-5 w-5" />
              </button>
            );
          })}
        </div>
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
