import type { PaginationMeta } from "../types";

type PaginationControlsProps = {
  alwaysVisible?: boolean;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  pagination: PaginationMeta | null;
};

export const PaginationControls = ({
  alwaysVisible = false,
  isLoading,
  onPageChange,
  pagination,
}: PaginationControlsProps) => {
  if (!pagination || (!alwaysVisible && pagination.totalPages <= 1)) {
    return null;
  }

  const firstItem =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const lastItem = Math.min(
    pagination.page * pagination.limit,
    pagination.total,
  );

  return (
    <div className="pagination-controls">
      <button
        type="button"
        disabled={isLoading || !pagination.hasPreviousPage}
        onClick={() => onPageChange(pagination.page - 1)}
      >
        Previous
      </button>

      <span className="pagination-summary">
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <span>
          Showing {firstItem}-{lastItem} of {pagination.total}
        </span>
      </span>

      <button
        type="button"
        disabled={isLoading || !pagination.hasNextPage}
        onClick={() => onPageChange(pagination.page + 1)}
      >
        Next
      </button>
    </div>
  );
};
