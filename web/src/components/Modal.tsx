import {
  useEffect,
  useId,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;

  // Click outside the dialog closes it. Default true.
  dismissOnBackdrop?: boolean;

  // Pressing Escape closes it. Default true.
  dismissOnEscape?: boolean;

  size?: 'sm' | 'md' | 'lg';
}

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  size = 'md',
}: ModalProps): ReactElement | null => {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Escape closes
  useEffect(() => {
    if (!open || !dismissOnEscape) return;

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, dismissOnEscape]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Initial focus — first focusable element inside modal
  useEffect(() => {
    if (!open || dialogRef.current === null) return;

    const focusable =
      dialogRef.current.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

    focusable?.focus();
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={() => {
        if (dismissOnBackdrop) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__header">
          <div>
            <h2 id={titleId} className="modal__title">
              {title}
            </h2>

            {description && (
              <p id={descriptionId} className="modal__description">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            className="modal__close"
            aria-label="Close dialog"
            onClick={onClose}
          >
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="modal__body">{children}</div>

        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
};