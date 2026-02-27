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
  Wifi,
  ChevronRight,
  Bell,
  Search,
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

const pageLabels = {
  AIAssistant: "AI Assistant",
};

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageLabel = pageLabels[currentPageName] || currentPageName;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f0f4f8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .tn-sidebar { scrollbar-width: none; }
        .tn-sidebar::-webkit-scrollbar { display: none; }
        .nav-glow:hover { box-shadow: 0 0 0 1px rgba(99,102,241,0.3), 0 4px 12px rgba(99,102,241,0.15); }
        .nav-active-glow { box-shadow: 0 0 0 1px rgba(99,102,241,0.4), 0 4px 16px rgba(99,102,241,0.25); }
      `}</style>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex flex-col transition-transform duration-300 ease-in-out
      `} style={{ background: "linear-gradient(180deg, #1e1b4b 0%, #1a1744 50%, #161240 100%)" }}>

        {/* Logo area */}
        <div className="flex items-center justify-between px-5 h-[70px] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <Wifi className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-[15px] leading-tight tracking-tight">TouchNet</h1>
              <p className="text-indigo-300/70 text-[10px] font-medium tracking-widest uppercase">Telecom Suite</p>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-white/50 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav label */}
        <div className="px-5 pb-2 pt-1">
          <p className="text-[10px] font-semibold text-indigo-300/40 tracking-widest uppercase">Main Menu</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto tn-sidebar px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            const Icon = item.icon;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group relative
                  ${isActive
                    ? "text-white nav-active-glow"
                    : "text-indigo-200/50 hover:text-indigo-100 nav-glow"
                  }
                `}
                style={isActive ? { background: "linear-gradient(135deg, rgba(99,102,241,0.9) 0%, rgba(139,92,246,0.85) 100%)" } : {}}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-white/80" />
                )}
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? "text-white" : "text-indigo-300/50 group-hover:text-indigo-300"}`} />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/60" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-4 py-5 flex-shrink-0">
          <div className="rounded-2xl p-4" style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 text-xs font-semibold">All Systems Operational</span>
            </div>
            <p className="text-indigo-300/50 text-[11px]">Network uptime: 99.9%</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-[70px] flex items-center px-4 lg:px-7 flex-shrink-0 z-30 gap-4" style={{ background: "#f0f4f8" }}>
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:bg-white rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <h2 className="text-[17px] font-bold text-slate-800 leading-tight">{pageLabel}</h2>
            <p className="text-xs text-slate-400 hidden sm:block">TouchNet Telecommunications</p>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center gap-2 bg-white rounded-xl px-3.5 py-2 border border-slate-200/80 shadow-sm w-56">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-sm text-slate-400">Search...</span>
          </div>

          {/* Notification bell */}
          <button className="relative w-9 h-9 flex items-center justify-center bg-white rounded-xl border border-slate-200/80 shadow-sm text-slate-500 hover:text-slate-700 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}