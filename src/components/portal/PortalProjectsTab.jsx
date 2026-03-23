import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Wifi, CheckCircle2, Clock, AlertCircle, ChevronRight, Lock, Calendar, Hash } from "lucide-react";
import { Loader2 } from "lucide-react";

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
  { title: "Account Setup",         desc: "Your account has been set up and we've sent your welcome pack." },
  { title: "Infrastructure Order",  desc: "We've placed the order with our infrastructure partner." },
  { title: "Installation Planning", desc: "Our team is scheduling the installation." },
  { title: "Onsite Installation",   desc: "An engineer will visit your premises to complete the installation." },
  { title: "Network Testing",       desc: "Your connection is being tested and added to our monitoring platform." },
  { title: "Service Activation",    desc: "Your contract has been activated and your service is live." },
  { title: "Billing Commenced",     desc: "Your first invoice has been generated. Welcome aboard!" },
];

export default function PortalProjectsTab({ customer }) {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["portal-projects", customer.id],
    queryFn: () => base44.entities.FibreProject.filter({ customer_id: customer.id }),
    enabled: !!customer.id,
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl p-10 text-center bg-white border border-slate-200 shadow-sm">
        <Wifi className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p className="font-semibold text-slate-600 mb-1">No Active Projects</p>
        <p className="text-sm text-slate-400">You don't have any fibre projects linked to your account yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {projects.map(project => <ProjectCard key={project.id} project={project} />)}
    </div>
  );
}

function ProjectCard({ project }) {
  const cfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.lead;
  const currentIdx = project.current_task_index || 0;
  const progressPct = Math.min(Math.round((currentIdx / TASK_LABELS.length) * 100), 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800">{project.project_name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Hash className="w-3 h-3 text-slate-400" />
              <span className="text-xs font-mono text-indigo-600">{project.quote_number}</span>
            </div>
            {project.site_address && (
              <p className="text-xs text-slate-400 mt-1">📍 {project.site_address}</p>
            )}
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
            style={{ color: cfg.color, background: cfg.bg }}>
            {cfg.label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Installation Progress</span>
            <span className="text-xs font-bold text-indigo-600">{progressPct}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100">
            <div
              className="h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }}
            />
          </div>
        </div>

        {/* Key dates */}
        <div className="flex flex-wrap gap-4 mt-3">
          {project.forecasted_go_live_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs text-slate-500">Est. Go-Live: <strong>{project.forecasted_go_live_date}</strong></span>
            </div>
          )}
          {project.actual_go_live_date && (
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-emerald-600">Went Live: <strong>{project.actual_go_live_date}</strong></span>
            </div>
          )}
          {project.service_plan && (
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-slate-500">Plan: <strong>{project.service_plan}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Installation Steps</p>
        <div className="space-y-2">
          {TASK_LABELS.map((task, idx) => {
            const done = idx < currentIdx;
            const active = idx === currentIdx;
            const locked = idx > currentIdx;
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 rounded-xl p-3 transition-all ${locked ? "opacity-40" : ""}`}
                style={{
                  background: done ? "rgba(16,185,129,0.06)" : active ? "rgba(99,102,241,0.07)" : "#f8faff",
                  border: `1px solid ${done ? "rgba(16,185,129,0.2)" : active ? "rgba(99,102,241,0.25)" : "rgba(0,0,0,0.05)"}`,
                }}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {done ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : locked ? <Lock className="w-4 h-4 text-slate-300" />
                    : <div className="w-4 h-4 rounded-full border-2 border-indigo-400 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      </div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${done ? "text-emerald-700" : active ? "text-indigo-700" : "text-slate-500"}`}>
                    {task.title}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{task.desc}</p>
                </div>
                {active && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>
                    In Progress
                  </span>
                )}
                {done && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "rgba(16,185,129,0.1)", color: "#059669" }}>
                    Done
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}