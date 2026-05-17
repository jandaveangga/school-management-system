import type { ReactElement } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastViewport } from '@/components/ToastViewport';

import { queryClient } from '@/lib/query-client';
import { router } from '@/routes';

// Provider order (outer → inner):
// 1. ErrorBoundary       — catches all runtime errors
// 2. QueryClientProvider — React Query cache + server state
// 3. AuthBootstrap       — loads/validates session before routing
// 4. RouterProvider      — handles routes + loaders
// 5. ToastViewport       — UI layer (toast portal)

export const App = (): ReactElement => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ToastViewport />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};