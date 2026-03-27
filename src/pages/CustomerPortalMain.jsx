import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Wifi, Receipt, TicketCheck, LogOut, AlertCircle, Loader2,
  FolderOpen, FileText, Activity, DollarSign, Shield, Zap,
  CheckCircle2, Clock, TrendingUp
} from "lucide-react";
import PortalNotificationBell from "@/components/portal/PortalNotificationBell";
import PortalProjectsTab from "@/components/portal/PortalProjectsTab";
import PortalInvoicesTab from "@/components/portal/PortalInvoicesTab";
import PortalTicketsTab from "@/components/portal/PortalTicketsTab";
import PortalDocumentsTab from "@/components/portal/PortalDocumentsTab";
import PortalQuotesTab from "@/components/portal/PortalQuotesTab";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

const STATUS_CFG = {
  active:     { color: "#10b981", label: "Active",     glow: "rgba(16,185,129,0.5)" },
  pending:    { color: "#f59e0b", label: "Pending",    glow: "rgba(245,158,11,0.5)" },
  suspended:  { color: "#ef4444", label: "Suspended",  glow: "rgba(239,68,68,0.5)" },
  terminated: { color: "#64748b", label: "Terminated", glow: "rgba(100,116,139,0.5)" },
};

const PLAN_LABELS = {
  basic_10mbps:       "Basic 10 Mbps",
  standard_50mbps:    "Standard 50 Mbps",
  premium_100mbps:    "Premium 100 Mbps",
  enterprise_500mbps: "Enterprise 500 Mbps",
  dedicated_1gbps:    "Dedicated 1 Gbps",
};

const TABS = [
  { key: "projects",   label: "Projects",   icon: Wifi },
  { key: "invoices",   label: "Invoices",   icon: Receipt },
  { key: "tickets",    label: "Support",    icon: TicketCheck },
  { key: "documents",  label: "Documents",  icon: FolderOpen },
  { key: "quotes",     label: "Quotes",     icon: FileText },
];

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-[11px] font-black mono" style={{ color }}>{value}</p>
        <p className="text-[9px] uppercase tracking-wider leading-tight" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</p>
        {sub && <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.45)" }}>{sub}</p>}
      </div>
    </div>
  );
}

function PortalSummaryBar({ customer, invoices, tickets, projects }) {
  const paid      = invoices.filter(i => i.status === "paid").reduce((a, i) => a + (i.total || 0), 0);
  const overdue   = invoices.filter(i => i.status === "overdue").length;
  const openTkts  = tickets.filter(t => !["resolved","closed"].includes(t.status)).length;
  const activePrj = projects.filter(p => !["cancelled","billed"].includes(p.status)).length;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
      <StatCard icon={DollarSign} label="Total Paid"     value={`R${(paid/1000).toFixed(1)}k`}  color="#10b981" />
      <StatCard icon={AlertCircle} label="Overdue Inv."  value={overdue}                         color="#ef4444" sub={overdue > 0 ? "Action needed" : "All clear"} />
      <StatCard icon={TicketCheck} label="Open Tickets"  value={openTkts}                        color="#f59e0b" />
      <StatCard icon={Activity}    label="Active Proj."  value={activePrj}                       color="#06b6d4" />
    </div>
  );
}

export default function CustomerPortalMain() {
  const [user, setUser]             = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab]   = useState("projects");

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => base44.auth.redirectToLogin(window.location.pathname))
      .finally(() => setAuthLoading(false));
  }, []);

  const { data: customers = [], isLoading: customerLoading } = useQuery({
    queryKey: ["portal-customer-main", user?.email],
    queryFn: () => base44.entities.Customer.filter({ email: user.email }),
    enabled: !!user?.email,
  });

  // Prefetch summary data
  const customer = customers[0] || null;
  const { data: invoices = [] }  = useQuery({ queryKey: ["portal-invoices-main", customer?.id],  queryFn: () => base44.entities.Invoice.filter({ customer_id: customer.id }, "-created_date"),  enabled: !!customer?.id });
  const { data: tickets = [] }   = useQuery({ queryKey: ["portal-tickets-main", customer?.id],   queryFn: () => base44.entities.Ticket.filter({ customer_id: customer.id }, "-created_date"),   enabled: !!customer?.id });
  const { data: projects = [] }  = useQuery({ queryKey: ["portal-projects", customer?.id],       queryFn: () => base44.entities.FibreProject.filter({ customer_id: customer.id }),               enabled: !!customer?.id });

  // ── Loading ──
  if (authLoading || customerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(160deg,#050d1a 0%,#080f20 100%)" }}>
        <div className="flex flex-col items-center gap-4">
          <img src={LOGO_URL} alt="TouchNet" className="h-10 object-contain opacity-70" />
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#06b6d4" }} />
            <span className="text-sm mono" style={{ color: "rgba(6,182,212,0.6)" }}>Authenticating…</span>
          </div>
        </div>
      </div>
    );
  }

  // ── No account ──
  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"
        style={{ background: "linear-gradient(160deg,#050d1a 0%,#080f20 100%)" }}>
        <img src={LOGO_URL} alt="Logo" className="h-10 object-contain mb-2 opacity-70" />
        <div className="rounded-2xl p-8 max-w-md w-full text-center"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(239,68,68,0.25)", boxShadow: "0 0 40px rgba(239,68,68,0.1)" }}>
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
          <h2 className="text-lg font-bold text-white mb-1">Account Not Found</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
            No customer account is linked to <strong className="text-white/70">{user?.email}</strong>. Please contact support.
          </p>
          <button onClick={() => base44.auth.logout("/")}
            className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
    );
  }

  const sc       = STATUS_CFG[customer.status] || STATUS_CFG.pending;
  const initials = customer.full_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??";
  const overdueInv = invoices.filter(i => i.status === "overdue").length;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#060d1b 0%,#080f20 100%)" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 px-5 py-3 flex items-center justify-between"
        style={{
          background: "rgba(5,10,20,0.92)",
          borderBottom: "1px solid rgba(6,182,212,0.15)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 1px 0 rgba(6,182,212,0.08)",
        }}>
        {/* Rainbow top line */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg,#06b6d4,#6366f1,#8b5cf6,#ec4899)" }} />

        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="Logo" className="h-7 object-contain" style={{ filter: "brightness(0) invert(1)", opacity: 0.85 }} />
          <div className="hidden sm:block w-px h-5" style={{ background: "rgba(6,182,212,0.25)" }} />
          <div className="hidden sm:block">
            <p className="text-[13px] font-bold leading-tight text-white">{customer.full_name}</p>
            <p className="text-[9px] mono" style={{ color: "#06b6d4" }}>
              {customer.account_number ? `#${customer.account_number}` : customer.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ background: `${sc.color}12`, border: `1px solid ${sc.color}30` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.color, boxShadow: `0 0 6px ${sc.color}` }} />
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: sc.color }}>{sc.label}</span>
          </div>
          {/* Customer notification bell */}
          <PortalNotificationBell customerEmail={customer.email} />
          <button
            onClick={() => base44.auth.logout("/")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all hover:opacity-80"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5 pb-16">

        {/* ── Hero Banner ── */}
        <div className="rounded-3xl overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg,#0d1829 0%,#141d35 60%,#0a1523 100%)",
            border: "1px solid rgba(6,182,212,0.2)",
            boxShadow: "0 8px 40px rgba(6,182,212,0.08), 0 0 80px rgba(99,102,241,0.06)",
          }}>

          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />

          {/* Glow orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)", transform: "translate(30%,-30%)" }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(6,182,212,0.08) 0%,transparent 70%)", transform: "translate(-20%,20%)" }} />

          <div className="relative p-5 sm:p-7">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg,${sc.color}30,${sc.color}10)`,
                  border: `1px solid ${sc.color}40`,
                  color: sc.color,
                  boxShadow: `0 0 24px ${sc.glow}`,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>
                {initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mono" style={{ color: "rgba(6,182,212,0.5)" }}>Customer Portal</p>
                </div>
                <h1 className="text-2xl font-black text-white mt-0.5 leading-tight">
                  Welcome back, {customer.full_name.split(" ")[0]}!
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5" style={{ color: "#06b6d4" }} />
                    <span className="text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {PLAN_LABELS[customer.service_plan] || customer.service_plan?.replace(/_/g," ") || "Service Plan"}
                    </span>
                  </div>
                  {customer.connection_type && (
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3 h-3" style={{ color: "#8b5cf6" }} />
                      <span className="text-[12px] capitalize" style={{ color: "rgba(255,255,255,0.4)" }}>{customer.connection_type}</span>
                    </div>
                  )}
                  {customer.monthly_rate && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3 h-3" style={{ color: "#10b981" }} />
                      <span className="text-[12px] mono font-semibold" style={{ color: "#10b981" }}>R{customer.monthly_rate}/mo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side live status */}
              <div className="hidden sm:flex flex-col items-end gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: `${sc.color}12`, border: `1px solid ${sc.color}25` }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: sc.color, boxShadow: `0 0 8px ${sc.color}` }} />
                  <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: sc.color }}>{sc.label}</span>
                </div>
                {customer.account_number && (
                  <p className="text-[10px] mono" style={{ color: "rgba(255,255,255,0.45)" }}>{customer.account_number}</p>
                )}
              </div>
            </div>

            {/* Alert banner */}
            {overdueInv > 0 && (
              <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-[12px] font-semibold" style={{ color: "#fca5a5" }}>
                  You have {overdueInv} overdue invoice{overdueInv > 1 ? "s" : ""}. Please review your billing tab.
                </p>
                <button onClick={() => setActiveTab("invoices")}
                  className="ml-auto text-[11px] font-bold px-3 py-1 rounded-lg flex-shrink-0"
                  style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>
                  View →
                </button>
              </div>
            )}

            {/* Summary stats */}
            <PortalSummaryBar customer={customer} invoices={invoices} tickets={tickets} projects={projects} />
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold flex-shrink-0 transition-all duration-200"
                style={{
                  background: isActive ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.06)",
                  border: isActive ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  color: isActive ? "#a78bfa" : "rgba(255,255,255,0.65)",
                  boxShadow: isActive ? "0 0 20px rgba(99,102,241,0.2)" : "none",
                }}>
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        <div>
          {activeTab === "projects"  && <PortalProjectsTab  customer={customer} />}
          {activeTab === "invoices"  && <PortalInvoicesTab  customer={customer} />}
          {activeTab === "tickets"   && <PortalTicketsTab   customer={customer} user={user} />}
          {activeTab === "documents" && <PortalDocumentsTab customer={customer} user={user} />}
          {activeTab === "quotes"    && <PortalQuotesTab    customer={customer} />}
        </div>
      </main>
    </div>
  );
}