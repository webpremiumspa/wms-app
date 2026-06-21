import clsx from 'clsx';
import { CheckCircle2 } from 'lucide-react';
import type { RouteSummary } from '@/lib/dispatch';

// Widget grande genérico de progreso: barra + número grande + tilde verde
// al 100%. Se usa en clasificación/carga (por ruta) y en packing (por secuencia).
type ProgressHeroProps = {
  title: string;       // ej. "Ruta R3 - Rodrigo" / "Secuencia #12"
  done: number;
  total: number;
  verb: string;        // ej. "clasificados", "cargados", "empacados"
  accent?: 'brand' | 'amber';
};

export function ProgressHero({ title, done, total, verb, accent = 'brand' }: ProgressHeroProps) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const isComplete = total > 0 && done === total;
  const baseAccentBg = accent === 'amber' ? 'bg-amber-50' : 'bg-brand-50';
  const baseAccentRing = accent === 'amber' ? 'ring-amber-300' : 'ring-brand-300';
  const baseAccentText = accent === 'amber' ? 'text-amber-700' : 'text-brand-700';
  const baseAccentText2 = accent === 'amber' ? 'text-amber-800' : 'text-brand-800';
  const baseAccentPill = accent === 'amber' ? 'bg-amber-200 text-amber-900' : 'bg-brand-200 text-brand-900';
  const baseAccentBar = accent === 'amber' ? 'bg-amber-600' : 'bg-brand-600';

  return (
    <div
      className={clsx(
        'rounded-xl p-4 ring-2 transition-colors',
        isComplete ? 'bg-emerald-50 ring-emerald-400' : `${baseAccentBg} ${baseAccentRing}`,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className={clsx('text-[10px] font-semibold uppercase tracking-wide', isComplete ? 'text-emerald-700' : baseAccentText)}>
            {title}
          </div>
          <div className={clsx('mt-0.5 text-2xl font-bold', isComplete ? 'text-emerald-800' : baseAccentText2)}>
            {done}/{total} {verb}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isComplete && <CheckCircle2 className="text-emerald-700" size={28} />}
          <div className={clsx('rounded-full px-3 py-1 text-base font-bold', isComplete ? 'bg-emerald-200 text-emerald-900' : baseAccentPill)}>
            {pct}%
          </div>
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/60 ring-1 ring-white/80">
        <div
          className={clsx('h-full transition-all', isComplete ? 'bg-emerald-500' : baseAccentBar)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isComplete && (
        <div className="mt-2 text-xs font-medium text-emerald-800">✓ Completo</div>
      )}
    </div>
  );
}

type Mode = 'classified' | 'loaded';

type Props = {
  routes: RouteSummary[];
  mode: Mode;
  highlightRoute?: string | null;
};

// Pills de progreso por ruta (Rx - Conductor (n/total)). Se usa en Inicio
// (visión global del día) y debajo del widget grande en scan post-empacado.
export function RouteProgressPills({ routes, mode, highlightRoute }: Props) {
  if (routes.length === 0) {
    return (
      <div className="text-xs text-slate-500">
        Aún no hay pedidos empacados con ruta asignada.
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {routes.map((r) => {
        const done = mode === 'classified' ? r.classified : r.loaded;
        const total = r.total;
        const isActive = highlightRoute === r.route;
        const isComplete = done === total;
        return (
          <span
            key={r.route}
            className={clsx(
              'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ring-1 transition',
              isActive
                ? 'bg-brand-700 text-white ring-brand-700 shadow-sm'
                : isComplete
                ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                : 'bg-white text-slate-700 ring-slate-300',
            )}
            title={mode === 'classified' ? 'Clasificados / total' : 'Cargados / total'}
          >
            {r.route} ({done}/{total})
          </span>
        );
      })}
    </div>
  );
}

// Widget grande de progreso para la ruta del pedido escaneado actual.
// Delega a ProgressHero. No renderiza si no encuentra la ruta en `routes`.
export function RouteProgressHero({ routes, mode, highlightRoute }: Props) {
  const current = highlightRoute ? routes.find((r) => r.route === highlightRoute) : null;
  if (!current) return null;
  const done = mode === 'classified' ? current.classified : current.loaded;
  const verb = mode === 'classified' ? 'clasificados' : 'cargados';
  return <ProgressHero title={`Ruta ${current.route}`} done={done} total={current.total} verb={verb} />;
}
