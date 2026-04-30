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
      <div className="rounded-2xl p-6 flex items-center justify-center h-48"
        style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.15)" }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#00b4b4", borderTopColor: "transparent" }}/>
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <div className="rounded-2xl p-8 flex flex-col items-center justify-center gap-3 h-48"
        style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.12)" }}>
        <MapPin className="w-8 h-8" style={{ color: "rgba(0,180,180,0.3)" }}/>
        <p className="text-[13px] font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>No coverage searches yet</p>
        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>Data will appear as customers check coverage</p>
      </div>
    );
  }

  const covered   = searches.filter(s => s.covered).length;
  const uncovered = searches.filter(s => !s.covered).length;
  const total     = searches.length;

  // Group by suburb
  const suburbMap = {};
  searches.forEach(s => {
    const key = s.suburb || s.display_name?.split(",")[0]?.trim() || s.query?.split(",")[0]?.trim() || "Unknown";
    if (!suburbMap[key]) suburbMap[key] = { name: key, covered: 0, uncovered: 0 };
    if (s.covered) suburbMap[key].covered++;
    else suburbMap[key].uncovered++;
  });
  const chartData = Object.values(suburbMap)
    .sort((a, b) => (b.covered + b.uncovered) - (a.covered + a.uncovered))
    .slice(0, 10)
    .map(d => ({ ...d, total: d.covered + d.uncovered }));

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.15)" }}>
      <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#8B1A1A,transparent)" }}/>
      <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: "#00b4b4" }}/>
            <p className="text-[13px] font-black" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>Coverage Demand</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#10b981" }}/>
              <span className="text-[11px] font-bold" style={{ color: "#10b981" }}>{covered} covered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" style={{ color: "#8B1A1A" }}/>
              <span className="text-[11px] font-bold" style={{ color: "#c23030" }}>{uncovered} uncovered</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(0,180,180,0.1)", color: "#00b4b4", border: "1px solid rgba(0,180,180,0.2)" }}>
              {total} searches
            </span>
          </div>
        </div>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barSize={16} barCategoryGap="30%">
            <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} width={28}/>
            <Tooltip
              contentStyle={{ background: "#1e1e1e", border: "1px solid rgba(0,212,212,0.2)", borderRadius: 10, color: "#f0f0f0", fontSize: 11 }}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}/>
            <Bar dataKey="covered"   name="Covered"   fill="#10b981" radius={[4,4,0,0]}/>
            <Bar dataKey="uncovered" name="Uncovered" fill="#8B1A1A" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[10px] text-center mt-2" style={{ color: "rgba(255,255,255,0.2)" }}>Top searched suburbs — green = coverage available, red = not yet covered</p>
      </div>
    </div>
  );
}