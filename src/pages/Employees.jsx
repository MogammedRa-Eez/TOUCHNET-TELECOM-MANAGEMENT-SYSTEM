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
  sales:          { bg: "rgba(59,130,246,0.1)",   color: "#3b82f6",  border: "rgba(59,130,246,0.3)"  },
  projects:       { bg: "rgba(139,92,246,0.1)",   color: "#8b5cf6",  border: "rgba(139,92,246,0.3)"  },
  finance:        { bg: "rgba(16,185,129,0.1)",   color: "#10b981",  border: "rgba(16,185,129,0.3)"  },
  cyber_security: { bg: "rgba(239,68,68,0.1)",    color: "#ef4444",  border: "rgba(239,68,68,0.3)"   },
  technical:      { bg: "rgba(245,158,11,0.1)",   color: "#f59e0b",  border: "rgba(245,158,11,0.3)"  },
  hr:             { bg: "rgba(236,72,153,0.1)",   color: "#ec4899",  border: "rgba(236,72,153,0.3)"  },
};

const statusStyle = {
  active:     { bg: "rgba(16,185,129,0.1)",   color: "#10b981" },
  on_leave:   { bg: "rgba(245,158,11,0.1)",   color: "#f59e0b" },
  terminated: { bg: "rgba(100,116,139,0.1)",  color: "#64748b" },
};

function EmployeeForm({ employee, onSubmit, onCancel }) {
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
          <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ border: "1px solid rgba(139,92,246,0.2)" }}>
            <X className="w-4 h-4" style={{ color: "rgba(196,181,253,0.6)" }} />
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
                <Label className="text-[11px] font-bold" style={{ color: "rgba(196,181,253,0.6)" }}>{label}</Label>
                <input
                  type={type} value={form[key] || ""} required={required}
                  onChange={e => setForm({ ...form, [key]: type === "number" ? parseFloat(e.target.value) || 0 : (key === "full_name" ? toTitleCase(e.target.value) : e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl text-[13px] outline-none transition-all"
                  style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", color: "#e8d5ff" }}
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold" style={{ color: "rgba(196,181,253,0.6)" }}>Department</Label>
              <Select value={form.department} onValueChange={v => setForm({...form, department: v})}>
                <SelectTrigger style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", color: "#e8d5ff" }}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(deptColors).map(([k]) => (
                    <SelectItem key={k} value={k}>{k.replace(/_/g," ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold" style={{ color: "rgba(196,181,253,0.6)" }}>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", color: "#e8d5ff" }}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel}
              className="px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
              style={{ border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa", background: "transparent" }}>Cancel</button>
            <button type="submit"
              className="px-5 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "#f0e8ff", fontFamily: "'Space Grotesk', sans-serif" }}>Employee Directory</h1>
          <p className="text-[11px] mt-0.5 mono" style={{ color: "rgba(196,181,253,0.5)" }}>
            {visibleEmployees.length} staff · {visibleEmployees.filter(e => e.status === "active").length} active
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}>
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        )}
      </div>

      {/* Department summary pills */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {Object.entries(deptColors).map(([dept, dc]) => {
          const isActive = deptFilter === dept;
          return (
            <div key={dept}
              className="relative overflow-hidden rounded-2xl p-3 text-center cursor-pointer transition-all hover:scale-[1.03]"
              style={{
                background: isActive ? `${dc.color}14` : "rgba(12,8,28,0.95)",
                border: `1px solid ${isActive ? dc.color + "40" : dc.color + "20"}`,
                boxShadow: isActive ? `0 4px 16px ${dc.color}20` : "none",
              }}
              onClick={() => setDeptFilter(deptFilter === dept ? "all" : dept)}>
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, ${dc.color}, transparent)` }} />
              <p className="text-[20px] font-black mono" style={{ color: dc.color }}>{deptCounts[dept] || 0}</p>
              <p className="text-[9px] capitalize font-bold uppercase tracking-wider mt-0.5" style={{ color: isActive ? dc.color : "rgba(196,181,253,0.5)" }}>
                {dept.replace(/_/g, " ")}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(196,181,253,0.4)" }} />
        <input
          placeholder="Search employees…"
          className="w-full pl-10 pr-4 py-3 rounded-xl text-[13px] outline-none transition-all"
          style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.25)", color: "#e8d5ff" }}
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
        <div className="rounded-2xl py-16 text-center"
          style={{ background: "rgba(10,6,24,0.97)", border: "1px solid rgba(139,92,246,0.18)" }}>
          <UserCog className="w-10 h-10 mx-auto mb-3" style={{ color: "#a78bfa" }} />
          <p className="text-[13px] font-bold" style={{ color: "#c4b5fd" }}>No employees found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(emp => {
            const dc = deptColors[emp.department] || deptColors.technical;
            const ss = statusStyle[emp.status] || statusStyle.active;
            const initials = emp.full_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
            return (
              <div key={emp.id}
                className="relative overflow-hidden rounded-2xl p-5 transition-all duration-200 group"
                style={{ background: "rgba(12,8,28,0.95)", border: `1px solid ${dc.color}22` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = dc.border; e.currentTarget.style.boxShadow = `0 8px 32px ${dc.color}18`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${dc.color}22`; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, ${dc.color}, transparent)` }} />
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${dc.color}, ${dc.color}88)`, border: `1px solid ${dc.color}40` }}>
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-black text-[13px]" style={{ color: "#e8d5ff" }}>{emp.full_name}</h3>
                      <p className="text-[11px]" style={{ color: "rgba(196,181,253,0.5)" }}>{emp.role || "No title"}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider"
                    style={{ background: dc.bg, color: dc.color, border: `1px solid ${dc.border}` }}>
                    {emp.department?.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="space-y-1.5 text-[12px]" style={{ borderTop: "1px solid rgba(139,92,246,0.1)", paddingTop: 10 }}>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(196,181,253,0.4)" }} />
                    <span className="truncate" style={{ color: "rgba(196,181,253,0.65)" }}>{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(196,181,253,0.4)" }} />
                      <span style={{ color: "rgba(196,181,253,0.65)" }}>{emp.phone}</span>
                    </div>
                  )}
                  {emp.salary > 0 && can("view_salaries") && (
                    <p className="text-[11px] mono font-bold" style={{ color: "#10b981" }}>
                      R{emp.salary?.toLocaleString()} / yr
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider"
                    style={{ background: ss.bg, color: ss.color }}>
                    {emp.status?.replace(/_/g, " ")}
                  </span>
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}
                        onClick={() => { setEditing(emp); setShowForm(true); }}>
                        <Pencil className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
                      </button>
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                        onClick={() => { if (confirm("Delete this employee?")) deleteMut.mutate(emp.id); }}>
                        <Trash2 className="w-3.5 h-3.5" style={{ color: "#f87171" }} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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