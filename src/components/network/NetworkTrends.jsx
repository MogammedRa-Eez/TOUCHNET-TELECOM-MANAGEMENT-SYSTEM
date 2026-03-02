import React, { useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { TrendingUp, Users, Activity } from "lucide-react";
import { subDays, format } from "date-fns";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-xl"
      style={{ background: "#1e2a4a", border: "1px solid rgba(220,38,38,0.3)", color: "#fff" }}>
      <p className="font-semibold mb-1 text-slate-300">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

export default function NetworkTrends({ nodes }) {
  // Build historical trend data from node snapshots (simulated from current values)
  const capacityTrend = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const date = format(subDays(new Date(), (7 - i) * 4), "MMM d");
      const growthFactor = 0.7 + i * 0.04 + Math.sin(i) * 0.05;
      const totalConnected = nodes.reduce((a, n) => a + (n.connected_customers || 0), 0);
      const totalCapacity = nodes.reduce((a, n) => a + (n.max_capacity || 0), 0);
      return {
        date,
        connected: Math.round(totalConnected * growthFactor),
        capacity: totalCapacity,
        utilization: totalCapacity > 0 ? Math.round((totalConnected * growthFactor / totalCapacity) * 100) : 0,
      };
    });
  }, [nodes]);

  const bandwidthTrend = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = format(subDays(new Date(), (11 - i) * 3), "MMM d");
      const avgBw = nodes.reduce((a, n) => a + (n.bandwidth_utilization || 0), 0) / Math.max(1, nodes.length);
      const factor = 0.6 + i * 0.035 + Math.sin(i * 0.8) * 0.1;
      return {
        date,
        avg_bandwidth: parseFloat((avgBw * factor).toFixed(1)),
        peak: parseFloat(Math.min(100, avgBw * factor * 1.35).toFixed(1)),
      };
    });
  }, [nodes]);

  const onlineCount = nodes.filter(n => n.status === "online").length;
  const totalCapacity = nodes.reduce((a, n) => a + (n.max_capacity || 0), 0);
  const totalConnected = nodes.reduce((a, n) => a + (n.connected_customers || 0), 0);
  const capacityUsedPct = totalCapacity > 0 ? Math.round((totalConnected / totalCapacity) * 100) : 0;

  // Project capacity needs: if current growth rate continues
  const projectedFull = capacityUsedPct > 0 ? Math.round(100 / (capacityUsedPct / 100) * 1.1) : null;

  return (
    <div className="space-y-5">
      {/* Capacity Planning Alert */}
      {capacityUsedPct > 70 && (
        <div className="rounded-lg px-4 py-3 flex items-start gap-3"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }}>
          <TrendingUp className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-400">Capacity Planning</p>
            <p className="text-xs text-amber-300 mt-0.5">
              Network is at {capacityUsedPct}% capacity ({totalConnected}/{totalCapacity} customers).
              Consider expanding infrastructure to avoid bottlenecks.
            </p>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Activity, label: "Nodes Online", value: `${onlineCount}/${nodes.length}`, color: "#10b981" },
          { icon: Users, label: "Capacity Used", value: `${capacityUsedPct}%`, color: capacityUsedPct > 80 ? "#ef4444" : capacityUsedPct > 60 ? "#f59e0b" : "#10b981" },
          { icon: TrendingUp, label: "Avg Bandwidth", value: `${(nodes.reduce((a, n) => a + (n.bandwidth_utilization || 0), 0) / Math.max(1, nodes.length)).toFixed(1)}%`, color: "#3b82f6" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-lg p-3 text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: s.color }} />
              <p className="text-base font-bold text-slate-200" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Capacity growth trend */}
      <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Customer Growth vs Capacity</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={capacityTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#475569" }} />
            <YAxis tick={{ fontSize: 9, fill: "#475569" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10, color: "#94a3b8" }} />
            <Bar dataKey="connected" name="Connected" fill="#dc2626" radius={[2, 2, 0, 0]} />
            <Bar dataKey="capacity" name="Capacity" fill="rgba(255,255,255,0.1)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bandwidth trend */}
      <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Bandwidth Utilization Trend</p>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={bandwidthTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#475569" }} interval={2} />
            <YAxis tick={{ fontSize: 9, fill: "#475569" }} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10, color: "#94a3b8" }} />
            <Line type="monotone" dataKey="avg_bandwidth" name="Avg %" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="peak" name="Peak %" stroke="#dc2626" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}