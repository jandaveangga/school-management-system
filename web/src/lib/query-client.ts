import { QueryClient } from '@tanstack/react-query';

import { isApiError } from './api-error';

/* ─────────────────────────────────────────────────────────────
   React Query Defaults
─────────────────────────────────────────────────────────────
   School admin app tuning:
   - 30s staleTime → prevents unnecessary refetch flicker
   - controlled retry logic → avoids retrying client errors
   - no mutation retries → avoids accidental duplicate writes
───────────────────────────────────────────────────────────── */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,

      retry: (failureCount, error) => {
        // Do not retry client-side errors (auth, validation, conflict, etc.)
        if (isApiError(error)) {
          if (error.statusCode >= 400 && error.statusCode < 500) {
            return false;
          }
        }

        return failureCount < 2;
      },

      retryDelay: (attempt) =>
        Math.min(1000 * 2 ** attempt, 8000),
    },

    mutations: {
      retry: false,
    },
  },
});