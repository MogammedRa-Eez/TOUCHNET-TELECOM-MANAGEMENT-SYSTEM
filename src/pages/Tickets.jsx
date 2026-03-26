import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, Pencil, Trash2, TicketCheck, AlertTriangle, Clock,
  CheckCircle2, ChevronDown, ChevronUp, RefreshCw, Filter,
  ArrowUpRight, User, Building2, Tag, Calendar, MessageSquare, Zap
} from "lucide-react";
import SLAWorkflowPanel from "@/components/tickets/SLAWorkflowPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import TicketForm from "../components/tickets/TicketForm";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";

const STATUS_CFG = {
  open:             { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",   border: "rgba(245,158,11,0.22)",   label: "Open",             dot: "#fbbf24" },
  in_progress:      { color: "#3b82f6", bg: "rgba(59,130,246,0.08)",   border: "rgba(59,130,246,0.22)",   label: "In Progress",      dot: "#60a5fa" },
  waiting_customer: { color: "#8b5cf6", bg: "rgba(139,92,246,0.08)",   border: "rgba(139,92,246,0.22)",   label: "Waiting",          dot: "#a78bfa" },
  escalated:        { color: "#ef4444", bg: "rgba(239,68,68,0.08)",    border: "rgba(239,68,68,0.22)",    label: "Escalated",        dot: "#f87171" },
  resolved:         { color: "#10b981", bg: "rgba(16,185,129,0.08)",   border: "rgba(16,185,129,0.22)",   label: "Resolved",         dot: "#34d399" },
  closed:           { color: "#64748b", bg: "rgba(100,116,139,0.06)",  border: "rgba(100,116,139,0.18)",  label: "Closed",           dot: "#94a3b8" },
};

const PRIORITY_CFG = {
  low:      { color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)", label: "Low",      ring: "#94a3b8" },
  medium:   { color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)",  label: "Medium",   ring: "#60a5fa" },
  high:     { color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)",  label: "High",     ring: "#fb923c" },
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",  label: "Critical", ring: "#f87171" },
};

const STATUS_FILTERS   = ["all", "open", "in_progress", "escalated", "resolved", "closed"];
const PRIORITY_FILTERS = ["all", "low", "medium", "high", "critical"];

// ── KPI card ──────────────────────────────────────────────────────────────────
function KPICard({ label, count, color, icon: Icon, onClick, active }) {
  return (
    <button onClick={onClick}
      className="relative overflow-hidden rounded-2xl px-4 py-4 text-left w-full transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: active ? `${color}0f` : "#ffffff",
        border: `1px solid ${active ? color + "40" : color + "18"}`,
        boxShadow: active ? `0 4px 20px ${color}18, 0 0 0 2px ${color}20` : "0 1px 8px rgba(99,102,241,0.06)",
      }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}12, transparent 70%)` }} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: "rgba(100,116,139,0.5)" }}>{label}</p>
          <p className="text-3xl font-black mono" style={{ color }}>{count}</p>
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
    </button>
  );
}

// ── Expandable Ticket Row ─────────────────────────────────────────────────────
function TicketRow({ ticket, isAdmin, onEdit, onDelete, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const sc = STATUS_CFG[ticket.status] || STATUS_CFG.open;
  const pc = PRIORITY_CFG[ticket.priority] || PRIORITY_CFG.medium;
  const isCritical = ticket.priority === "critical";

  return (
    <div style={{ borderBottom: "1px solid rgba(99,102,241,0.05)" }}>
      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all group"
        onClick={() => setOpen(v => !v)}
        style={{ background: open ? `${sc.color}04` : "transparent" }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = `${sc.color}04`; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = "transparent"; }}
      >
        {/* Priority ring indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black"
            style={{ background: `${pc.color}10`, border: `2px solid ${pc.color}30`, color: pc.color }}>
            {isCritical ? "🔴" : ticket.priority?.[0]?.toUpperCase()}
          </div>
          {isCritical && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse border-2 border-white" />
          )}
        </div>

        {/* Ticket # */}
        <p className="hidden sm:block w-24 text-[11px] mono font-semibold flex-shrink-0" style={{ color: "#818cf8" }}>
          {ticket.ticket_number || "—"}
        </p>

        {/* Subject + customer */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 truncate">{ticket.subject}</p>
          <p className="text-[10px] text-slate-400 truncate">{ticket.customer_name || "No customer"} · {ticket.category?.replace(/_/g," ")}</p>
        </div>

        {/* Priority */}
        <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider flex-shrink-0"
          style={{ background: pc.bg, color: pc.color, border: `1px solid ${pc.border}` }}>
          {pc.label}
        </span>

        {/* Status */}
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider flex-shrink-0"
          style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
          {sc.label}
        </span>

        {/* Dept */}
        <p className="hidden lg:block w-24 text-[11px] text-slate-400 capitalize flex-shrink-0">
          {ticket.department?.replace(/_/g," ") || "—"}
        </p>

        {/* Actions (hover) */}
        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          {isAdmin && (
            <>
              <button onClick={() => onEdit(ticket)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-indigo-50 transition-colors">
                <Pencil className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button onClick={() => onDelete(ticket.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </>
          )}
        </div>

        {open
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "#94a3b8" }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "#cbd5e1" }} />}
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="px-5 pb-4 pt-2 space-y-3"
          style={{ background: `${sc.color}03`, borderTop: `1px solid ${sc.color}10` }}>
          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Assigned To",    value: ticket.assigned_to || "Unassigned", icon: User },
              { label: "Department",     value: ticket.department?.replace(/_/g," ") || "—", icon: Building2 },
              { label: "Category",       value: ticket.category?.replace(/_/g," ") || "—", icon: Tag },
              { label: "SLA Deadline",   value: ticket.sla_deadline ? format(new Date(ticket.sla_deadline), "dd MMM yyyy HH:mm") : "None set", icon: Calendar },
            ].map(item => (
              <div key={item.label} className="rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(99,102,241,0.08)" }}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <item.icon className="w-3 h-3" style={{ color: sc.color }} />
                  <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: "rgba(100,116,139,0.5)" }}>{item.label}</p>
                </div>
                <p className="text-[12px] font-bold text-slate-700 capitalize">{item.value}</p>
              </div>
            ))}
          </div>

          {ticket.description && (
            <div className="rounded-xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(99,102,241,0.08)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare className="w-3 h-3" style={{ color: sc.color }} />
                <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: "rgba(100,116,139,0.5)" }}>Description</p>
              </div>
              <p className="text-[12px] text-slate-600 leading-relaxed">{ticket.description}</p>
            </div>
          )}

          {ticket.resolution_notes && (
            <div className="rounded-xl px-4 py-3"
              style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: "#10b981" }}>Resolution Notes</p>
              <p className="text-[12px] text-slate-600">{ticket.resolution_notes}</p>
            </div>
          )}

          {/* Quick status actions for admins */}
          {isAdmin && (
            <div className="flex flex-wrap gap-2 pt-1">
              <p className="w-full text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(100,116,139,0.45)" }}>Quick Status</p>
              {Object.entries(STATUS_CFG).filter(([k]) => k !== ticket.status).map(([k, cfg]) => (
                <button key={k} onClick={() => onStatusChange(ticket.id, k)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                  {cfg.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Tickets() {
  const { can, loading: rbacLoading, department, isAdmin } = useRBAC();
  const [showForm,       setShowForm]       = useState(false);
  const [editing,        setEditing]        = useState(null);
  const [search,         setSearch]         = useState("");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => base44.entities.Ticket.list("-created_date"),
    enabled: !rbacLoading && can("tickets"),
  });
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list(),
    enabled: !rbacLoading && can("tickets"),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Ticket.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tickets"] }); setShowForm(false); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Ticket.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tickets"] }); setShowForm(false); setEditing(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Ticket.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tickets"] }),
  });
  const statusMut = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Ticket.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tickets"] }),
  });

  if (!rbacLoading && !can("tickets")) return <AccessDenied />;

  const handleSubmit = (data) => {
    if (editing) updateMut.mutate({ id: editing.id, data });
    else createMut.mutate(data);
  };

  const visibleTickets = isAdmin ? tickets : tickets.filter(t => !department || t.department === department);

  const filtered = useMemo(() => visibleTickets.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search || t.subject?.toLowerCase().includes(q)
      || t.ticket_number?.toLowerCase().includes(q)
      || t.customer_name?.toLowerCase().includes(q);
    const matchStatus   = statusFilter === "all"   || t.status === statusFilter;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  }), [visibleTickets, search, statusFilter, priorityFilter]);

  const criticalCount = visibleTickets.filter(t => t.priority === "critical" && !["resolved","closed"].includes(t.status)).length;

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-[1600px] mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "#0f172a" }}>Support Tickets</h1>
          <p className="text-[11px] mt-0.5 mono" style={{ color: "rgba(100,116,139,0.55)" }}>
            {visibleTickets.length} tickets · {visibleTickets.filter(t=>!["resolved","closed"].includes(t.status)).length} open
            {criticalCount > 0 && <span className="ml-1 text-red-500 font-bold">· {criticalCount} critical</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
            style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)", color: "#6366f1" }}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          {isAdmin && (
            <button onClick={() => { setEditing(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}>
              <Plus className="w-4 h-4" /> New Ticket
            </button>
          )}
        </div>
      </div>

      {/* ── SLA Panel ── */}
      <SLAWorkflowPanel />

      {/* ── KPI Strip (clickable filters) ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard label="Open"        count={visibleTickets.filter(t=>t.status==="open").length}        color="#f59e0b" icon={Clock}         onClick={() => setStatusFilter(s => s === "open" ? "all" : "open")}         active={statusFilter === "open"} />
          <KPICard label="In Progress" count={visibleTickets.filter(t=>t.status==="in_progress").length} color="#3b82f6" icon={TicketCheck}   onClick={() => setStatusFilter(s => s === "in_progress" ? "all" : "in_progress")} active={statusFilter === "in_progress"} />
          <KPICard label="Escalated"   count={visibleTickets.filter(t=>t.status==="escalated").length}   color="#ef4444" icon={AlertTriangle} onClick={() => setStatusFilter(s => s === "escalated" ? "all" : "escalated")}   active={statusFilter === "escalated"} />
          <KPICard label="Resolved"    count={visibleTickets.filter(t=>t.status==="resolved").length}    color="#10b981" icon={CheckCircle2}  onClick={() => setStatusFilter(s => s === "resolved" ? "all" : "resolved")}    active={statusFilter === "resolved"} />
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-10 pr-8 py-2.5 text-[13px] outline-none rounded-xl"
            style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(99,102,241,0.15)", color: "#1e293b" }}
            placeholder="Search by subject, customer, ticket number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">✕</button>
          )}
        </div>

        {/* Priority filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {PRIORITY_FILTERS.map(p => {
            const cfg = PRIORITY_CFG[p];
            const active = priorityFilter === p;
            const cnt = p === "all" ? visibleTickets.length : visibleTickets.filter(t => t.priority === p).length;
            return (
              <button key={p} onClick={() => setPriorityFilter(p)}
                className="px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all hover:scale-105"
                style={{
                  background: active ? (cfg ? cfg.bg : "rgba(99,102,241,0.1)") : "rgba(255,255,255,0.9)",
                  border: active ? `1px solid ${cfg ? cfg.border : "rgba(99,102,241,0.3)"}` : "1px solid rgba(99,102,241,0.1)",
                  color: active ? (cfg ? cfg.color : "#6366f1") : "#94a3b8",
                }}>
                {p === "all" ? "All Priority" : p}
                <span className="ml-1 opacity-50 font-normal">({cnt})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Ticket List ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(99,102,241,0.1)",
          boxShadow: "0 4px 24px rgba(99,102,241,0.07)",
        }}>
        {/* Accent bar */}
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#f59e0b,#ef4444,#3b82f6,#10b981,transparent)" }} />

        {/* Column headers */}
        <div className="flex items-center gap-3 px-4 py-2.5"
          style={{ background: "linear-gradient(180deg,#f8f9ff,#f1f5ff)", borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
          <div className="w-9 flex-shrink-0" />
          <p className="hidden sm:block w-24 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 flex-shrink-0">Ticket #</p>
          <p className="flex-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Subject</p>
          <p className="hidden md:block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 flex-shrink-0">Priority</p>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 flex-shrink-0">Status</p>
          <p className="hidden lg:block w-24 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 flex-shrink-0">Dept</p>
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
              <TicketCheck className="w-6 h-6" style={{ color: "#6366f1" }} />
            </div>
            <p className="font-bold text-slate-500 text-[13px]">No tickets found</p>
            <p className="text-[11px] text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          filtered.map(t => (
            <TicketRow
              key={t.id}
              ticket={t}
              isAdmin={isAdmin}
              onEdit={(t) => { setEditing(t); setShowForm(true); }}
              onDelete={(id) => { if (confirm("Delete this ticket?")) deleteMut.mutate(id); }}
              onStatusChange={(id, status) => statusMut.mutate({ id, status })}
            />
          ))
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="px-4 py-2.5 flex items-center justify-between"
            style={{ background: "linear-gradient(180deg,#f8f9ff,#f1f5ff)", borderTop: "1px solid rgba(99,102,241,0.07)" }}>
            <p className="text-[11px] mono" style={{ color: "rgba(100,116,139,0.55)" }}>
              {filtered.length} of {visibleTickets.length} tickets
            </p>
            <div className="flex gap-3">
              {statusFilter !== "all" && (
                <button onClick={() => setStatusFilter("all")}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                  style={{ color: "#6366f1", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                  Clear filter
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <TicketForm
          ticket={editing}
          customers={customers}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}