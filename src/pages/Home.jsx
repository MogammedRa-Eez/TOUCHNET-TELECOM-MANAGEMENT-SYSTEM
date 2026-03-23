import React, { useEffect, useState } from "react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Wifi, Shield, Zap, LogIn, Loader2, Network, Globe, TicketCheck,
  Users, BarChart3, Activity, ChevronRight, CheckCircle2, Phone, Mail, MapPin
} from "lucide-react";
import CinematicShowcase from "@/components/home/CinematicShowcase";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

const FEATURES = [
  {
    icon: Network,
    title: "Fibre Project Management",
    desc: "Track every fibre project from lead to go-live with milestone-based workflows and approval gates.",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.1)",
  },
  {
    icon: Globe,
    title: "Real-Time Network Monitoring",
    desc: "Live visibility into every network node — online, degraded or offline — with instant alerting.",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
  },
  {
    icon: TicketCheck,
    title: "Smart Helpdesk",
    desc: "Multi-department ticketing with SLA tracking, priority triage, and full resolution history.",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
  },
  {
    icon: Users,
    title: "Customer Portal",
    desc: "Customers can log tickets, view their account, track their service status and billing in one place.",
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
  },
  {
    icon: BarChart3,
    title: "Billing & Invoicing",
    desc: "Automated monthly billing, Sage Business Cloud sync, and real-time revenue reporting.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
  },
  {
    icon: Shield,
    title: "Role-Based Access Control",
    desc: "Granular permission sets per team — sales, finance, technical and more — keeping data secure.",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
  },
];

const STATS = [
  { value: "99.9%", label: "Network Uptime" },
  { value: "< 2h", label: "Avg Ticket Resolution" },
  { value: "500+", label: "Active Customers" },
  { value: "24/7", label: "Support Coverage" },
];

export default function Home() {
  const [status, setStatus] = useState("loading"); // loading | ready

  useEffect(() => {
    setStatus("ready");
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#060d1f" }}>
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#060d1f", fontFamily: "'Inter', sans-serif" }}>

      {/* Ambient background shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }} />
        <div className="absolute -bottom-20 left-1/3 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
      </div>

      {/* ── NAVBAR ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 h-[72px]"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <img src={LOGO_URL} alt="TouchNet" className="h-9 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 font-semibold px-3 py-1.5 rounded-full"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", fontFamily: "monospace" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            NETWORK LIVE · 99.9%
          </span>
          <button
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Home"))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-24">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-300"
          style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)" }}>
          <Activity className="w-3.5 h-3.5" />
          TOUCHNET TELECOMMUNICATION MANAGEMENT SYSTEM
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight max-w-4xl">
          One Platform to Run Your
          <span className="block mt-1" style={{
            background: "linear-gradient(90deg, #6366f1, #a78bfa, #3b82f6)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            Entire ISP Operation
          </span>
        </h1>
        <p className="mt-6 text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed">
          TouchNet gives your team real-time network visibility, end-to-end fibre project tracking, smart helpdesk management, and seamless customer billing — all in one place.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Home"))}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 8px 32px rgba(99,102,241,0.45)" }}>
            Get Started
            <ChevronRight className="w-4 h-4" />
          </button>
          <a href={`mailto:support@touchnet.co.za`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-300 text-sm transition-all hover:text-white"
            style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}>
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
            <div key={s.label} className="rounded-2xl p-5 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-3xl font-extrabold text-white mb-1">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 px-6 md:px-12 py-16"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Everything Your ISP Needs</h2>
            <p className="mt-3 text-slate-400 text-sm">Purpose-built modules that work together seamlessly.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl p-6 transition-all hover:scale-[1.02] cursor-default"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: f.bg }}>
                    <Icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHY TOUCHNET ── */}
      <section className="relative z-10 px-6 md:px-12 py-16"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl p-8 md:p-12"
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))", border: "1px solid rgba(99,102,241,0.2)" }}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-4">Built for African ISPs</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-8 max-w-2xl">
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
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 px-6 md:px-12 py-20 text-center"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3">Ready to get started?</h2>
        <p className="text-slate-400 text-sm mb-8">Sign in with your staff or customer account to access the platform.</p>
        <button
          onClick={() => base44.auth.redirectToLogin(createPageUrl("Home"))}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 8px 32px rgba(99,102,241,0.4)" }}>
          <LogIn className="w-4 h-4" />
          Sign In to TouchNet
        </button>
        <p className="mt-4 text-xs text-slate-600">Staff and customers use the same sign-in — you'll be directed to your portal automatically.</p>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 px-6 md:px-12 py-8"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <img src={LOGO_URL} alt="TouchNet" className="h-7 object-contain" style={{ filter: "brightness(0) invert(1)", opacity: 0.6 }} />
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> support@touchnet.co.za</span>
            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> +27 (0) 12 345 6789</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> South Africa</span>
          </div>
          <p className="text-[10px] text-slate-700" style={{ fontFamily: "monospace" }}>© TOUCHNET v2.4.1 · All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}