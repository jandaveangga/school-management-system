import { z } from 'zod';

// Reusable across modules. Cap pageSize at 100 to bound memory + DB load.
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationParams = z.infer<typeof paginationQuerySchema>;

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const paginationToSkipTake = (
  params: PaginationParams
): { skip: number; take: number } => ({
  skip: (params.page - 1) * params.pageSize,
  take: params.pageSize,
});

export const buildPaginatedResult = <T>(
  items: T[],
  totalCount: number,
  params: PaginationParams
): PaginatedResult<T> => {
  const totalPages =
    totalCount === 0 ? 0 : Math.ceil(totalCount / params.pageSize);

  return {
    items,
    page: params.page,
    pageSize: params.pageSize,
    totalCount,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPrevPage: params.page > 1 && totalCount > 0,
  };
};