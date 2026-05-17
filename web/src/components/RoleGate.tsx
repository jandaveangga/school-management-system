import type { ReactNode } from 'react';
import type { RoleName } from '@/features/auth';

interface RoleGateProps {
  allowedRoles: readonly RoleName[];
  userRoles: RoleName[];
  children: ReactNode;
}

/**
 * Renders children only when the user holds at least one of the allowed roles.
 * Used to conditionally show/hide navigation items and UI sections.
 */
export const RoleGate = ({
  allowedRoles,
  userRoles,
  children,
}: RoleGateProps): ReactNode => {
  const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
};
