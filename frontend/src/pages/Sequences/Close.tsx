import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { sequencesApi } from '@/lib/sequences';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';

export function SequenceClose() {
  const { id } = useParams();
  const seqId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: seq, isLoading } = useQuery({
    queryKey: ['sequence', seqId],
    queryFn: () => sequencesApi.get(seqId),
  });

  const [actualBags, setActualBags] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const close = useMutation({
    mutationFn: () => {
      const val = actualBags === '' ? undefined : Number(actualBags);
      return sequencesApi.close(seqId, val);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      queryClient.invalidateQueries({ queryKey: ['sequence', seqId] });
      navigate(`/sequences/${seqId}`);
    },
    onError: (err: any) => {
      const details = err.response?.data?.details;
      if (details) {
        setError(`Conteo no coincide: esperado ${details.expected}, empacado ${details.packed}${details.reported !== undefined ? `, reportado ${details.reported}` : ''}`);
      } else {
        setError(err.response?.data?.message || 'No se pudo cerrar la secuencia');
      }
    },
  });

  if (isLoading || !seq) return <Spinner />;

  const packed = seq.orders.filter((o) => ['packed', 'classified', 'loaded', 'delivered'].includes(o.order.status)).length;
  const ready = packed === seq.expectedBags && seq.status === 'open';

  return (
    <div className="space-y-4">
      <Link to={`/sequences/${seqId}`} className="btn-ghost text-sm">
        <ChevronLeft size={16} />
        Secuencia #{seqId}
      </Link>

      <div className="card space-y-3 p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Cerrar secuencia #{seqId}</h2>
          <Badge variant={seq.status === 'open' ? 'green' : 'gray'}>
            {seq.status === 'open' ? 'Abierta' : 'Cerrada'}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs text-slate-500">Pedidos esperados</div>
            <div className="text-2xl font-bold">{seq.expectedBags}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs text-slate-500">Bolsas empacadas</div>
            <div className="text-2xl font-bold">{packed}</div>
          </div>
        </div>

        {!ready && seq.status === 'open' && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            Aún quedan pedidos sin empacar. Completa el packing antes de cerrar.
          </div>
        )}

        {seq.status === 'open' && (
          <>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Conteo físico de bolsas (opcional, para doble verificación)
              </span>
              <input
                type="number"
                inputMode="numeric"
                className="input mt-1"
                value={actualBags}
                onChange={(e) => { setActualBags(e.target.value); setError(null); }}
                placeholder={String(seq.expectedBags)}
              />
            </label>

            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            <button
              onClick={() => { setError(null); close.mutate(); }}
              disabled={!ready || close.isPending}
              className="btn-primary w-full"
            >
              <CheckCircle2 size={18} />
              {close.isPending ? 'Cerrando…' : 'Confirmar cierre'}
            </button>
          </>
        )}

        {seq.status === 'closed' && seq.closedAt && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Cerrada el {new Date(seq.closedAt).toLocaleString('es-CL')}.
          </div>
        )}
      </div>
    </div>
  );
}
