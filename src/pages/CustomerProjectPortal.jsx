import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2, Circle, Lock, Clock, FileText, Download,
  Calendar, Hash, Wifi, ChevronRight, AlertCircle, Loader2
} from "lucide-react";

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

// What customers see vs internal labels
const CUSTOMER_TASK_LABELS = [
  { title: "Account Setup",         description: "Your account has been set up and we've sent your welcome pack." },
  { title: "Infrastructure Order",  description: "We've placed the order with our infrastructure partner for your connection." },
  { title: "Installation Planning", description: "Our team is scheduling the installation and coordinating logistics." },
  { title: "Onsite Installation",   description: "An engineer will visit your premises to complete the physical installation." },
  { title: "Network Testing",       description: "Your connection is being tested and added to our monitoring platform." },
  { title: "Service Activation",    description: "Your contract has been activated and your service is live." },
  { title: "Billing Commenced",     description: "Your first invoice has been generated. Welcome aboard!" },
];

const MILESTONE_LABELS = {
  site_survey:     "Site Survey",
  planning_lla:    "Planning & LLA",
  wayleave_process:"Wayleave Process",
  civil_build:     "Civil Build",
  optical_build:   "Optical Build",
  test_handover:   "Test & Handover",
  cutover:         "Cutover",
  go_live:         "Go Live",
};

const MILESTONE_STATUS_CONFIG = {
  not_started: { label: "Upcoming",    color: "#94a3b8", icon: Clock },
  in_progress: { label: "In Progress", color: "#3b82f6", icon: ChevronRight },
  completed:   { label: "Complete",    color: "#10b981", icon: CheckCircle2 },
  blocked:     { label: "Delayed",     color: "#ef4444", icon: AlertCircle },
};

const DOC_TYPE_LABELS = {
  handover_doc:         "Handover Document",
  contract:             "Contract",
  client_takeon_form:   "Client Take-On Form",
  other:                "Document",
};

// Only show these doc types to customers
const CUSTOMER_VISIBLE_DOC_TYPES = ["handover_doc", "contract", "client_takeon_form", "other"];

export default function CustomerProjectPortal() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => base44.auth.redirectToLogin(window.location.href))
      .finally(() => setAuthLoading(false));
  }, []);

  const { data: allProjects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["customer-projects", user?.email],
    queryFn: () => base44.entities.FibreProject.filter({ customer_email: user.email }),
    enabled: !!user?.email,
  });

  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    if (allProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(allProjects[0].id);
    }
  }, [allProjects]);

  const selectedProject = allProjects.find(p => p.id === selectedProjectId) || allProjects[0];

  const { data: milestones = [] } = useQuery({
    queryKey: ["customer-milestones", selectedProject?.id],
    queryFn: () => base44.entities.ProjectMilestone.filter({ project_id: selectedProject.id }),
    enabled: !!selectedProject?.id,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["customer-documents", selectedProject?.id],
    queryFn: () => base44.entities.ProjectDocument.filter({ project_id: selectedProject.id }),
    enabled: !!selectedProject?.id,
  });

  const visibleDocs = documents.filter(d => CUSTOMER_VISIBLE_DOC_TYPES.includes(d.document_type));

  if (authLoading || projectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f0f4ff" }}>
        <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (allProjects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f0f4ff" }}>
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(99,102,241,0.1)" }}>
            <Wifi className="w-7 h-7 text-indigo-400" />
          </div>
          <h2 className="font-bold text-slate-800 text-lg mb-2">No Active Projects</h2>
          <p className="text-slate-500 text-sm">You don't have any fibre projects linked to your account yet. Please contact your account manager.</p>
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[selectedProject?.status] || STATUS_CONFIG.lead;
  const currentIdx = selectedProject?.current_task_index || 0;
  const progressPct = Math.min((currentIdx / CUSTOMER_TASK_LABELS.length) * 100, 100);

  return (
    <div className="min-h-screen p-4 lg:p-8 max-w-4xl mx-auto" style={{ background: "#f0f4ff" }}>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Wifi className="w-5 h-5 text-indigo-500" />
          <h1 className="font-bold text-slate-800 text-xl">My Fibre Project</h1>
        </div>
        <p className="text-slate-500 text-sm">Welcome back, {user?.full_name || user?.email}. Here's your installation progress.</p>
      </div>

      {/* Project Selector (if multiple) */}
      {allProjects.length > 1 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {allProjects.map(p => (
            <button key={p.id} onClick={() => setSelectedProjectId(p.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedProjectId === p.id ? "text-white shadow-md" : "text-slate-600 bg-white border"}`}
              style={selectedProjectId === p.id ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)" } : {}}>
              {p.project_name}
            </button>
          ))}
        </div>
      )}

      {selectedProject && (
        <div className="space-y-5">
          {/* Project Overview Card */}
          <div className="rounded-2xl p-6 shadow-sm" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.12)" }}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="font-bold text-slate-800 text-lg">{selectedProject.project_name}</h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-indigo-600 font-mono text-sm font-semibold">{selectedProject.quote_number}</span>
                </div>
                {selectedProject.site_address && (
                  <p className="text-slate-500 text-xs mt-1">{selectedProject.site_address}</p>
                )}
              </div>
              <span className="text-sm font-bold px-3 py-1.5 rounded-full flex-shrink-0"
                style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
            </div>

            {/* Progress bar */}
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-slate-500">Installation Progress</span>
                <span className="text-xs font-bold text-indigo-600">{Math.round(progressPct)}%</span>
              </div>
              <div className="w-full h-3 rounded-full" style={{ background: "#e2e8f0" }}>
                <div className="h-3 rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }} />
              </div>
            </div>

            {/* Key dates */}
            <div className="flex flex-wrap gap-4 mt-4">
              {selectedProject.forecasted_go_live_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs text-slate-600">Estimated Go-Live: <span className="font-semibold">{selectedProject.forecasted_go_live_date}</span></span>
                </div>
              )}
              {selectedProject.actual_go_live_date && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs text-slate-600">Went Live: <span className="font-semibold text-emerald-600">{selectedProject.actual_go_live_date}</span></span>
                </div>
              )}
              {selectedProject.service_plan && (
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs text-slate-600">Service: <span className="font-semibold">{selectedProject.service_plan}</span></span>
                </div>
              )}
            </div>
          </div>

          {/* Installation Steps */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.12)" }}>
            <h3 className="font-bold text-slate-700 text-sm mb-4">Installation Steps</h3>
            <div className="space-y-2">
              {CUSTOMER_TASK_LABELS.map((task, idx) => {
                const done = idx < currentIdx;
                const active = idx === currentIdx;
                const locked = idx > currentIdx;
                return (
                  <div key={idx} className={`flex items-start gap-3 rounded-xl p-3.5 transition-all ${locked ? "opacity-50" : ""}`}
                    style={{
                      background: done ? "rgba(16,185,129,0.06)" : active ? "rgba(99,102,241,0.07)" : "#f8faff",
                      border: `1px solid ${done ? "rgba(16,185,129,0.2)" : active ? "rgba(99,102,241,0.25)" : "rgba(0,0,0,0.05)"}`,
                    }}>
                    <div className="flex-shrink-0 mt-0.5">
                      {done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : locked ? (
                        <Lock className="w-5 h-5 text-slate-300" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-indigo-400 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-semibold ${done ? "text-emerald-700" : active ? "text-indigo-700" : "text-slate-500"}`}>
                          {task.title}
                        </p>
                        {active && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>
                            In Progress
                          </span>
                        )}
                        {done && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(16,185,129,0.1)", color: "#059669" }}>
                            Complete
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${done ? "text-emerald-600" : "text-slate-500"}`}>{task.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Milestones */}
          {milestones.length > 0 && (
            <div className="rounded-2xl p-5 shadow-sm" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.12)" }}>
              <h3 className="font-bold text-slate-700 text-sm mb-4">Infrastructure Milestones</h3>
              <div className="space-y-2">
                {milestones.map(m => {
                  const sc = MILESTONE_STATUS_CONFIG[m.status] || MILESTONE_STATUS_CONFIG.not_started;
                  const Icon = sc.icon;
                  return (
                    <div key={m.id} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: sc.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700">{MILESTONE_LABELS[m.milestone_key] || m.title}</p>
                        {m.forecasted_date && m.status !== "completed" && (
                          <p className="text-xs text-slate-400">Expected: {m.forecasted_date}</p>
                        )}
                        {m.completed_date && (
                          <p className="text-xs text-emerald-600">Completed: {m.completed_date}</p>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: sc.color, background: `${sc.color}18` }}>{sc.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.12)" }}>
            <h3 className="font-bold text-slate-700 text-sm mb-4">Project Documents</h3>
            {visibleDocs.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No documents have been shared yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {visibleDocs.map(doc => (
                  <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 hover:shadow-md transition-all group"
                    style={{ background: "#f8faff", border: "1px solid rgba(99,102,241,0.1)" }}>
                    <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{doc.name}</p>
                      <p className="text-xs text-slate-400">{DOC_TYPE_LABELS[doc.document_type] || "Document"}</p>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-400 pb-4">
            Questions about your project? Contact your account manager at <span className="text-indigo-500">support@touchnet.co.za</span>
          </p>
        </div>
      )}
    </div>
  );
}