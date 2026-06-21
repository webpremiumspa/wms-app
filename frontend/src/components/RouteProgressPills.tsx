import clsx from 'clsx';
import { CheckCircle2 } from 'lucide-react';
import type { RouteSummary } from '@/lib/dispatch';

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

// Widget grande genérico de progreso: barra + número + tilde verde al 100%.
// Lo usan RouteProgressHero, PackingOrder y PickingB2Order.
type HeroProps = {
  title: string;
  done: number;
  total: number;
  verb: string;
};

export function ProgressHero({ title, done, total, verb }: HeroProps) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const isComplete = total > 0 && done === total;

  return (
    <div
      className={clsx(
        'rounded-xl p-4 ring-2 transition-colors',
        isComplete ? 'bg-emerald-50 ring-emerald-400' : 'bg-brand-50 ring-brand-300',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className={clsx('text-[10px] font-semibold uppercase tracking-wide', isComplete ? 'text-emerald-700' : 'text-brand-700')}>
            {title}
          </div>
          <div className={clsx('mt-0.5 text-2xl font-bold', isComplete ? 'text-emerald-800' : 'text-brand-800')}>
            {done}/{total} {verb}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isComplete && <CheckCircle2 className="text-emerald-700" size={28} />}
          <div className={clsx('rounded-full px-3 py-1 text-base font-bold', isComplete ? 'bg-emerald-200 text-emerald-900' : 'bg-brand-200 text-brand-900')}>
            {pct}%
          </div>
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/60 ring-1 ring-white/80">
        <div
          className={clsx('h-full transition-all', isComplete ? 'bg-emerald-500' : 'bg-brand-600')}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isComplete && (
        <div className="mt-2 text-xs font-medium text-emerald-800">✓ Completo</div>
      )}
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
