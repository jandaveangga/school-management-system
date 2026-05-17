import type {
  ReactElement,
  ReactNode,
} from 'react';

import './Badge.css';

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */

type Variant =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger';

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */

export const Badge = ({
  variant = 'neutral',
  children,
}: BadgeProps): ReactElement => {
  return (
    <span className={`badge badge--${variant}`}>
      {children}
    </span>
  );
};