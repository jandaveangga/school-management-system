export {
  createUserBodySchema,
  updateUserBodySchema,
  listUsersQuerySchema,
  userIdParamsSchema,
  roleParamsSchema,
  changePasswordBodySchema,
  roleBodySchema,
  createStudentProfileBodySchema,
  createTeacherProfileBodySchema,
} from './user.dto.js';

export type {
  CreateUserBody,
  UpdateUserBody,
  ListUsersQuery,
  UserIdParams,
  RoleParams,
  ChangePasswordBody,
  RoleBody,
  CreateStudentProfileBody,
  CreateTeacherProfileBody,
} from './user.dto.js';