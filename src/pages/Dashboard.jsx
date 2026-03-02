import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, Receipt, TicketCheck, Network, DollarSign, Wifi } from "lucide-react";
import KPICard from "../components/dashboard/KPICard";
import RevenueChart from "../components/dashboard/RevenueChart";
import TicketOverview from "../components/dashboard/TicketOverview";
import NetworkHealth from "../components/dashboard/NetworkHealth";
import RecentActivity from "../components/dashboard/RecentActivity";
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
  const onlineNodes = nodes.filter((n) => n.status === "online").length;

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

  return (
    <div className="bg-slate-200 p-6 lg:p-8 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart invoices={invoices} />
        </div>
        <TicketOverview tickets={tickets} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NetworkHealth nodes={nodes} />
        <RecentActivity customers={customers} tickets={tickets} invoices={invoices} />
      </div>
    </div>);

}