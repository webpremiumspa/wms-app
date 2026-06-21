import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, List, CalendarDays } from 'lucide-react';
import clsx from 'clsx';
import { sequencesApi } from '@/lib/sequences';
import { sequenceStatusLabel, warehouseLabel } from '@/lib/labels';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';
import { SequenceCalendar } from '@/components/SequenceCalendar';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';
import type { Sequence } from '@/lib/types';

type ViewMode = 'list' | 'calendar';

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function todayISO(): string {
  return toISODate(new Date());
}

function startOfWeekISO(): { from: string; to: string } {
  // Semana actual: lunes a domingo (criterio Chile/LATAM más común).
  const d = new Date();
  const dow = d.getDay(); // 0=Dom
  // Si hoy es Dom (0), retroceder 6; si Lun (1) retroceder 0.
  const offsetToMonday = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(d);
  monday.setDate(d.getDate() + offsetToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { from: toISODate(monday), to: toISODate(sunday) };
}

export function SequencesIndex() {
  const { user } = useAuth();
  const canCreate = hasCap(user, CAPS.PACK_B1);
  const [view, setView] = useState<ViewMode>('list');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // En calendario pedimos un lote más grande para cubrir varios meses.
  // En lista, el default (50) está bien para la vista operativa.
  const limit = view === 'calendar' ? 1000 : 50;
  const { data, isLoading } = useQuery({
    queryKey: ['sequences', { limit }],
    queryFn: () => sequencesApi.list({ limit }),
  });

  const sequences = data || [];

  // En modo calendario, filtramos por día seleccionado.
  // En modo lista, presets de "Hoy" y "Esta semana" filtran client-side.
  const [listFilter, setListFilter] = useState<'all' | 'today' | 'week'>('all');

  const filteredForList = useMemo(() => {
    if (listFilter === 'all') return sequences;
    if (listFilter === 'today') {
      const today = todayISO();
      return sequences.filter((s) => toISODate(new Date(s.createdAt)) === today);
    }
    if (listFilter === 'week') {
      const { from, to } = startOfWeekISO();
      return sequences.filter((s) => {
        const d = toISODate(new Date(s.createdAt));
        return d >= from && d <= to;
      });
    }
    return sequences;
  }, [sequences, listFilter]);

  const filteredForCalendar = useMemo(() => {
    if (!selectedDay) return [];
    return sequences.filter((s) => toISODate(new Date(s.createdAt)) === selectedDay);
  }, [sequences, selectedDay]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Secuencias</h2>
        <div className="flex items-center gap-2">
          {/* Toggle Lista / Calendario */}
          <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setView('list')}
              className={clsx(
                'flex items-center gap-1 rounded-md px-2 py-1 font-medium',
                view === 'list' ? 'bg-brand-700 text-white' : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              <List size={14} />
              Lista
            </button>
            <button
              type="button"
              onClick={() => setView('calendar')}
              className={clsx(
                'flex items-center gap-1 rounded-md px-2 py-1 font-medium',
                view === 'calendar' ? 'bg-brand-700 text-white' : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              <CalendarDays size={14} />
              Calendario
            </button>
          </div>
          {canCreate && (
            <Link to="/sequences/new" className="btn-primary text-sm">
              <Plus size={16} />
              Generar
            </Link>
          )}
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : sequences.length === 0 ? (
        <div className="card p-6 text-center text-slate-500">
          Aún no hay secuencias. {canCreate && 'Genera la primera con el botón de arriba.'}
        </div>
      ) : view === 'list' ? (
        <>
          {/* Presets de filtrado por fecha en vista lista */}
          <div className="flex flex-wrap gap-2 text-xs">
            <ListPreset active={listFilter === 'all'} onClick={() => setListFilter('all')}>
              Todas
            </ListPreset>
            <ListPreset active={listFilter === 'today'} onClick={() => setListFilter('today')}>
              Hoy
            </ListPreset>
            <ListPreset active={listFilter === 'week'} onClick={() => setListFilter('week')}>
              Esta semana
            </ListPreset>
          </div>

          {filteredForList.length === 0 ? (
            <div className="card p-6 text-center text-sm text-slate-500">
              No hay secuencias para este filtro.
            </div>
          ) : (
            <SequenceList items={filteredForList} />
          )}
        </>
      ) : (
        <>
          <SequenceCalendar
            sequences={sequences}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />

          {selectedDay ? (
            filteredForCalendar.length === 0 ? (
              <div className="card p-6 text-center text-sm text-slate-500">
                No hay secuencias el {new Date(selectedDay + 'T00:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-slate-600">
                  {filteredForCalendar.length} secuencia{filteredForCalendar.length === 1 ? '' : 's'} el{' '}
                  <strong>
                    {new Date(selectedDay + 'T00:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </strong>
                </div>
                <SequenceList items={filteredForCalendar} />
              </div>
            )
          ) : (
            <div className="card p-4 text-center text-xs text-slate-500">
              Tocá un día para ver sus secuencias.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ListPreset({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'rounded-full px-3 py-1 font-medium ring-1 transition',
        active
          ? 'bg-brand-700 text-white ring-brand-700'
          : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50',
      )}
    >
      {children}
    </button>
  );
}

function SequenceList({ items }: { items: Sequence[] }) {
  return (
    <div className="space-y-2">
      {items.map((s) => (
        <Link
          key={s.id}
          to={`/sequences/${s.id}`}
          className="card flex items-center justify-between p-4 hover:shadow-md"
        >
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">#{s.id}</span>
              <Badge variant={s.status === 'open' ? 'green' : 'gray'}>{sequenceStatusLabel(s.status)}</Badge>
              <Badge variant={s.b1ClosedAt ? 'green' : 'blue'}>
                {warehouseLabel('B1')} {s.b1ClosedAt ? 'cerrado' : 'abierto'}
              </Badge>
              {(s.b2?.total ?? 0) > 0 && (
                <Badge variant={s.b2ClosedAt ? 'green' : 'amber'}>
                  {warehouseLabel('B2')} {s.b2ClosedAt ? 'cerrado' : `${(s.b2?.pending ?? 0)} pend.`}
                </Badge>
              )}
            </div>
            <div className="text-xs text-slate-500">
              {new Date(s.createdAt).toLocaleString('es-CL')} · {s._count?.orders ?? s.expectedBags} pedidos
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Esperados: {s.expectedBags}</div>
            <div>Empacados: {s.actualBags}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
