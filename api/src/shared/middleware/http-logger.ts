 /* eslint-disable @typescript-eslint/no-unnecessary-condition */

import { pinoHttp, type HttpLogger } from 'pino-http';
import { v7 as uuidv7 } from 'uuid';

import { logger } from '../utils/logger.js';

export const httpLogger: HttpLogger = pinoHttp({
  logger,

  // Reuse the request-id set by `requestId` middleware.
  // If it hasn't run, fall back to a fresh UUID v7.
  genReqId: (req) => {
    const existing = (req as { id?: unknown }).id;

    return typeof existing === 'string' && existing.length > 0
      ? existing
      : uuidv7();
  },

  customLogLevel: (_req, res, err) => {
    if (err !== undefined && err !== null) {
      return 'error';
    }

    if (res.statusCode >= 500) {
      return 'error';
    }

    if (res.statusCode >= 400) {
      return 'warn';
    }

    return 'info';
  },

  serializers: {
    req: (req: {
      id?: string;
      method: string;
      url: string;
      remoteAddress?: string;
    }) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      remoteAddress: req.remoteAddress,
    }),

    res: (res: { statusCode: number }) => ({
      statusCode: res.statusCode,
    }),
  },

  // Skip access logs for liveness/readiness probes — they're noise.
  autoLogging: {
    ignore: (req) => req.url === '/health' || req.url === '/healthz',
  },
});