import type { ReactElement } from 'react';

import { Badge } from '@/components/Badge';
import { DataTable, type DataTableColumn } from '@/components/DataTable';

import type { AttendanceRecord, AttendanceStatus } from '../schemas';

const fmt = (d: Date | string | null | undefined): string => {
  if (!d) return '—';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(d));
};

type StatusVariant = 'success' | 'danger' | 'warning' | 'neutral';

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; variant: StatusVariant }
> = {
  PRESENT: { label: 'Present', variant: 'success' },
  ABSENT: { label: 'Absent', variant: 'danger' },
  LATE: { label: 'Late', variant: 'warning' },
  EXCUSED: { label: 'Excused', variant: 'neutral' },
};

interface AttendanceTableProps {
  records: readonly AttendanceRecord[];
  isLoading: boolean;
  isError: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (key: string) => void;
}

export const AttendanceTable = ({
  records,
  isLoading,
  isError,
  sortBy,
  sortOrder,
  onSort,
}: AttendanceTableProps): ReactElement => {
  const columns: readonly DataTableColumn<AttendanceRecord>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (r) => (
        <span
          style={{
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 500,
          }}
        >
          {fmt(r.date)}
        </span>
      ),
    },
    {
      key: 'studentName',
      header: 'Student',
      sortable: true,
      render: (r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.studentName}</div>
          {r.studentNumber && (
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-fg-subtle)',
                marginTop: '2px',
              }}
            >
              {r.studentNumber}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'className',
      header: 'Class',
      render: (r) => (
        <span style={{ color: 'var(--color-fg-muted)' }}>{r.className}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => {
        const cfg = STATUS_CONFIG[r.status];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (r) => (
        <span
          style={{
            color: 'var(--color-fg-muted)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          {r.notes ?? '—'}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={records}
      isLoading={isLoading}
      isError={isError}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      getRowKey={(r) => r.id}
      emptyTitle="No attendance records"
      emptyDescription="Attendance records will appear here once the backend module is connected."
    />
  );
};
