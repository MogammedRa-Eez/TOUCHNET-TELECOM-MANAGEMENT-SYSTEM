import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area,
} from "recharts";
import { TrendingUp, DollarSign, CheckCircle2, Clock, BarChart3, Target, Zap } from "lucide-react";

const STATUS_LABELS = { draft: "Draft", sent: "Sent", viewed: "Viewed", accepted: "Accepted", declined: "Declined", expired: "Expired" };
const STATUS_COLORS = {
  draft:    "#64748b",
  sent:     "#0ea5e9",
  viewed:   "#8b5cf6",
  accepted: "#059669",
  declined: "#c41e3a",
  expired:  "#d97706",
};
const STATUS_ORDER = ["draft", "sent", "viewed", "accepted"];

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
    <div className="relative overflow-hidden rounded-2xl p-5 group transition-all duration-300 hover:-translate-y-1 holo-card bracket-card"
      style={{ background: "#ffffff", border: `1px solid ${color}25`, boxShadow: `0 4px 20px ${color}10` }}>
      <div className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}44, transparent)` }} />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full pointer-events-none transition-all duration-500 group-hover:scale-150 group-hover:opacity-100 opacity-50"
        style={{ background: `radial-gradient(circle, ${color}12, transparent 70%)` }} />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: "rgba(30,45,110,0.45)" }}>{label}</p>
          <p className="text-3xl font-black mono" style={{ color, fontFamily: "'JetBrains Mono',monospace" }}>{value}</p>
          {sub && <p className="text-[11px] mt-1.5" style={{ color: "rgba(30,45,110,0.5)" }}>{sub}</p>}
        </div>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
          style={{ background: `${color}12`, border: `1px solid ${color}25`, boxShadow: `0 4px 14px ${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 shadow-xl"
      style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.15)", minWidth: 140 }}>
      <p className="text-[11px] font-bold mb-2" style={{ color: "#1e2d6e", fontFamily: "'JetBrains Mono',monospace" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[11px] font-semibold" style={{ color: p.color || "#1e2d6e", fontFamily: "'JetBrains Mono',monospace" }}>
          R{Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function QuotesDashboard({ quotes }) {
  const revenueData  = getMonthlyRevenueData(quotes);
  const statusCounts = getAllStatusCounts(quotes);

  const totalQuotes        = quotes.length;
  const acceptedCount      = quotes.filter(q => q.status === "accepted").length;
  const conversionRate     = totalQuotes > 0 ? ((acceptedCount / totalQuotes) * 100).toFixed(1) : 0;
  const totalAcceptedValue = quotes.filter(q => q.status === "accepted").reduce((s, q) => s + (q.subtotal || q.total || 0), 0);
  const pipelineValue      = quotes.filter(q => ["sent","viewed"].includes(q.status)).reduce((s, q) => s + (q.subtotal || q.total || 0), 0);
  const avgDealSize        = acceptedCount > 0 ? Math.round(totalAcceptedValue / acceptedCount) : 0;

  const pieData = statusCounts.filter(s => s.count > 0).map(s => ({ name: s.label, value: s.count, fill: s.color }));

  return (
    <div className="space-y-6">

      {/* Status chip strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statusCounts.map(s => (
          <div key={s.status} className="relative overflow-hidden rounded-2xl p-4 transition-all hover:scale-[1.02] holo-card"
            style={{ background: "#ffffff", border: `1px solid ${s.color}25`, boxShadow: `0 2px 12px ${s.color}08` }}>
            <div className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: `linear-gradient(90deg,${s.color},transparent)` }} />
            <p className="text-2xl font-black mono" style={{ color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.count}</p>
            <p className="text-[11px] font-bold mt-0.5" style={{ color: s.color }}>{s.label}</p>
            {s.value > 0 && (
              <p className="text-[10px] mt-1 mono" style={{ color: "rgba(30,45,110,0.45)", fontFamily: "'JetBrains Mono',monospace" }}>
                R{s.value.toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Big 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Conversion Rate"   value={`${conversionRate}%`}           sub={`${acceptedCount} of ${totalQuotes} accepted`} color="#059669" icon={Target} />
        <StatCard label="Monthly Recurring" value={`R${(totalAcceptedValue/1000).toFixed(1)}k`} sub="Accepted (excl. VAT)"     color="#1e2d6e" icon={DollarSign} />
        <StatCard label="Pipeline Value"    value={`R${(pipelineValue/1000).toFixed(1)}k`}      sub="Sent & viewed quotes"     color="#d97706" icon={Clock} />
        <StatCard label="Avg Deal Size"     value={`R${avgDealSize.toLocaleString()}`}           sub="Per accepted quote"       color="#0ea5e9" icon={TrendingUp} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Conversion Funnel */}
        <div className="rounded-2xl overflow-hidden bracket-card"
          style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.12)", boxShadow: "0 4px 24px rgba(30,45,110,0.07)" }}>
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,transparent)" }} />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(30,45,110,0.07)", border: "1px solid rgba(30,45,110,0.15)" }}>
                <BarChart3 className="w-3.5 h-3.5" style={{ color: "#1e2d6e" }} />
              </div>
              <p className="text-[13px] font-black" style={{ color: "#0f1a3d" }}>Conversion Funnel</p>
            </div>
            {totalQuotes === 0 ? (
              <div className="h-40 flex items-center justify-center text-[13px]" style={{ color: "rgba(30,45,110,0.4)" }}>No quote data yet</div>
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
                        <span className="text-[10px] mono" style={{ color: "rgba(30,45,110,0.5)" }}>{count} · {pct.toFixed(0)}%</span>
                      </div>
                      <div className="w-full rounded-full h-6 overflow-hidden" style={{ background: "rgba(30,45,110,0.06)" }}>
                        <div className="h-full rounded-full flex items-center pl-2.5 text-white text-[10px] font-bold transition-all duration-700"
                          style={{ width: `${Math.max(pct, pct > 0 ? 8 : 0)}%`, background: `linear-gradient(90deg,${color}cc,${color})`, minWidth: count > 0 ? "36px" : "0", boxShadow: count > 0 ? `0 0 10px ${color}40` : "none" }}>
                          {count > 0 && val > 0 && `R${(val/1000).toFixed(0)}k`}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="mt-3 pt-3 flex items-center justify-between"
                  style={{ borderTop: "1px solid rgba(30,45,110,0.08)" }}>
                  <span className="text-[11px]" style={{ color: "rgba(30,45,110,0.45)" }}>Overall conversion</span>
                  <span className="text-[13px] font-black mono" style={{ color: "#059669", fontFamily: "'JetBrains Mono',monospace" }}>{conversionRate}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pie — Status Distribution */}
        <div className="rounded-2xl overflow-hidden bracket-card"
          style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.12)", boxShadow: "0 4px 24px rgba(30,45,110,0.07)" }}>
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#c41e3a,#e02347,transparent)" }} />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(196,30,58,0.07)", border: "1px solid rgba(196,30,58,0.15)" }}>
                <Target className="w-3.5 h-3.5" style={{ color: "#c41e3a" }} />
              </div>
              <p className="text-[13px] font-black" style={{ color: "#0f1a3d" }}>Status Distribution</p>
            </div>
            {pieData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-[13px]" style={{ color: "rgba(30,45,110,0.4)" }}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={42}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.85} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.15)", borderRadius: 10, color: "#0f1a3d", fontSize: 11, boxShadow: "0 8px 24px rgba(30,45,110,0.1)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Revenue — Area Chart */}
        <div className="rounded-2xl overflow-hidden bracket-card"
          style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.12)", boxShadow: "0 4px 24px rgba(30,45,110,0.07)" }}>
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#059669,#0ea5e9,transparent)" }} />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.15)" }}>
                <DollarSign className="w-3.5 h-3.5" style={{ color: "#059669" }} />
              </div>
              <p className="text-[13px] font-black" style={{ color: "#0f1a3d" }}>Monthly Revenue</p>
            </div>
            <p className="text-[10px] mb-4 mono pl-9" style={{ color: "rgba(30,45,110,0.45)" }}>Accepted quotes by month (excl. VAT)</p>
            {revenueData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-[13px]" style={{ color: "rgba(30,45,110,0.4)" }}>No accepted quotes yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={revenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#059669" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fill: "rgba(30,45,110,0.45)", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(30,45,110,0.4)", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `R${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(30,45,110,0.1)", strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2.5} fill="url(#revGrad)"
                    dot={{ r: 3, fill: "#059669", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#059669", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}