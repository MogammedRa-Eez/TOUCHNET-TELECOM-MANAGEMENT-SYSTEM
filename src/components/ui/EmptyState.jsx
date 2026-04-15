import React from "react";
import { Plus } from "lucide-react";

export default function EmptyState({ icon: Icon, title, message, actionLabel, onAction, color = "#1e2d6e" }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 section-reveal">
      <div className="relative mb-5">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-3xl animate-ping opacity-10"
          style={{ background: color, animationDuration: "2.5s" }} />
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center relative"
          style={{
            background: `linear-gradient(135deg, ${color}12, ${color}06)`,
            border: `1px solid ${color}25`,
            boxShadow: `0 8px 32px ${color}15`,
          }}>
          {Icon && <Icon className="w-8 h-8" style={{ color }} />}
          {/* Corner accents */}
          <div className="absolute top-1.5 left-1.5 w-3 h-3 pointer-events-none"
            style={{ borderTop: `2px solid ${color}40`, borderLeft: `2px solid ${color}40` }} />
          <div className="absolute bottom-1.5 right-1.5 w-3 h-3 pointer-events-none"
            style={{ borderBottom: `2px solid rgba(196,30,58,0.35)`, borderRight: `2px solid rgba(196,30,58,0.35)` }} />
        </div>
      </div>
      <p className="font-black text-[15px] mb-1" style={{ color: "#0f1a3d", fontFamily: "'Space Grotesk', sans-serif" }}>{title}</p>
      <p className="text-[12px] text-center max-w-xs" style={{ color: "rgba(30,45,110,0.5)" }}>{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction}
          className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 active:scale-95 ripple-btn"
          style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)", boxShadow: "0 4px 20px rgba(30,45,110,0.3)" }}>
          <Plus className="w-4 h-4" /> {actionLabel}
        </button>
      )}
    </div>
  );
}