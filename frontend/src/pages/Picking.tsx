import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, ClipboardList, ChevronRight, Layers } from 'lucide-react';
import clsx from 'clsx';
import { sequencesApi } from '@/lib/sequences';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';

export function Picking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canPickB1 = hasCap(user, CAPS.PICK_B1);
  const canPickB2 = hasCap(user, CAPS.PICK_B2);
  const [batchSel, setBatchSel] = useState<Set<number>>(new Set());

  const { data: sequences, isLoading } = useQuery({
    queryKey: ['sequences'],
    queryFn: sequencesApi.list,
    enabled: canPickB1 || canPickB2,
    refetchInterval: 5000,
  });

  // Secuencias con B1 abierto.
  const openB1 = (sequences || []).filter((s) => s.b1ClosedAt === null);

  // Secuencias con items B2 (abiertas o cerradas — las cerradas se muestran
  // grisadas y no entran al batch, según Q4(b)).
  const withB2 = (sequences || []).filter((s) => (s.b2?.total ?? 0) > 0);
  const b2Open = withB2.filter((s) => !s.b2ClosedAt);
  const b2Closed = withB2.filter((s) => !!s.b2ClosedAt);

  function toggleBatch(seqId: number) {
    setBatchSel((prev) => {
      const next = new Set(prev);
      if (next.has(seqId)) next.delete(seqId);
      else next.add(seqId);
      return next;
    });
  }

  function startBatch() {
    const ids = [...batchSel].sort((a, b) => a - b);
    if (ids.length === 0) return;
    navigate(`/picking-b2/batch?ids=${ids.join(',')}`);
  }

  return (
    <div className="space-y-4 pb-24">
      <h2 className="text-xl font-semibold">Picking</h2>
      <p className="text-sm text-slate-500">
        Cada secuencia tiene su propio picking B1 (para empacar) y picking B2 (a granel). Cierran por separado.
      </p>

      {canPickB2 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-amber-800">Picking Bodega 2 · pendiente</h3>
            {b2Open.length >= 2 && (
              <span className="text-xs text-slate-500">
                Selecciona varias para hacer un picking conjunto
              </span>
            )}
          </div>

          {isLoading ? (
            <Spinner />
          ) : b2Open.length === 0 && b2Closed.length === 0 ? (
            <div className="card p-4 text-sm text-slate-500 ring-1 ring-amber-100">
              No hay secuencias con items B2.
            </div>
          ) : (
            <>
              {b2Open.map((s) => {
                const total = s.b2?.total ?? 0;
                const pending = s.b2?.pending ?? 0;
                const selected = batchSel.has(s.id);
                return (
                  <div
                    key={s.id}
                    className={clsx(
                      'card flex items-center gap-3 p-4 ring-1 transition',
                      selected ? 'ring-amber-500 bg-amber-50/50' : 'ring-amber-200',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleBatch(s.id)}
                      className="h-5 w-5 shrink-0 accent-amber-600"
                      aria-label={`Incluir secuencia ${s.id} en picking conjunto`}
                    />
                    <Link
                      to={`/sequences/${s.id}/picking-b2`}
                      className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-90"
                    >
                      <div className="rounded-lg bg-amber-100 p-3 text-amber-700">
                        <Package size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 font-semibold">
                          Secuencia #{s.id}
                          {pending === 0 ? (
                            <Badge variant="green">listo para cerrar</Badge>
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
                  </div>
                );
              })}

              {b2Closed.map((s) => (
                <div
                  key={s.id}
                  className="card flex items-center gap-3 p-4 opacity-60 ring-1 ring-slate-200"
                  title="B2 ya cerrado — no se puede incluir en un batch"
                >
                  <input type="checkbox" disabled className="h-5 w-5 shrink-0" />
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

      {canPickB1 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">Picking Bodega 1 · pendiente</h3>
          {isLoading ? (
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
            openB1.map((s) => {
              // En by_order el picker arma y empaca pedido por pedido, así que
              // el link debe llevarlo a la lista de packing (no al reporte por
              // SKU, que es solo para by_sku).
              const target = s.mode === 'by_order'
                ? `/sequences/${s.id}/packing`
                : `/sequences/${s.id}/picking`;
              const label = s.mode === 'by_order' ? 'Picking + Packing' : 'Picking B1';
              return (
                <Link
                  key={s.id}
                  to={target}
                  className="card flex items-center gap-3 p-3 hover:shadow-md"
                >
                  <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
                    <ClipboardList size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 font-semibold">
                      Secuencia #{s.id}
                      <Badge variant="gray">{label}</Badge>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(s.createdAt).toLocaleString('es-CL')} · {s._count?.orders ?? s.expectedBags} pedidos
                    </div>
                  </div>
                  <ChevronRight className="text-slate-400" />
                </Link>
              );
            })
          )}
        </div>
      )}

      {!canPickB1 && !canPickB2 && (
        <div className="card p-6 text-center text-slate-500">
          No tienes capabilities de picking asignadas.
        </div>
      )}

      {batchSel.size >= 2 && (
        <div className="fixed inset-x-0 bottom-16 z-20 mx-auto max-w-3xl px-4 md:bottom-4">
          <button
            type="button"
            onClick={startBatch}
            className="btn-primary flex w-full items-center justify-center gap-2 shadow-lg"
          >
            <Layers size={18} />
            Picking conjunto ({batchSel.size} secuencias)
          </button>
        </div>
      )}
    </div>
  );
}
