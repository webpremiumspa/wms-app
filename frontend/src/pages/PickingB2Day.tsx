import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, CheckCircle2, Image as ImageIcon, List, Package } from 'lucide-react';
import clsx from 'clsx';
import { pickingB2Api } from '@/lib/dispatch';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { ShippingBadge } from '@/components/ShippingBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { RouteFilter, type RouteFilterValue } from '@/components/RouteFilter';
import { warehouseLabel } from '@/lib/labels';
import { applyRouteFilter, extractRoutes } from '@/lib/routeFilter';

export function PickingB2Day() {
  const [routeFilter, setRouteFilter] = useState<RouteFilterValue>(null);
  const [showSummary, setShowSummary] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['picking-b2-today'],
    queryFn: () => pickingB2Api.today(),
    refetchInterval: 5000,
  });

  if (isLoading || !data) return <Spinner />;

  const total = data.orders.length;
  const closed = data.orders.filter((o) => !!o.b2ClosedAt).length;
  const { routes, hasNoRoute } = extractRoutes(data.orders);
  const sorted = applyRouteFilter(data.orders, routeFilter);

  return (
    <div className="space-y-4 pb-4">
      <Link to="/picking" className="btn-ghost text-sm">
        <ChevronLeft size={16} />
        Picking
      </Link>

      <div>
        <h2 className="text-xl font-semibold">Picking {warehouseLabel('B2')} · Vista del día</h2>
        <div className="text-xs text-slate-500">
          Todos los pedidos B2 pendientes de todas las secuencias abiertas.
        </div>
      </div>

      <ProgressBar value={closed} total={total} label="Pedidos B2 cerrados" />

      {/* ────────────── Tabla informativa (guía para recorrer la bodega) ────────────── */}
      <div className="card overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSummary((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-slate-50"
        >
          <div className="flex items-center gap-2">
            <Package size={16} className="text-amber-700" />
            <span className="text-sm font-semibold text-slate-800">
              Productos a sacar de {warehouseLabel('B2')}
            </span>
            <Badge variant="amber">{data.summary.length} SKU</Badge>
          </div>
          <List size={16} className={clsx('text-slate-400 transition', !showSummary && 'rotate-180')} />
        </button>
        {showSummary && (
          <div className="border-t border-slate-200 px-2 py-2">
            {data.summary.length === 0 ? (
              <div className="px-2 py-4 text-center text-xs text-slate-500">
                Sin items pendientes. Todos los pedidos cerraron B2.
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="text-slate-500">
                  <tr>
                    <th className="px-2 py-1 text-left">Producto</th>
                    <th className="px-2 py-1 text-left">SKU</th>
                    <th className="px-2 py-1 text-right">Total</th>
                    <th className="px-2 py-1 text-left">Pedidos</th>
                  </tr>
                </thead>
                <tbody>
                  {data.summary.map((row) => (
                    <tr key={row.productId} className="border-t border-slate-100 align-top">
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          {row.thumbnailUrl ? (
                            <img src={row.thumbnailUrl} alt="" className="h-8 w-8 rounded object-cover ring-1 ring-slate-200" />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100">
                              <ImageIcon size={14} className="text-slate-400" />
                            </div>
                          )}
                          <span className="truncate font-medium text-slate-800">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 font-mono text-slate-600">{row.sku || '—'}</td>
                      <td className="px-2 py-2 text-right text-base font-bold text-amber-700">×{row.totalQty}</td>
                      <td className="px-2 py-2 text-slate-500">
                        {row.orders.map((o) => (
                          <span key={o.wpOrderId} className="mr-2 whitespace-nowrap">
                            #{o.number} (×{o.qty})
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="px-2 pt-2 text-[10px] italic text-slate-400">
              Esta tabla es solo guía. El cierre se hace pedido por pedido más abajo.
            </div>
          </div>
        )}
      </div>

      {/* ────────────── Filtros y lista de pedidos ────────────── */}
      {routes.length > 0 || hasNoRoute ? (
        <RouteFilter routes={routes} hasNoRoute={hasNoRoute} value={routeFilter} onChange={setRouteFilter} />
      ) : null}

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">Pedidos pendientes</h3>
        {sorted.length === 0 ? (
          <div className="card p-6 text-center text-sm text-slate-500">
            Sin pedidos B2 pendientes con este filtro.
          </div>
        ) : (
          sorted.map((o) => {
            const done = !!o.b2ClosedAt;
            const to = o.sequenceId ? `/sequences/${o.sequenceId}/picking-b2/${o.id}` : '#';
            return (
              <Link
                key={o.id}
                to={to}
                className={clsx(
                  'card flex items-center justify-between p-3',
                  done ? 'opacity-60' : 'hover:shadow-md',
                )}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">#{o.number}</span>
                    {o.route && <Badge variant="blue">{o.route}</Badge>}
                    {o.stopPosition != null && <Badge variant="gray">Parada {o.stopPosition}</Badge>}
                    <Badge variant="amber">{warehouseLabel('B2')} ×{o.itemCount}</Badge>
                    <ShippingBadge method={o.shippingMethod} />
                    {o.sequenceId && (
                      <Badge variant="gray">Sec #{o.sequenceId}</Badge>
                    )}
                    {done && (
                      <Badge variant="green">
                        <CheckCircle2 size={12} className="inline" /> B2 cerrado
                      </Badge>
                    )}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {o.customerName || '—'} · {o.pickedCount}/{o.itemCount} items pickeados
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
