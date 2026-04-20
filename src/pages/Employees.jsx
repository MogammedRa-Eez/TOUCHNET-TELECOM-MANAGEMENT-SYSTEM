import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, UserCog, X, Mail, Phone } from "lucide-react";
import { toTitleCase } from "@/utils/nameUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";

const deptColors = {
  sales:          { color: "#22d3ee", border: "rgba(34,211,238,0.3)",   grad: "linear-gradient(135deg,#22d3ee,#0891b2)" },
  projects:       { color: "#00b4b4", border: "rgba(0,180,180,0.3)",    grad: "linear-gradient(135deg,#00b4b4,#007a7a)" },
  finance:        { color: "#10b981", border: "rgba(16,185,129,0.3)",   grad: "linear-gradient(135deg,#10b981,#059669)" },
  cyber_security: { color: "#e02347", border: "rgba(224,35,71,0.3)",    grad: "linear-gradient(135deg,#e02347,#ff3358)" },
  technical:      { color: "#f59e0b", border: "rgba(245,158,11,0.3)",   grad: "linear-gradient(135deg,#f59e0b,#d97706)" },
  hr:             { color: "#a855f7", border: "rgba(168,85,247,0.3)",   grad: "linear-gradient(135deg,#a855f7,#7c3aed)" },
};

const statusStyle = {
  active:     { bg: "rgba(16,185,129,0.12)", color: "#10b981", border: "rgba(16,185,129,0.3)" },
  on_leave:   { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "rgba(245,158,11,0.3)" },
  terminated: { bg: "rgba(100,116,139,0.1)", color: "#64748b", border: "rgba(100,116,139,0.2)" },
};

function EmployeeForm({ employee, onSubmit, onCancel }) {
  const [form, setForm] = useState(employee || {
    full_name: "", email: "", phone: "", department: "technical",
    role: "", status: "active", hire_date: "", salary: 0,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }}>
      <div className="rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ background: "#1a1a1a", border: "1px solid rgba(0,180,180,0.25)", boxShadow: "0 24px 80px rgba(0,0,0,0.7)" }}>
        <div className="h-[2px] rounded-t-2xl" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,#e02347,transparent)" }} />
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 className="text-[15px] font-black" style={{ color: "#00b4b4" }}>{employee ? "Edit Employee" : "Add Employee"}</h2>
          <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "full_name", label: "Full Name *", required: true },
              { key: "email",     label: "Email *",     type: "email", required: true },
              { key: "phone",     label: "Phone" },
              { key: "role",      label: "Job Title" },
              { key: "hire_date", label: "Hire Date",   type: "date" },
              { key: "salary",    label: "Salary (R)",  type: "number" },
            ].map(({ key, label, type = "text", required }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</label>
                <input
                  type={type} value={form[key] || ""} required={required}
                  onChange={e => setForm({ ...form, [key]: type === "number" ? parseFloat(e.target.value) || 0 : (key === "full_name" ? toTitleCase(e.target.value) : e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl text-[13px] outline-none transition-all"
                  style={{ background: "#252525", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0" }}
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>Department</label>
              <Select value={form.department} onValueChange={v => setForm({...form, department: v})}>
                <SelectTrigger style={{ background: "#252525", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0" }}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(deptColors).map(k => <SelectItem key={k} value={k}>{k.replace(/_/g," ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>Status</label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger style={{ background: "#252525", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0" }}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#b0b0b0", background: "rgba(255,255,255,0.05)" }}>Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 16px rgba(0,180,180,0.3)" }}>
              {employee ? "Update" : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Employees() {
  const { can, loading: rbacLoading, department, isAdmin } = useRBAC();
  const [showForm,   setShowForm]   = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [search,     setSearch]     = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list("-created_date"),
    enabled: !rbacLoading && can("employees"),
  });

  const createMut = useMutation({ mutationFn: (data) => base44.entities.Employee.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employees"] }); setShowForm(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => base44.entities.Employee.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employees"] }); setShowForm(false); setEditing(null); } });
  const deleteMut = useMutation({ mutationFn: (id) => base44.entities.Employee.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }) });

  if (!rbacLoading && !can("employees")) return <AccessDenied />;
  const handleSubmit = (data) => { if (editing) updateMut.mutate({ id: editing.id, data }); else createMut.mutate(data); };

  const visibleEmployees = isAdmin ? employees : employees.filter(e => e.department === department);
  const filtered = visibleEmployees.filter(e => {
    const matchSearch = !search || e.full_name?.toLowerCase().includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || e.department === deptFilter;
    return matchSearch && matchDept;
  });
  const deptCounts = {};
  visibleEmployees.forEach(e => { deptCounts[e.department] = (deptCounts[e.department] || 0) + 1; });

  return (
    <div className="p-5 lg:p-8 space-y-6 max-w-[1600px] mx-auto">

      {/* ── Ticker ── */}
      <div className="relative overflow-hidden rounded-xl h-8 flex items-center"
        style={{ background: "rgba(0,180,180,0.04)", border: "1px solid rgba(0,180,180,0.12)" }}>
        <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg,#111111,transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg,#111111,transparent)" }} />
        <div className="ticker-track flex items-center gap-10 px-6 whitespace-nowrap">
          {["EMPLOYEE DIRECTORY","HR MANAGEMENT","DEPARTMENT ANALYTICS","TEAM PERFORMANCE","ROLE MANAGEMENT","PAYROLL TRACKING",
            "EMPLOYEE DIRECTORY","HR MANAGEMENT","DEPARTMENT ANALYTICS","TEAM PERFORMANCE","ROLE MANAGEMENT","PAYROLL TRACKING"
          ].map((t, i) => (
            <span key={i} className="text-[9px] font-black uppercase tracking-[0.2em] mono"
              style={{ color: i % 3 === 0 ? "#00b4b4" : i % 3 === 1 ? "rgba(0,180,180,0.4)" : "#e02347" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-5"
        style={{ background: "#181818", border: "1px solid rgba(0,180,180,0.2)", boxShadow: "0 4px 32px rgba(0,0,0,0.5)" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,#e02347,transparent)" }} />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,180,180,0.15)", border: "1px solid rgba(0,180,180,0.3)" }}>
                <UserCog className="w-4 h-4" style={{ color: "#00b4b4" }} />
              </div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk', sans-serif" }}>Employee Directory</h1>
            </div>
            <p className="text-[11px] mono pl-10" style={{ color: "rgba(255,255,255,0.35)" }}>
              {visibleEmployees.length} staff · {visibleEmployees.filter(e => e.status === "active").length} active
            </p>
          </div>
          {isAdmin && (
            <button onClick={() => { setEditing(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 20px rgba(0,180,180,0.3)" }}>
              <Plus className="w-4 h-4" /> Add Employee
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Strip ── */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Staff", value: visibleEmployees.length, color: "#00b4b4" },
            { label: "Active", value: visibleEmployees.filter(e => e.status === "active").length, color: "#10b981" },
            { label: "On Leave", value: visibleEmployees.filter(e => e.status === "on_leave").length, color: "#f59e0b" },
            { label: "Departments", value: Object.keys(deptCounts).length, color: "#a855f7" },
          ].map(k => (
            <div key={k.label} className="relative overflow-hidden rounded-2xl px-4 py-3.5 holo-card group transition-all hover:-translate-y-0.5"
              style={{ background: "#181818", border: `1px solid ${k.color}25` }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg,${k.color},transparent)` }} />
              <p className="text-[9px] font-black uppercase tracking-[0.18em] mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{k.label}</p>
              <p className="text-2xl font-black mono" style={{ color: k.color, fontFamily: "'JetBrains Mono',monospace" }}>{k.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Department summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {Object.entries(deptColors).map(([dept, dc]) => {
          const isActive = deptFilter === dept;
          return (
            <div key={dept}
              className="relative overflow-hidden rounded-2xl p-3 text-center cursor-pointer transition-all hover:scale-[1.03]"
              style={{
                background: isActive ? `${dc.color}15` : "#181818",
                border: `1px solid ${isActive ? dc.color + "50" : "rgba(255,255,255,0.07)"}`,
                boxShadow: isActive ? `0 4px 20px ${dc.color}25` : "none",
              }}
              onClick={() => setDeptFilter(deptFilter === dept ? "all" : dept)}>
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${dc.color}, transparent)` }} />
              <p className="text-[20px] font-black mono" style={{ color: dc.color, fontFamily: "'JetBrains Mono',monospace" }}>{deptCounts[dept] || 0}</p>
              <p className="text-[9px] capitalize font-bold uppercase tracking-wider mt-0.5" style={{ color: isActive ? dc.color : "rgba(255,255,255,0.35)" }}>
                {dept.replace(/_/g, " ")}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} />
        <input
          placeholder="Search employees…"
          className="w-full pl-10 pr-4 py-3 rounded-xl text-[13px] outline-none transition-all"
          style={{ background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)", color: "#e0e0e0" }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Employee cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.07)" }}>
          <UserCog className="w-10 h-10 mx-auto mb-3" style={{ color: "#00b4b4" }} />
          <p className="text-[13px] font-bold" style={{ color: "#f0f0f0" }}>No employees found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(emp => {
            const dc = deptColors[emp.department] || deptColors.technical;
            const ss = statusStyle[emp.status] || statusStyle.active;
            const initials = emp.full_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
            return (
              <div key={emp.id}
                className="relative overflow-hidden rounded-2xl p-5 transition-all duration-200 group holo-card"
                style={{ background: "linear-gradient(135deg,#181818,#1a1a1a)", border: `1px solid ${dc.color}22`, boxShadow: "0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = dc.color + "55"; e.currentTarget.style.boxShadow = `0 8px 32px ${dc.color}18, 0 0 20px rgba(0,212,212,0.05)`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${dc.color}22`; e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.4)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${dc.color}, transparent)` }} />
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
                      style={{ background: dc.grad, boxShadow: `0 4px 14px ${dc.color}30` }}>
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-black text-[13px]" style={{ color: "#f0f0f0" }}>{emp.full_name}</h3>
                      <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{emp.role || "No title"}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider"
                    style={{ background: `${dc.color}18`, color: dc.color, border: `1px solid ${dc.color}30` }}>
                    {emp.department?.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="space-y-1.5 text-[12px]" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />
                    <span className="truncate" style={{ color: "rgba(255,255,255,0.5)" }}>{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>{emp.phone}</span>
                    </div>
                  )}
                  {emp.salary > 0 && can("view_salaries") && (
                    <p className="text-[11px] mono font-bold" style={{ color: "#10b981" }}>R{emp.salary?.toLocaleString()} / yr</p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider"
                    style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                    {emp.status?.replace(/_/g, " ")}
                  </span>
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                        onClick={() => { setEditing(emp); setShowForm(true); }}>
                        <Pencil className="w-3.5 h-3.5" style={{ color: "#b0b0b0" }} />
                      </button>
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: "rgba(224,35,71,0.1)", border: "1px solid rgba(224,35,71,0.2)" }}
                        onClick={() => { if (confirm("Delete this employee?")) deleteMut.mutate(emp.id); }}>
                        <Trash2 className="w-3.5 h-3.5" style={{ color: "#e02347" }} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <EmployeeForm employee={editing} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditing(null); }} />}
    </div>
  );
}