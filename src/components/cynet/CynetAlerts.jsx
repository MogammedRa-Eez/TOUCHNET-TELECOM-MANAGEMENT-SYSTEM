import React, { useState } from "react";
import { AlertTriangle, Shield, Eye, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

const SEVERITY_CFG = {
  Critical: { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.25)" },
  High:     { color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)" },
  Medium:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  Low:      { color: "#06b6d4", bg: "rgba(6,182,212,0.1)",  border: "rgba(6,182,212,0.25)" },
};

function getSeverity(alert) {
  return alert.severity || alert.Severity || alert.SeverityName || "Medium";
}

function getAlertName(alert) {
  return alert.name || alert.Name || alert.alertName || alert.AlertName || "Unknown Alert";
}

function getStatus(alert) {
  return alert.status || alert.Status || alert.alertStatus || "—";
}

function getTime(alert) {
  const t = alert.createdAt || alert.CreatedAt || alert.timestamp || alert.Timestamp;
  if (!t) return "—";
  return new Date(t).toLocaleString();
}

export default function CynetAlerts({ alerts, loading, onRefresh }) {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");

  const severities = ["all", "Critical", "High", "Medium", "Low"];
  const filtered = filter === "all" ? alerts : alerts.filter(a => getSeverity(a) === filter);

  const counts = {
    Critical: alerts.filter(a => getSeverity(a) === "Critical").length,
    High:     alerts.filter(a => getSeverity(a) === "High").length,
    Medium:   alerts.filter(a => getSeverity(a) === "Medium").length,
    Low:      alerts.filter(a => getSeverity(a) === "Low").length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" style={{ color: "#ef4444" }} />
          <h2 className="text-[15px] font-black" style={{ color: "#1e293b" }}>Alerts & Threats</h2>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
            {alerts.length} total
          </span>
        </div>
        <button onClick={onRefresh} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
          style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", color: "#06b6d4" }}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Severity summary pills */}
      <div className="flex flex-wrap gap-2">
        {severities.map(s => {
          const cfg = SEVERITY_CFG[s] || { color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.2)" };
          const count = s === "all" ? alerts.length : counts[s];
          return (
            <button key={s} onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
              style={{
                background: filter === s ? cfg.bg : "rgba(248,250,252,0.8)",
                border: `1px solid ${filter === s ? cfg.border : "rgba(226,232,240,0.8)"}`,
                color: filter === s ? cfg.color : "#64748b",
              }}>
              {s === "all" ? "All" : s} ({count})
            </button>
          );
        })}
      </div>

      {/* Alert list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(99,102,241,0.2)", borderTopColor: "#6366f1" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(226,232,240,0.8)" }}>
          <Shield className="w-8 h-8 mx-auto mb-2" style={{ color: "#10b981" }} />
          <p className="font-bold text-slate-600">No alerts found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((alert, idx) => {
            const sev = getSeverity(alert);
            const cfg = SEVERITY_CFG[sev] || SEVERITY_CFG.Medium;
            const id = alert.id || alert.Id || alert.alertId || idx;
            const isOpen = expanded === id;
            return (
              <div key={id} className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.95)", border: `1px solid ${cfg.color}20`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  onClick={() => setExpanded(isOpen ? null : id)}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate" style={{ color: "#1e293b" }}>{getAlertName(alert)}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {sev}
                      </span>
                      <span className="text-[10px]" style={{ color: "#94a3b8" }}>{getStatus(alert)}</span>
                      <span className="text-[10px] mono" style={{ color: "#94a3b8" }}>{getTime(alert)}</span>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-slate-400" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 text-slate-400" />}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 space-y-2" style={{ borderTop: `1px solid ${cfg.color}15` }}>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(alert).slice(0, 12).map(([k, v]) => (
                        typeof v !== "object" && (
                          <div key={k} className="rounded-xl px-3 py-2" style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.6)" }}>
                            <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: "#94a3b8" }}>{k}</p>
                            <p className="text-[11px] font-semibold truncate mt-0.5" style={{ color: "#334155" }}>{String(v)}</p>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}