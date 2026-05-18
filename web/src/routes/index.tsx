import type { ReactElement } from 'react';

import {
  createBrowserRouter,
  Navigate,
} from 'react-router-dom';

import { AppShell } from '@/components/AppShell';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';

import {
  LoginPage,
  RegisterPage,
} from '@/features/auth';

import {
  UserDetailPage,
  UserNewPage,
  UsersListPage,
} from '@/features/users';

import { StudentsListPage } from '@/features/students';
import { TeachersListPage } from '@/features/teachers';
import { ClassesListPage } from '@/features/classes';
import { AttendanceListPage } from '@/features/attendance';
import { GradesListPage } from '@/features/grades';

import { DashboardPlaceholder } from './DashboardPlaceholder';
import { NotFoundPage } from './NotFoundPage';

import {
  redirectIfAuthenticatedLoader,
  requireAuthLoader,
  requireRolesLoader,
} from './Loaders';

/* ─────────────────────────────────────────────────────────────
   FEATURE PLACEHOLDER
───────────────────────────────────────────────────────────── */

interface FeaturePlaceholderProps {
  name: string;
}

// Temporary placeholder until feature modules ship.
function FeaturePlaceholder({
  name,
}: FeaturePlaceholderProps): ReactElement {
  return (
    <section>
      <h1>{name}</h1>

      <p
        style={{
          color: 'var(--color-fg-muted)',
        }}
      >
        Coming in Phase 4.
        The route is wired and gated; only the UI is missing.
      </p>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   FORBIDDEN PAGE
───────────────────────────────────────────────────────────── */

function ForbiddenPage(): ReactElement {
  return (
    <main
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        padding: 'var(--space-8)',
        textAlign: 'center',
      }}
    >
      <div>
        <p
          style={{
            marginBottom: 'var(--space-2)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-fg-subtle)',
          }}
        >
          403
        </p>

        <h1
          style={{
            marginBottom: 'var(--space-3)',
          }}
        >
          Forbidden
        </h1>

        <p
          style={{
            color: 'var(--color-fg-muted)',
          }}
        >
          Your account doesn&apos;t have access to that page.
        </p>
      </div>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROUTER
───────────────────────────────────────────────────────────── */

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteErrorBoundary />,

    children: [
      /* ───────────────────────────────────────────────────────
         ROOT REDIRECT
      ─────────────────────────────────────────────────────── */

      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },

      /* ───────────────────────────────────────────────────────
         PUBLIC AUTH ROUTES
      ─────────────────────────────────────────────────────── */

      {
        path: 'login',
        loader: redirectIfAuthenticatedLoader,
        element: <LoginPage />,
      },

      {
        path: 'register',
        loader: redirectIfAuthenticatedLoader,
        element: <RegisterPage />,
      },

      /* ───────────────────────────────────────────────────────
         AUTHENTICATED APP
      ─────────────────────────────────────────────────────── */

      {
        loader: requireAuthLoader,
        element: <AppShell />,

        children: [
          {
            path: 'dashboard',
            element: <DashboardPlaceholder />,
          },

          /* ───────────────────────────────────────────────────
             ADMIN ONLY
          ─────────────────────────────────────────────────── */

          {
            path: 'users',
            loader: requireRolesLoader('ADMIN'),

            children: [
              {
                index: true,
                element: <UsersListPage />,
              },

              {
                path: 'new',
                element: <UserNewPage />,
              },

              {
                path: ':id',
                element: <UserDetailPage />,
              },
            ],
          },

          {
            path: 'teachers',
            loader: requireRolesLoader('ADMIN'),
            element: <TeachersListPage />,
          },

          /* ───────────────────────────────────────────────────
             ADMIN OR TEACHER
          ─────────────────────────────────────────────────── */

          {
            path: 'students',
            loader: requireRolesLoader(
              'ADMIN',
              'TEACHER',
            ),
            element: <StudentsListPage />,
          },

          {
            path: 'classes',
            loader: requireRolesLoader(
              'ADMIN',
              'TEACHER',
            ),
            element: <ClassesListPage />,
          },

          {
            path: 'attendance',
            loader: requireRolesLoader(
              'ADMIN',
              'TEACHER',
            ),
            element: <AttendanceListPage />,
          },

          /* ───────────────────────────────────────────────────
             ANY AUTHENTICATED USER
          ─────────────────────────────────────────────────── */

          {
            path: 'grades',
            element: <GradesListPage />,
          },
        ],
      },

      /* ───────────────────────────────────────────────────────
         FALLBACK ROUTES
      ─────────────────────────────────────────────────────── */

      {
        path: 'forbidden',
        element: <ForbiddenPage />,
      },

      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);