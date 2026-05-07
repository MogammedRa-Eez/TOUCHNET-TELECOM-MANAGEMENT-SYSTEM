import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  MapPin, Search, CheckCircle2, XCircle, Loader2,
  X, Zap, RefreshCw, Mail, Phone, User, Send, AlertCircle
} from "lucide-react";

const ZONES = [
  { lat: -26.1041, lng: 28.1073, label: "Sandton",       r: 10000 },
  { lat: -26.0274, lng: 28.1527, label: "Fourways",      r: 9000  },
  { lat: -25.8579, lng: 28.1893, label: "Centurion",     r: 11000 },
  { lat: -26.0765, lng: 28.0556, label: "Randburg",      r: 9000  },
  { lat: -25.7479, lng: 28.2293, label: "Pretoria East", r: 11000 },
  { lat: -26.2041, lng: 28.0473, label: "JHB South",     r: 10000 },
  { lat: -33.9249, lng: 18.4241, label: "Cape Town CBD", r: 10000 },
  { lat: -29.8587, lng: 31.0218, label: "Durban North",  r: 10000 },
];

const haversine = (la1, lo1, la2, lo2) => {
  const R = 6371000;
  const dL = (la2 - la1) * Math.PI / 180;
  const dO = (lo2 - lo1) * Math.PI / 180;
  const a = Math.sin(dL / 2) ** 2 + Math.cos(la1 * Math.PI / 180) * Math.cos(la2 * Math.PI / 180) * Math.sin(dO / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const checkCoverage = (lat, lng) => {
  let best = null, bestD = Infinity;
  for (const z of ZONES) {
    const d = haversine(lat, lng, z.lat, z.lng);
    if (d <= z.r && d < bestD) { bestD = d; best = z; }
  }
  return best;
};

async function geocodeAddress(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", South Africa")}&format=json&limit=1&countrycodes=za`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  const data = await res.json();
  if (!data?.length) throw new Error("Address not found");
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), displayName: data[0].display_name };
}

export default function CoverageChecker({ onClose }) {
  const [address, setAddress]       = useState("");
  const [searching, setSearching]   = useState(false);
  const [result, setResult]         = useState(null);
  const [step, setStep]             = useState("search");
  const [form, setForm]             = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!address.trim()) return;
    setSearching(true); setResult(null);
    try {
      const geo = await geocodeAddress(address);
      const zone = checkCoverage(geo.lat, geo.lng);
      setResult({ lat: geo.lat, lng: geo.lng, displayName: geo.displayName, covered: !!zone, zone });
      setStep("result");
      base44.entities.CoverageSearch.create({
        query: address, display_name: geo.displayName, lat: geo.lat, lng: geo.lng,
        covered: !!zone, nearest_zone: zone?.label || "",
      }).catch(() => {});
    } catch {
      setResult({ error: "Address not found. Try a suburb or city name." });
    } finally { setSearching(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await base44.entities.Referral.create({
        referrer_customer_id: "website_lead", referrer_name: "Coverage Checker",
        referrer_email: "website@touchnet.co.za",
        referred_name: form.name, referred_email: form.email, referred_phone: form.phone,
        referred_address: result?.displayName, status: "submitted",
      });
      setStep("success");
    } finally { setSubmitting(false); }
  };

  const reset = () => { setStep("search"); setResult(null); setAddress(""); };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)" }}>

      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.25)", boxShadow: "0 40px 100px rgba(0,0,0,0.8)", maxHeight: "90vh" }}>
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.4),#8B1A1A,transparent)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(0,180,180,0.12)", border: "1px solid rgba(0,212,212,0.3)" }}>
              <MapPin className="w-4 h-4" style={{ color: "#00b4b4" }} />
            </div>
            <div>
              <h2 className="text-[15px] font-black" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>Coverage Checker</h2>
              <p className="text-[11px]" style={{ color: "rgba(0,212,212,0.45)" }}>Check fibre coverage at any South African address</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(0,212,212,0.5)" }} />
              <input value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Enter suburb or address…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[12px] outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0" }} />
            </div>
            <button type="submit" disabled={searching || !address.trim()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 16px rgba(0,180,180,0.35)" }}>
              {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              {searching ? "Checking…" : "Check"}
            </button>
          </form>

          {/* Error */}
          {result?.error && (
            <div className="rounded-xl p-3 flex items-start gap-2"
              style={{ background: "rgba(139,26,26,0.1)", border: "1px solid rgba(139,26,26,0.3)" }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#8B1A1A" }} />
              <p className="text-[11px]" style={{ color: "#c23030" }}>{result.error}</p>
            </div>
          )}

          {/* Result */}
          {step === "result" && result && !result.error && (
            <div className="space-y-3">
              <div className="rounded-xl p-4"
                style={{ background: result.covered ? "rgba(16,185,129,0.07)" : "rgba(139,26,26,0.07)", border: `1px solid ${result.covered ? "rgba(16,185,129,0.3)" : "rgba(139,26,26,0.3)"}` }}>
                <div className="flex items-center gap-3 mb-2">
                  {result.covered
                    ? <CheckCircle2 className="w-6 h-6 flex-shrink-0" style={{ color: "#10b981" }} />
                    : <XCircle className="w-6 h-6 flex-shrink-0" style={{ color: "#8B1A1A" }} />}
                  <div>
                    <p className="text-[13px] font-black" style={{ color: result.covered ? "#10b981" : "#8B1A1A" }}>
                      {result.covered ? `Coverage available — ${result.zone?.label}` : "No coverage at this location"}
                    </p>
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {result.displayName?.split(",").slice(0, 2).join(",")}
                    </p>
                  </div>
                </div>
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {result.covered
                    ? "Fibre connectivity is available in your area. Sign up below to get connected."
                    : "We're expanding our network. Register below to be notified when coverage reaches you."}
                </p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep("form")}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold text-white"
                  style={{ background: result.covered ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#00b4b4,#007a7a)" }}>
                  {result.covered ? <Zap className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                  {result.covered ? "Sign Up Now" : "Notify Me"}
                </button>
                <button onClick={reset}
                  className="py-2.5 px-3 rounded-xl"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Lead form */}
          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl p-4"
              style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,212,212,0.15)" }}>
              <p className="text-[13px] font-black" style={{ color: "#00d4d4" }}>
                {result?.covered ? "Get Connected with TouchNet" : "Register for Coverage Notification"}
              </p>
              {[
                { field: "name",  Icon: User,  type: "text",  placeholder: "Full name *",    req: true  },
                { field: "email", Icon: Mail,  type: "email", placeholder: "Email address *", req: true  },
                { field: "phone", Icon: Phone, type: "tel",   placeholder: "Phone number",    req: false },
              ].map(({ field, Icon, type, placeholder, req }) => (
                <div key={field} className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(0,212,212,0.4)" }} />
                  <input required={req} type={type} value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[12px] outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0" }} />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setStep("result")}
                  className="px-4 py-2.5 rounded-xl text-[12px] font-bold"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>← Back</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold text-white disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)" }}>
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {submitting ? "Submitting…" : result?.covered ? "Get Connected" : "Notify Me"}
                </button>
              </div>
            </form>
          )}

          {/* Success */}
          {step === "success" && (
            <div className="rounded-2xl p-8 text-center"
              style={{ background: "rgba(0,180,180,0.07)", border: "1px solid rgba(0,180,180,0.25)" }}>
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: "#10b981" }} />
              <p className="text-[15px] font-black mb-1" style={{ color: "#10b981" }}>Submitted!</p>
              <p className="text-[12px] mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>We'll be in touch within 24 hours.</p>
              <button onClick={reset}
                className="text-[12px] font-bold px-5 py-2 rounded-xl"
                style={{ background: "rgba(0,180,180,0.08)", border: "1px solid rgba(0,180,180,0.2)", color: "#00b4b4" }}>
                Check Another Address
              </button>
            </div>
          )}

          {/* Coverage zones info */}
          {step === "search" && (
            <div className="rounded-xl p-4"
              style={{ background: "rgba(0,180,180,0.04)", border: "1px solid rgba(0,212,212,0.1)" }}>
              <p className="text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: "rgba(0,212,212,0.5)" }}>Current Coverage Areas</p>
              <div className="flex flex-wrap gap-1.5">
                {ZONES.map(z => (
                  <span key={z.label} className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(0,180,180,0.1)", border: "1px solid rgba(0,180,180,0.2)", color: "rgba(255,255,255,0.5)" }}>
                    {z.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}