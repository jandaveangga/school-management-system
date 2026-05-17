import { create } from 'zustand';

export type ToastVariant =
  | 'success'
  | 'error'
  | 'info'
  | 'warning';

export interface Toast {
  id: string;
  variant: ToastVariant;
  message: string;
  duration: number;
}

interface PushInput {
  variant: ToastVariant;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  push: (input: PushInput) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

/* ─────────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────────────── */

const DEFAULT_DURATION = 4000;

/* ─────────────────────────────────────────────────────────────
   ID GENERATION
───────────────────────────────────────────────────────────── */

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `toast-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};

/* ─────────────────────────────────────────────────────────────
   STORE
───────────────────────────────────────────────────────────── */

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  push: (input) => {
    const id = generateId();

    const newToast: Toast = {
      id,
      variant: input.variant,
      message: input.message,
      duration: input.duration ?? DEFAULT_DURATION,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    return id;
  },

  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clear: () => {
    set({ toasts: [] });
  },
}));

/* ─────────────────────────────────────────────────────────────
   IMPERATIVE API (NON-REACT USAGE)
───────────────────────────────────────────────────────────── */

export const toast = {
  success: (message: string, duration?: number): string =>
    useToastStore.getState().push({
      variant: 'success',
      message,
      ...(duration !== undefined && { duration }),
    }),

  error: (message: string, duration?: number): string =>
    useToastStore.getState().push({
      variant: 'error',
      message,
      ...(duration !== undefined && { duration }),
    }),

  info: (message: string, duration?: number): string =>
    useToastStore.getState().push({
      variant: 'info',
      message,
      ...(duration !== undefined && { duration }),
    }),

  warning: (message: string, duration?: number): string =>
    useToastStore.getState().push({
      variant: 'warning',
      message,
      ...(duration !== undefined && { duration }),
    }),
};