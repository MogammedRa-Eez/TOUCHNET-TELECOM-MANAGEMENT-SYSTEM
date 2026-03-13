import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { TrendingUp, Users, FileText, CheckCircle, Clock, AlertCircle, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function SalesDashboard() {
  const { data: customers = [] } = useQuery({ queryKey: ["dept-customers"], queryFn: () => base44.entities.Customer.list() });
  const { data: projects = [] } = useQuery({ queryKey: ["dept-projects"], queryFn: () => base44.entities.FibreProject.list() });
  const { data: invoices = [] } = useQuery({ queryKey: ["dept-invoices"], queryFn: () => base44.entities.Invoice.list() });

  const leads = projects.filter(p => p.status === "lead").length;
  const quoted = projects.filter(p => p.status === "quoted").length;
  const approved = projects.filter(p => ["approved", "in_progress", "testing", "live", "billed"].includes(p.status)).length;
  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.total || i.amount || 0), 0);
  const outstanding = invoices.filter(i => ["sent", "overdue"].includes(i.status)).reduce((s, i) => s + (i.total || i.amount || 0), 0);

  const pipelineData = [
    { stage: "Lead", count: leads },
    { stage: "Quoted", count: quoted },
    { stage: "Approved", count: approved },
    { stage: "Live", count: projects.filter(p => p.status === "live").length },
    { stage: "Billed", count: projects.filter(p => p.status === "billed").length },
  ];

  const recentCustomers = customers.slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <DeptHeader title="Sales Dashboard" dept="Sales" color="#6366f1" icon="💼" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Total Customers" value={customers.length} icon={<Users className="w-4 h-4 text-indigo-500" />} bg="bg-indigo-50" />
        <KPI label="Leads / Pipeline" value={leads + quoted} icon={<Clock className="w-4 h-4 text-yellow-500" />} bg="bg-yellow-50" />
        <KPI label="Revenue Collected" value={`R${totalRevenue.toLocaleString()}`} icon={<DollarSign className="w-4 h-4 text-emerald-500" />} bg="bg-emerald-50" />
        <KPI label="Outstanding" value={`R${outstanding.toLocaleString()}`} icon={<AlertCircle className="w-4 h-4 text-red-500" />} bg="bg-red-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-700 text-sm mb-4">Sales Pipeline</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pipelineData}>
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-700 text-sm mb-4">Recent Customers</h3>
          <div className="space-y-2">
            {recentCustomers.length === 0 ? <p className="text-sm text-slate-400">No customers yet</p> : recentCustomers.map(c => (
              <div key={c.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">{c.full_name}</p>
                  <p className="text-xs text-slate-400">{c.service_plan?.replace(/_/g, " ")}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${c.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-slate-700 text-sm mb-4">Recent Projects</h3>
        <div className="space-y-2">
          {projects.slice(0, 6).map(p => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-700">{p.project_name}</p>
                <p className="text-xs text-slate-400">{p.customer_name} · {p.quote_number}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-semibold capitalize">{p.status}</span>
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