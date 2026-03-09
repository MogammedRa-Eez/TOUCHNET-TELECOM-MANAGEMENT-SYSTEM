import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, Receipt, TicketCheck, Network, DollarSign, Wifi, Activity } from "lucide-react";
import KPICard from "../components/dashboard/KPICard";
import RevenueChart from "../components/dashboard/RevenueChart";
import TicketOverview from "../components/dashboard/TicketOverview";
import NetworkHealth from "../components/dashboard/NetworkHealth";
import RecentActivity from "../components/dashboard/RecentActivity";
import UserActivityPanel from "../components/dashboard/UserActivityPanel";
import NetworkMap from "../components/dashboard/NetworkMap";
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

  const activeCustomers = customers.filter((c) => c.status === "active").length;
  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((a, i) => a + (i.total || i.amount || 0), 0);
  const openTickets = tickets.filter((t) => !["resolved", "closed"].includes(t.status)).length;
  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) =>
          <Skeleton key={i} className="h-36 rounded-2xl" />
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>);

  }

  const onlineNodes = nodes.filter((n) => n.status === "online").length;
  const offlineNodes = nodes.filter((n) => n.status === "offline").length;
  const degradedNodes = nodes.filter((n) => n.status === "degraded").length;

  return (
    <div className="p-4 lg:p-6 space-y-5" style={{ background: "linear-gradient(135deg, #eef2ff 0%, #f0f4ff 50%, #faf5ff 100%)", minHeight: "100vh" }}>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Operations Dashboard</h1>
          <p className="text-[11px] text-slate-400 mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {new Date().toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold text-emerald-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>LIVE</span>
        </div>
      </div>

      {/* Hero Globe Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Globe */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #060d1f 0%, #0d1845 60%, #070b1f 100%)", border: "1px solid rgba(99,102,241,0.2)", boxShadow: "0 8px 32px rgba(99,102,241,0.12)", minHeight: 380 }}>
          <div className="absolute top-4 left-5 z-10">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span className="text-[11px] font-bold text-indigo-300 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Network Coverage</span>
            </div>
            <p className="text-[9px] text-slate-600 mt-0.5 ml-6">Drag to rotate · hover for details</p>
          </div>
          <div className="absolute bottom-4 left-5 z-10 flex flex-col gap-1.5">
            {[
              { color: "#34d399", label: `${onlineNodes} Online` },
              { color: "#fbbf24", label: `${degradedNodes} Degraded` },
              { color: "#ef4444", label: `${offlineNodes} Offline` },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                <span className="text-[10px] text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
              </div>
            ))}
          </div>
          <div className="w-full h-full" style={{ minHeight: 380 }}>
            <NetworkMap nodes={nodes} />
          </div>
        </div>

        {/* KPI grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4 content-start">
          <KPICard title="Active Customers" value={activeCustomers.toLocaleString()} subtitle={`${customers.length} total accounts`} icon={Users} color="blue" trend="up" trendValue="+12%" />
          <KPICard title="Monthly Revenue" value={`R${totalRevenue.toLocaleString()}`} subtitle="From paid invoices" icon={DollarSign} color="emerald" trend="up" trendValue="+8.5%" />
          <KPICard title="Open Tickets" value={openTickets} subtitle={`${tickets.length} total tickets`} icon={TicketCheck} color="amber" trend={openTickets > 10 ? "up" : "down"} trendValue={openTickets > 10 ? "High" : "Normal"} />
          <KPICard title="Network Nodes" value={`${onlineNodes}/${nodes.length}`} subtitle="Currently online" icon={Wifi} color="violet" />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><RevenueChart invoices={invoices} /></div>
        <TicketOverview tickets={tickets} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <NetworkHealth nodes={nodes} />
        <RecentActivity customers={customers} tickets={tickets} invoices={invoices} />
      </div>

      <UserActivityPanel customers={customers} tickets={tickets} invoices={invoices} />

      {/* WhatsApp AI FAB */}
      <a
        href={base44.agents.getWhatsAppConnectURL('touchnet_assistant')}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl text-white text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", boxShadow: "0 4px 24px rgba(37,211,102,0.5)" }}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        AI Assistant
      </a>
    </div>);

}