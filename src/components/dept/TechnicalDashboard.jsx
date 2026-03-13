import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Wifi, WifiOff, AlertTriangle, CheckCircle, Activity, Wrench } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function TechnicalDashboard() {
  const { data: nodes = [] } = useQuery({ queryKey: ["tech-nodes"], queryFn: () => base44.entities.NetworkNode.list() });
  const { data: tickets = [] } = useQuery({ queryKey: ["tech-tickets"], queryFn: () => base44.entities.Ticket.filter({ department: "technical" }, "-created_date") });
  const { data: customers = [] } = useQuery({ queryKey: ["tech-customers"], queryFn: () => base44.entities.Customer.list() });

  const online = nodes.filter(n => n.status === "online").length;
  const offline = nodes.filter(n => n.status === "offline").length;
  const degraded = nodes.filter(n => n.status === "degraded").length;
  const maintenance = nodes.filter(n => n.status === "maintenance").length;
  const avgUptime = nodes.length > 0 ? (nodes.reduce((s, n) => s + (n.uptime_percent || 0), 0) / nodes.length).toFixed(1) : "—";
  const openTech = tickets.filter(t => !["resolved", "closed"].includes(t.status));

  const uptimeData = nodes.slice(0, 8).map(n => ({ name: n.name.slice(0, 12), uptime: n.uptime_percent || 0 }));

  return (
    <div className="p-6 space-y-6">
      <DeptHeader title="Technical Dashboard" dept="Technical" color="#8b5cf6" icon="⚙️" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Online Nodes" value={online} icon={<Wifi className="w-4 h-4 text-emerald-500" />} bg="bg-emerald-50" />
        <KPI label="Offline Nodes" value={offline} icon={<WifiOff className="w-4 h-4 text-red-500" />} bg="bg-red-50" />
        <KPI label="Avg Uptime" value={`${avgUptime}%`} icon={<Activity className="w-4 h-4 text-indigo-500" />} bg="bg-indigo-50" />
        <KPI label="Open Tech Tickets" value={openTech.length} icon={<AlertTriangle className="w-4 h-4 text-yellow-500" />} bg="bg-yellow-50" />
      </div>

      {/* Node status summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-slate-700 text-sm mb-4">Network Node Overview</h3>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: "Online", count: online, color: "#10b981" },
            { label: "Degraded", count: degraded, color: "#f59e0b" },
            { label: "Offline", count: offline, color: "#ef4444" },
            { label: "Maintenance", count: maintenance, color: "#8b5cf6" },
          ].map(s => (
            <div key={s.label} className="text-center rounded-xl py-3 px-2" style={{ background: `${s.color}10`, border: `1px solid ${s.color}30` }}>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        {uptimeData.length > 0 && (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={uptimeData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Line type="monotone" dataKey="uptime" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-700 text-sm mb-4">Technical Tickets</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {openTech.length === 0 ? (
              <p className="text-sm text-emerald-600 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> No open technical tickets</p>
            ) : openTech.slice(0, 8).map(t => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700">{t.subject}</p>
                  <p className="text-xs text-slate-400">{t.customer_name || "Internal"} · {t.category}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                  t.priority === "critical" ? "bg-red-100 text-red-600" :
                  t.priority === "high" ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"
                }`}>{t.priority}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-700 text-sm mb-4">Nodes Needing Attention</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {nodes.filter(n => n.status !== "online").length === 0 ? (
              <p className="text-sm text-emerald-600 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> All nodes online</p>
            ) : nodes.filter(n => n.status !== "online").map(n => (
              <div key={n.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: n.status === "offline" ? "#fef2f2" : "#fffbeb" }}>
                <div>
                  <p className="text-sm font-medium text-slate-700">{n.name}</p>
                  <p className="text-xs text-slate-400">{n.location}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                  n.status === "offline" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"
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