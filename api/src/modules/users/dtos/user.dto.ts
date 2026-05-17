import { z } from 'zod';
import { Gender, RoleName } from '../../../shared/enums.js';
import { paginationQuerySchema } from '../../../shared/utils/pagination.js';

const emailSchema = z
  .string()
  .trim()
  .email('Invalid email')
  .max(254)
  .toLowerCase();

const passwordSchema = z
  .string()
  .min(8, 'Password ≥8 chars')
  .max(128);

const phoneSchema = z.string().trim().max(32);

const nameSchema = z.string().trim().min(1).max(100);

// ─────────────────────────────────────────────
// Create user (admin)
// ─────────────────────────────────────────────
export const createUserBodySchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    firstName: nameSchema,
    lastName: nameSchema,
    phone: phoneSchema.optional(),
    isActive: z.boolean().optional(),
    roles: z
      .array(z.nativeEnum(RoleName))
      .min(1, 'At least one role required')
      .max(5),
  })
  .strict();

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

// ─────────────────────────────────────────────
// Update user (admin or self subset)
// ─────────────────────────────────────────────
export const updateUserBodySchema = z
  .object({
    email: emailSchema.optional(),
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),
    phone: phoneSchema.nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;

// ─────────────────────────────────────────────
// List query string
// ─────────────────────────────────────────────
export const listUsersQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).max(100).optional(),
  role: z.nativeEnum(RoleName).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  sortBy: z
    .enum(['firstName', 'lastName', 'email', 'createdAt', 'lastLoginAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

// ─────────────────────────────────────────────
// Path params
// ─────────────────────────────────────────────
export const userIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type UserIdParams = z.infer<typeof userIdParamsSchema>;

export const roleParamsSchema = z.object({
  id: z.string().uuid(),
  roleName: z.nativeEnum(RoleName),
});

export type RoleParams = z.infer<typeof roleParamsSchema>;

// ─────────────────────────────────────────────
// Change password
// ─────────────────────────────────────────────
export const changePasswordBodySchema = z
  .object({
    currentPassword: z.string().min(1).max(128).optional(),
    newPassword: passwordSchema,
  })
  .strict();

export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>;

// ─────────────────────────────────────────────
// Role mutation body
// ─────────────────────────────────────────────
export const roleBodySchema = z
  .object({
    role: z.nativeEnum(RoleName),
  })
  .strict();

export type RoleBody = z.infer<typeof roleBodySchema>;

// ─────────────────────────────────────────────
// Profile creation
// ─────────────────────────────────────────────
export const createStudentProfileBodySchema = z
  .object({
    studentNumber: z.string().trim().min(1).max(32),
    dateOfBirth: z.coerce.date().optional(),
    gender: z.nativeEnum(Gender).optional(),
    enrollmentDate: z.coerce.date().optional(),
    guardianName: z.string().trim().max(200).optional(),
    guardianPhone: z.string().trim().max(32).optional(),
    guardianEmail: emailSchema.optional(),
    address: z.string().trim().max(500).optional(),
  })
  .strict();

export type CreateStudentProfileBody = z.infer<
  typeof createStudentProfileBodySchema
>;

export const createTeacherProfileBodySchema = z
  .object({
    employeeNumber: z.string().trim().min(1).max(32),
    hireDate: z.coerce.date().optional(),
    department: z.string().trim().max(100).optional(),
    qualification: z.string().trim().max(200).optional(),
  })
  .strict();

export type CreateTeacherProfileBody = z.infer<
  typeof createTeacherProfileBodySchema
>;