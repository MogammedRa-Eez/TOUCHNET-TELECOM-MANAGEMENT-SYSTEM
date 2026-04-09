import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from "recharts";
import { TrendingUp, DollarSign, CheckCircle2, Clock, BarChart3, Target } from "lucide-react";

const STATUS_ORDER  = ["draft", "sent", "viewed", "accepted"];
const STATUS_LABELS = { draft: "Draft", sent: "Sent", viewed: "Viewed", accepted: "Accepted", declined: "Declined", expired: "Expired" };
const STATUS_COLORS = {
  draft:    "#94a3b8",
  sent:     "#74b9ff",
  viewed:   "#d988fa",
  accepted: "#57f287",
  declined: "#ff7b7b",
  expired:  "#ffd460",
};

function getMonthlyRevenueData(quotes) {
  const map = {};
  quotes.filter(q => q.status === "accepted").forEach(q => {
    const monthly = q.subtotal || q.total || 0;
    const date  = q.created_date ? new Date(q.created_date) : new Date();
    const key   = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleString("default", { month: "short", year: "2-digit" });
    if (!map[key]) map[key] = { key, label, revenue: 0, count: 0 };
    map[key].revenue += monthly;
    map[key].count   += 1;
  });
  return Object.values(map).sort((a, b) => a.key.localeCompare(b.key)).slice(-12);
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

function StatCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5"
      style={{ background: "rgba(18,14,42,0.97)", border: `1px solid ${color}28`, boxShadow: `0 4px 20px ${color}10` }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg,${color},transparent)` }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-2" style={{ color: "rgba(203,181,253,0.5)" }}>{label}</p>
          <p className="text-3xl font-black mono" style={{ color }}>{value}</p>
          {sub && <p className="text-[11px] mt-1.5" style={{ color: "rgba(220,232,255,0.5)" }}>{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}14`, border: `1px solid ${color}28` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

export default function QuotesDashboard({ quotes }) {
  const revenueData  = getMonthlyRevenueData(quotes);
  const statusCounts = getAllStatusCounts(quotes);

  const totalQuotes       = quotes.length;
  const acceptedCount     = quotes.filter(q => q.status === "accepted").length;
  const conversionRate    = totalQuotes > 0 ? ((acceptedCount / totalQuotes) * 100).toFixed(1) : 0;
  const totalAcceptedValue = quotes.filter(q => q.status === "accepted").reduce((s, q) => s + (q.subtotal || q.total || 0), 0);
  const pipelineValue      = quotes.filter(q => ["sent","viewed"].includes(q.status)).reduce((s, q) => s + (q.subtotal || q.total || 0), 0);
  const avgDealSize        = acceptedCount > 0 ? Math.round(totalAcceptedValue / acceptedCount) : 0;

  const pieData = statusCounts.filter(s => s.count > 0).map(s => ({ name: s.label, value: s.count, fill: s.color }));

  return (
    <div className="space-y-6">

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statusCounts.map(s => (
          <div key={s.status} className="relative overflow-hidden rounded-2xl p-4 transition-all hover:scale-[1.02]"
            style={{ background: `${s.color}0c`, border: `1px solid ${s.color}28` }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg,${s.color},transparent)` }} />
            <p className="text-2xl font-black mono" style={{ color: s.color }}>{s.count}</p>
            <p className="text-[11px] font-bold mt-0.5" style={{ color: s.color }}>{s.label}</p>
            {s.value > 0 && <p className="text-[10px] mt-1 mono" style={{ color: "rgba(203,181,253,0.5)" }}>R{s.value.toLocaleString()}</p>}
          </div>
        ))}
      </div>

      {/* Big 4 stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Conversion Rate"      value={`${conversionRate}%`} sub={`${acceptedCount} of ${totalQuotes} accepted`} color="#57f287" icon={Target} />
        <StatCard label="Monthly Recurring"    value={`R${(totalAcceptedValue/1000).toFixed(1)}k`} sub="Accepted quotes (excl. VAT)" color="#b197fc" icon={DollarSign} />
        <StatCard label="Pipeline Value"       value={`R${(pipelineValue/1000).toFixed(1)}k`} sub="Sent & viewed quotes"  color="#ffd460" icon={Clock} />
        <StatCard label="Avg Deal Size"        value={`R${avgDealSize.toLocaleString()}`} sub="Per accepted quote"      color="#74b9ff" icon={TrendingUp} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Conversion funnel */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(16,12,36,0.97)", border: "1px solid rgba(177,151,252,0.22)" }}>
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#b197fc,#74b9ff,transparent)" }} />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4" style={{ color: "#b197fc" }} />
              <p className="text-[13px] font-black" style={{ color: "#f8f4ff" }}>Conversion Funnel</p>
            </div>
            {totalQuotes === 0 ? (
              <div className="h-40 flex items-center justify-center text-[13px]" style={{ color: "rgba(203,181,253,0.4)" }}>No quote data yet</div>
            ) : (
              <div className="space-y-3">
                {STATUS_ORDER.map(status => {
                  const count = quotes.filter(q => q.status === status).length;
                  const pct   = totalQuotes > 0 ? (count / totalQuotes) * 100 : 0;
                  const color = STATUS_COLORS[status];
                  const val   = quotes.filter(q => q.status === status).reduce((s, q) => s + (q.subtotal || q.total || 0), 0);
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold" style={{ color }}>{STATUS_LABELS[status]}</span>
                        <span className="text-[10px] mono" style={{ color: "rgba(203,181,253,0.5)" }}>{count} · {pct.toFixed(0)}%</span>
                      </div>
                      <div className="w-full rounded-full h-6 overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div
                          className="h-full rounded-full flex items-center pl-2.5 text-white text-[10px] font-bold transition-all duration-700"
                          style={{ width: `${Math.max(pct, pct > 0 ? 8 : 0)}%`, background: `linear-gradient(90deg,${color}cc,${color})`, minWidth: count > 0 ? "36px" : "0", boxShadow: count > 0 ? `0 0 10px ${color}55` : "none" }}
                        >
                          {count > 0 && val > 0 && `R${(val/1000).toFixed(0)}k`}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid rgba(177,151,252,0.12)" }}>
                  <span className="text-[11px]" style={{ color: "rgba(203,181,253,0.45)" }}>Overall conversion</span>
                  <span className="text-[13px] font-black mono" style={{ color: "#57f287" }}>{conversionRate}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pie chart */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(16,12,36,0.97)", border: "1px solid rgba(177,151,252,0.22)" }}>
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#d988fa,#b197fc,transparent)" }} />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4" style={{ color: "#d988fa" }} />
              <p className="text-[13px] font-black" style={{ color: "#f8f4ff" }}>Status Distribution</p>
            </div>
            {pieData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-[13px]" style={{ color: "rgba(203,181,253,0.4)" }}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.85} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "rgba(16,12,36,0.99)", border: "1px solid rgba(177,151,252,0.35)", borderRadius: 10, color: "#f0ecff", fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Revenue bar chart */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(16,12,36,0.97)", border: "1px solid rgba(177,151,252,0.22)" }}>
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#57f287,#00e5ff,transparent)" }} />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4" style={{ color: "#57f287" }} />
              <p className="text-[13px] font-black" style={{ color: "#f8f4ff" }}>Monthly Revenue</p>
            </div>
            <p className="text-[10px] mb-4 mono" style={{ color: "rgba(203,181,253,0.45)" }}>Accepted quotes by month (excl. VAT)</p>
            {revenueData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-[13px]" style={{ color: "rgba(203,181,253,0.4)" }}>No accepted quotes yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={revenueData} barSize={18} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fill: "#9b8fef", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9b8fef", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `R${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value) => [`R${value.toLocaleString()}`, "Monthly Revenue"]}
                    contentStyle={{ background: "rgba(16,12,36,0.99)", border: "1px solid rgba(177,151,252,0.35)", borderRadius: 10, color: "#f0ecff", fontSize: 11 }}
                    cursor={{ fill: "rgba(177,151,252,0.07)" }}
                  />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {revenueData.map((entry, i) => (
                      <Cell key={i} fill="#57f287" fillOpacity={0.7 + (i / revenueData.length) * 0.3} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}