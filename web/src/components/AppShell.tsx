import type {
  ReactElement,
  ReactNode,
} from 'react';

import {
  NavLink,
  Outlet,
} from 'react-router-dom';

import type { RoleName } from '@/features/auth';
import { useAuth, useLogout, RoleGate, UserMenu } from '@/features/auth';

import './AppShell.css';

/* ─────────────────────────────────────────────────────────────
   NAVIGATION CONFIG
───────────────────────────────────────────────────────────── */

interface NavItem {
  to: string;
  label: string;
  roles?: readonly RoleName[];
}

const NAV_ITEMS: readonly NavItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
  },

  {
    to: '/users',
    label: 'Users',
    roles: ['ADMIN'],
  },

  {
    to: '/students',
    label: 'Students',
    roles: ['ADMIN', 'TEACHER'],
  },

  {
    to: '/teachers',
    label: 'Teachers',
    roles: ['ADMIN'],
  },

  {
    to: '/classes',
    label: 'Classes',
    roles: ['ADMIN', 'TEACHER'],
  },

  {
    to: '/attendance',
    label: 'Attendance',
    roles: ['ADMIN', 'TEACHER'],
  },

  {
    to: '/grades',
    label: 'Grades',
  },
];

/* ─────────────────────────────────────────────────────────────
   NAV ITEM LINK
───────────────────────────────────────────────────────────── */

interface NavItemLinkProps {
  item: NavItem;
}

const NavItemLink = ({
  item,
}: NavItemLinkProps): ReactNode => {
  const link = (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `app-shell__nav-link${
          isActive
            ? ' app-shell__nav-link--active'
            : ''
        }`
      }
    >
      {item.label}
    </NavLink>
  );

  // Public navigation item
  if (item.roles === undefined) {
    return link;
  }

  // Role-protected navigation item
  return (
    <RoleGate roles={item.roles}>
      {link}
    </RoleGate>
  );
};

/* ─────────────────────────────────────────────────────────────
   APP SHELL
───────────────────────────────────────────────────────────── */

export const AppShell = (): ReactElement | null => {
  const { user } = useAuth();
  const logout = useLogout();

  if (!user) {
    return null;
  }

  return (
    <div className="app-shell">
      {/* ──────────────────────────────────────────────────────
          HEADER
      ───────────────────────────────────────────────────── */}

      <header className="app-shell__header">
        <div className="app-shell__brand">
          <span
            className="app-shell__brand-mark"
            aria-hidden="true"
          >
            SMS
          </span>

          <span className="app-shell__brand-name">
            School Management
          </span>
        </div>

        <UserMenu user={user} onSignOut={() => logout.mutate()} />
      </header>

      {/* ──────────────────────────────────────────────────────
          BODY
      ───────────────────────────────────────────────────── */}

      <div className="app-shell__body">
        {/* ──────────────────────────────────────────────────
            SIDEBAR
        ───────────────────────────────────────────────── */}

        <aside
          className="app-shell__sidebar"
          aria-label="Primary navigation"
        >
          <nav>
            <ul className="app-shell__nav">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavItemLink item={item} />
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* ──────────────────────────────────────────────────
            MAIN CONTENT
        ───────────────────────────────────────────────── */}

        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};