import React from "react";
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from "lucide-react";

const SEV_CFG = {
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.25)",  icon: ShieldAlert,     label: "Critical" },
  high:     { color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)", icon: AlertCircle,     label: "High"     },
  medium:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", icon: AlertTriangle,   label: "Medium"   },
  low:      { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", icon: Info,            label: "Low"      },
};

function getSeverity(alert) {
  const s = (alert.severity || alert.Severity || alert.level || alert.Level || "").toString().toLowerCase();
  if (s === "critical" || s === "4" || s === "5") return "critical";
  if (s === "high"     || s === "3")              return "high";
  if (s === "medium"   || s === "2")              return "medium";
  return "low";
}

export default function CynetSeverityBreakdown({ alerts = [] }) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  alerts.forEach(a => { counts[getSeverity(a)]++; });
  const total = alerts.length || 1;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Object.entries(SEV_CFG).map(([sev, cfg]) => {
        const Icon = cfg.icon;
        const count = counts[sev];
        const pct = Math.round((count / total) * 100);
        return (
          <div key={sev} className="rounded-2xl overflow-hidden relative"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, boxShadow: `0 2px 16px ${cfg.color}10` }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, ${cfg.color}, transparent)` }} />
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}25` }}>
                  <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                </div>
                <span className="text-[10px] font-black mono px-2 py-0.5 rounded-full"
                  style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}25` }}>
                  {pct}%
                </span>
              </div>
              <p className="text-[28px] font-black mono leading-none" style={{ color: cfg.color }}>{count}</p>
              <p className="text-[11px] font-bold mt-1 uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</p>
              {/* Mini progress bar */}
              <div className="mt-2 h-1 rounded-full" style={{ background: `${cfg.color}15` }}>
                <div className="h-1 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: cfg.color }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}