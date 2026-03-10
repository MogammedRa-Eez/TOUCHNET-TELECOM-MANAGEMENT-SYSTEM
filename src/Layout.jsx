import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  LayoutDashboard, Users, Receipt, TicketCheck, Network, UserCog,
  Bot, Shield, Package, Settings, Mail, HeartHandshake, Menu, X,
  ChevronDown, Home
} from "lucide-react";
import { RBACProvider, useRBAC } from "@/components/rbac/RBACContext";
import UserMenu from "@/components/layout/UserMenu";
import NotificationBell from "@/components/notifications/NotificationBell";
import DemoUserSwitcher from "@/components/layout/DemoUserSwitcher";
import GlobalSearch from "@/components/layout/GlobalSearch";

const NAV_TOP = [
  { name: "Home",          page: "Home",            icon: Home,            perm: null },
  { name: "Dashboard",     page: "Dashboard",       icon: LayoutDashboard, perm: "dashboard" },
  { name: "Customers",     page: "Customers",       icon: Users,           perm: "customers" },
  { name: "Billing",       page: "Billing",         icon: Receipt,         perm: "billing" },
  { name: "Tickets",       page: "Tickets",         icon: TicketCheck,     perm: "tickets" },
];

const NAV_MORE = [
  { name: "Network",        page: "Network",         icon: Network,         perm: "network" },
  { name: "Inventory",      page: "Inventory",       icon: Package,         perm: "network" },
  { name: "Fibre Projects", page: "FibreProjects",   icon: Network,         perm: "projects" },
  { name: "Employees",      page: "Employees",       icon: UserCog,         perm: "employees" },
  { name: "HR Dashboard",   page: "HRDashboard",     icon: HeartHandshake,  perm: "employees" },
  { name: "Outlook",        page: "OutlookMail",     icon: Mail,            perm: "outlook" },
  { name: "AI Assistant",   page: "AIAssistant",     icon: Bot,             perm: "ai_assistant" },
  { name: "Roles",          page: "RolesManagement", icon: Shield,          perm: "roles_management" },
  { name: "Settings",       page: "UserSettings",    icon: Settings,        perm: null },
];

const ALL_NAV = [...NAV_TOP, ...NAV_MORE];
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

function MoreDropdown({ currentPageName, can, loading }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const items = loading ? NAV_MORE : NAV_MORE.filter(i => i.perm === null || can(i.perm));
  const hasActive = items.some(i => i.page === currentPageName);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-150 ${hasActive || open ? "nav-pill-active" : "nav-pill-hover"}`}
        style={!(hasActive || open) ? { color: "rgba(30,41,59,0.55)", border: "1px solid transparent" } : {}}
      >
        More
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute top-full mt-2 right-0 w-52 rounded-xl overflow-hidden z-50"
          style={{
            background: "rgba(255,255,255,0.98)",
            border: "1px solid rgba(99,102,241,0.15)",
            boxShadow: "0 4px 24px rgba(99,102,241,0.12), 0 20px 48px rgba(0,0,0,0.08)",
            backdropFilter: "blur(24px)",
          }}
        >
          <div className="p-1.5">
            {items.map(item => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150"
                  style={isActive
                    ? { background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.25)" }
                    : { color: "rgba(30,41,59,0.65)", border: "1px solid transparent" }
                  }
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: isActive ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.05)", border: `1px solid ${isActive ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.08)"}` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: isActive ? "#6366f1" : "rgba(30,41,59,0.4)" }} />
                  </div>
                  {item.name}
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#6366f1", boxShadow: "0 0 6px rgba(99,102,241,0.5)" }} />}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileDrawer({ currentPageName, open, onClose, can, loading }) {
  const items = loading ? ALL_NAV : ALL_NAV.filter(i => i.perm === null || can(i.perm));
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />}
      <div
        className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "rgba(255,255,255,0.98)", borderRight: "1px solid rgba(99,102,241,0.12)", boxShadow: "8px 0 48px rgba(99,102,241,0.1)" }}
      >
        <div className="flex items-center justify-between px-5 h-16" style={{ borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
          <img src={LOGO_URL} alt="TouchNet" className="h-7 object-contain" style={{ filter: "brightness(0)" }} />
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.06)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {items.map(item => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150"
                style={isActive
                  ? { background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.25)" }
                  : { color: "rgba(30,41,59,0.65)", border: "1px solid transparent" }
                }
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: isActive ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.05)", border: `1px solid ${isActive ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.08)"}` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: isActive ? "#6366f1" : "rgba(30,41,59,0.4)" }} />
                </div>
                {item.name}
                {isActive && <div className="ml-auto w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg,#6366f1,#8b5cf6)", boxShadow: "0 0 8px rgba(99,102,241,0.35)" }} />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4" style={{ borderTop: "1px solid rgba(99,102,241,0.08)" }}>
          <p className="text-[9px] mono tracking-widest text-center" style={{ color: "rgba(99,102,241,0.4)" }}>TOUCHNET · NOVA AI</p>
        </div>
      </div>
    </>
  );
}

function LayoutInner({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { can, loading } = useRBAC();
  const topItems = loading ? NAV_TOP : NAV_TOP.filter(i => i.perm === null || can(i.perm));

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#f0f3ff" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        .mono { font-family: 'JetBrains Mono', monospace !important; }

        .op-scroll::-webkit-scrollbar { width: 4px; }
        .op-scroll::-webkit-scrollbar-track { background: transparent; }
        .op-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 4px; }
        .op-scroll::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.4); }

        /* Light futuristic AI background */
        .page-bg {
          background-color: #f0f3ff;
          background-image:
            radial-gradient(ellipse 80% 50% at 10% 5%,  rgba(99,102,241,0.1)  0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 90%, rgba(6,182,212,0.07)  0%, transparent 55%),
            radial-gradient(ellipse 55% 35% at 55% 10%, rgba(139,92,246,0.07) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 20% 80%, rgba(59,130,246,0.05) 0%, transparent 50%),
            radial-gradient(circle, rgba(99,102,241,0.07) 1px, transparent 1px),
            radial-gradient(circle, rgba(139,92,246,0.04) 1px, transparent 1px);
          background-size: auto, auto, auto, auto, 48px 48px, 23px 23px;
          background-position: 0 0, 0 0, 0 0, 0 0, 7px 13px, 19px 5px;
        }

        /* Frosted glass nav */
        .op-topbar {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(99,102,241,0.1);
          box-shadow: 0 1px 0 rgba(99,102,241,0.05), 0 4px 24px rgba(99,102,241,0.06);
        }

        .nav-pill-active {
          background: rgba(99,102,241,0.1) !important;
          color: #6366f1 !important;
          border: 1px solid rgba(99,102,241,0.28) !important;
          box-shadow: 0 0 12px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.9);
        }
        .nav-pill-hover:hover {
          background: rgba(99,102,241,0.06) !important;
          color: #1e293b !important;
        }

        .pulse-dot { animation: op-pulse 2.5s infinite; }
        @keyframes op-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(6,182,212,0.5); }
          50%      { box-shadow: 0 0 0 5px rgba(6,182,212,0); }
        }
      `}</style>

      {/* ── TOP NAV BAR ── */}
      <header className="op-topbar h-[60px] flex items-center px-4 lg:px-6 z-30 flex-shrink-0 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.06)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        <Link to={createPageUrl("Home")} className="flex items-center gap-2.5 flex-shrink-0 mr-2">
          <img src={LOGO_URL} alt="TouchNet" className="h-7 object-contain" style={{ filter: "brightness(0)" }} />
        </Link>

        <div className="hidden xl:block w-px h-5 mx-1" style={{ background: "linear-gradient(180deg, transparent, rgba(99,102,241,0.3), transparent)" }} />

        <div
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold mono flex-shrink-0"
          style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", color: "#0891b2" }}
        >
          <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#06b6d4" }} />
          SYS·LIVE
        </div>

        <nav className="hidden lg:flex items-center gap-0.5 flex-1 mx-2">
          {topItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-150 nav-pill-hover ${isActive ? "nav-pill-active" : ""}`}
                style={!isActive ? { color: "rgba(30,41,59,0.55)", border: "1px solid transparent" } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.name}
              </Link>
            );
          })}
          <MoreDropdown currentPageName={currentPageName} can={can} loading={loading} />
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <GlobalSearch />
          <DemoUserSwitcher />
          <NotificationBell />
          <UserMenu />
        </div>
      </header>

      <MobileDrawer
        currentPageName={currentPageName}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        can={can}
        loading={loading}
      />

      <main className="flex-1 overflow-y-auto op-scroll page-bg">
        {children}
      </main>
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