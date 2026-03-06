import React from "react";
import { Users, DollarSign, TrendingUp, Network, UserCheck, Clock } from "lucide-react";
import KPICard from "./KPICard";
import RevenueChart from "./RevenueChart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function SalesDashboard({ customers, invoices, projects = [] }) {
  const activeCustomers = customers.filter(c => c.status === "active").length;
  const pendingCustomers = customers.filter(c => c.status === "pending").length;
  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((a, i) => a + (i.total || i.amount || 0), 0);
  const overdueAmount = invoices.filter(i => i.status === "overdue").reduce((a, i) => a + (i.total || i.amount || 0), 0);
  const liveProjects = projects.filter(p => p.status === "live" || p.status === "billed").length;
  const inProgressProjects = projects.filter(p => ["approved", "in_progress", "testing"].includes(p.status)).length;

  // Plan distribution
  const planCounts = customers.reduce((acc, c) => {
    const plan = (c.service_plan || "unknown").replace(/_/g, " ");
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {});
  const planData = Object.entries(planCounts).map(([plan, count]) => ({ plan: plan.split(" ")[0], count }));

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.12)", color: "#059669", border: "1px solid rgba(16,185,129,0.25)" }}>
          SALES — CUSTOMERS & REVENUE
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active Customers" value={activeCustomers.toLocaleString()} subtitle={`${pendingCustomers} pending`} icon={UserCheck} color="blue" trend="up" trendValue="+12%" />
        <KPICard title="Total Customers" value={customers.length.toLocaleString()} subtitle="All accounts" icon={Users} color="cyan" />
        <KPICard title="Paid Revenue" value={`R${(totalRevenue / 1000).toFixed(1)}k`} subtitle="Collected" icon={DollarSign} color="emerald" trend="up" trendValue="+8.5%" />
        <KPICard title="Overdue" value={`R${(overdueAmount / 1000).toFixed(1)}k`} subtitle="Needs follow-up" icon={Clock} color="rose" trend={overdueAmount > 0 ? "up" : "down"} trendValue={overdueAmount > 0 ? "Action needed" : "Clear"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RevenueChart invoices={invoices} />
        </div>
        {/* Service Plan Distribution */}
        <div className="rounded-xl p-6" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h3 className="text-[13px] font-semibold text-slate-700 mb-1">Service Plan Distribution</h3>
          <p className="text-[11px] mb-4" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>Customers per plan</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={planData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis dataKey="plan" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#475569" }} width={55} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="#1a2550" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl p-6" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h3 className="text-[13px] font-semibold text-slate-700 mb-1">Fibre Project Pipeline</h3>
          <p className="text-[11px] mb-4" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>Project conversion status</p>
          <div className="space-y-3">
            {[
              { label: "Live / Billed", value: liveProjects, color: "#10b981", total: projects.length },
              { label: "In Progress", value: inProgressProjects, color: "#3b82f6", total: projects.length },
              { label: "Leads / Quoted", value: projects.filter(p => ["lead", "quoted"].includes(p.status)).length, color: "#f59e0b", total: projects.length },
              { label: "Cancelled", value: projects.filter(p => p.status === "cancelled").length, color: "#ef4444", total: projects.length },
            ].map(({ label, value, color, total }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "rgba(0,0,0,0.06)" }}>
                  <div className="h-2 rounded-full transition-all" style={{ background: color, width: total ? `${(value / total) * 100}%` : "0%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent customers */}
        <div className="rounded-xl p-6" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h3 className="text-[13px] font-semibold text-slate-700 mb-1">Recent Customers</h3>
          <p className="text-[11px] mb-4" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>Latest sign-ups</p>
          <div className="space-y-2">
            {customers.slice(0, 6).map(c => (
              <div key={c.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                <div>
                  <p className="text-sm font-medium text-slate-700">{c.full_name}</p>
                  <p className="text-[11px] text-slate-400">{(c.service_plan || "").replace(/_/g, " ")}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-emerald-50 text-emerald-700" : c.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}