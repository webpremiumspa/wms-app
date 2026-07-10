import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Truck,
  User,
  MapPin,
  Package,
  Printer,
  Image as ImageIcon,
  Calendar,
  Activity,
  RotateCcw,
  AlertOctagon,
} from 'lucide-react';
import { trackingApi, type TrackingEvent, type TrackingOrder } from '@/lib/tracking';
import { ordersApi } from '@/lib/sequences';
import { eventLabel, warehouseLabel } from '@/lib/labels';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { ShippingBadge } from '@/components/ShippingBadge';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { DeliveryStatusBadge } from '@/components/DeliveryStatusBadge';
import { CustomerNote } from '@/components/CustomerNote';
import { CustomerBlock } from '@/components/CustomerBlock';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';

export function Tracking() {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['tracking', query],
    queryFn: () => trackingApi.byWp(query!),
    enabled: query != null,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(input.trim());
    if (!Number.isFinite(n) || n <= 0) return;
    setQuery(n);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Seguimiento de pedido</h2>
        <p className="text-sm text-slate-500">
          Busca un pedido por su ID de WooCommerce para ver toda su trazabilidad: quién, cuándo, dónde y qué pasó.
        </p>
      </div>

      <form onSubmit={handleSearch} className="card flex items-center gap-2 p-3">
        <Search size={18} className="text-slate-400" />
        <input
          type="number"
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ej: 1133335"
          className="flex-1 border-0 bg-transparent text-base focus:outline-none"
          autoFocus
        />
        <button type="submit" disabled={!input.trim()} className="btn-primary shrink-0">
          Buscar
        </button>
      </form>

      {isLoading && <Spinner />}
      {error && (
        <div className="card p-4 text-sm text-red-700 ring-1 ring-red-200">
          {(error as any).response?.data?.message || 'No se encontró el pedido en el WMS.'}
        </div>
      )}

      {data && (
        <TrackingDetail order={data.order} timeline={data.timeline} />
      )}
    </div>
  );
}

function TrackingDetail({ order, timeline }: { order: TrackingOrder; timeline: TrackingEvent[] }) {
  const b1Items = order.items.filter((i) => i.warehouse === 'B1');
  const b2Items = order.items.filter((i) => i.warehouse === 'B2');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canReprint = hasCap(user, CAPS.PACK_B1) || hasCap(user, CAPS.SUPERVISE);
  const canSupervise = hasCap(user, CAPS.SUPERVISE);
  const bagsCount = order.bagsExpected ?? 1;
  const isPacked = ['packed', 'classified', 'loaded', 'delivered'].includes(order.status);
  // v0.25.10: revivir pedidos devueltos (SUPERVISE + loaded + delivery=returned).
  const canRevive = canSupervise && order.status === 'loaded' && order.deliveryStatus === 'returned';
  const [confirmRevive, setConfirmRevive] = useState(false);
  const [reviveError, setReviveError] = useState<string | null>(null);
  const revive = useMutation({
    mutationFn: () => ordersApi.reviveFromReturn(order.id),
    onSuccess: () => {
      setConfirmRevive(false);
      setReviveError(null);
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'returned'] });
    },
    onError: (err: any) => setReviveError(err.response?.data?.message || 'No se pudo revivir el pedido'),
  });

  return (
    <div className="space-y-4">
      {/* Estado actual */}
      <div className="card space-y-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-bold">#{order.number}</span>
          <OrderStatusBadge status={order.status} />
          {order.hasB2Pending && <Badge variant="amber">{warehouseLabel('B2')}</Badge>}
          <DeliveryStatusBadge status={order.deliveryStatus} meta={order.deliveryMeta} size="md" />
          {bagsCount > 1 && (
            <Badge variant="blue">
              <Package size={11} className="inline" /> {bagsCount} bultos
            </Badge>
          )}
          {order.allowPartialDelivery && <Badge variant="green">Entrega parcial</Badge>}
          <ShippingBadge method={order.shippingMethod} />
        </div>
        <div className="text-xs text-slate-500">
          Creado en WC el {new Date(order.createdAt).toLocaleString('es-CL')}
        </div>
        {canReprint && isPacked && (
          <button
            type="button"
            onClick={() => ordersApi.openAlbaran(order.id, bagsCount > 1 ? { bags: bagsCount } : undefined).catch((e) => console.error(e))}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Printer size={16} />
            {bagsCount > 1 ? `Reimprimir albarán (${bagsCount} bultos)` : 'Reimprimir albarán'}
          </button>
        )}
        {canRevive && (
          <div className="space-y-1 pt-1">
            <button
              type="button"
              onClick={() => { setReviveError(null); setConfirmRevive(true); }}
              disabled={revive.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
            >
              <RotateCcw size={16} />
              Revivir pedido devuelto
            </button>
            <div className="text-[11px] text-slate-500">
              El pedido volverá a "En preparación" para reingresar al pool de secuenciación.
              La bolsa B1 original debe estar guardada en bodega.
            </div>
          </div>
        )}
      </div>

      {confirmRevive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md space-y-3 p-4">
            <div className="flex items-start gap-2">
              <AlertOctagon className="text-sky-600" size={22} />
              <div className="flex-1">
                <h3 className="font-semibold">¿Revivir pedido #{order.number}?</h3>
                <p className="mt-1 text-sm text-slate-700">
                  El pedido volverá al pool de <strong>En preparación</strong>. Se aplicará:
                </p>
                <ul className="mt-1 list-disc pl-5 text-xs text-slate-600">
                  <li>Pasa de <strong>Cargado</strong> a <strong>En preparación</strong>.</li>
                  <li>Se borran timestamps de picking, empaque, clasificación y carga.</li>
                  <li>Se limpian bag events y plan de empaque anterior.</li>
                  <li>Los items vuelven a estado sin marcar.</li>
                  <li>El chip pasa a <strong>Retomado</strong> (celeste) como rastro histórico.</li>
                </ul>
                <p className="mt-2 text-xs text-slate-500">
                  Verifica que la bolsa B1 original esté guardada en bodega con el albarán pegado.
                </p>
                {reviveError && (
                  <div className="mt-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-700">{reviveError}</div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmRevive(false)}
                disabled={revive.isPending}
                className="btn-ghost border border-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => revive.mutate()}
                disabled={revive.isPending}
                className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
              >
                {revive.isPending ? 'Revivendo…' : 'Sí, revivir pedido'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cliente */}
      <Section icon={<User size={16} />} title="Cliente">
        <CustomerBlock
          name={order.customerName}
          address={order.customerAddress}
          address2={order.customerAddress2}
          city={order.customerCity}
          phone={order.customerPhone}
        />
        <Field k="Método de envío" v={order.shippingMethod || '—'} />
        {order.customerNote && (
          <div className="mt-2"><CustomerNote note={order.customerNote} /></div>
        )}
      </Section>

      {/* Ruta + driver */}
      <Section icon={<MapPin size={16} />} title="Ruta y reparto">
        <Field k="Ruta" v={order.route || '—'} />
        <Field k="Parada" v={order.stopPosition ?? '—'} />
        <Field k="Conductor" v={order.driverName || '—'} />
        <Field k="Vehículo" v={order.vehicle || '—'} />
        <Field k="Patente" v={order.patente || '—'} />
      </Section>

      {/* Hitos */}
      <Section icon={<Calendar size={16} />} title="Hitos del proceso">
        <Field k="Tomado por (claim)" v={fmtActor(order.claimedAt, order.pickedBy)} />
        <Field k="Empacado" v={fmtActor(order.packedAt, order.packedBy)} />
        <Field k={`${warehouseLabel('B2')} cerrado`} v={fmtActor(order.b2ClosedAt, order.b2ClosedBy)} />
        <Field k="Clasificado" v={order.classifiedAt ? new Date(order.classifiedAt).toLocaleString('es-CL') : '—'} />
        <Field k="Cargado al vehículo" v={order.loadedAt ? new Date(order.loadedAt).toLocaleString('es-CL') : '—'} />
        <Field k="Entregado" v={order.deliveredAt ? new Date(order.deliveredAt).toLocaleString('es-CL') : '—'} />
      </Section>

      {/* Items */}
      <Section icon={<Package size={16} />} title={`Productos (${order.items.length})`}>
        {b1Items.length > 0 && (
          <ItemList label={warehouseLabel('B1')} items={b1Items} />
        )}
        {b2Items.length > 0 && (
          <ItemList label={warehouseLabel('B2')} items={b2Items} />
        )}
      </Section>

      {/* Secuencias asociadas */}
      {order.sequenceLinks.length > 0 && (
        <Section icon={<Truck size={16} />} title="Secuencias asociadas">
          <ul className="space-y-1 text-sm">
            {order.sequenceLinks.map((sl) => (
              <li key={sl.sequenceId} className="text-slate-700">
                Secuencia <strong>#{sl.sequenceId}</strong>
                {sl.sequence?.createdAt && (
                  <span className="text-xs text-slate-500"> · creada el {new Date(sl.sequence.createdAt).toLocaleString('es-CL')}</span>
                )}
                {sl.sequence?.status && (
                  <span className="text-xs text-slate-500"> · {sl.sequence.status}</span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Timeline */}
      <Section icon={<Activity size={16} />} title={`Timeline de eventos (${timeline.length})`}>
        {timeline.length === 0 ? (
          <div className="text-sm text-slate-500">Sin eventos registrados aún.</div>
        ) : (
          <ol className="relative space-y-3 border-l border-slate-200 pl-4">
            {timeline.map((ev) => {
              // Sufijo con número de bulto cuando el payload lo trae —
              // aplica a dispatch.bag_classified/loaded, order.bag_packed y
              // bag.unclassified/unloaded. Trazabilidad por bulto en el UI.
              const bagNum = typeof ev.meta?.bagNumber === 'number' ? ev.meta.bagNumber : null;
              const bagTotal = typeof ev.meta?.bagsExpected === 'number' ? ev.meta.bagsExpected : null;
              const bagSuffix = bagNum != null
                ? ` #${bagNum}${bagTotal ? ` de ${bagTotal}` : ''}`
                : '';
              return (
                <li key={ev.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-brand-500 ring-2 ring-white" />
                  <div className="text-sm text-slate-800">
                    <strong>{ev.actor?.displayName || ev.actor?.username || (ev.actorId ? `Usuario #${ev.actorId}` : 'Sistema')}</strong>
                    {' '}{eventLabel(ev.type)}{bagSuffix}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(ev.createdAt).toLocaleString('es-CL')}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Section>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span className="text-slate-500">{icon}</span>
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Field({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="text-slate-500">{k}</span>
      <span className="text-right text-slate-800">{v}</span>
    </div>
  );
}

function fmtActor(when: string | null, by: { displayName?: string; username?: string } | null): string {
  if (!when) return '—';
  const time = new Date(when).toLocaleString('es-CL');
  if (!by) return time;
  const name = by.displayName || by.username || '?';
  return `${name} · ${time}`;
}

function ItemList({ label, items }: { label: string; items: TrackingOrder['items'] }) {
  return (
    <div className="space-y-1 pt-2">
      <div className="text-xs font-medium text-slate-600">{label}</div>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-2 text-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-100">
              {it.product?.thumbnailUrl ? (
                <img src={it.product.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon size={14} className="text-slate-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-slate-800 break-words">{it.lineName || it.product?.name || `Producto ${it.productId}`}</div>
              <div className="text-[10px] text-slate-500">{it.product?.sku || '—'}</div>
            </div>
            <div className="font-bold text-slate-700">×{it.qty}</div>
            <div className="ml-2 text-[10px] text-slate-500">
              {it.pickedAt && <span>P</span>}
              {it.packedAt && <span> · E</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
