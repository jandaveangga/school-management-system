import type { ReactElement } from 'react';

import { Badge } from '@/components/Badge';
import { DataTable, type DataTableColumn } from '@/components/DataTable';

import type { Class } from '../schemas';

const fmt = (d: Date | string | null | undefined): string => {
  if (!d) return '—';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(d));
};

interface ClassesTableProps {
  classes: readonly Class[];
  isLoading: boolean;
  isError: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (key: string) => void;
}

export const ClassesTable = ({
  classes,
  isLoading,
  isError,
  sortBy,
  sortOrder,
  onSort,
}: ClassesTableProps): ReactElement => {
  const columns: readonly DataTableColumn<Class>[] = [
    {
      key: 'name',
      header: 'Class name',
      sortable: true,
      render: (c) => (
        <span style={{ fontWeight: 500, color: 'var(--color-fg)' }}>
          {c.name}
        </span>
      ),
    },
    {
      key: 'section',
      header: 'Section',
      render: (c) => (
        <span style={{ color: 'var(--color-fg-muted)' }}>
          {c.section ?? '—'}
        </span>
      ),
    },
    {
      key: 'gradeLevel',
      header: 'Grade level',
      render: (c) => (
        <span style={{ color: 'var(--color-fg-muted)' }}>
          {c.gradeLevel ?? '—'}
        </span>
      ),
    },
    {
      key: 'academicYear',
      header: 'Academic year',
      sortable: true,
      render: (c) => (
        <span
          style={{
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--color-fg-muted)',
          }}
        >
          {c.academicYear}
        </span>
      ),
    },
    {
      key: 'teacherName',
      header: 'Teacher',
      render: (c) => (
        <span style={{ color: 'var(--color-fg-muted)' }}>
          {c.teacherName ?? '—'}
        </span>
      ),
    },
    {
      key: 'studentCount',
      header: 'Students',
      align: 'right',
      render: (c) => (
        <span
          style={{
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 500,
          }}
        >
          {c.studentCount}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (c) =>
        c.isActive ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="neutral">Inactive</Badge>
        ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (c) => (
        <span
          style={{
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--color-fg-muted)',
          }}
        >
          {fmt(c.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={classes}
      isLoading={isLoading}
      isError={isError}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      getRowKey={(c) => c.id}
      emptyTitle="No classes found"
      emptyDescription="Classes will appear here once the backend module is connected."
    />
  );
};
