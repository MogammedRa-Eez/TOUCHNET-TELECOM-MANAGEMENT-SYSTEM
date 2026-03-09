import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { TrendingUp } from "lucide-react";

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

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 shadow-xl" style={{ background: "rgba(15,23,42,0.92)", border: "1px solid rgba(99,102,241,0.3)", backdropFilter: "blur(8px)" }}>
      <p className="text-[11px] font-bold text-slate-400 mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[12px] font-semibold" style={{ color: p.stroke, fontFamily: "'JetBrains Mono', monospace" }}>
          {p.name === "revenue" ? "Revenue" : "Overdue"}: R{Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function RevenueChart({ invoices = [] }) {
  const data = buildChartData(invoices);
  const totalRev = data.reduce((a, d) => a + d.revenue, 0);

  return (
    <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)" }}>
      {/* Subtle bg gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6,182,212,0.04) 0%, transparent 70%)" }} />

      <div className="flex items-start justify-between mb-6 relative">
        <div>
          <h3 className="text-[14px] font-bold text-slate-800">Revenue Overview</h3>
          <p className="text-[11px] mt-0.5 text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Last 8 months performance</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
            <TrendingUp className="w-3 h-3 text-cyan-500" />
            <span className="text-[11px] font-bold text-cyan-600">R{(totalRev/1000).toFixed(1)}k total</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" style={{ boxShadow: "0 0 6px rgba(6,182,212,0.5)" }} />
              <span className="text-slate-500">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" style={{ boxShadow: "0 0 6px rgba(244,63,94,0.5)" }} />
              <span className="text-slate-500">Overdue</span>
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="overdueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }} tickFormatter={(v) => `R${v/1000}k`} width={52} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: "#06b6d4", strokeWidth: 2, stroke: "#fff" }} />
          <Area type="monotone" dataKey="overdue" stroke="#f43f5e" strokeWidth={2} fill="url(#overdueGrad)" dot={false} activeDot={{ r: 4, fill: "#f43f5e", strokeWidth: 2, stroke: "#fff" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}