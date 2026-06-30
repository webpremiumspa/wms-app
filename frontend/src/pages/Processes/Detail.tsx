import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ClipboardList, Plus, LayoutGrid, List as ListIcon, XCircle, Package, RefreshCw } from 'lucide-react';
import { syncApi } from '@/lib/sync';
import { warehouseLabel } from '@/lib/labels';
import clsx from 'clsx';
import { processesApi, type ProcessOrderCard } from '@/lib/processes';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { ShippingBadge } from '@/components/ShippingBadge';
import { ProgressHero } from '@/components/RouteProgressPills';
import { OrderSearchBox, HighlightedNumber, matchesOrderId } from '@/components/OrderSearchBox';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';
import { orderStatusLabel } from '@/lib/labels';
import type { OrderStatus } from '@/lib/types';

const MAX_LOOKUP_RESULTS = 20;

type View = 'list' | 'kanban';

// Columnas del kanban. Cada pedido vive en la columna que corresponde a su
// `status` global (que se rige por B1 + el atajo B2-only). El estado por
// bodega se ve en los pills B1/B2 de cada card — antes había una columna
// 'Parcial' que mezclaba dos casos opuestos ("B1 listo, falta B2" vs
// "B2 listo, falta B1") y escondía el progreso real (un pedido packed
// esperando B2 desaparecía de 'Empacado'); por eso se quitó.
type ColKey = OrderStatus | 'pendiente';

const KANBAN_COLS: Array<{ key: ColKey; label: string; statuses: OrderStatus[]; accent: string }> = [
  { key: 'pendiente', label: 'Pendiente', statuses: ['received', 'sequenced', 'picked'], accent: 'bg-slate-50 ring-slate-200' },
  { key: 'packed', label: 'Empacado', statuses: ['packed'], accent: 'bg-blue-50 ring-blue-200' },
  { key: 'classified', label: 'Clasificado', statuses: ['classified'], accent: 'bg-amber-50 ring-amber-200' },
  { key: 'loaded', label: 'Cargado', statuses: ['loaded'], accent: 'bg-emerald-50 ring-emerald-200' },
  { key: 'delivered', label: 'Entregado', statuses: ['delivered'], accent: 'bg-emerald-100 ring-emerald-300' },
  { key: 'blocked', label: 'Bloqueado', statuses: ['blocked'], accent: 'bg-red-50 ring-red-300' },
];

export function ProcessDetail() {
  const { id } = useParams();
  const procId = Number(id);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canCreate = hasCap(user, CAPS.PACK_B1);
  const canSupervise = hasCap(user, CAPS.SUPERVISE);
  const [view, setView] = useState<View>('list');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['process', procId],
    queryFn: () => processesApi.get(procId),
    refetchInterval: 6000,
  });

  const closeMut = useMutation({
    mutationFn: () => processesApi.close(procId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      queryClient.invalidateQueries({ queryKey: ['process-active'] });
      queryClient.invalidateQueries({ queryKey: ['process', procId] });
    },
  });

  const refreshRoutes = useMutation({
    // Scopeado al proceso actual: el endpoint refresca solo los pedidos
    // ligados a las secuencias de este proceso. Antes refrescaba TODOS los
    // pedidos activos del WMS lo cual confundía el conteo ("38 de 38" en un
    // proceso con 14 pedidos).
    mutationFn: () => syncApi.routes({ processId: procId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process', procId] });
    },
  });

  const searchQuery = search.trim();
  const lookupMatches = useMemo<ProcessOrderCard[]>(() => {
    if (!data || !searchQuery) return [];
    return data.orders
      .filter((o) => matchesOrderId(o.number, searchQuery))
      .slice(0, MAX_LOOKUP_RESULTS);
  }, [data, searchQuery]);

  if (isLoading || !data) return <Spinner />;

  const { process, orders, byStatus, totals } = data;
  const loadedTotal = (byStatus.loaded || 0) + (byStatus.delivered || 0);
  const isActive = process.status === 'open';

  return (
    <div className="space-y-4">
      <Link to="/processes" className="btn-ghost text-sm">
        <ChevronLeft size={16} />
        Procesos
      </Link>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-semibold">{process.name}</span>
          <Badge variant={isActive ? 'green' : 'gray'}>
            {isActive ? 'Activo' : 'Cerrado'}
          </Badge>
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {totals.sequences} secuencia{totals.sequences === 1 ? '' : 's'} · {totals.orders} pedidos · creado {new Date(process.createdAt).toLocaleString('es-CL')}
          {process.closedAt && <> · cerrado {new Date(process.closedAt).toLocaleString('es-CL')}</>}
        </div>
      </div>

      <ProgressHero
        title="Progreso del proceso (cargados)"
        done={loadedTotal}
        total={totals.orders}
        verb="pedidos"
      />

      {isActive && (
        <div className="grid gap-2 md:grid-cols-2">
          {canCreate && (
            <Link
              to={`/sequences/new?processId=${procId}`}
              className="card flex items-center gap-3 p-4 ring-1 ring-brand-200 hover:shadow-md"
            >
              <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
                <Plus size={20} />
              </div>
              <div>
                <div className="font-medium">Generar nueva secuencia</div>
                <div className="text-xs text-slate-500">Asociada a este proceso</div>
              </div>
            </Link>
          )}
          <Link
            to={`/processes/${procId}/picking-b1`}
            className="card flex items-center gap-3 p-4 ring-1 ring-brand-200 hover:shadow-md"
          >
            <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
              <Package size={20} />
            </div>
            <div>
              <div className="font-medium">Picking {warehouseLabel('B1')} del proceso</div>
              <div className="text-xs text-slate-500">Tabla agrupada por SKU para recorrer Bodega 1</div>
            </div>
          </Link>
          <Link
            to={`/processes/${procId}/picking-b2`}
            className="card flex items-center gap-3 p-4 ring-1 ring-amber-200 hover:shadow-md"
          >
            <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
              <Package size={20} />
            </div>
            <div>
              <div className="font-medium">Picking {warehouseLabel('B2')} del proceso</div>
              <div className="text-xs text-slate-500">Recolectar items a granel de todas las secuencias</div>
            </div>
          </Link>
        </div>
      )}

      {/* Refrescar rutas para este proceso */}
      <div className="card flex flex-wrap items-center justify-between gap-2 p-3">
        <div className="text-xs text-slate-600">
          ¿La app de rutas asignó después de empacar y no se ven actualizadas? Fuerza un refresh.
        </div>
        <button
          type="button"
          onClick={() => refreshRoutes.mutate()}
          disabled={refreshRoutes.isPending}
          className="flex items-center gap-1 rounded-lg bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={14} className={refreshRoutes.isPending ? 'animate-spin' : ''} />
          {refreshRoutes.isPending ? 'Refrescando…' : 'Refrescar rutas'}
        </button>
      </div>
      {refreshRoutes.data && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800 ring-1 ring-emerald-200">
          Rutas actualizadas: {refreshRoutes.data.updated} de {refreshRoutes.data.total} pedidos de este proceso.
        </div>
      )}

      {/* Toggle Lista / Kanban */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Pedidos</h3>
        <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setView('list')}
            className={clsx('flex items-center gap-1 rounded-md px-2 py-1 font-medium', view === 'list' ? 'bg-brand-700 text-white' : 'text-slate-600 hover:bg-slate-100')}
          >
            <ListIcon size={14} />
            Lista
          </button>
          <button
            type="button"
            onClick={() => setView('kanban')}
            className={clsx('flex items-center gap-1 rounded-md px-2 py-1 font-medium', view === 'kanban' ? 'bg-brand-700 text-white' : 'text-slate-600 hover:bg-slate-100')}
          >
            <LayoutGrid size={14} />
            Kanban
          </button>
        </div>
      </div>

      {/* Buscador de pedido: ayuda a ubicar en qué secuencia está un # */}
      <OrderSearchBox
        value={search}
        onChange={setSearch}
        placeholder="Buscar pedido por ID en este proceso…"
      />
      {searchQuery && (
        <OrderLookupResults query={searchQuery} matches={lookupMatches} />
      )}

      {view === 'list' ? (
        <SequenceListView sequences={process.sequences} />
      ) : (
        <KanbanView orders={orders} />
      )}

      {isActive && canSupervise && (
        <div className="card flex items-center justify-between p-4 ring-1 ring-red-200">
          <div className="text-xs text-slate-600">
            Cierre manual (override). Solo si auto-cierre no fue suficiente.
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Cerrar este proceso manualmente? Se mantiene el historial pero no se podrán generar más secuencias.')) {
                closeMut.mutate();
              }
            }}
            disabled={closeMut.isPending}
            className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 ring-1 ring-red-300 hover:bg-red-100"
          >
            <XCircle size={14} />
            {closeMut.isPending ? 'Cerrando…' : 'Cerrar proceso'}
          </button>
        </div>
      )}
    </div>
  );
}

function SequenceListView({ sequences }: { sequences: import('@/lib/processes').ProcessSequenceSummary[] }) {
  if (sequences.length === 0) {
    return (
      <div className="card p-4 text-center text-sm text-slate-500">
        Aún no hay secuencias en este proceso.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {sequences.map((s) => (
        <Link
          key={s.id}
          to={`/sequences/${s.id}`}
          className="card flex items-center justify-between p-4 hover:shadow-md"
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Secuencia #{s.id}</span>
              <Badge variant={s.status === 'open' ? 'green' : 'gray'}>
                {s.status === 'open' ? 'Abierta' : 'Cerrada'}
              </Badge>
            </div>
            <div className="text-xs text-slate-500">
              {s.orderCount} pedidos · {s.actualBags}/{s.expectedBags} empacados · creada {new Date(s.createdAt).toLocaleString('es-CL')}
            </div>
          </div>
          <ClipboardList className="text-slate-400" size={20} />
        </Link>
      ))}
    </div>
  );
}

function OrderLookupResults({ query, matches }: { query: string; matches: ProcessOrderCard[] }) {
  if (matches.length === 0) {
    return (
      <div className="card p-3 text-center text-xs text-slate-500">
        Sin pedidos que coincidan con <strong>“{query}”</strong> en este proceso.
      </div>
    );
  }
  return (
    <div className="card space-y-1.5 p-2">
      <div className="px-1 pb-1 text-[11px] uppercase tracking-wide text-slate-500">
        {matches.length === MAX_LOOKUP_RESULTS
          ? `Mostrando primeras ${MAX_LOOKUP_RESULTS} coincidencias`
          : `${matches.length} coincidencia${matches.length === 1 ? '' : 's'}`}
      </div>
      {matches.map((o) => (
        <Link
          key={o.id}
          // ?focus=<orderId> hace que la pantalla de detalle de la secuencia
          // expanda y scrollee a esa tarjeta — evita que el operador tenga
          // que volver a buscar el mismo pedido tras navegar.
          to={`/sequences/${o.sequenceId}?focus=${o.id}`}
          className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"
        >
          <div className="min-w-0 flex flex-wrap items-center gap-1.5">
            <span className="font-semibold">
              #<HighlightedNumber text={o.number} match={query} />
            </span>
            <Badge variant="blue">Sec #{o.sequenceId}</Badge>
            {o.route && <Badge variant="gray">{o.route}</Badge>}
            {o.stopPosition != null && <Badge variant="gray">P{o.stopPosition}</Badge>}
            {o.hasB2Pending && <Badge variant="amber">{warehouseLabel('B2')}</Badge>}
            <Badge variant="gray">{orderStatusLabel(o.status)}</Badge>
          </div>
          <span className="shrink-0 truncate text-xs text-slate-500">
            {o.customerName || '—'}
          </span>
        </Link>
      ))}
    </div>
  );
}

function KanbanView({ orders }: { orders: ProcessOrderCard[] }) {
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-max grid-flow-col auto-cols-[280px] gap-3">
        {KANBAN_COLS.map((col) => {
          const colOrders = orders.filter((o) => (col.statuses as OrderStatus[]).includes(o.status));
          return (
            <div key={col.key} className={clsx('rounded-xl p-2 ring-1', col.accent)}>
              <div className="flex items-center justify-between p-2">
                <span className="text-sm font-semibold text-slate-800">{col.label}</span>
                <Badge variant="gray">{colOrders.length}</Badge>
              </div>
              <div className="space-y-2">
                {colOrders.length === 0 && (
                  <div className="rounded bg-white/60 p-2 text-center text-[11px] text-slate-400">—</div>
                )}
                {colOrders.map((o) => (
                  <KanbanCard key={o.id} order={o} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-[10px] italic text-slate-500">
        Estados visibles en kanban. Total: {orders.length} pedidos. {orderStatusLabel('received')} y otros pre-empaque agrupados en "Pendiente". Cada card muestra pills B1/B2 con el estado de cada bodega (verde si cerrado, gris si pendiente).
      </div>
    </div>
  );
}

// Card individual del kanban. Aparte para tener los pills B1/B2 en un solo
// lugar y reusarlos si se agregan al lookup u otros listados.
function KanbanCard({ order: o }: { order: ProcessOrderCard }) {
  // Estado de cada bodega:
  //   B1: cerrado cuando packedAt está seteado (status >= packed)
  //   B2: cerrado cuando b2ClosedAt está seteado (independiente del status)
  // Si el pedido no tiene items B2 (hasB2Pending=false), no mostramos el pill
  // B2 — sería ruido visual ("Esperando un B2 que nunca va a existir").
  const b1Done = !!o.packedAt;
  const b2Done = !!o.b2ClosedAt;
  const showB2 = o.hasB2Pending;
  return (
    <div className="rounded-lg bg-white p-2 text-xs ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center gap-1">
        <span className="font-semibold">#{o.number}</span>
        {o.route && <Badge variant="blue">{o.route}</Badge>}
        {o.stopPosition != null && <Badge variant="gray">P{o.stopPosition}</Badge>}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1">
        <FlowPill label="B1" done={b1Done} />
        {showB2 && <FlowPill label="B2" done={b2Done} />}
      </div>
      <div className="mt-1 truncate text-[10px] text-slate-500">
        {o.customerName || '—'} · Sec #{o.sequenceId}
      </div>
      {o.shippingMethod && (
        <div className="mt-1"><ShippingBadge method={o.shippingMethod} /></div>
      )}
    </div>
  );
}

function FlowPill({ label, done }: { label: 'B1' | 'B2'; done: boolean }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1',
        done
          ? 'bg-emerald-100 text-emerald-800 ring-emerald-200'
          : 'bg-slate-100 text-slate-500 ring-slate-200',
      )}
      title={done ? `${label} cerrado` : `${label} pendiente`}
    >
      {label} {done ? '✓' : '…'}
    </span>
  );
}
