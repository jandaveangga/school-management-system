import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ApiError } from '@/lib/api-error';
import type { PaginatedResponse } from '@/types/api';

import { attendanceService } from './services';
import type { ListAttendanceQuery, AttendanceRecord } from './schemas';

export const attendanceKeys = {
  all: ['attendance'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (q: Readonly<Record<string, unknown>>) =>
    [...attendanceKeys.lists(), q] as const,
  details: () => [...attendanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...attendanceKeys.details(), id] as const,
};

export const useAttendanceList = (
  query: ListAttendanceQuery,
): UseQueryResult<PaginatedResponse<AttendanceRecord>, ApiError> =>
  useQuery({
    queryKey: attendanceKeys.list(query),
    queryFn: () => attendanceService.list(query),
    placeholderData: (prev) => prev,
    retry: false,
  });
