import type { RequestHandler } from 'express';

import {
  NotFoundError,
  UnauthorizedError,
} from '../../shared/errors/app-error.js';

import { authService } from './service.js';

import type {
  LoginBody,
  LogoutBody,
  RefreshBody,
  RegisterBody,
} from './dtos/auth.dto.js';

import type { RequesterContext } from './types/index.js';

// =========================================================
// HELPERS
// =========================================================

const buildContext = (
  req: Parameters<RequestHandler>[0],
): RequesterContext => {
  const context: RequesterContext = {
    id: req.user?.id ?? '',
    roles: req.user?.roles ?? [],
  };

  const userAgent = req.header('user-agent');

  if (userAgent !== undefined) {
    (context as any).userAgent = userAgent;
  }

  if (req.ip !== undefined) {
    (context as any).ip = req.ip;
  }

  return context;
};

// =========================================================
// AUTH CONTROLLERS
// =========================================================

export const register: RequestHandler = async (
  req,
  res,
) => {
  const body = req.body as RegisterBody;

  const result = await authService.register(
    body,
    buildContext(req),
  );

  res.status(201).json(result);
};

export const login: RequestHandler = async (
  req,
  res,
) => {
  const body = req.body as LoginBody;

  const result = await authService.login(
    body,
    buildContext(req),
  );

  res.json(result);
};

export const refresh: RequestHandler = async (
  req,
  res,
) => {
  const body = req.body as RefreshBody;

  const result = await authService.refresh(
    body.refreshToken,
    buildContext(req),
  );

  res.json(result);
};

export const logout: RequestHandler = async (
  req,
  res,
) => {
  const body = req.body as LogoutBody;

  await authService.logout(body.refreshToken);

  res.status(204).send();
};

export const me: RequestHandler = async (
  req,
  res,
) => {
  if (req.user === undefined) {
    throw new UnauthorizedError();
  }

  const user = await authService.getUserPublic(
    req.user.id,
  );

  if (user === null) {
    throw new NotFoundError('User');
  }

  res.json(user);
};