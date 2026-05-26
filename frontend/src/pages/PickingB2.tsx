import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';
import { pickingB2Api } from '@/lib/dispatch';
import { Spinner } from '@/components/Spinner';
import { ProgressBar } from '@/components/ProgressBar';

export function PickingB2() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['picking-b2-today'],
    queryFn: pickingB2Api.today,
    refetchInterval: 5000,
  });

  const mark = useMutation({
    mutationFn: ({ productId, picked }: { productId: number; picked: boolean }) =>
      pickingB2Api.mark(productId, picked),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['picking-b2-today'] }),
  });

  if (isLoading || !data) return <Spinner />;
  if (data.totalSkus === 0) {
    return (
      <div className="card p-6 text-center text-slate-500">
        No hay items B2 pendientes de recolectar hoy.
      </div>
    );
  }

  const picked = data.items.filter((i) => i.picked).length;

  return (
    <div className="space-y-4">
      <div className="card space-y-3 p-4">
        <h2 className="text-lg font-semibold">Picking Bodega 2 · hoy</h2>
        <ProgressBar value={picked} total={data.items.length} label="SKUs recolectados" />
        {data.allPicked && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            ✓ Picking de Bodega 2 completo.
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
                {it.sku || '—'} · {it.ordersCount} pedidos
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-lg font-bold text-amber-700">×{it.qty}</div>
            </div>
            <input
              type="checkbox"
              checked={it.picked}
              onChange={(e) => mark.mutate({ productId: it.productId, picked: e.target.checked })}
              className="ml-2 h-6 w-6 accent-amber-600"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
