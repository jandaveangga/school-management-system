import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import { TooManyRequestsError } from '../../shared/errors/app-error.js';
import { validate } from '../../shared/middleware/validate.js';

import {
  loginBodySchema,
  logoutBodySchema,
  refreshBodySchema,
  registerBodySchema,
} from './dtos/auth.dto.js';

import * as controller from './controller.js';
import { requireAuth } from './middleware.js';

// =========================================================
// RATE LIMITERS (AUTH HARDENING)
// =========================================================

// Login is most attacked endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,

  handler: (_req, _res, next) => {
    next(
      new TooManyRequestsError(
        'Too many login attempts',
      ),
    );
  },
});

// Registration abuse protection
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,

  handler: (_req, _res, next) => {
    next(
      new TooManyRequestsError(
        'Too many registration attempts',
      ),
    );
  },
});

// Token refresh endpoint (high frequency but controlled)
const refreshLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,

  handler: (_req, _res, next) => {
    next(
      new TooManyRequestsError(
        'Too many refresh attempts',
      ),
    );
  },
});

// =========================================================
// ROUTER
// =========================================================

export const authRouter = Router();

// =========================================================
// AUTH ROUTES
// =========================================================

authRouter.post(
  '/register',
  registerLimiter,
  validate({ body: registerBodySchema }),
  controller.register,
);

authRouter.post(
  '/login',
  loginLimiter,
  validate({ body: loginBodySchema }),
  controller.login,
);

authRouter.post(
  '/refresh',
  refreshLimiter,
  validate({ body: refreshBodySchema }),
  controller.refresh,
);

authRouter.post(
  '/logout',
  validate({ body: logoutBodySchema }),
  controller.logout,
);

authRouter.get(
  '/me',
  requireAuth,
  controller.me,
);