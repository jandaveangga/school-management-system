//
// ─────────────────────────────────────────────
// Pages
// ─────────────────────────────────────────────
//

export { UsersListPage } from './pages/UsersListPage';
export { UserNewPage } from './pages/UserNewPage';
export { UserDetailPage } from './pages/UserDetailPage';

//
// ─────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────
//

export {
  useUsersList,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useChangePassword,
  useAddRole,
  useRemoveRole,
  useCreateStudentProfile,
  useCreateTeacherProfile,
} from './hooks';

//
// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────
//

export { usersService } from './services';

//
// ─────────────────────────────────────────────
// Schemas & Types
// ─────────────────────────────────────────────
//

export {
  listUsersQuerySchema,
  createUserFormSchema,
  editUserFormSchema,
  changePasswordFormSchema,
  studentProfileFormSchema,
  teacherProfileFormSchema,
  studentProfileSchema,
  teacherProfileSchema,

  type ListUsersQuery,
  type CreateUserFormValues,
  type EditUserFormValues,
  type ChangePasswordFormValues,
  type StudentProfileFormValues,
  type TeacherProfileFormValues,
  type StudentProfile,
  type TeacherProfile,
} from './schemas';