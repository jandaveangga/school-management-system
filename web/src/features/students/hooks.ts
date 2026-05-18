import {
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query';

import type { ApiError } from '@/lib/api-error';
import type { PaginatedResponse } from '@/types/api';

import { studentsService } from './services';
import type { ListStudentsQuery, Student } from './schemas';

// ─── Query keys ────────────────────────────────────────────────
export const studentsKeys = {
  all: ['students'] as const,
  lists: () => [...studentsKeys.all, 'list'] as const,
  list: (query: Readonly<Record<string, unknown>>) =>
    [...studentsKeys.lists(), query] as const,
  details: () => [...studentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentsKeys.details(), id] as const,
};

// ─── List ───────────────────────────────────────────────────────
export const useStudentsList = (
  query: ListStudentsQuery,
): UseQueryResult<PaginatedResponse<Student>, ApiError> =>
  useQuery({
    queryKey: studentsKeys.list(query),
    queryFn: () => studentsService.list(query),
    placeholderData: (prev) => prev,
  });

// ─── Single ─────────────────────────────────────────────────────
export const useStudent = (
  id: string | undefined,
): UseQueryResult<Student, ApiError> =>
  useQuery({
    queryKey:
      id !== undefined
        ? studentsKeys.detail(id)
        : ['students', 'detail', 'noop'],
    queryFn: () => studentsService.get(id ?? ''),
    enabled: id !== undefined && id.length > 0,
  });
