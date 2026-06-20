import { NavLink } from 'react-router-dom';
import { Home, Package, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CAPS, hasCap } from '@/lib/auth';
import clsx from 'clsx';

type Item = { to: string; label: string; icon: typeof Home; caps?: string[] };

const ITEMS: Item[] = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/picking', label: 'Picking', icon: Package, caps: [CAPS.PACK_B1, CAPS.PACK_B2] },
  { to: '/dashboard', label: 'Super.', icon: BarChart3, caps: [CAPS.SUPERVISE] },
];

export function BottomNav() {
  const { user } = useAuth();
  // Mostramos máximo 5 items, priorizando los que el usuario puede usar.
  const visible = ITEMS.filter((i) => !i.caps || i.caps.some((c) => hasCap(user, c))).slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      {visible.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            clsx(
              'flex flex-1 flex-col items-center gap-1 py-2 text-xs',
              isActive ? 'text-brand-700' : 'text-slate-500',
            )
          }
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
