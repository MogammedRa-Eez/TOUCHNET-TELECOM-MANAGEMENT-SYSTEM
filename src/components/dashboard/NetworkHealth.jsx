import React from "react";
import { Wifi, WifiOff, AlertTriangle, Wrench, Activity, Cpu } from "lucide-react";

const statusMap = {
  online:      { icon: Wifi,          color: "#10b981", bg: "rgba(16,185,129,0.12)",  label: "Online",      grad: "linear-gradient(90deg,#10b981,#34d399)", glow: "rgba(16,185,129,0.6)" },
  offline:     { icon: WifiOff,       color: "#e02347", bg: "rgba(224,35,71,0.12)",   label: "Offline",     grad: "linear-gradient(90deg,#e02347,#ff3358)", glow: "rgba(224,35,71,0.6)" },
  degraded:    { icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  label: "Degraded",    grad: "linear-gradient(90deg,#f59e0b,#fbbf24)", glow: "rgba(245,158,11,0.6)" },
  maintenance: { icon: Wrench,        color: "#00b4b4", bg: "rgba(0,180,180,0.12)",   label: "Maintenance", grad: "linear-gradient(90deg,#00b4b4,#00d4d4)", glow: "rgba(0,180,180,0.6)" },
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
    <div className="rounded-2xl p-5 relative overflow-hidden cyber-scanlines"
      style={{
        background: "linear-gradient(135deg,#141414,#1a1a1a)",
        border: "1px solid rgba(0,180,180,0.22)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.5), 0 0 20px rgba(0,180,180,0.04)",
      }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg,transparent,#00b4b4,#00d4d4,rgba(255,255,255,0.4),#00b4b4,#e02347,transparent)" }} />

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, rgba(0,180,180,0.05) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

      {/* Corner brackets */}
      <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 pointer-events-none" style={{ borderTop: "1.5px solid rgba(0,212,212,0.45)", borderLeft: "1.5px solid rgba(0,212,212,0.45)" }} />
      <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 pointer-events-none" style={{ borderBottom: "1.5px solid rgba(224,35,71,0.35)", borderRight: "1.5px solid rgba(224,35,71,0.35)" }} />

      <div className="relative flex items-start justify-between mb-5">
        <div>
          <h3 className="text-[12px] font-black flex items-center gap-2 uppercase tracking-[0.15em]"
            style={{ color: "#00d4d4", fontFamily: "'Space Grotesk',sans-serif" }}>
            <Cpu className="w-3.5 h-3.5" />
            Network Health
          </h3>
          <p className="text-[10px] mt-0.5 mono uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{nodes.length} nodes monitored</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="px-3 py-1.5 rounded-xl text-[16px] font-black mono"
            style={{
              background: `${uptimeColor}12`,
              border: `1px solid ${uptimeColor}35`,
              color: uptimeColor,
              fontFamily: "'JetBrains Mono',monospace",
              textShadow: `0 0 16px ${uptimeColor}80`,
              boxShadow: `0 0 16px ${uptimeColor}20`,
            }}>
            {avgUptime}%
          </div>
          <span className="text-[8px] uppercase tracking-[0.2em] mono" style={{ color: "rgba(255,255,255,0.25)" }}>avg uptime</span>
        </div>
      </div>

      <div className="relative space-y-3.5">
        {Object.entries(statusMap).map(([key, config]) => {
          const Icon = config.icon;
          const pct  = Math.round((counts[key] / total) * 100);
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110"
                style={{ background: config.bg, border: `1px solid ${config.color}30`, boxShadow: `0 0 10px ${config.color}15` }}>
                <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{config.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] mono" style={{ color: "rgba(255,255,255,0.25)" }}>{pct}%</span>
                    <span className="text-[13px] font-black mono" style={{ color: config.color, fontFamily: "'JetBrains Mono',monospace", textShadow: `0 0 12px ${config.glow}` }}>
                      {counts[key]}
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden relative" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full transition-all duration-1000 relative"
                    style={{ width: `${pct}%`, background: config.grad, boxShadow: `0 0 10px ${config.color}50` }}>
                    {/* Shimmer on bar */}
                    <div className="absolute inset-0 rounded-full"
                      style={{ background: "linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)", backgroundSize: "200% 100%", animation: "shimmer 2s infinite" }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}