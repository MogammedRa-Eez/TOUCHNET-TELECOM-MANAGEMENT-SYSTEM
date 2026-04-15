import React, { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const colors = {
  blue:    { accent: "#3b82f6", grad: "linear-gradient(135deg,#3b82f6,#6366f1)", glow: "rgba(59,130,246,0.2)",  light: "rgba(59,130,246,0.08)", bar: "#6366f1" },
  emerald: { accent: "#10b981", grad: "linear-gradient(135deg,#10b981,#06b6d4)", glow: "rgba(16,185,129,0.2)",  light: "rgba(16,185,129,0.08)", bar: "#06b6d4" },
  amber:   { accent: "#f59e0b", grad: "linear-gradient(135deg,#f59e0b,#f97316)", glow: "rgba(245,158,11,0.2)",  light: "rgba(245,158,11,0.08)", bar: "#f97316" },
  violet:  { accent: "#6366f1", grad: "linear-gradient(135deg,#6366f1,#8b5cf6)", glow: "rgba(99,102,241,0.2)",  light: "rgba(99,102,241,0.08)", bar: "#8b5cf6" },
  cyan:    { accent: "#06b6d4", grad: "linear-gradient(135deg,#06b6d4,#3b82f6)", glow: "rgba(6,182,212,0.2)",   light: "rgba(6,182,212,0.08)",  bar: "#3b82f6" },
  rose:    { accent: "#f43f5e", grad: "linear-gradient(135deg,#f43f5e,#f97316)", glow: "rgba(244,63,94,0.2)",   light: "rgba(244,63,94,0.08)",  bar: "#f97316" },
};

export default function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "violet" }) {
  const c = colors[color] || colors.violet;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden cursor-default holo-card"
      style={{
        background: "#ffffff",
        border: `1px solid ${c.accent}30`,
        boxShadow: hovered ? `0 12px 40px ${c.glow}, 0 0 0 1px ${c.accent}20` : `0 4px 20px ${c.glow}`,
        transform: hovered ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Animated gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl liquid-border" style={{ backgroundSize: "400% 400%" }} />

      {/* Radial ambient glow */}
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none transition-all duration-500"
        style={{ background: `radial-gradient(circle, ${c.accent} 0%, transparent 70%)`, opacity: hovered ? 0.12 : 0.06 }} />

      {/* Corner bracket decoration */}
      <div className="absolute bottom-3 right-3 w-4 h-4 pointer-events-none"
        style={{ borderBottom: `2px solid ${c.accent}40`, borderRight: `2px solid ${c.accent}40` }} />

      <div className="flex items-start justify-between mb-4 relative">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{ background: c.grad, boxShadow: hovered ? `0 6px 24px ${c.glow}` : `0 4px 16px ${c.glow}` }}>
            <Icon className="w-5.5 h-5.5 text-white" />
          </div>
          {/* Pulse ring on hover */}
          {hovered && (
            <div className="absolute inset-0 rounded-xl animate-ping opacity-30"
              style={{ background: c.accent, animationDuration: "1.5s" }} />
          )}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-full mono"
            style={{ background: c.light, color: c.accent, border: `1px solid ${c.accent}30`, boxShadow: `0 2px 8px ${c.glow}` }}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>

      <p className="text-[32px] font-black leading-none tracking-tight mono" style={{ color: c.accent, fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
      <p className="text-[13px] font-bold mt-2" style={{ color: "#1e2d6e", fontFamily: "'Space Grotesk', sans-serif" }}>{title}</p>
      {subtitle && <p className="text-[11px] mt-0.5 mono" style={{ color: "rgba(30,45,110,0.5)" }}>{subtitle}</p>}

      {/* Bottom micro progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden rounded-b-2xl"
        style={{ background: `${c.accent}10` }}>
        <div className="h-full transition-all duration-700 rounded-full"
          style={{ width: hovered ? "100%" : "40%", background: `linear-gradient(90deg, ${c.accent}, ${c.bar})` }} />
      </div>
    </div>
  );
}