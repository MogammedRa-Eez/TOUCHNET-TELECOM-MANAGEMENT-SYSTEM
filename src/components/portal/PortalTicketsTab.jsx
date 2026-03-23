import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  TicketCheck, Plus, AlertCircle, ArrowUpCircle, CheckCircle, XCircle, Clock, Loader2, X
} from "lucide-react";

const PRIORITY_COLOR = {
  low:      "bg-slate-100 text-slate-500",
  medium:   "bg-blue-100 text-blue-600",
  high:     "bg-orange-100 text-orange-600",
  critical: "bg-red-100 text-red-600",
};

const STATUS_ICON = {
  open:             <AlertCircle className="w-4 h-4 text-blue-500" />,
  in_progress:      <ArrowUpCircle className="w-4 h-4 text-yellow-500" />,
  waiting_customer: <Clock className="w-4 h-4 text-orange-500" />,
  escalated:        <AlertCircle className="w-4 h-4 text-red-500" />,
  resolved:         <CheckCircle className="w-4 h-4 text-emerald-500" />,
  closed:           <XCircle className="w-4 h-4 text-slate-400" />,
};

const CATEGORIES = ["connectivity", "billing", "installation", "speed_issue", "hardware", "security", "general"];
const PRIORITIES = ["low", "medium", "high", "critical"];

export default function PortalTicketsTab({ customer, user }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", category: "general", priority: "medium" });
  const queryClient = useQueryClient();

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
      customer_id: customer.id,
      customer_name: customer.full_name,
      ticket_number: `TKT-${Date.now().toString().slice(-6)}`,
      status: "open",
    });
  };

  return (
    <div className="space-y-4">
      {/* New Ticket Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
        >
          <Plus className="w-4 h-4" /> New Support Ticket
        </button>
      </div>

      {/* New Ticket Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-indigo-200 shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Log a Support Ticket</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Subject *</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Brief description of your issue"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Description *</label>
              <textarea
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                rows={4}
                placeholder="Please describe the issue in detail…"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Category</label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Priority</label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                >
                  {PRIORITIES.map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMut.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
              >
                {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <TicketCheck className="w-4 h-4" />}
                {createMut.isPending ? "Submitting…" : "Submit Ticket"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ticket List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl p-10 text-center bg-white border border-slate-200 shadow-sm">
          <TicketCheck className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-slate-600 mb-1">No Support Tickets</p>
          <p className="text-sm text-slate-400">Submit a ticket above and our team will be in touch shortly.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(t => (
            <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {STATUS_ICON[t.status] || <AlertCircle className="w-4 h-4 text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800 text-sm">{t.subject}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${PRIORITY_COLOR[t.priority] || "bg-slate-100 text-slate-500"}`}>
                        {t.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {t.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-slate-400 capitalize bg-slate-100 px-2 py-0.5 rounded-full">
                      {t.category?.replace(/_/g, " ")}
                    </span>
                    {t.ticket_number && (
                      <span className="text-[10px] font-mono text-indigo-500">{t.ticket_number}</span>
                    )}
                  </div>
                  {t.resolution_notes && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-500">
                        <strong className="text-slate-700">Resolution:</strong> {t.resolution_notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}