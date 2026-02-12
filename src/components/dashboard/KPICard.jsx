import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "blue" }) {
  const colors = {
    blue: { bg: "bg-blue-50", icon: "bg-blue-500", text: "text-blue-600", glow: "shadow-blue-500/20" },
    emerald: { bg: "bg-emerald-50", icon: "bg-emerald-500", text: "text-emerald-600", glow: "shadow-emerald-500/20" },
    amber: { bg: "bg-amber-50", icon: "bg-amber-500", text: "text-amber-600", glow: "shadow-amber-500/20" },
    rose: { bg: "bg-rose-50", icon: "bg-rose-500", text: "text-rose-600", glow: "shadow-rose-500/20" },
    violet: { bg: "bg-violet-50", icon: "bg-violet-500", text: "text-violet-600", glow: "shadow-violet-500/20" },
    cyan: { bg: "bg-cyan-50", icon: "bg-cyan-500", text: "text-cyan-600", glow: "shadow-cyan-500/20" },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${c.icon} ${c.glow} shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
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
      <p className="text-2xl font-bold text-slate-800 mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}