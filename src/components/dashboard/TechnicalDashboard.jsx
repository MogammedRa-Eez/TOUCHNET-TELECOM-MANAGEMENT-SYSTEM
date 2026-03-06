import React from "react";
import { Wifi, AlertTriangle, Activity, TicketCheck, Wrench, Server } from "lucide-react";
import KPICard from "./KPICard";
import NetworkHealth from "./NetworkHealth";
import TicketOverview from "./TicketOverview";
import NetworkGlobe from "./NetworkGlobe";

export default function TechnicalDashboard({ customers, tickets, nodes }) {
  const onlineNodes = nodes.filter(n => n.status === "online").length;
  const offlineNodes = nodes.filter(n => n.status === "offline").length;
  const degradedNodes = nodes.filter(n => n.status === "degraded").length;
  const maintenanceNodes = nodes.filter(n => n.status === "maintenance").length;
  const openTickets = tickets.filter(t => !["resolved", "closed"].includes(t.status)).length;
  const techTickets = tickets.filter(t => t.department === "technical" && !["resolved", "closed"].includes(t.status)).length;
  const criticalTickets = tickets.filter(t => t.priority === "critical" && !["resolved", "closed"].includes(t.status)).length;
  const avgBandwidth = nodes.length ? Math.round(nodes.reduce((a, n) => a + (n.bandwidth_utilization || 0), 0) / nodes.length) : 0;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: "rgba(6,182,212,0.12)", color: "#0891b2", border: "1px solid rgba(6,182,212,0.25)" }}>
          TECHNICAL — NETWORK & SUPPORT
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Nodes Online" value={`${onlineNodes}/${nodes.length}`} subtitle="Network coverage" icon={Wifi} color="emerald" />
        <KPICard title="Offline Nodes" value={offlineNodes} subtitle={`${degradedNodes} degraded`} icon={AlertTriangle} color="rose" trend={offlineNodes > 0 ? "up" : "down"} trendValue={offlineNodes > 0 ? "Action needed" : "All clear"} />
        <KPICard title="Tech Tickets" value={techTickets} subtitle={`${criticalTickets} critical`} icon={TicketCheck} color="amber" />
        <KPICard title="Avg Bandwidth" value={`${avgBandwidth}%`} subtitle="Across all nodes" icon={Activity} color="cyan" />
      </div>

      {/* Globe + Node Health */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 rounded-2xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #070b1f 0%, #0f1845 60%, #070b1f 100%)", border: "1px solid rgba(6,182,212,0.2)", minHeight: 320 }}>
          <div className="absolute top-4 left-5 z-10 flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-300 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Live Network Map</span>
          </div>
          <div className="absolute bottom-4 left-5 z-10 flex flex-col gap-1">
            {[
              { color: "#34d399", label: `${onlineNodes} Online` },
              { color: "#fbbf24", label: `${degradedNodes} Degraded` },
              { color: "#ef4444", label: `${offlineNodes} Offline` },
              { color: "#64748b", label: `${maintenanceNodes} Maintenance` },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                <span className="text-[10px] text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
              </div>
            ))}
          </div>
          <div className="w-full" style={{ height: 320 }}>
            <NetworkGlobe nodes={nodes} />
          </div>
        </div>
        <div className="lg:col-span-2">
          <NetworkHealth nodes={nodes} />
        </div>
      </div>

      {/* Tickets focused on technical */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TicketOverview tickets={tickets} />
        {/* Recent critical alerts */}
        <div className="rounded-xl p-6" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h3 className="text-[13px] font-semibold text-slate-700 mb-1">Critical & Escalated Tickets</h3>
          <p className="text-[11px] mb-4" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>Needs immediate attention</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {tickets.filter(t => (t.priority === "critical" || t.status === "escalated") && !["resolved", "closed"].includes(t.status)).length === 0 ? (
              <div className="flex items-center gap-2 py-4 justify-center">
                <Wrench className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-slate-400">No critical issues — all clear!</span>
              </div>
            ) : (
              tickets.filter(t => (t.priority === "critical" || t.status === "escalated") && !["resolved", "closed"].includes(t.status)).map(t => (
                <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{t.subject}</p>
                    <p className="text-[11px] text-slate-400">{t.customer_name} • {t.priority}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}