import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MapPin, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoverageSearchChart() {
  const { data: searches = [], isLoading } = useQuery({
    queryKey: ["coverage-searches"],
    queryFn: () => base44.entities.CoverageSearch.list("-created_date", 100),
  });

  if (isLoading) return <Skeleton className="h-48 rounded-2xl" />;

  if (searches.length === 0) {
    return (
      <div className="rounded-2xl py-12 text-center" style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.12)" }}>
        <MapPin className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(30,45,110,0.25)" }} />
        <p className="text-[12px]" style={{ color: "rgba(30,45,110,0.5)" }}>No coverage searches yet</p>
        <p className="text-[10px] mt-0.5" style={{ color: "rgba(30,45,110,0.35)" }}>Data will appear here as customers use the coverage checker</p>
      </div>
    );
  }

  // Aggregate by date
  const byDate = {};
  searches.forEach(s => {
    const d = s.created_date?.slice(0, 10) || "Unknown";
    if (!byDate[d]) byDate[d] = { date: d, total: 0, covered: 0, notCovered: 0 };
    byDate[d].total++;
    if (s.covered) byDate[d].covered++;
    else byDate[d].notCovered++;
  });
  const chartData = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)).slice(-14);

  const coveredCount    = searches.filter(s => s.covered).length;
  const notCoveredCount = searches.filter(s => !s.covered).length;
  const coverageRate    = searches.length ? Math.round((coveredCount / searches.length) * 100) : 0;

  // Top searched zones
  const zoneCounts = {};
  searches.forEach(s => {
    if (s.nearest_zone) zoneCounts[s.nearest_zone] = (zoneCounts[s.nearest_zone] || 0) + 1;
  });
  const topZones = Object.entries(zoneCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Searches", value: searches.length, color: "#1e2d6e", icon: MapPin },
          { label: "Coverage Found", value: coveredCount,    color: "#059669", icon: CheckCircle2 },
          { label: "Coverage Rate",  value: `${coverageRate}%`, color: "#0ea5e9", icon: TrendingUp },
        ].map(k => (
          <div key={k.label} className="relative overflow-hidden rounded-2xl px-4 py-3 holo-card"
            style={{ background: "#ffffff", border: `1px solid ${k.color}22`, boxShadow: `0 2px 10px ${k.color}0a` }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg,${k.color},transparent)` }} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(30,45,110,0.4)" }}>{k.label}</p>
                <p className="text-2xl font-black mono mt-0.5" style={{ color: k.color, fontFamily: "'JetBrains Mono',monospace" }}>{k.value}</p>
              </div>
              <k.icon className="w-5 h-5" style={{ color: k.color, opacity: 0.5 }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="lg:col-span-2 rounded-2xl p-4" style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.12)" }}>
          <p className="text-[11px] font-black uppercase tracking-wider mb-3" style={{ color: "rgba(30,45,110,0.5)" }}>Daily Coverage Searches (last 14 days)</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,110,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(30,45,110,0.4)" }} axisLine={false} tickLine={false}
                tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 9, fill: "rgba(30,45,110,0.4)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid rgba(30,45,110,0.15)", borderRadius: 10, fontSize: 11 }}
              />
              <Bar dataKey="covered"    name="Covered"     fill="#059669" radius={[3,3,0,0]} maxBarSize={24} fillOpacity={0.8} />
              <Bar dataKey="notCovered" name="Not Covered" fill="#c41e3a" radius={[3,3,0,0]} maxBarSize={24} fillOpacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top zones */}
        <div className="rounded-2xl p-4" style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.12)" }}>
          <p className="text-[11px] font-black uppercase tracking-wider mb-3" style={{ color: "rgba(30,45,110,0.5)" }}>Top Searched Zones</p>
          {topZones.length === 0 ? (
            <p className="text-[11px]" style={{ color: "rgba(30,45,110,0.35)" }}>No zone data yet</p>
          ) : (
            <div className="space-y-2">
              {topZones.map(([zone, count], i) => (
                <div key={zone}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] font-bold truncate" style={{ color: "#1e2d6e" }}>{zone}</span>
                    <span className="text-[10px] mono" style={{ color: "rgba(30,45,110,0.5)" }}>{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(30,45,110,0.08)" }}>
                    <div className="h-full rounded-full" style={{ width: `${(count / topZones[0][1]) * 100}%`, background: i === 0 ? "linear-gradient(90deg,#1e2d6e,#4a5fa8)" : "rgba(30,45,110,0.3)" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent searches */}
          <p className="text-[10px] font-black uppercase tracking-wider mt-4 mb-2" style={{ color: "rgba(30,45,110,0.35)" }}>Recent</p>
          <div className="space-y-1.5">
            {searches.slice(0, 4).map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                {s.covered
                  ? <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: "#059669" }} />
                  : <XCircle className="w-3 h-3 flex-shrink-0" style={{ color: "#c41e3a" }} />}
                <p className="text-[10px] truncate" style={{ color: "rgba(30,45,110,0.6)" }}>{s.query || s.display_name || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}