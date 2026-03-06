import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThumbsUp, ThumbsDown, Clock, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const APPROVAL_TYPES = [
  { value: "vendor_quote", label: "Vendor Quote Sign-Off" },
  { value: "purchase_order", label: "Purchase Order Approval" },
  { value: "go_live", label: "Go-Live Sign-Off" },
  { value: "billing_activation", label: "Billing Activation" },
  { value: "contract_activation", label: "Contract Activation" },
  { value: "cutover", label: "Cutover Approval" },
];

export default function ApprovalPanel({ project }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ approval_type: "vendor_quote", title: "", description: "", requested_to: "" });

  const { data: approvals = [] } = useQuery({
    queryKey: ["project-approvals", project.id],
    queryFn: () => base44.entities.ApprovalRequest.filter({ project_id: project.id }),
  });

  const createApproval = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.ApprovalRequest.create({ ...data, project_id: project.id, quote_number: project.quote_number, requested_by: user.email });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["project-approvals", project.id] }); setShowForm(false); },
  });

  const updateApproval = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ApprovalRequest.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project-approvals", project.id] }),
  });

  const handleDecide = (approval, decision) => {
    updateApproval.mutate({
      id: approval.id,
      data: { status: decision, decision_date: new Date().toISOString() },
    });
  };

  const STATUS_BADGE = {
    pending: { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    approved: { label: "Approved", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    rejected: { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  };

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs text-slate-500">Manage approval requests for key milestones on this project.</p>
        <Button size="sm" onClick={() => setShowForm(true)} style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff" }}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Request Approval
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="mb-5 p-4 rounded-xl space-y-3" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-slate-700">New Approval Request</p>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Type</label>
              <Select value={form.approval_type} onValueChange={v => setForm(p => ({ ...p, approval_type: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {APPROVAL_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Approver Email</label>
              <Input className="h-8 text-xs" placeholder="approver@email.com" value={form.requested_to}
                onChange={e => setForm(p => ({ ...p, requested_to: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Title</label>
            <Input className="h-8 text-xs" placeholder="Approval title" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Description</label>
            <Input className="h-8 text-xs" placeholder="Optional description" value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <Button size="sm" onClick={() => createApproval.mutate(form)} disabled={!form.title || !form.requested_to}
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff" }}>
            Submit Request
          </Button>
        </div>
      )}

      {/* Approval List */}
      {approvals.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No approval requests yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map(a => {
            const cfg = STATUS_BADGE[a.status] || STATUS_BADGE.pending;
            return (
              <div key={a.id} className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.1)" }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-700">{a.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {APPROVAL_TYPES.find(t => t.value === a.approval_type)?.label} · To: {a.requested_to}
                  </p>
                  {a.description && <p className="text-xs text-slate-500 mt-1">{a.description}</p>}
                  {a.decision_date && <p className="text-[10px] text-slate-400 mt-1">Decided: {new Date(a.decision_date).toLocaleString()}</p>}
                </div>
                {a.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 px-3 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleDecide(a, "approved")}>
                      <ThumbsUp className="w-3.5 h-3.5 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 px-3 text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleDecide(a, "rejected")}>
                      <ThumbsDown className="w-3.5 h-3.5 mr-1" /> Reject
                    </Button>
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