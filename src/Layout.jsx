import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  LayoutDashboard, Users, Receipt, TicketCheck, Network, UserCog,
  Bot, Shield, Package, Settings, Mail, HeartHandshake, Menu, X,
  ChevronDown, Zap, Bell, Search, Home
} from "lucide-react";
import { RBACProvider, useRBAC } from "@/components/rbac/RBACContext";
import UserMenu from "@/components/layout/UserMenu";
import NotificationBell from "@/components/notifications/NotificationBell";
import DemoUserSwitcher from "@/components/layout/DemoUserSwitcher";
import GlobalSearch from "@/components/layout/GlobalSearch";

const NAV_TOP = [
  { name: "Home",          page: "Home",            icon: Home,          perm: null },
  { name: "Dashboard",     page: "Dashboard",       icon: LayoutDashboard, perm: "dashboard" },
  { name: "Customers",     page: "Customers",       icon: Users,         perm: "customers" },
  { name: "Billing",       page: "Billing",         icon: Receipt,       perm: "billing" },
  { name: "Tickets",       page: "Tickets",         icon: TicketCheck,   perm: "tickets" },
];

const NAV_MORE = [
  { name: "Network",       page: "Network",         icon: Network,       perm: "network" },
  { name: "Inventory",     page: "Inventory",       icon: Package,       perm: "network" },
  { name: "Fibre Projects",page: "FibreProjects",   icon: Network,       perm: "projects" },
  { name: "Employees",     page: "Employees",       icon: UserCog,       perm: "employees" },
  { name: "HR Dashboard",  page: "HRDashboard",     icon: HeartHandshake,perm: "employees" },
  { name: "Outlook",       page: "OutlookMail",     icon: Mail,          perm: "outlook" },
  { name: "AI Assistant",  page: "AIAssistant",     icon: Bot,           perm: "ai_assistant" },
  { name: "Roles",         page: "RolesManagement", icon: Shield,        perm: "roles_management" },
  { name: "Settings",      page: "UserSettings",    icon: Settings,      perm: null },
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
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold transition-all duration-150 ${hasActive || open ? "nav-pill-active" : "nav-pill-hover"}`}
        style={!(hasActive || open) ? { color: "rgba(148,163,184,0.8)", border: "1px solid transparent" } : {}}
      >
        More
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute top-full mt-2 right-0 w-52 rounded-2xl overflow-hidden z-50"
          style={{
            background: "rgba(5,5,20,0.97)",
            border: "1px solid rgba(0,255,247,0.18)",
            boxShadow: "0 0 40px rgba(0,255,247,0.1), 0 20px 60px rgba(0,0,0,0.8)",
            backdropFilter: "blur(24px)"
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150"
                  style={isActive
                    ? { background: "rgba(0,255,247,0.1)", color: "#00fff7", border: "1px solid rgba(0,255,247,0.2)", textShadow: "0 0 6px rgba(0,255,247,0.5)" }
                    : { color: "rgba(148,163,184,0.8)" }
                  }
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: isActive ? "rgba(0,255,247,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${isActive ? "rgba(0,255,247,0.25)" : "rgba(255,255,255,0.06)"}` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: isActive ? "#00fff7" : "rgba(148,163,184,0.6)" }} />
                  </div>
                  {item.name}
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#00fff7", boxShadow: "0 0 6px #00fff7" }} />}
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
      {open && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />}
      <div
        className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "rgba(5,5,18,0.98)", borderRight: "1px solid rgba(0,255,247,0.15)", boxShadow: "8px 0 60px rgba(0,255,247,0.08), 0 0 40px rgba(0,0,0,0.8)" }}
      >
        <div className="flex items-center justify-between px-5 h-16" style={{ borderBottom: "1px solid rgba(0,255,247,0.1)" }}>
          <img src={LOGO_URL} alt="TouchNet" className="h-7 object-contain" style={{ filter: "brightness(0) invert(1) drop-shadow(0 0 6px rgba(0,255,247,0.6))" }} />
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors" style={{ color: "rgba(0,255,247,0.6)", border: "1px solid rgba(0,255,247,0.15)" }}>
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
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150"
                style={isActive
                  ? { background: "rgba(0,255,247,0.08)", color: "#00fff7", border: "1px solid rgba(0,255,247,0.2)", textShadow: "0 0 6px rgba(0,255,247,0.4)" }
                  : { color: "rgba(148,163,184,0.7)" }
                }
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: isActive ? "rgba(0,255,247,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${isActive ? "rgba(0,255,247,0.2)" : "rgba(255,255,255,0.05)"}` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: isActive ? "#00fff7" : "rgba(148,163,184,0.5)" }} />
                </div>
                {item.name}
                {isActive && <div className="ml-auto w-1 h-4 rounded-full" style={{ background: "#00fff7", boxShadow: "0 0 8px #00fff7" }} />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4" style={{ borderTop: "1px solid rgba(0,255,247,0.08)" }}>
          <p className="text-[9px] mono tracking-widest text-center" style={{ color: "rgba(0,255,247,0.3)" }}>TOUCHNET PLATFORM v2.4.1</p>
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
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#050510" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        .mono { font-family: 'JetBrains Mono', monospace !important; }

        .tn-scroll::-webkit-scrollbar { width: 4px; }
        .tn-scroll::-webkit-scrollbar-track { background: transparent; }
        .tn-scroll::-webkit-scrollbar-thumb { background: rgba(0,255,247,0.2); border-radius: 4px; }

        .page-bg {
          background: #050510;
          background-image:
            radial-gradient(ellipse 80% 50% at 10% 0%, rgba(0,255,247,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 100%, rgba(255,0,200,0.05) 0%, transparent 60%),
            repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,255,247,0.015) 40px, rgba(0,255,247,0.015) 41px),
            repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,255,247,0.015) 40px, rgba(0,255,247,0.015) 41px);
        }

        .neon-topbar {
          background: rgba(5, 5, 18, 0.95);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(0,255,247,0.12);
          box-shadow: 0 0 40px rgba(0,255,247,0.05), 0 1px 0 rgba(0,255,247,0.08);
        }

        .nav-pill-active {
          background: rgba(0,255,247,0.12) !important;
          color: #00fff7 !important;
          border: 1px solid rgba(0,255,247,0.35) !important;
          box-shadow: 0 0 16px rgba(0,255,247,0.2), inset 0 0 8px rgba(0,255,247,0.05);
          text-shadow: 0 0 8px rgba(0,255,247,0.6);
        }

        .nav-pill-hover:hover {
          background: rgba(255,255,255,0.05) !important;
          color: rgba(255,255,255,0.9) !important;
        }

        .pulse-dot { animation: neon-pulse 2s infinite; }
        @keyframes neon-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(0,255,136,0.6); }
          50%      { box-shadow: 0 0 0 5px rgba(0,255,136,0); }
        }

        /* Neon scrollbar for page */
        .page-bg::-webkit-scrollbar { width: 4px; }
        .page-bg::-webkit-scrollbar-thumb { background: rgba(0,255,247,0.2); border-radius: 4px; }
      `}</style>

      {/* ── TOP NAV BAR ── */}
      <header className="neon-topbar h-[60px] flex items-center px-4 lg:px-6 z-30 flex-shrink-0 gap-3">
        {/* Mobile menu */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
          style={{ color: "rgba(0,255,247,0.7)", border: "1px solid rgba(0,255,247,0.15)" }}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo */}
        <Link to={createPageUrl("Home")} className="flex items-center gap-2.5 flex-shrink-0 mr-2">
          <img src={LOGO_URL} alt="TouchNet" className="h-7 object-contain" style={{ filter: "brightness(0) invert(1) drop-shadow(0 0 6px rgba(0,255,247,0.6))" }} />
        </Link>

        {/* Status pill */}
        <div
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold mono flex-shrink-0"
          style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.25)", color: "#00ff88", textShadow: "0 0 6px rgba(0,255,136,0.5)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" style={{ background: "#00ff88" }} />
          LIVE
        </div>

        {/* Main nav links */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 mx-2">
          {topItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold transition-all duration-150 nav-pill-hover ${isActive ? "nav-pill-active" : ""}`}
                style={!isActive ? { color: "rgba(148,163,184,0.8)", border: "1px solid transparent" } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.name}
              </Link>
            );
          })}
          <MoreDropdown currentPageName={currentPageName} can={can} loading={loading} />
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto">
          <GlobalSearch />
          <DemoUserSwitcher />
          <NotificationBell />
          <UserMenu />
        </div>
      </header>

      {/* ── MOBILE DRAWER ── */}
      <MobileDrawer
        currentPageName={currentPageName}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        can={can}
        loading={loading}
      />

      {/* ── PAGE CONTENT ── */}
      <main className="flex-1 overflow-y-auto tn-scroll page-bg">
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