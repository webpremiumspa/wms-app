import clsx from 'clsx';
import type { RouteSummary } from '@/lib/dispatch';

type Mode = 'classified' | 'loaded';

type Props = {
  routes: RouteSummary[];
  mode: Mode;
  // Resaltada: la pill que coincida con el `route` del pedido actual.
  highlightRoute?: string | null;
};

// Pills de progreso por ruta (Rx - Conductor (n/total)). Se usa tanto en
// Inicio (visión global del día) como en la vista de scan post-empacado,
// donde la del pedido actual aparece resaltada.
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
