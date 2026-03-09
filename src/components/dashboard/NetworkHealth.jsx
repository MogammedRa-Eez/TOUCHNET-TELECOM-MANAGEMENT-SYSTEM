import React from "react";
import { Wifi, WifiOff, AlertTriangle, Wrench, Activity } from "lucide-react";

const statusMap = {
  online:      { icon: Wifi,          color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)", label: "Online",      bar: "#10b981" },
  offline:     { icon: WifiOff,       color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",  label: "Offline",     bar: "#ef4444" },
  degraded:    { icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)", label: "Degraded",    bar: "#f59e0b" },
  maintenance: { icon: Wrench,        color: "#6366f1", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.25)", label: "Maintenance", bar: "#6366f1" },
};

export default function NetworkHealth({ nodes }) {
  const counts = {
    online:      nodes.filter(n => n.status === "online").length,
    offline:     nodes.filter(n => n.status === "offline").length,
    degraded:    nodes.filter(n => n.status === "degraded").length,
    maintenance: nodes.filter(n => n.status === "maintenance").length,
  };

  const total    = nodes.length || 1;
  const avgUptime = nodes.length ? (nodes.reduce((a, n) => a + (n.uptime_percent || 0), 0) / nodes.length).toFixed(1) : 0;
  const uptimeColor = avgUptime >= 95 ? "#10b981" : avgUptime >= 80 ? "#f59e0b" : "#ef4444";

  return (
    <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 100% 0%, rgba(16,185,129,0.04) 0%, transparent 70%)" }} />

      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            Network Health
          </h3>
          <p className="text-[11px] mt-0.5 text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Infrastructure overview · {total} nodes</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="px-3 py-1.5 rounded-full text-[12px] font-bold" style={{ background: `${uptimeColor}18`, border: `1px solid ${uptimeColor}44`, color: uptimeColor, fontFamily: "'JetBrains Mono', monospace" }}>
            {avgUptime}% uptime
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(statusMap).map(([key, config]) => {
          const Icon = config.icon;
          const pct  = ((counts[key] / total) * 100).toFixed(0);
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: config.bg, border: `1px solid ${config.border}` }}>
                <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-600">{config.label}</span>
                  <span className="text-[12px] font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{counts[key]}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${config.color}, ${config.color}bb)`, boxShadow: `0 0 6px ${config.color}66` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}