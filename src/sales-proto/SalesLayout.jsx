import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Home, LayoutDashboard, FileText, Users, Receipt, MapPin,
  Menu, X, Zap, LogOut
} from "lucide-react";
import UserMenu from "@/components/layout/UserMenu";
import NotificationBell from "@/components/notifications/NotificationBell";

const LOGO_WORDMARK = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/b3b518de6_Touchnet_LogoLongWhite.png";
const LOGO_BADGE    = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/639b91697_Touchnet-CrestDesogm_CrestFinalFullWhite.png";

const NAV_ITEMS = [
  { label: "Home",             path: "/sales",           icon: Home },
  { label: "Dashboard",        path: "/sales/dashboard", icon: LayoutDashboard },
  { label: "Quotes",           path: "/sales/quotes",    icon: FileText },
  { label: "Customers",        path: "/sales/customers", icon: Users },
  { label: "Billing",          path: "/sales/billing",   icon: Receipt },
  { label: "Coverage Map",     path: "/sales/coverage",  icon: MapPin },
];

function SalesSidebar({ open, onClose }) {
  const { pathname } = useLocation();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(10,15,40,0.6)", backdropFilter: "blur(8px)" }}
          onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          width: 256,
          background: "linear-gradient(180deg, #080d0d 0%, #0a0f0f 35%, #0f0f0f 65%, #111111 100%)",
          borderRight: "1px solid rgba(0,212,212,0.1)",
          flexShrink: 0,
          overflow: "hidden",
          position: "relative",
        }}>

        {/* Dot grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none", opacity: 0.5 }} />
        {/* Ambient glows */}
        <div style={{ position: "absolute", top: -60, left: -40, width: 260, height: 260, background: "radial-gradient(circle, rgba(0,212,212,0.2) 0%, rgba(255,255,255,0.03) 40%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 40, right: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(224,35,71,0.12) 0%, transparent 68%)", pointerEvents: "none" }} />

        {/* Logo header */}
        <div className="flex items-center justify-between px-4 h-[68px] flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", position: "relative", zIndex: 2 }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, rgba(0,180,180,0.15), rgba(139,26,26,0.08))", border: "1px solid rgba(0,212,212,0.25)", boxShadow: "0 0 16px rgba(0,180,180,0.15)" }}>
              <img src={LOGO_BADGE} alt="TouchNet Crest" className="w-9 h-9 object-contain" style={{ opacity: 0.95 }} />
            </div>
            <div>
              <img src={LOGO_WORDMARK} alt="TouchNet" className="h-6 object-contain" style={{ opacity: 0.95 }} />
              <p className="text-[8px] font-bold tracking-[0.28em] uppercase mt-0.5"
                style={{ color: "rgba(0,212,212,0.6)", fontFamily: "'JetBrains Mono', monospace" }}>
                SALES PROTOTYPE
              </p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg"
            style={{ color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)" }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Prototype badge */}
        <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-xl flex items-center gap-2"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <Zap className="w-3 h-3 flex-shrink-0" style={{ color: "#f59e0b" }} />
          <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "#f59e0b" }}>Sales Dept · Prototype</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 sidebar-scroll" style={{ position: "relative", zIndex: 2 }}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== "/sales" && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium transition-all duration-150 relative"
                style={{
                  borderRadius: 10,
                  ...(isActive ? {
                    background: "rgba(255,255,255,0.12)",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.18)",
                    boxShadow: "0 2px 12px rgba(0,180,180,0.15)",
                  } : {
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid transparent",
                  }),
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; } }}
              >
                {isActive && (
                  <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: "60%", background: "linear-gradient(180deg, #00d4d4, rgba(0,212,212,0.5))", borderRadius: "0 3px 3px 0" }} />
                )}
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: isActive ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)", border: isActive ? "1px solid rgba(255,255,255,0.25)" : "1px solid transparent" }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: isActive ? "#ffffff" : "rgba(255,255,255,0.45)" }} />
                </div>
                <span className="flex-1 truncate" style={{ fontFamily: "'Inter', sans-serif", fontWeight: isActive ? 600 : 500, fontSize: 13 }}>
                  {item.label}
                </span>
                {isActive && (
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#e02347", boxShadow: "0 0 8px #e02347", flexShrink: 0 }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12, position: "relative", zIndex: 2 }}>
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <img src={LOGO_BADGE} alt="Crest" className="w-6 h-6 object-contain" style={{ opacity: 0.3 }} />
            <p className="text-[8px] font-black uppercase tracking-[0.2em]"
              style={{ color: "rgba(0,212,212,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
              BUILD · CONNECT · PROTECT
            </p>
          </div>
          <p className="text-center text-[8px]" style={{ color: "rgba(255,255,255,0.12)", fontFamily: "'JetBrains Mono', monospace" }}>
            TOUCHNET · SALES PROTO v1.0
          </p>
        </div>
      </aside>
    </>
  );
}

export default function SalesLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const { pathname } = useLocation();

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const currentNav = NAV_ITEMS.find(n => pathname === n.path || (n.path !== "/sales" && pathname.startsWith(n.path)));
  const CurrentIcon = currentNav?.icon;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#111111" }}>
      <SalesSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="top-bar top-bar-futuristic h-[56px] sm:h-[64px] flex items-center px-3 sm:px-5 gap-2 sm:gap-4 flex-shrink-0 z-30">
          <button onClick={() => setMobileOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl"
            style={{ color: "#00b4b4", background: "rgba(0,180,180,0.06)", border: "1px solid rgba(0,180,180,0.15)" }}>
            <Menu className="w-4 h-4" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,rgba(0,180,180,0.15),rgba(139,26,26,0.08))", border: "1px solid rgba(0,212,212,0.22)" }}>
                <img src={LOGO_BADGE} alt="Crest" className="w-5 h-5 object-contain" style={{ opacity: 0.9 }} />
              </div>
              <img src={LOGO_WORDMARK} alt="TouchNet" className="h-5 object-contain" style={{ opacity: 0.95 }} />
            </div>
            {currentNav && (
              <>
                <span style={{ color: "rgba(0,212,212,0.3)", fontSize: 16 }}>›</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{ background: "rgba(0,180,180,0.08)", border: "1px solid rgba(0,180,180,0.2)" }}>
                  {CurrentIcon && <CurrentIcon className="w-3.5 h-3.5" style={{ color: "#00b4b4" }} />}
                  <span className="text-[13px] font-bold" style={{ color: "#00b4b4", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {currentNav.label}
                  </span>
                </div>
                <div className="px-2 py-0.5 rounded-lg"
                  style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "#f59e0b" }}>Sales Proto</span>
                </div>
              </>
            )}
          </div>

          <div className="flex-1" />

          {/* Live clock */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "#059669", boxShadow: "0 0 7px rgba(5,150,105,0.8)" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, color: "#00d4d4", letterSpacing: "0.07em" }}>
              {timeStr}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <NotificationBell />
            <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.08)" }} />
            <UserMenu />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto content-scroll page-bg">
          <div className="section-reveal">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}