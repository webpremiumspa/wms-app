import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ClipboardCheck, CheckCircle2, ChevronDown, ChevronRight, Image as ImageIcon, Printer, Trash2, UserX } from 'lucide-react';
import clsx from 'clsx';
import { sequencesApi, ordersApi } from '@/lib/sequences';
import { orderStatusLabel, sequenceStatusLabel, warehouseLabel } from '@/lib/labels';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { ShippingBadge } from '@/components/ShippingBadge';
import { RemoveOrderModal } from '@/components/RemoveOrderModal';
import { RouteFilter, type RouteFilterValue } from '@/components/RouteFilter';
import { OrderSearchBox, HighlightedNumber, matchesOrderId } from '@/components/OrderSearchBox';
import { applyRouteFilter, extractRoutes } from '@/lib/routeFilter';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';

function OrderItems({ orderId }: { orderId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.get(orderId),
  });

  if (isLoading || !data) return <div className="px-4 py-3 text-sm text-slate-500">Cargando contenido…</div>;

  const isPacked = ['packed', 'classified', 'loaded', 'delivered'].includes(data.status);

  return (
    <div className="space-y-2 bg-slate-50 px-4 py-3">
      {data.customerAddress && (
        <div className="text-xs text-slate-500">{data.customerAddress}</div>
      )}
      {data.items.map((it) => (
        <div key={it.id} className="flex items-center gap-3 rounded-lg bg-white p-2 ring-1 ring-slate-200">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100">
            {it.product.thumbnailUrl ? (
              <img src={it.product.thumbnailUrl} alt={it.product.name} className="h-full w-full object-cover" />
            ) : (
              <ImageIcon size={18} className="text-slate-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{it.product.name}</div>
            <div className="text-xs text-slate-500">{it.product.sku || '—'}</div>
          </div>
          <Badge variant={it.warehouse === 'B1' ? 'blue' : 'amber'}>{warehouseLabel(it.warehouse)}</Badge>
          <div className="text-sm font-bold text-brand-700">×{it.qty}</div>
        </div>
      ))}
      {isPacked && (
        <button
          type="button"
          onClick={() => ordersApi.openAlbaran(orderId).catch((e) => console.error(e))}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Printer size={16} />
          Reimprimir albarán
        </button>
      )}
    </div>
  );
}

export function SequenceDetail() {
  const { id } = useParams();
  const seqId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canManage = hasCap(user, CAPS.PACK_B1) || hasCap(user, CAPS.SUPERVISE);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [removeTarget, setRemoveTarget] = useState<{ id: number; number: string } | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [routeFilter, setRouteFilter] = useState<RouteFilterValue>(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['sequence', seqId],
    queryFn: () => sequencesApi.get(seqId),
  });

  const deleteSeq = useMutation({
    mutationFn: () => sequencesApi.delete(seqId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'pending'] });
      navigate('/sequences');
    },
  });

  const removeOrder = useMutation({
    mutationFn: ({ orderId, reasonCode, reasonText }: { orderId: number; reasonCode: string; reasonText: string }) =>
      sequencesApi.removeOrder(seqId, orderId, reasonCode, reasonText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequence', seqId] });
      queryClient.invalidateQueries({ queryKey: ['sequence', seqId, 'pending-packing'] });
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      setRemoveTarget(null);
      setRemoveError(null);
    },
    onError: (err: any) => {
      setRemoveError(err.response?.data?.message || 'No se pudo remover el pedido');
    },
  });

  if (isLoading || !data) return <Spinner />;

  function toggle(orderId: number) {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }

  const seq = data;
  const orderCount = seq.orders.length;
  const packed = seq.orders.filter((o) => ['packed', 'classified', 'loaded', 'delivered'].includes(o.order.status)).length;
  // Se puede eliminar si la secuencia está abierta. Si hay pedidos avanzados,
  // mostramos advertencia más fuerte porque se va a perder ese progreso.
  const canDelete = seq.status === 'open';
  const advancedOrders = seq.orders.filter((o) => o.order.status !== 'sequenced' && o.order.status !== 'delivered').length;
  const deliveredOrders = seq.orders.filter((o) => o.order.status === 'delivered').length;

  const b1Closed = !!seq.b1ClosedAt;
  const hasB2 = (seq.b2?.total || 0) > 0;

  return (
    <div className="space-y-4">
      <Link to={seq.processId ? `/processes/${seq.processId}` : '/processes'} className="btn-ghost text-sm">
        <ChevronLeft size={16} />
        Proceso
      </Link>
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-semibold">Secuencia #{seq.id}</span>
          <Badge variant={seq.status === 'open' ? 'green' : 'gray'}>
            {sequenceStatusLabel(seq.status)}
          </Badge>
        </div>
        <div className="mt-2 text-sm text-slate-600">
          {orderCount} pedidos · {packed} empacados
        </div>
        {seq.createdBy && (
          <div className="mt-1 text-xs text-slate-500">
            Creada por {seq.createdBy.displayName} · {new Date(seq.createdAt).toLocaleString('es-CL')}
          </div>
        )}

        <div className={clsx('mt-3 rounded-lg px-3 py-2 text-xs ring-1', b1Closed ? 'bg-emerald-50 ring-emerald-200 text-emerald-800' : 'bg-blue-50 ring-blue-200 text-blue-800')}>
          <div className="font-semibold">Packing ({warehouseLabel('B1')})</div>
          <div>
            {b1Closed
              ? `Cerrado el ${new Date(seq.b1ClosedAt!).toLocaleString('es-CL')}`
              : `${packed}/${orderCount} pedidos empacados`}
          </div>
          {hasB2 && (
            <div className="mt-1 text-[11px] italic text-slate-600">
              Esta secuencia tiene items {warehouseLabel('B2')} — se pickean a granel desde el proceso (no aquí).
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Link to={`/sequences/${seq.id}/packing`} className="card flex items-center gap-3 p-4 hover:shadow-md">
          <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
            <ClipboardCheck size={22} />
          </div>
          <div>
            <div className="font-medium">Empacar pedidos</div>
            <div className="text-xs text-slate-500">
              Imprimir todos los albaranes y empacar pedido por pedido escaneando el QR
            </div>
          </div>
        </Link>
        <Link to={`/sequences/${seq.id}/close`} className="card flex items-center gap-3 p-4 hover:shadow-md">
          <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="font-medium">Cerrar secuencia</div>
            <div className="text-xs text-slate-500">Verificación final del packing — la secuencia pasa a Cerrada</div>
          </div>
        </Link>
      </div>

      {canDelete && (
        <div className="space-y-2 rounded-lg border border-dashed border-red-200 bg-red-50 p-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-red-800">
              {advancedOrders > 0
                ? `Eliminar va a deshacer el picking y el empaque hecho hasta ahora en ${advancedOrders} pedido(s).`
                : 'Eliminar la secuencia. Los pedidos vuelven a estar disponibles para una nueva.'}
            </span>
            <button
              type="button"
              onClick={() => {
                const revertCount = orderCount - deliveredOrders;
                const msg = advancedOrders > 0
                  ? `⚠ Esta secuencia tiene ${advancedOrders} pedido(s) en los que ya se hizo picking o empaque.\n\nSi la eliminas:\n\n• ${revertCount} pedido(s) volverán a estar pendientes y disponibles para una nueva secuencia.\n• Se borrará el progreso del picking (qué items se recolectaron).\n• Se borrará el empaque (qué items se metieron en la bolsa y quién lo hizo).\n• Los albaranes ya impresos quedarán como papeles físicos sin reflejo en el sistema. Hay que volver a empacar para imprimir nuevos.\n${deliveredOrders > 0 ? `• ${deliveredOrders} pedido(s) ya entregado(s) no se tocan.\n` : ''}\n¿Continuar?`
                  : `¿Eliminar la secuencia #${seq.id}?\n\nLos ${orderCount} pedido(s) volverán a estar disponibles para una nueva secuencia. Como aún no se hizo picking ni empaque, no se pierde ningún progreso.`;
                if (window.confirm(msg)) deleteSeq.mutate();
              }}
              disabled={deleteSeq.isPending}
              className="flex shrink-0 items-center gap-1 rounded-md bg-red-100 px-3 py-1 font-medium text-red-700 hover:bg-red-200"
            >
              <Trash2 size={14} />
              {deleteSeq.isPending ? 'Eliminando…' : 'Eliminar secuencia'}
            </button>
          </div>
          {deliveredOrders > 0 && (
            <div className="text-xs text-red-700">
              {deliveredOrders} pedido(s) ya entregado(s) se conservan tal cual están — no se tocan.
            </div>
          )}
        </div>
      )}

      {deleteSeq.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {(deleteSeq.error as any).response?.data?.message || 'No se pudo eliminar la secuencia'}
        </div>
      )}

      {/* Lista de pedidos de la secuencia, expandibles */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">
          Pedidos en esta secuencia ({orderCount})
        </h3>
        {(() => {
          const allOrders = seq.orders.map(({ order }) => order);
          const { routes, hasNoRoute } = extractRoutes(allOrders);
          return (
            <RouteFilter
              selected={routeFilter}
              routes={routes}
              hasNoRoute={hasNoRoute}
              onChange={setRouteFilter}
            />
          );
        })()}
        <OrderSearchBox value={search} onChange={setSearch} />
        {applyRouteFilter(seq.orders.map(({ order }) => order), routeFilter)
          .filter((order) => matchesOrderId(order.number, search))
          .map((order) => {
          const isOpen = expanded.has(order.id);
          const tooLateToRemove = ['classified', 'loaded', 'delivered'].includes(order.status);
          return (
            <div key={order.id} className="card overflow-hidden">
              <button
                onClick={() => toggle(order.id)}
                className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-slate-50"
              >
                {isOpen ? (
                  <ChevronDown size={18} className="shrink-0 text-slate-400" />
                ) : (
                  <ChevronRight size={18} className="shrink-0 text-slate-400" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">
                      #<HighlightedNumber text={order.number} match={search} />
                    </span>
                    {order.hasB2Pending && <Badge variant="amber">{warehouseLabel('B2')}</Badge>}
                    <ShippingBadge method={order.shippingMethod} />
                    <Badge
                      variant={
                        order.status === 'received' || order.status === 'sequenced'
                          ? 'gray'
                          : order.status === 'picked'
                          ? 'blue'
                          : 'green'
                      }
                    >
                      {orderStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {order.customerName || '—'}
                  </div>
                </div>
              </button>
              <div className={clsx(isOpen ? 'block' : 'hidden', 'border-t border-slate-200')}>
                {isOpen && (
                  <>
                    <OrderItems orderId={order.id} />
                    {canManage && !tooLateToRemove && (
                      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
                        <button
                          type="button"
                          onClick={() => {
                            const msg = `¿Confirmas remover el pedido #${order.number} de la secuencia? Pasará a estado Bloqueado y se perderá el progreso de picking/packing. En el siguiente paso te pediremos el motivo.`;
                            if (window.confirm(msg)) {
                              setRemoveError(null);
                              setRemoveTarget({ id: order.id, number: order.number });
                            }
                          }}
                          className="flex items-center gap-2 text-sm font-medium text-red-700 hover:underline"
                        >
                          <UserX size={14} />
                          Remover de la secuencia
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <RemoveOrderModal
        open={removeTarget !== null}
        orderNumber={removeTarget?.number || ''}
        onClose={() => { setRemoveTarget(null); setRemoveError(null); }}
        onConfirm={(reasonCode, reasonText) => {
          if (removeTarget) removeOrder.mutate({ orderId: removeTarget.id, reasonCode, reasonText });
        }}
        isPending={removeOrder.isPending}
        error={removeError}
      />
    </div>
  );
}
