import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Truck, ClipboardList, List as ListIcon, CalendarDays } from 'lucide-react';
import clsx from 'clsx';
import { processesApi, type DeliveryProcess } from '@/lib/processes';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { ProcessCalendar } from '@/components/ProcessCalendar';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';

type ViewMode = 'list' | 'calendar';

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function ProcessesIndex() {
  const { user } = useAuth();
  const canCreate = hasCap(user, CAPS.PACK_B1);
  const [view, setView] = useState<ViewMode>('list');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // En calendario pedimos un lote más grande para cubrir varios meses.
  const limit = view === 'calendar' ? 500 : 50;
  const { data: list, isLoading } = useQuery({
    queryKey: ['processes', { limit }],
    queryFn: () => processesApi.list({ limit }),
    refetchInterval: 8000,
  });

  const { data: openProcesses } = useQuery({
    queryKey: ['processes-open'],
    queryFn: () => processesApi.openList(),
  });

  const processes = list || [];

  const filteredForCalendar = useMemo(() => {
    if (!selectedDay) return [] as DeliveryProcess[];
    return processes.filter((p) => toISODate(new Date(p.createdAt)) === selectedDay);
  }, [processes, selectedDay]);

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Procesos de preparación y carga</h2>
        <div className="flex items-center gap-2">
          {/* Toggle Lista / Calendario */}
          <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setView('list')}
              className={clsx(
                'flex items-center gap-1 rounded-md px-2 py-1 font-medium',
                view === 'list' ? 'bg-brand-700 text-white' : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              <ListIcon size={14} />
              Lista
            </button>
            <button
              type="button"
              onClick={() => setView('calendar')}
              className={clsx(
                'flex items-center gap-1 rounded-md px-2 py-1 font-medium',
                view === 'calendar' ? 'bg-brand-700 text-white' : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              <CalendarDays size={14} />
              Calendario
            </button>
          </div>
          {canCreate && (
            <Link to="/processes/new" className="btn-primary text-sm">
              <Plus size={16} />
              Nuevo proceso
            </Link>
          )}
        </div>
      </div>

      {(openProcesses?.length ?? 0) > 0 ? (
        <div className="grid gap-2 md:grid-cols-2">
          {openProcesses!.map((p) => (
            <Link
              key={p.id}
              to={`/processes/${p.id}`}
              className="card flex flex-wrap items-center gap-3 bg-emerald-50 p-4 ring-1 ring-emerald-200 hover:shadow-md"
            >
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                <Truck size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs uppercase text-emerald-700">Proceso activo</div>
                <span className="font-semibold text-emerald-900">{p.name}</span>
                <div className="text-xs text-emerald-700">
                  {p._count?.sequences || 0} secuencia{p._count?.sequences === 1 ? '' : 's'} · iniciado {new Date(p.createdAt).toLocaleString('es-CL')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card flex items-center gap-3 p-4 ring-1 ring-amber-200">
          <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
            <ClipboardList size={20} />
          </div>
          <div className="text-sm text-amber-900">
            No hay proceso abierto. {canCreate ? 'Creá uno con el botón de arriba para empezar a generar secuencias.' : 'Avisá al encargado para que abra un proceso.'}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">Historial</h3>

        {processes.length === 0 ? (
          <div className="card p-4 text-center text-sm text-slate-500">
            Aún no hay procesos.
          </div>
        ) : view === 'list' ? (
          <ProcessList items={processes} />
        ) : (
          <>
            <ProcessCalendar processes={processes} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
            {selectedDay ? (
              filteredForCalendar.length === 0 ? (
                <div className="card p-4 text-center text-sm text-slate-500">
                  No hay procesos el {new Date(selectedDay + 'T00:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-slate-600">
                    {filteredForCalendar.length} proceso{filteredForCalendar.length === 1 ? '' : 's'} el{' '}
                    <strong>
                      {new Date(selectedDay + 'T00:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </strong>
                  </div>
                  <ProcessList items={filteredForCalendar} />
                </div>
              )
            ) : (
              <div className="card p-4 text-center text-xs text-slate-500">
                Tocá un día para ver sus procesos.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProcessList({ items }: { items: DeliveryProcess[] }) {
  return (
    <div className="space-y-2">
      {items.map((p) => (
        <Link
          key={p.id}
          to={`/processes/${p.id}`}
          className="card flex items-center justify-between p-4 hover:shadow-md"
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{p.name}</span>
              <Badge variant={p.status === 'open' ? 'green' : 'gray'}>
                {p.status === 'open' ? 'Activo' : 'Cerrado'}
              </Badge>
            </div>
            <div className="text-xs text-slate-500">
              {p._count?.sequences || 0} secuencia{p._count?.sequences === 1 ? '' : 's'} · creado {new Date(p.createdAt).toLocaleString('es-CL')}
              {p.closedAt && <> · cerrado {new Date(p.closedAt).toLocaleString('es-CL')}</>}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
