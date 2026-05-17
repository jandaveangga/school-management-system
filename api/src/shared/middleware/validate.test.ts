import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

import { validate } from './validate.js';
import { ValidationError } from '../errors/app-error.js';

const mockReqRes = (
  body: unknown = {},
  query: unknown = {},
  params: unknown = {}
): { req: Request; res: Response; next: NextFunction } => {
  const req = {
    body,
    query,
    params,
  } as Request;

  const res = {} as Response;
  const next = vi.fn() as unknown as NextFunction;

  return { req, res, next };
};

describe('validate middleware', () => {
  it('replaces req.body with parsed output on success', async () => {
    const schema = z.object({
      name: z.string(),
      age: z.coerce.number(),
    });

    const mw = validate({ body: schema });
    const { req, res, next } = mockReqRes({ name: 'Ada', age: '36' });

    await mw(req, res, next);

    expect(req.body).toEqual({ name: 'Ada', age: 36 });
    expect(next).toHaveBeenCalledWith();
  });

  it('forwards ValidationError when body fails', async () => {
    const schema = z.object({
      email: z.string().email(),
    });

    const mw = validate({ body: schema });
    const { req, res, next } = mockReqRes({ email: 'not-an-email' });

    await mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    const arg = (next as unknown as { mock: { calls: unknown[][] } }).mock
      .calls[0]?.[0];

    expect(arg).toBeInstanceOf(ValidationError);
    expect((arg as ValidationError).statusCode).toBe(400);
    expect((arg as ValidationError).code).toBe('VALIDATION_ERROR');
  });

  it('skips sections that are not provided', async () => {
    const schema = z.object({
      q: z.string(),
    });

    const mw = validate({ query: schema });
    const { req, res, next } = mockReqRes(
      { untouched: true },
      { q: 'hello' }
    );

    await mw(req, res, next);

    expect(req.body).toEqual({ untouched: true });
    expect(req.query).toEqual({ q: 'hello' });
    expect(next).toHaveBeenCalledWith();
  });
});