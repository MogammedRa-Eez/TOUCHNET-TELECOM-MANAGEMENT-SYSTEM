/**
 * Interactive inline visualisations for the User Manual.
 * Each component is a standalone demo — no live data needed.
 */
import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  CheckCircle2, Circle, Clock, AlertTriangle, XCircle,
  ArrowRight, Users, Receipt, TicketCheck, Wifi, ChevronRight,
  Shield, Zap, Activity
} from "lucide-react";

const TEAL = "#00b4b4";
const CRIMSN = "#8B1A1A";
const AMBER = "#f59e0b";
const GREEN = "#10b981";
const BLUE = "#0ea5e9";

/* ────────────────────────────────────────────────────────────
   1. KPI Cards Demo
──────────────────────────────────────────────────────────── */
export function KPICardsDemo() {
  const cards = [
    { icon: Users,      label: "Active Customers", value: "482",      sub: "12 added this month",  color: BLUE,   trend: "+5%" },
    { icon: Receipt,    label: "Monthly Revenue",  value: "R 284.6k",  sub: "From paid invoices",   color: GREEN,  trend: "+8.5%" },
    { icon: TicketCheck,label: "Open Tickets",     value: "17",        sub: "3 critical",           color: AMBER,  trend: "High" },
    { icon: Wifi,       label: "Network Nodes",    value: "24 / 26",   sub: "Currently online",     color: TEAL,   trend: "Normal" },
  ];
  return (
    <div className="rounded-xl overflow-hidden mt-4 no-print" style={{ border: "1px solid rgba(0,212,212,0.15)" }}>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "rgba(0,180,180,0.06)", borderBottom: "1px solid rgba(0,212,212,0.12)" }}>
        <Activity className="w-3.5 h-3.5" style={{ color: TEAL }} />
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: TEAL }}>Live Demo — KPI Cards</span>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3" style={{ background: "#161616" }}>
        {cards.map(({ icon: Icon, label, value, sub, color, trend }) => (
          <div key={label} className="rounded-xl p-4 relative overflow-hidden"
            style={{ background: `${color}08`, border: `1px solid ${color}25` }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg,${color},transparent)` }} />
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>{trend}</span>
            </div>
            <p className="text-[22px] font-black leading-none mb-1"
              style={{ color, fontFamily: "'JetBrains Mono',monospace" }}>{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   2. Revenue Bar Chart Demo
──────────────────────────────────────────────────────────── */
export function RevenueChartDemo() {
  const data = [
    { month: "Nov", paid: 210, overdue: 32 },
    { month: "Dec", paid: 245, overdue: 18 },
    { month: "Jan", paid: 198, overdue: 41 },
    { month: "Feb", paid: 267, overdue: 22 },
    { month: "Mar", paid: 253, overdue: 28 },
    { month: "Apr", paid: 285, overdue: 14 },
  ];
  return (
    <div className="rounded-xl overflow-hidden mt-4 no-print" style={{ border: "1px solid rgba(0,212,212,0.15)" }}>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "rgba(0,180,180,0.06)", borderBottom: "1px solid rgba(0,212,212,0.12)" }}>
        <Receipt className="w-3.5 h-3.5" style={{ color: TEAL }} />
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: TEAL }}>Live Demo — Revenue Chart (R thousands)</span>
      </div>
      <div className="p-4" style={{ background: "#161616" }}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barSize={18}>
            <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
            <Tooltip contentStyle={{ background: "#1e1e1e", border: "1px solid rgba(0,212,212,0.2)", borderRadius: 8, color: "#f0f0f0", fontSize: 11 }} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Legend wrapperStyle={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }} />
            <Bar dataKey="paid"    name="Paid (R k)"    fill={GREEN}  radius={[4,4,0,0]} />
            <Bar dataKey="overdue" name="Overdue (R k)" fill={CRIMSN} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   3. SLA Priority Timeline Demo
──────────────────────────────────────────────────────────── */
export function SLADemo() {
  const priorities = [
    { label: "Critical", hours: 2,  color: "#ef4444", example: "Total connectivity loss" },
    { label: "High",     hours: 8,  color: AMBER,     example: "Significant speed degradation" },
    { label: "Medium",   hours: 24, color: BLUE,      example: "Intermittent connectivity" },
    { label: "Low",      hours: 72, color: GREEN,     example: "Billing enquiry" },
  ];
  const max = 72;
  return (
    <div className="rounded-xl overflow-hidden mt-4 no-print" style={{ border: "1px solid rgba(0,212,212,0.15)" }}>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "rgba(0,180,180,0.06)", borderBottom: "1px solid rgba(0,212,212,0.12)" }}>
        <Clock className="w-3.5 h-3.5" style={{ color: TEAL }} />
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: TEAL }}>Live Demo — SLA Response Windows</span>
      </div>
      <div className="p-4 space-y-3" style={{ background: "#161616" }}>
        {priorities.map(p => (
          <div key={p.label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black" style={{ color: p.color }}>{p.label}</span>
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>— {p.example}</span>
              </div>
              <span className="text-[10px] font-black mono" style={{ color: p.color }}>{p.hours}h SLA</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full relative overflow-hidden transition-all duration-700"
                style={{ width: `${(p.hours / max) * 100}%`, background: `linear-gradient(90deg,${p.color},${p.color}90)`, boxShadow: `0 0 8px ${p.color}60` }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)", backgroundSize: "200% 100%", animation: "shimmer 2s infinite" }} />
              </div>
            </div>
          </div>
        ))}
        <p className="text-[10px] pt-1" style={{ color: "rgba(255,255,255,0.25)" }}>SLA clock starts when the ticket is created. Breached tickets turn red and trigger Slack alerts.</p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   4. Ticket Status Flow Demo
──────────────────────────────────────────────────────────── */
export function TicketStatusFlowDemo() {
  const [active, setActive] = useState("open");
  const statuses = [
    { id: "open",           label: "Open",            color: "#ef4444", desc: "New ticket — awaiting assignment." },
    { id: "in_progress",    label: "In Progress",     color: AMBER,     desc: "Assigned to a technician, work underway." },
    { id: "waiting_customer",label: "Waiting Customer",color: BLUE,    desc: "Pending a response or action from the customer." },
    { id: "escalated",      label: "Escalated",       color: "#a855f7", desc: "Flagged for senior attention; appears in dashboard alerts." },
    { id: "resolved",       label: "Resolved",        color: GREEN,     desc: "Solution applied. Customer confirmation pending." },
    { id: "closed",         label: "Closed",          color: "rgba(255,255,255,0.3)", desc: "Fully completed and archived." },
  ];
  const current = statuses.find(s => s.id === active);
  return (
    <div className="rounded-xl overflow-hidden mt-4 no-print" style={{ border: "1px solid rgba(0,212,212,0.15)" }}>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "rgba(0,180,180,0.06)", borderBottom: "1px solid rgba(0,212,212,0.12)" }}>
        <TicketCheck className="w-3.5 h-3.5" style={{ color: TEAL }} />
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: TEAL }}>Live Demo — Ticket Lifecycle (click a status)</span>
      </div>
      <div className="p-4" style={{ background: "#161616" }}>
        <div className="flex flex-wrap gap-2 mb-4">
          {statuses.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1.5">
              <button onClick={() => setActive(s.id)}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all hover:scale-105"
                style={{
                  background: active === s.id ? `${s.color}20` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active === s.id ? s.color : "rgba(255,255,255,0.08)"}`,
                  color: active === s.id ? s.color : "rgba(255,255,255,0.35)",
                  boxShadow: active === s.id ? `0 0 12px ${s.color}30` : "none"
                }}>
                {s.label}
              </button>
              {i < statuses.length - 1 && <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.15)" }} />}
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: `${current.color}08`, border: `1px solid ${current.color}25` }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: `${current.color}15`, border: `1px solid ${current.color}30` }}>
            <TicketCheck className="w-4 h-4" style={{ color: current.color }} />
          </div>
          <div>
            <p className="text-[13px] font-black mb-1" style={{ color: current.color }}>{current.label}</p>
            <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.5)" }}>{current.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   5. Project Pipeline / Kanban Demo
──────────────────────────────────────────────────────────── */
export function ProjectPipelineDemo() {
  const stages = [
    { label: "Lead",        count: 8,  color: "rgba(255,255,255,0.3)" },
    { label: "Quoted",      count: 5,  color: BLUE },
    { label: "Approved",    count: 3,  color: AMBER },
    { label: "In Progress", count: 6,  color: "#8b5cf6" },
    { label: "Testing",     count: 2,  color: TEAL },
    { label: "Live",        count: 12, color: GREEN },
    { label: "Billed",      count: 40, color: "#059669" },
  ];
  const total = stages.reduce((a, s) => a + s.count, 0);
  return (
    <div className="rounded-xl overflow-hidden mt-4 no-print" style={{ border: "1px solid rgba(0,212,212,0.15)" }}>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "rgba(0,180,180,0.06)", borderBottom: "1px solid rgba(0,212,212,0.12)" }}>
        <Activity className="w-3.5 h-3.5" style={{ color: TEAL }} />
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: TEAL }}>Live Demo — Fibre Project Pipeline</span>
      </div>
      <div className="p-4 space-y-2.5" style={{ background: "#161616" }}>
        {stages.map(s => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="text-[10px] font-bold w-20 flex-shrink-0 text-right" style={{ color: s.color }}>{s.label}</span>
            <div className="flex-1 h-5 rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="h-full rounded-lg flex items-center pl-2 relative overflow-hidden"
                style={{ width: `${(s.count / total) * 100}%`, minWidth: 24, background: `linear-gradient(90deg,${s.color},${s.color}90)` }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)", backgroundSize: "200% 100%", animation: "shimmer 2s infinite" }} />
                <span className="text-[9px] font-black text-white relative z-10">{s.count}</span>
              </div>
            </div>
            <span className="text-[9px] font-bold w-8 text-right" style={{ color: "rgba(255,255,255,0.25)" }}>{Math.round((s.count / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   6. Project Task Steps Demo
──────────────────────────────────────────────────────────── */
export function ProjectTasksDemo() {
  const tasks = [
    { n: 1, title: "Welcome Communication",    status: "completed" },
    { n: 2, title: "Vendor Process",           status: "completed" },
    { n: 3, title: "Internal Cutover Booking", status: "completed" },
    { n: 4, title: "Engineer On-Site Booking", status: "in_progress" },
    { n: 5, title: "IRIS Monitoring",          status: "pending" },
    { n: 6, title: "Activate Contract",        status: "pending" },
    { n: 7, title: "TNET Billing",             status: "pending" },
  ];
  const cfg = {
    completed:   { color: GREEN,  icon: CheckCircle2, label: "Done" },
    in_progress: { color: AMBER,  icon: Clock,        label: "Active" },
    pending:     { color: "rgba(255,255,255,0.2)", icon: Circle, label: "Pending" },
  };
  return (
    <div className="rounded-xl overflow-hidden mt-4 no-print" style={{ border: "1px solid rgba(0,212,212,0.15)" }}>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "rgba(0,180,180,0.06)", borderBottom: "1px solid rgba(0,212,212,0.12)" }}>
        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: TEAL }} />
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: TEAL }}>Live Demo — Project Task Workflow</span>
      </div>
      <div className="p-4" style={{ background: "#161616" }}>
        <div className="space-y-2">
          {tasks.map((t, i) => {
            const c = cfg[t.status];
            const Icon = c.icon;
            return (
              <div key={t.n} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${c.color}15`, border: `1px solid ${c.color}35` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: c.color }} />
                  </div>
                  {i < tasks.length - 1 && <div className="w-px h-4 mt-1" style={{ background: "rgba(255,255,255,0.08)" }} />}
                </div>
                <div className="flex-1 flex items-center justify-between py-1">
                  <span className="text-[12px]" style={{ color: t.status === "pending" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)" }}>
                    <span className="font-black mr-1.5" style={{ color: c.color }}>#{t.n}</span>
                    {t.title}
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded ml-2"
                    style={{ background: `${c.color}12`, color: c.color, border: `1px solid ${c.color}25` }}>{c.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   7. Network Node Status Demo
──────────────────────────────────────────────────────────── */
export function NetworkNodesDemo() {
  const nodes = [
    { name: "Core Router JHB-01",    type: "core_router",         status: "online",      uptime: 99.9, bw: 67 },
    { name: "OLT Sandton-02",        type: "olt",                 status: "online",      uptime: 98.2, bw: 45 },
    { name: "Access Point CBD-07",   type: "access_point",        status: "degraded",    uptime: 91.4, bw: 88 },
    { name: "Distribution SW-PTA",   type: "distribution_switch", status: "online",      uptime: 99.5, bw: 33 },
    { name: "BTS Midrand-03",        type: "bts",                 status: "offline",     uptime: 72.1, bw: 0  },
    { name: "Server HUB-01",         type: "server",              status: "maintenance", uptime: 100,  bw: 10 },
  ];
  const statusCfg = {
    online:      { color: GREEN,  label: "Online",      dot: "#34d399" },
    degraded:    { color: AMBER,  label: "Degraded",    dot: "#fbbf24" },
    offline:     { color: "#ef4444", label: "Offline",  dot: "#f87171" },
    maintenance: { color: "#818cf8", label: "Maintenance", dot: "#a78bfa" },
  };
  return (
    <div className="rounded-xl overflow-hidden mt-4 no-print" style={{ border: "1px solid rgba(0,212,212,0.15)" }}>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "rgba(0,180,180,0.06)", borderBottom: "1px solid rgba(0,212,212,0.12)" }}>
        <Wifi className="w-3.5 h-3.5" style={{ color: TEAL }} />
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: TEAL }}>Live Demo — Network Node Monitor</span>
      </div>
      <div className="p-3 space-y-2" style={{ background: "#161616" }}>
        {nodes.map(n => {
          const sc = statusCfg[n.status];
          return (
            <div key={n.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: `${sc.color}06`, border: `1px solid ${sc.color}18` }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sc.dot, boxShadow: `0 0 6px ${sc.dot}` }} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold truncate" style={{ color: "rgba(255,255,255,0.7)" }}>{n.name}</p>
                <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>{n.type.replace(/_/g," ")}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] font-black" style={{ color: sc.color }}>{sc.label}</p>
                <p className="text-[9px] mono" style={{ color: "rgba(255,255,255,0.25)" }}>↑{n.uptime}% / BW {n.bw}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   8. Roles & Permissions Matrix Demo
──────────────────────────────────────────────────────────── */
export function PermissionsMatrixDemo() {
  const roles  = ["Admin", "Finance", "Technical", "Sales", "HR"];
  const perms  = ["Dashboard", "Customers", "Billing", "Tickets", "Network", "Employees", "AI Assistant", "View Financials", "Delete Records"];
  const matrix = {
    Admin:     [1,1,1,1,1,1,1,1,1],
    Finance:   [1,1,1,0,0,0,0,1,0],
    Technical: [1,1,0,1,1,0,1,0,0],
    Sales:     [1,1,0,1,0,0,0,0,0],
    HR:        [0,0,0,0,0,1,0,0,0],
  };
  return (
    <div className="rounded-xl overflow-hidden mt-4 no-print" style={{ border: "1px solid rgba(0,212,212,0.15)" }}>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "rgba(0,180,180,0.06)", borderBottom: "1px solid rgba(0,212,212,0.12)" }}>
        <Shield className="w-3.5 h-3.5" style={{ color: TEAL }} />
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: TEAL }}>Live Demo — Permissions Matrix</span>
      </div>
      <div className="p-3 overflow-x-auto" style={{ background: "#161616" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "4px 8px", color: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>Permission</th>
              {roles.map(r => (
                <th key={r} style={{ padding: "4px 8px", textAlign: "center", color: r === "Admin" ? TEAL : "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 800, textTransform: "uppercase" }}>{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {perms.map((perm, i) => (
              <tr key={perm} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "5px 8px", fontSize: 10, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{perm}</td>
                {roles.map(role => {
                  const has = matrix[role][i];
                  return (
                    <td key={role} style={{ padding: "5px 8px", textAlign: "center" }}>
                      {has
                        ? <CheckCircle2 className="w-3.5 h-3.5 mx-auto" style={{ color: role === "Admin" ? TEAL : GREEN }} />
                        : <XCircle className="w-3.5 h-3.5 mx-auto" style={{ color: "rgba(255,255,255,0.1)" }} />}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   9. Quote Lifecycle Demo
──────────────────────────────────────────────────────────── */
export function QuoteLifecycleDemo() {
  const [current, setCurrent] = useState(0);
  const stages = [
    { label: "Draft",    color: "rgba(255,255,255,0.3)", desc: "Quote is being built. Not visible to the customer yet." },
    { label: "Sent",     color: BLUE,   desc: "A shareable link was generated and emailed to the customer." },
    { label: "Viewed",   color: "#8b5cf6", desc: "The customer opened the quote link. Timestamp recorded." },
    { label: "Accepted", color: GREEN,  desc: "Customer signed digitally. Project can be initiated." },
    { label: "Declined", color: CRIMSN, desc: "Customer declined. Follow up or revise and resend." },
    { label: "Expired",  color: AMBER,  desc: "Validity date passed without a response." },
  ];
  return (
    <div className="rounded-xl overflow-hidden mt-4 no-print" style={{ border: "1px solid rgba(0,212,212,0.15)" }}>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "rgba(0,180,180,0.06)", borderBottom: "1px solid rgba(0,212,212,0.12)" }}>
        <Zap className="w-3.5 h-3.5" style={{ color: TEAL }} />
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: TEAL }}>Live Demo — Quote Status Lifecycle (click to explore)</span>
      </div>
      <div className="p-4" style={{ background: "#161616" }}>
        <div className="flex flex-wrap gap-2 mb-4">
          {stages.map((s, i) => (
            <button key={s.label} onClick={() => setCurrent(i)}
              className="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all hover:scale-105"
              style={{
                background: current === i ? `${s.color}18` : "rgba(255,255,255,0.04)",
                border: `1px solid ${current === i ? s.color : "rgba(255,255,255,0.08)"}`,
                color: current === i ? s.color : "rgba(255,255,255,0.3)",
              }}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="rounded-xl p-4"
          style={{ background: `${stages[current].color}08`, border: `1px solid ${stages[current].color}25` }}>
          <p className="text-[13px] font-black mb-1" style={{ color: stages[current].color }}>{stages[current].label}</p>
          <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.5)" }}>{stages[current].desc}</p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   10. Department Breakdown Donut Demo
──────────────────────────────────────────────────────────── */
export function DepartmentDonutDemo() {
  const data = [
    { name: "Technical", value: 34, color: TEAL },
    { name: "Sales",     value: 22, color: BLUE },
    { name: "Finance",   value: 15, color: GREEN },
    { name: "Projects",  value: 18, color: "#8b5cf6" },
    { name: "HR",        value: 7,  color: AMBER },
    { name: "Cyber Sec", value: 4,  color: CRIMSN },
  ];
  return (
    <div className="rounded-xl overflow-hidden mt-4 no-print" style={{ border: "1px solid rgba(0,212,212,0.15)" }}>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "rgba(0,180,180,0.06)", borderBottom: "1px solid rgba(0,212,212,0.12)" }}>
        <Users className="w-3.5 h-3.5" style={{ color: TEAL }} />
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: TEAL }}>Live Demo — Employees by Department</span>
      </div>
      <div className="p-4 flex flex-col sm:flex-row items-center gap-4" style={{ background: "#161616" }}>
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
              {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#1e1e1e", border: "1px solid rgba(0,212,212,0.2)", borderRadius: 8, color: "#f0f0f0", fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 flex-1">
          {data.map(d => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>{d.name}</span>
              <span className="text-[10px] font-black ml-auto" style={{ color: d.color }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   11. Notification Alert Types Demo
──────────────────────────────────────────────────────────── */
export function NotificationTypesDemo() {
  const types = [
    { type: "Info",    color: BLUE,    icon: "ℹ",  example: "Customer 'Acme Corp' was created." },
    { type: "Success", color: GREEN,   icon: "✓",  example: "Invoice INV-0042 marked as Paid." },
    { type: "Warning", color: AMBER,   icon: "⚠",  example: "Invoice INV-0039 is 3 days overdue." },
    { type: "Error",   color: "#ef4444",icon: "✕", example: "Network node 'OLT Sandton-02' went offline." },
  ];
  return (
    <div className="rounded-xl overflow-hidden mt-4 no-print" style={{ border: "1px solid rgba(0,212,212,0.15)" }}>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "rgba(0,180,180,0.06)", borderBottom: "1px solid rgba(0,212,212,0.12)" }}>
        <Zap className="w-3.5 h-3.5" style={{ color: TEAL }} />
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: TEAL }}>Live Demo — Notification Alert Types</span>
      </div>
      <div className="p-3 space-y-2" style={{ background: "#161616" }}>
        {types.map(t => (
          <div key={t.type} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: `${t.color}08`, border: `1px solid ${t.color}25` }}>
            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
              style={{ background: `${t.color}18`, color: t.color }}>{t.icon}</span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider mr-2" style={{ color: t.color }}>{t.type}</span>
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>{t.example}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}