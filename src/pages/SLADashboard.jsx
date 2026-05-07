import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { TicketCheck, Clock, AlertTriangle, CheckCircle2, TrendingUp, Users, Zap } from "lucide-react";
import { differenceInHours, parseISO } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";

const SLA_HOURS = { critical: 4, high: 8, medium: 24, low: 72 };
const DEPT_COLORS = { technical: "#00b4b4", sales: "#10b981", finance: "#f59e0b", cyber_security: "#e02347", projects: "#8b5cf6", hr: "#ec4899" };

function isBreached(ticket) {
  if (!ticket.sla_deadline) return false;
  if (["resolved", "closed"].includes(ticket.status)) return false;
  return new Date() > parseISO(ticket.sla_deadline);
}

function timeToBreachHours(ticket) {
  if (!ticket.sla_deadline) return null;
  return differenceInHours(parseISO(ticket.sla_deadline), new Date());
}

function KPI({ label, value, sub, color, icon: Icon }) {
  return (
    <div className="relative overflow-hidden rounded-2xl px-5 py-4"
      style={{ background: "#181818", border: `1px solid ${color}30`, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg,${color},transparent)` }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
          <p className="text-[30px] font-black mono" style={{ color, fontFamily: "'JetBrains Mono',monospace" }}>{value}</p>
          {sub && <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

export default function SLADashboard() {
  const { can, loading: rbacLoading } = useRBAC();
  const { data: tickets = [], isLoading } = useQuery({ queryKey: ["tickets-sla"], queryFn: () => base44.entities.Ticket.list("-created_date", 500) });

  if (!rbacLoading && !can("tickets")) return <AccessDenied />;

  const openTickets = tickets.filter(t => !["resolved", "closed"].includes(t.status));
  const resolved = tickets.filter(t => ["resolved", "closed"].includes(t.status));
  const breached = openTickets.filter(isBreached);
  const atRisk = openTickets.filter(t => { const h = timeToBreachHours(t); return h !== null && h > 0 && h < 2; });
  const compliantCount = resolved.length;
  const compliancePct = tickets.length > 0 ? Math.round((compliantCount / tickets.length) * 100) : 0;

  // Per-priority breach data
  const priorityData = ["critical", "high", "medium", "low"].map(p => {
    const pTickets = openTickets.filter(t => t.priority === p);
    const pBreached = pTickets.filter(isBreached).length;
    return {
      priority: p.charAt(0).toUpperCase() + p.slice(1),
      total: pTickets.length,
      breached: pBreached,
      ok: pTickets.length - pBreached,
      sla: `${SLA_HOURS[p]}h SLA`,
    };
  });

  // Per-department breakdown
  const deptData = Object.keys(DEPT_COLORS).map(dept => {
    const dTickets = openTickets.filter(t => t.department === dept);
    const dBreached = dTickets.filter(isBreached).length;
    return { dept, total: dTickets.length, breached: dBreached };
  }).filter(d => d.total > 0);

  // Avg resolution time
  const avgResH = resolved.filter(t => t.created_date && t.updated_date).reduce((sum, t, _, arr) => {
    return sum + differenceInHours(parseISO(t.updated_date), parseISO(t.created_date)) / arr.length;
  }, 0);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-5"
        style={{ background: "linear-gradient(135deg,#141414,#1a1a1a)", border: "1px solid rgba(0,180,180,0.28)", boxShadow: "0 4px 40px rgba(0,0,0,0.6)" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.5),#e02347,transparent)" }} />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,180,180,0.15)", border: "1px solid rgba(0,180,180,0.4)" }}>
                <Zap className="w-4 h-4" style={{ color: "#00b4b4" }} />
              </div>
              <h1 className="text-xl font-black" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>SLA Dashboard</h1>
              {breached.length > 0 && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black"
                  style={{ background: "rgba(224,35,71,0.15)", border: "1px solid rgba(224,35,71,0.4)", color: "#e02347" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#e02347" }} /> {breached.length} BREACHED
                </span>
              )}
            </div>
            <p className="text-[11px] mono pl-11" style={{ color: "rgba(255,255,255,0.35)" }}>
              Service Level Agreement compliance · {compliancePct}% overall
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="SLA Compliance" value={`${compliancePct}%`} sub={`${compliantCount} resolved`} color="#10b981" icon={CheckCircle2} />
        <KPI label="SLA Breached" value={breached.length} sub="Immediate action needed" color={breached.length > 0 ? "#e02347" : "#10b981"} icon={AlertTriangle} />
        <KPI label="At Risk (< 2h)" value={atRisk.length} sub="About to breach" color={atRisk.length > 0 ? "#f59e0b" : "#10b981"} icon={Clock} />
        <KPI label="Avg Resolution" value={`${avgResH.toFixed(0)}h`} sub="Average close time" color="#00b4b4" icon={TrendingUp} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Priority breakdown */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#181818", border: "1px solid rgba(0,180,180,0.15)" }}>
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#e02347,transparent)" }} />
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[12px] font-black" style={{ color: "#f0f0f0" }}>Breach Rate by Priority</p>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>Open tickets vs SLA breaches</p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priorityData} barGap={4}>
                <XAxis dataKey="priority" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1e1e1e", border: "1px solid rgba(0,180,180,0.25)", borderRadius: 8, fontSize: 11, color: "#f0f0f0" }} />
                <Bar dataKey="ok" name="Within SLA" stackId="a" fill="#00b4b4" radius={[0,0,0,0]} />
                <Bar dataKey="breached" name="Breached" stackId="a" fill="#e02347" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              {priorityData.map(p => (
                <div key={p.priority} className="flex-1 text-center">
                  <p className="text-[9px] font-black" style={{ color: "rgba(255,255,255,0.35)" }}>{p.priority}</p>
                  <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>{p.sla}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department breakdown */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#181818", border: "1px solid rgba(0,180,180,0.15)" }}>
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#8b5cf6,#00b4b4,transparent)" }} />
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[12px] font-black" style={{ color: "#f0f0f0" }}>Department Workload</p>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>Open tickets per department</p>
          </div>
          <div className="p-5 space-y-3">
            {deptData.length === 0 ? (
              <p className="text-center py-10 text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>No open tickets</p>
            ) : deptData.map(d => {
              const color = DEPT_COLORS[d.dept] || "#00b4b4";
              const pct = d.total > 0 ? (d.breached / d.total) * 100 : 0;
              return (
                <div key={d.dept}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold capitalize" style={{ color: "#e0e0e0" }}>{d.dept.replace(/_/g, " ")}</span>
                    <div className="flex items-center gap-2">
                      {d.breached > 0 && <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: "rgba(224,35,71,0.12)", color: "#e02347" }}>{d.breached} breached</span>}
                      <span className="text-[10px] mono font-bold" style={{ color }}>{d.total} total</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min((d.total / Math.max(...deptData.map(x => x.total))) * 100, 100)}%`, background: `linear-gradient(90deg,${color},${color}88)` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Breached tickets list */}
      {breached.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#181818", border: "1px solid rgba(224,35,71,0.25)" }}>
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#e02347,transparent)" }} />
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <AlertTriangle className="w-4 h-4" style={{ color: "#e02347" }} />
            <p className="text-[12px] font-black" style={{ color: "#e02347" }}>SLA Breached — Immediate Action Required ({breached.length})</p>
          </div>
          <div>
            {breached.slice(0, 10).map(t => {
              const hoursOver = Math.abs(timeToBreachHours(t) || 0);
              return (
                <div key={t.id} className="flex items-center gap-4 px-5 py-3 data-row">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: "#e02347", boxShadow: "0 0 6px #e02347" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold truncate" style={{ color: "#f0f0f0" }}>{t.subject}</p>
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{t.customer_name} · {t.department} · {t.assigned_to || "Unassigned"}</p>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-lg flex-shrink-0 uppercase"
                    style={{ background: "rgba(224,35,71,0.12)", color: "#e02347", border: "1px solid rgba(224,35,71,0.25)" }}>
                    {t.priority}
                  </span>
                  <span className="text-[11px] font-black mono flex-shrink-0" style={{ color: "#e02347" }}>
                    +{hoursOver}h over
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* At-risk list */}
      {atRisk.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#181818", border: "1px solid rgba(245,158,11,0.25)" }}>
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#f59e0b,transparent)" }} />
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <Clock className="w-4 h-4" style={{ color: "#f59e0b" }} />
            <p className="text-[12px] font-black" style={{ color: "#f59e0b" }}>Approaching Breach — Less Than 2 Hours ({atRisk.length})</p>
          </div>
          <div>
            {atRisk.map(t => {
              const hoursLeft = timeToBreachHours(t);
              return (
                <div key={t.id} className="flex items-center gap-4 px-5 py-3 data-row">
                  <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "#f59e0b" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold truncate" style={{ color: "#f0f0f0" }}>{t.subject}</p>
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{t.customer_name} · {t.assigned_to || "Unassigned"}</p>
                  </div>
                  <span className="text-[11px] font-black mono flex-shrink-0" style={{ color: "#f59e0b" }}>
                    {hoursLeft}h left
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}