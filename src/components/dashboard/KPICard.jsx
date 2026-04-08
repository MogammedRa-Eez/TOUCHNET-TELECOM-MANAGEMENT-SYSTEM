import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const colors = {
  blue:    { accent: "#3b82f6", grad: "linear-gradient(135deg,#3b82f6,#6366f1)", glow: "rgba(59,130,246,0.35)",  border: "rgba(59,130,246,0.28)",  bg: "rgba(59,130,246,0.08)"  },
  emerald: { accent: "#10b981", grad: "linear-gradient(135deg,#10b981,#06b6d4)", glow: "rgba(16,185,129,0.35)",  border: "rgba(16,185,129,0.28)",  bg: "rgba(16,185,129,0.08)"  },
  amber:   { accent: "#f59e0b", grad: "linear-gradient(135deg,#f59e0b,#f97316)", glow: "rgba(245,158,11,0.35)",  border: "rgba(245,158,11,0.28)",  bg: "rgba(245,158,11,0.08)"  },
  violet:  { accent: "#8b5cf6", grad: "linear-gradient(135deg,#7c3aed,#8b5cf6)", glow: "rgba(139,92,246,0.35)", border: "rgba(139,92,246,0.28)", bg: "rgba(139,92,246,0.08)" },
  cyan:    { accent: "#06b6d4", grad: "linear-gradient(135deg,#06b6d4,#3b82f6)", glow: "rgba(6,182,212,0.35)",   border: "rgba(6,182,212,0.28)",   bg: "rgba(6,182,212,0.08)"   },
  rose:    { accent: "#f43f5e", grad: "linear-gradient(135deg,#f43f5e,#f97316)", glow: "rgba(244,63,94,0.35)",   border: "rgba(244,63,94,0.28)",   bg: "rgba(244,63,94,0.08)"   },
};

export default function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "violet" }) {
  const c = colors[color] || colors.violet;

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden cursor-default transition-all duration-300"
      style={{
        background: "rgba(15,10,30,0.92)",
        border: `1px solid ${c.border}`,
        boxShadow: `0 4px 24px ${c.glow}30, inset 0 1px 0 rgba(196,181,253,0.06)`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 8px 40px ${c.glow}, 0 0 0 1px ${c.border}`;
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = `0 4px 24px ${c.glow}30, inset 0 1px 0 rgba(196,181,253,0.06)`;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: c.grad, boxShadow: `0 0 12px ${c.glow}` }} />

      {/* Soft ambient blob */}
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${c.accent} 0%, transparent 70%)`, opacity: 0.1 }} />

      <div className="flex items-start justify-between mb-4 relative">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: c.grad, boxShadow: `0 4px 20px ${c.glow}` }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full mono"
            style={{ background: c.bg, color: c.accent, border: `1px solid ${c.border}` }}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>

      <p className="text-[30px] font-black leading-none tracking-tight mono" style={{ color: "#f0e8ff" }}>{value}</p>
      <p className="text-[13px] font-bold mt-2" style={{ color: "#c4b5fd" }}>{title}</p>
      {subtitle && <p className="text-[10px] mt-0.5 mono" style={{ color: "rgba(167,139,250,0.55)" }}>{subtitle}</p>}
    </div>
  );
}