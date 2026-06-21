import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';
import { Link } from 'react-router-dom';
import { Truck, BarChart3, Plus, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { processesApi } from '@/lib/processes';

export function Home() {
  const { user } = useAuth();
  const canCreate = hasCap(user, CAPS.PACK_B1);
  const canSupervise = hasCap(user, CAPS.SUPERVISE);

  const { data: active } = useQuery({
    queryKey: ['process-active'],
    queryFn: () => processesApi.active(),
    refetchInterval: 8000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">
          Hola, {user?.displayName?.split(' ')[0] || user?.username}
        </h2>
        <p className="text-sm text-slate-500">¿Qué vas a hacer hoy?</p>
      </div>

      {/* Atajo grande al proceso activo o a crear uno */}
      {active ? (
        <Link
          to={`/processes/${active.id}`}
          className="card flex items-center gap-4 bg-emerald-50 p-5 ring-1 ring-emerald-300 transition hover:shadow-md"
        >
          <div className="rounded-xl bg-emerald-200 p-3 text-emerald-800">
            <Truck size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wide text-emerald-700">Proceso activo</div>
            <div className="text-lg font-bold text-emerald-900">{active.name}</div>
            <div className="text-xs text-emerald-700">
              {active._count?.sequences || 0} secuencia{active._count?.sequences === 1 ? '' : 's'} · iniciado {new Date(active.createdAt).toLocaleString('es-CL')}
            </div>
          </div>
          <ChevronRight className="text-emerald-700" size={22} />
        </Link>
      ) : (
        <div className="card flex items-center gap-4 bg-amber-50 p-5 ring-1 ring-amber-300">
          <div className="rounded-xl bg-amber-200 p-3 text-amber-800">
            <Truck size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wide text-amber-700">Sin proceso activo</div>
            <div className="text-sm text-amber-900">
              No hay un proceso de preparación y carga abierto. {canCreate ? 'Creá uno para empezar a generar secuencias.' : 'Avisá al encargado.'}
            </div>
          </div>
          {canCreate && (
            <Link to="/processes/new" className="btn-primary shrink-0 text-sm">
              <Plus size={16} />
              Crear proceso
            </Link>
          )}
        </div>
      )}

      {/* Accesos rápidos secundarios */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        <Link
          to="/processes"
          className="card flex flex-col items-start gap-3 p-4 transition hover:shadow-md active:scale-[0.98]"
        >
          <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
            <Truck size={22} />
          </div>
          <div className="text-sm font-medium text-slate-800">Procesos</div>
        </Link>

        {canSupervise && (
          <Link
            to="/dashboard"
            className="card flex flex-col items-start gap-3 p-4 transition hover:shadow-md active:scale-[0.98]"
          >
            <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
              <BarChart3 size={22} />
            </div>
            <div className="text-sm font-medium text-slate-800">Supervisión</div>
          </Link>
        )}
      </div>
    </div>
  );
}
