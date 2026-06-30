import 'dotenv/config';
import { createApp } from './src/app.js';
import { config } from './src/config.js';
import { prisma } from './src/db/prisma.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`[wms] listening on :${config.port} (env=${config.env})`);
});

// Cierre limpio. Passenger/cPanel manda SIGTERM al reiniciar la app. Sin este
// handler, las requests en vuelo se cortan y el pool de Prisma queda colgado
// en MySQL hasta que el server timeout lo limpie. Con esto:
//   1) Dejamos de aceptar conexiones nuevas (server.close).
//   2) Esperamos que terminen las activas.
//   3) Liberamos la conexión Prisma → MySQL.
//   4) Red de seguridad: si algo se cuelga, mata duro a los 10s.
let shuttingDown = false;
async function shutdown(signal) {
  // Idempotente: Passenger puede mandar SIGTERM más de una vez en reinicios
  // rápidos. Sin este guard, se dispara doble cierre y exit codes raros.
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[wms] señal ${signal} recibida, cerrando…`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('[wms] prisma disconnect error', e);
    }
    console.log('[wms] cierre limpio terminado');
    process.exit(0);
  });

  // unref() para que este timer NO impida el process.exit(0) si server.close
  // termina antes. Si pasaron 10s y seguimos vivos, forzamos exit.
  setTimeout(() => {
    console.error('[wms] timeout de gracia, forzando exit');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
