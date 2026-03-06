import React from "react";
import { X, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const STATUS_COLORS = {
  lead: "#94a3b8", quoted: "#f59e0b", approved: "#6366f1",
  in_progress: "#3b82f6", testing: "#8b5cf6", live: "#10b981", billed: "#059669", cancelled: "#ef4444",
};

export default function ProjectForecastReport({ projects, onClose }) {
  // Projects going live per month
  const monthlyForecast = {};
  projects.forEach(p => {
    const dateStr = p.forecasted_go_live_date || p.actual_go_live_date;
    if (dateStr) {
      const month = dateStr.slice(0, 7); // YYYY-MM
      if (!monthlyForecast[month]) monthlyForecast[month] = { month, count: 0, annuity: 0, once_off: 0 };
      monthlyForecast[month].count += 1;
      monthlyForecast[month].annuity += (p.annuity_amount || 0);
      monthlyForecast[month].once_off += (p.once_off_amount || 0);
    }
  });
  const forecastData = Object.values(monthlyForecast).sort((a, b) => a.month.localeCompare(b.month)).slice(0, 12);

  const live = projects.filter(p => p.status === "live");
  const billed = projects.filter(p => p.status === "billed");
  const wip = projects.filter(p => !["lead","cancelled","billed"].includes(p.status));

  const totalAnnuity = [...live, ...billed].reduce((a, p) => a + (p.annuity_amount || 0), 0);
  const totalOnceOff = [...live, ...billed].reduce((a, p) => a + (p.once_off_amount || 0), 0);
  const wipValue = wip.reduce((a, p) => a + (p.annuity_amount || 0) + (p.once_off_amount || 0), 0);

  const statusGroups = {};
  projects.forEach(p => {
    if (!statusGroups[p.status]) statusGroups[p.status] = 0;
    statusGroups[p.status]++;
  });
  const statusData = Object.entries(statusGroups).map(([status, count]) => ({ status, count }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#f8faff", border: "1px solid rgba(99,102,241,0.2)" }}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#0f1845,#1e2a4a)", borderBottom: "1px solid rgba(99,102,241,0.2)" }}>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h2 className="text-white font-bold">Project Forecast & Reports</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Projects", value: projects.length, color: "#6366f1" },
              { label: "Annuity Revenue", value: `R${totalAnnuity.toLocaleString()}`, color: "#10b981" },
              { label: "Once-Off Revenue", value: `R${totalOnceOff.toLocaleString()}`, color: "#f59e0b" },
              { label: "Work In Progress", value: `R${wipValue.toLocaleString()}`, color: "#8b5cf6" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl p-4" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.1)" }}>
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className="text-xl font-bold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Monthly Forecast Chart */}
          <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.1)" }}>
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" /> Forecasted Projects per Month
            </h3>
            {forecastData.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No forecasted dates set on projects</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={forecastData}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v, name) => [name === "count" ? v + " projects" : `R${v.toLocaleString()}`, name === "count" ? "Projects" : name === "annuity" ? "Annuity" : "Once-Off"]} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} name="count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Revenue Forecast Chart */}
          <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.1)" }}>
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Revenue Forecast per Month (R)
            </h3>
            {forecastData.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No forecasted dates set on projects</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={forecastData}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`R${v.toLocaleString()}`]} />
                  <Bar dataKey="annuity" fill="#10b981" radius={[4,4,0,0]} name="Annuity" />
                  <Bar dataKey="once_off" fill="#f59e0b" radius={[4,4,0,0]} name="Once-Off" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pipeline by Status */}
          <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.1)" }}>
            <h3 className="text-sm font-bold text-slate-700 mb-4">Project Pipeline by Status</h3>
            <div className="space-y-2">
              {statusData.map(({ status, count }) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-slate-500 capitalize">{status.replace("_"," ")}</span>
                  <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                    <div className="h-5 rounded-full flex items-center pl-2"
                      style={{ width: `${Math.max((count / projects.length) * 100, 5)}%`, background: STATUS_COLORS[status] || "#94a3b8" }}>
                      <span className="text-[10px] text-white font-bold">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Table: Billed */}
          <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.1)" }}>
            <h3 className="text-sm font-bold text-slate-700 mb-3">Billed Projects</h3>
            {billed.length === 0 ? <p className="text-xs text-slate-400">None yet</p> : (
              <table className="w-full text-xs">
                <thead><tr className="text-slate-400 border-b">
                  <th className="text-left pb-2">Quote #</th><th className="text-left pb-2">Project</th>
                  <th className="text-left pb-2">Customer</th><th className="text-right pb-2">Annuity</th>
                  <th className="text-right pb-2">Once-Off</th><th className="text-left pb-2">Billing Start</th>
                </tr></thead>
                <tbody>{billed.map(p => (
                  <tr key={p.id} className="border-b border-slate-50">
                    <td className="py-2 font-mono text-indigo-600">{p.quote_number}</td>
                    <td className="py-2 font-medium text-slate-700">{p.project_name}</td>
                    <td className="py-2 text-slate-500">{p.customer_name}</td>
                    <td className="py-2 text-right text-emerald-600 font-semibold">R{(p.annuity_amount||0).toLocaleString()}</td>
                    <td className="py-2 text-right text-amber-600 font-semibold">R{(p.once_off_amount||0).toLocaleString()}</td>
                    <td className="py-2 text-slate-400">{p.billing_start_date || "—"}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}