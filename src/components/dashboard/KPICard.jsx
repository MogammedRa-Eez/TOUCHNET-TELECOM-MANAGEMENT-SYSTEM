import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const colors = {
  blue:    { accent: "#3b82f6", from: "#3b82f6", to: "#6366f1", glow: "rgba(59,130,246,0.18)",  light: "rgba(59,130,246,0.08)", text: "#93c5fd" },
  emerald: { accent: "#10b981", from: "#10b981", to: "#06b6d4", glow: "rgba(16,185,129,0.18)", light: "rgba(16,185,129,0.08)", text: "#6ee7b7" },
  amber:   { accent: "#f59e0b", from: "#f59e0b", to: "#f97316", glow: "rgba(245,158,11,0.18)",  light: "rgba(245,158,11,0.08)",  text: "#fcd34d" },
  violet:  { accent: "#8b5cf6", from: "#8b5cf6", to: "#ec4899", glow: "rgba(139,92,246,0.18)",  light: "rgba(139,92,246,0.08)",  text: "#c4b5fd" },
  cyan:    { accent: "#06b6d4", from: "#06b6d4", to: "#3b82f6", glow: "rgba(6,182,212,0.18)",   light: "rgba(6,182,212,0.08)",   text: "#67e8f9" },
  rose:    { accent: "#f43f5e", from: "#f43f5e", to: "#f97316", glow: "rgba(244,63,94,0.18)",   light: "rgba(244,63,94,0.08)",   text: "#fda4af" },
};

export default function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "cyan" }) {
  const c = colors[color] || colors.cyan;

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden transition-all duration-300 cursor-default group"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.9)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 24px ${c.glow}, 0 1px 3px rgba(0,0,0,0.04)`; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${c.from}, ${c.to})` }} />

      {/* BG glow blob */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-30 transition-opacity duration-300 group-hover:opacity-50"
        style={{ background: `radial-gradient(circle, ${c.accent}55 0%, transparent 70%)` }} />

      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center relative" style={{ background: `linear-gradient(135deg, ${c.from}22, ${c.to}22)`, border: `1px solid ${c.accent}33` }}>
          <Icon className="w-5 h-5" style={{ color: c.accent }} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: c.light, color: c.text }}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>

      <p className="text-[30px] font-extrabold leading-tight tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#0f172a" }}>{value}</p>
      <p className="text-[12px] font-semibold mt-1.5 text-slate-600">{title}</p>
      {subtitle && <p className="text-[10px] mt-0.5 text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{subtitle}</p>}
    </div>
  );
}