import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CheckCircle, Clock, AlertTriangle, Zap } from "lucide-react";

const STATUS_COLOR = {
  lead: "bg-slate-100 text-slate-600",
  quoted: "bg-blue-100 text-blue-700",
  approved: "bg-indigo-100 text-indigo-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  testing: "bg-orange-100 text-orange-700",
  live: "bg-emerald-100 text-emerald-700",
  billed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-600",
};

export default function ProjectsDashboard() {
  const { data: projects = [] } = useQuery({ queryKey: ["proj-projects"], queryFn: () => base44.entities.FibreProject.list("-created_date") });
  const { data: tasks = [] } = useQuery({ queryKey: ["proj-tasks"], queryFn: () => base44.entities.ProjectTask.list() });
  const { data: milestones = [] } = useQuery({ queryKey: ["proj-milestones"], queryFn: () => base44.entities.ProjectMilestone.list() });

  const active = projects.filter(p => ["in_progress", "testing", "approved"].includes(p.status)).length;
  const live = projects.filter(p => p.status === "live").length;
  const blocked = tasks.filter(t => t.status === "blocked").length;
  const pendingApproval = tasks.filter(t => t.status === "awaiting_approval").length;

  return (
    <div className="p-6 space-y-6">
      <DeptHeader title="Projects Dashboard" dept="Projects" color="#0891b2" icon="🔧" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Active Projects" value={active} icon={<Zap className="w-4 h-4 text-blue-500" />} bg="bg-blue-50" />
        <KPI label="Live / Completed" value={live} icon={<CheckCircle className="w-4 h-4 text-emerald-500" />} bg="bg-emerald-50" />
        <KPI label="Blocked Tasks" value={blocked} icon={<AlertTriangle className="w-4 h-4 text-red-500" />} bg="bg-red-50" />
        <KPI label="Awaiting Approval" value={pendingApproval} icon={<Clock className="w-4 h-4 text-yellow-500" />} bg="bg-yellow-50" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-slate-700 text-sm mb-4">Active Projects</h3>
        <div className="space-y-3">
          {projects.filter(p => !["cancelled", "lead"].includes(p.status)).slice(0, 10).map(p => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-slate-700">{p.project_name}</p>
                <p className="text-xs text-slate-400">{p.customer_name} · {p.quote_number}</p>
                {p.assigned_engineer && <p className="text-xs text-slate-300">Engineer: {p.assigned_engineer}</p>}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLOR[p.status] || "bg-slate-100 text-slate-500"}`}>{p.status?.replace(/_/g, " ")}</span>
                {p.forecasted_go_live_date && <p className="text-[10px] text-slate-400">Go-live: {p.forecasted_go_live_date}</p>}
              </div>
            </div>
          ))}
          {projects.length === 0 && <p className="text-sm text-slate-400">No projects found</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-slate-700 text-sm mb-4">Tasks Needing Attention</h3>
        <div className="space-y-2">
          {tasks.filter(t => ["blocked", "awaiting_approval"].includes(t.status)).slice(0, 8).map(t => (
            <div key={t.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-700">{t.title}</p>
                <p className="text-xs text-slate-400">{t.quote_number}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${t.status === "blocked" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>
                {t.status?.replace(/_/g, " ")}
              </span>
            </div>
          ))}
          {tasks.filter(t => ["blocked", "awaiting_approval"].includes(t.status)).length === 0 && (
            <p className="text-sm text-emerald-600 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> All tasks on track</p>
          )}
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, icon, bg }) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-white/50`}>
      <div className="flex items-center justify-between mb-1">{icon}</div>
      <p className="text-xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function DeptHeader({ title, dept, color, icon }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${color}15` }}>{icon}</div>
      <div>
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        <p className="text-xs text-slate-400">{dept} Department · Private View</p>
      </div>
    </div>
  );
}