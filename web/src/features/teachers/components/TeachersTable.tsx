import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { DataTable, type DataTableColumn } from '@/components/DataTable';

import type { Teacher } from '../schemas';

const fmt = (d: Date | string | null | undefined): string => {
  if (!d) return '—';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(d));
};

interface TeachersTableProps {
  teachers: readonly Teacher[];
  isLoading: boolean;
  isError: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (key: string) => void;
}

export const TeachersTable = ({
  teachers,
  isLoading,
  isError,
  sortBy,
  sortOrder,
  onSort,
}: TeachersTableProps): ReactElement => {
  const columns: readonly DataTableColumn<Teacher>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      sortKey: 'lastName',
      render: (t) => (
        <Link
          to={`/users/${t.id}`}
          style={{ color: 'var(--color-accent)', fontWeight: 500 }}
        >
          {t.firstName} {t.lastName}
        </Link>
      ),
    },
    {
      key: 'employeeNumber',
      header: 'Employee #',
      render: (t) => (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-fg-muted)',
          }}
        >
          {t.teacherProfile?.employeeNumber ?? '—'}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (t) => (
        <span style={{ color: 'var(--color-fg-muted)' }}>
          {t.teacherProfile?.department ?? '—'}
        </span>
      ),
    },
    {
      key: 'qualification',
      header: 'Qualification',
      render: (t) => (
        <span style={{ color: 'var(--color-fg-muted)' }}>
          {t.teacherProfile?.qualification ?? '—'}
        </span>
      ),
    },
    {
      key: 'hireDate',
      header: 'Hired',
      render: (t) => (
        <span
          style={{
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--color-fg-muted)',
          }}
        >
          {fmt(t.teacherProfile?.hireDate as Date | null)}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (t) =>
        t.isActive ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="neutral">Inactive</Badge>
        ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '8rem',
      render: (t) => (
        <Link to={`/users/${t.id}`}>
          <Button variant="secondary" size="sm">View</Button>
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={teachers}
      isLoading={isLoading}
      isError={isError}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      getRowKey={(t) => t.id}
      emptyTitle="No teachers found"
      emptyDescription="Try adjusting your filters or add a user with the TEACHER role."
    />
  );
};
