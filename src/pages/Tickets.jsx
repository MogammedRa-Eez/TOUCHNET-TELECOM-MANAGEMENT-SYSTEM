import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, TicketCheck, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import TicketForm from "../components/tickets/TicketForm";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";

const statusColors = {
  open: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "rgba(245,158,11,0.3)" },
  in_progress: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "rgba(59,130,246,0.3)" },
  waiting_customer: { bg: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "rgba(139,92,246,0.3)" },
  escalated: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", border: "rgba(239,68,68,0.3)" },
  resolved: { bg: "rgba(16,185,129,0.1)", color: "#10b981", border: "rgba(16,185,129,0.3)" },
  closed: { bg: "rgba(100,116,139,0.1)", color: "#64748b", border: "rgba(100,116,139,0.3)" },
};

const priorityColors = {
  low: { bg: "rgba(100,116,139,0.1)", color: "#64748b" },
  medium: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6" },
  high: { bg: "rgba(249,115,22,0.1)", color: "#f97316" },
  critical: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
};

export default function Tickets() {
  const { can, loading: rbacLoading } = useRBAC();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const queryClient = useQueryClient();

  if (!rbacLoading && !can("tickets")) return <AccessDenied />;

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => base44.entities.Ticket.list("-created_date"),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list(),
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

  const handleSubmit = (data) => {
    if (editing) updateMut.mutate({ id: editing.id, data });
    else createMut.mutate(data);
  };

  const filtered = tickets.filter(t => {
    const matchSearch = !search || t.subject?.toLowerCase().includes(search.toLowerCase()) || t.ticket_number?.toLowerCase().includes(search.toLowerCase()) || t.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#1e293b" }}>Support Tickets</h1>
          <p className="text-[11px] mt-0.5 mono" style={{ color: "rgba(100,116,139,0.55)" }}>Track and resolve customer issues</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="text-white text-sm" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <Plus className="w-4 h-4 mr-2" /> New Ticket
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Open", count: tickets.filter(t => t.status === "open").length, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", icon: Clock },
          { label: "In Progress", count: tickets.filter(t => t.status === "in_progress").length, color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", icon: TicketCheck },
          { label: "Escalated", count: tickets.filter(t => t.status === "escalated").length, color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", icon: AlertTriangle },
          { label: "Resolved", count: tickets.filter(t => t.status === "resolved").length, color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", icon: CheckCircle2 },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 flex items-center gap-3" style={{ background: "#0a0f2e", border: `1px solid ${s.border}` }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
              <s.icon style={{ width: 18, height: 18, color: s.color }} />
            </div>
            <div>
              <p className="text-[20px] font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.count}</p>
              <p className="text-[11px] font-medium" style={{ color: s.color }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4 flex flex-col sm:flex-row gap-3" style={{ background: "#0a0f2e", border: "1px solid rgba(99,102,241,0.15)" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input placeholder="Search tickets..." className="pl-10 bg-transparent border-slate-700 text-slate-200 placeholder-slate-600" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-transparent border-slate-700 text-slate-300"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="bg-[#0d1527] border-slate-700 text-slate-200">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36 bg-transparent border-slate-700 text-slate-300"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent className="bg-[#0d1527] border-slate-700 text-slate-200">
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: "#0a0f2e", border: "1px solid rgba(99,102,241,0.15)" }}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ background: "#070b1f", borderBottom: "1px solid rgba(99,102,241,0.12)" }}>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Ticket #</TableHead>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Subject</TableHead>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Customer</TableHead>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Priority</TableHead>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Status</TableHead>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Department</TableHead>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Assigned</TableHead>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => <TableRow key={i} style={{ borderBottom: "1px solid rgba(6,182,212,0.06)" }}><TableCell colSpan={8}><Skeleton className="h-8 w-full bg-slate-800" /></TableCell></TableRow>)
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                    <TicketCheck className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                    No tickets found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(t => {
                  const sc = statusColors[t.status] || statusColors.open;
                  const pc = priorityColors[t.priority] || priorityColors.medium;
                  return (
                  <TableRow key={t.id} style={{ borderBottom: "1px solid rgba(6,182,212,0.06)" }} className="hover:bg-cyan-500/5 transition-colors">
                    <TableCell className="text-[11px] text-cyan-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{t.ticket_number || "—"}</TableCell>
                    <TableCell>
                      <p className="font-medium text-[13px] text-slate-200 max-w-[200px] truncate">{t.subject}</p>
                    </TableCell>
                    <TableCell className="text-[12px] text-slate-400">{t.customer_name || "—"}</TableCell>
                    <TableCell>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ background: pc.bg, color: pc.color, fontFamily: "'JetBrains Mono', monospace" }}>{t.priority}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontFamily: "'JetBrains Mono', monospace" }}>{t.status?.replace(/_/g, " ")}</span>
                    </TableCell>
                    <TableCell className="text-[12px] text-slate-400 capitalize">{t.department?.replace(/_/g, " ") || "—"}</TableCell>
                    <TableCell className="text-[12px] text-slate-400">{t.assigned_to || "Unassigned"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-slate-800" onClick={() => { setEditing(t); setShowForm(true); }}>
                          <Pencil className="w-3.5 h-3.5 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-900/20" onClick={() => { if (confirm("Delete this ticket?")) deleteMut.mutate(t.id); }}>
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )})
              )}
            </TableBody>
          </Table>
        </div>
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