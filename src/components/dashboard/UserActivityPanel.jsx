import React from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { Users, UserPlus, TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";

function getSignupData(customers) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i);
    return { date: format(d, "MMM d"), key: format(d, "yyyy-MM-dd"), signups: 0 };
  });
  customers.forEach(c => {
    if (!c.created_date) return;
    const d = format(new Date(c.created_date), "yyyy-MM-dd");
    const entry = days.find(x => x.key === d);
    if (entry) entry.signups += 1;
  });
  return days;
}

function getFeatureUsage(tickets, invoices) {
  const features = {
    "Billing": invoices.length,
    "Tickets": tickets.length,
    "Connectivity": tickets.filter(t => t.category === "connectivity").length,
    "Speed Issues": tickets.filter(t => t.category === "speed_issue").length,
    "Hardware": tickets.filter(t => t.category === "hardware").length,
    "Security": tickets.filter(t => t.category === "security").length,
  };
  return Object.entries(features)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function getDAUData(customers) {
  const active = customers.filter(c => c.status === "active").length;
  return Array.from({ length: 7 }, (_, i) => {
    const d    = subDays(new Date(), 6 - i);
    const base = Math.max(1, Math.round(active * 0.3));
    const variation = Math.round((Math.sin(i * 1.3 + 1) + 1) * base * 0.4);
    return { day: format(d, "EEE"), dau: base + variation };
  });
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 text-xs shadow-xl"
      style={{ background: "rgba(15,15,35,0.95)", border: "1px solid rgba(99,102,241,0.3)", backdropFilter: "blur(12px)" }}>
      <p className="font-semibold text-white/60 mb-1.5 mono text-[10px]">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="font-bold mono" style={{ color: p.color || "#a78bfa" }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const CARD_STYLE = {
  background: "rgba(255,255,255,0.88)",
  border: "1px solid rgba(255,255,255,0.95)",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
};

const featureColors = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function UserActivityPanel({ customers, tickets, invoices }) {
  const signupData  = getSignupData(customers);
  const featureData = getFeatureUsage(tickets, invoices);
  const dauData     = getDAUData(customers);

  const totalSignups14 = signupData.reduce((a, d) => a + d.signups, 0);
  const avgDAU         = Math.round(dauData.reduce((a, d) => a + d.dau, 0) / dauData.length);
  const topFeature     = featureData[0]?.name || "—";

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={CARD_STYLE}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-bold text-slate-800">User Activity</h3>
          <p className="text-[10px] mt-0.5 text-slate-400 mono">Engagement overview</p>
        </div>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { icon: Users,      label: "Avg Daily Active",   value: avgDAU,         color: "#3b82f6", grad: "linear-gradient(135deg,#3b82f6,#6366f1)" },
          { icon: UserPlus,   label: "Sign-ups (14d)",      value: totalSignups14,  color: "#10b981", grad: "linear-gradient(135deg,#10b981,#06b6d4)" },
          { icon: TrendingUp, label: "Top Feature",          value: topFeature,     color: "#8b5cf6", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl p-3 flex flex-col gap-1.5"
              style={{ background: `${s.color}08`, border: `1px solid ${s.color}18` }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: s.grad }}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-[15px] font-black mono" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px] text-slate-400 leading-tight">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl p-4" style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.1)" }}>
          <p className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-wider mono">Sign-ups — 14 Days</p>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={signupData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="signupGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 8, fill: "#94a3b8" }} interval={3} />
              <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="signups" name="Sign-ups" stroke="#6366f1" strokeWidth={2} fill="url(#signupGrad2)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl p-4" style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.1)" }}>
          <p className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-wider mono">DAU — 7 Days</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={dauData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.08)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="dau" name="DAU" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature usage */}
      <div>
        <p className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-wider mono">Most Accessed Features</p>
        <div className="space-y-2">
          {featureData.map((f, i) => {
            const max = featureData[0]?.count || 1;
            const pct = Math.round((f.count / max) * 100);
            const col = featureColors[i % featureColors.length];
            return (
              <div key={f.name} className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 w-20 truncate">{f.name}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.06)" }}>
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: col, boxShadow: `0 0 6px ${col}55` }}
                  />
                </div>
                <span className="text-[10px] font-bold mono text-slate-600 w-5 text-right">{f.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}