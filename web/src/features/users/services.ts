import { z } from 'zod';

import { apiClient } from '@/lib/api-client';

import {
  publicUserSchema,
  type PublicUser,
  type RoleName,
} from '@/features/auth/schemas';

import {
  studentProfileSchema,
  teacherProfileSchema,
  usersListResponseSchema,
  type ListUsersQuery,
  type StudentProfile,
  type TeacherProfile,
} from './schemas';

import type { PaginatedResponse } from '@/types/api';

// ────────────────────────────────────────────────────────────────
// Request DTOs
// ────────────────────────────────────────────────────────────────
interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive?: boolean;
  roles: readonly RoleName[];
}

interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  isActive?: boolean;
}

interface ChangePasswordInput {
  currentPassword?: string;
  newPassword: string;
}

interface CreateStudentProfileInput {
  studentNumber: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  enrollmentDate?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  address?: string;
}

interface CreateTeacherProfileInput {
  employeeNumber: string;
  hireDate?: string;
  department?: string;
  qualification?: string;
}

// ────────────────────────────────────────────────────────────────
// Query serialization
// ────────────────────────────────────────────────────────────────
const toQueryRecord = (query: ListUsersQuery) => ({
  page: query.page,
  pageSize: query.pageSize,
  sortBy: query.sortBy,
  sortOrder: query.sortOrder,
  search: query.search,
  role: query.role,
  isActive: query.isActive,
});

// ────────────────────────────────────────────────────────────────
// Users Service
// ────────────────────────────────────────────────────────────────
export const usersService = {
  list: (query: ListUsersQuery): Promise<PaginatedResponse<PublicUser>> =>
    apiClient({
      path: '/users',
      method: 'GET',
      query: toQueryRecord(query),
      schema: usersListResponseSchema,
    }),

  get: (id: string): Promise<PublicUser> =>
    apiClient({
      path: `/users/${id}`,
      method: 'GET',
      schema: publicUserSchema,
    }),

  create: (input: CreateUserInput): Promise<PublicUser> =>
    apiClient({
      path: '/users',
      method: 'POST',
      body: input,
      schema: publicUserSchema,
    }),

  update: (id: string, input: UpdateUserInput): Promise<PublicUser> =>
    apiClient({
      path: `/users/${id}`,
      method: 'PATCH',
      body: input,
      schema: publicUserSchema,
    }),

  remove: (id: string): Promise<void> =>
    apiClient({
      path: `/users/${id}`,
      method: 'DELETE',
      schema: z.void(),
    }),

  changePassword: (id: string, input: ChangePasswordInput): Promise<void> =>
    apiClient({
      path: `/users/${id}/change-password`,
      method: 'POST',
      body: input,
      schema: z.void(),
    }),

  addRole: (id: string, role: RoleName): Promise<PublicUser> =>
    apiClient({
      path: `/users/${id}/roles`,
      method: 'POST',
      body: { role },
      schema: publicUserSchema,
    }),

  removeRole: (id: string, role: RoleName): Promise<PublicUser> =>
    apiClient({
      path: `/users/${id}/roles/${role}`,
      method: 'DELETE',
      schema: publicUserSchema,
    }),

  createStudentProfile: (
    id: string,
    input: CreateStudentProfileInput,
  ): Promise<StudentProfile> =>
    apiClient({
      path: `/users/${id}/student-profile`,
      method: 'POST',
      body: input,
      schema: studentProfileSchema,
    }),

  createTeacherProfile: (
    id: string,
    input: CreateTeacherProfileInput,
  ): Promise<TeacherProfile> =>
    apiClient({
      path: `/users/${id}/teacher-profile`,
      method: 'POST',
      body: input,
      schema: teacherProfileSchema,
    }),
};