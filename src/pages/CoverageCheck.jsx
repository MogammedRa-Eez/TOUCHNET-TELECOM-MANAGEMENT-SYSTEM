import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin, Search, CheckCircle2, XCircle, AlertCircle, Loader2,
  Zap, Send, Phone, Mail, User, ArrowRight, RefreshCw,
  Layers, X, BarChart3, Shield, Clock, TrendingUp, ArrowUpRight,
  Activity, Globe, FileText, Download
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import jsPDF from "jspdf";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

const PROVIDERS = {
  touchnet: {
    id: "touchnet", name: "TouchNet", color: "#1e2d6e", logo: "🔷",
    tagline: "Premium Uncapped Fibre", type: "fibre",
    plans: [
      { label: "Basic",      speed: "10 Mbps",  price: 399,  upload: "5 Mbps",   contract: 24 },
      { label: "Standard",   speed: "50 Mbps",  price: 599,  upload: "25 Mbps",  contract: 24 },
      { label: "Premium",    speed: "100 Mbps", price: 899,  upload: "50 Mbps",  contract: 24 },
      { label: "Enterprise", speed: "500 Mbps", price: 1499, upload: "250 Mbps", contract: 24 },
      { label: "Gigabit",    speed: "1 Gbps",   price: 2999, upload: "500 Mbps", contract: 24 },
    ],
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton",        radius: 10000 },
      { lat: -26.0274, lng: 28.1527, label: "Fourways",       radius: 9000  },
      { lat: -25.8579, lng: 28.1893, label: "Centurion",      radius: 11000 },
      { lat: -26.0765, lng: 28.0556, label: "Randburg",       radius: 9000  },
      { lat: -26.1715, lng: 27.9681, label: "Krugersdorp",    radius: 8000  },
      { lat: -25.9025, lng: 28.4211, label: "Kempton Park",   radius: 9000  },
      { lat: -25.7479, lng: 28.2293, label: "Pretoria East",  radius: 11000 },
      { lat: -26.2041, lng: 28.0473, label: "JHB South",      radius: 10000 },
      { lat: -26.1367, lng: 28.2411, label: "Bedfordview",    radius: 8000  },
      { lat: -26.2309, lng: 28.2772, label: "Alberton",       radius: 8000  },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town CBD",  radius: 10000 },
      { lat: -29.8587, lng: 31.0218, label: "Durban North",   radius: 10000 },
      { lat: -29.1197, lng: 26.214,  label: "Bloemfontein",   radius: 9000  },
    ],
    rating: 4.8, uptime: "99.9%",
  },
  openserve: {
    id: "openserve", name: "Openserve", color: "#06b6d4", logo: "🌐",
    tagline: "Telkom Wholesale FTTH", type: "fibre",
    plans: [
      { label: "10M",  speed: "10 Mbps",  price: 349,  upload: "5 Mbps",   contract: 24 },
      { label: "50M",  speed: "50 Mbps",  price: 549,  upload: "25 Mbps",  contract: 24 },
      { label: "100M", speed: "100 Mbps", price: 799,  upload: "50 Mbps",  contract: 24 },
      { label: "1G",   speed: "1 Gbps",   price: 2699, upload: "500 Mbps", contract: 24 },
    ],
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton/Midrand",  radius: 14000 },
      { lat: -25.7479, lng: 28.2293, label: "Pretoria",         radius: 16000 },
      { lat: -26.2041, lng: 28.0473, label: "Johannesburg",     radius: 15000 },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town",        radius: 14000 },
      { lat: -29.8587, lng: 31.0218, label: "Durban",           radius: 13000 },
      { lat: -33.0,    lng: 27.9,    label: "East London",      radius: 9000  },
      { lat: -33.9602, lng: 25.6022, label: "Port Elizabeth",   radius: 10000 },
      { lat: -26.3181, lng: 27.9175, label: "Vereeniging",      radius: 8000  },
      { lat: -23.9045, lng: 29.4686, label: "Polokwane",        radius: 8000  },
    ],
    rating: 4.1, uptime: "99.5%",
  },
  vumatel: {
    id: "vumatel", name: "Vumatel", color: "#f59e0b", logo: "⚡",
    tagline: "High-Density Urban FTTH", type: "fibre",
    plans: [
      { label: "25M",  speed: "25 Mbps",  price: 459,  upload: "12 Mbps",  contract: 12 },
      { label: "50M",  speed: "50 Mbps",  price: 649,  upload: "25 Mbps",  contract: 12 },
      { label: "200M", speed: "200 Mbps", price: 1099, upload: "100 Mbps", contract: 12 },
      { label: "1G",   speed: "1 Gbps",   price: 2499, upload: "500 Mbps", contract: 12 },
    ],
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton",              radius: 9000  },
      { lat: -26.0274, lng: 28.1527, label: "Fourways/Northriding", radius: 8500  },
      { lat: -26.1887, lng: 28.0667, label: "Soweto",               radius: 11000 },
      { lat: -26.0765, lng: 28.0556, label: "Randburg",             radius: 8000  },
      { lat: -26.1367, lng: 28.2411, label: "Bedfordview",          radius: 7000  },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town",            radius: 10000 },
      { lat: -29.8587, lng: 31.0218, label: "Durban",               radius: 10000 },
      { lat: -25.8579, lng: 28.1893, label: "Centurion",            radius: 8000  },
    ],
    rating: 4.5, uptime: "99.7%",
  },
  frogfoot: {
    id: "frogfoot", name: "Frogfoot", color: "#10b981", logo: "🐸",
    tagline: "Open-Access FTTH Network", type: "fibre",
    plans: [
      { label: "10M",  speed: "10 Mbps",  price: 299, upload: "5 Mbps",   contract: 12 },
      { label: "25M",  speed: "25 Mbps",  price: 449, upload: "12 Mbps",  contract: 12 },
      { label: "100M", speed: "100 Mbps", price: 749, upload: "50 Mbps",  contract: 12 },
      { label: "200M", speed: "200 Mbps", price: 999, upload: "100 Mbps", contract: 24 },
    ],
    zones: [
      { lat: -26.0274, lng: 28.1527, label: "Northriding/Fourways",  radius: 7500 },
      { lat: -25.9025, lng: 28.4211, label: "Kempton Park",          radius: 8000 },
      { lat: -26.2309, lng: 28.2772, label: "Alberton",              radius: 7500 },
      { lat: -26.1367, lng: 28.2411, label: "Bedfordview/Edenvale",  radius: 7000 },
      { lat: -26.3044, lng: 27.8525, label: "Roodepoort",            radius: 7000 },
      { lat: -29.1197, lng: 26.214,  label: "Bloemfontein",          radius: 9000 },
      { lat: -25.8579, lng: 28.1893, label: "Centurion",             radius: 7500 },
    ],
    rating: 4.3, uptime: "99.6%",
  },
  octotel: {
    id: "octotel", name: "Octotel", color: "#8b5cf6", logo: "🐙",
    tagline: "Cape Town Open-Access Fibre", type: "fibre",
    plans: [
      { label: "10M",  speed: "10 Mbps",  price: 299,  upload: "5 Mbps",   contract: 12 },
      { label: "50M",  speed: "50 Mbps",  price: 499,  upload: "25 Mbps",  contract: 12 },
      { label: "100M", speed: "100 Mbps", price: 699,  upload: "50 Mbps",  contract: 12 },
      { label: "1G",   speed: "1 Gbps",   price: 2199, upload: "500 Mbps", contract: 24 },
    ],
    zones: [
      { lat: -33.9249, lng: 18.4241, label: "Cape Town CBD",         radius: 9000 },
      { lat: -33.8668, lng: 18.6302, label: "Bellville/Tygervalley", radius: 8000 },
      { lat: -33.9602, lng: 18.4732, label: "Rondebosch/Claremont",  radius: 7500 },
      { lat: -34.0269, lng: 18.4641, label: "Lakeside/Muizenberg",   radius: 7000 },
      { lat: -33.8300, lng: 18.6300, label: "Durbanville",           radius: 7000 },
      { lat: -33.9600, lng: 18.8100, label: "Somerset West",         radius: 7000 },
    ],
    rating: 4.5, uptime: "99.7%",
  },
  mfn: {
    id: "mfn", name: "MFN", color: "#e879f9", logo: "📡",
    tagline: "Metro Fibre Network", type: "fibre",
    plans: [
      { label: "10M",  speed: "10 Mbps",  price: 329,  upload: "5 Mbps",   contract: 24 },
      { label: "50M",  speed: "50 Mbps",  price: 549,  upload: "25 Mbps",  contract: 24 },
      { label: "100M", speed: "100 Mbps", price: 799,  upload: "50 Mbps",  contract: 24 },
      { label: "200M", speed: "200 Mbps", price: 1199, upload: "100 Mbps", contract: 24 },
    ],
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton",          radius: 9000  },
      { lat: -26.0765, lng: 28.0556, label: "Randburg",         radius: 8500  },
      { lat: -26.2041, lng: 28.0473, label: "Johannesburg CBD", radius: 10000 },
      { lat: -25.7479, lng: 28.2293, label: "Pretoria East",    radius: 10000 },
      { lat: -25.8579, lng: 28.1893, label: "Centurion",        radius: 9000  },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town CBD",    radius: 8500  },
      { lat: -29.8587, lng: 31.0218, label: "Durban",           radius: 9500  },
    ],
    rating: 4.2, uptime: "99.5%",
  },
  dfa: {
    id: "dfa", name: "Dark Fibre Africa", color: "#fb923c", logo: "🔶",
    tagline: "Open-Access Dark Fibre", type: "fibre",
    plans: [
      { label: "10M",  speed: "10 Mbps",  price: 299,  upload: "10 Mbps",  contract: 12 },
      { label: "100M", speed: "100 Mbps", price: 749,  upload: "100 Mbps", contract: 12 },
      { label: "500M", speed: "500 Mbps", price: 1599, upload: "500 Mbps", contract: 24 },
      { label: "1G",   speed: "1 Gbps",   price: 2799, upload: "1 Gbps",   contract: 24 },
    ],
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton",          radius: 12000 },
      { lat: -26.2041, lng: 28.0473, label: "Johannesburg CBD", radius: 14000 },
      { lat: -25.7479, lng: 28.2293, label: "Pretoria",         radius: 15000 },
      { lat: -26.0274, lng: 28.1527, label: "Midrand",          radius: 10000 },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town",        radius: 13000 },
      { lat: -29.8587, lng: 31.0218, label: "Durban",           radius: 12000 },
    ],
    rating: 4.4, uptime: "99.8%",
  },
  evotel: {
    id: "evotel", name: "Evotel", color: "#f43f5e", logo: "🚀",
    tagline: "KZN & Coastal Fibre", type: "fibre",
    plans: [
      { label: "10M",  speed: "10 Mbps",  price: 349,  upload: "5 Mbps",   contract: 24 },
      { label: "100M", speed: "100 Mbps", price: 799,  upload: "50 Mbps",  contract: 24 },
      { label: "1G",   speed: "1 Gbps",   price: 2499, upload: "500 Mbps", contract: 24 },
    ],
    zones: [
      { lat: -29.8587, lng: 31.0218, label: "Durban North",     radius: 10000 },
      { lat: -29.6900, lng: 31.0600, label: "Umhlanga",         radius: 7000  },
      { lat: -30.3600, lng: 30.3800, label: "Pietermaritzburg", radius: 9000  },
      { lat: -33.9602, lng: 25.6022, label: "Port Elizabeth",   radius: 9000  },
    ],
    rating: 4.2, uptime: "99.5%",
  },
  metrofibre: {
    id: "metrofibre", name: "MetroFibre Networx", color: "#0ea5e9", logo: "🏙️",
    tagline: "Urban Fibre — Gauteng & Cape", type: "fibre",
    plans: [
      { label: "10M",  speed: "10 Mbps",  price: 349,  upload: "5 Mbps",   contract: 24 },
      { label: "100M", speed: "100 Mbps", price: 849,  upload: "50 Mbps",  contract: 24 },
      { label: "200M", speed: "200 Mbps", price: 1249, upload: "100 Mbps", contract: 24 },
    ],
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton",      radius: 8500 },
      { lat: -26.0274, lng: 28.1527, label: "Fourways",     radius: 8000 },
      { lat: -25.9025, lng: 28.4211, label: "Kempton Park", radius: 8000 },
      { lat: -26.3044, lng: 27.8525, label: "Roodepoort",   radius: 7500 },
      { lat: -26.0765, lng: 28.0556, label: "Randburg",     radius: 8000 },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town",    radius: 9000 },
    ],
    rating: 4.3, uptime: "99.6%",
  },
  zoom: {
    id: "zoom", name: "Zoom Fibre", color: "#a855f7", logo: "💨",
    tagline: "Rapid-Deploy Urban Fibre", type: "fibre",
    plans: [
      { label: "25M",  speed: "25 Mbps",  price: 399,  upload: "12 Mbps",  contract: 12 },
      { label: "100M", speed: "100 Mbps", price: 749,  upload: "50 Mbps",  contract: 12 },
      { label: "500M", speed: "500 Mbps", price: 1599, upload: "250 Mbps", contract: 24 },
    ],
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton",   radius: 8000 },
      { lat: -25.8579, lng: 28.1893, label: "Centurion", radius: 8000 },
      { lat: -29.6900, lng: 31.0600, label: "Umhlanga",  radius: 7000 },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town", radius: 8500 },
    ],
    rating: 4.3, uptime: "99.6%",
  },
  herotel: {
    id: "herotel", name: "Herotel", color: "#f472b6", logo: "🦸",
    tagline: "Rural & Peri-Urban Wireless", type: "wireless",
    plans: [
      { label: "10M",  speed: "10 Mbps",  price: 299, upload: "5 Mbps",  contract: 12 },
      { label: "50M",  speed: "50 Mbps",  price: 649, upload: "25 Mbps", contract: 12 },
      { label: "100M", speed: "100 Mbps", price: 899, upload: "50 Mbps", contract: 24 },
    ],
    zones: [
      { lat: -33.5833, lng: 26.8833, label: "Grahamstown",   radius: 9000  },
      { lat: -28.7282, lng: 24.7499, label: "Kimberley",     radius: 9000  },
      { lat: -29.1197, lng: 26.214,  label: "Bloemfontein",  radius: 10000 },
      { lat: -26.8667, lng: 26.6667, label: "Potchefstroom", radius: 8000  },
      { lat: -23.9045, lng: 29.4686, label: "Polokwane",     radius: 8000  },
    ],
    rating: 4.1, uptime: "99.2%",
  },
  liquid: {
    id: "liquid", name: "Liquid Home", color: "#60a5fa", logo: "💧",
    tagline: "Pan-African Fibre & Cloud", type: "fibre",
    plans: [
      { label: "10M",  speed: "10 Mbps",  price: 379,  upload: "5 Mbps",   contract: 24 },
      { label: "100M", speed: "100 Mbps", price: 849,  upload: "50 Mbps",  contract: 24 },
      { label: "1G",   speed: "1 Gbps",   price: 3199, upload: "500 Mbps", contract: 24 },
    ],
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton",      radius: 11000 },
      { lat: -26.2041, lng: 28.0473, label: "Johannesburg",  radius: 13000 },
      { lat: -25.7479, lng: 28.2293, label: "Pretoria",     radius: 14000 },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town",    radius: 12000 },
      { lat: -29.8587, lng: 31.0218, label: "Durban",       radius: 11000 },
    ],
    rating: 4.3, uptime: "99.7%",
  },
};

const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const checkAllProviders = (lat, lng) =>
  Object.values(PROVIDERS).map(p => {
    let bestZone = null, bestDist = Infinity;
    for (const zone of p.zones) {
      const d = haversine(lat, lng, zone.lat, zone.lng);
      if (d <= zone.radius && d < bestDist) { bestDist = d; bestZone = zone; }
    }
    return { provider: p, covered: !!bestZone, zone: bestZone };
  }).sort((a, b) => {
    if (a.covered && !b.covered) return -1;
    if (!a.covered && b.covered) return 1;
    return a.provider.name.localeCompare(b.provider.name);
  });

function useGoogleMaps() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (window.google?.maps) { setLoaded(true); return; }
    base44.functions.invoke("googleMapsKey", {}).then(res => {
      const apiKey = res.data?.apiKey;
      if (!apiKey) return;
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      s.async = true;
      s.onload = () => setLoaded(true);
      document.head.appendChild(s);
    }).catch(() => {});
  }, []);
  return loaded;
}

function FeasibilityReport({ address, providerResults, onClose, onSignUp, result }) {
  const [exporting, setExporting] = useState(false);
  const available = providerResults.filter(r => r.covered);
  const unavailable = providerResults.filter(r => !r.covered);
  const fibreProviders = available.filter(r => r.provider.type === "fibre");
  const wirelessProviders = available.filter(r => r.provider.type === "wireless");
  const cheapest = available.length > 0 ? available.reduce((best, r) => {
    return Math.min(...r.provider.plans.map(p=>p.price)) < Math.min(...best.provider.plans.map(p=>p.price)) ? r : best;
  }) : null;
  const fastest = available.length > 0 ? available.reduce((best, r) => {
    return Math.max(...r.provider.plans.map(p=>parseInt(p.speed))) > Math.max(...best.provider.plans.map(p=>parseInt(p.speed))) ? r : best;
  }) : null;

  const exportPDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = 210, M = 14;
      const contentW = W - M * 2;
      let y = 0;

      // ── Navy header banner ──
      doc.setFillColor(30, 45, 110);
      doc.rect(0, 0, W, 38, "F");
      doc.setFillColor(196, 30, 58);
      doc.rect(0, 36, W, 2, "F");

      // Logo text (fallback since we can't embed the PNG cross-origin easily)
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("TOUCHNET TELECOMMUNICATIONS", M, 16);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(180, 195, 240);
      doc.text("FIBRE FEASIBILITY REPORT", M, 23);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" })}`, M, 29);
      doc.text("www.touchnet.co.za  |  support@touchnet.co.za  |  +27 11 000 0000", W - M, 29, { align: "right" });

      y = 46;

      // ── Address section ──
      doc.setFillColor(240, 242, 248);
      doc.roundedRect(M, y, contentW, 18, 3, 3, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("SITE ADDRESS", M + 4, y + 6);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 26, 61);
      doc.text(address || "—", M + 4, y + 13);
      y += 24;

      // ── Coverage verdict ──
      const covered = available.length > 0;
      doc.setFillColor(covered ? 5 : 196, covered ? 150 : 30, covered ? 105 : 58, 0.1);
      doc.setFillColor(covered ? 236 : 254, covered ? 253 : 232, covered ? 245 : 232);
      doc.roundedRect(M, y, contentW, 20, 3, 3, "F");
      doc.setDrawColor(covered ? 5 : 196, covered ? 150 : 30, covered ? 105 : 58);
      doc.setLineWidth(0.5);
      doc.roundedRect(M, y, contentW, 20, 3, 3, "S");
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(covered ? 5 : 196, covered ? 150 : 30, covered ? 105 : 58);
      doc.text(covered ? `\u2713  ${available.length} Provider${available.length !== 1 ? "s" : ""} Available at This Address` : "\u2717  No Fibre Coverage Found at This Address", M + 5, y + 8);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`${fibreProviders.length} FTTH fibre  \u00B7  ${wirelessProviders.length} fixed wireless  \u00B7  ${unavailable.length} not yet available`, M + 5, y + 15);
      y += 26;

      // ── Key highlights ──
      if (available.length > 0) {
        const highlights = [
          { label: "LOWEST PRICE", value: cheapest ? `R${Math.min(...cheapest.provider.plans.map(p => p.price))}/mo` : "—", sub: cheapest?.provider.name || "" },
          { label: "FASTEST SPEED", value: fastest ? `${Math.max(...fastest.provider.plans.map(p => parseInt(p.speed)))} Mbps` : "—", sub: fastest?.provider.name || "" },
          { label: "PROVIDERS", value: String(available.length), sub: `${fibreProviders.length} FTTH · ${wirelessProviders.length} wireless` },
        ];
        const boxW = (contentW - 8) / 3;
        highlights.forEach((h, i) => {
          const bx = M + i * (boxW + 4);
          doc.setFillColor(248, 249, 253);
          doc.roundedRect(bx, y, boxW, 22, 2, 2, "F");
          doc.setDrawColor(220, 225, 240);
          doc.setLineWidth(0.3);
          doc.roundedRect(bx, y, boxW, 22, 2, 2, "S");
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(100, 116, 139);
          doc.text(h.label, bx + boxW / 2, y + 6, { align: "center" });
          doc.setFontSize(13);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(30, 45, 110);
          doc.text(h.value, bx + boxW / 2, y + 14, { align: "center" });
          doc.setFontSize(7);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(150, 160, 190);
          doc.text(h.sub, bx + boxW / 2, y + 19, { align: "center" });
        });
        y += 28;
      }

      // ── Static map image via Google Static Maps ──
      if (result?.lat && result?.lng) {
        try {
          const mapRes = await base44.functions.invoke("googleMapsKey", {});
          const apiKey = mapRes.data?.apiKey;
          if (apiKey) {
            const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${result.lat},${result.lng}&zoom=14&size=560x200&scale=2&maptype=roadmap&markers=color:red%7C${result.lat},${result.lng}&key=${apiKey}`;
            const resp = await fetch(mapUrl);
            if (resp.ok) {
              const blob = await resp.blob();
              const reader = new FileReader();
              const imgData = await new Promise(res => { reader.onload = () => res(reader.result); reader.readAsDataURL(blob); });
              doc.setFontSize(8);
              doc.setFont("helvetica", "bold");
              doc.setTextColor(100, 116, 139);
              doc.text("SITE LOCATION MAP", M, y + 4);
              y += 6;
              doc.addImage(imgData, "PNG", M, y, contentW, 50);
              y += 55;
            }
          }
        } catch (_) { /* skip map if fails */ }
      }

      // ── Provider comparison table ──
      if (available.length > 0) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 45, 110);
        doc.text("AVAILABLE PROVIDERS & PLANS", M, y);
        y += 5;

        // Table header
        const cols = [50, 18, 22, 30, 30, 22, 20];
        const headers = ["Provider", "Type", "Top Plan", "Download", "Upload", "From", "Contract"];
        doc.setFillColor(30, 45, 110);
        doc.rect(M, y, contentW, 7, "F");
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        let cx = M + 2;
        headers.forEach((h, i) => {
          doc.text(h, cx, y + 5);
          cx += cols[i];
        });
        y += 7;

        // Table rows
        available.forEach((r, idx) => {
          const { provider } = r;
          const top = [...provider.plans].sort((a, b) => parseInt(b.speed) - parseInt(a.speed))[0];
          const cheap = [...provider.plans].sort((a, b) => a.price - b.price)[0];
          const rowH = 8;
          doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 249 : 255, idx % 2 === 0 ? 253 : 255);
          doc.rect(M, y, contentW, rowH, "F");
          doc.setDrawColor(220, 225, 240);
          doc.setLineWidth(0.2);
          doc.line(M, y + rowH, M + contentW, y + rowH);

          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(15, 26, 61);
          cx = M + 2;
          doc.text(provider.name, cx, y + 5.5); cx += cols[0];
          doc.setFont("helvetica", "normal");
          doc.setTextColor(provider.type === "fibre" ? 5 : 14, provider.type === "fibre" ? 150 : 165, provider.type === "fibre" ? 105 : 233);
          doc.text(provider.type === "fibre" ? "FTTH" : "FWA", cx, y + 5.5); cx += cols[1];
          doc.setTextColor(30, 45, 110);
          doc.text(top.label, cx, y + 5.5); cx += cols[2];
          doc.setFont("helvetica", "bold");
          doc.setTextColor(15, 26, 61);
          doc.text(top.speed, cx, y + 5.5); cx += cols[3];
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 116, 139);
          doc.text(top.upload, cx, y + 5.5); cx += cols[4];
          doc.setFont("helvetica", "bold");
          doc.setTextColor(5, 150, 105);
          doc.text(`R${cheap.price}/mo`, cx, y + 5.5); cx += cols[5];
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 116, 139);
          doc.text(`${cheap.contract} mo`, cx, y + 5.5);
          y += rowH;
        });
        y += 6;
      }

      // ── Unavailable providers ──
      if (unavailable.length > 0) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(150, 160, 180);
        doc.text(`NOT YET AVAILABLE (${unavailable.length}): ${unavailable.map(r => r.provider.name).join(", ")}`, M, y);
        y += 8;
      }

      // ── TouchNet CTA box ──
      const touchnetAvail = available.some(r => r.provider.id === "touchnet");
      doc.setFillColor(touchnetAvail ? 240 : 248, touchnetAvail ? 242 : 249, touchnetAvail ? 255 : 253);
      doc.roundedRect(M, y, contentW, 28, 3, 3, "F");
      doc.setDrawColor(30, 45, 110);
      doc.setLineWidth(0.5);
      doc.roundedRect(M, y, contentW, 28, 3, 3, "S");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 45, 110);
      doc.text(touchnetAvail ? "TouchNet is available at this address!" : "Get Notified When TouchNet is Available", M + 5, y + 9);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 80, 130);
      doc.text(touchnetAvail ? "Contact us today to get connected with South Africa's premium fibre provider." : "Register your interest and we'll notify you as soon as coverage is available.", M + 5, y + 16);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 45, 110);
      doc.text("Phone: +27 11 000 0000", M + 5, y + 23);
      doc.text("Email: sales@touchnet.co.za", M + 65, y + 23);
      doc.text("Web: www.touchnet.co.za", M + 130, y + 23);
      y += 34;

      // ── Footer ──
      const pageH = 297;
      doc.setFillColor(30, 45, 110);
      doc.rect(0, pageH - 14, W, 14, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(180, 195, 240);
      doc.text("This report is generated by TouchNet's automated feasibility system. Coverage data is indicative only.", M, pageH - 8);
      doc.text(`Ref: TN-FSB-${Date.now().toString(36).toUpperCase()}`, W - M, pageH - 8, { align: "right" });

      const filename = `TouchNet_Feasibility_${(address || "Report").replace(/[^a-z0-9]/gi, "_").slice(0, 30)}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3"
      style={{ background: "rgba(10,15,40,0.8)", backdropFilter: "blur(18px)" }}>
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden"
        style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.18)", boxShadow: "0 40px 100px rgba(30,45,110,0.25)" }}>
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,#c41e3a,transparent)" }} />
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(30,45,110,0.1)", background: "rgba(30,45,110,0.03)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)", boxShadow: "0 4px 20px rgba(30,45,110,0.3)" }}>
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[16px] font-black" style={{ color: "#0f1a3d" }}>Feasibility Report</h2>
              <p className="text-[11px]" style={{ color: "rgba(30,45,110,0.5)" }}>
                📍 {address?.split(",").slice(0,2).join(",")} · {available.length} provider{available.length !== 1 ? "s" : ""} available
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportPDF} disabled={exporting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#c41e3a,#e02347)", boxShadow: "0 4px 14px rgba(196,30,58,0.3)" }}>
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {exporting ? "Generating…" : "Export PDF"}
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100">
              <X className="w-4 h-4" style={{ color: "#1e2d6e" }} />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          <div className="rounded-2xl p-4"
            style={{ background: available.length > 0 ? "rgba(5,150,105,0.07)" : "rgba(196,30,58,0.07)", border: `1px solid ${available.length > 0 ? "rgba(5,150,105,0.25)" : "rgba(196,30,58,0.25)"}` }}>
            <div className="flex items-center gap-3">
              {available.length > 0
                ? <CheckCircle2 className="w-8 h-8 flex-shrink-0" style={{ color: "#059669" }} />
                : <XCircle className="w-8 h-8 flex-shrink-0" style={{ color: "#c41e3a" }} />}
              <div>
                <p className="text-[15px] font-black" style={{ color: available.length > 0 ? "#059669" : "#c41e3a" }}>
                  {available.length > 0
                    ? `✅ Fibre available — ${available.length} provider${available.length !== 1 ? "s" : ""} can service this address`
                    : "❌ No fibre coverage found at this address"}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(30,45,110,0.55)" }}>
                  {fibreProviders.length} FTTH fibre · {wirelessProviders.length} fixed wireless · {unavailable.length} not yet available
                </p>
              </div>
            </div>
          </div>

          {available.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Lowest Price", emoji: "💰", value: cheapest ? `R${Math.min(...cheapest.provider.plans.map(p=>p.price))}/mo` : "—", sub: cheapest?.provider.name, color: "#059669" },
                { label: "Fastest Speed", emoji: "⚡", value: fastest ? `${Math.max(...fastest.provider.plans.map(p=>parseInt(p.speed)))} Mbps` : "—", sub: fastest?.provider.name, color: "#1e2d6e" },
                { label: "Providers", emoji: "🏢", value: available.length, sub: `${fibreProviders.length} fibre · ${wirelessProviders.length} wireless`, color: "#c41e3a" },
              ].map(h => (
                <div key={h.label} className="rounded-2xl p-3 relative overflow-hidden text-center"
                  style={{ background: `${h.color}08`, border: `1px solid ${h.color}22` }}>
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg,${h.color},transparent)` }} />
                  <p className="text-xl mb-1">{h.emoji}</p>
                  <p className="text-[9px] uppercase tracking-wider font-black mb-1" style={{ color: "rgba(30,45,110,0.4)" }}>{h.label}</p>
                  <p className="text-[15px] font-black" style={{ color: h.color, fontFamily: "monospace" }}>{h.value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "rgba(30,45,110,0.5)" }}>{h.sub}</p>
                </div>
              ))}
            </div>
          )}

          {available.length > 0 && (
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: "rgba(30,45,110,0.45)" }}>Available Providers & Plans</p>
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(30,45,110,0.12)" }}>
                <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(30,45,110,0.04)", borderBottom: "1px solid rgba(30,45,110,0.1)" }}>
                      {["Provider","Type","Fastest","Download","Upload","From","Contract"].map(h => (
                        <th key={h} className="px-3 py-2.5 text-[9px] font-black uppercase tracking-[0.12em]" style={{ color: "rgba(30,45,110,0.45)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {available.map(({ provider }) => {
                      const top = [...provider.plans].sort((a,b) => parseInt(b.speed)-parseInt(a.speed))[0];
                      const cheapPlan = [...provider.plans].sort((a,b) => a.price-b.price)[0];
                      return (
                        <tr key={provider.id} style={{ borderTop: "1px solid rgba(30,45,110,0.06)" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(30,45,110,0.03)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{provider.logo}</span>
                              <div>
                                <p className="text-[12px] font-black" style={{ color: provider.color }}>{provider.name}</p>
                                <p className="text-[9px]" style={{ color: "rgba(30,45,110,0.4)" }}>{provider.tagline}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase"
                              style={{ background: provider.type === "fibre" ? "rgba(5,150,105,0.1)" : "rgba(14,165,233,0.1)", color: provider.type === "fibre" ? "#059669" : "#0ea5e9", border: provider.type === "fibre" ? "1px solid rgba(5,150,105,0.25)" : "1px solid rgba(14,165,233,0.25)" }}>
                              {provider.type === "fibre" ? "FTTH" : "FWA"}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-[12px] font-bold" style={{ color: "#1e2d6e" }}>{top.label}</td>
                          <td className="px-3 py-3 text-[13px] font-black" style={{ color: "#0f1a3d", fontFamily: "monospace" }}>{top.speed}</td>
                          <td className="px-3 py-3 text-[11px]" style={{ color: "rgba(30,45,110,0.5)", fontFamily: "monospace" }}>{top.upload}</td>
                          <td className="px-3 py-3">
                            <span className="text-[14px] font-black" style={{ color: provider.color }}>R{cheapPlan.price}</span>
                            <span className="text-[10px] ml-1" style={{ color: "rgba(30,45,110,0.4)" }}>/mo</span>
                          </td>
                          <td className="px-3 py-3 text-[11px]" style={{ color: "rgba(30,45,110,0.5)" }}>{cheapPlan.contract} mo</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {unavailable.length > 0 && (
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: "rgba(30,45,110,0.35)" }}>Not Yet Available ({unavailable.length})</p>
              <div className="flex flex-wrap gap-2">
                {unavailable.map(({ provider }) => (
                  <div key={provider.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                    style={{ background: "rgba(30,45,110,0.04)", border: "1px solid rgba(30,45,110,0.1)" }}>
                    <span className="text-sm opacity-40">{provider.logo}</span>
                    <p className="text-[11px]" style={{ color: "rgba(30,45,110,0.4)" }}>{provider.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {available.some(r => r.provider.id === "touchnet") && (
            <div className="rounded-2xl p-4 flex items-center gap-4"
              style={{ background: "linear-gradient(135deg,rgba(30,45,110,0.06),rgba(196,30,58,0.04))", border: "1px solid rgba(30,45,110,0.15)" }}>
              <div>
                <p className="text-[13px] font-black" style={{ color: "#0f1a3d" }}>TouchNet is available at this address!</p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(30,45,110,0.55)" }}>Get connected with SA's premium fibre provider.</p>
              </div>
              <button onClick={onSignUp}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-black text-white"
                style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)", boxShadow: "0 4px 16px rgba(30,45,110,0.3)" }}>
                <Zap className="w-4 h-4" /> Sign Up Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CoverageCheck() {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const circlesRef = useRef([]);
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const autocompleteRef = useRef(null);
  const searchInputRef = useRef(null);
  const activeProvidersRef = useRef(Object.keys(PROVIDERS));

  const [address, setAddress] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [providerResults, setProviderResults] = useState([]);
  const [step, setStep] = useState("search");
  const [form, setForm] = useState({ name: "", email: "", phone: "", plan: "standard_50mbps" });
  const [submitting, setSubmitting] = useState(false);
  const [activeProviders, setActiveProviders] = useState(Object.keys(PROVIDERS));
  const [showReport, setShowReport] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("check");
  const [scanAnim, setScanAnim] = useState(false);
  const [mapStyle, setMapStyle] = useState("roadmap");
  const [filterType, setFilterType] = useState("all");

  const mapsLoaded = useGoogleMaps();

  useEffect(() => { activeProvidersRef.current = activeProviders; }, [activeProviders]);

  const drawCoverageCircles = useCallback((map, providerIds) => {
    circlesRef.current.forEach(c => c.setMap(null));
    circlesRef.current = [];
    const ids = providerIds || activeProvidersRef.current;
    Object.values(PROVIDERS).forEach(provider => {
      if (!ids.includes(provider.id)) return;
      provider.zones.forEach(zone => {
        const circle = new window.google.maps.Circle({
          map,
          center: { lat: zone.lat, lng: zone.lng },
          radius: zone.radius,
          fillColor: provider.color,
          fillOpacity: provider.id === "touchnet" ? 0.18 : 0.11,
          strokeColor: provider.color,
          strokeOpacity: provider.id === "touchnet" ? 0.7 : 0.45,
          strokeWeight: provider.id === "touchnet" ? 2.5 : 1.5,
          clickable: true,
          zIndex: provider.id === "touchnet" ? 2 : 1,
        });
        circle.addListener("click", () => {
          if (!infoWindowRef.current) return;
          const cheapest = [...provider.plans].sort((a,b) => a.price-b.price)[0];
          const fastest  = [...provider.plans].sort((a,b) => parseInt(b.speed)-parseInt(a.speed))[0];
          infoWindowRef.current.setContent(`
            <div style="font-family:'Inter',sans-serif;padding:6px;min-width:200px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <span style="font-size:22px">${provider.logo}</span>
                <div>
                  <p style="font-weight:900;font-size:14px;color:${provider.color};margin:0">${provider.name}</p>
                  <p style="font-size:10px;color:#64748b;margin:0">${zone.label} · ${provider.type === "fibre" ? "FTTH Fibre" : "Fixed Wireless"}</p>
                </div>
              </div>
              <div style="background:${provider.color}10;border-radius:8px;padding:8px;margin-bottom:6px">
                <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
                  <span style="color:#64748b">Fastest plan</span>
                  <span style="font-weight:800;color:${provider.color}">${fastest.speed}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:11px">
                  <span style="color:#64748b">Starting from</span>
                  <span style="font-weight:800;color:#059669">R${cheapest.price}/mo</span>
                </div>
              </div>
              <p style="font-size:10px;color:#94a3b8;margin:0">${provider.plans.length} plans · ${provider.uptime} uptime</p>
            </div>
          `);
          infoWindowRef.current.setPosition({ lat: zone.lat, lng: zone.lng });
          infoWindowRef.current.open(map);
        });
        circlesRef.current.push(circle);
      });
    });
  }, []);

  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || googleMapRef.current) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: -29.0, lng: 26.0 },
      zoom: 6,
      mapTypeId: mapStyle,
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
    drawCoverageCircles(map, Object.keys(PROVIDERS));
  }, [mapsLoaded]);

  useEffect(() => {
    if (!mapsLoaded || !searchInputRef.current || autocompleteRef.current) return;
    const ac = new window.google.maps.places.Autocomplete(searchInputRef.current, {
      componentRestrictions: { country: "za" }, types: ["geocode"],
    });
    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (place.formatted_address) setAddress(place.formatted_address);
      if (place.geometry?.location)
        doSearch(place.geometry.location.lat(), place.geometry.location.lng(), place.formatted_address || "");
    });
    autocompleteRef.current = ac;
  }, [mapsLoaded]);

  useEffect(() => {
    if (googleMapRef.current) drawCoverageCircles(googleMapRef.current, activeProviders);
  }, [activeProviders, drawCoverageCircles]);

  useEffect(() => {
    if (googleMapRef.current) googleMapRef.current.setMapTypeId(mapStyle);
  }, [mapStyle]);

  const doSearch = (lat, lng, displayName) => {
    setSearching(false); setScanAnim(true);
    const allResults = checkAllProviders(lat, lng);
    const touchnet = allResults.find(r => r.provider.id === "touchnet");
    setResult({ covered: touchnet?.covered, zone: touchnet?.zone, lat, lng, displayName });
    setProviderResults(allResults);
    setStep("result"); setSidebarTab("results"); setShowReport(true);

    const map = googleMapRef.current;
    if (map) {
      map.panTo({ lat, lng }); map.setZoom(14);
      if (markerRef.current) markerRef.current.setMap(null);
      const available = allResults.filter(r => r.covered);
      markerRef.current = new window.google.maps.Marker({
        map, position: { lat, lng }, title: displayName,
        animation: window.google.maps.Animation.DROP,
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: available.length > 0 ? "#059669" : "#c41e3a", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 3 },
      });
      if (infoWindowRef.current) {
        infoWindowRef.current.setContent(`
          <div style="font-family:'Inter',sans-serif;padding:6px;min-width:200px">
            <p style="font-weight:900;font-size:13px;margin-bottom:6px;color:#0f1a3d">📍 ${displayName?.split(",").slice(0,2).join(",") || "Location"}</p>
            ${available.length > 0
              ? `<p style="font-size:11px;color:#059669;font-weight:700;margin-bottom:5px">✅ ${available.length} provider${available.length > 1 ? "s" : ""} available</p>
                 ${available.slice(0,5).map(({ provider }) => `<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px"><span>${provider.logo}</span><span style="font-size:11px;color:#334155;font-weight:600">${provider.name}</span><span style="font-size:9px;color:${provider.color};margin-left:auto">${provider.type === "fibre" ? "FTTH" : "FWA"}</span></div>`).join("")}`
              : `<p style="font-size:11px;color:#c41e3a;font-weight:700">❌ No coverage at this location</p>`}
          </div>
        `);
        infoWindowRef.current.open(map, markerRef.current);
      }
    }
    base44.entities.CoverageSearch.create({ query: address || displayName, display_name: displayName, lat, lng, covered: touchnet?.covered, nearest_zone: touchnet?.zone?.label || "" }).catch(() => {});
    setTimeout(() => setScanAnim(false), 2000);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!address.trim() || !mapsLoaded) return;
    setSearching(true); setScanAnim(true); setResult(null); setProviderResults([]);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: address + ", South Africa", componentRestrictions: { country: "ZA" } }, (results, status) => {
      setSearching(false);
      if (status === "OK" && results[0]) {
        const loc = results[0].geometry.location;
        doSearch(loc.lat(), loc.lng(), results[0].formatted_address);
      } else {
        setResult({ error: "Address not found. Try a suburb, street, or city." });
        setScanAnim(false);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitting(true);
    try {
      await base44.entities.Referral.create({
        referrer_customer_id: "website_lead", referrer_name: "Coverage Check Lead",
        referrer_email: "website@touchnet.co.za",
        referred_name: form.name, referred_email: form.email, referred_phone: form.phone,
        referred_address: result?.displayName, service_interest: form.plan, status: "submitted",
      });
      setStep("success");
    } finally { setSubmitting(false); }
  };

  const reset = () => {
    setStep("search"); setResult(null); setProviderResults([]); setAddress("");
    setSidebarTab("check"); setShowReport(false);
    setForm({ name: "", email: "", phone: "", plan: "standard_50mbps" });
    if (markerRef.current) { markerRef.current.setMap(null); markerRef.current = null; }
    if (infoWindowRef.current) infoWindowRef.current.close();
    if (googleMapRef.current) { googleMapRef.current.panTo({ lat: -29.0, lng: 26.0 }); googleMapRef.current.setZoom(6); }
  };

  const toggleProvider = (id) => setActiveProviders(prev =>
    prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
  );

  const availableProviders = providerResults.filter(r => r.covered);
  const filteredProviders = filterType === "all" ? Object.values(PROVIDERS) : Object.values(PROVIDERS).filter(p => p.type === filterType);

  return (
    <div className="flex flex-col" style={{ height: "100vh", background: "#eef0f7", fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @keyframes ping { 0%{transform:scale(1);opacity:0.8}100%{transform:scale(2.8);opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.3s ease forwards; }
        .pac-container { z-index:9999!important;border-radius:12px!important;box-shadow:0 12px 40px rgba(30,45,110,0.15)!important;border:1px solid rgba(30,45,110,0.15)!important; }
      `}</style>

      <header className="relative flex items-center justify-between px-5 py-3 flex-shrink-0 z-30"
        style={{ background: "rgba(255,255,255,0.98)", borderBottom: "1px solid rgba(30,45,110,0.12)" }}>
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,#c41e3a,transparent)" }} />
        <div className="flex items-center gap-4">
          <img src={LOGO_URL} alt="TouchNet" className="h-7 object-contain" />
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(30,45,110,0.06)", border: "1px solid rgba(30,45,110,0.15)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#1e2d6e" }} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(30,45,110,0.6)", fontFamily: "monospace" }}>FIBRE COVERAGE & FEASIBILITY</span>
          </div>
        </div>
        <a href="/" className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-bold"
          style={{ background: "rgba(30,45,110,0.08)", border: "1px solid rgba(30,45,110,0.2)", color: "#1e2d6e" }}>
          Portal <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="relative z-20 flex flex-col flex-shrink-0 overflow-hidden"
          style={{ width: 340, background: "rgba(255,255,255,0.98)", borderRight: "1px solid rgba(30,45,110,0.12)" }}>
          <div className="flex flex-shrink-0" style={{ borderBottom: "1px solid rgba(30,45,110,0.1)" }}>
            {[
              { key: "check", label: "Check", icon: Search },
              { key: "providers", label: "Layers", icon: Layers },
              ...(providerResults.length > 0 ? [{ key: "results", label: `Results (${availableProviders.length})`, icon: Activity }] : []),
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.key} onClick={() => setSidebarTab(tab.key)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-black uppercase tracking-wider transition-all"
                  style={{ background: sidebarTab === tab.key ? "rgba(30,45,110,0.05)" : "transparent", borderBottom: sidebarTab === tab.key ? "2px solid #1e2d6e" : "2px solid transparent", color: sidebarTab === tab.key ? "#1e2d6e" : "rgba(30,45,110,0.35)", marginBottom: -1 }}>
                  <Icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {sidebarTab === "check" && (
              <div className="space-y-4 fade-up">
                <div>
                  <h1 className="text-[18px] font-black leading-tight mb-1" style={{ color: "#0f1a3d", fontFamily: "'Space Grotesk',sans-serif" }}>Fibre Feasibility Check</h1>
                  <p className="text-[12px]" style={{ color: "rgba(30,45,110,0.5)" }}>Search any SA address to see all available fibre and wireless providers, plans and pricing.</p>
                </div>
                <form onSubmit={handleSearch} className="space-y-2">
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 z-10" style={{ color: "#1e2d6e" }} />
                    <input ref={searchInputRef} value={address} onChange={e => setAddress(e.target.value)}
                      placeholder="e.g. 12 Rivonia Rd, Sandton…"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl text-[13px] outline-none transition-all"
                      style={{ background: "#f8f9fd", border: "1px solid rgba(30,45,110,0.2)", color: "#0f1a3d" }} />
                  </div>
                  <button type="submit" disabled={searching || !address.trim() || !mapsLoaded}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[13px] text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)", boxShadow: "0 6px 24px rgba(30,45,110,0.35)" }}>
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {!mapsLoaded ? "Loading Maps…" : searching ? "Checking coverage…" : "Run Feasibility Check"}
                  </button>
                </form>
                {result?.error && (
                  <div className="rounded-2xl p-3 flex items-start gap-2" style={{ background: "rgba(196,30,58,0.06)", border: "1px solid rgba(196,30,58,0.2)" }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#c41e3a" }} />
                    <p className="text-[12px]" style={{ color: "#c41e3a" }}>{result.error}</p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Providers", value: Object.keys(PROVIDERS).length, color: "#1e2d6e" },
                    { label: "FTTH",      value: Object.values(PROVIDERS).filter(p=>p.type==="fibre").length, color: "#059669" },
                    { label: "Wireless",  value: Object.values(PROVIDERS).filter(p=>p.type==="wireless").length, color: "#0ea5e9" },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center relative overflow-hidden"
                      style={{ background: `${s.color}08`, border: `1px solid ${s.color}18` }}>
                      <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg,${s.color},transparent)` }} />
                      <p className="text-[20px] font-black" style={{ color: s.color, fontFamily: "monospace" }}>{s.value}</p>
                      <p className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(30,45,110,0.4)" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl p-4 relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg,rgba(30,45,110,0.05),rgba(196,30,58,0.03))", border: "1px solid rgba(30,45,110,0.12)" }}>
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#1e2d6e,#c41e3a,transparent)" }} />
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#1e2d6e" }}>Why Choose TouchNet?</p>
                  {[
                    { icon: Zap, label: "Up to 1 Gbps uncapped fibre", color: "#d97706" },
                    { icon: Shield, label: "99.9% uptime SLA", color: "#059669" },
                    { icon: Clock, label: "24/7 local technical support", color: "#1e2d6e" },
                    { icon: TrendingUp, label: "No hidden fees or throttling", color: "#c41e3a" },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-2 mb-2 last:mb-0">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                        <Icon className="w-3 h-3" style={{ color }} />
                      </div>
                      <p className="text-[11px]" style={{ color: "rgba(30,45,110,0.7)" }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sidebarTab === "providers" && (
              <div className="space-y-3 fade-up">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: "rgba(30,45,110,0.45)" }}>Coverage Layers</p>
                  <button onClick={() => setActiveProviders(Object.keys(PROVIDERS))}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg"
                    style={{ background: "rgba(30,45,110,0.07)", color: "#1e2d6e", border: "1px solid rgba(30,45,110,0.15)" }}>
                    Show All
                  </button>
                </div>
                <div className="flex gap-1.5">
                  {[{ k: "all", l: "All" }, { k: "fibre", l: "FTTH" }, { k: "wireless", l: "Wireless" }].map(f => (
                    <button key={f.k} onClick={() => setFilterType(f.k)}
                      className="flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                      style={{ background: filterType === f.k ? "rgba(30,45,110,0.1)" : "rgba(30,45,110,0.04)", border: `1px solid ${filterType === f.k ? "rgba(30,45,110,0.3)" : "rgba(30,45,110,0.1)"}`, color: filterType === f.k ? "#1e2d6e" : "rgba(30,45,110,0.4)" }}>
                      {f.l}
                    </button>
                  ))}
                </div>
                {filteredProviders.map(p => (
                  <div key={p.id} className="rounded-2xl overflow-hidden transition-all cursor-pointer"
                    style={{ background: activeProviders.includes(p.id) ? `${p.color}07` : "rgba(30,45,110,0.02)", border: `1px solid ${activeProviders.includes(p.id) ? p.color + "25" : "rgba(30,45,110,0.08)"}` }}
                    onClick={() => toggleProvider(p.id)}>
                    <div className="flex items-center justify-between px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{p.logo}</span>
                        <div>
                          <p className="text-[12px] font-black" style={{ color: activeProviders.includes(p.id) ? "#0f1a3d" : "rgba(30,45,110,0.35)" }}>{p.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                              style={{ background: p.type === "fibre" ? "rgba(5,150,105,0.1)" : "rgba(14,165,233,0.1)", color: p.type === "fibre" ? "#059669" : "#0ea5e9" }}>
                              {p.type === "fibre" ? "FTTH" : "FWA"}
                            </span>
                            <span className="text-[9px]" style={{ color: "rgba(30,45,110,0.35)" }}>{p.zones.length} zones</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-9 h-5 rounded-full transition-all duration-200 relative flex-shrink-0"
                        style={{ background: activeProviders.includes(p.id) ? p.color : "rgba(30,45,110,0.12)" }}>
                        <span className="block w-3.5 h-3.5 bg-white rounded-full shadow absolute top-0.5 transition-all duration-200"
                          style={{ left: activeProviders.includes(p.id) ? "calc(100% - 17px)" : "2px" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sidebarTab === "results" && providerResults.length > 0 && (
              <div className="space-y-3 fade-up">
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(30,45,110,0.45)" }}>
                  Feasibility: {result?.displayName?.split(",").slice(0,2).join(",")}
                </p>
                <button onClick={() => setShowReport(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[12px] text-white transition-all hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)", boxShadow: "0 6px 20px rgba(30,45,110,0.3)" }}>
                  <FileText className="w-4 h-4" /> View Full Feasibility Report
                </button>
                <div className="rounded-2xl p-3"
                  style={{ background: availableProviders.length > 0 ? "rgba(5,150,105,0.07)" : "rgba(196,30,58,0.07)", border: `1px solid ${availableProviders.length > 0 ? "rgba(5,150,105,0.25)" : "rgba(196,30,58,0.2)"}` }}>
                  <div className="flex items-center gap-2">
                    {availableProviders.length > 0
                      ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#059669" }} />
                      : <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#c41e3a" }} />}
                    <div>
                      <p className="text-[12px] font-black" style={{ color: availableProviders.length > 0 ? "#059669" : "#c41e3a" }}>
                        {availableProviders.length > 0 ? `${availableProviders.length} providers available` : "No coverage found"}
                      </p>
                      <p className="text-[10px]" style={{ color: "rgba(30,45,110,0.5)" }}>
                        {availableProviders.filter(r=>r.provider.type==="fibre").length} FTTH · {availableProviders.filter(r=>r.provider.type==="wireless").length} wireless
                      </p>
                    </div>
                  </div>
                </div>
                {availableProviders.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: "rgba(30,45,110,0.35)" }}>Available at this address</p>
                    {availableProviders.map(({ provider, zone }) => (
                      <div key={provider.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                        style={{ background: `${provider.color}08`, border: `1px solid ${provider.color}22` }}>
                        <span className="text-lg flex-shrink-0">{provider.logo}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-black" style={{ color: "#0f1a3d" }}>{provider.name}</p>
                          <p className="text-[9px] truncate" style={{ color: provider.color }}>✓ {zone?.label}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[11px] font-black" style={{ color: provider.color }}>R{Math.min(...provider.plans.map(p=>p.price))}</p>
                          <p className="text-[8px]" style={{ color: "rgba(30,45,110,0.4)" }}>/mo from</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {step === "result" && (
                  <div className="space-y-2">
                    {result?.covered
                      ? <button onClick={() => setStep("form")} className="w-full py-2.5 rounded-xl font-black text-[12px] text-white" style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}>
                          <Zap className="w-4 h-4 inline mr-1" /> Sign Up with TouchNet
                        </button>
                      : <button onClick={() => setStep("form")} className="w-full py-2.5 rounded-xl font-black text-[12px] text-white" style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)" }}>
                          <Mail className="w-4 h-4 inline mr-1" /> Notify Me When Available
                        </button>}
                    <button onClick={reset} className="w-full py-2 rounded-xl text-[11px] font-bold"
                      style={{ color: "rgba(30,45,110,0.5)", border: "1px solid rgba(30,45,110,0.1)" }}>
                      <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> New Search
                    </button>
                  </div>
                )}
                {step === "form" && (
                  <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(30,45,110,0.15)" }}>
                    <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,transparent)" }} />
                    <form onSubmit={handleSubmit} className="p-4 space-y-2.5">
                      <p className="text-[12px] font-black" style={{ color: "#1e2d6e" }}>{result?.covered ? "Connect with TouchNet" : "Get notified when available"}</p>
                      {[
                        { field: "name",  label: "Full Name *", icon: User,  type: "text",  placeholder: "John Smith",     req: true },
                        { field: "email", label: "Email *",     icon: Mail,  type: "email", placeholder: "john@email.com", req: true },
                        { field: "phone", label: "Phone",       icon: Phone, type: "tel",   placeholder: "071 234 5678",   req: false },
                      ].map(({ field, label, icon: Icon, type, placeholder, req }) => (
                        <div key={field}>
                          <label className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(30,45,110,0.4)" }}>{label}</label>
                          <div className="relative">
                            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(30,45,110,0.35)" }} />
                            <input required={req} type={type} value={form[field]}
                              onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                              placeholder={placeholder}
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[12px] outline-none"
                              style={{ background: "#f8f9fd", border: "1px solid rgba(30,45,110,0.2)", color: "#0f1a3d" }} />
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={() => setStep("result")}
                          className="px-3 py-2 rounded-xl text-[11px] font-bold"
                          style={{ background: "rgba(30,45,110,0.06)", border: "1px solid rgba(30,45,110,0.15)", color: "#1e2d6e" }}>← Back</button>
                        <button type="submit" disabled={submitting}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-bold text-white disabled:opacity-60"
                          style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)" }}>
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          {submitting ? "Submitting…" : result?.covered ? "Get Connected" : "Notify Me"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                {step === "success" && (
                  <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.22)" }}>
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2" style={{ color: "#059669" }} />
                    <p className="text-[13px] font-black" style={{ color: "#059669" }}>Submitted!</p>
                    <p className="text-[11px] mt-1 mb-3" style={{ color: "rgba(30,45,110,0.5)" }}>We'll be in touch within 24 hours.</p>
                    <button onClick={reset} className="text-[11px] font-bold px-4 py-2 rounded-xl"
                      style={{ background: "rgba(30,45,110,0.07)", border: "1px solid rgba(30,45,110,0.15)", color: "#1e2d6e" }}>
                      Check Another Address
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MAP */}
        <div className="flex-1 relative">
          {!mapsLoaded && (
            <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ background: "#eef0f7" }}>
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: "#1e2d6e" }} />
                <p className="text-[12px] font-bold" style={{ color: "rgba(30,45,110,0.5)" }}>Loading Google Maps…</p>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />

          {scanAnim && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
              <div className="relative">
                {[80,140,200,260].map((size, i) => (
                  <div key={i} className="absolute rounded-full border-2"
                    style={{ width: size, height: size, top: -size/2, left: -size/2, borderColor: `rgba(30,45,110,${0.5-i*0.1})`, animation: `ping ${0.8+i*0.3}s ease-out infinite`, animationDelay: `${i*0.15}s` }} />
                ))}
                <div className="w-4 h-4 rounded-full" style={{ background: "#1e2d6e", boxShadow: "0 0 20px rgba(30,45,110,0.9)" }} />
              </div>
            </div>
          )}

          {/* Map style switcher */}
          <div className="absolute top-3 left-3 z-10 rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(30,45,110,0.15)", boxShadow: "0 4px 20px rgba(30,45,110,0.12)", backdropFilter: "blur(12px)" }}>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] px-3 pt-2.5 pb-1" style={{ color: "rgba(30,45,110,0.4)" }}>MAP TYPE</p>
            {[{ id: "roadmap", icon: "🗺️", label: "Road" }, { id: "satellite", icon: "🛰️", label: "Satellite" }, { id: "hybrid", icon: "🌍", label: "Hybrid" }, { id: "terrain", icon: "⛰️", label: "Terrain" }].map(s => (
              <button key={s.id} onClick={() => setMapStyle(s.id)}
                className="flex items-center gap-2 px-3 py-2 w-full transition-all hover:bg-slate-50 text-left"
                style={{ background: mapStyle === s.id ? "rgba(30,45,110,0.07)" : "transparent", borderLeft: mapStyle === s.id ? "2px solid #1e2d6e" : "2px solid transparent" }}>
                <span className="text-sm">{s.icon}</span>
                <span className="text-[11px] font-bold" style={{ color: mapStyle === s.id ? "#1e2d6e" : "rgba(30,45,110,0.45)" }}>{s.label}</span>
              </button>
            ))}
            <div className="h-2" />
          </div>

          {/* Legend */}
          <div className="absolute top-3 right-3 z-10 rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(30,45,110,0.15)", boxShadow: "0 4px 20px rgba(30,45,110,0.1)", backdropFilter: "blur(12px)", maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] px-3 pt-2.5 pb-1" style={{ color: "rgba(30,45,110,0.4)" }}>COVERAGE LAYERS</p>
            {Object.values(PROVIDERS).map(p => (
              <button key={p.id} onClick={() => toggleProvider(p.id)}
                className="flex items-center gap-2 px-3 py-1.5 w-full transition-all hover:bg-slate-50 text-left">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: activeProviders.includes(p.id) ? p.color : "rgba(30,45,110,0.1)", border: `1.5px solid ${p.color}`, boxShadow: activeProviders.includes(p.id) ? `0 0 6px ${p.color}80` : "none" }} />
                <span className="text-[11px] font-bold" style={{ color: activeProviders.includes(p.id) ? "#0f1a3d" : "rgba(30,45,110,0.3)" }}>{p.logo} {p.name}</span>
                <span className="text-[8px] ml-auto font-bold" style={{ color: p.type === "fibre" ? "#059669" : "#0ea5e9" }}>{p.type === "fibre" ? "FTTH" : "FWA"}</span>
              </button>
            ))}
            <div className="h-2" />
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(30,45,110,0.15)", backdropFilter: "blur(10px)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#1e2d6e" }} />
              <span className="text-[10px] font-bold" style={{ color: "#1e2d6e" }}>LIVE COVERAGE MAP</span>
              <span className="text-[9px]" style={{ color: "rgba(30,45,110,0.4)" }}>· {activeProviders.length}/{Object.keys(PROVIDERS).length} layers · click circles for info</span>
            </div>
            {result && !result.error && providerResults.length > 0 && (
              <>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: availableProviders.length > 0 ? "rgba(5,150,105,0.09)" : "rgba(196,30,58,0.08)", border: `1px solid ${availableProviders.length > 0 ? "rgba(5,150,105,0.28)" : "rgba(196,30,58,0.22)"}`, backdropFilter: "blur(10px)" }}>
                  {availableProviders.length > 0 ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#059669" }} /> : <XCircle className="w-3.5 h-3.5" style={{ color: "#c41e3a" }} />}
                  <span className="text-[11px] font-bold" style={{ color: availableProviders.length > 0 ? "#059669" : "#c41e3a" }}>
                    {availableProviders.length > 0 ? `${availableProviders.length} providers available` : "No coverage here"}
                  </span>
                </div>
                <button onClick={() => setShowReport(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)", boxShadow: "0 4px 14px rgba(30,45,110,0.3)" }}>
                  <FileText className="w-3.5 h-3.5" /> Feasibility Report
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showReport && providerResults.length > 0 && (
        <FeasibilityReport
          address={result?.displayName}
          providerResults={providerResults}
          result={result}
          onClose={() => setShowReport(false)}
          onSignUp={() => { setShowReport(false); setStep("form"); setSidebarTab("results"); }}
        />
      )}
    </div>
  );
}