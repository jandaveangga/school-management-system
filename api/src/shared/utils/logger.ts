import pino, { type Logger } from 'pino';
import { env } from '../../config/env.js';

const isProd = env.NODE_ENV === 'production';

// Redact known-sensitive paths. Repositories/handlers should still avoid
// logging full payloads of user input — this is defense in depth, not a license
// to log raw bodies.
const redactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'res.headers["set-cookie"]',
  'req.body.password',
  'req.body.passwordHash',
  'req.body.token',
  'req.body.refreshToken',
  'req.body.accessToken',
  '*.password',
  '*.passwordHash',
  '*.token',
  '*.refreshToken',
  '*.accessToken',
];

export const logger: Logger = pino({
  level: env.LOG_LEVEL,
  base: {
    pid: process.pid,
    env: env.NODE_ENV,
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  redact: {
    paths: redactPaths,
    censor: '[REDACTED]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,

  ...(isProd
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss.l',
            ignore: 'pid,env,hostname',
            singleLine: false,
          },
        },
      }),
});