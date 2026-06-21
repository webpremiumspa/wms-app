import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { DeliveryProcess } from '@/lib/processes';

type Props = {
  processes: DeliveryProcess[];
  onSelectDay: (isoDate: string | null) => void;
  selectedDay: string | null;
};

const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function toISODate(d: Date): string {
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
  const first = startOfMonth(monthAnchor);
  const startDow = first.getDay();
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

function groupByDay(processes: DeliveryProcess[]): Map<string, DeliveryProcess[]> {
  const map = new Map<string, DeliveryProcess[]>();
  for (const p of processes) {
    const key = toISODate(new Date(p.createdAt));
    const arr = map.get(key) || [];
    arr.push(p);
    map.set(key, arr);
  }
  return map;
}

//   gris   = sin procesos
//   ámbar  = al menos uno activo
//   verde  = todos cerrados
function dayStatus(procs?: DeliveryProcess[]): 'empty' | 'open' | 'closed' {
  if (!procs || procs.length === 0) return 'empty';
  if (procs.some((p) => p.status === 'open')) return 'open';
  return 'closed';
}

export function ProcessCalendar({ processes, onSelectDay, selectedDay }: Props) {
  const today = useMemo(() => new Date(), []);
  const [monthAnchor, setMonthAnchor] = useState<Date>(startOfMonth(today));

  const grid = useMemo(() => buildMonthGrid(monthAnchor), [monthAnchor]);
  const byDay = useMemo(() => groupByDay(processes), [processes]);
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
          const procs = byDay.get(iso);
          const status = dayStatus(procs);
          const isToday = iso === todayISO;
          const isSelected = selectedDay === iso;
          const count = procs?.length || 0;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDay(isSelected ? null : iso)}
              disabled={status === 'empty' && !inMonth}
              className={clsx(
                'flex h-9 items-center justify-center gap-1 rounded-md px-1 text-xs leading-none transition',
                !inMonth && 'opacity-40',
                status === 'empty' && 'bg-slate-50 text-slate-400',
                status === 'open' && 'bg-amber-100 text-amber-900 hover:bg-amber-200',
                status === 'closed' && 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200',
                isToday && 'ring-2 ring-brand-500',
                isSelected && 'ring-2 ring-brand-700 ring-offset-1',
              )}
            >
              <span className="text-sm font-semibold">{d.getDate()}</span>
              {count > 0 && <span className="text-[10px] opacity-80">· {count}</span>}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-amber-300" />
          <span>Con activos</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-emerald-300" />
          <span>Todos cerrados</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-slate-200" />
          <span>Sin actividad</span>
        </div>
      </div>
    </div>
  );
}
