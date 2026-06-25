import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { processesApi } from '@/lib/processes';

const MAX_OPEN = 2;

function suggestedName(): string {
  const d = new Date();
  const hh = d.getHours();
  const turn = hh < 13 ? 'Matutino' : 'Vespertino';
  const fmt = d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
  return `${turn} ${fmt}`;
}

export function ProcessNew() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState(suggestedName());
  const [error, setError] = useState<string | null>(null);

  const { data: openProcesses } = useQuery({
    queryKey: ['processes-open'],
    queryFn: () => processesApi.openList(),
  });

  const create = useMutation({
    mutationFn: () => processesApi.create({ name }),
    onSuccess: (p) => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      queryClient.invalidateQueries({ queryKey: ['processes-open'] });
      queryClient.invalidateQueries({ queryKey: ['process-active'] });
      navigate(`/processes/${p.id}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'No se pudo crear el proceso');
    },
  });

  const openCount = openProcesses?.length ?? 0;
  const atLimit = openCount >= MAX_OPEN;

  return (
    <div className="space-y-4">
      <Link to="/processes" className="btn-ghost text-sm">
        <ChevronLeft size={16} />
        Procesos
      </Link>
      <h2 className="text-xl font-semibold">Nuevo proceso de preparación y carga</h2>

      {openCount > 0 && (
        <div className={`card flex items-start gap-2 p-4 ring-1 ${atLimit ? 'ring-amber-200' : 'ring-slate-200'}`}>
          <AlertTriangle size={18} className={`shrink-0 ${atLimit ? 'text-amber-700' : 'text-slate-500'}`} />
          <div className={`text-sm ${atLimit ? 'text-amber-900' : 'text-slate-700'}`}>
            {atLimit ? (
              <>
                Ya hay {openCount} procesos abiertos (límite: {MAX_OPEN}):{' '}
                <strong>{openProcesses!.map((p) => p.name).join(', ')}</strong>.
                Cerrá alguno antes de crear uno nuevo.
              </>
            ) : (
              <>
                Hay {openCount} proceso abierto: <strong>{openProcesses![0].name}</strong>.
                Podés abrir uno más en paralelo (matutino + vespertino).
              </>
            )}
          </div>
        </div>
      )}

      <div className="card space-y-3 p-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Nombre del proceso</span>
          <input
            type="text"
            className="input mt-1"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null); }}
            placeholder="Matutino 21/06"
            maxLength={200}
            autoFocus
          />
          <span className="mt-1 block text-xs text-slate-500">
            Sugerido según hora actual. Cambialo si querés algo más específico.
          </span>
        </label>

        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <button
          type="button"
          onClick={() => create.mutate()}
          disabled={create.isPending || !name.trim() || atLimit}
          className="btn-primary w-full"
        >
          <CheckCircle2 size={18} />
          {create.isPending ? 'Creando…' : 'Crear proceso'}
        </button>
      </div>
    </div>
  );
}
