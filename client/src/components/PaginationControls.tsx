import type { PaginationMeta } from "../types";

type PaginationControlsProps = {
  isLoading: boolean;
  onPageChange: (page: number) => void;
  pagination: PaginationMeta | null;
};

export const PaginationControls = ({
  isLoading,
  onPageChange,
  pagination,
}: PaginationControlsProps) => {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

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
        Page {pagination.page} of {pagination.totalPages}
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
