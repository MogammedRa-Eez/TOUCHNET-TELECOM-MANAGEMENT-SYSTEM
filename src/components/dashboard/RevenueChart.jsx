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
    <div className="rounded-xl p-6" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-700">Revenue Overview</h3>
          <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>Last 8 months performance</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="text-slate-500">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-slate-500">Overdue</span>
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
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }} tickFormatter={(v) => `$${v/1000}k`} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '8px',
              color: '#1e293b',
              fontSize: '12px',
              padding: '10px 14px',
            }}
            formatter={(value) => [`$${value.toLocaleString()}`, '']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2} fill="url(#revGrad)" />
          <Area type="monotone" dataKey="overdue" stroke="#ef4444" strokeWidth={1.5} fill="url(#costGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}