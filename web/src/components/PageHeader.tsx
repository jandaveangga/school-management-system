import type { ReactElement, ReactNode } from 'react';
import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;

  // Optional breadcrumb / back link slot above the title.
  eyebrow?: ReactNode;
}

export const PageHeader = ({
  title,
  description,
  actions,
  eyebrow,
}: PageHeaderProps): ReactElement => {
  return (
    <header className="page-header">
      <div className="page-header__text">
        {eyebrow && (
          <div className="page-header__eyebrow">{eyebrow}</div>
        )}

        <h1 className="page-header__title">{title}</h1>

        {description && (
          <p className="page-header__description">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="page-header__actions">
          {actions}
        </div>
      )}
    </header>
  );
};