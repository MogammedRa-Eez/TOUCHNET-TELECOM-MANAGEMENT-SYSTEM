import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { MapPin, TrendingUp, CheckCircle2, XCircle } from "lucide-react";

export default function CoverageSearchChart() {
  const { data: searches = [], isLoading } = useQuery({
    queryKey: ["coverage-searches"],
    queryFn: () => base44.entities.CoverageSearch.list("-created_date", 100),
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl p-6 animate-pulse" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", height: 200 }} />
    );
  }

  if (searches.length === 0) {
    return (
      <div className="rounded-2xl p-8 flex flex-col items-center justify-center gap-3"
        style={{ background: "rgba(10,6,24,0.9)", border: "1px solid rgba(139,92,246,0.18)" }}>
        <MapPin className="w-8 h-8" style={{ color: "rgba(196,181,253,0.3)" }} />
        <p className="text-[13px] font-semibold" style={{ color: "rgba(196,181,253,0.5)" }}>No coverage searches yet</p>
        <p className="text-[11px]" style={{ color: "rgba(196,181,253,0.3)" }}>Searches from the coverage checker will appear here</p>
      </div>
    );
  }

  // Aggregate by query (suburb/city)
  const queryMap = {};
  searches.forEach(s => {
    const key = s.query || "Unknown";
    if (!queryMap[key]) queryMap[key] = { query: key, total: 0, covered: 0 };
    queryMap[key].total++;
    if (s.covered) queryMap[key].covered++;
  });

  const chartData = Object.values(queryMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map(d => ({ ...d, uncovered: d.total - d.covered }));

  const coveredCount = searches.filter(s => s.covered).length;
  const uncoveredCount = searches.length - coveredCount;
  const coverageRate = searches.length > 0 ? ((coveredCount / searches.length) * 100).toFixed(1) : 0;

  return (
    <div className="rounded-2xl p-5 space-y-5"
      style={{ background: "rgba(10,6,24,0.95)", border: "1px solid rgba(139,92,246,0.2)", boxShadow: "0 4px 24px rgba(139,92,246,0.12)" }}>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
            <TrendingUp className="w-4 h-4" style={{ color: "#a78bfa" }} />
          </div>
          <div>
            <p className="text-[14px] font-black" style={{ color: "#c4b5fd" }}>Coverage Demand</p>
            <p className="text-[10px]" style={{ color: "rgba(196,181,253,0.4)", fontFamily: "monospace" }}>{searches.length} searches tracked</p>
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
            <span className="text-[11px] font-bold" style={{ color: "#10b981" }}>{coveredCount} covered</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <XCircle className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
            <span className="text-[11px] font-bold" style={{ color: "#ef4444" }}>{uncoveredCount} not covered</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.28)" }}>
            <span className="text-[11px] font-black" style={{ color: "#a78bfa" }}>{coverageRate}% rate</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 40 }}>
            <XAxis
              dataKey="query"
              tick={{ fill: "#a78bfa", fontSize: 10 }}
              angle={-35}
              textAnchor="end"
              interval={0}
              tickLine={false}
              axisLine={false}
            />
            <YAxis tick={{ fill: "#7c6fad", fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "rgba(12,8,28,0.98)",
                border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: 10,
                color: "#e2d9f3",
                fontSize: 12,
              }}
              cursor={{ fill: "rgba(139,92,246,0.06)" }}
            />
            <Bar dataKey="covered" name="Covered" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="uncovered" name="Not Covered" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-1" style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}>
        {[{ color: "#10b981", label: "Covered searches" }, { color: "#ef4444", label: "Not yet covered" }].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: l.color }} />
            <span className="text-[11px]" style={{ color: "rgba(196,181,253,0.6)" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}