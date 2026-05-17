import type { RequestHandler } from 'express';
import type { RoleName } from '../../shared/enums.js';

import {
  UnauthorizedError,
  ForbiddenError,
} from '../../shared/errors/app-error.js';

import { verifyAccessToken } from '../../shared/utils/jwt.js';

// =========================================================
// CONSTANTS
// =========================================================

const BEARER_PREFIX = 'Bearer ';

// =========================================================
// AUTH MIDDLEWARE
// =========================================================

export const requireAuth: RequestHandler = (
  req,
  _res,
  next,
) => {
  const authorization = req.header('authorization');

  if (
    authorization === undefined ||
    !authorization.startsWith(BEARER_PREFIX)
  ) {
    next(
      new UnauthorizedError(
        'Missing or malformed Authorization header',
      ),
    );

    return;
  }

  const token = authorization
    .slice(BEARER_PREFIX.length)
    .trim();

  if (token.length === 0) {
    next(
      new UnauthorizedError(
        'Empty bearer token',
      ),
    );

    return;
  }

  try {
    const claims = verifyAccessToken(token);

    req.user = {
      id: claims.sub,
      email: claims.email,
      roles: claims.roles,
    };

    next();
  } catch (err) {
    next(err);
  }
};

// =========================================================
// ROLE AUTHORIZATION
// =========================================================

/**
 * Gate routes by role.
 *
 * User must have at least one allowed role.
 *
 * Always use `requireAuth` before this middleware.
 */

export const requireRoles = (
  ...allowed: readonly RoleName[]
): RequestHandler => {
  if (allowed.length === 0) {
    throw new Error(
      'requireRoles: at least one role must be supplied',
    );
  }

  return (req, _res, next) => {
    if (req.user === undefined) {
      next(new UnauthorizedError());

      return;
    }

    const matched = req.user.roles.some((role) =>
      allowed.includes(role),
    );

    if (!matched) {
      next(
        new ForbiddenError(
          `Requires role: ${allowed.join(' or ')}`,
        ),
      );

      return;
    }

    next();
  };
};