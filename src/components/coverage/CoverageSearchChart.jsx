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
      <div className="h-48 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#00b4b4", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center gap-2">
        <MapPin className="w-8 h-8" style={{ color: "rgba(255,255,255,0.2)" }} />
        <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.35)" }}>No coverage searches yet</p>
      </div>
    );
  }

  // Aggregate by suburb/province
  const counts = {};
  searches.forEach(s => {
    const key = s.suburb || s.province || (s.query?.split(",")[0]) || "Unknown";
    counts[key] = (counts[key] || 0) + 1;
  });

  const chartData = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const covered = searches.filter(s => s.covered).length;
  const total   = searches.length;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl px-3 py-2" style={{ background: "#1e1e1e", border: "1px solid rgba(0,180,180,0.25)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
        <p className="text-[12px] font-bold" style={{ color: "#f0f0f0" }}>{payload[0].payload.name}</p>
        <p className="text-[11px] mono" style={{ color: "#00d4d4" }}>{payload[0].value} search{payload[0].value !== 1 ? "es" : ""}</p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Searches", value: total,                       color: "#00b4b4" },
          { label: "Covered Areas",  value: covered,                     color: "#10b981" },
          { label: "Not Covered",    value: total - covered,             color: "#e02347" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-3 text-center"
            style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
            <p className="text-[20px] font-black mono" style={{ color, fontFamily: "'JetBrains Mono',monospace" }}>{value}</p>
            <p className="text-[9px] uppercase tracking-wider font-bold mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "rgba(0,212,212,0.6)" }}>
          <TrendingUp className="w-3.5 h-3.5" /> Top Searched Areas
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,180,180,0.06)" }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={i === 0 ? "#00b4b4" : i === 1 ? "#00d4d4" : "rgba(0,180,180,0.4)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}