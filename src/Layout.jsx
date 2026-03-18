import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  LayoutDashboard, Users, Receipt, TicketCheck, Network, UserCog,
  Bot, Shield, Package, Settings, Mail, HeartHandshake,
  ChevronRight, Home, Play, FileText, Bell, X, Menu,
  ChevronDown, Activity
} from "lucide-react";
import { RBACProvider, useRBAC } from "@/components/rbac/RBACContext";
import UserMenu from "@/components/layout/UserMenu";
import NotificationBell from "@/components/notifications/NotificationBell";
import DemoUserSwitcher from "@/components/layout/DemoUserSwitcher";
import GlobalSearch from "@/components/layout/GlobalSearch";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { name: "Home",       page: "Home",      icon: Home,            perm: null },
      { name: "Dashboard",  page: "Dashboard", icon: LayoutDashboard, perm: "dashboard" },
    ]
  },
  {
    label: "Business",
    items: [
      { name: "Customers",      page: "Customers",    icon: Users,       perm: "customers" },
      { name: "Billing",        page: "Billing",      icon: Receipt,     perm: "billing" },
      { name: "Quotes",         page: "Quotes",       icon: FileText,    perm: "customers" },
      { name: "Tickets",        page: "Tickets",      icon: TicketCheck, perm: "tickets" },
      { name: "Fibre Projects", page: "FibreProjects",icon: Network,     perm: "projects" },
    ]
  },
  {
    label: "Infrastructure",
    items: [
      { name: "Network",    page: "Network",    icon: Activity, perm: "network" },
      { name: "Inventory",  page: "Inventory",  icon: Package,  perm: "network" },
    ]
  },
  {
    label: "Team",
    items: [
      { name: "Employees",      page: "Employees",          icon: UserCog,       perm: "employees" },
      { name: "HR Dashboard",   page: "HRDashboard",        icon: HeartHandshake,perm: "employees" },
      { name: "My Department",  page: "DepartmentDashboard",icon: LayoutDashboard,perm: null },
    ]
  },
  {
    label: "Tools",
    items: [
      { name: "Outlook",     page: "OutlookMail",       icon: Mail,    perm: "outlook" },
      { name: "AI Assistant",page: "AIAssistant",       icon: Bot,     perm: "ai_assistant" },
      { name: "System Demo", page: "SystemDemo",        icon: Play,    perm: null },
    ]
  },
  {
    label: "Admin",
    items: [
      { name: "Roles",         page: "RolesManagement",    icon: Shield,   perm: "roles_management" },
      { name: "Notifications", page: "NotificationSettings",icon: Bell,    perm: "roles_management" },
      { name: "Settings",      page: "UserSettings",       icon: Settings, perm: null },
    ]
  },
];

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

function Sidebar({ currentPageName, open, onClose, can, loading }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          width: 240,
          background: "#0f172a",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="TouchNet" className="h-7 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 sidebar-scroll">
          {NAV_GROUPS.map(group => {
            const visibleItems = loading ? group.items : group.items.filter(i => i.perm === null || can(i.perm));
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label}>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] px-2 mb-2" style={{ color: "rgba(148,163,184,0.45)" }}>
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {visibleItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentPageName === item.page;
                    return (
                      <Link
                        key={item.page}
                        to={createPageUrl(item.page)}
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group"
                        style={isActive
                          ? { background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)" }
                          : { color: "#94a3b8", border: "1px solid transparent" }
                        }
                      >
                        <Icon
                          className="w-4 h-4 flex-shrink-0 transition-colors"
                          style={{ color: isActive ? "#818cf8" : "#475569" }}
                        />
                        <span className="flex-1 truncate">{item.name}</span>
                        {isActive && <ChevronRight className="w-3 h-3 opacity-60" style={{ color: "#818cf8" }} />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom status */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.7)" }} />
            <span className="text-[11px] font-semibold" style={{ color: "#475569" }}>All Systems Operational</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function LayoutInner({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { can, loading } = useRBAC();

  // Find current page label for breadcrumb
  const allItems = NAV_GROUPS.flatMap(g => g.items);
  const currentItem = allItems.find(i => i.page === currentPageName);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f8fafc" }}>
      <style>{`
        * { box-sizing: border-box; }
        .mono { font-family: 'JetBrains Mono', monospace !important; }

        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }

        .content-scroll::-webkit-scrollbar { width: 6px; }
        .content-scroll::-webkit-scrollbar-track { background: transparent; }
        .content-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 6px; }
        .content-scroll::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.35); }

        .top-bar {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(226,232,240,0.8);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .page-bg {
          background: #f1f5f9;
        }
      `}</style>

      {/* Sidebar */}
      <Sidebar
        currentPageName={currentPageName}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        can={can}
        loading={loading}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="top-bar h-[60px] flex items-center px-5 gap-4 flex-shrink-0 z-30">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-slate-400">TouchNet</span>
            {currentItem && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="font-semibold text-slate-700">{currentItem.name}</span>
              </>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <GlobalSearch />
            <DemoUserSwitcher />
            <NotificationBell />
            <div className="w-px h-5 bg-slate-200" />
            <UserMenu />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto content-scroll page-bg">
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