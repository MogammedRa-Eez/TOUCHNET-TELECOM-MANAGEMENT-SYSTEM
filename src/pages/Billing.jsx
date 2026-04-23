import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, Pencil, Trash2, Receipt, DollarSign, AlertCircle,
  CheckCircle2, FileText, RefreshCw, ChevronDown, ChevronUp, Zap,
  BarChart3, Clock, CalendarDays, CreditCard, ArrowUpRight, Sparkles,
  TrendingUp, Activity, Layers, CircleDollarSign, Download, Cpu
} from "lucide-react";
import LiveClock from "@/components/shared/LiveClock";
import { exportToCsv } from "@/utils/exportCsv";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import InvoiceForm from "../components/billing/InvoiceForm";
import BatchInvoiceGenerator from "../components/billing/BatchInvoiceGenerator";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";
import InvoicePDFModal from "@/components/billing/InvoicePDFModal";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import jsPDF from "jspdf";

const STATUS_CFG = {
  draft:     { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.25)", label: "Draft",     dot: "#94a3b8" },
  sent:      { color: "#22d3ee", bg: "rgba(34,211,238,0.12)",  border: "rgba(34,211,238,0.25)", label: "Sent",      dot: "#22d3ee" },
  paid:      { color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)", label: "Paid",      dot: "#34d399" },
  overdue:   { color: "#e02347", bg: "rgba(224,35,71,0.12)",   border: "rgba(224,35,71,0.25)",  label: "Overdue",   dot: "#ff3358" },
  cancelled: { color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)", label: "Cancelled", dot: "#64748b" },
};
const STATUS_FILTERS = ["all", "paid", "sent", "overdue", "draft", "cancelled"];
const PAGE_SIZE = 20;

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

function KPICard({ label, value, sub, icon: Icon, color, chartData, chartKey, rank }) {
  return (
    <div className="relative overflow-hidden rounded-2xl group cursor-default transition-all duration-300 hover:-translate-y-1 holo-card"
      style={{ background: "#181818", border: `1px solid ${color}30`, boxShadow: `0 4px 24px rgba(0,0,0,0.5)` }}>
      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}55, transparent)` }} />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full pointer-events-none transition-all duration-500 group-hover:scale-150"
        style={{ background: `radial-gradient(circle, ${color}15, transparent 70%)` }} />
      <div className="relative px-5 pt-4 pb-1 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
          <p className="text-[30px] font-black mono leading-tight mt-0.5 tracking-tight" style={{ color, fontFamily: "'JetBrains Mono',monospace" }}>{value}</p>
          {sub && <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{sub}</p>}
        </div>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      {chartData && chartData.length > 1 && (
        <div className="px-2 pb-2 h-16 mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`kpi-grad-${chartKey}-${rank}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey={chartKey} stroke={color} strokeWidth={2}
                fill={`url(#kpi-grad-${chartKey}-${rank})`} dot={false} />
              <Tooltip contentStyle={{ background: "#1e1e1e", border: `1px solid ${color}40`, borderRadius: 8, fontSize: 10, color: "#f0f0f0" }}
                formatter={(v) => [`R${Number(v).toFixed(0)}`, ""]} labelFormatter={() => ""} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function RevenueBreakdown({ invoices }) {
  const paid    = invoices.filter(i => i.status === "paid").reduce((a, i) => a + (i.total || 0), 0);
  const overdue = invoices.filter(i => i.status === "overdue").reduce((a, i) => a + (i.total || 0), 0);
  const pending = invoices.filter(i => ["sent", "draft"].includes(i.status)).reduce((a, i) => a + (i.total || 0), 0);
  const total   = paid + overdue + pending || 1;
  const segments = [
    { label: "Collected", value: paid,    color: "#10b981", pct: paid/total*100,    icon: CheckCircle2 },
    { label: "Pending",   value: pending, color: "#22d3ee", pct: pending/total*100, icon: Clock },
    { label: "Overdue",   value: overdue, color: "#e02347", pct: overdue/total*100, icon: AlertCircle },
  ];
  return (
    <div className="relative overflow-hidden rounded-2xl px-6 py-5"
      style={{ background: "#181818", border: "1px solid rgba(0,180,180,0.2)", boxShadow: "0 4px 32px rgba(0,0,0,0.5)" }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,#e02347,transparent)" }} />
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,180,180,0.15)", border: "1px solid rgba(0,180,180,0.3)" }}>
              <BarChart3 className="w-3.5 h-3.5" style={{ color: "#00b4b4" }} />
            </div>
            <p className="text-[13px] font-black uppercase tracking-wider" style={{ color: "#00b4b4" }}>Revenue Breakdown</p>
            <span className="text-[10px] font-black mono px-2 py-0.5 rounded-full" style={{ background: "rgba(0,180,180,0.1)", color: "#00b4b4", border: "1px solid rgba(0,180,180,0.2)" }}>
              R{total.toLocaleString()} total
            </span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden gap-px mb-4" style={{ background: "rgba(255,255,255,0.06)" }}>
            {segments.map(s => (
              <div key={s.label} className="transition-all duration-700 first:rounded-l-full last:rounded-r-full"
                style={{ width: `${s.pct}%`, background: s.color, minWidth: s.value > 0 ? 4 : 0 }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            {segments.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                    <Icon className="w-3 h-3" style={{ color: s.color }} />
                  </div>
                  <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.55)" }}>{s.label}</span>
                  <span className="text-[13px] font-black mono" style={{ color: s.color }}>R{s.value.toLocaleString()}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${s.color}15`, color: s.color }}>{s.pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="url(#ring-grad-dark)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(paid / total) * 201} 201`} />
              <defs>
                <linearGradient id="ring-grad-dark" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#00b4b4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[14px] font-black mono" style={{ color: "#10b981" }}>{(paid/total*100).toFixed(0)}%</span>
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>Collected</p>
        </div>
      </div>
    </div>
  );
}

function InvoiceRow({ inv, isAdmin, onPdf, onEdit, onDelete, onStatusChange, index }) {
  const [open, setOpen] = useState(false);
  const sc = STATUS_CFG[inv.status] || STATUS_CFG.draft;
  const initials = inv.customer_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??";
  const isPaid = inv.status === "paid";
  const isOver = inv.status === "overdue";

  return (
    <div className="group fx-data-row" style={{ borderBottom: "1px solid rgba(0,212,212,0.04)" }}>
      <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-all duration-150"
        onClick={() => setOpen(v => !v)}
        style={{ background: open ? `${sc.color}08` : "transparent" }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = "linear-gradient(90deg,rgba(0,212,212,0.05),transparent)"; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = open ? `${sc.color}08` : "transparent"; }}>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className="hidden lg:block w-6 text-[10px] font-black mono text-center" style={{ color: "rgba(255,255,255,0.2)" }}>{String(index + 1).padStart(2, "0")}</span>
          <div className="relative w-9 h-9 rounded-xl flex items-center justify-center font-black text-[11px]"
            style={{ background: `${sc.color}18`, border: `1px solid ${sc.color}30`, color: sc.color }}>
            {initials}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2" style={{ background: sc.dot, borderColor: "#1a1a1a" }} />
          </div>
        </div>
        <p className="hidden sm:block w-28 text-[11px] mono font-bold flex-shrink-0" style={{ color: "#00b4b4" }}>{inv.invoice_number || "—"}</p>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold truncate" style={{ color: "#e0e0e0" }}>{inv.customer_name}</p>
          {inv.description && <p className="text-[10px] truncate hidden sm:block" style={{ color: "rgba(255,255,255,0.35)" }}>{inv.description}</p>}
        </div>
        <p className="hidden sm:block w-28 text-right text-[15px] font-black mono flex-shrink-0"
          style={{ color: isPaid ? "#10b981" : isOver ? "#e02347" : "#00b4b4" }}>
          R{(inv.total ?? inv.amount ?? 0).toFixed(2)}
        </p>
        <div className="flex-shrink-0 w-24">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider"
            style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
            {sc.label}
          </span>
        </div>
        <p className="hidden lg:block w-24 text-[11px] flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>
          {inv.due_date ? format(new Date(inv.due_date), "dd MMM yy") : "—"}
        </p>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isAdmin && !["paid", "cancelled"].includes(inv.status) && (
            <button onClick={e => { e.stopPropagation(); onStatusChange(inv.id, "paid"); }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all hover:scale-105"
              style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}>
              <CheckCircle2 className="w-3 h-3" /> Paid
            </button>
          )}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
            <button onClick={() => onPdf(inv)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
              style={{ background: "rgba(0,180,180,0.12)", border: "1px solid rgba(0,180,180,0.25)" }}>
              <FileText className="w-3.5 h-3.5" style={{ color: "#00b4b4" }} />
            </button>
            {isAdmin && (
              <>
                <button onClick={() => onEdit(inv)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Pencil className="w-3.5 h-3.5" style={{ color: "#b0b0b0" }} />
                </button>
                <button onClick={() => onDelete(inv.id)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "rgba(224,35,71,0.1)", border: "1px solid rgba(224,35,71,0.2)" }}>
                  <Trash2 className="w-3.5 h-3.5" style={{ color: "#e02347" }} />
                </button>
              </>
            )}
          </div>
          {open ? <ChevronUp className="w-4 h-4 ml-1" style={{ color: sc.color }} /> : <ChevronDown className="w-4 h-4 ml-1" style={{ color: "rgba(255,255,255,0.2)" }} />}
        </div>
      </div>

      {open && (
        <div className="mx-3 mb-3 rounded-2xl overflow-hidden" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(0,180,180,0.1)" }}>
          <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Subtotal",        value: `R${(inv.amount || 0).toFixed(2)}`,              icon: DollarSign },
              { label: "VAT (15%)",       value: `R${(inv.tax || 0).toFixed(2)}`,                 icon: Receipt },
              { label: "Total",           value: `R${(inv.total || inv.amount || 0).toFixed(2)}`, icon: CreditCard },
              { label: "Payment Method",  value: inv.payment_method?.replace(/_/g, " ") || "—",   icon: Zap },
              { label: "Billing Period",  value: inv.billing_period_start ? `${inv.billing_period_start} → ${inv.billing_period_end || "?"}` : "—", icon: CalendarDays },
              { label: "Due Date",        value: inv.due_date  ? format(new Date(inv.due_date),  "dd MMM yyyy") : "—", icon: Clock },
              { label: "Paid Date",       value: inv.paid_date ? format(new Date(inv.paid_date), "dd MMM yyyy") : "—", icon: CheckCircle2 },
              { label: "Sage Invoice ID", value: inv.sage_invoice_id || "Not synced",             icon: ArrowUpRight },
            ].map(item => (
              <div key={item.label} className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <item.icon className="w-3 h-3" style={{ color: sc.color }} />
                  <p className="text-[9px] uppercase tracking-wider font-black" style={{ color: "rgba(255,255,255,0.3)" }}>{item.label}</p>
                </div>
                <p className="text-[12px] font-bold capitalize truncate" style={{ color: "#e0e0e0" }}>{item.value}</p>
              </div>
            ))}
          </div>
          {isAdmin && !["paid", "cancelled"].includes(inv.status) && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              <p className="w-full text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Quick Actions</p>
              {inv.status !== "paid" && (
                <button onClick={() => onStatusChange(inv.id, "paid")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
                  style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid
                </button>
              )}
              {!["sent","paid"].includes(inv.status) && (
                <button onClick={() => onStatusChange(inv.id, "sent")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
                  style={{ background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.25)", color: "#22d3ee" }}>
                  <Receipt className="w-3.5 h-3.5" /> Mark Sent
                </button>
              )}
              {inv.status !== "overdue" && (
                <button onClick={() => onStatusChange(inv.id, "overdue")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
                  style={{ background: "rgba(224,35,71,0.12)", border: "1px solid rgba(224,35,71,0.25)", color: "#e02347" }}>
                  <AlertCircle className="w-3.5 h-3.5" /> Mark Overdue
                </button>
              )}
              <button onClick={() => onStatusChange(inv.id, "cancelled")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
                style={{ background: "rgba(100,116,139,0.1)", border: "1px solid rgba(100,116,139,0.2)", color: "#94a3b8" }}>
                Cancel Invoice
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Billing() {
  const { can, loading: rbacLoading, isAdmin } = useRBAC();
  const [showForm,      setShowForm]      = useState(false);
  const [editing,       setEditing]       = useState(null);
  const [pdfInvoice,    setPdfInvoice]    = useState(null);
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [page,          setPage]          = useState(1);
  const queryClient = useQueryClient();

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const handleExportCsv = () => {
    exportToCsv(filtered, [
      { key: "invoice_number", label: "Invoice #" }, { key: "customer_name", label: "Customer" },
      { key: "amount", label: "Amount" }, { key: "tax", label: "Tax" }, { key: "total", label: "Total" },
      { key: "status", label: "Status" }, { key: "due_date", label: "Due Date" },
      { key: "paid_date", label: "Paid Date" }, { key: "payment_method", label: "Payment Method" },
    ], "invoices");
    toast.success("Invoices exported to CSV");
  };

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

  const createMut = useMutation({ mutationFn: (data) => base44.entities.Invoice.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["invoices"] }); setShowForm(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => base44.entities.Invoice.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["invoices"] }); setShowForm(false); setEditing(null); } });
  const deleteMut = useMutation({ mutationFn: (id) => base44.entities.Invoice.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }) });
  const statusMut = useMutation({
    mutationFn: ({ id, status }) => {
      const update = { status };
      if (status === "paid") update.paid_date = new Date().toISOString().slice(0, 10);
      return base44.entities.Invoice.update(id, update);
    },
    onSuccess: (_, vars) => { queryClient.invalidateQueries({ queryKey: ["invoices"] }); if (vars.status === "paid") toast.success("Invoice marked as paid"); },
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
  const handleSubmit = (data) => { if (editing) updateMut.mutate({ id: editing.id, data }); else createMut.mutate(data); };
  const filteredTotal = filtered.reduce((a, i) => a + (i.total ?? i.amount ?? 0), 0);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-4 lg:p-8 space-y-5 max-w-[1600px] mx-auto">

      {/* Ticker */}
      <div className="relative overflow-hidden rounded-xl h-8 flex items-center"
        style={{ background: "rgba(0,180,180,0.05)", border: "1px solid rgba(0,180,180,0.15)" }}>
        <div className="absolute left-0 top-0 bottom-0 w-14 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg,#111111,transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-14 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg,#111111,transparent)" }} />
        <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center px-3" style={{ background: "rgba(0,180,180,0.15)", borderRight: "1px solid rgba(0,180,180,0.25)" }}>
          <span className="text-[8px] font-black uppercase tracking-[0.3em] mono" style={{ color: "#00d4d4" }}>FIN</span>
        </div>
        <div className="ticker-track flex items-center gap-10 px-6 whitespace-nowrap ml-12">
          {["BILLING MODULE","SECURE · ENCRYPTED","SAGE INTEGRATED","AUTO-INVOICING","ZAR · VAT COMPLIANT","ISO 27001","REAL-TIME SYNC","15% VAT COMPLIANT",
            "BILLING MODULE","SECURE · ENCRYPTED","SAGE INTEGRATED","AUTO-INVOICING","ZAR · VAT COMPLIANT","ISO 27001","REAL-TIME SYNC","15% VAT COMPLIANT"
          ].map((t, i) => (
            <span key={i} className="text-[9px] font-black uppercase tracking-[0.2em] mono"
              style={{ color: i % 3 === 0 ? "#00b4b4" : i % 3 === 1 ? "rgba(0,180,180,0.4)" : "#e02347" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-5"
        style={{ background: "linear-gradient(135deg,#141414,#1a1a1a)", border: "1px solid rgba(0,180,180,0.28)", boxShadow: "0 4px 40px rgba(0,0,0,0.6), 0 0 40px rgba(0,180,180,0.04)" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.5),#00b4b4,#e02347,transparent)", animation: "border-rotate 5s ease infinite", backgroundSize: "300% auto" }} />
        <div className="absolute top-3 left-3 w-4 h-4 pointer-events-none" style={{ borderTop: "1.5px solid rgba(0,212,212,0.5)", borderLeft: "1.5px solid rgba(0,212,212,0.5)" }} />
        <div className="absolute top-3 right-3 w-4 h-4 pointer-events-none" style={{ borderTop: "1.5px solid rgba(224,35,71,0.4)", borderRight: "1.5px solid rgba(224,35,71,0.4)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(0,212,212,0.05) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <div className="absolute top-0 right-0 w-64 h-32 pointer-events-none" style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(0,180,180,0.1) 0%, transparent 60%)" }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,180,180,0.15)", border: "1px solid rgba(0,180,180,0.4)", boxShadow: "0 0 14px rgba(0,180,180,0.2)" }}>
                <CircleDollarSign className="w-4.5 h-4.5" style={{ color: "#00b4b4" }} />
              </div>
              <h1 className="text-xl font-black tracking-tight glow-text-navy" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Billing & Invoices</h1>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10b981", boxShadow: "0 0 5px #10b981" }} />
                <LiveClock style={{ fontSize: 9, fontWeight: 800, color: "#10b981", letterSpacing: "0.1em" }} />
              </div>
            </div>
            <p className="text-[11px] mono pl-11" style={{ color: "rgba(255,255,255,0.35)" }}>
              {invoices.length} invoices · <span style={{ color: "#10b981" }}>{paidCount} paid</span> · <span style={{ color: "#00b4b4" }}>R{totalPaid.toLocaleString()}</span> collected
              {overdueCount > 0 && <span style={{ color: "#e02347" }}> · {overdueCount} overdue</span>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105 active:scale-95"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#b0b0b0" }}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button onClick={handleExportCsv} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105 active:scale-95"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981" }}>
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            {isAdmin && (
              <button onClick={() => { setEditing(null); setShowForm(true); }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 active:scale-95 ripple-btn"
                style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 20px rgba(0,180,180,0.35)", border: "1px solid rgba(0,212,212,0.3)" }}>
                <Plus className="w-4 h-4" /> New Invoice
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" style={{ background: "#1e1e1e" }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard rank="01" label="Total Collected" value={`R${totalPaid.toLocaleString()}`} sub={`${paidCount} paid invoices`} icon={CheckCircle2} color="#10b981" chartData={chartData} chartKey="paid" />
          <KPICard rank="02" label="Overdue Balance" value={`R${totalOverdue.toLocaleString()}`} sub={overdueCount > 0 ? `${overdueCount} need attention` : "All clear ✓"} icon={AlertCircle} color={overdueCount > 0 ? "#e02347" : "#10b981"} chartData={chartData} chartKey="overdue" />
          <KPICard rank="03" label="Pending Revenue" value={`R${totalPending.toLocaleString()}`} sub={`${invoices.filter(i => ["draft","sent"].includes(i.status)).length} awaiting`} icon={DollarSign} color="#f59e0b" chartData={chartData} chartKey="paid" />
        </div>
      )}

      {!isLoading && invoices.length > 0 && <RevenueBreakdown invoices={invoices} />}

      {isAdmin && <BatchInvoiceGenerator onInvoicesCreated={() => queryClient.invalidateQueries({ queryKey: ["invoices"] })} />}

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} />
          <input
            className="w-full pl-10 pr-8 py-3 text-[13px] outline-none rounded-xl transition-all"
            style={{ background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)", color: "#e0e0e0" }}
            placeholder="Search customer name or invoice number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>✕</button>}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(s => {
            const cfg = STATUS_CFG[s];
            const active = statusFilter === s;
            const cnt = s === "all" ? invoices.length : invoices.filter(i => i.status === s).length;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all hover:scale-105"
                style={{
                  background: active ? (cfg ? cfg.bg : "rgba(0,180,180,0.12)") : "rgba(255,255,255,0.04)",
                  border: active ? `1px solid ${cfg ? cfg.border : "rgba(0,180,180,0.4)"}` : "1px solid rgba(255,255,255,0.08)",
                  color: active ? (cfg ? cfg.color : "#00b4b4") : "rgba(255,255,255,0.35)",
                }}>
                {s === "all" ? "All" : s}<span className="ml-1 font-normal opacity-50">({cnt})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Invoice Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#181818", border: "1px solid rgba(0,212,212,0.15)", boxShadow: "0 4px 28px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,212,0.04)" }}>
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.4),#00b4b4,#e02347,transparent)" }} />
        <div className="flex items-center gap-3 px-5 py-3" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="hidden lg:block w-6 flex-shrink-0" />
          <div className="flex-shrink-0 w-9" />
          <p className="hidden sm:block w-28 text-[9px] font-black uppercase tracking-[0.2em] flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>Invoice #</p>
          <p className="flex-1 text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.3)" }}>Customer</p>
          <p className="hidden sm:block w-28 text-right text-[9px] font-black uppercase tracking-[0.2em] flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>Amount</p>
          <p className="w-24 text-[9px] font-black uppercase tracking-[0.2em] flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>Status</p>
          <p className="hidden lg:block w-24 text-[9px] font-black uppercase tracking-[0.2em] flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>Due Date</p>
          <div className="w-24 flex-shrink-0" />
        </div>

        {isLoading ? (
          <div className="p-5 space-y-2.5">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(0,180,180,0.1)", border: "1px solid rgba(0,180,180,0.2)" }}>
              <Receipt className="w-7 h-7" style={{ color: "#00b4b4" }} />
            </div>
            <p className="font-bold text-[14px]" style={{ color: "#f0f0f0" }}>No invoices found</p>
            <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Adjust search or filter to see results</p>
          </div>
        ) : (
          paginated.map((inv, idx) => (
            <InvoiceRow key={inv.id} inv={inv} index={(page - 1) * PAGE_SIZE + idx} isAdmin={isAdmin}
              onPdf={setPdfInvoice} onEdit={(inv) => { setEditing(inv); setShowForm(true); }}
              onDelete={(id) => setConfirmDelete(id)}
              onStatusChange={(id, status) => statusMut.mutate({ id, status })} />
          ))
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-2"
            style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[11px] mono" style={{ color: "rgba(255,255,255,0.35)" }}>
              Showing <span className="font-bold" style={{ color: "#00b4b4" }}>{paginated.length}</span> of <span className="font-bold">{filtered.length}</span>
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                Total: <span className="font-black mono" style={{ color: "#10b981" }}>R{filteredTotal.toFixed(2)}</span>
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all hover:scale-105 disabled:opacity-30"
                    style={{ background: "rgba(0,180,180,0.1)", border: "1px solid rgba(0,180,180,0.25)", color: "#00b4b4" }}>‹</button>
                  <span className="text-[11px] font-bold mono px-2" style={{ color: "#00b4b4" }}>{page}/{totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all hover:scale-105 disabled:opacity-30"
                    style={{ background: "rgba(0,180,180,0.1)", border: "1px solid rgba(0,180,180,0.25)", color: "#00b4b4" }}>›</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {pdfInvoice && <InvoicePDFModal invoice={pdfInvoice} customer={customers.find(c => c.id === pdfInvoice.customer_id)} onClose={() => setPdfInvoice(null)} />}
      {showForm && <InvoiceForm invoice={editing} customers={customers} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditing(null); }} />}
      {confirmDelete && (
        <ConfirmDialog title="Delete Invoice?" message="This will permanently remove the invoice. This action cannot be undone."
          onConfirm={() => { deleteMut.mutate(confirmDelete); setConfirmDelete(null); toast.success("Invoice deleted"); }}
          onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  );
}