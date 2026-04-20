import React from "react";
import { Wifi, WifiOff, AlertTriangle, Wrench, Activity } from "lucide-react";

const statusMap = {
  online:      { icon: Wifi,          color: "#10b981", bg: "rgba(16,185,129,0.1)",  label: "Online",      grad: "linear-gradient(90deg,#10b981,#34d399)" },
  offline:     { icon: WifiOff,       color: "#e02347", bg: "rgba(224,35,71,0.1)",   label: "Offline",     grad: "linear-gradient(90deg,#e02347,#ff3358)" },
  degraded:    { icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Degraded",    grad: "linear-gradient(90deg,#f59e0b,#fbbf24)" },
  maintenance: { icon: Wrench,        color: "#00b4b4", bg: "rgba(0,180,180,0.1)",   label: "Maintenance", grad: "linear-gradient(90deg,#00b4b4,#00d4d4)" },
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
  const uptimeColor = avgUptime >= 95 ? "#10b981" : avgUptime >= 80 ? "#f59e0b" : "#e02347";

  return (
    <div className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,#e02347,transparent)" }} />

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-bold flex items-center gap-2" style={{ color: "#f0f0f0" }}>
            <Activity className="w-3.5 h-3.5" style={{ color: "#00b4b4" }} />
            Network Health
          </h3>
          <p className="text-[10px] mt-0.5 mono" style={{ color: "rgba(255,255,255,0.35)" }}>{nodes.length} nodes total</p>
        </div>
        <div className="px-3 py-1.5 rounded-lg text-[13px] font-black mono"
          style={{ background: `${uptimeColor}15`, border: `1px solid ${uptimeColor}35`, color: uptimeColor, boxShadow: `0 0 12px ${uptimeColor}20` }}>
          {avgUptime}%
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(statusMap).map(([key, config]) => {
          const Icon = config.icon;
          const pct  = Math.round((counts[key] / total) * 100);
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: config.bg, border: `1px solid ${config.color}25` }}>
                <Icon className="w-3 h-3" style={{ color: config.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.45)" }}>{config.label}</span>
                  <span className="text-[12px] font-black mono" style={{ color: config.color }}>{counts[key]}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: config.grad, boxShadow: `0 0 8px ${config.color}40` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}