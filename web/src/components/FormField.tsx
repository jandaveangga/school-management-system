import type { ReactElement, ReactNode } from 'react';
import './FormField.css';

interface FormFieldProps {
  // Label text. Always required for accessibility — no unlabeled inputs.
  label: string;

  // Must match the `id` on the inner control.
  htmlFor: string;

  // Validation error message. When set, it's announced to screen readers
  // and the field gets a red state.
  error?: string;

  // Optional helper / hint text shown below the input.
  hint?: string;

  required?: boolean;

  children: ReactNode;
}

export const FormField = ({ 
  label,
  htmlFor,
  error,
  hint,
  required = false,
  children,
}: FormFieldProps): ReactElement => {
  const errorId = error !== undefined ? `${htmlFor}-error` : undefined;
  const hintId =
    hint !== undefined && error === undefined
      ? `${htmlFor}-hint`
      : undefined;

  const classes: string[] = ['form-field'];

  if (error !== undefined) {
    classes.push('form-field--error');
  }

  return (
    <div className={classes.join(' ')}>
      {/* Label */}
      <label htmlFor={htmlFor} className="form-field__label">
        {label}

        {required && (
          <span className="form-field__required" aria-hidden="true">
            {' *'}
          </span>
        )}

        {required && <span className="sr-only"> (required)</span>}
      </label>

      {/* Field */}
      {children}

      {/* Hint */}
      {hintId !== undefined && hint !== undefined && (
        <p id={hintId} className="form-field__hint">
          {hint}
        </p>
      )}

      {/* Error */}
      {errorId !== undefined && error !== undefined && (
        <p id={errorId} className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};