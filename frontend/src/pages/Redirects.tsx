import { Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { processesApi } from '@/lib/processes';
import { sequencesApi } from '@/lib/sequences';
import { Spinner } from '@/components/Spinner';

// Redirige a la vista B2 del proceso activo, o a /processes si no hay activo.
export function PickingB2GlobalRedirect() {
  const { data: active, isLoading } = useQuery({
    queryKey: ['process-active'],
    queryFn: () => processesApi.active(),
  });
  if (isLoading) return <Spinner />;
  if (!active) return <Navigate to="/processes" replace />;
  return <Navigate to={`/processes/${active.id}/picking-b2`} replace />;
}

// Resuelve el processId de una secuencia y redirige a su picking B2.
// La vista per-secuencia de B2 fue eliminada (B2 es per-proceso ahora).
export function SequenceB2Redirect() {
  const { id } = useParams();
  const seqId = Number(id);
  const { data: seq, isLoading } = useQuery({
    queryKey: ['sequence', seqId],
    queryFn: () => sequencesApi.get(seqId),
    enabled: Number.isFinite(seqId) && seqId > 0,
  });
  if (isLoading) return <Spinner />;
  if (!seq?.processId) return <Navigate to="/processes" replace />;
  return <Navigate to={`/processes/${seq.processId}/picking-b2`} replace />;
}
