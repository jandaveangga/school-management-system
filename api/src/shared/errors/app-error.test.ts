import { describe, it, expect } from 'vitest';

import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  TooManyRequestsError,
  InternalError,
} from './app-error.js';

describe('AppError hierarchy', () => {
  it(
    'AppError captures statusCode, code, details, isOperational defaults',
    () => {
      const err = new AppError(
        'boom',
        418,
        'TEAPOT',
        { x: 1 },
      );

      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(AppError);

      expect(err.message).toBe('boom');
      expect(err.statusCode).toBe(418);
      expect(err.code).toBe('TEAPOT');

      expect(err.details).toEqual({
        x: 1,
      });

      expect(err.isOperational).toBe(true);
      expect(err.name).toBe('AppError');
      expect(err.stack).toBeDefined();
    },
  );

  it.each([
    [ValidationError, 400, 'VALIDATION_ERROR'],
    [UnauthorizedError, 401, 'UNAUTHORIZED'],
    [ForbiddenError, 403, 'FORBIDDEN'],
    [ConflictError, 409, 'CONFLICT'],
    [
      UnprocessableEntityError,
      422,
      'UNPROCESSABLE_ENTITY',
    ],
    [TooManyRequestsError, 429, 'RATE_LIMITED'],
  ] as const)(
    '%p maps to status %i and code %s',
    (Cls, status, code) => {
      const err = new Cls();

      expect(err).toBeInstanceOf(AppError);

      expect(err.statusCode).toBe(status);
      expect(err.code).toBe(code);
      expect(err.isOperational).toBe(true);
    },
  );

  it('NotFoundError formats message with resource', () => {
    const err = new NotFoundError('Student');

    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Student not found');
  });

  it('InternalError is non-operational and 500', () => {
    const err = new InternalError();

    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('INTERNAL_ERROR');
    expect(err.isOperational).toBe(false);
  });
});