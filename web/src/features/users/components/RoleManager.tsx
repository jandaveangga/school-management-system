import type { ReactElement } from 'react';
import type { RoleName } from '@/features/auth/schemas';

import type { PublicUser } from '@/features/auth/schemas';

interface RoleManagerProps {
  user: PublicUser;
}

export const RoleManager = ({
  user,
}: RoleManagerProps): ReactElement => {
  const roles = user.roles;
  const ALL_ROLES: RoleName[] = ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'STAFF'];

  return (
    <div>
      <h4>Roles</h4>
      <div>
        {ALL_ROLES.map((role) => (
          <label key={role} style={{ marginRight: '1rem' }}>
            <input
              type="checkbox"
              checked={roles.includes(role)}
              readOnly
            />
            {role}
          </label>
        ))}
      </div>
    </div>
  );
};