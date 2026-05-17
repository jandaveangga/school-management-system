import type { ComponentPropsWithoutRef, ReactElement, Ref } from 'react';
import './Input.css';

interface InputProps extends ComponentPropsWithoutRef<'input'> {
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export const Input = ({
  className,
  invalid = false,
  ref,
  ...rest
}: InputProps): ReactElement => {
  const classes: string[] = ['input'];

  if (invalid) {
    classes.push('input--invalid');
  }

  if (className !== undefined) {
    classes.push(className);
  }

  return (
    <input
      ref={ref}
      className={classes.join(' ')}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
};