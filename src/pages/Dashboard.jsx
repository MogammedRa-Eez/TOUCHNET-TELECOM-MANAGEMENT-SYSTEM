import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Users, Receipt, TicketCheck, Wifi, DollarSign, Globe, Activity,
  Zap, ArrowUpRight, RefreshCw, ChevronDown, ChevronUp, AlertTriangle,
  XCircle, Clock, TrendingUp, Eye, X
} from "lucide-react";
import KPICard from "../components/dashboard/KPICard";
import RevenueChart from "../components/dashboard/RevenueChart";
import TicketOverview from "../components/dashboard/TicketOverview";
import NetworkHealth from "../components/dashboard/NetworkHealth";
import RecentActivity from "../components/dashboard/RecentActivity";
import UserActivityPanel from "../components/dashboard/UserActivityPanel";
import NetworkGlobe from "../components/dashboard/NetworkGlobe";
import { Skeleton } from "@/components/ui/skeleton";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";

// ── Mini alert ticker ─────────────────────────────────────────────────────────
function AlertTicker({ tickets, nodes }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  const alerts = [
    ...tickets.filter(t => t.priority === "critical" && !["resolved","closed"].includes(t.status))
      .map(t => ({ type: "critical", text: `Critical ticket: ${t.subject}`, icon: AlertTriangle, color: "#ef4444", page: "/Tickets" })),
    ...nodes.filter(n => n.status === "offline")
      .map(n => ({ type: "offline",  text: `Node offline: ${n.name}`,        icon: XCircle,       color: "#ef4444", page: "/Network" })),
    ...nodes.filter(n => n.status === "degraded")
      .map(n => ({ type: "degraded", text: `Node degraded: ${n.name}`,       icon: AlertTriangle, color: "#f59e0b", page: "/Network" })),
  ];

  useEffect(() => {
    if (alerts.length < 2) return;
    const id = setInterval(() => setIdx(i => (i + 1) % alerts.length), 4000);
    return () => clearInterval(id);
  }, [alerts.length]);

  if (!visible || alerts.length === 0) return null;
  const alert = alerts[idx];
  const Icon  = alert.icon;

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-xl justify-between"
      style={{ background: `${alert.color}10`, border: `1px solid ${alert.color}30` }}>
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: alert.color }} />
        <span className="text-[11px] font-semibold truncate" style={{ color: alert.color }}>{alert.text}</span>
        {alerts.length > 1 && (
          <span className="text-[9px] mono flex-shrink-0" style={{ color: `${alert.color}80` }}>{idx + 1}/{alerts.length}</span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link to={alert.page} className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: `${alert.color}18`, color: alert.color }}>View →</Link>
        <button onClick={() => setVisible(false)} className="opacity-50 hover:opacity-100">
          <X className="w-3 h-3" style={{ color: alert.color }} />
        </button>
      </div>
    </div>
  );
}

// ── KPI Detail Drawer ─────────────────────────────────────────────────────────
function KPIDrawer({ kpiKey, customers, invoices, tickets, nodes, onClose }) {
  const items = {
    customers: {
      title: "Customer Breakdown",
      rows: [
        { label: "Active",    value: customers.filter(c=>c.status==="active").length,    color: "#10b981" },
        { label: "Suspended", value: customers.filter(c=>c.status==="suspended").length, color: "#f59e0b" },
        { label: "Pending",   value: customers.filter(c=>c.status==="pending").length,   color: "#6366f1" },
        { label: "Terminated",value: customers.filter(c=>c.status==="terminated").length,color: "#ef4444" },
      ],
      link: "/Customers", linkLabel: "Manage Customers",
    },
    revenue: {
      title: "Revenue Breakdown",
      rows: [
        { label: "Paid",      value: `R${invoices.filter(i=>i.status==="paid").reduce((a,i)=>a+(i.total||i.amount||0),0).toLocaleString()}`,     color: "#10b981" },
        { label: "Overdue",   value: `R${invoices.filter(i=>i.status==="overdue").reduce((a,i)=>a+(i.total||i.amount||0),0).toLocaleString()}`,   color: "#ef4444" },
        { label: "Pending",   value: `R${invoices.filter(i=>i.status==="sent").reduce((a,i)=>a+(i.total||i.amount||0),0).toLocaleString()}`,     color: "#f59e0b" },
        { label: "Total Invoices", value: invoices.length, color: "#6366f1" },
      ],
      link: "/Billing", linkLabel: "Open Billing",
    },
    tickets: {
      title: "Ticket Breakdown",
      rows: [
        { label: "Open",       value: tickets.filter(t=>t.status==="open").length,        color: "#ef4444" },
        { label: "In Progress",value: tickets.filter(t=>t.status==="in_progress").length, color: "#f59e0b" },
        { label: "Critical",   value: tickets.filter(t=>t.priority==="critical").length,  color: "#dc2626" },
        { label: "Resolved",   value: tickets.filter(t=>t.status==="resolved").length,    color: "#10b981" },
      ],
      link: "/Tickets", linkLabel: "View Tickets",
    },
    nodes: {
      title: "Node Status Breakdown",
      rows: [
        { label: "Online",      value: nodes.filter(n=>n.status==="online").length,      color: "#10b981" },
        { label: "Degraded",    value: nodes.filter(n=>n.status==="degraded").length,    color: "#f59e0b" },
        { label: "Maintenance", value: nodes.filter(n=>n.status==="maintenance").length, color: "#818cf8" },
        { label: "Offline",     value: nodes.filter(n=>n.status==="offline").length,     color: "#ef4444" },
      ],
      link: "/Network", linkLabel: "Network Map",
    },
  };
  const item = items[kpiKey];
  if (!item) return null;

  return (
    <div className="absolute inset-x-0 top-full mt-2 z-50 rounded-2xl shadow-2xl overflow-hidden"
      style={{ background: "white", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 16px 48px rgba(99,102,241,0.15)" }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
        <p className="text-[13px] font-bold text-slate-800">{item.title}</p>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100">
          <X className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {item.rows.map(row => (
          <div key={row.label} className="rounded-xl p-3" style={{ background: `${row.color}09`, border: `1px solid ${row.color}20` }}>
            <p className="text-[20px] font-black mono" style={{ color: row.color }}>{row.value}</p>
            <p className="text-[10px] mt-0.5 text-slate-400">{row.label}</p>
          </div>
        ))}
      </div>
      <div className="px-4 pb-4">
        <Link to={item.link} className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
          <Eye className="w-3.5 h-3.5" /> {item.linkLabel} <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

// ── Collapsible section wrapper ───────────────────────────────────────────────
function Section({ title, icon: Icon, children, defaultOpen = true, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        className="w-full flex items-center justify-between mb-3 group"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: "#6366f1" }} />
          <span className="text-[13px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{title}</span>
          {badge != null && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold"
              style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>{badge}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && children}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { can, loading: rbacLoading } = useRBAC();
  const [activeKPI, setActiveKPI] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const { data: customers = [], isLoading: lC, refetch: rC } = useQuery({ queryKey: ["customers"],     queryFn: () => base44.entities.Customer.list("-created_date", 100) });
  const { data: invoices  = [], isLoading: lI, refetch: rI } = useQuery({ queryKey: ["invoices"],      queryFn: () => base44.entities.Invoice.list("-created_date", 100) });
  const { data: tickets   = [], isLoading: lT, refetch: rT } = useQuery({ queryKey: ["tickets"],       queryFn: () => base44.entities.Ticket.list("-created_date", 100) });
  const { data: nodes     = [], isLoading: lN, refetch: rN } = useQuery({ queryKey: ["network-nodes"], queryFn: () => base44.entities.NetworkNode.list() });

  const isLoading = lC || lI || lT || lN;
  if (!rbacLoading && !can("dashboard")) return <AccessDenied />;

  const activeCustomers = customers.filter(c => c.status === "active").length;
  const totalRevenue    = invoices.filter(i => i.status === "paid").reduce((a, i) => a + (i.total || i.amount || 0), 0);
  const openTickets     = tickets.filter(t => !["resolved","closed"].includes(t.status)).length;
  const onlineNodes     = nodes.filter(n => n.status === "online").length;
  const offlineNodes    = nodes.filter(n => n.status === "offline").length;
  const degradedNodes   = nodes.filter(n => n.status === "degraded").length;

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([rC(), rI(), rT(), rN()]);
    setLastRefresh(new Date());
    setRefreshing(false);
  };

  // tick causes re-evaluation so the label stays current
  const timeSince = Math.floor((Date.now() - lastRefresh.getTime()) / 1000);
  const timeLabel = timeSince < 60 ? `${timeSince}s ago` : `${Math.floor(timeSince / 60)}m ago`;

  if (isLoading) {
    return (
      <div className="p-5 lg:p-8 space-y-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <Skeleton className="h-96 rounded-2xl lg:col-span-3" />
          <div className="lg:col-span-2 space-y-5">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 lg:p-8 space-y-6 max-w-[1600px] mx-auto" onClick={() => setActiveKPI(null)}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "#1e293b" }}>Operations Overview</h1>
          <p className="text-[11px] mt-0.5 mono" style={{ color: "rgba(100,116,139,0.55)" }}>
            {new Date().toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg text-[11px] font-bold"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#059669" }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="mono">All Systems Operational</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px]"
            style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", color: "#94a3b8" }}>
            <Clock className="w-3 h-3" />
            <span className="mono">Updated {timeLabel}</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold"
            style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#6366f1" }}>
            <Zap className="w-3.5 h-3.5" />
            <span className="mono">LIVE</span>
          </div>
        </div>
      </div>

      {/* ── Alert Ticker ── */}
      <AlertTicker tickets={tickets} nodes={nodes} />

      {/* ── KPI Row (clickable for detail) ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { key: "customers", card: <KPICard title="Active Customers" value={activeCustomers.toLocaleString()} subtitle={`${customers.length} total accounts`} icon={Users} color="blue" trend="up" trendValue="+12%" /> },
          { key: "revenue",   card: <KPICard title="Monthly Revenue"  value={`R${(totalRevenue/1000).toFixed(1)}k`} subtitle="From paid invoices" icon={DollarSign} color="emerald" trend="up" trendValue="+8.5%" /> },
          { key: "tickets",   card: <KPICard title="Open Tickets"     value={openTickets} subtitle={`${tickets.length} total`} icon={TicketCheck} color="amber" trend={openTickets>10?"up":"down"} trendValue={openTickets>10?"High":"Normal"} /> },
          { key: "nodes",     card: <KPICard title="Network Nodes"    value={`${onlineNodes}/${nodes.length}`} subtitle="Currently online" icon={Wifi} color="violet" /> },
        ].map(({ key, card }) => (
          <div key={key} className="relative" onClick={e => { e.stopPropagation(); setActiveKPI(activeKPI === key ? null : key); }}>
            <div className={`cursor-pointer transition-all duration-150 rounded-2xl ${activeKPI === key ? "ring-2 ring-indigo-400 scale-[1.02]" : "hover:scale-[1.01]"}`}>
              {card}
              <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[9px] font-bold"
                style={{ color: "rgba(99,102,241,0.5)" }}>
                <Eye className="w-2.5 h-2.5" /> Details
              </div>
            </div>
            {activeKPI === key && (
              <KPIDrawer kpiKey={key} customers={customers} invoices={invoices} tickets={tickets} nodes={nodes} onClose={() => setActiveKPI(null)} />
            )}
          </div>
        ))}
      </div>

      {/* ── Globe + Sidebar ── */}
      <Section title="Network Coverage" icon={Globe} badge={`${onlineNodes}/${nodes.length} online`}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 rounded-3xl overflow-hidden relative"
            style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #2e1065 60%, #0c1a3e 100%)", border: "1px solid rgba(99,102,241,0.2)", boxShadow: "0 8px 40px rgba(99,102,241,0.15)", minHeight: 600 }}>
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-4 pb-12"
              style={{ background: "linear-gradient(180deg, rgba(10,8,28,0.95) 0%, transparent 100%)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.35)" }}>
                  <Globe className="w-4 h-4" style={{ color: "#a78bfa" }} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white leading-tight">Network Coverage</p>
                  <p className="text-[9px] text-white/30 mono">Drag · Scroll zoom · Hover nodes</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {[
                  { color: "#34d399", label: `${onlineNodes} Online` },
                  { color: "#fbbf24", label: `${degradedNodes} Degraded` },
                  { color: "#ef4444", label: `${offlineNodes} Offline` },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                    <span className="text-[9px] text-white/40 mono">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full h-full" style={{ minHeight: 600 }}>
              <NetworkGlobe nodes={nodes} />
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-5">
            <NetworkHealth nodes={nodes} />
            <div className="rounded-2xl p-5 flex-1"
              style={{ background: "#ffffff", border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 2px 16px rgba(99,102,241,0.06)" }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-bold flex items-center gap-2" style={{ color: "#1e293b" }}>
                  <Activity className="w-3.5 h-3.5" style={{ color: "#6366f1" }} /> Quick Stats
                </p>
                <span className="text-[10px] mono" style={{ color: "rgba(100,116,139,0.5)" }}>Live</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Avg Uptime",      value: nodes.length ? `${(nodes.reduce((a,n)=>a+(n.uptime_percent||0),0)/nodes.length).toFixed(1)}%` : "—", color: "#10b981", bg: "rgba(16,185,129,0.07)", link: "/Network" },
                  { label: "Paid Invoices",   value: invoices.filter(i=>i.status==="paid").length, color: "#3b82f6", bg: "rgba(59,130,246,0.07)", link: "/Billing" },
                  { label: "Critical Tickets",value: tickets.filter(t=>t.priority==="critical").length, color: "#ef4444", bg: "rgba(239,68,68,0.07)", link: "/Tickets" },
                  { label: "Suspended",       value: customers.filter(c=>c.status==="suspended").length, color: "#f59e0b", bg: "rgba(245,158,11,0.07)", link: "/Customers" },
                ].map(stat => (
                  <Link to={stat.link} key={stat.label}
                    className="rounded-xl p-3 transition-all hover:scale-105 hover:shadow-md"
                    style={{ background: stat.bg, border: `1px solid ${stat.color}20` }}>
                    <p className="text-[20px] font-black mono" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-[10px] mt-0.5 leading-tight" style={{ color: "#94a3b8" }}>{stat.label}</p>
                    <ArrowUpRight className="w-3 h-3 mt-1 opacity-40" style={{ color: stat.color }} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Revenue + Tickets ── */}
      <Section title="Financial & Tickets" icon={TrendingUp} badge={`${invoices.filter(i=>i.status==="overdue").length} overdue`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <RevenueChart invoices={invoices} />
          </div>
          <TicketOverview tickets={tickets} />
        </div>
      </Section>

      {/* ── Activity ── */}
      <Section title="Recent Activity" icon={Activity}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <RecentActivity customers={customers} tickets={tickets} invoices={invoices} />
          <UserActivityPanel customers={customers} tickets={tickets} invoices={invoices} />
        </div>
      </Section>

      {/* ── WhatsApp AI FAB ── */}
      <a
        href={base44.agents.getWhatsAppConnectURL('touchnet_assistant')}
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-white text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", boxShadow: "0 8px 32px rgba(37,211,102,0.4)" }}>
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        AI Assistant
      </a>
    </div>
  );
}