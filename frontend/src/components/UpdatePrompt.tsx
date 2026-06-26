import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

// Banner que aparece cuando el service worker detecta una nueva versión
// publicada. Cubre el caso típico de mobile-PWA: el operador rara vez cierra
// la app y sin esto la versión nueva no se aplica.
//
// Al tocar "Actualizar":
//  1. updateServiceWorker(true) le manda SKIP_WAITING al SW en estado
//     'waiting' y, cuando dispara controllerchange, recarga la página
//     con los bundles nuevos.
//  2. Como red de seguridad por si el evento controllerchange nunca
//     llega (puede pasar si el navegador no enrolla bien el SW), forzamos
//     un location.reload() a los 1.5s.
//
// Polling cada 60s: aunque el navegador en teoría revisa solo, el polling
// activo cubre los casos en que el dispositivo estuvo offline o el evento
// no se disparó.
export function UpdatePrompt() {
  const [updating, setUpdating] = useState(false);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      const interval = setInterval(() => {
        registration.update().catch(() => {/* offline, sin drama */});
      }, 60_000);
      return () => clearInterval(interval);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      console.info('[wms] nueva versión disponible');
    }
  }, [needRefresh]);

  if (!needRefresh) return null;

  async function handleUpdate() {
    setUpdating(true);
    try {
      // Dispara el SKIP_WAITING + reload del SW nuevo.
      await updateServiceWorker(true);
    } catch (err) {
      console.warn('[wms] updateServiceWorker falló, recargando manualmente', err);
    }
    // Fallback duro: si el flujo del plugin no recargó a los 1.5s,
    // forzamos un reload manual. Sirve para mobile-PWA donde el evento
    // controllerchange no siempre llega como espera el plugin.
    setTimeout(() => window.location.reload(), 1500);
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center gap-3 bg-brand-700 px-4 py-2 text-sm text-white shadow-lg">
      <RefreshCw size={16} className={updating ? 'shrink-0 animate-spin' : 'shrink-0'} />
      <div className="flex-1">
        <strong>Nueva versión disponible.</strong>{' '}
        {updating ? 'Aplicando…' : 'Recarga para aplicar los cambios.'}
      </div>
      <button
        type="button"
        onClick={handleUpdate}
        disabled={updating}
        className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-60"
      >
        {updating ? 'Actualizando…' : 'Actualizar'}
      </button>
      <button
        type="button"
        onClick={() => setNeedRefresh(false)}
        disabled={updating}
        aria-label="Cerrar"
        className="text-white/80 hover:text-white disabled:opacity-40"
      >
        <X size={16} />
      </button>
    </div>
  );
}
