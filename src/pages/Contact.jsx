import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

const LOGO_WORDMARK = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/3ae578803_image0011.png";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { base44 } = await import("@/api/base44Client");
    await base44.integrations.Core.SendEmail({
      to: "info@touchnet.co.za",
      subject: `[TouchNet TMS Contact] ${form.subject || "New Enquiry"} — from ${form.name}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\nMessage:\n${form.message}`,
    });
    setSent(true);
  };

  return (
    <div className="min-h-screen page-bg">
      {/* Nav */}
      <header className="top-bar top-bar-futuristic h-[60px] flex items-center justify-between px-6 sticky top-0 z-30">
        <Link to="/">
          <img src={LOGO_WORDMARK} alt="TouchNet" className="h-6 object-contain"
            style={{ filter: "brightness(0) saturate(100%) invert(68%) sepia(99%) saturate(400%) hue-rotate(140deg) brightness(105%)" }} />
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/about" className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>About</Link>
          <Link to="/contact" className="text-[13px] font-bold" style={{ color: "#00b4b4" }}>Contact</Link>
          <Link to="/" className="text-[12px] font-bold px-4 py-2 rounded-xl"
            style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", color: "#fff", boxShadow: "0 4px 16px rgba(0,180,180,0.3)" }}>
            Sign In
          </Link>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        {/* Hero */}
        <section className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider"
            style={{ background: "rgba(0,180,180,0.1)", color: "#00b4b4", border: "1px solid rgba(0,180,180,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00b4b4" }} />
            Get in Touch
          </span>
          <h1 className="text-4xl font-black" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#f0f0f0" }}>Contact TouchNet</h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.75 }}>
            Have a question about our platform, need a demo, or want to discuss a custom deployment? We'd love to hear from you.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Contact info */}
          <div className="md:col-span-2 space-y-4">
            {[
              { icon: Mail,    label: "Email",    value: "info@touchnet.co.za",  href: "mailto:info@touchnet.co.za" },
              { icon: Phone,   label: "Phone",    value: "+27 11 000 0000",       href: "tel:+27110000000" },
              { icon: MapPin,  label: "Location", value: "Johannesburg, South Africa", href: null },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.15)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(0,180,180,0.12)", border: "1px solid rgba(0,180,180,0.25)" }}>
                  <Icon className="w-4 h-4" style={{ color: "#00b4b4" }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
                  {href ? (
                    <a href={href} className="text-[13px] font-semibold hover:underline" style={{ color: "#00d4d4" }}>{value}</a>
                  ) : (
                    <p className="text-[13px] font-semibold" style={{ color: "#e0e0e0" }}>{value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Social links */}
            <div className="rounded-2xl p-4 space-y-2"
              style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.15)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>Connect with us</p>
              <div className="flex gap-3">
                {[
                  { label: "LinkedIn", href: "https://linkedin.com" },
                  { label: "Twitter",  href: "https://twitter.com"  },
                ].map(({ label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all hover:scale-105"
                    style={{ background: "rgba(0,180,180,0.1)", color: "#00b4b4", border: "1px solid rgba(0,180,180,0.25)" }}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="md:col-span-3 rounded-2xl overflow-hidden"
            style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.18)" }}>
            <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,#e02347,transparent)" }} />
            <div className="p-6">
              {sent ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <CheckCircle2 className="w-12 h-12" style={{ color: "#10b981" }} />
                  <h3 style={{ color: "#f0f0f0" }}>Message Sent!</h3>
                  <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.45)" }}>We'll get back to you as soon as possible.</p>
                  <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="mt-2 px-4 py-2 rounded-xl text-[12px] font-bold"
                    style={{ background: "rgba(0,180,180,0.1)", color: "#00b4b4", border: "1px solid rgba(0,180,180,0.25)" }}>
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "name",    label: "Your Name",     placeholder: "John Smith",           type: "text" },
                      { key: "email",   label: "Email Address", placeholder: "john@company.co.za",   type: "email" },
                    ].map(({ key, label, placeholder, type }) => (
                      <div key={key} className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</label>
                        <input type={type} required value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                          style={{ background: "#252525", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0" }} />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Subject</label>
                    <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      placeholder="Demo request / Technical question / Partnership"
                      className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                      style={{ background: "#252525", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0" }} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Message</label>
                    <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us how we can help…"
                      className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none resize-none"
                      style={{ background: "#252525", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0" }} />
                  </div>
                  <button type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold text-white transition-all hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 20px rgba(0,180,180,0.3)" }}>
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}>
        <p className="text-[12px]">© {new Date().getFullYear()} TouchNet. All rights reserved.</p>
        <nav className="flex gap-4 text-[12px]">
          <Link to="/" style={{ color: "rgba(255,255,255,0.4)" }}>Home</Link>
          <Link to="/about" style={{ color: "rgba(255,255,255,0.4)" }}>About</Link>
          <Link to="/contact" style={{ color: "#00b4b4" }}>Contact</Link>
        </nav>
      </footer>
    </div>
  );
}