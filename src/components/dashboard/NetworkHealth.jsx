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
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Network Health</h3>
          <p className="text-xs text-slate-400 mt-0.5">Infrastructure overview</p>
        </div>
        <div className="px-3 py-1.5 bg-emerald-50 rounded-full">
          <span className="text-xs font-semibold text-emerald-600">{avgUptime}% Avg Uptime</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(statusMap).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <div key={key} className={`${config.bg} rounded-xl p-4 flex items-center gap-3`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
              <div>
                <p className="text-xl font-bold text-slate-800">{counts[key]}</p>
                <p className="text-xs text-slate-500">{config.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}