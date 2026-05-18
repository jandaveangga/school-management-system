import { z } from 'zod';
import type { PaginatedResponse } from '@/types/api';

// ────────────────────────────────────────────────────────────────
// Grade entity
// ────────────────────────────────────────────────────────────────
export const gradeRecordSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  studentNumber: z.string().nullable(),
  classId: z.string(),
  className: z.string(),
  subject: z.string(),
  period: z.string().nullable(),
  score: z.number().nullable(),
  maxScore: z.number().nullable(),
  letterGrade: z.string().nullable(),
  remarks: z.string().nullable(),
  gradedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type GradeRecord = z.infer<typeof gradeRecordSchema>;

export const gradesListResponseSchema: z.ZodType<
  PaginatedResponse<GradeRecord>
> = z.object({
  items: z.array(gradeRecordSchema),
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
export const listGradesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(['studentName', 'subject', 'score', 'gradedAt', 'createdAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().min(1).max(100).optional(),
  classId: z.string().optional(),
  subject: z.string().optional(),
  period: z.string().optional(),
});

export type ListGradesQuery = z.infer<typeof listGradesQuerySchema>;
