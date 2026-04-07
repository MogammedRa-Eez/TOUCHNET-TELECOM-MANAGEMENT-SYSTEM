import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Popup, ZoomControl, useMap, Marker } from "react-leaflet";
import L from "leaflet";
import {
  MapPin, Search, CheckCircle2, XCircle, AlertCircle, Loader2,
  Wifi, Zap, ChevronRight, Send, Phone, Mail, User, Home,
  Building2, ArrowRight, Star, RefreshCw
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

const COVERAGE_ZONES = [
  // Gauteng
  { lat: -26.1041, lng: 28.1073, label: "Sandton", radius: 10000 },
  { lat: -26.0274, lng: 28.1527, label: "Fourways", radius: 9000 },
  { lat: -25.8579, lng: 28.1893, label: "Centurion", radius: 11000 },
  { lat: -26.0765, lng: 28.0556, label: "Randburg", radius: 9000 },
  { lat: -26.1715, lng: 27.9681, label: "Krugersdorp", radius: 8000 },
  { lat: -25.9025, lng: 28.4211, label: "Kempton Park", radius: 9000 },
  { lat: -25.7479, lng: 28.2293, label: "Pretoria East", radius: 11000 },
  { lat: -26.2041, lng: 28.0473, label: "Johannesburg South", radius: 10000 },
  { lat: -26.1367, lng: 28.2411, label: "Bedfordview", radius: 8000 },
  { lat: -26.2309, lng: 28.2772, label: "Alberton", radius: 8000 },
  // Western Cape
  { lat: -33.9249, lng: 18.4241, label: "Cape Town CBD", radius: 10000 },
  { lat: -33.9321, lng: 18.8602, label: "Stellenbosch", radius: 8000 },
  // KZN
  { lat: -29.8587, lng: 31.0218, label: "Durban North", radius: 10000 },
  // Other
  { lat: -29.1197, lng: 26.2140, label: "Bloemfontein", radius: 9000 },
];

const SERVICE_PLANS = [
  { id: "basic_10mbps",       label: "Basic 10 Mbps",       price: "R399/mo",  speed: "10 Mbps",   icon: "🌐" },
  { id: "standard_50mbps",    label: "Standard 50 Mbps",    price: "R599/mo",  speed: "50 Mbps",   icon: "⚡" },
  { id: "premium_100mbps",    label: "Premium 100 Mbps",    price: "R899/mo",  speed: "100 Mbps",  icon: "🚀" },
  { id: "enterprise_500mbps", label: "Enterprise 500 Mbps", price: "R1,499/mo",speed: "500 Mbps",  icon: "🏢" },
  { id: "dedicated_1gbps",    label: "Dedicated 1 Gbps",    price: "R2,999/mo",speed: "1 Gbps",    icon: "💎" },
];

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const checkCoverage = (lat, lng) => {
  for (const zone of COVERAGE_ZONES) {
    const dist = haversineDistance(lat, lng, zone.lat, zone.lng);
    if (dist <= zone.radius) return { covered: true, zone };
  }
  return { covered: false, zone: null };
};

function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords) map.flyTo(coords, 14, { duration: 1.2 }); }, [coords, map]);
  return null;
}


export default function CoverageCheck() {
  const [address, setAddress]           = useState("");
  const [searching, setSearching]       = useState(false);
  const [result, setResult]             = useState(null); // { covered, zone, lat, lng, displayName }
  const [step, setStep]                 = useState("search"); // search | result | form | success
  const [flyTo, setFlyTo]               = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("standard_50mbps");
  const [submitting, setSubmitting]     = useState(false);
  const [form, setForm]                 = useState({ name: "", email: "", phone: "", address: "", plan: "standard_50mbps", notes: "" });

  const extractSuburb = (displayName) => {
    if (!displayName) return "";
    const parts = displayName.split(",").map(p => p.trim());
    return parts[0] || "";
  };

  const extractProvince = (displayName) => {
    if (!displayName) return "";
    const provinces = ["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Limpopo","Mpumalanga","North West","Free State","Northern Cape"];
    return provinces.find(p => displayName.includes(p)) || "";
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    setSearching(true);
    setResult(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", South Africa")}&limit=1&countrycodes=za`,
        { headers: { "User-Agent": "TouchNet-CoverageCheck/1.0" } }
      );
      const data = await res.json();
      if (!data?.[0]) {
        setResult({ error: "Address not found. Please try a more specific address." });
        setStep("result");
        return;
      }
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      const coverage = checkCoverage(lat, lng);
      setResult({ ...coverage, lat, lng, displayName: data[0].display_name });
      setFlyTo([lat, lng]);
      setForm(f => ({ ...f, address: data[0].display_name, plan: selectedPlan }));
      setStep("result");
      // Log search for analytics
      base44.entities.CoverageSearch.create({
        query: address,
        display_name: data[0].display_name,
        lat,
        lng,
        covered: coverage.covered,
        nearest_zone: coverage.zone?.label || "",
        suburb: extractSuburb(data[0].display_name),
        province: extractProvince(data[0].display_name),
      }).catch(() => {}); // fire-and-forget
    } catch {
      setResult({ error: "Failed to search address. Please try again." });
      setStep("result");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitting(true);
    try {
      await base44.entities.Referral.create({
        referrer_customer_id: "website_lead",
        referrer_name: "Website Coverage Check",
        referrer_email: "website@touchnet.co.za",
        referred_name: form.name,
        referred_email: form.email,
        referred_phone: form.phone,
        referred_address: form.address,
        service_interest: form.plan,
        notes: form.notes + (result?.zone ? `\nNearest zone: ${result.zone.label}` : ""),
        status: "submitted",
      });
      setStep("success");
    } catch (err) {
      console.error("Submit failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep("search");
    setResult(null);
    setAddress("");
    setFlyTo(null);
    setForm({ name: "", email: "", phone: "", address: "", plan: "standard_50mbps", notes: "" });
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0f0a1e 0%, #1a1330 40%, #0d1a2e 100%)" }}>

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] opacity-20"
          style={{ background: "radial-gradient(circle, rgba(155,143,239,0.4) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] opacity-15"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 65%)" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(155,143,239,0.12)", background: "rgba(26,19,48,0.6)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="TouchNet" className="h-8 object-contain"
            style={{ filter: "brightness(0) invert(1) drop-shadow(0 0 8px rgba(196,188,247,0.5))" }} />
        </div>
        <a href="/CustomerPortalMain"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
          style={{ background: "rgba(155,143,239,0.12)", border: "1px solid rgba(155,143,239,0.25)", color: "#c4bcf7" }}>
          Customer Login <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 lg:py-16">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{ background: "rgba(155,143,239,0.1)", border: "1px solid rgba(155,143,239,0.25)" }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#c4bcf7" }}>Fibre Coverage Checker</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black mb-4 leading-tight"
            style={{ color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
            Is Fibre Available<br />
            <span style={{ background: "linear-gradient(135deg, #9b8fef, #c4bcf7, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              At Your Address?
            </span>
          </h1>
          <p className="text-[15px] max-w-xl mx-auto" style={{ color: "rgba(196,188,247,0.6)" }}>
            Enter your address below to instantly check coverage and get connected to blazing-fast fibre internet.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* Left Panel */}
          <div className="space-y-5">

            {/* Search Box */}
            {step !== "success" && (
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(155,143,239,0.2)", backdropFilter: "blur(20px)" }}>
                <div className="h-[2px]" style={{ background: "linear-gradient(90deg, #9b8fef, #10b981, transparent)" }} />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(155,143,239,0.15)", border: "1px solid rgba(155,143,239,0.3)" }}>
                      <MapPin className="w-5 h-5" style={{ color: "#9b8fef" }} />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-black" style={{ color: "#c4bcf7" }}>Check Your Address</h2>
                      <p className="text-[11px]" style={{ color: "rgba(196,188,247,0.45)" }}>Enter a street address, suburb, or area</p>
                    </div>
                  </div>

                  <form onSubmit={handleSearch} className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="e.g. 25 Rivonia Road, Sandton"
                        className="flex-1 px-4 py-3 rounded-xl text-[13px] outline-none transition-all"
                        style={{
                          background: "rgba(255,255,255,0.07)",
                          border: "1px solid rgba(155,143,239,0.25)",
                          color: "#e2e8f0",
                        }}
                      />
                      <button type="submit" disabled={searching || !address.trim()}
                        className="px-5 py-3 rounded-xl font-bold text-[13px] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        style={{ background: "linear-gradient(135deg, #7c6fe0, #9b8fef)", color: "white", boxShadow: "0 4px 20px rgba(124,111,224,0.4)" }}>
                        {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Check
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Result */}
            {step === "result" && result && !result.error && (
              <div className="rounded-2xl overflow-hidden"
                style={{
                  background: result.covered ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)",
                  border: `1px solid ${result.covered ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                }}>
                <div className="h-[2px]" style={{ background: result.covered ? "#10b981" : "#ef4444" }} />
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: result.covered ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)", border: `1px solid ${result.covered ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.25)"}` }}>
                      {result.covered
                        ? <CheckCircle2 className="w-6 h-6" style={{ color: "#10b981" }} />
                        : <XCircle className="w-6 h-6" style={{ color: "#ef4444" }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-black" style={{ color: result.covered ? "#10b981" : "#ef4444" }}>
                        {result.covered ? "🎉 Fibre Available!" : "Coverage Coming Soon"}
                      </h3>
                      <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "rgba(196,188,247,0.6)" }}>
                        {result.covered
                          ? `Great news! Your address falls within our ${result.zone.label} coverage zone. You can sign up today.`
                          : "We don't have active coverage at your address yet, but we're expanding rapidly. Leave your details and we'll notify you when fibre arrives!"}
                      </p>
                      {result.displayName && (
                        <p className="text-[10px] mt-2 font-mono truncate" style={{ color: "rgba(196,188,247,0.35)" }}>{result.displayName}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => { setForm(f => ({ ...f, plan: selectedPlan })); setStep("form"); }}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[13px] transition-all hover:scale-[1.02] text-white"
                    style={{
                      background: result.covered
                        ? "linear-gradient(135deg, #059669, #10b981)"
                        : "linear-gradient(135deg, #7c6fe0, #9b8fef)",
                      boxShadow: result.covered ? "0 4px 20px rgba(16,185,129,0.4)" : "0 4px 20px rgba(124,111,224,0.4)",
                    }}>
                    {result.covered ? "Sign Up Now" : "Notify Me When Available"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {result?.error && (
              <div className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#f59e0b" }} />
                <p className="text-[12px]" style={{ color: "#fbbf24" }}>{result.error}</p>
              </div>
            )}

            {/* Service Interest Form */}
            {step === "form" && (
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(155,143,239,0.2)" }}>
                <div className="h-[2px]" style={{ background: "linear-gradient(90deg, #9b8fef, #c4bcf7, transparent)" }} />
                <div className="p-6">
                  <h3 className="text-[15px] font-black mb-1" style={{ color: "#c4bcf7" }}>
                    {result?.covered ? "Complete Your Sign-Up" : "Get Notified"}
                  </h3>
                  <p className="text-[11px] mb-5" style={{ color: "rgba(196,188,247,0.45)" }}>
                    {result?.covered ? "Fill in your details and we'll get you connected." : "Leave your details and we'll reach out as soon as coverage is available."}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: "rgba(196,188,247,0.4)" }}>Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(155,143,239,0.5)" }} />
                          <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="John Smith"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[12px] outline-none"
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(155,143,239,0.2)", color: "#e2e8f0" }} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: "rgba(196,188,247,0.4)" }}>Email *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(155,143,239,0.5)" }} />
                          <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            placeholder="john@email.com"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[12px] outline-none"
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(155,143,239,0.2)", color: "#e2e8f0" }} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: "rgba(196,188,247,0.4)" }}>Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(155,143,239,0.5)" }} />
                          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                            placeholder="071 234 5678"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[12px] outline-none"
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(155,143,239,0.2)", color: "#e2e8f0" }} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: "rgba(196,188,247,0.4)" }}>Installation Type</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(155,143,239,0.5)" }} />
                          <select value={form.notes.includes("Business") ? "business" : "residential"}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value === "business" ? "Business installation" : "" }))}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[12px] outline-none appearance-none"
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(155,143,239,0.2)", color: "#e2e8f0" }}>
                            <option value="residential" style={{ background: "#1a1330" }}>Residential</option>
                            <option value="business" style={{ background: "#1a1330" }}>Business</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {result?.covered && (
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: "rgba(196,188,247,0.4)" }}>Select a Plan</label>
                        <div className="grid grid-cols-1 gap-2">
                          {SERVICE_PLANS.map(plan => (
                            <button key={plan.id} type="button"
                              onClick={() => { setSelectedPlan(plan.id); setForm(f => ({ ...f, plan: plan.id })); }}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                              style={{
                                background: form.plan === plan.id ? "rgba(155,143,239,0.15)" : "rgba(255,255,255,0.04)",
                                border: `1px solid ${form.plan === plan.id ? "rgba(155,143,239,0.4)" : "rgba(255,255,255,0.08)"}`,
                              }}>
                              <span className="text-[16px]">{plan.icon}</span>
                              <div className="flex-1">
                                <p className="text-[12px] font-bold" style={{ color: form.plan === plan.id ? "#c4bcf7" : "#94a3b8" }}>{plan.label}</p>
                                <p className="text-[10px]" style={{ color: "rgba(196,188,247,0.4)" }}>{plan.speed} · Uncapped</p>
                              </div>
                              <span className="text-[12px] font-black" style={{ color: form.plan === plan.id ? "#9b8fef" : "#64748b" }}>{plan.price}</span>
                              {form.plan === plan.id && <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#9b8fef" }} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={() => setStep("result")}
                        className="px-4 py-3 rounded-xl text-[12px] font-bold transition-all"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
                        Back
                      </button>
                      <button type="submit" disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[13px] text-white transition-all hover:scale-[1.02] disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg, #7c6fe0, #9b8fef)", boxShadow: "0 4px 20px rgba(124,111,224,0.4)" }}>
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {submitting ? "Submitting…" : result?.covered ? "Submit Application" : "Notify Me"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Success */}
            {step === "success" && (
              <div className="rounded-2xl overflow-hidden text-center"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)" }}>
                <div className="h-[2px]" style={{ background: "linear-gradient(90deg, #10b981, #059669, transparent)" }} />
                <div className="p-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                    <CheckCircle2 className="w-8 h-8" style={{ color: "#10b981" }} />
                  </div>
                  <h3 className="text-[18px] font-black mb-2" style={{ color: "#10b981" }}>Application Submitted!</h3>
                  <p className="text-[13px] mb-6" style={{ color: "rgba(196,188,247,0.6)" }}>
                    Thank you! Our team will be in contact within <strong style={{ color: "#c4bcf7" }}>24 hours</strong> to discuss your fibre installation.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button onClick={reset}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
                      style={{ background: "rgba(155,143,239,0.12)", border: "1px solid rgba(155,143,239,0.25)", color: "#c4bcf7" }}>
                      <RefreshCw className="w-3.5 h-3.5" /> Check Another Address
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Why TouchNet */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Zap,         label: "Ultra-Fast",   desc: "Up to 1 Gbps" },
                { icon: Wifi,        label: "Uncapped",     desc: "No data limits" },
                { icon: Star,        label: "Reliable",     desc: "99.9% uptime SLA" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="rounded-xl p-3 text-center"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(155,143,239,0.12)" }}>
                  <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: "#9b8fef" }} />
                  <p className="text-[12px] font-bold" style={{ color: "#c4bcf7" }}>{label}</p>
                  <p className="text-[10px]" style={{ color: "rgba(196,188,247,0.4)" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Map */}
          <div className="rounded-2xl overflow-hidden sticky top-6"
            style={{ border: "1px solid rgba(155,143,239,0.2)", height: 520, boxShadow: "0 8px 40px rgba(124,111,224,0.15)" }}>
            <MapContainer center={result?.lat ? [result.lat, result.lng] : [-28.5, 25.5]}
              zoom={result?.lat ? 12 : 6} zoomControl={false}
              style={{ height: "100%", width: "100%" }}>
              <ZoomControl position="bottomright" />
              <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap contributors' />
              {flyTo && <FlyTo coords={flyTo} />}

              {COVERAGE_ZONES.map((zone, i) => (
                <Circle key={i} center={[zone.lat, zone.lng]} radius={zone.radius}
                  pathOptions={{ color: "#9b8fef", fillColor: "#9b8fef", fillOpacity: 0.15, weight: 1.5 }}>
                  <Popup>
                    <p style={{ fontWeight: 700, marginBottom: 2, fontSize: 12 }}>TouchNet Coverage</p>
                    <p style={{ fontSize: 11, color: "#64748b" }}>{zone.label}</p>
                  </Popup>
                </Circle>
              ))}

              {result?.lat && (
                <Marker position={[result.lat, result.lng]}>
                  <Popup>
                    <p style={{ fontWeight: 700, fontSize: 12 }}>Your Address</p>
                    {result.covered && <p style={{ fontSize: 11, color: "#10b981" }}>✓ Coverage Available</p>}
                    {!result.covered && <p style={{ fontSize: 11, color: "#ef4444" }}>No coverage yet</p>}
                  </Popup>
                </Marker>
              )}
            </MapContainer>

            {/* Map overlay legend */}
            <div className="absolute bottom-10 left-3 z-[999] rounded-xl px-3 py-2"
              style={{ background: "rgba(26,19,48,0.9)", border: "1px solid rgba(155,143,239,0.2)", backdropFilter: "blur(10px)" }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full" style={{ background: "#9b8fef", opacity: 0.7 }} />
                <span className="text-[10px] font-bold" style={{ color: "#c4bcf7" }}>TouchNet Coverage Zones</span>
              </div>
              <p className="text-[9px]" style={{ color: "rgba(196,188,247,0.4)" }}>{COVERAGE_ZONES.length} active zones · South Africa</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}