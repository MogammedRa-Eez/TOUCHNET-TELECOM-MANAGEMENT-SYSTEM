import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { MapPin, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoverageSearchChart() {
  const { data: searches = [], isLoading } = useQuery({
    queryKey: ["coverage-searches"],
    queryFn: () => base44.entities.CoverageSearch.list("-created_date", 200),
  });

  if (isLoading) return <Skeleton className="h-48 w-full rounded-2xl" />;
  if (searches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 rounded-2xl"
        style={{ background: "rgba(177,151,252,0.05)", border: "1px solid rgba(177,151,252,0.15)" }}>
        <MapPin className="w-8 h-8 mb-2" style={{ color: "rgba(177,151,252,0.4)" }} />
        <p className="text-[13px] font-bold" style={{ color: "#cbb5fd" }}>No coverage searches yet</p>
        <p className="text-[11px] mt-1" style={{ color: "rgba(203,181,253,0.5)" }}>Data will appear once users check coverage</p>
      </div>
    );
  }

  // Aggregate by suburb (first part of display_name or query)
  const suburbMap = {};
  searches.forEach(s => {
    const key = (s.suburb || s.query || "Unknown").split(",")[0].trim();
    if (!suburbMap[key]) suburbMap[key] = { name: key, total: 0, covered: 0 };
    suburbMap[key].total++;
    if (s.covered) suburbMap[key].covered++;
  });

  const chartData = Object.values(suburbMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map(d => ({ ...d, notCovered: d.total - d.covered }));

  const totalSearches = searches.length;
  const coveredCount  = searches.filter(s => s.covered).length;
  const coverageRate  = totalSearches > 0 ? Math.round((coveredCount / totalSearches) * 100) : 0;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(16,12,36,0.95)", border: "1px solid rgba(177,151,252,0.22)", boxShadow: "0 4px 28px rgba(177,151,252,0.14)" }}>
      <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#b197fc,#00e5ff,transparent)" }} />
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(177,151,252,0.15)", border: "1px solid rgba(177,151,252,0.28)" }}>
              <TrendingUp className="w-4 h-4" style={{ color: "#b197fc" }} />
            </div>
            <div>
              <p className="text-[13px] font-black" style={{ color: "#f8f4ff" }}>Coverage Demand by Area</p>
              <p className="text-[10px] mono" style={{ color: "rgba(203,181,253,0.5)" }}>Top searched suburbs</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[18px] font-black mono" style={{ color: "#b197fc" }}>{totalSearches}</p>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(203,181,253,0.45)" }}>Total Searches</p>
            </div>
            <div className="text-right">
              <p className="text-[18px] font-black mono" style={{ color: coverageRate >= 70 ? "#57f287" : coverageRate >= 40 ? "#ffd460" : "#ff7b7b" }}>{coverageRate}%</p>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(203,181,253,0.45)" }}>Coverage Rate</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={18} barGap={2}>
            <XAxis dataKey="name" tick={{ fill: "#9b8fef", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9b8fef", fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "rgba(16,12,36,0.99)", border: "1px solid rgba(177,151,252,0.35)", borderRadius: 10, color: "#f0ecff", fontSize: 11 }}
              cursor={{ fill: "rgba(177,151,252,0.08)" }}
            />
            <Bar dataKey="covered"    name="Covered"     stackId="a" radius={[0,0,0,0]}>
              {chartData.map((_, i) => <Cell key={i} fill="#57f287" fillOpacity={0.85} />)}
            </Bar>
            <Bar dataKey="notCovered" name="Not Covered" stackId="a" radius={[4,4,0,0]}>
              {chartData.map((_, i) => <Cell key={i} fill="#ff7b7b" fillOpacity={0.75} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: "#57f287" }} />
            <span className="text-[10px] font-semibold" style={{ color: "rgba(203,181,253,0.7)" }}>Covered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: "#ff7b7b" }} />
            <span className="text-[10px] font-semibold" style={{ color: "rgba(203,181,253,0.7)" }}>Not Covered</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            {coveredCount > 0
              ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#57f287" }} />
              : <XCircle className="w-3.5 h-3.5" style={{ color: "#ff7b7b" }} />}
            <span className="text-[10px] font-bold" style={{ color: "rgba(203,181,253,0.6)" }}>
              {coveredCount} of {totalSearches} covered
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}