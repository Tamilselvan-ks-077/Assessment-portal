import React from 'react';
import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 text-sm text-slate-600">
      {totalItems !== undefined && pageSize !== undefined && (
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> to{' '}
          <span className="font-semibold text-slate-700">
            {Math.min(currentPage * pageSize, totalItems)}
          </span>{' '}
          of <span className="font-semibold text-slate-700">{totalItems}</span> results
        </div>
      )}

      <div className="flex items-center gap-1.5 ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Previous
        </Button>

        <div className="flex items-center gap-1 px-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((page, index, array) => {
              const showEllipsis = index > 0 && page - array[index - 1] > 1;
              return (
                <React.Fragment key={page}>
                  {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                  <button
                    type="button"
                    onClick={() => onPageChange(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
