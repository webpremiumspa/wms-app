import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';

export function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
          <div className="text-base font-bold text-brand-800">WMS Chimuelo</div>
          <button onClick={logout} className="text-slate-500" aria-label="Salir">
            <LogOut size={20} />
          </button>
        </header>
        <main className="flex-1 px-4 pb-20 pt-4 md:px-8 md:pb-8 md:pt-6">
          <Outlet context={{ user }} />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
