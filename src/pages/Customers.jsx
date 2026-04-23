import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import LiveClock from "@/components/shared/LiveClock";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Upload, Users, Wifi, DollarSign, AlertTriangle,
         LayoutGrid, List, TrendingUp, Zap, Activity, ChevronDown, RefreshCw, Download, Heart } from "lucide-react";
import { toast } from "sonner";
import { exportToCsv } from "@/utils/exportCsv";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import CustomerForm from "../components/customers/CustomerForm";
import CustomerImport from "../components/customers/CustomerImport";
import OnboardingWizard from "../components/customers/OnboardingWizard";
import CustomerDetailPanel from "../components/customers/CustomerDetailPanel";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";

const STATUS_CFG = {
  active:     { color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)",   dot: "#34d399", label: "Active" },
  pending:    { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)",   dot: "#fbbf24", label: "Pending" },
  suspended:  { color: "#e02347", bg: "rgba(224,35,71,0.12)",   border: "rgba(224,35,71,0.3)",    dot: "#ff3358", label: "Suspended" },
  terminated: { color: "#64748b", bg: "rgba(100,116,139,0.1)",  border: "rgba(100,116,139,0.25)", dot: "#94a3b8", label: "Terminated" },
};

const PLAN_SHORT = {
  basic_10mbps:       "10 Mbps",
  standard_50mbps:    "50 Mbps",
  premium_100mbps:    "100 Mbps",
  enterprise_500mbps: "500 Mbps",
  dedicated_1gbps:    "1 Gbps",
};

const CONN_ICON = { fiber: "🔵", wireless: "📡", dsl: "🟡", satellite: "🛰️" };

const STATUS_FILTERS = ["all", "active", "pending", "suspended", "terminated"];

// ── KPI strip ────────────────────────────────────────────────────────────────
function KPIStrip({ customers }) {
  const total     = customers.length;
  const active    = customers.filter(c => c.status === "active").length;
  const suspended = customers.filter(c => c.status === "suspended").length;
  const mrr       = customers.filter(c => c.status === "active").reduce((a, c) => a + (c.monthly_rate || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        { label: "Total Customers", value: total,                         icon: Users,        color: "#00b4b4" },
        { label: "Active",          value: active,                        icon: Activity,     color: "#10b981" },
        { label: "Suspended",       value: suspended,                     icon: AlertTriangle,color: "#e02347" },
        { label: "Monthly Revenue", value: `R${(mrr/1000).toFixed(1)}k`, icon: DollarSign,   color: "#f59e0b" },
      ].map(k => (
        <div key={k.label} className="relative overflow-hidden rounded-2xl px-5 py-4 group transition-all hover:-translate-y-1 holo-card"
          style={{ background: "#181818", border: `1px solid ${k.color}30`, boxShadow: `0 4px 20px rgba(0,0,0,0.5)` }}>
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${k.color}, transparent)` }} />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full pointer-events-none transition-all duration-500 group-hover:scale-150 opacity-60" style={{ background: `radial-gradient(circle, ${k.color}18, transparent 70%)` }} />
          <div className="flex items-start justify-between relative">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{k.label}</p>
              <p className="text-3xl font-black mono" style={{ color: k.color, fontFamily: "'JetBrains Mono',monospace" }}>{k.value}</p>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-110" style={{ background: `${k.color}18`, border: `1px solid ${k.color}30` }}>
              <k.icon className="w-4 h-4" style={{ color: k.color }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Health score ─────────────────────────────────────────────────────────────
function HealthScore({ customer }) {
  // Simple score: deduct for suspended/terminated, overdue balance, no plan
  let score = 100;
  if (customer.status === "suspended")  score -= 40;
  if (customer.status === "terminated") score -= 80;
  if (customer.balance < 0)             score -= 20;
  if (!customer.service_plan)           score -= 10;
  score = Math.max(0, Math.min(100, score));

  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 80 ? "Healthy" : score >= 50 ? "At Risk" : "Critical";

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${score}%`, background: color, boxShadow: `0 0 6px ${color}80` }} />
      </div>
      <span className="text-[9px] font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

// ── Customer card (grid view) ─────────────────────────────────────────────────
function CustomerCard({ customer, onClick }) {
  const sc = STATUS_CFG[customer.status] || STATUS_CFG.pending;
  const initials = customer.full_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??";
  return (
    <div
      onClick={() => onClick(customer)}
      className="rounded-2xl p-4 cursor-pointer transition-all duration-200 group holo-card"
      style={{ background: "linear-gradient(135deg,#181818,#1a1a1a)", border: `1px solid ${sc.color}28`, boxShadow: "0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 28px ${sc.color}20, 0 0 20px rgba(0,212,212,0.06)`; e.currentTarget.style.borderColor = `${sc.color}55`; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.4)"; e.currentTarget.style.borderColor = `${sc.color}28`; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div className="h-[2px] rounded-full mb-3" style={{ background: `linear-gradient(90deg, ${sc.color}, transparent)` }} />
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
          style={{ background: `${sc.color}18`, border: `1px solid ${sc.color}35`, color: sc.color }}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[13px] truncate" style={{ color: "#e0e0e0" }}>{customer.full_name}</p>
          <p className="text-[10px] mono truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{customer.email}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.color, boxShadow: `0 0 4px ${sc.color}` }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: sc.color }}>{sc.label}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-center">
          <p className="text-[11px] font-black mono" style={{ color: "#00b4b4", fontFamily: "'JetBrains Mono',monospace" }}>{PLAN_SHORT[customer.service_plan] || "—"}</p>
          <p className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Speed</p>
        </div>
        <div className="text-center">
          <p className="text-[11px] font-black mono" style={{ color: "#10b981", fontFamily: "'JetBrains Mono',monospace" }}>R{customer.monthly_rate?.toFixed(0) || "—"}</p>
          <p className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>/ month</p>
        </div>
        <div className="text-center">
          <p className="text-[11px] font-black">{CONN_ICON[customer.connection_type] || "—"}</p>
          <p className="text-[9px] mt-0.5 capitalize" style={{ color: "rgba(255,255,255,0.3)" }}>{customer.connection_type || "—"}</p>
        </div>
      </div>
      <div className="mt-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <HealthScore customer={customer} />
      </div>
      {customer.account_number && (
        <p className="text-[9px] mono mt-1.5 text-right" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono',monospace" }}>{customer.account_number}</p>
      )}
    </div>
  );
}

// ── Row (table view) ─────────────────────────────────────────────────────────
function CustomerRow({ customer, onClick }) {
  const sc = STATUS_CFG[customer.status] || STATUS_CFG.pending;
  const initials = customer.full_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??";
  return (
    <div
      onClick={() => onClick(customer)}
      className="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-all group"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,180,180,0.04)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0"
        style={{ background: `${sc.color}18`, border: `1px solid ${sc.color}35`, color: sc.color }}>
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-[13px] truncate" style={{ color: "#e0e0e0" }}>{customer.full_name}</p>
        <p className="text-[11px] mono truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{customer.email}</p>
      </div>
      <p className="hidden md:block text-[11px] mono w-24 truncate flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono',monospace" }}>{customer.account_number || "—"}</p>
      <div className="hidden lg:flex items-center gap-1.5 w-32 flex-shrink-0">
        <Wifi className="w-3 h-3 flex-shrink-0" style={{ color: "#00b4b4" }} />
        <span className="text-[11px] truncate" style={{ color: "#00b4b4" }}>{PLAN_SHORT[customer.service_plan] || "—"}</span>
      </div>
      <div className="hidden xl:block w-24 flex-shrink-0">
        <span className="text-[12px]">{CONN_ICON[customer.connection_type] || ""} <span className="capitalize text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{customer.connection_type || "—"}</span></span>
      </div>
      <p className="hidden sm:block text-[13px] font-black mono w-20 text-right flex-shrink-0" style={{ color: "#10b981", fontFamily: "'JetBrains Mono',monospace" }}>
        R{customer.monthly_rate?.toFixed(0) || "0"}
      </p>
      <div className="flex-shrink-0">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider"
          style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.color }} />
          {sc.label}
        </span>
      </div>
      <ChevronDown className="w-4 h-4 -rotate-90 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "rgba(255,255,255,0.3)" }} />
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function Customers() {
  const { can, loading: rbacLoading, isAdmin } = useRBAC();
  const [showForm, setShowForm]           = useState(false);
  const [showImport, setShowImport]       = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [editing, setEditing]             = useState(null);
  const [selected, setSelected]           = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // customer to delete
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState("all");
  const [viewMode, setViewMode]           = useState("list");
  const queryClient = useQueryClient();

  // CSV export
  const handleExportCsv = () => {
    exportToCsv(filtered, [
      { key: "full_name",      label: "Name" },
      { key: "email",          label: "Email" },
      { key: "phone",          label: "Phone" },
      { key: "address",        label: "Address" },
      { key: "account_number", label: "Account Number" },
      { key: "status",         label: "Status" },
      { key: "service_plan",   label: "Plan" },
      { key: "monthly_rate",   label: "Monthly Rate" },
      { key: "connection_type",label: "Connection Type" },
    ], "customers");
    toast.success("Customers exported to CSV");
  };

  const { data: customers = [], isLoading, refetch } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list("-created_date"),
    enabled: !rbacLoading && can("customers"),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["customers"] }); setShowForm(false); toast.success("Customer created"); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setShowForm(false); setEditing(null);
      setSelected(null);
      toast.success("Customer updated");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Customer.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setSelected(null);
      toast.success("Customer deleted");
    },
  });

  const filtered = useMemo(() => customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || c.full_name?.toLowerCase().includes(q)
      || c.email?.toLowerCase().includes(q)
      || c.account_number?.toLowerCase().includes(q)
      || c.phone?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  }), [customers, search, statusFilter]);

  if (!rbacLoading && !can("customers")) return <AccessDenied />;

  const handleSubmit = (data) => {
    if (editing) updateMut.mutate({ id: editing.id, data });
    else createMut.mutate(data);
  };

  return (
    <div className="p-5 lg:p-8 space-y-6 max-w-[1600px] mx-auto">

      {/* ── Ticker ── */}
      <div className="relative overflow-hidden rounded-xl h-8 flex items-center"
        style={{ background: "rgba(0,180,180,0.04)", border: "1px solid rgba(0,180,180,0.12)" }}>
        <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg,#111111,transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg,#111111,transparent)" }} />
        <div className="ticker-track flex items-center gap-10 px-6 whitespace-nowrap">
          {["CUSTOMER MANAGEMENT","CONTRACT TRACKING","SLA COMPLIANCE","REVENUE ANALYTICS","FIBRE DEPLOYMENT","REAL-TIME BILLING",
            "CUSTOMER MANAGEMENT","CONTRACT TRACKING","SLA COMPLIANCE","REVENUE ANALYTICS","FIBRE DEPLOYMENT","REAL-TIME BILLING"
          ].map((t, i) => (
            <span key={i} className="text-[9px] font-black uppercase tracking-[0.2em] mono"
              style={{ color: i % 3 === 0 ? "#00b4b4" : i % 3 === 1 ? "rgba(0,180,180,0.4)" : "#e02347" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-5"
        style={{ background: "linear-gradient(135deg,#141414,#1a1a1a)", border: "1px solid rgba(0,180,180,0.28)", boxShadow: "0 4px 40px rgba(0,0,0,0.6), 0 0 40px rgba(0,180,180,0.04)" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.5),#00b4b4,#e02347,transparent)", animation: "border-rotate 5s ease infinite", backgroundSize: "300% auto" }} />
        <div className="absolute top-3 left-3 w-4 h-4 pointer-events-none" style={{ borderTop: "1.5px solid rgba(0,212,212,0.5)", borderLeft: "1.5px solid rgba(0,212,212,0.5)" }} />
        <div className="absolute top-3 right-3 w-4 h-4 pointer-events-none" style={{ borderTop: "1.5px solid rgba(224,35,71,0.4)", borderRight: "1.5px solid rgba(224,35,71,0.4)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(0,212,212,0.04) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <div className="absolute top-0 right-0 w-64 h-32 pointer-events-none" style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(0,180,180,0.1) 0%, transparent 60%)" }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,180,180,0.15)", border: "1px solid rgba(0,180,180,0.4)", boxShadow: "0 0 14px rgba(0,180,180,0.2)" }}>
                <Users className="w-4.5 h-4.5" style={{ color: "#00b4b4" }} />
              </div>
              <h1 className="text-xl font-black tracking-tight glow-text-navy" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Customer Management</h1>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10b981", boxShadow: "0 0 5px #10b981" }} />
                <LiveClock style={{ fontSize: 9, fontWeight: 800, color: "#10b981", letterSpacing: "0.1em" }} />
              </div>
            </div>
            <p className="text-[11px] mono pl-11" style={{ color: "rgba(255,255,255,0.35)" }}>
              {customers.length} subscribers · <span style={{ color: "#10b981" }}>{customers.filter(c=>c.status==="active").length} active</span> · <span style={{ color: "#e02347" }}>{customers.filter(c=>c.status==="suspended").length} suspended</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#b0b0b0" }}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button onClick={handleExportCsv} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981" }}>
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            {isAdmin && (
              <>
                <button onClick={() => setShowImport(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#b0b0b0" }}>
                  <Upload className="w-3.5 h-3.5" /> Import
                </button>
                <button onClick={() => setShowOnboarding(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
                  style={{ background: "rgba(0,180,180,0.1)", border: "1px solid rgba(0,180,180,0.25)", color: "#00b4b4" }}>
                  <Zap className="w-3.5 h-3.5" /> Onboard Client
                </button>
                <button onClick={() => { setEditing(null); setShowForm(true); }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 20px rgba(0,180,180,0.3)" }}>
                  <Plus className="w-4 h-4" /> Add Customer
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : (
        <KPIStrip customers={customers} />
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} />
          <input
            className="w-full pl-10 pr-4 py-2.5 text-[13px] outline-none transition-all rounded-xl"
            style={{ background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)", color: "#e0e0e0" }}
            placeholder="Search by name, email, account number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>✕</button>}
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(s => {
            const cfg = STATUS_CFG[s];
            const active = statusFilter === s;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all hover:scale-105"
                style={{
                  background: active ? (cfg ? cfg.bg : "rgba(0,180,180,0.12)") : "rgba(255,255,255,0.04)",
                  border: active ? `1px solid ${cfg ? cfg.border : "rgba(0,180,180,0.4)"}` : "1px solid rgba(255,255,255,0.08)",
                  color: active ? (cfg ? cfg.color : "#00b4b4") : "rgba(255,255,255,0.35)",
                }}>
                {s === "all" ? "All" : s}
                {s !== "all" && <span className="ml-1 opacity-50">({customers.filter(c => c.status === s).length})</span>}
              </button>
            );
          })}
        </div>

        {/* View toggle */}
        <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
          {[{ mode: "list", Ic: List }, { mode: "grid", Ic: LayoutGrid }].map(({ mode, Ic }) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className="px-3 py-2 transition-all"
              style={{
                background: viewMode === mode ? "linear-gradient(135deg,#00b4b4,#007a7a)" : "rgba(255,255,255,0.04)",
                color: viewMode === mode ? "#fff" : "rgba(255,255,255,0.35)",
              }}>
              <Ic className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: "rgba(0,180,180,0.1)", border: "1px solid rgba(0,180,180,0.2)" }}>
            <Users className="w-7 h-7" style={{ color: "#00b4b4" }} />
          </div>
          <p className="font-bold text-[13px]" style={{ color: "#f0f0f0" }}>No customers found</p>
          <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Try adjusting your search or filter</p>
          {isAdmin && (
            <button onClick={() => setShowOnboarding(true)}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white"
              style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 16px rgba(0,180,180,0.3)" }}>
              <Plus className="w-4 h-4" /> Onboard First Customer
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(c => (
            <CustomerCard key={c.id} customer={c} onClick={setSelected} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#181818", border: "1px solid rgba(0,212,212,0.15)", boxShadow: "0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,212,0.04)" }}>
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.4),#00b4b4,#e02347,transparent)" }} />
          <div className="flex items-center gap-4 px-5 py-2.5" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="w-9 flex-shrink-0" />
            <p className="flex-1 text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.3)" }}>Customer</p>
            <p className="hidden md:block w-24 text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.3)" }}>Account</p>
            <p className="hidden lg:block w-32 text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.3)" }}>Plan</p>
            <p className="hidden xl:block w-24 text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.3)" }}>Connect.</p>
            <p className="hidden sm:block w-20 text-right text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.3)" }}>Rate</p>
            <p className="w-24 text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.3)" }}>Status</p>
            <div className="w-4" />
          </div>
          {filtered.map(c => <CustomerRow key={c.id} customer={c} onClick={setSelected} />)}
          <div className="px-5 py-2.5" style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[11px] mono" style={{ color: "rgba(255,255,255,0.35)" }}>{filtered.length} of {customers.length} customers</p>
          </div>
        </div>
      )}

      {/* ── Modals / Panels ── */}
      {selected && (
        <CustomerDetailPanel
          customer={selected}
          isAdmin={isAdmin}
          onClose={() => setSelected(null)}
          onEdit={() => { setEditing(selected); setSelected(null); setShowForm(true); }}
          onDelete={() => { setConfirmDelete(selected); setSelected(null); }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title={`Delete ${confirmDelete.full_name}?`}
          message="This will permanently remove the customer and all associated data. This action cannot be undone."
          onConfirm={() => { deleteMut.mutate(confirmDelete.id); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {showOnboarding && (
        <OnboardingWizard
          onClose={() => setShowOnboarding(false)}
          onComplete={() => queryClient.invalidateQueries({ queryKey: ["customers"] })}
        />
      )}

      {showImport && <CustomerImport onClose={() => setShowImport(false)} />}

      {showForm && (
        <CustomerForm
          customer={editing}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}