import clsx from 'clsx';

// Valor especial para representar "pedidos sin ruta asignada". No es un string
// real de ruta — solo lo usamos como discriminador interno.
export const NO_ROUTE_KEY = '__NO_ROUTE__';

export type RouteFilterValue = string | null; // null = "Todas"

type Props = {
  selected: RouteFilterValue;
  routes: string[];      // rutas únicas presentes en los pedidos
  hasNoRoute: boolean;   // ¿hay al menos un pedido con route=null?
  onChange: (selected: RouteFilterValue) => void;
};

// Pastillas para filtrar la lista de pedidos por ruta. Dinámicas: solo
// muestra rutas presentes en el dataset. Si no hay rutas ni pedidos sin
// ruta, no renderiza nada.
export function RouteFilter({ selected, routes, hasNoRoute, onChange }: Props) {
  if (routes.length === 0 && !hasNoRoute) return null;
  if (routes.length === 0 && !hasNoRoute) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-500">Ruta:</span>
      <Pill active={selected === null} onClick={() => onChange(null)}>
        Todas
      </Pill>
      {routes.map((r) => (
        <Pill key={r} active={selected === r} onClick={() => onChange(r)}>
          {r}
        </Pill>
      ))}
      {hasNoRoute && (
        <Pill active={selected === NO_ROUTE_KEY} onClick={() => onChange(NO_ROUTE_KEY)}>
          Sin ruta
        </Pill>
      )}
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'rounded-full px-3 py-1 text-xs font-medium ring-1 transition',
        active
          ? 'bg-brand-700 text-white ring-brand-700'
          : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50',
      )}
    >
      {children}
    </button>
  );
}
