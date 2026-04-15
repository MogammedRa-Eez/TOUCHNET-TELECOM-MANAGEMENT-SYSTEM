import React from "react";
import { Zap } from "lucide-react";

/**
 * Reusable futuristic page header.
 * Props: title, subtitle, icon (Lucide component), badge, children (action buttons)
 * tickerItems: array of strings for the data ticker
 */
export default function PageHeader({ title, subtitle, icon: Icon, badge, children, tickerItems = [] }) {
  const defaultTicker = [
    "TOUCHNET TMS v3", "SECURE · ENCRYPTED", "ISO 27001",
    "REAL-TIME SYNC", "SAGE INTEGRATED", "AI POWERED",
    "TOUCHNET TMS v3", "SECURE · ENCRYPTED", "ISO 27001",
    "REAL-TIME SYNC", "SAGE INTEGRATED", "AI POWERED",
  ];
  const items = tickerItems.length > 0 ? [...tickerItems, ...tickerItems] : defaultTicker;

  return (
    <div className="space-y-4">
      {/* Data Ticker */}
      <div className="relative overflow-hidden rounded-xl h-8 flex items-center section-reveal"
        style={{ background: "rgba(30,45,110,0.04)", border: "1px solid rgba(30,45,110,0.1)" }}>
        <div className="absolute left-0 top-0 bottom-0 w-14 z-10 pointer-events-none"
          style={{ background: "linear-gradient(90deg, rgba(240,242,248,0.98), transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-14 z-10 pointer-events-none"
          style={{ background: "linear-gradient(270deg, rgba(240,242,248,0.98), transparent)" }} />
        {/* Blinking pulse dot */}
        <div className="absolute left-3 z-20 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#c41e3a", boxShadow: "0 0 6px #c41e3a" }} />
        </div>
        <div className="ticker-track flex items-center gap-10 pl-8 whitespace-nowrap">
          {items.map((t, i) => (
            <span key={i} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em]"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: i % 4 === 0 ? "#1e2d6e" : i % 4 === 1 ? "rgba(30,45,110,0.35)" : i % 4 === 2 ? "#c41e3a" : "rgba(30,45,110,0.25)",
              }}>
              {i % 5 === 0 && <span className="w-0.5 h-3 rounded-full" style={{ background: "rgba(30,45,110,0.2)" }} />}
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Header bar */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-5 section-reveal section-reveal-delay-1"
        style={{
          background: "rgba(255,255,255,0.95)",
          border: "1px solid rgba(30,45,110,0.12)",
          boxShadow: "0 4px 24px rgba(30,45,110,0.07)",
        }}>
        {/* Accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,#c41e3a,#e02347,transparent)" }} />
        {/* Ambient glow corner */}
        <div className="absolute top-0 right-0 w-64 h-32 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(30,45,110,0.05) 0%, transparent 70%)" }} />
        {/* Bottom-left crimson glow */}
        <div className="absolute bottom-0 left-0 w-48 h-24 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 0% 100%, rgba(196,30,58,0.04) 0%, transparent 70%)" }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,rgba(30,45,110,0.1),rgba(30,45,110,0.05))",
                  border: "1px solid rgba(30,45,110,0.18)",
                  boxShadow: "0 4px 16px rgba(30,45,110,0.1)",
                }}>
                <Icon className="w-5 h-5" style={{ color: "#1e2d6e" }} />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black tracking-tight"
                  style={{ color: "#0f1a3d", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {title}
                </h1>
                {badge && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(30,45,110,0.07)", color: "#1e2d6e", border: "1px solid rgba(30,45,110,0.15)" }}>
                    {badge}
                  </span>
                )}
                {/* Live indicator */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full"
                  style={{ background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#059669" }} />
                  <span className="text-[9px] font-black" style={{ color: "#059669", fontFamily: "monospace", letterSpacing: "0.1em" }}>LIVE</span>
                </div>
              </div>
              {subtitle && (
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(30,45,110,0.5)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {children && (
            <div className="flex items-center gap-2 flex-wrap">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}