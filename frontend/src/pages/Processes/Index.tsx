import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Truck, ClipboardList } from 'lucide-react';
import { processesApi } from '@/lib/processes';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';

export function ProcessesIndex() {
  const { user } = useAuth();
  const canCreate = hasCap(user, CAPS.PACK_B1);

  const { data: list, isLoading } = useQuery({
    queryKey: ['processes'],
    queryFn: () => processesApi.list(),
    refetchInterval: 8000,
  });

  const { data: active } = useQuery({
    queryKey: ['process-active'],
    queryFn: () => processesApi.active(),
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Procesos de preparación y carga</h2>
        {canCreate && (
          <Link to="/processes/new" className="btn-primary text-sm">
            <Plus size={16} />
            Nuevo proceso
          </Link>
        )}
      </div>

      {active ? (
        <div className="card flex flex-wrap items-center gap-3 bg-emerald-50 p-4 ring-1 ring-emerald-200">
          <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
            <Truck size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase text-emerald-700">Proceso activo</div>
            <Link to={`/processes/${active.id}`} className="font-semibold text-emerald-900 hover:underline">
              {active.name}
            </Link>
            <div className="text-xs text-emerald-700">
              {active._count?.sequences || 0} secuencia{active._count?.sequences === 1 ? '' : 's'} · iniciado {new Date(active.createdAt).toLocaleString('es-CL')}
            </div>
          </div>
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
        {(list || []).length === 0 && (
          <div className="card p-4 text-center text-sm text-slate-500">
            Aún no hay procesos.
          </div>
        )}
        {(list || []).map((p) => (
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
    </div>
  );
}
