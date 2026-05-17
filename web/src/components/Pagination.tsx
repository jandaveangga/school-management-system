import type { ReactElement } from 'react';
import { Button } from './Button';
import { Select } from './Select';
import './Pagination.css';

interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
}

export const Pagination = ({
  page,
  pageSize,
  totalCount,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}: PaginationProps): ReactElement => {
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <nav className="pagination" aria-label="Pagination">
      {/* Info */}
      <div className="pagination__info" aria-live="polite">
        {totalCount === 0 ? (
          'No results'
        ) : (
          <>
            Showing <strong>{start}</strong>–<strong>{end}</strong> of{' '}
            <strong>{totalCount}</strong>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="pagination__controls">
        {onPageSizeChange && (
          <label className="pagination__page-size">
            <span className="sr-only">Rows per page</span>

            <Select
              value={String(pageSize)}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </Select>
          </label>
        )}

        <div className="pagination__buttons">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrevPage}
            aria-label="Previous page"
          >
            Previous
          </Button>

          <span className="pagination__page-indicator" aria-current="page">
            Page {page} of {Math.max(totalPages, 1)}
          </span>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNextPage}
            aria-label="Next page"
          >
            Next
          </Button>
        </div>
      </div>
    </nav>
  );
};