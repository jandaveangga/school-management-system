import { apiClient } from '@/lib/api-client';
import type { PaginatedResponse } from '@/types/api';

import {
  studentSchema,
  studentsListResponseSchema,
  type ListStudentsQuery,
  type Student,
} from './schemas';

// ────────────────────────────────────────────────────────────────
// Query serialisation
// ────────────────────────────────────────────────────────────────
const toQueryRecord = (query: ListStudentsQuery) => ({
  page: query.page,
  pageSize: query.pageSize,
  sortBy: query.sortBy,
  sortOrder: query.sortOrder,
  search: query.search,
  isActive: query.isActive,
  // Server-side: always filter to STUDENT role
  role: 'STUDENT' as const,
});

// ────────────────────────────────────────────────────────────────
// Students Service
// ────────────────────────────────────────────────────────────────
export const studentsService = {
  list: (query: ListStudentsQuery): Promise<PaginatedResponse<Student>> =>
    apiClient({
      path: '/users',
      method: 'GET',
      query: toQueryRecord(query),
      schema: studentsListResponseSchema,
    }),

  get: (id: string): Promise<Student> =>
    apiClient({
      path: `/users/${id}`,
      method: 'GET',
      schema: studentSchema,
    }),
};
