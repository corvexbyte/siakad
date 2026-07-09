import React from "react";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function DataTable<T extends object>({
  columns,
  data,
  emptyMessage = "Tidak ada data",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-8 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-card shadow">
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
          {data.map((row, i) => (
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
  );
}
