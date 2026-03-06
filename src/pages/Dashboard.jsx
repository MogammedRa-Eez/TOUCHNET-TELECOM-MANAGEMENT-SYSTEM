import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, Receipt, TicketCheck, Network, DollarSign, Wifi, Activity, Globe } from "lucide-react";
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
    <div className="p-4 lg:p-6 space-y-5" style={{ background: "#f0f4ff" }}>

      {/* Hero Globe Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Globe */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(135deg, #070b1f 0%, #0f1845 60%, #070b1f 100%)", border: "1px solid rgba(99,102,241,0.25)", minHeight: 360 }}>
          <div className="absolute top-4 left-5 z-10">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-300 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Network Coverage</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 ml-6">Drag to rotate</p>
          </div>
          {/* Status legend */}
          <div className="absolute bottom-4 left-5 z-10 flex flex-col gap-1">
            {[
              { color: "#34d399", label: `${onlineNodes} Online` },
              { color: "#fbbf24", label: `${degradedNodes} Degraded` },
              { color: "#ef4444", label: `${offlineNodes} Offline` },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                <span className="text-[10px] text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
              </div>
            ))}
          </div>
          <div className="w-full" style={{ height: 360 }}>
            <NetworkGlobe nodes={nodes} />
          </div>
        </div>

        {/* Right side KPIs stacked */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4 content-start">
          <KPICard
            title="Active Customers"
            value={activeCustomers.toLocaleString()}
            subtitle={`${customers.length} total accounts`}
            icon={Users}
            color="blue"
            trend="up"
            trendValue="+12%" />
          <KPICard
            title="Monthly Revenue"
            value={`R${totalRevenue.toLocaleString()}`}
            subtitle="From paid invoices"
            icon={DollarSign}
            color="emerald"
            trend="up"
            trendValue="+8.5%" />
          <KPICard
            title="Open Tickets"
            value={openTickets}
            subtitle={`${tickets.length} total tickets`}
            icon={TicketCheck}
            color="amber"
            trend={openTickets > 10 ? "up" : "down"}
            trendValue={openTickets > 10 ? "High" : "Normal"} />
          <KPICard
            title="Network Nodes"
            value={`${onlineNodes}/${nodes.length}`}
            subtitle="Currently online"
            icon={Wifi}
            color="violet" />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RevenueChart invoices={invoices} />
        </div>
        <TicketOverview tickets={tickets} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <NetworkHealth nodes={nodes} />
        <RecentActivity customers={customers} tickets={tickets} invoices={invoices} />
      </div>

      {/* User Activity */}
      <UserActivityPanel customers={customers} tickets={tickets} invoices={invoices} />
    </div>);

}