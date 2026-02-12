import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  LayoutDashboard,
  Users,
  Receipt,
  TicketCheck,
  Network,
  UserCog,
  Bot,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Shield,
  Wifi
} from "lucide-react";

const navItems = [
  { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { name: "Customers", page: "Customers", icon: Users },
  { name: "Billing", page: "Billing", icon: Receipt },
  { name: "Tickets", page: "Tickets", icon: TicketCheck },
  { name: "Network", page: "Network", icon: Network },
  { name: "Employees", page: "Employees", icon: UserCog },
  { name: "AI Assistant", page: "AIAssistant", icon: Bot },
];

export default function Layout({ children, currentPageName }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <style>{`
        :root {
          --tn-primary: #0f172a;
          --tn-accent: #3b82f6;
          --tn-accent-light: #60a5fa;
          --tn-surface: #f8fafc;
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .tn-sidebar { scrollbar-width: none; }
        .tn-sidebar::-webkit-scrollbar { display: none; }
        .nav-item-active { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
      `}</style>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${collapsed ? 'w-20' : 'w-72'} 
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-[#0f172a] text-white flex flex-col
        transition-all duration-300 ease-in-out
      `}>
        {/* Logo */}
        <div className={`flex items-center ${collapsed ? 'justify-center px-2' : 'px-6'} h-20 border-b border-white/10 flex-shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold tracking-tight">TouchNet</h1>
                <p className="text-[10px] text-blue-300 font-medium tracking-widest uppercase">ISP Platform</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto p-1 text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto tn-sidebar py-6 px-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            const Icon = item.icon;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200 group
                  ${isActive
                    ? 'nav-item-active text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }
                  ${collapsed ? 'justify-center px-3' : ''}
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse button (desktop only) */}
        <div className="hidden lg:flex p-4 border-t border-white/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition-all"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
          </button>
        </div>

        {/* Security badge */}
        {!collapsed && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-300 font-medium">System Secured</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-8 flex-shrink-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -ml-2 mr-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{currentPageName === "AIAssistant" ? "AI Assistant" : currentPageName}</h2>
            <p className="text-xs text-slate-400 hidden sm:block">TouchNet Telecommunications Management</p>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}