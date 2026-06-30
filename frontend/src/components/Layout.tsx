import { Link, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { UpdatePrompt } from './UpdatePrompt';
import { useAuth } from '@/hooks/useAuth';
import { HelpCircle, LogOut, RefreshCw } from 'lucide-react';
import { forceHardRefresh } from '@/lib/hardRefresh';

export function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-screen">
      <UpdatePrompt />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
          <div className="flex flex-col">
            <div className="text-base font-bold text-brand-800">WMS Chimuelo</div>
            <div className="text-[9px] leading-tight text-slate-400">v{__APP_VERSION__} · {__GIT_HASH__}</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Forzar actualización? Esto borra el caché de la app y la recarga desde cero. Usa esto si ves datos desactualizados.')) {
                  forceHardRefresh();
                }
              }}
              className="text-slate-500"
              aria-label="Forzar actualización"
              title="Forzar actualización (limpia caché)"
            >
              <RefreshCw size={20} />
            </button>
            <Link to="/help" className="text-slate-500" aria-label="Ayuda">
              <HelpCircle size={20} />
            </Link>
            <button onClick={logout} className="text-slate-500" aria-label="Salir">
              <LogOut size={20} />
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 pb-20 pt-4 md:px-8 md:pb-8 md:pt-6">
          <Outlet context={{ user }} />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
