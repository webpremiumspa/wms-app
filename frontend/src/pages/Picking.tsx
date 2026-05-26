import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, ClipboardList, ChevronRight } from 'lucide-react';
import { sequencesApi } from '@/lib/sequences';
import { pickingB2Api } from '@/lib/dispatch';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';

export function Picking() {
  const { user } = useAuth();
  const canPickB1 = hasCap(user, CAPS.PICK_B1);
  const canPickB2 = hasCap(user, CAPS.PICK_B2);

  const { data: sequences, isLoading: loadingSeq } = useQuery({
    queryKey: ['sequences'],
    queryFn: sequencesApi.list,
    enabled: canPickB1,
    refetchInterval: 5000,
  });

  const { data: b2, isLoading: loadingB2 } = useQuery({
    queryKey: ['picking-b2-today'],
    queryFn: pickingB2Api.today,
    enabled: canPickB2,
    refetchInterval: 5000,
  });

  const openB1 = (sequences || []).filter((s) => s.warehouse === 'B1' && s.status === 'open');
  const b2Pending = b2 ? b2.items.filter((i) => !i.picked).length : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Picking</h2>
      <p className="text-sm text-slate-500">
        Accede al trabajo de recolección pendiente. El picking se hace por secuencia (Bodega 1) o por reporte consolidado del día (Bodega 2).
      </p>

      {canPickB2 && (
        <Link
          to="/picking-b2"
          className="card flex items-center gap-3 p-4 ring-1 ring-amber-200 hover:shadow-md"
        >
          <div className="rounded-lg bg-amber-100 p-3 text-amber-700">
            <Package size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 font-semibold">
              Bodega 2 · hoy
              {loadingB2 ? (
                <Badge variant="gray">cargando…</Badge>
              ) : b2 && b2.totalSkus === 0 ? (
                <Badge variant="green">sin pendientes</Badge>
              ) : (
                <Badge variant="amber">{b2Pending}/{b2?.totalSkus ?? 0} SKUs por recolectar</Badge>
              )}
            </div>
            <div className="text-xs text-slate-500">Reporte consolidado matinal</div>
          </div>
          <ChevronRight className="text-slate-400" />
        </Link>
      )}

      {canPickB1 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">Secuencias Bodega 1 abiertas</h3>
          {loadingSeq ? (
            <Spinner />
          ) : openB1.length === 0 ? (
            <div className="card p-4 text-sm text-slate-500">
              No hay secuencias B1 abiertas. {hasCap(user, CAPS.PACK_B1) && (
                <Link to="/sequences/new" className="text-brand-700 underline">
                  Generar una
                </Link>
              )}
            </div>
          ) : (
            openB1.map((s) => (
              <Link
                key={s.id}
                to={`/sequences/${s.id}/picking`}
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
        </div>
      )}

      {!canPickB1 && !canPickB2 && (
        <div className="card p-6 text-center text-slate-500">
          No tienes capabilities de picking asignadas.
        </div>
      )}
    </div>
  );
}
