import express, {
  type Application,
  type Request,
  type Response,
} from 'express';

import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';

import { env } from './config/env.js';
import { prisma } from './db/prisma.js';
import { logger } from './shared/utils/logger.js';

import {
  requestId,
  httpLogger,
  notFoundHandler,
  errorHandler,
} from './shared/middleware/index.js';

import { authRouter } from './modules/auth/routes.js';
import { usersRouter } from './modules/users/routes.js';

export const createApp = (): Application => {
  const app = express();

  app.disable('x-powered-by');

  // Trust first proxy hop (nginx, cloudflare, etc.)
  app.set('trust proxy', 1);

  // =========================================================
  // SECURITY
  // =========================================================

  app.use(helmet());

  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true,
    }),
  );

  // =========================================================
  // BODY PARSERS
  // =========================================================

  app.use(
    express.json({
      limit: env.JSON_BODY_LIMIT,
    }),
  );

  app.use(
    express.urlencoded({
      extended: false,
      limit: env.JSON_BODY_LIMIT,
    }),
  );

  // =========================================================
  // PERFORMANCE
  // =========================================================

  app.use(compression());

  // =========================================================
  // LOGGING / TRACING
  // =========================================================

  // requestId BEFORE httpLogger
  app.use(requestId);
  app.use(httpLogger);

  // =========================================================
  // RATE LIMITING
  // =========================================================

  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      limit: env.RATE_LIMIT_MAX,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    }),
  );

  // =========================================================
  // HEALTH CHECKS
  // =========================================================

  // Liveness
  app.get('/health', (_req: Request, res: Response): void => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: env.NODE_ENV,
    });
  });

  // Readiness
  app.get(
    '/health/ready',
    async (_req: Request, res: Response): Promise<void> => {
      try {
      await prisma.role.count();

        res.json({
          status: 'ready',
          db: 'ok',
        });
      } catch (err) {
        logger.warn({ err }, 'readiness check failed');

        res.status(503).json({
          status: 'not_ready',
          db: 'failed',
        });
      }
    },
  );

  // =========================================================
  // ROUTES
  // =========================================================

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', usersRouter);

  // =========================================================
  // ERROR HANDLERS
  // =========================================================

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};