import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

function buildChartData(invoices) {
  const months = [];
  for (let i = 7; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    months.push({ month: format(d, "MMM"), start: startOfMonth(d), end: endOfMonth(d), revenue: 0, overdue: 0 });
  }
  invoices.forEach(inv => {
    const d = new Date(inv.created_date);
    const bucket = months.find(m => d >= m.start && d <= m.end);
    if (!bucket) return;
    if (inv.status === "paid") bucket.revenue += inv.total || inv.amount || 0;
    else if (inv.status === "overdue") bucket.overdue += inv.total || inv.amount || 0;
  });
  return months.map(({ month, revenue, overdue }) => ({ month, revenue, overdue }));
}

export default function RevenueChart({ invoices = [] }) {
  const data = buildChartData(invoices);
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