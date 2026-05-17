import type { ReactElement, ReactNode } from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({
  title,
  description,
  action,
}: EmptyStateProps): ReactElement => {
  return (
    <div className="empty-state" role="status">
      {/* Icon */}
      <div className="empty-state__icon" aria-hidden="true">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M9 9h.01M15 9h.01M9 15h6" />
        </svg>
      </div>

      {/* Content */}
      <h3 className="empty-state__title">{title}</h3>

      {description !== undefined && (
        <p className="empty-state__description">{description}</p>
      )}

      {action !== undefined && (
        <div className="empty-state__action">{action}</div>
      )}
    </div>
  );
};