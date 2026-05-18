import { useMemo, type ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { Pagination } from '@/components/Pagination';
import { SearchInput } from '@/components/SearchInput';
import { Select } from '@/components/Select';

import { useTeachersList } from '../hooks';
import {
  listTeachersQuerySchema,
  type ListTeachersQuery,
} from '../schemas';
import { TeachersTable } from '../components/TeachersTable';

import './TeachersListPage.css';

const parseQuery = (params: URLSearchParams): ListTeachersQuery => {
  const candidate = {
    page: params.get('page') ?? undefined,
    pageSize: params.get('pageSize') ?? undefined,
    sortBy: params.get('sortBy') ?? undefined,
    sortOrder: params.get('sortOrder') ?? undefined,
    search: params.get('search') ?? undefined,
    isActive: params.get('isActive') ?? undefined,
  };
  const result = listTeachersQuerySchema.safeParse(candidate);
  return result.success ? result.data : listTeachersQuerySchema.parse({});
};

export const TeachersListPage = (): ReactElement => {
  const [params, setParams] = useSearchParams();
  const query = useMemo(() => parseQuery(params), [params]);

  const list = useTeachersList(query);

  const updateParams = (next: Partial<ListTeachersQuery>): void => {
    const merged: ListTeachersQuery = { ...query, ...next };
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
      updateParams({ sortOrder: query.sortOrder === 'asc' ? 'desc' : 'asc', page: 1 });
      return;
    }
    updateParams({ sortBy: key, sortOrder: 'asc', page: 1 });
  };

  const total = list.data?.totalCount ?? 0;
  const active = list.data?.items.filter((t) => t.isActive).length ?? 0;
  const withProfile =
    list.data?.items.filter(
      (t) => t.teacherProfile !== null && t.teacherProfile !== undefined,
    ).length ?? 0;

  return (
    <>
      <PageHeader
        title="Teachers"
        description="Manage faculty accounts. Click a name to open the full user profile and attach a teacher profile."
      />

      <div className="teachers-list__filters">
        <SearchInput
          value={query.search ?? ''}
          onDebouncedChange={(v) =>
            updateParams({ search: v || undefined, page: 1 })
          }
          placeholder="Search by name or email"
          ariaLabel="Search teachers"
        />

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

      <div className="teachers-list__panel">
        {list.data !== undefined && (
          <div className="teachers-list__stat-bar" aria-label="Summary">
            <div className="teachers-list__stat">
              <span className="teachers-list__stat-value">{total}</span>
              <span className="teachers-list__stat-label">Total teachers</span>
            </div>
            <div className="teachers-list__stat">
              <span className="teachers-list__stat-value">{active}</span>
              <span className="teachers-list__stat-label">Active (this page)</span>
            </div>
            <div className="teachers-list__stat">
              <span className="teachers-list__stat-value">{withProfile}</span>
              <span className="teachers-list__stat-label">Profiles set (this page)</span>
            </div>
          </div>
        )}

        <TeachersTable
          teachers={list.data?.items ?? []}
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

const isSortable = (key: string): key is ListTeachersQuery['sortBy'] =>
  ['firstName', 'lastName', 'email', 'createdAt'].includes(key);
