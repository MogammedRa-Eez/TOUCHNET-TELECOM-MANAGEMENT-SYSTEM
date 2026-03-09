import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, X, Pencil, Trash2, CheckCircle2, Clock, AlertTriangle,
  ChevronDown, Search, Filter, CalendarDays, User
} from "lucide-react";
import { format, parseISO, isPast, isToday } from "date-fns";

const PRIORITY_CONFIG = {
  low:      { color: "#64748b", bg: "rgba(100,116,139,0.1)", label: "Low" },
  medium:   { color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  label: "Medium" },
  high:     { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "High" },
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   label: "Critical" },
};

const STATUS_CONFIG = {
  todo:       { color: "#64748b", bg: "rgba(100,116,139,0.1)", label: "To Do" },
  in_progress:{ color: "#3b82f6", bg: "rgba(59,130,246,0.1)", label: "In Progress" },
  review:     { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", label: "In Review" },
  completed:  { color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Completed" },
  cancelled:  { color: "#94a3b8", bg: "rgba(148,163,184,0.1)",label: "Cancelled" },
};

const DEPT_CONFIG = {
  sales: "Sales", projects: "Projects", finance: "Finance",
  cyber_security: "Cyber Security", technical: "Technical", hr: "HR",
};

function TaskModal({ task, employees, onSubmit, onCancel, currentUser }) {
  const [form, setForm] = useState(task || {
    title: "", description: "", assigned_to_email: "", assigned_to_name: "",
    department: "", priority: "medium", status: "todo", due_date: "", notes: "",
  });

  const handleEmployeeSelect = (email) => {
    const emp = employees.find(e => e.email === email);
    setForm({ ...form, assigned_to_email: email, assigned_to_name: emp?.full_name || "", department: emp?.department || form.department });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ border: "1px solid rgba(0,0,0,0.1)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <h2 className="text-base font-semibold text-slate-800">{task ? "Edit Task" : "Assign New Task"}</h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, assigned_by: currentUser?.email || "" }); }} className="p-6 space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-slate-600">Task Title *</Label>
            <Input value={form.title} required onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What needs to be done?" className="text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-600">Description</Label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed instructions…" rows={3}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs text-slate-600">Assign To *</Label>
              <Select value={form.assigned_to_email} onValueChange={handleEmployeeSelect} required>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Select employee…" /></SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.status === "active").map(e => (
                    <SelectItem key={e.id} value={e.email}>
                      {e.full_name} — {DEPT_CONFIG[e.department] || e.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
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
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Due Date</Label>
              <Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className="text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-600">Notes</Label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onCancel} className="text-sm">Cancel</Button>
            <Button type="submit" className="text-sm text-white" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              {task ? "Save Changes" : "Assign Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const isOverdue = task.due_date && task.status !== "completed" && task.status !== "cancelled" && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date));
  const isDueToday = task.due_date && isToday(parseISO(task.due_date));

  return (
    <div className="rounded-xl p-4 group hover:shadow-md transition-all" style={{ background: "#fff", border: `1px solid ${isOverdue ? "rgba(239,68,68,0.3)" : "rgba(0,0,0,0.07)"}` }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className={`text-sm font-semibold flex-1 ${task.status === "completed" ? "line-through text-slate-400" : "text-slate-800"}`}>{task.title}</h4>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => onEdit(task)} className="p-1 rounded hover:bg-slate-100"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button>
          <button onClick={() => onDelete(task.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
        </div>
      </div>

      {task.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>}

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg" style={{ background: pc.bg, color: pc.color }}>{pc.label}</span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
        {isOverdue && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-red-50 text-red-500">Overdue</span>}
        {isDueToday && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600">Due Today</span>}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <User className="w-3 h-3" />
          <span className="truncate max-w-[120px]">{task.assigned_to_name}</span>
        </div>
        {task.due_date && (
          <div className={`flex items-center gap-1 text-[10px] font-mono ${isOverdue ? "text-red-500" : "text-slate-400"}`}>
            <CalendarDays className="w-3 h-3" />
            {format(parseISO(task.due_date), "dd MMM yyyy")}
          </div>
        )}
      </div>

      {/* Quick status change */}
      <div className="mt-3 pt-3 flex gap-1" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
          <button key={k} onClick={() => onStatusChange(task.id, k)}
            className={`flex-1 text-[9px] font-semibold py-1 rounded transition-all ${task.status === k ? "text-white" : "text-slate-400 hover:text-slate-600"}`}
            style={task.status === k ? { background: v.color } : { background: "rgba(0,0,0,0.03)" }}
            title={v.label}>
            {v.label.split(" ")[0]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TaskPanel({ employees = [], currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-created_date"),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tasks"] }); setShowForm(false); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tasks"] }); setShowForm(false); setEditing(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const handleSubmit = (data) => {
    if (editing) updateMut.mutate({ id: editing.id, data });
    else createMut.mutate(data);
  };

  const handleStatusChange = (id, status) => {
    const completed_date = status === "completed" ? new Date().toISOString().split("T")[0] : "";
    updateMut.mutate({ id, data: { status, completed_date } });
  };

  const filtered = tasks.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.title?.toLowerCase().includes(q) || t.assigned_to_name?.toLowerCase().includes(q);
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchEmployee = filterEmployee === "all" || t.assigned_to_email === filterEmployee;
    return matchSearch && matchPriority && matchStatus && matchEmployee;
  });

  // KPI counts
  const overdue = tasks.filter(t => t.due_date && t.status !== "completed" && t.status !== "cancelled" && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)));
  const inProgress = tasks.filter(t => t.status === "in_progress");
  const completed = tasks.filter(t => t.status === "completed");

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Tasks", value: tasks.length, color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
          { label: "In Progress", value: inProgress.length, color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
          { label: "Completed", value: completed.length, color: "#10b981", bg: "rgba(16,185,129,0.08)" },
          { label: "Overdue", value: overdue.length, color: overdue.length > 0 ? "#ef4444" : "#94a3b8", bg: overdue.length > 0 ? "rgba(239,68,68,0.08)" : "rgba(148,163,184,0.08)" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 flex items-center gap-3" style={{ background: s.bg }}>
            <div>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input placeholder="Search tasks…" className="pl-8 text-sm h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 text-sm h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-32 text-sm h-9"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterEmployee} onValueChange={setFilterEmployee}>
          <SelectTrigger className="w-40 text-sm h-9"><SelectValue placeholder="Employee" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {employees.filter(e => e.status === "active").map(e => (
              <SelectItem key={e.id} value={e.email}>{e.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="text-white text-sm h-9 ml-auto" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
          <Plus className="w-4 h-4 mr-1.5" /> Assign Task
        </Button>
      </div>

      {/* Task grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)" }}>
          <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-slate-200" />
          <p className="text-sm text-slate-400">No tasks found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={t => { setEditing(t); setShowForm(true); }}
              onDelete={id => { if (confirm("Delete this task?")) deleteMut.mutate(id); }}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {showForm && (
        <TaskModal
          task={editing}
          employees={employees}
          currentUser={currentUser}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}