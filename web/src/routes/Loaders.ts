import {
  redirect,
  type LoaderFunction,
  type LoaderFunctionArgs,
} from 'react-router-dom';

import type { RoleName } from '@/features/auth';
import { useAuthStore } from '@/store/auth-store';

/* ─────────────────────────────────────────────────────────────
   AUTH GUARDS
─────────────────────────────────────────────────────────────
   AuthBootstrap resolves session state before loaders run,
   so loaders only ever see:
   - authenticated
   - unauthenticated
───────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────
   REQUIRE AUTH
─────────────────────────────────────────────────────────────
   Redirects unauthenticated users to /login while preserving
   the originally requested URL via ?redirect=.
───────────────────────────────────────────────────────────── */

export const requireAuthLoader: LoaderFunction = ({
  request,
}: LoaderFunctionArgs) => {
  const { status } = useAuthStore.getState();

  if (status !== 'authenticated') {
    const url = new URL(request.url);

    const redirectTo =
      url.pathname + url.search;

    return redirect(
      `/login?redirect=${encodeURIComponent(
        redirectTo,
      )}`,
    );
  }

  return null;
};

/* ─────────────────────────────────────────────────────────────
   REQUIRE ROLES
─────────────────────────────────────────────────────────────
   Requires:
   - authenticated session
   - at least one allowed role
───────────────────────────────────────────────────────────── */

export const requireRolesLoader =
  (
    ...allowedRoles: readonly RoleName[]
  ): LoaderFunction =>
  ({ request }: LoaderFunctionArgs) => {
    const { status, user } =
      useAuthStore.getState();

    /* ─────────────────────────────────────────────────────────
       NOT AUTHENTICATED
    ──────────────────────────────────────────────────────── */

    if (
      status !== 'authenticated' ||
      user === null
    ) {
      const url = new URL(request.url);

      const redirectTo =
        url.pathname + url.search;

      return redirect(
        `/login?redirect=${encodeURIComponent(
          redirectTo,
        )}`,
      );
    }

    /* ─────────────────────────────────────────────────────────
       ROLE CHECK
    ──────────────────────────────────────────────────────── */

    const hasRequiredRole = user.roles.some(
      (role) => allowedRoles.includes(role),
    );

    if (!hasRequiredRole) {
      return redirect('/forbidden');
    }

    return null;
  };

/* ─────────────────────────────────────────────────────────────
   REDIRECT IF AUTHENTICATED
─────────────────────────────────────────────────────────────
   Prevents authenticated users from visiting auth pages
   like /login or /register.
───────────────────────────────────────────────────────────── */

export const redirectIfAuthenticatedLoader:
  LoaderFunction = ({
  request,
}: LoaderFunctionArgs) => {
  const { status } =
    useAuthStore.getState();

  if (status === 'authenticated') {
    const url = new URL(request.url);

    const redirectTo =
      url.searchParams.get('redirect') ??
      '/dashboard';

    return redirect(redirectTo);
  }

  return null;
};