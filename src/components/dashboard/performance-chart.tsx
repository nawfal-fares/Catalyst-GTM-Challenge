"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function PerformanceChart({
  data,
}: {
  data: Array<{ date: string; impressions: number; icp: number }>;
}) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 800, height: 260 }}>
        <AreaChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="impressionFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#a3e635" stopOpacity={0.62} />
              <stop offset="100%" stopColor="#a3e635" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#00000014" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#737373", fontSize: 11 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#737373", fontSize: 11 }}
            tickFormatter={(value) => `${Math.round(value / 1000)}k`}
          />
          <Tooltip
            cursor={{ stroke: "#111", strokeDasharray: "3 3" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,.1)",
              boxShadow: "0 12px 32px rgba(0,0,0,.08)",
              fontSize: 12,
            }}
            formatter={(value) => Number(value).toLocaleString()}
          />
          <Area
            type="monotone"
            dataKey="impressions"
            stroke="#111111"
            strokeWidth={2.5}
            fill="url(#impressionFill)"
            activeDot={{ r: 4, fill: "#a3e635", stroke: "#111", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
