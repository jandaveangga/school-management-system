import type { ReactNode } from 'react';

import { useAuth } from '../hooks/useAuth';
import type { RoleName } from '../schemas';

interface RoleGateProps {
  // Roles allowed to see the children. User needs at least one match.
  roles: readonly RoleName[];
  // Rendered when user lacks permission. Defaults to nothing.
  fallback?: ReactNode;
  children: ReactNode;
}

// Pure component-level RBAC gate.
// Does not redirect — routing logic should handle that.
// Use for hiding UI elements like buttons, links, or sections.
export const RoleGate = ({
  roles,
  fallback = null,
  children,
}: RoleGateProps): ReactNode => {
  const { user } = useAuth();

  if (user === null) {
    return fallback;
  }

  const allowed = user.roles.some((r) => roles.includes(r));

  return allowed ? children : fallback;
};