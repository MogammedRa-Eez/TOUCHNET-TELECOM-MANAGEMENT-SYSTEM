import React, { useState } from "react";
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
  Bell,
  Search,
  Signal,
  Shield } from
"lucide-react";
import { RBACProvider, useRBAC } from "@/components/rbac/RBACContext";

const ALL_NAV = [
{ name: "Dashboard", page: "Dashboard", icon: LayoutDashboard, perm: "dashboard" },
{ name: "Customers", page: "Customers", icon: Users, perm: "customers" },
{ name: "Billing", page: "Billing", icon: Receipt, perm: "billing" },
{ name: "Tickets", page: "Tickets", icon: TicketCheck, perm: "tickets" },
{ name: "Network", page: "Network", icon: Network, perm: "network" },
{ name: "Employees", page: "Employees", icon: UserCog, perm: "employees" },
{ name: "AI Assistant", page: "AIAssistant", icon: Bot, perm: "ai_assistant" },
{ name: "Roles", page: "RolesManagement", icon: Shield, perm: "roles_management" }];


const pageLabels = {
  AIAssistant: "AI Assistant",
  RolesManagement: "Roles & Permissions"
};

function SidebarNav({ currentPageName, mobileOpen, setMobileOpen }) {
  const { can, loading } = useRBAC();

  const navItems = loading ?
  ALL_NAV :
  ALL_NAV.filter((item) => can(item.perm));

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-50 w-60
      ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      flex flex-col transition-transform duration-300 ease-in-out sidebar-glow
    `} style={{ background: "#0a0f1e" }}>

      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-[64px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(220,38,38,0.15)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center relative" style={{ background: "linear-gradient(135deg, #dc2626, #991b1b)" }}>
            <Signal className="w-4 h-4 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-400 pulse-dot" />
          </div>
          <div>
            <h1 className="text-white font-bold text-[14px] leading-tight tracking-tight">TOUCHNET</h1>
            <p className="text-red-500/60 text-[9px] font-medium tracking-widest uppercase mono">TELECOMMUNICATION MANAGEMENT SYSTEM</p>
          </div>
        </div>
        <button onClick={() => setMobileOpen(false)} className="lg:hidden text-white/40 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* System status pill */}
      







      {/* Nav */}
      <nav className="bg-[#ffffff] text-black mt-6 mb-1 pt-3 pr-4 pb-2 pl-3 flex-1 overflow-y-auto tn-sidebar flex flex-col space-y-0.5">
        <p className="text-[9px] font-semibold text-slate-600 tracking-widest uppercase px-2 py-2 mono">Navigation</p>
        {navItems.map((item) => {
          const isActive = currentPageName === item.page;
          const Icon = item.icon;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              onClick={() => setMobileOpen(false)} className="text-[#e51010] my-2 pt-10 pr-3 pl-1 text-base font-extrabold text-left underline uppercase rounded-md flex items-center gap-3 transition-all duration-150 group relative hover:text-slate-200 nav-item-hover">






              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-red-400" : "text-slate-500 group-hover:text-slate-300"}`} />
              <span className="flex-1 text-[13px]">{item.name}</span>
              {isActive && <ChevronRight className="w-3 h-3 text-red-500/60" />}
            </Link>);

        })}

        {/* Footer pinned below nav items */}
        <div className="mt-auto pt-4" style={{ borderTop: "1px solid rgba(220,38,38,0.1)" }}>
          <p className="text-[10px] text-slate-600 mono text-center">© TOUCHNET v2.4.1</p>
        </div>
      </nav>
    </aside>);

}

function LayoutInner({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageLabel = pageLabels[currentPageName] || currentPageName;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0d1225" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        body { font-family: 'Inter', sans-serif; background: #0d1225; }
        .tn-sidebar { scrollbar-width: none; }
        .tn-sidebar::-webkit-scrollbar { display: none; }
        .nav-item-hover:hover { background: rgba(220,38,38,0.08); }
        .sidebar-glow { box-shadow: 1px 0 0 0 rgba(220,38,38,0.12), 4px 0 24px rgba(0,0,0,0.5); }
        .active-nav { background: linear-gradient(90deg, rgba(220,38,38,0.18) 0%, rgba(220,38,38,0.04) 100%); border-left: 2px solid #dc2626; }
        .topbar-border { border-bottom: 1px solid rgba(220,38,38,0.12); }
        .main-content { background: #0d1225; }
        .card-dark { background: #111827; border: 1px solid rgba(220,38,38,0.12); }
        .card-dark:hover { border-color: rgba(220,38,38,0.3); box-shadow: 0 0 20px rgba(220,38,38,0.06); }
        .pulse-dot { animation: pulse-red 2s infinite; }
        @keyframes pulse-red { 0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.4); } 50% { box-shadow: 0 0 0 6px rgba(220,38,38,0); } }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .grid-bg { background-image: linear-gradient(rgba(220,38,38,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.03) 1px, transparent 1px); background-size: 32px 32px; }
      `}</style>

      {mobileOpen &&
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      }

      <SidebarNav currentPageName={currentPageName} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main content */}
      <div className="mb-1 flex-1 flex flex-col min-w-0 overflow-hidden main-content">
        <header className="px-6 py-3 h-[64px] flex items-center lg:px-6 flex-shrink-0 z-30 gap-4 topbar-border" style={{ background: "#0a0f1e" }}>
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-slate-500 hover:text-white rounded-md transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <h2 className="text-[15px] font-bold text-white leading-tight tracking-wide">{pageLabel}</h2>
            <p className="text-[10px] text-red-600/60 hidden sm:block mono">touchnet.local / admin</p>
          </div>

          <div className="hidden md:flex items-center gap-2 rounded-md px-3.5 py-2 w-52" style={{ background: "#111827", border: "1px solid rgba(220,38,38,0.12)" }}>
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-sm text-slate-600">Search...</span>
          </div>

          <button className="relative w-9 h-9 flex items-center justify-center rounded-md text-slate-400 hover:text-white transition-colors" style={{ background: "#111827", border: "1px solid rgba(220,38,38,0.12)" }}>
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0f1e]" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto grid-bg">
          {children}
        </main>
      </div>
    </div>);

}

export default function Layout({ children, currentPageName }) {
  return (
    <RBACProvider>
      <LayoutInner currentPageName={currentPageName}>{children}</LayoutInner>
    </RBACProvider>);

}