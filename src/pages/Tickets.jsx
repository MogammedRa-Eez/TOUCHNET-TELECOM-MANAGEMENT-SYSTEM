import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, Pencil, Trash2, TicketCheck, AlertTriangle, Clock,
  CheckCircle2, ChevronDown, ChevronUp, RefreshCw,
  User, Building2, Tag, Calendar, MessageSquare, Zap,
  Smartphone, ExternalLink, Download
} from "lucide-react";
import { toast } from "sonner";
import { exportToCsv } from "@/utils/exportCsv";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import SLAWorkflowPanel from "@/components/tickets/SLAWorkflowPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import TicketForm from "../components/tickets/TicketForm";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";

const STATUS_CFG = {
  open:             { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)",   label: "Open",        dot: "#fbbf24" },
  in_progress:      { color: "#3b82f6", bg: "rgba(59,130,246,0.1)",   border: "rgba(59,130,246,0.25)",   label: "In Progress", dot: "#60a5fa" },
  waiting_customer: { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",   border: "rgba(139,92,246,0.25)",   label: "Waiting",     dot: "#a78bfa" },
  escalated:        { color: "#ef4444", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.25)",    label: "Escalated",   dot: "#f87171" },
  resolved:         { color: "#10b981", bg: "rgba(16,185,129,0.1)",   border: "rgba(16,185,129,0.25)",   label: "Resolved",    dot: "#34d399" },
  closed:           { color: "#64748b", bg: "rgba(100,116,139,0.07)", border: "rgba(100,116,139,0.2)",   label: "Closed",      dot: "#94a3b8" },
};

const PRIORITY_CFG = {
  low:      { color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.22)", label: "Low" },
  medium:   { color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.22)",  label: "Medium" },
  high:     { color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.22)",  label: "High" },
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.28)",   label: "Critical" },
};

const STATUS_FILTERS   = ["all", "open", "in_progress", "escalated", "resolved", "closed"];
const PRIORITY_FILTERS = ["all", "low", "medium", "high", "critical"];


// ── Expandable Ticket Row ─────────────────────────────────────────────────────
function TicketRow({ ticket, isAdmin, onEdit, onDelete, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const sc = STATUS_CFG[ticket.status] || STATUS_CFG.open;
  const pc = PRIORITY_CFG[ticket.priority] || PRIORITY_CFG.medium;
  const isCritical = ticket.priority === "critical";

  return (
    <div style={{ borderBottom: "1px solid rgba(30,45,110,0.06)" }}>
      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all group"
        onClick={() => setOpen(v => !v)}
        style={{ background: open ? `${sc.color}06` : "transparent" }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = "rgba(30,45,110,0.04)"; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = open ? `${sc.color}06` : "transparent"; }}
      >
        {/* Priority ring indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black"
            style={{ background: `${pc.color}12`, border: `2px solid ${pc.color}35`, color: pc.color }}>
            {isCritical ? "🔴" : ticket.priority?.[0]?.toUpperCase()}
          </div>
          {isCritical && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse border-2 border-white" />
          )}
        </div>

        {/* Ticket # */}
        <p className="hidden sm:block w-24 text-[11px] mono font-semibold flex-shrink-0" style={{ color: "#1e2d6e" }}>
          {ticket.ticket_number || "—"}
        </p>

        {/* Subject + customer */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold truncate" style={{ color: "#0f1a3d" }}>{ticket.subject}</p>
          <p className="text-[10px] truncate" style={{ color: "rgba(30,45,110,0.5)" }}>
            {ticket.customer_name || "No customer"} · {ticket.category?.replace(/_/g," ")}
          </p>
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
        <p className="hidden lg:block w-24 text-[11px] capitalize flex-shrink-0" style={{ color: "rgba(30,45,110,0.45)" }}>
          {ticket.department?.replace(/_/g," ") || "—"}
        </p>

        {/* Actions (hover) */}
        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          {isAdmin && (
            <>
              <button onClick={() => onEdit(ticket)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "rgba(100,116,139,0.08)", border: "1px solid rgba(100,116,139,0.2)" }}>
                <Pencil className="w-3.5 h-3.5" style={{ color: "#64748b" }} />
              </button>
              <button onClick={() => onDelete(ticket.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
                <Trash2 className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
              </button>
            </>
          )}
        </div>

        {open
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: sc.color }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(30,45,110,0.3)" }} />}
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="px-5 pb-4 pt-2 space-y-3"
          style={{ background: "rgba(30,45,110,0.03)", borderTop: `1px solid ${sc.color}15` }}>
          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Assigned To",  value: ticket.assigned_to || "Unassigned",                                          icon: User },
              { label: "Department",   value: ticket.department?.replace(/_/g," ") || "—",                                 icon: Building2 },
              { label: "Category",     value: ticket.category?.replace(/_/g," ") || "—",                                   icon: Tag },
              { label: "SLA Deadline", value: ticket.sla_deadline ? format(new Date(ticket.sla_deadline), "dd MMM yyyy HH:mm") : "None set", icon: Calendar },
            ].map(item => (
              <div key={item.label} className="rounded-xl px-3 py-2.5"
                style={{ background: "rgba(30,45,110,0.05)", border: "1px solid rgba(30,45,110,0.1)" }}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <item.icon className="w-3 h-3" style={{ color: sc.color }} />
                  <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: "rgba(30,45,110,0.45)" }}>{item.label}</p>
                </div>
                <p className="text-[12px] font-bold capitalize" style={{ color: "#0f1a3d" }}>{item.value}</p>
              </div>
            ))}
          </div>

          {ticket.description && (
            <div className="rounded-xl px-4 py-3"
              style={{ background: "rgba(30,45,110,0.04)", border: "1px solid rgba(30,45,110,0.1)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare className="w-3 h-3" style={{ color: sc.color }} />
                <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: "rgba(30,45,110,0.45)" }}>Description</p>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: "rgba(30,45,110,0.75)" }}>{ticket.description}</p>
            </div>
          )}

          {ticket.resolution_notes && (
            <div className="rounded-xl px-4 py-3"
              style={{ background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.2)" }}>
              <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: "#059669" }}>Resolution Notes</p>
              <p className="text-[12px]" style={{ color: "rgba(5,150,105,0.85)" }}>{ticket.resolution_notes}</p>
            </div>
          )}

          {/* Quick status actions for admins */}
          {isAdmin && (
            <div className="flex flex-wrap gap-2 pt-1">
              <p className="w-full text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(30,45,110,0.4)" }}>Quick Status</p>
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
  const [tick,           setTick]           = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 4000);
    return () => clearInterval(id);
  }, []);
  const [editing,        setEditing]        = useState(null);
  const [search,         setSearch]         = useState("");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [confirmDelete,  setConfirmDelete]  = useState(null);
  const queryClient = useQueryClient();

  const handleExportCsv = () => {
    exportToCsv(filtered, [
      { key: "ticket_number", label: "Ticket #" },
      { key: "subject",       label: "Subject" },
      { key: "customer_name", label: "Customer" },
      { key: "status",        label: "Status" },
      { key: "priority",      label: "Priority" },
      { key: "category",      label: "Category" },
      { key: "department",    label: "Department" },
      { key: "assigned_to",   label: "Assigned To" },
    ], "tickets");
    toast.success("Tickets exported to CSV");
  };

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

  if (!rbacLoading && !can("tickets")) return <AccessDenied />;

  const handleSubmit = (data) => {
    if (editing) updateMut.mutate({ id: editing.id, data });
    else createMut.mutate(data);
  };

  const criticalCount = visibleTickets.filter(t => t.priority === "critical" && !["resolved","closed"].includes(t.status)).length;

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-[1600px] mx-auto">

      {/* ── Ticker ── */}
      <div className="relative overflow-hidden rounded-xl h-8 flex items-center section-reveal"
        style={{ background: "rgba(30,45,110,0.04)", border: "1px solid rgba(30,45,110,0.1)" }}>
        <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg,rgba(240,242,248,0.98),transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg,rgba(240,242,248,0.98),transparent)" }} />
        <div className="ticker-track flex items-center gap-10 px-6 whitespace-nowrap">
          {["SUPPORT TICKETING", "SLA MONITORING", "PRIORITY ROUTING", "ESCALATION ENGINE", "WHATSAPP INTEGRATION", "REAL-TIME SYNC",
            "SUPPORT TICKETING", "SLA MONITORING", "PRIORITY ROUTING", "ESCALATION ENGINE", "WHATSAPP INTEGRATION", "REAL-TIME SYNC"
          ].map((t, i) => (
            <span key={i} className="text-[9px] font-black uppercase tracking-[0.2em] mono"
              style={{ color: i % 3 === 0 ? "#1e2d6e" : i % 3 === 1 ? "rgba(30,45,110,0.35)" : "#c41e3a" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-5 bracket-card"
        style={{ background: "rgba(255,255,255,0.96)", border: "1px solid rgba(30,45,110,0.12)", boxShadow: "0 4px 24px rgba(30,45,110,0.08)" }}>
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,#c41e3a,transparent)" }} />
        {criticalCount > 0 && (
          <div className="absolute top-0 right-0 bottom-0 w-1" style={{ background: "rgba(196,30,58,0.6)", animation: "pulse 1.5s ease-in-out infinite" }} />
        )}
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(30,45,110,0.07)", border: "1px solid rgba(30,45,110,0.15)" }}>
                <TicketCheck className="w-4 h-4" style={{ color: "#1e2d6e" }} />
              </div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: "#0f1a3d", fontFamily: "'Space Grotesk', sans-serif" }}>Support Tickets</h1>
              {criticalCount > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg animate-pulse"
                  style={{ background: "rgba(196,30,58,0.1)", border: "1px solid rgba(196,30,58,0.3)", color: "#c41e3a" }}>
                  🔴 {criticalCount} CRITICAL
                </span>
              )}
            </div>
            <p className="text-[11px] mono pl-10" style={{ color: "rgba(30,45,110,0.5)" }}>
              {visibleTickets.length} tickets · {visibleTickets.filter(t=>!["resolved","closed"].includes(t.status)).length} open
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
              style={{ background: "rgba(30,45,110,0.07)", border: "1px solid rgba(30,45,110,0.15)", color: "#1e2d6e" }}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
              style={{ background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)", color: "#059669" }}>
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            {isAdmin && (
              <button onClick={() => { setEditing(null); setShowForm(true); }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)", boxShadow: "0 4px 20px rgba(30,45,110,0.3)" }}>
                <Plus className="w-4 h-4" /> New Ticket
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── WhatsApp Support Banner ── */}
      <div className="flex items-center gap-4 px-5 py-4 rounded-2xl"
        style={{ background: "rgba(37,211,102,0.05)", border: "1px solid rgba(37,211,102,0.2)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", boxShadow: "0 4px 14px rgba(37,211,102,0.3)" }}>
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-black" style={{ color: "#0f1a3d" }}>WhatsApp Support — Two-Way Ticket Integration</p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(30,45,110,0.55)" }}>
            Customers can raise &amp; track tickets directly via WhatsApp. Tickets sync automatically into this dashboard.
          </p>
        </div>
        <a href={base44.agents.getWhatsAppConnectURL('touchnet_assistant')} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white flex-shrink-0 transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", boxShadow: "0 3px 10px rgba(37,211,102,0.35)" }}>
          <ExternalLink className="w-3.5 h-3.5" /> Connect WhatsApp
        </a>
      </div>

      {/* ── SLA Panel ── */}
      <SLAWorkflowPanel />

      {/* ── KPI Strip (clickable filters) ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Open",        count: visibleTickets.filter(t=>t.status==="open").length,        color: "#f59e0b", icon: Clock,         filter: "open" },
            { label: "In Progress", count: visibleTickets.filter(t=>t.status==="in_progress").length, color: "#1e2d6e", icon: TicketCheck,   filter: "in_progress" },
            { label: "Escalated",   count: visibleTickets.filter(t=>t.status==="escalated").length,   color: "#c41e3a", icon: AlertTriangle, filter: "escalated" },
            { label: "Resolved",    count: visibleTickets.filter(t=>t.status==="resolved").length,    color: "#059669", icon: CheckCircle2,  filter: "resolved" },
          ].map(({ label, count, color, icon: Ic, filter }) => {
            const active = statusFilter === filter;
            return (
              <button key={filter} onClick={() => setStatusFilter(s => s === filter ? "all" : filter)}
                className="relative overflow-hidden rounded-2xl px-4 py-4 text-left w-full transition-all hover:scale-[1.02]"
                style={{
                  background: active ? `${color}10` : "#ffffff",
                  border: `1px solid ${active ? color + "40" : "rgba(30,45,110,0.12)"}`,
                  boxShadow: active ? `0 4px 20px ${color}18` : "0 2px 8px rgba(30,45,110,0.06)",
                }}>
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: "rgba(30,45,110,0.45)" }}>{label}</p>
                    <p className="text-3xl font-black mono" style={{ color }}>{count}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                    <Ic className="w-4 h-4" style={{ color }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
          <input
            className="w-full pl-10 pr-8 py-2.5 text-[13px] outline-none rounded-xl transition-all"
            style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.2)", color: "#0f1a3d", boxShadow: "0 2px 8px rgba(30,45,110,0.06)" }}
            placeholder="Search by subject, customer, ticket number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black"
              style={{ color: "#94a3b8" }}>✕</button>
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
                  background: active ? (cfg ? cfg.bg : "rgba(30,45,110,0.1)") : "rgba(30,45,110,0.04)",
                  border: active ? `1px solid ${cfg ? cfg.border : "rgba(30,45,110,0.3)"}` : "1px solid rgba(30,45,110,0.1)",
                  color: active ? (cfg ? cfg.color : "#1e2d6e") : "rgba(30,45,110,0.5)",
                }}>
                {p === "all" ? "All" : p}
                <span className="ml-1 opacity-50 font-normal">({cnt})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Ticket List ── */}
      <div className="rounded-2xl overflow-hidden bracket-card"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(30,45,110,0.12)",
          boxShadow: "0 4px 24px rgba(30,45,110,0.08)",
        }}>
        {/* Accent bar */}
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,#c41e3a,transparent)" }} />

        {/* Column headers */}
        <div className="flex items-center gap-3 px-4 py-2.5"
          style={{ background: "rgba(30,45,110,0.04)", borderBottom: "1px solid rgba(30,45,110,0.08)" }}>
          <div className="w-9 flex-shrink-0" />
          <p className="hidden sm:block w-24 text-[9px] font-black uppercase tracking-[0.18em] flex-shrink-0" style={{ color: "rgba(30,45,110,0.45)" }}>Ticket #</p>
          <p className="flex-1 text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(30,45,110,0.45)" }}>Subject</p>
          <p className="hidden md:block text-[9px] font-black uppercase tracking-[0.18em] flex-shrink-0" style={{ color: "rgba(30,45,110,0.45)" }}>Priority</p>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] flex-shrink-0" style={{ color: "rgba(30,45,110,0.45)" }}>Status</p>
          <p className="hidden lg:block w-24 text-[9px] font-black uppercase tracking-[0.18em] flex-shrink-0" style={{ color: "rgba(30,45,110,0.45)" }}>Dept</p>
          <div className="w-20 flex-shrink-0" />
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: "rgba(30,45,110,0.06)", border: "1px solid rgba(30,45,110,0.15)" }}>
              <TicketCheck className="w-6 h-6" style={{ color: "#1e2d6e" }} />
            </div>
            <p className="font-bold text-[13px]" style={{ color: "#1e2d6e" }}>No tickets found</p>
            <p className="text-[11px] mt-1" style={{ color: "rgba(30,45,110,0.45)" }}>Try adjusting your filters</p>
          </div>
        ) : (
          filtered.map(t => (
            <TicketRow
              key={t.id}
              ticket={t}
              isAdmin={isAdmin}
              onEdit={(t) => { setEditing(t); setShowForm(true); }}
              onDelete={(id) => setConfirmDelete(id)}
              onStatusChange={(id, status) => statusMut.mutate({ id, status })}
            />
          ))
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="px-4 py-2.5 flex items-center justify-between"
            style={{ background: "rgba(30,45,110,0.03)", borderTop: "1px solid rgba(30,45,110,0.08)" }}>
            <p className="text-[11px] mono" style={{ color: "rgba(30,45,110,0.45)" }}>
              {filtered.length} of {visibleTickets.length} tickets
            </p>
            <div className="flex gap-3">
              {statusFilter !== "all" && (
                <button onClick={() => setStatusFilter("all")}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                  style={{ color: "#1e2d6e", background: "rgba(30,45,110,0.07)", border: "1px solid rgba(30,45,110,0.15)" }}>
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

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Ticket?"
          message="This will permanently remove the ticket. This action cannot be undone."
          onConfirm={() => { deleteMut.mutate(confirmDelete); setConfirmDelete(null); toast.success("Ticket deleted"); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}