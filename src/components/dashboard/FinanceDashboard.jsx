import React from "react";
import { DollarSign, Receipt, AlertCircle, TrendingUp, CreditCard, CheckCircle } from "lucide-react";
import KPICard from "./KPICard";
import RevenueChart from "./RevenueChart";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function FinanceDashboard({ customers, invoices }) {
  const paid = invoices.filter(i => i.status === "paid");
  const overdue = invoices.filter(i => i.status === "overdue");
  const draft = invoices.filter(i => i.status === "draft");
  const sent = invoices.filter(i => i.status === "sent");

  const totalPaid = paid.reduce((a, i) => a + (i.total || i.amount || 0), 0);
  const totalOverdue = overdue.reduce((a, i) => a + (i.total || i.amount || 0), 0);
  const totalOutstanding = sent.reduce((a, i) => a + (i.total || i.amount || 0), 0);
  const monthlyRecurring = customers.filter(c => c.status === "active").reduce((a, c) => a + (c.monthly_rate || 0), 0);

  const statusData = [
    { name: "Paid", value: paid.length, color: "#10b981" },
    { name: "Sent", value: sent.length, color: "#3b82f6" },
    { name: "Overdue", value: overdue.length, color: "#ef4444" },
    { name: "Draft", value: draft.length, color: "#94a3b8" },
  ].filter(d => d.value > 0);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.12)", color: "#059669", border: "1px solid rgba(16,185,129,0.25)" }}>
          FINANCE — BILLING & REVENUE
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Revenue Collected" value={`R${(totalPaid / 1000).toFixed(1)}k`} subtitle="Paid invoices" icon={CheckCircle} color="emerald" trend="up" trendValue="+8.5%" />
        <KPICard title="Monthly Recurring" value={`R${(monthlyRecurring / 1000).toFixed(1)}k`} subtitle="Active customers" icon={TrendingUp} color="blue" />
        <KPICard title="Outstanding" value={`R${(totalOutstanding / 1000).toFixed(1)}k`} subtitle={`${sent.length} sent invoices`} icon={CreditCard} color="amber" />
        <KPICard title="Overdue" value={`R${(totalOverdue / 1000).toFixed(1)}k`} subtitle={`${overdue.length} invoices`} icon={AlertCircle} color="rose" trend={overdue.length > 0 ? "up" : "down"} trendValue={overdue.length > 0 ? "Needs action" : "Clear"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RevenueChart invoices={invoices} />
        </div>

        {/* Invoice status breakdown */}
        <div className="rounded-xl p-6" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h3 className="text-[13px] font-semibold text-slate-700 mb-1">Invoice Status</h3>
          <p className="text-[11px] mb-4" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>All {invoices.length} invoices</p>
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 relative flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData.length ? statusData : [{ value: 1, color: "#e2e8f0" }]} innerRadius={32} outerRadius={52} dataKey="value" paddingAngle={3} strokeWidth={0}>
                    {(statusData.length ? statusData : [{ color: "#e2e8f0" }]).map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{invoices.length}</span>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              {statusData.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overdue invoices list */}
      {overdue.length > 0 && (
        <div className="rounded-xl p-6" style={{ background: "#ffffff", border: "1px solid rgba(239,68,68,0.15)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <h3 className="text-[13px] font-semibold text-red-700">Overdue Invoices — Action Required</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                  {["Invoice #", "Customer", "Amount", "Due Date"].map(h => (
                    <th key={h} className="text-left pb-2 text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overdue.slice(0, 8).map(inv => (
                  <tr key={inv.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                    <td className="py-2 text-slate-700 font-mono text-xs">{inv.invoice_number || inv.id?.slice(0, 8)}</td>
                    <td className="py-2 text-slate-700">{inv.customer_name}</td>
                    <td className="py-2 font-semibold text-red-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>R{(inv.total || inv.amount || 0).toLocaleString()}</td>
                    <td className="py-2 text-slate-500 text-xs">{inv.due_date || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}