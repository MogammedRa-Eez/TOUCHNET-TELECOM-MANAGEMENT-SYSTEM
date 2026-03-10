import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, Receipt, TicketCheck, Wifi, DollarSign, Globe, Activity, Zap } from "lucide-react";
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

export default function Dashboard() {
  const { can, loading: rbacLoading } = useRBAC();

  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list("-created_date", 100)
  });
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => base44.entities.Invoice.list("-created_date", 100)
  });
  const { data: tickets = [], isLoading: loadingTickets } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => base44.entities.Ticket.list("-created_date", 100)
  });
  const { data: nodes = [], isLoading: loadingNodes } = useQuery({
    queryKey: ["network-nodes"],
    queryFn: () => base44.entities.NetworkNode.list()
  });

  const isLoading = loadingCustomers || loadingInvoices || loadingTickets || loadingNodes;
  if (!rbacLoading && !can("dashboard")) return <AccessDenied />;

  const activeCustomers = customers.filter(c => c.status === "active").length;
  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((a, i) => a + (i.total || i.amount || 0), 0);
  const openTickets = tickets.filter(t => !["resolved", "closed"].includes(t.status)).length;
  const onlineNodes = nodes.filter(n => n.status === "online").length;
  const offlineNodes = nodes.filter(n => n.status === "offline").length;
  const degradedNodes = nodes.filter(n => n.status === "degraded").length;

  if (isLoading) {
    return (
      <div className="p-5 lg:p-7 space-y-6" style={{ background: "linear-gradient(160deg, #eef2ff 0%, #f0f4ff 40%, #faf5ff 100%)", minHeight: "100vh" }}>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <Skeleton className="h-96 rounded-2xl lg:col-span-3" />
          <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #eef2ff 0%, #f0f4ff 40%, #faf5ff 100%)" }}
    >
      <div className="p-5 lg:p-7 space-y-6 max-w-[1600px] mx-auto">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Operations Overview</h1>
            <p className="text-[11px] text-slate-400 mt-0.5 mono">
              {new Date().toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-bold"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#059669" }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="mono">All Systems Operational</span>
            </div>
            <div
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-bold"
              style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#6366f1" }}
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="mono">LIVE</span>
            </div>
          </div>
        </div>

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard
            title="Active Customers"
            value={activeCustomers.toLocaleString()}
            subtitle={`${customers.length} total accounts`}
            icon={Users}
            color="blue"
            trend="up"
            trendValue="+12%"
          />
          <KPICard
            title="Monthly Revenue"
            value={`R${(totalRevenue / 1000).toFixed(1)}k`}
            subtitle="From paid invoices"
            icon={DollarSign}
            color="emerald"
            trend="up"
            trendValue="+8.5%"
          />
          <KPICard
            title="Open Tickets"
            value={openTickets}
            subtitle={`${tickets.length} total tickets`}
            icon={TicketCheck}
            color="amber"
            trend={openTickets > 10 ? "up" : "down"}
            trendValue={openTickets > 10 ? "High Load" : "Normal"}
          />
          <KPICard
            title="Network Nodes"
            value={`${onlineNodes}/${nodes.length}`}
            subtitle="Currently online"
            icon={Wifi}
            color="violet"
          />
        </div>

        {/* ── Globe + Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Globe */}
          <div
            className="lg:col-span-3 rounded-3xl overflow-hidden relative"
            style={{
              background: "linear-gradient(135deg, #0f0c29 0%, #302b63 60%, #24243e 100%)",
              border: "1px solid rgba(99,102,241,0.2)",
              boxShadow: "0 8px 40px rgba(99,102,241,0.15), 0 2px 8px rgba(0,0,0,0.1)",
              minHeight: 400
            }}
          >
            {/* Globe header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-4 pb-3"
              style={{ background: "linear-gradient(180deg, rgba(15,12,41,0.9) 0%, transparent 100%)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.3)" }}>
                  <Globe className="w-4 h-4 text-indigo-300" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-white leading-tight">Network Coverage</p>
                  <p className="text-[9px] text-white/30 mono">Drag to rotate · hover for info</p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
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
            <div className="w-full h-full" style={{ minHeight: 400 }}>
              <NetworkGlobe nodes={nodes} />
            </div>
          </div>

          {/* KPI detail cards */}
          <div className="lg:col-span-2 grid grid-cols-1 gap-4 content-start">
            {/* Network health mini */}
            <NetworkHealth nodes={nodes} />
            {/* Quick stats */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "rgba(255,255,255,0.88)",
                border: "1px solid rgba(255,255,255,0.95)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
              }}
            >
              <p className="text-[12px] font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                Quick Stats
              </p>
              <div className="space-y-2.5">
                {[
                  { label: "Avg Uptime", value: nodes.length ? `${(nodes.reduce((a,n)=>a+(n.uptime_percent||0),0)/nodes.length).toFixed(1)}%` : "—", color: "#10b981" },
                  { label: "Paid Invoices", value: invoices.filter(i=>i.status==="paid").length, color: "#3b82f6" },
                  { label: "Critical Tickets", value: tickets.filter(t=>t.priority==="critical").length, color: "#ef4444" },
                  { label: "Suspended Accounts", value: customers.filter(c=>c.status==="suspended").length, color: "#f59e0b" },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">{stat.label}</span>
                    <span className="text-[13px] font-bold mono" style={{ color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Revenue + Tickets ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <RevenueChart invoices={invoices} />
          </div>
          <TicketOverview tickets={tickets} />
        </div>

        {/* ── Bottom Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <RecentActivity customers={customers} tickets={tickets} invoices={invoices} />
          <UserActivityPanel customers={customers} tickets={tickets} invoices={invoices} />
        </div>

      </div>

      {/* ── WhatsApp AI FAB ── */}
      <a
        href={base44.agents.getWhatsAppConnectURL('touchnet_assistant')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open AI Assistant on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #25D366, #128C7E)",
          boxShadow: "0 8px 32px rgba(37,211,102,0.45)"
        }}
      >
        <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-white flex-shrink-0 w-5 h-5" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        AI Assistant
      </a>
    </div>
  );
}