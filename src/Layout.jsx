import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Users, Receipt, TicketCheck, Network, UserCog,
  Bot, Shield, Package, Settings, Mail, HeartHandshake,
  Home, Play, FileText, Bell, X, Menu, Activity, Zap,
} from "lucide-react";
import { RBACProvider, useRBAC } from "@/components/rbac/RBACContext";
import UserMenu from "@/components/layout/UserMenu";
import NotificationBell from "@/components/notifications/NotificationBell";
import DemoUserSwitcher from "@/components/layout/DemoUserSwitcher";
import GlobalSearch from "@/components/layout/GlobalSearch";
import EmployeeChat from "@/components/chat/EmployeeChat";
import QuickActionButton from "@/components/layout/QuickActionButton";
import KeyboardShortcutGuide from "@/components/layout/KeyboardShortcutGuide";

/* ── Brand constants — Dark Teal+Red ─────────────────── */
const NAVY    = "#00b4b4";
const NAVY_L  = "#00d4d4";
const NAVY_P  = "#00a0a0";
const CRIMSN  = "#e02347";
const CRIMSN_L = "#ff3358";
const LOGO_WORDMARK = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/3ae578803_image0011.png";
const LOGO_BADGE    = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/68499f2d4_tnet2-removebg-preview.png";

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
      { name: "Employees",     page: "Employees",           icon: UserCog,         perm: "employees" },
      { name: "HR Dashboard",  page: "HRDashboard",         icon: HeartHandshake,  perm: "employees" },
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
      { name: "Roles",          page: "RolesManagement",      icon: Shield,   perm: "roles_management" },
      { name: "Notifications",  page: "NotificationSettings", icon: Bell,     perm: "roles_management" },
      { name: "Settings",       page: "UserSettings",         icon: Settings, perm: null },
    ],
  },
];

/* ── Sidebar ──────────────────────────────────────────── */
function Sidebar({ currentPageName, open, onClose, can, loading }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(10,15,40,0.6)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          width: 256,
          background: `linear-gradient(180deg, #080d0d 0%, #0a0f0f 35%, #0f0f0f 65%, #111111 100%)`,
          borderRight: "1px solid rgba(0,212,212,0.1)",
          flexShrink: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Subtle dot grid overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          pointerEvents: "none",
          opacity: 0.5,
        }} />

        {/* Ambient glow top — whitish-teal */}
        <div style={{
          position: "absolute", top: -60, left: -40, width: 260, height: 260,
          background: `radial-gradient(circle, rgba(0,212,212,0.2) 0%, rgba(255,255,255,0.03) 40%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Ambient glow bottom — red accent */}
        <div style={{
          position: "absolute", bottom: 40, right: -60, width: 200, height: 200,
          background: `radial-gradient(circle, rgba(224,35,71,0.12) 0%, transparent 68%)`,
          pointerEvents: "none",
        }} />

        {/* ── Logo header ── */}
        <div
          className="flex items-center justify-between px-4 h-[68px] flex-shrink-0"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            position: "relative", zIndex: 2,
          }}
        >
          <div className="flex items-center gap-3">
            {/* Badge icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}>
              <img
                src={LOGO_BADGE}
                alt="TouchNet Badge"
                className="w-9 h-9 object-contain"
                style={{ filter: "brightness(0) invert(1)", opacity: 0.9 }}
              />
            </div>
            <div>
              {/* Wordmark */}
              <img
                src={LOGO_WORDMARK}
                alt="TouchNet"
                className="h-6 object-contain"
                style={{ filter: "brightness(0) invert(1)", opacity: 0.95 }}
              />
              <p className="text-[8px] font-bold tracking-[0.28em] uppercase mt-0.5"
                style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>
                MANAGEMENT SYSTEM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)" }}
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
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(0,180,180,0.8)", flexShrink: 0 }} />
                  <p className="text-[9px] font-black uppercase tracking-[0.22em]"
                    style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {group.label}
                  </p>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
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
                            background: "rgba(255,255,255,0.12)",
                            color: "#ffffff",
                            border: "1px solid rgba(255,255,255,0.18)",
                            boxShadow: "0 2px 12px rgba(30,45,110,0.3)",
                          } : {
                            color: "rgba(255,255,255,0.5)",
                            border: "1px solid transparent",
                          }),
                        }}
                        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; } }}
                        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; } }}
                      >
                        {/* Active left bar */}
                        {isActive && (
                          <span style={{
                            position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                            width: 3, height: "60%",
                            background: `linear-gradient(180deg, #ffffff, rgba(255,255,255,0.5))`,
                            borderRadius: "0 3px 3px 0",
                          }} />
                        )}

                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: isActive ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)",
                            border: isActive ? "1px solid rgba(255,255,255,0.25)" : "1px solid transparent",
                          }}
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color: isActive ? "#ffffff" : "rgba(255,255,255,0.45)" }} />
                        </div>

                        <span className="flex-1 truncate" style={{ fontFamily: "'Inter', sans-serif", fontWeight: isActive ? 600 : 500, fontSize: 13 }}>
                          {item.name}
                        </span>

                        {isActive && (
                          <span style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: CRIMSN,
                            boxShadow: `0 0 8px ${CRIMSN}`,
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
        <div className="px-3 pb-4 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12, position: "relative", zIndex: 2 }}>

          {/* System health bar */}
          <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "10px 12px", marginBottom: 8, position: "relative", overflow: "hidden" }}>
            {/* Scan line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(52,211,153,0.4),transparent)", animation: "shimmer 2.5s infinite" }} />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3" style={{ color: "rgba(255,255,255,0.6)" }} />
                <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>System Status</span>
              </div>
              <span className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded-md" style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>NOMINAL</span>
            </div>
            {/* Mini health bars */}
            {[
              { label: "Network", pct: 99, color: "#34d399" },
              { label: "Billing",  pct: 100, color: "#38bdf8" },
              { label: "Tickets", pct: 87,  color: "#fbbf24" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 mb-1.5 last:mb-0">
                <span className="text-[8px] font-bold w-12 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{s.label}</span>
                <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: `linear-gradient(90deg,${s.color},${s.color}88)` }} />
                </div>
                <span className="text-[8px] font-black w-7 text-right" style={{ color: s.color, fontFamily: "monospace" }}>{s.pct}%</span>
              </div>
            ))}
          </div>

          <p className="text-center text-[9px]" style={{ color: "rgba(255,255,255,0.18)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.15em" }}>
            TOUCHNET · TMS v3.0
          </p>
        </div>
      </aside>
    </>
  );
}

/* ── Main Layout ──────────────────────────────────────── */
function LayoutInner({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const [chatUser, setChatUser] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
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

  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      if (e.key === "?") setShowGuide(v => !v);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const allItems = NAV_GROUPS.flatMap(g => g.items);
  const currentItem = allItems.find(i => i.page === currentPageName);
  const CurrentIcon = currentItem?.icon;
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#111111" }}>
      <Sidebar
        currentPageName={currentPageName}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        can={can}
        loading={loading}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* ── Top bar ── */}
        <header
          className="top-bar top-bar-futuristic h-[64px] flex items-center px-5 gap-4 flex-shrink-0 z-30"
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
            style={{ color: "#00b4b4", background: "rgba(0,180,180,0.06)", border: "1px solid rgba(0,180,180,0.15)" }}
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <img src={LOGO_WORDMARK} alt="TouchNet" className="h-5 object-contain" style={{ opacity: 0.95, filter: "brightness(0) saturate(100%) invert(68%) sepia(99%) saturate(400%) hue-rotate(140deg) brightness(105%)" }} />
            </div>
            {currentItem && (
              <>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>›</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{ background: "rgba(0,180,180,0.08)", border: "1px solid rgba(0,180,180,0.2)" }}>
                  {CurrentIcon && <CurrentIcon className="w-3.5 h-3.5" style={{ color: NAVY }} />}
                  <span className="text-[13px] font-bold"
                    style={{ color: NAVY, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {currentItem.name}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex-1" />

          {/* Live clock */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span className="w-2 h-2 rounded-full status-breathe"
              style={{ background: "#059669", color: "#059669", boxShadow: "0 0 7px rgba(5,150,105,0.8)" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, color: "#00d4d4", letterSpacing: "0.07em" }}>
              {timeStr}
            </span>
          </div>

          {/* Network status pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
            style={{ background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.18)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#059669" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 800, color: "#059669", letterSpacing: "0.12em" }}>ONLINE</span>
          </div>

          <div className="flex items-center gap-2">
            <QuickActionButton />
            <GlobalSearch />
            <DemoUserSwitcher />
            <NotificationBell />
            <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.08)" }} />
            <UserMenu />
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto content-scroll page-bg">
          <div className="section-reveal">
            {children}
          </div>
        </main>
      </div>

      {chatUser && <EmployeeChat user={chatUser} />}
      {showGuide && <KeyboardShortcutGuide onClose={() => setShowGuide(false)} />}
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