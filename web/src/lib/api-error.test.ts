import { describe, it, expect } from 'vitest';

import {
  ApiError,
  errorMessage,
  isApiError,
} from './api-error';

describe('ApiError', () => {
  it('correctly stores all error properties', () => {
    const err = new ApiError(
      409,
      'CONFLICT',
      'Email already taken',
      { field: 'email' },
      'req-1',
    );

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);

    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
    expect(err.message).toBe('Email already taken');
    expect(err.details).toEqual({ field: 'email' });
    expect(err.requestId).toBe('req-1');
    expect(err.name).toBe('ApiError');
  });

  it('isApiError correctly narrows types', () => {
    const apiErr: unknown = new ApiError(500, 'X', 'oops');

    expect(isApiError(apiErr)).toBe(true);
    expect(isApiError(new Error('plain'))).toBe(false);
    expect(isApiError(null)).toBe(false);
    expect(isApiError('string')).toBe(false);
  });

  it('errorMessage provides safe fallback behavior', () => {
    expect(
      errorMessage(new ApiError(400, 'X', 'api boom')),
    ).toBe('api boom');

    expect(
      errorMessage(new Error('plain boom')),
    ).toBe('plain boom');

    expect(errorMessage('string')).toBe(
      'An unexpected error occurred',
    );

    expect(errorMessage(undefined)).toBe(
      'An unexpected error occurred',
    );
  });
});