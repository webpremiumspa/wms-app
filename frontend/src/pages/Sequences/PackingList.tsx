import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Printer, User, Camera, X } from 'lucide-react';
import clsx from 'clsx';
import { sequencesApi } from '@/lib/sequences';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { ProgressBar } from '@/components/ProgressBar';
import { QRScanner } from '@/components/QRScanner';
import { RouteFilter, type RouteFilterValue } from '@/components/RouteFilter';
import { applyRouteFilter, extractRoutes } from '@/lib/routeFilter';

// Extrae el wpOrderId del QR (URL nueva o legacy WMS:<id>).
function parseQrToWpId(raw: string): number | null {
  const t = raw.trim();
  const urlMatch = t.match(/\/scan\/(\d+)(?:[/?#]|$)/);
  if (urlMatch) return Number(urlMatch[1]);
  const wmsMatch = t.match(/^WMS:(\d+)$/);
  if (wmsMatch) return Number(wmsMatch[1]);
  return null;
}

export function PackingList() {
  const { id } = useParams();
  const seqId = Number(id);
  const navigate = useNavigate();
  const [printError, setPrintError] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [routeFilter, setRouteFilter] = useState<RouteFilterValue>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['sequence', seqId, 'pending-packing'],
    queryFn: () => sequencesApi.pendingPacking(seqId),
    refetchInterval: 4000,
  });

  // Datos de la secuencia para mostrar la fecha en el header (doble validación).
  const { data: seq } = useQuery({
    queryKey: ['sequence', seqId],
    queryFn: () => sequencesApi.get(seqId),
  });

  if (isLoading || !data) return <Spinner />;

  const packed = data.filter((o) => ['packed', 'classified', 'loaded', 'delivered'].includes(o.status)).length;
  const printable = data.filter((o) => ['sequenced', 'packed', 'classified', 'loaded'].includes(o.status)).length;
  const { routes, hasNoRoute } = extractRoutes(data);
  // Aplica filtro por ruta + orden por stopPosition desc (parada lejana primero).
  const sorted = applyRouteFilter(data, routeFilter);

  async function printAll() {
    setPrintError(null);
    setPrinting(true);
    try {
      await sequencesApi.openAlbaranesBatch(seqId);
    } catch (e: any) {
      setPrintError(e.response?.data?.message || 'No se pudieron generar los albaranes');
    } finally {
      setPrinting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Link to={`/sequences/${seqId}`} className="btn-ghost text-sm">
        <ChevronLeft size={16} />
        Secuencia #{seqId}
      </Link>
      <div>
        <h2 className="text-xl font-semibold">Selección de pedido a empacar</h2>
        {seq?.createdAt && (
          <div className="text-xs text-slate-500">
            Secuencia #{seqId} · creada el{' '}
            {new Date(seq.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        )}
      </div>
      <ProgressBar value={packed} total={data.length} label="Pedidos empacados" />

      <RouteFilter
        selected={routeFilter}
        routes={routes}
        hasNoRoute={hasNoRoute}
        onChange={setRouteFilter}
      />

      {/* Bloque de impresión visible solo en desktop (md+). En el móvil del
          picker no tiene sentido — la impresora está en la estación de trabajo. */}
      {printable > 0 && (
        <div className="card hidden items-center justify-between gap-3 p-3 ring-1 ring-brand-100 md:flex">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-800">Imprimir albaranes de la secuencia</div>
            <div className="text-xs text-slate-500">
              Genera un único PDF con los {printable} albaranes ({sorted.filter(o => !['packed', 'classified', 'loaded', 'delivered'].includes(o.status)).length} pendientes). Cada hoja trae su QR — los pickers la escanean para tomar el pedido.
            </div>
          </div>
          <button
            type="button"
            onClick={printAll}
            disabled={printing}
            className="btn-primary shrink-0"
          >
            <Printer size={16} />
            {printing ? 'Generando…' : 'Imprimir todos'}
          </button>
        </div>
      )}
      {printError && (
        <div className="hidden rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 md:block">{printError}</div>
      )}

      {/* Cámara embebida para que el picker escanee el siguiente albarán sin
          salir de la app. El QR lleva a /scan/<wpId>, que redirige al packing. */}
      {!showScanner ? (
        <button
          type="button"
          onClick={() => { setShowScanner(true); setScanError(null); }}
          className="btn-primary w-full"
        >
          <Camera size={18} />
          Escanear otro pedido
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
          const done = o.status === 'packed' || o.status === 'classified' || o.status === 'loaded' || o.status === 'delivered';
          const claimed = !!o.pickedBy && !done;
          return (
            <Link
              key={o.id}
              to={done ? '#' : `/sequences/${seqId}/packing/${o.id}`}
              onClick={(e) => done && e.preventDefault()}
              className={clsx(
                'card flex items-center justify-between p-3',
                done ? 'opacity-60' : 'hover:shadow-md',
                claimed && 'ring-1 ring-amber-200',
              )}
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">#{o.number}</span>
                  {o.route && <Badge variant="blue">{o.route}</Badge>}
                  {o.stopPosition != null && <Badge variant="gray">Parada {o.stopPosition}</Badge>}
                  {o.hasB2Pending && <Badge variant="amber">B2</Badge>}
                  {done && <Badge variant="green">Empacado</Badge>}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {o.customerName || '—'} · {o.itemCount} items B1
                </div>
              </div>
              {claimed && (
                <div
                  className="ml-3 flex items-center gap-1 text-xs text-amber-700"
                  title="Está siendo trabajado por este picker. Si entras, se reasigna a ti."
                >
                  <User size={14} />
                  Tomado por {o.pickedBy!.displayName || o.pickedBy!.username}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
