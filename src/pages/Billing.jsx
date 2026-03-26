import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Receipt, DollarSign, AlertCircle,
         CheckCircle2, FileText, TrendingUp, Zap, RefreshCw, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import InvoiceForm from "../components/billing/InvoiceForm";
import BatchInvoiceGenerator from "../components/billing/BatchInvoiceGenerator";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";
import InvoicePDFModal from "@/components/billing/InvoicePDFModal";

const STATUS_CFG = {
  draft:     { color: "#64748b", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.3)",  label: "Draft"     },
  sent:      { color: "#06b6d4", bg: "rgba(6,182,212,0.12)",   border: "rgba(6,182,212,0.3)",    label: "Sent"      },
  paid:      { color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)",   label: "Paid"      },
  overdue:   { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)",    label: "Overdue"   },
  cancelled: { color: "#475569", bg: "rgba(71,85,105,0.08)",   border: "rgba(71,85,105,0.2)",    label: "Cancelled" },
};

const STATUS_FILTERS = ["all", "paid", "sent", "overdue", "draft", "cancelled"];

// ── Futuristic KPI card ───────────────────────────────────────────────────────
function NeonKPI({ label, value, sub, icon: Icon, color, glow }) {
  return (
    <div className="relative overflow-hidden rounded-2xl px-5 py-4"
      style={{
        background: "rgba(255,255,255,0.97)",
        border: `1px solid ${color}22`,
        boxShadow: `0 2px 20px ${glow}, inset 0 1px 0 rgba(255,255,255,0.9)`,
      }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}18, transparent 70%)` }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: "rgba(100,116,139,0.55)" }}>{label}</p>
          <p className="text-3xl font-black mono leading-none" style={{ color }}>{value}</p>
          {sub && <p className="text-[10px] mono mt-1.5" style={{ color: "rgba(100,116,139,0.45)" }}>{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}12`, border: `1px solid ${color}25`, boxShadow: `0 0 12px ${glow}` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

// ── Invoice row ───────────────────────────────────────────────────────────────
function InvoiceRow({ inv, isAdmin, onPdf, onEdit, onDelete }) {
  const sc = STATUS_CFG[inv.status] || STATUS_CFG.draft;
  const initials = inv.customer_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??";
  return (
    <div className="flex items-center gap-3 px-4 py-3 transition-all group cursor-default"
      style={{ borderBottom: "1px solid rgba(99,102,241,0.05)" }}
      onMouseEnter={e => { e.currentTarget.style.background = `${sc.color}05`; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] flex-shrink-0"
        style={{ background: `${sc.color}12`, border: `1px solid ${sc.color}25`, color: sc.color }}>
        {initials}
      </div>

      {/* Invoice # */}
      <p className="hidden sm:block w-28 text-[11px] mono flex-shrink-0" style={{ color: "#818cf8" }}>
        {inv.invoice_number || "—"}
      </p>

      {/* Customer */}
      <p className="flex-1 min-w-0 text-[13px] font-semibold text-slate-800 truncate">{inv.customer_name}</p>

      {/* Amount */}
      <p className="hidden sm:block w-24 text-right text-[13px] font-black mono flex-shrink-0" style={{ color: "#0f172a" }}>
        R{(inv.total ?? inv.amount ?? 0).toFixed(2)}
      </p>

      {/* Status */}
      <div className="flex-shrink-0 w-22">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider mono"
          style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, boxShadow: `0 0 8px ${sc.color}18` }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sc.color }} />
          {sc.label}
        </span>
      </div>

      {/* Due date */}
      <p className="hidden lg:block w-28 text-[11px] text-slate-400 flex-shrink-0">
        {inv.due_date ? format(new Date(inv.due_date), "dd MMM yyyy") : "—"}
      </p>

      {/* Payment method */}
      <p className="hidden xl:block w-28 text-[11px] text-slate-400 capitalize flex-shrink-0">
        {inv.payment_method?.replace(/_/g, " ") || "—"}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onPdf(inv)}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-indigo-50 transition-colors"
          title="View / Download PDF">
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
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
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

  if (!rbacLoading && !can("billing")) return <AccessDenied />;

  const handleSubmit = (data) => {
    if (editing) updateMut.mutate({ id: editing.id, data });
    else createMut.mutate(data);
  };

  const totalPaid    = invoices.filter(i => i.status === "paid").reduce((a, i) => a + (i.total || 0), 0);
  const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((a, i) => a + (i.total || 0), 0);
  const totalPending = invoices.filter(i => ["draft","sent"].includes(i.status)).reduce((a, i) => a + (i.total || 0), 0);
  const paidCount    = invoices.filter(i => i.status === "paid").length;

  const filtered = useMemo(() => invoices.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = !search || i.customer_name?.toLowerCase().includes(q) || i.invoice_number?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    return matchSearch && matchStatus;
  }), [invoices, search, statusFilter]);

  return (
    <div className="p-5 lg:p-8 space-y-6 max-w-[1600px] mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "#1e293b" }}>Billing & Invoices</h1>
          <p className="text-[11px] mt-0.5 mono" style={{ color: "rgba(100,116,139,0.5)" }}>
            {invoices.length} invoices · {paidCount} paid · R{totalPaid.toLocaleString()} collected
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
            style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)", color: "#6366f1" }}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          {isAdmin && (
            <button onClick={() => { setEditing(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}>
              <Plus className="w-4 h-4" /> Create Invoice
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Strip ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NeonKPI label="Total Collected"  value={`R${totalPaid.toLocaleString()}`}    sub={`${paidCount} paid invoices`}                          icon={CheckCircle2} color="#10b981" glow="rgba(16,185,129,0.12)" />
          <NeonKPI label="Overdue Balance"  value={`R${totalOverdue.toLocaleString()}`} sub={`${invoices.filter(i=>i.status==="overdue").length} invoices overdue`} icon={AlertCircle}  color="#ef4444" glow="rgba(239,68,68,0.1)"  />
          <NeonKPI label="Pending Revenue"  value={`R${totalPending.toLocaleString()}`} sub={`${invoices.filter(i=>["draft","sent"].includes(i.status)).length} awaiting payment`} icon={DollarSign}   color="#f59e0b" glow="rgba(245,158,11,0.1)" />
        </div>
      )}

      {/* ── Batch Generator ── */}
      {isAdmin && (
        <BatchInvoiceGenerator onInvoicesCreated={() => queryClient.invalidateQueries({ queryKey: ["invoices"] })} />
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-2.5 text-[13px] outline-none rounded-xl transition-all"
            style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(99,102,241,0.15)", color: "#1e293b" }}
            placeholder="Search by customer or invoice number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">✕</button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(s => {
            const cfg    = STATUS_CFG[s];
            const isActive = statusFilter === s;
            const cnt    = s === "all" ? invoices.length : invoices.filter(i => i.status === s).length;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all"
                style={{
                  background: isActive ? (cfg ? cfg.bg : "rgba(99,102,241,0.12)") : "rgba(255,255,255,0.85)",
                  border: isActive ? `1px solid ${cfg ? cfg.border : "rgba(99,102,241,0.35)"}` : "1px solid rgba(99,102,241,0.1)",
                  color: isActive ? (cfg ? cfg.color : "#6366f1") : "#94a3b8",
                  boxShadow: isActive && cfg ? `0 0 10px ${cfg.color}18` : "none",
                }}>
                {s === "all" ? "All" : s}
                <span className="ml-1 opacity-60">({cnt})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Invoice Table ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.97)",
          border: "1px solid rgba(99,102,241,0.1)",
          boxShadow: "0 2px 20px rgba(99,102,241,0.06)",
        }}>

        {/* Table header */}
        <div className="flex items-center gap-3 px-4 py-2.5"
          style={{ background: "#f8f9ff", borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
          <div className="w-8 flex-shrink-0" />
          <p className="hidden sm:block w-28 text-[10px] font-black uppercase tracking-widest text-slate-400 flex-shrink-0">Invoice #</p>
          <p className="flex-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</p>
          <p className="hidden sm:block w-24 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 flex-shrink-0">Amount</p>
          <p className="w-22 text-[10px] font-black uppercase tracking-widest text-slate-400 flex-shrink-0">Status</p>
          <p className="hidden lg:block w-28 text-[10px] font-black uppercase tracking-widest text-slate-400 flex-shrink-0">Due Date</p>
          <p className="hidden xl:block w-28 text-[10px] font-black uppercase tracking-widest text-slate-400 flex-shrink-0">Payment</p>
          <div className="w-20 flex-shrink-0" />
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.12)" }}>
              <Receipt className="w-6 h-6" style={{ color: "#6366f1" }} />
            </div>
            <p className="font-semibold text-slate-500 text-sm">No invoices found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter</p>
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
            />
          ))
        )}

        {/* Footer */}
        {!isLoading && filtered.length > 0 && (
          <div className="px-4 py-2.5 flex items-center justify-between"
            style={{ background: "#f8f9ff", borderTop: "1px solid rgba(99,102,241,0.06)" }}>
            <p className="text-[11px] mono" style={{ color: "rgba(100,116,139,0.5)" }}>
              {filtered.length} of {invoices.length} invoices
            </p>
            <p className="text-[11px] mono font-bold" style={{ color: "#10b981" }}>
              Total shown: R{filtered.reduce((a, i) => a + (i.total ?? i.amount ?? 0), 0).toFixed(2)}
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