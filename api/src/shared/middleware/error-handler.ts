 /* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

import {
  AppError,
  ConflictError,
  InternalError,
  NotFoundError,
  ValidationError,
} from '../errors/app-error.js';

import { logger } from '../utils/logger.js';
import { env } from '../../config/env.js';

const normalizePrismaError = (
  err: Prisma.PrismaClientKnownRequestError
): AppError => {
  switch (err.code) {
    case 'P2002': {
      const target = (err.meta as { target?: string[] } | undefined)?.target;

      return new ConflictError('Unique constraint violation', {
        target: target ?? null,
      });
    }

    case 'P2003':
      return new ConflictError('Foreign key constraint violation');

    case 'P2025':
      return new NotFoundError('Resource');

    default:
      return new InternalError('Database error', {
        prismaCode: err.code,
      });
  }
};

const normalize = (err: unknown): AppError => {
  if (err instanceof AppError) {
    return err;
  }

  if (err instanceof ZodError) {
    return new ValidationError(
      'Request validation failed',
      err.flatten()
    );
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return normalizePrismaError(err);
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError('Database query validation failed');
  }

  if (err instanceof Error) {
    return new InternalError(err.message);
  }

  return new InternalError('Unknown error');
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const normalized = normalize(err);
  const isServerError = normalized.statusCode >= 500;

  // Log raw error so we keep stack/cause; normalized output is response shape
  const logPayload = {
    err,
    requestId: req.id,
    statusCode: normalized.statusCode,
    code: normalized.code,
    method: req.method,
    path: req.originalUrl,
    operational: normalized.isOperational,
  };

  if (isServerError || !normalized.isOperational) {
    logger.error(logPayload, normalized.message);
  } else {
    logger.warn(logPayload, normalized.message);
  }

  const isProd = env.NODE_ENV === 'production';

  const body: {
    error: {
      code: string;
      message: string;
      requestId: string;
      details?: unknown;
      stack?: string;
    };
  } = {
    error: {
      code: normalized.code,
      message:
        isServerError && isProd
          ? 'Internal server error'
          : normalized.message,
      requestId: req.id as string,
    },
  };

  if (!isProd && normalized.stack !== undefined) {
    body.error.stack = normalized.stack;
  }

  if (
    normalized.details !== null &&
    normalized.details !== undefined &&
    !(isServerError && isProd)
  ) {
    body.error.details = normalized.details;
  }

  res.status(normalized.statusCode).json(body);
};