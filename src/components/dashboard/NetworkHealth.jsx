import React from "react";
import { Wifi, WifiOff, AlertTriangle, Wrench, Activity } from "lucide-react";

const statusMap = {
  online:      { icon: Wifi,          color: "#10b981", bg: "rgba(16,185,129,0.1)",  label: "Online",      grad: "linear-gradient(90deg,#10b981,#34d399)" },
  offline:     { icon: WifiOff,       color: "#ef4444", bg: "rgba(239,68,68,0.1)",   label: "Offline",     grad: "linear-gradient(90deg,#ef4444,#f87171)" },
  degraded:    { icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Degraded",    grad: "linear-gradient(90deg,#f59e0b,#fbbf24)" },
  maintenance: { icon: Wrench,        color: "#7c3aed", bg: "rgba(124,58,237,0.1)",  label: "Maintenance", grad: "linear-gradient(90deg,#7c3aed,#a78bfa)" },
};

export default function NetworkHealth({ nodes }) {
  const counts = {
    online:      nodes.filter(n => n.status === "online").length,
    offline:     nodes.filter(n => n.status === "offline").length,
    degraded:    nodes.filter(n => n.status === "degraded").length,
    maintenance: nodes.filter(n => n.status === "maintenance").length,
  };

  const total     = nodes.length || 1;
  const avgUptime = nodes.length
    ? (nodes.reduce((a, n) => a + (n.uptime_percent || 0), 0) / nodes.length).toFixed(1)
    : 0;
  const uptimeColor = avgUptime >= 95 ? "#10b981" : avgUptime >= 80 ? "#f59e0b" : "#ef4444";

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: "#111827", border: "1px solid rgba(124,58,237,0.14)", boxShadow: "0 4px 24px rgba(0,0,0,0.35)" }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 100% 0%, rgba(20,184,166,0.06) 0%, transparent 70%)" }} />

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-bold flex items-center gap-2" style={{ color: "#e2e8f0" }}>
            <Activity className="w-3.5 h-3.5" style={{ color: "#14b8a6" }} />
            Network Health
          </h3>
          <p className="text-[10px] mt-0.5 mono" style={{ color: "rgba(148,163,184,0.5)" }}>{nodes.length} nodes total</p>
        </div>
        <div
          className="px-3 py-1.5 rounded-lg text-[12px] font-bold mono"
          style={{ background: `${uptimeColor}15`, border: `1px solid ${uptimeColor}35`, color: uptimeColor }}
        >
          {avgUptime}%
        </div>
      </div>

      <div className="space-y-2.5">
        {Object.entries(statusMap).map(([key, config]) => {
          const Icon = config.icon;
          const pct  = Math.round((counts[key] / total) * 100);
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: config.bg }}>
                <Icon className="w-3 h-3" style={{ color: config.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold" style={{ color: "#64748b" }}>{config.label}</span>
                  <span className="text-[11px] font-bold mono" style={{ color: config.color }}>{counts[key]}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: config.grad, boxShadow: `0 0 6px ${config.color}44` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}