import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jul", revenue: 32000, costs: 18000 },
  { month: "Aug", revenue: 35000, costs: 19000 },
  { month: "Sep", revenue: 38000, costs: 20000 },
  { month: "Oct", revenue: 41000, costs: 19500 },
  { month: "Nov", revenue: 44000, costs: 21000 },
  { month: "Dec", revenue: 48000, costs: 22000 },
  { month: "Jan", revenue: 52000, costs: 23000 },
  { month: "Feb", revenue: 55000, costs: 24000 },
];

export default function RevenueChart() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Revenue Overview</h3>
          <p className="text-xs text-slate-400 mt-0.5">Last 8 months performance</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-500">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="text-slate-500">Costs</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `$${v/1000}k`} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '12px',
              padding: '10px 14px',
            }}
            formatter={(value) => [`$${value.toLocaleString()}`, '']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revGrad)" />
          <Area type="monotone" dataKey="costs" stroke="#94a3b8" strokeWidth={2} fill="url(#costGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}