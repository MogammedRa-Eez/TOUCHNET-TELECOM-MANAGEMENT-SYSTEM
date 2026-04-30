import React from "react";
import { AlertTriangle, TrendingUp, Zap } from "lucide-react";

export default function BandwidthAlerts({ nodes }) {
  const alerts = nodes
    .filter(n => (n.bandwidth_utilization || 0) >= 75)
    .sort((a, b) => (b.bandwidth_utilization || 0) - (a.bandwidth_utilization || 0));

  const capacityAlerts = nodes
    .filter(n => n.max_capacity && n.connected_customers && (n.connected_customers / n.max_capacity) >= 0.8);

  if (alerts.length === 0 && capacityAlerts.length === 0) return null;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "#181818", border: "1px solid rgba(224,35,71,0.2)" }}>
      <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#e02347,#f59e0b,transparent)" }} />
      <div className="px-5 py-3 flex items-center gap-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(224,35,71,0.04)" }}>
        <Zap className="w-4 h-4" style={{ color: "#e02347" }} />
        <p className="text-[13px] font-black" style={{ color: "#f0f0f0" }}>Predictive Bandwidth Alerts</p>
        <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full"
          style={{ background: "rgba(224,35,71,0.15)", color: "#e02347", border: "1px solid rgba(224,35,71,0.3)" }}>
          {alerts.length + capacityAlerts.length} alerts
        </span>
      </div>
      <div className="p-4 space-y-2">
        {alerts.map(node => {
          const bw = node.bandwidth_utilization || 0;
          const color = bw >= 90 ? "#e02347" : "#f59e0b";
          return (
            <div key={node.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color }} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold" style={{ color: "#e0e0e0" }}>{node.name}</p>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {bw >= 90 ? "⚠ Critical" : "⚡ High"} bandwidth — trending toward saturation
                </p>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-[14px] font-black mono" style={{ color }}>{bw}%</span>
                <div className="w-16 h-1.5 rounded-full overflow-hidden mt-1" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${bw}%`, background: color }} />
                </div>
              </div>
            </div>
          );
        })}
        {capacityAlerts.map(node => {
          const pct = Math.round((node.connected_customers / node.max_capacity) * 100);
          return (
            <div key={`cap-${node.id}`} className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}>
              <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: "#a855f7" }} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold" style={{ color: "#e0e0e0" }}>{node.name}</p>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Capacity near limit — {node.connected_customers}/{node.max_capacity} customers
                </p>
              </div>
              <span className="text-[14px] font-black mono" style={{ color: "#a855f7" }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}