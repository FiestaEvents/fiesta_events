import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

const Table = ({
  columns = [],
  data = [],
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
  loading = false,
  emptyMessage = "No data available",
  className = "",
}) => {
  const handleSort = (column) => {
    if (!column.sortable || !onSort) return;

    const newDirection =
      sortColumn === column.key && sortDirection === "asc" ? "desc" : "asc";

    onSort(column.key, newDirection);
  };

  const getSortIcon = (column) => {
    if (!column.sortable) return null;

    if (sortColumn === column.key) {
      return sortDirection === "asc" ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      );
    }

    return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Table Head */}
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                      column.sortable
                        ? "cursor-pointer select-none hover:bg-gray-100"
                        : ""
                    } ${column.headerClassName || ""}`}
                    onClick={() => handleSort(column)}
                    style={{ width: column.width }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                      {getSortIcon(column)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-8 w-8 text-purple-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr
                    key={row.id || rowIndex}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`${
                      onRowClick
                        ? "cursor-pointer hover:bg-gray-50 transition-colors"
                        : ""
                    }`}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-6 py-4 whitespace-nowrap text-sm ${column.cellClassName || ""}`}
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Table;
