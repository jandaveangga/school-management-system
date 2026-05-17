import { Link, useNavigate } from 'react-router-dom';

import type { ReactElement } from 'react';

import { PageHeader } from '@/components/PageHeader';

import { UserCreateForm } from '../components/UserCreateForm';

export const UserNewPage = (): ReactElement => {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        eyebrow={
          <Link
            to="/users"
            style={{
              color: 'var(--color-fg-muted)',
            }}
          >
            ← Back to users
          </Link>
        }
        title="New user"
        description="Create a user account, assign roles, and set an initial password."
      />

      <div
        style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          maxWidth: '40rem',
        }}
      >
        <UserCreateForm
          onSuccess={(id) => {
            void navigate(`/users/${id}`);
          }}
          onCancel={() => {
            void navigate('/users');
          }}
        />
      </div>
    </>
  );
};