import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { MapPin, TrendingUp } from "lucide-react";

export default function CoverageSearchChart() {
  const { data: searches = [], isLoading } = useQuery({
    queryKey: ["coverage-searches"],
    queryFn: () => base44.entities.CoverageSearch.list("-created_date", 100),
  });

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#00b4b4", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <MapPin className="w-10 h-10 mb-3" style={{ color: "rgba(255,255,255,0.15)" }} />
        <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.35)" }}>No coverage searches yet</p>
      </div>
    );
  }

  // Group by address prefix (first word / suburb-level)
  const counts = {};
  searches.forEach(s => {
    const key = (s.address || "Unknown").split(",")[0].trim().substring(0, 25);
    counts[key] = (counts[key] || 0) + 1;
  });

  const chartData = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4" style={{ color: "#e02347" }} />
        <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
          Top searched areas ({searches.length} total)
        </p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="name"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#1e1e1e", border: "1px solid rgba(224,35,71,0.3)", borderRadius: 10, color: "#f0f0f0" }}
            labelStyle={{ color: "#f0f0f0", fontWeight: 700 }}
            itemStyle={{ color: "#e02347" }}
          />
          <Bar dataKey="count" fill="#e02347" radius={[4, 4, 0, 0]} name="Searches" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}