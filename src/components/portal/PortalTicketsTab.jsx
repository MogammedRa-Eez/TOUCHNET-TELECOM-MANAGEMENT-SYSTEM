import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  TicketCheck, Plus, AlertCircle, ArrowUpCircle, CheckCircle,
  XCircle, Clock, Loader2, X, ChevronDown, ChevronUp, Send
} from "lucide-react";

const PRIORITY_CFG = {
  low:      { color: "#64748b", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.25)" },
  medium:   { color: "#06b6d4", bg: "rgba(6,182,212,0.12)",  border: "rgba(6,182,212,0.25)"  },
  high:     { color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.25)" },
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.25)"  },
};

const STATUS_CFG = {
  open:             { label: "Open",             color: "#3b82f6", icon: AlertCircle },
  in_progress:      { label: "In Progress",      color: "#f59e0b", icon: ArrowUpCircle },
  waiting_customer: { label: "Waiting on You",   color: "#f97316", icon: Clock },
  escalated:        { label: "Escalated",        color: "#ef4444", icon: AlertCircle },
  resolved:         { label: "Resolved",         color: "#10b981", icon: CheckCircle },
  closed:           { label: "Closed",           color: "#64748b", icon: XCircle },
};

const CATEGORIES = ["connectivity", "billing", "installation", "speed_issue", "hardware", "security", "general"];
const PRIORITIES  = ["low", "medium", "high", "critical"];

export default function PortalTicketsTab({ customer, user }) {
  const [showForm,   setShowForm]   = useState(false);
  const [expanded,   setExpanded]   = useState(null);
  const [form, setForm]             = useState({ subject: "", description: "", category: "general", priority: "medium" });
  const queryClient                 = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["portal-tickets-main", customer.id],
    queryFn: () => base44.entities.Ticket.filter({ customer_id: customer.id }, "-created_date"),
    enabled: !!customer.id,
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Ticket.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-tickets-main", customer.id] });
      setShowForm(false);
      setForm({ subject: "", description: "", category: "general", priority: "medium" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;
    createMut.mutate({
      ...form,
      customer_id:   customer.id,
      customer_name: customer.full_name,
      ticket_number: `TKT-${Date.now().toString().slice(-6)}`,
      status: "open",
    });
  };

  const openCount     = tickets.filter(t => !["resolved","closed"].includes(t.status)).length;
  const resolvedCount = tickets.filter(t => ["resolved","closed"].includes(t.status)).length;

  return (
    <div className="space-y-4">

      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {openCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" style={{ boxShadow: "0 0 6px #3b82f6" }} />
              <span className="text-[11px] font-bold" style={{ color: "#60a5fa" }}>{openCount} open</span>
            </div>
          )}
          {resolvedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
              <CheckCircle className="w-3 h-3" style={{ color: "#10b981" }} />
              <span className="text-[11px] font-bold" style={{ color: "#34d399" }}>{resolvedCount} resolved</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? "Cancel" : "New Ticket"}
        </button>
      </div>

      {/* New Ticket Form */}
      {showForm && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.3)", boxShadow: "0 0 32px rgba(99,102,241,0.1)" }}>
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }} />
          <div className="p-5">
            <h3 className="font-black text-white text-[14px] mb-4">Submit a Support Request</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.35)" }}>Subject *</label>
                <input
                  className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none text-white placeholder:text-white/20 transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                  placeholder="Brief description of your issue"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.35)" }}>Description *</label>
                <textarea
                  className="w-full rounded-xl px-3 py-2.5 text-[13px] resize-none outline-none text-white placeholder:text-white/20"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                  rows={4}
                  placeholder="Please describe the issue in detail…"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.35)" }}>Category</label>
                  <select
                    className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none text-white"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c} style={{ background: "#1e293b" }}>{c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.35)" }}>Priority</label>
                  <div className="grid grid-cols-2 gap-1">
                    {PRIORITIES.map(p => {
                      const pc = PRIORITY_CFG[p];
                      return (
                        <button key={p} type="button"
                          onClick={() => setForm(f => ({ ...f, priority: p }))}
                          className="py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                          style={{
                            background: form.priority === p ? pc.bg : "rgba(255,255,255,0.04)",
                            border: `1px solid ${form.priority === p ? pc.border : "rgba(255,255,255,0.08)"}`,
                            color: form.priority === p ? pc.color : "rgba(255,255,255,0.3)",
                          }}>
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={createMut.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
                {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {createMut.isPending ? "Submitting…" : "Submit Support Ticket"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Ticket List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#06b6d4" }} />
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl p-12 text-center"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(6,182,212,0.12)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
            <TicketCheck className="w-6 h-6" style={{ color: "#06b6d4" }} />
          </div>
          <p className="font-bold text-white/60 mb-1">No Support Tickets</p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Submit a ticket above and we'll be in touch shortly.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map(t => {
            const sc   = STATUS_CFG[t.status] || STATUS_CFG.open;
            const pc   = PRIORITY_CFG[t.priority] || PRIORITY_CFG.medium;
            const Icon = sc.icon;
            const isEx = expanded === t.id;
            return (
              <div key={t.id} className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${sc.color}18` }}>
                <button className="w-full p-4 flex items-start gap-3 text-left transition-all"
                  onClick={() => setExpanded(isEx ? null : t.id)}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${sc.color}12`, border: `1px solid ${sc.color}25` }}>
                    <Icon className="w-4 h-4" style={{ color: sc.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-white text-[13px]">{t.subject}</p>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase mono"
                        style={{ background: pc.bg, color: pc.color, border: `1px solid ${pc.border}` }}>
                        {t.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-semibold" style={{ color: sc.color }}>{sc.label}</span>
                      {t.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded capitalize"
                          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>
                          {t.category.replace(/_/g," ")}
                        </span>
                      )}
                      {t.ticket_number && (
                        <span className="text-[10px] mono" style={{ color: "rgba(99,102,241,0.6)" }}>{t.ticket_number}</span>
                      )}
                    </div>
                  </div>
                  {isEx
                    ? <ChevronUp className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: "rgba(255,255,255,0.3)" }} />
                    : <ChevronDown className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: "rgba(255,255,255,0.3)" }} />}
                </button>

                {isEx && (
                  <div className="px-4 pb-4 pt-1 space-y-2" style={{ borderTop: `1px solid ${sc.color}12` }}>
                    <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{t.description}</p>
                    {t.resolution_notes && (
                      <div className="rounded-xl px-4 py-3" style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.15)" }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#10b981" }}>Resolution</p>
                        <p className="text-[12px]" style={{ color: "#6ee7b7" }}>{t.resolution_notes}</p>
                      </div>
                    )}
                    {t.assigned_to && (
                      <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>Assigned to: <span className="text-white/50">{t.assigned_to}</span></p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}