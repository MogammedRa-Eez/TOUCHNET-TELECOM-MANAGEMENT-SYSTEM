import React, { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Calendar,
  CheckCircle2, Clock, AlertCircle, Circle, Lock, Loader2,
  TrendingUp, Filter
} from "lucide-react";
import { format, addDays, startOfMonth, endOfMonth, differenceInDays, parseISO, addMonths, subMonths, isWithinInterval, startOfWeek, addWeeks } from "date-fns";

/* ── Constants ───────────────────────────────────────────── */
const MILESTONES = [
  { key: "site_survey",       title: "Site Survey",              color: "#9b8fef", dep: null },
  { key: "planning_lla",      title: "Planning & LLA",           color: "#a78bfa", dep: "site_survey" },
  { key: "wayleave_process",  title: "Wayleave",                 color: "#c084fc", dep: "planning_lla" },
  { key: "civil_build",       title: "Civil Build",              color: "#818cf8", dep: "wayleave_process" },
  { key: "optical_build",     title: "Optical Build",            color: "#6366f1", dep: "civil_build" },
  { key: "test_handover",     title: "Test & Handover",          color: "#7c3aed", dep: "optical_build" },
  { key: "cutover",           title: "Cutover",                  color: "#5b21b6", dep: "test_handover" },
  { key: "go_live",           title: "Go Live",                  color: "#10b981", dep: "cutover" },
];

const TASKS = [
  { key: "welcome_communication",    title: "Welcome Comms",     color: "#c4bcf7", dep: null },
  { key: "vendor_process",           title: "Vendor Process",    color: "#a78bfa", dep: "welcome_communication" },
  { key: "internal_cutover_booking", title: "Internal Cutover",  color: "#9b8fef", dep: "vendor_process" },
  { key: "engineer_onsite_booking",  title: "Engineer Onsite",   color: "#7c6fe0", dep: "internal_cutover_booking" },
  { key: "iris_monitoring",          title: "IRIS Monitoring",   color: "#6366f1", dep: "engineer_onsite_booking" },
  { key: "activate_contract",        title: "Activate Contract", color: "#7c3aed", dep: "iris_monitoring" },
  { key: "tnet_billing",             title: "TNet Billing",      color: "#10b981", dep: "activate_contract" },
];

const STATUS_CFG = {
  not_started: { label: "Not Started", color: "#94a3b8", icon: Circle },
  pending:     { label: "Pending",     color: "#94a3b8", icon: Circle },
  in_progress: { label: "In Progress", color: "#818cf8", icon: Clock },
  awaiting_approval: { label: "Awaiting", color: "#f59e0b", icon: Clock },
  completed:   { label: "Completed",   color: "#10b981", icon: CheckCircle2 },
  blocked:     { label: "Blocked",     color: "#ef4444", icon: AlertCircle },
  cancelled:   { label: "Cancelled",   color: "#64748b", icon: Lock },
};

const PROJECT_STATUS_ORDER = ["lead","quoted","approved","in_progress","testing","live","billed","cancelled"];

/* ── Helpers ─────────────────────────────────────────────── */
function pct(n, t) { return t === 0 ? 0 : Math.round((n / t) * 100); }

function calcCompletion(taskRecords, milestoneRecords) {
  const total = TASKS.length + MILESTONES.length;
  const done =
    TASKS.filter(t => taskRecords.find(r => r.task_key === t.key)?.status === "completed").length +
    MILESTONES.filter(m => milestoneRecords.find(r => r.milestone_key === m.key)?.status === "completed").length;
  return pct(done, total);
}

/* ── Tooltip ─────────────────────────────────────────────── */
function Tooltip({ children, text }) {
  const [vis, setVis] = useState(false);
  return (
    <div className="relative inline-flex" onMouseEnter={() => setVis(true)} onMouseLeave={() => setVis(false)}>
      {children}
      {vis && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap pointer-events-none shadow-xl"
          style={{ background: "#1a1330", color: "#c4bcf7", border: "1px solid rgba(155,143,239,0.3)" }}>
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderTopColor: "#1a1330" }} />
        </div>
      )}
    </div>
  );
}

/* ── Mini donut completion ring ──────────────────────────── */
function CompletionRing({ pct: p, size = 36 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (p / 100) * circ;
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(155,143,239,0.15)" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={p >= 100 ? "#10b981" : p >= 50 ? "#9b8fef" : "#c4bcf7"}
        strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dasharray 0.5s ease" }}
      />
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        fill={p >= 100 ? "#10b981" : "#9b8fef"} fontSize={9} fontWeight={700} fontFamily="'JetBrains Mono',monospace">
        {p}%
      </text>
    </svg>
  );
}

/* ── Per-project Gantt row ───────────────────────────────── */
function ProjectGanttRow({ project, viewStart, viewEnd, dayWidth, allTaskRecs, allMilestoneRecs, expanded, onToggle }) {
  const taskRecs = allTaskRecs.filter(r => r.project_id === project.id);
  const milestoneRecs = allMilestoneRecs.filter(r => r.project_id === project.id);
  const completion = calcCompletion(taskRecs, milestoneRecs);
  const totalDays = differenceInDays(viewEnd, viewStart) + 1;

  const projectStart = project.billing_start_date || project.contract_signed_date || project.created_date;
  const projectEnd = project.forecasted_go_live_date || project.actual_go_live_date;

  /* bar position */
  const barStart = projectStart ? Math.max(0, differenceInDays(parseISO(projectStart), viewStart)) : null;
  const barEnd = projectEnd ? Math.min(totalDays, differenceInDays(parseISO(projectEnd), viewStart)) : null;
  const barWidth = barStart !== null && barEnd !== null ? Math.max(4, (barEnd - barStart) * dayWidth) : null;
  const barLeft = barStart !== null ? barStart * dayWidth : null;

  const statusColor = {
    lead: "#94a3b8", quoted: "#f59e0b", approved: "#6366f1",
    in_progress: "#818cf8", testing: "#c084fc", live: "#10b981",
    billed: "#059669", cancelled: "#ef4444",
  }[project.status] || "#94a3b8";

  /* milestone dots on the timeline */
  const milestoneDots = MILESTONES.map(ms => {
    const rec = milestoneRecs.find(r => r.milestone_key === ms.key);
    if (!rec?.forecasted_date && !rec?.completed_date) return null;
    const dateStr = rec.completed_date || rec.forecasted_date;
    const dayOff = differenceInDays(parseISO(dateStr), viewStart);
    if (dayOff < 0 || dayOff > totalDays) return null;
    const cfg = STATUS_CFG[rec.status || "not_started"];
    return { key: ms.key, title: ms.title, left: dayOff * dayWidth, color: rec.status === "completed" ? "#10b981" : ms.color, status: rec.status || "not_started", date: dateStr, cfg };
  }).filter(Boolean);

  return (
    <>
      {/* ── Project header row ── */}
      <div className="flex items-stretch border-b" style={{ borderColor: "rgba(155,143,239,0.1)", minHeight: 52 }}>
        {/* Label panel */}
        <div className="flex-shrink-0 flex items-center gap-2 px-3 cursor-pointer select-none hover:bg-purple-50 transition-colors"
          style={{ width: 280, borderRight: "1px solid rgba(155,143,239,0.1)" }}
          onClick={onToggle}>
          <button className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-transform"
            style={{ color: "#9b8fef", transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <CompletionRing pct={completion} />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold truncate" style={{ color: "#1a1330" }}>{project.project_name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
              <span className="text-[10px] font-semibold capitalize" style={{ color: statusColor }}>
                {project.status?.replace(/_/g, " ")}
              </span>
              <span className="text-[9px] mono" style={{ color: "#94a3b8" }}>· {project.quote_number}</span>
            </div>
          </div>
        </div>

        {/* Timeline bar */}
        <div className="flex-1 relative overflow-hidden flex items-center" style={{ background: "rgba(243,240,253,0.4)" }}>
          {/* Today line */}
          <TodayLine viewStart={viewStart} totalDays={totalDays} dayWidth={dayWidth} />

          {/* Project span bar */}
          {barWidth !== null && (
            <Tooltip text={`${project.project_name} · ${completion}% complete`}>
              <div
                className="absolute rounded-full flex items-center overflow-hidden"
                style={{
                  left: barLeft,
                  width: barWidth,
                  height: 18,
                  background: `linear-gradient(90deg, ${statusColor}cc, ${statusColor}88)`,
                  border: `1px solid ${statusColor}`,
                  boxShadow: `0 0 8px ${statusColor}44`,
                  top: "50%", transform: "translateY(-50%)",
                }}>
                {/* completion fill */}
                <div className="h-full rounded-l-full" style={{ width: `${completion}%`, background: `${statusColor}`, opacity: 0.6, transition: "width 0.5s" }} />
              </div>
            </Tooltip>
          )}

          {/* Milestone dots */}
          {milestoneDots.map(dot => (
            <Tooltip key={dot.key} text={`${dot.title} · ${dot.status} · ${dot.date}`}>
              <div className="absolute flex items-center justify-center"
                style={{ left: dot.left - 6, top: "50%", transform: "translateY(-50%)", zIndex: 5 }}>
                <div className="w-3 h-3 rounded-full border-2 border-white"
                  style={{ background: dot.color, boxShadow: `0 0 6px ${dot.color}88` }} />
              </div>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* ── Expanded: task & milestone rows ── */}
      {expanded && (
        <>
          {/* Tasks sub-rows */}
          {TASKS.map((taskDef, ti) => {
            const rec = taskRecs.find(r => r.task_key === taskDef.key);
            const status = rec?.status || (ti < (project.current_task_index || 0) ? "completed" : ti === (project.current_task_index || 0) ? "in_progress" : "pending");
            const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
            const depIdx = TASKS.findIndex(t => t.key === taskDef.dep);
            const depDone = depIdx < 0 || (taskRecs.find(r => r.task_key === TASKS[depIdx]?.key)?.status === "completed" || depIdx < (project.current_task_index || 0));
            return (
              <SubRow
                key={taskDef.key}
                label={taskDef.title}
                color={taskDef.color}
                status={status}
                cfg={cfg}
                depDone={depDone}
                depLabel={taskDef.dep ? TASKS.find(t => t.key === taskDef.dep)?.title : null}
                viewStart={viewStart} totalDays={totalDays} dayWidth={dayWidth}
                completedDate={rec?.completed_date}
                dueDate={rec?.due_date}
                indent={1}
                type="task"
              />
            );
          })}

          {/* Milestones sub-rows */}
          {MILESTONES.map(ms => {
            const rec = milestoneRecs.find(r => r.milestone_key === ms.key);
            const status = rec?.status || "not_started";
            const cfg = STATUS_CFG[status] || STATUS_CFG.not_started;
            const depMs = ms.dep ? MILESTONES.find(m => m.key === ms.dep) : null;
            const depDone = !depMs || milestoneRecs.find(r => r.milestone_key === ms.dep)?.status === "completed";
            return (
              <SubRow
                key={ms.key}
                label={ms.title}
                color={ms.color}
                status={status}
                cfg={cfg}
                depDone={depDone}
                depLabel={ms.dep ? MILESTONES.find(m => m.key === ms.dep)?.title : null}
                viewStart={viewStart} totalDays={totalDays} dayWidth={dayWidth}
                completedDate={rec?.completed_date}
                dueDate={rec?.forecasted_date}
                indent={1}
                type="milestone"
              />
            );
          })}
        </>
      )}
    </>
  );
}

/* ── Sub-row (task or milestone) ─────────────────────────── */
function SubRow({ label, color, status, cfg, depDone, depLabel, viewStart, totalDays, dayWidth, completedDate, dueDate, indent, type }) {
  const StatusIcon = cfg.icon;

  const dotDay = completedDate
    ? differenceInDays(parseISO(completedDate), viewStart)
    : dueDate
      ? differenceInDays(parseISO(dueDate), viewStart)
      : null;
  const dotVisible = dotDay !== null && dotDay >= 0 && dotDay <= totalDays;

  return (
    <div className="flex items-stretch border-b" style={{ borderColor: "rgba(155,143,239,0.07)", minHeight: 36, background: "rgba(243,240,253,0.25)" }}>
      {/* Label */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3"
        style={{ width: 280, paddingLeft: 16 + indent * 12, borderRight: "1px solid rgba(155,143,239,0.08)" }}>
        <div className="w-4 h-4 flex-shrink-0">
          <StatusIcon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
        </div>
        <span className="text-[11px] truncate font-medium" style={{ color: "#475569" }}>{label}</span>
        {type === "milestone" && (
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
        )}
        {!depDone && depLabel && (
          <Tooltip text={`Depends on: ${depLabel}`}>
            <Lock className="w-2.5 h-2.5 flex-shrink-0" style={{ color: "#94a3b8" }} />
          </Tooltip>
        )}
      </div>

      {/* Timeline */}
      <div className="flex-1 relative overflow-hidden" style={{ background: "rgba(243,240,253,0.2)" }}>
        <TodayLine viewStart={viewStart} totalDays={totalDays} dayWidth={dayWidth} />

        {/* Status bar / diamond */}
        {dotVisible && (
          type === "milestone" ? (
            <Tooltip text={`${label} · ${status} · ${completedDate || dueDate}`}>
              <div className="absolute" style={{ left: dotDay * dayWidth - 6, top: "50%", transform: "translateY(-50%) rotate(45deg)", width: 10, height: 10, background: cfg.color, border: `1px solid ${color}`, boxShadow: `0 0 6px ${color}66`, zIndex: 5 }} />
            </Tooltip>
          ) : (
            <Tooltip text={`${label} · ${status}${completedDate ? ` · done ${completedDate.slice(0,10)}` : dueDate ? ` · due ${dueDate}` : ""}`}>
              <div className="absolute rounded-sm"
                style={{
                  left: Math.max(0, dotDay * dayWidth - 24),
                  top: "50%", transform: "translateY(-50%)",
                  width: 48, height: 10,
                  background: status === "completed" ? "#10b981" : status === "in_progress" ? color : "rgba(155,143,239,0.25)",
                  opacity: 0.85,
                  boxShadow: status === "completed" ? "0 0 6px rgba(16,185,129,0.4)" : `0 0 4px ${color}44`,
                }} />
            </Tooltip>
          )
        )}
      </div>
    </div>
  );
}

/* ── Today line ──────────────────────────────────────────── */
function TodayLine({ viewStart, totalDays, dayWidth }) {
  const todayOff = differenceInDays(new Date(), viewStart);
  if (todayOff < 0 || todayOff > totalDays) return null;
  return (
    <div className="absolute top-0 bottom-0 pointer-events-none z-10"
      style={{ left: todayOff * dayWidth, width: 1.5, background: "rgba(239,68,68,0.6)", boxShadow: "0 0 6px rgba(239,68,68,0.4)" }}>
      <div className="w-2 h-2 rounded-full absolute -left-[3px] top-0" style={{ background: "#ef4444" }} />
    </div>
  );
}

/* ── Header date ruler ───────────────────────────────────── */
function DateRuler({ viewStart, viewEnd, dayWidth }) {
  const totalDays = differenceInDays(viewEnd, viewStart) + 1;
  const months = [];
  let cur = startOfMonth(viewStart);
  while (cur <= viewEnd) {
    const mStart = Math.max(0, differenceInDays(cur, viewStart));
    const mEnd = Math.min(totalDays, differenceInDays(endOfMonth(cur), viewStart));
    months.push({ label: format(cur, "MMM yyyy"), left: mStart * dayWidth, width: (mEnd - mStart + 1) * dayWidth });
    cur = addMonths(cur, 1);
  }

  // Week markers
  const weeks = [];
  let w = startOfWeek(viewStart, { weekStartsOn: 1 });
  while (w <= viewEnd) {
    const off = differenceInDays(w, viewStart);
    if (off >= 0) weeks.push({ left: off * dayWidth, label: format(w, "d") });
    w = addWeeks(w, 1);
  }

  return (
    <div className="flex-shrink-0" style={{ borderBottom: "1px solid rgba(155,143,239,0.15)", background: "rgba(255,255,255,0.95)", position: "sticky", top: 0, zIndex: 20 }}>
      {/* Month row */}
      <div className="relative h-7" style={{ minWidth: totalDays * dayWidth }}>
        {months.map(m => (
          <div key={m.label} className="absolute flex items-center px-2 h-full border-r"
            style={{ left: m.left, width: m.width, borderColor: "rgba(155,143,239,0.12)", overflow: "hidden" }}>
            <span className="text-[10px] font-black uppercase tracking-wider truncate" style={{ color: "#7c6fe0" }}>{m.label}</span>
          </div>
        ))}
      </div>
      {/* Week row */}
      <div className="relative h-5" style={{ minWidth: totalDays * dayWidth, background: "rgba(243,240,253,0.5)" }}>
        {weeks.map((w, i) => (
          <div key={i} className="absolute flex items-center justify-center h-full border-r"
            style={{ left: w.left, width: 7 * dayWidth, borderColor: "rgba(155,143,239,0.08)", overflow: "hidden" }}>
            <span className="text-[9px] font-semibold mono" style={{ color: "rgba(124,111,224,0.5)" }}>{w.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Summary stats bar ───────────────────────────────────── */
function SummaryBar({ projects, allTasks, allMilestones }) {
  const stats = useMemo(() => {
    const completions = projects.map(p => calcCompletion(
      allTasks.filter(t => t.project_id === p.id),
      allMilestones.filter(m => m.project_id === p.id),
    ));
    const avg = completions.length ? Math.round(completions.reduce((a, b) => a + b, 0) / completions.length) : 0;
    const done = completions.filter(c => c === 100).length;
    const blocked = allMilestones.filter(m => m.status === "blocked").length;
    return { avg, done, blocked, total: projects.length };
  }, [projects, allTasks, allMilestones]);

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {[
        { label: "Avg Completion", value: `${stats.avg}%`, color: "#9b8fef", bg: "rgba(155,143,239,0.1)" },
        { label: "Fully Complete", value: stats.done, color: "#10b981", bg: "rgba(16,185,129,0.08)" },
        { label: "Blocked Items", value: stats.blocked, color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
        { label: "Total Projects", value: stats.total, color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
      ].map(s => (
        <div key={s.label} className="flex items-center gap-2.5 px-4 py-2 rounded-xl"
          style={{ background: s.bg, border: `1px solid ${s.color}25` }}>
          <span className="text-[18px] font-black mono" style={{ color: s.color }}>{s.value}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Main Gantt component ────────────────────────────────── */
export default function GanttTimeline({ projects }) {
  const [viewStart, setViewStart] = useState(() => startOfMonth(subMonths(new Date(), 1)));
  const [monthSpan, setMonthSpan] = useState(4);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState("all");
  const scrollRef = useRef(null);

  const viewEnd = useMemo(() => addDays(addMonths(viewStart, monthSpan), -1), [viewStart, monthSpan]);
  const dayWidth = useMemo(() => Math.max(5, Math.min(22, Math.floor(900 / (differenceInDays(viewEnd, viewStart) + 1)))), [viewStart, viewEnd]);

  /* Fetch all task + milestone records in one shot */
  const { data: allTasks = [], isLoading: tLoading } = useQuery({
    queryKey: ["all-project-tasks"],
    queryFn: () => base44.entities.ProjectTask.list(),
    staleTime: 30000,
  });

  const { data: allMilestones = [], isLoading: mLoading } = useQuery({
    queryKey: ["all-project-milestones"],
    queryFn: () => base44.entities.ProjectMilestone.list(),
    staleTime: 30000,
  });

  const filtered = useMemo(() =>
    projects.filter(p => statusFilter === "all" || p.status === statusFilter),
    [projects, statusFilter]);

  const toggle = (id) => setExpandedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const navigate = (dir) => setViewStart(v => dir > 0 ? addMonths(v, 1) : subMonths(v, 1));

  if (tLoading || mLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#9b8fef" }} />
          <p className="text-sm font-medium" style={{ color: "#9b8fef" }}>Loading Gantt timeline…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-up">
      {/* Summary bar */}
      <SummaryBar projects={filtered} allTasks={allTasks} allMilestones={allMilestones} />

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 rounded-xl overflow-hidden border" style={{ borderColor: "rgba(155,143,239,0.25)" }}>
          <button onClick={() => navigate(-1)} className="px-3 py-1.5 transition-colors hover:bg-purple-50" style={{ color: "#7c6fe0" }}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1.5 text-[12px] font-bold" style={{ color: "#1a1330", background: "rgba(155,143,239,0.07)" }}>
            {format(viewStart, "MMM yyyy")} — {format(viewEnd, "MMM yyyy")}
          </span>
          <button onClick={() => navigate(1)} className="px-3 py-1.5 transition-colors hover:bg-purple-50" style={{ color: "#7c6fe0" }}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1 rounded-xl border overflow-hidden" style={{ borderColor: "rgba(155,143,239,0.25)" }}>
          <button onClick={() => setMonthSpan(s => Math.min(12, s + 1))} className="px-2.5 py-1.5 hover:bg-purple-50 transition-colors" style={{ color: "#7c6fe0" }}>
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 text-[11px] font-semibold" style={{ color: "#7c6fe0" }}>{monthSpan}mo</span>
          <button onClick={() => setMonthSpan(s => Math.max(1, s - 1))} className="px-2.5 py-1.5 hover:bg-purple-50 transition-colors" style={{ color: "#7c6fe0" }}>
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Jump to today */}
        <button
          onClick={() => setViewStart(startOfMonth(subMonths(new Date(), 1)))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all hover:opacity-90"
          style={{ background: "rgba(155,143,239,0.1)", border: "1px solid rgba(155,143,239,0.25)", color: "#7c6fe0" }}>
          <Calendar className="w-3.5 h-3.5" /> Today
        </button>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Filter className="w-3.5 h-3.5" style={{ color: "#9b8fef" }} />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-[12px] font-semibold rounded-lg px-2.5 py-1.5 outline-none"
            style={{ background: "rgba(155,143,239,0.08)", border: "1px solid rgba(155,143,239,0.2)", color: "#1a1330" }}>
            <option value="all">All Statuses</option>
            {PROJECT_STATUS_ORDER.map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl" style={{ background: "rgba(155,143,239,0.05)", border: "1px solid rgba(155,143,239,0.12)" }}>
          {[
            { label: "Complete", color: "#10b981" },
            { label: "In Progress", color: "#818cf8" },
            { label: "Milestone", shape: "diamond", color: "#9b8fef" },
            { label: "Today", color: "#ef4444", dash: true },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              {l.dash
                ? <div style={{ width: 12, height: 2, background: l.color }} />
                : l.shape === "diamond"
                  ? <div style={{ width: 8, height: 8, background: l.color, transform: "rotate(45deg)" }} />
                  : <div className="w-3 h-2 rounded-sm" style={{ background: l.color }} />}
              <span className="text-[10px] font-semibold" style={{ color: "#64748b" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gantt table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(155,143,239,0.18)", background: "#fff", boxShadow: "0 4px 24px rgba(139,92,246,0.07)" }}>

        {/* Column header row */}
        <div className="flex border-b" style={{ borderColor: "rgba(155,143,239,0.15)", background: "linear-gradient(135deg,rgba(243,240,253,0.9),rgba(255,255,255,0.9))" }}>
          <div className="flex-shrink-0 flex items-center px-3 py-2.5 gap-2"
            style={{ width: 280, borderRight: "1px solid rgba(155,143,239,0.15)" }}>
            <TrendingUp className="w-3.5 h-3.5" style={{ color: "#9b8fef" }} />
            <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: "#7c6fe0" }}>Project / Task</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <DateRuler viewStart={viewStart} viewEnd={viewEnd} dayWidth={dayWidth} />
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-x-auto" ref={scrollRef} style={{ maxHeight: 600 }}>
          <div style={{ minWidth: 280 + (differenceInDays(viewEnd, viewStart) + 1) * dayWidth }}>
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center py-20 text-slate-400">
                No projects match this filter
              </div>
            ) : (
              filtered.map(project => (
                <ProjectGanttRow
                  key={project.id}
                  project={project}
                  viewStart={viewStart}
                  viewEnd={viewEnd}
                  dayWidth={dayWidth}
                  allTaskRecs={allTasks}
                  allMilestoneRecs={allMilestones}
                  expanded={expandedIds.has(project.id)}
                  onToggle={() => toggle(project.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-center" style={{ color: "#94a3b8" }}>
        Click any project row to expand task & milestone breakdown · Hover bars and dots for details
      </p>
    </div>
  );
}