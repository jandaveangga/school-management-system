import type { ReactElement } from 'react';

import { DataTable, type DataTableColumn } from '@/components/DataTable';

import type { GradeRecord } from '../schemas';

const fmt = (d: Date | string | null | undefined): string => {
  if (!d) return '—';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(d));
};

const scoreColor = (score: number | null, max: number | null): string => {
  if (score === null || max === null || max === 0) return 'var(--color-fg-muted)';
  const pct = score / max;
  if (pct >= 0.9) return 'var(--color-success)';
  if (pct >= 0.75) return 'var(--color-info)';
  if (pct >= 0.6) return 'var(--color-warning)';
  return 'var(--color-danger)';
};

interface GradesTableProps {
  grades: readonly GradeRecord[];
  isLoading: boolean;
  isError: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (key: string) => void;
}

export const GradesTable = ({
  grades,
  isLoading,
  isError,
  sortBy,
  sortOrder,
  onSort,
}: GradesTableProps): ReactElement => {
  const columns: readonly DataTableColumn<GradeRecord>[] = [
    {
      key: 'studentName',
      header: 'Student',
      sortable: true,
      render: (g) => (
        <div>
          <div style={{ fontWeight: 500 }}>{g.studentName}</div>
          {g.studentNumber && (
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-fg-subtle)',
                marginTop: '2px',
              }}
            >
              {g.studentNumber}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'className',
      header: 'Class',
      render: (g) => (
        <span style={{ color: 'var(--color-fg-muted)' }}>{g.className}</span>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      sortable: true,
      render: (g) => (
        <span style={{ fontWeight: 500 }}>{g.subject}</span>
      ),
    },
    {
      key: 'period',
      header: 'Period',
      render: (g) => (
        <span style={{ color: 'var(--color-fg-muted)' }}>
          {g.period ?? '—'}
        </span>
      ),
    },
    {
      key: 'score',
      header: 'Score',
      align: 'right',
      sortable: true,
      render: (g) => (
        <span
          style={{
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 600,
            color: scoreColor(g.score, g.maxScore),
          }}
        >
          {g.score !== null
            ? `${g.score}${g.maxScore !== null ? ` / ${g.maxScore}` : ''}`
            : '—'}
        </span>
      ),
    },
    {
      key: 'letterGrade',
      header: 'Grade',
      align: 'center',
      render: (g) => (
        <span
          style={{
            fontWeight: 700,
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-accent)',
          }}
        >
          {g.letterGrade ?? '—'}
        </span>
      ),
    },
    {
      key: 'remarks',
      header: 'Remarks',
      render: (g) => (
        <span
          style={{
            color: 'var(--color-fg-muted)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          {g.remarks ?? '—'}
        </span>
      ),
    },
    {
      key: 'gradedAt',
      header: 'Graded',
      sortable: true,
      render: (g) => (
        <span
          style={{
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--color-fg-muted)',
          }}
        >
          {fmt(g.gradedAt)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={grades}
      isLoading={isLoading}
      isError={isError}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      getRowKey={(g) => g.id}
      emptyTitle="No grades found"
      emptyDescription="Grades will appear here once the backend module is connected."
    />
  );
};
