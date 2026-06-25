import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

function gitShortHash(): string {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __GIT_HASH__: JSON.stringify(gitShortHash()),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      // 'prompt' nos da control: NO recargamos a media operación; mostramos
      // un banner "Nueva versión disponible · Actualizar" y el operador
      // decide cuándo recargar. Si fuera 'autoUpdate' la recarga ocurriría
      // sola y podría perderse trabajo en curso.
      registerType: 'prompt',
      manifest: {
        name: 'WMS Chimuelo',
        short_name: 'WMS',
        description: 'Sistema de gestión de preparación de pedidos',
        theme_color: '#1e3a8a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // El SW nuevo se activa apenas se instala y toma el control de las
        // pestañas ya abiertas. En mobile-PWA esto importa: el usuario rara
        // vez cierra todas las pestañas, así que sin esto las actualizaciones
        // se quedan "pendientes" indefinidamente.
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.+\/api\/.+/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
