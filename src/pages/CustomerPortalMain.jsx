import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Wifi, Receipt, TicketCheck, LogOut, AlertCircle, Loader2,
  FolderOpen, FileText, Activity, DollarSign, Zap,
  CheckCircle2, Clock, Menu, X, ChevronRight, Users,
  Home, BarChart3, BookOpen, MapPin
} from "lucide-react";
import PortalNotificationBell from "@/components/portal/PortalNotificationBell";
import PortalProjectsTab from "@/components/portal/PortalProjectsTab";
import PortalInvoicesTab from "@/components/portal/PortalInvoicesTab";
import PortalTicketsTab from "@/components/portal/PortalTicketsTab";
import PortalDocumentsTab from "@/components/portal/PortalDocumentsTab";
import PortalQuotesTab from "@/components/portal/PortalQuotesTab";
import PortalResellersTab from "@/components/portal/PortalResellersTab";
import TroubleshootTab from "@/components/portal/TroubleshootTab";
import PortalNetworkTab from "@/components/portal/PortalNetworkTab";
import PortalServicePlanTab from "@/components/portal/PortalServicePlanTab";
import DataUsageDashboard from "@/components/portal/DataUsageDashboard";
import KnowledgeBaseAdmin from "@/components/support/KnowledgeBaseAdmin";
import CoverageChecker from "@/components/coverage/CoverageChecker.jsx";

const LOGO_WORDMARK = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/8a337a200_Touchnet_LogoLongWhite.png";
const LOGO_BADGE    = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/2d938c587_Touchnet-CrestDesogm_CrestFinalFullWhite.png";

const STATUS_CFG = {
  active:     { color: "#10b981", label: "Active",     bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)" },
  pending:    { color: "#f59e0b", label: "Pending",    bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)" },
  suspended:  { color: "#8B1A1A", label: "Suspended",  bg: "rgba(139,26,26,0.1)",   border: "rgba(139,26,26,0.25)"  },
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
  { key: "overview",       label: "Overview",      icon: Home,       desc: "Account summary" },
  { key: "projects",       label: "Projects",      icon: Wifi,       desc: "Fibre installations" },
  { key: "invoices",       label: "Invoices",      icon: Receipt,    desc: "Billing history" },
  { key: "tickets",        label: "Support",       icon: TicketCheck,desc: "Help & tickets" },
  { key: "documents",      label: "Documents",     icon: FolderOpen, desc: "Files & contracts" },
  { key: "quotes",         label: "Quotes",        icon: FileText,   desc: "Service proposals" },
  { key: "network",        label: "Network",       icon: Activity,   desc: "Performance metrics" },
  { key: "data_usage",     label: "Data Usage",    icon: BarChart3,  desc: "Consumption & alerts" },
  { key: "service_plan",   label: "My Plan",       icon: Wifi,       desc: "Plan & contract details" },
  { key: "resellers",      label: "Resellers",     icon: Users,      desc: "Referrals & rewards" },
  { key: "troubleshoot",   label: "Troubleshoot",  icon: Zap,        desc: "Fix issues yourself" },
  { key: "knowledge_base", label: "Knowledge Base",icon: BookOpen,   desc: "Admin: KB articles" },
];

// ── Stat chip (dark theme) ─────────────────────────────────────────────────────
function StatChip({ icon: Icon, label, value, color }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl px-4 py-4 gap-1.5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
      style={{
        background: `linear-gradient(135deg, ${color}10, ${color}06)`,
        border: `1px solid ${color}28`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 16px ${color}10`,
      }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}44, transparent)` }} />
      <div className="absolute top-2 right-2 w-3 h-3 pointer-events-none"
        style={{ borderTop: `1px solid ${color}30`, borderRight: `1px solid ${color}30` }} />
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <p className="text-[20px] font-black mono leading-none" style={{ color, fontFamily: "'JetBrains Mono',monospace", textShadow: `0 0 16px ${color}60` }}>{value}</p>
      <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-center leading-tight" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function PortalSidebar({ customer, activeTab, setActiveTab, open, onClose, invoices, tickets, sc }) {
  const initials = customer?.full_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??";
  const badges = {
    invoices: invoices.filter(i => i.status === "overdue").length,
    tickets:  tickets.filter(t => !["resolved","closed"].includes(t.status)).length,
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(10,15,40,0.6)", backdropFilter: "blur(8px)" }}
          onClick={onClose} />
      )}
      <aside className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          width: 260,
          background: "linear-gradient(180deg, #080d0d 0%, #0a0f0f 35%, #0f0f0f 65%, #111111 100%)",
          borderRight: "1px solid rgba(0,212,212,0.1)",
          flexShrink: 0,
          overflow: "hidden",
          position: "relative",
        }}>

        {/* Dot grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none", opacity: 0.5 }} />
        {/* Ambient teal glow */}
        <div style={{ position: "absolute", top: -60, left: -40, width: 260, height: 260, background: "radial-gradient(circle, rgba(0,212,212,0.18) 0%, rgba(255,255,255,0.03) 40%, transparent 70%)", pointerEvents: "none" }} />
        {/* Ambient maroon glow */}
        <div style={{ position: "absolute", bottom: 40, right: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(139,26,26,0.12) 0%, transparent 68%)", pointerEvents: "none" }} />

        {/* Logo header */}
        <div className="flex items-center justify-between px-4 h-[68px] flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", position: "relative", zIndex: 2 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}>
              <img src={LOGO_BADGE} alt="TouchNet Crest" className="w-10 h-10 object-contain" style={{ opacity: 0.92 }} />
            </div>
            <div>
              <img src={LOGO_WORDMARK} alt="TouchNet" className="h-6 object-contain" style={{ opacity: 0.95 }} />
              <p className="text-[8px] font-bold tracking-[0.28em] uppercase mt-0.5"
                style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>CUSTOMER PORTAL</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg"
            style={{ color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)" }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User card */}
        <div className="mx-3 my-3 rounded-xl px-3 py-3 flex-shrink-0 relative overflow-hidden"
          style={{ background: "rgba(0,180,180,0.06)", border: "1px solid rgba(0,212,212,0.15)", zIndex: 2 }}>
          <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg,rgba(0,212,212,0.4),transparent)" }} />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-[12px] flex-shrink-0"
              style={{ background: `${sc.color}20`, border: `1px solid ${sc.color}35`, color: sc.color, fontFamily: "'Space Grotesk',sans-serif" }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold truncate" style={{ color: "#e0e0e0" }}>{customer?.full_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sc.color, boxShadow: `0 0 6px ${sc.color}` }} />
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: sc.color }}>{sc.label}</span>
              </div>
            </div>
          </div>
          {customer?.account_number && (
            <p className="text-[10px] mono mt-2 font-semibold" style={{ color: "rgba(0,212,212,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>#{customer.account_number}</p>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 sidebar-scroll" style={{ position: "relative", zIndex: 2 }}>
          <div className="flex items-center gap-2 px-2 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(0,180,180,0.8)" }} />
            <p className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Space Grotesk', sans-serif" }}>Navigation</p>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            const badge = badges[item.key];
            return (
              <button key={item.key}
                onClick={() => { setActiveTab(item.key); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium transition-all duration-150 relative group"
                style={{
                  borderRadius: 10,
                  ...(isActive ? {
                    background: "rgba(255,255,255,0.12)",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.18)",
                    boxShadow: "0 2px 12px rgba(30,45,110,0.3)",
                  } : {
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid transparent",
                  }),
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; } }}
              >
                {isActive && (
                  <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: "60%", background: "linear-gradient(180deg,#ffffff,rgba(255,255,255,0.5))", borderRadius: "0 3px 3px 0" }} />
                )}
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: isActive ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)", border: isActive ? "1px solid rgba(255,255,255,0.25)" : "1px solid transparent" }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: isActive ? "#ffffff" : "rgba(255,255,255,0.45)" }} />
                </div>
                <span className="flex-1 truncate text-left" style={{ fontFamily: "'Inter', sans-serif", fontWeight: isActive ? 600 : 500, fontSize: 13 }}>{item.label}</span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {badge > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 text-[9px] font-black rounded-full flex items-center justify-center text-white"
                      style={{ background: item.key === "tickets" ? "#f59e0b" : "#8B1A1A" }}>
                      {badge}
                    </span>
                  )}
                  {isActive && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#8B1A1A", boxShadow: "0 0 8px #8B1A1A", flexShrink: 0 }} />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12, position: "relative", zIndex: 2 }}>
          <div style={{ background: "rgba(0,180,180,0.06)", border: "1px solid rgba(0,212,212,0.15)", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
            <div className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#00b4b4" }} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold truncate" style={{ color: "#e0e0e0" }}>
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
            style={{ background: "rgba(139,26,26,0.08)", border: "1px solid rgba(139,26,26,0.2)", color: "#c23030" }}>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatChip icon={DollarSign}  label="Total Paid"   value={`R${(paid/1000).toFixed(1)}k`} color="#10b981" />
        <StatChip icon={AlertCircle} label="Overdue Inv." value={overdue}                        color={overdue > 0 ? "#8B1A1A" : "#10b981"} />
        <StatChip icon={TicketCheck} label="Open Tickets" value={openTkts}                       color="#f59e0b" />
        <StatChip icon={Activity}    label="Active Proj."  value={activePrj}                      color="#00b4b4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent invoices */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.18)", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#10b981,#00b4b4,transparent)" }} />
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.12)" }}>
                <Receipt className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
              </div>
              <span className="text-[13px] font-black" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>Recent Invoices</span>
            </div>
            <button onClick={() => setActiveTab("invoices")} className="text-[11px] font-bold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: "#00b4b4" }}>
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {recentInv.length === 0 ? (
            <p className="text-[12px] text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>No invoices yet</p>
          ) : recentInv.map(inv => {
            const statusColor = { paid: "#10b981", overdue: "#e02347", sent: "#0ea5e9", draft: "#64748b" }[inv.status] || "#64748b";
            return (
              <div key={inv.id} className="flex items-center gap-3 px-4 py-3 interactive-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${statusColor}15` }}>
                  <Receipt className="w-3.5 h-3.5" style={{ color: statusColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold truncate" style={{ color: "#e0e0e0" }}>{inv.invoice_number || "Invoice"}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{inv.due_date || "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-black mono" style={{ color: statusColor, fontFamily: "'JetBrains Mono',monospace" }}>R{(inv.total||0).toFixed(0)}</p>
                  <p className="text-[9px] font-bold uppercase" style={{ color: statusColor }}>{inv.status}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent tickets */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.18)", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#f59e0b,#8B1A1A,transparent)" }} />
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.12)" }}>
                <TicketCheck className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
              </div>
              <span className="text-[13px] font-black" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>Support Tickets</span>
            </div>
            <button onClick={() => setActiveTab("tickets")} className="text-[11px] font-bold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: "#00b4b4" }}>
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {recentTkt.length === 0 ? (
            <p className="text-[12px] text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>No tickets yet</p>
          ) : recentTkt.map(tkt => {
            const priColor = { critical: "#8B1A1A", high: "#f97316", medium: "#f59e0b", low: "#10b981" }[tkt.priority] || "#64748b";
            return (
              <div key={tkt.id} className="flex items-center gap-3 px-4 py-3 interactive-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{ background: priColor, boxShadow: `0 0 6px ${priColor}80` }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold truncate" style={{ color: "#e0e0e0" }}>{tkt.subject}</p>
                  <p className="text-[10px] capitalize" style={{ color: "rgba(255,255,255,0.3)" }}>{tkt.status}</p>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase"
                  style={{ background: `${priColor}15`, color: priColor, border: `1px solid ${priColor}30` }}>
                  {tkt.priority}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CustomerPortalMain() {
  const [user, setUser]               = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab]     = useState("overview");
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
  const { data: invoices = [] } = useQuery({ queryKey: ["portal-invoices-main", customer?.id], queryFn: () => base44.entities.Invoice.filter({ customer_id: customer.id }, "-created_date"), enabled: !!customer?.id });
  const { data: tickets  = [] } = useQuery({ queryKey: ["portal-tickets-main",  customer?.id], queryFn: () => base44.entities.Ticket.filter({ customer_id: customer.id }, "-created_date"),  enabled: !!customer?.id });
  const { data: projects = [] } = useQuery({ queryKey: ["portal-projects",      customer?.id], queryFn: () => base44.entities.FibreProject.filter({ customer_id: customer.id }),              enabled: !!customer?.id });

  if (authLoading || customerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center page-bg">
        <div className="flex flex-col items-center gap-4">
          <img src={LOGO_WORDMARK} alt="TouchNet" className="h-8 object-contain" style={{ opacity: 0.9 }} />
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#00b4b4" }} />
            <span className="text-sm font-semibold" style={{ color: "#00b4b4" }}>Loading your portal…</span>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 page-bg">
        <img src={LOGO_WORDMARK} alt="Logo" className="h-8 object-contain mb-2" style={{ opacity: 0.9 }} />
        <div className="rounded-2xl p-8 max-w-md w-full text-center"
          style={{ background: "#1a1a1a", border: "1px solid rgba(139,26,26,0.3)", boxShadow: "0 8px 40px rgba(139,26,26,0.12)" }}>
          <div className="h-[2px] -mx-8 -mt-8 mb-6 rounded-t-2xl" style={{ background: "linear-gradient(90deg,#8B1A1A,#a52020,transparent)" }} />
          <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: "#8B1A1A" }} />
          <h2 className="text-lg font-black mb-1" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>Account Not Found</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
            No customer account is linked to <strong style={{ color: "#00b4b4" }}>{user?.email}</strong>. Please contact support.
          </p>
          <button onClick={() => base44.auth.logout("/")}
            className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-white text-sm font-bold"
            style={{ background: "linear-gradient(135deg,#8B1A1A,#a52020)", boxShadow: "0 4px 16px rgba(139,26,26,0.3)" }}>
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
    <div className="min-h-screen flex" style={{ background: "#111111" }}>
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px]"
          style={{ background: "radial-gradient(circle, rgba(0,180,180,0.07) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 left-64 w-[400px] h-[400px]"
          style={{ background: "radial-gradient(circle, rgba(139,26,26,0.05) 0%, transparent 65%)" }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
      </div>

      {/* Sidebar */}
      <PortalSidebar
        customer={customer} activeTab={activeTab} setActiveTab={setActiveTab}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)}
        invoices={invoices} tickets={tickets} sc={sc}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">

        {/* Top bar */}
        <header className="sticky top-0 z-30 h-[60px] flex items-center gap-4 px-5 top-bar top-bar-futuristic">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
            style={{ color: "#00b4b4", background: "rgba(0,180,180,0.06)", border: "1px solid rgba(0,180,180,0.15)" }}>
            <Menu className="w-4 h-4" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2.5 flex-1">
            <img src={LOGO_WORDMARK} alt="TouchNet" className="h-5 object-contain hidden sm:block" style={{ opacity: 0.95 }} />
            {currentNavItem && (
              <>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }} className="hidden sm:block">›</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{ background: "rgba(0,180,180,0.08)", border: "1px solid rgba(0,180,180,0.2)" }}>
                  <currentNavItem.icon className="w-3.5 h-3.5" style={{ color: "#00b4b4" }} />
                  <span className="text-[13px] font-bold" style={{ color: "#00b4b4", fontFamily: "'Space Grotesk',sans-serif" }}>
                    {currentNavItem.label}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowCoverage(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg,#8B1A1A,#a52020)", color: "white", boxShadow: "0 3px 10px rgba(139,26,26,0.3)" }}>
              <MapPin className="w-3.5 h-3.5" /> Coverage
            </button>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sc.color, boxShadow: `0 0 6px ${sc.color}` }} />
              <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: sc.color }}>{sc.label}</span>
            </div>
            <PortalNotificationBell customerEmail={customer.email} />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-16 content-scroll">
          <div className="max-w-5xl mx-auto space-y-5">

            {/* Welcome banner */}
            <div className="rounded-2xl overflow-hidden relative"
              style={{ background: "linear-gradient(135deg,#141414,#1a1a1a,#141414)", border: "1px solid rgba(0,212,212,0.25)", boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 40px rgba(0,180,180,0.04)" }}>
              <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${sc.color}, #00b4b4, #00d4d4, rgba(255,255,255,0.5), #8B1A1A, transparent)` }} />
              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-5 h-5 pointer-events-none" style={{ borderTop: "2px solid rgba(0,212,212,0.4)", borderLeft: "2px solid rgba(0,212,212,0.4)" }} />
              <div className="absolute top-3 right-3 w-5 h-5 pointer-events-none" style={{ borderTop: "2px solid rgba(139,26,26,0.4)", borderRight: "2px solid rgba(139,26,26,0.4)" }} />
              <div className="absolute bottom-3 left-3 w-5 h-5 pointer-events-none" style={{ borderBottom: "2px solid rgba(0,212,212,0.25)", borderLeft: "2px solid rgba(0,212,212,0.25)" }} />
              <div className="absolute bottom-3 right-3 w-5 h-5 pointer-events-none" style={{ borderBottom: "2px solid rgba(139,26,26,0.25)", borderRight: "2px solid rgba(139,26,26,0.25)" }} />
              {/* Dot grid */}
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(0,212,212,0.05) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
              {/* Ambient glows */}
              <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                style={{ background: `radial-gradient(circle at 80% 20%, ${sc.color}10, transparent 65%)` }} />
              <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none"
                style={{ background: "radial-gradient(circle at 20% 80%, rgba(0,180,180,0.06), transparent 65%)" }} />

              <div className="relative px-5 sm:px-7 py-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${sc.color}20, ${sc.color}08)`, border: `1px solid ${sc.color}30`, color: sc.color, boxShadow: `0 4px 20px ${sc.color}20`, fontFamily: "'Space Grotesk',sans-serif" }}>
                    {customer.full_name?.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mono" style={{ color: "rgba(0,212,212,0.5)" }}>Customer Portal</p>
                    <h1 className="text-2xl font-black leading-tight mt-0.5 glow-text-navy" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                      Welcome back, {customer.full_name.split(" ")[0]}!
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5" style={{ color: "#00b4b4" }} />
                        <span className="text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
                          {PLAN_LABELS[customer.service_plan] || customer.service_plan?.replace(/_/g," ") || "Service Plan"}
                        </span>
                      </div>
                      {customer.connection_type && (
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3 h-3" style={{ color: "#8B1A1A" }} />
                          <span className="text-[12px] capitalize" style={{ color: "rgba(255,255,255,0.45)" }}>{customer.connection_type}</span>
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
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sc.color, boxShadow: `0 0 6px ${sc.color}` }} />
                      <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: sc.color }}>{sc.label}</span>
                    </div>
                    {customer.account_number && (
                      <p className="text-[10px] mono font-semibold" style={{ color: "rgba(0,212,212,0.4)", fontFamily: "'JetBrains Mono',monospace" }}>#{customer.account_number}</p>
                    )}
                  </div>
                </div>

                {overdueInv > 0 && (
                  <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: "rgba(224,35,71,0.08)", border: "1px solid rgba(224,35,71,0.25)" }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#8B1A1A" }} />
                    <p className="text-[12px] font-semibold" style={{ color: "#c23030" }}>
                      You have {overdueInv} overdue invoice{overdueInv > 1 ? "s" : ""}. Please review your billing.
                    </p>
                    <button onClick={() => setActiveTab("invoices")}
                      className="ml-auto text-[11px] font-bold px-3 py-1 rounded-lg flex-shrink-0 transition-all hover:scale-105"
                      style={{ background: "rgba(139,26,26,0.12)", color: "#c23030", border: "1px solid rgba(139,26,26,0.3)" }}>
                      View →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "overview"      && <OverviewTab customer={customer} invoices={invoices} tickets={tickets} projects={projects} setActiveTab={setActiveTab} sc={sc} />}
            {activeTab === "projects"      && <PortalProjectsTab  customer={customer} />}
            {activeTab === "invoices"      && <PortalInvoicesTab  customer={customer} />}
            {activeTab === "tickets"       && <PortalTicketsTab   customer={customer} user={user} />}
            {activeTab === "documents"     && <PortalDocumentsTab customer={customer} user={user} />}
            {activeTab === "quotes"        && <PortalQuotesTab    customer={customer} />}
            {activeTab === "network"       && <PortalNetworkTab     customer={customer} />}
            {activeTab === "data_usage"    && <DataUsageDashboard   customer={customer} />}
            {activeTab === "service_plan"  && <PortalServicePlanTab customer={customer} />}
            {activeTab === "resellers"     && <PortalResellersTab   customer={customer} />}
            {activeTab === "troubleshoot"  && <TroubleshootTab onOpenTicket={() => setActiveTab("tickets")} customer={customer} />}
            {activeTab === "knowledge_base"&& <KnowledgeBaseAdmin />}
          </div>
        </main>
      </div>
      {showCoverage && <CoverageChecker onClose={() => setShowCoverage(false)} />}
    </div>
  );
}