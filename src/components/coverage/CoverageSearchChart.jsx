import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { MapPin } from "lucide-react";

export default function CoverageSearchChart() {
  const { data: searches = [], isLoading } = useQuery({
    queryKey: ["coverage-searches"],
    queryFn: () => base44.entities.CoverageSearch.list("-created_date", 100),
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl p-6" style={{ background: "rgba(16,12,36,0.97)", border: "1px solid rgba(177,151,252,0.22)" }}>
        <p className="text-[12px]" style={{ color: "rgba(203,181,253,0.5)" }}>Loading coverage data…</p>
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <div className="rounded-2xl p-6 flex flex-col items-center justify-center py-12"
        style={{ background: "rgba(16,12,36,0.97)", border: "1px solid rgba(177,151,252,0.22)" }}>
        <MapPin className="w-8 h-8 mb-3" style={{ color: "rgba(177,151,252,0.3)" }} />
        <p className="text-[13px] font-bold" style={{ color: "rgba(203,181,253,0.5)" }}>No coverage searches yet</p>
        <p className="text-[11px] mt-1" style={{ color: "rgba(203,181,253,0.35)" }}>Searches will appear here once customers check coverage</p>
      </div>
    );
  }

  const covered   = searches.filter(s => s.covered).length;
  const uncovered = searches.filter(s => !s.covered).length;
  const chartData = [
    { label: "Covered",     value: covered,   color: "#57f287" },
    { label: "No Coverage", value: uncovered,  color: "#ff7b7b" },
  ];

  // Recent searches
  const recent = searches.slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(16,12,36,0.97)", border: "1px solid rgba(177,151,252,0.22)" }}>
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#57f287,#00e5ff,transparent)" }} />
          <div className="p-5">
            <p className="text-[13px] font-black mb-1" style={{ color: "#f8f4ff" }}>Coverage Results</p>
            <p className="text-[10px] mb-4" style={{ color: "rgba(203,181,253,0.45)" }}>{searches.length} total searches</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barSize={40}>
                <XAxis dataKey="label" tick={{ fill: "#9b8fef", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9b8fef", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "rgba(16,12,36,0.99)", border: "1px solid rgba(177,151,252,0.35)", borderRadius: 10, color: "#f0ecff", fontSize: 11 }}
                  cursor={{ fill: "rgba(177,151,252,0.07)" }}
                />
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent searches list */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(16,12,36,0.97)", border: "1px solid rgba(177,151,252,0.22)" }}>
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#b197fc,#d988fa,transparent)" }} />
          <div className="p-5">
            <p className="text-[13px] font-black mb-4" style={{ color: "#f8f4ff" }}>Recent Searches</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recent.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(177,151,252,0.07)", border: "1px solid rgba(177,151,252,0.12)" }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: s.covered ? "#57f287" : "#ff7b7b", boxShadow: `0 0 6px ${s.covered ? "#57f287" : "#ff7b7b"}` }} />
                  <p className="text-[11px] flex-1 truncate" style={{ color: "#e8d5ff" }}>{s.address}</p>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ background: s.covered ? "rgba(87,242,135,0.1)" : "rgba(255,123,123,0.1)", color: s.covered ? "#57f287" : "#ff7b7b" }}>
                    {s.covered ? "Yes" : "No"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}