import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, FileText, TrendingUp, Play, LayoutGrid, Kanban, GanttChartSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectFormModal from "@/components/projects/ProjectFormModal";
import ProjectDetailModal from "@/components/projects/ProjectDetailModal";
import ProjectForecastReport from "@/components/projects/ProjectForecastReport";
import GuidedDemo from "@/components/projects/GuidedDemo";
import ProjectKanbanBoard from "@/components/projects/ProjectKanbanBoard";
import GanttTimeline from "@/components/projects/GanttTimeline";

const STATUS_FILTERS = [
  { value: "all", label: "All Projects" },
  { value: "lead", label: "Lead" },
  { value: "quoted", label: "Quoted" },
  { value: "approved", label: "Approved" },
  { value: "in_progress", label: "In Progress" },
  { value: "testing", label: "Testing" },
  { value: "live", label: "Live" },
  { value: "billed", label: "Billed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function FibreProjects() {
  const { can, loading: rbacLoading, isAdmin } = useRBAC();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "kanban" | "gantt"

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["fibre-projects"],
    queryFn: () => base44.entities.FibreProject.list("-created_date", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FibreProject.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fibre-projects"] }); setShowForm(false); },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.FibreProject.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fibre-projects"] }),
  });

  const handleKanbanStatusChange = (projectId, newStatus) => {
    statusMutation.mutate({ id: projectId, status: newStatus });
  };

  if (!rbacLoading && !can("projects")) return <AccessDenied />;

  const filtered = projects.filter((p) => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchSearch = !search ||
      p.project_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.quote_number?.toLowerCase().includes(search.toLowerCase()) ||
      p.customer_name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalAnnuity = projects.filter(p => p.status === "live" || p.status === "billed").reduce((a, p) => a + (p.annuity_amount || 0), 0);
  const totalOnceOff = projects.filter(p => p.status === "live" || p.status === "billed").reduce((a, p) => a + (p.once_off_amount || 0), 0);
  const wip = projects.filter(p => !["lead","cancelled","billed"].includes(p.status)).reduce((a, p) => a + (p.annuity_amount || 0) + (p.once_off_amount || 0), 0);

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-[1600px] mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "#f0ebff", fontFamily: "'Space Grotesk',sans-serif" }}>Fibre Projects</h1>
          <p className="text-[11px] mt-0.5 mono" style={{ color: "rgba(168,85,247,0.5)" }}>
            {projects.length} projects · {projects.filter(p => p.status === "live").length} live · R{totalAnnuity.toLocaleString()} annuity
          </p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Projects",   value: projects.length,                     color: "#a855f7" },
          { label: "Annuity (Live)",   value: `R${totalAnnuity.toLocaleString()}`, color: "#10b981" },
          { label: "Once-Off (Live)",  value: `R${totalOnceOff.toLocaleString()}`, color: "#f59e0b" },
          { label: "Work In Progress", value: `R${wip.toLocaleString()}`,          color: "#06b6d4" },
        ].map(({ label, value, color }) => (
          <div key={label} className="relative overflow-hidden rounded-2xl px-5 py-4"
            style={{ background: "rgba(14,11,26,0.92)", border: `1px solid ${color}25`, boxShadow: `0 2px 16px ${color}10` }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${color}15, transparent 70%)` }} />
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(216,180,254,0.5)" }}>{label}</p>
            <p className="text-2xl font-black mono" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color: "#a855f7" }} />
            <input placeholder="Search quote, project, customer..." className="w-full pl-9 pr-4 py-2.5 text-[13px] outline-none rounded-xl" style={{ background: "rgba(14,11,26,0.92)", border: "1px solid rgba(168,85,247,0.2)", color: "#e9d5ff" }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl text-[12px] font-bold outline-none" style={{ background: "rgba(14,11,26,0.92)", border: "1px solid rgba(168,85,247,0.2)", color: "#e9d5ff" }}>
            {STATUS_FILTERS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(168,85,247,0.25)" }}>
            {[
              { mode: "grid",   icon: LayoutGrid,       title: "Grid view" },
              { mode: "kanban", icon: Kanban,            title: "Kanban view" },
              { mode: "gantt",  icon: GanttChartSquare,  title: "Gantt timeline" },
            ].map(({ mode, icon: Icon, title }) => (
              <button key={mode}
                className="px-3 py-2 transition-all"
                style={{
                  background: viewMode === mode ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "rgba(14,11,26,0.85)",
                  color: viewMode === mode ? "#fff" : "rgba(168,85,247,0.6)",
                  borderRight: "1px solid rgba(168,85,247,0.15)",
                }}
                onClick={() => setViewMode(mode)} title={title}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <button onClick={() => setShowDemo(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
            style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.2)", color: "#c084fc" }}>
            <Play className="w-3.5 h-3.5" /> Demo
          </button>
          <button onClick={() => setShowReport(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
            style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}>
            <TrendingUp className="w-3.5 h-3.5" /> Reports
          </button>
          {isAdmin && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 20px rgba(168,85,247,0.35)" }}>
              <Plus className="w-4 h-4" /> New Project
            </button>
          )}
        </div>
      </div>

      {/* Project Grid / Kanban / Gantt */}
      {isLoading ? (
        <div className="text-center py-20" style={{ color: "rgba(168,85,247,0.5)" }}>Loading projects...</div>
      ) : viewMode === "gantt" ? (
        <GanttTimeline projects={projects} />
      ) : viewMode === "kanban" ? (
        <ProjectKanbanBoard
          projects={projects}
          onStatusChange={handleKanbanStatusChange}
          onProjectClick={setSelectedProject}
        />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background: "rgba(14,11,26,0.92)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: "#a855f7" }} />
          <p style={{ color: "rgba(216,180,254,0.5)" }}>No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProjectCard key={p.id} project={p} onClick={() => setSelectedProject(p)} />
          ))}
        </div>
      )}

      {showForm && (
        <ProjectFormModal
          onClose={() => setShowForm(false)}
          onSave={createMutation.mutate}
          saving={createMutation.isPending}
        />
      )}

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onRefresh={() => qc.invalidateQueries({ queryKey: ["fibre-projects"] })
            .then(() => base44.entities.FibreProject.filter({ id: selectedProject.id }).then(r => r[0] && setSelectedProject(r[0])))}
        />
      )}

      {showReport && <ProjectForecastReport projects={projects} onClose={() => setShowReport(false)} />}
      {showDemo && <GuidedDemo onClose={() => setShowDemo(false)} />}
    </div>
  );
}