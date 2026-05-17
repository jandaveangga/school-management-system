import type { ReactElement, ReactNode } from 'react';
import './AuthLayout.css';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
}

// Centered card layout shared by /login and /register.
// Acts as the unauthenticated UI shell (marketing-style layout).
export const AuthLayout = ({
  title,
  subtitle,
  footer,
  children,
}: AuthLayoutProps): ReactElement => {
  return (
    <main className="auth-layout">
      <div className="auth-layout__card">
        <header className="auth-layout__header">
          <div className="auth-layout__brand" aria-hidden="true">
            <span className="auth-layout__brand-mark">SMS</span>
          </div>

          <h1 className="auth-layout__title">{title}</h1>

          {subtitle !== undefined && (
            <p className="auth-layout__subtitle">{subtitle}</p>
          )}
        </header>

        <div className="auth-layout__body">{children}</div>

        {footer !== undefined && (
          <footer className="auth-layout__footer">{footer}</footer>
        )}
      </div>
    </main>
  );
};