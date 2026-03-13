import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Users, UserCheck, UserX, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const DEPT_LABELS = { sales: "Sales", projects: "Projects", finance: "Finance", cyber_security: "Cyber Sec", technical: "Technical", hr: "HR" };

export default function HRDashboard2() {
  const { data: employees = [] } = useQuery({ queryKey: ["hr-employees"], queryFn: () => base44.entities.Employee.list() });
  const { data: tasks = [] } = useQuery({ queryKey: ["hr-tasks"], queryFn: () => base44.entities.Task.list() });

  const active = employees.filter(e => e.status === "active").length;
  const onLeave = employees.filter(e => e.status === "on_leave").length;
  const terminated = employees.filter(e => e.status === "terminated").length;

  const deptCounts = Object.keys(DEPT_LABELS).map(dept => ({
    dept: DEPT_LABELS[dept],
    count: employees.filter(e => e.department === dept && e.status === "active").length,
  }));

  const pendingTasks = tasks.filter(t => !["completed", "cancelled"].includes(t.status));
  const overdueTasks = tasks.filter(t => t.status !== "completed" && t.due_date && new Date(t.due_date) < new Date());

  return (
    <div className="p-6 space-y-6">
      <DeptHeader title="HR Dashboard" dept="Human Resources" color="#ec4899" icon="👥" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Active Employees" value={active} icon={<UserCheck className="w-4 h-4 text-emerald-500" />} bg="bg-emerald-50" />
        <KPI label="On Leave" value={onLeave} icon={<Users className="w-4 h-4 text-yellow-500" />} bg="bg-yellow-50" />
        <KPI label="Open Tasks" value={pendingTasks.length} icon={<CheckCircle className="w-4 h-4 text-blue-500" />} bg="bg-blue-50" />
        <KPI label="Overdue Tasks" value={overdueTasks.length} icon={<UserX className="w-4 h-4 text-red-500" />} bg="bg-red-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-700 text-sm mb-4">Headcount by Department</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptCounts}>
              <XAxis dataKey="dept" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-700 text-sm mb-4">Employee List</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {employees.slice(0, 10).map(e => (
              <div key={e.id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-xs font-bold text-pink-600">
                    {e.full_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{e.full_name}</p>
                    <p className="text-xs text-slate-400">{DEPT_LABELS[e.department] || e.department} · {e.role}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                  e.status === "active" ? "bg-emerald-100 text-emerald-700" :
                  e.status === "on_leave" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-500"
                }`}>{e.status?.replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-slate-700 text-sm mb-4">Pending Tasks (All Departments)</h3>
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {pendingTasks.length === 0 ? (
            <p className="text-sm text-emerald-600 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> All tasks completed</p>
          ) : pendingTasks.slice(0, 8).map(t => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-700">{t.title}</p>
                <p className="text-xs text-slate-400">{t.assigned_to_name} · {DEPT_LABELS[t.department] || t.department}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                  t.priority === "critical" ? "bg-red-100 text-red-600" :
                  t.priority === "high" ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"
                }`}>{t.priority}</span>
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