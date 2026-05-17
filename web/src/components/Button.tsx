import type {
  ComponentPropsWithoutRef,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';

import './Button.css';

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */

type Variant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'ghost';

type Size = 'sm' | 'md' | 'lg';

interface ButtonProps
  extends ComponentPropsWithoutRef<'button'> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;

  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */

export const Button = ({
  variant = 'primary',
  size = 'md',

  isLoading = false,
  loadingText,

  fullWidth = false,

  className,
  disabled,
  type = 'button',
  ref,

  children,

  ...rest
}: ButtonProps): ReactElement => {
  const classes: string[] = [
    'button',
    `button--${variant}`,
    `button--${size}`,
  ];

  if (fullWidth) {
    classes.push('button--full');
  }

  if (isLoading) {
    classes.push('button--loading');
  }

  if (className !== undefined) {
    classes.push(className);
  }

  const isDisabled =
    disabled === true || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      className={classes.join(' ')}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading && (
        <span
          className="button__spinner"
          aria-hidden="true"
        />
      )}

      <span className="button__label">
        {isLoading
          ? loadingText ?? children
          : children}
      </span>
    </button>
  );
};