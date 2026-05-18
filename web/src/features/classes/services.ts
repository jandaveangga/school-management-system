import { apiClient } from '@/lib/api-client';
import type { PaginatedResponse } from '@/types/api';

import {
  classSchema,
  classesListResponseSchema,
  type ListClassesQuery,
  type Class,
} from './schemas';

const toQueryRecord = (query: ListClassesQuery) => ({
  page: query.page,
  pageSize: query.pageSize,
  sortBy: query.sortBy,
  sortOrder: query.sortOrder,
  search: query.search,
  academicYear: query.academicYear,
  isActive: query.isActive,
});

export const classesService = {
  list: (query: ListClassesQuery): Promise<PaginatedResponse<Class>> =>
    apiClient({
      path: '/classes',
      method: 'GET',
      query: toQueryRecord(query),
      schema: classesListResponseSchema,
    }),

  get: (id: string): Promise<Class> =>
    apiClient({
      path: `/classes/${id}`,
      method: 'GET',
      schema: classSchema,
    }),
};
