import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';
import { sequencesApi } from '@/lib/sequences';
import { Spinner } from '@/components/Spinner';
import { ProgressBar } from '@/components/ProgressBar';

export function SequencePicking() {
  const { id } = useParams();
  const seqId = Number(id);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['sequence', seqId, 'picking-report'],
    queryFn: () => sequencesApi.pickingReport(seqId),
    refetchInterval: 5000, // mantener varios pickers viendo lo mismo
  });

  const mark = useMutation({
    mutationFn: ({ productId, picked }: { productId: number; picked: boolean }) =>
      sequencesApi.markPicked(seqId, productId, picked),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sequence', seqId, 'picking-report'] }),
  });

  if (isLoading || !data) return <Spinner />;

  const picked = data.items.filter((i) => i.picked).length;

  return (
    <div className="space-y-4">
      <Link to={`/sequences/${seqId}`} className="btn-ghost text-sm">
        <ChevronLeft size={16} />
        Secuencia #{seqId}
      </Link>
      <div className="card space-y-3 p-4">
        <h2 className="text-lg font-semibold">Picking B1 · Secuencia #{seqId}</h2>
        <ProgressBar value={picked} total={data.items.length} label="SKUs recolectados" />
        {data.allPicked && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            ✓ Picking completo. Continúa con el packing.
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
              <div className="truncate font-medium text-slate-900">{it.name}</div>
              <div className="text-xs text-slate-500">{it.sku || '—'}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-lg font-bold text-brand-700">×{it.qty}</div>
            </div>
            <input
              type="checkbox"
              checked={it.picked}
              onChange={(e) => mark.mutate({ productId: it.productId, picked: e.target.checked })}
              className="ml-2 h-6 w-6 accent-brand-600"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
