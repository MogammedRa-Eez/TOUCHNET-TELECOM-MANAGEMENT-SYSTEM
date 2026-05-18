import React from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, FileText, Users, Receipt, MapPin, ArrowRight, Zap, TrendingUp, Shield, Phone, Activity } from "lucide-react";

const LOGO_WORDMARK = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/b3b518de6_Touchnet_LogoLongWhite.png";
const LOGO_BADGE    = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/639b91697_Touchnet-CrestDesogm_CrestFinalFullWhite.png";

const MODULES = [
  { icon: LayoutDashboard, label: "Dashboard",    desc: "KPIs, revenue charts, real-time activity", path: "/sales/dashboard", color: "#00b4b4" },
  { icon: FileText,        label: "Quotes",       desc: "Build, send & track sales proposals",       path: "/sales/quotes",    color: "#10b981" },
  { icon: Users,           label: "Customers",    desc: "Manage accounts, plans & health scores",    path: "/sales/customers", color: "#6366f1" },
  { icon: Receipt,         label: "Billing",      desc: "Invoices, revenue breakdown & aging",       path: "/sales/billing",   color: "#f59e0b" },
  { icon: MapPin,          label: "Coverage Map", desc: "Fibre feasibility & coverage checking",     path: "/sales/coverage",  color: "#e02347" },
];

export default function SalesHome() {
  return (
    <div className="min-h-screen p-5 lg:p-10 space-y-8 max-w-[1200px] mx-auto">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl px-8 py-10"
        style={{ background: "linear-gradient(135deg,#141414,#1a1a1a,#141414)", border: "1px solid rgba(0,212,212,0.28)", boxShadow: "0 8px 60px rgba(0,0,0,0.6)" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg,transparent,#00b4b4,#00d4d4,rgba(255,255,255,0.7),#00d4d4,#00b4b4,#e02347,transparent)", backgroundSize: "300% auto", animation: "border-rotate 5s ease infinite" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(0,212,212,0.05) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute top-0 right-0 w-96 h-64 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(0,212,212,0.12) 0%, transparent 60%)" }} />

        {/* Corner brackets */}
        <div className="absolute top-4 left-4 w-6 h-6 pointer-events-none" style={{ borderTop: "2px solid rgba(0,212,212,0.5)", borderLeft: "2px solid rgba(0,212,212,0.5)" }} />
        <div className="absolute top-4 right-4 w-6 h-6 pointer-events-none" style={{ borderTop: "2px solid rgba(224,35,71,0.4)", borderRight: "2px solid rgba(224,35,71,0.4)" }} />
        <div className="absolute bottom-4 left-4 w-6 h-6 pointer-events-none" style={{ borderBottom: "2px solid rgba(0,212,212,0.3)", borderLeft: "2px solid rgba(0,212,212,0.3)" }} />
        <div className="absolute bottom-4 right-4 w-6 h-6 pointer-events-none" style={{ borderBottom: "2px solid rgba(224,35,71,0.3)", borderRight: "2px solid rgba(224,35,71,0.3)" }} />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,rgba(0,180,180,0.15),rgba(139,26,26,0.08))", border: "1px solid rgba(0,212,212,0.3)", boxShadow: "0 0 40px rgba(0,180,180,0.2)" }}>
            <img src={LOGO_BADGE} alt="TouchNet" className="w-14 h-14 object-contain" style={{ opacity: 0.95 }} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <img src={LOGO_WORDMARK} alt="TouchNet" className="h-8 object-contain" style={{ opacity: 0.95 }} />
              <span className="text-[9px] font-black uppercase tracking-[0.28em] px-2.5 py-1 rounded-lg"
                style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
                Sales Prototype
              </span>
              <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.3em] px-2.5 py-1 rounded-lg"
                style={{ background: "rgba(0,180,180,0.12)", color: "#00d4d4", border: "1px solid rgba(0,212,212,0.3)", boxShadow: "0 0 12px rgba(0,180,180,0.15)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00d4d4", boxShadow: "0 0 6px #00d4d4" }} />
                LIVE
              </span>
            </div>
            <h1 className="text-3xl font-black leading-tight mb-2"
              style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk', sans-serif" }}>
              Sales Department<br />
              <span style={{ color: "#00d4d4" }}>Management System</span>
            </h1>
            <p className="text-[14px] max-w-xl" style={{ color: "rgba(255,255,255,0.45)" }}>
              This prototype contains the core tools for the sales team — quoting, customer management, billing and coverage checking. Use it for feedback and testing before the full TMS rollout.
            </p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="relative mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Zap,       label: "Quote Builder",       color: "#10b981" },
            { icon: TrendingUp,label: "Pipeline Analytics",  color: "#00b4b4" },
            { icon: Shield,    label: "Customer Health",     color: "#6366f1" },
            { icon: Phone,     label: "Coverage Checker",    color: "#e02347" },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
              style={{ background: `${f.color}0a`, border: `1px solid ${f.color}20` }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                <f.icon className="w-3.5 h-3.5" style={{ color: f.color }} />
              </div>
              <span className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Module cards */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-4 mono" style={{ color: "rgba(0,212,212,0.5)" }}>
          ◈ Available Modules
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map(mod => (
            <Link key={mod.path} to={mod.path}
              className="relative overflow-hidden rounded-2xl px-5 py-5 flex flex-col gap-3 group transition-all duration-200 hover:-translate-y-1"
              style={{ background: "#181818", border: `1px solid ${mod.color}28`, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${mod.color}55`; e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.5), 0 0 24px ${mod.color}12`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${mod.color}28`; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.4)"; }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, ${mod.color}, transparent)` }} />
              <div className="absolute -bottom-4 -right-4 w-20 h-20 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${mod.color}15, transparent 70%)` }} />

              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: `${mod.color}18`, border: `1px solid ${mod.color}30` }}>
                <mod.icon className="w-5 h-5" style={{ color: mod.color }} />
              </div>
              <div>
                <p className="text-[15px] font-black" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk', sans-serif" }}>{mod.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{mod.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold mt-auto"
                style={{ color: mod.color }}>
                Open module <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Feedback notice */}
      <div className="relative overflow-hidden rounded-2xl px-5 py-4 flex items-start gap-3"
        style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg,#f59e0b,rgba(245,158,11,0.5),transparent)" }} />
        <div className="absolute top-3 left-3 w-4 h-4 pointer-events-none" style={{ borderTop: "1px solid rgba(245,158,11,0.4)", borderLeft: "1px solid rgba(245,158,11,0.4)" }} />
        <div className="absolute bottom-3 right-3 w-4 h-4 pointer-events-none" style={{ borderBottom: "1px solid rgba(245,158,11,0.3)", borderRight: "1px solid rgba(245,158,11,0.3)" }} />
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
          <Zap className="w-4 h-4" style={{ color: "#f59e0b" }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[13px] font-bold" style={{ color: "#f0f0f0" }}>Prototype for Feedback & Testing</p>
            <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}>
              <Activity className="w-2.5 h-2.5" /> Sales Dept
            </span>
          </div>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            This is a scoped prototype for the Sales department only. Please test all features and provide feedback before the full TouchNet TMS rollout. Changes made here use the same live database.
          </p>
        </div>
      </div>
    </div>
  );
}