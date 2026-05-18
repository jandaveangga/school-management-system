import { z } from 'zod';
import type { PaginatedResponse } from '@/types/api';

// ────────────────────────────────────────────────────────────────
// Attendance record entity
// ────────────────────────────────────────────────────────────────
export const attendanceStatusSchema = z.enum([
  'PRESENT',
  'ABSENT',
  'LATE',
  'EXCUSED',
]);
export type AttendanceStatus = z.infer<typeof attendanceStatusSchema>;

export const attendanceRecordSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  studentNumber: z.string().nullable(),
  classId: z.string(),
  className: z.string(),
  date: z.coerce.date(),
  status: attendanceStatusSchema,
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;

export const attendanceListResponseSchema: z.ZodType<
  PaginatedResponse<AttendanceRecord>
> = z.object({
  items: z.array(attendanceRecordSchema),
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
export const listAttendanceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['date', 'studentName', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().min(1).max(100).optional(),
  classId: z.string().optional(),
  status: attendanceStatusSchema.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type ListAttendanceQuery = z.infer<typeof listAttendanceQuerySchema>;
