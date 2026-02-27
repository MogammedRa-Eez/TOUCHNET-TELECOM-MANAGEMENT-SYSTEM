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
    <div className="rounded-xl p-6" style={{ background: "#0d1527", border: "1px solid rgba(6,182,212,0.12)" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-200">Revenue Overview</h3>
          <p className="text-[11px] mt-0.5" style={{ color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>Last 8 months performance</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-500">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: "#334155" }} />
            <span className="text-slate-500">Costs</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#334155" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.06)" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickFormatter={(v) => `$${v/1000}k`} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a1220',
              border: '1px solid rgba(6,182,212,0.2)',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '12px',
              padding: '10px 14px',
            }}
            formatter={(value) => [`$${value.toLocaleString()}`, '']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2} fill="url(#revGrad)" />
          <Area type="monotone" dataKey="costs" stroke="#334155" strokeWidth={1.5} fill="url(#costGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}