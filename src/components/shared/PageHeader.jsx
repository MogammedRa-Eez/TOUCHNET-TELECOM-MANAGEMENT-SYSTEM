import React from "react";
import LiveClock from "./LiveClock";

/**
 * Reusable futuristic page header
 * Props: title, subtitle, icon (lucide component), accentColor, children (action buttons), tickerItems
 */
export default function PageHeader({ title, subtitle, icon: Icon, accentColor = "#00b4b4", children, tickerItems = [] }) {
  const items = tickerItems.length > 0 ? [...tickerItems, ...tickerItems] : [];

  return (
    <div className="space-y-3">
      {/* Ticker */}
      {items.length > 0 && (
        <div className="relative overflow-hidden rounded-xl h-8 flex items-center"
          style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
          <div className="absolute left-0 top-0 bottom-0 w-14 z-10 pointer-events-none"
            style={{ background: "linear-gradient(90deg,#111111,transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-14 z-10 pointer-events-none"
            style={{ background: "linear-gradient(270deg,#111111,transparent)" }} />
          {/* Left tag */}
          <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center px-3"
            style={{ background: `${accentColor}15`, borderRight: `1px solid ${accentColor}25` }}>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] mono" style={{ color: accentColor }}>SYS</span>
          </div>
          <div className="ticker-track flex items-center gap-10 px-6 whitespace-nowrap ml-12">
            {items.map((t, i) => (
              <span key={i} className="text-[9px] font-black uppercase tracking-[0.2em] mono"
                style={{ color: i % 3 === 0 ? accentColor : i % 3 === 1 ? `${accentColor}60` : "#e02347" }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Header card */}
      <div className="relative overflow-hidden rounded-2xl px-5 py-4"
        style={{ background: "linear-gradient(135deg,#141414,#1a1a1a)", border: `1px solid ${accentColor}30`, boxShadow: `0 4px 32px rgba(0,0,0,0.5), 0 0 40px ${accentColor}06` }}>
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg,${accentColor},#00d4d4,rgba(255,255,255,0.5),${accentColor},#e02347,transparent)` }} />
        {/* Corner brackets */}
        <div className="absolute top-3 left-3 w-4 h-4 pointer-events-none" style={{ borderTop: `1.5px solid ${accentColor}60`, borderLeft: `1.5px solid ${accentColor}60` }} />
        <div className="absolute top-3 right-3 w-4 h-4 pointer-events-none" style={{ borderTop: "1.5px solid rgba(224,35,71,0.4)", borderRight: "1.5px solid rgba(224,35,71,0.4)" }} />
        <div className="absolute bottom-3 left-3 w-4 h-4 pointer-events-none" style={{ borderBottom: `1.5px solid ${accentColor}35`, borderLeft: `1.5px solid ${accentColor}35` }} />
        <div className="absolute bottom-3 right-3 w-4 h-4 pointer-events-none" style={{ borderBottom: "1.5px solid rgba(224,35,71,0.25)", borderRight: "1.5px solid rgba(224,35,71,0.25)" }} />
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, ${accentColor}06 1px, transparent 1px)`, backgroundSize: "22px 22px" }} />
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-32 pointer-events-none" style={{ background: `radial-gradient(ellipse at 100% 0%, ${accentColor}12 0%, transparent 60%)` }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}40`, boxShadow: `0 0 16px ${accentColor}20` }}>
                <Icon className="w-5 h-5" style={{ color: accentColor }} />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black tracking-tight leading-none" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>{title}</h1>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10b981", boxShadow: "0 0 5px #10b981" }} />
                  <LiveClock style={{ fontSize: 9, fontWeight: 800, color: "#10b981", letterSpacing: "0.1em" }} />
                </div>
              </div>
              {subtitle && <p className="text-[11px] mt-0.5 mono" style={{ color: "rgba(255,255,255,0.35)" }}>{subtitle}</p>}
            </div>
          </div>
          {children && (
            <div className="flex flex-wrap items-center gap-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}