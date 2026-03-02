import React from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { Users, UserPlus, TrendingUp } from "lucide-react";
import { format, subDays, parseISO, isValid } from "date-fns";

// Derive daily sign-ups from customers created_date over last 14 days
function getSignupData(customers) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i);
    return { date: format(d, "MMM d"), key: format(d, "yyyy-MM-dd"), signups: 0 };
  });
  customers.forEach((c) => {
    if (!c.created_date) return;
    const d = format(new Date(c.created_date), "yyyy-MM-dd");
    const entry = days.find((x) => x.key === d);
    if (entry) entry.signups += 1;
  });
  return days;
}

// Feature usage based on ticket categories + billing activity
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

// Simulate DAU from customer activity — spread customers across last 7 days with some variation
function getDAUData(customers) {
  const active = customers.filter(c => c.status === "active").length;
  return Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const base = Math.max(1, Math.round(active * 0.3));
    const variation = Math.round((Math.sin(i * 1.3 + 1) + 1) * base * 0.4);
    return { day: format(d, "EEE"), dau: base + variation };
  });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-lg"
      style={{ background: "#1e2a4a", border: "1px solid rgba(220,38,38,0.3)", color: "#fff" }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function UserActivityPanel({ customers, tickets, invoices }) {
  const signupData = getSignupData(customers);
  const featureData = getFeatureUsage(tickets, invoices);
  const dauData = getDAUData(customers);

  const totalSignupsLast14 = signupData.reduce((a, d) => a + d.signups, 0);
  const avgDAU = Math.round(dauData.reduce((a, d) => a + d.dau, 0) / dauData.length);
  const topFeature = featureData[0]?.name || "—";

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full" style={{ background: "#dc2626" }} />
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}>User Activity</h2>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Users, label: "Avg Daily Active", value: avgDAU, color: "#3b82f6" },
          { icon: UserPlus, label: "New Sign-ups (14d)", value: totalSignupsLast14, color: "#10b981" },
          { icon: TrendingUp, label: "Top Feature", value: topFeature, color: "#dc2626" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl p-4 flex flex-col gap-2"
              style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${s.color}18` }}>
                <Icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="text-lg font-bold text-slate-800">{s.value}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sign-ups over 14 days */}
        <div className="rounded-xl p-5"
          style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <p className="text-xs font-semibold text-slate-600 mb-4">New Sign-ups — Last 14 Days</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={signupData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} interval={2} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="signups" name="Sign-ups"
                stroke="#dc2626" strokeWidth={2} fill="url(#signupGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* DAU last 7 days */}
        <div className="rounded-xl p-5"
          style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <p className="text-xs font-semibold text-slate-600 mb-4">Daily Active Users — Last 7 Days</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dauData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="dau" name="DAU" fill="#1e2a4a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature usage */}
      <div className="rounded-xl p-5"
        style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <p className="text-xs font-semibold text-slate-600 mb-4">Most Accessed Features</p>
        <div className="space-y-2.5">
          {featureData.map((f, i) => {
            const max = featureData[0]?.count || 1;
            const pct = Math.round((f.count / max) * 100);
            const colors = ["#dc2626", "#1e2a4a", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
            return (
              <div key={f.name} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-24 truncate">{f.name}</span>
                <div className="flex-1 h-2 rounded-full" style={{ background: "#f1f5f9" }}>
                  <div className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                </div>
                <span className="text-xs font-semibold text-slate-600 w-6 text-right">{f.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}