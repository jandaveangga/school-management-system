import { apiClient } from '@/lib/api-client';
import type { PaginatedResponse } from '@/types/api';

import {
  attendanceRecordSchema,
  attendanceListResponseSchema,
  type ListAttendanceQuery,
  type AttendanceRecord,
} from './schemas';

const toQueryRecord = (query: ListAttendanceQuery) => ({
  page: query.page,
  pageSize: query.pageSize,
  sortBy: query.sortBy,
  sortOrder: query.sortOrder,
  search: query.search,
  classId: query.classId,
  status: query.status,
  dateFrom: query.dateFrom,
  dateTo: query.dateTo,
});

export const attendanceService = {
  list: (query: ListAttendanceQuery): Promise<PaginatedResponse<AttendanceRecord>> =>
    apiClient({
      path: '/attendance',
      method: 'GET',
      query: toQueryRecord(query),
      schema: attendanceListResponseSchema,
    }),

  get: (id: string): Promise<AttendanceRecord> =>
    apiClient({
      path: `/attendance/${id}`,
      method: 'GET',
      schema: attendanceRecordSchema,
    }),
};
