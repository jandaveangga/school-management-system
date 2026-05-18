import { apiClient } from '@/lib/api-client';
import type { PaginatedResponse } from '@/types/api';

import {
  gradeRecordSchema,
  gradesListResponseSchema,
  type ListGradesQuery,
  type GradeRecord,
} from './schemas';

const toQueryRecord = (query: ListGradesQuery) => ({
  page: query.page,
  pageSize: query.pageSize,
  sortBy: query.sortBy,
  sortOrder: query.sortOrder,
  search: query.search,
  classId: query.classId,
  subject: query.subject,
  period: query.period,
});

export const gradesService = {
  list: (query: ListGradesQuery): Promise<PaginatedResponse<GradeRecord>> =>
    apiClient({
      path: '/grades',
      method: 'GET',
      query: toQueryRecord(query),
      schema: gradesListResponseSchema,
    }),

  get: (id: string): Promise<GradeRecord> =>
    apiClient({
      path: `/grades/${id}`,
      method: 'GET',
      schema: gradeRecordSchema,
    }),
};
