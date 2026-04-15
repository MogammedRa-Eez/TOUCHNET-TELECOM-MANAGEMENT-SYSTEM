import React, { useState } from "react";
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { format, subMonths, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { TrendingUp, Brain } from "lucide-react";

// Simple linear regression over [y0, y1, ...yn] => returns slope + intercept
function linearRegression(values) {
  const n = values.length;
  const xs = values.map((_, i) => i);
  const sumX = xs.reduce((a, x) => a + x, 0);
  const sumY = values.reduce((a, y) => a + y, 0);
  const sumXY = xs.reduce((a, x, i) => a + x * values[i], 0);
  const sumX2 = xs.reduce((a, x) => a + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function buildChartData(invoices) {
  const months = [];
  for (let i = 7; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    months.push({ month: format(d, "MMM"), start: startOfMonth(d), end: endOfMonth(d), revenue: 0, overdue: 0, paid: 0, total: 0 });
  }
  invoices.forEach(inv => {
    const d = new Date(inv.created_date);
    const bucket = months.find(m => d >= m.start && d <= m.end);
    if (!bucket) return;
    bucket.total += 1;
    if (inv.status === "paid") { bucket.revenue += inv.total || inv.amount || 0; bucket.paid += 1; }
    else if (inv.status === "overdue") bucket.overdue += inv.total || inv.amount || 0;
  });

  // Health score per month: high paid ratio + low overdue = healthy (0–100)
  return months.map(({ month, revenue, overdue, paid, total }) => {
    const paidRatio = total > 0 ? paid / total : 1;
    const overdueWeight = revenue > 0 ? Math.min(overdue / (revenue + overdue), 1) : 0;
    const health = Math.round((paidRatio * 0.6 + (1 - overdueWeight) * 0.4) * 100);
    return { month, revenue, overdue, health };
  });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 shadow-xl" style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.15)", minWidth: 160 }}>
      <p className="text-[11px] font-bold mb-2.5 border-b pb-1.5" style={{ color: "#1e2d6e", borderColor: "rgba(30,45,110,0.1)", fontFamily: "'JetBrains Mono', monospace" }}>{label}</p>
      {payload.map((p, i) => {
        if (p.value == null) return null;
        const labels = { revenue: "Revenue", overdue: "Overdue", health: "Health Score", predictedHealth: "Predicted Health" };
        const colors = { revenue: "#06b6d4", overdue: "#f43f5e", health: "#10b981", predictedHealth: "#4a5fa8" };
        const isRand = p.dataKey === "revenue" || p.dataKey === "overdue";
        return (
          <p key={i} className="text-[11px] font-semibold mb-0.5" style={{ color: colors[p.dataKey] || "#f1f5f9", fontFamily: "'JetBrains Mono', monospace" }}>
            {labels[p.dataKey] || p.dataKey}: {isRand ? `R${Number(p.value).toLocaleString()}` : `${Number(p.value).toFixed(1)}%`}
          </p>
        );
      })}
    </div>
  );
};

export default function RevenueChart({ invoices = [] }) {
  const [showPrediction, setShowPrediction] = useState(true);

  const historical = buildChartData(invoices);
  const healthValues = historical.map(d => d.health);
  const { slope, intercept } = linearRegression(healthValues);

  // Project 3 months forward
  const predictions = [1, 2, 3].map(offset => {
    const d = addMonths(new Date(), offset);
    const idx = historical.length + offset - 1;
    const predicted = Math.min(100, Math.max(0, Math.round(slope * idx + intercept)));
    return { month: format(d, "MMM"), revenue: null, overdue: null, health: null, predictedHealth: predicted, isForecast: true };
  });

  // Bridge: last historical point gets predictedHealth = its health value so line is continuous
  const data = historical.map((d, i) =>
    i === historical.length - 1
      ? { ...d, predictedHealth: d.health }
      : { ...d, predictedHealth: null }
  ).concat(predictions);

  const totalRev = historical.reduce((a, d) => a + d.revenue, 0);
  const lastHealth = healthValues[healthValues.length - 1] ?? 0;
  const trend = slope >= 0 ? "stable" : "declining";
  const trendColor = slope >= 0 ? "#10b981" : "#f59e0b";

  return (
    <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.1)", boxShadow: "0 4px 24px rgba(30,45,110,0.07)" }}>
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,#c41e3a,transparent)" }} />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5 relative">
        <div>
          <h3 className="text-[14px] font-bold" style={{ color: "#1e2d6e" }}>Revenue & Network Health</h3>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(30,45,110,0.45)", fontFamily: "'JetBrains Mono', monospace" }}>8-month history · 3-month AI forecast</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Predicted health toggle */}
          <button
            onClick={() => setShowPrediction(p => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
            style={{
              background: showPrediction ? "rgba(167,139,250,0.15)" : "rgba(148,163,184,0.1)",
              border: `1px solid ${showPrediction ? "rgba(167,139,250,0.4)" : "rgba(148,163,184,0.2)"}`,
              color: showPrediction ? "#a78bfa" : "#94a3b8",
            }}
          >
            <Brain className="w-3 h-3" />
            Predicted Health
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
            <TrendingUp className="w-3 h-3 text-cyan-500" />
            <span className="text-[11px] font-bold text-cyan-600">R{(totalRev / 1000).toFixed(1)}k</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-[11px]">
        {[
          { color: "#06b6d4", label: "Revenue", dashed: false },
          { color: "#f43f5e", label: "Overdue",  dashed: false },
          { color: "#10b981", label: "Health Score", dashed: false },
          ...(showPrediction ? [{ color: "#4a5fa8", label: "Predicted Health", dashed: true }] : []),
        ].map(({ color, label, dashed }) => (
          <div key={label} className="flex items-center gap-1.5">
            <svg width="18" height="8">
              <line x1="0" y1="4" x2="18" y2="4" stroke={color} strokeWidth="2" strokeDasharray={dashed ? "4 2" : "0"} />
            </svg>
            <span style={{ color: "rgba(30,45,110,0.55)" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Forecast zone label */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="overdueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />

            {/* Forecast zone divider */}
            <ReferenceLine yAxisId="left" x={historical[historical.length - 1].month} stroke="rgba(167,139,250,0.35)" strokeDasharray="4 3" label={{ value: "Forecast →", position: "insideTopRight", fontSize: 9, fill: "#a78bfa", fontFamily: "JetBrains Mono" }} />

            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }} />
            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }} tickFormatter={v => `R${v / 1000}k`} width={52} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a78bfa', fontFamily: 'JetBrains Mono' }} tickFormatter={v => `${v}%`} width={36} />

            <Tooltip content={<CustomTooltip />} />

            <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2.5} fill="url(#revGrad)" dot={false} connectNulls activeDot={{ r: 5, fill: "#06b6d4", strokeWidth: 2, stroke: "#fff" }} />
            <Area yAxisId="left" type="monotone" dataKey="overdue" stroke="#f43f5e" strokeWidth={2} fill="url(#overdueGrad)" dot={false} connectNulls activeDot={{ r: 4, fill: "#f43f5e", strokeWidth: 2, stroke: "#fff" }} />

            {/* Actual health */}
            <Line yAxisId="right" type="monotone" dataKey="health" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} connectNulls />

            {/* Predicted health */}
            {showPrediction && (
              <Line yAxisId="right" type="monotone" dataKey="predictedHealth" stroke="#4a5fa8" strokeWidth={2.5} strokeDasharray="6 3" dot={(props) => {
                const { cx, cy, payload } = props;
                if (!payload.isForecast) return <g key={`dot-${cx}`} />;
                return <circle key={`dot-${cx}`} cx={cx} cy={cy} r={4} fill="#a78bfa" stroke="#fff" strokeWidth={2} style={{ filter: "drop-shadow(0 0 4px #a78bfa)" }} />;
              }} connectNulls activeDot={{ r: 5, fill: "#a78bfa", stroke: "#fff", strokeWidth: 2 }} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Health insight pill */}
      <div className="mt-3 flex items-center gap-2 text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <Brain className="w-3.5 h-3.5" style={{ color: trendColor }} />
        <span style={{ color: "rgba(30,45,110,0.5)" }}>Network health is <span className="font-bold" style={{ color: trendColor }}>{trend}</span> at <span className="font-bold" style={{ color: trendColor }}>{lastHealth}%</span> — projected to {slope >= 0 ? "hold steady" : `drop ~${Math.abs(Math.round(slope * 3))}% over next 3 months`}</span>
      </div>
    </div>
  );
}