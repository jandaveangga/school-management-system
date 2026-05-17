import {
  useState,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type Ref,
} from 'react';
import { Input } from './Input';
import './PasswordInput.css';

interface PasswordInputProps
  extends Omit<ComponentPropsWithoutRef<'input'>, 'type'> {
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
}

/* ─── Icons ───────────────────────────────────────────── */

const EyeIcon = (): ReactElement => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = (): ReactElement => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

/* ─── Component ───────────────────────────────────────── */

export const PasswordInput = ({
  className,
  invalid = false,
  ref,
  ...rest
}: PasswordInputProps): ReactElement => {
  const [visible, setVisible] = useState(false);

  const inputClass = ['password-input__input'];
  if (className) inputClass.push(className);

  return (
    <div className="password-input">
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        invalid={invalid}
        className={inputClass.join(' ')}
        {...rest}
      />

      <button
        type="button"
        className="password-input__toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
};