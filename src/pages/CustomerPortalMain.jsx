import React, { useState, useEffect } from "react";

import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Wifi, Receipt, TicketCheck, LogOut, AlertCircle, Loader2,
  FolderOpen, FileText, Activity, DollarSign, Zap,
  CheckCircle2, Clock, Menu, X, ChevronRight, Users,
  Home
} from "lucide-react";
import PortalNotificationBell from "@/components/portal/PortalNotificationBell";
import PortalProjectsTab from "@/components/portal/PortalProjectsTab";
import PortalInvoicesTab from "@/components/portal/PortalInvoicesTab";
import PortalTicketsTab from "@/components/portal/PortalTicketsTab";
import PortalDocumentsTab from "@/components/portal/PortalDocumentsTab";
import PortalQuotesTab from "@/components/portal/PortalQuotesTab";
import PortalResellersTab from "@/components/portal/PortalResellersTab";
import CoverageChecker from "@/components/coverage/CoverageChecker";
import { MapPin } from "lucide-react";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

const STATUS_CFG = {
  active:     { color: "#10b981", label: "Active",     bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)" },
  pending:    { color: "#f59e0b", label: "Pending",    bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)" },
  suspended:  { color: "#ef4444", label: "Suspended",  bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)"  },
  terminated: { color: "#64748b", label: "Terminated", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.25)" },
};

const PLAN_LABELS = {
  basic_10mbps:       "Basic 10 Mbps",
  standard_50mbps:    "Standard 50 Mbps",
  premium_100mbps:    "Premium 100 Mbps",
  enterprise_500mbps: "Enterprise 500 Mbps",
  dedicated_1gbps:    "Dedicated 1 Gbps",
};

const NAV_ITEMS = [
  { key: "overview",   label: "Overview",   icon: Home,       desc: "Account summary" },
  { key: "projects",   label: "Projects",   icon: Wifi,       desc: "Fibre installations" },
  { key: "invoices",   label: "Invoices",   icon: Receipt,    desc: "Billing history" },
  { key: "tickets",    label: "Support",    icon: TicketCheck,desc: "Help & tickets" },
  { key: "documents",  label: "Documents",  icon: FolderOpen, desc: "Files & contracts" },
  { key: "quotes",     label: "Quotes",     icon: FileText,   desc: "Service proposals" },
  { key: "resellers",  label: "Resellers",  icon: Users,      desc: "Referrals & rewards" },
];

// ── Mini stat chip ─────────────────────────────────────────────────────────────
function StatChip({ icon: Icon, label, value, color }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl px-4 py-4 gap-1.5 relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: "rgba(255,255,255,0.9)",
        border: `1px solid ${color}20`,
        boxShadow: `0 2px 16px ${color}10`,
      }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}44, transparent)` }} />
      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <p className="text-[18px] font-black mono leading-none" style={{ color }}>{value}</p>
      <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-center leading-tight" style={{ color: "#94a3b8" }}>{label}</p>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function PortalSidebar({ customer, activeTab, setActiveTab, open, onClose, invoices, tickets, projects, sc }) {
  const initials = customer?.full_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??";

  const badges = {
    invoices: invoices.filter(i => i.status === "overdue").length,
    tickets:  tickets.filter(t => !["resolved","closed"].includes(t.status)).length,
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
          onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-50 flex flex-col
        lg:static lg:z-auto lg:translate-x-0
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
      `} style={{
        width: 260,
        background: "rgba(255,255,255,0.98)",
        borderRight: "1px solid rgba(99,102,241,0.1)",
        boxShadow: "4px 0 32px rgba(99,102,241,0.07)",
        flexShrink: 0,
      }}>

        {/* Top accent */}
        <div className="h-[3px] flex-shrink-0"
          style={{ background: "linear-gradient(90deg,#6366f1,#06b6d4,#8b5cf6,#10b981)" }} />

        {/* Logo header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(99,102,241,0.07)" }}>
          <img src={LOGO_URL} alt="TouchNet" className="h-7 object-contain" />
          <button onClick={onClose} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* User card */}
        <div className="mx-3 my-3 rounded-2xl px-4 py-3 flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${sc.color}08, rgba(99,102,241,0.05))`, border: `1px solid ${sc.color}18` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-[13px] flex-shrink-0"
              style={{ background: `${sc.color}15`, border: `1px solid ${sc.color}25`, color: sc.color, fontFamily: "'Space Grotesk',sans-serif" }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold truncate" style={{ color: "#1e293b" }}>{customer?.full_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.color }} />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: sc.color }}>{sc.label}</span>
              </div>
            </div>
          </div>
          {customer?.account_number && (
            <p className="text-[10px] mono mt-2 font-semibold" style={{ color: "#94a3b8" }}>
              #{customer.account_number}
            </p>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1" style={{ color: "#94a3b8" }}>Navigation</p>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            const badge = badges[item.key];
            return (
              <button key={item.key}
                onClick={() => { setActiveTab(item.key); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group"
                style={{
                  background: isActive ? "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(99,102,241,0.06))" : "transparent",
                  border: isActive ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
                  boxShadow: isActive ? "0 2px 12px rgba(99,102,241,0.1)" : "none",
                }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: isActive ? "rgba(99,102,241,0.15)" : "rgba(241,245,249,0.8)",
                    border: `1px solid ${isActive ? "rgba(99,102,241,0.3)" : "rgba(226,232,240,0.8)"}`,
                  }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: isActive ? "#6366f1" : "#94a3b8" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold leading-tight" style={{ color: isActive ? "#4f46e5" : "#475569" }}>{item.label}</p>
                  <p className="text-[10px] truncate" style={{ color: "#94a3b8" }}>{item.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {badge > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 text-[9px] font-black rounded-full flex items-center justify-center text-white"
                      style={{ background: item.key === "tickets" ? "#f59e0b" : "#ef4444" }}>
                      {badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom: plan info + logout */}
        <div className="flex-shrink-0 px-3 py-3 space-y-2"
          style={{ borderTop: "1px solid rgba(99,102,241,0.07)" }}>
          <div className="rounded-xl px-3 py-2.5"
            style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)" }}>
            <div className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#6366f1" }} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold truncate" style={{ color: "#334155" }}>
                  {PLAN_LABELS[customer?.service_plan] || customer?.service_plan?.replace(/_/g," ") || "—"}
                </p>
                {customer?.monthly_rate && (
                  <p className="text-[10px] mono font-semibold" style={{ color: "#10b981" }}>R{customer.monthly_rate}/mo</p>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => base44.auth.logout("/")}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#ef4444" }}>
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Overview Tab ───────────────────────────────────────────────────────────────
function OverviewTab({ customer, invoices, tickets, projects, setActiveTab, sc }) {
  const paid      = invoices.filter(i => i.status === "paid").reduce((a, i) => a + (i.total || 0), 0);
  const overdue   = invoices.filter(i => i.status === "overdue").length;
  const openTkts  = tickets.filter(t => !["resolved","closed"].includes(t.status)).length;
  const activePrj = projects.filter(p => !["cancelled","billed"].includes(p.status)).length;
  const recentInv = invoices.slice(0, 3);
  const recentTkt = tickets.slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatChip icon={DollarSign}  label="Total Paid"     value={`R${(paid/1000).toFixed(1)}k`} color="#10b981" />
        <StatChip icon={AlertCircle} label="Overdue Inv."   value={overdue}                        color={overdue > 0 ? "#ef4444" : "#10b981"} />
        <StatChip icon={TicketCheck} label="Open Tickets"   value={openTkts}                       color="#f59e0b" />
        <StatChip icon={Activity}    label="Active Proj."   value={activePrj}                      color="#6366f1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent invoices */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 4px 24px rgba(99,102,241,0.06)" }}>
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#10b981,#06b6d4,transparent)" }} />
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(99,102,241,0.06)" }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)" }}>
                <Receipt className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
              </div>
              <span className="text-[13px] font-black" style={{ color: "#1e293b" }}>Recent Invoices</span>
            </div>
            <button onClick={() => setActiveTab("invoices")} className="text-[11px] font-bold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: "#6366f1" }}>
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {recentInv.length === 0 ? (
            <p className="text-[12px] text-center py-8" style={{ color: "#94a3b8" }}>No invoices yet</p>
          ) : (
            recentInv.map(inv => {
              const statusColor = { paid: "#10b981", overdue: "#ef4444", sent: "#0ea5e9", draft: "#94a3b8" }[inv.status] || "#94a3b8";
              return (
                <div key={inv.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid rgba(226,232,240,0.5)" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${statusColor}10` }}>
                    <Receipt className="w-3.5 h-3.5" style={{ color: statusColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold truncate" style={{ color: "#334155" }}>{inv.invoice_number || "Invoice"}</p>
                    <p className="text-[10px]" style={{ color: "#94a3b8" }}>{inv.due_date || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-black mono" style={{ color: statusColor }}>R{(inv.total||0).toFixed(0)}</p>
                    <p className="text-[9px] font-bold uppercase" style={{ color: statusColor }}>{inv.status}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Recent tickets */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 4px 24px rgba(99,102,241,0.06)" }}>
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#f59e0b,#ef4444,transparent)" }} />
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(99,102,241,0.06)" }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)" }}>
                <TicketCheck className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
              </div>
              <span className="text-[13px] font-black" style={{ color: "#1e293b" }}>Support Tickets</span>
            </div>
            <button onClick={() => setActiveTab("tickets")} className="text-[11px] font-bold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: "#6366f1" }}>
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {recentTkt.length === 0 ? (
            <p className="text-[12px] text-center py-8" style={{ color: "#94a3b8" }}>No tickets yet</p>
          ) : (
            recentTkt.map(tkt => {
              const priColor = { critical: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#10b981" }[tkt.priority] || "#94a3b8";
              return (
                <div key={tkt.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid rgba(226,232,240,0.5)" }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{ background: priColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold truncate" style={{ color: "#334155" }}>{tkt.subject}</p>
                    <p className="text-[10px]" style={{ color: "#94a3b8" }}>{tkt.status}</p>
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase"
                    style={{ background: `${priColor}12`, color: priColor, border: `1px solid ${priColor}25` }}>
                    {tkt.priority}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CustomerPortalMain() {
  const [user, setUser]             = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab]   = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCoverage, setShowCoverage] = useState(false);

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

  const customer = customers[0] || null;
  const { data: invoices = [] } = useQuery({ queryKey: ["portal-invoices-main", customer?.id],  queryFn: () => base44.entities.Invoice.filter({ customer_id: customer.id }, "-created_date"),  enabled: !!customer?.id });
  const { data: tickets  = [] } = useQuery({ queryKey: ["portal-tickets-main",  customer?.id],  queryFn: () => base44.entities.Ticket.filter({ customer_id: customer.id }, "-created_date"),   enabled: !!customer?.id });
  const { data: projects = [] } = useQuery({ queryKey: ["portal-projects",      customer?.id],  queryFn: () => base44.entities.FibreProject.filter({ customer_id: customer.id }),               enabled: !!customer?.id });

  // ── Loading ──
  if (authLoading || customerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#f0f9ff 0%,#e8f4fd 50%,#f5f0ff 100%)" }}>
        <div className="flex flex-col items-center gap-4">
          <img src={LOGO_URL} alt="TouchNet" className="h-10 object-contain" />
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#6366f1" }} />
            <span className="text-sm font-semibold" style={{ color: "#6366f1" }}>Loading your portal…</span>
          </div>
        </div>
      </div>
    );
  }

  // ── No account ──
  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"
        style={{ background: "linear-gradient(135deg,#f0f9ff 0%,#e8f4fd 50%,#f5f0ff 100%)" }}>
        <img src={LOGO_URL} alt="Logo" className="h-10 object-contain mb-2" />
        <div className="rounded-2xl p-8 max-w-md w-full text-center bg-white"
          style={{ border: "1px solid rgba(239,68,68,0.2)", boxShadow: "0 8px 40px rgba(239,68,68,0.08)" }}>
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
          <h2 className="text-lg font-bold mb-1" style={{ color: "#1e293b" }}>Account Not Found</h2>
          <p className="text-sm mb-6" style={{ color: "#64748b" }}>
            No customer account is linked to <strong>{user?.email}</strong>. Please contact support.
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

  const sc = STATUS_CFG[customer.status] || STATUS_CFG.pending;
  const overdueInv = invoices.filter(i => i.status === "overdue").length;
  const currentNavItem = NAV_ITEMS.find(n => n.key === activeTab);

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg,#f0f9ff 0%,#eef2ff 50%,#f5f3ff 100%)" }}>

      {/* ── Fixed ambient orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-40"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 left-64 w-[400px] h-[400px] opacity-40"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 65%)" }} />
        <div className="absolute top-1/3 left-1/2 w-[300px] h-[300px] opacity-20"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)" }} />
      </div>

      {/* ── Sidebar ── */}
      <PortalSidebar
        customer={customer}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        invoices={invoices}
        tickets={tickets}
        projects={projects}
        sc={sc}
      />

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-30 h-[60px] flex items-center gap-4 px-5"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(99,102,241,0.1)",
            boxShadow: "0 1px 0 rgba(99,102,241,0.06), 0 4px 24px rgba(99,102,241,0.04)",
          }}>

          {/* Top prismatic line */}
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: "linear-gradient(90deg,#6366f1,#06b6d4,#8b5cf6,#10b981,transparent)" }} />

          {/* Mobile menu toggle */}
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
            <Menu className="w-5 h-5" style={{ color: "#64748b" }} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-widest mono hidden sm:block" style={{ color: "rgba(99,102,241,0.5)" }}>
              TOUCHNET PORTAL
            </span>
            {currentNavItem && (
              <div className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 hidden sm:block" style={{ color: "#cbd5e1" }} />
                <currentNavItem.icon className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />
                <span className="text-[14px] font-black" style={{ color: "#1e293b", fontFamily: "'Space Grotesk',sans-serif" }}>
                  {currentNavItem.label}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowCoverage(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)", color: "white", boxShadow: "0 3px 10px rgba(6,182,212,0.3)" }}>
              <MapPin className="w-3.5 h-3.5" /> Check Coverage
            </button>
            {/* Status pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sc.color }} />
              <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: sc.color }}>{sc.label}</span>
            </div>
            <PortalNotificationBell customerEmail={customer.email} />
          </div>
          {showCoverage && <CoverageChecker onClose={() => setShowCoverage(false)} />}
        </header>

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-7 pb-16">
          <div className="max-w-5xl mx-auto space-y-5">

            {/* Hero welcome banner */}
            <div className="rounded-3xl overflow-hidden relative"
              style={{
                background: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(99,102,241,0.12)",
                boxShadow: "0 8px 40px rgba(99,102,241,0.08)",
              }}>
              {/* Top accent */}
              <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${sc.color}, #6366f1, #06b6d4, transparent)` }} />
              {/* Ambient blobs */}
              <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                style={{ background: `radial-gradient(circle at 80% 20%, ${sc.color}10, transparent 65%)` }} />
              <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none"
                style={{ background: "radial-gradient(circle at 20% 80%, rgba(99,102,241,0.07), transparent 65%)" }} />

              <div className="relative px-5 sm:px-7 py-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${sc.color}20, ${sc.color}08)`,
                      border: `1px solid ${sc.color}30`,
                      color: sc.color,
                      boxShadow: `0 4px 20px ${sc.color}20`,
                      fontFamily: "'Space Grotesk',sans-serif",
                    }}>
                    {customer.full_name?.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mono" style={{ color: "#94a3b8" }}>Customer Portal</p>
                    <h1 className="text-2xl font-black leading-tight mt-0.5" style={{ color: "#0f172a", fontFamily: "'Space Grotesk',sans-serif" }}>
                      Welcome back, {customer.full_name.split(" ")[0]}!
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />
                        <span className="text-[12px] font-semibold" style={{ color: "#475569" }}>
                          {PLAN_LABELS[customer.service_plan] || customer.service_plan?.replace(/_/g," ") || "Service Plan"}
                        </span>
                      </div>
                      {customer.connection_type && (
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3 h-3" style={{ color: "#8b5cf6" }} />
                          <span className="text-[12px] capitalize" style={{ color: "#64748b" }}>{customer.connection_type}</span>
                        </div>
                      )}
                      {customer.monthly_rate && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3 h-3" style={{ color: "#10b981" }} />
                          <span className="text-[12px] mono font-bold" style={{ color: "#10b981" }}>R{customer.monthly_rate}/mo</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                      style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.color }} />
                      <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: sc.color }}>{sc.label}</span>
                    </div>
                    {customer.account_number && (
                      <p className="text-[10px] mono font-semibold" style={{ color: "#94a3b8" }}>#{customer.account_number}</p>
                    )}
                  </div>
                </div>

                {/* Overdue alert */}
                {overdueInv > 0 && (
                  <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-[12px] font-semibold" style={{ color: "#ef4444" }}>
                      You have {overdueInv} overdue invoice{overdueInv > 1 ? "s" : ""}. Please review your billing.
                    </p>
                    <button onClick={() => setActiveTab("invoices")}
                      className="ml-auto text-[11px] font-bold px-3 py-1 rounded-lg flex-shrink-0 transition-all hover:scale-105"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                      View →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Tab Content ── */}
            {activeTab === "overview"  && <OverviewTab customer={customer} invoices={invoices} tickets={tickets} projects={projects} setActiveTab={setActiveTab} sc={sc} />}
            {activeTab === "projects"  && <PortalProjectsTab  customer={customer} />}
            {activeTab === "invoices"  && <PortalInvoicesTab  customer={customer} />}
            {activeTab === "tickets"   && <PortalTicketsTab   customer={customer} user={user} />}
            {activeTab === "documents" && <PortalDocumentsTab customer={customer} user={user} />}
            {activeTab === "quotes"    && <PortalQuotesTab    customer={customer} />}
            {activeTab === "resellers" && <PortalResellersTab customer={customer} />}
          </div>
        </main>
      </div>
    </div>
  );
}