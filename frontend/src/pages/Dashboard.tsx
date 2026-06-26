import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Info, Package, ClipboardList, Truck, CheckCircle2, Activity, Clock } from 'lucide-react';
import clsx from 'clsx';
import { dashboardApi, type AlertSeverity, type DashboardSummary } from '@/lib/dashboard';
import { processesApi } from '@/lib/processes';
import { eventLabel, orderStatusLabelPlural, warehouseLabel } from '@/lib/labels';
import { Spinner } from '@/components/Spinner';

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  info: 'bg-brand-50 text-brand-800 ring-brand-200',
  warning: 'bg-amber-50 text-amber-900 ring-amber-300',
  critical: 'bg-red-50 text-red-900 ring-red-300',
};

export function Dashboard() {
  // Tabs por proceso abierto. Si hay 1 solo, no se muestran las pestañas:
  // se ve directo el contenido del único proceso vivo.
  const { data: openProcesses, isLoading: loadingProcesses } = useQuery({
    queryKey: ['process-open-list'],
    queryFn: () => processesApi.openList(),
    refetchInterval: 10_000,
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Cuando carga la lista, default al primer proceso abierto. Si el
  // seleccionado se cerró (ya no está en la lista), volvemos al primero.
  useEffect(() => {
    if (!openProcesses) return;
    if (openProcesses.length === 0) {
      setSelectedId(null);
      return;
    }
    if (selectedId == null || !openProcesses.some((p) => p.id === selectedId)) {
      setSelectedId(openProcesses[0].id);
    }
  }, [openProcesses, selectedId]);

  if (loadingProcesses || !openProcesses) return <Spinner />;

  if (openProcesses.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Supervisión</h2>
        <div className="card p-6 text-center text-sm text-slate-600">
          No hay procesos abiertos. Cuando alguien abra uno, esta vista lo mostrará automáticamente.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Supervisión</h2>

      {openProcesses.length > 1 && (
        <div className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1">
          {openProcesses.map((p) => {
            const active = p.id === selectedId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                className={clsx(
                  'flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition',
                  active ? 'bg-brand-700 text-white' : 'text-slate-600 hover:bg-slate-100',
                )}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      )}

      {selectedId != null && <ProcessSupervisionPanel processId={selectedId} />}
    </div>
  );
}

function ProcessSupervisionPanel({ processId }: { processId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary', processId],
    queryFn: () => dashboardApi.summary({ processId }),
    refetchInterval: 5000,
  });

  if (isLoading || !data) return <Spinner />;
  return <SupervisionContent data={data} />;
}

function SupervisionContent({ data }: { data: DashboardSummary }) {
  const pendingPack =
    (data.orders.byStatus.received || 0) +
    (data.orders.byStatus.sequenced || 0) +
    (data.orders.byStatus.picked || 0);
  const readyToClassify = data.orders.byStatus.packed || 0;
  const loaded = data.orders.byStatus.loaded || 0;
  const b2Pct = data.pickingB2.totalSkus === 0
    ? 100
    : Math.round((data.pickingB2.pickedSkus / data.pickingB2.totalSkus) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-end">
        <div className="text-xs text-slate-500">
          actualizado {new Date(data.generatedAt).toLocaleTimeString('es-CL')}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard icon={Activity} label="Pedidos activos" value={data.orders.activeTotal} accent="blue" />
        <KpiCard icon={Package} label="Pendientes empacar" value={pendingPack} accent="amber" />
        <KpiCard icon={ClipboardList} label="Listos para clasificar" value={readyToClassify} accent="blue" />
        <KpiCard icon={Truck} label="Cargados" value={loaded} accent="green" />
      </div>

      {/* Secundarios */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Con B2 pendiente" value={data.orders.withB2Pending} accent="amber" small />
        <KpiCard label="Secuencias abiertas" value={data.sequences.open} accent="blue" small />
        <KpiCard label="Secuencias cerradas" value={data.sequences.closed} accent="gray" small />
        <KpiCard label={`Picking ${warehouseLabel('B2')}`} value={`${b2Pct}%`} accent={b2Pct === 100 ? 'green' : 'amber'} small />
      </div>

      {/* Alertas */}
      {data.alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">Alertas</h3>
          {data.alerts.map((a, idx) => (
            <div
              key={`${a.type}-${idx}`}
              className={clsx('flex items-start gap-2 rounded-lg px-3 py-2 text-sm ring-1', SEVERITY_STYLES[a.severity])}
            >
              {a.severity === 'info' ? (
                <Info size={16} className="mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              )}
              <span>{a.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Progreso por ruta */}
      {data.byRoute.length > 0 && (
        <div className="card space-y-3 p-4">
          <h3 className="text-sm font-semibold text-slate-700">Progreso por ruta</h3>
          {data.byRoute.map((r) => {
            const loadedPct = r.total === 0 ? 0 : Math.round((r.loaded / r.total) * 100);
            return (
              <div key={r.route} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{r.route}</span>
                  <div className="flex gap-2 text-xs text-slate-600">
                    <span>{r.classified}/{r.total} clasif.</span>
                    <span className={clsx(r.loaded === r.total && 'text-emerald-700')}>
                      {r.loaded}/{r.total} cargados
                    </span>
                    {r.b2 > 0 && <span className="text-amber-700">{r.b2} con B2</span>}
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={clsx('h-full transition-all', r.loaded === r.total ? 'bg-emerald-500' : 'bg-brand-600')}
                    style={{ width: `${loadedPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Desglose por estado */}
      <div className="card p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Pedidos por estado</h3>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {(['received', 'sequenced', 'picked', 'packed', 'classified', 'loaded', 'delivered', 'blocked'] as const).map((key) => (
            <div key={key} className="rounded-lg bg-slate-50 px-3 py-2">
              <div className="text-xs text-slate-500">{orderStatusLabelPlural(key)}</div>
              <div className={`text-xl font-bold ${key === 'blocked' && (data.orders.byStatus[key] || 0) > 0 ? 'text-red-700' : 'text-slate-800'}`}>
                {data.orders.byStatus[key] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="card p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Clock size={14} />
          Actividad reciente
        </h3>
        {data.recentEvents.length === 0 ? (
          <div className="text-sm text-slate-500">Sin actividad registrada todavía.</div>
        ) : (
          <ul className="space-y-2">
            {data.recentEvents.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <span className="font-medium">{e.actor || 'sistema'}</span>{' '}
                  <span className="text-slate-600">{eventLabel(e.type)}</span>
                  {e.orderNumber && <span className="text-slate-500"> · pedido #{e.orderNumber}</span>}
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {new Date(e.createdAt).toLocaleTimeString('es-CL')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

type KpiCardProps = {
  icon?: typeof Activity;
  label: string;
  value: string | number;
  accent: 'blue' | 'amber' | 'green' | 'gray';
  small?: boolean;
};

const ACCENT_STYLES = {
  blue: 'bg-brand-50 text-brand-700',
  amber: 'bg-amber-50 text-amber-700',
  green: 'bg-emerald-50 text-emerald-700',
  gray: 'bg-slate-100 text-slate-700',
};

function KpiCard({ icon: Icon, label, value, accent, small }: KpiCardProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2">
        {Icon && (
          <div className={clsx('rounded-lg p-1.5', ACCENT_STYLES[accent])}>
            <Icon size={16} />
          </div>
        )}
        <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      </div>
      <div className={clsx('mt-2 font-bold text-slate-900', small ? 'text-2xl' : 'text-3xl')}>{value}</div>
    </div>
  );
}

// Suprime unused-import warning para CheckCircle2 (lo dejo por si se usa más adelante)
void CheckCircle2;
