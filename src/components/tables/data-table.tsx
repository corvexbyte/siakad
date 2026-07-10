"use client";

import React, { useState } from "react";
import { Pagination } from "./pagination";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  pageSize?: number;
}

export function DataTable<T extends object>({
  columns,
  data,
  emptyMessage = "Tidak ada data",
  pageSize = 10,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-8 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-100">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr key={i} className="border-b last:border-0 transition-colors hover:bg-accent/40">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-foreground">
                    {col.render
                      ? col.render(row)
                      : String(
                          (row as Record<string, unknown>)[String(col.key)] ??
                            "—",
                        )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        totalItems={data.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
