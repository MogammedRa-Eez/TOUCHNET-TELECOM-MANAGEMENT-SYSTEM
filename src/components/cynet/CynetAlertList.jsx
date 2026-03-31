import React, { useState } from "react";
import { ShieldAlert, AlertCircle, AlertTriangle, Info, ChevronDown, ChevronUp, Shield, Zap } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

const SEV_CFG = {
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)",  icon: ShieldAlert  },
  high:     { color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)", icon: AlertCircle  },
  medium:   { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", icon: AlertTriangle },
  low:      { color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", icon: Info         },
};

function getSeverity(alert) {
  const s = (alert.severity || alert.Severity || alert.level || alert.Level || "").toString().toLowerCase();
  if (s === "critical" || s === "4" || s === "5") return "critical";
  if (s === "high"     || s === "3")              return "high";
  if (s === "medium"   || s === "2")              return "medium";
  return "low";
}

function getAlertName(alert) {
  return alert.name || alert.Name || alert.title || alert.Title || alert.alert_name || alert.alertName || "Unknown Alert";
}

function getAlertHost(alert) {
  return alert.hostName || alert.hostname || alert.host || alert.HostName || alert.device || "—";
}

function getAlertTime(alert) {
  const t = alert.createdAt || alert.CreatedAt || alert.timestamp || alert.Timestamp || alert.created_at || alert.date;
  if (!t) return "—";
  try { return formatDistanceToNow(parseISO(t), { addSuffix: true }); } catch { return t; }
}

function getAlertStatus(alert) {
  return alert.status || alert.Status || alert.state || alert.State || "Open";
}

export default function CynetAlertList({ alerts = [], onIsolate, onRemediate }) {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter]     = useState("all");

  const filtered = filter === "all" ? alerts : alerts.filter(a => getSeverity(a) === filter);
  const shown = filtered.slice(0, 50);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(99,102,241,0.1)" }}>
      <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#ef4444,#6366f1,transparent)" }} />

      {/* Header + filter */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(226,232,240,0.6)" }}>
        <p className="text-[14px] font-black" style={{ color: "#1e293b" }}>
          Recent Alerts <span className="text-[11px] font-bold ml-1" style={{ color: "#94a3b8" }}>({filtered.length})</span>
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {["all", "critical", "high", "medium", "low"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: filter === f
                  ? (f === "all" ? "rgba(99,102,241,0.12)" : `${SEV_CFG[f]?.color}15`)
                  : "rgba(241,245,249,0.9)",
                color: filter === f
                  ? (f === "all" ? "#6366f1" : SEV_CFG[f]?.color)
                  : "#94a3b8",
                border: `1px solid ${filter === f ? (f === "all" ? "rgba(99,102,241,0.25)" : SEV_CFG[f]?.color + "30") : "rgba(226,232,240,0.8)"}`,
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Alert rows */}
      <div className="divide-y" style={{ divideColor: "rgba(226,232,240,0.5)", maxHeight: 480, overflowY: "auto" }}>
        {shown.length === 0 ? (
          <div className="flex flex-col items-center py-12">
            <Shield className="w-8 h-8 mb-2" style={{ color: "#10b981" }} />
            <p className="text-[13px] font-bold" style={{ color: "#334155" }}>No alerts found</p>
            <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>All clear for this severity level</p>
          </div>
        ) : shown.map((alert, i) => {
          const sev = getSeverity(alert);
          const cfg = SEV_CFG[sev];
          const Icon = cfg.icon;
          const isOpen = expanded === i;
          const host = getAlertHost(alert);

          return (
            <div key={i} style={{ borderBottom: "1px solid rgba(226,232,240,0.4)" }}>
              <button className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : i)}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold truncate" style={{ color: "#1e293b" }}>{getAlertName(alert)}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>{sev}</span>
                    {host !== "—" && <span className="text-[10px] mono" style={{ color: "#64748b" }}>{host}</span>}
                    <span className="text-[10px]" style={{ color: "#94a3b8" }}>{getAlertTime(alert)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                    style={{ background: "rgba(241,245,249,0.9)", color: "#64748b", border: "1px solid rgba(226,232,240,0.8)" }}>
                    {getAlertStatus(alert)}
                  </span>
                  {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-4" style={{ background: `${cfg.color}04` }}>
                  <div className="rounded-xl p-3 mb-3 text-[11px] mono overflow-auto max-h-32"
                    style={{ background: "rgba(15,23,42,0.06)", border: "1px solid rgba(226,232,240,0.8)", color: "#475569" }}>
                    <pre className="whitespace-pre-wrap break-all">{JSON.stringify(alert, null, 2).slice(0, 1000)}</pre>
                  </div>
                  {/* Quick action buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {host !== "—" && onIsolate && (
                      <button onClick={() => onIsolate(alert)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-white transition-all hover:scale-105"
                        style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 3px 10px rgba(239,68,68,0.3)" }}>
                        <Shield className="w-3.5 h-3.5" /> Isolate Host
                      </button>
                    )}
                    {onRemediate && (
                      <button onClick={() => onRemediate(alert)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-white transition-all hover:scale-105"
                        style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 3px 10px rgba(249,115,22,0.3)" }}>
                        <Zap className="w-3.5 h-3.5" /> Remediate
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}