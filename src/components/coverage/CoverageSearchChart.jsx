import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { MapPin } from "lucide-react";

const COLORS = ["#00b4b4","#00d4d4","#0ea5e9","#8b5cf6","#10b981","#f59e0b","#8B1A1A","#6366f1","#ec4899","#14b8a6"];

export default function CoverageSearchChart() {
  const { data: searches = [], isLoading } = useQuery({
    queryKey: ["coverage-searches"],
    queryFn: () => base44.entities.CoverageSearch.list("-created_date", 50),
  });

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center rounded-2xl"
        style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.1)" }}>
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "#00b4b4", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center gap-2 rounded-2xl"
        style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.1)" }}>
        <MapPin className="w-8 h-8" style={{ color: "rgba(255,255,255,0.1)" }} />
        <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.2)" }}>No coverage searches recorded yet</p>
      </div>
    );
  }

  const suburbMap = {};
  searches.forEach(s => {
    const key = s.suburb || s.query?.split(",")[0]?.trim() || "Unknown";
    suburbMap[key] = (suburbMap[key] || 0) + 1;
  });

  const chartData = Object.entries(suburbMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const coveredCount = searches.filter(s => s.covered).length;
  const coverageRate = searches.length ? Math.round((coveredCount / searches.length) * 100) : 0;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.15)" }}>
      <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#e02347,#00b4b4,transparent)" }} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: "#e02347" }} />
            <p className="text-[13px] font-black uppercase tracking-wider" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>Coverage Demand</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold" style={{ color: "#00d4d4" }}>{coverageRate}% Coverage Rate</p>
            <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>{searches.length} total searches</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Total Searches", value: searches.length,                       color: "#00b4b4" },
            { label: "Covered",        value: coveredCount,                           color: "#10b981" },
            { label: "Not Covered",    value: searches.length - coveredCount,         color: "#8B1A1A" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center"
              style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
              <p className="text-[20px] font-black leading-none" style={{ color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</p>
              <p className="text-[9px] mt-1 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Top Searched Areas</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} barSize={16}>
            <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }} axisLine={false} tickLine={false} width={24} />
            <Tooltip contentStyle={{ background: "#1e1e1e", border: "1px solid rgba(0,212,212,0.2)", borderRadius: 10, color: "#f0f0f0", fontSize: 11 }} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="count" radius={[4,4,0,0]}>
              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}