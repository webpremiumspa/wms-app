import { NO_ROUTE_KEY, type RouteFilterValue } from '@/components/RouteFilter';

type HasRoute = {
  route: string | null;
  stopPosition?: number | null;
};

// Extrae las rutas únicas presentes en una lista de pedidos. Devuelve
// también si hay al menos un pedido sin ruta (para mostrar la pastilla
// "Sin ruta").
export function extractRoutes<T extends HasRoute>(items: T[]): {
  routes: string[];
  hasNoRoute: boolean;
} {
  const set = new Set<string>();
  let hasNoRoute = false;
  for (const it of items) {
    if (it.route) set.add(it.route);
    else hasNoRoute = true;
  }
  // Orden natural por nombre de ruta (R1, R2, R3 → orden alfabético funciona).
  const routes = [...set].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
  return { routes, hasNoRoute };
}

// Filtra por ruta y ordena por stopPosition desc (mayor parada primero).
// Pedidos sin stopPosition van al final. Secundario por ruta asc cuando hay
// empate (útil cuando el filtro es "Todas").
export function applyRouteFilter<T extends HasRoute>(
  items: T[],
  selected: RouteFilterValue,
): T[] {
  let filtered = items;
  if (selected !== null) {
    if (selected === NO_ROUTE_KEY) {
      filtered = items.filter((i) => !i.route);
    } else {
      filtered = items.filter((i) => i.route === selected);
    }
  }
  return [...filtered].sort((a, b) => {
    const aPos = a.stopPosition ?? null;
    const bPos = b.stopPosition ?? null;
    // Null al final
    if (aPos == null && bPos == null) {
      // Sin posición → orden secundario por ruta
      return (a.route ?? '').localeCompare(b.route ?? '', 'es', { numeric: true });
    }
    if (aPos == null) return 1;
    if (bPos == null) return -1;
    // Descendente: mayor parada primero
    if (bPos !== aPos) return bPos - aPos;
    // Empate → ruta asc
    return (a.route ?? '').localeCompare(b.route ?? '', 'es', { numeric: true });
  });
}
