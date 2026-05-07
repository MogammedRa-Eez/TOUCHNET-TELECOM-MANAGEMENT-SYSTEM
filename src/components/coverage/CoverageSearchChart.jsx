import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { MapPin, TrendingUp } from "lucide-react";

export default function CoverageSearchChart() {
  const { data: searches = [], isLoading } = useQuery({
    queryKey: ["coverage-searches"],
    queryFn: () => base44.entities.CoverageSearch.list("-created_date", 200),
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl p-6 animate-pulse" style={{ background: "#181818", border: "1px solid rgba(0,180,180,0.15)", height: 200 }} />
    );
  }

  if (searches.length === 0) {
    return (
      <div className="rounded-2xl p-8 flex flex-col items-center justify-center gap-2"
        style={{ background: "#181818", border: "1px solid rgba(0,180,180,0.15)" }}>
        <MapPin className="w-8 h-8" style={{ color: "rgba(0,180,180,0.3)" }} />
        <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>No coverage searches yet</p>
      </div>
    );
  }

  // Aggregate by suburb
  const suburbMap = {};
  searches.forEach(s => {
    const key = s.suburb || s.nearest_zone || s.query?.split(",")[0] || "Unknown";
    if (!suburbMap[key]) suburbMap[key] = { name: key, total: 0, covered: 0 };
    suburbMap[key].total++;
    if (s.covered) suburbMap[key].covered++;
  });

  const chartData = Object.values(suburbMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map(d => ({ ...d, pct: Math.round((d.covered / d.total) * 100) }));

  const totalSearches  = searches.length;
  const coveredSearches = searches.filter(s => s.covered).length;
  const coverageRate   = totalSearches ? Math.round((coveredSearches / totalSearches) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Searches", value: totalSearches, color: "#00b4b4" },
          { label: "Coverage Hits",  value: coveredSearches, color: "#10b981" },
          { label: "Coverage Rate",  value: `${coverageRate}%`, color: coverageRate >= 60 ? "#10b981" : "#f59e0b" },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-4 py-3 relative overflow-hidden"
            style={{ background: `${s.color}08`, border: `1px solid ${s.color}22` }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
            <p className="text-[22px] font-black mono" style={{ color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</p>
            <p className="text-[9px] font-black uppercase tracking-wider mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      {chartData.length > 0 && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#181818", border: "1px solid rgba(0,180,180,0.15)" }}>
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#e02347,transparent)" }} />
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <TrendingUp className="w-3.5 h-3.5" style={{ color: "#00b4b4" }} />
            <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: "#00b4b4" }}>Top Searched Areas</p>
          </div>
          <div className="p-4" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1e1e1e", border: "1px solid rgba(0,212,212,0.25)", borderRadius: 10, color: "#f0f0f0", fontSize: 11 }}
                  formatter={(v, name) => [v, name === "covered" ? "Covered" : "Not Covered"]}
                />
                <Bar dataKey="covered" stackId="a" fill="#10b981" radius={[0,0,0,0]} />
                <Bar dataKey="total" stackId="b" fill="rgba(0,180,180,0.2)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}