import React, { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const colors = {
  blue:    { accent: "#00b4b4", grad: "linear-gradient(135deg,#00b4b4,#00d4d4)", glow: "rgba(0,180,180,0.25)",  light: "rgba(0,180,180,0.1)",  bar: "#00d4d4" },
  emerald: { accent: "#10b981", grad: "linear-gradient(135deg,#10b981,#34d399)", glow: "rgba(16,185,129,0.25)", light: "rgba(16,185,129,0.1)", bar: "#34d399" },
  amber:   { accent: "#f59e0b", grad: "linear-gradient(135deg,#f59e0b,#fbbf24)", glow: "rgba(245,158,11,0.25)", light: "rgba(245,158,11,0.1)", bar: "#fbbf24" },
  violet:  { accent: "#00b4b4", grad: "linear-gradient(135deg,#00b4b4,#00d4d4)", glow: "rgba(0,180,180,0.25)",  light: "rgba(0,180,180,0.1)",  bar: "#00d4d4" },
  cyan:    { accent: "#22d3ee", grad: "linear-gradient(135deg,#22d3ee,#67e8f9)", glow: "rgba(34,211,238,0.25)", light: "rgba(34,211,238,0.1)", bar: "#67e8f9" },
  rose:    { accent: "#e02347", grad: "linear-gradient(135deg,#e02347,#ff3358)", glow: "rgba(224,35,71,0.25)",  light: "rgba(224,35,71,0.1)",  bar: "#ff3358" },
};

export default function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "blue" }) {
  const c = colors[color] || colors.blue;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden cursor-default holo-card"
      style={{
        background: hovered ? "#1e1e1e" : "#181818",
        border: `1px solid ${hovered ? c.accent + "50" : "rgba(255,255,255,0.08)"}`,
        boxShadow: hovered ? `0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px ${c.accent}25` : `0 4px 20px rgba(0,0,0,0.4)`,
        transform: hovered ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${c.accent}, ${c.bar}, transparent)` }} />

      {/* Radial ambient glow */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none transition-all duration-500"
        style={{ background: `radial-gradient(circle, ${c.accent} 0%, transparent 70%)`, opacity: hovered ? 0.15 : 0.07 }} />

      {/* Corner bracket */}
      <div className="absolute bottom-3 right-3 w-4 h-4 pointer-events-none"
        style={{ borderBottom: `2px solid ${c.accent}40`, borderRight: `2px solid ${c.accent}40` }} />

      <div className="flex items-start justify-between mb-4 relative">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{ background: c.grad, boxShadow: `0 4px 20px ${c.glow}` }}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {hovered && (
            <div className="absolute inset-0 rounded-xl animate-ping opacity-20"
              style={{ background: c.accent, animationDuration: "1.5s" }} />
          )}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-full mono"
            style={{ background: c.light, color: c.accent, border: `1px solid ${c.accent}30` }}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>

      <p className="text-[32px] font-black leading-none tracking-tight mono" style={{ color: c.accent, fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
      <p className="text-[13px] font-bold mt-2" style={{ color: "#e0e0e0", fontFamily: "'Space Grotesk', sans-serif" }}>{title}</p>
      {subtitle && <p className="text-[11px] mt-0.5 mono" style={{ color: "rgba(255,255,255,0.35)" }}>{subtitle}</p>}

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden rounded-b-2xl"
        style={{ background: `${c.accent}10` }}>
        <div className="h-full transition-all duration-700 rounded-full"
          style={{ width: hovered ? "100%" : "40%", background: `linear-gradient(90deg, ${c.accent}, ${c.bar})` }} />
      </div>
    </div>
  );
}