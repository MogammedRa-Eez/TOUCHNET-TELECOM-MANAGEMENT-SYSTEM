import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { TrendingUp, Users, FileText, CheckCircle, Clock, AlertCircle, DollarSign, Plus, Eye, ArrowRight, Target, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import QuoteBuilder from "@/components/sales/QuoteBuilder";
import QuotePreview from "@/components/sales/QuotePreview";

const STATUS_COLORS = {
  lead: "#f59e0b", quoted: "#6366f1", approved: "#3b82f6",
  in_progress: "#8b5cf6", testing: "#06b6d4", live: "#10b981", billed: "#64748b", cancelled: "#ef4444",
};

const QUOTE_STATUS_COLORS = { draft: "#94a3b8", sent: "#3b82f6", viewed: "#8b5cf6", accepted: "#10b981", declined: "#ef4444", expired: "#f59e0b" };

const TABS = ["Overview", "Pipeline", "Quotes", "Customers"];

export default function SalesDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);
  const [previewQuote, setPreviewQuote] = useState(null);
  const qc = useQueryClient();

  const { data: customers = [] } = useQuery({ queryKey: ["dept-customers"], queryFn: () => base44.entities.Customer.list() });
  const { data: projects = [] } = useQuery({ queryKey: ["dept-projects"], queryFn: () => base44.entities.FibreProject.list() });
  const { data: invoices = [] } = useQuery({ queryKey: ["dept-invoices"], queryFn: () => base44.entities.Invoice.list() });
  const { data: quotes = [] } = useQuery({ queryKey: ["dept-quotes"], queryFn: () => base44.entities.Quote.list("-created_date") });

  const saveQuoteMut = useMutation({
    mutationFn: (data) => data.id ? base44.entities.Quote.update(data.id, data) : base44.entities.Quote.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dept-quotes"] }); setShowQuoteBuilder(false); },
  });

  const leads = projects.filter(p => p.status === "lead").length;
  const quoted = projects.filter(p => p.status === "quoted").length;
  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.total || i.amount || 0), 0);
  const outstanding = invoices.filter(i => ["sent", "overdue"].includes(i.status)).reduce((s, i) => s + (i.total || i.amount || 0), 0);
  const acceptedQuotes = quotes.filter(q => q.status === "accepted");
  const quoteConversion = quotes.length ? Math.round((acceptedQuotes.length / quotes.length) * 100) : 0;

  const pipelineData = [
    { stage: "Lead", count: leads },
    { stage: "Quoted", count: quoted },
    { stage: "Approved", count: projects.filter(p => p.status === "approved").length },
    { stage: "In Progress", count: projects.filter(p => p.status === "in_progress").length },
    { stage: "Live", count: projects.filter(p => p.status === "live").length },
    { stage: "Billed", count: projects.filter(p => p.status === "billed").length },
  ];

  const quotesByStatus = Object.entries(
    quotes.reduce((acc, q) => { acc[q.status] = (acc[q.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value, color: QUOTE_STATUS_COLORS[name] || "#94a3b8" }));

  const recentCustomers = [...customers].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 8);
  const recentQuotes = quotes.slice(0, 6);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "rgba(99,102,241,0.1)" }}>💼</div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Sales Dashboard</h1>
            <p className="text-xs text-slate-400">Sales Department · Private View</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setShowQuoteBuilder(true)} className="gap-1.5 text-white text-xs" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            <Plus className="w-3.5 h-3.5" /> New Quote
          </Button>
          <Link to={createPageUrl("Quotes")}>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs"><FileText className="w-3.5 h-3.5" /> All Quotes</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === t ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "Overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPI label="Total Customers" value={customers.length} icon={<Users className="w-4 h-4 text-indigo-500" />} bg="bg-indigo-50" color="text-indigo-700" trend={`+${customers.filter(c => c.status === "active").length} active`} />
            <KPI label="Revenue Collected" value={`R${(totalRevenue/1000).toFixed(0)}k`} icon={<DollarSign className="w-4 h-4 text-emerald-500" />} bg="bg-emerald-50" color="text-emerald-700" trend="Paid invoices" />
            <KPI label="Pipeline" value={leads + quoted} icon={<Target className="w-4 h-4 text-yellow-500" />} bg="bg-yellow-50" color="text-yellow-700" trend="Leads + Quoted" />
            <KPI label="Quote Conversion" value={`${quoteConversion}%`} icon={<Zap className="w-4 h-4 text-purple-500" />} bg="bg-purple-50" color="text-purple-700" trend={`${acceptedQuotes.length} accepted`} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-700 text-sm mb-4">Sales Pipeline</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={pipelineData}>
                  <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-700 text-sm">Recent Quotes</h3>
                <Link to={createPageUrl("Quotes")} className="text-xs text-indigo-500 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
              </div>
              {recentQuotes.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-400 mb-3">No quotes yet</p>
                  <Button size="sm" onClick={() => setShowQuoteBuilder(true)} className="gap-1 text-white text-xs" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                    <Plus className="w-3 h-3" /> Create First Quote
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentQuotes.map(q => {
                    const sc = { color: QUOTE_STATUS_COLORS[q.status] || "#94a3b8" };
                    return (
                      <div key={q.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-slate-700 truncate max-w-[160px]">{q.title}</p>
                          <p className="text-xs text-slate-400">{q.customer_name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-slate-700">R{(q.total || 0).toFixed(0)}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded capitalize" style={{ background: sc.color + "15", color: sc.color }}>{q.status}</span>
                          <button onClick={() => setPreviewQuote(q)} className="text-slate-300 hover:text-indigo-500"><Eye className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Revenue trend placeholder */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-700 text-sm mb-4">Outstanding vs Collected</h3>
            <div className="flex gap-6 text-sm">
              <div className="flex-1 rounded-xl p-4" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <p className="text-xs text-slate-500 mb-1">Collected</p>
                <p className="text-2xl font-bold font-mono" style={{ color: "#10b981" }}>R{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="flex-1 rounded-xl p-4" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <p className="text-xs text-slate-500 mb-1">Outstanding</p>
                <p className="text-2xl font-bold font-mono" style={{ color: "#ef4444" }}>R{outstanding.toLocaleString()}</p>
              </div>
              <div className="flex-1 rounded-xl p-4" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <p className="text-xs text-slate-500 mb-1">Quote Pipeline</p>
                <p className="text-2xl font-bold font-mono" style={{ color: "#6366f1" }}>R{quotes.filter(q => ["sent","viewed"].includes(q.status)).reduce((s, q) => s + (q.total || 0), 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Tab */}
      {activeTab === "Pipeline" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-700 text-sm mb-4">Project Pipeline by Stage</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pipelineData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="stage" tick={{ fontSize: 11 }} width={70} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-700 text-sm mb-4">Projects by Status</h3>
              <div className="space-y-2">
                {pipelineData.filter(d => d.count > 0).map(d => (
                  <div key={d.stage} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[d.stage.toLowerCase().replace(" ", "_")] || "#6366f1" }} />
                    <span className="text-sm text-slate-600 flex-1">{d.stage}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${Math.min((d.count / Math.max(...pipelineData.map(x => x.count), 1)) * 100, 100)}%`, background: STATUS_COLORS[d.stage.toLowerCase().replace(" ", "_")] || "#6366f1" }} />
                    </div>
                    <span className="text-sm font-bold text-slate-700 w-6 text-right">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-700 text-sm mb-4">Active Projects</h3>
            <div className="space-y-2">
              {projects.filter(p => !["billed","cancelled"].includes(p.status)).slice(0, 10).map(p => (
                <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{p.project_name}</p>
                    <p className="text-xs text-slate-400">{p.customer_name} · {p.quote_number}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.annuity_amount && <span className="text-xs font-mono text-slate-600">R{p.annuity_amount}/mo</span>}
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize" style={{ background: (STATUS_COLORS[p.status] || "#6366f1") + "15", color: STATUS_COLORS[p.status] || "#6366f1" }}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quotes Tab */}
      {activeTab === "Quotes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-3 gap-3 flex-1 mr-4">
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                <p className="text-xl font-bold font-mono text-emerald-600">{acceptedQuotes.length}</p>
                <p className="text-xs text-slate-500">Accepted</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
                <p className="text-xl font-bold font-mono text-blue-600">{quotes.filter(q => ["sent","viewed"].includes(q.status)).length}</p>
                <p className="text-xs text-slate-500">Pending Response</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
                <p className="text-xl font-bold font-mono text-indigo-600">{quoteConversion}%</p>
                <p className="text-xs text-slate-500">Conversion Rate</p>
              </div>
            </div>
            <Button size="sm" onClick={() => setShowQuoteBuilder(true)} className="gap-1.5 text-white" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <Plus className="w-4 h-4" /> New Quote
            </Button>
          </div>

          {quotesByStatus.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-700 text-sm mb-4">Quotes by Status</h3>
              <div className="grid grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={quotesByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                      {quotesByStatus.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 self-center">
                  {quotesByStatus.map(s => (
                    <div key={s.name} className="flex items-center gap-2 text-sm">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="capitalize text-slate-600 flex-1">{s.name}</span>
                      <span className="font-bold text-slate-800">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Quote</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Total</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500"></th>
                </tr>
              </thead>
              <tbody>
                {quotes.slice(0, 10).map(q => {
                  const color = QUOTE_STATUS_COLORS[q.status] || "#94a3b8";
                  return (
                    <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700 truncate max-w-[160px]">{q.title}</p>
                        <p className="text-xs font-mono text-indigo-400">{q.quote_number}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{q.customer_name}</td>
                      <td className="px-4 py-3"><span className="text-xs font-bold px-2 py-0.5 rounded capitalize" style={{ background: color + "15", color }}>{q.status}</span></td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700">R{(q.total || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setPreviewQuote(q)} className="text-slate-300 hover:text-indigo-500"><Eye className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })}
                {quotes.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-slate-400">No quotes yet. <button className="text-indigo-500 hover:underline" onClick={() => setShowQuoteBuilder(true)}>Create one</button></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === "Customers" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Active", count: customers.filter(c => c.status === "active").length, color: "#10b981" },
              { label: "Pending", count: customers.filter(c => c.status === "pending").length, color: "#f59e0b" },
              { label: "Suspended", count: customers.filter(c => c.status === "suspended").length, color: "#ef4444" },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4 border text-center" style={{ background: s.color + "08", borderColor: s.color + "25" }}>
                <p className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.count}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Monthly Rate</th>
                </tr>
              </thead>
              <tbody>
                {recentCustomers.map(c => {
                  const statusColors = { active: "#10b981", pending: "#f59e0b", suspended: "#ef4444", terminated: "#64748b" };
                  const color = statusColors[c.status] || "#64748b";
                  return (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700">{c.full_name}</p>
                        <p className="text-xs text-slate-400">{c.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 capitalize">{c.service_plan?.replace(/_/g, " ") || "—"}</td>
                      <td className="px-4 py-3"><span className="text-xs font-bold px-2 py-0.5 rounded capitalize" style={{ background: color + "15", color }}>{c.status}</span></td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">{c.monthly_rate ? `R${c.monthly_rate}` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showQuoteBuilder && (
        <QuoteBuilder
          customers={customers}
          onSave={async (data) => { await saveQuoteMut.mutateAsync(data); }}
          onClose={() => setShowQuoteBuilder(false)}
          onPreview={(q) => setPreviewQuote(q)}
        />
      )}

      {previewQuote && (
        <QuotePreview
          quote={previewQuote}
          onClose={() => setPreviewQuote(null)}
        />
      )}
    </div>
  );
}

function KPI({ label, value, icon, bg, color, trend }) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-white/50`}>
      <div className="flex items-center justify-between mb-1">{icon}</div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      {trend && <p className="text-[10px] text-slate-400 mt-1">{trend}</p>}
    </div>
  );
}