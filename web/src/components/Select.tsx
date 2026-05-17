import type {
  ComponentPropsWithoutRef,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';

import './Select.css';

interface SelectProps extends ComponentPropsWithoutRef<'select'> {
  invalid?: boolean;
  ref?: Ref<HTMLSelectElement>;
  children: ReactNode;
}

// Accessible native select with custom styling + caret icon
export const Select = ({
  className,
  invalid = false,
  ref,
  children,
  ...rest
}: SelectProps): ReactElement => {
  const classes: string[] = ['select'];

  if (invalid) {
    classes.push('select--invalid');
  }

  if (className !== undefined) {
    classes.push(className);
  }

  return (
    <div className="select-wrapper">
      <select
        ref={ref}
        className={classes.join(' ')}
        aria-invalid={invalid || undefined}
        {...rest}
      >
        {children}
      </select>

      <svg
        className="select-wrapper__caret"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
};