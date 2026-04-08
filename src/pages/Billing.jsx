import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, Pencil, Trash2, Receipt, DollarSign, AlertCircle,
  CheckCircle2, FileText, RefreshCw, ChevronDown, ChevronUp, Zap,
  BarChart3, Clock, CalendarDays, CreditCard, ArrowUpRight, Sparkles,
  TrendingUp, Activity, Layers, CircleDollarSign
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import InvoiceForm from "../components/billing/InvoiceForm";
import BatchInvoiceGenerator from "../components/billing/BatchInvoiceGenerator";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";
import InvoicePDFModal from "@/components/billing/InvoicePDFModal";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CFG = {
  draft:     { color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)",  label: "Draft",     dot: "#94a3b8",  glow: "rgba(100,116,139,0.3)"  },
  sent:      { color: "#0ea5e9", bg: "rgba(14,165,233,0.08)",  border: "rgba(14,165,233,0.2)",   label: "Sent",      dot: "#38bdf8",  glow: "rgba(14,165,233,0.35)"  },
  paid:      { color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)",   label: "Paid",      dot: "#34d399",  glow: "rgba(16,185,129,0.35)"  },
  overdue:   { color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)",    label: "Overdue",   dot: "#f87171",  glow: "rgba(239,68,68,0.35)"   },
  cancelled: { color: "#94a3b8", bg: "rgba(148,163,184,0.06)", border: "rgba(148,163,184,0.15)", label: "Cancelled", dot: "#cbd5e1",  glow: "rgba(148,163,184,0.2)"  },
};
const STATUS_FILTERS = ["all", "paid", "sent", "overdue", "draft", "cancelled"];

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

// ── Prismatic KPI Card ─────────────────────────────────────────────────────────
function KPICard({ label, value, sub, icon: Icon, color, accent, chartData, chartKey, rank }) {
  return (
    <div className="relative overflow-hidden rounded-2xl group cursor-default transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "rgba(15,10,30,0.92)",
        border: `1px solid ${color}35`,
        boxShadow: `0 4px 32px ${color}20, inset 0 1px 0 rgba(196,181,253,0.06)`,
      }}>

      {/* Animated prismatic top bar */}
      <div className="h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, ${color}, ${accent || color}, #818cf8, transparent)` }} />

      {/* Corner rank number */}
      <div className="absolute top-3 right-3 font-black mono opacity-[0.07]"
        style={{ color, fontSize: 48, lineHeight: 1 }}>
        {rank}
      </div>

      {/* Ambient glow blob */}
      <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full pointer-events-none transition-all duration-500 group-hover:scale-150"
        style={{ background: `radial-gradient(circle, ${color}25, transparent 70%)` }} />

      <div className="relative px-5 pt-4 pb-1 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: "rgba(167,139,250,0.5)" }}>{label}</p>
          <p className="text-[30px] font-black mono leading-tight mt-0.5 tracking-tight" style={{ color }}>{value}</p>
          {sub && <p className="text-[11px] mt-0.5 font-semibold" style={{ color: "rgba(196,181,253,0.6)" }}>{sub}</p>}
        </div>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${color}25, ${color}10)`,
            border: `1px solid ${color}40`,
            boxShadow: `0 4px 20px ${color}30`,
          }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>

      {/* Sparkline */}
      {chartData && chartData.length > 1 && (
        <div className="px-2 pb-2 h-16 mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`kpi-grad-${chartKey}-${rank}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey={chartKey} stroke={color} strokeWidth={2}
                fill={`url(#kpi-grad-${chartKey}-${rank})`} dot={false} />
              <Tooltip
                contentStyle={{ background: "white", border: `1px solid ${color}25`, borderRadius: 8, fontSize: 10, padding: "4px 8px", boxShadow: `0 4px 16px ${color}15` }}
                formatter={(v) => [`R${Number(v).toFixed(0)}`, ""]}
                labelFormatter={() => ""}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ── Revenue Orb Breakdown ──────────────────────────────────────────────────────
function RevenueBreakdown({ invoices }) {
  const paid    = invoices.filter(i => i.status === "paid").reduce((a, i) => a + (i.total || 0), 0);
  const overdue = invoices.filter(i => i.status === "overdue").reduce((a, i) => a + (i.total || 0), 0);
  const pending = invoices.filter(i => ["sent", "draft"].includes(i.status)).reduce((a, i) => a + (i.total || 0), 0);
  const total   = paid + overdue + pending || 1;

  const segments = [
    { label: "Collected", value: paid,    color: "#10b981", pct: paid/total*100,    icon: CheckCircle2 },
    { label: "Pending",   value: pending, color: "#0ea5e9", pct: pending/total*100, icon: Clock },
    { label: "Overdue",   value: overdue, color: "#ef4444", pct: overdue/total*100, icon: AlertCircle },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl px-6 py-5"
      style={{
        background: "rgba(15,10,30,0.92)",
        border: "1px solid rgba(139,92,246,0.22)",
        boxShadow: "0 4px 32px rgba(139,92,246,0.15), inset 0 1px 0 rgba(196,181,253,0.06)",
      }}>
      {/* Top prismatic bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg,#10b981,#0ea5e9,#ef4444,#8b5cf6,transparent)", boxShadow: "0 0 10px rgba(139,92,246,0.4)" }} />

      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        {/* Left — title + bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
              <BarChart3 className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
            </div>
            <p className="text-[13px] font-black uppercase tracking-wider" style={{ color: "#c4b5fd" }}>Revenue Breakdown</p>
            <span className="text-[10px] font-black mono px-2 py-0.5 rounded-full"
              style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.28)" }}>
              R{(total).toLocaleString()} total
            </span>
          </div>

          {/* Segmented bar */}
          <div className="flex h-3.5 rounded-full overflow-hidden gap-px mb-4"
            style={{ background: "rgba(139,92,246,0.1)" }}>
            {segments.map(s => (
              <div key={s.label}
                className="transition-all duration-700 first:rounded-l-full last:rounded-r-full"
                style={{ width: `${s.pct}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}cc)`, minWidth: s.value > 0 ? 4 : 0, boxShadow: `0 0 8px ${s.color}80` }} />
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4">
            {segments.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background: `${s.color}18`, border: `1px solid ${s.color}35` }}>
                    <Icon className="w-3 h-3" style={{ color: s.color }} />
                  </div>
                  <span className="text-[12px] font-semibold" style={{ color: "#c4b5fd" }}>{s.label}</span>
                  <span className="text-[13px] font-black mono" style={{ color: s.color }}>R{s.value.toLocaleString()}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}25` }}>{s.pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — collection rate ring */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="8" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="url(#ring-grad)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(paid / total) * 201} 201`} />
              <defs>
                <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[14px] font-black mono" style={{ color: "#10b981" }}>{(paid/total*100).toFixed(0)}%</span>
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(167,139,250,0.55)" }}>Collected</p>
        </div>
      </div>
    </div>
  );
}

// ── Invoice Row ────────────────────────────────────────────────────────────────
function InvoiceRow({ inv, isAdmin, onPdf, onEdit, onDelete, onStatusChange, index }) {
  const [open, setOpen] = useState(false);
  const sc       = STATUS_CFG[inv.status] || STATUS_CFG.draft;
  const initials = inv.customer_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??";
  const isPaid   = inv.status === "paid";
  const isOver   = inv.status === "overdue";

  return (
    <div className="group" style={{ borderBottom: "1px solid rgba(139,92,246,0.08)" }}>
      {/* Row */}
      <div
        className="flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-all duration-150"
        onClick={() => setOpen(v => !v)}
        style={{ background: open ? `${sc.color}10` : "transparent" }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = "rgba(139,92,246,0.05)"; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = open ? `${sc.color}10` : "transparent"; }}
      >
        {/* Index + Avatar */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className="hidden lg:block w-6 text-[10px] font-black mono text-center"
            style={{ color: "rgba(167,139,250,0.35)" }}>{String(index + 1).padStart(2, "0")}</span>
          <div className="relative w-9 h-9 rounded-xl flex items-center justify-center font-black text-[11px]"
            style={{ background: `${sc.color}18`, border: `1px solid ${sc.color}35`, color: sc.color,
              boxShadow: open ? `0 0 16px ${sc.glow}` : "none" }}>
            {initials}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: sc.dot, borderColor: "#080b18" }} />
          </div>
        </div>

        {/* Invoice # */}
        <p className="hidden sm:block w-28 text-[11px] mono font-bold flex-shrink-0"
          style={{ color: "#a78bfa", letterSpacing: "0.03em" }}>
          {inv.invoice_number || "—"}
        </p>

        {/* Customer */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold truncate" style={{ color: "#e2d9f3" }}>{inv.customer_name}</p>
          {inv.description && (
            <p className="text-[10px] truncate hidden sm:block" style={{ color: "rgba(167,139,250,0.5)" }}>{inv.description}</p>
          )}
        </div>

        {/* Amount */}
        <p className="hidden sm:block w-28 text-right text-[15px] font-black mono flex-shrink-0"
          style={{ color: isPaid ? "#10b981" : isOver ? "#f87171" : "#e2d9f3" }}>
          R{(inv.total ?? inv.amount ?? 0).toFixed(2)}
        </p>

        {/* Status pill */}
        <div className="flex-shrink-0 w-24">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider"
            style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sc.dot }} />
            {sc.label}
          </span>
        </div>

        {/* Due */}
        <p className="hidden lg:block w-24 text-[11px] flex-shrink-0" style={{ color: "rgba(167,139,250,0.5)" }}>
          {inv.due_date ? format(new Date(inv.due_date), "dd MMM yy") : "—"}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150"
            onClick={e => e.stopPropagation()}>
            <button onClick={() => onPdf(inv)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
              style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.28)" }}>
              <FileText className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
            </button>
            {isAdmin && (
              <>
                <button onClick={() => onEdit(inv)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
                  <Pencil className="w-3.5 h-3.5" style={{ color: "#c4b5fd" }} />
                </button>
                <button onClick={() => onDelete(inv.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
                  <Trash2 className="w-3.5 h-3.5" style={{ color: "#f87171" }} />
                </button>
              </>
            )}
          </div>
          {open
            ? <ChevronUp  className="w-4 h-4 ml-1" style={{ color: sc.color }} />
            : <ChevronDown className="w-4 h-4 ml-1" style={{ color: "rgba(167,139,250,0.35)" }} />}
        </div>
      </div>

      {/* Expanded panel */}
      {open && (
        <div className="mx-3 mb-3 rounded-2xl overflow-hidden"
          style={{ background: `linear-gradient(135deg, rgba(15,10,30,0.95), rgba(8,5,20,0.9))`, border: `1px solid ${sc.color}30` }}>
          <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Subtotal",        value: `R${(inv.amount || 0).toFixed(2)}`,              icon: DollarSign   },
              { label: "VAT (15%)",       value: `R${(inv.tax || 0).toFixed(2)}`,                 icon: Receipt      },
              { label: "Total",           value: `R${(inv.total || inv.amount || 0).toFixed(2)}`, icon: CreditCard   },
              { label: "Payment Method",  value: inv.payment_method?.replace(/_/g, " ") || "—",   icon: Zap          },
              { label: "Billing Period",  value: inv.billing_period_start ? `${inv.billing_period_start} → ${inv.billing_period_end || "?"}` : "—", icon: CalendarDays },
              { label: "Due Date",        value: inv.due_date  ? format(new Date(inv.due_date),  "dd MMM yyyy") : "—", icon: Clock },
              { label: "Paid Date",       value: inv.paid_date ? format(new Date(inv.paid_date), "dd MMM yyyy") : "—", icon: CheckCircle2 },
              { label: "Sage Invoice ID", value: inv.sage_invoice_id || "Not synced",             icon: ArrowUpRight },
            ].map(item => (
              <div key={item.label} className="rounded-xl px-3 py-2.5 transition-all hover:scale-[1.02]"
                style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.18)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <item.icon className="w-3 h-3" style={{ color: sc.color }} />
                  <p className="text-[9px] uppercase tracking-wider font-black" style={{ color: "rgba(196,181,253,0.45)" }}>{item.label}</p>
                </div>
                <p className="text-[12px] font-bold capitalize truncate" style={{ color: "#e2d9f3" }}>{item.value}</p>
              </div>
            ))}
          </div>

          {isAdmin && !["paid", "cancelled"].includes(inv.status) && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              <p className="w-full text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "rgba(196,181,253,0.4)" }}>Quick Actions</p>
              {inv.status !== "paid" && (
                <button onClick={() => onStatusChange(inv.id, "paid")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid
                </button>
              )}
              {!["sent","paid"].includes(inv.status) && (
                <button onClick={() => onStatusChange(inv.id, "sent")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.3)", color: "#38bdf8" }}>
                  <Receipt className="w-3.5 h-3.5" /> Mark Sent
                </button>
              )}
              {inv.status !== "overdue" && (
                <button onClick={() => onStatusChange(inv.id, "overdue")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                  <AlertCircle className="w-3.5 h-3.5" /> Mark Overdue
                </button>
              )}
              <button onClick={() => onStatusChange(inv.id, "cancelled")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105 active:scale-95"
                style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", color: "rgba(167,139,250,0.7)" }}>
                Cancel Invoice
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
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

  if (!rbacLoading && !can("billing")) return <AccessDenied />;

  const handleSubmit = (data) => {
    if (editing) updateMut.mutate({ id: editing.id, data });
    else createMut.mutate(data);
  };

  const filteredTotal = filtered.reduce((a, i) => a + (i.total ?? i.amount ?? 0), 0);

  return (
    <div className="min-h-screen relative">

      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-0 right-0 w-[600px] h-[400px] opacity-30"
          style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.08) 0%, transparent 60%)" }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] opacity-30"
          style={{ background: "radial-gradient(ellipse at 20% 80%, rgba(16,185,129,0.07) 0%, transparent 60%)" }} />
      </div>

      <div className="relative z-10 p-5 lg:p-8 space-y-6 max-w-[1600px] mx-auto">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#7c3aed,#8b5cf6)", border: "1px solid rgba(139,92,246,0.4)", boxShadow: "0 4px 20px rgba(139,92,246,0.45)" }}>
                <CircleDollarSign className="w-4.5 h-4.5 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: "#f0e8ff", fontFamily: "'Space Grotesk', sans-serif" }}>
                Billing & Invoices
              </h1>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black mono" style={{ color: "#10b981" }}>LIVE</span>
              </div>
            </div>
            <p className="text-[11px] mono pl-12" style={{ color: "rgba(167,139,250,0.55)" }}>
              {invoices.length} invoices · {paidCount} paid · <span style={{ color: "#10b981", fontWeight: 700 }}>R{totalPaid.toLocaleString()}</span> collected
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => refetch()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105 active:scale-95"
              style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.28)", color: "#a78bfa" }}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            {isAdmin && (
              <button onClick={() => { setEditing(null); setShowForm(true); }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg,#7c3aed,#8b5cf6)", boxShadow: "0 4px 20px rgba(139,92,246,0.45)" }}>
                <Plus className="w-4 h-4" /> New Invoice
              </button>
            )}
          </div>
        </div>

        {/* ── KPI Cards ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard rank="01"
              label="Total Collected" value={`R${totalPaid.toLocaleString()}`}
              sub={`${paidCount} paid invoices`}
              icon={CheckCircle2} color="#10b981" accent="#06b6d4"
              chartData={chartData} chartKey="paid"
            />
            <KPICard rank="02"
              label="Overdue Balance" value={`R${totalOverdue.toLocaleString()}`}
              sub={overdueCount > 0 ? `${overdueCount} need attention` : "All clear ✓"}
              icon={AlertCircle} color={overdueCount > 0 ? "#ef4444" : "#10b981"} accent="#f97316"
              chartData={chartData} chartKey="overdue"
            />
            <KPICard rank="03"
              label="Pending Revenue" value={`R${totalPending.toLocaleString()}`}
              sub={`${invoices.filter(i => ["draft","sent"].includes(i.status)).length} awaiting`}
              icon={DollarSign} color="#f59e0b" accent="#f97316"
              chartData={chartData} chartKey="paid"
            />
          </div>
        )}

        {/* ── Revenue Breakdown ── */}
        {!isLoading && invoices.length > 0 && <RevenueBreakdown invoices={invoices} />}

        {/* ── Batch Generator ── */}
        {isAdmin && (
          <BatchInvoiceGenerator onInvoicesCreated={() => queryClient.invalidateQueries({ queryKey: ["invoices"] })} />
        )}

        {/* ── Search + Filter Bar ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
            <input
              className="w-full pl-10 pr-8 py-3 text-[13px] font-medium outline-none rounded-xl transition-all"
              style={{
                background: "rgba(139,92,246,0.07)",
                border: "1px solid rgba(139,92,246,0.25)",
                color: "#e8d5ff",
              }}
              placeholder="Search customer name or invoice number…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black px-1.5 py-0.5 rounded-lg transition-colors"
                style={{ color: "rgba(196,181,253,0.6)" }}>✕</button>
            )}
          </div>

          {/* Filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map(s => {
              const cfg    = STATUS_CFG[s];
              const active = statusFilter === s;
              const cnt    = s === "all" ? invoices.length : invoices.filter(i => i.status === s).length;
              return (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className="px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all hover:scale-105"
                  style={{
                    background: active ? (cfg ? cfg.bg : "rgba(139,92,246,0.15)") : "rgba(139,92,246,0.05)",
                    border: active ? `1px solid ${cfg ? cfg.border : "rgba(139,92,246,0.4)"}` : "1px solid rgba(139,92,246,0.12)",
                    color: active ? (cfg ? cfg.color : "#a78bfa") : "rgba(167,139,250,0.5)",
                    boxShadow: active ? `0 2px 12px ${cfg ? cfg.color + "30" : "rgba(139,92,246,0.2)"}` : "none",
                  }}>
                  {s === "all" ? "All" : s}
                  <span className="ml-1 font-normal opacity-60">({cnt})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Invoice Table ── */}
        <div className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(12,8,28,0.95)",
            border: "1px solid rgba(139,92,246,0.22)",
            boxShadow: "0 8px 40px rgba(139,92,246,0.15), inset 0 1px 0 rgba(196,181,253,0.06)",
          }}>

          {/* Prismatic header accent */}
          <div className="h-[2px]"
            style={{ background: "linear-gradient(90deg,#dc2626,#ef4444,#8b5cf6,#3b82f6,#06b6d4,transparent)", boxShadow: "0 0 12px rgba(139,92,246,0.5)" }} />

          {/* Column headers */}
          <div className="flex items-center gap-3 px-5 py-3"
            style={{ background: "rgba(139,92,246,0.07)", borderBottom: "1px solid rgba(139,92,246,0.12)" }}>
            <div className="hidden lg:block w-6 flex-shrink-0" />
            <div className="flex-shrink-0 w-9" />
            <p className="hidden sm:block w-28 text-[9px] font-black uppercase tracking-[0.2em] flex-shrink-0" style={{ color: "rgba(196,181,253,0.5)" }}>Invoice #</p>
            <p className="flex-1 text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(196,181,253,0.5)" }}>Customer</p>
            <p className="hidden sm:block w-28 text-right text-[9px] font-black uppercase tracking-[0.2em] flex-shrink-0" style={{ color: "rgba(196,181,253,0.5)" }}>Amount</p>
            <p className="w-24 text-[9px] font-black uppercase tracking-[0.2em] flex-shrink-0" style={{ color: "rgba(196,181,253,0.5)" }}>Status</p>
            <p className="hidden lg:block w-24 text-[9px] font-black uppercase tracking-[0.2em] flex-shrink-0" style={{ color: "rgba(196,181,253,0.5)" }}>Due Date</p>
            <div className="w-24 flex-shrink-0" />
          </div>

          {/* Rows */}
          {isLoading ? (
            <div className="p-5 space-y-2.5">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 8px 32px rgba(139,92,246,0.2)" }}>
                  <Receipt className="w-7 h-7" style={{ color: "#a78bfa" }} />
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4" style={{ color: "#a78bfa" }} />
              </div>
              <p className="font-bold text-[14px]" style={{ color: "#c4b5fd" }}>No invoices found</p>
              <p className="text-[12px] mt-1" style={{ color: "rgba(167,139,250,0.5)" }}>Adjust search or filter to see results</p>
              {isAdmin && (
                <button onClick={() => { setEditing(null); setShowForm(true); }}
                  className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#8b5cf6)", boxShadow: "0 4px 20px rgba(139,92,246,0.45)" }}>
                  <Plus className="w-4 h-4" /> Create First Invoice
                </button>
              )}
            </div>
          ) : (
            filtered.map((inv, idx) => (
              <InvoiceRow
                key={inv.id}
                inv={inv}
                index={idx}
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
            <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-2"
              style={{ background: "rgba(139,92,246,0.06)", borderTop: "1px solid rgba(139,92,246,0.12)" }}>
              <div className="flex items-center gap-3">
                <p className="text-[11px] mono" style={{ color: "rgba(167,139,250,0.55)" }}>
                  Showing <span className="font-bold" style={{ color: "#a78bfa" }}>{filtered.length}</span> of {invoices.length} invoices
                </p>
                {statusFilter !== "all" && (
                  <button onClick={() => setStatusFilter("all")}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all hover:scale-105"
                    style={{ color: "#a78bfa", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.28)" }}>
                    Clear filter ✕
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px]" style={{ color: "rgba(167,139,250,0.55)" }}>Subtotal</span>
                <span className="text-[14px] font-black mono" style={{ color: "#10b981" }}>R{filteredTotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
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