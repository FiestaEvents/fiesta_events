import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

/**
 * Professional Reusable Table Component with Pagination
 *
 * @param {Object} props
 * @param {Array} props.columns - Array of column definitions
 * @param {Array} props.data - Array of data objects to display
 * @param {boolean} props.loading - Loading state
 * @param {string} props.emptyMessage - Message when no data
 * @param {Function} props.onRowClick - Callback when row is clicked
 * @param {boolean} props.selectable - Enable row selection
 * @param {Function} props.onSelectionChange - Callback for selection changes
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.striped - Alternate row colors
 * @param {boolean} props.hoverable - Highlight on hover
 * @param {boolean} props.pagination - Enable pagination
 * @param {number} props.currentPage - Current page number (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.pageSize - Number of items per page
 * @param {number} props.totalItems - Total number of items
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {Function} props.onPageSizeChange - Callback when page size changes
 * @param {Array} props.pageSizeOptions - Available page size options
 */
const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No data available",
  onRowClick,
  selectable = false,
  onSelectionChange,
  className = "",
  striped = true,
  hoverable = true,
  // Pagination props
  pagination = false,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}) => {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Handle row selection
  const handleSelectRow = (id) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
    onSelectionChange?.(Array.from(newSelection));
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = new Set(data.map((row, idx) => row.id || row._id || idx));
      setSelectedRows(allIds);
      onSelectionChange?.(Array.from(allIds));
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Render cell content
  const renderCell = (row, column) => {
    if (column.render) {
      return column.render(row);
    }
    return row[column.accessor] ?? "-";
  };

  // Pagination calculations
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.size === data.length && data.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                  />
                </th>
              )}
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ${
                    column.sortable
                      ? "cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600"
                      : ""
                  }`}
                  onClick={() => column.sortable && handleSort(column.accessor)}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && (
                      <span className="text-gray-400">
                        {sortConfig.key === column.accessor
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIdx) => {
                const rowId = row.id || row._id || rowIdx;
                const isSelected = selectedRows.has(rowId);

                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick?.(row)}
                    className={`
                      border-b border-gray-100 dark:border-gray-700 last:border-0
                      ${striped && rowIdx % 2 === 1 ? "bg-gray-50 dark:bg-gray-700/35" : ""}
                      ${hoverable ? "hover:bg-gray-50 dark:hover:bg-gray-700" : ""}
                      ${onRowClick ? "cursor-pointer" : ""}
                      ${isSelected ? "bg-orange-50 dark:bg-orange-900/20" : ""}
                      transition-colors duration-150
                    `}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectRow(rowId);
                          }}
                          className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                        />
                      </td>
                    )}
                    {columns.map((column, colIdx) => (
                      <td
                        key={colIdx}
                        className={`px-4 py-3 text-sm ${column.className || ""}`}
                      >
                        {renderCell(row, column)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
          {/* Items info */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{startItem}</span> to{" "}
              <span className="font-medium">{endItem}</span> of{" "}
              <span className="font-medium">{totalItems}</span> results
            </div>

            {/* Page size selector */}
            {onPageSizeChange && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Per page:
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            {/* First page */}
            <button
              onClick={() => onPageChange?.(1)}
              disabled={!canGoPrevious}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="First page"
            >
              <ChevronsLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Previous page */}
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={!canGoPrevious}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous page"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => onPageChange?.(page)}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === page
                        ? "bg-orange-600 text-white font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            {/* Next page */}
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={!canGoNext}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next page"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Last page */}
            <button
              onClick={() => onPageChange?.(totalPages)}
              disabled={!canGoNext}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Last page"
            >
              <ChevronsRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
