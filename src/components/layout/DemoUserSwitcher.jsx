import React, { useState, useEffect, useRef } from "react";
import { Users, ChevronRight, X, Eye, Building2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const DEPT_PERSONAS = [
  {
    name: "Sales Staff",
    _department: "sales",
    color: "#6366f1",
    icon: "💼",
    permissions: { dashboard: true, customers: true, billing: true, tickets: true, projects: true, ai_assistant: true },
  },
  {
    name: "Projects Engineer",
    _department: "projects",
    color: "#0891b2",
    icon: "🔧",
    permissions: { dashboard: true, projects: true, tickets: true, network: true, ai_assistant: true },
  },
  {
    name: "Finance Staff",
    _department: "finance",
    color: "#10b981",
    icon: "💰",
    permissions: { dashboard: true, billing: true, customers: true, view_financials: true, ai_assistant: true },
  },
  {
    name: "Cyber Security",
    _department: "cyber_security",
    color: "#f59e0b",
    icon: "🛡️",
    permissions: { dashboard: true, network: true, tickets: true, ai_assistant: true },
  },
  {
    name: "Technical Staff",
    _department: "technical",
    color: "#8b5cf6",
    icon: "⚙️",
    permissions: { dashboard: true, network: true, tickets: true, customers: true, ai_assistant: true },
  },
  {
    name: "HR Staff",
    _department: "hr",
    color: "#ec4899",
    icon: "👥",
    permissions: { dashboard: true, employees: true, view_salaries: true, ai_assistant: true },
  },
];

const DEMO_STORAGE_KEY = "tn_demo_role_override";

// Returns the active demo role override (or null if none)
export function getDemoRoleOverride() {
  try {
    const raw = sessionStorage.getItem(DEMO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearDemoRoleOverride() {
  sessionStorage.removeItem(DEMO_STORAGE_KEY);
  window.location.reload();
}

export default function DemoUserSwitcher() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const ref = useRef(null);

  const { data: roles = [] } = useQuery({
    queryKey: ["roles-for-demo"],
    queryFn: () => base44.entities.Role.list(),
  });

  useEffect(() => {
    setActive(getDemoRoleOverride());
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchTo = (role) => {
    sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(role));
    window.location.reload();
  };

  const clearOverride = () => {
    clearDemoRoleOverride();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        title="Demo: Switch Role View"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${active ? "text-amber-700" : "text-slate-500 hover:text-slate-700"}`}
        style={{
          background: active ? "rgba(245,158,11,0.12)" : "#f1f5f9",
          border: `1px solid ${active ? "rgba(245,158,11,0.3)" : "rgba(0,0,0,0.08)"}`,
        }}>
        <Eye className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{active ? `Viewing as: ${active.name}` : "Demo Mode"}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-xl z-50 overflow-hidden"
          style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.1)" }}>
          <div className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.07)", background: "#f8fafc" }}>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              <p className="text-sm font-bold text-slate-700">Switch Role View</p>
            </div>
            <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
          </div>

          <p className="text-[11px] text-slate-400 px-4 pt-2.5 pb-1">
            Preview the app as a specific role. No data changes are made.
          </p>

          <div className="p-2 space-y-1">
            {/* Admin option */}
            <button
              onClick={() => switchTo({ name: "Admin", permissions: null, _isAdmin: true })}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${active?._isAdmin ? "font-bold text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}
              style={active?._isAdmin ? { background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" } : {}}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: "#6366f1" }} />
                Admin (Full Access)
              </div>
              {active?._isAdmin && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
            </button>

            {roles.map(role => (
              <button key={role.id}
                onClick={() => switchTo(role)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${active?.id === role.id ? "font-bold text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}
                style={active?.id === role.id ? { background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" } : {}}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: role.color || "#94a3b8" }} />
                  {role.name}
                </div>
                {active?.id === role.id && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            ))}
          </div>

          {/* Department Personas */}
          <div className="px-4 py-2 flex items-center gap-1.5" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">By Department</p>
          </div>
          <div className="p-2 pt-0 space-y-1">
            {DEPT_PERSONAS.map(persona => {
              const isActive = active?._department === persona._department && !active?._isAdmin;
              return (
                <button key={persona._department}
                  onClick={() => switchTo(persona)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${isActive ? "font-bold" : "text-slate-600 hover:bg-slate-50"}`}
                  style={isActive ? { background: `${persona.color}12`, border: `1px solid ${persona.color}40`, color: persona.color } : {}}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{persona.icon}</span>
                    <div className="text-left">
                      <p className="text-xs font-semibold leading-tight">{persona.name}</p>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {Object.keys(persona.permissions).filter(k => persona.permissions[k]).join(", ")}
                      </p>
                    </div>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: persona.color }} />}
                </button>
              );
            })}
          </div>

          {active && (
            <div className="p-2 pt-0">
              <button
                onClick={clearOverride}
                className="w-full text-xs font-semibold py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                style={{ border: "1px solid rgba(239,68,68,0.2)" }}>
                Exit Demo Mode → Back to My Account
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}