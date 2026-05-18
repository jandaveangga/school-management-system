import { z } from 'zod';

import { publicUserSchema } from '@/features/auth/schemas';
import type { PaginatedResponse } from '@/types/api';

// ────────────────────────────────────────────────────────────────
// Inline teacher-profile shape
// ────────────────────────────────────────────────────────────────
const teacherProfileSchema = z.object({
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
// Teacher = PublicUser + optional embedded profile
// ────────────────────────────────────────────────────────────────
export const teacherSchema = publicUserSchema.extend({
  teacherProfile: teacherProfileSchema.nullable().optional(),
});

export type Teacher = z.infer<typeof teacherSchema>;

export const teachersListResponseSchema: z.ZodType<
  PaginatedResponse<Teacher>
> = z.object({
  items: z.array(teacherSchema),
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
  totalCount: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});

// ────────────────────────────────────────────────────────────────
// List query (URL params)
// ────────────────────────────────────────────────────────────────
export const listTeachersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(['firstName', 'lastName', 'email', 'createdAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().min(1).max(100).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

export type ListTeachersQuery = z.infer<typeof listTeachersQuerySchema>;
