import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const colors = {
  blue:    { accent: "#3b82f6", glow: "rgba(59,130,246,0.15)",  badge: "rgba(59,130,246,0.12)",  badgeText: "#93c5fd" },
  emerald: { accent: "#10b981", glow: "rgba(16,185,129,0.15)", badge: "rgba(16,185,129,0.12)", badgeText: "#6ee7b7" },
  amber:   { accent: "#f59e0b", glow: "rgba(245,158,11,0.15)",  badge: "rgba(245,158,11,0.12)",  badgeText: "#fcd34d" },
  cyan:    { accent: "#06b6d4", glow: "rgba(6,182,212,0.15)",   badge: "rgba(6,182,212,0.12)",   badgeText: "#67e8f9" },
  violet:  { accent: "#8b5cf6", glow: "rgba(139,92,246,0.15)",  badge: "rgba(139,92,246,0.12)",  badgeText: "#c4b5fd" },
  rose:    { accent: "#f43f5e", glow: "rgba(244,63,94,0.15)",   badge: "rgba(244,63,94,0.12)",   badgeText: "#fda4af" },
};

export default function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "cyan" }) {
  const c = colors[color] || colors.cyan;

  return (
    <div
      className="rounded-xl p-5 relative overflow-hidden transition-all duration-300 cursor-default"
      style={{
        background: "#0d1527",
        border: `1px solid rgba(6,182,212,0.12)`,
        boxShadow: `0 0 0 0 transparent`,
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = c.accent + "55"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(6,182,212,0.12)"}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl" style={{ background: `linear-gradient(90deg, ${c.accent}, transparent)` }} />

      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: c.glow, border: `1px solid ${c.accent}33` }}>
          <Icon className="w-5 h-5" style={{ color: c.accent }} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md" style={{ background: c.badge, color: c.badgeText }}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>

      <p className="text-[28px] font-bold text-white leading-tight" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
      <p className="text-[12px] font-semibold mt-1" style={{ color: "#94a3b8" }}>{title}</p>
      {subtitle && <p className="text-[11px] mt-0.5" style={{ color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>{subtitle}</p>}
    </div>
  );
}