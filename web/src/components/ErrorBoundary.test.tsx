import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

const Boom = (): ReactElement => {
  throw new Error('boom!');
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Silence React error logs during tests
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>safe content</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('safe content')).toBeInTheDocument();
  });

  it('renders default fallback on render error', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('boom!')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /try again/i }),
    ).toBeInTheDocument();
  });

  it('uses a custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={(err) => <p>custom: {err.message}</p>}>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByText('custom: boom!')).toBeInTheDocument();
  });

  it('reset clears the error and re-attempts render', async () => {
    const user = userEvent.setup();

    let shouldThrow = true;

    const Toggle = (): ReactElement => {
      if (shouldThrow) {
        throw new Error('first');
      }
      return <p>recovered</p>;
    };

    render(
      <ErrorBoundary>
        <Toggle />
      </ErrorBoundary>,
    );

    expect(screen.getByText('first')).toBeInTheDocument();

    shouldThrow = false;

    await user.click(
      screen.getByRole('button', { name: /try again/i }),
    );

    expect(screen.getByText('recovered')).toBeInTheDocument();
  });
});