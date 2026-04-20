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
    { label: "Total Projects",   value: projects.length,                    color: "#00b4b4", icon: Network    },
    { label: "Annuity (Live)",   value: `R${totalAnnuity.toLocaleString()}`, color: "#10b981", icon: DollarSign },
    { label: "Once-Off (Live)",  value: `R${totalOnceOff.toLocaleString()}`, color: "#f59e0b", icon: DollarSign },
    { label: "Work In Progress", value: `R${wip.toLocaleString()}`,          color: "#e02347", icon: Activity   },
  ];

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-[1600px] mx-auto">

      {/* Ticker */}
      <div className="relative overflow-hidden rounded-xl h-8 flex items-center"
        style={{ background: "rgba(0,180,180,0.04)", border: "1px solid rgba(0,180,180,0.12)" }}>
        <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg,#111111,transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg,#111111,transparent)" }} />
        <div className="ticker-track flex items-center gap-10 px-6 whitespace-nowrap">
          {["FIBRE PROJECTS","CIRCUIT MANAGEMENT","VENDOR TRACKING","MILESTONE AUTOMATION","GO-LIVE PIPELINE","BILLING ACTIVATION",
            "FIBRE PROJECTS","CIRCUIT MANAGEMENT","VENDOR TRACKING","MILESTONE AUTOMATION","GO-LIVE PIPELINE","BILLING ACTIVATION",
          ].map((t, i) => (
            <span key={i} className="text-[9px] font-black uppercase tracking-[0.2em] mono"
              style={{ color: i % 3 === 0 ? "#00b4b4" : i % 3 === 1 ? "rgba(0,180,180,0.4)" : "#e02347" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-5"
        style={{ background: "#181818", border: "1px solid rgba(0,180,180,0.2)", boxShadow: "0 4px 32px rgba(0,0,0,0.5)" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,#e02347,transparent)" }} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,180,180,0.15)", border: "1px solid rgba(0,180,180,0.3)" }}>
                <Network className="w-4 h-4" style={{ color: "#00b4b4" }} />
              </div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk', sans-serif" }}>Fibre Projects</h1>
            </div>
            <p className="text-[11px] mt-0.5 mono pl-10" style={{ color: "rgba(255,255,255,0.35)" }}>
              {projects.length} projects · {projects.filter(p => p.status === "live").length} live
            </p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 20px rgba(0,180,180,0.3)" }}>
              <Plus className="w-4 h-4" /> New Project
            </button>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="relative overflow-hidden rounded-2xl px-5 py-4 holo-card group transition-all hover:-translate-y-1"
            style={{ background: "#181818", border: `1px solid ${color}30`, boxShadow: `0 4px 20px rgba(0,0,0,0.5)` }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full pointer-events-none opacity-60" style={{ background: `radial-gradient(circle, ${color}18, transparent 70%)` }} />
            <div className="flex items-start justify-between relative">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
                <p className="text-[26px] font-black mono leading-tight" style={{ color, fontFamily: "'JetBrains Mono',monospace" }}>{value}</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} />
            <input
              placeholder="Search quote, project, customer…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] outline-none"
              style={{ background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)", color: "#e0e0e0" }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" style={{ background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)", color: "#e0e0e0" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            {[
              { mode: "grid",   icon: LayoutGrid,      title: "Grid" },
              { mode: "kanban", icon: Kanban,           title: "Kanban" },
              { mode: "gantt",  icon: GanttChartSquare, title: "Gantt" },
            ].map(({ mode, icon: Icon, title }) => (
              <button key={mode} className="px-3 py-2 transition-all"
                style={{ background: viewMode === mode ? "linear-gradient(135deg,#00b4b4,#007a7a)" : "rgba(255,255,255,0.04)", color: viewMode === mode ? "#fff" : "rgba(255,255,255,0.35)" }}
                onClick={() => setViewMode(mode)} title={title}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <button onClick={() => setShowDemo(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#b0b0b0" }}>
            <Play className="w-3.5 h-3.5" /> Demo
          </button>
          <button onClick={() => setShowReport(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
            style={{ background: "rgba(0,180,180,0.1)", border: "1px solid rgba(0,180,180,0.25)", color: "#00b4b4" }}>
            <TrendingUp className="w-3.5 h-3.5" /> Reports
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-20 text-[13px] mono" style={{ color: "rgba(255,255,255,0.3)" }}>Loading projects…</div>
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
          style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.07)" }}>
          <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: "#00b4b4", opacity: 0.5 }} />
          <p className="text-[13px] font-bold" style={{ color: "#f0f0f0" }}>No projects found</p>
          <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Adjust your search or filter</p>
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