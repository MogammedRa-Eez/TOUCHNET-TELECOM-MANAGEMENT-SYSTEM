import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Users, Receipt, TicketCheck,
  Network, UserCog, Bot, ArrowRight, Wifi, Shield, Zap
} from "lucide-react";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

const quickLinks = [
  { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard, desc: "System overview & KPIs" },
  { name: "Customers", page: "Customers", icon: Users, desc: "Manage customer accounts" },
  { name: "Billing", page: "Billing", icon: Receipt, desc: "Invoices & payments" },
  { name: "Tickets", page: "Tickets", icon: TicketCheck, desc: "Support tickets" },
  { name: "Network", page: "Network", icon: Network, desc: "Infrastructure status" },
  { name: "AI Assistant", page: "AIAssistant", icon: Bot, desc: "AI-powered insights" },
];

const highlights = [
  { icon: Wifi, label: "99.9% Uptime", desc: "Network reliability guaranteed" },
  { icon: Shield, label: "Secure Platform", desc: "Role-based access control" },
  { icon: Zap, label: "Real-time Data", desc: "Live metrics and alerts" },
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e2a4a 0%, #0f172a 60%, #1a1a2e 100%)" }}>
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(rgba(220,38,38,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />
        {/* Red accent glow */}
        <div className="absolute top-0 right-0 w-96 h-96 opacity-20 rounded-full"
          style={{ background: "radial-gradient(circle, #dc2626 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />

        <div className="relative px-8 py-12 lg:px-16 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left: Logo + Greeting */}
            <div className="flex flex-col gap-4">
              <img src={LOGO_URL} alt="TouchNet Logo" className="h-12 w-auto object-contain"
                style={{ filter: "brightness(0) invert(1)" }} />
              <div>
                <p className="text-red-400 text-sm font-semibold tracking-widest uppercase mb-1"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {greeting}
                </p>
                <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                  {user?.full_name ? `Welcome back, ${user.full_name.split(" ")[0]}` : "Welcome to TouchNet"}
                </h1>
                <p className="text-slate-400 mt-2 text-sm max-w-md">
                  Your unified ISP management platform. Monitor your network, manage customers, and stay on top of everything — all in one place.
                </p>
              </div>
              <Link to={createPageUrl("Dashboard")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all w-fit"
                style={{ background: "linear-gradient(90deg, #dc2626, #b91c1c)", boxShadow: "0 4px 14px rgba(220,38,38,0.4)" }}>
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right: Live clock + status */}
            <div className="flex flex-col items-start lg:items-end gap-3">
              <div className="rounded-xl px-6 py-4 text-right" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <p className="text-4xl font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </p>
                <p className="text-slate-400 text-xs mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {time.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: "pulse-green 2s infinite" }} />
                <span className="text-emerald-300 text-xs font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  ALL SYSTEMS OPERATIONAL
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights bar */}
      <div className="px-8 lg:px-16 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {highlights.map((h) => {
            const Icon = h.icon;
            return (
              <div key={h.label} className="flex items-center gap-3 rounded-xl px-5 py-4"
                style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(220,38,38,0.1)" }}>
                  <Icon className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{h.label}</p>
                  <p className="text-xs text-slate-400">{h.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="px-8 lg:px-16 pb-12">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}>Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.page} to={createPageUrl(item.page)}
                className="group flex items-center gap-4 rounded-xl p-5 transition-all"
                style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(220,38,38,0.3)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(220,38,38,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.07)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #1e2a4a, #0f172a)" }}>
                  <Icon className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-red-400 transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}