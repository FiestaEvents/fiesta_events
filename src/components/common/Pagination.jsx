import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showFirstLast = true,
  maxVisible = 5,
  className = '',
}) => {
  const getVisiblePages = () => {
    const pages = [];
    const half = Math.floor(maxVisible / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i); // FIXED: Removed the 'd' character
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  if (totalPages <= 1) return null;

  return (
    <nav className={`flex items-center justify-center gap-1 ${className}`}> {/* FIXED: Added curly brace */}
      {/* First Page */}
      {showFirstLast && (
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-secondary-300 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-secondary-700"
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
      )}

      {/* Previous Page */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-secondary-300 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-secondary-700"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* First page indicator with ellipsis */}
      {visiblePages[0] > 1 && (
        <>
          <button
            onClick={() => handlePageChange(1)}
            className="px-3 py-2 rounded-lg border border-secondary-300 hover:bg-secondary-50 text-sm font-medium transition-colors text-secondary-700"
          >
            1
          </button>
          {visiblePages[0] > 2 && (
            <span className="px-2 text-secondary-500">...</span>
          )}
        </>
      )}

      {/* Page Numbers */}
      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
            page === currentPage
              ? 'bg-primary-600 text-white border-primary-600'
              : 'border-secondary-300 hover:bg-secondary-50 text-secondary-700'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Last page indicator with ellipsis */}
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-2 text-secondary-500">...</span>
          )}
          <button
            onClick={() => handlePageChange(totalPages)}
            className="px-3 py-2 rounded-lg border border-secondary-300 hover:bg-secondary-50 text-sm font-medium transition-colors text-secondary-700"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Page */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-secondary-300 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-secondary-700"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Last Page */}
      {showFirstLast && (
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-secondary-300 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-secondary-700"
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      )}
    </nav>
  );
};

export default Pagination;