import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { pickingB2Api } from '@/lib/dispatch';
import { Spinner } from '@/components/Spinner';
import { ProgressBar } from '@/components/ProgressBar';

export function PickingB2() {
  const { id } = useParams();
  const seqId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [closeError, setCloseError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['picking-b2-sequence', seqId],
    queryFn: () => pickingB2Api.forSequence(seqId),
    refetchInterval: 5000,
  });

  const mark = useMutation({
    mutationFn: ({ productId, picked }: { productId: number; picked: boolean }) =>
      pickingB2Api.mark(seqId, productId, picked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['picking-b2-sequence', seqId] });
      queryClient.invalidateQueries({ queryKey: ['picking-b2-summary'] });
    },
  });

  const close = useMutation({
    mutationFn: () => pickingB2Api.closeB2(seqId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['picking-b2-summary'] });
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      queryClient.invalidateQueries({ queryKey: ['sequence', seqId] });
      navigate('/picking');
    },
    onError: (err: any) => {
      setCloseError(err.response?.data?.message || 'No se pudo cerrar el picking B2');
    },
  });

  if (isLoading || !data) return <Spinner />;

  const alreadyClosed = !!data.sequence.b2ClosedAt;

  if (data.totalSkus === 0) {
    return (
      <div className="space-y-4">
        <Link to="/picking" className="btn-ghost text-sm">
          <ChevronLeft size={16} />
          Picking
        </Link>
        <div className="card p-6 text-center text-slate-500">
          La secuencia #{seqId} no tiene items B2.
        </div>
      </div>
    );
  }

  const picked = data.items.filter((i) => i.picked).length;

  return (
    <div className="space-y-4">
      <Link to="/picking" className="btn-ghost text-sm">
        <ChevronLeft size={16} />
        Picking
      </Link>

      <div className="card space-y-3 p-4">
        <h2 className="text-lg font-semibold">Picking Bodega 2 · Secuencia #{seqId}</h2>
        <ProgressBar value={picked} total={data.items.length} label="SKUs recolectados" />
        {alreadyClosed && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            ✓ Picking B2 cerrado el {new Date(data.sequence.b2ClosedAt!).toLocaleString('es-CL')}.
          </div>
        )}
        {!alreadyClosed && data.allPicked && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            ✓ Todos los SKUs marcados. Confirma el cierre cuando estés listo.
          </div>
        )}
      </div>

      <div className="space-y-2">
        {data.items.map((it) => (
          <label
            key={it.productId}
            className={clsx(
              'card flex items-center gap-3 p-3 transition',
              it.picked && 'bg-emerald-50/60 ring-1 ring-emerald-200',
            )}
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
              {it.thumbnailUrl ? (
                <img src={it.thumbnailUrl} alt={it.name} className="h-full w-full object-cover" />
              ) : (
                <ImageIcon size={20} className="text-slate-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{it.name}</div>
              <div className="text-xs text-slate-500">
                {it.sku || '—'} · {it.ordersCount} pedido{it.ordersCount === 1 ? '' : 's'}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-lg font-bold text-amber-700">×{it.qty}</div>
            </div>
            <input
              type="checkbox"
              checked={it.picked}
              disabled={alreadyClosed}
              onChange={(e) => mark.mutate({ productId: it.productId, picked: e.target.checked })}
              className="ml-2 h-6 w-6 accent-amber-600"
            />
          </label>
        ))}
      </div>

      {!alreadyClosed && (
        <div className="sticky bottom-20 z-10 bg-slate-100 pt-2 md:bottom-0">
          {closeError && (
            <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{closeError}</div>
          )}
          <button
            type="button"
            onClick={() => { setCloseError(null); close.mutate(); }}
            disabled={!data.allPicked || close.isPending}
            className="btn-primary w-full"
          >
            <CheckCircle2 size={18} />
            {close.isPending ? 'Cerrando…' : 'Cerrar picking B2'}
          </button>
        </div>
      )}
    </div>
  );
}
