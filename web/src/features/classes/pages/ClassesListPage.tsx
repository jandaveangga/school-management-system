import { useMemo, type ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { Pagination } from '@/components/Pagination';
import { SearchInput } from '@/components/SearchInput';
import { Select } from '@/components/Select';

import { useClassesList } from '../hooks';
import {
  listClassesQuerySchema,
  type ListClassesQuery,
} from '../schemas';
import { ClassesTable } from '../components/ClassesTable';

import './ClassesListPage.css';

const parseQuery = (params: URLSearchParams): ListClassesQuery => {
  const candidate = {
    page: params.get('page') ?? undefined,
    pageSize: params.get('pageSize') ?? undefined,
    sortBy: params.get('sortBy') ?? undefined,
    sortOrder: params.get('sortOrder') ?? undefined,
    search: params.get('search') ?? undefined,
    academicYear: params.get('academicYear') ?? undefined,
    isActive: params.get('isActive') ?? undefined,
  };
  const result = listClassesQuerySchema.safeParse(candidate);
  return result.success ? result.data : listClassesQuerySchema.parse({});
};

export const ClassesListPage = (): ReactElement => {
  const [params, setParams] = useSearchParams();
  const query = useMemo(() => parseQuery(params), [params]);

  const list = useClassesList(query);

  const updateParams = (next: Partial<ListClassesQuery>): void => {
    const merged: ListClassesQuery = { ...query, ...next };
    const url = new URLSearchParams();
    if (merged.page !== 1) url.set('page', String(merged.page));
    if (merged.pageSize !== 20) url.set('pageSize', String(merged.pageSize));
    if (merged.sortBy !== 'createdAt') url.set('sortBy', merged.sortBy);
    if (merged.sortOrder !== 'desc') url.set('sortOrder', merged.sortOrder);
    if (merged.search) url.set('search', merged.search);
    if (merged.academicYear) url.set('academicYear', merged.academicYear);
    if (merged.isActive !== undefined) url.set('isActive', merged.isActive);
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

  const total = list.data?.totalCount ?? 0;
  const active = list.data?.items.filter((c) => c.isActive).length ?? 0;
  const totalStudents = list.data?.items.reduce(
    (sum, c) => sum + c.studentCount,
    0,
  ) ?? 0;

  return (
    <>
      <PageHeader
        title="Classes"
        description="View and manage class sections, assigned teachers, and enrolled students."
      />

      <div className="classes-list__filters">
        <SearchInput
          value={query.search ?? ''}
          onDebouncedChange={(v) =>
            updateParams({ search: v || undefined, page: 1 })
          }
          placeholder="Search by class name"
          ariaLabel="Search classes"
        />

        <Select
          value={query.academicYear ?? ''}
          onChange={(e) =>
            updateParams({ academicYear: e.target.value || undefined, page: 1 })
          }
          aria-label="Filter by academic year"
        >
          <option value="">All years</option>
          <option value="2025-2026">2025–2026</option>
          <option value="2024-2025">2024–2025</option>
          <option value="2023-2024">2023–2024</option>
        </Select>

        <Select
          value={query.isActive ?? ''}
          onChange={(e) =>
            updateParams({ isActive: e.target.value || undefined, page: 1 })
          }
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>
      </div>

      <div className="classes-list__panel">
        {list.data !== undefined && (
          <div className="classes-list__stat-bar" aria-label="Summary">
            <div className="classes-list__stat">
              <span className="classes-list__stat-value">{total}</span>
              <span className="classes-list__stat-label">Total classes</span>
            </div>
            <div className="classes-list__stat">
              <span className="classes-list__stat-value">{active}</span>
              <span className="classes-list__stat-label">Active (this page)</span>
            </div>
            <div className="classes-list__stat">
              <span className="classes-list__stat-value">{totalStudents}</span>
              <span className="classes-list__stat-label">Students (this page)</span>
            </div>
          </div>
        )}

        <ClassesTable
          classes={list.data?.items ?? []}
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

const isSortable = (key: string): key is ListClassesQuery['sortBy'] =>
  ['name', 'academicYear', 'createdAt'].includes(key);
