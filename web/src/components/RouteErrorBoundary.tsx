import type { ReactElement } from 'react';
import {
  Link,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router-dom';

import { ApiError, isApiError } from '@/lib/api-error';

const containerStyle: React.CSSProperties = {
  padding: 'var(--space-8)',
  maxWidth: '32rem',
  margin: '4rem auto',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  background: 'var(--color-bg-elevated)',
};

const linkStyle: React.CSSProperties = {
  display: 'inline-block',
  marginTop: 'var(--space-4)',
  padding: 'var(--space-2) var(--space-4)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-accent)',
  color: 'var(--color-accent-fg)',
  fontWeight: 'var(--font-weight-medium)',
};

interface NormalizedError {
  title: string;
  message: string;
  status: number | null;
  requestId: string | undefined;
}

const normalize = (error: unknown): NormalizedError => {
  if (isApiError(error)) {
    return {
      title: `Error ${String(error.statusCode)}`,
      message: error.message,
      status: error.statusCode,
      requestId: error.requestId,
    };
  }

  if (isRouteErrorResponse(error)) {
    return {
      title: `Error ${String(error.status)}`,
      message: error.statusText,
      status: error.status,
      requestId: undefined,
    };
  }

  if (error instanceof Error) {
    return {
      title: 'Something went wrong',
      message: error.message,
      status: null,
      requestId: undefined,
    };
  }

  return {
    title: 'Something went wrong',
    message: 'An unexpected error occurred',
    status: null,
    requestId: undefined,
  };
};

// Wired to route-level errorElement in routes/index.tsx.
// Catches loader, action, and render errors in the route tree.
export const RouteErrorBoundary = (): ReactElement => {
  const error: unknown = useRouteError();
  const normalized = normalize(error);

  return (
    <main role="alert" style={containerStyle}>
      <h1 style={{ marginBottom: 'var(--space-3)' }}>
        {normalized.title}
      </h1>

      <p
        style={{
          color: 'var(--color-fg-muted)',
          marginBottom: 'var(--space-2)',
        }}
      >
        {normalized.message}
      </p>

      {normalized.requestId !== undefined && (
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-fg-subtle)',
          }}
        >
          Request ID: <code>{normalized.requestId}</code>
        </p>
      )}

      <Link to="/" style={linkStyle}>
        Back to home
      </Link>
    </main>
  );
};

// Re-export ApiError for route wiring convenience
export { ApiError };