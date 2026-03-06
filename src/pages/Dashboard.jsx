import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";

import AdminDashboard from "@/components/dashboard/AdminDashboard";
import TechnicalDashboard from "@/components/dashboard/TechnicalDashboard";
import SalesDashboard from "@/components/dashboard/SalesDashboard";
import FinanceDashboard from "@/components/dashboard/FinanceDashboard";
import ProjectsDashboard from "@/components/dashboard/ProjectsDashboard";
import SupportDashboard from "@/components/dashboard/SupportDashboard";

// Map role names (lowercase) to dashboard component
const ROLE_DASHBOARD_MAP = {
  admin: "admin",
  technical: "technical",
  "it support": "technical",
  network: "technical",
  engineer: "technical",
  sales: "sales",
  "sales manager": "sales",
  finance: "finance",
  billing: "finance",
  accounts: "finance",
  projects: "projects",
  "project manager": "projects",
  "fibre projects": "projects",
  support: "support",
  helpdesk: "support",
};

function resolveDashboardType(roleName) {
  if (!roleName) return "admin";
  const key = roleName.toLowerCase();
  // Exact match
  if (ROLE_DASHBOARD_MAP[key]) return ROLE_DASHBOARD_MAP[key];
  // Partial match
  for (const [k, v] of Object.entries(ROLE_DASHBOARD_MAP)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return "admin"; // default fallback
}

export default function Dashboard() {
  const { can, loading: rbacLoading, role } = useRBAC();

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
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["fibre-projects-dash"],
    queryFn: () => base44.entities.FibreProject.list("-created_date", 100)
  });

  const isLoading = loadingCustomers || loadingInvoices || loadingTickets || loadingNodes || loadingProjects;

  if (!rbacLoading && !can("dashboard")) return <AccessDenied />;

  if (isLoading || rbacLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const dashboardType = resolveDashboardType(role?.name);

  const props = { customers, invoices, tickets, nodes, projects };

  if (dashboardType === "technical") return <TechnicalDashboard {...props} />;
  if (dashboardType === "sales") return <SalesDashboard {...props} />;
  if (dashboardType === "finance") return <FinanceDashboard {...props} />;
  if (dashboardType === "projects") return <ProjectsDashboard {...props} />;
  if (dashboardType === "support") return <SupportDashboard {...props} />;

  // Admin / default — full dashboard
  return <AdminDashboard {...props} />;
}