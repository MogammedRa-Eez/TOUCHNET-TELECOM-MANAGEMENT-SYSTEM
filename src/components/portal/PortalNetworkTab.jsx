import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Activity, Wifi, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, Clock, Zap, Signal, Server, Loader2
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PLAN_SPEEDS = {
  basic_10mbps:       { down: 10,   up: 5 },
  standard_50mbps:    { down: 50,   up: 25 },
  premium_100mbps:    { down: 100,  up: 50 },
  enterprise_500mbps: { down: 500,  up: 250 },
  dedicated_1gbps:    { down: 1000, up: 1000 },
};

// Generate simulated last-24h data points from node metrics
function generateTrendData(node) {
  if (!node) return [];
  const baseUtil = node.bandwidth_utilization || 40;
  const baseUptime = node.uptime_percent || 98;
  const points = [];
  for (let h = 23; h >= 0; h--) {
    const label = h === 0 ? "Now" : `${h}h ago`;
    const variance = (Math.random() - 0.5) * 18;
    points.push({
      label,
      bandwidth: Math.max(5, Math.min(100, baseUtil + variance)).toFixed(1),
      latency: Math.max(2, Math.round(8 + Math.random() * 20)),
      uptime: Math.max(80, Math.min(100, baseUptime + (Math.random() - 0.5) * 4)).toFixed(1),
    });
  }
  return points;
}

function MetricCard({ icon: Icon, label, value, sub, color, trend }) {
  return (
    <div className="rounded-2xl p-4 relative overflow-hidden"
      style={{ background: "rgba(255,255,255,0.97)", border: `1px solid ${color}20`, boxShadow: `0 2px 16px ${color}08` }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}44, transparent)` }} />
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1">
            {trend >= 0
              ? <TrendingUp className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
              : <TrendingDown className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />}
            <span className="text-[10px] font-bold" style={{ color: trend >= 0 ? "#10b981" : "#ef4444" }}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      <p className="text-[22px] font-black mt-3 leading-none mono" style={{ color }}>{value}</p>
      <p className="text-[11px] font-bold mt-1" style={{ color: "#1e293b" }}>{label}</p>
      {sub && <p className="text-[10px] mt-0.5" style={{ color: "#94a3b8" }}>{sub}</p>}
    </div>
  );
}

function SpeedBar({ label, current, max, color }) {
  const pct = Math.min((current / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] font-bold" style={{ color: "#64748b" }}>{label}</span>
        <span className="text-[11px] font-black mono" style={{ color }}>{current} Mbps</span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(226,232,240,0.8)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px]" style={{ color: "#cbd5e1" }}>0</span>
        <span className="text-[9px]" style={{ color: "#cbd5e1" }}>{max} Mbps max</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-xl"
      style={{ background: "rgba(255,255,255,0.98)", border: "1px solid rgba(99,102,241,0.15)" }}>
      <p className="font-bold mb-1" style={{ color: "#1e293b" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}{p.name === "Latency" ? "ms" : "%"}</strong></p>
      ))}
    </div>
  );
};

export default function PortalNetworkTab({ customer }) {
  const { data: nodes = [], isLoading } = useQuery({
    queryKey: ["portal-network-node", customer?.assigned_node],
    queryFn: () => base44.entities.NetworkNode.filter({ name: customer.assigned_node }),
    enabled: !!customer?.assigned_node,
  });

  const node = nodes[0] || null;
  const trendData = React.useMemo(() => generateTrendData(node), [node?.id]);
  const planSpeeds = PLAN_SPEEDS[customer?.service_plan] || { down: 100, up: 50 };

  const statusCfg = {
    online:      { color: "#10b981", label: "Online",      icon: CheckCircle2 },
    offline:     { color: "#ef4444", label: "Offline",     icon: AlertTriangle },
    degraded:    { color: "#f59e0b", label: "Degraded",    icon: AlertTriangle },
    maintenance: { color: "#6366f1", label: "Maintenance", icon: Clock },
  }[node?.status || "online"];

  return (
    <div className="space-y-5">

      {/* Connection Status Banner */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: node?.status === "offline"
            ? "linear-gradient(135deg,rgba(239,68,68,0.08),rgba(239,68,68,0.04))"
            : "linear-gradient(135deg,rgba(16,185,129,0.08),rgba(6,182,212,0.05))",
          border: `1px solid ${node?.status === "offline" ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
        }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${statusCfg.color}15`, border: `1px solid ${statusCfg.color}30` }}>
            <statusCfg.icon className="w-6 h-6" style={{ color: statusCfg.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[15px] font-black" style={{ color: "#1e293b" }}>
                Your Connection is{" "}
                <span style={{ color: statusCfg.color }}>{statusCfg.label}</span>
              </span>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: statusCfg.color }} />
            </div>
            <p className="text-[12px] mt-0.5" style={{ color: "#64748b" }}>
              {node
                ? `Node: ${node.name} · ${node.location || "Unknown location"}`
                : customer?.assigned_node
                  ? `Node: ${customer.assigned_node}`
                  : "No network node assigned to your account yet."}
            </p>
          </div>
          {node?.uptime_percent && (
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-[22px] font-black mono" style={{ color: "#10b981" }}>{node.uptime_percent.toFixed(1)}%</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "#94a3b8" }}>Uptime</p>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={Signal}
          label="Uptime"
          value={node ? `${(node.uptime_percent || 0).toFixed(1)}%` : "—"}
          sub="Last 30 days"
          color="#10b981"
          trend={2}
        />
        <MetricCard
          icon={Activity}
          label="Bandwidth Used"
          value={node ? `${node.bandwidth_utilization || 0}%` : "—"}
          sub="Of capacity"
          color={(node?.bandwidth_utilization || 0) > 80 ? "#ef4444" : "#6366f1"}
        />
        <MetricCard
          icon={Zap}
          label="Avg Latency"
          value={node ? "~12ms" : "—"}
          sub="To nearest POP"
          color="#f59e0b"
        />
        <MetricCard
          icon={Server}
          label="Customers on Node"
          value={node ? (node.connected_customers ?? "—") : "—"}
          sub="Sharing this node"
          color="#06b6d4"
        />
      </div>

      {/* Speed Allocation */}
      <div className="rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 2px 16px rgba(99,102,241,0.06)" }}>
        <div className="h-[2px] -mx-5 -mt-5 mb-5 rounded-t-2xl"
          style={{ background: "linear-gradient(90deg,#6366f1,#06b6d4,transparent)" }} />
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)" }}>
            <Wifi className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />
          </div>
          <p className="text-[14px] font-black" style={{ color: "#1e293b" }}>Your Plan Speed</p>
          <span className="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.15)" }}>
            {customer?.service_plan?.replace(/_/g, " ") || "—"}
          </span>
        </div>
        <div className="space-y-4">
          <SpeedBar label="Download Speed" current={planSpeeds.down} max={planSpeeds.down} color="#6366f1" />
          <SpeedBar label="Upload Speed" current={planSpeeds.up} max={planSpeeds.down} color="#06b6d4" />
        </div>
      </div>

      {/* 24h Bandwidth Trend Chart */}
      {trendData.length > 0 && (
        <div className="rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(99,102,241,0.1)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(6,182,212,0.1)" }}>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: "#06b6d4" }} />
            </div>
            <p className="text-[14px] font-black" style={{ color: "#1e293b" }}>24-Hour Bandwidth Utilization</p>
            <span className="ml-auto text-[10px]" style={{ color: "#94a3b8" }}>Simulated from node metrics</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="bwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} interval={5} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="bandwidth" name="Bandwidth %" stroke="#6366f1" strokeWidth={2} fill="url(#bwGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Latency trend */}
      {trendData.length > 0 && (
        <div className="rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(99,102,241,0.1)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)" }}>
              <Zap className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
            </div>
            <p className="text-[14px] font-black" style={{ color: "#1e293b" }}>24-Hour Latency (ms)</p>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="latGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.08)" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} interval={5} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="latency" name="Latency" stroke="#f59e0b" strokeWidth={2} fill="url(#latGrad2)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* No node message */}
      {!customer?.assigned_node && !isLoading && (
        <div className="rounded-2xl p-8 text-center"
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(99,102,241,0.1)" }}>
          <Server className="w-10 h-10 mx-auto mb-3" style={{ color: "#cbd5e1" }} />
          <p className="font-bold text-slate-500 mb-1">No Node Assigned Yet</p>
          <p className="text-sm text-slate-400">Network metrics will appear here once your service is provisioned.</p>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#6366f1" }} />
        </div>
      )}
    </div>
  );
}