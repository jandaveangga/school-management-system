import type { Request, RequestHandler } from 'express';

import { UnauthorizedError } from '../../shared/errors/app-error.js';
import { usersService } from './service.js';

import type {
  ChangePasswordBody,
  CreateStudentProfileBody,
  CreateTeacherProfileBody,
  CreateUserBody,
  ListUsersQuery,
  RoleBody,
  RoleParams,
  UpdateUserBody,
  UserIdParams,
} from './dtos/index.js';

import type { RequesterContext } from './types/index.js';

const requireUser = (req: Request): RequesterContext => {
  if (req.user === undefined) {
    throw new UnauthorizedError();
  }

  return {
    id: req.user.id,
    roles: req.user.roles,
  };
};

export const list: RequestHandler = async (req, res) => {
  const requester = requireUser(req);

  const result = await usersService.list(
    req.query as unknown as ListUsersQuery,
    requester,
  );

  res.json(result);
};

export const get: RequestHandler = async (req, res) => {
  const requester = requireUser(req);

  const params = req.params as unknown as UserIdParams;

  const user = await usersService.get(params.id, requester);

  res.json(user);
};

export const create: RequestHandler = async (req, res) => {
  const requester = requireUser(req);

  const user = await usersService.create(
    req.body as CreateUserBody,
    requester,
  );

  res.status(201).json(user);
};

export const update: RequestHandler = async (req, res) => {
  const requester = requireUser(req);

  const params = req.params as unknown as UserIdParams;

  const user = await usersService.update(
    params.id,
    req.body as UpdateUserBody,
    requester,
  );

  res.json(user);
};

export const remove: RequestHandler = async (req, res) => {
  const requester = requireUser(req);

  const params = req.params as unknown as UserIdParams;

  await usersService.delete(params.id, requester);

  res.status(204).send();
};

export const changePassword: RequestHandler = async (req, res) => {
  const requester = requireUser(req);

  const params = req.params as unknown as UserIdParams;

  await usersService.changePassword(
    params.id,
    req.body as ChangePasswordBody,
    requester,
  );

  res.status(204).send();
};

export const addRole: RequestHandler = async (req, res) => {
  const requester = requireUser(req);

  const params = req.params as unknown as UserIdParams;
  const body = req.body as RoleBody;

  const user = await usersService.addRole(
    params.id,
    body.role,
    requester,
  );

  res.json(user);
};

export const removeRole: RequestHandler = async (req, res) => {
  const requester = requireUser(req);

  const params = req.params as unknown as RoleParams;

  const user = await usersService.removeRole(
    params.id,
    params.roleName,
    requester,
  );

  res.json(user);
};

export const createStudentProfile: RequestHandler = async (req, res) => {
  const requester = requireUser(req);

  const params = req.params as unknown as UserIdParams;
  const body = req.body as CreateStudentProfileBody;

  const profile = await usersService.createStudentProfile(
    params.id,
    body,
    requester,
  );

  res.status(201).json(profile);
};

export const createTeacherProfile: RequestHandler = async (req, res) => {
  const requester = requireUser(req);

  const params = req.params as unknown as UserIdParams;
  const body = req.body as CreateTeacherProfileBody;

  const profile = await usersService.createTeacherProfile(
    params.id,
    body,
    requester,
  );

  res.status(201).json(profile);
};
