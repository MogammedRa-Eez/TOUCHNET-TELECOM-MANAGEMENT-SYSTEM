import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "blue" }) {
  const colors = {
    blue: { iconBg: "bg-indigo-600", iconShadow: "shadow-indigo-200", bar: "bg-indigo-500" },
    emerald: { iconBg: "bg-emerald-500", iconShadow: "shadow-emerald-200", bar: "bg-emerald-500" },
    amber: { iconBg: "bg-amber-500", iconShadow: "shadow-amber-200", bar: "bg-amber-500" },
    rose: { iconBg: "bg-rose-500", iconShadow: "shadow-rose-200", bar: "bg-rose-500" },
    violet: { iconBg: "bg-violet-600", iconShadow: "shadow-violet-200", bar: "bg-violet-500" },
    cyan: { iconBg: "bg-cyan-500", iconShadow: "shadow-cyan-200", bar: "bg-cyan-500" },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${c.bar} rounded-l-2xl`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${c.iconBg} shadow-lg ${c.iconShadow} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
            trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          }`}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-[26px] font-bold text-slate-800 leading-tight">{value}</p>
      <p className="text-sm font-semibold text-slate-500 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}