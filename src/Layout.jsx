import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Users, Receipt, TicketCheck, Network, UserCog,
  Bot, Shield, Package, Settings, Mail, HeartHandshake,
  Home, Play, FileText, Bell, X, Menu, Activity, Cpu, Zap,
} from "lucide-react";
import { RBACProvider, useRBAC } from "@/components/rbac/RBACContext";
import UserMenu from "@/components/layout/UserMenu";
import NotificationBell from "@/components/notifications/NotificationBell";
import DemoUserSwitcher from "@/components/layout/DemoUserSwitcher";
import GlobalSearch from "@/components/layout/GlobalSearch";
import EmployeeChat from "@/components/chat/EmployeeChat";
import QuickActionButton from "@/components/layout/QuickActionButton";

/* ── Palette constants ─────────────────────────────────── */
const C = {
  primary:    "#8b5cf6",
  primaryDim: "#7c3aed",
  soft:       "#c4b5fd",
  violet:     "#a78bfa",
  glow:       "rgba(139,92,246,0.45)",
  glowSoft:   "rgba(139,92,246,0.18)",
  border:     "rgba(139,92,246,0.22)",
  borderMd:   "rgba(139,92,246,0.42)",
  sidebarBg:  "#04030d",
  sidebarMid: "#07051a",
  red:        "#ef4444",
  redSoft:    "#fca5a5",
  redGlow:    "rgba(239,68,68,0.38)",
  blue:       "#3b82f6",
  blueSoft:   "#93c5fd",
  blueGlow:   "rgba(59,130,246,0.38)",
  cyan:       "#06b6d4",
};

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { name: "Home",       page: "Home",      icon: Home,             perm: null },
      { name: "Dashboard",  page: "Dashboard", icon: LayoutDashboard,  perm: "dashboard" },
    ],
  },
  {
    label: "Business",
    items: [
      { name: "Customers",      page: "Customers",     icon: Users,        perm: "customers" },
      { name: "Billing",        page: "Billing",       icon: Receipt,      perm: "billing" },
      { name: "Quotes",         page: "Quotes",        icon: FileText,     perm: "customers" },
      { name: "Tickets",        page: "Tickets",       icon: TicketCheck,  perm: "tickets" },
      { name: "Fibre Projects", page: "FibreProjects", icon: Network,      perm: "projects" },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { name: "Network",        page: "Network",       icon: Activity, perm: "network" },
      { name: "Inventory",      page: "Inventory",     icon: Package,  perm: "network" },
      { name: "Cynet Security", page: "CynetSecurity", icon: Shield,   perm: "cyber_security" },
    ],
  },
  {
    label: "Team",
    items: [
      { name: "Employees",     page: "Employees",           icon: UserCog,        perm: "employees" },
      { name: "HR Dashboard",  page: "HRDashboard",         icon: HeartHandshake, perm: "employees" },
      { name: "My Department", page: "DepartmentDashboard", icon: LayoutDashboard, perm: null },
    ],
  },
  {
    label: "Tools",
    items: [
      { name: "Outlook",         page: "OutlookMail",       icon: Mail,           perm: "outlook" },
      { name: "AI Assistant",    page: "AIAssistant",       icon: Bot,            perm: "ai_assistant" },
      { name: "Customer Portal", page: "CustomerPortalMain", icon: HeartHandshake, perm: null },
      { name: "System Demo",     page: "SystemDemo",        icon: Play,           perm: null },
    ],
  },
  {
    label: "Admin",
    items: [
      { name: "Roles",          page: "RolesManagement",     icon: Shield,   perm: "roles_management" },
      { name: "Notifications",  page: "NotificationSettings", icon: Bell,    perm: "roles_management" },
      { name: "Settings",       page: "UserSettings",         icon: Settings, perm: null },
    ],
  },
];

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

/* ── Subtle shimmer scan line ──────────────────────────── */
function ScanLine() {
  const [pos, setPos] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPos(p => (p + 1) % 100), 35);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, top: `${pos}%`,
      height: 1,
      background: `linear-gradient(90deg, transparent, rgba(139,92,246,0.35), rgba(59,130,246,0.25), transparent)`,
      pointerEvents: "none",
      transition: "top 0.035s linear",
      zIndex: 1,
    }} />
  );
}

/* ── Sidebar ───────────────────────────────────────────── */
function Sidebar({ currentPageName, open, onClose, can, loading }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(4,8,26,0.85)", backdropFilter: "blur(10px)" }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          width: 256,
          background: `linear-gradient(180deg, ${C.sidebarBg} 0%, #0a0520 50%, ${C.sidebarMid} 100%)`,
          borderRight: `1px solid ${C.border}`,
          flexShrink: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Dot grid overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(139,92,246,0.18) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          pointerEvents: "none",
          opacity: 0.7,
        }} />

        {/* Ambient orbs */}
        <div style={{
          position: "absolute", top: -80, left: -60, width: 280, height: 280,
          background: `radial-gradient(circle, rgba(139,92,246,0.28) 0%, transparent 68%)`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: 60, right: -80, width: 220, height: 220,
          background: `radial-gradient(circle, rgba(239,68,68,0.16) 0%, transparent 68%)`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "45%", left: "50%", width: 180, height: 180,
          background: `radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 68%)`,
          pointerEvents: "none", transform: "translate(-50%,-50%)",
        }} />

        <ScanLine />

        {/* ── Logo header ── */}
        <div
          className="flex items-center justify-between px-4 h-[64px] flex-shrink-0"
          style={{
            borderBottom: `1px solid ${C.border}`,
            background: "rgba(139,92,246,0.08)",
            position: "relative", zIndex: 2,
            }}
            >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ border: `1px solid ${C.borderMd}`, boxShadow: `0 0 22px ${C.glow}`, background: "rgba(4,8,26,0.85)" }}>
              <img src="https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/9158e4b04_tnet2-removebg-preview.png" alt="Logo" className="w-13 h-13 object-contain" style={{ filter: "drop-shadow(0 0 6px rgba(37,99,235,0.7))" }} />
            </div>
            <div>
              <img src={LOGO_URL} alt="TouchNet" className="h-8 object-contain" style={{ filter: "brightness(0) invert(1) drop-shadow(0 0 8px rgba(147,197,253,0.7))", opacity: 1 }} />
              <p className="text-[8px] font-bold tracking-[0.22em] uppercase mt-0.5" style={{ color: "rgba(147,197,253,0.5)", fontFamily: "'JetBrains Mono', monospace" }}>MANAGEMENT SYSTEM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: C.soft, border: `1px solid ${C.border}`, background: "rgba(37,99,235,0.07)" }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4 sidebar-scroll" style={{ position: "relative", zIndex: 2 }}>
          {NAV_GROUPS.map(group => {
            const visibleItems = loading ? group.items : group.items.filter(i => i.perm === null || can(i.perm));
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label}>
                {/* Section label */}
                <div className="flex items-center gap-2 px-2 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.primaryDim, boxShadow: `0 0 8px ${C.primary}`, flexShrink: 0 }} />
                  <p className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: "rgba(196,181,253,0.5)", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {group.label}
                  </p>
                  <div className="flex-1 h-px" style={{ background: "rgba(37,99,235,0.12)" }} />
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
                        className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium transition-all duration-150 relative group"
                        style={{
                          borderRadius: 10,
                          ...(isActive ? {
                            background: "linear-gradient(135deg, rgba(37,99,235,0.16), rgba(29,78,216,0.09))",
                            color: C.soft,
                            border: `1px solid rgba(37,99,235,0.32)`,
                            boxShadow: `0 2px 16px rgba(37,99,235,0.14), inset 0 0 12px rgba(37,99,235,0.05)`,
                          } : {
                            color: "rgba(196,181,253,0.45)",
                            border: "1px solid transparent",
                          }),
                        }}
                      >
                        {/* Active left bar */}
                        {isActive && (
                          <span style={{
                            position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                            width: 3, height: "60%",
                            background: `linear-gradient(180deg, ${C.soft}, ${C.primary})`,
                            borderRadius: "0 3px 3px 0",
                            boxShadow: `0 0 10px ${C.glow}`,
                          }} />
                        )}

                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            background: isActive ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.07)",
                            border: isActive ? `1px solid rgba(139,92,246,0.35)` : "1px solid transparent",
                          }}
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color: isActive ? C.soft : "rgba(167,139,250,0.5)" }} />
                        </div>

                        <span className="flex-1 truncate" style={{ fontFamily: "'Inter', sans-serif", fontWeight: isActive ? 600 : 500, fontSize: 13 }}>
                          {item.name}
                        </span>

                        {isActive && (
                          <span style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: C.soft,
                            boxShadow: `0 0 8px ${C.glow}`,
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

        {/* ── Footer status ── */}
        <div className="px-3 pb-4 flex-shrink-0" style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, position: "relative", zIndex: 2 }}>
          <div style={{
            background: "rgba(139,92,246,0.07)",
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "10px 12px",
          }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3" style={{ color: C.soft }} />
                <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "rgba(196,181,253,0.5)" }}>System Status</span>
              </div>
              <span className="text-[9px] font-black tracking-wider" style={{ color: C.soft }}>ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.9)" }} />
              <span className="text-[10px]" style={{ color: "rgba(167,139,250,0.65)", fontFamily: "'JetBrains Mono', monospace" }}>ALL SYSTEMS NOMINAL</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ── Main Layout ───────────────────────────────────────── */
function LayoutInner({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const [chatUser, setChatUser] = useState(null);
  const { can, loading } = useRBAC();

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u && u.role !== "user") setChatUser(u);
    }).catch(() => {});
  }, []);

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
    <div className="flex h-screen overflow-hidden" style={{ background: "#080b18" }}>
      <Sidebar
        currentPageName={currentPageName}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        can={can}
        loading={loading}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* ── Top bar ── */}
        <header className="top-bar h-[60px] flex items-center px-5 gap-4 flex-shrink-0 z-30" style={{ background: "rgba(6,4,18,0.97)" }}>
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
            style={{ color: C.soft, background: "rgba(139,92,246,0.1)", border: `1px solid ${C.border}` }}
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.soft, boxShadow: `0 0 10px ${C.glow}` }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: C.soft, opacity: 0.85, fontFamily: "'JetBrains Mono', monospace" }}>TOUCHNET TMS</span>
            </div>
            {currentItem && (
              <>
                <span style={{ color: "rgba(37,99,235,0.35)", fontSize: 14 }}>›</span>
                 <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "rgba(139,92,246,0.1)", border: `1px solid ${C.border}` }}>
                  {CurrentIcon && <CurrentIcon className="w-3.5 h-3.5" style={{ color: C.soft }} />}
                  <span className="text-[13px] font-bold tracking-tight" style={{ color: "#e8d5ff", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {currentItem.name}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex-1" />

          {/* Live clock */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(139,92,246,0.07)", border: `1px solid ${C.border}` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981", boxShadow: "0 0 7px rgba(16,185,129,0.9)" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, color: C.soft, letterSpacing: "0.05em" }}>
              {timeStr}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <QuickActionButton />
            <GlobalSearch />
            <DemoUserSwitcher />
            <NotificationBell />
            <div className="w-px h-5" style={{ background: `rgba(37,99,235,0.2)` }} />
            <UserMenu />
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto content-scroll page-bg">
          {children}
        </main>
      </div>

      {chatUser && <EmployeeChat user={chatUser} />}
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