import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { Sequence } from '@/lib/types';

type Props = {
  sequences: Sequence[];
  onSelectDay: (isoDate: string | null) => void; // YYYY-MM-DD o null = sin filtro
  selectedDay: string | null;
};

const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function toISODate(d: Date): string {
  // YYYY-MM-DD en hora local (sin desfase UTC)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function buildMonthGrid(monthAnchor: Date): Date[] {
  // Genera 6×7 = 42 celdas que cubren el mes completo + padding de semanas.
  const first = startOfMonth(monthAnchor);
  const startDow = first.getDay(); // 0=Dom
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - startDow);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push(d);
  }
  return cells;
}

// Agrupa secuencias por día (YYYY-MM-DD) basándose en createdAt.
function groupByDay(sequences: Sequence[]): Map<string, Sequence[]> {
  const map = new Map<string, Sequence[]>();
  for (const s of sequences) {
    const key = toISODate(new Date(s.createdAt));
    const arr = map.get(key) || [];
    arr.push(s);
    map.set(key, arr);
  }
  return map;
}

// Color del día según estado de sus secuencias:
//   gris   = sin secuencias
//   ámbar  = al menos una abierta
//   verde  = todas cerradas
function dayStatus(seqs?: Sequence[]): 'empty' | 'open' | 'closed' {
  if (!seqs || seqs.length === 0) return 'empty';
  if (seqs.some((s) => s.status === 'open')) return 'open';
  return 'closed';
}

export function SequenceCalendar({ sequences, onSelectDay, selectedDay }: Props) {
  const today = useMemo(() => new Date(), []);
  const [monthAnchor, setMonthAnchor] = useState<Date>(startOfMonth(today));

  const grid = useMemo(() => buildMonthGrid(monthAnchor), [monthAnchor]);
  const byDay = useMemo(() => groupByDay(sequences), [sequences]);
  const monthLabel = monthAnchor.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  const todayISO = toISODate(today);

  return (
    <div className="card space-y-3 p-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonthAnchor(addMonths(monthAnchor, -1))}
          className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-sm font-semibold capitalize text-slate-800">{monthLabel}</div>
        <button
          type="button"
          onClick={() => setMonthAnchor(addMonths(monthAnchor, 1))}
          className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-[10px] font-medium uppercase text-slate-400">
            {d}
          </div>
        ))}
        {grid.map((d) => {
          const iso = toISODate(d);
          const inMonth = d.getMonth() === monthAnchor.getMonth();
          const seqs = byDay.get(iso);
          const status = dayStatus(seqs);
          const isToday = iso === todayISO;
          const isSelected = selectedDay === iso;
          const count = seqs?.length || 0;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDay(isSelected ? null : iso)}
              disabled={status === 'empty' && !inMonth}
              className={clsx(
                'relative flex aspect-square flex-col items-center justify-center rounded-md text-xs transition',
                !inMonth && 'opacity-40',
                status === 'empty' && 'bg-slate-50 text-slate-400',
                status === 'open' && 'bg-amber-100 text-amber-900 hover:bg-amber-200',
                status === 'closed' && 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200',
                isToday && 'ring-2 ring-brand-500',
                isSelected && 'ring-2 ring-brand-700 ring-offset-1',
              )}
            >
              <span className="text-sm font-semibold leading-none">{d.getDate()}</span>
              {count > 0 && (
                <span className="mt-0.5 text-[10px] leading-none opacity-80">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-amber-300" />
          <span>Con abiertas</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-emerald-300" />
          <span>Todas cerradas</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-slate-200" />
          <span>Sin actividad</span>
        </div>
      </div>
    </div>
  );
}
