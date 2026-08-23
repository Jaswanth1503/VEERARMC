import React from "react";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

interface Column {
  key: string;
  header: string;
  render?: (val: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  title?: string;
  searchable?: boolean;
}

export function DataTable({ columns, data, title, searchable = true }: DataTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-concrete-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {title && <h3 className="font-semibold text-charcoal-black text-lg">{title}</h3>}
        
        <div className="flex items-center gap-3 ml-auto">
          {searchable && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-2 bg-concrete-50 border border-concrete-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/20 w-full sm:w-64"
              />
            </div>
          )}
          <button className="p-2 border border-concrete-200 rounded-lg hover:bg-concrete-50 text-concrete-600 transition-colors hidden sm:block">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-concrete-50/50">
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 text-xs font-semibold text-concrete-500 uppercase tracking-wider border-b border-concrete-100 whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-concrete-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-concrete-400 text-sm">
                  No data available.
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={row.id || i} className="hover:bg-concrete-50/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-black font-medium">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (Visual only for now) */}
      <div className="p-4 border-t border-concrete-100 flex items-center justify-between mt-auto">
        <p className="text-sm text-concrete-500">
          Showing <span className="font-medium text-charcoal-black">1</span> to <span className="font-medium text-charcoal-black">{Math.min(data.length, 10)}</span> of <span className="font-medium text-charcoal-black">{data.length}</span> results
        </p>
        <div className="flex gap-1">
          <button className="p-1 rounded-md text-concrete-400 hover:text-charcoal-black hover:bg-concrete-100 disabled:opacity-50" disabled>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="p-1 rounded-md text-concrete-400 hover:text-charcoal-black hover:bg-concrete-100">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
