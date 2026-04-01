import React, { useState, useMemo, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from "recharts";
import {
  BarChart3, TrendingUp, AlertTriangle, Bell, BellOff,
  CheckCircle2, Zap, Calendar, Clock, Info, Save
} from "lucide-react";

const PLAN_ALLOCATIONS = {
  basic_10mbps:       { gb: 50,   label: "Basic 10 Mbps" },
  standard_50mbps:    { gb: 200,  label: "Standard 50 Mbps" },
  premium_100mbps:    { gb: 500,  label: "Premium 100 Mbps" },
  enterprise_500mbps: { gb: 2000, label: "Enterprise 500 Mbps" },
  dedicated_1gbps:    { gb: null, label: "Dedicated 1 Gbps" }, // unlimited
};

const ALERT_STORAGE_KEY = (customerId) => `data_usage_alert_${customerId}`;

// Simulate realistic usage data seeded by customer id so it's stable across renders
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateDailyData(customerId, days = 30) {
  const rng = seededRandom(customerId.charCodeAt(0) * 31 + customerId.charCodeAt(1) * 17);
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    // Weekends slightly higher
    const base = dow === 0 || dow === 6 ? 6 : 4;
    const usage = parseFloat((base + rng() * 5).toFixed(2));
    // Occasional spike
    const isSpike = rng() > 0.88;
    result.push({
      date: d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" }),
      usage: isSpike ? parseFloat((usage * 2.5).toFixed(2)) : usage,
      isSpike,
    });
  }
  return result;
}

function aggregateWeekly(dailyData) {
  const weeks = [];
  for (let i = 0; i < dailyData.length; i += 7) {
    const chunk = dailyData.slice(i, i + 7);
    const total = chunk.reduce((s, d) => s + d.usage, 0);
    const hasSpike = chunk.some(d => d.isSpike);
    weeks.push({
      label: `Week ${Math.floor(i / 7) + 1}`,
      usage: parseFloat(total.toFixed(2)),
      hasSpike,
    });
  }
  return weeks;
}

function aggregateMonthly(dailyData) {
  // Group by month label (we only have 1 month of data here, fake 6 months)
  // We'll simulate 6 months from the 30-day seed
  const rng = seededRandom(dailyData.reduce((a, d) => a + d.usage, 0) | 0);
  const now = new Date();
  const months = [];
  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const label = d.toLocaleDateString("en-ZA", { month: "short", year: "2-digit" });
    const base = dailyData.reduce((a, x) => a + x.usage, 0) / 30;
    const usage = parseFloat(((base * 30) * (0.8 + rng() * 0.4)).toFixed(2));
    months.push({ label, usage });
  }
  return months;
}

const CustomTooltip = ({ active, payload, label, unit = "GB" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 shadow-xl"
      style={{ background: "rgba(255,255,255,0.98)", border: "1px solid rgba(99,102,241,0.18)", fontSize: 12 }}>
      <p className="font-bold mb-1" style={{ color: "#1e293b" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#6366f1" }}>
          {p.name}: <strong>{p.value} {unit}</strong>
        </p>
      ))}
    </div>
  );
};

function SpikeList({ dailyData }) {
  const spikes = dailyData.filter(d => d.isSpike).slice(-5);
  if (!spikes.length) return null;
  return (
    <div className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(245,158,11,0.2)", boxShadow: "0 2px 16px rgba(245,158,11,0.06)" }}>
      <div className="h-[2px] -mx-5 -mt-5 mb-4 rounded-t-2xl"
        style={{ background: "linear-gradient(90deg,#f59e0b,#ef4444,transparent)" }} />
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)" }}>
          <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
        </div>
        <p className="text-[14px] font-black" style={{ color: "#1e293b" }}>Data Spikes Detected</p>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold"
          style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
          Last 30 days
        </span>
      </div>
      <div className="space-y-2">
        {spikes.map((spike, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <Zap className="w-4 h-4 flex-shrink-0" style={{ color: "#f59e0b" }} />
            <div className="flex-1">
              <p className="text-[12px] font-bold" style={{ color: "#92400e" }}>{spike.date}</p>
              <p className="text-[10px]" style={{ color: "#94a3b8" }}>Unusually high usage detected</p>
            </div>
            <span className="text-[13px] font-black mono" style={{ color: "#f59e0b" }}>{spike.usage} GB</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertSettings({ customerId, allocation }) {
  const key = ALERT_STORAGE_KEY(customerId);
  const [enabled, setEnabled] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key))?.enabled ?? false; } catch { return false; }
  });
  const [threshold, setThreshold] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key))?.threshold ?? 80; } catch { return 80; }
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    localStorage.setItem(key, JSON.stringify({ enabled, threshold }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.97)", border: `1px solid ${enabled ? "rgba(99,102,241,0.25)" : "rgba(226,232,240,0.8)"}`, boxShadow: "0 2px 16px rgba(99,102,241,0.06)" }}>
      <div className="h-[2px] -mx-5 -mt-5 mb-4 rounded-t-2xl"
        style={{ background: enabled ? "linear-gradient(90deg,#6366f1,#8b5cf6,transparent)" : "linear-gradient(90deg,rgba(226,232,240,0.8),transparent)" }} />
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: enabled ? "rgba(99,102,241,0.12)" : "rgba(226,232,240,0.6)", border: `1px solid ${enabled ? "rgba(99,102,241,0.25)" : "rgba(226,232,240,0.8)"}` }}>
          {enabled
            ? <Bell className="w-5 h-5" style={{ color: "#6366f1" }} />
            : <BellOff className="w-5 h-5" style={{ color: "#94a3b8" }} />}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[14px] font-black" style={{ color: "#1e293b" }}>Data Usage Alert</p>
              <p className="text-[11px] mt-0.5" style={{ color: "#64748b" }}>
                Get notified when you exceed {threshold}% of your typical monthly allocation
              </p>
            </div>
            {/* Toggle */}
            <button
              onClick={() => setEnabled(v => !v)}
              className="relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-200"
              style={{ background: enabled ? "#6366f1" : "#e2e8f0" }}>
              <span className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                style={{ left: enabled ? "calc(100% - 20px)" : "4px" }} />
            </button>
          </div>

          {enabled && (
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#94a3b8" }}>Alert Threshold</label>
                  <span className="text-[12px] font-black mono" style={{ color: "#6366f1" }}>{threshold}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={95}
                  step={5}
                  value={threshold}
                  onChange={e => setThreshold(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "#6366f1" }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[9px]" style={{ color: "#cbd5e1" }}>50%</span>
                  <span className="text-[9px]" style={{ color: "#cbd5e1" }}>95%</span>
                </div>
              </div>

              {allocation && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)" }}>
                  <Info className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#6366f1" }} />
                  <p className="text-[11px]" style={{ color: "#475569" }}>
                    Alert will fire at <strong>{Math.round(allocation * threshold / 100)} GB</strong> of {allocation} GB allocation
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={save}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:scale-105 active:scale-95"
            style={{
              background: saved ? "rgba(16,185,129,0.1)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: saved ? "#10b981" : "white",
              border: saved ? "1px solid rgba(16,185,129,0.25)" : "none",
              boxShadow: saved ? "none" : "0 4px 12px rgba(99,102,241,0.3)",
            }}>
            {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Preferences</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DataUsageDashboard({ customer }) {
  const [view, setView] = useState("daily");

  const planAlloc = PLAN_ALLOCATIONS[customer?.service_plan] || { gb: 500, label: "Unknown" };
  const isUnlimited = planAlloc.gb === null;

  const dailyData = useMemo(() => generateDailyData(customer?.id || "default"), [customer?.id]);
  const weeklyData = useMemo(() => aggregateWeekly(dailyData), [dailyData]);
  const monthlyData = useMemo(() => aggregateMonthly(dailyData), [dailyData]);

  const currentMonthUsage = dailyData.reduce((a, d) => a + d.usage, 0);
  const usagePct = isUnlimited ? 0 : Math.min((currentMonthUsage / planAlloc.gb) * 100, 100);
  const avgDaily = (currentMonthUsage / dailyData.length).toFixed(2);
  const projectedMonth = ((currentMonthUsage / dailyData.length) * 30).toFixed(1);
  const spikeCount = dailyData.filter(d => d.isSpike).length;

  const chartData = view === "daily" ? dailyData : view === "weekly" ? weeklyData : monthlyData;
  const chartKey = view === "daily" ? "date" : "label";
  const usageColor = usagePct > 90 ? "#ef4444" : usagePct > 75 ? "#f59e0b" : "#6366f1";

  return (
    <div className="space-y-5">
      {/* Summary KPI bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: BarChart3,
            label: "This Month",
            value: `${currentMonthUsage.toFixed(1)} GB`,
            sub: isUnlimited ? "Unlimited plan" : `of ${planAlloc.gb} GB`,
            color: usageColor,
          },
          {
            icon: TrendingUp,
            label: "Projected",
            value: `${projectedMonth} GB`,
            sub: "By end of month",
            color: "#8b5cf6",
          },
          {
            icon: Clock,
            label: "Avg Daily",
            value: `${avgDaily} GB`,
            sub: "30-day average",
            color: "#06b6d4",
          },
          {
            icon: AlertTriangle,
            label: "Data Spikes",
            value: spikeCount,
            sub: "Unusual surges",
            color: spikeCount > 0 ? "#f59e0b" : "#10b981",
          },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="rounded-2xl p-4 relative overflow-hidden"
              style={{ background: "rgba(255,255,255,0.97)", border: `1px solid ${kpi.color}20`, boxShadow: `0 2px 16px ${kpi.color}08` }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, ${kpi.color}, ${kpi.color}44, transparent)` }} />
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                style={{ background: `${kpi.color}12`, border: `1px solid ${kpi.color}20` }}>
                <Icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
              <p className="text-[20px] font-black mono leading-none" style={{ color: kpi.color }}>{kpi.value}</p>
              <p className="text-[11px] font-bold mt-1" style={{ color: "#1e293b" }}>{kpi.label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "#94a3b8" }}>{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Usage gauge (only for capped plans) */}
      {!isUnlimited && (
        <div className="rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.97)", border: `1px solid ${usageColor}20` }}>
          <div className="h-[2px] -mx-5 -mt-5 mb-4 rounded-t-2xl"
            style={{ background: `linear-gradient(90deg, ${usageColor}, ${usageColor}55, transparent)` }} />
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-black" style={{ color: "#1e293b" }}>Monthly Allocation</p>
            <span className="text-[12px] font-black mono" style={{ color: usageColor }}>{usagePct.toFixed(1)}%</span>
          </div>
          <div className="h-4 rounded-full overflow-hidden" style={{ background: "rgba(226,232,240,0.8)" }}>
            <div className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
              style={{ width: `${usagePct}%`, background: `linear-gradient(90deg, ${usageColor}, ${usageColor}bb)` }}>
              <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent 70%, rgba(255,255,255,0.2))" }} />
            </div>
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] mono" style={{ color: "#94a3b8" }}>{currentMonthUsage.toFixed(1)} GB used</span>
            <span className="text-[10px] mono" style={{ color: "#94a3b8" }}>{planAlloc.gb} GB total</span>
          </div>
          {usagePct > 80 && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: `${usageColor}08`, border: `1px solid ${usageColor}25` }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: usageColor }} />
              <p className="text-[12px] font-semibold" style={{ color: usageColor }}>
                {usagePct > 90 ? "Critical: " : "Warning: "}
                You've used {usagePct.toFixed(0)}% of your monthly allocation this month.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Chart section */}
      <div className="rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(99,102,241,0.12)", boxShadow: "0 2px 16px rgba(99,102,241,0.06)" }}>
        <div className="h-[2px] -mx-5 -mt-5 mb-4 rounded-t-2xl"
          style={{ background: "linear-gradient(90deg,#6366f1,#06b6d4,transparent)" }} />

        {/* View toggle */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)" }}>
              <BarChart3 className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />
            </div>
            <p className="text-[14px] font-black" style={{ color: "#1e293b" }}>Bandwidth Consumption</p>
          </div>
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(99,102,241,0.15)" }}>
            {[
              { key: "daily", icon: Clock, label: "Daily" },
              { key: "weekly", icon: Calendar, label: "Weekly" },
              { key: "monthly", icon: TrendingUp, label: "Monthly" },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = view === tab.key;
              return (
                <button key={tab.key}
                  onClick={() => setView(tab.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold transition-all"
                  style={{
                    background: isActive ? "#6366f1" : "transparent",
                    color: isActive ? "white" : "#94a3b8",
                  }}>
                  <Icon className="w-3 h-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          {view === "daily" ? (
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.07)" />
              <XAxis dataKey={chartKey} tick={{ fontSize: 9, fill: "#94a3b8" }} interval={4} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} unit=" GB" />
              <Tooltip content={<CustomTooltip unit="GB" />} />
              {!isUnlimited && (
                <ReferenceLine
                  y={planAlloc.gb * 0.8 / 30}
                  stroke="#f59e0b"
                  strokeDasharray="4 3"
                  label={{ value: "80% avg", position: "insideRight", fontSize: 9, fill: "#f59e0b" }}
                />
              )}
              <Area
                type="monotone"
                dataKey="usage"
                name="Usage"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#usageGrad)"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (!payload.isSpike) return <circle key={`dot-${cx}-${cy}`} r={0} />;
                  return (
                    <circle key={`spike-${cx}-${cy}`} cx={cx} cy={cy} r={4}
                      fill="#f59e0b" stroke="white" strokeWidth={1.5} />
                  );
                }}
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.07)" />
              <XAxis dataKey={chartKey} tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} unit=" GB" />
              <Tooltip content={<CustomTooltip unit="GB" />} />
              <Bar dataKey="usage" name="Usage" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.hasSpike ? "#f59e0b" : "#6366f1"} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>

        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: "#6366f1" }} />
            <span className="text-[10px]" style={{ color: "#94a3b8" }}>Normal usage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
            <span className="text-[10px]" style={{ color: "#94a3b8" }}>Data spike</span>
          </div>
          {!isUnlimited && (
            <div className="flex items-center gap-1.5">
              <span className="w-6 border-t-2 border-dashed" style={{ borderColor: "#f59e0b" }} />
              <span className="text-[10px]" style={{ color: "#94a3b8" }}>80% daily threshold</span>
            </div>
          )}
        </div>
      </div>

      {/* Spike list */}
      <SpikeList dailyData={dailyData} />

      {/* Alert settings */}
      <AlertSettings customerId={customer?.id || "default"} allocation={isUnlimited ? null : planAlloc.gb} />
    </div>
  );
}