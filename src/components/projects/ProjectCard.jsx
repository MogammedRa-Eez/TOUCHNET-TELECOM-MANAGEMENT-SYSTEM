import React from "react";
import { Calendar, DollarSign, User, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  lead:        { label: "Lead",        color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  quoted:      { label: "Quoted",      color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  approved:    { label: "Approved",    color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
  in_progress: { label: "In Progress", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  testing:     { label: "Testing",     color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  live:        { label: "Live",        color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  billed:      { label: "Billed",      color: "#059669", bg: "rgba(5,150,105,0.12)" },
  cancelled:   { label: "Cancelled",   color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

const TASK_LABELS = [
  "1. Welcome Communication",
  "2. Vendor Process",
  "3. Internal Cutover Booking",
  "4. Engineer Onsite Booking",
  "5. IRIS Monitoring",
  "6. Activate Contract",
  "7. TNet Billing",
];

export default function ProjectCard({ project, onClick }) {
  const cfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.lead;
  const taskProgress = Math.min(project.current_task_index || 0, TASK_LABELS.length - 1);
  const progressPct = ((taskProgress) / TASK_LABELS.length) * 100;

  return (
    <div
      onClick={onClick}
      className="rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all"
      style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.12)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm truncate">{project.project_name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Hash className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-indigo-600 font-mono font-semibold">{project.quote_number}</span>
          </div>
        </div>
        <span className="text-[11px] font-semibold px-2 py-1 rounded-full flex-shrink-0"
          style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-1.5 mb-3">
        <User className="w-3 h-3 text-slate-400" />
        <span className="text-xs text-slate-500">{project.customer_name}</span>
      </div>

      {/* Values */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg px-2.5 py-2" style={{ background: "#f8faff" }}>
          <p className="text-[9px] text-slate-400 uppercase tracking-wide">Annuity/mo</p>
          <p className="text-sm font-bold text-emerald-600">R{(project.annuity_amount || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-lg px-2.5 py-2" style={{ background: "#f8faff" }}>
          <p className="text-[9px] text-slate-400 uppercase tracking-wide">Once-Off</p>
          <p className="text-sm font-bold text-amber-600">R{(project.once_off_amount || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Task Progress */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-slate-500">Current Task</span>
          <span className="text-[10px] text-indigo-500 font-semibold">{taskProgress}/{TASK_LABELS.length}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-100">
          <div className="h-1.5 rounded-full transition-all" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }} />
        </div>
        <p className="text-[10px] text-slate-400 mt-1 truncate">{TASK_LABELS[taskProgress]}</p>
      </div>

      {/* Dates */}
      {project.forecasted_go_live_date && (
        <div className="flex items-center gap-1.5 mt-2">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span className="text-[10px] text-slate-400">Go-live: {project.forecasted_go_live_date}</span>
        </div>
      )}
    </div>
  );
}