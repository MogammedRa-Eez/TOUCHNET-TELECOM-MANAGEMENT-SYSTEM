import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, Pencil, Trash2, Receipt, DollarSign, AlertCircle,
  CheckCircle2, FileText, RefreshCw, TrendingUp, TrendingDown,
  ChevronDown, ChevronUp, Zap, BarChart3, Clock, CalendarDays,
  CreditCard, Filter, Download, ArrowUpRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isAfter, parseISO } from "date-fns";
import InvoiceForm from "../components/billing/InvoiceForm";
import BatchInvoiceGenerator from "../components/billing/BatchInvoiceGenerator";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";
import InvoicePDFModal from "@/components/billing/InvoicePDFModal";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const STATUS_CFG = {
  draft:     { color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)",  label: "Draft",     dot: "#94a3b8" },
  sent:      { color: "#0ea5e9", bg: "rgba(14,165,233,0.08)",  border: "rgba(14,165,233,0.2)",   label: "Sent",      dot: "#38bdf8" },
  paid:      { color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)",   label: "Paid",      dot: "#34d399" },
  overdue:   { color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)",    label: "Overdue",   dot: "#f87171" },
  cancelled: { color: "#94a3b8", bg: "rgba(148,163,184,0.06)", border: "rgba(148,163,184,0.15)", label: "Cancelled", dot: "#cbd5e1" },
};

const STATUS_FILTERS = ["all", "paid", "sent", "overdue", "draft", "cancelled"];

// ── Build monthly revenue chart data ─────────────────────────────────────────
function buildChartData(invoices) {
  const months = {};
  invoices.forEach(inv => {
    if (!inv.created_date) return;
    const key = inv.created_date.slice(0, 7);
    if (!months[key]) months[key] = { month: key, paid: 0, overdue: 0 };
    if (inv.status === "paid")    months[key].paid    += inv.total || 0;
    if (inv.status === "overdue") months[key].overdue += inv.total || 0;
  });
  return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
}

// ── KPI Hero Card ─────────────────────────────────────────────────────────────
function KPIHero({ label, value, sub, icon: Icon, color, accent, chartData, chartKey }) {
  return (
    <div className="relative overflow-hidden rounded-2xl flex flex-col"
      style={{
        background: "#ffffff",
        border: `1px solid ${color}20`,
        boxShadow: `0 4px 24px ${color}10, 0 1px 0 rgba(255,255,255,1) inset`,
      }}>
      {/* Top accent bar */}
      <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${color}, ${accent || color}88, transparent)` }} />

      {/* Ambient circle */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}12, transparent 70%)` }} />

      <div className="px-5 pt-4 pb-2 flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(100,116,139,0.5)" }}>{label}</p>
          <p className="text-[28px] font-black mono leading-tight mt-0.5" style={{ color }}>{value}</p>
          {sub && <p className="text-[11px] mt-1" style={{ color: "rgba(100,116,139,0.6)" }}>{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `linear-gradient(135deg, ${color}18, ${color}08)`, border: `1px solid ${color}25` }}>
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
      </div>

      {/* Mini sparkline */}
      {chartData && chartData.length > 1 && (
        <div className="px-2 pb-2 h-14">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${chartKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey={chartKey} stroke={color} strokeWidth={1.5}
                fill={`url(#grad-${chartKey})`} dot={false} />
              <Tooltip
                contentStyle={{ background: "white", border: `1px solid ${color}30`, borderRadius: 8, fontSize: 10, padding: "4px 8px" }}
                formatter={(v) => [`R${v.toFixed(0)}`, ""]}
                labelFormatter={() => ""}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ── Revenue breakdown bar ─────────────────────────────────────────────────────
function RevenueBar({ invoices }) {
  const paid      = invoices.filter(i => i.status === "paid").reduce((a, i) => a + (i.total || 0), 0);
  const overdue   = invoices.filter(i => i.status === "overdue").reduce((a, i) => a + (i.total || 0), 0);
  const pending   = invoices.filter(i => ["sent","draft"].includes(i.status)).reduce((a, i) => a + (i.total || 0), 0);
  const total     = paid + overdue + pending || 1;
  const segments  = [
    { label: "Collected", value: paid,    color: "#10b981", pct: (paid/total*100).toFixed(1) },
    { label: "Pending",   value: pending, color: "#0ea5e9", pct: (pending/total*100).toFixed(1) },
    { label: "Overdue",   value: overdue, color: "#ef4444", pct: (overdue/total*100).toFixed(1) },
  ];
  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: "#ffffff", border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 2px 16px rgba(99,102,241,0.06)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" style={{ color: "#6366f1" }} />
          <p className="text-[12px] font-black uppercase tracking-wider" style={{ color: "#334155" }}>Revenue Breakdown</p>
        </div>
        <p className="text-[11px] mono font-bold" style={{ color: "#6366f1" }}>R{(paid+overdue+pending).toLocaleString()} total</p>
      </div>
      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-3">
        {segments.map(s => (
          <div key={s.label} className="transition-all duration-700 rounded-sm"
            style={{ width: `${s.pct}%`, background: s.color, minWidth: s.value > 0 ? 4 : 0 }} />
        ))}
      </div>
      <div className="flex gap-4 flex-wrap">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            <span className="text-[11px] font-semibold" style={{ color: "#64748b" }}>{s.label}</span>
            <span className="text-[11px] font-black mono" style={{ color: s.color }}>R{s.value.toLocaleString()}</span>
            <span className="text-[10px]" style={{ color: "rgba(100,116,139,0.5)" }}>({s.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Expandable Invoice Row ────────────────────────────────────────────────────
function InvoiceRow({ inv, isAdmin, onPdf, onEdit, onDelete, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const sc = STATUS_CFG[inv.status] || STATUS_CFG.draft;
  const initials = inv.customer_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??";
  const isOverdue = inv.status === "overdue";
  const isPaid    = inv.status === "paid";

  return (
    <div style={{ borderBottom: "1px solid rgba(99,102,241,0.05)" }}>
      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-3 transition-all cursor-pointer group"
        onClick={() => setOpen(v => !v)}
        onMouseEnter={e => { e.currentTarget.style.background = `${sc.color}04`; }}
        onMouseLeave={e => { e.currentTarget.style.background = open ? `${sc.color}04` : "transparent"; }}
        style={{ background: open ? `${sc.color}04` : "transparent" }}
      >
        {/* Status dot / avatar */}
        <div className="relative w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[11px] flex-shrink-0"
          style={{ background: `${sc.color}10`, border: `1px solid ${sc.color}25`, color: sc.color }}>
          {initials}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
            style={{ background: sc.dot }} />
        </div>

        {/* Invoice # */}
        <p className="hidden sm:block w-28 text-[11px] mono flex-shrink-0 font-semibold" style={{ color: "#818cf8" }}>
          {inv.invoice_number || "—"}
        </p>

        {/* Customer */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 truncate">{inv.customer_name}</p>
          {inv.description && (
            <p className="text-[10px] text-slate-400 truncate hidden sm:block">{inv.description}</p>
          )}
        </div>

        {/* Amount */}
        <p className="hidden sm:block w-24 text-right text-[14px] font-black mono flex-shrink-0"
          style={{ color: isPaid ? "#10b981" : isOverdue ? "#ef4444" : "#0f172a" }}>
          R{(inv.total ?? inv.amount ?? 0).toFixed(2)}
        </p>

        {/* Status badge */}
        <div className="flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider"
            style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
            {sc.label}
          </span>
        </div>

        {/* Due date */}
        <p className="hidden lg:block w-24 text-[11px] text-slate-400 flex-shrink-0">
          {inv.due_date ? format(new Date(inv.due_date), "dd MMM yy") : "—"}
        </p>

        {/* Expand + actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <button onClick={() => onPdf(inv)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-indigo-50 transition-colors" title="PDF">
              <FileText className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />
            </button>
            {isAdmin && (
              <>
                <button onClick={() => onEdit(inv)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors">
                  <Pencil className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button onClick={() => onDelete(inv.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </>
            )}
          </div>
          {open
            ? <ChevronUp className="w-4 h-4 ml-1 flex-shrink-0" style={{ color: "#94a3b8" }} />
            : <ChevronDown className="w-4 h-4 ml-1 flex-shrink-0" style={{ color: "#cbd5e1" }} />}
        </div>
      </div>

      {/* Expanded detail panel */}
      {open && (
        <div className="px-5 pb-4 pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3"
          style={{ background: `${sc.color}03`, borderTop: `1px solid ${sc.color}10` }}>
          {[
            { label: "Subtotal",        value: `R${(inv.amount || 0).toFixed(2)}`,               icon: DollarSign },
            { label: "VAT (15%)",       value: `R${(inv.tax || 0).toFixed(2)}`,                  icon: Receipt },
            { label: "Total",           value: `R${(inv.total || inv.amount || 0).toFixed(2)}`,   icon: CreditCard },
            { label: "Payment Method",  value: inv.payment_method?.replace(/_/g, " ") || "—",    icon: Zap },
            { label: "Billing Period",  value: inv.billing_period_start ? `${inv.billing_period_start} → ${inv.billing_period_end || "?"}` : "—", icon: CalendarDays },
            { label: "Due Date",        value: inv.due_date ? format(new Date(inv.due_date), "dd MMM yyyy") : "—",   icon: Clock },
            { label: "Paid Date",       value: inv.paid_date ? format(new Date(inv.paid_date), "dd MMM yyyy") : "—", icon: CheckCircle2 },
            { label: "Sage Invoice ID", value: inv.sage_invoice_id || "Not synced",              icon: ArrowUpRight },
          ].map(item => (
            <div key={item.label} className="rounded-xl px-3 py-2.5"
              style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(99,102,241,0.08)" }}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <item.icon className="w-3 h-3" style={{ color: sc.color }} />
                <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: "rgba(100,116,139,0.5)" }}>{item.label}</p>
              </div>
              <p className="text-[12px] font-bold text-slate-700 capitalize truncate">{item.value}</p>
            </div>
          ))}

          {/* Quick status change for admins */}
          {isAdmin && !["paid", "cancelled"].includes(inv.status) && (
            <div className="col-span-2 sm:col-span-4 flex flex-wrap gap-2 pt-1">
              <p className="w-full text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(100,116,139,0.5)" }}>Quick Actions</p>
              {inv.status !== "paid" && (
                <button onClick={() => onStatusChange(inv.id, "paid")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981" }}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid
                </button>
              )}
              {inv.status !== "sent" && inv.status !== "paid" && (
                <button onClick={() => onStatusChange(inv.id, "sent")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
                  style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.25)", color: "#0ea5e9" }}>
                  <Receipt className="w-3.5 h-3.5" /> Mark Sent
                </button>
              )}
              {inv.status !== "overdue" && (
                <button onClick={() => onStatusChange(inv.id, "overdue")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                  <AlertCircle className="w-3.5 h-3.5" /> Mark Overdue
                </button>
              )}
              <button onClick={() => onStatusChange(inv.id, "cancelled")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
                style={{ background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.2)", color: "#94a3b8" }}>
                Cancel Invoice
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Billing() {
  const { can, loading: rbacLoading, isAdmin } = useRBAC();
  const [showForm,     setShowForm]     = useState(false);
  const [editing,      setEditing]      = useState(null);
  const [pdfInvoice,   setPdfInvoice]   = useState(null);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading, refetch } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => base44.entities.Invoice.list("-created_date"),
    enabled: !rbacLoading && can("billing"),
  });
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list(),
    enabled: !rbacLoading && can("billing"),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Invoice.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["invoices"] }); setShowForm(false); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Invoice.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["invoices"] }); setShowForm(false); setEditing(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Invoice.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });
  const statusMut = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Invoice.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });

  if (!rbacLoading && !can("billing")) return <AccessDenied />;

  const handleSubmit = (data) => {
    if (editing) updateMut.mutate({ id: editing.id, data });
    else createMut.mutate(data);
  };

  const totalPaid    = invoices.filter(i => i.status === "paid").reduce((a, i) => a + (i.total || 0), 0);
  const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((a, i) => a + (i.total || 0), 0);
  const totalPending = invoices.filter(i => ["draft","sent"].includes(i.status)).reduce((a, i) => a + (i.total || 0), 0);
  const paidCount    = invoices.filter(i => i.status === "paid").length;
  const overdueCount = invoices.filter(i => i.status === "overdue").length;
  const chartData    = useMemo(() => buildChartData(invoices), [invoices]);

  const filtered = useMemo(() => invoices.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = !search || i.customer_name?.toLowerCase().includes(q) || i.invoice_number?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    return matchSearch && matchStatus;
  }), [invoices, search, statusFilter]);

  const filteredTotal = filtered.reduce((a, i) => a + (i.total ?? i.amount ?? 0), 0);

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-[1600px] mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "#0f172a" }}>Billing & Invoices</h1>
          <p className="text-[11px] mt-0.5 mono" style={{ color: "rgba(100,116,139,0.6)" }}>
            {invoices.length} invoices · {paidCount} paid · R{totalPaid.toLocaleString()} collected
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)", color: "#6366f1" }}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          {isAdmin && (
            <button onClick={() => { setEditing(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}>
              <Plus className="w-4 h-4" /> Create Invoice
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Row ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPIHero
            label="Total Collected" value={`R${totalPaid.toLocaleString()}`}
            sub={`${paidCount} paid invoices`}
            icon={CheckCircle2} color="#10b981" accent="#06b6d4"
            chartData={chartData} chartKey="paid"
          />
          <KPIHero
            label="Overdue Balance" value={`R${totalOverdue.toLocaleString()}`}
            sub={overdueCount > 0 ? `${overdueCount} invoices need attention` : "All clear ✓"}
            icon={AlertCircle} color={overdueCount > 0 ? "#ef4444" : "#10b981"} accent="#f97316"
            chartData={chartData} chartKey="overdue"
          />
          <KPIHero
            label="Pending Revenue" value={`R${totalPending.toLocaleString()}`}
            sub={`${invoices.filter(i=>["draft","sent"].includes(i.status)).length} awaiting payment`}
            icon={DollarSign} color="#f59e0b" accent="#f97316"
            chartData={chartData} chartKey="paid"
          />
        </div>
      )}

      {/* ── Revenue Breakdown ── */}
      {!isLoading && invoices.length > 0 && <RevenueBar invoices={invoices} />}

      {/* ── Batch Generator ── */}
      {isAdmin && (
        <BatchInvoiceGenerator onInvoicesCreated={() => queryClient.invalidateQueries({ queryKey: ["invoices"] })} />
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-10 pr-8 py-2.5 text-[13px] outline-none rounded-xl transition-all"
            style={{
              background: "rgba(255,255,255,0.95)",
              border: "1px solid rgba(99,102,241,0.15)",
              color: "#1e293b",
              boxShadow: "0 1px 4px rgba(99,102,241,0.06)",
            }}
            placeholder="Search customer or invoice number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(s => {
            const cfg    = STATUS_CFG[s];
            const active = statusFilter === s;
            const cnt    = s === "all" ? invoices.length : invoices.filter(i => i.status === s).length;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all hover:scale-105"
                style={{
                  background: active ? (cfg ? cfg.bg : "rgba(99,102,241,0.1)") : "rgba(255,255,255,0.9)",
                  border: active ? `1px solid ${cfg ? cfg.border : "rgba(99,102,241,0.3)"}` : "1px solid rgba(99,102,241,0.1)",
                  color: active ? (cfg ? cfg.color : "#6366f1") : "#94a3b8",
                  boxShadow: active ? `0 2px 12px ${cfg ? cfg.color + "18" : "rgba(99,102,241,0.12)"}` : "none",
                }}>
                {s === "all" ? "All" : s}
                <span className="ml-1 opacity-50 font-normal">({cnt})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Invoice Table ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(99,102,241,0.1)",
          boxShadow: "0 4px 24px rgba(99,102,241,0.07), 0 1px 0 rgba(255,255,255,1) inset",
        }}>

        {/* Accent top line */}
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#6366f1,#06b6d4,#8b5cf6,transparent)" }} />

        {/* Column headers */}
        <div className="flex items-center gap-3 px-4 py-2.5"
          style={{ background: "linear-gradient(180deg,#f8f9ff,#f1f5ff)", borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
          <div className="w-9 flex-shrink-0" />
          <p className="hidden sm:block w-28 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 flex-shrink-0">Invoice #</p>
          <p className="flex-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Customer</p>
          <p className="hidden sm:block w-24 text-right text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 flex-shrink-0">Amount</p>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 flex-shrink-0">Status</p>
          <p className="hidden lg:block w-24 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 flex-shrink-0">Due</p>
          <div className="w-24 flex-shrink-0" />
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-13 w-full rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(99,102,241,0.04))", border: "1px solid rgba(99,102,241,0.12)" }}>
              <Receipt className="w-6 h-6" style={{ color: "#6366f1" }} />
            </div>
            <p className="font-bold text-slate-500 text-[13px]">No invoices found</p>
            <p className="text-[11px] text-slate-400 mt-1">Try adjusting your search or filter</p>
            {isAdmin && (
              <button onClick={() => { setEditing(null); setShowForm(true); }}
                className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                <Plus className="w-3.5 h-3.5" /> Create First Invoice
              </button>
            )}
          </div>
        ) : (
          filtered.map(inv => (
            <InvoiceRow
              key={inv.id}
              inv={inv}
              isAdmin={isAdmin}
              onPdf={setPdfInvoice}
              onEdit={(inv) => { setEditing(inv); setShowForm(true); }}
              onDelete={(id) => { if (confirm("Delete this invoice?")) deleteMut.mutate(id); }}
              onStatusChange={(id, status) => statusMut.mutate({ id, status })}
            />
          ))
        )}

        {/* Footer */}
        {!isLoading && filtered.length > 0 && (
          <div className="px-4 py-2.5 flex items-center justify-between flex-wrap gap-2"
            style={{ background: "linear-gradient(180deg,#f8f9ff,#f1f5ff)", borderTop: "1px solid rgba(99,102,241,0.07)" }}>
            <div className="flex items-center gap-3">
              <p className="text-[11px] mono" style={{ color: "rgba(100,116,139,0.55)" }}>
                {filtered.length} of {invoices.length} invoices shown
              </p>
              {statusFilter !== "all" && (
                <button onClick={() => setStatusFilter("all")}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                  style={{ color: "#6366f1", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                  Clear filter
                </button>
              )}
            </div>
            <p className="text-[12px] mono font-black" style={{ color: "#10b981" }}>
              Subtotal: R{filteredTotal.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {pdfInvoice && (
        <InvoicePDFModal
          invoice={pdfInvoice}
          customer={customers.find(c => c.id === pdfInvoice.customer_id)}
          onClose={() => setPdfInvoice(null)}
        />
      )}
      {showForm && (
        <InvoiceForm
          invoice={editing}
          customers={customers}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}