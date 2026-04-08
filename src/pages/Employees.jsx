import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, UserCog, X, Mail, Phone } from "lucide-react";
import { toTitleCase } from "@/utils/nameUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";

const deptColors = {
  sales: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "rgba(59,130,246,0.3)", avatar: "from-blue-600 to-blue-400" },
  projects: { bg: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "rgba(139,92,246,0.3)", avatar: "from-violet-600 to-violet-400" },
  finance: { bg: "rgba(16,185,129,0.1)", color: "#10b981", border: "rgba(16,185,129,0.3)", avatar: "from-emerald-600 to-emerald-400" },
  cyber_security: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", border: "rgba(239,68,68,0.3)", avatar: "from-red-600 to-red-400" },
  technical: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "rgba(245,158,11,0.3)", avatar: "from-amber-600 to-amber-400" },
  hr: { bg: "rgba(236,72,153,0.1)", color: "#ec4899", border: "rgba(236,72,153,0.3)", avatar: "from-pink-600 to-pink-400" },
};

function EmployeeForm({ employee, onSubmit, onCancel }) {
  const [form, setForm] = useState(employee || {
    full_name: "", email: "", phone: "", department: "technical",
    role: "", status: "active", hire_date: "", salary: 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: "#0d1527", border: "1px solid rgba(6,182,212,0.2)" }}>
        <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(6,182,212,0.1)" }}>
          <h2 className="text-[15px] font-semibold text-white">{employee ? "Edit Employee" : "Add Employee"}</h2>
          <button onClick={onCancel} className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Full Name *</Label>
              <Input value={form.full_name} onChange={e => setForm({...form, full_name: toTitleCase(e.target.value)})} required className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Email *</Label>
              <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Phone</Label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Department *</Label>
              <Select value={form.department} onValueChange={v => setForm({...form, department: v})}>
                <SelectTrigger className="bg-transparent border-slate-700 text-slate-300"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0d1527] border-slate-700 text-slate-200">
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="projects">Projects</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="cyber_security">Cyber Security</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Job Title</Label>
              <Input value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger className="bg-transparent border-slate-700 text-slate-300"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0d1527] border-slate-700 text-slate-200">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Hire Date</Label>
              <Input type="date" value={form.hire_date} onChange={e => setForm({...form, hire_date: e.target.value})} className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Salary</Label>
              <Input type="number" value={form.salary} onChange={e => setForm({...form, salary: parseFloat(e.target.value)})} className="bg-transparent border-slate-700 text-slate-200" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="border-slate-700 text-slate-300 hover:bg-slate-800">Cancel</Button>
            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white">{employee ? "Update" : "Add Employee"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Employees() {
  const { can, loading: rbacLoading, department, isAdmin } = useRBAC();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list("-created_date"),
    enabled: !rbacLoading && can("employees"),
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

  // Non-admins only see their own department
  const visibleEmployees = isAdmin ? employees : employees.filter(e => e.department === department);

  const filtered = visibleEmployees.filter(e => {
    const matchSearch = !search || e.full_name?.toLowerCase().includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  // Group by department for summary
  const deptCounts = {};
  visibleEmployees.forEach(e => { deptCounts[e.department] = (deptCounts[e.department] || 0) + 1; });

  const statusStyle = {
    active: { bg: "rgba(16,185,129,0.1)", color: "#10b981" },
    on_leave: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
    terminated: { bg: "rgba(100,116,139,0.1)", color: "#64748b" },
  };

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "#f0ebff", fontFamily: "'Space Grotesk',sans-serif" }}>Employee Directory</h1>
          <p className="text-[11px] mt-0.5 mono" style={{ color: "rgba(168,85,247,0.5)" }}>
            {visibleEmployees.length} staff · {Object.keys(deptCounts).length} departments
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 20px rgba(168,85,247,0.35)" }}>
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        )}
      </div>

      {/* Department summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {["sales", "projects", "finance", "cyber_security", "technical", "hr"].map(dept => {
          const dc = deptColors[dept];
          const isActive = deptFilter === dept;
          return (
            <div key={dept} className="relative overflow-hidden rounded-2xl p-3 text-center cursor-pointer transition-all hover:scale-[1.02]"
             style={{ background: isActive ? `${dc.color}12` : "rgba(14,11,26,0.92)", border: `1px solid ${isActive ? dc.border : dc.color + "18"}` }}
             onClick={() => setDeptFilter(deptFilter === dept ? "all" : dept)}>
              {isActive && <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${dc.color}, transparent)` }} />}
              <p className="text-[22px] font-black mono" style={{ color: dc.color }}>{deptCounts[dept] || 0}</p>
              <p className="text-[9px] uppercase tracking-wider font-bold capitalize mt-0.5" style={{ color: isActive ? dc.color : "rgba(216,180,254,0.45)" }}>{dept.replace(/_/g, " ")}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl p-4 flex gap-3" style={{ background: "rgba(14,11,26,0.92)", border: "1px solid rgba(168,85,247,0.18)" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(168,85,247,0.5)" }} />
          <input placeholder="Search employees..." className="w-full pl-10 pr-4 py-2.5 text-[13px] outline-none rounded-xl" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)", color: "#e9d5ff" }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Employee cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={{ background: "rgba(14,11,26,0.92)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <UserCog className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(168,85,247,0.3)" }} />
          <p className="text-[13px]" style={{ color: "rgba(216,180,254,0.4)" }}>No employees found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(emp => {
            const dc = deptColors[emp.department] || deptColors.technical;
            const ss = statusStyle[emp.status] || statusStyle.active;
            return (
            <div key={emp.id} className="relative overflow-hidden rounded-2xl p-5 transition-all duration-200 group"
              style={{ background: "rgba(14,11,26,0.92)", border: `1px solid ${dc.color}22` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = dc.border; e.currentTarget.style.boxShadow = `0 4px 24px ${dc.color}18`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${dc.color}22`; e.currentTarget.style.boxShadow = "none"; }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${dc.color}, transparent)` }} />
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${dc.color}12, transparent 70%)` }} />

              <div className="flex items-start justify-between mb-3 relative">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${dc.avatar} flex items-center justify-center text-white font-black text-base flex-shrink-0`}
                    style={{ boxShadow: `0 4px 14px ${dc.color}35` }}>
                    {emp.full_name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <h3 className="font-bold text-[13px]" style={{ color: "#e9d5ff" }}>{emp.full_name}</h3>
                    <p className="text-[11px]" style={{ color: "rgba(216,180,254,0.5)" }}>{emp.role || "No title"}</p>
                  </div>
                </div>
                <span className="text-[9px] font-black px-2 py-1 rounded-lg mono uppercase tracking-wider" style={{ background: dc.bg, color: dc.color, border: `1px solid ${dc.border}` }}>
                  {emp.department?.replace(/_/g, " ")}
                </span>
              </div>

              <div className="space-y-1.5 text-[12px] relative">
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(168,85,247,0.4)" }} />
                  <span className="truncate" style={{ color: "rgba(216,180,254,0.6)" }}>{emp.email}</span>
                </div>
                {emp.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(168,85,247,0.4)" }} />
                    <span style={{ color: "rgba(216,180,254,0.6)" }}>{emp.phone}</span>
                  </div>
                )}
                {emp.salary > 0 && can("view_salaries") && (
                  <div className="text-[11px] mono font-bold" style={{ color: "#10b981" }}>
                    R{emp.salary?.toLocaleString()} / yr
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 relative" style={{ borderTop: "1px solid rgba(168,85,247,0.08)" }}>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg mono uppercase" style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.color}30` }}>
                  {emp.status?.replace(/_/g, " ")}
                </span>
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditing(emp); setShowForm(true); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)" }}>
                      <Pencil className="w-3.5 h-3.5" style={{ color: "#a855f7" }} />
                    </button>
                    <button onClick={() => { if (confirm("Delete this employee?")) deleteMut.mutate(emp.id); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                      <Trash2 className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )})}
        </div>
      )}

      {showForm && (
        <EmployeeForm
          employee={editing}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}