import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { DollarSign, AlertCircle, CheckCircle, TrendingDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function FinanceDashboard() {
  const { data: invoices = [] } = useQuery({ queryKey: ["fin-invoices"], queryFn: () => base44.entities.Invoice.list("-created_date") });
  const { data: customers = [] } = useQuery({ queryKey: ["fin-customers"], queryFn: () => base44.entities.Customer.list() });

  const paid = invoices.filter(i => i.status === "paid");
  const overdue = invoices.filter(i => i.status === "overdue");
  const sent = invoices.filter(i => i.status === "sent");

  const totalRevenue = paid.reduce((s, i) => s + (i.total || i.amount || 0), 0);
  const totalOutstanding = [...sent, ...overdue].reduce((s, i) => s + (i.total || i.amount || 0), 0);
  const totalOverdue = overdue.reduce((s, i) => s + (i.total || i.amount || 0), 0);

  const pieData = [
    { name: "Paid", value: paid.length, color: "#10b981" },
    { name: "Sent", value: sent.length, color: "#3b82f6" },
    { name: "Overdue", value: overdue.length, color: "#ef4444" },
    { name: "Draft", value: invoices.filter(i => i.status === "draft").length, color: "#94a3b8" },
  ].filter(d => d.value > 0);

  return (
    <div className="p-6 space-y-6">
      <DeptHeader title="Finance Dashboard" dept="Finance" color="#10b981" icon="💰" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Revenue Collected" value={`R${totalRevenue.toLocaleString()}`} icon={<DollarSign className="w-4 h-4 text-emerald-500" />} bg="bg-emerald-50" />
        <KPI label="Outstanding" value={`R${totalOutstanding.toLocaleString()}`} icon={<AlertCircle className="w-4 h-4 text-yellow-500" />} bg="bg-yellow-50" />
        <KPI label="Overdue Amount" value={`R${totalOverdue.toLocaleString()}`} icon={<TrendingDown className="w-4 h-4 text-red-500" />} bg="bg-red-50" />
        <KPI label="Paid Invoices" value={paid.length} icon={<CheckCircle className="w-4 h-4 text-blue-500" />} bg="bg-blue-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-700 text-sm mb-4">Invoice Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-700 text-sm mb-4">Overdue Invoices</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {overdue.length === 0 ? (
              <p className="text-sm text-emerald-600 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> No overdue invoices!</p>
            ) : overdue.slice(0, 8).map(inv => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-slate-700">{inv.customer_name}</p>
                  <p className="text-xs text-slate-400">{inv.invoice_number} · Due {inv.due_date}</p>
                </div>
                <span className="text-sm font-bold text-red-600">R{(inv.total || inv.amount || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-slate-700 text-sm mb-4">Recent Invoices</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {invoices.slice(0, 10).map(inv => (
            <div key={inv.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-700">{inv.customer_name}</p>
                <p className="text-xs text-slate-400">{inv.invoice_number} · {inv.created_date?.slice(0, 10)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-800">R{(inv.total || inv.amount || 0).toFixed(2)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                  inv.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                  inv.status === "overdue" ? "bg-red-100 text-red-600" :
                  inv.status === "sent" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                }`}>{inv.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, icon, bg }) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-white/50`}>
      <div className="flex items-center justify-between mb-1">{icon}</div>
      <p className="text-xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function DeptHeader({ title, dept, color, icon }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${color}15` }}>{icon}</div>
      <div>
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        <p className="text-xs text-slate-400">{dept} Department · Private View</p>
      </div>
    </div>
  );
}