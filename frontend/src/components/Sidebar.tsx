import { NavLink } from 'react-router-dom';
import { Home, LogOut, BarChart3, HelpCircle, Stethoscope, Activity, Truck, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';
import { forceHardRefresh } from '@/lib/hardRefresh';
import clsx from 'clsx';

type NavItem = { to: string; label: string; icon: typeof Home; caps?: string[] };

const NAV: NavItem[] = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/processes', label: 'Procesos', icon: Truck, caps: [CAPS.PACK_B1, CAPS.PACK_B2, CAPS.LOAD, CAPS.SUPERVISE] },
  { to: '/dashboard', label: 'Supervisión', icon: BarChart3, caps: [CAPS.SUPERVISE] },
  { to: '/tracking', label: 'Seguimiento', icon: Activity, caps: [CAPS.SUPERVISE] },
  { to: '/debug', label: 'Diagnóstico', icon: Stethoscope, caps: [CAPS.SUPERVISE] },
  { to: '/help', label: 'Ayuda', icon: HelpCircle },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const visible = NAV.filter((n) => !n.caps || n.caps.some((c) => hasCap(user, c)));

  return (
    <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:overflow-y-auto md:border-r md:border-slate-200 md:bg-white">
      <div className="w-full bg-brand-600">
        <img src="/chimuelo-logo.png" alt="Chimuelo" className="block h-auto w-full" />
      </div>
      <div className="flex h-12 items-center px-6 text-base font-bold text-brand-800">WMS Chimuelo</div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {visible.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-100',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-3">
        <div className="px-3 pb-2 text-xs text-slate-500">{user?.displayName}</div>
        <button onClick={logout} className="btn-ghost w-full justify-start text-sm">
          <LogOut size={16} />
          Salir
        </button>
        <div className="flex items-center justify-between px-3 pt-2 text-[10px] text-slate-400">
          <span>v{__APP_VERSION__} · {__GIT_HASH__}</span>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Forzar actualización? Esto borra el caché de la app y la recarga desde cero. Usa esto si ves datos desactualizados.')) {
                forceHardRefresh();
              }
            }}
            className="flex items-center gap-1 rounded px-1 py-0.5 hover:bg-slate-100 hover:text-slate-700"
            title="Forzar actualización (limpia caché)"
          >
            <RefreshCw size={11} />
            Refrescar
          </button>
        </div>
      </div>
    </aside>
  );
}
