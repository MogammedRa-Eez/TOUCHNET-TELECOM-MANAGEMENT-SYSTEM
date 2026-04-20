import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Users, Receipt, TicketCheck, Wifi, DollarSign, Globe, Activity,
  Zap, ArrowUpRight, RefreshCw, ChevronDown, ChevronUp, AlertTriangle,
  XCircle, Clock, TrendingUp, Eye, X, CheckCircle2, BarChart3,
  Shield, Cpu, Network, MapPin
} from "lucide-react";
import KPICard from "../components/dashboard/KPICard";
import RevenueChart from "../components/dashboard/RevenueChart";
import TicketOverview from "../components/dashboard/TicketOverview";
import NetworkHealth from "../components/dashboard/NetworkHealth";
import RecentActivity from "../components/dashboard/RecentActivity";
import UserActivityPanel from "../components/dashboard/UserActivityPanel";
import NetworkGlobe from "../components/dashboard/NetworkGlobe";
import CoverageChecker from "@/components/coverage/CoverageChecker.jsx";
import CoverageSearchChart from "@/components/coverage/CoverageSearchChart";
import { Skeleton } from "@/components/ui/skeleton";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";

// ── Alert ticker ──────────────────────────────────────────────────────────────
function AlertTicker({ tickets, nodes }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  const alerts = [
    ...tickets.filter(t => t.priority === "critical" && !["resolved","closed"].includes(t.status))
      .map(t => ({ type: "critical", text: `Critical ticket: ${t.subject}`, icon: AlertTriangle, color: "#ef4444", page: "/Tickets" })),
    ...nodes.filter(n => n.status === "offline")
      .map(n => ({ type: "offline",  text: `Node offline: ${n.name}`, icon: XCircle, color: "#ef4444", page: "/Network" })),
    ...nodes.filter(n => n.status === "degraded")
      .map(n => ({ type: "degraded", text: `Node degraded: ${n.name}`, icon: AlertTriangle, color: "#f59e0b", page: "/Network" })),
  ];

  useEffect(() => {
    if (alerts.length < 2) return;
    const id = setInterval(() => setIdx(i => (i + 1) % alerts.length), 4000);
    return () => clearInterval(id);
  }, [alerts.length]);

  if (!visible || alerts.length === 0) return null;
  const alert = alerts[idx];
  const Icon = alert.icon;

  return (
    <div className="relative overflow-hidden flex items-center gap-3 px-4 py-2.5 rounded-2xl justify-between"
      style={{ background: `linear-gradient(90deg, ${alert.color}0c, ${alert.color}06)`, border: `1px solid ${alert.color}25`, boxShadow: `0 2px 12px ${alert.color}10` }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${alert.color}, transparent)` }} />
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${alert.color}15`, border: `1px solid ${alert.color}30` }}>
          <Icon className="w-3.5 h-3.5" style={{ color: alert.color }} />
        </div>
        <span className="text-[12px] font-semibold truncate" style={{ color: alert.color }}>{alert.text}</span>
        {alerts.length > 1 && (
          <span className="text-[9px] mono flex-shrink-0 px-1.5 py-0.5 rounded"
            style={{ background: `${alert.color}12`, color: `${alert.color}` }}>{idx + 1}/{alerts.length}</span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link to={alert.page}
          className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all hover:scale-105"
          style={{ background: `${alert.color}15`, color: alert.color, border: `1px solid ${alert.color}25` }}>
          View →
        </Link>
        <button onClick={() => setVisible(false)}
          className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors">
          <X className="w-3 h-3" style={{ color: alert.color + "80" }} />
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
        { label: "Active",     value: customers.filter(c=>c.status==="active").length,     color: "#10b981" },
        { label: "Suspended",  value: customers.filter(c=>c.status==="suspended").length,  color: "#f59e0b" },
        { label: "Pending",    value: customers.filter(c=>c.status==="pending").length,    color: "#6366f1" },
        { label: "Terminated", value: customers.filter(c=>c.status==="terminated").length, color: "#ef4444" },
      ],
      link: "/Customers", linkLabel: "Manage Customers",
    },
    revenue: {
      title: "Revenue Breakdown",
      rows: [
        { label: "Paid",    value: `R${invoices.filter(i=>i.status==="paid").reduce((a,i)=>a+(i.total||i.amount||0),0).toLocaleString()}`,   color: "#10b981" },
        { label: "Overdue", value: `R${invoices.filter(i=>i.status==="overdue").reduce((a,i)=>a+(i.total||i.amount||0),0).toLocaleString()}`, color: "#ef4444" },
        { label: "Pending", value: `R${invoices.filter(i=>i.status==="sent").reduce((a,i)=>a+(i.total||i.amount||0),0).toLocaleString()}`,   color: "#f59e0b" },
        { label: "Invoices",value: invoices.length, color: "#6366f1" },
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
    <div className="absolute inset-x-0 top-full mt-2 z-50 rounded-2xl overflow-hidden bracket-card"
      style={{ background: "#1a1a1a", border: "1px solid rgba(0,180,180,0.25)", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>
      <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,#e02347,transparent)" }} />
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-[12px] font-black uppercase tracking-[0.15em]" style={{ color: "#00b4b4", fontFamily: "'Space Grotesk',sans-serif" }}>{item.title}</p>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-4 grid grid-cols-2 gap-2.5">
        {item.rows.map(row => (
          <div key={row.label} className="rounded-xl p-3 relative overflow-hidden holo-card"
            style={{ background: `${row.color}10`, border: `1px solid ${row.color}25` }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${row.color}, transparent)` }} />
            <p className="text-[22px] font-black mono" style={{ color: row.color }}>{row.value}</p>
            <p className="text-[10px] mt-0.5 font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{row.label}</p>
          </div>
        ))}
      </div>
      <div className="px-4 pb-4">
        <Link to={item.link} className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 14px rgba(0,180,180,0.3)" }}>
          <Eye className="w-3.5 h-3.5" /> {item.linkLabel} <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, defaultOpen = true, badge, color = "#1e2d6e" }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button className="w-full flex items-center justify-between mb-4 group" onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-3">
          {/* Accent bar */}
          <div className="w-1 h-7 rounded-full flex-shrink-0" style={{ background: `linear-gradient(180deg, ${color}, ${color}40, transparent)`, boxShadow: `0 0 8px ${color}60` }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
            style={{ background: `${color}12`, border: `1px solid ${color}30`, boxShadow: `0 0 16px ${color}20` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-black uppercase tracking-[0.18em] transition-colors"
              style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.18em" }}>{title}</span>
            {open && <div className="h-px mt-1 w-full" style={{ background: `linear-gradient(90deg, ${color}50, transparent)`, maxWidth: 80 }} />}
          </div>
          {badge != null && (
            <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider mono"
              style={{ background: `${color}12`, color, border: `1px solid ${color}30`, boxShadow: `0 0 8px ${color}15` }}>{badge}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-70 transition-all">
          <span className="text-[9px] font-black uppercase tracking-wider mono" style={{ color: "rgba(255,255,255,0.3)" }}>{open ? "COLLAPSE" : "EXPAND"}</span>
          {open ? <ChevronUp className="w-3.5 h-3.5" style={{ color }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color }} />}
        </div>
      </button>
      {open && children}
    </div>
  );
}

// ── System health mini-strip ──────────────────────────────────────────────────
function SystemHealthStrip({ customers, invoices, tickets, nodes }) {
  const overdueCount  = invoices.filter(i => i.status === "overdue").length;
  const criticalCount = tickets.filter(t => t.priority === "critical" && !["resolved","closed"].includes(t.status)).length;
  const offlineCount  = nodes.filter(n => n.status === "offline").length;
  const suspended     = customers.filter(c => c.status === "suspended").length;

  const items = [
    { label: "Overdue Invoices",   value: overdueCount,  color: overdueCount  > 0 ? "#ef4444" : "#10b981", good: overdueCount  === 0, link: "/Billing" },
    { label: "Critical Tickets",   value: criticalCount, color: criticalCount > 0 ? "#ef4444" : "#10b981", good: criticalCount === 0, link: "/Tickets" },
    { label: "Offline Nodes",      value: offlineCount,  color: offlineCount  > 0 ? "#ef4444" : "#10b981", good: offlineCount  === 0, link: "/Network" },
    { label: "Suspended Accounts", value: suspended,     color: suspended     > 0 ? "#f59e0b" : "#10b981", good: suspended     === 0, link: "/Customers" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map(item => (
        <Link key={item.label} to={item.link}
          className="relative overflow-hidden rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all hover:scale-[1.02] group"
          style={{
            background: item.good ? "linear-gradient(135deg,rgba(16,185,129,0.07),rgba(16,185,129,0.03))" : `linear-gradient(135deg,${item.color}0a,${item.color}04)`,
            border: `1px solid ${item.good ? "rgba(16,185,129,0.25)" : item.color + "35"}`,
            boxShadow: item.good ? "0 4px 16px rgba(16,185,129,0.08)" : `0 4px 16px ${item.color}12`,
          }}>
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}60, transparent)` }} />
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${item.color}20, transparent)` }} />
          {/* Animated scan line on hover */}
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: `linear-gradient(90deg, ${item.color}04, ${item.color}08, transparent)` }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative transition-transform group-hover:scale-110"
            style={{ background: `${item.color}15`, border: `1px solid ${item.color}30`, boxShadow: `0 0 12px ${item.color}20` }}>
            {item.good
              ? <CheckCircle2 className="w-4 h-4" style={{ color: item.color }} />
              : <AlertTriangle className="w-4 h-4" style={{ color: item.color }} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[22px] font-black mono leading-none" style={{ color: item.color, fontFamily: "'JetBrains Mono',monospace", textShadow: `0 0 20px ${item.color}60` }}>{item.value}</p>
            <p className="text-[9px] font-black mt-0.5 truncate uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.35)" }}>{item.label}</p>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: item.color }} />
        </Link>
      ))}
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
  const [showCoverage, setShowCoverage] = useState(false);

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
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-5 lg:p-8 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto" onClick={() => setActiveKPI(null)}>

      {/* ── Ticker ── */}
      <div className="hidden sm:flex relative overflow-hidden rounded-xl h-9 items-center"
        style={{ background: "linear-gradient(90deg, rgba(0,180,180,0.06), rgba(0,0,0,0.2), rgba(224,35,71,0.04))", border: "1px solid rgba(0,180,180,0.18)", boxShadow: "0 0 20px rgba(0,180,180,0.06), inset 0 1px 0 rgba(255,255,255,0.04)" }}>
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg,#111111,transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg,#111111,transparent)" }} />
        {/* Left tag */}
        <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center px-3"
          style={{ background: "rgba(0,180,180,0.15)", borderRight: "1px solid rgba(0,180,180,0.25)" }}>
          <span className="text-[8px] font-black uppercase tracking-[0.3em] mono" style={{ color: "#00d4d4" }}>SYS</span>
        </div>
        <div className="ticker-track flex items-center gap-12 px-6 whitespace-nowrap ml-12">
          {["OPERATIONS OVERVIEW", "NETWORK MONITORING", "REAL-TIME BILLING", "TICKET MANAGEMENT", "FIBRE DEPLOYMENT", "CUSTOMER ANALYTICS", "SLA COMPLIANCE", "COVERAGE MAPPING",
            "OPERATIONS OVERVIEW", "NETWORK MONITORING", "REAL-TIME BILLING", "TICKET MANAGEMENT", "FIBRE DEPLOYMENT", "CUSTOMER ANALYTICS", "SLA COMPLIANCE", "COVERAGE MAPPING"
          ].map((t, i) => (
            <span key={i} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] mono"
              style={{ color: i % 3 === 0 ? "#00d4d4" : i % 3 === 1 ? "rgba(0,212,212,0.35)" : "#e02347" }}>
              <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: i % 3 === 0 ? "#00d4d4" : i % 3 === 1 ? "rgba(0,212,212,0.3)" : "#e02347" }} />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-5 section-reveal"
        style={{ background: "linear-gradient(135deg,#141414,#1a1a1a,#141414)", border: "1px solid rgba(0,212,212,0.28)", boxShadow: "0 4px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,212,0.08), 0 0 60px rgba(0,180,180,0.05)" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,transparent,#00b4b4,#00d4d4,rgba(255,255,255,0.7),#00d4d4,#00b4b4,#e02347,transparent)", animation: "border-rotate 5s ease infinite", backgroundSize: "300% auto" }} />
        {/* Corner brackets */}
        <div className="absolute top-3 left-3 w-6 h-6 pointer-events-none" style={{ borderTop: "2px solid rgba(0,212,212,0.5)", borderLeft: "2px solid rgba(0,212,212,0.5)" }} />
        <div className="absolute top-3 right-3 w-6 h-6 pointer-events-none" style={{ borderTop: "2px solid rgba(224,35,71,0.4)", borderRight: "2px solid rgba(224,35,71,0.4)" }} />
        <div className="absolute bottom-3 left-3 w-6 h-6 pointer-events-none" style={{ borderBottom: "2px solid rgba(0,212,212,0.3)", borderLeft: "2px solid rgba(0,212,212,0.3)" }} />
        <div className="absolute bottom-3 right-3 w-6 h-6 pointer-events-none" style={{ borderBottom: "2px solid rgba(224,35,71,0.3)", borderRight: "2px solid rgba(224,35,71,0.3)" }} />
        {/* Dot grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(0,212,212,0.06) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute top-0 right-0 w-96 h-48 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(0,212,212,0.14) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-60 h-24 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 0% 100%, rgba(0,180,180,0.08) 0%, transparent 70%)" }} />

        <div className="relative flex flex-col gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.3em] mono px-2.5 py-1 rounded-lg"
                style={{ background: "rgba(0,180,180,0.12)", color: "#00d4d4", border: "1px solid rgba(0,212,212,0.3)", boxShadow: "0 0 12px rgba(0,180,180,0.15)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00d4d4", boxShadow: "0 0 6px #00d4d4" }} />
                TOUCHNET · TMS v3.0
              </span>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] mono px-2 py-1 rounded-lg"
                style={{ background: "rgba(224,35,71,0.1)", color: "#e02347", border: "1px solid rgba(224,35,71,0.25)" }}>
                LIVE
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight glow-text-navy" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Operations Overview</h1>
            <p className="text-[11px] mt-0.5 mono flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              <span style={{ color: "rgba(0,212,212,0.4)" }}>◈</span>
              {new Date().toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {nodes.filter(n => n.status === "offline").length === 0 && tickets.filter(t => t.priority === "critical" && !["resolved","closed"].includes(t.status)).length === 0 ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-black"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
                <span className="mono uppercase tracking-wider text-[10px]">All Systems OK</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-black"
                style={{ background: "rgba(224,35,71,0.1)", border: "1px solid rgba(224,35,71,0.3)", color: "#e02347" }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#e02347", boxShadow: "0 0 8px #e02347" }} />
                <span className="mono uppercase tracking-wider text-[10px]">Issues Detected</span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}>
              <Clock className="w-3 h-3" />
              <span className="mono">Updated {timeLabel}</span>
            </div>
            <button onClick={handleRefresh} disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", color: "white", boxShadow: "0 4px 16px rgba(0,180,180,0.3)" }}>
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{refreshing ? "Refreshing…" : "Refresh"}</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981" }}>
              <Zap className="w-3.5 h-3.5" />
              <span className="mono uppercase tracking-wider hidden sm:inline">LIVE</span>
            </div>
            <button onClick={() => setShowCoverage(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg,#e02347,#ff3358)", color: "white", boxShadow: "0 4px 14px rgba(224,35,71,0.3)" }}>
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Coverage Map</span>
            </button>
          </div>
        </div>
      </div>
      {showCoverage && <CoverageChecker onClose={() => setShowCoverage(false)} />}

      {/* ── Alert Ticker ── */}
      <AlertTicker tickets={tickets} nodes={nodes} />

      {/* ── System Health Strip ── */}
      <SystemHealthStrip customers={customers} invoices={invoices} tickets={tickets} nodes={nodes} />

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 section-reveal section-reveal-delay-1">
        {[
          { key: "customers", card: <KPICard title="Active Customers" value={activeCustomers.toLocaleString()} subtitle={`${customers.length} total accounts`} icon={Users} color="blue" trend="up" trendValue="+12%" /> },
          { key: "revenue",   card: <KPICard title="Monthly Revenue"  value={`R${(totalRevenue/1000).toFixed(1)}k`} subtitle="From paid invoices" icon={DollarSign} color="emerald" trend="up" trendValue="+8.5%" /> },
          { key: "tickets",   card: <KPICard title="Open Tickets"     value={openTickets} subtitle={`${tickets.length} total`} icon={TicketCheck} color="amber" trend={openTickets > 10 ? "up" : "down"} trendValue={openTickets > 10 ? "High" : "Normal"} /> },
          { key: "nodes",     card: <KPICard title="Network Nodes"    value={`${onlineNodes}/${nodes.length}`} subtitle="Currently online" icon={Wifi} color="violet" /> },
        ].map(({ key, card }) => (
          <div key={key} className="relative" onClick={e => { e.stopPropagation(); setActiveKPI(activeKPI === key ? null : key); }}>
            <div className={`cursor-pointer transition-all duration-200 rounded-2xl holo-card ${activeKPI === key ? "scale-[1.02]" : "hover:scale-[1.01]"}`}
              style={ activeKPI === key ? { outline: "2px solid rgba(0,180,180,0.5)", outlineOffset: 2 } : {} }>
              {card}
              <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider"
                style={{ color: "rgba(0,180,180,0.4)" }}>
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
      <Section title="Network Coverage" icon={Globe} badge={`${onlineNodes}/${nodes.length} online`} color="#00b4b4" className="section-reveal section-reveal-delay-2">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 rounded-3xl overflow-hidden relative"
            style={{ background: "linear-gradient(135deg, #0d1010 0%, #111111 50%, #0a0d0d 100%)", border: "1px solid rgba(0,180,180,0.28)", boxShadow: "0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(0,212,212,0.08), 0 0 40px rgba(0,180,180,0.04)", minHeight: 360 }}>
            {/* Corner bracket accents */}
            <div className="absolute top-3 left-3 w-6 h-6 pointer-events-none z-20" style={{ borderTop: "2px solid rgba(0,212,212,0.6)", borderLeft: "2px solid rgba(0,212,212,0.6)" }} />
            <div className="absolute top-3 right-3 w-6 h-6 pointer-events-none z-20" style={{ borderTop: "2px solid rgba(224,35,71,0.4)", borderRight: "2px solid rgba(224,35,71,0.4)" }} />
            <div className="absolute bottom-3 left-3 w-6 h-6 pointer-events-none z-20" style={{ borderBottom: "2px solid rgba(0,212,212,0.3)", borderLeft: "2px solid rgba(0,212,212,0.3)" }} />
            <div className="absolute bottom-3 right-3 w-6 h-6 pointer-events-none z-20" style={{ borderBottom: "2px solid rgba(224,35,71,0.35)", borderRight: "2px solid rgba(224,35,71,0.35)" }} />

            {/* Scan line effect */}
            <div className="absolute inset-0 pointer-events-none z-10" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,180,180,0.012) 3px, rgba(0,180,180,0.012) 4px)" }} />

            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 pt-4 pb-16"
              style={{ background: "linear-gradient(180deg, rgba(10,12,12,0.96) 0%, rgba(10,12,12,0.6) 60%, transparent 100%)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,180,180,0.15)", border: "1px solid rgba(0,212,212,0.4)", boxShadow: "0 0 16px rgba(0,180,180,0.3)" }}>
                  <Globe className="w-5 h-5" style={{ color: "#00d4d4" }} />
                </div>
                <div>
                  <p className="text-[13px] font-black leading-tight uppercase tracking-[0.15em]" style={{ color: "#00d4d4", fontFamily: "'Space Grotesk',sans-serif", textShadow: "0 0 12px rgba(0,212,212,0.5)" }}>Network Coverage</p>
                  <p className="text-[9px] mono" style={{ color: "rgba(0,212,212,0.4)" }}>◈ Drag · ⊕ Zoom · ◎ Hover nodes</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {[
                  { color: "#34d399", label: `${onlineNodes} Online`, glow: "rgba(52,211,153,0.6)" },
                  { color: "#fbbf24", label: `${degradedNodes} Degraded`, glow: "rgba(251,191,36,0.6)" },
                  { color: "#ef4444", label: `${offlineNodes} Offline`, glow: "rgba(239,68,68,0.6)" },
                ].map(({ color, label, glow }) => (
                  <div key={label} className="flex items-center gap-2 px-2.5 py-1 rounded-lg"
                    style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
                    <span className="text-[9px] mono font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
                    <span className="w-2 h-2 rounded-full status-breathe" style={{ background: color, boxShadow: `0 0 8px ${glow}` }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full h-full" style={{ minHeight: 360 }}>
              <NetworkGlobe nodes={nodes} onNodeSelect={() => {}} />
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-5">
            <NetworkHealth nodes={nodes} />
            <div className="rounded-2xl p-5 flex-1 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg,#141414,#1a1a1a)", border: "1px solid rgba(0,180,180,0.2)", boxShadow: "0 4px 24px rgba(0,0,0,0.5), 0 0 20px rgba(0,180,180,0.04)" }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.4),transparent)" }} />
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(0,180,180,0.04) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              {/* Corner accents */}
              <div className="absolute top-2.5 left-2.5 w-3 h-3 pointer-events-none" style={{ borderTop: "1.5px solid rgba(0,212,212,0.4)", borderLeft: "1.5px solid rgba(0,212,212,0.4)" }} />
              <div className="absolute bottom-2.5 right-2.5 w-3 h-3 pointer-events-none" style={{ borderBottom: "1.5px solid rgba(224,35,71,0.35)", borderRight: "1.5px solid rgba(224,35,71,0.35)" }} />
              <div className="relative flex items-center justify-between mb-4">
                <p className="text-[11px] font-black flex items-center gap-2 uppercase tracking-[0.18em]" style={{ color: "#00d4d4", fontFamily: "'Space Grotesk',sans-serif" }}>
                  <Activity className="w-3.5 h-3.5" /> Quick Stats
                </p>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#34d399", boxShadow: "0 0 6px #34d399" }} />
                  <span className="text-[9px] mono font-black uppercase tracking-wider" style={{ color: "#10b981" }}>Live</span>
                </div>
              </div>
              <div className="relative grid grid-cols-2 gap-3">
                {[
                  { label: "Avg Uptime",       value: nodes.length ? `${(nodes.reduce((a,n)=>a+(n.uptime_percent||0),0)/nodes.length).toFixed(1)}%` : "—", color: "#10b981", link: "/Network" },
                  { label: "Paid Invoices",    value: invoices.filter(i=>i.status==="paid").length, color: "#00d4d4", link: "/Billing" },
                  { label: "Critical Tickets", value: tickets.filter(t=>t.priority==="critical").length, color: "#e02347", link: "/Tickets" },
                  { label: "Suspended",        value: customers.filter(c=>c.status==="suspended").length, color: "#f59e0b", link: "/Customers" },
                ].map(stat => (
                  <Link to={stat.link} key={stat.label}
                    className="rounded-xl p-3.5 transition-all hover:scale-105 group relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg,${stat.color}12,${stat.color}06)`, border: `1px solid ${stat.color}28` }}>
                    <div className="absolute top-0 left-0 right-0 h-[1.5px]" style={{ background: `linear-gradient(90deg, ${stat.color}, transparent)` }} />
                    <p className="text-[22px] font-black mono leading-none" style={{ color: stat.color, fontFamily: "'JetBrains Mono',monospace", textShadow: `0 0 16px ${stat.color}60` }}>{stat.value}</p>
                    <p className="text-[9px] mt-1 leading-tight uppercase tracking-[0.14em] font-bold" style={{ color: "rgba(255,255,255,0.35)" }}>{stat.label}</p>
                    <ArrowUpRight className="w-3 h-3 mt-1.5 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: stat.color }} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Revenue + Tickets ── */}
      <Section title="Financial & Tickets" icon={BarChart3} badge={`${invoices.filter(i=>i.status==="overdue").length} overdue`} color="#10b981">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <RevenueChart invoices={invoices} />
          </div>
          <TicketOverview tickets={tickets} />
        </div>
      </Section>

      {/* ── Coverage Demand Analytics (admin only) ── */}
      <Section title="Coverage Demand Analytics" icon={MapPin} color="#e02347" defaultOpen={false}>
        <CoverageSearchChart />
      </Section>

      {/* ── Activity ── */}
      <Section title="Recent Activity" icon={Activity} color="#22d3ee">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <RecentActivity customers={customers} tickets={tickets} invoices={invoices} />
          <UserActivityPanel customers={customers} tickets={tickets} invoices={invoices} />
        </div>
      </Section>

      {/* ── WhatsApp AI FAB ── */}
      <a
        href={base44.agents.getWhatsAppConnectURL('touchnet_assistant')}
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-white text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", boxShadow: "0 8px 32px rgba(37,211,102,0.4)" }}>
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        AI Assistant
      </a>
    </div>
  );
}