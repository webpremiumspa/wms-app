import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import { errorHandler, notFound } from './middleware/error.js';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import sequenceRoutes from './routes/sequences.js';
import webhookRoutes from './routes/webhooks.js';
import devRoutes from './routes/dev.js';
import pickingB2Routes from './routes/picking-b2.js';
import dispatchRoutes from './routes/dispatch.js';
import deliveryRoutes from './routes/delivery.js';
import dashboardRoutes from './routes/dashboard.js';

function mountWebhookRoutes(app, prefix = '') {
  // Passenger en cPanel puede montar la app bajo /api y entregar a Express la
  // ruta sin ese prefijo. Montamos ambos modos para soportar local y cPanel.
  app.use(`${prefix}/hooks`, express.raw({ type: 'application/json' }), webhookRoutes);
}

function mountJsonRoutes(app, prefix = '') {
  app.use(`${prefix}/health`, healthRoutes);
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/orders`, orderRoutes);
  app.use(`${prefix}/sequences`, sequenceRoutes);
  app.use(`${prefix}/picking/b2`, pickingB2Routes);
  app.use(`${prefix}/dispatch`, dispatchRoutes);
  app.use(`${prefix}/delivery`, deliveryRoutes);
  app.use(`${prefix}/dashboard`, dashboardRoutes);

  if (config.env === 'development') {
    app.use(`${prefix}/dev`, devRoutes);
  }
}

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: config.frontendOrigin, credentials: false }));
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

  // Webhook routes need the raw body for signature verification.
  mountWebhookRoutes(app, '/api');
  mountWebhookRoutes(app);

  app.use(express.json({ limit: '1mb' }));

  mountJsonRoutes(app, '/api');
  mountJsonRoutes(app);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
