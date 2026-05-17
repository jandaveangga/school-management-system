import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/DataTable';

import type { PublicUser } from '@/features/auth/schemas';

interface UsersTableProps {
  users: readonly PublicUser[];
  isLoading: boolean;
  isError: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (key: string) => void;
  onDelete: (user: PublicUser) => void;
}

const formatDate = (date: Date | null): string => {
  if (date === null) return '—';

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const UsersTable = ({
  users,
  isLoading,
  isError,
  sortBy,
  sortOrder,
  onSort,
  onDelete,
}: UsersTableProps): ReactElement => {
  const columns: readonly DataTableColumn<PublicUser>[] =
    [
      {
        key: 'name',
        header: 'Name',
        sortable: true,
        sortKey: 'lastName',
        render: (u) => (
          <Link
            to={`/users/${u.id}`}
            style={{
              color: 'var(--color-accent)',
              fontWeight: 500,
            }}
          >
            {u.firstName} {u.lastName}
          </Link>
        ),
      },
      {
        key: 'email',
        header: 'Email',
        sortable: true,
        render: (u) => (
          <span style={{ color: 'var(--color-fg-muted)' }}>
            {u.email}
          </span>
        ),
      },
      {
        key: 'roles',
        header: 'Roles',
        render: (u) => (
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-1)',
              flexWrap: 'wrap',
            }}
          >
            {u.roles.map((r) => (
              <Badge key={r} variant="accent">
                {r}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        key: 'isActive',
        header: 'Status',
        render: (u) =>
          u.isActive ? (
            <Badge variant="success">Active</Badge>
          ) : (
            <Badge variant="neutral">
              Inactive
            </Badge>
          ),
      },
      {
        key: 'lastLoginAt',
        header: 'Last login',
        sortable: true,
        render: (u) => (
          <span
            style={{
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--color-fg-muted)',
            }}
          >
            {formatDate(u.lastLoginAt)}
          </span>
        ),
      },
      {
        key: 'createdAt',
        header: 'Created',
        sortable: true,
        render: (u) => (
          <span
            style={{
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--color-fg-muted)',
            }}
          >
            {formatDate(u.createdAt)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: (
          <span className="sr-only">Actions</span>
        ),
        align: 'right',
        width: '12rem',
        render: (u) => (
          <div
            style={{
              display: 'inline-flex',
              gap: 'var(--space-2)',
              justifyContent: 'flex-end',
            }}
          >
            <Link to={`/users/${u.id}`}>
              <Button variant="secondary" size="sm">
                Edit
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(u)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ];

  return (
    <DataTable
      columns={columns}
      data={users}
      isLoading={isLoading}
      isError={isError}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      getRowKey={(u) => u.id}
      emptyTitle="No users found"
      emptyDescription="Try adjusting your filters or create a new user."
    />
  );
};