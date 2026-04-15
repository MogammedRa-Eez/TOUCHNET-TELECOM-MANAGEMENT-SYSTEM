import React, { useEffect, useState } from "react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Wifi, Shield, Zap, LogIn, Loader2, Network, Globe, TicketCheck,
  Users, BarChart3, Activity, ChevronRight, CheckCircle2, Phone, Mail, MapPin
} from "lucide-react";
import CinematicShowcase from "@/components/home/CinematicShowcase";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

const NAVY  = "#1e2d6e";
const CRIMSN = "#c41e3a";

const FEATURES = [
  { icon: Network,    title: "Fibre Project Management",      desc: "Track every fibre project from lead to go-live with milestone-based workflows and approval gates.",                                                         color: NAVY,     bg: "rgba(30,45,110,0.08)" },
  { icon: Globe,      title: "Real-Time Network Monitoring",  desc: "Live visibility into every network node — online, degraded or offline — with instant multi-channel alerting.",                                             color: "#0ea5e9", bg: "rgba(14,165,233,0.08)" },
  { icon: TicketCheck,title: "Smart Helpdesk",                desc: "Multi-department ticketing with SLA tracking, priority triage, and full resolution history.",                                                               color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
  { icon: Users,      title: "Customer Portal",               desc: "Customers can log tickets, view their account, track their service status and billing in one place.",                                                        color: "#059669", bg: "rgba(5,150,105,0.08)" },
  { icon: BarChart3,  title: "Billing & Invoicing",           desc: "Automated monthly billing, Sage Business Cloud sync, and real-time revenue reporting.",                                                                      color: "#d97706", bg: "rgba(217,119,6,0.08)" },
  { icon: Shield,     title: "Role-Based Access Control",     desc: "Granular permission sets per team — sales, finance, technical and more — keeping data secure.",                                                             color: CRIMSN,   bg: "rgba(196,30,58,0.08)" },
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
    <div className="min-h-screen" style={{ background: "#0b1120", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-25"
          style={{ background: `radial-gradient(circle, ${NAVY} 0%, transparent 70%)` }} />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: `radial-gradient(circle, #2a3d8f 0%, transparent 70%)` }} />
        <div className="absolute -bottom-20 left-1/3 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${CRIMSN} 0%, transparent 70%)` }} />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(74,95,168,1) 1px, transparent 0)`,
            backgroundSize: "28px 28px"
          }} />
        {/* Larger grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(30,45,110,1) 1px, transparent 1px), linear-gradient(90deg, rgba(30,45,110,1) 1px, transparent 1px)`,
            backgroundSize: "80px 80px"
          }} />
      </div>

      {/* ── NAVBAR ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 h-[72px]"
        style={{ borderBottom: "1px solid rgba(30,45,110,0.3)", background: "rgba(11,17,32,0.92)", backdropFilter: "blur(20px)" }}>
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,#c41e3a,transparent)" }} />

        <img src={LOGO_URL} alt="TouchNet" className="h-9 object-contain" style={{ filter: "brightness(0) invert(1)", opacity: 0.95 }} />

        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: "rgba(5,150,105,0.12)", border: "1px solid rgba(5,150,105,0.3)", color: "#34d399", fontFamily: "monospace" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            NETWORK LIVE · 99.9%
          </span>
          <button
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Home"))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #1e2d6e, #2a3d8f)", boxShadow: "0 4px 20px rgba(30,45,110,0.5)", border: "1px solid rgba(74,95,168,0.4)" }}>
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-24">

        {/* Futuristic badge */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-bold"
          style={{ background: "rgba(30,45,110,0.2)", border: "1px solid rgba(74,95,168,0.4)", color: "#7dd3fc" }}>
          <Activity className="w-3.5 h-3.5" />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.12em" }}>
            TOUCHNET TELECOMMUNICATION MANAGEMENT SYSTEM
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight max-w-4xl">
          One Platform to Run Your
          <span className="block mt-1" style={{
            background: "linear-gradient(90deg, #4a5fa8, #7dd3fc, #c41e3a)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            Entire ISP Operation
          </span>
        </h1>

        <p className="mt-6 text-base md:text-lg max-w-2xl leading-relaxed" style={{ color: "rgba(203,213,225,0.75)" }}>
          TouchNet gives your team real-time network visibility, end-to-end fibre project tracking, smart helpdesk management, and seamless customer billing — all in one place.
        </p>

        {/* Futuristic data chips */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {["South Africa's ISP OS", "Sage Integrated", "AI-Powered", "99.9% SLA"].map(tag => (
            <span key={tag} className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ background: "rgba(30,45,110,0.18)", border: "1px solid rgba(74,95,168,0.3)", color: "rgba(147,197,253,0.7)", fontFamily: "monospace" }}>
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Home"))}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #1e2d6e, #2a3d8f)", boxShadow: "0 8px 32px rgba(30,45,110,0.6)", border: "1px solid rgba(74,95,168,0.4)" }}>
            Get Started
            <ChevronRight className="w-4 h-4" />
          </button>
          <a href="mailto:support@touchnet.co.za"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/10"
            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(203,213,225,0.7)", background: "rgba(255,255,255,0.03)" }}>
            <Phone className="w-4 h-4" />
            Contact Us
          </a>
        </div>
      </section>

      {/* ── CINEMATIC SHOWCASE ── */}
      <section className="relative z-10 px-6 md:px-12 pb-20">
        <CinematicShowcase />
      </section>

      {/* ── STATS BAND ── */}
      <section className="relative z-10 px-6 md:px-12 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="relative overflow-hidden rounded-2xl p-5 text-center group transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(30,45,110,0.1)", border: "1px solid rgba(74,95,168,0.25)" }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,transparent)" }} />
              <p className="text-3xl font-extrabold text-white mb-1"
                style={{ fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</p>
              <p className="text-xs font-medium" style={{ color: "rgba(147,197,253,0.6)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 px-6 md:px-12 py-16"
        style={{ borderTop: "1px solid rgba(30,45,110,0.3)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Everything Your ISP Needs</h2>
            <p className="mt-3 text-sm" style={{ color: "rgba(147,197,253,0.5)" }}>Purpose-built modules that work together seamlessly.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="relative overflow-hidden rounded-2xl p-6 transition-all hover:-translate-y-1 group cursor-default"
                  style={{ background: "rgba(30,45,110,0.07)", border: `1px solid ${f.color}20` }}>
                  <div className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: `linear-gradient(90deg,${f.color},transparent)` }} />
                  {/* Corner bracket */}
                  <div className="absolute bottom-2.5 right-2.5 w-3 h-3 pointer-events-none"
                    style={{ borderBottom: `1.5px solid ${CRIMSN}35`, borderRight: `1.5px solid ${CRIMSN}35` }} />
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                    style={{ background: f.bg, border: `1px solid ${f.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(147,197,253,0.5)" }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHY TOUCHNET ── */}
      <section className="relative z-10 px-6 md:px-12 py-16"
        style={{ borderTop: "1px solid rgba(30,45,110,0.3)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-8 md:p-12"
            style={{ background: "linear-gradient(135deg, rgba(30,45,110,0.18), rgba(42,61,143,0.1))", border: "1px solid rgba(74,95,168,0.3)" }}>
            {/* Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,#c41e3a,transparent)" }} />
            {/* Corner bracket bottom-right */}
            <div className="absolute bottom-5 right-5 w-5 h-5 pointer-events-none"
              style={{ borderBottom: `2px solid rgba(196,30,58,0.35)`, borderRight: `2px solid rgba(196,30,58,0.35)` }} />
            <div className="absolute top-5 left-5 w-5 h-5 pointer-events-none"
              style={{ borderTop: `2px solid rgba(74,95,168,0.4)`, borderLeft: `2px solid rgba(74,95,168,0.4)` }} />

            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-4">Built for African ISPs</h2>
            <p className="text-sm leading-relaxed mb-8 max-w-2xl" style={{ color: "rgba(203,213,225,0.65)" }}>
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
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#4a5fa8" }} />
                  <span className="text-sm" style={{ color: "rgba(203,213,225,0.75)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 px-6 md:px-12 py-20 text-center"
        style={{ borderTop: "1px solid rgba(30,45,110,0.3)" }}>

        {/* Futuristic animated ring */}
        <div className="relative inline-flex flex-col items-center">
          <div className="absolute inset-0 rounded-full neon-border pointer-events-none" style={{ width: 120, height: 120, left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3">Ready to get started?</h2>
          <p className="text-sm mb-8" style={{ color: "rgba(147,197,253,0.5)" }}>Sign in with your staff or customer account to access the platform.</p>
          <button
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Home"))}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #1e2d6e, #c41e3a)", boxShadow: "0 8px 40px rgba(30,45,110,0.5)", border: "1px solid rgba(196,30,58,0.3)" }}>
            <LogIn className="w-4 h-4" />
            Sign In to TouchNet
          </button>
          <p className="mt-4 text-xs" style={{ color: "rgba(147,197,253,0.35)", fontFamily: "monospace" }}>
            Staff and customers use the same sign-in — you'll be directed to your portal automatically.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 px-6 md:px-12 py-8"
        style={{ borderTop: "1px solid rgba(30,45,110,0.3)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <img src={LOGO_URL} alt="TouchNet" className="h-7 object-contain" style={{ filter: "brightness(0) invert(1)", opacity: 0.5 }} />
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs" style={{ color: "rgba(147,197,253,0.45)" }}>
            <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> support@touchnet.co.za</span>
            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> +27 (0) 12 345 6789</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> South Africa</span>
          </div>
          <p className="text-[10px]" style={{ color: "rgba(74,95,168,0.4)", fontFamily: "monospace" }}>© TOUCHNET v3.0 · ALL RIGHTS RESERVED</p>
        </div>
      </footer>
    </div>
  );
}