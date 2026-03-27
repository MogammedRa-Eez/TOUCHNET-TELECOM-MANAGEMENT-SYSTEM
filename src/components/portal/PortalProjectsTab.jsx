import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Wifi, CheckCircle2, Clock, Lock, Calendar, Hash, ChevronDown, ChevronUp, Zap, MapPin, Plus } from "lucide-react";
import { Loader2 } from "lucide-react";
import BookingModal from "./BookingModal";
import ProjectBookings from "./ProjectBookings";

const STATUS_CONFIG = {
  lead:        { label: "Lead",        color: "#94a3b8", glow: "rgba(148,163,184,0.3)" },
  quoted:      { label: "Quoted",      color: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
  approved:    { label: "Approved",    color: "#6366f1", glow: "rgba(99,102,241,0.3)" },
  in_progress: { label: "In Progress", color: "#3b82f6", glow: "rgba(59,130,246,0.3)" },
  testing:     { label: "Testing",     color: "#8b5cf6", glow: "rgba(139,92,246,0.3)" },
  live:        { label: "Live",        color: "#10b981", glow: "rgba(16,185,129,0.3)" },
  billed:      { label: "Billed",      color: "#059669", glow: "rgba(5,150,105,0.3)" },
  cancelled:   { label: "Cancelled",   color: "#ef4444", glow: "rgba(239,68,68,0.3)" },
};

const TASK_LABELS = [
  { title: "Account Setup",         desc: "Your account has been set up and welcome pack sent.",     icon: "🔑" },
  { title: "Infrastructure Order",  desc: "Order placed with our infrastructure partner.",            icon: "📦" },
  { title: "Installation Planning", desc: "Our team is scheduling your installation.",                icon: "📋" },
  { title: "Onsite Installation",   desc: "An engineer will visit your premises.",                   icon: "🔧" },
  { title: "Network Testing",       desc: "Your connection is being tested and monitored.",           icon: "📡" },
  { title: "Service Activation",    desc: "Contract activated — your service is live!",              icon: "⚡" },
  { title: "Billing Commenced",     desc: "First invoice generated. Welcome aboard!",                icon: "🎉" },
];

export default function PortalProjectsTab({ customer }) {
  const [bookingProject, setBookingProject] = useState(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["portal-projects", customer.id],
    queryFn: () => base44.entities.FibreProject.filter({ customer_id: customer.id }),
    enabled: !!customer.id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#06b6d4" }} />
          <p className="text-xs mono" style={{ color: "rgba(6,182,212,0.5)" }}>Loading projects…</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl p-12 text-center"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(6,182,212,0.12)" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
          <Wifi className="w-6 h-6" style={{ color: "#06b6d4" }} />
        </div>
        <p className="font-bold text-white/60 mb-1">No Active Projects</p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>You don't have any fibre projects linked yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} onBook={() => setBookingProject(project)} />
        ))}
      </div>
      {bookingProject && (
        <BookingModal
          project={bookingProject}
          customer={customer}
          onClose={() => setBookingProject(null)}
        />
      )}
    </>
  );
}

function ProjectCard({ project, onBook }) {
  const [expanded, setExpanded] = useState(true);
  const cfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.lead;
  const currentIdx  = project.current_task_index || 0;
  const progressPct = Math.min(Math.round((currentIdx / TASK_LABELS.length) * 100), 100);

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${cfg.color}25`,
        boxShadow: `0 0 32px ${cfg.glow}10`,
      }}>
      {/* Color top strip */}
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${cfg.color}, transparent)` }} />

      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-white text-[15px]">{project.project_name}</h3>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}35` }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block mr-1" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
                {cfg.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Hash className="w-3 h-3" style={{ color: "rgba(99,102,241,0.5)" }} />
              <span className="text-[11px] mono" style={{ color: "#818cf8" }}>{project.quote_number}</span>
            </div>
            {project.site_address && (
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="w-3 h-3" style={{ color: "rgba(255,255,255,0.25)" }} />
                <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{project.site_address}</p>
              </div>
            )}
          </div>

          <button onClick={() => setExpanded(v => !v)}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors hover:bg-white/10"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            {expanded
              ? <ChevronUp className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />
              : <ChevronDown className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />}
          </button>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>Installation Progress</span>
            <span className="text-[12px] font-black mono" style={{ color: cfg.color }}>{progressPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)`, boxShadow: `0 0 8px ${cfg.glow}` }} />
          </div>
        </div>

        {/* Book a Visit button */}
        {!["cancelled","live","billed"].includes(project.status) && (
          <button onClick={onBook}
            className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
            <Plus className="w-3.5 h-3.5" /> Book a Visit
          </button>
        )}

        {/* Existing bookings */}
        <ProjectBookings projectId={project.id} />

        {/* Key dates */}
        <div className="flex flex-wrap gap-3 mt-3">
          {project.forecasted_go_live_date && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
              <Calendar className="w-3 h-3" style={{ color: "#818cf8" }} />
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>Est. Live: <strong className="text-white/70">{project.forecasted_go_live_date}</strong></span>
            </div>
          )}
          {project.actual_go_live_date && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <CheckCircle2 className="w-3 h-3" style={{ color: "#10b981" }} />
              <span className="text-[10px]" style={{ color: "#6ee7b7" }}>Live: <strong>{project.actual_go_live_date}</strong></span>
            </div>
          )}
          {project.service_plan && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)" }}>
              <Zap className="w-3 h-3" style={{ color: "#06b6d4" }} />
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>{project.service_plan}</span>
            </div>
          )}
        </div>
      </div>

      {/* Steps */}
      {expanded && (
        <div className="px-5 pb-5" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] mt-4 mb-3" style={{ color: "rgba(255,255,255,0.2)" }}>Installation Steps</p>
          <div className="space-y-2">
            {TASK_LABELS.map((task, idx) => {
              const done   = idx < currentIdx;
              const active = idx === currentIdx;
              const locked = idx > currentIdx;
              return (
                <div key={idx}
                  className={`flex items-start gap-3 rounded-xl p-3 transition-all ${locked ? "opacity-30" : ""}`}
                  style={{
                    background: done ? "rgba(16,185,129,0.07)" : active ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${done ? "rgba(16,185,129,0.2)" : active ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.04)"}`,
                  }}>
                  <div className="flex-shrink-0 mt-0.5">
                    {done
                      ? <CheckCircle2 className="w-4 h-4" style={{ color: "#10b981" }} />
                      : locked
                        ? <Lock className="w-4 h-4" style={{ color: "rgba(255,255,255,0.2)" }} />
                        : (
                          <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: "#6366f1" }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                          </div>
                        )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span>{task.icon}</span>
                      <p className={`text-[12px] font-bold ${done ? "" : active ? "" : ""}`}
                        style={{ color: done ? "#6ee7b7" : active ? "#a78bfa" : "rgba(255,255,255,0.4)" }}>
                        {task.title}
                      </p>
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{task.desc}</p>
                  </div>
                  {active && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mono"
                      style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)" }}>
                      ACTIVE
                    </span>
                  )}
                  {done && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mono"
                      style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>
                      DONE
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}