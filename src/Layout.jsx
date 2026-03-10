import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  LayoutDashboard,
  Users,
  Receipt,
  TicketCheck,
  Network,
  UserCog,
  Bot,
  Menu,
  X,
  Shield,
  Package,
  Settings,
  Mail,
  HeartHandshake,
  ChevronRight
} from "lucide-react";
import { RBACProvider, useRBAC } from "@/components/rbac/RBACContext";
import UserMenu from "@/components/layout/UserMenu";
import NotificationBell from "@/components/notifications/NotificationBell";
import DemoUserSwitcher from "@/components/layout/DemoUserSwitcher";
import GlobalSearch from "@/components/layout/GlobalSearch";

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { name: "Home", page: "Home", icon: LayoutDashboard, perm: null },
      { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard, perm: "dashboard" },
    ]
  },
  {
    label: "Operations",
    items: [
      { name: "Customers", page: "Customers", icon: Users, perm: "customers" },
      { name: "Billing", page: "Billing", icon: Receipt, perm: "billing" },
      { name: "Tickets", page: "Tickets", icon: TicketCheck, perm: "tickets" },
    ]
  },
  {
    label: "Infrastructure",
    items: [
      { name: "Network", page: "Network", icon: Network, perm: "network" },
      { name: "Inventory", page: "Inventory", icon: Package, perm: "network" },
      { name: "Fibre Projects", page: "FibreProjects", icon: Network, perm: "projects" },
    ]
  },
  {
    label: "Team",
    items: [
      { name: "Employees", page: "Employees", icon: UserCog, perm: "employees" },
      { name: "HR Dashboard", page: "HRDashboard", icon: HeartHandshake, perm: "employees" },
      { name: "Outlook", page: "OutlookMail", icon: Mail, perm: "outlook" },
    ]
  },
  {
    label: "System",
    items: [
      { name: "AI Assistant", page: "AIAssistant", icon: Bot, perm: "ai_assistant" },
      { name: "Roles", page: "RolesManagement", icon: Shield, perm: "roles_management" },
      { name: "Settings", page: "UserSettings", icon: Settings, perm: null },
    ]
  },
];

const pageLabels = {
  Home: "Home",
  AIAssistant: "AI Assistant",
  RolesManagement: "Roles & Permissions",
  HRDashboard: "HR Dashboard",
  FibreProjects: "Fibre Projects",
  OutlookMail: "Outlook Mail",
  UserSettings: "Settings",
};

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

function SidebarNav({ currentPageName, mobileOpen, setMobileOpen, collapsed, setCollapsed }) {
  const { can, loading } = useRBAC();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${collapsed ? "w-[68px]" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col transition-all duration-300 ease-in-out
        `}
        style={{
          background: "linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "4px 0 32px rgba(0,0,0,0.4)"
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-[64px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center overflow-hidden flex-1">
            {collapsed
              ? <img src={LOGO_URL} alt="TouchNet" className="w-8 h-8 object-contain brightness-0 invert" />
              : <img src={LOGO_URL} alt="TouchNet" className="h-7 w-auto object-contain brightness-0 invert" />
            }
          </div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-white/40 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
          >
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
          </button>
        </div>

        {/* Status pill */}
        {!collapsed && (
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase mono">Network Live</span>
              <span className="ml-auto text-[10px] text-emerald-600 mono font-semibold">99.9%</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="py-3 flex justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 tn-scroll" style={{ scrollbarWidth: "none" }}>
          {NAV_GROUPS.map((group, gi) => {
            const groupItems = loading ? group.items : group.items.filter(item => item.perm === null || can(item.perm));
            if (groupItems.length === 0) return null;
            return (
              <div key={gi} className={gi > 0 ? "mt-4" : "mt-2"}>
                {!collapsed && group.label && (
                  <p className="text-[9px] font-bold text-white/20 tracking-[0.2em] uppercase px-2 py-1.5 mono">{group.label}</p>
                )}
                {collapsed && gi > 0 && (
                  <div className="mx-1 my-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />
                )}
                <div className="flex flex-col gap-0.5">
                  {groupItems.map((item) => {
                    const isActive = currentPageName === item.page;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.page}
                        to={createPageUrl(item.page)}
                        onClick={() => setMobileOpen(false)}
                        title={collapsed ? item.name : undefined}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                          transition-all duration-200 group relative
                          ${collapsed ? "justify-center" : ""}
                          ${isActive
                            ? "text-white"
                            : "text-white/40 hover:text-white/80 hover:bg-white/5"
                          }
                        `}
                        style={isActive ? {
                          background: "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.2))",
                          border: "1px solid rgba(99,102,241,0.3)",
                          boxShadow: "0 0 20px rgba(99,102,241,0.15)"
                        } : {}}
                      >
                        <div className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isActive ? "bg-indigo-500/30" : "group-hover:bg-white/10"}`}>
                          <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-300" : "text-white/40 group-hover:text-white/70"}`} />
                        </div>
                        {!collapsed && <span className="flex-1 text-[13px] font-medium tracking-wide">{item.name}</span>}
                        {!collapsed && isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {collapsed
            ? <p className="text-[8px] text-white/15 mono text-center">TN</p>
            : <p className="text-[9px] text-white/15 mono text-center tracking-widest">© TOUCHNET v2.4.1</p>
          }
        </div>
      </aside>
    </>
  );
}

function LayoutInner({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const pageLabel = pageLabels[currentPageName] || currentPageName;

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0a0d1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace !important; }
        .tn-scroll { scrollbar-width: none; }
        .tn-scroll::-webkit-scrollbar { display: none; }
        .main-area { background: #f0f2f8; }
        .topbar-glass {
          background: rgba(255,255,255,0.97);
          border-bottom: 1px solid rgba(0,0,0,0.06);
          backdrop-filter: blur(20px);
        }
        .pulse-dot { animation: pulse-signal 2s infinite; }
        @keyframes pulse-signal { 0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); } 50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); } }
      `}</style>

      <SidebarNav
        currentPageName={currentPageName}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden main-area">
        {/* Topbar */}
        <header className="h-[64px] flex items-center px-4 lg:px-6 flex-shrink-0 z-30 gap-4 topbar-glass">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-bold text-slate-900 leading-tight tracking-tight truncate">{pageLabel}</h2>
            <p className="text-[10px] text-slate-400 hidden sm:block mono truncate">
              {currentUser?.full_name || currentUser?.email || "touchnet.local"}
            </p>
          </div>

          <GlobalSearch />
          <DemoUserSwitcher />
          <NotificationBell />
          <UserMenu />
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <RBACProvider>
      <LayoutInner currentPageName={currentPageName}>{children}</LayoutInner>
    </RBACProvider>
  );
}