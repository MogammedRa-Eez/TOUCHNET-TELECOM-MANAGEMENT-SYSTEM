import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, Receipt, TicketCheck, FileText, X, Zap } from "lucide-react";

const ACTIONS = [
  { label: "New Customer",  icon: Users,       href: "/Customers",  color: "#10b981" },
  { label: "New Invoice",   icon: Receipt,     href: "/Billing",    color: "#6366f1" },
  { label: "New Ticket",    icon: TicketCheck, href: "/Tickets",    color: "#f59e0b" },
  { label: "New Quote",     icon: FileText,    href: "/Quotes",     color: "#06b6d4" },
];

export default function QuickActionButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard: N to open, Esc to close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") { setOpen(false); return; }
      const tag = document.activeElement?.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      if (e.key === "n" || e.key === "N") setOpen(v => !v);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-white transition-all hover:scale-105 active:scale-95"
        style={{
          background: open ? "linear-gradient(135deg,#1e2d6e,#c41e3a)" : "linear-gradient(135deg,#1e2d6e,#2a3d8f)",
          boxShadow: open ? "0 0 18px rgba(30,45,110,0.4)" : "0 4px 14px rgba(30,45,110,0.25)",
          border: "1px solid rgba(30,45,110,0.3)",
        }}
        title="Quick Actions (N)"
      >
        {open ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">New</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-48 rounded-2xl overflow-hidden z-50"
          style={{
            background: "#ffffff",
            border: "1px solid rgba(30,45,110,0.15)",
            boxShadow: "0 12px 40px rgba(30,45,110,0.15)",
          }}
        >
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,#c41e3a,transparent)" }} />
          <div className="p-1.5 space-y-0.5">
            {ACTIONS.map(a => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.label}
                  to={a.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-[1.02]"
                  style={{ color: "#1e2d6e" }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${a.color}14`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${a.color}18`, border: `1px solid ${a.color}30` }}>
                    <Icon className="w-3 h-3" style={{ color: a.color }} />
                  </div>
                  {a.label}
                </Link>
              );
            })}
          </div>
          <div className="px-3 pb-2 pt-1" style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}>
            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "rgba(30,45,110,0.35)" }}>
              <Zap className="w-2.5 h-2.5 inline mr-1" />N · ? for shortcuts
            </p>
          </div>
        </div>
      )}
    </div>
  );
}