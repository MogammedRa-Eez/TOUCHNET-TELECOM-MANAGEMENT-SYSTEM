import React from "react";
import { Wifi, WifiOff, AlertTriangle, Wrench } from "lucide-react";

export default function NetworkHealth({ nodes }) {
  const statusMap = {
    online: { icon: Wifi, color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", label: "Online" },
    offline: { icon: WifiOff, color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", label: "Offline" },
    degraded: { icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", label: "Degraded" },
    maintenance: { icon: Wrench, color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", label: "Maintenance" },
  };

  const counts = {
    online: nodes.filter(n => n.status === "online").length,
    offline: nodes.filter(n => n.status === "offline").length,
    degraded: nodes.filter(n => n.status === "degraded").length,
    maintenance: nodes.filter(n => n.status === "maintenance").length,
  };

  const avgUptime = nodes.length
    ? (nodes.reduce((a, n) => a + (n.uptime_percent || 0), 0) / nodes.length).toFixed(1)
    : 0;

  return (
    <div className="rounded-xl p-6" style={{ background: "#0d1527", border: "1px solid rgba(6,182,212,0.12)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-200">Network Health</h3>
          <p className="text-[11px] mt-0.5" style={{ color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>Infrastructure overview</p>
        </div>
        <div className="px-3 py-1 rounded-md" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <span className="text-[11px] font-semibold mono" style={{ color: "#10b981", fontFamily: "'JetBrains Mono', monospace" }}>{avgUptime}% uptime</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(statusMap).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <div key={key} className="rounded-lg p-3.5 flex items-center gap-3" style={{ background: config.bg, border: `1px solid ${config.border}` }}>
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: config.color }} />
              <div>
                <p className="text-[18px] font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{counts[key]}</p>
                <p className="text-[10px]" style={{ color: config.color, opacity: 0.8 }}>{config.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}