import React from "react";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";
import SalesDashboard from "@/components/dept/SalesDashboard";
import ProjectsDashboard from "@/components/dept/ProjectsDashboard";
import FinanceDashboard from "@/components/dept/FinanceDashboard";
import CyberDashboard from "@/components/dept/CyberDashboard";
import TechnicalDashboard from "@/components/dept/TechnicalDashboard";
import HRDashboard2 from "@/components/dept/HRDashboard2";

const DEPT_MAP = {
  sales:          SalesDashboard,
  projects:       ProjectsDashboard,
  finance:        FinanceDashboard,
  cyber_security: CyberDashboard,
  technical:      TechnicalDashboard,
  hr:             HRDashboard2,
};

export default function DepartmentDashboard() {
  const { department, loading, user } = useRBAC();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Admins see a department selector
  if (user?.role === "admin") {
    return <AdminDeptSelector />;
  }

  const DeptComp = DEPT_MAP[department];
  if (!DeptComp) return <AccessDenied />;
  return <DeptComp />;
}

function AdminDeptSelector() {
  const [selected, setSelected] = React.useState(null);
  const DEPTS = [
    { key: "sales",          label: "Sales",           color: "#6366f1", icon: "💼" },
    { key: "projects",       label: "Projects",        color: "#0891b2", icon: "🔧" },
    { key: "finance",        label: "Finance",         color: "#10b981", icon: "💰" },
    { key: "cyber_security", label: "Cyber Security",  color: "#f59e0b", icon: "🛡️" },
    { key: "technical",      label: "Technical",       color: "#8b5cf6", icon: "⚙️" },
    { key: "hr",             label: "HR",              color: "#ec4899", icon: "👥" },
  ];
  const DEPT_MAP2 = {
    sales: SalesDashboard, projects: ProjectsDashboard, finance: FinanceDashboard,
    cyber_security: CyberDashboard, technical: TechnicalDashboard, hr: HRDashboard2,
  };

  if (selected) {
    const Comp = DEPT_MAP2[selected];
    return (
      <div>
        <div className="px-6 pt-4">
          <button onClick={() => setSelected(null)} className="text-xs text-indigo-500 hover:underline">← Back to departments</button>
        </div>
        <Comp />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Department Dashboards</h1>
      <p className="text-slate-400 text-sm mb-8">As an admin, you can view any department's dashboard.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {DEPTS.map(d => (
          <button
            key={d.key}
            onClick={() => setSelected(d.key)}
            className="rounded-2xl p-6 text-left hover:scale-[1.02] transition-all border"
            style={{ background: `${d.color}10`, borderColor: `${d.color}30` }}
          >
            <div className="text-3xl mb-3">{d.icon}</div>
            <p className="font-bold text-slate-800">{d.label}</p>
            <p className="text-xs text-slate-400 mt-1">View {d.label} dashboard →</p>
          </button>
        ))}
      </div>
    </div>
  );
}