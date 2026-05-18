import { useMemo, type ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { Pagination } from '@/components/Pagination';
import { SearchInput } from '@/components/SearchInput';
import { Select } from '@/components/Select';

import { useGradesList } from '../hooks';
import {
  listGradesQuerySchema,
  type ListGradesQuery,
} from '../schemas';
import { GradesTable } from '../components/GradesTable';

import './GradesListPage.css';

const parseQuery = (params: URLSearchParams): ListGradesQuery => {
  const candidate = {
    page: params.get('page') ?? undefined,
    pageSize: params.get('pageSize') ?? undefined,
    sortBy: params.get('sortBy') ?? undefined,
    sortOrder: params.get('sortOrder') ?? undefined,
    search: params.get('search') ?? undefined,
    classId: params.get('classId') ?? undefined,
    subject: params.get('subject') ?? undefined,
    period: params.get('period') ?? undefined,
  };
  const result = listGradesQuerySchema.safeParse(candidate);
  return result.success ? result.data : listGradesQuerySchema.parse({});
};

export const GradesListPage = (): ReactElement => {
  const [params, setParams] = useSearchParams();
  const query = useMemo(() => parseQuery(params), [params]);

  const list = useGradesList(query);

  const updateParams = (next: Partial<ListGradesQuery>): void => {
    const merged: ListGradesQuery = { ...query, ...next };
    const url = new URLSearchParams();
    if (merged.page !== 1) url.set('page', String(merged.page));
    if (merged.pageSize !== 20) url.set('pageSize', String(merged.pageSize));
    if (merged.sortBy !== 'createdAt') url.set('sortBy', merged.sortBy);
    if (merged.sortOrder !== 'desc') url.set('sortOrder', merged.sortOrder);
    if (merged.search) url.set('search', merged.search);
    if (merged.classId) url.set('classId', merged.classId);
    if (merged.subject) url.set('subject', merged.subject);
    if (merged.period) url.set('period', merged.period);
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
  const avgScore = (() => {
    const scored = items.filter(
      (g) => g.score !== null && g.maxScore !== null && g.maxScore > 0,
    );
    if (scored.length === 0) return null;
    const avg =
      scored.reduce((s, g) => s + (g.score! / g.maxScore!) * 100, 0) /
      scored.length;
    return avg.toFixed(1);
  })();

  return (
    <>
      <PageHeader
        title="Grades"
        description="View grade records across all subjects and classes. Filter by subject or grading period."
      />

      <div className="grades-list__filters">
        <SearchInput
          value={query.search ?? ''}
          onDebouncedChange={(v) =>
            updateParams({ search: v || undefined, page: 1 })
          }
          placeholder="Search by student or subject"
          ariaLabel="Search grades"
        />

        <Select
          value={query.subject ?? ''}
          onChange={(e) =>
            updateParams({ subject: e.target.value || undefined, page: 1 })
          }
          aria-label="Filter by subject"
        >
          <option value="">All subjects</option>
          <option value="Math">Math</option>
          <option value="Science">Science</option>
          <option value="English">English</option>
          <option value="History">History</option>
          <option value="PE">PE</option>
          <option value="Arts">Arts</option>
        </Select>

        <Select
          value={query.period ?? ''}
          onChange={(e) =>
            updateParams({ period: e.target.value || undefined, page: 1 })
          }
          aria-label="Filter by period"
        >
          <option value="">All periods</option>
          <option value="Q1">Q1</option>
          <option value="Q2">Q2</option>
          <option value="Q3">Q3</option>
          <option value="Q4">Q4</option>
          <option value="Midterm">Midterm</option>
          <option value="Final">Final</option>
        </Select>
      </div>

      <div className="grades-list__panel">
        {list.data !== undefined && (
          <div className="grades-list__stat-bar" aria-label="Summary">
            <div className="grades-list__stat">
              <span className="grades-list__stat-value">
                {list.data.totalCount}
              </span>
              <span className="grades-list__stat-label">Total grades</span>
            </div>
            <div className="grades-list__stat">
              <span className="grades-list__stat-value">{items.length}</span>
              <span className="grades-list__stat-label">On this page</span>
            </div>
            <div className="grades-list__stat">
              <span
                className="grades-list__stat-value"
                style={{
                  color: avgScore !== null ? 'var(--color-accent)' : undefined,
                }}
              >
                {avgScore !== null ? `${avgScore}%` : '—'}
              </span>
              <span className="grades-list__stat-label">Avg score (page)</span>
            </div>
          </div>
        )}

        <GradesTable
          grades={list.data?.items ?? []}
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

const isSortable = (key: string): key is ListGradesQuery['sortBy'] =>
  ['studentName', 'subject', 'score', 'gradedAt', 'createdAt'].includes(key);
