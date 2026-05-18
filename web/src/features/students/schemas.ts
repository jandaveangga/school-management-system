import { z } from 'zod';

import { publicUserSchema } from '@/features/auth/schemas';
import type { PaginatedResponse } from '@/types/api';

// ────────────────────────────────────────────────────────────────
// Inline student-profile shape (mirrors api StudentProfile model).
// Kept local so we don't create a circular dep through auth/schemas.
// ────────────────────────────────────────────────────────────────
const studentProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  studentNumber: z.string(),
  dateOfBirth: z.coerce.date().nullable(),
  gender: z
    .enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'])
    .nullable(),
  enrollmentDate: z.coerce.date(),
  guardianName: z.string().nullable(),
  guardianPhone: z.string().nullable(),
  guardianEmail: z.string().nullable(),
  address: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type StudentProfile = z.infer<typeof studentProfileSchema>;

// ────────────────────────────────────────────────────────────────
// Student = PublicUser + optional embedded profile
// ────────────────────────────────────────────────────────────────
export const studentSchema = publicUserSchema.extend({
  studentProfile: studentProfileSchema.nullable().optional(),
});

export type Student = z.infer<typeof studentSchema>;

export const studentsListResponseSchema: z.ZodType<
  PaginatedResponse<Student>
> = z.object({
  items: z.array(studentSchema),
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
export const listStudentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(['firstName', 'lastName', 'email', 'createdAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().min(1).max(100).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

export type ListStudentsQuery = z.infer<typeof listStudentsQuerySchema>;
