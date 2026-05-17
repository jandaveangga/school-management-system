import type { ReactElement } from 'react';
import './Spinner.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const Spinner = ({
  size = 'md',
  label = 'Loading',
}: SpinnerProps): ReactElement => {
  return (
    <div
      className={`spinner spinner--${size}`}
      role="status"
      aria-live="polite"
    >
      <span className="spinner__circle" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
};