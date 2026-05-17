import type { ReactElement } from 'react';

import { useAuth } from '@/features/auth';

export const DashboardPlaceholder = (): ReactElement => {
  const { user } = useAuth();

  return (
    <section>
      <h1 style={{ marginBottom: 'var(--space-2)' }}>
        Dashboard
      </h1>

      <p
        style={{
          color: 'var(--color-fg-muted)',
          marginBottom: 'var(--space-6)',
        }}
      >
        Phase 4 will fill this in with feature widgets.
        For now, this confirms that auth + session wiring works end-to-end.
      </p>

      {user && (
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 'var(--space-2) var(--space-4)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <dt style={{ fontWeight: 'var(--font-weight-medium)' }}>
            User ID
          </dt>
          <dd>
            <code>{user.id}</code>
          </dd>

          <dt style={{ fontWeight: 'var(--font-weight-medium)' }}>
            Email
          </dt>
          <dd>{user.email}</dd>

          <dt style={{ fontWeight: 'var(--font-weight-medium)' }}>
            Name
          </dt>
          <dd>
            {user.firstName} {user.lastName}
          </dd>

          <dt style={{ fontWeight: 'var(--font-weight-medium)' }}>
            Roles
          </dt>
          <dd>{user.roles.join(', ')}</dd>
        </dl>
      )}
    </section>
  );
};