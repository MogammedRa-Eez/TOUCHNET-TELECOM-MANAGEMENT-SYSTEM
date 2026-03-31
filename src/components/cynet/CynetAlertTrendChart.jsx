import React, { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { subHours, format, parseISO, isAfter } from "date-fns";

const SEVERITY_COLORS = {
  critical: "#ef4444",
  high:     "#f97316",
  medium:   "#f59e0b",
  low:      "#10b981",
};

function getSeverity(alert) {
  const s = (alert.severity || alert.Severity || alert.level || alert.Level || "").toString().toLowerCase();
  if (s === "critical" || s === "4" || s === "5") return "critical";
  if (s === "high"     || s === "3")              return "high";
  if (s === "medium"   || s === "2")              return "medium";
  return "low";
}

function getAlertTime(alert) {
  return alert.createdAt || alert.CreatedAt || alert.timestamp || alert.Timestamp || alert.created_at || alert.date || null;
}

export default function CynetAlertTrendChart({ alerts = [] }) {
  const chartData = useMemo(() => {
    const now = new Date();
    // Build 24 hourly buckets
    const buckets = Array.from({ length: 24 }, (_, i) => {
      const hour = subHours(now, 23 - i);
      return {
        label: format(hour, "HH:mm"),
        hour: hour,
        critical: 0, high: 0, medium: 0, low: 0,
      };
    });

    const cutoff = subHours(now, 24);

    alerts.forEach(alert => {
      const timeStr = getAlertTime(alert);
      if (!timeStr) return;
      let alertTime;
      try { alertTime = parseISO(timeStr); } catch { return; }
      if (!isAfter(alertTime, cutoff)) return;

      const sev = getSeverity(alert);
      const bucketIdx = buckets.findIndex((b, i) => {
        const next = buckets[i + 1];
        return next ? (alertTime >= b.hour && alertTime < next.hour) : alertTime >= b.hour;
      });
      if (bucketIdx >= 0) buckets[bucketIdx][sev]++;
    });

    return buckets.map(b => ({ label: b.label, critical: b.critical, high: b.high, medium: b.medium, low: b.low }));
  }, [alerts]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl p-3 text-xs" style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
        <p className="font-bold mb-2 mono" style={{ color: "#94a3b8" }}>{label}</p>
        {payload.map(p => (
          <div key={p.name} className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="capitalize font-semibold" style={{ color: p.color }}>{p.name}</span>
            <span className="ml-auto font-black mono" style={{ color: "white" }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(239,68,68,0.12)", boxShadow: "0 4px 24px rgba(239,68,68,0.06)" }}>
      <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#ef4444,#f97316,#f59e0b,#10b981,transparent)" }} />
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div>
          <p className="text-[14px] font-black" style={{ color: "#1e293b" }}>Alert Trend — Last 24 Hours</p>
          <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>{alerts.length} total alerts detected</p>
        </div>
        <div className="flex gap-3">
          {Object.entries(SEVERITY_COLORS).map(([sev, color]) => (
            <div key={sev} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[10px] font-bold capitalize" style={{ color: "#64748b" }}>{sev}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="px-2 pb-4" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {Object.entries(SEVERITY_COLORS).map(([sev, color]) => (
                <linearGradient key={sev} id={`grad-${sev}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.5)" />
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8", fontFamily: "monospace" }} interval={3} />
            <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            {Object.entries(SEVERITY_COLORS).map(([sev, color]) => (
              <Area key={sev} type="monotone" dataKey={sev} stroke={color} strokeWidth={2} fill={`url(#grad-${sev})`} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}