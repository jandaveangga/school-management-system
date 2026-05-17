import type { ReactElement } from 'react';

import { Modal } from './Modal';
import { Button } from './Button';

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */

interface ConfirmProps {
  open: boolean;

  title: string;
  description?: string;

  confirmLabel?: string;
  cancelLabel?: string;

  variant?: 'danger' | 'primary';

  isPending?: boolean;

  onConfirm: () => void;
  onCancel: () => void;
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */

// Thin wrapper around Modal for "Are you sure?" flows.
export const Confirm = ({
  open,

  title,
  description,

  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',

  variant = 'primary',
  isPending = false,

  onConfirm,
  onCancel,
}: ConfirmProps): ReactElement => {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      {...(description !== undefined && {
        description,
      })}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>

          <Button
            variant={
              variant === 'danger'
                ? 'danger'
                : 'primary'
            }
            onClick={onConfirm}
            isLoading={isPending}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {/* Body intentionally empty — header carries context.
          Use Modal children for richer content if needed. */}
      <span className="sr-only">
        {title}
      </span>
    </Modal>
  );
};