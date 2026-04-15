import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MapPin, TrendingUp } from "lucide-react";

export default function CoverageSearchChart() {
  const { data: searches = [], isLoading } = useQuery({
    queryKey: ["coverage-searches"],
    queryFn: () => base44.entities.CoverageSearch.list("-created_date", 200),
  });

  // Aggregate searches by address prefix (first word / suburb)
  const areaMap = {};
  searches.forEach(s => {
    const key = (s.address || "Unknown").split(",")[0].trim().slice(0, 24);
    areaMap[key] = (areaMap[key] || 0) + 1;
  });

  const chartData = Object.entries(areaMap)
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const total = searches.length;
  const covered = searches.filter(s => s.is_covered).length;

  if (isLoading) {
    return (
      <div className="h-48 rounded-2xl animate-pulse" style={{ background: "rgba(30,45,110,0.06)" }} />
    );
  }

  if (searches.length === 0) {
    return (
      <div className="rounded-2xl py-12 flex flex-col items-center justify-center"
        style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.1)" }}>
        <MapPin className="w-8 h-8 mb-3" style={{ color: "rgba(30,45,110,0.25)" }} />
        <p className="text-[13px] font-semibold" style={{ color: "rgba(30,45,110,0.5)" }}>No coverage searches yet</p>
        <p className="text-[11px] mt-1" style={{ color: "rgba(30,45,110,0.35)" }}>Data will appear as customers use the coverage check tool</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.1)", boxShadow: "0 2px 16px rgba(30,45,110,0.07)" }}>
      <div className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,#c41e3a,transparent)" }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(30,45,110,0.08)", border: "1px solid rgba(30,45,110,0.15)" }}>
            <TrendingUp className="w-4 h-4" style={{ color: "#1e2d6e" }} />
          </div>
          <div>
            <p className="text-[13px] font-bold" style={{ color: "#1e2d6e" }}>Top Coverage Demand Areas</p>
            <p className="text-[10px] mono" style={{ color: "rgba(30,45,110,0.45)" }}>{total} searches · {covered} covered</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
            style={{ background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)", color: "#059669" }}>
            {total > 0 ? Math.round(covered / total * 100) : 0}% covered
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,110,0.07)" vertical={false} />
          <XAxis dataKey="area" tick={{ fontSize: 10, fill: "rgba(30,45,110,0.5)", fontFamily: "Inter" }} angle={-35} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 10, fill: "rgba(30,45,110,0.45)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.15)", borderRadius: 10, fontSize: 11 }}
            formatter={(v) => [`${v} searches`, "Demand"]}
          />
          <Bar dataKey="count" fill="#1e2d6e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}