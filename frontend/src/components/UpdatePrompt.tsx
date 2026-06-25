import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

// Banner que aparece cuando el service worker detecta una nueva versión
// publicada. Cubre el caso típico de mobile-PWA: el operador rara vez cierra
// la app y sin esto la versión nueva no se aplica.
//
// El SW está configurado con skipWaiting + clientsClaim, así que apenas el
// usuario toca "Actualizar" basta con un location.reload() — el SW nuevo
// ya está activo y servirá los bundles nuevos.
//
// Además fuerza un check cada 60s por si el dispositivo estuvo offline o
// el navegador no disparó el evento automático.
export function UpdatePrompt() {
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

  // Si el usuario cierra el banner, lo dejamos cerrado solo hasta que
  // se detecte otra versión más nueva.
  useEffect(() => {
    if (needRefresh) {
      console.info('[wms] nueva versión disponible');
    }
  }, [needRefresh]);

  if (!needRefresh) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center gap-3 bg-brand-700 px-4 py-2 text-sm text-white shadow-lg">
      <RefreshCw size={16} className="shrink-0" />
      <div className="flex-1">
        <strong>Nueva versión disponible.</strong> Recarga para aplicar los cambios.
      </div>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
      >
        Actualizar
      </button>
      <button
        type="button"
        onClick={() => setNeedRefresh(false)}
        aria-label="Cerrar"
        className="text-white/80 hover:text-white"
      >
        <X size={16} />
      </button>
    </div>
  );
}
