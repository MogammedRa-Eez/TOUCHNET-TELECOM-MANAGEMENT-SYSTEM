import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const colors = {
  blue:    { accent: "#3b82f6", grad: "linear-gradient(135deg,#3b82f6,#6366f1)", glow: "rgba(59,130,246,0.2)",   light: "rgba(59,130,246,0.08)",  text: "#93c5fd" },
  emerald: { accent: "#10b981", grad: "linear-gradient(135deg,#10b981,#14b8a6)", glow: "rgba(16,185,129,0.2)",   light: "rgba(16,185,129,0.08)",  text: "#6ee7b7" },
  amber:   { accent: "#f59e0b", grad: "linear-gradient(135deg,#f59e0b,#f97316)", glow: "rgba(245,158,11,0.2)",   light: "rgba(245,158,11,0.08)",  text: "#fcd34d" },
  violet:  { accent: "#7c3aed", grad: "linear-gradient(135deg,#7c3aed,#a855f7)", glow: "rgba(124,58,237,0.2)",   light: "rgba(124,58,237,0.08)",  text: "#a78bfa" },
  cyan:    { accent: "#14b8a6", grad: "linear-gradient(135deg,#14b8a6,#3b82f6)", glow: "rgba(20,184,166,0.2)",   light: "rgba(20,184,166,0.08)",  text: "#5eead4" },
  rose:    { accent: "#f43f5e", grad: "linear-gradient(135deg,#f43f5e,#f97316)", glow: "rgba(244,63,94,0.2)",    light: "rgba(244,63,94,0.08)",   text: "#fda4af" },
};

export default function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "violet" }) {
  const c = colors[color] || colors.violet;

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden cursor-default transition-all duration-300"
      style={{
        background: "#111827",
        border: "1px solid rgba(124,58,237,0.14)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 8px 32px ${c.glow}, 0 4px 16px rgba(0,0,0,0.4)`;
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.borderColor = `${c.accent}40`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(124,58,237,0.14)";
      }}
    >
      {/* Accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: c.grad }} />

      {/* Ambient glow */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none opacity-10 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle, ${c.accent} 0%, transparent 70%)` }}
      />

      <div className="flex items-start justify-between mb-4 relative">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: c.grad, boxShadow: `0 4px 16px ${c.glow}` }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div
            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full mono"
            style={{ background: c.light, color: c.accent, border: `1px solid ${c.accent}30` }}
          >
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>

      <p className="text-[30px] font-black leading-none tracking-tight text-white mono">{value}</p>
      <p className="text-[12px] font-semibold mt-2" style={{ color: "#94a3b8" }}>{title}</p>
      {subtitle && <p className="text-[10px] mt-0.5 mono" style={{ color: "rgba(148,163,184,0.5)" }}>{subtitle}</p>}
    </div>
  );
}