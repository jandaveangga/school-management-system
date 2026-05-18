import { useMemo, type ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { Pagination } from '@/components/Pagination';
import { SearchInput } from '@/components/SearchInput';
import { Select } from '@/components/Select';

import { useAttendanceList } from '../hooks';
import {
  listAttendanceQuerySchema,
  type ListAttendanceQuery,
  type AttendanceStatus,
} from '../schemas';
import { AttendanceTable } from '../components/AttendanceTable';

import './AttendanceListPage.css';

const STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
  EXCUSED: 'Excused',
};

const parseQuery = (params: URLSearchParams): ListAttendanceQuery => {
  const candidate = {
    page: params.get('page') ?? undefined,
    pageSize: params.get('pageSize') ?? undefined,
    sortBy: params.get('sortBy') ?? undefined,
    sortOrder: params.get('sortOrder') ?? undefined,
    search: params.get('search') ?? undefined,
    classId: params.get('classId') ?? undefined,
    status: params.get('status') ?? undefined,
    dateFrom: params.get('dateFrom') ?? undefined,
    dateTo: params.get('dateTo') ?? undefined,
  };
  const result = listAttendanceQuerySchema.safeParse(candidate);
  return result.success ? result.data : listAttendanceQuerySchema.parse({});
};

export const AttendanceListPage = (): ReactElement => {
  const [params, setParams] = useSearchParams();
  const query = useMemo(() => parseQuery(params), [params]);

  const list = useAttendanceList(query);

  const updateParams = (next: Partial<ListAttendanceQuery>): void => {
    const merged: ListAttendanceQuery = { ...query, ...next };
    const url = new URLSearchParams();
    if (merged.page !== 1) url.set('page', String(merged.page));
    if (merged.pageSize !== 20) url.set('pageSize', String(merged.pageSize));
    if (merged.sortBy !== 'date') url.set('sortBy', merged.sortBy);
    if (merged.sortOrder !== 'desc') url.set('sortOrder', merged.sortOrder);
    if (merged.search) url.set('search', merged.search);
    if (merged.classId) url.set('classId', merged.classId);
    if (merged.status) url.set('status', merged.status);
    if (merged.dateFrom) url.set('dateFrom', merged.dateFrom);
    if (merged.dateTo) url.set('dateTo', merged.dateTo);
    setParams(url);
  };

  const onSort = (key: string): void => {
    if (!isSortable(key)) return;
    if (query.sortBy === key) {
      updateParams({ sortOrder: query.sortOrder === 'asc' ? 'desc' : 'asc', page: 1 });
      return;
    }
    updateParams({ sortBy: key, sortOrder: 'asc', page: 1 });
  };

  const items = list.data?.items ?? [];
  const countByStatus = (s: AttendanceStatus) =>
    items.filter((r) => r.status === s).length;

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Track daily attendance records across all classes. Filter by status, class, or date range."
      />

      <div className="attendance-list__filters">
        <SearchInput
          value={query.search ?? ''}
          onDebouncedChange={(v) =>
            updateParams({ search: v || undefined, page: 1 })
          }
          placeholder="Search by student name"
          ariaLabel="Search attendance"
        />

        <Select
          value={query.status ?? ''}
          onChange={(e) =>
            updateParams({
              status: (e.target.value as AttendanceStatus) || undefined,
              page: 1,
            })
          }
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>

        <Select
          value={query.sortOrder}
          onChange={(e) =>
            updateParams({
              sortOrder: e.target.value as 'asc' | 'desc',
              page: 1,
            })
          }
          aria-label="Sort order"
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </Select>
      </div>

      <div className="attendance-list__panel">
        {list.data !== undefined && (
          <div className="attendance-list__stat-bar" aria-label="Summary">
            <div className="attendance-list__stat">
              <span className="attendance-list__stat-value">
                {list.data.totalCount}
              </span>
              <span className="attendance-list__stat-label">Total records</span>
            </div>
            <div className="attendance-list__stat">
              <span className="attendance-list__stat-value attendance-list__stat-value--present">
                {countByStatus('PRESENT')}
              </span>
              <span className="attendance-list__stat-label">Present (page)</span>
            </div>
            <div className="attendance-list__stat">
              <span className="attendance-list__stat-value attendance-list__stat-value--absent">
                {countByStatus('ABSENT')}
              </span>
              <span className="attendance-list__stat-label">Absent (page)</span>
            </div>
            <div className="attendance-list__stat">
              <span className="attendance-list__stat-value attendance-list__stat-value--late">
                {countByStatus('LATE')}
              </span>
              <span className="attendance-list__stat-label">Late (page)</span>
            </div>
          </div>
        )}

        <AttendanceTable
          records={list.data?.items ?? []}
          isLoading={list.isLoading}
          isError={list.isError}
          sortBy={query.sortBy}
          sortOrder={query.sortOrder}
          onSort={onSort}
        />

        {list.data?.totalCount ? (
          <Pagination
            page={list.data.page}
            pageSize={list.data.pageSize}
            totalCount={list.data.totalCount}
            totalPages={list.data.totalPages}
            hasNextPage={list.data.hasNextPage}
            hasPrevPage={list.data.hasPrevPage}
            onPageChange={(page) => updateParams({ page })}
            onPageSizeChange={(pageSize) => updateParams({ pageSize, page: 1 })}
          />
        ) : null}
      </div>
    </>
  );
};

const isSortable = (key: string): key is ListAttendanceQuery['sortBy'] =>
  ['date', 'studentName', 'createdAt'].includes(key);
