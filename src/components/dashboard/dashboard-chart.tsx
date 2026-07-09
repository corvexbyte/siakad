"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardChartProps {
  data: { label: string; value: number }[];
}

export function DashboardChart({ data }: DashboardChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "hsl(215 16% 47%)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "hsl(215 16% 47%)" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "0.5rem",
            border: "1px solid hsl(214 32% 91%)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            fontSize: "13px",
          }}
          cursor={{ fill: "hsl(210 40% 96%)" }}
        />
        <Bar
          dataKey="value"
          fill="hsl(221 83% 53%)"
          radius={[4, 4, 0, 0]}
          name="Jumlah"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
