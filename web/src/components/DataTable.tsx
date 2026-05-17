import type {
  ReactElement,
  ReactNode,
} from 'react';

import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';

import './DataTable.css';

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  render: (item: T) => ReactNode;

  sortable?: boolean;
  sortKey?: string;

  width?: string;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  columns: readonly DataTableColumn<T>[];
  data: readonly T[];

  isLoading?: boolean;
  isError?: boolean;

  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;

  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;

  getRowKey: (item: T) => string;
  onRowClick?: (item: T) => void;
}

/* ─────────────────────────────────────────────────────────────
   SORT ICON
───────────────────────────────────────────────────────────── */

const SortIcon = ({
  direction,
}: {
  direction: 'asc' | 'desc' | null;
}): ReactElement => {
  if (direction === null) {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ opacity: 0.4 }}
      >
        <path d="M8 9l4-4 4 4" />
        <path d="M16 15l-4 4-4-4" />
      </svg>
    );
  }

  return direction === 'asc' ? (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 9l4-4 4 4" />
    </svg>
  ) : (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 15l-4 4-4-4" />
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */

export const DataTable = <T,>({
  columns,
  data,

  isLoading = false,
  isError = false,

  emptyTitle = 'No data',
  emptyDescription,
  emptyAction,

  sortBy,
  sortOrder,
  onSort,

  getRowKey,
  onRowClick,
}: DataTableProps<T>): ReactElement => {
  /* ─────────────────────────────────────────────────────────
     LOADING STATE
  ──────────────────────────────────────────────────────── */

  if (isLoading) {
    return (
      <div className="data-table__state">
        <Spinner label="Loading data" />
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────
     ERROR STATE
  ──────────────────────────────────────────────────────── */

  if (isError) {
    return (
      <div className="data-table__state">
        <EmptyState
          title="Couldn't load data"
          description="Try refreshing the page."
        />
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────
     EMPTY STATE
  ──────────────────────────────────────────────────────── */

  if (data.length === 0) {
    return (
      <div className="data-table__state">
        <EmptyState
          title={emptyTitle}
          {...(emptyDescription !== undefined && {
            description: emptyDescription,
          })}
          {...(emptyAction !== undefined && {
            action: emptyAction,
          })}
        />
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────
     TABLE
  ──────────────────────────────────────────────────────── */

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => {
              const colSortKey =
                col.sortKey ?? col.key;

              const isSorted =
                col.sortable === true &&
                sortBy === colSortKey;

              const direction = isSorted
                ? sortOrder ?? null
                : null;

              return (
                <th
                  key={col.key}
                  scope="col"
                  className={[
                    'data-table__th',
                    `data-table__th--${
                      col.align ?? 'left'
                    }`,
                  ].join(' ')}
                  style={
                    col.width !== undefined
                      ? { width: col.width }
                      : undefined
                  }
                  aria-sort={
                    isSorted
                      ? sortOrder === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : col.sortable
                        ? 'none'
                        : undefined
                  }
                >
                  {col.sortable === true &&
                  onSort !== undefined ? (
                    <button
                      type="button"
                      className="data-table__sort-button"
                      onClick={() =>
                        onSort(colSortKey)
                      }
                    >
                      <span>{col.header}</span>
                      <SortIcon
                        direction={direction}
                      />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr
              key={getRowKey(item)}
              className={
                onRowClick !== undefined
                  ? 'data-table__row data-table__row--clickable'
                  : 'data-table__row'
              }
              onClick={
                onRowClick !== undefined
                  ? () => onRowClick(item)
                  : undefined
              }
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`data-table__td data-table__td--${
                    col.align ?? 'left'
                  }`}
                >
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};