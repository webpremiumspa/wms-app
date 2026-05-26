import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Image as ImageIcon, Printer, AlertOctagon } from 'lucide-react';
import clsx from 'clsx';
import { ordersApi } from '@/lib/sequences';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { ProgressBar } from '@/components/ProgressBar';

export function PackingOrder() {
  const { id, orderId } = useParams();
  const seqId = Number(id);
  const ordId = Number(orderId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', ordId],
    queryFn: () => ordersApi.get(ordId),
  });

  const [checked, setChecked] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!order) return;
    // Pre-marca items que ya tienen packedAt (re-entrada al pedido).
    const initial = new Set<number>();
    order.items.forEach((i) => { if (i.packedAt) initial.add(i.id); });
    setChecked(initial);
  }, [order]);

  const pack = useMutation({
    mutationFn: () => ordersApi.pack(ordId, [...checked]),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['order', ordId] });
      queryClient.invalidateQueries({ queryKey: ['sequence', seqId, 'pending-packing'] });
      // Abre el albarán en nueva pestaña (descarga con auth y abre como blob).
      try {
        await ordersApi.openAlbaran(ordId);
      } catch (e) {
        console.error('No se pudo abrir el albarán', e);
      }
      navigate(`/sequences/${seqId}/packing`);
    },
  });

  const b1Items = useMemo(() => order?.items.filter((i) => i.warehouse === 'B1') || [], [order]);
  const b2Items = useMemo(() => order?.items.filter((i) => i.warehouse === 'B2') || [], [order]);

  if (isLoading || !order) return <Spinner />;

  // Si no hay items B1, el pedido se cierra sin pedir checkboxes (solo B2 a granel).
  const allChecked = b1Items.length === 0 || b1Items.every((i) => checked.has(i.id));
  const onlyB2 = b1Items.length === 0;
  const isPacked = order.status === 'packed' || order.status === 'classified' || order.status === 'loaded' || order.status === 'delivered';

  function toggle(itemId: number) {
    setChecked((s) => {
      const next = new Set(s);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  return (
    <div className="space-y-4 pb-4">
      <Link to={`/sequences/${seqId}/packing`} className="btn-ghost text-sm">
        <ChevronLeft size={16} />
        Lista de pedidos
      </Link>

      <div className="card space-y-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-semibold">Pedido #{order.number}</span>
          {order.hasB2Pending && <Badge variant="amber">Bodega 2 pendiente</Badge>}
          {isPacked && <Badge variant="green">Empacado</Badge>}
        </div>
        <div className="text-sm text-slate-600">{order.customerName || '—'}</div>
        {order.customerAddress && <div className="text-xs text-slate-500">{order.customerAddress}</div>}
      </div>

      {order.hasB2Pending && (
        <div className="card flex items-start gap-3 bg-amber-50 p-4 ring-1 ring-amber-200">
          <AlertOctagon className="shrink-0 text-amber-700" />
          <div className="text-sm text-amber-900">
            <div className="font-semibold">Este pedido tiene productos de Bodega 2.</div>
            <div>Solo empaca los items <strong>B1</strong> en la bolsa. Los B2 quedan listados en el albarán para retirar del cargamento a granel en cada entrega.</div>
          </div>
        </div>
      )}

      {onlyB2 ? (
        <div className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-700 ring-1 ring-slate-200">
          Este pedido <strong>no tiene items de Bodega 1</strong>. No hay nada que empacar físicamente en la bolsa — el albarán se imprime para que el repartidor tome todo desde el cargamento a granel de Bodega 2.
        </div>
      ) : null}

      <div className={onlyB2 ? 'hidden' : 'space-y-2'}>
        <h3 className="text-sm font-semibold text-slate-700">Items a empacar (Bodega 1)</h3>
        <ProgressBar value={[...checked].filter((id) => b1Items.some((i) => i.id === id)).length} total={b1Items.length} label="Items confirmados" />
        {b1Items.map((it) => (
          <label
            key={it.id}
            className={clsx(
              'card flex items-center gap-3 p-3',
              checked.has(it.id) && 'bg-emerald-50/60 ring-1 ring-emerald-200',
            )}
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
              {it.product.thumbnailUrl ? (
                <img src={it.product.thumbnailUrl} alt={it.product.name} className="h-full w-full object-cover" />
              ) : (
                <ImageIcon size={20} className="text-slate-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{it.product.name}</div>
              <div className="text-xs text-slate-500">{it.product.sku || '—'}</div>
            </div>
            <div className="text-lg font-bold text-brand-700">×{it.qty}</div>
            <input
              type="checkbox"
              checked={checked.has(it.id)}
              onChange={() => toggle(it.id)}
              className="ml-2 h-6 w-6 accent-brand-600"
              disabled={isPacked}
            />
          </label>
        ))}
      </div>

      {b2Items.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-amber-800">A granel desde Bodega 2 (no empacar aquí)</h3>
          {b2Items.map((it) => (
            <div key={it.id} className="card flex items-center gap-3 bg-amber-50/50 p-3 ring-1 ring-amber-200">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-amber-100">
                {it.product.thumbnailUrl ? (
                  <img src={it.product.thumbnailUrl} alt={it.product.name} className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon size={18} className="text-amber-700" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{it.product.name}</div>
                <div className="text-xs text-amber-700">{it.product.sku || '—'}</div>
              </div>
              <div className="font-bold text-amber-800">×{it.qty}</div>
            </div>
          ))}
        </div>
      )}

      {!isPacked && (
        <div className="sticky bottom-20 z-10 bg-slate-100 pt-2 md:bottom-0">
          {!onlyB2 && !allChecked && (
            <div className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Falta marcar items B1. No se puede cerrar el pedido hasta confirmar todos.
            </div>
          )}
          <button
            onClick={() => pack.mutate()}
            disabled={!allChecked || pack.isPending}
            className="btn-primary w-full"
          >
            <Printer size={18} />
            {pack.isPending ? 'Cerrando…' : onlyB2 ? 'Imprimir albarán y cerrar' : 'Cerrar pedido e imprimir albarán'}
          </button>
        </div>
      )}

      {isPacked && (
        <button
          type="button"
          onClick={() => ordersApi.openAlbaran(ordId).catch((e) => console.error(e))}
          className="btn-ghost w-full border border-slate-300"
        >
          <Printer size={18} />
          Reimprimir albarán
        </button>
      )}
    </div>
  );
}
