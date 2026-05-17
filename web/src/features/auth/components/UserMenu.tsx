import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLogout } from '../hooks/useLogout';
import './UserMenu.css';

const initialsOf = (firstName: string, lastName: string): string => {
  const f = firstName.length > 0 ? firstName.charAt(0) : '';
  const l = lastName.length > 0 ? lastName.charAt(0) : '';
  return `${f}${l}`.toUpperCase() || '?';
};

export const UserMenu = (): ReactElement | null => {
  const { user } = useAuth();
  const logout = useLogout();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Close on outside click or Escape */
  useEffect(() => {
    if (!open) return;

    const onClickOutside = (e: MouseEvent): void => {
      if (
        containerRef.current !== null &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const onEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEscape);

    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  if (user === null) {
    return null;
  }

  const initials = initialsOf(user.firstName, user.lastName);

  return (
    <div className="user-menu" ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        className="user-menu__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="user-menu__avatar" aria-hidden="true">
          {initials}
        </span>

        <span className="user-menu__name">{user.firstName}</span>

        <svg
          className="user-menu__caret"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__header">
            <div className="user-menu__name-full">
              {user.firstName} {user.lastName}
            </div>

            <div className="user-menu__email" title={user.email}>
              {user.email}
            </div>

            {user.roles.length > 0 && (
              <div className="user-menu__roles">
                {user.roles.map((role) => (
                  <span key={role} className="user-menu__role-badge">
                    {role}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="user-menu__divider" role="separator" />

          <button
            type="button"
            role="menuitem"
            className="user-menu__item"
            onClick={() => {
              setOpen(false);
              logout.mutate();
            }}
            disabled={logout.isPending}
          >
            {logout.isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
};