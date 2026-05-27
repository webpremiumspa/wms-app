import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { sequencesApi } from '@/lib/sequences';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';

export function SequencesIndex() {
  const { user } = useAuth();
  const canCreate = hasCap(user, CAPS.PACK_B1);
  const { data, isLoading } = useQuery({
    queryKey: ['sequences'],
    queryFn: sequencesApi.list,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Secuencias</h2>
        {canCreate && (
          <Link to="/sequences/new" className="btn-primary text-sm">
            <Plus size={16} />
            Generar
          </Link>
        )}
      </div>

      {isLoading ? (
        <Spinner />
      ) : (data?.length ?? 0) === 0 ? (
        <div className="card p-6 text-center text-slate-500">
          Aún no hay secuencias. {canCreate && 'Genera la primera con el botón de arriba.'}
        </div>
      ) : (
        <div className="space-y-2">
          {data!.map((s) => (
            <Link
              key={s.id}
              to={`/sequences/${s.id}`}
              className="card flex items-center justify-between p-4 hover:shadow-md"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">#{s.id}</span>
                  <Badge variant={s.status === 'open' ? 'green' : 'gray'}>{s.status === 'open' ? 'Abierta' : 'Cerrada'}</Badge>
                  <Badge variant={s.b1ClosedAt ? 'green' : 'blue'}>
                    B1 {s.b1ClosedAt ? 'cerrado' : 'abierto'}
                  </Badge>
                  {(s.b2?.total ?? 0) > 0 && (
                    <Badge variant={s.b2ClosedAt ? 'green' : 'amber'}>
                      B2 {s.b2ClosedAt ? 'cerrado' : `${(s.b2?.pending ?? 0)} pend.`}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(s.createdAt).toLocaleString('es-CL')} · {s._count?.orders ?? s.expectedBags} pedidos
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <div>Esperados: {s.expectedBags}</div>
                <div>Empacados: {s.actualBags}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
