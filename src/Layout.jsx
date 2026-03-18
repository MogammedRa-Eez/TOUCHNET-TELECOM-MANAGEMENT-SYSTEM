import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  LayoutDashboard, Users, Receipt, TicketCheck, Network, UserCog,
  Bot, Shield, Package, Settings, Mail, HeartHandshake,
  ChevronRight, Home, Play, FileText, Bell, X, Menu, Activity,
  Sparkles
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
      { name: "Home",       page: "Home",      icon: Home,             perm: null },
      { name: "Dashboard",  page: "Dashboard", icon: LayoutDashboard,  perm: "dashboard" },
    ]
  },
  {
    label: "Business",
    items: [
      { name: "Customers",      page: "Customers",     icon: Users,        perm: "customers" },
      { name: "Billing",        page: "Billing",       icon: Receipt,      perm: "billing" },
      { name: "Quotes",         page: "Quotes",        icon: FileText,     perm: "customers" },
      { name: "Tickets",        page: "Tickets",       icon: TicketCheck,  perm: "tickets" },
      { name: "Fibre Projects", page: "FibreProjects", icon: Network,      perm: "projects" },
    ]
  },
  {
    label: "Infrastructure",
    items: [
      { name: "Network",   page: "Network",   icon: Activity, perm: "network" },
      { name: "Inventory", page: "Inventory", icon: Package,  perm: "network" },
    ]
  },
  {
    label: "Team",
    items: [
      { name: "Employees",     page: "Employees",           icon: UserCog,        perm: "employees" },
      { name: "HR Dashboard",  page: "HRDashboard",         icon: HeartHandshake, perm: "employees" },
      { name: "My Department", page: "DepartmentDashboard", icon: LayoutDashboard,perm: null },
    ]
  },
  {
    label: "Tools",
    items: [
      { name: "Outlook",      page: "OutlookMail",  icon: Mail,    perm: "outlook" },
      { name: "AI Assistant", page: "AIAssistant",  icon: Bot,     perm: "ai_assistant" },
      { name: "System Demo",  page: "SystemDemo",   icon: Play,    perm: null },
    ]
  },
  {
    label: "Admin",
    items: [
      { name: "Roles",         page: "RolesManagement",     icon: Shield,   perm: "roles_management" },
      { name: "Notifications", page: "NotificationSettings", icon: Bell,    perm: "roles_management" },
      { name: "Settings",      page: "UserSettings",         icon: Settings, perm: null },
    ]
  },
];

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

function Sidebar({ currentPageName, open, onClose, can, loading }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          width: 252,
          background: "linear-gradient(170deg, #080613 0%, #0d0a1e 55%, #100c22 100%)",
          borderRight: "1px solid rgba(139,92,246,0.14)",
          flexShrink: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Ambient glow orbs */}
        <div style={{
          position: "absolute", top: -80, left: -50, width: 240, height: 240,
          background: "radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: 80, right: -60, width: 180, height: 180,
          background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: -30, width: 120, height: 120,
          background: "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div
          className="flex items-center justify-between px-5 h-[64px] flex-shrink-0"
          style={{
            borderBottom: "1px solid rgba(139,92,246,0.18)",
            background: "rgba(139,92,246,0.07)",
            position: "relative", zIndex: 1,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 0 12px rgba(139,92,246,0.5)" }}>
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <img src={LOGO_URL} alt="TouchNet" className="h-6 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "#a78bfa" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6 sidebar-scroll" style={{ position: "relative", zIndex: 1 }}>
          {NAV_GROUPS.map(group => {
            const visibleItems = loading ? group.items : group.items.filter(i => i.perm === null || can(i.perm));
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label}>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.16em] px-2.5 mb-2"
                  style={{ color: "rgba(167,139,250,0.38)" }}
                >
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
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150"
                        style={isActive ? {
                          background: "rgba(139,92,246,0.16)",
                          color: "#ddd6fe",
                          border: "1px solid rgba(139,92,246,0.32)",
                          boxShadow: "0 0 16px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.04)",
                        } : {
                          color: "#6b7280",
                          border: "1px solid transparent",
                        }}
                      >
                        <Icon
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: isActive ? "#a78bfa" : "#374151" }}
                        />
                        <span className="flex-1 truncate">{item.name}</span>
                        {isActive && <ChevronRight className="w-3 h-3 opacity-50" style={{ color: "#a78bfa" }} />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Status strip */}
        <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(139,92,246,0.12)", position: "relative", zIndex: 1 }}>
          <div
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
            style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)" }}
          >
            <span
              className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"
              style={{ boxShadow: "0 0 8px rgba(52,211,153,1), 0 0 2px rgba(52,211,153,1)" }}
            />
            <span className="text-[11px] font-semibold" style={{ color: "#6ee7b7" }}>All Systems Operational</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function LayoutInner({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { can, loading } = useRBAC();

  const allItems = NAV_GROUPS.flatMap(g => g.items);
  const currentItem = allItems.find(i => i.page === currentPageName);
  const CurrentIcon = currentItem?.icon;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#080613" }}>
      <style>{`
        * { box-sizing: border-box; }
        .mono { font-family: 'JetBrains Mono', monospace !important; }

        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.2); border-radius: 3px; }

        .content-scroll::-webkit-scrollbar { width: 6px; }
        .content-scroll::-webkit-scrollbar-track { background: transparent; }
        .content-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.18); border-radius: 6px; }
        .content-scroll::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.32); }

        .top-bar {
          background: rgba(255,255,255,0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(139,92,246,0.1);
          box-shadow: 0 1px 0 rgba(139,92,246,0.06);
          position: relative;
        }
        .top-bar::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #7c3aed 0%, #a855f7 28%, #ec4899 60%, #06b6d4 100%);
        }

        .page-bg {
          background-color: #f7f5ff;
          background-image:
            radial-gradient(circle at 20% 20%, rgba(124,58,237,0.04) 0%, transparent 50%),
            radial-gradient(circle, rgba(139,92,246,0.06) 1px, transparent 1px);
          background-size: 100% 100%, 28px 28px;
        }
      `}</style>

      <Sidebar
        currentPageName={currentPageName}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        can={can}
        loading={loading}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="top-bar h-[60px] flex items-center px-5 gap-4 flex-shrink-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">TouchNet</span>
            {currentItem && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <div className="flex items-center gap-1.5">
                  {CurrentIcon && (
                    <CurrentIcon className="w-3.5 h-3.5" style={{ color: "#7c3aed" }} />
                  )}
                  <span className="text-sm font-bold text-slate-700">{currentItem.name}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <GlobalSearch />
            <DemoUserSwitcher />
            <NotificationBell />
            <div className="w-px h-5" style={{ background: "rgba(139,92,246,0.2)" }} />
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