import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, FileText, TrendingUp, Play, LayoutGrid, Kanban, GanttChartSquare, DollarSign, Network, Activity } from "lucide-react";
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
  { value: "all",         label: "All Projects" },
  { value: "lead",        label: "Lead" },
  { value: "quoted",      label: "Quoted" },
  { value: "approved",    label: "Approved" },
  { value: "in_progress", label: "In Progress" },
  { value: "testing",     label: "Testing" },
  { value: "live",        label: "Live" },
  { value: "billed",      label: "Billed" },
  { value: "cancelled",   label: "Cancelled" },
];

export default function FibreProjects() {
  const { can, loading: rbacLoading, isAdmin } = useRBAC();
  const qc = useQueryClient();
  const [search,          setSearch]          = useState("");
  const [statusFilter,    setStatusFilter]    = useState("all");
  const [showForm,        setShowForm]        = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showReport,      setShowReport]      = useState(false);
  const [showDemo,        setShowDemo]        = useState(false);
  const [viewMode,        setViewMode]        = useState("grid");

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

  if (!rbacLoading && !can("projects")) return <AccessDenied />;

  const filtered = projects.filter(p => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchSearch = !search ||
      p.project_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.quote_number?.toLowerCase().includes(search.toLowerCase()) ||
      p.customer_name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalAnnuity = projects.filter(p => p.status === "live" || p.status === "billed").reduce((a, p) => a + (p.annuity_amount || 0), 0);
  const totalOnceOff = projects.filter(p => p.status === "live" || p.status === "billed").reduce((a, p) => a + (p.once_off_amount || 0), 0);
  const wip          = projects.filter(p => !["lead","cancelled","billed"].includes(p.status)).reduce((a, p) => a + (p.annuity_amount || 0) + (p.once_off_amount || 0), 0);

  const kpis = [
    { label: "Total Projects",    value: projects.length,                     color: "#6366f1", icon: Network   },
    { label: "Annuity (Live)",    value: `R${totalAnnuity.toLocaleString()}`,  color: "#10b981", icon: DollarSign },
    { label: "Once-Off (Live)",   value: `R${totalOnceOff.toLocaleString()}`,  color: "#f59e0b", icon: DollarSign },
    { label: "Work In Progress",  value: `R${wip.toLocaleString()}`,           color: "#8b5cf6", icon: Activity  },
  ];

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-[1600px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "#f0e8ff", fontFamily: "'Space Grotesk', sans-serif" }}>Fibre Projects</h1>
          <p className="text-[11px] mt-0.5 mono" style={{ color: "rgba(196,181,253,0.5)" }}>
            {projects.length} projects · {projects.filter(p => p.status === "live").length} live
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}>
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="relative overflow-hidden rounded-2xl px-5 py-4"
            style={{ background: "rgba(12,8,28,0.95)", border: `1px solid ${color}28`, boxShadow: `0 2px 16px ${color}12` }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "rgba(196,181,253,0.55)" }}>{label}</p>
                <p className="text-[26px] font-black mono leading-tight" style={{ color }}>{value}</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(196,181,253,0.4)" }} />
            <input
              placeholder="Search quote, project, customer…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] outline-none transition-all"
              style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.25)", color: "#e8d5ff" }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.25)", color: "#c4b5fd" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(139,92,246,0.25)" }}>
            {[
              { mode: "grid",   icon: LayoutGrid,      title: "Grid" },
              { mode: "kanban", icon: Kanban,           title: "Kanban" },
              { mode: "gantt",  icon: GanttChartSquare, title: "Gantt" },
            ].map(({ mode, icon: Icon, title }) => (
              <button key={mode}
                className="px-3 py-2 transition-all"
                style={{
                  background: viewMode === mode ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(139,92,246,0.06)",
                  color: viewMode === mode ? "#fff" : "rgba(196,181,253,0.55)",
                }}
                onClick={() => setViewMode(mode)}
                title={title}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <button onClick={() => setShowDemo(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
            style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}>
            <Play className="w-3.5 h-3.5" /> Demo
          </button>
          <button onClick={() => setShowReport(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
            style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}>
            <TrendingUp className="w-3.5 h-3.5" /> Reports
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-20 text-[13px] mono" style={{ color: "rgba(196,181,253,0.5)" }}>Loading projects…</div>
      ) : viewMode === "gantt" ? (
        <GanttTimeline projects={projects} />
      ) : viewMode === "kanban" ? (
        <ProjectKanbanBoard
          projects={projects}
          onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
          onProjectClick={setSelectedProject}
        />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl py-20 text-center"
          style={{ background: "rgba(10,6,24,0.97)", border: "1px solid rgba(139,92,246,0.18)" }}>
          <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: "#a78bfa", opacity: 0.4 }} />
          <p className="text-[13px] font-bold" style={{ color: "#c4b5fd" }}>No projects found</p>
          <p className="text-[11px] mt-1" style={{ color: "rgba(196,181,253,0.45)" }}>Adjust your search or filter</p>
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
      {showDemo   && <GuidedDemo onClose={() => setShowDemo(false)} />}
    </div>
  );
}