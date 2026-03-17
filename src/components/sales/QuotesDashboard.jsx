import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  FunnelChart, Funnel, LabelList
} from "recharts";

const STATUS_ORDER = ["draft", "sent", "viewed", "accepted"];
const STATUS_LABELS = { draft: "Draft", sent: "Sent", viewed: "Viewed", accepted: "Accepted", declined: "Declined", expired: "Expired" };
const STATUS_COLORS = {
  draft: "#94a3b8",
  sent: "#3b82f6",
  viewed: "#8b5cf6",
  accepted: "#10b981",
  declined: "#ef4444",
  expired: "#f59e0b",
};

function getMonthlyRevenueData(quotes) {
  // Group accepted quotes by month, summing monthly rate (subtotal = monthly excl VAT)
  const map = {};
  quotes.filter(q => q.status === "accepted").forEach(q => {
    const monthlyRate = q.subtotal || q.total || 0;
    const date = q.created_date ? new Date(q.created_date) : new Date();
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleString("default", { month: "short", year: "2-digit" });
    if (!map[key]) map[key] = { key, label, revenue: 0, count: 0 };
    map[key].revenue += monthlyRate;
    map[key].count += 1;
  });
  return Object.values(map).sort((a, b) => a.key.localeCompare(b.key)).slice(-12);
}

function getFunnelData(quotes) {
  const total = quotes.length;
  return STATUS_ORDER.map(status => {
    const count = quotes.filter(q => q.status === status).length;
    const value = quotes.filter(q => q.status === status).reduce((s, q) => s + (q.subtotal || q.total || 0), 0);
    return { name: STATUS_LABELS[status], count, value, fill: STATUS_COLORS[status] };
  }).filter(d => d.count > 0 || STATUS_ORDER.includes(d.name?.toLowerCase()));
}

function getAllStatusCounts(quotes) {
  return Object.keys(STATUS_LABELS).map(status => ({
    status,
    label: STATUS_LABELS[status],
    count: quotes.filter(q => q.status === status).length,
    value: quotes.filter(q => q.status === status).reduce((s, q) => s + (q.subtotal || q.total || 0), 0),
    color: STATUS_COLORS[status],
  }));
}

export default function QuotesDashboard({ quotes }) {
  const funnelData = getFunnelData(quotes);
  const revenueData = getMonthlyRevenueData(quotes);
  const statusCounts = getAllStatusCounts(quotes);

  const totalQuotes = quotes.length;
  const acceptedCount = quotes.filter(q => q.status === "accepted").length;
  const conversionRate = totalQuotes > 0 ? ((acceptedCount / totalQuotes) * 100).toFixed(1) : 0;
  const totalAcceptedValue = quotes.filter(q => q.status === "accepted").reduce((s, q) => s + (q.subtotal || q.total || 0), 0);

  return (
    <div className="space-y-6">
      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statusCounts.map(s => (
          <div key={s.status} className="rounded-xl p-4 border" style={{ background: s.color + "10", borderColor: s.color + "30" }}>
            <p className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: s.color }}>{s.label}</p>
            {s.value > 0 && <p className="text-[10px] text-slate-400 mt-1 font-mono">R{s.value.toLocaleString()}</p>}
          </div>
        ))}
      </div>

      {/* Conversion Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl p-5 border bg-white" style={{ borderColor: "#10b98130" }}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Conversion Rate</p>
          <p className="text-4xl font-bold font-mono" style={{ color: "#10b981" }}>{conversionRate}%</p>
          <p className="text-xs text-slate-400 mt-1">{acceptedCount} of {totalQuotes} quotes accepted</p>
        </div>
        <div className="rounded-xl p-5 border bg-white" style={{ borderColor: "#3b82f630" }}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Monthly Recurring (Accepted)</p>
          <p className="text-3xl font-bold font-mono" style={{ color: "#3b82f6" }}>R{totalAcceptedValue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">excl. VAT per month</p>
        </div>
        <div className="rounded-xl p-5 border bg-white" style={{ borderColor: "#f59e0b30" }}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Pipeline Value</p>
          <p className="text-3xl font-bold font-mono" style={{ color: "#f59e0b" }}>
            R{quotes.filter(q => ["sent","viewed"].includes(q.status)).reduce((s, q) => s + (q.subtotal || q.total || 0), 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">quotes in progress</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Quote Conversion Funnel</h3>
          {funnelData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No quote data yet</div>
          ) : (
            <div className="space-y-2">
              {STATUS_ORDER.map(status => {
                const count = quotes.filter(q => q.status === status).length;
                const pct = totalQuotes > 0 ? (count / totalQuotes) * 100 : 0;
                const color = STATUS_COLORS[status];
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color }}>{STATUS_LABELS[status]}</span>
                      <span className="text-xs font-mono text-slate-500">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-7 overflow-hidden">
                      <div
                        className="h-full rounded-full flex items-center pl-3 text-white text-xs font-bold transition-all duration-500"
                        style={{ width: `${Math.max(pct, pct > 0 ? 8 : 0)}%`, background: color, minWidth: count > 0 ? "40px" : "0" }}
                      >
                        {count > 0 && `R${quotes.filter(q => q.status === status).reduce((s, q) => s + (q.subtotal || q.total || 0), 0).toLocaleString()}`}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Overall conversion</span>
                <span className="text-sm font-bold font-mono" style={{ color: "#10b981" }}>{conversionRate}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Revenue Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-700 mb-1">Expected Monthly Revenue</h3>
          <p className="text-xs text-slate-400 mb-4">From accepted quotes, grouped by month (excl. VAT)</p>
          {revenueData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No accepted quotes yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `R${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value) => [`R${value.toLocaleString()}`, "Monthly Revenue"]}
                  contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]} fill="#10b981">
                  {revenueData.map((entry, i) => (
                    <Cell key={i} fill="#10b981" fillOpacity={0.7 + (i / revenueData.length) * 0.3} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}