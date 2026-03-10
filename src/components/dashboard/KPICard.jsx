import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const colors = {
  blue:    { accent: "#3b82f6", grad: "linear-gradient(135deg,#3b82f6,#6366f1)", glow: "rgba(59,130,246,0.25)",  light: "rgba(59,130,246,0.1)", text: "#93c5fd", bar: "#3b82f6" },
  emerald: { accent: "#10b981", grad: "linear-gradient(135deg,#10b981,#06b6d4)", glow: "rgba(16,185,129,0.25)", light: "rgba(16,185,129,0.1)", text: "#6ee7b7", bar: "#10b981" },
  amber:   { accent: "#f59e0b", grad: "linear-gradient(135deg,#f59e0b,#f97316)", glow: "rgba(245,158,11,0.25)",  light: "rgba(245,158,11,0.1)",  text: "#fcd34d", bar: "#f59e0b" },
  violet:  { accent: "#8b5cf6", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", glow: "rgba(139,92,246,0.25)",  light: "rgba(139,92,246,0.1)",  text: "#c4b5fd", bar: "#8b5cf6" },
  cyan:    { accent: "#06b6d4", grad: "linear-gradient(135deg,#06b6d4,#3b82f6)", glow: "rgba(6,182,212,0.25)",   light: "rgba(6,182,212,0.1)",   text: "#67e8f9", bar: "#06b6d4" },
  rose:    { accent: "#f43f5e", grad: "linear-gradient(135deg,#f43f5e,#f97316)", glow: "rgba(244,63,94,0.25)",   light: "rgba(244,63,94,0.1)",   text: "#fda4af", bar: "#f43f5e" },
};

export default function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "cyan" }) {
  const c = colors[color] || colors.cyan;

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden cursor-default group transition-all duration-300"
      style={{
        background: "rgba(255,255,255,0.9)",
        border: "1px solid rgba(255,255,255,0.95)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 8px 32px ${c.glow}, 0 2px 8px rgba(0,0,0,0.06)`;
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.border = `1px solid ${c.accent}40`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.95)";
      }}
    >
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: c.grad }} />

      {/* Ambient glow */}
      <div
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle, ${c.accent} 0%, transparent 70%)` }}
      />

      <div className="flex items-start justify-between mb-4 relative">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: c.grad, boxShadow: `0 4px 16px ${c.glow}` }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div
            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: c.light, color: c.accent, border: `1px solid ${c.accent}30` }}
          >
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>

      <p
        className="text-[32px] font-black leading-none tracking-tight text-slate-900 mono"
      >
        {value}
      </p>
      <p className="text-[12px] font-semibold mt-2 text-slate-600">{title}</p>
      {subtitle && (
        <p className="text-[10px] mt-0.5 text-slate-400 mono">{subtitle}</p>
      )}
    </div>
  );
}