import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Camera, X, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { pickingB2Api } from '@/lib/dispatch';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { ShippingBadge } from '@/components/ShippingBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { QRScanner } from '@/components/QRScanner';
import { RouteFilter, type RouteFilterValue } from '@/components/RouteFilter';
import { warehouseLabel } from '@/lib/labels';
import { applyRouteFilter, extractRoutes } from '@/lib/routeFilter';

function parseQrToWpId(raw: string): number | null {
  const t = raw.trim();
  const urlMatch = t.match(/\/scan\/(\d+)(?:[/?#]|$)/);
  if (urlMatch) return Number(urlMatch[1]);
  const wmsMatch = t.match(/^WMS:(\d+)$/);
  if (wmsMatch) return Number(wmsMatch[1]);
  return null;
}

export function PickingB2() {
  const { id } = useParams();
  const seqId = Number(id);
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [routeFilter, setRouteFilter] = useState<RouteFilterValue>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['picking-b2-sequence', seqId],
    queryFn: () => pickingB2Api.forSequence(seqId),
    refetchInterval: 4000,
  });

  if (isLoading || !data) return <Spinner />;

  const total = data.orders.length;
  const closed = data.orders.filter((o) => !!o.b2ClosedAt).length;
  const { routes, hasNoRoute } = extractRoutes(data.orders);
  const sorted = applyRouteFilter(data.orders, routeFilter);

  return (
    <div className="space-y-4">
      <Link to="/picking" className="btn-ghost text-sm">
        <ChevronLeft size={16} />
        Picking
      </Link>
      <div>
        <h2 className="text-xl font-semibold">Picking Bodega 2 · Secuencia #{seqId}</h2>
        {data.sequence?.createdAt && (
          <div className="text-xs text-slate-500">
            Creada el {new Date(data.sequence.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        )}
      </div>
      <ProgressBar value={closed} total={total} label="Pedidos B2 cerrados" />

      <RouteFilter
        selected={routeFilter}
        routes={routes}
        hasNoRoute={hasNoRoute}
        onChange={setRouteFilter}
      />

      {data.sequence?.b2ClosedAt && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 ring-1 ring-emerald-200">
          ✓ Flujo B2 cerrado el {new Date(data.sequence.b2ClosedAt).toLocaleString('es-CL')}.
        </div>
      )}

      {!showScanner ? (
        <button
          type="button"
          onClick={() => { setShowScanner(true); setScanError(null); }}
          className="btn-primary w-full"
        >
          <Camera size={18} />
          Escanear pedido
        </button>
      ) : (
        <div className="card space-y-2 p-3 ring-1 ring-brand-100">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-700">Escáner</div>
            <button
              type="button"
              onClick={() => setShowScanner(false)}
              className="text-xs text-slate-500 hover:underline"
            >
              <X size={14} className="inline" /> Cerrar
            </button>
          </div>
          <QRScanner
            onScan={(text) => {
              const wpId = parseQrToWpId(text);
              if (wpId == null) {
                setScanError(`QR no reconocido: "${text.slice(0, 60)}"`);
                return;
              }
              setShowScanner(false);
              navigate(`/scan/${wpId}`);
            }}
          />
          {scanError && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{scanError}</div>
          )}
        </div>
      )}

      <div className="space-y-2">
        {sorted.map((o) => {
          const done = !!o.b2ClosedAt;
          return (
            <Link
              key={o.id}
              to={done ? '#' : `/sequences/${seqId}/picking-b2/${o.id}`}
              onClick={(e) => done && e.preventDefault()}
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
        })}
      </div>
    </div>
  );
}
