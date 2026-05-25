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

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: config.frontendOrigin, credentials: false }));
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

  // Webhook routes need the raw body for signature verification.
  app.use('/api/hooks', express.raw({ type: 'application/json' }), webhookRoutes);

  app.use(express.json({ limit: '1mb' }));

  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/sequences', sequenceRoutes);

  if (config.env === 'development') {
    app.use('/api/dev', devRoutes);
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
