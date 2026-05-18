import { apiClient } from '@/lib/api-client';
import type { PaginatedResponse } from '@/types/api';

import {
  teacherSchema,
  teachersListResponseSchema,
  type ListTeachersQuery,
  type Teacher,
} from './schemas';

const toQueryRecord = (query: ListTeachersQuery) => ({
  page: query.page,
  pageSize: query.pageSize,
  sortBy: query.sortBy,
  sortOrder: query.sortOrder,
  search: query.search,
  isActive: query.isActive,
  role: 'TEACHER' as const,
});

export const teachersService = {
  list: (query: ListTeachersQuery): Promise<PaginatedResponse<Teacher>> =>
    apiClient({
      path: '/users',
      method: 'GET',
      query: toQueryRecord(query),
      schema: teachersListResponseSchema,
    }),

  get: (id: string): Promise<Teacher> =>
    apiClient({
      path: `/users/${id}`,
      method: 'GET',
      schema: teacherSchema,
    }),
};
