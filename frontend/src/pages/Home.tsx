import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';
import { Link } from 'react-router-dom';
import { Package, Scan, Truck, ClipboardList, BarChart3 } from 'lucide-react';

type Tile = { to: string; label: string; icon: typeof Package; cap: string };

const TILES: Tile[] = [
  { to: '/sequences/new', label: 'Generar secuencia', icon: ClipboardList, cap: CAPS.PACK_B1 },
  { to: '/sequences', label: 'Picking Bodega 1', icon: Package, cap: CAPS.PICK_B1 },
  { to: '/picking-b2', label: 'Picking Bodega 2', icon: Package, cap: CAPS.PICK_B2 },
  { to: '/dispatch', label: 'Clasificación y carga', icon: Scan, cap: CAPS.LOAD },
  { to: '/delivery', label: 'Entrega', icon: Truck, cap: CAPS.DELIVER },
  { to: '/dashboard', label: 'Supervisión', icon: BarChart3, cap: CAPS.SUPERVISE },
];

export function Home() {
  const { user } = useAuth();
  const tiles = TILES.filter((t) => hasCap(user, t.cap));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">
          Hola, {user?.displayName?.split(' ')[0] || user?.username}
        </h2>
        <p className="text-sm text-slate-500">¿Qué vas a hacer hoy?</p>
      </div>

      {tiles.length === 0 ? (
        <div className="card p-6 text-center text-slate-500">
          Aún no tienes funciones WMS asignadas. Avisa a tu supervisor.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {tiles.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="card flex flex-col items-start gap-3 p-4 transition hover:shadow-md active:scale-[0.98]"
            >
              <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
                <Icon size={22} />
              </div>
              <div className="text-sm font-medium text-slate-800">{label}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
