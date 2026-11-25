import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { ApiError } from './utils/ApiError.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { sanitizeInput } from './middleware/sanitize.js';
import { notFound, createErrorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

/** Builds the Express app. A factory keeps it easy to test. */
export function createApp() {
  const app = express();

  // Behind a proxy (Render, Railway...) the real client IP is needed for rate limiting.
  if (env.isProduction) app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Requests without an Origin header (curl, server-to-server) are allowed.
        if (!origin || env.clientOrigins.includes(origin)) return callback(null, true);
        return callback(ApiError.forbidden('Origin not allowed by CORS'));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600,
    })
  );

  if (!env.isTest) app.use(morgan(env.isProduction ? 'combined' : 'dev'));

  app.use(express.json({ limit: '5mb' }));
  app.use(sanitizeInput);

  app.get('/', (req, res) => {
    res.json({ success: true, message: 'VELTRIO API', data: { version: 'v1', base: '/api/v1' } });
  });
  app.use('/api/v1', apiLimiter, routes);

  app.use(notFound);
  app.use(createErrorHandler({ isProduction: env.isProduction }));

  return app;
}
