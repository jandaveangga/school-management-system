 // Cross-cutting API types shared by all features

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Backend error response shape
// Matches: api/src/shared/middleware/error-handler.ts
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    requestId: string;
    details?: unknown;
    stack?: string;
  };
}

// Standard sorting direction used across list endpoints
export type SortOrder = 'asc' | 'desc';