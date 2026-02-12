import React from "react";
import { Wifi, WifiOff, AlertTriangle, Wrench } from "lucide-react";

export default function NetworkHealth({ nodes }) {
  const statusMap = {
    online: { icon: Wifi, color: "text-emerald-500", bg: "bg-emerald-50", label: "Online" },
    offline: { icon: WifiOff, color: "text-red-500", bg: "bg-red-50", label: "Offline" },
    degraded: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50", label: "Degraded" },
    maintenance: { icon: Wrench, color: "text-blue-500", bg: "bg-blue-50", label: "Maintenance" },
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
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
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