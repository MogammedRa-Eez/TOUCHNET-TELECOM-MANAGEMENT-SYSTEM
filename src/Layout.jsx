import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  LayoutDashboard, Users, Receipt, TicketCheck, Network, UserCog,
  Bot, Shield, Package, Settings, Mail, HeartHandshake,
  ChevronRight, Home, Play, FileText, Bell, X, Menu, Activity,
  Cpu
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
      { name: "Outlook",        page: "OutlookMail",      icon: Mail,          perm: "outlook" },
      { name: "AI Assistant",   page: "AIAssistant",      icon: Bot,           perm: "ai_assistant" },
      { name: "Customer Portal",page: "CustomerPortalMain",icon: HeartHandshake,perm: null },
      { name: "System Demo",    page: "SystemDemo",       icon: Play,          perm: null },
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

// Animated scan line ticker
function ScanLine() {
  const [pos, setPos] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPos(p => (p + 1) % 100), 30);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, top: `${pos}%`,
      height: 1,
      background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.25), transparent)",
      pointerEvents: "none",
      transition: "top 0.03s linear",
    }} />
  );
}

function Sidebar({ currentPageName, open, onClose, can, loading }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,10,0.85)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          width: 256,
          background: "linear-gradient(175deg, #010b12 0%, #030e17 45%, #020a14 100%)",
          borderRight: "1px solid rgba(6,182,212,0.18)",
          flexShrink: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }} />

        {/* Glow orbs */}
        <div style={{ position: "absolute", top: -60, left: -40, width: 220, height: 220, background: "radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 100, right: -60, width: 160, height: 160, background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Scan line */}
        <ScanLine />

        {/* Logo header */}
        <div
          className="flex items-center justify-between px-5 h-[64px] flex-shrink-0"
          style={{
            borderBottom: "1px solid rgba(6,182,212,0.2)",
            background: "rgba(6,182,212,0.06)",
            position: "relative", zIndex: 2,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.05))",
                border: "1px solid rgba(6,182,212,0.4)",
                boxShadow: "0 0 16px rgba(6,182,212,0.3), inset 0 0 8px rgba(6,182,212,0.1)",
              }}
            >
              <Cpu className="w-4 h-4" style={{ color: "#06b6d4" }} />
            </div>
            <img src={LOGO_URL} alt="TouchNet" className="h-5 object-contain" style={{ filter: "brightness(0) invert(1)", opacity: 0.9 }} />
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded transition-colors"
            style={{ color: "#06b6d4", border: "1px solid rgba(6,182,212,0.2)" }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5 px-2.5 space-y-5 sidebar-scroll" style={{ position: "relative", zIndex: 2 }}>
          {NAV_GROUPS.map(group => {
            const visibleItems = loading ? group.items : group.items.filter(i => i.perm === null || can(i.perm));
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label}>
                <div className="flex items-center gap-2 px-2 mb-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(6,182,212,0.4)" }}>
                    {group.label}
                  </p>
                  <div className="flex-1 h-px" style={{ background: "rgba(6,182,212,0.1)" }} />
                </div>
                <div className="space-y-0.5">
                  {visibleItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentPageName === item.page;
                    return (
                      <Link
                        key={item.page}
                        to={createPageUrl(item.page)}
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium transition-all duration-150 group"
                        style={{
                          borderRadius: 8,
                          ...(isActive ? {
                            background: "rgba(6,182,212,0.1)",
                            color: "#22d3ee",
                            border: "1px solid rgba(6,182,212,0.3)",
                            boxShadow: "0 0 20px rgba(6,182,212,0.1), inset 0 0 12px rgba(6,182,212,0.06)",
                          } : {
                            color: "#334155",
                            border: "1px solid transparent",
                          })
                        }}
                      >
                        {/* Active indicator bar */}
                        {isActive && (
                          <span style={{
                            position: "absolute",
                            left: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 2,
                            height: "60%",
                            background: "#06b6d4",
                            borderRadius: "0 2px 2px 0",
                            boxShadow: "0 0 8px rgba(6,182,212,0.8)",
                          }} />
                        )}
                        <Icon
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: isActive ? "#06b6d4" : "#1e3a4f" }}
                        />
                        <span className="flex-1 truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{item.name}</span>
                        {isActive && (
                          <span style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: "#06b6d4",
                            boxShadow: "0 0 8px rgba(6,182,212,1)",
                            flexShrink: 0,
                          }} />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Status */}
        <div className="px-3 pb-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(6,182,212,0.1)", paddingTop: 12, position: "relative", zIndex: 2 }}>
          <div style={{
            background: "rgba(6,182,212,0.05)",
            border: "1px solid rgba(6,182,212,0.2)",
            borderRadius: 8,
            padding: "8px 12px",
          }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(6,182,212,0.5)" }}>System Status</span>
              <span className="text-[10px] font-bold" style={{ color: "#06b6d4" }}>ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,1)" }} />
              <span className="text-[11px]" style={{ color: "#6ee7b7", fontFamily: "'JetBrains Mono', monospace" }}>ALL SYSTEMS NOMINAL</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function LayoutInner({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const { can, loading } = useRBAC();

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const allItems = NAV_GROUPS.flatMap(g => g.items);
  const currentItem = allItems.find(i => i.page === currentPageName);
  const CurrentIcon = currentItem?.icon;
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f0f7ff" }}>
      <style>{`
        * { box-sizing: border-box; }

        body { font-family: 'Outfit', sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace !important; }
        .heading { font-family: 'Space Grotesk', sans-serif !important; }

        .sidebar-scroll::-webkit-scrollbar { width: 2px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(6,182,212,0.3); border-radius: 2px; }

        .content-scroll::-webkit-scrollbar { width: 5px; }
        .content-scroll::-webkit-scrollbar-track { background: transparent; }
        .content-scroll::-webkit-scrollbar-thumb { background: rgba(6,182,212,0.2); border-radius: 5px; }
        .content-scroll::-webkit-scrollbar-thumb:hover { background: rgba(6,182,212,0.4); }

        /* Top bar */
        .top-bar {
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(6,182,212,0.15);
          box-shadow: 0 1px 0 rgba(6,182,212,0.08), 0 4px 24px rgba(6,182,212,0.05);
          position: relative;
        }
        .top-bar::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #06b6d4 0%, #22d3ee 30%, #818cf8 60%, #ec4899 85%, #f59e0b 100%);
          box-shadow: 0 0 12px rgba(6,182,212,0.5);
        }

        /* Page background */
        .page-bg {
          background-color: #f0f9ff;
          background-image:
            radial-gradient(circle at 10% 10%, rgba(6,182,212,0.06) 0%, transparent 45%),
            radial-gradient(circle at 90% 90%, rgba(99,102,241,0.05) 0%, transparent 45%),
            linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px);
          background-size: auto, auto, 40px 40px, 40px 40px;
        }

        /* HUD corner bracket decoration */
        .hud-bracket {
          position: absolute;
          width: 8px; height: 8px;
          border-color: rgba(6,182,212,0.4);
          border-style: solid;
        }
        .hud-tl { top: 4px; left: 4px; border-width: 1px 0 0 1px; }
        .hud-tr { top: 4px; right: 4px; border-width: 1px 1px 0 0; }
        .hud-bl { bottom: 4px; left: 4px; border-width: 0 0 1px 1px; }
        .hud-br { bottom: 4px; right: 4px; border-width: 0 1px 1px 0; }

        /* Neon active nav item absolute bar */
        .nav-item-wrap { position: relative; }
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

          {/* Breadcrumb with HUD style */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest mono" style={{ color: "#06b6d4", opacity: 0.6 }}>TN://</span>
            {currentItem && (
              <div className="flex items-center gap-1.5">
                {CurrentIcon && <CurrentIcon className="w-3.5 h-3.5" style={{ color: "#06b6d4" }} />}
                <span className="text-sm font-bold tracking-tight text-slate-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {currentItem.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* Live clock */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded"
            style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px rgba(52,211,153,1)" }} />
            <span className="mono text-[11px] font-semibold" style={{ color: "#06b6d4" }}>{timeStr}</span>
          </div>

          <div className="flex items-center gap-2">
            <GlobalSearch />
            <DemoUserSwitcher />
            <NotificationBell />
            <div className="w-px h-5" style={{ background: "rgba(6,182,212,0.2)" }} />
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