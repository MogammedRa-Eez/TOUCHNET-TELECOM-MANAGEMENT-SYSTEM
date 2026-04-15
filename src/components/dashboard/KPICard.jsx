import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const colors = {
  blue:    { accent: "#3b82f6", grad: "linear-gradient(135deg,#3b82f6,#6366f1)", glow: "rgba(59,130,246,0.15)",  light: "rgba(59,130,246,0.08)" },
  emerald: { accent: "#10b981", grad: "linear-gradient(135deg,#10b981,#06b6d4)", glow: "rgba(16,185,129,0.15)",  light: "rgba(16,185,129,0.08)" },
  amber:   { accent: "#f59e0b", grad: "linear-gradient(135deg,#f59e0b,#f97316)", glow: "rgba(245,158,11,0.15)",  light: "rgba(245,158,11,0.08)" },
  violet:  { accent: "#6366f1", grad: "linear-gradient(135deg,#6366f1,#8b5cf6)", glow: "rgba(99,102,241,0.15)",  light: "rgba(99,102,241,0.08)" },
  cyan:    { accent: "#06b6d4", grad: "linear-gradient(135deg,#06b6d4,#3b82f6)", glow: "rgba(6,182,212,0.15)",   light: "rgba(6,182,212,0.08)"  },
  rose:    { accent: "#f43f5e", grad: "linear-gradient(135deg,#f43f5e,#f97316)", glow: "rgba(244,63,94,0.15)",   light: "rgba(244,63,94,0.08)"  },
};

export default function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "violet" }) {
  const c = colors[color] || colors.violet;

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden cursor-default transition-all duration-300"
      style={{
        background: "#ffffff",
        border: `1px solid ${c.accent}28`,
        boxShadow: `0 4px 20px ${c.glow}, 0 1px 0 rgba(255,255,255,0.9) inset`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 8px 32px ${c.glow}`;
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.borderColor = `${c.accent}45`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = `0 4px 20px ${c.glow}`;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = `${c.accent}28`;
      }}
    >
      {/* Accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: c.grad }} />

      {/* Soft ambient */}
      <div
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${c.accent} 0%, transparent 70%)`, opacity: 0.08 }}
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

      <p className="text-[30px] font-black leading-none tracking-tight mono" style={{ color: c.accent }}>{value}</p>
      <p className="text-[12px] font-semibold mt-2" style={{ color: "#1e2d6e" }}>{title}</p>
      {subtitle && <p className="text-[10px] mt-0.5 mono" style={{ color: "rgba(30,45,110,0.5)" }}>{subtitle}</p>}
    </div>
  );
}