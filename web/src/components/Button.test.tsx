import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(
      <Button>
        Click me
      </Button>,
    );

    expect(
      screen.getByRole('button', {
        name: 'Click me',
      }),
    ).toBeInTheDocument();
  });

  it('defaults to type="button"', () => {
    render(<Button>x</Button>);

    expect(
      screen.getByRole('button'),
    ).toHaveAttribute('type', 'button');
  });

  it('respects explicit type="submit"', () => {
    render(
      <Button type="submit">
        x
      </Button>,
    );

    expect(
      screen.getByRole('button'),
    ).toHaveAttribute('type', 'submit');
  });

  it('fires onClick when not loading', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button onClick={onClick}>
        Click
      </Button>,
    );

    await user.click(
      screen.getByRole('button'),
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it(
    'does not fire onClick while loading ' +
      '(button is disabled)',
    async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(
        <Button
          onClick={onClick}
          isLoading
          loadingText="Saving…"
        >
          Save
        </Button>,
      );

      const button = screen.getByRole(
        'button',
      );

      expect(button).toBeDisabled();

      expect(button).toHaveAttribute(
        'aria-busy',
        'true',
      );

      expect(button).toHaveTextContent(
        'Saving…',
      );

      await user.click(button);

      expect(onClick).not.toHaveBeenCalled();
    },
  );

  it('respects explicit disabled prop', () => {
    render(
      <Button disabled>
        x
      </Button>,
    );

    expect(
      screen.getByRole('button'),
    ).toBeDisabled();
  });
});