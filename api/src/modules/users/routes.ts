import { Router } from 'express';

import { validate } from '../../shared/middleware/validate.js';
import { requireAuth } from '../auth/middleware.js';

import * as controller from './controller.js';

import {
  changePasswordBodySchema,
  createStudentProfileBodySchema,
  createTeacherProfileBodySchema,
  createUserBodySchema,
  listUsersQuerySchema,
  roleBodySchema,
  roleParamsSchema,
  updateUserBodySchema,
  userIdParamsSchema,
} from './dtos/index.js';

export const usersRouter = Router();

// All endpoints require authentication.
// Fine-grained role checks live in the service layer
// (admin-only, admin-or-self, etc.) where requester context is available.
usersRouter.use(requireAuth);

// ─────────────────────────────────────────────
// Collection routes
// ─────────────────────────────────────────────
usersRouter.get(
  '/',
  validate({ query: listUsersQuerySchema }),
  controller.list,
);

usersRouter.post(
  '/',
  validate({ body: createUserBodySchema }),
  controller.create,
);

// ─────────────────────────────────────────────
// Single resource routes
// ─────────────────────────────────────────────
usersRouter.get(
  '/:id',
  validate({ params: userIdParamsSchema }),
  controller.get,
);

usersRouter.patch(
  '/:id',
  validate({
    params: userIdParamsSchema,
    body: updateUserBodySchema,
  }),
  controller.update,
);

usersRouter.delete(
  '/:id',
  validate({ params: userIdParamsSchema }),
  controller.remove,
);

// ─────────────────────────────────────────────
// Password management
// ─────────────────────────────────────────────
usersRouter.post(
  '/:id/change-password',
  validate({
    params: userIdParamsSchema,
    body: changePasswordBodySchema,
  }),
  controller.changePassword,
);

// ─────────────────────────────────────────────
// Role management
// ─────────────────────────────────────────────
usersRouter.post(
  '/:id/roles',
  validate({
    params: userIdParamsSchema,
    body: roleBodySchema,
  }),
  controller.addRole,
);

usersRouter.delete(
  '/:id/roles/:roleName',
  validate({ params: roleParamsSchema }),
  controller.removeRole,
);

// ─────────────────────────────────────────────
// Profile management (1:1 with User)
// ─────────────────────────────────────────────
usersRouter.post(
  '/:id/student-profile',
  validate({
    params: userIdParamsSchema,
    body: createStudentProfileBodySchema,
  }),
  controller.createStudentProfile,
);

usersRouter.post(
  '/:id/teacher-profile',
  validate({
    params: userIdParamsSchema,
    body: createTeacherProfileBodySchema,
  }),
  controller.createTeacherProfile,
);