import React from "react";
import { Link } from "react-router-dom";
import { Wifi, Users, BarChart3, Network, ArrowRight } from "lucide-react";

const LOGO_WHITE   = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/b3b518de6_Touchnet_LogoLongWhite.png";
const LOGO_TEAL    = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/fa247a9df_Touchnet_LogoLongTeal.png";
const LOGO_MAROON  = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/644418237_Touchnet_LogoLongMaroon.png";

export default function About() {
  return (
    <div className="min-h-screen page-bg">
      {/* Simple top nav */}
      <header className="top-bar top-bar-futuristic h-[60px] flex items-center justify-between px-6 sticky top-0 z-30">
        <Link to="/">
          <img src={LOGO_WHITE} alt="TouchNet" className="h-6 object-contain" style={{ opacity: 0.95 }} />
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/about" className="text-[13px] font-bold" style={{ color: "#00b4b4" }}>About</Link>
          <Link to="/contact" className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>Contact</Link>
          <Link to="/" className="text-[12px] font-bold px-4 py-2 rounded-xl"
            style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", color: "#fff", boxShadow: "0 4px 16px rgba(0,180,180,0.3)" }}>
            Sign In
          </Link>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider"
            style={{ background: "rgba(0,180,180,0.1)", color: "#00b4b4", border: "1px solid rgba(0,180,180,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00b4b4" }} />
            About TouchNet TMS
          </span>
          <h1 className="text-4xl font-black" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#f0f0f0" }}>
            The All-in-One Management Platform<br />Built for African ISPs
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.75 }}>
            TouchNet TMS is a comprehensive telecommunications management system purpose-built for internet service providers operating across South Africa and the broader African continent.
          </p>
        </section>

        {/* What it does */}
        <section className="rounded-2xl p-8 space-y-5"
          style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.18)" }}>
          <div className="h-[2px] -mx-8 -mt-8 mb-6 rounded-t-2xl" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,#e02347,transparent)" }} />
          <h2 style={{ color: "#f0f0f0" }}>What TouchNet TMS Does</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
            TouchNet TMS brings together every operational department of an ISP into a single, unified platform. From the moment a sales lead comes in, through fibre project deployment, customer onboarding, billing, and ongoing technical support — every workflow is tracked, automated, and visible in real time.
          </p>
          <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
            The platform provides a live network operations dashboard with node monitoring, uptime tracking, and bandwidth analytics. A fully integrated billing module handles invoice generation, payment tracking, overdue alerts, and Sage Business Cloud synchronisation. The support helpdesk manages tickets with SLA enforcement, automatic escalation, and department routing. Fibre project management tracks installations from quote through civil build to go-live, with milestone tracking, vendor purchase orders, and engineer scheduling. An AI-powered assistant helps staff answer customer queries, generate reports, and automate repetitive tasks.
          </p>
          <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
            Customers access a self-service portal where they can view their invoices, log support tickets, track their fibre installation progress, check their service plan, and submit referrals. Role-based access control ensures each team member — from finance to field engineers — only sees what they need.
          </p>
        </section>

        {/* Who it's for */}
        <section className="space-y-6">
          <h2 style={{ color: "#f0f0f0" }}>Who It's For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Network,    title: "ISP Operations Teams",  desc: "Network engineers and NOC teams monitoring infrastructure 24/7 across multiple sites and nodes." },
              { icon: Users,      title: "Customer Success",       desc: "Support agents managing tickets, resolving connectivity issues, and keeping customers informed." },
              { icon: BarChart3,  title: "Finance & Management",   desc: "Billing teams, executives, and managers needing real-time revenue reports and operational KPIs." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-5 space-y-3"
                style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.15)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(0,180,180,0.12)", border: "1px solid rgba(0,180,180,0.25)" }}>
                  <Icon className="w-5 h-5" style={{ color: "#00b4b4" }} />
                </div>
                <h3 style={{ color: "#f0f0f0", fontSize: 14 }}>{title}</h3>
                <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who builds it */}
        <section className="rounded-2xl p-8 space-y-4"
          style={{ background: "#1a1a1a", border: "1px solid rgba(139,26,26,0.18)" }}>
          <div className="h-[2px] -mx-8 -mt-8 mb-6 rounded-t-2xl" style={{ background: "linear-gradient(90deg,#8B1A1A,#a52020,transparent)" }} />
          <h2 style={{ color: "#f0f0f0" }}>Who Builds It</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
            TouchNet TMS is developed and maintained by TouchNet — a South African technology company specialising in telecommunications software, network infrastructure, and managed connectivity solutions. Our team combines deep ISP industry knowledge with modern software engineering to deliver a platform that understands the unique challenges of African internet service providers: load-shedding resilience, last-mile diversity, ZAR-native billing, and multi-technology networks spanning fibre, wireless, and LTE.
          </p>
          <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
            We build TouchNet TMS for ourselves and for ISPs like us — operators who need a powerful, fast, and reliable system without the complexity or cost of enterprise platforms designed for a different market.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center space-y-4">
          <Link to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 20px rgba(0,180,180,0.3)" }}>
            Get in Touch <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}>
        <p className="text-[12px]">© {new Date().getFullYear()} TouchNet. All rights reserved.</p>
        <nav className="flex gap-4 text-[12px]">
          <Link to="/" style={{ color: "rgba(255,255,255,0.4)" }}>Home</Link>
          <Link to="/about" style={{ color: "#00b4b4" }}>About</Link>
          <Link to="/contact" style={{ color: "rgba(255,255,255,0.4)" }}>Contact</Link>
        </nav>
      </footer>
    </div>
  );
}