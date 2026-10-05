import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T, idx: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sortValue?: (item: T) => string | number;
  width?: string;
}

interface ReportDataTableProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  rightAction?: React.ReactNode;
}

export function ReportDataTable<T>({
  title,
  subtitle,
  data,
  columns,
  pageSize = 15,
  searchPlaceholder = 'Search records...',
  searchFilter,
  rightAction,
}: ReportDataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...data];
    if (search.trim() && searchFilter) {
      const q = search.toLowerCase();
      result = result.filter((item) => searchFilter(item, q));
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col && col.sortValue) {
        result.sort((a, b) => {
          const valA = col.sortValue!(a);
          const valB = col.sortValue!(b);
          if (typeof valA === 'number' && typeof valB === 'number') {
            return sortDir === 'asc' ? valA - valB : valB - valA;
          }
          const strA = String(valA || '').toLowerCase();
          const strB = String(valB || '').toLowerCase();
          return sortDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
        });
      }
    }
    return result;
  }, [data, search, searchFilter, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleHeaderClick = (col: Column<T>) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(col.key);
      setSortDir('desc');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden space-y-3">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          {searchFilter && (
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          )}
          {rightAction}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  onClick={() => handleHeaderClick(col)}
                  className={`py-3 px-4 ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } ${col.sortable ? 'cursor-pointer select-none hover:text-teal-800' : ''}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      <span className="text-teal-700 font-mono text-[10px]">
                        {sortDir === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paged.length > 0 ? (
              paged.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-2.5 px-4 ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {col.render(item, idx)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-gray-400 text-xs">
                  No records match your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
