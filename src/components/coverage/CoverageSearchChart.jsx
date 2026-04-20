import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapPin, TrendingUp } from "lucide-react";

export default function CoverageSearchChart() {
  const { data: searches = [], isLoading } = useQuery({
    queryKey: ["coverage-searches"],
    queryFn: () => base44.entities.CoverageSearch.list("-created_date", 50),
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl p-6 animate-pulse" style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.07)", height: 200 }} />
    );
  }

  if (searches.length === 0) {
    return (
      <div className="rounded-2xl p-8 flex flex-col items-center justify-center gap-3"
        style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.07)" }}>
        <MapPin className="w-8 h-8" style={{ color: "rgba(224,35,71,0.4)" }} />
        <p className="text-[13px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>No coverage searches yet</p>
        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>Coverage demand data will appear here as customers check availability.</p>
      </div>
    );
  }

  // Count searches by day (last 14 days)
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split("T")[0];
  });

  const countsByDay = {};
  searches.forEach(s => {
    const day = s.created_date?.split("T")[0];
    if (day) countsByDay[day] = (countsByDay[day] || 0) + 1;
  });

  const max = Math.max(...days.map(d => countsByDay[d] || 0), 1);

  return (
    <div className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: "#181818", border: "1px solid rgba(224,35,71,0.2)", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#e02347,#ff3358,transparent)" }} />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.15em] flex items-center gap-2"
            style={{ color: "#e02347", fontFamily: "'Space Grotesk',sans-serif" }}>
            <TrendingUp className="w-3.5 h-3.5" /> Coverage Demand
          </h3>
          <p className="text-[10px] mono mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Last 14 days · {searches.length} total searches</p>
        </div>
        <div className="px-3 py-1.5 rounded-xl text-[14px] font-black mono"
          style={{ background: "rgba(224,35,71,0.12)", border: "1px solid rgba(224,35,71,0.3)", color: "#e02347" }}>
          {searches.length}
        </div>
      </div>

      <div className="flex items-end gap-1.5 h-28">
        {days.map(day => {
          const count = countsByDay[day] || 0;
          const pct   = (count / max) * 100;
          const label = new Date(day).toLocaleDateString("en-ZA", { month: "short", day: "numeric" });
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full relative flex flex-col justify-end" style={{ height: 88 }}>
                <div className="w-full rounded-t-lg transition-all duration-500 relative overflow-hidden"
                  style={{ height: `${Math.max(pct, 4)}%`, background: count > 0 ? "linear-gradient(180deg,#e02347,#ff3358aa)" : "rgba(255,255,255,0.04)", boxShadow: count > 0 ? "0 0 8px rgba(224,35,71,0.4)" : "none" }}>
                  {count > 0 && (
                    <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)", backgroundSize: "200% 100%", animation: "shimmer 2s infinite" }} />
                  )}
                </div>
              </div>
              {count > 0 && (
                <span className="text-[8px] mono font-black opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5"
                  style={{ color: "#e02347" }}>{count}</span>
              )}
              <span className="text-[7px] mono opacity-40 rotate-[-30deg] mt-0.5 whitespace-nowrap"
                style={{ color: "rgba(255,255,255,0.35)", fontSize: "7px" }}>{label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 flex flex-wrap gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-[10px] font-bold uppercase tracking-wider w-full mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>Recent Searches</p>
        {searches.slice(0, 8).map((s, i) => (
          <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold"
            style={{ background: "rgba(224,35,71,0.08)", border: "1px solid rgba(224,35,71,0.15)", color: "rgba(255,255,255,0.5)" }}>
            <MapPin className="w-2.5 h-2.5 flex-shrink-0" style={{ color: "#e02347" }} />
            {s.address || "Unknown"}
          </span>
        ))}
      </div>
    </div>
  );
}