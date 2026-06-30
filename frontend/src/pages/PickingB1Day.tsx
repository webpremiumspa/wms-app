import { useCallback, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, CheckCircle2, Image as ImageIcon, List, Package } from 'lucide-react';
import clsx from 'clsx';
import { pickingB1Api } from '@/lib/dispatch';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { ShippingBadge } from '@/components/ShippingBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { RouteFilter, NO_ROUTE_KEY, type RouteFilterValue, type RouteCount } from '@/components/RouteFilter';
import { warehouseLabel } from '@/lib/labels';
import { applyRouteFilter, extractRoutes } from '@/lib/routeFilter';
import { OrderSearchBox, HighlightedNumber, matchesOrderId } from '@/components/OrderSearchBox';

// Vista informativa B1 análoga a PickingB2Day. Tabla agrupada de productos B1
// + lista de pedidos pendientes del proceso. El cierre B1 sigue siendo por
// pedido desde PackingOrder (vía albarán escaneado), esta vista solo ayuda al
// picker B1 a recorrer la bodega una vez sabiendo el total de cada SKU.
export function PickingB1Day() {
  const { id: processIdParam } = useParams();
  const processId = processIdParam ? Number(processIdParam) : undefined;

  const [searchParams, setSearchParams] = useSearchParams();
  const routeParam = searchParams.get('route');
  const routeFilter: RouteFilterValue = (routeParam as RouteFilterValue) ?? null;
  const setRouteFilter = useCallback(
    (next: RouteFilterValue) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next == null) params.delete('route');
          else params.set('route', next);
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );
  const [showSummary, setShowSummary] = useState(true);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['picking-b1-today', processId || 'global'],
    queryFn: () => pickingB1Api.today({ processId }),
    refetchInterval: 5000,
  });

  const routeCounts = useMemo<Record<string, RouteCount>>(() => {
    if (!data) return {};
    const out: Record<string, RouteCount> = {};
    for (const o of data.orders) {
      const key = o.route || NO_ROUTE_KEY;
      if (!out[key]) out[key] = { closed: 0, total: 0 };
      out[key].total += 1;
      if (o.b1ClosedAt) out[key].closed += 1;
    }
    return out;
  }, [data]);

  const summaryFiltered = useMemo(() => {
    if (!data) return [];
    if (routeFilter === null) return data.summary;
    const visibleNumbers = new Set(
      applyRouteFilter(data.orders, routeFilter).map((o) => o.number),
    );
    const rows = [];
    for (const row of data.summary) {
      const myOrders = row.orders.filter((ro) => visibleNumbers.has(ro.number));
      if (myOrders.length === 0) continue;
      rows.push({
        ...row,
        totalQty: myOrders.reduce((acc, ro) => acc + ro.qty, 0),
        pendingQty: myOrders.filter((ro) => !ro.done).reduce((acc, ro) => acc + ro.qty, 0),
        orders: myOrders,
      });
    }
    return rows;
  }, [data, routeFilter]);

  if (isLoading || !data) return <Spinner />;

  const total = data.orders.length;
  const closed = data.orders.filter((o) => !!o.b1ClosedAt).length;
  const { routes, hasNoRoute } = extractRoutes(data.orders);

  const filteredOrders = applyRouteFilter(data.orders, routeFilter).filter((o) =>
    matchesOrderId(o.number, search),
  );

  return (
    <div className="space-y-4 pb-4">
      <Link to={processId ? `/processes/${processId}` : '/processes'} className="btn-ghost text-sm">
        <ChevronLeft size={16} />
        {processId ? 'Proceso' : 'Procesos'}
      </Link>

      <div>
        <h2 className="text-xl font-semibold">Picking {warehouseLabel('B1')} · Vista del día</h2>
        <div className="text-xs text-slate-500">
          Todos los pedidos con items {warehouseLabel('B1')} del proceso. El cierre se sigue haciendo desde el albarán de cada pedido — esta vista es guía para recorrer la bodega.
        </div>
      </div>

      <ProgressBar value={closed} total={total} label={`Pedidos ${warehouseLabel('B1')} empacados`} />

      <RouteFilter
        selected={routeFilter}
        routes={routes}
        hasNoRoute={hasNoRoute}
        onChange={setRouteFilter}
        counts={routeCounts}
      />

      <div className="card overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSummary((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-slate-50"
        >
          <div className="flex items-center gap-2">
            <Package size={16} className="text-brand-700" />
            <span className="text-sm font-semibold text-slate-800">
              Productos a sacar de {warehouseLabel('B1')}
            </span>
            <Badge variant="blue">{summaryFiltered.length} SKU</Badge>
            {routeFilter && <Badge variant="blue">filtrado por ruta</Badge>}
          </div>
          <List size={16} className={clsx('text-slate-400 transition', !showSummary && 'rotate-180')} />
        </button>
        {showSummary && (
          <div className="border-t border-slate-200 px-2 py-2">
            {summaryFiltered.length === 0 ? (
              <div className="px-2 py-4 text-center text-xs text-slate-500">
                Sin items pendientes con este filtro.
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="text-slate-500">
                  <tr>
                    <th className="px-2 py-1 text-left">Producto</th>
                    <th className="px-2 py-1 text-left">SKU</th>
                    <th className="px-2 py-1 text-right">Pend / Total</th>
                    <th className="px-2 py-1 text-left">Pedidos</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryFiltered.map((row) => {
                    const fullyDone = row.pendingQty === 0;
                    return (
                      <tr
                        key={row.productId}
                        className={clsx(
                          'border-t border-slate-100 align-top',
                          fullyDone && 'bg-emerald-50/40',
                        )}
                      >
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-2">
                            {row.thumbnailUrl ? (
                              <img
                                src={row.thumbnailUrl}
                                alt=""
                                className={clsx(
                                  'h-8 w-8 rounded object-cover ring-1 ring-slate-200',
                                  fullyDone && 'opacity-50',
                                )}
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100">
                                <ImageIcon size={14} className="text-slate-400" />
                              </div>
                            )}
                            <span
                              className={clsx(
                                'font-medium break-words',
                                fullyDone ? 'text-slate-400 line-through' : 'text-slate-800',
                              )}
                            >
                              {row.name}
                            </span>
                            {fullyDone && (
                              <Badge variant="green">
                                <CheckCircle2 size={11} className="inline" /> Listo
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td
                          className={clsx(
                            'px-2 py-2 font-mono',
                            fullyDone ? 'text-slate-400 line-through' : 'text-slate-600',
                          )}
                        >
                          {row.sku || '—'}
                        </td>
                        <td className="px-2 py-2 text-right text-base font-bold">
                          <span className={fullyDone ? 'text-emerald-600' : 'text-brand-700'}>
                            ×{row.pendingQty}
                          </span>
                          <span className="text-xs font-normal text-slate-400"> / ×{row.totalQty}</span>
                        </td>
                        <td className="px-2 py-2 text-slate-500">
                          {row.orders.map((o) => (
                            <span
                              key={o.wpOrderId}
                              className={clsx(
                                'mr-2 whitespace-nowrap',
                                o.done && 'text-emerald-600 line-through decoration-emerald-400',
                              )}
                            >
                              #{o.number} (×{o.qty})
                            </span>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            <div className="px-2 pt-2 text-[10px] italic text-slate-400">
              Esta tabla es solo guía. El empaque se sigue haciendo pedido por pedido escaneando el QR del albarán.
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-700">Pedidos del proceso</h3>
        </div>
        <OrderSearchBox value={search} onChange={setSearch} />
        {filteredOrders.length === 0 ? (
          <div className="card p-6 text-center text-sm text-slate-500">
            {search ? 'Sin pedidos que coincidan con la búsqueda.' : 'Sin pedidos con items B1 en este proceso.'}
          </div>
        ) : (
          filteredOrders.map((o) => {
            const done = !!o.b1ClosedAt;
            // El link va al detalle de la secuencia con focus en el pedido —
            // de ahí el operador puede ir a empacarlo o ver el albarán. No
            // saltamos a packing porque la acción primaria de B1 es por
            // escaneo de QR del albarán, no por click.
            const to = o.sequenceId ? `/sequences/${o.sequenceId}?focus=${o.id}` : '#';
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
                    <span className="font-semibold">
                      #<HighlightedNumber text={o.number} match={search} />
                    </span>
                    {o.route && <Badge variant="blue">{o.route}</Badge>}
                    {o.stopPosition != null && <Badge variant="gray">Parada {o.stopPosition}</Badge>}
                    <Badge variant="blue">{warehouseLabel('B1')} ×{o.itemCount}</Badge>
                    <ShippingBadge method={o.shippingMethod} />
                    {o.sequenceId && (
                      <Badge variant="gray">Sec #{o.sequenceId}</Badge>
                    )}
                    {done && (
                      <Badge variant="green">
                        <CheckCircle2 size={12} className="inline" /> Empacado
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
