import { z } from 'zod';
import type { PaginatedResponse } from '@/types/api';

// ────────────────────────────────────────────────────────────────
// Class entity
// ────────────────────────────────────────────────────────────────
export const classSchema = z.object({
  id: z.string(),
  name: z.string(),
  section: z.string().nullable(),
  gradeLevel: z.string().nullable(),
  academicYear: z.string(),
  teacherId: z.string().nullable(),
  teacherName: z.string().nullable(),
  studentCount: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Class = z.infer<typeof classSchema>;

export const classesListResponseSchema: z.ZodType<
  PaginatedResponse<Class>
> = z.object({
  items: z.array(classSchema),
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
  totalCount: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});

// ────────────────────────────────────────────────────────────────
// List query
// ────────────────────────────────────────────────────────────────
export const listClassesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'academicYear', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().min(1).max(100).optional(),
  academicYear: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

export type ListClassesQuery = z.infer<typeof listClassesQuerySchema>;
