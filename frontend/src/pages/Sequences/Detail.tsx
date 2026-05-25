import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Package, ClipboardCheck, CheckCircle2 } from 'lucide-react';
import { sequencesApi } from '@/lib/sequences';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';

export function SequenceDetail() {
  const { id } = useParams();
  const seqId = Number(id);
  const { data, isLoading } = useQuery({
    queryKey: ['sequence', seqId],
    queryFn: () => sequencesApi.get(seqId),
  });

  if (isLoading || !data) return <Spinner />;

  const seq = data;
  const orderCount = seq.orders.length;
  const packed = seq.orders.filter((o) => o.order.status === 'packed' || o.order.status === 'classified' || o.order.status === 'loaded' || o.order.status === 'delivered').length;

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
    </div>
  );
}
