import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ApiError } from '@/lib/api-error';
import type { PaginatedResponse } from '@/types/api';

import { teachersService } from './services';
import type { ListTeachersQuery, Teacher } from './schemas';

export const teachersKeys = {
  all: ['teachers'] as const,
  lists: () => [...teachersKeys.all, 'list'] as const,
  list: (q: Readonly<Record<string, unknown>>) =>
    [...teachersKeys.lists(), q] as const,
  details: () => [...teachersKeys.all, 'detail'] as const,
  detail: (id: string) => [...teachersKeys.details(), id] as const,
};

export const useTeachersList = (
  query: ListTeachersQuery,
): UseQueryResult<PaginatedResponse<Teacher>, ApiError> =>
  useQuery({
    queryKey: teachersKeys.list(query),
    queryFn: () => teachersService.list(query),
    placeholderData: (prev) => prev,
  });

export const useTeacher = (
  id: string | undefined,
): UseQueryResult<Teacher, ApiError> =>
  useQuery({
    queryKey:
      id !== undefined
        ? teachersKeys.detail(id)
        : ['teachers', 'detail', 'noop'],
    queryFn: () => teachersService.get(id ?? ''),
    enabled: id !== undefined && id.length > 0,
  });
