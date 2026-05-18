import React, { useEffect, useState } from "react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  LogIn, Network, Globe, TicketCheck, Users, BarChart3,
  Shield, Zap, Activity, CheckCircle2, Phone, Mail, MapPin,
  ChevronRight, ArrowRight
} from "lucide-react";



const LOGO_WHITE  = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/b3b518de6_Touchnet_LogoLongWhite.png";
const LOGO_TEAL   = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/fa247a9df_Touchnet_LogoLongTeal.png";
const CREST_WHITE = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/639b91697_Touchnet-CrestDesogm_CrestFinalFullWhite.png";

const MODULES = [
  { icon: Network,    label: "Fibre Projects",     color: "#00b4b4", desc: "End-to-end deployment" },
  { icon: Globe,      label: "Network Monitoring", color: "#0ea5e9", desc: "Live node telemetry"    },
  { icon: TicketCheck,label: "Smart Helpdesk",     color: "#8b5cf6", desc: "SLA-driven support"    },
  { icon: Users,      label: "Customer Portal",    color: "#10b981", desc: "Self-service access"   },
  { icon: BarChart3,  label: "Billing & Invoicing",color: "#f59e0b", desc: "Sage Cloud integrated" },
  { icon: Shield,     label: "Access Control",     color: "#8B1A1A", desc: "RBAC permissions"      },
];

const STATS = [
  { value: "99.9%", label: "Network Uptime",   color: "#10b981" },
  { value: "< 2h",  label: "Ticket SLA",       color: "#00d4d4" },
  { value: "500+",  label: "Active Customers", color: "#a0f0f0" },
  { value: "24/7",  label: "Monitoring",       color: "#f59e0b" },
];

const MODULES_EXTENDED = [
  { icon: Network,    label: "Fibre Projects",     color: "#00b4b4", desc: "End-to-end deployment" },
  { icon: Globe,      label: "Network Monitoring", color: "#0ea5e9", desc: "Live node telemetry"    },
  { icon: TicketCheck,label: "Smart Helpdesk",     color: "#8b5cf6", desc: "SLA-driven support"    },
  { icon: Users,      label: "Customer Portal",    color: "#10b981", desc: "Self-service access"   },
  { icon: BarChart3,  label: "Billing & Invoicing",color: "#f59e0b", desc: "Sage Cloud integrated" },
  { icon: Shield,     label: "Cynet Security",     color: "#e02347", desc: "360° threat protection" },
];

export default function Home() {
  const [tick, setTick] = useState(0);
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 4,
      dur: Math.random() * 4 + 4,
    }))
  );

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const dateStr = now.toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: "#0a0f0f", fontFamily: "'Inter', sans-serif" }}>

      {/* ═══════════════════════════════════════════════
          LEFT PANEL — Brand & Info
      ═══════════════════════════════════════════════ */}
      <div className="relative flex flex-col lg:w-[55%] xl:w-[60%] overflow-hidden"
        style={{ minHeight: "100vh" }}>

        {/* Deep dark gradient base */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, #080f0f 0%, #0d1a1a 40%, #111111 70%, #0a0808 100%)" }} />

        {/* Ambient teal glow top-left */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,180,180,0.22) 0%, transparent 65%)" }} />
        {/* Ambient maroon glow bottom-right */}
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,26,26,0.2) 0%, transparent 65%)" }} />
        {/* Mid teal accent */}
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] pointer-events-none -translate-y-1/2"
          style={{ background: "radial-gradient(circle, rgba(0,212,212,0.07) 0%, transparent 70%)" }} />

        {/* Dot grid overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,212,212,0.07) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        {/* Subtle scan lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,212,212,0.6) 3px, rgba(0,212,212,0.6) 4px)" }} />
        {/* Floating particles */}
        {particles.map(p => (
          <div key={p.id} className="absolute rounded-full pointer-events-none"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              background: p.id % 3 === 0 ? "#00d4d4" : p.id % 3 === 1 ? "#8B1A1A" : "rgba(255,255,255,0.4)",
              boxShadow: `0 0 ${p.size * 3}px currentColor`,
              animation: `float ${p.dur}s ease-in-out ${p.delay}s infinite`,
              opacity: 0.5,
            }} />
        ))}

        {/* Animated top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] z-10"
          style={{ background: "linear-gradient(90deg,#8B1A1A,#00b4b4,#00d4d4,rgba(255,255,255,0.6),#00b4b4,#8B1A1A)", backgroundSize: "300% auto", animation: "border-rotate 6s ease infinite" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1 px-8 md:px-14 py-10">

          {/* Logo row */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,rgba(0,180,180,0.15),rgba(139,26,26,0.08))", border: "1px solid rgba(0,212,212,0.25)", boxShadow: "0 0 20px rgba(0,180,180,0.12)" }}>
              <img src={CREST_WHITE} alt="Crest" className="w-8 h-8 object-contain" style={{ opacity: 0.92 }} />
            </div>
            <div>
              <img src={LOGO_WHITE} alt="TouchNet" className="h-7 object-contain" style={{ opacity: 0.95 }} />
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1 h-1 rounded-full" style={{ background: "#00d4d4" }} />
                <span className="text-[8px] font-black uppercase tracking-[0.28em]"
                  style={{ color: "rgba(0,212,212,0.5)", fontFamily: "'JetBrains Mono',monospace" }}>TMS v3.0</span>
              </div>
            </div>
            <div className="ml-auto hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
              <span className="text-[9px] font-black uppercase tracking-wider"
                style={{ color: "#10b981", fontFamily: "'JetBrains Mono',monospace" }}>SYSTEMS ONLINE</span>
            </div>
          </div>

          {/* Hero crest */}
          <div className="flex flex-col items-center mb-10 lg:mb-14">
            <div className="relative mb-8">
              {/* Orbit rings */}
              <div className="absolute inset-0 m-auto w-72 h-72 rounded-full pointer-events-none"
                style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle, rgba(0,180,180,0.12) 0%, transparent 65%)", animation: "pulse-navy 3s ease-in-out infinite" }} />
              <div className="absolute w-56 h-56 rounded-full border pointer-events-none"
                style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", borderColor: "rgba(0,212,212,0.12)", borderStyle: "dashed", animation: "border-spin 25s linear infinite" }} />
              <div className="absolute w-72 h-72 rounded-full border pointer-events-none"
                style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", borderColor: "rgba(139,26,26,0.08)", borderStyle: "dashed", animation: "border-spin 40s linear infinite reverse" }} />

              {/* Crest box */}
              <div className="relative w-48 h-48 rounded-3xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(0,180,180,0.1), rgba(0,0,0,0.5), rgba(139,26,26,0.07))",
                  border: "1px solid rgba(0,212,212,0.25)",
                  boxShadow: "0 0 80px rgba(0,180,180,0.18), 0 0 40px rgba(139,26,26,0.06), inset 0 1px 0 rgba(255,255,255,0.05)"
                }}>
                {/* Corner brackets */}
                <div className="absolute top-4 left-4 w-5 h-5" style={{ borderTop: "2px solid rgba(0,212,212,0.55)", borderLeft: "2px solid rgba(0,212,212,0.55)" }} />
                <div className="absolute top-4 right-4 w-5 h-5" style={{ borderTop: "2px solid rgba(0,212,212,0.55)", borderRight: "2px solid rgba(0,212,212,0.55)" }} />
                <div className="absolute bottom-4 left-4 w-5 h-5" style={{ borderBottom: "2px solid rgba(139,26,26,0.5)", borderLeft: "2px solid rgba(139,26,26,0.5)" }} />
                <div className="absolute bottom-4 right-4 w-5 h-5" style={{ borderBottom: "2px solid rgba(139,26,26,0.5)", borderRight: "2px solid rgba(139,26,26,0.5)" }} />
                <img src={CREST_WHITE} alt="TouchNet Crest" className="w-32 h-32 object-contain"
                  style={{ filter: "drop-shadow(0 0 24px rgba(0,212,212,0.45)) drop-shadow(0 0 50px rgba(0,180,180,0.15))", opacity: 0.95 }} />
              </div>
            </div>

            {/* Motto */}
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-14" style={{ background: "linear-gradient(90deg,transparent,rgba(0,212,212,0.4))" }} />
              <span className="text-[9px] font-black uppercase tracking-[0.32em]"
                style={{ color: "rgba(0,212,212,0.5)", fontFamily: "'JetBrains Mono',monospace" }}>BUILD · CONNECT · PROTECT</span>
              <div className="h-px w-14" style={{ background: "linear-gradient(90deg,rgba(0,212,212,0.4),transparent)" }} />
            </div>

            {/* Headline */}
            <h1 className="text-center text-3xl md:text-4xl xl:text-5xl font-black leading-tight tracking-tight max-w-lg"
              style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#f0f0f0" }}>
              One Platform to Run Your
              <span className="block mt-1" style={{
                background: "linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.9),#00b4b4,#8B1A1A)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundSize: "200% auto", animation: "border-rotate 4s ease infinite"
              }}>Entire ISP Operation</span>
            </h1>
            <p className="text-center text-sm mt-4 max-w-md" style={{ color: "rgba(180,240,240,0.55)", lineHeight: 1.75 }}>
              Real-time network visibility · Fibre project tracking · Smart helpdesk · Seamless billing — all in one place.
            </p>
          </div>

          {/* Module grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-10">
            {MODULES_EXTENDED.map(({ icon: Icon, label, color, desc }) => (
              <div key={label}
                className="relative flex flex-col gap-1.5 px-3 py-3 rounded-xl transition-all duration-200 hover:scale-[1.03] overflow-hidden group"
                style={{ background: `${color}08`, border: `1px solid ${color}22`, boxShadow: `0 2px 12px ${color}08` }}>
                {/* Top shimmer on hover */}
                <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}18`, border: `1px solid ${color}30`, boxShadow: `0 0 8px ${color}20` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</span>
                </div>
                <p className="text-[9px] pl-9" style={{ color: "rgba(255,255,255,0.28)" }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-4 gap-2 mb-auto">
            {STATS.map(s => (
              <div key={s.label} className="relative flex flex-col items-center py-3 px-2 rounded-xl overflow-hidden group hover:scale-105 transition-transform"
                style={{ background: `linear-gradient(135deg, ${s.color}0a, rgba(0,0,0,0.3))`, border: `1px solid ${s.color}20` }}>
                <div className="absolute top-0 left-0 right-0 h-[1px]"
                  style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }} />
                <span className="text-lg font-black leading-none mb-1"
                  style={{ color: s.color, fontFamily: "'JetBrains Mono',monospace", textShadow: `0 0 20px ${s.color}80` }}>
                  {s.value}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-center"
                  style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Footer strip */}
          <div className="mt-10 pt-5 flex items-center justify-between flex-wrap gap-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-3">
              <img src={CREST_WHITE} alt="" className="w-5 h-5 object-contain" style={{ opacity: 0.2 }} />
              <span className="text-[8px] font-black uppercase tracking-[0.2em]"
                style={{ color: "rgba(255,255,255,0.15)", fontFamily: "'JetBrains Mono',monospace" }}>© {new Date().getFullYear()} TOUCHNET (PTY) LTD</span>
            </div>
            <div className="flex items-center gap-3 text-[10px]" style={{ color: "rgba(0,212,212,0.3)" }}>
              <Link to="/about" className="hover:text-teal-300 transition-colors" style={{ color: "inherit" }}>About</Link>
              <Link to="/contact" className="hover:text-teal-300 transition-colors" style={{ color: "inherit" }}>Contact</Link>
            </div>
          </div>
        </div>

        {/* Right border glow line */}
        <div className="absolute top-0 right-0 bottom-0 w-px hidden lg:block"
          style={{ background: "linear-gradient(180deg, transparent, rgba(0,212,212,0.25) 30%, rgba(0,212,212,0.35) 50%, rgba(139,26,26,0.2) 70%, transparent)" }} />
      </div>

      {/* ═══════════════════════════════════════════════
          RIGHT PANEL — Sign-In Card
      ═══════════════════════════════════════════════ */}
      <div className="relative flex items-center justify-center lg:w-[45%] xl:w-[40%] px-6 py-16"
        style={{ background: "#111111", minHeight: "100vh" }}>

        {/* Subtle ambient */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(circle at 80% 20%, rgba(0,180,180,0.06), transparent 60%)" }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] pointer-events-none"
          style={{ background: "radial-gradient(circle at 20% 80%, rgba(139,26,26,0.05), transparent 60%)" }} />

        <div className="relative z-10 w-full max-w-sm">

          {/* Live clock */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative px-6 py-3 rounded-2xl mb-3 overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(0,180,180,0.07), rgba(0,0,0,0.4))", border: "1px solid rgba(0,212,212,0.2)", boxShadow: "0 0 40px rgba(0,180,180,0.08)" }}>
              <div className="absolute top-0 left-0 right-0 h-[1px]"
                style={{ background: "linear-gradient(90deg,transparent,rgba(0,212,212,0.6),transparent)" }} />
              <div className="absolute bottom-0 left-0 right-0 h-[1px]"
                style={{ background: "linear-gradient(90deg,transparent,rgba(139,26,26,0.4),transparent)" }} />
              <div className="data-indicator absolute top-3 right-3">
                <span /><span /><span />
              </div>
              <p className="text-3xl font-black text-center tracking-widest"
                style={{ color: "#00d4d4", fontFamily: "'JetBrains Mono',monospace", textShadow: "0 0 30px rgba(0,212,212,0.6), 0 0 60px rgba(0,180,180,0.2)" }}>
                {timeStr}
              </p>
              <p className="text-[10px] text-center mt-0.5" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono',monospace" }}>
                {dateStr}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full status-breathe" style={{ background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]"
                style={{ color: "rgba(16,185,129,0.8)", fontFamily: "'JetBrains Mono',monospace" }}>All Systems Operational</span>
            </div>
          </div>

          {/* Sign-in card */}
          <div className="rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #1e1e1e, #191919)",
              border: "1px solid rgba(0,212,212,0.2)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,212,0.05), 0 0 60px rgba(0,180,180,0.05)"
            }}>

            {/* Card top accent */}
            <div className="h-[2px]"
              style={{ background: "linear-gradient(90deg,#8B1A1A,#00b4b4,#00d4d4,rgba(255,255,255,0.5),#00b4b4,transparent)" }} />

            {/* Corner brackets */}
            <div className="relative px-8 pt-8 pb-2">
              <div className="absolute top-4 left-4 w-4 h-4" style={{ borderTop: "1.5px solid rgba(0,212,212,0.4)", borderLeft: "1.5px solid rgba(0,212,212,0.4)" }} />
              <div className="absolute top-4 right-4 w-4 h-4" style={{ borderTop: "1.5px solid rgba(0,212,212,0.4)", borderRight: "1.5px solid rgba(0,212,212,0.4)" }} />

              {/* Crest + title */}
              <div className="flex flex-col items-center mb-7">
                <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                  {/* Outer spinning ring */}
                  <div className="absolute inset-0 rounded-full"
                    style={{ border: "1px dashed rgba(0,212,212,0.3)", animation: "border-spin 12s linear infinite" }} />
                  {/* Inner counter-spin */}
                  <div className="absolute inset-2 rounded-full"
                    style={{ border: "1px solid rgba(139,26,26,0.25)", animation: "border-spin 8s linear infinite reverse" }} />
                  {/* Glow platform */}
                  <div className="absolute inset-3 rounded-2xl"
                    style={{
                      background: "linear-gradient(135deg,rgba(0,180,180,0.14),rgba(139,26,26,0.06))",
                      border: "1px solid rgba(0,212,212,0.28)",
                      boxShadow: "0 0 40px rgba(0,180,180,0.2), 0 0 80px rgba(0,180,180,0.08), inset 0 1px 0 rgba(255,255,255,0.08)"
                    }} />
                  <img src={CREST_WHITE} alt="TouchNet Crest" className="w-14 h-14 object-contain relative z-10"
                    style={{ filter: "drop-shadow(0 0 16px rgba(0,212,212,0.6)) drop-shadow(0 0 40px rgba(0,180,180,0.3))", opacity: 0.95 }} />
                  {/* Beacon pings */}
                  <div className="absolute inset-0 rounded-full status-beacon" style={{ color: "#00b4b4" }} />
                </div>
                <img src={LOGO_TEAL} alt="TouchNet" className="h-8 object-contain mb-2" style={{ opacity: 0.95 }} />
                <p className="text-[11px] font-bold text-center tracking-wide"
                  style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.05em" }}>
                  TELECOMMUNICATIONS MANAGEMENT SYSTEM
                </p>
              </div>

              {/* Divider */}
              <div className="h-px mb-7"
                style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,212,0.2), transparent)" }} />
            </div>

            {/* Sign-in content */}
            <div className="px-8 pb-8">
              <div className="text-center mb-6">
                <h2 className="text-[18px] font-black mb-1" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>
                  Welcome Back
                </h2>
                <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Sign in to access your portal
                </p>
              </div>

              {/* Primary sign-in button */}
              <button
                onClick={() => base44.auth.redirectToLogin(createPageUrl("Home"))}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-[14px] font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group mb-3"
                style={{
                  background: "linear-gradient(135deg,#00b4b4,#007a7a)",
                  boxShadow: "0 8px 32px rgba(0,180,180,0.4), 0 0 0 1px rgba(0,212,212,0.25)",
                  border: "1px solid rgba(0,212,212,0.3)"
                }}>
                {/* Shimmer sweep */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
                <LogIn className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Sign In to TouchNet</span>
                <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Customer portal link */}
              <button
                onClick={() => base44.auth.redirectToLogin("/CustomerPortalMain")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: "rgba(139,26,26,0.08)",
                  border: "1px solid rgba(139,26,26,0.22)",
                  color: "#c23030"
                }}>
                <Users className="w-4 h-4" />
                Customer Portal Sign In
              </button>

              {/* Info note */}
              <div className="mt-5 px-4 py-3 rounded-xl flex items-start gap-2.5"
                style={{ background: "rgba(0,180,180,0.04)", border: "1px solid rgba(0,212,212,0.1)" }}>
                <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "rgba(0,212,212,0.5)" }} />
                <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Staff and customers use the same authentication. You'll be routed to your portal automatically after signing in.
                </p>
              </div>

              {/* Quick access links */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { label: "Coverage Check", path: "/CoverageCheck", color: "#00b4b4" },
                  { label: "Submit Ticket",  path: "/CustomerPortalMain", color: "#8B1A1A" },
                ].map(({ label, path, color }) => (
                  <Link key={label} to={path}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02]"
                    style={{ background: `${color}10`, border: `1px solid ${color}25`, color }}>
                    <ArrowRight className="w-3 h-3" />
                    {label}
                  </Link>
                ))}
              </div>

              {/* Bottom corner brackets */}
              <div className="relative mt-6 pt-5 flex items-center justify-between"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="absolute bottom-0 left-0 w-4 h-4" style={{ borderBottom: "1.5px solid rgba(139,26,26,0.35)", borderLeft: "1.5px solid rgba(139,26,26,0.35)" }} />
                <div className="absolute bottom-0 right-0 w-4 h-4" style={{ borderBottom: "1.5px solid rgba(139,26,26,0.35)", borderRight: "1.5px solid rgba(139,26,26,0.35)" }} />
                <div className="flex items-center gap-2 mx-auto">
                  <a href="mailto:support@touchnet.co.za"
                    className="flex items-center gap-1.5 text-[10px] font-semibold transition-all hover:scale-105"
                    style={{ color: "rgba(0,212,212,0.4)" }}>
                    <Mail className="w-3 h-3" /> support@touchnet.co.za
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Below card — features */}
          <div className="mt-6 space-y-2">
            {[
              { icon: CheckCircle2, text: "Sage Business Cloud integrated billing", color: "#10b981" },
              { icon: Activity,     text: "Real-time network & node monitoring",    color: "#00b4b4" },
              { icon: Shield,       text: "Role-based access for every department", color: "#8B1A1A" },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Nav links */}
          <div className="mt-6 flex items-center justify-center gap-4 text-[11px]"
            style={{ color: "rgba(255,255,255,0.2)" }}>
            <Link to="/about" className="hover:text-teal-400 transition-colors" style={{ color: "inherit" }}>About</Link>
            <span>·</span>
            <Link to="/contact" className="hover:text-teal-400 transition-colors" style={{ color: "inherit" }}>Contact</Link>
            <span>·</span>
            <span>© {new Date().getFullYear()} TouchNet</span>
          </div>
        </div>
      </div>
    </div>
  );
}