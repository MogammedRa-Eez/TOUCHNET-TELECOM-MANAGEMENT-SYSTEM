import React, { useState, useMemo, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import LiveClock from "@/components/shared/LiveClock";
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
  open:             { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)",   label: "Open",        dot: "#fbbf24" },
  in_progress:      { color: "#00b4b4", bg: "rgba(0,180,180,0.12)",   border: "rgba(0,180,180,0.3)",    label: "In Progress", dot: "#00d4d4" },
  waiting_customer: { color: "#a855f7", bg: "rgba(168,85,247,0.12)",  border: "rgba(168,85,247,0.3)",   label: "Waiting",     dot: "#c084fc" },
  escalated:        { color: "#e02347", bg: "rgba(224,35,71,0.12)",   border: "rgba(224,35,71,0.3)",    label: "Escalated",   dot: "#ff3358" },
  resolved:         { color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)",   label: "Resolved",    dot: "#34d399" },
  closed:           { color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)",  label: "Closed",      dot: "#94a3b8" },
};

const PRIORITY_CFG = {
  low:      { color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.25)", label: "Low" },
  medium:   { color: "#00b4b4", bg: "rgba(0,180,180,0.1)",   border: "rgba(0,180,180,0.25)",   label: "Medium" },
  high:     { color: "#f97316", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.25)",  label: "High" },
  critical: { color: "#e02347", bg: "rgba(224,35,71,0.12)",  border: "rgba(224,35,71,0.3)",    label: "Critical" },
};

const STATUS_FILTERS   = ["all", "open", "in_progress", "escalated", "resolved", "closed"];
const PRIORITY_FILTERS = ["all", "low", "medium", "high", "critical"];

function TicketRow({ ticket, isAdmin, onEdit, onDelete, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const sc = STATUS_CFG[ticket.status] || STATUS_CFG.open;
  const pc = PRIORITY_CFG[ticket.priority] || PRIORITY_CFG.medium;
  const isCritical = ticket.priority === "critical";

  return (
    <div className="fx-data-row" style={{ borderBottom: "1px solid rgba(0,212,212,0.04)" }}>
      <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all group"
        onClick={() => setOpen(v => !v)}
        style={{ background: open ? `${sc.color}06` : "transparent" }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = "linear-gradient(90deg,rgba(0,212,212,0.05),transparent)"; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = open ? `${sc.color}06` : "transparent"; }}>
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black"
            style={{ background: `${pc.color}18`, border: `2px solid ${pc.color}40`, color: pc.color }}>
            {isCritical ? "🔴" : ticket.priority?.[0]?.toUpperCase()}
          </div>
          {isCritical && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse" style={{ border: "2px solid #1a1a1a" }} />}
        </div>

        <p className="hidden sm:block w-24 text-[11px] mono font-semibold flex-shrink-0" style={{ color: "#00b4b4" }}>{ticket.ticket_number || "—"}</p>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold truncate" style={{ color: "#e0e0e0" }}>{ticket.subject}</p>
          <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
            {ticket.customer_name || "No customer"} · {ticket.category?.replace(/_/g," ")}
          </p>
        </div>

        <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider flex-shrink-0"
          style={{ background: pc.bg, color: pc.color, border: `1px solid ${pc.border}` }}>{pc.label}</span>

        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider flex-shrink-0"
          style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
          {sc.label}
        </span>

        <p className="hidden lg:block w-24 text-[11px] capitalize flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
          {ticket.department?.replace(/_/g," ") || "—"}
        </p>

        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          {isAdmin && (
            <>
              <button onClick={() => onEdit(ticket)} className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <Pencil className="w-3.5 h-3.5" style={{ color: "#b0b0b0" }} />
              </button>
              <button onClick={() => onDelete(ticket.id)} className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(224,35,71,0.1)", border: "1px solid rgba(224,35,71,0.2)" }}>
                <Trash2 className="w-3.5 h-3.5" style={{ color: "#e02347" }} />
              </button>
            </>
          )}
        </div>

        {open ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: sc.color }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.2)" }} />}
      </div>

      {open && (
        <div className="px-5 pb-4 pt-2 space-y-3" style={{ background: "rgba(0,0,0,0.2)", borderTop: `1px solid ${sc.color}15` }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Assigned To",  value: ticket.assigned_to || "Unassigned", icon: User },
              { label: "Department",   value: ticket.department?.replace(/_/g," ") || "—", icon: Building2 },
              { label: "Category",     value: ticket.category?.replace(/_/g," ") || "—", icon: Tag },
              { label: "SLA Deadline", value: ticket.sla_deadline ? format(new Date(ticket.sla_deadline), "dd MMM yyyy HH:mm") : "None set", icon: Calendar },
            ].map(item => (
              <div key={item.label} className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <item.icon className="w-3 h-3" style={{ color: sc.color }} />
                  <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>{item.label}</p>
                </div>
                <p className="text-[12px] font-bold capitalize" style={{ color: "#e0e0e0" }}>{item.value}</p>
              </div>
            ))}
          </div>

          {ticket.description && (
            <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare className="w-3 h-3" style={{ color: sc.color }} />
                <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>Description</p>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{ticket.description}</p>
            </div>
          )}

          {ticket.resolution_notes && (
            <div className="rounded-xl px-4 py-3" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: "#10b981" }}>Resolution Notes</p>
              <p className="text-[12px]" style={{ color: "rgba(16,185,129,0.9)" }}>{ticket.resolution_notes}</p>
            </div>
          )}

          {isAdmin && (
            <div className="flex flex-wrap gap-2 pt-1">
              <p className="w-full text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>Quick Status</p>
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

export default function Tickets() {
  const { can, loading: rbacLoading, department, isAdmin } = useRBAC();
  const [showForm,       setShowForm]       = useState(false);
  const [editing,        setEditing]        = useState(null);
  const [search,         setSearch]         = useState("");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [confirmDelete,  setConfirmDelete]  = useState(null);
  const queryClient = useQueryClient();

  const handleExportCsv = () => {
    exportToCsv(filtered, [
      { key: "ticket_number", label: "Ticket #" }, { key: "subject", label: "Subject" },
      { key: "customer_name", label: "Customer" }, { key: "status", label: "Status" },
      { key: "priority", label: "Priority" }, { key: "category", label: "Category" },
      { key: "department", label: "Department" }, { key: "assigned_to", label: "Assigned To" },
    ], "tickets");
    toast.success("Tickets exported to CSV");
  };

  const { data: tickets = [], isLoading, refetch } = useQuery({ queryKey: ["tickets"], queryFn: () => base44.entities.Ticket.list("-created_date"), enabled: !rbacLoading && can("tickets") });
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: () => base44.entities.Customer.list(), enabled: !rbacLoading && can("tickets") });

  const createMut = useMutation({ mutationFn: (data) => base44.entities.Ticket.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tickets"] }); setShowForm(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => base44.entities.Ticket.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tickets"] }); setShowForm(false); setEditing(null); } });
  const deleteMut = useMutation({ mutationFn: (id) => base44.entities.Ticket.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tickets"] }) });
  const statusMut = useMutation({ mutationFn: ({ id, status }) => base44.entities.Ticket.update(id, { status }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tickets"] }) });

  const visibleTickets = isAdmin ? tickets : tickets.filter(t => !department || t.department === department);
  const filtered = useMemo(() => visibleTickets.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search || t.subject?.toLowerCase().includes(q) || t.ticket_number?.toLowerCase().includes(q) || t.customer_name?.toLowerCase().includes(q);
    return matchSearch && (statusFilter === "all" || t.status === statusFilter) && (priorityFilter === "all" || t.priority === priorityFilter);
  }), [visibleTickets, search, statusFilter, priorityFilter]);

  if (!rbacLoading && !can("tickets")) return <AccessDenied />;
  const handleSubmit = (data) => { if (editing) updateMut.mutate({ id: editing.id, data }); else createMut.mutate(data); };
  const criticalCount = visibleTickets.filter(t => t.priority === "critical" && !["resolved","closed"].includes(t.status)).length;

  return (
    <div className="p-4 lg:p-8 space-y-5 max-w-[1600px] mx-auto">

      {/* Ticker */}
      <div className="relative overflow-hidden rounded-xl h-8 flex items-center"
        style={{ background: criticalCount > 0 ? "rgba(224,35,71,0.06)" : "rgba(0,180,180,0.05)", border: `1px solid ${criticalCount > 0 ? "rgba(224,35,71,0.2)" : "rgba(0,180,180,0.15)"}` }}>
        <div className="absolute left-0 top-0 bottom-0 w-14 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg,#111111,transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-14 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg,#111111,transparent)" }} />
        <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center px-3" style={{ background: criticalCount > 0 ? "rgba(224,35,71,0.15)" : "rgba(0,180,180,0.15)", borderRight: `1px solid ${criticalCount > 0 ? "rgba(224,35,71,0.25)" : "rgba(0,180,180,0.25)"}` }}>
          <span className="text-[8px] font-black uppercase tracking-[0.3em] mono" style={{ color: criticalCount > 0 ? "#e02347" : "#00d4d4" }}>SLA</span>
        </div>
        <div className="ticker-track flex items-center gap-10 px-6 whitespace-nowrap ml-12">
          {["SUPPORT TICKETING","SLA MONITORING","PRIORITY ROUTING","ESCALATION ENGINE","WHATSAPP INTEGRATION","REAL-TIME SYNC","AI TRIAGE","DEPT ROUTING",
            "SUPPORT TICKETING","SLA MONITORING","PRIORITY ROUTING","ESCALATION ENGINE","WHATSAPP INTEGRATION","REAL-TIME SYNC","AI TRIAGE","DEPT ROUTING"
          ].map((t, i) => (
            <span key={i} className="text-[9px] font-black uppercase tracking-[0.2em] mono"
              style={{ color: i % 3 === 0 ? (criticalCount > 0 ? "#e02347" : "#00b4b4") : i % 3 === 1 ? "rgba(0,180,180,0.4)" : "#e02347" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-5"
        style={{ background: "linear-gradient(135deg,#141414,#1a1a1a)", border: `1px solid ${criticalCount > 0 ? "rgba(224,35,71,0.4)" : "rgba(0,180,180,0.28)"}`, boxShadow: `0 4px 40px rgba(0,0,0,0.6), 0 0 40px ${criticalCount > 0 ? "rgba(224,35,71,0.06)" : "rgba(0,180,180,0.04)"}` }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: criticalCount > 0 ? "linear-gradient(90deg,#e02347,#ff3358,rgba(255,255,255,0.3),#e02347,transparent)" : "linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.5),#00b4b4,#e02347,transparent)", animation: "border-rotate 5s ease infinite", backgroundSize: "300% auto" }} />
        <div className="absolute top-3 left-3 w-4 h-4 pointer-events-none" style={{ borderTop: `1.5px solid ${criticalCount > 0 ? "rgba(224,35,71,0.5)" : "rgba(0,212,212,0.5)"}`, borderLeft: `1.5px solid ${criticalCount > 0 ? "rgba(224,35,71,0.5)" : "rgba(0,212,212,0.5)"}` }} />
        <div className="absolute top-3 right-3 w-4 h-4 pointer-events-none" style={{ borderTop: "1.5px solid rgba(224,35,71,0.4)", borderRight: "1.5px solid rgba(224,35,71,0.4)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(0,212,212,0.04) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,180,180,0.15)", border: "1px solid rgba(0,180,180,0.4)", boxShadow: "0 0 14px rgba(0,180,180,0.2)" }}>
                <TicketCheck className="w-4.5 h-4.5" style={{ color: "#00b4b4" }} />
              </div>
              <h1 className="text-xl font-black tracking-tight" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk', sans-serif" }}>Support Tickets</h1>
              {criticalCount > 0 && (
                <span className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg"
                  style={{ background: "rgba(224,35,71,0.15)", border: "1px solid rgba(224,35,71,0.45)", color: "#e02347", animation: "neon-pulse-crimson 2s ease-in-out infinite" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#e02347" }} /> {criticalCount} CRITICAL
                </span>
              )}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10b981", boxShadow: "0 0 5px #10b981" }} />
                <LiveClock style={{ fontSize: 9, fontWeight: 800, color: "#10b981", letterSpacing: "0.1em" }} />
              </div>
            </div>
            <p className="text-[11px] mono pl-11" style={{ color: "rgba(255,255,255,0.35)" }}>
              {visibleTickets.length} tickets · <span style={{ color: "#f59e0b" }}>{visibleTickets.filter(t=>!["resolved","closed"].includes(t.status)).length} open</span>
              {criticalCount > 0 && <span style={{ color: "#e02347" }}> · {criticalCount} critical</span>}
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
                <Plus className="w-4 h-4" /> New Ticket
              </button>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Banner */}
      <div className="flex items-center gap-4 px-5 py-4 rounded-2xl"
        style={{ background: "rgba(37,211,102,0.07)", border: "1px solid rgba(37,211,102,0.2)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", boxShadow: "0 4px 14px rgba(37,211,102,0.3)" }}>
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-black" style={{ color: "#f0f0f0" }}>WhatsApp Support — Two-Way Ticket Integration</p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Customers can raise &amp; track tickets directly via WhatsApp.</p>
        </div>
        <a href={base44.agents.getWhatsAppConnectURL('touchnet_assistant')} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white flex-shrink-0 transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", boxShadow: "0 3px 10px rgba(37,211,102,0.35)" }}>
          <ExternalLink className="w-3.5 h-3.5" /> Connect WhatsApp
        </a>
      </div>

      <SLAWorkflowPanel />

      {/* KPI Strip */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Open",        count: visibleTickets.filter(t=>t.status==="open").length,        color: "#f59e0b", icon: Clock,         filter: "open" },
            { label: "In Progress", count: visibleTickets.filter(t=>t.status==="in_progress").length, color: "#00b4b4", icon: TicketCheck,   filter: "in_progress" },
            { label: "Escalated",   count: visibleTickets.filter(t=>t.status==="escalated").length,   color: "#e02347", icon: AlertTriangle, filter: "escalated" },
            { label: "Resolved",    count: visibleTickets.filter(t=>t.status==="resolved").length,    color: "#10b981", icon: CheckCircle2,  filter: "resolved" },
          ].map(({ label, count, color, icon: Ic, filter }) => {
            const active = statusFilter === filter;
            return (
              <button key={filter} onClick={() => setStatusFilter(s => s === filter ? "all" : filter)}
                className="relative overflow-hidden rounded-2xl px-4 py-4 text-left w-full transition-all hover:scale-[1.02]"
                style={{
                  background: active ? `${color}12` : "#181818",
                  border: `1px solid ${active ? color + "50" : "rgba(255,255,255,0.07)"}`,
                  boxShadow: active ? `0 4px 20px ${color}20` : "0 2px 12px rgba(0,0,0,0.3)",
                }}>
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
                    <p className="text-3xl font-black mono" style={{ color, fontFamily: "'JetBrains Mono',monospace" }}>{count}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                    <Ic className="w-4 h-4" style={{ color }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} />
          <input
            className="w-full pl-10 pr-8 py-2.5 text-[13px] outline-none rounded-xl transition-all"
            style={{ background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)", color: "#e0e0e0" }}
            placeholder="Search by subject, customer, ticket number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>✕</button>}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {PRIORITY_FILTERS.map(p => {
            const cfg = PRIORITY_CFG[p];
            const active = priorityFilter === p;
            const cnt = p === "all" ? visibleTickets.length : visibleTickets.filter(t => t.priority === p).length;
            return (
              <button key={p} onClick={() => setPriorityFilter(p)}
                className="px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all hover:scale-105"
                style={{
                  background: active ? (cfg ? cfg.bg : "rgba(0,180,180,0.12)") : "rgba(255,255,255,0.04)",
                  border: active ? `1px solid ${cfg ? cfg.border : "rgba(0,180,180,0.4)"}` : "1px solid rgba(255,255,255,0.08)",
                  color: active ? (cfg ? cfg.color : "#00b4b4") : "rgba(255,255,255,0.35)",
                }}>
                {p === "all" ? "All" : p}<span className="ml-1 opacity-50 font-normal">({cnt})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ticket List */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#181818", border: "1px solid rgba(0,212,212,0.15)", boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,212,0.04)" }}>
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.4),#00b4b4,#e02347,transparent)" }} />
        <div className="flex items-center gap-3 px-4 py-2.5" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="w-9 flex-shrink-0" />
          <p className="hidden sm:block w-24 text-[9px] font-black uppercase tracking-[0.18em] flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>Ticket #</p>
          <p className="flex-1 text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.3)" }}>Subject</p>
          <p className="hidden md:block text-[9px] font-black uppercase tracking-[0.18em] flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>Priority</p>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>Status</p>
          <p className="hidden lg:block w-24 text-[9px] font-black uppercase tracking-[0.18em] flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>Dept</p>
          <div className="w-20 flex-shrink-0" />
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(0,180,180,0.1)", border: "1px solid rgba(0,180,180,0.2)" }}>
              <TicketCheck className="w-6 h-6" style={{ color: "#00b4b4" }} />
            </div>
            <p className="font-bold text-[13px]" style={{ color: "#f0f0f0" }}>No tickets found</p>
            <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Try adjusting your filters</p>
          </div>
        ) : (
          filtered.map(t => (
            <TicketRow key={t.id} ticket={t} isAdmin={isAdmin}
              onEdit={(t) => { setEditing(t); setShowForm(true); }}
              onDelete={(id) => setConfirmDelete(id)}
              onStatusChange={(id, status) => statusMut.mutate({ id, status })} />
          ))
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[11px] mono" style={{ color: "rgba(255,255,255,0.35)" }}>{filtered.length} of {visibleTickets.length} tickets</p>
            {statusFilter !== "all" && (
              <button onClick={() => setStatusFilter("all")} className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                style={{ color: "#00b4b4", background: "rgba(0,180,180,0.1)", border: "1px solid rgba(0,180,180,0.2)" }}>
                Clear filter
              </button>
            )}
          </div>
        )}
      </div>

      {showForm && <TicketForm ticket={editing} customers={customers} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditing(null); }} />}
      {confirmDelete && (
        <ConfirmDialog title="Delete Ticket?" message="This will permanently remove the ticket."
          onConfirm={() => { deleteMut.mutate(confirmDelete); setConfirmDelete(null); toast.success("Ticket deleted"); }}
          onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  );
}