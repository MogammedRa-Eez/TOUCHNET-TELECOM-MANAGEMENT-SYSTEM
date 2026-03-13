import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Shield, AlertTriangle, CheckCircle, Activity, WifiOff } from "lucide-react";

export default function CyberDashboard() {
  const { data: tickets = [] } = useQuery({ queryKey: ["cyber-tickets"], queryFn: () => base44.entities.Ticket.filter({ department: "cyber_security" }, "-created_date") });
  const { data: nodes = [] } = useQuery({ queryKey: ["cyber-nodes"], queryFn: () => base44.entities.NetworkNode.list() });

  const openTickets = tickets.filter(t => !["resolved", "closed"].includes(t.status));
  const criticalTickets = tickets.filter(t => t.priority === "critical" && !["resolved", "closed"].includes(t.status));
  const offlineNodes = nodes.filter(n => n.status === "offline");
  const degradedNodes = nodes.filter(n => n.status === "degraded");

  const PRIORITY_COLORS = { critical: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700", medium: "bg-yellow-100 text-yellow-700", low: "bg-slate-100 text-slate-500" };

  return (
    <div className="p-6 space-y-6">
      <DeptHeader title="Cyber Security Dashboard" dept="Cyber Security" color="#f59e0b" icon="🛡️" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Open Security Tickets" value={openTickets.length} icon={<AlertTriangle className="w-4 h-4 text-yellow-500" />} bg="bg-yellow-50" />
        <KPI label="Critical Alerts" value={criticalTickets.length} icon={<Shield className="w-4 h-4 text-red-500" />} bg="bg-red-50" />
        <KPI label="Offline Nodes" value={offlineNodes.length} icon={<WifiOff className="w-4 h-4 text-red-500" />} bg="bg-red-50" />
        <KPI label="Degraded Nodes" value={degradedNodes.length} icon={<Activity className="w-4 h-4 text-orange-500" />} bg="bg-orange-50" />
      </div>

      {criticalTickets.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-red-700 text-sm">⚠️ Critical Security Issues</h3>
          </div>
          <div className="space-y-2">
            {criticalTickets.map(t => (
              <div key={t.id} className="bg-white rounded-lg px-4 py-2.5 border border-red-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t.subject}</p>
                  <p className="text-xs text-slate-400">{t.category} · {t.status?.replace(/_/g, " ")}</p>
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">CRITICAL</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-700 text-sm mb-4">Security Tickets</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tickets.length === 0 ? (
              <p className="text-sm text-emerald-600 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> No security tickets</p>
            ) : tickets.slice(0, 8).map(t => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700">{t.subject}</p>
                  <p className="text-xs text-slate-400">{t.customer_name || "Internal"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${PRIORITY_COLORS[t.priority] || PRIORITY_COLORS.low}`}>{t.priority}</span>
                  <span className="text-xs text-slate-400 capitalize">{t.status?.replace(/_/g, " ")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-700 text-sm mb-4">Network Node Status</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {nodes.slice(0, 10).map(n => (
              <div key={n.id} className="flex items-center justify-between py-1.5">
                <div>
                  <p className="text-sm font-medium text-slate-700">{n.name}</p>
                  <p className="text-xs text-slate-400">{n.location} · {n.ip_address}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                  n.status === "online" ? "bg-emerald-100 text-emerald-700" :
                  n.status === "offline" ? "bg-red-100 text-red-600" :
                  n.status === "degraded" ? "bg-yellow-100 text-yellow-700" : "bg-purple-100 text-purple-700"
                }`}>{n.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, icon, bg }) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-white/50`}>
      <div className="flex items-center justify-between mb-1">{icon}</div>
      <p className="text-xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function DeptHeader({ title, dept, color, icon }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${color}15` }}>{icon}</div>
      <div>
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        <p className="text-xs text-slate-400">{dept} Department · Private View</p>
      </div>
    </div>
  );
}