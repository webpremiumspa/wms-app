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

  const { data: openProcesses } = useQuery({
    queryKey: ['processes-open'],
    queryFn: () => processesApi.openList(),
    refetchInterval: 8000,
  });

  const openCount = openProcesses?.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">
          Hola, {user?.displayName?.split(' ')[0] || user?.username}
        </h2>
        <p className="text-sm text-slate-500">¿Qué vas a hacer hoy?</p>
      </div>

      {/* Cards de procesos abiertos (matutino + vespertino, hasta 2 a la vez) */}
      {openCount > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {openProcesses!.map((p) => (
            <Link
              key={p.id}
              to={`/processes/${p.id}`}
              className="card flex items-center gap-4 bg-emerald-50 p-5 ring-1 ring-emerald-300 transition hover:shadow-md"
            >
              <div className="rounded-xl bg-emerald-200 p-3 text-emerald-800">
                <Truck size={28} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs uppercase tracking-wide text-emerald-700">Proceso activo</div>
                <div className="text-lg font-bold text-emerald-900">{p.name}</div>
                <div className="text-xs text-emerald-700">
                  {p._count?.sequences || 0} secuencia{p._count?.sequences === 1 ? '' : 's'} · iniciado {new Date(p.createdAt).toLocaleString('es-CL')}
                </div>
              </div>
              <ChevronRight className="text-emerald-700" size={22} />
            </Link>
          ))}
          {canCreate && openCount < 2 && (
            <Link
              to="/processes/new"
              className="card flex items-center gap-4 bg-brand-50 p-5 ring-1 ring-dashed ring-brand-300 transition hover:shadow-md"
            >
              <div className="rounded-xl bg-brand-100 p-3 text-brand-700">
                <Plus size={28} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs uppercase tracking-wide text-brand-700">Abrir otro proceso</div>
                <div className="text-sm text-brand-900">
                  Podés tener hasta 2 procesos en paralelo (matutino + vespertino).
                </div>
              </div>
            </Link>
          )}
        </div>
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
