import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/DataTable';

import type { Student } from '../schemas';

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

const fmt = (d: Date | string | null | undefined): string => {
  if (!d) return '—';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(d));
};

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */

interface StudentsTableProps {
  students: readonly Student[];
  isLoading: boolean;
  isError: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (key: string) => void;
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */

export const StudentsTable = ({
  students,
  isLoading,
  isError,
  sortBy,
  sortOrder,
  onSort,
}: StudentsTableProps): ReactElement => {
  const columns: readonly DataTableColumn<Student>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      sortKey: 'lastName',
      render: (s) => (
        <Link
          to={`/users/${s.id}`}
          style={{
            color: 'var(--color-accent)',
            fontWeight: 500,
          }}
        >
          {s.firstName} {s.lastName}
        </Link>
      ),
    },

    {
      key: 'studentNumber',
      header: 'Student #',
      render: (s) => (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-fg-muted)',
          }}
        >
          {s.studentProfile?.studentNumber ?? '—'}
        </span>
      ),
    },

    {
      key: 'gender',
      header: 'Gender',
      render: (s) => {
        const g = s.studentProfile?.gender;
        if (!g) return <span style={{ color: 'var(--color-fg-subtle)' }}>—</span>;
        const labels: Record<string, string> = {
          MALE: 'Male',
          FEMALE: 'Female',
          OTHER: 'Other',
          PREFER_NOT_TO_SAY: 'Prefer not to say',
        };
        return (
          <span style={{ color: 'var(--color-fg-muted)' }}>
            {labels[g] ?? g}
          </span>
        );
      },
    },

    {
      key: 'enrollmentDate',
      header: 'Enrolled',
      sortable: true,
      sortKey: 'createdAt',
      render: (s) => (
        <span
          style={{
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--color-fg-muted)',
          }}
        >
          {fmt(s.studentProfile?.enrollmentDate as Date | null)}
        </span>
      ),
    },

    {
      key: 'guardian',
      header: 'Guardian',
      render: (s) => {
        const name = s.studentProfile?.guardianName;
        return (
          <span style={{ color: 'var(--color-fg-muted)' }}>
            {name ?? '—'}
          </span>
        );
      },
    },

    {
      key: 'isActive',
      header: 'Status',
      render: (s) =>
        s.isActive ? (
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
      render: (s) => (
        <Link to={`/users/${s.id}`}>
          <Button variant="secondary" size="sm">
            View
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={students}
      isLoading={isLoading}
      isError={isError}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      getRowKey={(s) => s.id}
      emptyTitle="No students found"
      emptyDescription="Try adjusting your filters or add a user with the STUDENT role."
    />
  );
};
