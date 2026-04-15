import React from "react";
import { Wifi, WifiOff, AlertTriangle, Wrench, Activity } from "lucide-react";

const statusMap = {
  online:      { icon: Wifi,          color: "#059669", bg: "rgba(5,150,105,0.08)",   label: "Online",      grad: "linear-gradient(90deg,#059669,#34d399)" },
  offline:     { icon: WifiOff,       color: "#c41e3a", bg: "rgba(196,30,58,0.08)",   label: "Offline",     grad: "linear-gradient(90deg,#c41e3a,#e87088)" },
  degraded:    { icon: AlertTriangle, color: "#d97706", bg: "rgba(217,119,6,0.08)",   label: "Degraded",    grad: "linear-gradient(90deg,#d97706,#fbbf24)" },
  maintenance: { icon: Wrench,        color: "#1e2d6e", bg: "rgba(30,45,110,0.08)",   label: "Maintenance", grad: "linear-gradient(90deg,#1e2d6e,#4a5fa8)" },
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
  const uptimeColor = avgUptime >= 95 ? "#059669" : avgUptime >= 80 ? "#d97706" : "#c41e3a";

  return (
    <div className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.1)", boxShadow: "0 2px 16px rgba(30,45,110,0.07)" }}>
      {/* Top accent strip */}
      <div className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,#c41e3a,transparent)" }} />

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-bold flex items-center gap-2" style={{ color: "#1e2d6e" }}>
            <Activity className="w-3.5 h-3.5" style={{ color: "#0ea5e9" }} />
            Network Health
          </h3>
          <p className="text-[10px] mt-0.5 mono" style={{ color: "rgba(30,45,110,0.4)" }}>{nodes.length} nodes total</p>
        </div>
        <div className="px-3 py-1.5 rounded-lg text-[12px] font-bold mono"
          style={{ background: `${uptimeColor}12`, border: `1px solid ${uptimeColor}30`, color: uptimeColor }}>
          {avgUptime}%
        </div>
      </div>

      <div className="space-y-2.5">
        {Object.entries(statusMap).map(([key, config]) => {
          const Icon = config.icon;
          const pct  = Math.round((counts[key] / total) * 100);
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: config.bg, border: `1px solid ${config.color}20` }}>
                <Icon className="w-3 h-3" style={{ color: config.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold" style={{ color: "rgba(30,45,110,0.5)" }}>{config.label}</span>
                  <span className="text-[11px] font-bold mono" style={{ color: config.color }}>{counts[key]}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(30,45,110,0.07)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: config.grad }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}