import { useEffect, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { useToastStore } from '@/store/toast-store';
import { Toast } from './Toast';

const VIEWPORT_ID = 'toast-viewport';

const ensureRoot = (): HTMLElement | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  let root = document.getElementById(VIEWPORT_ID);

  if (root === null) {
    root = document.createElement('div');
    root.id = VIEWPORT_ID;

    root.setAttribute('aria-label', 'Notifications');
    root.setAttribute('role', 'region');

    Object.assign(root.style, {
      position: 'fixed',
      top: 'var(--space-4, 1rem)',
      right: 'var(--space-4, 1rem)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2, 0.5rem)',
      zIndex: 'var(--z-toast, 3000)',
      pointerEvents: 'none',
    });

    document.body.appendChild(root);
  }

  return root;
};

export const ToastViewport = (): ReactElement | null => {
  const toasts = useToastStore((s) => s.toasts);
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setRoot(ensureRoot());
  }, []);

  if (root === null) {
    return null;
  }

  return createPortal(
    <>
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} />
      ))}
    </>,
    root,
  );
};