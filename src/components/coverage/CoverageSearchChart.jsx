import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { MapPin, CheckCircle2, XCircle } from "lucide-react";

export default function CoverageSearchChart() {
  const { data: searches = [], isLoading } = useQuery({
    queryKey: ["coverage-searches"],
    queryFn: () => base44.entities.CoverageSearch.list("-created_date", 100),
  });

  const covered   = searches.filter(s => s.covered).length;
  const uncovered = searches.filter(s => !s.covered).length;
  const total     = searches.length;

  // Group by suburb
  const suburbMap = {};
  searches.forEach(s => {
    const key = s.suburb || s.query?.split(",")[0]?.trim() || "Unknown";
    if (!suburbMap[key]) suburbMap[key] = { name: key, count: 0, covered: 0 };
    suburbMap[key].count++;
    if (s.covered) suburbMap[key].covered++;
  });

  const chartData = Object.values(suburbMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (isLoading) {
    return (
      <div className="rounded-2xl p-6 flex items-center justify-center"
        style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.15)", minHeight: 200 }}>
        <div className="animate-pulse w-6 h-6 rounded-full" style={{ background: "rgba(0,212,212,0.3)" }} />
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="rounded-2xl p-8 flex flex-col items-center justify-center gap-3"
        style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.15)", minHeight: 200 }}>
        <MapPin className="w-8 h-8" style={{ color: "rgba(0,212,212,0.2)" }} />
        <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>No coverage searches yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.18)" }}>
      <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#e02347,#00b4b4,transparent)" }} />
      <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(224,35,71,0.1)" }}>
              <MapPin className="w-3.5 h-3.5" style={{ color: "#e02347" }} />
            </div>
            <p className="text-[14px] font-black" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>Coverage Search Analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <CheckCircle2 className="w-3 h-3" style={{ color: "#10b981" }} />
              <span className="text-[11px] font-bold" style={{ color: "#10b981" }}>{covered} Covered</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
              style={{ background: "rgba(139,26,26,0.1)", border: "1px solid rgba(139,26,26,0.2)" }}>
              <XCircle className="w-3 h-3" style={{ color: "#c23030" }} />
              <span className="text-[11px] font-bold" style={{ color: "#c23030" }}>{uncovered} Not Covered</span>
            </div>
            <div className="px-3 py-1 rounded-lg"
              style={{ background: "rgba(0,180,180,0.08)", border: "1px solid rgba(0,180,180,0.2)" }}>
              <span className="text-[11px] font-bold" style={{ color: "#00b4b4" }}>{total} Total</span>
            </div>
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="p-5">
          <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.25)" }}>Top searched areas</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={20}>
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} width={25} />
              <Tooltip
                contentStyle={{ background: "#1e1e1e", border: "1px solid rgba(0,212,212,0.2)", borderRadius: 8, color: "#f0f0f0", fontSize: 11 }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar dataKey="count" name="Searches" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.covered > entry.count / 2 ? "#00b4b4" : "#8B1A1A"} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent searches */}
      <div className="px-5 pb-5 space-y-1.5">
        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>Recent searches</p>
        {searches.slice(0, 5).map(s => (
          <div key={s.id} className="flex items-center gap-3 px-3 py-2 rounded-xl"
            style={{ background: s.covered ? "rgba(0,180,180,0.05)" : "rgba(139,26,26,0.05)", border: `1px solid ${s.covered ? "rgba(0,180,180,0.15)" : "rgba(139,26,26,0.15)"}` }}>
            {s.covered
              ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#10b981" }} />
              : <XCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#c23030" }} />}
            <span className="text-[11px] flex-1 truncate" style={{ color: "rgba(255,255,255,0.6)" }}>{s.query}</span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: s.covered ? "rgba(0,180,180,0.12)" : "rgba(139,26,26,0.12)", color: s.covered ? "#00b4b4" : "#c23030" }}>
              {s.covered ? "COVERED" : "NO COVERAGE"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}