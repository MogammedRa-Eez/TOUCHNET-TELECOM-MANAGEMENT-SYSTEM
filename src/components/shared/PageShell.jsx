/**
 * PageShell — Consistent futuristic whitish-teal page header wrapper.
 * Used across all main pages for unified branding.
 */
import React from "react";
import { Zap } from "lucide-react";

export default function PageShell({
  icon: Icon,
  title,
  subtitle,
  badge,
  badgeColor = "#00b4b4",
  tickerItems = [],
  actions,
  children,
  alert,
}) {
  const tickers = tickerItems.length > 0 ? [...tickerItems, ...tickerItems] : [];

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-[1600px] mx-auto">

      {/* ── Whitish-teal ticker ── */}
      {tickers.length > 0 && (
        <div className="relative overflow-hidden rounded-xl h-8 flex items-center"
          style={{
            background: "linear-gradient(90deg,rgba(0,212,212,0.05),rgba(255,255,255,0.02),rgba(0,180,180,0.04))",
            border: "1px solid rgba(0,212,212,0.15)",
            boxShadow: "0 0 16px rgba(0,180,180,0.05), inset 0 1px 0 rgba(255,255,255,0.04)"
          }}>
          <div className="absolute left-0 top-0 bottom-0 w-14 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg,#111111,transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-14 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg,#111111,transparent)" }} />
          <div className="ticker-track flex items-center gap-10 px-6 whitespace-nowrap">
            {tickers.map((t, i) => (
              <span key={i} className="text-[9px] font-black uppercase tracking-[0.22em] mono flex items-center gap-1.5"
                style={{ color: i % 4 === 0 ? "#00d4d4" : i % 4 === 1 ? "rgba(0,212,212,0.4)" : i % 4 === 2 ? "rgba(255,255,255,0.2)" : "#e02347" }}>
                {i % 4 === 0 && <span className="w-1 h-1 rounded-full inline-block" style={{ background: "currentColor" }} />}
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Alert bar ── */}
      {alert && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: `linear-gradient(90deg,${alert.color}0a,${alert.color}05)`,
            border: `1px solid ${alert.color}30`,
          }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: alert.color, boxShadow: `0 0 8px ${alert.color}` }} />
          <p className="text-[12px] font-bold" style={{ color: alert.color }}>{alert.text}</p>
        </div>
      )}

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-5"
        style={{
          background: "linear-gradient(135deg,#181818 0%,#1c1c1c 50%,#181818 100%)",
          border: "1px solid rgba(0,212,212,0.2)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,212,0.04), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}>
        {/* Animated whitish-teal top bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.5),#00b4b4,#e02347,#00b4b4,transparent)" }} />
        {/* Top-right ambient glow */}
        <div className="absolute top-0 right-0 w-72 h-32 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 100% 0%,rgba(0,212,212,0.1) 0%,rgba(255,255,255,0.02) 40%,transparent 70%)" }} />
        {/* Corner brackets */}
        <div className="absolute top-3 left-3 w-4 h-4 pointer-events-none"
          style={{ borderTop: "1.5px solid rgba(0,212,212,0.4)", borderLeft: "1.5px solid rgba(0,212,212,0.4)" }} />
        <div className="absolute bottom-3 right-3 w-4 h-4 pointer-events-none"
          style={{ borderBottom: "1.5px solid rgba(224,35,71,0.3)", borderRight: "1.5px solid rgba(224,35,71,0.3)" }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {Icon && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,rgba(0,212,212,0.2),rgba(255,255,255,0.05))", border: "1px solid rgba(0,212,212,0.35)", boxShadow: "0 4px 14px rgba(0,180,180,0.2)" }}>
                  <Icon className="w-4 h-4" style={{ color: "#00d4d4" }} />
                </div>
              )}
              <h1 className="text-2xl font-black tracking-tight" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>{title}</h1>
              {badge && (
                <span className="flex items-center gap-1.5 text-[9px] font-black px-2 py-1 rounded-lg mono uppercase tracking-wider"
                  style={{ background: `${badgeColor}15`, color: badgeColor, border: `1px solid ${badgeColor}35` }}>
                  <Zap className="w-2.5 h-2.5" /> {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] mono pl-10" style={{ color: "rgba(255,255,255,0.35)" }}>{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </div>

      {children}
    </div>
  );
}