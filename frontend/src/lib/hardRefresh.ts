// "Ctrl+Shift+R" para mobile: borra el service worker y todas las cachés
// y recarga la página. Se usa cuando el operador sospecha que la app está
// mostrando datos viejos a pesar de las versiones (último recurso).
export async function forceHardRefresh(): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    }
  } catch (err) {
    console.warn('[wms] no se pudo limpiar SW/caches:', err);
  } finally {
    // Force-reload sin cache. `true` solo lo respeta Firefox legacy pero
    // como pasamos por caches.delete() arriba, el navegador ya no tiene
    // de dónde servir caché.
    window.location.reload();
  }
}
