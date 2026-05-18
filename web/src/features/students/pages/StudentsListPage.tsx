import { useMemo, type ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { Pagination } from '@/components/Pagination';
import { SearchInput } from '@/components/SearchInput';
import { Select } from '@/components/Select';

import { useStudentsList } from '../hooks';
import {
  listStudentsQuerySchema,
  type ListStudentsQuery,
} from '../schemas';
import { StudentsTable } from '../components/StudentsTable';

import './StudentsListPage.css';

/* ─────────────────────────────────────────────────────────────
   URL PARAMS → QUERY
───────────────────────────────────────────────────────────── */

const parseQuery = (params: URLSearchParams): ListStudentsQuery => {
  const candidate = {
    page: params.get('page') ?? undefined,
    pageSize: params.get('pageSize') ?? undefined,
    sortBy: params.get('sortBy') ?? undefined,
    sortOrder: params.get('sortOrder') ?? undefined,
    search: params.get('search') ?? undefined,
    isActive: params.get('isActive') ?? undefined,
  };

  const result = listStudentsQuerySchema.safeParse(candidate);
  return result.success ? result.data : listStudentsQuerySchema.parse({});
};

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */

export const StudentsListPage = (): ReactElement => {
  const [params, setParams] = useSearchParams();
  const query = useMemo(() => parseQuery(params), [params]);

  const list = useStudentsList(query);

  /* ── URL helpers ─────────────────────────────────────────── */

  const updateParams = (next: Partial<ListStudentsQuery>): void => {
    const merged: ListStudentsQuery = { ...query, ...next };
    const url = new URLSearchParams();

    if (merged.page !== 1) url.set('page', String(merged.page));
    if (merged.pageSize !== 20) url.set('pageSize', String(merged.pageSize));
    if (merged.sortBy !== 'createdAt') url.set('sortBy', merged.sortBy);
    if (merged.sortOrder !== 'desc') url.set('sortOrder', merged.sortOrder);
    if (merged.search) url.set('search', merged.search);
    if (merged.isActive !== undefined) url.set('isActive', merged.isActive);

    setParams(url);
  };

  const onSort = (key: string): void => {
    if (!isSortable(key)) return;

    if (query.sortBy === key) {
      updateParams({
        sortOrder: query.sortOrder === 'asc' ? 'desc' : 'asc',
        page: 1,
      });
      return;
    }

    updateParams({ sortBy: key, sortOrder: 'asc', page: 1 });
  };

  /* ── Stats strip ─────────────────────────────────────────── */

  const total = list.data?.totalCount ?? 0;
  const active = list.data?.items.filter((s) => s.isActive).length ?? 0;
  const withProfile = list.data?.items.filter(
    (s) => s.studentProfile !== null && s.studentProfile !== undefined,
  ).length ?? 0;

  /* ── Render ──────────────────────────────────────────────── */

  return (
    <>
      <PageHeader
        title="Students"
        description="Browse and manage all enrolled students. Click a name to open the full user profile."
      />

      {/* ── Filters ──────────────────────────────────────────── */}

      <div className="students-list__filters">
        <SearchInput
          value={query.search ?? ''}
          onDebouncedChange={(value) =>
            updateParams({ search: value || undefined, page: 1 })
          }
          placeholder="Search by name or email"
          ariaLabel="Search students"
        />

        <Select
          value={query.isActive ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            updateParams({
              isActive: value || undefined,
              page: 1,
            });
          }}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>
      </div>

      {/* ── Panel ────────────────────────────────────────────── */}

      <div className="students-list__panel">
        {/* Stat strip — only shown when data is available */}
        {list.data !== undefined && (
          <div className="students-list__stat-bar" aria-label="Summary">
            <div className="students-list__stat">
              <span className="students-list__stat-value">{total}</span>
              <span className="students-list__stat-label">Total students</span>
            </div>

            <div className="students-list__stat">
              <span className="students-list__stat-value">{active}</span>
              <span className="students-list__stat-label">Active (this page)</span>
            </div>

            <div className="students-list__stat">
              <span className="students-list__stat-value">{withProfile}</span>
              <span className="students-list__stat-label">Profiles set (this page)</span>
            </div>
          </div>
        )}

        <StudentsTable
          students={list.data?.items ?? []}
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
            onPageSizeChange={(pageSize) =>
              updateParams({ pageSize, page: 1 })
            }
          />
        ) : null}
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────────────────────
   GUARDS
───────────────────────────────────────────────────────────── */

const isSortable = (
  key: string,
): key is ListStudentsQuery['sortBy'] =>
  ['firstName', 'lastName', 'email', 'createdAt'].includes(key);
