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
  ChevronRight,
  ChevronLeft,
  Search,
  Shield,
  Package,
  Settings,
  Mail } from
"lucide-react";
import { RBACProvider, useRBAC } from "@/components/rbac/RBACContext";
import UserMenu from "@/components/layout/UserMenu";
import NotificationBell from "@/components/notifications/NotificationBell";
import DemoUserSwitcher from "@/components/layout/DemoUserSwitcher";
import GlobalSearch from "@/components/layout/GlobalSearch";

const ALL_NAV = [
{ name: "Home", page: "Home", icon: LayoutDashboard, perm: null },
{ name: "Dashboard", page: "Dashboard", icon: LayoutDashboard, perm: "dashboard" },
{ name: "Customers", page: "Customers", icon: Users, perm: "customers" },
{ name: "Billing", page: "Billing", icon: Receipt, perm: "billing" },
{ name: "Tickets", page: "Tickets", icon: TicketCheck, perm: "tickets" },
{ name: "Network", page: "Network", icon: Network, perm: "network" },
{ name: "Inventory", page: "Inventory", icon: Package, perm: "network" },
{ name: "Fibre Projects", page: "FibreProjects", icon: Network, perm: "projects" },
{ name: "Employees", page: "Employees", icon: UserCog, perm: "employees" },
{ name: "AI Assistant", page: "AIAssistant", icon: Bot, perm: "ai_assistant" },
{ name: "Roles", page: "RolesManagement", icon: Shield, perm: "roles_management" },
{ name: "Outlook", page: "OutlookMail", icon: Mail, perm: "outlook" },
{ name: "Settings", page: "UserSettings", icon: Settings, perm: null }];


const pageLabels = {
  Home: "Home",
  AIAssistant: "AI Assistant",
  RolesManagement: "Roles & Permissions"
};

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

function SidebarNav({ currentPageName, mobileOpen, setMobileOpen, collapsed, setCollapsed }) {
  const { can, loading } = useRBAC();

  const navItems = loading ?
  ALL_NAV :
  ALL_NAV.filter((item) => item.perm === null || can(item.perm));

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${collapsed ? "w-[60px]" : "w-60"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex flex-col transition-all duration-300 ease-in-out sidebar-glow
      `}
      style={{ background: "linear-gradient(180deg, #f8faff 0%, #f0f4ff 50%, #f5f0ff 100%)" }}>

      {/* Logo */}
      <div className="bg-transparent flex items-center justify-between px-3 h-[64px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(99,102,241,0.15)" }}>
        <div className="flex items-center overflow-hidden flex-1">
          {collapsed ?
          <img src={LOGO_URL} alt="TouchNet Logo" className="w-50 h-50 object-contain" /> :

          <img src={LOGO_URL} alt="TouchNet Logo" className="h-8 w-auto object-contain" />
          }
        </div>
        {/* Mobile close */}
        <button onClick={() => setMobileOpen(false)} className="lg:hidden text-white/40 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-6 h-6 rounded text-slate-500 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0">

          {collapsed ? (
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            )}
        </button>
      </div>

      {/* System status pill */}
      {!collapsed &&
      <div className="px-4 py-3">
          <div className="flex items-center gap-2 rounded-md px-3 py-1.5" style={{ background: "rgba(192,21,42,0.15)", border: "1px solid rgba(192,21,42,0.3)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
            <span className="text-[10px] text-red-300 font-semibold mono">NETWORK LIVE</span>
            <span className="ml-auto text-[10px] text-slate-300 mono">99.9%</span>
          </div>
        </div>
      }
      {collapsed &&
      <div className="py-2 flex justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
        </div>
      }

      {/* Nav */}
      <nav className="pt-2 pb-4 px-2 flex-1 overflow-y-auto tn-sidebar flex flex-col space-y-0.5" style={{ background: "#162040" }}>
        {!collapsed &&
        <p className="text-[9px] font-semibold text-slate-500 tracking-widest uppercase px-2 py-2 mono">Main Menu</p>
        }
        {navItems.map((item, idx) => {
          const isActive = currentPageName === item.page;
          const Icon = item.icon;
          // Add divider before "Roles"
          const showDivider = item.page === "RolesManagement";
          return (
            <React.Fragment key={item.page}>
              {showDivider && (
                <div className="mx-2 my-1.5" style={{ borderTop: "1px solid rgba(192,21,42,0.15)" }} />
              )}
              <Link
                to={createPageUrl(item.page)}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.name : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 group relative
                  ${collapsed ? "justify-center" : ""}
                  ${isActive ? "active-nav text-red-300" : "text-slate-400 hover:text-slate-200 nav-item-hover"}
                  `}>
                  <div className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md transition-all ${isActive ? "bg-red-700/20" : "group-hover:bg-white/5"}`}>
                   <Icon className={`w-4 h-4 ${isActive ? "text-red-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                  </div>
                  {!collapsed && <span className="flex-1 text-[13px] tracking-wide">{item.name}</span>}
                  {!collapsed && isActive && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
              </Link>
            </React.Fragment>
          );
        })}

        {/* Footer */}
        <div className="mt-auto pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {collapsed ?
          <p className="text-[8px] text-slate-600 mono text-center">TN</p> :
          <p className="text-[10px] text-slate-600 mono text-center">© TOUCHNET v2.4.1</p>
          }
        </div>
      </nav>
    </aside>);

}

function LayoutInner({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const pageLabel = pageLabels[currentPageName] || currentPageName;

  React.useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f0f2f8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        body { font-family: 'Inter', sans-serif; background: #f0f2f8; }
        .tn-sidebar { scrollbar-width: none; }
        .tn-sidebar::-webkit-scrollbar { display: none; }
        .nav-item-hover:hover { background: rgba(255,255,255,0.07); }
        .sidebar-glow { box-shadow: 4px 0 24px rgba(30,45,107,0.28); }
        .active-nav { background: linear-gradient(90deg, rgba(192,21,42,0.28) 0%, rgba(192,21,42,0.06) 100%); border-left: 2px solid #c0152a; }
        .topbar-border { border-bottom: 1px solid rgba(30,45,107,0.1); }
        .main-content { background: #f0f2f8; }
        .card-dark { background: #ffffff; border: 1px solid rgba(30,45,107,0.1); }
        .card-dark:hover { border-color: rgba(30,45,107,0.3); box-shadow: 0 4px 20px rgba(30,45,107,0.12); }
        .pulse-dot { animation: pulse-signal 2s infinite; }
        @keyframes pulse-signal { 0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); } 50% { box-shadow: 0 0 0 7px rgba(16,185,129,0); } }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .grid-bg { background: #f0f2f8; }
        .signal-bar { animation: signal-flash 3s ease-in-out infinite; }
        @keyframes signal-flash { 0%,100%{opacity:0.7} 50%{opacity:1} }
      `}</style>

      {mobileOpen &&
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      }

      <SidebarNav
        currentPageName={currentPageName}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed} />


      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden main-content">
        <header className="h-[64px] flex items-center px-4 lg:px-6 flex-shrink-0 z-30 gap-4 topbar-border" style={{ background: "linear-gradient(135deg, #ffffff 0%, #f0f2f8 100%)" }}>
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-slate-500 hover:text-white rounded-md transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <h2 className="text-[15px] font-bold text-slate-800 leading-tight tracking-wide">{pageLabel}</h2>
            <p className="text-[10px] text-slate-400 hidden sm:block mono">{currentUser?.full_name || currentUser?.email || "touchnet.local"}</p>
          </div>

          <GlobalSearch />

          <DemoUserSwitcher />

          <NotificationBell />

          <UserMenu />
        </header>

        <main className="flex-1 overflow-y-auto grid-bg">
          {children}
        </main>
      </div>
    </div>);

}

export default function Layout({ children, currentPageName }) {
  if (currentPageName === "Home") {
    return <>{children}</>;
  }
  return (
    <RBACProvider>
      <LayoutInner currentPageName={currentPageName}>{children}</LayoutInner>
    </RBACProvider>);

}