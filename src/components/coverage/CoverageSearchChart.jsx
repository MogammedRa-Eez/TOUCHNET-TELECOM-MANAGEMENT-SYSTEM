import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { MapPin, TrendingUp, Search, AlertCircle, Loader2 } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl px-3 py-2.5 text-xs shadow-xl"
      style={{ background: "rgba(26,19,48,0.98)", border: "1px solid rgba(155,143,239,0.25)" }}>
      <p className="font-bold mb-1" style={{ color: "#c4bcf7" }}>{label}</p>
      <p style={{ color: "#9b8fef" }}>Searches: <strong>{d.count}</strong></p>
      <p style={{ color: d.covered > d.uncovered ? "#10b981" : "#ef4444" }}>
        Covered: <strong>{d.covered}</strong> · Uncovered: <strong>{d.uncovered}</strong>
      </p>
    </div>
  );
};

export default function CoverageSearchChart() {
  const { data: searches = [], isLoading } = useQuery({
    queryKey: ["coverage-searches"],
    queryFn: () => base44.entities.CoverageSearch.list("-created_date", 500),
  });

  const chartData = useMemo(() => {
    const map = {};
    searches.forEach(s => {
      const key = s.suburb || s.query || "Unknown";
      if (!map[key]) map[key] = { area: key, count: 0, covered: 0, uncovered: 0 };
      map[key].count++;
      if (s.covered) map[key].covered++;
      else map[key].uncovered++;
    });
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [searches]);

  const totalSearches  = searches.length;
  const coveredCount   = searches.filter(s => s.covered).length;
  const uncoveredCount = totalSearches - coveredCount;
  const topArea        = chartData[0]?.area || "—";

  if (isLoading) return (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#9b8fef" }} />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Searches",    value: totalSearches,  color: "#9b8fef" },
          { label: "In Coverage",       value: coveredCount,   color: "#10b981" },
          { label: "Outside Coverage",  value: uncoveredCount, color: "#ef4444" },
          { label: "Top Demand Area",   value: topArea,        color: "#f59e0b", small: true },
        ].map(k => (
          <div key={k.label} className="rounded-xl px-4 py-3 relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.96)", border: `1px solid ${k.color}18`, boxShadow: `0 2px 12px ${k.color}08` }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, ${k.color}, transparent)` }} />
            <p className={`font-black leading-none mt-1 ${k.small ? "text-[13px]" : "text-[22px]"}`} style={{ color: k.color }}>{k.value}</p>
            <p className="text-[10px] mt-1 uppercase tracking-wider font-bold" style={{ color: "#94a3b8" }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(155,143,239,0.1)", boxShadow: "0 2px 16px rgba(155,143,239,0.06)" }}>
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#9b8fef,#c4bcf7,transparent)" }} />
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(155,143,239,0.08)" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(155,143,239,0.1)" }}>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: "#9b8fef" }} />
            </div>
            <div>
              <p className="text-[13px] font-black" style={{ color: "#1e293b" }}>Top Searched Areas</p>
              <p className="text-[10px]" style={{ color: "#94a3b8" }}>High-demand regions for fibre expansion</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#9b8fef" }} />
              <span style={{ color: "#64748b" }}>Covered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#ef4444" }} />
              <span style={{ color: "#64748b" }}>Uncovered</span>
            </div>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Search className="w-10 h-10 mb-3" style={{ color: "#e2e8f0" }} />
            <p className="font-bold text-slate-400 text-sm">No searches recorded yet</p>
            <p className="text-slate-400 text-xs mt-1">Data will appear as customers use the coverage checker</p>
          </div>
        ) : (
          <div className="px-4 py-5">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(155,143,239,0.08)" />
                <XAxis dataKey="area" tick={{ fontSize: 10, fill: "#94a3b8" }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="covered" stackId="a" fill="#9b8fef" radius={[0, 0, 0, 0]} />
                <Bar dataKey="uncovered" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Table */}
      {chartData.length > 0 && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(155,143,239,0.1)" }}>
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#ef4444,#f97316,transparent)" }} />
          <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: "1px solid rgba(155,143,239,0.08)" }}>
            <AlertCircle className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
            <p className="text-[12px] font-black" style={{ color: "#1e293b" }}>Uncovered High-Demand Areas</p>
            <p className="text-[10px] ml-1" style={{ color: "#94a3b8" }}>— priority candidates for expansion</p>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(155,143,239,0.06)" }}>
            {chartData
              .filter(d => d.uncovered > 0)
              .sort((a, b) => b.uncovered - a.uncovered)
              .slice(0, 8)
              .map((d, i) => (
                <div key={d.area} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <span className="text-[11px] font-black w-5 text-center" style={{ color: "#94a3b8" }}>#{i + 1}</span>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(239,68,68,0.1)" }}>
                    <MapPin className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
                  </div>
                  <span className="flex-1 text-[13px] font-bold" style={{ color: "#1e293b" }}>{d.area}</span>
                  <span className="text-[11px] font-black" style={{ color: "#ef4444" }}>{d.uncovered} searches</span>
                  <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(226,232,240,0.8)" }}>
                    <div className="h-full rounded-full" style={{ width: `${(d.uncovered / chartData[0].count) * 100}%`, background: "linear-gradient(90deg,#ef4444,#f97316)" }} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}