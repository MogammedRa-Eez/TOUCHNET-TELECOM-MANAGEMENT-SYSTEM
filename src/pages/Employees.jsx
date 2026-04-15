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
  sales:          { bg: "rgba(14,165,233,0.08)",   color: "#0ea5e9",  border: "rgba(14,165,233,0.25)"  },
  projects:       { bg: "rgba(30,45,110,0.08)",    color: "#1e2d6e",  border: "rgba(30,45,110,0.25)"   },
  finance:        { bg: "rgba(5,150,105,0.08)",    color: "#059669",  border: "rgba(5,150,105,0.25)"   },
  cyber_security: { bg: "rgba(196,30,58,0.08)",    color: "#c41e3a",  border: "rgba(196,30,58,0.25)"   },
  technical:      { bg: "rgba(217,119,6,0.08)",    color: "#d97706",  border: "rgba(217,119,6,0.25)"   },
  hr:             { bg: "rgba(139,92,246,0.08)",   color: "#8b5cf6",  border: "rgba(139,92,246,0.25)"  },
};

const statusStyle = {
  active:     { bg: "rgba(5,150,105,0.08)",    color: "#059669" },
  on_leave:   { bg: "rgba(217,119,6,0.08)",    color: "#d97706" },
  terminated: { bg: "rgba(100,116,139,0.07)",  color: "#64748b" },
};

function EmployeeForm({ employee, onSubmit, onCancel }) {
  const [form, setForm] = useState(employee || {
    full_name: "", email: "", phone: "", department: "technical",
    role: "", status: "active", hire_date: "", salary: 0,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,26,61,0.55)", backdropFilter: "blur(12px)" }}>
      <div className="rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.15)", boxShadow: "0 24px 80px rgba(30,45,110,0.18)" }}>
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,#c41e3a,transparent)" }} />
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(30,45,110,0.1)" }}>
          <h2 className="text-[15px] font-black" style={{ color: "#1e2d6e" }}>{employee ? "Edit Employee" : "Add Employee"}</h2>
          <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-50"
            style={{ border: "1px solid rgba(30,45,110,0.15)" }}>
            <X className="w-4 h-4" style={{ color: "rgba(30,45,110,0.5)" }} />
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
                <Label className="text-[11px] font-bold" style={{ color: "rgba(30,45,110,0.6)" }}>{label}</Label>
                <input
                  type={type} value={form[key] || ""} required={required}
                  onChange={e => setForm({ ...form, [key]: type === "number" ? parseFloat(e.target.value) || 0 : (key === "full_name" ? toTitleCase(e.target.value) : e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl text-[13px] outline-none transition-all"
                  style={{ background: "#f8f9fd", border: "1px solid rgba(30,45,110,0.2)", color: "#0f1a3d" }}
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold" style={{ color: "rgba(30,45,110,0.6)" }}>Department</Label>
              <Select value={form.department} onValueChange={v => setForm({...form, department: v})}>
                <SelectTrigger style={{ background: "#f8f9fd", border: "1px solid rgba(30,45,110,0.2)", color: "#0f1a3d" }}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(deptColors).map(([k]) => (
                    <SelectItem key={k} value={k}>{k.replace(/_/g," ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold" style={{ color: "rgba(30,45,110,0.6)" }}>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger style={{ background: "#f8f9fd", border: "1px solid rgba(30,45,110,0.2)", color: "#0f1a3d" }}><SelectValue /></SelectTrigger>
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
              style={{ border: "1px solid rgba(30,45,110,0.15)", color: "#1e2d6e", background: "rgba(30,45,110,0.05)" }}>Cancel</button>
            <button type="submit"
              className="px-5 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)", boxShadow: "0 4px 16px rgba(30,45,110,0.28)" }}>
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
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "#0f1a3d", fontFamily: "'Space Grotesk', sans-serif" }}>Employee Directory</h1>
          <p className="text-[11px] mt-0.5 mono" style={{ color: "rgba(30,45,110,0.5)" }}>
            {visibleEmployees.length} staff · {visibleEmployees.filter(e => e.status === "active").length} active
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)", boxShadow: "0 4px 20px rgba(30,45,110,0.3)" }}>
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
                background: isActive ? `${dc.color}10` : "#ffffff",
                border: `1px solid ${isActive ? dc.color + "35" : dc.color + "18"}`,
                boxShadow: isActive ? `0 4px 16px ${dc.color}20` : "none",
              }}
              onClick={() => setDeptFilter(deptFilter === dept ? "all" : dept)}>
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, ${dc.color}, transparent)` }} />
              <p className="text-[20px] font-black mono" style={{ color: dc.color, fontFamily: "'JetBrains Mono',monospace" }}>{deptCounts[dept] || 0}</p>
              <p className="text-[9px] capitalize font-bold uppercase tracking-wider mt-0.5" style={{ color: isActive ? dc.color : "rgba(30,45,110,0.45)" }}>
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
          style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.2)", color: "#0f1a3d", boxShadow: "0 2px 8px rgba(30,45,110,0.06)" }}
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
        style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.12)" }}>
        <UserCog className="w-10 h-10 mx-auto mb-3" style={{ color: "#1e2d6e" }} />
        <p className="text-[13px] font-bold" style={{ color: "#1e2d6e" }}>No employees found</p>
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
                style={{ background: "#ffffff", border: `1px solid ${dc.color}20`, boxShadow: "0 2px 10px rgba(30,45,110,0.06)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = dc.border; e.currentTarget.style.boxShadow = `0 8px 28px ${dc.color}15`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${dc.color}20`; e.currentTarget.style.boxShadow = "0 2px 10px rgba(30,45,110,0.06)"; }}
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
                      <h3 className="font-black text-[13px]" style={{ color: "#0f1a3d" }}>{emp.full_name}</h3>
                      <p className="text-[11px]" style={{ color: "rgba(30,45,110,0.5)" }}>{emp.role || "No title"}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider"
                    style={{ background: dc.bg, color: dc.color, border: `1px solid ${dc.border}` }}>
                    {emp.department?.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="space-y-1.5 text-[12px]" style={{ borderTop: "1px solid rgba(30,45,110,0.08)", paddingTop: 10 }}>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(30,45,110,0.35)" }} />
                    <span className="truncate" style={{ color: "rgba(30,45,110,0.65)" }}>{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(30,45,110,0.35)" }} />
                      <span style={{ color: "rgba(30,45,110,0.65)" }}>{emp.phone}</span>
                    </div>
                  )}
                  {emp.salary > 0 && can("view_salaries") && (
                    <p className="text-[11px] mono font-bold" style={{ color: "#059669" }}>
                      R{emp.salary?.toLocaleString()} / yr
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid rgba(30,45,110,0.08)" }}>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider"
                    style={{ background: ss.bg, color: ss.color }}>
                    {emp.status?.replace(/_/g, " ")}
                  </span>
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: "rgba(30,45,110,0.07)", border: "1px solid rgba(30,45,110,0.15)" }}
                        onClick={() => { setEditing(emp); setShowForm(true); }}>
                        <Pencil className="w-3.5 h-3.5" style={{ color: "#1e2d6e" }} />
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