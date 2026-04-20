import React from "react";

const DEFAULT_TICKERS = ["TOUCHNET TMS", "LIVE SYSTEM", "SECURE", "REAL-TIME", "ENTERPRISE GRADE"];

export default function PageHeader({ title, subtitle, icon: Icon, tickerItems, children }) {
  const tickers = tickerItems?.length ? [...tickerItems, ...tickerItems] : [...DEFAULT_TICKERS, ...DEFAULT_TICKERS];

  return (
    <div className="space-y-3">
      {/* Ticker */}
      <div className="relative overflow-hidden rounded-xl h-8 flex items-center"
        style={{ background: "rgba(0,180,180,0.04)", border: "1px solid rgba(0,180,180,0.12)" }}>
        <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg,#111111,transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg,#111111,transparent)" }} />
        <div className="ticker-track flex items-center gap-10 px-6 whitespace-nowrap">
          {tickers.map((t, i) => (
            <span key={i} className="text-[9px] font-black uppercase tracking-[0.2em] mono"
              style={{ color: i % 3 === 0 ? "#00b4b4" : i % 3 === 1 ? "rgba(0,180,180,0.4)" : "#e02347" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Header card */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-5"
        style={{ background: "#181818", border: "1px solid rgba(0,180,180,0.2)", boxShadow: "0 4px 32px rgba(0,0,0,0.5)" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,#e02347,transparent)" }} />
        <div className="absolute top-0 right-0 w-64 h-32 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(0,180,180,0.08) 0%, transparent 65%)" }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {Icon && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(0,180,180,0.15)", border: "1px solid rgba(0,180,180,0.3)" }}>
                  <Icon className="w-4 h-4" style={{ color: "#00b4b4" }} />
                </div>
              )}
              <h1 className="text-2xl font-black tracking-tight" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h1>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10b981" }} />
                <span className="text-[9px] font-black mono uppercase tracking-wider" style={{ color: "#10b981" }}>LIVE</span>
              </div>
            </div>
            {subtitle && <p className="text-[11px] mono pl-10" style={{ color: "rgba(255,255,255,0.35)" }}>{subtitle}</p>}
          </div>
          {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
        </div>
      </div>
    </div>
  );
}