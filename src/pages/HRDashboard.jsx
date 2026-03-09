import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TaskPanel from "@/components/hr/TaskPanel";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, UserCheck, UserX, TrendingUp, DollarSign, Calendar, Building2,
  Plus, Pencil, Trash2, X, Mail, Phone, Search, Clock, Award, AlertTriangle,
  ChevronRight, BarChart3, PieChart
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, Legend
} from "recharts";
import { format, differenceInMonths, differenceInYears, parseISO } from "date-fns";

const DEPT_CONFIG = {
  sales:         { color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)",  label: "Sales" },
  projects:      { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)", label: "Projects" },
  finance:       { color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  label: "Finance" },
  cyber_security:{ color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   label: "Cyber Security" },
  technical:     { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  label: "Technical" },
  hr:            { color: "#ec4899", bg: "rgba(236,72,153,0.1)",  border: "rgba(236,72,153,0.25)",  label: "HR" },
};

const STATUS_CONFIG = {
  active:     { color: "#10b981", bg: "rgba(16,185,129,0.1)",  label: "Active" },
  on_leave:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "On Leave" },
  terminated: { color: "#64748b", bg: "rgba(100,116,139,0.1)", label: "Terminated" },
};

function KPICard({ title, value, sub, icon: Icon, color, bg }) {
  return (
    <div className="rounded-2xl p-5 flex items-start gap-4" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function EmployeeModal({ employee, onSubmit, onCancel }) {
  const [form, setForm] = useState(employee || {
    full_name: "", email: "", phone: "", department: "technical",
    role: "", status: "active", hire_date: "", salary: 0,
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ border: "1px solid rgba(0,0,0,0.1)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <h2 className="text-base font-semibold text-slate-800">{employee ? "Edit Employee" : "Add Employee"}</h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "full_name", label: "Full Name *", required: true },
              { key: "email", label: "Email *", type: "email", required: true },
              { key: "phone", label: "Phone" },
              { key: "role", label: "Job Title" },
              { key: "hire_date", label: "Hire Date", type: "date" },
              { key: "salary", label: "Salary (R)", type: "number" },
            ].map(({ key, label, type = "text", required }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs text-slate-600">{label}</Label>
                <Input type={type} value={form[key] || ""} required={required}
                  onChange={e => setForm({ ...form, [key]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value })}
                  className="text-sm" />
              </div>
            ))}
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Department</Label>
              <Select value={form.department} onValueChange={v => setForm({ ...form, department: v })}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(DEPT_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="text-sm">Cancel</Button>
            <Button type="submit" className="text-sm text-white" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              {employee ? "Save Changes" : "Add Employee"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HRDashboard() {
  const { can, loading: rbacLoading } = useRBAC();
  const [tab, setTab] = useState("overview");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  if (!rbacLoading && !can("employees")) return <AccessDenied />;

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list("-hire_date"),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Employee.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employees"] }); setShowForm(false); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Employee.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employees"] }); setShowForm(false); setEditing(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Employee.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
  });

  const handleSubmit = (data) => {
    if (editing) updateMut.mutate({ id: editing.id, data });
    else createMut.mutate(data);
  };

  // ── Computed stats ──
  const active = employees.filter(e => e.status === "active");
  const onLeave = employees.filter(e => e.status === "on_leave");
  const terminated = employees.filter(e => e.status === "terminated");
  const totalSalary = active.reduce((s, e) => s + (e.salary || 0), 0);
  const avgSalary = active.length ? totalSalary / active.length : 0;

  // Dept breakdown for pie
  const deptData = Object.entries(DEPT_CONFIG).map(([key, cfg]) => ({
    name: cfg.label,
    value: active.filter(e => e.department === key).length,
    color: cfg.color,
  })).filter(d => d.value > 0);

  // Salary by dept for bar
  const salaryByDept = Object.entries(DEPT_CONFIG).map(([key, cfg]) => {
    const deptEmps = active.filter(e => e.department === key && e.salary > 0);
    return {
      dept: cfg.label.replace(" ", "\n"),
      avg: deptEmps.length ? Math.round(deptEmps.reduce((s, e) => s + e.salary, 0) / deptEmps.length) : 0,
      color: cfg.color,
    };
  }).filter(d => d.avg > 0);

  // Recent hires (last 90 days)
  const recentHires = employees
    .filter(e => e.hire_date && differenceInMonths(new Date(), parseISO(e.hire_date)) <= 3)
    .sort((a, b) => new Date(b.hire_date) - new Date(a.hire_date))
    .slice(0, 5);

  // Tenure distribution
  const tenureGroups = { "< 1 yr": 0, "1–3 yrs": 0, "3–5 yrs": 0, "5+ yrs": 0 };
  active.forEach(e => {
    if (!e.hire_date) return;
    const yrs = differenceInYears(new Date(), parseISO(e.hire_date));
    if (yrs < 1) tenureGroups["< 1 yr"]++;
    else if (yrs < 3) tenureGroups["1–3 yrs"]++;
    else if (yrs < 5) tenureGroups["3–5 yrs"]++;
    else tenureGroups["5+ yrs"]++;
  });
  const tenureData = Object.entries(tenureGroups).map(([k, v]) => ({ name: k, value: v }));

  // Filtered employees for directory tab
  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.full_name?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q) || e.role?.toLowerCase().includes(q);
    const matchDept = deptFilter === "all" || e.department === deptFilter;
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "directory", label: "Directory" },
    { id: "analytics", label: "Analytics" },
    { id: "tasks", label: "Tasks" },
  ];

  const TENURE_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">HR Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">{active.length} active employees across {Object.keys(DEPT_CONFIG).length} departments</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="text-white text-sm" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
          <Plus className="w-4 h-4 mr-2" /> Add Employee
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Employees" value={employees.length} sub={`${active.length} active`} icon={Users} color="#6366f1" bg="rgba(99,102,241,0.1)" />
        <KPICard title="On Leave" value={onLeave.length} sub={`${((onLeave.length / (employees.length || 1)) * 100).toFixed(0)}% of staff`} icon={Clock} color="#f59e0b" bg="rgba(245,158,11,0.1)" />
        <KPICard title="Total Payroll" value={`R${(totalSalary / 1000).toFixed(0)}k`} sub="active employees" icon={DollarSign} color="#10b981" bg="rgba(16,185,129,0.1)" />
        <KPICard title="Avg. Salary" value={`R${avgSalary.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`} sub="per active employee" icon={TrendingUp} color="#8b5cf6" bg="rgba(139,92,246,0.1)" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "rgba(99,102,241,0.07)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dept headcount */}
          <div className="lg:col-span-1 rounded-2xl p-5" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-indigo-500" /> Headcount by Dept</h3>
            <div className="space-y-3">
              {Object.entries(DEPT_CONFIG).map(([key, cfg]) => {
                const count = active.filter(e => e.department === key).length;
                const pct = active.length ? (count / active.length) * 100 : 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">{cfg.label}</span>
                      <span className="font-semibold text-slate-700">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cfg.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent hires */}
          <div className="lg:col-span-1 rounded-2xl p-5" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-emerald-500" /> Recent Hires</h3>
            {recentHires.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No recent hires in last 90 days</p>
            ) : (
              <div className="space-y-3">
                {recentHires.map(e => {
                  const dc = DEPT_CONFIG[e.department] || DEPT_CONFIG.technical;
                  return (
                    <div key={e.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${dc.color}, ${dc.color}99)` }}>
                        {e.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{e.full_name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{e.role || dc.label}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">{e.hire_date ? format(parseISO(e.hire_date), "dd MMM") : "—"}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status summary */}
          <div className="lg:col-span-1 rounded-2xl p-5" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2"><UserCheck className="w-4 h-4 text-blue-500" /> Staff Status</h3>
            <div className="space-y-3">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const count = employees.filter(e => e.status === key).length;
                return (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl" style={{ background: cfg.bg }}>
                    <span className="text-sm font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                    <span className="text-xl font-bold" style={{ color: cfg.color }}>{count}</span>
                  </div>
                );
              })}
            </div>
            {terminated.length > 0 && (
              <div className="mt-3 flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(239,68,68,0.06)" }}>
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <p className="text-[11px] text-red-500">{terminated.length} terminated employee{terminated.length > 1 ? "s" : ""} on record</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DIRECTORY TAB ── */}
      {tab === "directory" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search by name, email, title…" className="pl-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-40 text-sm"><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {Object.entries(DEPT_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-slate-400">{filtered.length} employee{filtered.length !== 1 ? "s" : ""} found</p>

          <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                  {["Employee", "Department", "Job Title", "Status", "Hire Date", can("view_salaries") ? "Salary" : null, ""].filter(Boolean).map(h => (
                    <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-sm text-slate-400 py-12">No employees found</td></tr>
                ) : filtered.map((emp, i) => {
                  const dc = DEPT_CONFIG[emp.department] || DEPT_CONFIG.technical;
                  const sc = STATUS_CONFIG[emp.status] || STATUS_CONFIG.active;
                  const tenure = emp.hire_date ? differenceInYears(new Date(), parseISO(emp.hire_date)) : null;
                  return (
                    <tr key={emp.id} className="group hover:bg-slate-50 transition-colors" style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${dc.color}, ${dc.color}99)` }}>
                            {emp.full_name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{emp.full_name}</p>
                            <p className="text-[11px] text-slate-400">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: dc.bg, color: dc.color }}>{dc.label}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{emp.role || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                        {emp.hire_date ? format(parseISO(emp.hire_date), "dd MMM yyyy") : "—"}
                        {tenure !== null && <span className="ml-1 text-slate-400">({tenure}y)</span>}
                      </td>
                      {can("view_salaries") && (
                        <td className="px-4 py-3 text-xs font-mono text-slate-600">
                          {emp.salary ? `R${emp.salary.toLocaleString()}` : "—"}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(emp); setShowForm(true); }}>
                            <Pencil className="w-3.5 h-3.5 text-slate-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { if (confirm("Delete this employee?")) deleteMut.mutate(emp.id); }}>
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {tab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dept distribution pie */}
          <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-indigo-500" /> Department Distribution</h3>
            {deptData.length === 0 ? <p className="text-xs text-slate-400 text-center py-8">No data</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <RePieChart>
                  <Pie data={deptData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {deptData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} employees`]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                </RePieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Avg salary by dept */}
          {can("view_salaries") && (
            <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-emerald-500" /> Avg Salary by Department</h3>
              {salaryByDept.length === 0 ? <p className="text-xs text-slate-400 text-center py-8">No salary data</p> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={salaryByDept} barSize={28}>
                    <XAxis dataKey="dept" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={v => `R${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => [`R${v.toLocaleString()}`]} />
                    <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                      {salaryByDept.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* Tenure distribution */}
          <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> Tenure Distribution</h3>
            <div className="space-y-3 mt-2">
              {tenureData.map((t, i) => (
                <div key={t.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{t.name}</span>
                    <span className="font-semibold text-slate-700">{t.value} emp{t.value !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: active.length ? `${(t.value / active.length) * 100}%` : "0%", background: TENURE_COLORS[i] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* On Leave detail */}
          <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> Currently On Leave</h3>
            {onLeave.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No employees currently on leave</p>
            ) : (
              <div className="space-y-2">
                {onLeave.map(e => {
                  const dc = DEPT_CONFIG[e.department] || DEPT_CONFIG.technical;
                  return (
                    <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)" }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${dc.color}, ${dc.color}99)` }}>
                        {e.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{e.full_name}</p>
                        <p className="text-[11px] text-slate-400">{dc.label} · {e.role || "—"}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">On Leave</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <EmployeeModal
          employee={editing}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}