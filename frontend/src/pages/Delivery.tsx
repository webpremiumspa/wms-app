import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Image as ImageIcon, RotateCcw } from 'lucide-react';
import { deliveryApi, type DeliveryOrder } from '@/lib/dispatch';
import { QRScanner } from '@/components/QRScanner';
import { B2Alert } from '@/components/B2Alert';
import { Badge } from '@/components/Badge';

export function Delivery() {
  const [scanned, setScanned] = useState<DeliveryOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scan = useMutation({
    mutationFn: (qr: string) => deliveryApi.scan(qr),
    onSuccess: (order) => {
      setError(null);
      setScanned(order);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'No se pudo leer el QR');
    },
  });

  function reset() {
    setScanned(null);
    setError(null);
  }

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-xl font-semibold">Entrega</h2>

      {!scanned && (
        <div className="card p-3">
          <QRScanner onScan={(text) => scan.mutate(text)} paused={scan.isPending} />
          {error && (
            <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
        </div>
      )}

      {scanned && (
        <>
          <div className="card space-y-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm text-slate-500">Pedido</div>
                <div className="text-xl font-bold">#{scanned.number}</div>
              </div>
              <button onClick={reset} className="btn-ghost text-sm">
                <RotateCcw size={16} />
                Otro QR
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {scanned.route && <Badge variant="blue">{scanned.route}</Badge>}
              {scanned.stopPosition != null && (
                <Badge variant="gray">Parada {scanned.stopPosition}</Badge>
              )}
            </div>
            <div className="text-sm text-slate-700">{scanned.customerName || '—'}</div>
            {scanned.customerAddress && (
              <div className="text-xs text-slate-500">{scanned.customerAddress}</div>
            )}
          </div>

          {/* Alerta gigante con sonido + vibración si hay B2 pendiente */}
          <B2Alert items={scanned.b2Items} />

          <div className="card space-y-2 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Contenido en la bolsa</h3>
            {scanned.b1Items.length === 0 ? (
              <div className="text-sm text-slate-500">Sin items B1.</div>
            ) : (
              <ul className="space-y-2">
                {scanned.b1Items.map((it) => (
                  <li key={it.id} className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                      {it.thumbnailUrl ? (
                        <img src={it.thumbnailUrl} alt={it.name} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon size={18} className="text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{it.name}</div>
                      <div className="text-xs text-slate-500">{it.sku || '—'}</div>
                    </div>
                    <div className="font-bold text-brand-700">×{it.qty}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
