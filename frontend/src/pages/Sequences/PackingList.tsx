import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { sequencesApi } from '@/lib/sequences';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { ProgressBar } from '@/components/ProgressBar';

export function PackingList() {
  const { id } = useParams();
  const seqId = Number(id);
  const { data, isLoading } = useQuery({
    queryKey: ['sequence', seqId, 'pending-packing'],
    queryFn: () => sequencesApi.pendingPacking(seqId),
    refetchInterval: 4000,
  });

  if (isLoading || !data) return <Spinner />;

  const packed = data.filter((o) => ['packed', 'classified', 'loaded', 'delivered'].includes(o.status)).length;
  // Pendientes primero, empacados al final (mejor flujo visual del picker).
  const sorted = [...data].sort((a, b) => {
    const aDone = ['packed', 'classified', 'loaded', 'delivered'].includes(a.status) ? 1 : 0;
    const bDone = ['packed', 'classified', 'loaded', 'delivered'].includes(b.status) ? 1 : 0;
    return aDone - bDone;
  });

  return (
    <div className="space-y-4">
      <Link to={`/sequences/${seqId}`} className="btn-ghost text-sm">
        <ChevronLeft size={16} />
        Secuencia #{seqId}
      </Link>
      <h2 className="text-xl font-semibold">Selección de pedido a empacar</h2>
      <ProgressBar value={packed} total={data.length} label="Pedidos empacados" />

      <div className="space-y-2">
        {sorted.map((o) => {
          const done = o.status === 'packed' || o.status === 'classified' || o.status === 'loaded' || o.status === 'delivered';
          return (
            <Link
              key={o.id}
              to={done ? '#' : `/sequences/${seqId}/packing/${o.id}`}
              onClick={(e) => done && e.preventDefault()}
              className={clsx(
                'card flex items-center justify-between p-3',
                done ? 'opacity-60' : 'hover:shadow-md',
                !o.ready && !done && 'ring-1 ring-amber-200',
              )}
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">#{o.number}</span>
                  {o.hasB2Pending && <Badge variant="amber">B2</Badge>}
                  {done && <Badge variant="green">Empacado</Badge>}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {o.customerName || '—'} · {o.itemCount} items B1
                </div>
              </div>
              {!o.ready && !done && (
                <div className="ml-3 flex items-center gap-1 text-xs text-amber-700">
                  <AlertTriangle size={14} />
                  Picking incompleto
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
