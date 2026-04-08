import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Upload, Users, Wifi, DollarSign, AlertTriangle,
         LayoutGrid, List, TrendingUp, Zap, Activity, ChevronDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import CustomerForm from "../components/customers/CustomerForm";
import CustomerImport from "../components/customers/CustomerImport";
import OnboardingWizard from "../components/customers/OnboardingWizard";
import CustomerDetailPanel from "../components/customers/CustomerDetailPanel";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";

const STATUS_CFG = {
  active:     { color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)",  dot: "#10b981", label: "Active" },
  pending:    { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)",  dot: "#f59e0b", label: "Pending" },
  suspended:  { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)",   dot: "#ef4444", label: "Suspended" },
  terminated: { color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.25)",dot: "#64748b", label: "Terminated" },
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
        { label: "Total Customers", value: total,                              icon: Users,       color: "#6366f1" },
        { label: "Active",          value: active,                             icon: Activity,    color: "#10b981" },
        { label: "Suspended",       value: suspended,                          icon: AlertTriangle,color: "#ef4444" },
        { label: "Monthly Revenue", value: `R${(mrr/1000).toFixed(1)}k`,      icon: DollarSign,  color: "#06b6d4" },
      ].map(k => (
        <div key={k.label} className="relative overflow-hidden rounded-2xl px-5 py-4"
          style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 2px 16px rgba(99,102,241,0.06)" }}>
          {/* top accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${k.color}, transparent)` }} />
          {/* ambient glow */}
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${k.color}15, transparent 70%)` }} />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(100,116,139,0.6)" }}>{k.label}</p>
              <p className="text-3xl font-black mono" style={{ color: k.color }}>{k.value}</p>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.color}12`, border: `1px solid ${k.color}25` }}>
              <k.icon className="w-4 h-4" style={{ color: k.color }} />
            </div>
          </div>
        </div>
      ))}
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
      className="rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group"
      style={{
        background: "rgba(255,255,255,0.97)",
        border: "1px solid rgba(99,102,241,0.1)",
        boxShadow: "0 2px 12px rgba(99,102,241,0.05)",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 32px ${sc.color}18, 0 2px 12px rgba(99,102,241,0.08)`; e.currentTarget.style.borderColor = `${sc.color}40`; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(99,102,241,0.05)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.1)"; }}
    >
      {/* Status top bar */}
      <div className="h-[2px] rounded-full mb-3" style={{ background: `linear-gradient(90deg, ${sc.color}, transparent)` }} />

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
          style={{ background: `${sc.color}15`, border: `1px solid ${sc.color}30`, color: sc.color }}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-800 text-[13px] truncate">{customer.full_name}</p>
          <p className="text-[10px] mono text-slate-400 truncate">{customer.email}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.color, boxShadow: `0 0 4px ${sc.color}` }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: sc.color }}>{sc.label}</span>
          </div>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3" style={{ borderTop: "1px solid rgba(99,102,241,0.07)" }}>
        <div className="text-center">
          <p className="text-[11px] font-black mono text-indigo-600">{PLAN_SHORT[customer.service_plan] || "—"}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Speed</p>
        </div>
        <div className="text-center">
          <p className="text-[11px] font-black mono" style={{ color: "#06b6d4" }}>R{customer.monthly_rate?.toFixed(0) || "—"}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">/ month</p>
        </div>
        <div className="text-center">
          <p className="text-[11px] font-black">{CONN_ICON[customer.connection_type] || "—"}</p>
          <p className="text-[9px] text-slate-400 mt-0.5 capitalize">{customer.connection_type || "—"}</p>
        </div>
      </div>

      {customer.account_number && (
        <p className="text-[9px] mono text-slate-300 mt-2 text-right">{customer.account_number}</p>
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
      style={{ borderBottom: "1px solid rgba(99,102,241,0.06)" }}
      onMouseEnter={e => { e.currentTarget.style.background = `${sc.color}06`; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0"
        style={{ background: `${sc.color}12`, border: `1px solid ${sc.color}25`, color: sc.color }}>
        {initials}
      </div>

      {/* Name + email */}
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-800 text-[13px] truncate">{customer.full_name}</p>
        <p className="text-[11px] text-slate-400 mono truncate">{customer.email}</p>
      </div>

      {/* Account */}
      <p className="hidden md:block text-[11px] mono text-slate-400 w-24 truncate flex-shrink-0">{customer.account_number || "—"}</p>

      {/* Plan */}
      <div className="hidden lg:flex items-center gap-1.5 w-32 flex-shrink-0">
        <Wifi className="w-3 h-3 text-indigo-400 flex-shrink-0" />
        <span className="text-[11px] text-slate-600 truncate">{PLAN_SHORT[customer.service_plan] || "—"}</span>
      </div>

      {/* Connection */}
      <div className="hidden xl:block w-24 flex-shrink-0">
        <span className="text-[12px]">{CONN_ICON[customer.connection_type] || ""} <span className="text-slate-500 capitalize text-[11px]">{customer.connection_type || "—"}</span></span>
      </div>

      {/* Rate */}
      <p className="hidden sm:block text-[13px] font-black mono w-20 text-right flex-shrink-0" style={{ color: "#06b6d4" }}>
        R{customer.monthly_rate?.toFixed(0) || "0"}
      </p>

      {/* Status */}
      <div className="flex-shrink-0">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider"
          style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.color }} />
          {sc.label}
        </span>
      </div>

      {/* Arrow */}
      <ChevronDown className="w-4 h-4 -rotate-90 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#94a3b8" }} />
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
  const [selected, setSelected]           = useState(null);   // detail panel
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState("all");
  const [viewMode, setViewMode]           = useState("list"); // "list" | "grid"
  const queryClient = useQueryClient();

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

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "#1e293b" }}>Customer Management</h1>
          <p className="text-[11px] mt-0.5 mono" style={{ color: "rgba(100,116,139,0.55)" }}>
            {customers.length} subscribers · {customers.filter(c=>c.status==="active").length} active
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
            style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)", color: "#6366f1" }}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => setShowImport(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
                style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", color: "#6366f1" }}>
                <Upload className="w-3.5 h-3.5" /> Import
              </button>
              <button
                onClick={() => setShowOnboarding(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
                style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4" }}>
                <Zap className="w-3.5 h-3.5" /> Onboard Client
              </button>
              <button
                onClick={() => { setEditing(null); setShowForm(true); }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[12px] font-bold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
                <Plus className="w-4 h-4" /> Add Customer
              </button>
            </>
          )}
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-2.5 text-[13px] outline-none transition-all rounded-xl"
            style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(99,102,241,0.15)", color: "#1e293b" }}
            placeholder="Search by name, email, account number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(s => {
            const cfg = STATUS_CFG[s];
            const active = statusFilter === s;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all"
                style={{
                  background: active ? (cfg ? cfg.bg : "rgba(99,102,241,0.12)") : "rgba(255,255,255,0.8)",
                  border: active ? `1px solid ${cfg ? cfg.border : "rgba(99,102,241,0.35)"}` : "1px solid rgba(99,102,241,0.1)",
                  color: active ? (cfg ? cfg.color : "#6366f1") : "#94a3b8",
                  boxShadow: active ? `0 0 12px ${cfg ? cfg.color + "20" : "rgba(99,102,241,0.1)"}` : "none",
                }}>
                {cfg && active && <span className="w-1.5 h-1.5 rounded-full inline-block mr-1" style={{ background: cfg.color }} />}
                {s === "all" ? "All" : s}
                {s !== "all" && (
                  <span className="ml-1 opacity-60">({customers.filter(c => c.status === s).length})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(99,102,241,0.15)" }}>
          {[{ mode: "list", Icon: List }, { mode: "grid", Icon: LayoutGrid }].map(({ mode, Icon }) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className="px-3 py-2 transition-all"
              style={{
                background: viewMode === mode ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.8)",
                color: viewMode === mode ? "#6366f1" : "#94a3b8",
              }}>
              <Icon className="w-4 h-4" />
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
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(99,102,241,0.1)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
            <Users className="w-7 h-7" style={{ color: "#6366f1" }} />
          </div>
          <p className="text-slate-500 font-semibold text-sm">No customers found</p>
          <p className="text-slate-400 text-xs mt-1">Try adjusting your search or filter</p>
          {isAdmin && (
            <button onClick={() => setShowOnboarding(true)}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
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
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 2px 16px rgba(99,102,241,0.06)" }}>
          {/* List header */}
          <div className="flex items-center gap-4 px-5 py-2.5" style={{ background: "#f8f9ff", borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
            <div className="w-9 flex-shrink-0" />
            <p className="flex-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Customer</p>
            <p className="hidden md:block w-24 text-[10px] font-bold uppercase tracking-widest text-slate-400">Account</p>
            <p className="hidden lg:block w-32 text-[10px] font-bold uppercase tracking-widest text-slate-400">Plan</p>
            <p className="hidden xl:block w-24 text-[10px] font-bold uppercase tracking-widest text-slate-400">Connect.</p>
            <p className="hidden sm:block w-20 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Rate</p>
            <p className="w-24 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</p>
            <div className="w-4" />
          </div>
          {filtered.map(c => (
            <CustomerRow key={c.id} customer={c} onClick={setSelected} />
          ))}
          <div className="px-5 py-2.5" style={{ background: "#f8f9ff", borderTop: "1px solid rgba(99,102,241,0.06)" }}>
            <p className="text-[11px] mono" style={{ color: "rgba(100,116,139,0.5)" }}>
              {filtered.length} of {customers.length} customers
            </p>
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
          onDelete={() => { if (confirm(`Delete ${selected.full_name}?`)) deleteMut.mutate(selected.id); }}
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