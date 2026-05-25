import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ChevronLeft } from 'lucide-react';
import { sequencesApi } from '@/lib/sequences';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import type { StockProblem, Warehouse } from '@/lib/types';
import clsx from 'clsx';

export function SequenceNew() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [warehouse] = useState<Warehouse>('B1');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [problems, setProblems] = useState<StockProblem[] | null>(null);

  const { data: pending, isLoading } = useQuery({
    queryKey: ['orders', 'pending'],
    queryFn: sequencesApi.pendingOrders,
  });

  const orderIds = useMemo(() => [...selected], [selected]);

  const validate = useMutation({
    mutationFn: () => sequencesApi.validateStock(orderIds),
    onSuccess: (problems) => setProblems(problems),
  });

  const create = useMutation({
    mutationFn: () => sequencesApi.create(warehouse, orderIds),
    onSuccess: (seq) => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'pending'] });
      navigate(`/sequences/${seq.id}`);
    },
  });

  function toggle(id: number) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setProblems(null); // invalida validación si cambia selección
  }

  const blocking = (problems || []).filter((p) => !p.warning);
  const canCreate = orderIds.length > 0 && (!problems || blocking.length === 0);

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="btn-ghost text-sm">
        <ChevronLeft size={16} />
        Volver
      </button>
      <h2 className="text-xl font-semibold">Generar secuencia · Bodega {warehouse}</h2>
      <p className="text-sm text-slate-500">
        Selecciona los pedidos que entran en la próxima secuencia. Validaremos stock antes de crearla.
      </p>

      {isLoading ? (
        <Spinner />
      ) : (pending?.length ?? 0) === 0 ? (
        <div className="card p-6 text-center text-slate-500">
          No hay pedidos pendientes para secuenciar.
        </div>
      ) : (
        <div className="space-y-2">
          {pending!.map((o) => {
            const isSel = selected.has(o.id);
            return (
              <button
                key={o.id}
                onClick={() => toggle(o.id)}
                className={clsx(
                  'card flex w-full items-center justify-between p-3 text-left',
                  isSel && 'ring-2 ring-brand-600',
                )}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">#{o.number}</span>
                    {o.route && <Badge variant="blue">{o.route}</Badge>}
                    {o.hasB2Pending && <Badge variant="amber">B2</Badge>}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {o.customerName || '—'} · {o.itemCount} items
                  </div>
                </div>
                <input type="checkbox" readOnly checked={isSel} className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      )}

      {problems && (
        <div className="card space-y-2 p-4">
          {blocking.length === 0 ? (
            <div className="text-sm text-emerald-700">
              Stock OK para los {orderIds.length} pedidos seleccionados.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle size={18} />
                <span className="font-semibold">Faltantes de stock</span>
              </div>
              <ul className="space-y-1 text-sm text-slate-700">
                {blocking.map((p) => (
                  <li key={p.productId}>
                    <span className="font-medium">{p.name}</span> ({p.sku}) — requiere {p.required}, disponible {p.available}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500">
                Quita los pedidos afectados o repón stock antes de generar la secuencia.
              </p>
            </>
          )}
        </div>
      )}

      <div className="sticky bottom-20 z-10 flex flex-col gap-2 bg-slate-100 pt-2 md:bottom-0 md:flex-row">
        <button
          onClick={() => validate.mutate()}
          disabled={orderIds.length === 0 || validate.isPending}
          className="btn-ghost flex-1 border border-slate-300"
        >
          {validate.isPending ? 'Validando…' : `Validar stock (${orderIds.length})`}
        </button>
        <button
          onClick={() => create.mutate()}
          disabled={!canCreate || create.isPending}
          className="btn-primary flex-1"
        >
          {create.isPending ? 'Creando…' : `Generar secuencia (${orderIds.length})`}
        </button>
      </div>
    </div>
  );
}
