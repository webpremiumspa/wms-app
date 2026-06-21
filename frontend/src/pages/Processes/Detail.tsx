import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ClipboardList, Plus, LayoutGrid, List as ListIcon, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { processesApi, type ProcessOrderCard } from '@/lib/processes';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { ShippingBadge } from '@/components/ShippingBadge';
import { ProgressHero } from '@/components/RouteProgressPills';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';
import { orderStatusLabel } from '@/lib/labels';
import type { OrderStatus } from '@/lib/types';

type View = 'list' | 'kanban';

const KANBAN_COLS: Array<{ key: OrderStatus | 'pendiente'; label: string; statuses: OrderStatus[]; accent: string }> = [
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

      {isActive && canCreate && (
        <Link
          to={`/sequences/new`}
          className="card flex items-center gap-3 p-4 ring-1 ring-brand-200 hover:shadow-md"
        >
          <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
            <Plus size={20} />
          </div>
          <div>
            <div className="font-medium">Generar nueva secuencia</div>
            <div className="text-xs text-slate-500">Quedará asociada a este proceso automáticamente</div>
          </div>
        </Link>
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
                  <div key={o.id} className="rounded-lg bg-white p-2 text-xs ring-1 ring-slate-200">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="font-semibold">#{o.number}</span>
                      {o.route && <Badge variant="blue">{o.route}</Badge>}
                      {o.stopPosition != null && <Badge variant="gray">P{o.stopPosition}</Badge>}
                      {o.hasB2Pending && <Badge variant="amber">B2</Badge>}
                    </div>
                    <div className="mt-1 truncate text-[10px] text-slate-500">
                      {o.customerName || '—'} · Sec #{o.sequenceId}
                    </div>
                    {o.shippingMethod && (
                      <div className="mt-1"><ShippingBadge method={o.shippingMethod} /></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-[10px] italic text-slate-500">
        Estados visibles en kanban. Total: {orders.length} pedidos. {orderStatusLabel('received')} y otros pre-empaque agrupados en "Pendiente".
      </div>
    </div>
  );
}
