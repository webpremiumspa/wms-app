import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Package, ClipboardCheck, CheckCircle2, ChevronDown, ChevronRight, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';
import { sequencesApi, ordersApi } from '@/lib/sequences';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';

function OrderItems({ orderId }: { orderId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.get(orderId),
  });

  if (isLoading || !data) return <div className="px-4 py-3 text-sm text-slate-500">Cargando contenido…</div>;

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
          <Badge variant={it.warehouse === 'B1' ? 'blue' : 'amber'}>{it.warehouse}</Badge>
          <div className="text-sm font-bold text-brand-700">×{it.qty}</div>
        </div>
      ))}
    </div>
  );
}

export function SequenceDetail() {
  const { id } = useParams();
  const seqId = Number(id);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['sequence', seqId],
    queryFn: () => sequencesApi.get(seqId),
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

  return (
    <div className="space-y-4">
      <Link to="/sequences" className="btn-ghost text-sm">
        <ChevronLeft size={16} />
        Secuencias
      </Link>
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-semibold">Secuencia #{seq.id}</span>
          <Badge variant={seq.warehouse === 'B1' ? 'blue' : 'amber'}>{seq.warehouse}</Badge>
          <Badge variant={seq.status === 'open' ? 'green' : 'gray'}>
            {seq.status === 'open' ? 'Abierta' : 'Cerrada'}
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
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Link to={`/sequences/${seq.id}/picking`} className="card flex items-center gap-3 p-4 hover:shadow-md">
          <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
            <Package size={22} />
          </div>
          <div>
            <div className="font-medium">Picking</div>
            <div className="text-xs text-slate-500">Recolectar SKUs en bodega</div>
          </div>
        </Link>
        <Link to={`/sequences/${seq.id}/packing`} className="card flex items-center gap-3 p-4 hover:shadow-md">
          <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
            <ClipboardCheck size={22} />
          </div>
          <div>
            <div className="font-medium">Empacar pedidos</div>
            <div className="text-xs text-slate-500">Armar bolsas individuales</div>
          </div>
        </Link>
        <Link to={`/sequences/${seq.id}/close`} className="card flex items-center gap-3 p-4 hover:shadow-md">
          <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="font-medium">Cerrar secuencia</div>
            <div className="text-xs text-slate-500">Verificación final</div>
          </div>
        </Link>
      </div>

      {/* Lista de pedidos de la secuencia, expandibles */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">
          Pedidos en esta secuencia ({orderCount})
        </h3>
        {seq.orders.map(({ order }) => {
          const isOpen = expanded.has(order.id);
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
                    <span className="font-semibold">#{order.number}</span>
                    {order.hasB2Pending && <Badge variant="amber">B2</Badge>}
                    <Badge
                      variant={
                        order.status === 'received' || order.status === 'sequenced'
                          ? 'gray'
                          : order.status === 'picked'
                          ? 'blue'
                          : 'green'
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {order.customerName || '—'}
                  </div>
                </div>
              </button>
              <div className={clsx(isOpen ? 'block' : 'hidden', 'border-t border-slate-200')}>
                {isOpen && <OrderItems orderId={order.id} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
