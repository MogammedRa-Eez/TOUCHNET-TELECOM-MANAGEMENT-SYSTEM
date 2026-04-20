import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { MapPin, TrendingUp } from "lucide-react";

export default function CoverageSearchChart() {
  const { data: searches = [], isLoading } = useQuery({
    queryKey: ["coverage-searches"],
    queryFn: () => base44.entities.CoverageSearch.list("-created_date", 100),
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl p-6 flex items-center justify-center h-48"
        style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#00b4b4", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center"
        style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.08)" }}>
        <MapPin className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(255,255,255,0.2)" }} />
        <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.35)" }}>No coverage searches recorded yet</p>
      </div>
    );
  }

  // Aggregate by area/address
  const areaCounts = {};
  searches.forEach((s) => {
    const key = s.address || s.area || "Unknown";
    areaCounts[key] = (areaCounts[key] || 0) + 1;
  });

  const chartData = Object.entries(areaCounts)
    .map(([area, count]) => ({ area: area.length > 20 ? area.slice(0, 20) + "…" : area, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const COLORS = ["#00b4b4", "#00d4d4", "#e02347", "#ff3358", "#f59e0b", "#10b981", "#a855f7", "#22d3ee", "#f97316", "#6366f1"];

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "#181818", border: "1px solid rgba(0,180,180,0.2)", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
      <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#e02347,#00b4b4,transparent)" }} />
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(224,35,71,0.15)", border: "1px solid rgba(224,35,71,0.3)" }}>
          <TrendingUp className="w-4 h-4" style={{ color: "#e02347" }} />
        </div>
        <div>
          <p className="text-[13px] font-black" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>Coverage Demand</p>
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{searches.length} searches · top requested areas</p>
        </div>
      </div>
      <div className="p-5" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis dataKey="area" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#1e1e1e", border: "1px solid rgba(0,180,180,0.3)", borderRadius: 10, color: "#f0f0f0", fontSize: 12 }}
              formatter={(v) => [v, "Searches"]}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}