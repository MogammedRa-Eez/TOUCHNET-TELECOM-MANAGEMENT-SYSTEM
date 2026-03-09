import React from "react";
import { X, Wifi, WifiOff, AlertTriangle, Wrench, Activity, Cpu, Users, Clock, Radio, Zap } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Cell, Tooltip } from "recharts";

const STATUS_CFG = {
  online:      { icon: Wifi,          color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)",  label: "Online" },
  offline:     { icon: WifiOff,       color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)",   label: "Offline" },
  degraded:    { icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)",  label: "Degraded" },
  maintenance: { icon: Wrench,        color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",  border: "rgba(139,92,246,0.3)",  label: "Maintenance" },
};

const NODE_TYPES = {
  core_router:          "Core Router",
  distribution_switch:  "Distribution Switch",
  access_point:         "Access Point",
  olt:                  "OLT",
  bts:                  "BTS",
  server:               "Server",
};

// Simulate 7-day uptime history seeded from node name
function generateHistory(node) {
  const seed = (node.label || "x").charCodeAt(0);
  return Array.from({ length: 7 }, (_, i) => {
    const base = node.status === "offline" ? 20 : node.status === "degraded" ? 65 : 88;
    const v = Math.min(100, Math.max(0, base + ((seed * (i + 3) * 17) % 20) - 10));
    return { day: ["M", "T", "W", "T", "F", "S", "S"][i], uptime: v };
  });
}

function StatRow({ icon: Icon, label, value, valueColor }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[11px]">{label}</span>
      </div>
      <span className="text-[12px] font-bold" style={{ color: valueColor || "#f1f5f9", fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
    </div>
  );
}

export default function NodeSidePanel({ node, onClose }) {
  if (!node) return null;
  const cfg     = STATUS_CFG[node.status] || STATUS_CFG.online;
  const Icon    = cfg.icon;
  const history = generateHistory(node);
  const latencyColor = node.latency >= 999 ? "#ef4444" : node.latency > 80 ? "#f97316" : node.latency > 30 ? "#fbbf24" : "#10b981";
  const signalColor  = node.signal === 0 ? "#ef4444" : node.signal < 65 ? "#f97316" : "#10b981";

  return (
    <div
      className="absolute top-0 right-0 h-full z-30 flex flex-col overflow-hidden"
      style={{
        width: 300,
        background: "linear-gradient(180deg, rgba(8,14,32,0.98) 0%, rgba(12,20,44,0.98) 100%)",
        borderLeft: "1px solid rgba(99,102,241,0.25)",
        backdropFilter: "blur(16px)",
        boxShadow: "-8px 0 32px rgba(0,0,0,0.5)",
      }}
    >
      {/* Header */}
      <div className="p-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(99,102,241,0.2)" }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-bold text-white truncate">{node.label}</h3>
            {node.dbNode?.type && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc", fontFamily: "'JetBrains Mono', monospace" }}>
                {NODE_TYPES[node.dbNode.type] || node.dbNode.type}
              </span>
            )}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 flex-shrink-0 ml-2" style={{ color: "#64748b" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
          <span className="text-[12px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
          {node.status === "online" && (
            <span className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex-1 overflow-y-auto px-4 py-2" style={{ scrollbarWidth: "none" }}>
        <StatRow icon={Radio}    label="Latency"        value={node.latency >= 999 ? "Unreachable" : `${node.latency} ms`}      valueColor={latencyColor} />
        <StatRow icon={Activity} label="Signal"         value={node.signal === 0 ? "No Signal" : `${node.signal}%`}             valueColor={signalColor} />
        {node.dbNode?.uptime_percent != null && (
          <StatRow icon={Zap}    label="Uptime"         value={`${node.dbNode.uptime_percent}%`}                                 valueColor={node.dbNode.uptime_percent >= 95 ? "#10b981" : "#f59e0b"} />
        )}
        {node.dbNode?.bandwidth_utilization != null && (
          <StatRow icon={Activity} label="Bandwidth"    value={`${node.dbNode.bandwidth_utilization}%`}                          valueColor={node.dbNode.bandwidth_utilization > 80 ? "#ef4444" : "#06b6d4"} />
        )}
        {node.dbNode?.connected_customers != null && (
          <StatRow icon={Users}  label="Customers"      value={`${node.dbNode.connected_customers} / ${node.dbNode.max_capacity || "∞"}`} />
        )}
        {node.dbNode?.ip_address && (
          <StatRow icon={Cpu}    label="IP Address"     value={node.dbNode.ip_address} />
        )}
        {node.dbNode?.firmware_version && (
          <StatRow icon={Cpu}    label="Firmware"       value={node.dbNode.firmware_version} />
        )}
        {node.dbNode?.last_maintenance && (
          <StatRow icon={Clock}  label="Last Maint."    value={new Date(node.dbNode.last_maintenance).toLocaleDateString("en-ZA")} />
        )}

        {/* 7-day uptime history */}
        <div className="mt-4 mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">7-Day Uptime History</p>
          <ResponsiveContainer width="100%" height={72}>
            <BarChart data={history} barSize={24} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Tooltip
                contentStyle={{ background: "rgba(8,14,32,0.95)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, fontSize: 11, fontFamily: "JetBrains Mono" }}
                formatter={v => [`${v.toFixed(0)}%`, "Uptime"]}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Bar dataKey="uptime" radius={[3, 3, 0, 0]}>
                {history.map((h, i) => (
                  <Cell key={i} fill={h.uptime >= 90 ? "#10b981" : h.uptime >= 70 ? "#f59e0b" : "#ef4444"} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-between mt-1">
            {history.map((h, i) => (
              <span key={i} className="text-[9px] text-slate-600 w-full text-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{h.day}</span>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="mt-3 px-3 py-2 rounded-lg" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Coordinates</p>
          <p className="text-[11px] text-slate-300" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {node.lat.toFixed(4)}°, {node.lon.toFixed(4)}°
          </p>
        </div>
      </div>
    </div>
  );
}