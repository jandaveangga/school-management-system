import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ApiError } from '@/lib/api-error';
import type { PaginatedResponse } from '@/types/api';

import { gradesService } from './services';
import type { ListGradesQuery, GradeRecord } from './schemas';

export const gradesKeys = {
  all: ['grades'] as const,
  lists: () => [...gradesKeys.all, 'list'] as const,
  list: (q: Readonly<Record<string, unknown>>) =>
    [...gradesKeys.lists(), q] as const,
  details: () => [...gradesKeys.all, 'detail'] as const,
  detail: (id: string) => [...gradesKeys.details(), id] as const,
};

export const useGradesList = (
  query: ListGradesQuery,
): UseQueryResult<PaginatedResponse<GradeRecord>, ApiError> =>
  useQuery({
    queryKey: gradesKeys.list(query),
    queryFn: () => gradesService.list(query),
    placeholderData: (prev) => prev,
    retry: false,
  });
