import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AlertTriangle, Clock, CheckCircle, Loader2, Play, RefreshCw, ChevronDown, ChevronUp, Zap, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const SLA_CONFIG = [
  { priority: "critical", hours: 2,  color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)" },
  { priority: "high",     hours: 8,  color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.2)" },
  { priority: "medium",   hours: 24, color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)" },
  { priority: "low",      hours: 72, color: "#6366f1", bg: "rgba(99,102,241,0.08)",  border: "rgba(99,102,241,0.2)" },
];

export default function SLAWorkflowPanel() {
  const [open, setOpen] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [running, setRunning] = useState(false);

  const { data: slaStatus, isLoading: statusLoading, refetch } = useQuery({
    queryKey: ["sla-status"],
    queryFn: () => base44.functions.invoke("ticketEscalation", { action: "status", manual: true }).then(r => r.data),
    enabled: open,
    refetchInterval: open ? 30000 : false,
  });

  async function runEscalation() {
    setRunning(true);
    setRunResult(null);
    const res = await base44.functions.invoke("ticketEscalation", { action: "run", manual: true });
    setRunResult(res.data);
    setRunning(false);
    refetch();
  }

  const breachCount  = slaStatus?.breached || 0;
  const nearCount    = slaStatus?.near_breach || 0;
  const hasUrgent    = breachCount > 0 || nearCount > 0;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${hasUrgent ? "rgba(239,68,68,0.25)" : "rgba(99,102,241,0.12)"}`, background: "#ffffff" }}>
      {/* Header toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
        style={{ background: hasUrgent ? "rgba(239,68,68,0.04)" : "rgba(99,102,241,0.03)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: hasUrgent ? "rgba(239,68,68,0.1)" : "rgba(99,102,241,0.1)" }}>
            {hasUrgent ? <AlertTriangle className="w-5 h-5" style={{ color: "#ef4444" }} /> : <Clock className="w-5 h-5" style={{ color: "#6366f1" }} />}
          </div>
          <div>
            <p className="text-[13px] font-bold" style={{ color: "#1e293b" }}>
              SLA Workflow Engine
              {breachCount > 0 && (
                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                  {breachCount} BREACHED
                </span>
              )}
              {nearCount > 0 && (
                <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.1)", color: "#d97706", border: "1px solid rgba(245,158,11,0.2)" }}>
                  {nearCount} NEAR BREACH
                </span>
              )}
            </p>
            <p className="text-[10px] mono" style={{ color: "#94a3b8" }}>Auto-escalation · Email alerts · SLA monitoring</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4" style={{ color: "#94a3b8" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "#94a3b8" }} />}
      </button>

      {open && (
        <div className="p-5 space-y-5" style={{ borderTop: "1px solid rgba(99,102,241,0.08)" }}>
          {/* SLA Config table */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3 mono" style={{ color: "#94a3b8" }}>SLA Thresholds</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SLA_CONFIG.map(s => (
                <div key={s.priority} className="rounded-xl px-3 py-3 text-center" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <p className="text-[11px] font-bold uppercase mono" style={{ color: s.color }}>{s.priority}</p>
                  <p className="text-[22px] font-black mono mt-0.5" style={{ color: "#1e293b" }}>{s.hours}h</p>
                  <p className="text-[9px]" style={{ color: "#94a3b8" }}>SLA window</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live status */}
          {statusLoading ? (
            <div className="flex items-center gap-2 text-[12px]" style={{ color: "#94a3b8" }}>
              <Loader2 className="w-4 h-4 animate-spin" /> Loading SLA status…
            </div>
          ) : slaStatus && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(99,102,241,0.03)", border: "1px solid rgba(99,102,241,0.1)" }}>
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold" style={{ color: "#1e293b" }}>Live Status</p>
                <button onClick={() => refetch()} className="text-[10px] flex items-center gap-1 px-2 py-1 rounded-lg" style={{ color: "#6366f1", background: "rgba(99,102,241,0.06)" }}>
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Active Tickets", value: slaStatus.total_active, color: "#6366f1" },
                  { label: "SLA Breached", value: slaStatus.breached, color: "#ef4444" },
                  { label: "Near Breach", value: slaStatus.near_breach, color: "#f59e0b" },
                ].map(s => (
                  <div key={s.label} className="text-center py-2">
                    <p className="text-[22px] font-black mono" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[10px]" style={{ color: "#94a3b8" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {slaStatus.breached_tickets?.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#ef4444" }}>⚠ Breached Tickets</p>
                  {slaStatus.breached_tickets.map(t => (
                    <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded-lg text-[11px]" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                      <span className="font-mono font-bold" style={{ color: "#6366f1" }}>{t.ticket_number}</span>
                      <span className="flex-1 mx-2 truncate" style={{ color: "#475569" }}>{t.subject}</span>
                      <span className="font-bold" style={{ color: "#ef4444" }}>{t.hours_overdue}h over</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={runEscalation}
              disabled={running}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#ef4444,#f97316)", boxShadow: "0 4px 16px rgba(239,68,68,0.25)" }}>
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {running ? "Running Escalation…" : "Run Escalation Now"}
            </button>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium" style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)", color: "#059669" }}>
              <Bell className="w-3.5 h-3.5" />
              Auto-runs every 15 min
            </div>
          </div>

          {/* Run result */}
          {runResult && (
            <div className="rounded-xl p-4 text-[12px] space-y-2"
              style={{ background: runResult.success ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)", border: `1px solid ${runResult.success ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}` }}>
              <p className="font-bold flex items-center gap-2" style={{ color: runResult.success ? "#065f46" : "#7f1d1d" }}>
                {runResult.success ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                {runResult.escalated > 0
                  ? `${runResult.escalated} ticket(s) escalated — ${runResult.emails_sent} alert emails sent`
                  : "No tickets breaching SLA at this time"}
              </p>
              {runResult.escalated_tickets?.length > 0 && (
                <div className="space-y-1 mt-2">
                  {runResult.escalated_tickets.map((t, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "rgba(99,102,241,0.05)" }}>
                      <span className="font-mono font-semibold text-[11px]" style={{ color: "#6366f1" }}>{t.ticket_number}</span>
                      <span className="text-[11px]" style={{ color: "#64748b" }}>{t.subject?.slice(0, 30)}…</span>
                      <span className="text-[10px] font-bold" style={{ color: "#ef4444" }}>{t.hours_overdue}h over</span>
                      <span className="text-[10px]" style={{ color: "#94a3b8" }}>→ {t.escalated_to}</span>
                    </div>
                  ))}
                </div>
              )}
              {runResult.errors?.length > 0 && (
                <ul className="list-disc pl-4 text-[11px] opacity-70" style={{ color: "#7f1d1d" }}>
                  {runResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          )}

          {/* Info */}
          <div className="text-[10px] space-y-1 pt-1" style={{ borderTop: "1px solid rgba(99,102,241,0.07)", color: "#94a3b8" }}>
            <p>When a ticket breaches its SLA: status is set to <strong style={{ color: "#ef4444" }}>escalated</strong>, it is re-assigned to the department's senior lead, an alert email is sent, and an in-app notification is created.</p>
            <p>The engine also runs automatically every 15 minutes via a scheduled automation.</p>
          </div>
        </div>
      )}
    </div>
  );
}