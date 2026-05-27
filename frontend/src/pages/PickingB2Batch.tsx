import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Image as ImageIcon, CheckCircle2, Layers } from 'lucide-react';
import clsx from 'clsx';
import { pickingB2Api, type B2BatchCloseResult } from '@/lib/dispatch';
import { Spinner } from '@/components/Spinner';
import { ProgressBar } from '@/components/ProgressBar';

export function PickingB2Batch() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [closeResult, setCloseResult] = useState<B2BatchCloseResult | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);

  const sequenceIds = useMemo(() => {
    const raw = params.get('ids') || '';
    return raw.split(',').map((s) => Number(s.trim())).filter((n) => Number.isInteger(n) && n > 0);
  }, [params]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['picking-b2-batch', sequenceIds.join(',')],
    queryFn: () => pickingB2Api.batchReport(sequenceIds),
    enabled: sequenceIds.length > 0,
    refetchInterval: 5000,
  });

  const mark = useMutation({
    mutationFn: ({ productId, picked }: { productId: number; picked: boolean }) =>
      pickingB2Api.batchMark(sequenceIds, productId, picked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['picking-b2-batch', sequenceIds.join(',')] });
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
    },
  });

  const close = useMutation({
    mutationFn: () => pickingB2Api.batchClose(sequenceIds),
    onSuccess: (result) => {
      setCloseResult(result);
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
    },
    onError: (err: any) => {
      setCloseError(err.response?.data?.message || 'No se pudo cerrar el picking conjunto');
    },
  });

  if (sequenceIds.length === 0) {
    return (
      <div className="space-y-4">
        <Link to="/picking" className="btn-ghost text-sm">
          <ChevronLeft size={16} />
          Picking
        </Link>
        <div className="card p-6 text-center text-slate-500">
          No se especificaron secuencias para el batch.
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    if (error) {
      return (
        <div className="space-y-4">
          <Link to="/picking" className="btn-ghost text-sm">
            <ChevronLeft size={16} />
            Picking
          </Link>
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
            {(error as any).response?.data?.message || 'No se pudo cargar el batch'}
          </div>
        </div>
      );
    }
    return <Spinner />;
  }

  // Si el cierre ya se ejecutó, mostramos el resumen.
  if (closeResult) {
    return (
      <div className="space-y-4">
        <Link to="/picking" className="btn-ghost text-sm">
          <ChevronLeft size={16} />
          Picking
        </Link>
        <div className="card space-y-3 p-4">
          <h2 className="text-lg font-semibold">Resumen del cierre conjunto</h2>
          {closeResult.closed.length > 0 && (
            <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
              <div className="font-semibold">✓ {closeResult.closed.length} secuencia{closeResult.closed.length === 1 ? '' : 's'} cerrada{closeResult.closed.length === 1 ? '' : 's'}:</div>
              <div className="mt-1">{closeResult.closed.map((id) => `#${id}`).join(', ')}</div>
            </div>
          )}
          {closeResult.stillPending.length > 0 && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200">
              <div className="font-semibold">⚠ {closeResult.stillPending.length} secuencia{closeResult.stillPending.length === 1 ? '' : 's'} con items sin pickear (sigue{closeResult.stillPending.length === 1 ? '' : 'n'} abierta{closeResult.stillPending.length === 1 ? '' : 's'}):</div>
              <ul className="mt-1 list-disc pl-5">
                {closeResult.stillPending.map((s) => (
                  <li key={s.sequenceId}>
                    Secuencia #{s.sequenceId} — {s.pending}/{s.total} items pendientes
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            type="button"
            onClick={() => navigate('/picking')}
            className="btn-primary w-full"
          >
            Volver al picking
          </button>
        </div>
      </div>
    );
  }

  const picked = data.items.filter((i) => i.picked).length;

  return (
    <div className="space-y-4 pb-24">
      <Link to="/picking" className="btn-ghost text-sm">
        <ChevronLeft size={16} />
        Picking
      </Link>

      <div className="card space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Layers className="text-amber-700" size={20} />
          <h2 className="text-lg font-semibold">Picking B2 conjunto</h2>
        </div>
        <p className="text-xs text-slate-500">
          Items B2 consolidados de las secuencias: {sequenceIds.map((id) => `#${id}`).join(', ')}.
          Al cerrar, se cierran solo las secuencias 100% pickeadas — las que tengan items sin marcar quedan abiertas.
        </p>
        <ProgressBar value={picked} total={data.items.length} label="SKUs recolectados" />
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
              onChange={(e) => mark.mutate({ productId: it.productId, picked: e.target.checked })}
              className="ml-2 h-6 w-6 accent-amber-600"
            />
          </label>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-16 z-20 mx-auto max-w-3xl px-4 md:bottom-4">
        {closeError && (
          <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{closeError}</div>
        )}
        <button
          type="button"
          onClick={() => { setCloseError(null); close.mutate(); }}
          disabled={close.isPending}
          className="btn-primary flex w-full items-center justify-center gap-2 shadow-lg"
        >
          <CheckCircle2 size={18} />
          {close.isPending ? 'Cerrando…' : 'Cerrar picking conjunto'}
        </button>
      </div>
    </div>
  );
}
