import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TaskPanel from "@/components/hr/TaskPanel";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, UserCheck, Clock, TrendingUp, DollarSign, Calendar, Building2,
  Plus, Pencil, Trash2, X, Mail, Search, Award, AlertTriangle,
  BarChart3, PieChart
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, Legend
} from "recharts";
import { format, differenceInMonths, differenceInYears, parseISO } from "date-fns";

const DEPT_CONFIG = {
  sales:          { color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)",  label: "Sales" },
  projects:       { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)", label: "Projects" },
  finance:        { color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  label: "Finance" },
  cyber_security: { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   label: "Cyber Security" },
  technical:      { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  label: "Technical" },
  hr:             { color: "#ec4899", bg: "rgba(236,72,153,0.1)",  border: "rgba(236,72,153,0.25)",  label: "HR" },
};

const STATUS_CONFIG = {
  active:     { color: "#10b981", bg: "rgba(16,185,129,0.1)",  label: "Active" },
  on_leave:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "On Leave" },
  terminated: { color: "#64748b", bg: "rgba(100,116,139,0.1)", label: "Terminated" },
};

const PANEL_STYLE = {
  background: "rgba(12,8,28,0.95)",
  border: "1px solid rgba(139,92,246,0.2)",
  boxShadow: "0 4px 24px rgba(139,92,246,0.1)",
};

function KPICard({ title, value, sub, icon: Icon, color }) {
  return (
    <div className="relative overflow-hidden rounded-2xl px-5 py-4"
      style={{ background: "rgba(12,8,28,0.95)", border: `1px solid ${color}28`, boxShadow: `0 2px 16px ${color}12` }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "rgba(196,181,253,0.55)" }}>{title}</p>
          <p className="text-[28px] font-black mono leading-tight" style={{ color }}>{value}</p>
          {sub && <p className="text-[11px] mt-0.5" style={{ color: "rgba(196,181,253,0.45)" }}>{sub}</p>}
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ background: "linear-gradient(175deg,#0d0a20 0%,#090618 100%)", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 32px 80px rgba(139,92,246,0.25)" }}>
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4,transparent)" }} />
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(139,92,246,0.12)" }}>
          <h2 className="text-[15px] font-black" style={{ color: "#e8d5ff" }}>{employee ? "Edit Employee" : "Add Employee"}</h2>
          <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10"
            style={{ border: "1px solid rgba(139,92,246,0.2)" }}>
            <X className="w-4 h-4" style={{ color: "rgba(196,181,253,0.6)" }} />
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "full_name", label: "Full Name *", required: true },
              { key: "email",     label: "Email *",     type: "email", required: true },
              { key: "phone",     label: "Phone" },
              { key: "role",      label: "Job Title" },
              { key: "hire_date", label: "Hire Date",   type: "date" },
              { key: "salary",    label: "Salary (R)",  type: "number" },
            ].map(({ key, label, type = "text", required }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-[11px] font-bold" style={{ color: "rgba(196,181,253,0.6)" }}>{label}</Label>
                <input
                  type={type} value={form[key] || ""} required={required}
                  onChange={e => setForm({ ...form, [key]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                  style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", color: "#e8d5ff" }}
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold" style={{ color: "rgba(196,181,253,0.6)" }}>Department</Label>
              <Select value={form.department} onValueChange={v => setForm({ ...form, department: v })}>
                <SelectTrigger style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", color: "#e8d5ff" }}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(DEPT_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold" style={{ color: "rgba(196,181,253,0.6)" }}>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", color: "#e8d5ff" }}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel}
              className="px-4 py-2 rounded-xl text-[12px] font-bold transition-all"
              style={{ border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}>Cancel</button>
            <button type="submit"
              className="px-5 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
              {employee ? "Save Changes" : "Add Employee"}
            </button>
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
  const [showForm,    setShowForm]    = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [search,      setSearch]      = useState("");
  const [deptFilter,  setDeptFilter]  = useState("all");
  const [statusFilter,setStatusFilter]= useState("all");
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

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

  if (!rbacLoading && !can("employees")) return <AccessDenied />;

  const handleSubmit = (data) => {
    if (editing) updateMut.mutate({ id: editing.id, data });
    else createMut.mutate(data);
  };

  const active     = employees.filter(e => e.status === "active");
  const onLeave    = employees.filter(e => e.status === "on_leave");
  const terminated = employees.filter(e => e.status === "terminated");
  const totalSalary= active.reduce((s, e) => s + (e.salary || 0), 0);
  const avgSalary  = active.length ? totalSalary / active.length : 0;

  const deptData = Object.entries(DEPT_CONFIG).map(([key, cfg]) => ({
    name: cfg.label,
    value: active.filter(e => e.department === key).length,
    color: cfg.color,
  })).filter(d => d.value > 0);

  const salaryByDept = Object.entries(DEPT_CONFIG).map(([key, cfg]) => {
    const deptEmps = active.filter(e => e.department === key && e.salary > 0);
    return {
      dept: cfg.label.replace(" ", "\n"),
      avg: deptEmps.length ? Math.round(deptEmps.reduce((s, e) => s + e.salary, 0) / deptEmps.length) : 0,
      color: cfg.color,
    };
  }).filter(d => d.avg > 0);

  const recentHires = employees
    .filter(e => e.hire_date && differenceInMonths(new Date(), parseISO(e.hire_date)) <= 3)
    .sort((a, b) => new Date(b.hire_date) - new Date(a.hire_date))
    .slice(0, 5);

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
  const TENURE_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"];

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.full_name?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q) || e.role?.toLowerCase().includes(q);
    const matchDept   = deptFilter   === "all" || e.department === deptFilter;
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const tabs = [
    { id: "overview",   label: "Overview"   },
    { id: "directory",  label: "Directory"  },
    { id: "analytics",  label: "Analytics"  },
    { id: "tasks",      label: "Tasks"      },
  ];

  return (
    <div className="p-5 lg:p-8 space-y-6 max-w-[1600px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "#f0e8ff", fontFamily: "'Space Grotesk', sans-serif" }}>HR Dashboard</h1>
          <p className="text-[11px] mt-0.5 mono" style={{ color: "rgba(196,181,253,0.5)" }}>
            {active.length} active employees across {Object.keys(DEPT_CONFIG).length} departments
          </p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}>
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Employees" value={employees.length} sub={`${active.length} active`}            icon={Users}      color="#6366f1" />
        <KPICard title="On Leave"        value={onLeave.length}   sub={`${((onLeave.length/(employees.length||1))*100).toFixed(0)}% of staff`} icon={Clock} color="#f59e0b" />
        <KPICard title="Total Payroll"   value={`R${(totalSalary/1000).toFixed(0)}k`} sub="active employees" icon={DollarSign} color="#10b981" />
        <KPICard title="Avg. Salary"     value={`R${avgSalary.toLocaleString("en-ZA",{maximumFractionDigits:0})}`} sub="per active employee" icon={TrendingUp} color="#8b5cf6" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all"
            style={tab === t.id
              ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff" }
              : { color: "rgba(196,181,253,0.55)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dept headcount */}
          <div className="rounded-2xl p-5" style={PANEL_STYLE}>
            <div className="h-[2px] -mt-5 -mx-5 mb-4 rounded-t-2xl" style={{ background: "linear-gradient(90deg,#6366f1,transparent)" }} />
            <h3 className="text-[13px] font-black mb-4 flex items-center gap-2" style={{ color: "#c4b5fd" }}>
              <Building2 className="w-4 h-4" style={{ color: "#6366f1" }} /> Headcount by Dept
            </h3>
            <div className="space-y-3">
              {Object.entries(DEPT_CONFIG).map(([key, cfg]) => {
                const count = active.filter(e => e.department === key).length;
                const pct   = active.length ? (count / active.length) * 100 : 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span style={{ color: "rgba(196,181,253,0.65)" }}>{cfg.label}</span>
                      <span className="font-bold mono" style={{ color: cfg.color }}>{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(139,92,246,0.1)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cfg.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent hires */}
          <div className="rounded-2xl p-5" style={PANEL_STYLE}>
            <div className="h-[2px] -mt-5 -mx-5 mb-4 rounded-t-2xl" style={{ background: "linear-gradient(90deg,#10b981,transparent)" }} />
            <h3 className="text-[13px] font-black mb-4 flex items-center gap-2" style={{ color: "#c4b5fd" }}>
              <Award className="w-4 h-4" style={{ color: "#10b981" }} /> Recent Hires
            </h3>
            {recentHires.length === 0 ? (
              <p className="text-[11px] text-center py-8" style={{ color: "rgba(196,181,253,0.4)" }}>No recent hires in last 90 days</p>
            ) : (
              <div className="space-y-3">
                {recentHires.map(e => {
                  const dc = DEPT_CONFIG[e.department] || DEPT_CONFIG.technical;
                  return (
                    <div key={e.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${dc.color}, ${dc.color}99)` }}>
                        {e.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold truncate" style={{ color: "#e8d5ff" }}>{e.full_name}</p>
                        <p className="text-[10px] truncate" style={{ color: "rgba(196,181,253,0.5)" }}>{e.role || dc.label}</p>
                      </div>
                      <span className="text-[10px] mono flex-shrink-0" style={{ color: "rgba(196,181,253,0.45)" }}>
                        {e.hire_date ? format(parseISO(e.hire_date), "dd MMM") : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status summary */}
          <div className="rounded-2xl p-5" style={PANEL_STYLE}>
            <div className="h-[2px] -mt-5 -mx-5 mb-4 rounded-t-2xl" style={{ background: "linear-gradient(90deg,#3b82f6,transparent)" }} />
            <h3 className="text-[13px] font-black mb-4 flex items-center gap-2" style={{ color: "#c4b5fd" }}>
              <UserCheck className="w-4 h-4" style={{ color: "#3b82f6" }} /> Staff Status
            </h3>
            <div className="space-y-3">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const count = employees.filter(e => e.status === key).length;
                return (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.color}25` }}>
                    <span className="text-[12px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                    <span className="text-[20px] font-black mono" style={{ color: cfg.color }}>{count}</span>
                  </div>
                );
              })}
            </div>
            {terminated.length > 0 && (
              <div className="mt-3 flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#f87171" }} />
                <p className="text-[11px]" style={{ color: "#f87171" }}>{terminated.length} terminated employee{terminated.length > 1 ? "s" : ""} on record</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DIRECTORY TAB ── */}
      {tab === "directory" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(196,181,253,0.4)" }} />
              <input placeholder="Search by name, email, title…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] outline-none"
                style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.25)", color: "#e8d5ff" }}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-40" style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.25)", color: "#c4b5fd" }}>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {Object.entries(DEPT_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36" style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.25)", color: "#c4b5fd" }}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <p className="text-[11px] mono" style={{ color: "rgba(196,181,253,0.45)" }}>{filtered.length} employee{filtered.length !== 1 ? "s" : ""} found</p>

          <div className="rounded-2xl overflow-hidden" style={PANEL_STYLE}>
            <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4,transparent)" }} />
            <table className="w-full">
              <thead>
                <tr style={{ background: "rgba(139,92,246,0.08)", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
                  {["Employee","Department","Job Title","Status","Hire Date", can("view_salaries") ? "Salary" : null,""].filter(Boolean).map(h => (
                    <th key={h} className="text-left text-[9px] font-black uppercase tracking-[0.18em] px-4 py-3" style={{ color: "#9d8ec7" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-[12px]" style={{ color: "rgba(196,181,253,0.4)" }}>No employees found</td></tr>
                ) : filtered.map((emp, i) => {
                  const dc = DEPT_CONFIG[emp.department] || DEPT_CONFIG.technical;
                  const sc = STATUS_CONFIG[emp.status]   || STATUS_CONFIG.active;
                  const tenure = emp.hire_date ? differenceInYears(new Date(), parseISO(emp.hire_date)) : null;
                  return (
                    <tr key={emp.id} className="group transition-colors" style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(139,92,246,0.07)" : "none" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${dc.color}, ${dc.color}99)` }}>
                            {emp.full_name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold" style={{ color: "#e8d5ff" }}>{emp.full_name}</p>
                            <p className="text-[10px] mono" style={{ color: "rgba(196,181,253,0.5)" }}>{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: dc.bg, color: dc.color }}>{dc.label}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px]" style={{ color: "rgba(196,181,253,0.65)" }}>{emp.role || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                      </td>
                      <td className="px-4 py-3 text-[11px] mono" style={{ color: "rgba(196,181,253,0.5)" }}>
                        {emp.hire_date ? format(parseISO(emp.hire_date), "dd MMM yyyy") : "—"}
                        {tenure !== null && <span className="ml-1 opacity-60">({tenure}y)</span>}
                      </td>
                      {can("view_salaries") && (
                        <td className="px-4 py-3 text-[12px] mono font-bold" style={{ color: "#10b981" }}>
                          {emp.salary ? `R${emp.salary.toLocaleString()}` : "—"}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}
                            onClick={() => { setEditing(emp); setShowForm(true); }}>
                            <Pencil className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
                          </button>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                            onClick={() => { if (confirm("Delete this employee?")) deleteMut.mutate(emp.id); }}>
                            <Trash2 className="w-3.5 h-3.5" style={{ color: "#f87171" }} />
                          </button>
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
          <div className="rounded-2xl p-5" style={PANEL_STYLE}>
            <div className="h-[2px] -mt-5 -mx-5 mb-4 rounded-t-2xl" style={{ background: "linear-gradient(90deg,#6366f1,transparent)" }} />
            <h3 className="text-[13px] font-black mb-4 flex items-center gap-2" style={{ color: "#c4b5fd" }}>
              <PieChart className="w-4 h-4" style={{ color: "#6366f1" }} /> Department Distribution
            </h3>
            {deptData.length === 0 ? <p className="text-[11px] text-center py-8" style={{ color: "rgba(196,181,253,0.4)" }}>No data</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <RePieChart>
                  <Pie data={deptData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {deptData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={v => [`${v} employees`]} contentStyle={{ background: "rgba(12,8,28,0.97)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 8, color: "#e8d5ff" }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", color: "#c4b5fd" }} />
                </RePieChart>
              </ResponsiveContainer>
            )}
          </div>

          {can("view_salaries") && (
            <div className="rounded-2xl p-5" style={PANEL_STYLE}>
              <div className="h-[2px] -mt-5 -mx-5 mb-4 rounded-t-2xl" style={{ background: "linear-gradient(90deg,#10b981,transparent)" }} />
              <h3 className="text-[13px] font-black mb-4 flex items-center gap-2" style={{ color: "#c4b5fd" }}>
                <BarChart3 className="w-4 h-4" style={{ color: "#10b981" }} /> Avg Salary by Department
              </h3>
              {salaryByDept.length === 0 ? <p className="text-[11px] text-center py-8" style={{ color: "rgba(196,181,253,0.4)" }}>No salary data</p> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={salaryByDept} barSize={28}>
                    <XAxis dataKey="dept" tick={{ fontSize: 10, fill: "#a78bfa" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#a78bfa" }} tickFormatter={v => `R${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => [`R${v.toLocaleString()}`]} contentStyle={{ background: "rgba(12,8,28,0.97)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 8, color: "#e8d5ff" }} />
                    <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                      {salaryByDept.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          <div className="rounded-2xl p-5" style={PANEL_STYLE}>
            <div className="h-[2px] -mt-5 -mx-5 mb-4 rounded-t-2xl" style={{ background: "linear-gradient(90deg,#3b82f6,transparent)" }} />
            <h3 className="text-[13px] font-black mb-4 flex items-center gap-2" style={{ color: "#c4b5fd" }}>
              <Calendar className="w-4 h-4" style={{ color: "#3b82f6" }} /> Tenure Distribution
            </h3>
            <div className="space-y-3 mt-2">
              {tenureData.map((t, i) => (
                <div key={t.name}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span style={{ color: "rgba(196,181,253,0.65)" }}>{t.name}</span>
                    <span className="font-bold mono" style={{ color: TENURE_COLORS[i] }}>{t.value} emp{t.value !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(139,92,246,0.1)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: active.length ? `${(t.value / active.length) * 100}%` : "0%", background: TENURE_COLORS[i] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5" style={PANEL_STYLE}>
            <div className="h-[2px] -mt-5 -mx-5 mb-4 rounded-t-2xl" style={{ background: "linear-gradient(90deg,#f59e0b,transparent)" }} />
            <h3 className="text-[13px] font-black mb-4 flex items-center gap-2" style={{ color: "#c4b5fd" }}>
              <Clock className="w-4 h-4" style={{ color: "#f59e0b" }} /> Currently On Leave
            </h3>
            {onLeave.length === 0 ? (
              <p className="text-[11px] text-center py-8" style={{ color: "rgba(196,181,253,0.4)" }}>No employees currently on leave</p>
            ) : (
              <div className="space-y-2">
                {onLeave.map(e => {
                  const dc = DEPT_CONFIG[e.department] || DEPT_CONFIG.technical;
                  return (
                    <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)" }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${dc.color}, ${dc.color}99)` }}>
                        {e.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold truncate" style={{ color: "#e8d5ff" }}>{e.full_name}</p>
                        <p className="text-[10px]" style={{ color: "rgba(196,181,253,0.5)" }}>{dc.label} · {e.role || "—"}</p>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-lg"
                        style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}>On Leave</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TASKS TAB ── */}
      {tab === "tasks" && (
        <TaskPanel employees={employees} currentUser={currentUser} />
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