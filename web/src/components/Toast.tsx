import { useEffect, type ReactElement } from 'react';
import { type Toast as ToastType, useToastStore } from '@/store/toast-store';
import './Toast.css';

interface ToastProps {
  toast: ToastType;
}

export const Toast = ({ toast }: ToastProps): ReactElement => {
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    if (toast.duration <= 0) {
      return;
    }

    const handle = window.setTimeout(() => {
      dismiss(toast.id);
    }, toast.duration);

    return () => {
      window.clearTimeout(handle);
    };
  }, [toast.id, toast.duration, dismiss]);

  // Accessibility: error = assertive, others = polite
  const role = toast.variant === 'error' ? 'alert' : 'status';
  const ariaLive = toast.variant === 'error' ? 'assertive' : 'polite';

  return (
    <div
      className={`toast toast--${toast.variant}`}
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
    >
      <span className="toast__message">{toast.message}</span>

      <button
        type="button"
        className="toast__dismiss"
        aria-label="Dismiss notification"
        onClick={() => dismiss(toast.id)}
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
};