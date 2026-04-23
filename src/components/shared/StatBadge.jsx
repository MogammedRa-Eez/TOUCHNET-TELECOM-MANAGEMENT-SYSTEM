import React from "react";

/** A small futuristic animated stat/KPI pill */
export default function StatBadge({ label, value, color = "#00b4b4", icon: Icon, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl px-4 py-3.5 text-left w-full transition-all duration-200 hover:scale-[1.03] group"
      style={{
        background: active ? `${color}14` : "#181818",
        border: `1px solid ${active ? color + "55" : color + "22"}`,
        boxShadow: active ? `0 6px 24px ${color}20` : "0 2px 12px rgba(0,0,0,0.4)",
        cursor: onClick ? "pointer" : "default",
      }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}44, transparent)` }} />
      <div className="absolute -bottom-3 -right-3 w-14 h-14 rounded-full pointer-events-none transition-all duration-500 group-hover:scale-150 opacity-40"
        style={{ background: `radial-gradient(circle, ${color}25, transparent 70%)` }} />
      {/* Corner dot */}
      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: color, opacity: 0.5, boxShadow: `0 0 6px ${color}` }} />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
          <p className="text-2xl font-black leading-none" style={{ color, fontFamily: "'JetBrains Mono',monospace", textShadow: active ? `0 0 16px ${color}60` : "none" }}>{value}</p>
        </div>
        {Icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
        )}
      </div>
    </button>
  );
}