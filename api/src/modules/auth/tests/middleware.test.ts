import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { RoleName } from '../../../shared/enums.js';

import { requireRoles } from '../middleware.js';
import {
  ForbiddenError,
  UnauthorizedError,
} from '../../../shared/errors/app-error.js';

const buildReq = (
  user?: { id: string; email: string; roles: RoleName[] },
): { req: Request; res: Response; next: NextFunction } => {
  const req = { user } as Request;
  const res = {} as Response;
  const next = vi.fn() as unknown as NextFunction;

  return { req, res, next };
};

const lastNextArg = (next: NextFunction): unknown => {
  return (next as unknown as { mock: { calls: unknown[][] } })
    .mock.calls[0]?.[0];
};

describe('requireRoles', () => {
  it('throws at construction when no roles supplied', () => {
    expect(() => requireRoles()).toThrow(/at least one role/);
  });

  it('forwards UnauthorizedError when req.user is missing', () => {
    const mw = requireRoles(RoleName.ADMIN);
    const { req, res, next } = buildReq();

    mw(req, res, next);

    expect(lastNextArg(next)).toBeInstanceOf(UnauthorizedError);
  });

  it('forwards ForbiddenError when user lacks required role', () => {
    const mw = requireRoles(RoleName.ADMIN);

    const { req, res, next } = buildReq({
      id: 'u1',
      email: 'a@b.c',
      roles: [RoleName.STUDENT],
    });

    mw(req, res, next);

    expect(lastNextArg(next)).toBeInstanceOf(ForbiddenError);
  });

  it('passes through when user has any allowed role', () => {
    const mw = requireRoles(RoleName.ADMIN, RoleName.TEACHER);

    const { req, res, next } = buildReq({
      id: 'u1',
      email: 'a@b.c',
      roles: [RoleName.TEACHER, RoleName.PARENT],
    });

    mw(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});