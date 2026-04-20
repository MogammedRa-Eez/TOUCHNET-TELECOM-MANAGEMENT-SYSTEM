import React, { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const colors = {
  blue:    { accent: "#00b4b4", grad: "linear-gradient(135deg,#00b4b4,#00d4d4)", glow: "rgba(0,180,180,0.3)",  light: "rgba(0,180,180,0.1)",  bar: "#00d4d4" },
  emerald: { accent: "#10b981", grad: "linear-gradient(135deg,#10b981,#34d399)", glow: "rgba(16,185,129,0.3)", light: "rgba(16,185,129,0.1)", bar: "#34d399" },
  amber:   { accent: "#f59e0b", grad: "linear-gradient(135deg,#f59e0b,#fbbf24)", glow: "rgba(245,158,11,0.3)", light: "rgba(245,158,11,0.1)", bar: "#fbbf24" },
  violet:  { accent: "#00b4b4", grad: "linear-gradient(135deg,#00b4b4,#00d4d4)", glow: "rgba(0,180,180,0.3)",  light: "rgba(0,180,180,0.1)",  bar: "#00d4d4" },
  cyan:    { accent: "#22d3ee", grad: "linear-gradient(135deg,#22d3ee,#67e8f9)", glow: "rgba(34,211,238,0.3)", light: "rgba(34,211,238,0.1)", bar: "#67e8f9" },
  rose:    { accent: "#e02347", grad: "linear-gradient(135deg,#e02347,#ff3358)", glow: "rgba(224,35,71,0.3)",  light: "rgba(224,35,71,0.1)",  bar: "#ff3358" },
};

export default function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "blue" }) {
  const c = colors[color] || colors.blue;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden cursor-default"
      style={{
        background: hovered
          ? `linear-gradient(135deg, #1e1e1e, #1a1a1a, ${c.accent}08)`
          : "linear-gradient(135deg, #181818, #1a1a1a)",
        border: `1px solid ${hovered ? c.accent + "55" : "rgba(255,255,255,0.09)"}`,
        boxShadow: hovered
          ? `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px ${c.accent}20, 0 0 40px ${c.accent}10`
          : `0 4px 20px rgba(0,0,0,0.45)`,
        transform: hovered ? "translateY(-5px) scale(1.015)" : "translateY(0) scale(1)",
        transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent bar — animated on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, transparent, ${c.accent}, ${c.bar}, ${c.accent}, transparent)`, backgroundSize: "200% auto", animation: hovered ? "border-rotate 2s ease infinite" : "none" }} />

      {/* Dot-grid overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(circle, ${c.accent}06 1px, transparent 1px)`, backgroundSize: "18px 18px", opacity: hovered ? 1 : 0.5, transition: "opacity 0.3s" }} />

      {/* Radial ambient glow */}
      <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full pointer-events-none transition-all duration-500"
        style={{ background: `radial-gradient(circle, ${c.accent} 0%, transparent 70%)`, opacity: hovered ? 0.18 : 0.06 }} />

      {/* Corner brackets */}
      <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 pointer-events-none" style={{ borderTop: `1.5px solid ${c.accent}50`, borderLeft: `1.5px solid ${c.accent}50` }} />
      <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 pointer-events-none" style={{ borderBottom: `1.5px solid ${c.accent}35`, borderRight: `1.5px solid ${c.accent}35` }} />

      <div className="flex items-start justify-between mb-4 relative">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{
              background: c.grad,
              boxShadow: hovered ? `0 6px 28px ${c.glow}, 0 0 0 4px ${c.accent}15` : `0 4px 16px ${c.glow}`,
              transform: hovered ? "scale(1.08) rotate(-3deg)" : "scale(1) rotate(0deg)",
              transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            }}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {hovered && (
            <div className="absolute inset-0 rounded-xl animate-ping opacity-15"
              style={{ background: c.accent, animationDuration: "1.5s" }} />
          )}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 rounded-full mono"
            style={{ background: c.light, color: c.accent, border: `1px solid ${c.accent}35`, boxShadow: hovered ? `0 0 12px ${c.accent}30` : "none" }}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>

      <p className="text-[34px] font-black leading-none tracking-tight mono"
        style={{ color: c.accent, fontFamily: "'JetBrains Mono', monospace", textShadow: hovered ? `0 0 24px ${c.accent}80` : `0 0 12px ${c.accent}30` }}>{value}</p>
      <p className="text-[13px] font-bold mt-2" style={{ color: "#e8e8e8", fontFamily: "'Space Grotesk', sans-serif" }}>{title}</p>
      {subtitle && <p className="text-[10px] mt-0.5 mono uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{subtitle}</p>}

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] overflow-hidden rounded-b-2xl"
        style={{ background: `${c.accent}10` }}>
        <div className="h-full transition-all duration-700 rounded-full"
          style={{ width: hovered ? "100%" : "35%", background: `linear-gradient(90deg, ${c.accent}, ${c.bar}, ${c.accent})`, backgroundSize: "200% auto", animation: hovered ? "border-rotate 2s ease infinite" : "none" }} />
      </div>
    </div>
  );
}