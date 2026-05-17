import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  fallback?: (error: Error, reset: () => void) => ReactNode;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level error boundary.
 * Catches render-time errors that escape route-level errorElement handling.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  private readonly reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;

    // ─── Error state ─────────────────────────────────────────────
    if (error !== null) {
      const { fallback } = this.props;

      if (fallback !== undefined) {
        return fallback(error, this.reset);
      }

      return (
        <div
          role="alert"
          style={{
            padding: 'var(--space-8)',
            maxWidth: '32rem',
            margin: '4rem auto',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-bg-elevated)',
          }}
        >
          <h1 style={{ marginBottom: 'var(--space-3)' }}>
            Something went wrong
          </h1>

          <p
            style={{
              color: 'var(--color-fg-muted)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {error.message}
          </p>

          <button
            type="button"
            onClick={this.reset}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-accent)',
              color: 'var(--color-accent-fg)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    // ─── Normal render ──────────────────────────────────────────
    return this.props.children;
  }
}