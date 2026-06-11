import { NavLink } from 'react-router-dom';
import { Home, Package, Scan, ClipboardList, LogOut, BarChart3, HelpCircle, Stethoscope } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';
import clsx from 'clsx';

type NavItem = { to: string; label: string; icon: typeof Home; caps?: string[] };

const NAV: NavItem[] = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/sequences', label: 'Secuencias', icon: ClipboardList, caps: [CAPS.PACK_B1] },
  { to: '/picking', label: 'Picking', icon: Package, caps: [CAPS.PACK_B1, CAPS.PACK_B2] },
  { to: '/dispatch', label: 'Clasificación', icon: Scan, caps: [CAPS.LOAD] },
  { to: '/dashboard', label: 'Supervisión', icon: BarChart3, caps: [CAPS.SUPERVISE] },
  { to: '/debug', label: 'Diagnóstico', icon: Stethoscope, caps: [CAPS.SUPERVISE] },
  { to: '/help', label: 'Ayuda', icon: HelpCircle },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const visible = NAV.filter((n) => !n.caps || n.caps.some((c) => hasCap(user, c)));

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-slate-200 md:bg-white">
      <div className="flex h-16 items-center px-6 text-lg font-bold text-brand-800">WMS Chimuelo</div>
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
      </div>
    </aside>
  );
}
