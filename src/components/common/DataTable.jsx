import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ListFilter } from 'lucide-react';

export const DataTable = ({
  columns,
  data = [],
  searchable = true,
  searchPlaceholder = "Search records...",
  onSearch,
  actionButton,
  defaultPageSize = 50
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const pageSizeOptions = [10, 25, 50, 75, 100, 150, 200, 250];

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-white border border-erp-border rounded-xs shadow-xs overflow-hidden">
      {/* Top Toolbar */}
      <div className="p-3 bg-erp-bg border-b border-erp-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {searchable && (
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder={searchPlaceholder}
                className="erp-input pl-8"
              />
              <Search className="absolute left-2.5 top-2.5 text-gray-400" size={15} />
            </div>
          )}

          {/* Rows Per Page Dropdown Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
            <ListFilter size={14} className="text-erp-primary" />
            <span>Show Rows:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="erp-select text-xs font-bold text-erp-primary py-1 px-2 bg-white"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size} rows
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {actionButton}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="erp-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width || 'auto' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-6 text-gray-500">
                  No records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIdx) => (
                <tr key={row._id || rIdx}>
                  {columns.map((col, cIdx) => (
                    <td key={cIdx}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-erp-bg border-t border-erp-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
        <div className="text-center sm:text-left">
          Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="erp-select text-xs font-bold text-erp-primary py-0.5 px-1.5 bg-white"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 border border-erp-border rounded-xs disabled:opacity-40 hover:bg-gray-200"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 font-semibold">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 border border-erp-border rounded-xs disabled:opacity-40 hover:bg-gray-200"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
