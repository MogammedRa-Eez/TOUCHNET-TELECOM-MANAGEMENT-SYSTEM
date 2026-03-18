import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProjectTaskPanel from "./ProjectTaskPanel";
import ProjectMilestonePanel from "./ProjectMilestonePanel";
import ProjectDocumentPanel from "./ProjectDocumentPanel";
import ApprovalPanel from "./ApprovalPanel";
import ProjectActivityFeed from "./ProjectActivityFeed";

const TABS = ["Tasks", "Milestones", "Documents", "Approvals", "Details", "Activity"];

export default function ProjectDetailModal({ project, onClose, onRefresh }) {
  const [tab, setTab] = useState("Tasks");
  const qc = useQueryClient();

  const logActivity = async (title, opts = {}) => {
    const user = await base44.auth.me().catch(() => null);
    await base44.entities.ProjectActivity.create({
      project_id: project.id,
      quote_number: project.quote_number,
      actor: user?.email || "System",
      title,
      ...opts,
    });
    qc.invalidateQueries({ queryKey: ["project-activity", project.id] });
  };

  const updateProject = useMutation({
    mutationFn: async (data) => {
      await base44.entities.FibreProject.update(project.id, data);
      if (data.status && data.status !== project.status) {
        await logActivity(`Status changed to "${data.status.replace(/_/g," ")}"`, {
          event_type: "status_change",
          old_value: project.status,
          new_value: data.status,
        });
      } else {
        await logActivity("Project details updated", { event_type: "field_update" });
      }
    },
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
          {tab === "Activity" && <ProjectActivityFeed project={project} />}
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
        {[
          ["site_address", "Site Address", "text"],
          ["service_plan", "Service Plan", "text"],
          ["assigned_engineer", "Assigned Engineer", "text"],
          ["circuit_id", "Circuit ID", "text"],
          ["monitoring_ip", "Monitoring IP", "text"],
          ["annuity_amount", "Annuity (R/mo)", "number"],
          ["once_off_amount", "Once-Off (R)", "number"],
          ["forecasted_go_live_date", "Forecasted Go-Live", "date"],
          ["actual_go_live_date", "Actual Go-Live", "date"],
          ["billing_start_date", "Billing Start Date", "date"],
        ].map(([key, label, type]) => (
          <div key={key}>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">{label}</label>
            <Input type={type} value={form[key]} onChange={e => set(key, e.target.value)} />
          </div>
        ))}
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