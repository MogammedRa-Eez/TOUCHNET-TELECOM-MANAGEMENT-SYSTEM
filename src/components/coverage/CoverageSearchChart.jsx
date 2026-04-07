import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { MapPin, TrendingUp, Loader2 } from "lucide-react";

export default function CoverageSearchChart() {
  const { data: searches = [], isLoading } = useQuery({
    queryKey: ["coverage-searches"],
    queryFn: () => base44.entities.CoverageSearch.list("-created_date", 200),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#9b8fef" }} />
    </div>
  );

  if (searches.length === 0) return (
    <div className="rounded-2xl p-8 text-center"
      style={{ background: "rgba(255,255,255,0.96)", border: "1px solid rgba(155,143,239,0.12)" }}>
      <MapPin className="w-8 h-8 mx-auto mb-2" style={{ color: "#c4bcf7" }} />
      <p className="text-[13px] font-semibold text-slate-500">No coverage searches yet</p>
    </div>
  );

  // Group by suburb
  const suburbCounts = {};
  searches.forEach(s => {
    const key = s.suburb || s.query?.split(",")[0]?.trim() || "Unknown";
    if (!suburbCounts[key]) suburbCounts[key] = { suburb: key, total: 0, covered: 0 };
    suburbCounts[key].total++;
    if (s.covered) suburbCounts[key].covered++;
  });

  const chartData = Object.values(suburbCounts)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const totalSearches = searches.length;
  const coveredCount  = searches.filter(s => s.covered).length;
  const coverageRate  = totalSearches > 0 ? Math.round((coveredCount / totalSearches) * 100) : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl px-3 py-2.5 text-[11px]"
        style={{ background: "rgba(26,19,48,0.97)", border: "1px solid rgba(155,143,239,0.3)", boxShadow: "0 8px 24px rgba(124,111,224,0.2)" }}>
        <p className="font-black mb-1" style={{ color: "#c4bcf7" }}>{label}</p>
        <p style={{ color: "#9b8fef" }}>Total searches: <strong>{payload[0]?.value}</strong></p>
        <p style={{ color: "#10b981" }}>Covered: <strong>{payload[1]?.value || 0}</strong></p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Searches", value: totalSearches, color: "#9b8fef" },
          { label: "In Coverage",    value: coveredCount,  color: "#10b981" },
          { label: "Coverage Rate",  value: `${coverageRate}%`, color: "#06b6d4" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl px-4 py-3 relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.96)", border: "1px solid rgba(155,143,239,0.12)", boxShadow: "0 2px 12px rgba(139,92,246,0.06)" }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
            <p className="text-[22px] font-black mono" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] mt-0.5 uppercase tracking-wider" style={{ color: "#94a3b8" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.96)", border: "1px solid rgba(155,143,239,0.12)", boxShadow: "0 2px 12px rgba(139,92,246,0.06)" }}>
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid rgba(155,143,239,0.08)" }}>
          <TrendingUp className="w-4 h-4" style={{ color: "#9b8fef" }} />
          <p className="text-[13px] font-bold" style={{ color: "#1e293b" }}>Top Searched Areas</p>
          <div className="ml-auto flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#9b8fef" }} />
              <span style={{ color: "#64748b" }}>Total</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#10b981" }} />
              <span style={{ color: "#64748b" }}>Covered</span>
            </div>
          </div>
        </div>
        <div className="px-2 py-4" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={2} barCategoryGap="25%">
              <XAxis dataKey="suburb" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(155,143,239,0.06)" }} />
              <Bar dataKey="total" fill="#9b8fef" radius={[4, 4, 0, 0]} />
              <Bar dataKey="covered" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}