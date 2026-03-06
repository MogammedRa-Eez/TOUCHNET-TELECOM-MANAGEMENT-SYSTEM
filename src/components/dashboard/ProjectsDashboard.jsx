import React from "react";
import { Network, Clock, CheckCircle, AlertTriangle, TrendingUp, FileText } from "lucide-react";
import KPICard from "./KPICard";

const STATUS_COLORS = {
  lead: "#94a3b8",
  quoted: "#f59e0b",
  approved: "#3b82f6",
  in_progress: "#8b5cf6",
  testing: "#06b6d4",
  live: "#10b981",
  billed: "#059669",
  cancelled: "#ef4444",
};

export default function ProjectsDashboard({ projects = [], tickets = [] }) {
  const liveProjects = projects.filter(p => p.status === "live" || p.status === "billed").length;
  const inProgress = projects.filter(p => ["approved", "in_progress", "testing"].includes(p.status)).length;
  const pipeline = projects.filter(p => ["lead", "quoted"].includes(p.status)).length;
  const totalAnnuity = projects.filter(p => p.status === "live" || p.status === "billed").reduce((a, p) => a + (p.annuity_amount || 0), 0);
  const projectTickets = tickets.filter(t => t.department === "projects" && !["resolved", "closed"].includes(t.status)).length;

  const statusGroups = Object.entries(
    projects.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: "rgba(139,92,246,0.12)", color: "#7c3aed", border: "1px solid rgba(139,92,246,0.25)" }}>
          PROJECTS — FIBRE DEPLOYMENTS
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Live Projects" value={liveProjects} subtitle="Billing active" icon={CheckCircle} color="emerald" />
        <KPICard title="In Progress" value={inProgress} subtitle="Active deployments" icon={Network} color="violet" />
        <KPICard title="Pipeline" value={pipeline} subtitle="Leads & quotes" icon={TrendingUp} color="amber" />
        <KPICard title="Live Annuity" value={`R${(totalAnnuity / 1000).toFixed(1)}k`} subtitle="Monthly recurring" icon={Clock} color="blue" />
      </div>

      {/* Status overview + recent projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Status breakdown */}
        <div className="rounded-xl p-6" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h3 className="text-[13px] font-semibold text-slate-700 mb-1">Project Status Breakdown</h3>
          <p className="text-[11px] mb-4" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>{projects.length} total projects</p>
          <div className="space-y-3">
            {statusGroups.map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 capitalize">{status.replace("_", " ")}</span>
                  <span className="font-semibold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{count}</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "rgba(0,0,0,0.06)" }}>
                  <div className="h-2 rounded-full" style={{ background: STATUS_COLORS[status] || "#94a3b8", width: projects.length ? `${(count / projects.length) * 100}%` : "0%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent projects */}
        <div className="lg:col-span-2 rounded-xl p-6" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h3 className="text-[13px] font-semibold text-slate-700 mb-1">Recent Projects</h3>
          <p className="text-[11px] mb-4" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>Latest activity</p>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {projects.slice(0, 10).map(p => (
              <div key={p.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors" style={{ border: "1px solid rgba(0,0,0,0.05)" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[p.status] || "#94a3b8" }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{p.project_name}</p>
                    <p className="text-[11px] text-slate-400">{p.customer_name} • {p.quote_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {p.annuity_amount > 0 && (
                    <span className="text-xs font-semibold text-emerald-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      R{p.annuity_amount.toLocaleString()}/mo
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: (STATUS_COLORS[p.status] || "#94a3b8") + "22", color: STATUS_COLORS[p.status] || "#94a3b8" }}>
                    {p.status?.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No projects yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Open project tickets */}
      {projectTickets > 0 && (
        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{projectTickets} open project ticket{projectTickets > 1 ? "s" : ""}</p>
            <p className="text-xs text-amber-600">Check the Tickets page for details.</p>
          </div>
        </div>
      )}
    </div>
  );
}