import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, ClipboardList, ChevronRight } from 'lucide-react';
import { sequencesApi } from '@/lib/sequences';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';

export function Picking() {
  const { user } = useAuth();
  const canPackB1 = hasCap(user, CAPS.PACK_B1);
  const canPickB2 = hasCap(user, CAPS.PACK_B2);
  const [showClosed, setShowClosed] = useState(false);

  const { data: sequences, isLoading } = useQuery({
    queryKey: ['sequences'],
    queryFn: () => sequencesApi.list(),
    enabled: canPackB1 || canPickB2,
    refetchInterval: 5000,
  });

  const b1OpenList = (sequences || []).filter((s) => s.b1ClosedAt === null);
  const b1ClosedList = (sequences || []).filter((s) => !!s.b1ClosedAt);

  const withB2 = (sequences || []).filter((s) => (s.b2?.total ?? 0) > 0);
  const b2Open = withB2.filter((s) => !s.b2ClosedAt);
  const b2Closed = withB2.filter((s) => !!s.b2ClosedAt);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Picking</h2>
        <label className="flex items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={showClosed}
            onChange={(e) => setShowClosed(e.target.checked)}
            className="h-4 w-4 accent-brand-600"
          />
          Mostrar cerradas
        </label>
      </div>
      <p className="text-sm text-slate-500">
        Cada secuencia tiene su propio picking B1 (para empacar) y picking B2 (a granel, pedido por pedido). Cierran por separado.
      </p>

      {canPickB2 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-amber-800">Picking Bodega 2 · pendiente</h3>
          {isLoading ? (
            <Spinner />
          ) : b2Open.length === 0 && (!showClosed || b2Closed.length === 0) ? (
            <div className="card p-4 text-sm text-slate-500 ring-1 ring-amber-100">
              {b2Closed.length > 0 && !showClosed
                ? 'No hay picking B2 pendiente. Activa "Mostrar cerradas" para ver las cerradas.'
                : 'No hay secuencias con items B2.'}
            </div>
          ) : (
            <>
              {b2Open.map((s) => {
                const total = s.b2?.total ?? 0;
                const pending = s.b2?.pending ?? 0;
                return (
                  <Link
                    key={s.id}
                    to={`/sequences/${s.id}/picking-b2`}
                    className="card flex items-center gap-3 p-4 ring-1 ring-amber-200 hover:shadow-md"
                  >
                    <div className="rounded-lg bg-amber-100 p-3 text-amber-700">
                      <Package size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 font-semibold">
                        Secuencia #{s.id}
                        {pending === 0 ? (
                          <Badge variant="green">listo</Badge>
                        ) : (
                          <Badge variant="amber">{pending}/{total} items pendientes</Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {s._count?.orders ?? s.expectedBags} pedido{(s._count?.orders ?? 0) === 1 ? '' : 's'} · {new Date(s.createdAt).toLocaleString('es-CL')}
                      </div>
                    </div>
                    <ChevronRight className="text-slate-400" />
                  </Link>
                );
              })}

              {showClosed && b2Closed.map((s) => (
                <div
                  key={s.id}
                  className="card flex items-center gap-3 p-4 opacity-60 ring-1 ring-slate-200"
                >
                  <div className="rounded-lg bg-slate-100 p-3 text-slate-500">
                    <Package size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 font-semibold text-slate-600">
                      Secuencia #{s.id}
                      <Badge variant="green">B2 cerrado</Badge>
                    </div>
                    <div className="text-xs text-slate-500">
                      {s._count?.orders ?? s.expectedBags} pedidos · cerrado el {s.b2ClosedAt ? new Date(s.b2ClosedAt).toLocaleString('es-CL') : '—'}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {canPackB1 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">Picking Bodega 1 · pendiente</h3>
          {isLoading ? (
            <Spinner />
          ) : b1OpenList.length === 0 ? (
            <div className="card p-4 text-sm text-slate-500">
              No hay secuencias B1 abiertas. {hasCap(user, CAPS.PACK_B1) && (
                <Link to="/sequences/new" className="text-brand-700 underline">
                  Generar una
                </Link>
              )}
            </div>
          ) : (
            b1OpenList.map((s) => (
              <Link
                key={s.id}
                to={`/sequences/${s.id}/packing`}
                className="card flex items-center gap-3 p-3 hover:shadow-md"
              >
                <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
                  <ClipboardList size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">Secuencia #{s.id}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(s.createdAt).toLocaleString('es-CL')} · {s._count?.orders ?? s.expectedBags} pedidos
                  </div>
                </div>
                <ChevronRight className="text-slate-400" />
              </Link>
            ))
          )}

          {showClosed && b1ClosedList.map((s) => (
            <div
              key={s.id}
              className="card flex items-center gap-3 p-3 opacity-60 ring-1 ring-slate-200"
              title="B1 ya cerrado"
            >
              <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
                <ClipboardList size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 font-semibold text-slate-600">
                  Secuencia #{s.id}
                  <Badge variant="green">B1 cerrado</Badge>
                </div>
                <div className="text-xs text-slate-500">
                  {s._count?.orders ?? s.expectedBags} pedidos · cerrado el {s.b1ClosedAt ? new Date(s.b1ClosedAt).toLocaleString('es-CL') : '—'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!canPackB1 && !canPickB2 && (
        <div className="card p-6 text-center text-slate-500">
          No tienes capabilities de picking asignadas.
        </div>
      )}
    </div>
  );
}
