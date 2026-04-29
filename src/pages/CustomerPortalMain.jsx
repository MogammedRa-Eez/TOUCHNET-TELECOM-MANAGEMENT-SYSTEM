import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Wifi, Receipt, TicketCheck, LogOut, AlertCircle, Loader2,
  FolderOpen, FileText, Activity, DollarSign, Zap,
  Menu, X, ChevronRight, Users, Home, BarChart3, BookOpen,
  MapPin, TrendingUp, Shield, Phone, Clock, CheckCircle2,
  ArrowUpRight, Signal, Globe, Star
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

const LOGO_WORDMARK = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/b3b518de6_Touchnet_LogoLongWhite.png";
const LOGO_TEAL     = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/fa247a9df_Touchnet_LogoLongTeal.png";
const LOGO_BADGE    = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/639b91697_Touchnet-CrestDesogm_CrestFinalFullWhite.png";

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

const NAV_GROUPS = [
  {
    label: "Account",
    items: [
      { key: "overview",     label: "Overview",     icon: Home,        desc: "Account summary" },
      { key: "service_plan", label: "My Plan",       icon: Star,        desc: "Plan & contract" },
      { key: "network",      label: "Network",       icon: Activity,    desc: "Performance" },
      { key: "data_usage",   label: "Data Usage",    icon: BarChart3,   desc: "Consumption" },
    ]
  },
  {
    label: "Billing",
    items: [
      { key: "invoices",     label: "Invoices",      icon: Receipt,     desc: "Billing history" },
      { key: "quotes",       label: "Quotes",        icon: FileText,    desc: "Service proposals" },
    ]
  },
  {
    label: "Projects",
    items: [
      { key: "projects",     label: "Projects",      icon: Wifi,        desc: "Fibre installations" },
      { key: "documents",    label: "Documents",     icon: FolderOpen,  desc: "Files & contracts" },
    ]
  },
  {
    label: "Support",
    items: [
      { key: "tickets",      label: "Support",       icon: TicketCheck, desc: "Help & tickets" },
      { key: "troubleshoot", label: "Troubleshoot",  icon: Zap,         desc: "Fix issues" },
      { key: "knowledge_base",label: "Knowledge Base",icon: BookOpen,   desc: "KB articles" },
    ]
  },
  {
    label: "Referrals",
    items: [
      { key: "resellers",    label: "Referrals",     icon: Users,       desc: "Rewards program" },
    ]
  },
];

// Flat list for breadcrumb lookup
const NAV_ITEMS_FLAT = NAV_GROUPS.flatMap(g => g.items);

// ── KPI Stat Card ──────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col rounded-2xl p-4 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] text-left w-full"
      style={{
        background: `linear-gradient(135deg, ${color}10, ${color}05, rgba(0,0,0,0.2))`,
        border: `1px solid ${color}28`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 20px ${color}08`,
      }}>
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}55, transparent)` }} />
      {/* Corner bracket */}
      <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 pointer-events-none"
        style={{ borderTop: `1.5px solid ${color}35`, borderRight: `1.5px solid ${color}35` }} />
      {/* Ambient glow */}
      <div className="absolute -bottom-4 -right-4 w-20 h-20 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}18, transparent 70%)` }} />

      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <p className="text-[22px] font-black mono leading-none mb-1"
        style={{ color, fontFamily: "'JetBrains Mono',monospace", textShadow: `0 0 20px ${color}50` }}>
        {value}
      </p>
      <p className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
      {sub && <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>{sub}</p>}
      {onClick && (
        <div className="absolute bottom-3 right-3">
          <ArrowUpRight className="w-3 h-3" style={{ color: `${color}60` }} />
        </div>
      )}
    </button>
  );
}

// ── Quick Action Button ────────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, color, onClick }) {
  return (
    <button onClick={onClick}
      className="flex flex-col items-center gap-2 px-4 py-3 rounded-2xl transition-all hover:-translate-y-1 hover:scale-105 active:scale-95"
      style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
    </button>
  );
}

// ── Overview Tab ───────────────────────────────────────────────────────────────
function OverviewTab({ customer, invoices, tickets, projects, setActiveTab, sc }) {
  const paid      = invoices.filter(i => i.status === "paid").reduce((a, i) => a + (i.total || 0), 0);
  const overdue   = invoices.filter(i => i.status === "overdue").length;
  const openTkts  = tickets.filter(t => !["resolved","closed"].includes(t.status)).length;
  const activePrj = projects.filter(p => !["cancelled","billed"].includes(p.status)).length;
  const recentInv = invoices.slice(0, 4);
  const recentTkt = tickets.slice(0, 4);

  const statusColor = { paid: "#10b981", overdue: "#8B1A1A", sent: "#0ea5e9", draft: "#64748b" };
  const priColor    = { critical: "#8B1A1A", high: "#f97316", medium: "#f59e0b", low: "#10b981" };

  return (
    <div className="space-y-6">

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={DollarSign}  label="Total Paid"    value={`R${(paid/1000).toFixed(1)}k`}  color="#10b981"                              onClick={() => setActiveTab("invoices")} />
        <KpiCard icon={AlertCircle} label="Overdue"       value={overdue}                          color={overdue > 0 ? "#8B1A1A" : "#10b981"} onClick={() => setActiveTab("invoices")} />
        <KpiCard icon={TicketCheck} label="Open Tickets"  value={openTkts}                         color="#f59e0b"                              onClick={() => setActiveTab("tickets")} />
        <KpiCard icon={Signal}      label="Active Proj."  value={activePrj}                        color="#00b4b4"                              onClick={() => setActiveTab("projects")} />
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.15)" }}>
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.2),transparent)" }} />
        <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(0,212,212,0.6)" }}>Quick Actions</p>
        </div>
        <div className="p-4 flex flex-wrap gap-3">
          <QuickAction icon={TicketCheck} label="New Ticket"   color="#f59e0b"  onClick={() => setActiveTab("tickets")} />
          <QuickAction icon={Receipt}     label="View Bills"   color="#10b981"  onClick={() => setActiveTab("invoices")} />
          <QuickAction icon={Wifi}        label="Projects"     color="#00b4b4"  onClick={() => setActiveTab("projects")} />
          <QuickAction icon={Activity}    label="Network"      color="#6366f1"  onClick={() => setActiveTab("network")} />
          <QuickAction icon={FolderOpen}  label="Documents"    color="#8b5cf6"  onClick={() => setActiveTab("documents")} />
          <QuickAction icon={Users}       label="Referrals"    color="#0ea5e9"  onClick={() => setActiveTab("resellers")} />
        </div>
      </div>

      {/* Service health + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Network health pulse */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.18)" }}>
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#6366f1,transparent)" }} />
          <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,180,180,0.12)" }}>
                <Globe className="w-3.5 h-3.5" style={{ color: "#00b4b4" }} />
              </div>
              <span className="text-[13px] font-black" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>Service Status</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {[
              { label: "Connectivity",  val: customer.status === "active" ? "Online" : "Offline", pct: customer.status === "active" ? 99 : 0,  color: customer.status === "active" ? "#10b981" : "#8B1A1A" },
              { label: "Plan",          val: PLAN_LABELS[customer.service_plan] || "—",            pct: 100,  color: "#00b4b4" },
              { label: "Account",       val: customer.status || "—",                               pct: customer.status === "active" ? 100 : 40, color: sc.color },
              { label: "Billing",       val: overdue > 0 ? `${overdue} overdue` : "Up to date",   pct: overdue > 0 ? 30 : 100, color: overdue > 0 ? "#8B1A1A" : "#10b981" },
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.45)" }}>{item.label}</span>
                  <span className="text-[11px] font-black mono" style={{ color: item.color }}>{item.val}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${item.pct}%`, background: `linear-gradient(90deg, ${item.color}, ${item.color}80)`, boxShadow: `0 0 6px ${item.color}60` }} />
                </div>
              </div>
            ))}
            <button onClick={() => setActiveTab("network")}
              className="w-full mt-2 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02]"
              style={{ background: "rgba(0,180,180,0.06)", border: "1px solid rgba(0,180,180,0.15)", color: "#00b4b4" }}>
              View Full Network Details →
            </button>
          </div>
        </div>

        {/* Account summary */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.18)" }}>
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#10b981,#00b4b4,transparent)" }} />
          <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.12)" }}>
                <Shield className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
              </div>
              <span className="text-[13px] font-black" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>Account Details</span>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: "Account No.",    value: customer.account_number || "—",   color: "#00d4d4" },
              { label: "Service Plan",   value: PLAN_LABELS[customer.service_plan] || "—", color: "#e0e0e0" },
              { label: "Connection",     value: customer.connection_type || "—",  color: "#e0e0e0" },
              { label: "Monthly Rate",   value: customer.monthly_rate ? `R${customer.monthly_rate}/mo` : "—", color: "#10b981" },
              { label: "Install Date",   value: customer.installation_date || "—", color: "#e0e0e0" },
              { label: "Contract End",   value: customer.contract_end_date || "—", color: customer.contract_end_date && new Date(customer.contract_end_date) < new Date() ? "#8B1A1A" : "#e0e0e0" },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-1.5 data-row">
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>{row.label}</span>
                <span className="text-[12px] font-bold mono" style={{ color: row.color, fontFamily: row.label === "Account No." ? "'JetBrains Mono',monospace" : "inherit" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Invoices + Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Invoices */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.18)" }}>
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
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Receipt className="w-8 h-8" style={{ color: "rgba(255,255,255,0.1)" }} />
              <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.2)" }}>No invoices yet</p>
            </div>
          ) : recentInv.map(inv => {
            const sc2 = statusColor[inv.status] || "#64748b";
            return (
              <div key={inv.id} className="flex items-center gap-3 px-4 py-3 interactive-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${sc2}12`, border: `1px solid ${sc2}25` }}>
                  <Receipt className="w-3.5 h-3.5" style={{ color: sc2 }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold truncate" style={{ color: "#e0e0e0" }}>{inv.invoice_number || "Invoice"}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{inv.due_date || "—"}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[13px] font-black mono" style={{ color: sc2, fontFamily: "'JetBrains Mono',monospace" }}>R{(inv.total||0).toFixed(0)}</p>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md"
                    style={{ background: `${sc2}15`, color: sc2 }}>{inv.status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Tickets */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.18)" }}>
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
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <TicketCheck className="w-8 h-8" style={{ color: "rgba(255,255,255,0.1)" }} />
              <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.2)" }}>No tickets yet</p>
            </div>
          ) : recentTkt.map(tkt => {
            const pc = priColor[tkt.priority] || "#64748b";
            const statusDot = { open: "#f59e0b", in_progress: "#00b4b4", resolved: "#10b981", closed: "#64748b" }[tkt.status] || "#64748b";
            return (
              <div key={tkt.id} className="flex items-center gap-3 px-4 py-3 interactive-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${pc}12`, border: `1px solid ${pc}25` }}>
                  <TicketCheck className="w-3.5 h-3.5" style={{ color: pc }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold truncate" style={{ color: "#e0e0e0" }}>{tkt.subject}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusDot }} />
                    <p className="text-[10px] capitalize" style={{ color: "rgba(255,255,255,0.3)" }}>{tkt.status?.replace(/_/g," ")}</p>
                  </div>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase flex-shrink-0"
                  style={{ background: `${pc}15`, color: pc, border: `1px solid ${pc}30` }}>
                  {tkt.priority}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact strip */}
      <div className="rounded-2xl p-4 flex flex-wrap items-center gap-4"
        style={{ background: "linear-gradient(135deg,rgba(0,180,180,0.06),rgba(139,26,26,0.04))", border: "1px solid rgba(0,212,212,0.12)" }}>
        <div className="flex items-center gap-2">
          <img src={LOGO_BADGE} alt="TouchNet" className="w-6 h-6 object-contain" style={{ opacity: 0.5 }} />
          <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: "rgba(0,212,212,0.5)" }}>Need Help?</span>
        </div>
        <div className="flex flex-wrap gap-3 flex-1">
          <a href="mailto:support@touchnet.co.za"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
            style={{ background: "rgba(0,180,180,0.08)", border: "1px solid rgba(0,180,180,0.2)", color: "#00b4b4" }}>
            ✉ support@touchnet.co.za
          </a>
          <a href="tel:+27110000000"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
            style={{ background: "rgba(139,26,26,0.08)", border: "1px solid rgba(139,26,26,0.2)", color: "#c23030" }}>
            <Phone className="w-3 h-3" /> +27 11 000 0000
          </a>
        </div>
        <button onClick={() => setActiveTab("tickets")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold text-white transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 3px 12px rgba(0,180,180,0.25)" }}>
          Open Ticket <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Portal Sidebar ─────────────────────────────────────────────────────────────
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
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          width: 264,
          background: "linear-gradient(180deg, #080d0d 0%, #0a0f0f 40%, #0f0f0f 70%, #111111 100%)",
          borderRight: "1px solid rgba(0,212,212,0.1)",
          flexShrink: 0,
          overflow: "hidden",
          position: "relative",
        }}>

        {/* Dot grid overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none", opacity: 0.5 }} />
        {/* Ambient teal */}
        <div style={{ position: "absolute", top: -60, left: -40, width: 260, height: 260, background: "radial-gradient(circle, rgba(0,212,212,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
        {/* Ambient maroon */}
        <div style={{ position: "absolute", bottom: 40, right: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(139,26,26,0.1) 0%, transparent 68%)", pointerEvents: "none" }} />

        {/* ── Logo header ── */}
        <div className="flex items-center justify-between px-4 h-[68px] flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", position: "relative", zIndex: 2 }}>
          {/* Animated top accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: "linear-gradient(90deg,#8B1A1A,#00b4b4,#00d4d4,rgba(255,255,255,0.6),#00b4b4,transparent)", backgroundSize: "300% auto", animation: "border-rotate 6s ease infinite" }} />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,rgba(0,180,180,0.15),rgba(139,26,26,0.08))", border: "1px solid rgba(0,212,212,0.25)", boxShadow: "0 0 12px rgba(0,180,180,0.15)" }}>
              <img src={LOGO_BADGE} alt="TouchNet Crest" className="w-8 h-8 object-contain" style={{ opacity: 0.92 }} />
            </div>
            <div>
              <img src={LOGO_WORDMARK} alt="TouchNet" className="h-5 object-contain" style={{ opacity: 0.95 }} />
              <p className="text-[8px] font-black tracking-[0.28em] uppercase mt-0.5"
                style={{ color: "rgba(0,212,212,0.45)", fontFamily: "'JetBrains Mono',monospace" }}>CUSTOMER PORTAL</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── User card ── */}
        <div className="mx-3 mt-3 mb-2 rounded-xl px-3 py-3 flex-shrink-0 relative overflow-hidden"
          style={{ background: "rgba(0,180,180,0.06)", border: "1px solid rgba(0,212,212,0.15)", zIndex: 2 }}>
          <div className="absolute top-0 left-0 right-0 h-[1px]"
            style={{ background: "linear-gradient(90deg,rgba(0,212,212,0.5),transparent)" }} />
          <div className="absolute bottom-2 right-2 w-3 h-3 pointer-events-none"
            style={{ borderBottom: "1px solid rgba(139,26,26,0.35)", borderRight: "1px solid rgba(139,26,26,0.35)" }} />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-[13px] flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${sc.color}25, ${sc.color}10)`, border: `1px solid ${sc.color}35`, color: sc.color, fontFamily: "'Space Grotesk',sans-serif", boxShadow: `0 4px 12px ${sc.color}20` }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold truncate" style={{ color: "#f0f0f0" }}>{customer?.full_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.color, boxShadow: `0 0 6px ${sc.color}`, animation: "pulse 2s infinite" }} />
                <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: sc.color }}>{sc.label}</span>
              </div>
            </div>
          </div>
          {customer?.account_number && (
            <p className="text-[9px] mono mt-2 font-bold" style={{ color: "rgba(0,212,212,0.35)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em" }}>
              ACC #{customer.account_number}
            </p>
          )}
          {customer?.monthly_rate && (
            <div className="mt-2 pt-2 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>Monthly</span>
              <span className="text-[11px] font-black mono" style={{ color: "#10b981" }}>R{customer.monthly_rate}/mo</span>
            </div>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto px-2 py-1 sidebar-scroll" style={{ position: "relative", zIndex: 2 }}>
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="mb-3">
              {/* Group label */}
              <div className="flex items-center gap-2 px-2 mb-1">
                <div className="w-1 h-1 rounded-full" style={{ background: "rgba(0,180,180,0.6)" }} />
                <p className="text-[8px] font-black uppercase tracking-[0.25em]"
                  style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Space Grotesk',sans-serif" }}>
                  {group.label}
                </p>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;
                  const badge = badges[item.key];
                  return (
                    <button key={item.key}
                      onClick={() => { setActiveTab(item.key); onClose(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-[12px] font-medium transition-all duration-150 relative group"
                      style={{
                        borderRadius: 10,
                        ...(isActive ? {
                          background: "rgba(0,180,180,0.12)",
                          color: "#ffffff",
                          border: "1px solid rgba(0,212,212,0.25)",
                          boxShadow: "0 2px 12px rgba(0,180,180,0.1)",
                        } : {
                          color: "rgba(255,255,255,0.45)",
                          border: "1px solid transparent",
                        }),
                      }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; } }}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; } }}
                    >
                      {isActive && (
                        <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: "60%", background: "linear-gradient(180deg,#00d4d4,#00b4b4)", borderRadius: "0 3px 3px 0" }} />
                      )}
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isActive ? "rgba(0,212,212,0.2)" : "rgba(255,255,255,0.06)",
                          border: isActive ? "1px solid rgba(0,212,212,0.3)" : "1px solid transparent"
                        }}>
                        <Icon className="w-3 h-3" style={{ color: isActive ? "#00d4d4" : "rgba(255,255,255,0.4)" }} />
                      </div>
                      <span className="flex-1 truncate text-left" style={{ fontWeight: isActive ? 600 : 500, fontSize: 12 }}>{item.label}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {badge > 0 && (
                          <span className="min-w-[16px] h-[16px] px-1 text-[8px] font-black rounded-full flex items-center justify-center text-white"
                            style={{ background: item.key === "tickets" ? "#f59e0b" : "#8B1A1A" }}>
                            {badge}
                          </span>
                        )}
                        {isActive && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#8B1A1A", boxShadow: "0 0 6px #8B1A1A", flexShrink: 0 }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div className="px-3 pb-4 pt-3 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)", position: "relative", zIndex: 2 }}>
          {/* Plan mini chip */}
          <div className="mb-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(0,180,180,0.05)", border: "1px solid rgba(0,212,212,0.12)" }}>
            <div className="flex items-center gap-2">
              <Wifi className="w-3 h-3 flex-shrink-0" style={{ color: "#00b4b4" }} />
              <span className="text-[10px] font-bold truncate" style={{ color: "#e0e0e0" }}>
                {PLAN_LABELS[customer?.service_plan] || "—"}
              </span>
            </div>
          </div>
          {/* Motto */}
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <img src={LOGO_BADGE} alt="Crest" className="w-4 h-4 object-contain" style={{ opacity: 0.3 }} />
            <span className="text-[7px] font-black uppercase tracking-[0.22em]"
              style={{ color: "rgba(0,212,212,0.2)", fontFamily: "'JetBrains Mono',monospace" }}>
              BUILD · CONNECT · PROTECT
            </span>
          </div>
          <button onClick={() => base44.auth.logout("/")}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: "rgba(139,26,26,0.08)", border: "1px solid rgba(139,26,26,0.18)", color: "#c23030" }}>
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>
    </>
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

  // ── Loading ──
  if (authLoading || customerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center page-bg">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full" style={{ background: "radial-gradient(circle,rgba(0,180,180,0.15),transparent 70%)", animation: "pulse-navy 2s infinite" }} />
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
              style={{ background: "linear-gradient(135deg,rgba(0,180,180,0.15),rgba(139,26,26,0.08))", border: "1px solid rgba(0,212,212,0.25)" }}>
              <img src={LOGO_BADGE} alt="TouchNet" className="w-11 h-11 object-contain" style={{ opacity: 0.9 }} />
            </div>
          </div>
          <div className="text-center">
            <img src={LOGO_WORDMARK} alt="TouchNet" className="h-7 object-contain mx-auto mb-3" style={{ opacity: 0.85 }} />
            <div className="flex items-center gap-2 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#00b4b4" }} />
              <span className="text-[12px] font-semibold mono" style={{ color: "rgba(0,212,212,0.6)" }}>Loading your portal…</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── No account ──
  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 page-bg">
        <div className="rounded-2xl p-8 max-w-md w-full text-center"
          style={{ background: "#1a1a1a", border: "1px solid rgba(139,26,26,0.3)", boxShadow: "0 8px 40px rgba(139,26,26,0.12)" }}>
          <div className="h-[2px] -mx-8 -mt-8 mb-6 rounded-t-2xl" style={{ background: "linear-gradient(90deg,#8B1A1A,#a52020,transparent)" }} />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(139,26,26,0.12)", border: "1px solid rgba(139,26,26,0.3)" }}>
            <AlertCircle className="w-7 h-7" style={{ color: "#8B1A1A" }} />
          </div>
          <h2 className="text-lg font-black mb-2" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>Account Not Found</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            No customer account is linked to <strong style={{ color: "#00b4b4" }}>{user?.email}</strong>. Please contact support.
          </p>
          <button onClick={() => base44.auth.logout("/")}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#8B1A1A,#a52020)", boxShadow: "0 4px 16px rgba(139,26,26,0.3)" }}>
            <LogOut className="w-4 h-4" /> Back to Login
          </button>
        </div>
      </div>
    );
  }

  const sc         = STATUS_CFG[customer.status] || STATUS_CFG.pending;
  const overdueInv = invoices.filter(i => i.status === "overdue").length;
  const currentNavItem = NAV_ITEMS_FLAT.find(n => n.key === activeTab);

  return (
    <div className="min-h-screen flex" style={{ background: "#111111" }}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 right-0 w-[600px] h-[600px]"
          style={{ background: "radial-gradient(circle, rgba(0,180,180,0.06) 0%, transparent 60%)" }} />
        <div className="absolute bottom-0 left-72 w-[400px] h-[400px]"
          style={{ background: "radial-gradient(circle, rgba(139,26,26,0.04) 0%, transparent 60%)" }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
      </div>

      {/* Sidebar */}
      <PortalSidebar
        customer={customer} activeTab={activeTab} setActiveTab={setActiveTab}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)}
        invoices={invoices} tickets={tickets} sc={sc}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-30 h-[60px] flex items-center gap-3 px-4 sm:px-5 top-bar top-bar-futuristic">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl"
            style={{ color: "#00b4b4", background: "rgba(0,180,180,0.06)", border: "1px solid rgba(0,180,180,0.15)" }}>
            <Menu className="w-4 h-4" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 flex-1">
            <img src={LOGO_TEAL} alt="TouchNet" className="h-5 object-contain hidden sm:block" style={{ opacity: 0.9 }} />
            {currentNavItem && (
              <>
                <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 14 }} className="hidden sm:block">›</span>
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
            {/* Live clock */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Clock className="w-3 h-3" style={{ color: "rgba(255,255,255,0.3)" }} />
              <span className="text-[10px] mono font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
                {new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <button onClick={() => setShowCoverage(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg,#8B1A1A,#a52020)", color: "white", boxShadow: "0 3px 10px rgba(139,26,26,0.3)" }}>
              <MapPin className="w-3.5 h-3.5" /> Coverage
            </button>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
              style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sc.color, boxShadow: `0 0 6px ${sc.color}` }} />
              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: sc.color }}>{sc.label}</span>
            </div>
            <PortalNotificationBell customerEmail={customer.email} />
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-16 content-scroll">
          <div className="max-w-5xl mx-auto space-y-5">

            {/* ── Welcome Banner ── */}
            <div className="rounded-2xl overflow-hidden relative"
              style={{ background: "linear-gradient(135deg,#141414,#1a1a1a,#141414)", border: "1px solid rgba(0,212,212,0.22)", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
              {/* Accent bar */}
              <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${sc.color}, #00b4b4, #00d4d4, rgba(255,255,255,0.4), #8B1A1A, transparent)` }} />
              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-5 h-5 pointer-events-none" style={{ borderTop: "1.5px solid rgba(0,212,212,0.35)", borderLeft: "1.5px solid rgba(0,212,212,0.35)" }} />
              <div className="absolute top-3 right-3 w-5 h-5 pointer-events-none" style={{ borderTop: "1.5px solid rgba(139,26,26,0.35)", borderRight: "1.5px solid rgba(139,26,26,0.35)" }} />
              <div className="absolute bottom-3 left-3 w-5 h-5 pointer-events-none" style={{ borderBottom: "1.5px solid rgba(0,212,212,0.2)", borderLeft: "1.5px solid rgba(0,212,212,0.2)" }} />
              <div className="absolute bottom-3 right-3 w-5 h-5 pointer-events-none" style={{ borderBottom: "1.5px solid rgba(139,26,26,0.2)", borderRight: "1.5px solid rgba(139,26,26,0.2)" }} />
              {/* Dot grid */}
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(0,212,212,0.04) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
              {/* Glows */}
              <div className="absolute top-0 right-0 w-56 h-56 pointer-events-none"
                style={{ background: `radial-gradient(circle at 80% 20%, ${sc.color}08, transparent 65%)` }} />
              <div className="absolute bottom-0 left-0 w-40 h-40 pointer-events-none"
                style={{ background: "radial-gradient(circle at 20% 80%, rgba(0,180,180,0.05), transparent 65%)" }} />

              <div className="relative px-5 sm:px-7 py-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${sc.color}22, ${sc.color}08)`, border: `1px solid ${sc.color}35`, color: sc.color, boxShadow: `0 4px 20px ${sc.color}18`, fontFamily: "'Space Grotesk',sans-serif" }}>
                    {customer.full_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] mono mb-0.5" style={{ color: "rgba(0,212,212,0.45)" }}>
                      Customer Portal · TouchNet TMS
                    </p>
                    <h1 className="text-2xl font-black leading-tight" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#f0f0f0" }}>
                      Welcome back, <span style={{ color: "#00d4d4" }}>{customer.full_name.split(" ")[0]}</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                        style={{ background: "rgba(0,180,180,0.08)", border: "1px solid rgba(0,180,180,0.18)" }}>
                        <Wifi className="w-3 h-3" style={{ color: "#00b4b4" }} />
                        <span className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
                          {PLAN_LABELS[customer.service_plan] || customer.service_plan?.replace(/_/g," ") || "Service Plan"}
                        </span>
                      </div>
                      {customer.connection_type && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                          style={{ background: "rgba(139,26,26,0.07)", border: "1px solid rgba(139,26,26,0.2)" }}>
                          <Zap className="w-3 h-3" style={{ color: "#a52020" }} />
                          <span className="text-[11px] capitalize" style={{ color: "rgba(255,255,255,0.45)" }}>{customer.connection_type}</span>
                        </div>
                      )}
                      {customer.monthly_rate && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                          style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}>
                          <DollarSign className="w-3 h-3" style={{ color: "#10b981" }} />
                          <span className="text-[11px] mono font-bold" style={{ color: "#10b981" }}>R{customer.monthly_rate}/mo</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                      style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sc.color }} />
                      <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: sc.color }}>{sc.label}</span>
                    </div>
                    {customer.account_number && (
                      <p className="text-[9px] mono font-semibold" style={{ color: "rgba(0,212,212,0.35)", fontFamily: "'JetBrains Mono',monospace" }}>
                        #{customer.account_number}
                      </p>
                    )}
                  </div>
                </div>

                {/* Overdue alert */}
                {overdueInv > 0 && (
                  <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: "rgba(139,26,26,0.08)", border: "1px solid rgba(139,26,26,0.25)" }}>
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
            {activeTab === "overview"       && <OverviewTab customer={customer} invoices={invoices} tickets={tickets} projects={projects} setActiveTab={setActiveTab} sc={sc} />}
            {activeTab === "projects"       && <PortalProjectsTab  customer={customer} />}
            {activeTab === "invoices"       && <PortalInvoicesTab  customer={customer} />}
            {activeTab === "tickets"        && <PortalTicketsTab   customer={customer} user={user} />}
            {activeTab === "documents"      && <PortalDocumentsTab customer={customer} user={user} />}
            {activeTab === "quotes"         && <PortalQuotesTab    customer={customer} />}
            {activeTab === "network"        && <PortalNetworkTab     customer={customer} />}
            {activeTab === "data_usage"     && <DataUsageDashboard   customer={customer} />}
            {activeTab === "service_plan"   && <PortalServicePlanTab customer={customer} />}
            {activeTab === "resellers"      && <PortalResellersTab   customer={customer} />}
            {activeTab === "troubleshoot"   && <TroubleshootTab onOpenTicket={() => setActiveTab("tickets")} customer={customer} />}
            {activeTab === "knowledge_base" && <KnowledgeBaseAdmin />}
          </div>
        </main>
      </div>
      {showCoverage && <CoverageChecker onClose={() => setShowCoverage(false)} />}
    </div>
  );
}