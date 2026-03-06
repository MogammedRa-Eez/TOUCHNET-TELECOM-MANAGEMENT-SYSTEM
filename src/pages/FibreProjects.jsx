import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, FileText, TrendingUp, Play } from "lucide-react";
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
  const { can, loading: rbacLoading } = useRBAC();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["fibre-projects"],
    queryFn: () => base44.entities.FibreProject.list("-created_date", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FibreProject.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fibre-projects"] }); setShowForm(false); },
  });

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
    <div className="p-4 lg:p-6 space-y-5">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Projects", value: projects.length, color: "#6366f1" },
          { label: "Annuity (Live)", value: `R${totalAnnuity.toLocaleString()}`, color: "#10b981" },
          { label: "Once-Off (Live)", value: `R${totalOnceOff.toLocaleString()}`, color: "#f59e0b" },
          { label: "Work In Progress", value: `R${wip.toLocaleString()}`, color: "#8b5cf6" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.12)" }}>
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <Input placeholder="Search quote, project, customer..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowReport(true)} className="gap-2">
            <TrendingUp className="w-4 h-4" /> Reports
          </Button>
          <Button onClick={() => setShowForm(true)} className="gap-2" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff" }}>
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <div className="text-center py-20 text-slate-400">Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No projects found</p>
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
    </div>
  );
}