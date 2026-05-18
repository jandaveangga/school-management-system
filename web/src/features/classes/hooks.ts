import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ApiError } from '@/lib/api-error';
import type { PaginatedResponse } from '@/types/api';

import { classesService } from './services';
import type { ListClassesQuery, Class } from './schemas';

export const classesKeys = {
  all: ['classes'] as const,
  lists: () => [...classesKeys.all, 'list'] as const,
  list: (q: Readonly<Record<string, unknown>>) =>
    [...classesKeys.lists(), q] as const,
  details: () => [...classesKeys.all, 'detail'] as const,
  detail: (id: string) => [...classesKeys.details(), id] as const,
};

export const useClassesList = (
  query: ListClassesQuery,
): UseQueryResult<PaginatedResponse<Class>, ApiError> =>
  useQuery({
    queryKey: classesKeys.list(query),
    queryFn: () => classesService.list(query),
    placeholderData: (prev) => prev,
    retry: false, // backend may not exist yet
  });
