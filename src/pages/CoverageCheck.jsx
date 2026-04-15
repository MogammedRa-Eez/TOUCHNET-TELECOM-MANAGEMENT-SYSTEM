import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin, Search, CheckCircle2, XCircle, AlertCircle, Loader2,
  Wifi, Zap, ChevronRight, Send, Phone, Mail, User,
  Building2, ArrowRight, Star, RefreshCw, Layers, X,
  BarChart3, Shield, Clock, TrendingUp, ArrowUpRight, Eye,
  Filter, Activity, Radio, Globe, Map, ExternalLink
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

// ── Provider data ──────────────────────────────────────────────────────────────
const PROVIDERS = {
  touchnet: {
    id: "touchnet", name: "TouchNet", color: "#1e2d6e", glowColor: "rgba(30,45,110,0.4)", logo: "🔷",
    tagline: "Premium Uncapped Fibre",
    plans: [
      { label: "Basic",      speed: "10 Mbps",  price: 399,  upload: "5 Mbps",   contract: 24, features: ["Uncapped","24/7 Support","Static IP option"] },
      { label: "Standard",   speed: "50 Mbps",  price: 599,  upload: "25 Mbps",  contract: 24, features: ["Uncapped","Priority Support","Static IP option","Free Router"] },
      { label: "Premium",    speed: "100 Mbps", price: 899,  upload: "50 Mbps",  contract: 24, features: ["Uncapped","Priority Support","Static IP","Free Router","WiFi 6"] },
      { label: "Enterprise", speed: "500 Mbps", price: 1499, upload: "250 Mbps", contract: 24, features: ["Uncapped","SLA","Dedicated Account Manager","Static IP","Business Router","99.9% Uptime SLA"] },
      { label: "Gigabit",    speed: "1 Gbps",   price: 2999, upload: "500 Mbps", contract: 24, features: ["Uncapped","SLA","Dedicated Line","Static IP","Enterprise Router","99.99% SLA"] },
    ],
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton", radius: 10000 },
      { lat: -26.0274, lng: 28.1527, label: "Fourways", radius: 9000 },
      { lat: -25.8579, lng: 28.1893, label: "Centurion", radius: 11000 },
      { lat: -26.0765, lng: 28.0556, label: "Randburg", radius: 9000 },
      { lat: -26.1715, lng: 27.9681, label: "Krugersdorp", radius: 8000 },
      { lat: -25.9025, lng: 28.4211, label: "Kempton Park", radius: 9000 },
      { lat: -25.7479, lng: 28.2293, label: "Pretoria East", radius: 11000 },
      { lat: -26.2041, lng: 28.0473, label: "JHB South", radius: 10000 },
      { lat: -26.1367, lng: 28.2411, label: "Bedfordview", radius: 8000 },
      { lat: -26.2309, lng: 28.2772, label: "Alberton", radius: 8000 },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town CBD", radius: 10000 },
      { lat: -33.9321, lng: 18.8602, label: "Stellenbosch", radius: 8000 },
      { lat: -29.8587, lng: 31.0218, label: "Durban North", radius: 10000 },
      { lat: -29.1197, lng: 26.214,  label: "Bloemfontein", radius: 9000 },
    ],
    rating: 4.8, customers: "12,000+", founded: "2015", uptime: "99.9%",
  },
  openserve: {
    id: "openserve", name: "Openserve", color: "#06b6d4", glowColor: "rgba(6,182,212,0.35)", logo: "🌐",
    tagline: "Telkom Wholesale Fibre",
    plans: [
      { label: "Lite", speed: "10 Mbps",  price: 349,  upload: "5 Mbps",   contract: 24, features: ["Uncapped","Email Support"] },
      { label: "Home", speed: "50 Mbps",  price: 549,  upload: "25 Mbps",  contract: 24, features: ["Uncapped","Phone Support"] },
      { label: "Fast", speed: "100 Mbps", price: 799,  upload: "50 Mbps",  contract: 24, features: ["Uncapped","Priority Support"] },
      { label: "Giga", speed: "1 Gbps",   price: 2699, upload: "500 Mbps", contract: 24, features: ["Uncapped","SLA","Business Grade"] },
    ],
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton",      radius: 12000 },
      { lat: -25.7479, lng: 28.2293, label: "Pretoria",     radius: 15000 },
      { lat: -26.2041, lng: 28.0473, label: "Johannesburg", radius: 14000 },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town",    radius: 13000 },
      { lat: -29.8587, lng: 31.0218, label: "Durban",       radius: 12000 },
      { lat: -33.0,    lng: 27.9,    label: "East London",  radius: 8000  },
      { lat: -25.7,    lng: 28.2,    label: "Midrand",      radius: 9000  },
    ],
    rating: 4.1, customers: "800,000+", founded: "2016", uptime: "99.5%",
  },
  vumatel: {
    id: "vumatel", name: "Vumatel", color: "#f59e0b", glowColor: "rgba(245,158,11,0.35)", logo: "⚡",
    tagline: "High-Density Urban Fibre",
    plans: [
      { label: "Basic", speed: "25 Mbps",  price: 459,  upload: "12 Mbps",  contract: 12, features: ["Uncapped","Chat Support"] },
      { label: "Value", speed: "50 Mbps",  price: 649,  upload: "25 Mbps",  contract: 12, features: ["Uncapped","Phone Support","Wifi 5"] },
      { label: "Speed", speed: "200 Mbps", price: 1099, upload: "100 Mbps", contract: 12, features: ["Uncapped","Priority","Wifi 6"] },
      { label: "Ultra", speed: "1 Gbps",   price: 2499, upload: "500 Mbps", contract: 12, features: ["Uncapped","SLA","Business Line"] },
    ],
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton",    radius: 8000  },
      { lat: -26.0274, lng: 28.1527, label: "Fourways",   radius: 7500  },
      { lat: -26.1887, lng: 28.0667, label: "Soweto",     radius: 11000 },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town",  radius: 9000  },
      { lat: -33.93,   lng: 18.86,   label: "Stellenbosch", radius: 6000 },
      { lat: -26.0765, lng: 28.0556, label: "Randburg",   radius: 7000  },
    ],
    rating: 4.5, customers: "250,000+", founded: "2014", uptime: "99.7%",
  },
  frogfoot: {
    id: "frogfoot", name: "Frogfoot", color: "#10b981", glowColor: "rgba(16,185,129,0.35)", logo: "🐸",
    tagline: "Independent Open-Access Fibre",
    plans: [
      { label: "Starter", speed: "10 Mbps",  price: 299, upload: "5 Mbps",   contract: 12, features: ["Uncapped","Email Support"] },
      { label: "Home",    speed: "25 Mbps",  price: 449, upload: "12 Mbps",  contract: 12, features: ["Uncapped","Chat Support"] },
      { label: "Fast",    speed: "100 Mbps", price: 749, upload: "50 Mbps",  contract: 12, features: ["Uncapped","Phone Support","Free Install"] },
      { label: "Power",   speed: "200 Mbps", price: 999, upload: "100 Mbps", contract: 24, features: ["Uncapped","Priority","Static IP","Free Install"] },
    ],
    zones: [
      { lat: -26.0274, lng: 28.1527, label: "Northriding",   radius: 7000 },
      { lat: -25.9025, lng: 28.4211, label: "Kempton Park",  radius: 7500 },
      { lat: -26.2309, lng: 28.2772, label: "Alberton",      radius: 7000 },
      { lat: -26.1367, lng: 28.2411, label: "Bedfordview",   radius: 6500 },
      { lat: -26.3044, lng: 27.8525, label: "Roodepoort",    radius: 7000 },
      { lat: -29.1197, lng: 26.214,  label: "Bloemfontein",  radius: 8000 },
    ],
    rating: 4.3, customers: "80,000+", founded: "2013", uptime: "99.6%",
  },
  mfn: {
    id: "mfn", name: "MFN", color: "#e879f9", glowColor: "rgba(232,121,249,0.35)", logo: "📡",
    tagline: "Metro Fibre Network",
    plans: [
      { label: "Basic",    speed: "10 Mbps",  price: 329,  upload: "5 Mbps",   contract: 24, features: ["Uncapped","Email Support"] },
      { label: "Home",     speed: "50 Mbps",  price: 549,  upload: "25 Mbps",  contract: 24, features: ["Uncapped","Phone Support"] },
      { label: "Fast",     speed: "100 Mbps", price: 799,  upload: "50 Mbps",  contract: 24, features: ["Uncapped","Priority Support","Static IP option"] },
      { label: "Business", speed: "200 Mbps", price: 1199, upload: "100 Mbps", contract: 24, features: ["Uncapped","SLA","Static IP","Priority Support"] },
    ],
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton",          radius: 9000  },
      { lat: -26.0765, lng: 28.0556, label: "Randburg",         radius: 8000  },
      { lat: -26.2041, lng: 28.0473, label: "Johannesburg CBD", radius: 10000 },
      { lat: -26.1887, lng: 28.0667, label: "Soweto",           radius: 9000  },
      { lat: -25.7479, lng: 28.2293, label: "Pretoria East",    radius: 10000 },
      { lat: -25.8579, lng: 28.1893, label: "Centurion",        radius: 9000  },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town CBD",    radius: 8000  },
      { lat: -29.8587, lng: 31.0218, label: "Durban",           radius: 9000  },
    ],
    rating: 4.2, customers: "50,000+", founded: "2012", uptime: "99.5%",
  },
  dfa: {
    id: "dfa", name: "DFA", color: "#fb923c", glowColor: "rgba(251,146,60,0.35)", logo: "🔶",
    tagline: "Dark Fibre Africa — Open Access",
    plans: [
      { label: "10M",  speed: "10 Mbps",  price: 299,  upload: "10 Mbps",  contract: 12, features: ["Uncapped","Symmetric","Email Support"] },
      { label: "50M",  speed: "50 Mbps",  price: 499,  upload: "50 Mbps",  contract: 12, features: ["Uncapped","Symmetric","Phone Support"] },
      { label: "100M", speed: "100 Mbps", price: 749,  upload: "100 Mbps", contract: 12, features: ["Uncapped","Symmetric","Priority Support","Static IP"] },
      { label: "500M", speed: "500 Mbps", price: 1599, upload: "500 Mbps", contract: 24, features: ["Uncapped","Symmetric","SLA","Static IP"] },
      { label: "1G",   speed: "1 Gbps",   price: 2799, upload: "1 Gbps",   contract: 24, features: ["Uncapped","Symmetric","SLA","Dedicated Line","Static IP"] },
    ],
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton",          radius: 11000 },
      { lat: -26.2041, lng: 28.0473, label: "Johannesburg CBD", radius: 13000 },
      { lat: -25.7479, lng: 28.2293, label: "Pretoria",         radius: 14000 },
      { lat: -26.0274, lng: 28.1527, label: "Midrand/Fourways", radius: 10000 },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town",        radius: 12000 },
      { lat: -29.8587, lng: 31.0218, label: "Durban",           radius: 11000 },
    ],
    rating: 4.4, customers: "100,000+", founded: "2007", uptime: "99.8%",
  },
  liquid: {
    id: "liquid", name: "Liquid Home", color: "#60a5fa", glowColor: "rgba(96,165,250,0.35)", logo: "💧",
    tagline: "Pan-African Fibre & Cloud",
    plans: [
      { label: "10M",      speed: "10 Mbps",  price: 379,  upload: "5 Mbps",   contract: 24, features: ["Uncapped","Email Support"] },
      { label: "50M",      speed: "50 Mbps",  price: 579,  upload: "25 Mbps",  contract: 24, features: ["Uncapped","Phone Support"] },
      { label: "100M",     speed: "100 Mbps", price: 849,  upload: "50 Mbps",  contract: 24, features: ["Uncapped","Priority Support","Static IP option"] },
      { label: "Business", speed: "500 Mbps", price: 1699, upload: "250 Mbps", contract: 24, features: ["Uncapped","SLA","Static IP","Dedicated Account Manager"] },
      { label: "Giga",     speed: "1 Gbps",   price: 3199, upload: "500 Mbps", contract: 24, features: ["Uncapped","SLA","Dedicated Line","99.9% SLA"] },
    ],
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton",    radius: 10000 },
      { lat: -26.2041, lng: 28.0473, label: "Johannesburg",radius: 12000 },
      { lat: -25.7479, lng: 28.2293, label: "Pretoria",   radius: 13000 },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town",  radius: 11000 },
      { lat: -29.8587, lng: 31.0218, label: "Durban",     radius: 10000 },
    ],
    rating: 4.3, customers: "200,000+", founded: "2000", uptime: "99.7%",
  },
  herotel: {
    id: "herotel", name: "Herotel", color: "#f472b6", glowColor: "rgba(244,114,182,0.35)", logo: "🦸",
    tagline: "Rural & Peri-Urban Wireless ISP",
    plans: [
      { label: "Basic",    speed: "10 Mbps",  price: 299, upload: "5 Mbps",  contract: 12, features: ["Uncapped","Chat Support"] },
      { label: "Standard", speed: "20 Mbps",  price: 449, upload: "10 Mbps", contract: 12, features: ["Uncapped","Phone Support"] },
      { label: "Fast",     speed: "50 Mbps",  price: 649, upload: "25 Mbps", contract: 12, features: ["Uncapped","Phone Support","Free Install"] },
      { label: "Ultra",    speed: "100 Mbps", price: 899, upload: "50 Mbps", contract: 24, features: ["Uncapped","Priority Support","Static IP"] },
    ],
    zones: [
      { lat: -33.5833, lng: 26.8833, label: "Grahamstown",  radius: 8000  },
      { lat: -33.0,    lng: 27.9,    label: "East London",  radius: 9000  },
      { lat: -28.7282, lng: 24.7499, label: "Kimberley",    radius: 9000  },
      { lat: -29.1197, lng: 26.214,  label: "Bloemfontein", radius: 10000 },
      { lat: -26.7145, lng: 27.0971, label: "Potchefstroom",radius: 8000  },
    ],
    rating: 4.1, customers: "70,000+", founded: "2014", uptime: "99.2%",
  },
};

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const checkAllProviders = (lat, lng) =>
  Object.values(PROVIDERS).map(p => {
    for (const zone of p.zones) {
      if (haversineDistance(lat, lng, zone.lat, zone.lng) <= zone.radius)
        return { provider: p, covered: true, zone };
    }
    return { provider: p, covered: false, zone: null };
  });

// ── Google Maps hook ───────────────────────────────────────────────────────────
function useGoogleMaps() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.google && window.google.maps) { setLoaded(true); return; }

    // Fetch API key from backend then load script
    base44.functions.invoke("googleMapsKey", {}).then(res => {
      const apiKey = res.data?.apiKey;
      if (!apiKey) return;
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = () => setLoaded(true);
      document.head.appendChild(script);
    }).catch(() => {});
  }, []);

  return loaded;
}

// ── Stars ──────────────────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className="w-3 h-3" viewBox="0 0 12 12" fill={i <= Math.round(rating) ? "#f59e0b" : "#cbd5e1"}>
          <path d="M6 1l1.2 3.6H11L8.4 6.6l.9 3.5L6 8.2l-3.3 1.9.9-3.5L1 4.6h3.8z"/>
        </svg>
      ))}
      <span className="text-[10px] font-bold ml-1" style={{ color: "#94a3b8" }}>{rating}</span>
    </div>
  );
}

// ── BestValuePicks ─────────────────────────────────────────────────────────────
function BestValuePicks({ available }) {
  const allPlans = available.flatMap(({ provider }) =>
    provider.plans.map(pl => ({ ...pl, provider, valueScore: Math.round((parseInt(pl.speed) / pl.price) * 100) }))
  ).sort((a, b) => b.valueScore - a.valueScore);

  const picks = [
    { label: "Best Value",   emoji: "🏆", plan: allPlans[0] },
    { label: "Best Speed",   emoji: "⚡", plan: [...allPlans].sort((a,b) => parseInt(b.speed)-parseInt(a.speed))[0] },
    { label: "Lowest Price", emoji: "💰", plan: [...allPlans].sort((a,b) => a.price-b.price)[0] },
  ].filter(p => p.plan);

  return (
    <div className="grid grid-cols-3 gap-3">
      {picks.map(({ label, emoji, plan }) => (
        <div key={label} className="rounded-2xl p-3 relative overflow-hidden"
          style={{ background: `${plan.provider.color}10`, border: `1px solid ${plan.provider.color}30` }}>
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: `linear-gradient(90deg,${plan.provider.color},transparent)` }} />
          <p className="text-lg mb-1">{emoji}</p>
          <p className="text-[9px] font-black uppercase tracking-wider mb-1" style={{ color: "rgba(30,45,110,0.45)" }}>{label}</p>
          <p className="text-[12px] font-black" style={{ color: plan.provider.color }}>{plan.provider.name}</p>
          <p className="text-[11px] font-bold" style={{ color: "#0f1a3d", fontFamily: "monospace" }}>{plan.speed}</p>
          <p className="text-[11px]" style={{ color: "rgba(30,45,110,0.6)" }}>R{plan.price}/mo · {plan.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── ComparisonModal ────────────────────────────────────────────────────────────
function ComparisonModal({ providerResults, onClose, onSignUp }) {
  const available = providerResults.filter(r => r.covered);
  const [activeTab, setActiveTab] = useState("table");
  const [filterProvider, setFilterProvider] = useState("all");
  const [sortBy, setSortBy] = useState("value");

  const allPlans = available.flatMap(({ provider }) =>
    provider.plans.map(pl => ({ ...pl, provider, valueScore: Math.round((parseInt(pl.speed) / pl.price) * 100) }))
  );

  const sorted = [...allPlans]
    .filter(pl => filterProvider === "all" || pl.provider.id === filterProvider)
    .sort((a, b) => {
      if (sortBy === "speed") return parseInt(b.speed) - parseInt(a.speed);
      if (sortBy === "price") return a.price - b.price;
      return b.valueScore - a.valueScore;
    });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3"
      style={{ background: "rgba(10,15,40,0.75)", backdropFilter: "blur(18px)" }}>
      <div className="relative w-full max-w-5xl max-h-[95vh] flex flex-col rounded-3xl overflow-hidden"
        style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.15)", boxShadow: "0 40px 100px rgba(30,45,110,0.2)" }}>
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,#c41e3a,transparent)" }} />

        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(30,45,110,0.1)", background: "rgba(30,45,110,0.03)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)", boxShadow: "0 4px 20px rgba(30,45,110,0.3)" }}>
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[17px] font-black" style={{ color: "#0f1a3d" }}>Provider Intelligence</h2>
              <p className="text-[11px]" style={{ color: "rgba(30,45,110,0.45)" }}>
                {available.length} provider{available.length !== 1 ? "s" : ""} available · {allPlans.length} plans compared
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[
              { id: "table", label: "Table", icon: "📋" },
              { id: "features", label: "Features", icon: "✨" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                style={{
                  background: activeTab === tab.id ? "rgba(30,45,110,0.1)" : "transparent",
                  border: `1px solid ${activeTab === tab.id ? "rgba(30,45,110,0.25)" : "rgba(30,45,110,0.1)"}`,
                  color: activeTab === tab.id ? "#1e2d6e" : "rgba(30,45,110,0.4)",
                }}>
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-slate-100 ml-2">
              <X className="w-4 h-4" style={{ color: "#1e2d6e" }} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          <div className={`grid gap-3 ${available.length <= 2 ? "grid-cols-2" : available.length === 3 ? "grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}>
            {available.map(({ provider }) => (
              <div key={provider.id} className="rounded-2xl overflow-hidden relative cursor-pointer transition-all hover:scale-[1.02]"
                style={{ background: `${provider.color}08`, border: `1px solid ${filterProvider === provider.id ? provider.color + "50" : provider.color + "20"}` }}
                onClick={() => setFilterProvider(f => f === provider.id ? "all" : provider.id)}>
                <div className="h-0.5" style={{ background: `linear-gradient(90deg,${provider.color},transparent)` }} />
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{provider.logo}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-black truncate" style={{ color: "#0f1a3d" }}>{provider.name}</p>
                      <Stars rating={provider.rating} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { label: "Plans",     value: provider.plans.length },
                      { label: "Uptime",    value: provider.uptime },
                      { label: "Customers", value: provider.customers },
                      { label: "Since",     value: provider.founded },
                    ].map(d => (
                      <div key={d.label} className="text-center rounded-lg py-1 px-1.5"
                        style={{ background: "rgba(30,45,110,0.04)" }}>
                        <p className="text-[11px] font-black" style={{ color: provider.color, fontFamily: "monospace" }}>{d.value}</p>
                        <p className="text-[9px]" style={{ color: "rgba(30,45,110,0.35)" }}>{d.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <BestValuePicks available={available} />

          {activeTab === "table" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(30,45,110,0.4)" }}>Sort:</span>
                {[{ id: "value", label: "Best Value" }, { id: "speed", label: "Fastest" }, { id: "price", label: "Cheapest" }].map(s => (
                  <button key={s.id} onClick={() => setSortBy(s.id)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                    style={{
                      background: sortBy === s.id ? "rgba(30,45,110,0.1)" : "rgba(30,45,110,0.03)",
                      border: `1px solid ${sortBy === s.id ? "rgba(30,45,110,0.25)" : "rgba(30,45,110,0.1)"}`,
                      color: sortBy === s.id ? "#1e2d6e" : "rgba(30,45,110,0.4)",
                    }}>{s.label}</button>
                ))}
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(30,45,110,0.12)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "rgba(30,45,110,0.04)", borderBottom: "1px solid rgba(30,45,110,0.1)" }}>
                        {["Provider","Plan","⬇ Download","⬆ Upload","R / month","Contract","Value",""].map(h => (
                          <th key={h} className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.15em]" style={{ color: "rgba(30,45,110,0.45)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((pl, i) => {
                        const isTop = i === 0 && sortBy === "value";
                        return (
                          <tr key={i} style={{ borderTop: "1px solid rgba(30,45,110,0.06)", background: isTop ? `${pl.provider.color}06` : "transparent" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(30,45,110,0.03)"}
                            onMouseLeave={e => e.currentTarget.style.background = isTop ? `${pl.provider.color}06` : "transparent"}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{pl.provider.logo}</span>
                                <span className="text-[11px] font-bold" style={{ color: pl.provider.color }}>{pl.provider.name}</span>
                                {isTop && <span className="text-[8px] px-1.5 py-0.5 rounded-full font-black" style={{ background: "#f59e0b20", color: "#f59e0b", border: "1px solid #f59e0b30" }}>BEST</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[12px] font-bold" style={{ color: "#1e2d6e" }}>{pl.label}</td>
                            <td className="px-4 py-3 text-[14px] font-black" style={{ color: "#0f1a3d", fontFamily: "monospace" }}>{pl.speed}</td>
                            <td className="px-4 py-3 text-[12px]" style={{ color: "rgba(30,45,110,0.5)", fontFamily: "monospace" }}>{pl.upload}</td>
                            <td className="px-4 py-3">
                              <span className="text-[15px] font-black" style={{ color: pl.provider.color }}>R{pl.price}</span>
                              <span className="text-[10px] ml-1" style={{ color: "rgba(30,45,110,0.4)" }}>/mo</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[11px] px-2 py-1 rounded-lg font-bold"
                                style={{ background: "rgba(30,45,110,0.06)", color: "rgba(30,45,110,0.5)", border: "1px solid rgba(30,45,110,0.1)" }}>
                                {pl.contract} mo
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: "rgba(30,45,110,0.08)" }}>
                                  <div className="h-2 rounded-full" style={{ width: `${Math.min(100, pl.valueScore / 5)}%`, background: pl.valueScore > 40 ? "#059669" : pl.valueScore > 20 ? "#d97706" : "#c41e3a" }} />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {pl.provider.id === "touchnet" && (
                                <button onClick={() => onSignUp(pl)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black text-white transition-all hover:scale-105"
                                  style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)", boxShadow: "0 3px 12px rgba(30,45,110,0.3)" }}>
                                  Sign Up <ArrowUpRight className="w-3 h-3" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(30,45,110,0.12)" }}>
              <div className="overflow-x-auto">
                <table className="w-full" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(30,45,110,0.04)", borderBottom: "1px solid rgba(30,45,110,0.1)" }}>
                      <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-[0.15em]" style={{ color: "rgba(30,45,110,0.45)", width: 160 }}>Feature</th>
                      {available.map(({ provider }) => (
                        <th key={provider.id} className="px-4 py-3 text-center text-[9px] font-black uppercase tracking-[0.15em]" style={{ color: provider.color }}>
                          {provider.logo} {provider.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "Uncapped Data",     key: "uncapped" },
                      { feature: "Static IP",         key: "static_ip" },
                      { feature: "SLA Guarantee",     key: "sla" },
                      { feature: "Free Router",       key: "router" },
                      { feature: "WiFi 6",            key: "wifi6" },
                      { feature: "Gigabit Available", key: "gigabit" },
                      { feature: "12-mo Contract",    key: "short_contract" },
                    ].map((row, ri) => (
                      <tr key={row.key} style={{ borderTop: "1px solid rgba(30,45,110,0.06)", background: ri % 2 === 0 ? "transparent" : "rgba(30,45,110,0.02)" }}>
                        <td className="px-4 py-3 text-[12px] font-semibold" style={{ color: "#1e2d6e" }}>{row.feature}</td>
                        {available.map(({ provider }) => {
                          const allFeatures = provider.plans.flatMap(p => p.features?.map(f => f.toLowerCase()) || []);
                          const maxSpeed = Math.max(...provider.plans.map(p => parseInt(p.speed) || 0));
                          const minContract = Math.min(...provider.plans.map(p => p.contract || 24));
                          const checks = {
                            uncapped:       allFeatures.some(f => f.includes("uncapped")),
                            static_ip:      allFeatures.some(f => f.includes("static")),
                            sla:            allFeatures.some(f => f.includes("sla")),
                            router:         allFeatures.some(f => f.includes("router")),
                            wifi6:          allFeatures.some(f => f.includes("wifi 6")),
                            gigabit:        maxSpeed >= 1000,
                            short_contract: minContract <= 12,
                          };
                          const has = checks[row.key];
                          return (
                            <td key={provider.id} className="px-4 py-3 text-center">
                              {has
                                ? <span className="inline-flex w-6 h-6 items-center justify-center rounded-full text-[12px]"
                                    style={{ background: `${provider.color}18`, border: `1px solid ${provider.color}30` }}>✓</span>
                                : <span className="inline-block w-6 h-6 rounded-full text-center leading-6"
                                    style={{ background: "rgba(30,45,110,0.05)", color: "rgba(30,45,110,0.2)" }}>–</span>
                              }
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main CoverageCheck ─────────────────────────────────────────────────────────
export default function CoverageCheck() {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const circlesRef = useRef([]);
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const autocompleteRef = useRef(null);
  const searchInputRef = useRef(null);

  const [address, setAddress] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [providerResults, setProviderResults] = useState([]);
  const [step, setStep] = useState("search");
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "", plan: "standard_50mbps" });
  const [submitting, setSubmitting] = useState(false);
  const [activeProviders, setActiveProviders] = useState(Object.keys(PROVIDERS));
  const [showComparison, setShowComparison] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("check");
  const [scanAnim, setScanAnim] = useState(false);
  const [mapStyle, setMapStyle] = useState("roadmap");

  const mapsLoaded = useGoogleMaps();

  // Init map
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || googleMapRef.current) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: -28.5, lng: 25.5 },
      zoom: 6,
      mapTypeId: mapStyle,
      disableDefaultUI: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_BOTTOM },
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
      ],
    });
    googleMapRef.current = map;
    infoWindowRef.current = new window.google.maps.InfoWindow();
    drawCoverageCircles(map);
  }, [mapsLoaded]);

  // Autocomplete
  useEffect(() => {
    if (!mapsLoaded || !searchInputRef.current || autocompleteRef.current) return;
    const ac = new window.google.maps.places.Autocomplete(searchInputRef.current, {
      componentRestrictions: { country: "za" },
      types: ["geocode"],
    });
    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (place.formatted_address) setAddress(place.formatted_address);
      if (place.geometry?.location) {
        handleSearchWithCoords(place.geometry.location.lat(), place.geometry.location.lng(), place.formatted_address || "");
      }
    });
    autocompleteRef.current = ac;
  }, [mapsLoaded]);

  // Redraw circles when activeProviders change
  useEffect(() => {
    if (googleMapRef.current) {
      drawCoverageCircles(googleMapRef.current);
    }
  }, [activeProviders]);

  // Update map type
  useEffect(() => {
    if (googleMapRef.current) {
      googleMapRef.current.setMapTypeId(mapStyle);
    }
  }, [mapStyle]);

  const drawCoverageCircles = useCallback((map) => {
    // Remove old circles
    circlesRef.current.forEach(c => c.setMap(null));
    circlesRef.current = [];

    Object.values(PROVIDERS).forEach(provider => {
      if (!activeProviders.includes(provider.id)) return;
      provider.zones.forEach(zone => {
        const circle = new window.google.maps.Circle({
          map,
          center: { lat: zone.lat, lng: zone.lng },
          radius: zone.radius,
          fillColor: provider.color,
          fillOpacity: 0.13,
          strokeColor: provider.color,
          strokeOpacity: 0.6,
          strokeWeight: provider.id === "touchnet" ? 2 : 1,
        });

        circle.addListener("click", () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.setContent(`
              <div style="font-family:Inter,sans-serif;padding:4px;min-width:160px">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                  <span style="font-size:20px">${provider.logo}</span>
                  <div>
                    <p style="font-weight:900;font-size:13px;color:#0f1a3d;margin:0">${provider.name}</p>
                    <p style="font-size:10px;color:${provider.color};margin:0">${zone.label}</p>
                  </div>
                </div>
                <div style="border-top:1px solid #e2e8f0;padding-top:6px">
                  ${provider.plans.slice(0,3).map(pl => `
                    <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px">
                      <span style="font-weight:700;color:#334155">${pl.speed}</span>
                      <span style="color:${provider.color};font-weight:800">R${pl.price}/mo</span>
                    </div>`).join("")}
                </div>
              </div>
            `);
            infoWindowRef.current.setPosition({ lat: zone.lat, lng: zone.lng });
            infoWindowRef.current.open(map);
          }
        });

        circlesRef.current.push(circle);
      });
    });
  }, [activeProviders]);

  const handleSearchWithCoords = async (lat, lng, displayName) => {
    setSearching(false);
    setScanAnim(true);
    const allResults = checkAllProviders(lat, lng);
    const touchnetResult = allResults.find(r => r.provider.id === "touchnet");
    setResult({ covered: touchnetResult?.covered, zone: touchnetResult?.zone, lat, lng, displayName });
    setProviderResults(allResults);
    setStep("result");
    setSidebarTab("results");

    const map = googleMapRef.current;
    if (map) {
      map.panTo({ lat, lng });
      map.setZoom(13);

      // Remove old marker
      if (markerRef.current) markerRef.current.setMap(null);

      const available = allResults.filter(r => r.covered);
      markerRef.current = new window.google.maps.Marker({
        map,
        position: { lat, lng },
        title: displayName,
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: touchnetResult?.covered ? "#059669" : "#c41e3a",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      if (infoWindowRef.current) {
        infoWindowRef.current.setContent(`
          <div style="font-family:Inter,sans-serif;padding:4px;min-width:180px">
            <p style="font-weight:900;font-size:13px;margin-bottom:4px;color:#0f1a3d">📍 ${displayName?.split(",")[0] || "Your Location"}</p>
            ${available.length > 0
              ? `<p style="font-size:11px;color:#059669;font-weight:700;margin-bottom:4px">✓ ${available.length} provider${available.length > 1 ? "s" : ""} available</p>
                 ${available.map(({ provider }) => `<p style="font-size:11px;color:#334155;margin:1px 0">${provider.logo} ${provider.name}</p>`).join("")}`
              : `<p style="font-size:11px;color:#c41e3a">No coverage yet in this area</p>`}
          </div>
        `);
        infoWindowRef.current.open(map, markerRef.current);
      }
    }

    base44.entities.CoverageSearch.create({
      query: address || displayName, display_name: displayName, lat, lng,
      covered: touchnetResult?.covered, nearest_zone: touchnetResult?.zone?.label || "",
    }).catch(() => {});

    setTimeout(() => setScanAnim(false), 2000);
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!address.trim()) return;
    setSearching(true); setScanAnim(true); setResult(null); setProviderResults([]);
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: address + ", South Africa", componentRestrictions: { country: "ZA" } }, (results, status) => {
        setSearching(false);
        if (status === "OK" && results[0]) {
          const loc = results[0].geometry.location;
          handleSearchWithCoords(loc.lat(), loc.lng(), results[0].formatted_address);
        } else {
          setResult({ error: "Address not found. Try a suburb or city name." });
          setScanAnim(false);
        }
      });
    } catch {
      setSearching(false);
      setScanAnim(false);
      setResult({ error: "Search failed. Please try again." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitting(true);
    try {
      await base44.entities.Referral.create({
        referrer_customer_id: "website_lead",
        referrer_name: "Coverage Check Lead",
        referrer_email: "website@touchnet.co.za",
        referred_name: form.name, referred_email: form.email,
        referred_phone: form.phone, referred_address: result?.displayName,
        service_interest: form.plan,
        notes: form.notes + (result?.zone ? `\nZone: ${result.zone.label}` : ""),
        status: "submitted",
      });
      setStep("success");
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const reset = () => {
    setStep("search"); setResult(null); setProviderResults([]); setAddress("");
    setSidebarTab("check");
    setForm({ name: "", email: "", phone: "", notes: "", plan: "standard_50mbps" });
    if (markerRef.current) { markerRef.current.setMap(null); markerRef.current = null; }
    if (infoWindowRef.current) infoWindowRef.current.close();
    if (googleMapRef.current) { googleMapRef.current.panTo({ lat: -28.5, lng: 25.5 }); googleMapRef.current.setZoom(6); }
  };

  const toggleProvider = (id) => setActiveProviders(prev =>
    prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
  );

  const availableProviders = providerResults.filter(r => r.covered);
  const unavailableProviders = providerResults.filter(r => !r.covered);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#eef0f7", fontFamily: "'Inter', sans-serif" }}>

      <style>{`
        @keyframes ping { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .slide-in { animation: slideIn 0.3s ease forwards; }
        .fade-up  { animation: fadeUp  0.35s ease forwards; }
        .pac-container { z-index: 9999 !important; border-radius: 12px !important; box-shadow: 0 12px 40px rgba(30,45,110,0.15) !important; border: 1px solid rgba(30,45,110,0.15) !important; }
      `}</style>

      {/* Header */}
      <header className="relative z-30 flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.97)", borderBottom: "1px solid rgba(30,45,110,0.12)", backdropFilter: "blur(20px)" }}>
        <div className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,#c41e3a,transparent)" }} />
        <div className="flex items-center gap-4">
          <img src={LOGO_URL} alt="TouchNet" className="h-7 object-contain" />
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(30,45,110,0.06)", border: "1px solid rgba(30,45,110,0.15)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#1e2d6e" }} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(30,45,110,0.6)", fontFamily: "monospace" }}>
              FIBRE COVERAGE INTELLIGENCE
            </span>
          </div>
        </div>
        <a href="/"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
          style={{ background: "rgba(30,45,110,0.08)", border: "1px solid rgba(30,45,110,0.2)", color: "#1e2d6e" }}>
          Portal <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden relative" style={{ height: "calc(100vh - 53px)" }}>

        {/* Sidebar */}
        <div className="relative z-20 flex flex-col flex-shrink-0 overflow-hidden"
          style={{ width: 340, background: "rgba(255,255,255,0.97)", borderRight: "1px solid rgba(30,45,110,0.12)", backdropFilter: "blur(20px)" }}>

          {/* Tab bar */}
          <div className="flex border-b flex-shrink-0" style={{ borderColor: "rgba(30,45,110,0.1)" }}>
            {[
              { key: "check", label: "Check", icon: Search },
              { key: "providers", label: "Providers", icon: Layers },
              ...(providerResults.length > 0 ? [{ key: "results", label: `Results (${availableProviders.length})`, icon: Activity }] : []),
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.key} onClick={() => setSidebarTab(tab.key)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-black uppercase tracking-wider transition-all"
                  style={{
                    background: sidebarTab === tab.key ? "rgba(30,45,110,0.06)" : "transparent",
                    borderBottom: sidebarTab === tab.key ? "2px solid #1e2d6e" : "2px solid transparent",
                    color: sidebarTab === tab.key ? "#1e2d6e" : "rgba(30,45,110,0.35)",
                    marginBottom: -1,
                  }}>
                  <Icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* CHECK TAB */}
            {sidebarTab === "check" && (
              <div className="space-y-4 fade-up">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl mb-3"
                    style={{ background: "rgba(30,45,110,0.07)", border: "1px solid rgba(30,45,110,0.18)" }}>
                    <Globe className="w-3 h-3" style={{ color: "#1e2d6e" }} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "#1e2d6e" }}>
                      Multi-Provider Coverage Check
                    </span>
                  </div>
                  <h1 className="text-[20px] font-black leading-tight mb-1" style={{ color: "#0f1a3d", fontFamily: "'Space Grotesk',sans-serif" }}>
                    Is Fibre Available<br />
                    <span className="gradient-text">At Your Address?</span>
                  </h1>
                  <p className="text-[12px]" style={{ color: "rgba(30,45,110,0.5)" }}>
                    Instantly compare all available providers and plans.
                  </p>
                </div>

                <form onSubmit={handleSearch} className="space-y-2">
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 z-10" style={{ color: "#1e2d6e" }} />
                    <input
                      ref={searchInputRef}
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="e.g. Sandton City, 25 Rivonia Rd…"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl text-[13px] outline-none transition-all"
                      style={{ background: "#f8f9fd", border: "1px solid rgba(30,45,110,0.2)", color: "#0f1a3d" }}
                    />
                  </div>
                  <button type="submit" disabled={searching || !address.trim() || !mapsLoaded}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[13px] text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)", boxShadow: "0 6px 24px rgba(30,45,110,0.35)" }}>
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {!mapsLoaded ? "Loading Maps…" : searching ? "Scanning all providers…" : "Check All Providers"}
                  </button>
                </form>

                {result?.error && (
                  <div className="rounded-2xl p-3 flex items-start gap-2"
                    style={{ background: "rgba(196,30,58,0.06)", border: "1px solid rgba(196,30,58,0.2)" }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#c41e3a" }} />
                    <p className="text-[12px]" style={{ color: "#c41e3a" }}>{result.error}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Providers", value: Object.keys(PROVIDERS).length, color: "#1e2d6e" },
                    { label: "Zones",     value: Object.values(PROVIDERS).reduce((a,p) => a + p.zones.length, 0), color: "#4a5fa8" },
                    { label: "Plans",     value: Object.values(PROVIDERS).reduce((a,p) => a + p.plans.length, 0), color: "#c41e3a" },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center relative overflow-hidden"
                      style={{ background: `${s.color}08`, border: `1px solid ${s.color}18` }}>
                      <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg,${s.color},transparent)` }} />
                      <p className="text-[18px] font-black" style={{ color: s.color, fontFamily: "monospace" }}>{s.value}</p>
                      <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "rgba(30,45,110,0.4)" }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl p-4 relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg,rgba(30,45,110,0.05),rgba(196,30,58,0.03))", border: "1px solid rgba(30,45,110,0.12)" }}>
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#1e2d6e,#c41e3a,transparent)" }} />
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#1e2d6e" }}>Why Choose TouchNet?</p>
                  <div className="space-y-2">
                    {[
                      { icon: Zap,      label: "Fastest speeds up to 1 Gbps",   color: "#d97706" },
                      { icon: Shield,   label: "99.9% uptime SLA guaranteed",   color: "#059669" },
                      { icon: Clock,    label: "24/7 local technical support",  color: "#1e2d6e" },
                      { icon: TrendingUp, label: "Transparent, no hidden fees", color: "#c41e3a" },
                    ].map(({ icon: Icon, label, color }) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                          <Icon className="w-3 h-3" style={{ color }} />
                        </div>
                        <p className="text-[11px]" style={{ color: "rgba(30,45,110,0.7)" }}>{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PROVIDERS TAB */}
            {sidebarTab === "providers" && (
              <div className="space-y-3 fade-up">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: "rgba(30,45,110,0.45)" }}>All Providers on Map</p>
                  <button onClick={() => setActiveProviders(Object.keys(PROVIDERS))}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg"
                    style={{ background: "rgba(30,45,110,0.07)", color: "#1e2d6e", border: "1px solid rgba(30,45,110,0.15)" }}>
                    Show All
                  </button>
                </div>
                {Object.values(PROVIDERS).map(p => (
                  <div key={p.id} className="rounded-2xl overflow-hidden transition-all"
                    style={{ background: activeProviders.includes(p.id) ? `${p.color}06` : "rgba(30,45,110,0.02)", border: `1px solid ${activeProviders.includes(p.id) ? p.color + "22" : "rgba(30,45,110,0.08)"}` }}>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.logo}</span>
                        <div>
                          <p className="text-[13px] font-black" style={{ color: activeProviders.includes(p.id) ? "#0f1a3d" : "rgba(30,45,110,0.35)" }}>{p.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Stars rating={p.rating} />
                            <span className="text-[9px]" style={{ color: "rgba(30,45,110,0.4)" }}>{p.zones.length} zones</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => toggleProvider(p.id)}
                        className="w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0 relative"
                        style={{ background: activeProviders.includes(p.id) ? p.color : "rgba(30,45,110,0.12)" }}>
                        <span className="block w-4 h-4 bg-white rounded-full shadow-md absolute top-0.5 transition-all duration-300"
                          style={{ left: activeProviders.includes(p.id) ? "calc(100% - 18px)" : "2px" }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* RESULTS TAB */}
            {sidebarTab === "results" && providerResults.length > 0 && (
              <div className="space-y-3 fade-up">
                <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "rgba(30,45,110,0.45)" }}>
                  Results for {result?.displayName?.split(",")[0]}
                </p>

                {availableProviders.length > 1 && (
                  <button onClick={() => setShowComparison(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[12px] text-white transition-all hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)", boxShadow: "0 6px 20px rgba(30,45,110,0.3)" }}>
                    <BarChart3 className="w-4 h-4" />
                    Compare {availableProviders.length} Available Providers
                  </button>
                )}

                {availableProviders.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "#059669" }}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> {availableProviders.length} Provider{availableProviders.length !== 1 ? "s" : ""} Available
                    </p>
                    {availableProviders.map(({ provider, zone }) => (
                      <div key={provider.id} className="rounded-2xl overflow-hidden slide-in"
                        style={{ background: `${provider.color}06`, border: `1px solid ${provider.color}22` }}>
                        <div className="h-0.5" style={{ background: `linear-gradient(90deg,${provider.color},transparent)` }} />
                        <div className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{provider.logo}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-black" style={{ color: "#0f1a3d" }}>{provider.name}</p>
                              <p className="text-[10px]" style={{ color: provider.color }}>✓ {zone?.label}</p>
                            </div>
                            <Stars rating={provider.rating} />
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {provider.plans.slice(0,3).map(pl => (
                              <span key={pl.label} className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: `${provider.color}12`, color: provider.color, border: `1px solid ${provider.color}22` }}>
                                {pl.speed} · R{pl.price}
                              </span>
                            ))}
                          </div>
                          {provider.id === "touchnet" && (
                            <button onClick={() => { setStep("form"); setSidebarTab("check"); }}
                              className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black text-white"
                              style={{ background: `linear-gradient(135deg,#1e2d6e,#2a3d8f)`, boxShadow: "0 4px 14px rgba(30,45,110,0.3)" }}>
                              <Zap className="w-3 h-3" /> Sign Up with TouchNet
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl p-4 text-center"
                    style={{ background: "rgba(196,30,58,0.05)", border: "1px solid rgba(196,30,58,0.18)" }}>
                    <XCircle className="w-8 h-8 mx-auto mb-2" style={{ color: "#c41e3a" }} />
                    <p className="text-[13px] font-black" style={{ color: "#c41e3a" }}>No Coverage Yet</p>
                    <p className="text-[11px] mt-1" style={{ color: "rgba(30,45,110,0.5)" }}>Leave your details and we'll notify you!</p>
                  </div>
                )}

                {unavailableProviders.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(30,45,110,0.35)" }}>
                      {unavailableProviders.length} Not yet available
                    </p>
                    {unavailableProviders.map(({ provider }) => (
                      <div key={provider.id} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: "rgba(30,45,110,0.03)", border: "1px solid rgba(30,45,110,0.08)" }}>
                        <span className="text-base opacity-40">{provider.logo}</span>
                        <p className="text-[12px]" style={{ color: "rgba(30,45,110,0.45)" }}>{provider.name}</p>
                        <span className="ml-auto text-[9px]" style={{ color: "rgba(30,45,110,0.3)" }}>Coming soon</span>
                      </div>
                    ))}
                  </div>
                )}

                {step === "form" && (
                  <div className="rounded-2xl overflow-hidden fade-up"
                    style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.15)" }}>
                    <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,transparent)" }} />
                    <div className="p-4">
                      <p className="text-[13px] font-black mb-3" style={{ color: "#1e2d6e" }}>
                        {result?.covered ? "Sign Up with TouchNet" : "Get Notified When Available"}
                      </p>
                      <form onSubmit={handleSubmit} className="space-y-2.5">
                        {[
                          { field: "name",  label: "Full Name *", icon: User,  placeholder: "John Smith",      type: "text",  required: true },
                          { field: "email", label: "Email *",     icon: Mail,  placeholder: "john@email.com",  type: "email", required: true },
                          { field: "phone", label: "Phone",       icon: Phone, placeholder: "071 234 5678",    type: "tel",   required: false },
                        ].map(({ field, label, icon: Icon, placeholder, type, required }) => (
                          <div key={field}>
                            <label className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(30,45,110,0.4)" }}>{label}</label>
                            <div className="relative">
                              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(30,45,110,0.35)" }} />
                              <input required={required} type={type} value={form[field]}
                                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                                placeholder={placeholder}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[12px] outline-none"
                                style={{ background: "#f8f9fd", border: "1px solid rgba(30,45,110,0.2)", color: "#0f1a3d" }} />
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setStep("result")}
                            className="px-3 py-2.5 rounded-xl text-[11px] font-bold"
                            style={{ background: "rgba(30,45,110,0.06)", border: "1px solid rgba(30,45,110,0.15)", color: "#1e2d6e" }}>
                            ← Back
                          </button>
                          <button type="submit" disabled={submitting}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold text-white disabled:opacity-60"
                            style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)", boxShadow: "0 4px 16px rgba(30,45,110,0.3)" }}>
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {submitting ? "Submitting…" : result?.covered ? "Get Connected" : "Notify Me"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {step === "success" && (
                  <div className="rounded-2xl p-5 text-center fade-up"
                    style={{ background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.2)" }}>
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2" style={{ color: "#059669" }} />
                    <p className="text-[14px] font-black" style={{ color: "#059669" }}>Submitted!</p>
                    <p className="text-[11px] mt-1 mb-3" style={{ color: "rgba(30,45,110,0.5)" }}>We'll contact you within 24 hours.</p>
                    <button onClick={reset}
                      className="text-[11px] font-bold px-4 py-2 rounded-xl"
                      style={{ background: "rgba(30,45,110,0.07)", border: "1px solid rgba(30,45,110,0.15)", color: "#1e2d6e" }}>
                      Check Another Address
                    </button>
                  </div>
                )}

                {step === "result" && result?.covered && (
                  <button onClick={() => setStep("form")}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[12px] text-white"
                    style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 6px 20px rgba(5,150,105,0.25)" }}>
                    <Zap className="w-4 h-4" /> Sign Up with TouchNet Now
                  </button>
                )}
                {step === "result" && !result?.covered && (
                  <button onClick={() => setStep("form")}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[12px] text-white"
                    style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)", boxShadow: "0 6px 20px rgba(30,45,110,0.25)" }}>
                    <Mail className="w-4 h-4" /> Notify Me When Available
                  </button>
                )}

                <button onClick={reset}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-bold"
                  style={{ color: "rgba(30,45,110,0.5)", border: "1px solid rgba(30,45,110,0.1)" }}>
                  <RefreshCw className="w-3.5 h-3.5" /> Check Another Address
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {/* Loading overlay */}
          {!mapsLoaded && (
            <div className="absolute inset-0 z-20 flex items-center justify-center"
              style={{ background: "#eef0f7" }}>
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: "#1e2d6e" }} />
                <p className="text-[12px] font-bold" style={{ color: "rgba(30,45,110,0.5)" }}>Loading Google Maps…</p>
              </div>
            </div>
          )}

          <div ref={mapRef} className="w-full h-full" />

          {/* Scan animation */}
          {scanAnim && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
              <div className="relative">
                {[80, 140, 200, 260].map((size, i) => (
                  <div key={i} className="absolute rounded-full border-2"
                    style={{
                      width: size, height: size,
                      top: -size/2, left: -size/2,
                      borderColor: `rgba(30,45,110,${0.5 - i * 0.1})`,
                      animation: `ping ${0.8 + i * 0.3}s ease-out infinite`,
                      animationDelay: `${i * 0.15}s`,
                    }} />
                ))}
                <div className="w-4 h-4 rounded-full" style={{ background: "#1e2d6e", boxShadow: "0 0 20px rgba(30,45,110,0.8)" }} />
              </div>
            </div>
          )}

          {/* Map type switcher */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5"
            style={{ background: "rgba(255,255,255,0.96)", border: "1px solid rgba(30,45,110,0.15)", borderRadius: 14, padding: "10px 12px", backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(30,45,110,0.12)" }}>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: "rgba(30,45,110,0.4)", fontFamily: "monospace" }}>MAP VIEW</p>
            {[
              { id: "roadmap",   label: "Road",      icon: "🗺️" },
              { id: "satellite", label: "Satellite", icon: "🛰️" },
              { id: "hybrid",    label: "Hybrid",    icon: "🌍" },
              { id: "terrain",   label: "Terrain",   icon: "⛰️" },
            ].map(s => (
              <button key={s.id} onClick={() => setMapStyle(s.id)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all hover:bg-slate-50 text-left"
                style={{
                  background: mapStyle === s.id ? "rgba(30,45,110,0.08)" : "transparent",
                  border: `1px solid ${mapStyle === s.id ? "rgba(30,45,110,0.25)" : "transparent"}`,
                }}>
                <span className="text-sm">{s.icon}</span>
                <span className="text-[11px] font-bold" style={{ color: mapStyle === s.id ? "#1e2d6e" : "rgba(30,45,110,0.45)" }}>{s.label}</span>
                {mapStyle === s.id && <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#1e2d6e" }} />}
              </button>
            ))}
          </div>

          {/* Provider legend */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5"
            style={{ background: "rgba(255,255,255,0.96)", border: "1px solid rgba(30,45,110,0.15)", borderRadius: 16, padding: "12px 14px", backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(30,45,110,0.1)" }}>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: "rgba(30,45,110,0.4)", fontFamily: "monospace" }}>VISIBLE LAYERS</p>
            {Object.values(PROVIDERS).map(p => (
              <button key={p.id} onClick={() => toggleProvider(p.id)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all hover:bg-slate-50">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all"
                  style={{
                    background: activeProviders.includes(p.id) ? p.color : "rgba(30,45,110,0.1)",
                    border: `1.5px solid ${p.color}`,
                    boxShadow: activeProviders.includes(p.id) ? `0 0 6px ${p.glowColor}` : "none",
                  }} />
                <span className="text-[11px] font-bold" style={{ color: activeProviders.includes(p.id) ? "#0f1a3d" : "rgba(30,45,110,0.3)" }}>
                  {p.logo} {p.name}
                </span>
              </button>
            ))}
          </div>

          {/* Bottom status bar */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.96)", border: "1px solid rgba(30,45,110,0.15)", backdropFilter: "blur(10px)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#1e2d6e" }} />
              <span className="text-[10px] font-bold" style={{ color: "#1e2d6e" }}>GOOGLE MAPS</span>
              <span className="text-[9px]" style={{ color: "rgba(30,45,110,0.45)" }}>· {activeProviders.length} providers active</span>
            </div>
            {result && !result.error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: result.covered ? "rgba(5,150,105,0.08)" : "rgba(196,30,58,0.07)",
                  border: `1px solid ${result.covered ? "rgba(5,150,105,0.25)" : "rgba(196,30,58,0.2)"}`,
                  backdropFilter: "blur(10px)",
                }}>
                {result.covered
                  ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#059669" }} />
                  : <XCircle className="w-3.5 h-3.5" style={{ color: "#c41e3a" }} />}
                <span className="text-[11px] font-bold" style={{ color: result.covered ? "#059669" : "#c41e3a" }}>
                  {result.covered ? `${availableProviders.length} providers available` : "No coverage at this location"}
                </span>
              </div>
            )}
            {providerResults.length > 1 && availableProviders.length > 0 && (
              <button onClick={() => setShowComparison(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-white"
                style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)", boxShadow: "0 4px 14px rgba(30,45,110,0.3)" }}>
                <BarChart3 className="w-3.5 h-3.5" /> Compare Plans
              </button>
            )}
          </div>
        </div>
      </div>

      {showComparison && (
        <ComparisonModal
          providerResults={providerResults}
          onClose={() => setShowComparison(false)}
          onSignUp={(plan) => {
            setShowComparison(false);
            setStep("form");
            setSidebarTab("results");
          }}
        />
      )}
    </div>
  );
}