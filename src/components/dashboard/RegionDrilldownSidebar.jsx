import React, { useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from "recharts";
import { X, Wifi, Activity, Clock, Radio, TrendingUp, TrendingDown, Minus } from "lucide-react";

const STATUS_CSS = { online: "#34d399", offline: "#ef4444", degraded: "#fbbf24", maintenance: "#818cf8" };

// Generate deterministic fake-but-plausible time series for a node
function generateTimeSeries(node) {
  const base    = node.latency >= 999 ? 500 : node.latency;
  const sigBase = node.signal;
  return Array.from({ length: 24 }, (_, i) => {
    const hour    = i;
    const jitter  = (Math.sin(i * 1.7 + node.label.length) * 0.3 + Math.cos(i * 0.9) * 0.2);
    const latency = node.status === "offline" ? null : Math.max(1, Math.round(base + jitter * base * 0.4));
    const signal  = node.status === "offline" ? 0 : Math.min(100, Math.max(0, Math.round(sigBase + jitter * 15)));
    const throughput = node.status === "offline" ? 0 : Math.max(0, Math.round(80 + jitter * 60));
    return { hour: `${hour.toString().padStart(2, "0")}:00`, latency, signal, throughput };
  });
}

function generateRadarData(node) {
  const s = node.signal;
  const l = node.latency >= 999 ? 0 : Math.max(0, 100 - node.latency);
  const uptime = node.status === "online" ? 99.8 : node.status === "degraded" ? 72 : node.status === "maintenance" ? 50 : 0;
  return [
    { metric: "Signal",    value: s },
    { metric: "Speed",     value: Math.min(100, l) },
    { metric: "Uptime",    value: uptime },
    { metric: "Stability", value: node.status === "online" ? 95 : node.status === "degraded" ? 45 : 10 },
    { metric: "Capacity",  value: node.status === "online" ? 78 : node.status === "degraded" ? 40 : 5 },
  ];
}

const HUDTooltip = ({ active, payload, label, unit = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2" style={{ background: "rgba(10,16,42,0.97)", border: "1px solid rgba(74,95,168,0.35)", boxShadow: "0 8px 24px rgba(30,45,110,0.3)" }}>
      <p className="text-[10px] font-black mb-1" style={{ color: "rgba(164,181,255,0.5)", fontFamily: "monospace" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[12px] font-black" style={{ color: p.color || "#a4b5ff", fontFamily: "'JetBrains Mono',monospace" }}>
          {p.value ?? "—"}{unit}
        </p>
      ))}
    </div>
  );
};

export default function RegionDrilldownSidebar({ node, onClose }) {
  const timeSeries  = useMemo(() => generateTimeSeries(node), [node.label]);
  const radarData   = useMemo(() => generateRadarData(node),  [node.label]);
  const statusColor = STATUS_CSS[node.status] || "#a4b5ff";

  const healthScore = node.status === "online"
    ? Math.round((node.signal * 0.5) + (Math.max(0, 100 - node.latency) * 0.5))
    : node.status === "degraded" ? Math.round(node.signal * 0.4)
    : node.status === "maintenance" ? 30 : 0;

  const trend = node.status === "online" && node.latency < 30 ? "up"
    : node.status === "online" && node.latency < 80 ? "stable"
    : "down";

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "#34d399" : trend === "down" ? "#ef4444" : "#fbbf24";

  return (
    <div
      className="flex flex-col h-full overflow-y-auto slim-scroll"
      style={{
        background: "linear-gradient(180deg, #080e25 0%, #0a1230 100%)",
        borderLeft: "1px solid rgba(74,95,168,0.3)",
        minWidth: 320,
        maxWidth: 340,
      }}
    >
      {/* ── Header ── */}
      <div className="flex-shrink-0 relative overflow-hidden">
        <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${statusColor}, #1e2d6e, transparent)` }} />
        <div className="px-5 pt-4 pb-4" style={{ background: "rgba(30,45,110,0.15)", borderBottom: "1px solid rgba(74,95,168,0.2)" }}>
          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-3 h-3" style={{ borderTop: `2px solid ${statusColor}60`, borderLeft: `2px solid ${statusColor}60` }} />
          <div className="absolute top-4 right-4 w-3 h-3" style={{ borderTop: "2px solid rgba(196,30,58,0.4)", borderRight: "2px solid rgba(196,30,58,0.4)" }} />

          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.25em] mb-0.5" style={{ color: "rgba(164,181,255,0.45)", fontFamily: "'JetBrains Mono',monospace" }}>NODE DRILL-DOWN</p>
              <h2 className="text-[16px] font-black" style={{ color: "#e8ecf8", fontFamily: "'Space Grotesk',sans-serif" }}>{node.label}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
              style={{ background: "rgba(74,95,168,0.2)", border: "1px solid rgba(74,95,168,0.35)", color: "#a4b5ff" }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Status badge + health */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-lg"
              style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30`, fontFamily: "monospace" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
              {node.status}
            </span>
            <span className="flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-lg"
              style={{ background: "rgba(30,45,110,0.3)", border: "1px solid rgba(74,95,168,0.25)", color: "#a4b5ff", fontFamily: "monospace" }}>
              <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
              <span style={{ color: trendColor }}>{trend === "up" ? "OPTIMAL" : trend === "stable" ? "NOMINAL" : "DEGRADED"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="flex-shrink-0 grid grid-cols-3 gap-0" style={{ borderBottom: "1px solid rgba(74,95,168,0.15)" }}>
        {[
          { label: "LATENCY",    value: node.latency >= 999 ? "DEAD" : `${node.latency}ms`, color: node.latency >= 500 ? "#ef4444" : node.latency > 80 ? "#fbbf24" : "#34d399", Ico: Clock },
          { label: "SIGNAL",     value: node.signal === 0 ? "—" : `${node.signal}%`,        color: node.signal < 50 ? "#ef4444" : node.signal < 75 ? "#fbbf24" : "#34d399",     Ico: Radio },
          { label: "HEALTH",     value: `${healthScore}`,                                    color: healthScore < 40 ? "#ef4444" : healthScore < 70 ? "#fbbf24" : "#34d399",     Ico: Activity },
        ].map(({ label, value, color, Ico }, i) => (
          <div key={label} className="flex flex-col items-center justify-center py-3 relative"
            style={{ borderRight: i < 2 ? "1px solid rgba(74,95,168,0.12)" : "none", background: "rgba(15,26,61,0.4)" }}>
            <Ico className="w-3 h-3 mb-1" style={{ color: "rgba(164,181,255,0.4)" }} />
            <p className="text-[15px] font-black leading-none" style={{ color, fontFamily: "'JetBrains Mono',monospace" }}>{value}</p>
            <p className="text-[7px] font-black uppercase tracking-[0.2em] mt-0.5" style={{ color: "rgba(164,181,255,0.35)", fontFamily: "monospace" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Latency 24h Chart ── */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: "linear-gradient(180deg,#a4b5ff,#4a5fa8)" }} />
          <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(164,181,255,0.6)", fontFamily: "'JetBrains Mono',monospace" }}>Latency — 24h</p>
        </div>
        <ResponsiveContainer width="100%" height={90}>
          <AreaChart data={timeSeries} margin={{ top: 2, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a4b5ff" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#a4b5ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,95,168,0.08)" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "rgba(164,181,255,0.3)", fontFamily: "monospace" }} interval={5} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 8, fill: "rgba(164,181,255,0.3)", fontFamily: "monospace" }} axisLine={false} tickLine={false} />
            <Tooltip content={<HUDTooltip unit="ms" />} />
            <Area type="monotone" dataKey="latency" stroke="#a4b5ff" strokeWidth={1.5} fill="url(#latGrad)" dot={false} connectNulls />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mx-4 h-px" style={{ background: "linear-gradient(90deg, rgba(74,95,168,0.3), transparent)" }} />

      {/* ── Signal 24h Chart ── */}
      <div className="flex-shrink-0 px-4 pt-3 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: "linear-gradient(180deg,#34d399,#059669)" }} />
          <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(164,181,255,0.6)", fontFamily: "'JetBrains Mono',monospace" }}>Signal Strength — 24h</p>
        </div>
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={timeSeries} margin={{ top: 2, right: 4, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,95,168,0.08)" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "rgba(164,181,255,0.3)", fontFamily: "monospace" }} interval={5} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: "rgba(164,181,255,0.3)", fontFamily: "monospace" }} axisLine={false} tickLine={false} />
            <Tooltip content={<HUDTooltip unit="%" />} />
            <Bar dataKey="signal" fill="#34d399" fillOpacity={0.6} radius={[2, 2, 0, 0]} maxBarSize={8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mx-4 h-px" style={{ background: "linear-gradient(90deg, rgba(74,95,168,0.3), transparent)" }} />

      {/* ── Throughput chart ── */}
      <div className="flex-shrink-0 px-4 pt-3 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: "linear-gradient(180deg,#c41e3a,#e02347)" }} />
          <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(164,181,255,0.6)", fontFamily: "'JetBrains Mono',monospace" }}>Throughput — 24h (Mbps)</p>
        </div>
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={timeSeries} margin={{ top: 2, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="tpGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c41e3a" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#c41e3a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,95,168,0.08)" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "rgba(164,181,255,0.3)", fontFamily: "monospace" }} interval={5} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 8, fill: "rgba(164,181,255,0.3)", fontFamily: "monospace" }} axisLine={false} tickLine={false} />
            <Tooltip content={<HUDTooltip unit=" Mbps" />} />
            <Area type="monotone" dataKey="throughput" stroke="#e02347" strokeWidth={1.5} fill="url(#tpGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mx-4 h-px" style={{ background: "linear-gradient(90deg, rgba(74,95,168,0.3), transparent)" }} />

      {/* ── Radar — performance profile ── */}
      <div className="flex-shrink-0 px-4 pt-3 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: "linear-gradient(180deg,#818cf8,#6366f1)" }} />
          <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(164,181,255,0.6)", fontFamily: "'JetBrains Mono',monospace" }}>Performance Profile</p>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <RadarChart data={radarData} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
            <PolarGrid stroke="rgba(74,95,168,0.2)" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 8, fill: "rgba(164,181,255,0.5)", fontFamily: "monospace" }} />
            <Radar name="Node" dataKey="value" stroke={statusColor} fill={statusColor} fillOpacity={0.18} strokeWidth={1.5} />
            <Tooltip content={<HUDTooltip unit="%" />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mx-4 h-px" style={{ background: "linear-gradient(90deg, rgba(74,95,168,0.3), transparent)" }} />

      {/* ── Node metadata ── */}
      <div className="flex-shrink-0 px-4 pt-3 pb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: "linear-gradient(180deg,#fbbf24,#d97706)" }} />
          <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(164,181,255,0.6)", fontFamily: "'JetBrains Mono',monospace" }}>Node Metadata</p>
        </div>
        <div className="space-y-2">
          {[
            { label: "Region",     value: node.label },
            { label: "Status",     value: node.status.toUpperCase(), color: statusColor },
            { label: "Latency",    value: node.latency >= 999 ? "UNREACHABLE" : `${node.latency} ms` },
            { label: "Signal",     value: node.signal === 0 ? "NO SIGNAL" : `${node.signal}%` },
            { label: "Health",     value: `${healthScore} / 100` },
            { label: "SLA Target", value: "99.9%"  },
            { label: "Protocol",   value: "BGP / MPLS" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center py-1.5 px-2 rounded-lg"
              style={{ background: "rgba(30,45,110,0.15)", border: "1px solid rgba(74,95,168,0.1)" }}>
              <span className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(164,181,255,0.4)", fontFamily: "monospace" }}>{label}</span>
              <span className="text-[10px] font-black" style={{ color: color || "#a4b5ff", fontFamily: "'JetBrains Mono',monospace" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}