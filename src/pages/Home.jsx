import React, { useEffect, useState } from "react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Wifi, Shield, Zap, LogIn, Loader2, KeyRound } from "lucide-react";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

const BG_DECOR = (
  <>
    <div className="fixed inset-0 opacity-10 pointer-events-none" style={{
      backgroundImage: "linear-gradient(rgba(220,38,38,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.3) 1px, transparent 1px)",
      backgroundSize: "40px 40px"
    }} />
    <div className="fixed top-0 right-0 w-96 h-96 opacity-20 rounded-full pointer-events-none"
      style={{ background: "radial-gradient(circle, #dc2626 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
  </>
);

export default function Home() {
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(me => {
        if (me) {
          setUser(me);
          setStatus("pin");
        } else {
          setStatus("show_login");
        }
      })
      .catch(() => setStatus("show_login"));
  }, []);

  async function handlePinSubmit(e) {
    e.preventDefault();
    if (!pin.trim()) { setPinError("Please enter your unique ID."); return; }
    setSubmitting(true);
    try {
      const customers = await base44.entities.Customer.filter({ email: user.email });
      if (customers.length > 0) {
        const customer = customers[0];
        const validId = (customer.account_number || customer.email.split("@")[0]).toLowerCase();
        if (pin.trim().toLowerCase() !== validId) {
          setPinError("Invalid unique ID. Please try again.");
          setSubmitting(false);
          return;
        }
        window.location.href = createPageUrl("CustomerPortal");
      } else {
        const validId = user.email.split("@")[0].toLowerCase();
        if (pin.trim().toLowerCase() !== validId) {
          setPinError("Invalid unique ID. Please try again.");
          setSubmitting(false);
          return;
        }
        window.location.href = createPageUrl("Dashboard");
      }
    } catch {
      setPinError("Verification failed. Please try again.");
      setSubmitting(false);
    }
  }

  const wrapper = (content) => (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #1e2a4a 0%, #0f172a 60%, #1a1a2e 100%)" }}>
      {BG_DECOR}
      {content}
    </div>
  );

  if (status === "loading") {
    return wrapper(<Loader2 className="w-8 h-8 text-red-400 animate-spin" />);
  }

  if (status === "pin") {
    return wrapper(
      <div className="relative w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <img src={LOGO_URL} alt="TouchNet" className="h-14 object-contain"
            style={{ filter: "brightness(0) invert(1)" }} />
        </div>
        <div className="rounded-2xl p-8"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)" }}>
            <KeyRound className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white text-center mb-1">Identity Verification</h2>
          <p className="text-slate-400 text-sm text-center mb-6">
            Welcome, <span className="text-slate-200">{user?.full_name || user?.email}</span>.<br />
            Enter your unique ID to continue.
          </p>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={pin}
                onChange={e => { setPin(e.target.value); setPinError(""); }}
                placeholder="Enter your unique ID"
                autoFocus
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-red-500 transition-all"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
              />
              {pinError && <p className="text-red-400 text-xs mt-2">{pinError}</p>}
            </div>
            <button type="submit" disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
              style={{ background: "linear-gradient(90deg, #dc2626, #b91c1c)", boxShadow: "0 4px 20px rgba(220,38,38,0.4)" }}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              Continue
            </button>
          </form>
          <div className="mt-5 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs text-slate-500 text-center">
              Your unique ID is your account number (customers) or email prefix (staff).
            </p>
          </div>
        </div>
      </div>
    );
  }

  // show_login
  return wrapper(
    <div className="relative w-full max-w-sm">
      <div className="flex justify-center mb-8">
        <img src={LOGO_URL} alt="TouchNet" className="h-14 object-contain"
          style={{ filter: "brightness(0) invert(1)" }} />
      </div>
      <div className="rounded-2xl p-8 text-center"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>
        <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
        <p className="text-slate-400 text-sm mb-8">Sign in to access your account</p>
        <button
          onClick={() => base44.auth.redirectToLogin(createPageUrl("Home"))}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(90deg, #dc2626, #b91c1c)", boxShadow: "0 4px 20px rgba(220,38,38,0.4)" }}>
          <LogIn className="w-4 h-4" />
          Sign In
        </button>
        <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-xs text-slate-500">
            Customers & staff use the same sign-in.<br />
            You'll be automatically directed to your portal.
          </p>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-3">
        {[
          { icon: Wifi, label: "99.9% Uptime" },
          { icon: Shield, label: "Secure Access" },
          { icon: Zap, label: "Real-time Data" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl px-3 py-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Icon className="w-4 h-4 text-red-400" />
            <span className="text-[10px] text-slate-400 text-center font-medium">{label}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-[10px] text-slate-600 mt-6"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        © TOUCHNET v2.4.1
      </p>
    </div>
  );
}