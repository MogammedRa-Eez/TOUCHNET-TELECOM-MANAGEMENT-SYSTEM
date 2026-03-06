import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, CheckCircle2, Circle, Clock, AlertTriangle, Upload, Send, ThumbsUp, ThumbsDown, Hash, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProjectTaskPanel from "./ProjectTaskPanel";
import ProjectMilestonePanel from "./ProjectMilestonePanel";
import ProjectDocumentPanel from "./ProjectDocumentPanel";
import ApprovalPanel from "./ApprovalPanel";

const TABS = ["Tasks", "Milestones", "Documents", "Approvals", "Details"];

export default function ProjectDetailModal({ project, onClose, onRefresh }) {
  const [tab, setTab] = useState("Tasks");
  const qc = useQueryClient();

  const updateProject = useMutation({
    mutationFn: (data) => base44.entities.FibreProject.update(project.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fibre-projects"] }); onRefresh(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2">
      <div className="w-full max-w-4xl h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#f8faff", border: "1px solid rgba(99,102,241,0.2)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#0f1845,#1e2a4a)", borderBottom: "1px solid rgba(99,102,241,0.2)" }}>
          <div>
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-indigo-400" />
              <span className="text-indigo-300 font-mono text-sm font-bold">{project.quote_number}</span>
            </div>
            <h2 className="text-white font-bold text-lg leading-tight">{project.project_name}</h2>
            <p className="text-slate-400 text-xs">{project.customer_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={project.status} onValueChange={v => updateProject.mutate({ status: v })}>
              <SelectTrigger className="w-36 text-xs h-8 border-indigo-500/30 text-white" style={{ background: "rgba(99,102,241,0.2)" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["lead","quoted","approved","in_progress","testing","live","billed","cancelled"].map(s => (
                  <SelectItem key={s} value={s}>{s.replace("_"," ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Value Summary Bar */}
        <div className="flex gap-4 px-6 py-3 flex-shrink-0" style={{ background: "rgba(99,102,241,0.07)", borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
          <div>
            <p className="text-[9px] text-slate-400 uppercase tracking-wide">Annuity/mo</p>
            <p className="text-sm font-bold text-emerald-600">R{(project.annuity_amount || 0).toLocaleString()}</p>
          </div>
          <div className="w-px bg-slate-200" />
          <div>
            <p className="text-[9px] text-slate-400 uppercase tracking-wide">Once-Off</p>
            <p className="text-sm font-bold text-amber-600">R{(project.once_off_amount || 0).toLocaleString()}</p>
          </div>
          <div className="w-px bg-slate-200" />
          <div>
            <p className="text-[9px] text-slate-400 uppercase tracking-wide">Total Value</p>
            <p className="text-sm font-bold text-indigo-600">R{((project.annuity_amount || 0) + (project.once_off_amount || 0)).toLocaleString()}</p>
          </div>
          {project.forecasted_go_live_date && (
            <>
              <div className="w-px bg-slate-200" />
              <div>
                <p className="text-[9px] text-slate-400 uppercase tracking-wide">Go-Live</p>
                <p className="text-sm font-bold text-slate-700">{project.forecasted_go_live_date}</p>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b flex-shrink-0" style={{ borderColor: "rgba(99,102,241,0.1)", background: "#fff" }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-semibold transition-all ${tab === t ? "text-indigo-600 border-b-2 border-indigo-500" : "text-slate-500 hover:text-slate-700"}`}
            >{t}</button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {tab === "Tasks" && <ProjectTaskPanel project={project} onRefresh={onRefresh} />}
          {tab === "Milestones" && <ProjectMilestonePanel project={project} />}
          {tab === "Documents" && <ProjectDocumentPanel project={project} />}
          {tab === "Approvals" && <ApprovalPanel project={project} />}
          {tab === "Details" && <ProjectDetailsTab project={project} onSave={updateProject.mutate} saving={updateProject.isPending} />}
        </div>
      </div>
    </div>
  );
}

function ProjectDetailsTab({ project, onSave, saving }) {
  const [form, setForm] = useState({
    site_address: project.site_address || "",
    service_plan: project.service_plan || "",
    assigned_engineer: project.assigned_engineer || "",
    circuit_id: project.circuit_id || "",
    monitoring_ip: project.monitoring_ip || "",
    annuity_amount: project.annuity_amount || "",
    once_off_amount: project.once_off_amount || "",
    forecasted_go_live_date: project.forecasted_go_live_date || "",
    actual_go_live_date: project.actual_go_live_date || "",
    billing_start_date: project.billing_start_date || "",
    notes: project.notes || "",
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Site Address</label>
          <Input value={form.site_address} onChange={e => set("site_address", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Service Plan</label>
          <Input value={form.service_plan} onChange={e => set("service_plan", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Assigned Engineer</label>
          <Input value={form.assigned_engineer} onChange={e => set("assigned_engineer", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Circuit ID</label>
          <Input value={form.circuit_id} onChange={e => set("circuit_id", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Monitoring IP</label>
          <Input value={form.monitoring_ip} onChange={e => set("monitoring_ip", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Annuity (R/mo)</label>
          <Input type="number" value={form.annuity_amount} onChange={e => set("annuity_amount", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Once-Off (R)</label>
          <Input type="number" value={form.once_off_amount} onChange={e => set("once_off_amount", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Forecasted Go-Live</label>
          <Input type="date" value={form.forecasted_go_live_date} onChange={e => set("forecasted_go_live_date", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Actual Go-Live</label>
          <Input type="date" value={form.actual_go_live_date} onChange={e => set("actual_go_live_date", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Billing Start Date</label>
          <Input type="date" value={form.billing_start_date} onChange={e => set("billing_start_date", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500 mb-1 block">Notes</label>
        <textarea
          value={form.notes}
          onChange={e => set("notes", e.target.value)}
          rows={4}
          className="w-full border rounded-lg px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
          style={{ borderColor: "rgba(99,102,241,0.2)" }}
        />
      </div>
      <Button onClick={() => onSave({ ...form, annuity_amount: parseFloat(form.annuity_amount)||0, once_off_amount: parseFloat(form.once_off_amount)||0 })}
        disabled={saving} style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff" }}>
        {saving ? "Saving..." : "Save Details"}
      </Button>
    </div>
  );
}