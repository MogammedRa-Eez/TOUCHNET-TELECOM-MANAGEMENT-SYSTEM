import React, { useEffect, useState } from "react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Wifi, Shield, Zap, LogIn, Loader2, Network, Globe, TicketCheck,
  Users, BarChart3, Activity, ChevronRight, CheckCircle2, Phone, Mail, MapPin, TrendingUp
} from "lucide-react";
import CinematicShowcase from "@/components/home/CinematicShowcase";

const LOGO_WHITE        = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/b3b518de6_Touchnet_LogoLongWhite.png";
const LOGO_TEAL         = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/fa247a9df_Touchnet_LogoLongTeal.png";
const LOGO_MAROON       = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/644418237_Touchnet_LogoLongMaroon.png";
const LOGO_BLACK        = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/cc31cbbda_Touchnet_LogoLongBlack.png";
const CREST_WHITE       = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/639b91697_Touchnet-CrestDesogm_CrestFinalFullWhite.png";
const CREST_BLACK       = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/c45eb271a_Touchnet-CrestDesogm_CrestFinalFullBlack.png";
const CREST_OUTLINE     = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/1a6cf59be_Touchnet-CrestDesogm_CrestFinalBlackOutlines.png";

const NAVY   = "#00b4b4";
const CRIMSN = "#8B1A1A";
const TEAL_L = "#00d4d4";
// eslint-disable-next-line no-unused-vars
const _LOGO_BLACK = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/cc31cbbda_Touchnet_LogoLongBlack.png";

const FEATURES = [
  { icon: Network,    title: "Fibre Project Management",      desc: "Track every fibre project from lead to go-live with milestone-based workflows and approval gates.",            color: NAVY,     bg: "rgba(0,180,180,0.08)" },
  { icon: Globe,      title: "Real-Time Network Monitoring",  desc: "Live visibility into every network node — online, degraded or offline — with instant multi-channel alerting.", color: "#0ea5e9", bg: "rgba(14,165,233,0.08)" },
  { icon: TicketCheck,title: "Smart Helpdesk",                desc: "Multi-department ticketing with SLA tracking, priority triage, and full resolution history.",                  color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
  { icon: Users,      title: "Customer Portal",               desc: "Customers can log tickets, view their account, track their service status and billing in one place.",           color: "#059669", bg: "rgba(5,150,105,0.08)" },
  { icon: BarChart3,  title: "Billing & Invoicing",           desc: "Automated monthly billing, Sage Business Cloud sync, and real-time revenue reporting.",                        color: "#d97706", bg: "rgba(217,119,6,0.08)" },
  { icon: Shield,     title: "Role-Based Access Control",     desc: "Granular permission sets per team — sales, finance, technical and more — keeping data secure.",                color: CRIMSN,   bg: "rgba(139,26,26,0.08)" },
];

const STATS = [
  { value: "99.9%", label: "Network Uptime" },
  { value: "< 2h",  label: "Avg Ticket Resolution" },
  { value: "500+",  label: "Active Customers" },
  { value: "24/7",  label: "Support Coverage" },
];

export default function Home() {
  const [status, setStatus] = useState("loading");

  useEffect(() => { setStatus("ready"); }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f1730" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#4a5fa8" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0a0f0f", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full opacity-25"
          style={{ background: `radial-gradient(circle, rgba(0,180,180,0.5) 0%, transparent 70%)` }} />
        <div className="absolute top-1/4 -right-40 w-[700px] h-[700px] rounded-full opacity-18"
          style={{ background: `radial-gradient(circle, rgba(0,212,212,0.4) 0%, transparent 70%)` }} />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-18"
          style={{ background: `radial-gradient(circle, rgba(139,26,26,0.55) 0%, transparent 70%)` }} />
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, rgba(139,26,26,0.4) 0%, transparent 70%)` }} />
        {/* Dot grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,212,212,0.1) 1px, transparent 0)`,
            backgroundSize: "28px 28px", opacity: 0.7
          }} />
        {/* Larger grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0,180,180,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,180,0.035) 1px, transparent 1px)`,
            backgroundSize: "80px 80px"
          }} />
        {/* Scanlines */}
        <div className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,212,212,0.5) 3px, rgba(0,212,212,0.5) 4px)`
          }} />
        {/* Diagonal accent */}
        <div className="absolute top-0 right-0 w-[600px] h-[3px] origin-top-right rotate-[30deg]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,212,0.3), transparent)", transformOrigin: "top right" }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[2px] origin-bottom-left rotate-[-20deg]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(139,26,26,0.3), transparent)", transformOrigin: "bottom left" }} />
      </div>

      {/* ── NAVBAR ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 h-[72px]"
        style={{ borderBottom: "1px solid rgba(0,180,180,0.18)", background: "rgba(8,12,12,0.96)", backdropFilter: "blur(32px)" }}>
        {/* Animated accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg,#8B1A1A,#00b4b4,#00d4d4,rgba(255,255,255,0.7),#00b4b4,#8B1A1A)", backgroundSize: "300% auto", animation: "border-rotate 6s ease infinite" }} />
        {/* Corner accents */}
        <div className="absolute bottom-0 left-0 w-20 h-px" style={{ background: "linear-gradient(90deg,rgba(0,212,212,0.5),transparent)" }} />
        <div className="absolute bottom-0 right-0 w-20 h-px" style={{ background: "linear-gradient(270deg,rgba(139,26,26,0.5),transparent)" }} />

        <div className="flex items-center gap-3">
          <img src={LOGO_TEAL} alt="TouchNet" className="h-9 object-contain" style={{ opacity: 0.97 }} />
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background: "rgba(0,212,212,0.06)", border: "1px solid rgba(0,212,212,0.18)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00d4d4", boxShadow: "0 0 6px #00d4d4" }} />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] mono" style={{ color: "#00d4d4" }}>TMS v3.0</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full teal-chip"
            style={{ fontFamily: "monospace" }}>
            <span className="w-1.5 h-1.5 rounded-full teal-pulse" style={{ background: "#00d4d4" }} />
            NETWORK LIVE · 99.9%
          </span>
          <button
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Home"))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 ripple-btn"
            style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 24px rgba(0,180,180,0.45)", border: "1px solid rgba(0,212,212,0.3)" }}>
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-14 pb-20">

        {/* ── Crest hero centrepiece ── */}
        <div className="relative flex items-center justify-center mb-10">
          {/* Outer glow rings */}
          <div className="absolute w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,180,180,0.18) 0%, transparent 65%)", animation: "pulse-navy 3s ease-in-out infinite" }} />
          <div className="absolute w-52 h-52 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(139,26,26,0.12) 0%, transparent 65%)", animation: "pulse-crimson 4s ease-in-out infinite" }} />
          {/* Rotating orbit ring */}
          <div className="absolute w-60 h-60 rounded-full border pointer-events-none"
            style={{ borderColor: "rgba(0,212,212,0.15)", borderStyle: "dashed", animation: "border-spin 20s linear infinite" }} />
          {/* Crest container */}
          <div className="relative w-44 h-44 rounded-3xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(0,180,180,0.12) 0%, rgba(0,0,0,0.4) 50%, rgba(139,26,26,0.08) 100%)",
              border: "1px solid rgba(0,212,212,0.3)",
              boxShadow: "0 0 60px rgba(0,180,180,0.2), 0 0 120px rgba(139,26,26,0.08), inset 0 1px 0 rgba(255,255,255,0.06)"
            }}>
            {/* Corner brackets */}
            <div className="absolute top-3 left-3 w-5 h-5" style={{ borderTop: "2px solid rgba(0,212,212,0.6)", borderLeft: "2px solid rgba(0,212,212,0.6)" }} />
            <div className="absolute top-3 right-3 w-5 h-5" style={{ borderTop: "2px solid rgba(0,212,212,0.6)", borderRight: "2px solid rgba(0,212,212,0.6)" }} />
            <div className="absolute bottom-3 left-3 w-5 h-5" style={{ borderBottom: "2px solid rgba(139,26,26,0.5)", borderLeft: "2px solid rgba(139,26,26,0.5)" }} />
            <div className="absolute bottom-3 right-3 w-5 h-5" style={{ borderBottom: "2px solid rgba(139,26,26,0.5)", borderRight: "2px solid rgba(139,26,26,0.5)" }} />
            <img src={CREST_WHITE} alt="TouchNet Crest" className="w-28 h-28 object-contain"
              style={{ filter: "drop-shadow(0 0 20px rgba(0,212,212,0.5)) drop-shadow(0 0 40px rgba(0,180,180,0.2))", opacity: 0.95 }} />
          </div>
        </div>

        {/* Motto ribbon */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,212,0.4))" }} />
          <span className="text-[9px] font-black uppercase tracking-[0.35em] mono" style={{ color: "rgba(0,212,212,0.5)" }}>BUILD · CONNECT · PROTECT</span>
          <div className="h-px w-16" style={{ background: "linear-gradient(90deg, rgba(0,212,212,0.4), transparent)" }} />
        </div>

        {/* Logo + version */}
        <div className="flex items-center gap-3 mb-4">
          <img src={LOGO_TEAL} alt="TouchNet" className="h-10 object-contain" style={{ opacity: 0.97 }} />
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ background: "rgba(0,212,212,0.06)", border: "1px solid rgba(0,212,212,0.18)" }}>
              <span className="w-1.5 h-1.5 rounded-full teal-pulse" style={{ background: "#00d4d4" }} />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] mono" style={{ color: "#00d4d4" }}>TMS v3.0</span>
            </div>
          </div>
        </div>

        {/* Futuristic badge */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-xs font-bold teal-glass"
          style={{ color: "#a0f0f0" }}>
          <Activity className="w-3.5 h-3.5" style={{ color: "#00d4d4" }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.12em" }}>
            TELECOMMUNICATION MANAGEMENT SYSTEM
          </span>
          <span className="w-1.5 h-1.5 rounded-full teal-pulse" style={{ background: "#00d4d4", flexShrink: 0 }} />
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight max-w-4xl">
          One Platform to Run Your
          <span className="block mt-1" style={{
            background: "linear-gradient(90deg, #00b4b4, #00d4d4, rgba(255,255,255,0.9), #00b4b4, #8B1A1A, #a52020)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundSize: "200% auto", animation: "border-rotate 4s ease infinite"
          }}>
            Entire ISP Operation
          </span>
        </h1>

        <p className="mt-6 text-base md:text-lg max-w-2xl leading-relaxed" style={{ color: "rgba(200,240,240,0.7)" }}>
          TouchNet gives your team real-time network visibility, end-to-end fibre project tracking, smart helpdesk management, and seamless customer billing — all in one place.
        </p>

        {/* Brand colour chips */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {[
            { label: "South Africa's ISP OS", color: "rgba(0,212,212,0.12)", border: "rgba(0,212,212,0.3)", text: "#00d4d4" },
            { label: "Sage Integrated",        color: "rgba(139,26,26,0.1)",  border: "rgba(139,26,26,0.3)",  text: "#c23030" },
            { label: "AI-Powered",             color: "rgba(0,212,212,0.08)", border: "rgba(0,212,212,0.2)",  text: "#00b4b4" },
            { label: "99.9% SLA",              color: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)",text: "#34d399" },
          ].map(tag => (
            <span key={tag.label} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
              style={{ fontFamily: "monospace", background: tag.color, border: `1px solid ${tag.border}`, color: tag.text }}>
              {tag.label}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Home"))}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 active:scale-95 ripple-btn"
            style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 8px 32px rgba(0,180,180,0.5)", border: "1px solid rgba(0,212,212,0.4)" }}>
            Get Started
            <ChevronRight className="w-4 h-4" />
          </button>
          <a href="mailto:support@touchnet.co.za"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
            style={{ border: "1px solid rgba(139,26,26,0.4)", color: "#c23030", background: "rgba(139,26,26,0.08)", backdropFilter: "blur(8px)" }}>
            <Phone className="w-4 h-4" />
            Contact Us
          </a>
        </div>

        {/* Live metrics strip */}
        <div className="mt-12 flex flex-wrap gap-3 justify-center">
          {[
            { val: "99.9%", lbl: "Network Uptime", color: "#10b981",  icon: "⚡" },
            { val: "< 2h",  lbl: "Ticket SLA",     color: "#00d4d4",  icon: "🎯" },
            { val: "500+",  lbl: "Customers",       color: "#a0f0f0",  icon: "👥" },
            { val: "24/7",  lbl: "Monitoring",      color: "#f59e0b",  icon: "🛡️" },
            { val: "R0",    lbl: "Revenue Leakage", color: "#34d399",  icon: "📊" },
          ].map(m => (
            <div key={m.lbl} className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl teal-glass cursor-default transition-all hover:scale-105"
              style={{ border: `1px solid ${m.color}25` }}>
              <span className="text-base">{m.icon}</span>
              <div>
                <span className="text-lg font-black mono block leading-none" style={{ color: m.color, fontFamily: "'JetBrains Mono',monospace", textShadow: `0 0 16px ${m.color}60` }}>{m.val}</span>
                <span className="text-[9px] uppercase tracking-wider block mt-0.5" style={{ color: "rgba(160,240,240,0.5)" }}>{m.lbl}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CINEMATIC SHOWCASE ── */}
      <section className="relative z-10 px-6 md:px-12 pb-20">
        <CinematicShowcase />
      </section>

      {/* Stats band removed — merged into hero metrics strip above */}

      {/* ── FEATURES ── */}
      <section className="relative z-10 px-6 md:px-12 py-16"
        style={{ borderTop: "1px solid rgba(0,180,180,0.15)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full teal-chip text-[10px] font-black mono uppercase tracking-widest">
              <Zap className="w-3 h-3" /> Platform Modules
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Everything Your ISP Needs</h2>
            <p className="mt-3 text-sm" style={{ color: "rgba(160,240,240,0.5)" }}>Purpose-built modules that work together seamlessly.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="relative overflow-hidden rounded-2xl p-6 transition-all hover:-translate-y-1 group cursor-default teal-glass holo-card"
                  style={{ border: `1px solid ${f.color}22` }}>
                  <div className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: `linear-gradient(90deg,${f.color},rgba(255,255,255,0.3),transparent)` }} />
                  <div className="absolute bottom-2.5 right-2.5 w-3 h-3 pointer-events-none"
                    style={{ borderBottom: `1.5px solid ${f.color}40`, borderRight: `1.5px solid ${f.color}40` }} />
                  <div className="absolute top-2.5 left-2.5 w-3 h-3 pointer-events-none"
                    style={{ borderTop: `1.5px solid rgba(0,212,212,0.3)`, borderLeft: `1.5px solid rgba(0,212,212,0.3)` }} />
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                    style={{ background: f.bg, border: `1px solid ${f.color}25`, boxShadow: `0 4px 16px ${f.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(160,240,240,0.5)" }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHY TOUCHNET ── */}
      <section className="relative z-10 px-6 md:px-12 py-16"
        style={{ borderTop: "1px solid rgba(0,180,180,0.15)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 teal-glass teal-shimmer-border">
            <div className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: "linear-gradient(90deg,#00b4b4,rgba(255,255,255,0.5),#00d4d4,#e02347,transparent)" }} />
            <div className="absolute bottom-5 right-5 w-5 h-5 pointer-events-none"
              style={{ borderBottom: `2px solid rgba(224,35,71,0.4)`, borderRight: `2px solid rgba(224,35,71,0.4)` }} />
            <div className="absolute top-5 left-5 w-5 h-5 pointer-events-none"
              style={{ borderTop: `2px solid rgba(0,212,212,0.5)`, borderLeft: `2px solid rgba(0,212,212,0.5)` }} />

            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-4">Built for African ISPs</h2>
            <p className="text-sm leading-relaxed mb-8 max-w-2xl" style={{ color: "rgba(180,240,240,0.65)" }}>
              TouchNet was designed from the ground up for South African ISPs — with Sage Business Cloud billing integration, ZAR-native reporting, multi-department operations, and role-based access control that scales with your team.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Sage Business Cloud integration",
                "ZAR billing & revenue tracking",
                "Multi-department role permissions",
                "AI-powered helpdesk assistant",
                "Fibre project lifecycle management",
                "Customer self-service portal",
              ].map(item => (
                <div key={item} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all hover:bg-white/5"
                  style={{ background: "rgba(0,180,180,0.04)", border: "1px solid rgba(0,180,180,0.1)" }}>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#00d4d4" }} />
                  <span className="text-sm" style={{ color: "rgba(180,240,240,0.8)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 px-6 md:px-12 py-20 text-center"
        style={{ borderTop: "1px solid rgba(0,180,180,0.15)" }}>
        <div className="relative inline-flex flex-col items-center">
          {/* Crest + motto */}
          <div className="relative mb-8 flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,rgba(0,180,180,0.1),rgba(139,26,26,0.08))",
                border: "1px solid rgba(0,212,212,0.25)",
                boxShadow: "0 0 40px rgba(0,180,180,0.15)"
              }}>
              <img src={CREST_WHITE} alt="TouchNet Crest" className="w-16 h-16 object-contain"
                style={{ filter: "drop-shadow(0 0 12px rgba(0,212,212,0.4))", opacity: 0.9 }} />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,212,0.4))" }} />
              <span className="text-[8px] font-black uppercase tracking-[0.3em] mono" style={{ color: "rgba(0,212,212,0.4)" }}>BUILD · CONNECT · PROTECT</span>
              <div className="h-px w-10" style={{ background: "linear-gradient(90deg, rgba(0,212,212,0.4), transparent)" }} />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3">Ready to get started?</h2>
          <p className="text-sm mb-8" style={{ color: "rgba(160,240,240,0.5)" }}>Sign in with your staff or customer account to access the platform.</p>
          <button
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Home"))}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95 ripple-btn"
            style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a,#8B1A1A)", backgroundSize: "200% auto", animation: "border-rotate 4s ease infinite", boxShadow: "0 8px 40px rgba(0,180,180,0.4)", border: "1px solid rgba(0,212,212,0.4)" }}>
            <LogIn className="w-4 h-4" />
            Sign In to TouchNet
          </button>
          <p className="mt-4 text-xs" style={{ color: "rgba(0,212,212,0.35)", fontFamily: "monospace" }}>
            Staff and customers use the same sign-in — you'll be directed to your portal automatically.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 px-6 md:px-12 py-8"
        style={{ borderTop: "1px solid rgba(0,180,180,0.15)", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={CREST_WHITE} alt="TouchNet Crest" className="h-8 w-8 object-contain" style={{ opacity: 0.4 }} />
            <img src={LOGO_WHITE} alt="TouchNet" className="h-7 object-contain" style={{ opacity: 0.5 }} />
            <span className="text-[8px] font-black mono px-2 py-0.5 rounded teal-chip" style={{ letterSpacing: "0.2em" }}>TMS v3.0</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs" style={{ color: "rgba(0,212,212,0.5)" }}>
            <span className="flex items-center gap-1.5 hover:text-teal-300 transition-colors cursor-pointer"><Mail className="w-3 h-3" /> support@touchnet.co.za</span>
            <span className="flex items-center gap-1.5 hover:text-teal-300 transition-colors cursor-pointer"><Phone className="w-3 h-3" /> +27 (0) 12 345 6789</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> South Africa</span>
          </div>
          <p className="text-[10px]" style={{ color: "rgba(0,180,180,0.3)", fontFamily: "monospace" }}>© TOUCHNET v3.0 · ALL RIGHTS RESERVED</p>
        </div>
      </footer>
    </div>
  );
}