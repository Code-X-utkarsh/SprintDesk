import React from 'react';
import { cn } from '../../utils/cn';
import { Skeleton } from './Skeleton';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  rowKey?: (row: T, index: number) => string | number;
  className?: string;
}

/**
 * Generic Reusable Responsive DataTable Primitive Component
 */
export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data records found.',
  rowKey,
  className,
}: DataTableProps<T>) {
  const getRowKey = (row: T, index: number): string | number => {
    if (rowKey) return rowKey(row, index);
    if (typeof row === 'object' && row !== null && 'id' in row) {
      return String((row as Record<string, unknown>).id);
    }
    return index;
  };

  return (
    <div className={cn('w-full overflow-hidden border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs', className)}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
            <tr>
              {columns.map((col, i) => (
                <th key={i} scope="col" className={cn('px-4 py-3', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, r) => (
                <tr key={r} className="animate-pulse">
                  {columns.map((_, c) => (
                    <td key={c} className="px-4 py-3.5">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <p className="text-sm font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={cn('px-4 py-3.5 whitespace-nowrap', col.className)}>
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                        ? String(row[col.accessorKey] ?? '')
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
