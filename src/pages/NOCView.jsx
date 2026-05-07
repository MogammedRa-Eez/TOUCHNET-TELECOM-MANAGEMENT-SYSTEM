import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Activity, Wifi, TicketCheck, AlertTriangle, CheckCircle2, XCircle, Clock, Zap, RefreshCw } from "lucide-react";

const LOGO_BADGE = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/639b91697_Touchnet-CrestDesogm_CrestFinalFullWhite.png";

function NodePulse({ node }) {
  const colors = { online: "#10b981", degraded: "#f59e0b", offline: "#e02347", maintenance: "#6366f1" };
  const color = colors[node.status] || "#64748b";
  return (
    <div className="relative flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all"
      style={{ background: `${color}0d`, border: `1px solid ${color}30` }}>
      <div className="relative">
        <div className="w-3 h-3 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
        {node.status === "online" && (
          <div className="absolute inset-0 rounded-full animate-ping" style={{ background: `${color}50` }} />
        )}
      </div>
      <p className="text-[9px] font-bold text-center truncate w-full" style={{ color: "#e0e0e0" }}>{node.name}</p>
      <p className="text-[8px]" style={{ color: "rgba(255,255,255,0.3)" }}>{node.location || "—"}</p>
      {node.uptime_percent != null && (
        <p className="text-[9px] font-black mono" style={{ color }}>{node.uptime_percent}%</p>
      )}
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <span className="mono text-[28px] font-black" style={{ color: "#00d4d4", fontFamily: "'JetBrains Mono',monospace", textShadow: "0 0 20px rgba(0,212,212,0.5)" }}>
      {time.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
    </span>
  );
}

export default function NOCView() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const { data: nodes = [], refetch: rN } = useQuery({ queryKey: ["noc-nodes"], queryFn: () => base44.entities.NetworkNode.list(), refetchInterval: 30000 });
  const { data: tickets = [], refetch: rT } = useQuery({ queryKey: ["noc-tickets"], queryFn: () => base44.entities.Ticket.list("-created_date", 50), refetchInterval: 30000 });
  const { data: customers = [] } = useQuery({ queryKey: ["noc-customers"], queryFn: () => base44.entities.Customer.list() });
  const { data: invoices = [] } = useQuery({ queryKey: ["noc-invoices"], queryFn: () => base44.entities.Invoice.list("-created_date", 100) });

  const onlineNodes   = nodes.filter(n => n.status === "online").length;
  const degraded      = nodes.filter(n => n.status === "degraded").length;
  const offline       = nodes.filter(n => n.status === "offline").length;
  const avgUptime     = nodes.length ? (nodes.reduce((a,n) => a + (n.uptime_percent || 0), 0) / nodes.length).toFixed(1) : "—";
  const openTickets   = tickets.filter(t => !["resolved","closed"].includes(t.status));
  const criticalCount = openTickets.filter(t => t.priority === "critical").length;
  const activeCustomers = customers.filter(c => c.status === "active").length;
  const overdueInv    = invoices.filter(i => i.status === "overdue").length;

  const systemOk = offline === 0 && criticalCount === 0;

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: "#080808", fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @keyframes scan { 0% { top:0%; } 100% { top:100%; } }
        .noc-scan::before { content:''; position:absolute; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,rgba(0,212,212,0.3),transparent); animation:scan 4s linear infinite; pointer-events:none; }
      `}</style>

      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <img src={LOGO_BADGE} alt="TN" className="w-10 h-10 object-contain" style={{ filter: "drop-shadow(0 0 8px rgba(0,212,212,0.5))" }} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mono" style={{ color: "rgba(0,212,212,0.5)" }}>TOUCHNET · TMS</p>
            <p className="text-[18px] font-black" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>Network Operations Centre</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: systemOk ? "rgba(16,185,129,0.1)" : "rgba(224,35,71,0.1)", border: `1px solid ${systemOk ? "rgba(16,185,129,0.3)" : "rgba(224,35,71,0.3)"}` }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: systemOk ? "#10b981" : "#e02347" }} />
            <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: systemOk ? "#10b981" : "#e02347" }}>
              {systemOk ? "ALL SYSTEMS OK" : "ISSUES DETECTED"}
            </span>
          </div>
          <LiveClock />
          <button onClick={() => { rN(); rT(); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: "rgba(0,180,180,0.1)", border: "1px solid rgba(0,180,180,0.25)" }}>
            <RefreshCw className="w-4 h-4" style={{ color: "#00b4b4" }} />
          </button>
        </div>
      </div>

      {/* KPI mega-strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Nodes Online",    value: `${onlineNodes}/${nodes.length}`, sub: `${degraded} degraded · ${offline} offline`, color: offline > 0 ? "#e02347" : "#10b981", icon: Wifi },
          { label: "Avg Uptime",      value: `${avgUptime}%`,                  sub: "Across all nodes",               color: "#00b4b4", icon: Activity },
          { label: "Open Tickets",    value: openTickets.length,               sub: `${criticalCount} critical`,       color: criticalCount > 0 ? "#e02347" : "#f59e0b", icon: TicketCheck },
          { label: "Active Customers",value: activeCustomers,                  sub: `${overdueInv} overdue invoices`, color: "#10b981", icon: CheckCircle2 },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="relative overflow-hidden rounded-2xl p-5 noc-scan"
              style={{ background: "linear-gradient(135deg,#111111,#1a1a1a)", border: `1px solid ${kpi.color}35`, boxShadow: `0 4px 24px rgba(0,0,0,0.6), 0 0 20px ${kpi.color}08` }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg,${kpi.color},${kpi.color}55,transparent)` }} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>{kpi.label}</p>
                  <p className="text-[36px] font-black mono leading-none" style={{ color: kpi.color, fontFamily: "'JetBrains Mono',monospace", textShadow: `0 0 24px ${kpi.color}60` }}>{kpi.value}</p>
                  <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{kpi.sub}</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}15`, border: `1px solid ${kpi.color}35` }}>
                  <Icon className="w-6 h-6" style={{ color: kpi.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Node grid */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#111111", border: "1px solid rgba(0,180,180,0.15)" }}>
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.3),transparent)" }} />
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: "#00b4b4" }}>Network Node Status</p>
          <div className="flex items-center gap-3">
            {[{ color: "#10b981", label: "Online" }, { color: "#f59e0b", label: "Degraded" }, { color: "#e02347", label: "Offline" }, { color: "#6366f1", label: "Maintenance" }].map(s => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-[9px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-5 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-10 xl:grid-cols-12 gap-2">
          {nodes.map(node => <NodePulse key={node.id} node={node} />)}
          {nodes.length === 0 && <p className="col-span-full text-center py-8 text-[12px]" style={{ color: "rgba(255,255,255,0.2)" }}>No network nodes configured</p>}
        </div>
      </div>

      {/* Active alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Critical tickets */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#111111", border: "1px solid rgba(224,35,71,0.2)" }}>
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#e02347,transparent)" }} />
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[11px] font-black uppercase tracking-wider flex items-center gap-2" style={{ color: "#e02347" }}>
              <AlertTriangle className="w-4 h-4" /> Critical Alerts ({criticalCount})
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {openTickets.filter(t => ["critical","high"].includes(t.priority)).slice(0, 8).map(t => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3 data-row">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.priority === "critical" ? "#e02347" : "#f97316", boxShadow: `0 0 6px ${t.priority === "critical" ? "#e02347" : "#f97316"}` }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold truncate" style={{ color: "#f0f0f0" }}>{t.subject}</p>
                  <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>{t.customer_name}</p>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded uppercase" style={{ background: "rgba(224,35,71,0.12)", color: "#e02347" }}>{t.priority}</span>
              </div>
            ))}
            {criticalCount === 0 && <p className="text-center py-8 text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>✓ No critical alerts</p>}
          </div>
        </div>

        {/* Offline nodes */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#111111", border: "1px solid rgba(0,180,180,0.2)" }}>
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,transparent)" }} />
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[11px] font-black uppercase tracking-wider flex items-center gap-2" style={{ color: "#00b4b4" }}>
              <XCircle className="w-4 h-4" /> Offline / Degraded Nodes ({offline + degraded})
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {nodes.filter(n => ["offline","degraded"].includes(n.status)).map(n => (
              <div key={n.id} className="flex items-center gap-3 px-5 py-3 data-row">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: n.status === "offline" ? "#e02347" : "#f59e0b" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold truncate" style={{ color: "#f0f0f0" }}>{n.name}</p>
                  <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>{n.location} · {n.ip_address}</p>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded uppercase capitalize"
                  style={{ background: n.status === "offline" ? "rgba(224,35,71,0.12)" : "rgba(245,158,11,0.12)", color: n.status === "offline" ? "#e02347" : "#f59e0b" }}>{n.status}</span>
              </div>
            ))}
            {offline + degraded === 0 && <p className="text-center py-8 text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>✓ All nodes operational</p>}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-[9px] mono" style={{ color: "rgba(0,212,212,0.2)", letterSpacing: "0.2em" }}>TOUCHNET NOC · AUTO-REFRESH 30s · {new Date().toLocaleDateString("en-ZA")}</p>
      </div>
    </div>
  );
}