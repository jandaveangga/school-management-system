import { z } from 'zod';
import type { PaginatedResponse } from '@/types/api';

import {
  publicUserSchema,
  roleNameSchema,
  type PublicUser,
} from '@/features/auth/schemas';

// ────────────────────────────────────────────────────────────────
// Reusable field schemas
// ────────────────────────────────────────────────────────────────
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email')
  .max(254)
  .toLowerCase();

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128);

const nameSchema = (label: string): z.ZodString =>
  z.string().trim().min(1, `${label} is required`).max(100);

// ────────────────────────────────────────────────────────────────
// Server response shapes
// ────────────────────────────────────────────────────────────────
export const usersListResponseSchema: z.ZodType<PaginatedResponse<PublicUser>> = z.object({
  items: z.array(publicUserSchema),
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
  totalCount: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});

// ────────────────────────────────────────────────────────────────
// Student / Teacher profiles
// ────────────────────────────────────────────────────────────────
export const studentProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  studentNumber: z.string(),
  dateOfBirth: z.coerce.date().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).nullable(),
  enrollmentDate: z.coerce.date(),
  guardianName: z.string().nullable(),
  guardianPhone: z.string().nullable(),
  guardianEmail: z.string().nullable(),
  address: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type StudentProfile = z.infer<typeof studentProfileSchema>;

export const teacherProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  employeeNumber: z.string(),
  hireDate: z.coerce.date(),
  department: z.string().nullable(),
  qualification: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type TeacherProfile = z.infer<typeof teacherProfileSchema>;

// ────────────────────────────────────────────────────────────────
// Users list query (URL params)
// ────────────────────────────────────────────────────────────────
export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(['firstName', 'lastName', 'email', 'createdAt', 'lastLoginAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().min(1).max(100).optional(),
  role: roleNameSchema.optional(),
  isActive: z.enum(['true', 'false']).optional(),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

// ────────────────────────────────────────────────────────────────
// Create user form
// ────────────────────────────────────────────────────────────────
export const createUserFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema('First name'),
  lastName: nameSchema('Last name'),
  phone: z.string().trim().max(32).optional(),
  isActive: z.boolean(),
  roles: z.array(roleNameSchema).min(1, 'Select at least one role').max(5),
});
export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;

// ────────────────────────────────────────────────────────────────
// Edit user form
// ────────────────────────────────────────────────────────────────
export const editUserFormSchema = z.object({
  email: emailSchema.optional(),
  firstName: nameSchema('First name').optional(),
  lastName: nameSchema('Last name').optional(),
  phone: z.string().trim().max(32).nullable().optional(),
  isActive: z.boolean().optional(),
});
export type EditUserFormValues = z.infer<typeof editUserFormSchema>;

// ────────────────────────────────────────────────────────────────
// Change password
// ────────────────────────────────────────────────────────────────
export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().max(128).optional(),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Please confirm the new password'),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

// ────────────────────────────────────────────────────────────────
// Profile forms
// ────────────────────────────────────────────────────────────────
export const studentProfileFormSchema = z.object({
  studentNumber: z.string().trim().min(1, 'Student number is required').max(32),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  enrollmentDate: z.string().optional(),
  guardianName: z.string().trim().max(200).optional(),
  guardianPhone: z.string().trim().max(32).optional(),
  guardianEmail: z.string().email().max(254).optional().or(z.literal('')),
  address: z.string().trim().max(500).optional(),
});
export type StudentProfileFormValues = z.infer<typeof studentProfileFormSchema>;

export const teacherProfileFormSchema = z.object({
  employeeNumber: z.string().trim().min(1, 'Employee number is required').max(32),
  hireDate: z.string().optional(),
  department: z.string().trim().max(100).optional(),
  qualification: z.string().trim().max(200).optional(),
});
export type TeacherProfileFormValues = z.infer<typeof teacherProfileFormSchema>;

// Re-export auth types
export { roleNameSchema, type RoleName, type PublicUser } from '@/features/auth/schemas';
