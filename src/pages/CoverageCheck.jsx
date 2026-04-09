import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Circle, Popup, ZoomControl, useMap, Marker, LayerGroup } from "react-leaflet";
import L from "leaflet";
import {
  MapPin, Search, CheckCircle2, XCircle, AlertCircle, Loader2,
  Wifi, Zap, ChevronRight, Send, Phone, Mail, User,
  Building2, ArrowRight, Star, RefreshCw, Layers, X,
  BarChart3, Shield, Clock, TrendingUp, ArrowUpRight, Eye,
  Filter, Activity, Radio, Globe, Map, ExternalLink
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

// ── Provider data ─────────────────────────────────────────────────────────────
const PROVIDERS = {
  touchnet: {
    id: "touchnet",
    name: "TouchNet",
    color: "#9b8fef",
    glowColor: "rgba(155,143,239,0.4)",
    logo: "🔮",
    tagline: "Premium Uncapped Fibre",
    plans: [
      { label: "Basic", speed: "10 Mbps", price: 399, upload: "5 Mbps",  contract: 24, features: ["Uncapped", "24/7 Support", "Static IP option"] },
      { label: "Standard", speed: "50 Mbps", price: 599, upload: "25 Mbps", contract: 24, features: ["Uncapped", "Priority Support", "Static IP option", "Free Router"] },
      { label: "Premium", speed: "100 Mbps", price: 899, upload: "50 Mbps", contract: 24, features: ["Uncapped", "Priority Support", "Static IP", "Free Router", "WiFi 6"] },
      { label: "Enterprise", speed: "500 Mbps", price: 1499, upload: "250 Mbps", contract: 24, features: ["Uncapped", "SLA", "Dedicated Account Manager", "Static IP", "Business Router", "99.9% Uptime SLA"] },
      { label: "Gigabit", speed: "1 Gbps", price: 2999, upload: "500 Mbps", contract: 24, features: ["Uncapped", "SLA", "Dedicated Line", "Static IP", "Enterprise Router", "99.99% SLA"] },
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
    id: "openserve",
    name: "Openserve",
    color: "#06b6d4",
    glowColor: "rgba(6,182,212,0.35)",
    logo: "🌐",
    tagline: "Telkom Wholesale Fibre",
    plans: [
      { label: "Lite", speed: "10 Mbps", price: 349, upload: "5 Mbps",  contract: 24, features: ["Uncapped", "Email Support"] },
      { label: "Home", speed: "50 Mbps",  price: 549, upload: "25 Mbps", contract: 24, features: ["Uncapped", "Phone Support"] },
      { label: "Fast", speed: "100 Mbps", price: 799, upload: "50 Mbps", contract: 24, features: ["Uncapped", "Priority Support"] },
      { label: "Giga", speed: "1 Gbps",   price: 2699, upload: "500 Mbps",contract: 24, features: ["Uncapped", "SLA", "Business Grade"] },
    ],
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton", radius: 12000 },
      { lat: -25.7479, lng: 28.2293, label: "Pretoria", radius: 15000 },
      { lat: -26.2041, lng: 28.0473, label: "Johannesburg", radius: 14000 },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town", radius: 13000 },
      { lat: -29.8587, lng: 31.0218, label: "Durban", radius: 12000 },
      { lat: -33.0,    lng: 27.9,    label: "East London", radius: 8000 },
      { lat: -25.7,    lng: 28.2,    label: "Midrand", radius: 9000 },
    ],
    rating: 4.1, customers: "800,000+", founded: "2016", uptime: "99.5%",
  },
  vumatel: {
    id: "vumatel",
    name: "Vumatel",
    color: "#f59e0b",
    glowColor: "rgba(245,158,11,0.35)",
    logo: "⚡",
    tagline: "High-Density Urban Fibre",
    plans: [
      { label: "Basic", speed: "25 Mbps",  price: 459, upload: "12 Mbps", contract: 12, features: ["Uncapped", "Chat Support"] },
      { label: "Value", speed: "50 Mbps",  price: 649, upload: "25 Mbps", contract: 12, features: ["Uncapped", "Phone Support", "Wifi 5"] },
      { label: "Speed", speed: "200 Mbps", price: 1099, upload: "100 Mbps",contract: 12, features: ["Uncapped", "Priority", "Wifi 6"] },
      { label: "Ultra", speed: "1 Gbps",   price: 2499, upload: "500 Mbps",contract: 12, features: ["Uncapped", "SLA", "Business Line"] },
    ],
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton", radius: 8000 },
      { lat: -26.0274, lng: 28.1527, label: "Fourways", radius: 7500 },
      { lat: -26.1887, lng: 28.0667, label: "Soweto", radius: 11000 },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town", radius: 9000 },
      { lat: -33.93,   lng: 18.86,   label: "Stellenbosch", radius: 6000 },
      { lat: -26.0765, lng: 28.0556, label: "Randburg", radius: 7000 },
    ],
    rating: 4.5, customers: "250,000+", founded: "2014", uptime: "99.7%",
  },
  frogfoot: {
    id: "frogfoot",
    name: "Frogfoot",
    color: "#10b981",
    glowColor: "rgba(16,185,129,0.35)",
    logo: "🐸",
    tagline: "Independent Open-Access Fibre",
    plans: [
      { label: "Starter", speed: "10 Mbps",  price: 299, upload: "5 Mbps",  contract: 12, features: ["Uncapped", "Email Support"] },
      { label: "Home",    speed: "25 Mbps",  price: 449, upload: "12 Mbps", contract: 12, features: ["Uncapped", "Chat Support"] },
      { label: "Fast",    speed: "100 Mbps", price: 749, upload: "50 Mbps", contract: 12, features: ["Uncapped", "Phone Support", "Free Install"] },
      { label: "Power",   speed: "200 Mbps", price: 999, upload: "100 Mbps",contract: 24, features: ["Uncapped", "Priority", "Static IP", "Free Install"] },
    ],
    zones: [
      { lat: -26.0274, lng: 28.1527, label: "Northriding", radius: 7000 },
      { lat: -25.9025, lng: 28.4211, label: "Kempton Park", radius: 7500 },
      { lat: -26.2309, lng: 28.2772, label: "Alberton", radius: 7000 },
      { lat: -26.1367, lng: 28.2411, label: "Bedfordview", radius: 6500 },
      { lat: -26.3044, lng: 27.8525, label: "Roodepoort", radius: 7000 },
      { lat: -29.1197, lng: 26.214,  label: "Bloemfontein", radius: 8000 },
    ],
    rating: 4.3, customers: "80,000+", founded: "2013", uptime: "99.6%",
  },
  mfn: {
    id: "mfn",
    name: "MFN",
    color: "#e879f9",
    glowColor: "rgba(232,121,249,0.35)",
    logo: "📡",
    tagline: "Metro Fibre Network",
    plans: [
      { label: "Basic",    speed: "10 Mbps",  price: 329, upload: "5 Mbps",   contract: 24, features: ["Uncapped", "Email Support"] },
      { label: "Home",     speed: "50 Mbps",  price: 549, upload: "25 Mbps",  contract: 24, features: ["Uncapped", "Phone Support"] },
      { label: "Fast",     speed: "100 Mbps", price: 799, upload: "50 Mbps",  contract: 24, features: ["Uncapped", "Priority Support", "Static IP option"] },
      { label: "Business", speed: "200 Mbps", price: 1199, upload: "100 Mbps",contract: 24, features: ["Uncapped", "SLA", "Static IP", "Priority Support"] },
    ],
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton",          radius: 9000  },
      { lat: -26.0765, lng: 28.0556, label: "Randburg",         radius: 8000  },
      { lat: -26.2041, lng: 28.0473, label: "Johannesburg CBD", radius: 10000 },
      { lat: -26.1887, lng: 28.0667, label: "Soweto",           radius: 9000  },
      { lat: -25.7479, lng: 28.2293, label: "Pretoria East",    radius: 10000 },
      { lat: -25.8579, lng: 28.1893, label: "Centurion",        radius: 9000  },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town CBD",    radius: 8000  },
      { lat: -33.8688, lng: 18.6339, label: "Bellville",        radius: 7000  },
      { lat: -29.8587, lng: 31.0218, label: "Durban",           radius: 9000  },
    ],
    rating: 4.2, customers: "50,000+", founded: "2012", uptime: "99.5%",
  },
  dfa: {
    id: "dfa",
    name: "DFA",
    color: "#fb923c",
    glowColor: "rgba(251,146,60,0.35)",
    logo: "🔶",
    tagline: "Dark Fibre Africa — Open Access",
    plans: [
      { label: "10M",    speed: "10 Mbps",  price: 299,  upload: "10 Mbps",  contract: 12, features: ["Uncapped", "Symmetric", "Email Support"] },
      { label: "50M",    speed: "50 Mbps",  price: 499,  upload: "50 Mbps",  contract: 12, features: ["Uncapped", "Symmetric", "Phone Support"] },
      { label: "100M",   speed: "100 Mbps", price: 749,  upload: "100 Mbps", contract: 12, features: ["Uncapped", "Symmetric", "Priority Support", "Static IP"] },
      { label: "500M",   speed: "500 Mbps", price: 1599, upload: "500 Mbps", contract: 24, features: ["Uncapped", "Symmetric", "SLA", "Static IP"] },
      { label: "1G",     speed: "1 Gbps",   price: 2799, upload: "1 Gbps",   contract: 24, features: ["Uncapped", "Symmetric", "SLA", "Dedicated Line", "Static IP"] },
    ],
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton",          radius: 11000 },
      { lat: -26.2041, lng: 28.0473, label: "Johannesburg CBD", radius: 13000 },
      { lat: -25.7479, lng: 28.2293, label: "Pretoria",         radius: 14000 },
      { lat: -26.0274, lng: 28.1527, label: "Midrand/Fourways", radius: 10000 },
      { lat: -25.9025, lng: 28.4211, label: "Kempton Park",     radius: 9000  },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town",        radius: 12000 },
      { lat: -29.8587, lng: 31.0218, label: "Durban",           radius: 11000 },
      { lat: -33.0,    lng: 27.9,    label: "East London",      radius: 8000  },
      { lat: -26.3044, lng: 27.8525, label: "Roodepoort",       radius: 8000  },
      { lat: -26.9,    lng: 26.7,    label: "Klerksdorp",       radius: 7000  },
    ],
    rating: 4.4, customers: "100,000+", founded: "2007", uptime: "99.8%",
  },
  linkafrica: {
    id: "linkafrica",
    name: "Link Africa",
    color: "#34d399",
    glowColor: "rgba(52,211,153,0.35)",
    logo: "🌍",
    tagline: "Wireless & Fibre Connectivity",
    plans: [
      { label: "Starter",  speed: "10 Mbps",  price: 349, upload: "5 Mbps",   contract: 12, features: ["Uncapped", "Email Support"] },
      { label: "Home",     speed: "25 Mbps",  price: 499, upload: "12 Mbps",  contract: 12, features: ["Uncapped", "Chat Support"] },
      { label: "Fast",     speed: "50 Mbps",  price: 699, upload: "25 Mbps",  contract: 12, features: ["Uncapped", "Phone Support", "Free Router"] },
      { label: "Business", speed: "100 Mbps", price: 999, upload: "50 Mbps",  contract: 24, features: ["Uncapped", "Priority Support", "Static IP", "SLA"] },
      { label: "Pro",      speed: "200 Mbps", price: 1399, upload: "100 Mbps",contract: 24, features: ["Uncapped", "SLA", "Static IP", "Dedicated Account Manager"] },
    ],
    zones: [
      { lat: -25.8579, lng: 28.1893, label: "Centurion",        radius: 10000 },
      { lat: -25.7479, lng: 28.2293, label: "Pretoria East",    radius: 11000 },
      { lat: -24.7745, lng: 28.3673, label: "Bela-Bela",        radius: 7000  },
      { lat: -23.9,    lng: 29.45,   label: "Polokwane",        radius: 9000  },
      { lat: -25.4453, lng: 30.9694, label: "Nelspruit",        radius: 8000  },
      { lat: -26.9,    lng: 26.7,    label: "Klerksdorp",       radius: 7500  },
      { lat: -27.468,  lng: 26.694,  label: "Wolmaransstad",    radius: 6000  },
      { lat: -26.7145, lng: 27.0971, label: "Potchefstroom",    radius: 8000  },
      { lat: -25.9025, lng: 28.4211, label: "Kempton Park",     radius: 8000  },
    ],
    rating: 4.0, customers: "30,000+", founded: "2004", uptime: "99.3%",
  },
  liquid: {
    id: "liquid",
    name: "Liquid Home",
    color: "#60a5fa",
    glowColor: "rgba(96,165,250,0.35)",
    logo: "💧",
    tagline: "Pan-African Fibre & Cloud",
    plans: [
      { label: "10M",      speed: "10 Mbps",  price: 379,  upload: "5 Mbps",   contract: 24, features: ["Uncapped", "Email Support"] },
      { label: "50M",      speed: "50 Mbps",  price: 579,  upload: "25 Mbps",  contract: 24, features: ["Uncapped", "Phone Support"] },
      { label: "100M",     speed: "100 Mbps", price: 849,  upload: "50 Mbps",  contract: 24, features: ["Uncapped", "Priority Support", "Static IP option"] },
      { label: "Business", speed: "500 Mbps", price: 1699, upload: "250 Mbps", contract: 24, features: ["Uncapped", "SLA", "Static IP", "Dedicated Account Manager"] },
      { label: "Giga",     speed: "1 Gbps",   price: 3199, upload: "500 Mbps", contract: 24, features: ["Uncapped", "SLA", "Dedicated Line", "99.9% SLA"] },
    ],
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton",          radius: 10000 },
      { lat: -26.2041, lng: 28.0473, label: "Johannesburg",     radius: 12000 },
      { lat: -25.7479, lng: 28.2293, label: "Pretoria",         radius: 13000 },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town",        radius: 11000 },
      { lat: -29.8587, lng: 31.0218, label: "Durban",           radius: 10000 },
      { lat: -26.0274, lng: 28.1527, label: "Midrand",          radius: 9000  },
      { lat: -25.9025, lng: 28.4211, label: "Ekurhuleni",       radius: 10000 },
      { lat: -33.0,    lng: 27.9,    label: "East London",      radius: 7500  },
      { lat: -23.9,    lng: 29.45,   label: "Polokwane",        radius: 8000  },
    ],
    rating: 4.3, customers: "200,000+", founded: "2000", uptime: "99.7%",
  },
  herotel: {
    id: "herotel",
    name: "Herotel",
    color: "#f472b6",
    glowColor: "rgba(244,114,182,0.35)",
    logo: "🦸",
    tagline: "Rural & Peri-Urban Wireless ISP",
    plans: [
      { label: "Basic",    speed: "10 Mbps",  price: 299,  upload: "5 Mbps",  contract: 12, features: ["Uncapped", "Chat Support"] },
      { label: "Standard", speed: "20 Mbps",  price: 449,  upload: "10 Mbps", contract: 12, features: ["Uncapped", "Phone Support"] },
      { label: "Fast",     speed: "50 Mbps",  price: 649,  upload: "25 Mbps", contract: 12, features: ["Uncapped", "Phone Support", "Free Install"] },
      { label: "Ultra",    speed: "100 Mbps", price: 899,  upload: "50 Mbps", contract: 24, features: ["Uncapped", "Priority Support", "Static IP"] },
    ],
    zones: [
      { lat: -33.5833, lng: 26.8833, label: "Grahamstown",      radius: 8000  },
      { lat: -33.0,    lng: 27.9,    label: "East London",      radius: 9000  },
      { lat: -30.5595, lng: 22.9375, label: "Northern Cape",    radius: 12000 },
      { lat: -28.7282, lng: 24.7499, label: "Kimberley",        radius: 9000  },
      { lat: -29.1197, lng: 26.214,  label: "Bloemfontein",     radius: 10000 },
      { lat: -30.6667, lng: 29.5,    label: "Mthatha",          radius: 7500  },
      { lat: -32.35,   lng: 22.4,    label: "Beaufort West",    radius: 7000  },
      { lat: -31.5909, lng: 28.784,  label: "Queenstown",       radius: 7000  },
      { lat: -26.7145, lng: 27.0971, label: "Potchefstroom",    radius: 8000  },
    ],
    rating: 4.1, customers: "70,000+", founded: "2014", uptime: "99.2%",
  },
};

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const checkAllProviders = (lat, lng) =>
  Object.values(PROVIDERS).map(p => {
    for (const zone of p.zones) {
      const d = haversineDistance(lat, lng, zone.lat, zone.lng);
      if (d <= zone.radius) return { provider: p, covered: true, zone };
    }
    return { provider: p, covered: false, zone: null };
  });

// ── Map style definitions ─────────────────────────────────────────────────────
const MAP_STYLES = {
  dark_blue: {
    label: "Dark Blue",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    icon: "🌌",
  },
  light: {
    label: "Light",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    icon: "☀️",
  },
  voyager: {
    label: "Street",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    icon: "🗺️",
  },
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    icon: "🛰️",
  },
};

function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords) map.flyTo(coords, 13, { duration: 1.4 }); }, [coords, map]);
  return null;
}

// ── Animated scan pulse at searched location ──────────────────────────────────
function PulseCircle({ position, color }) {
  return (
    <>
      <Circle center={position} radius={600}
        pathOptions={{ color, fillColor: color, fillOpacity: 0.25, weight: 2, dashArray: "5,5" }} />
      <Circle center={position} radius={1200}
        pathOptions={{ color, fillColor: color, fillOpacity: 0.08, weight: 1 }} />
    </>
  );
}

// ── Star rating ───────────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className="w-3 h-3" viewBox="0 0 12 12" fill={i <= Math.round(rating) ? "#f59e0b" : "#334155"}>
          <path d="M6 1l1.2 3.6H11L8.4 6.6l.9 3.5L6 8.2l-3.3 1.9.9-3.5L1 4.6h3.8z"/>
        </svg>
      ))}
      <span className="text-[10px] font-bold ml-1" style={{ color: "#94a3b8" }}>{rating}</span>
    </div>
  );
}

// ── Speed/Price scatter chart ─────────────────────────────────────────────────
function SpeedPriceChart({ available }) {
  const allPlans = available.flatMap(({ provider }) =>
    provider.plans.map(pl => ({
      ...pl,
      providerName: provider.name,
      color: provider.color,
      logo: provider.logo,
      speedNum: parseInt(pl.speed) || 0,
    }))
  );
  const maxPrice = Math.max(...allPlans.map(p => p.price), 1);
  const maxSpeed = Math.max(...allPlans.map(p => p.speedNum), 1);

  return (
    <div className="relative rounded-2xl p-5 overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(155,143,239,0.15)", height: 260 }}>
      <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "rgba(196,188,247,0.5)" }}>
        Speed vs Price — Bubble = Value Score
      </p>
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{ top: 40, bottom: 24, left: 40, right: 12 }}>
        {[0,25,50,75,100].map(pct => (
          <div key={pct} className="absolute w-full" style={{ bottom: `${pct}%`, borderBottom: "1px solid rgba(255,255,255,0.04)" }} />
        ))}
        {[0,25,50,75,100].map(pct => (
          <div key={pct} className="absolute h-full" style={{ left: `${pct}%`, borderLeft: "1px solid rgba(255,255,255,0.04)" }} />
        ))}
      </div>
      {/* Axis labels */}
      <div className="absolute bottom-2 left-10 right-2 flex justify-between">
        {[0, 1000, 2000, 3000].map(p => (
          <span key={p} className="text-[9px]" style={{ color: "rgba(196,188,247,0.3)" }}>R{p}</span>
        ))}
      </div>
      <div className="absolute top-10 bottom-6 left-0 flex flex-col justify-between items-center" style={{ width: 36 }}>
        {[1000, 500, 100, 10].map(s => (
          <span key={s} className="text-[8px] text-right" style={{ color: "rgba(196,188,247,0.3)" }}>{s >= 1000 ? "1G" : `${s}M`}</span>
        ))}
      </div>
      {/* Dots */}
      <div className="absolute" style={{ top: 40, bottom: 24, left: 40, right: 12 }}>
        {allPlans.map((pl, i) => {
          const xPct = (pl.price / (maxPrice * 1.05)) * 100;
          const yPct = (Math.log(pl.speedNum + 1) / Math.log(maxSpeed * 1.1)) * 100;
          const valueScore = Math.round((pl.speedNum / pl.price) * 100);
          const size = 10 + Math.min(valueScore / 5, 22);
          return (
            <div key={i} className="absolute group"
              style={{ left: `${xPct}%`, bottom: `${yPct}%`, transform: "translate(-50%,50%)" }}>
              <div className="rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-125"
                style={{
                  width: size, height: size,
                  background: pl.color,
                  opacity: 0.85,
                  boxShadow: `0 0 ${size/2}px ${pl.color}55`,
                }}>
                <span style={{ fontSize: size * 0.45 }}>{pl.logo}</span>
              </div>
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
                style={{ whiteSpace: "nowrap" }}>
                <div className="rounded-xl px-2.5 py-1.5 text-[10px]"
                  style={{ background: "rgba(12,8,28,0.98)", border: `1px solid ${pl.color}40`, boxShadow: `0 4px 16px ${pl.color}30` }}>
                  <p className="font-black" style={{ color: pl.color }}>{pl.providerName} · {pl.label}</p>
                  <p style={{ color: "#c4b5fd" }}>{pl.speed} · R{pl.price}/mo</p>
                  <p style={{ color: valueScore > 40 ? "#10b981" : "#f59e0b" }}>Value: {valueScore > 40 ? "Excellent" : valueScore > 20 ? "Good" : "Fair"}</p>
                </div>
                <div className="w-2 h-2 mx-auto rotate-45 -mt-1" style={{ background: "rgba(12,8,28,0.98)" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Best-value recommendations ────────────────────────────────────────────────
function BestValuePicks({ available }) {
  const allPlans = available.flatMap(({ provider }) =>
    provider.plans.map(pl => ({ ...pl, provider, valueScore: Math.round((parseInt(pl.speed) / pl.price) * 100) }))
  ).sort((a, b) => b.valueScore - a.valueScore);

  const picks = [
    { label: "Best Value",   emoji: "🏆", plan: allPlans[0] },
    { label: "Best Speed",   emoji: "⚡", plan: allPlans.sort((a,b) => parseInt(b.speed) - parseInt(a.speed))[0] },
    { label: "Lowest Price", emoji: "💰", plan: [...allPlans].sort((a,b) => a.price - b.price)[0] },
  ].filter(p => p.plan);

  return (
    <div className="grid grid-cols-3 gap-3">
      {picks.map(({ label, emoji, plan }) => (
        <div key={label} className="rounded-2xl p-3 relative overflow-hidden"
          style={{ background: `${plan.provider.color}08`, border: `1px solid ${plan.provider.color}25` }}>
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: `linear-gradient(90deg,${plan.provider.color},transparent)` }} />
          <p className="text-lg mb-1">{emoji}</p>
          <p className="text-[9px] font-black uppercase tracking-wider mb-1" style={{ color: "rgba(196,188,247,0.5)" }}>{label}</p>
          <p className="text-[12px] font-black" style={{ color: plan.provider.color }}>{plan.provider.name}</p>
          <p className="text-[11px] font-bold mono" style={{ color: "#e8d5ff" }}>{plan.speed}</p>
          <p className="text-[11px]" style={{ color: "rgba(196,188,247,0.6)" }}>R{plan.price}/mo · {plan.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Provider comparison table ─────────────────────────────────────────────────
function ComparisonModal({ providerResults, onClose, onSignUp }) {
  const available = providerResults.filter(r => r.covered);
  const [activeTab, setActiveTab] = useState("table"); // table | chart | features
  const [filterProvider, setFilterProvider] = useState("all");
  const [sortBy, setSortBy] = useState("value"); // value | speed | price

  const allPlans = available.flatMap(({ provider }) =>
    provider.plans.map(pl => ({
      ...pl,
      provider,
      valueScore: Math.round((parseInt(pl.speed) / pl.price) * 100),
    }))
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
      style={{ background: "rgba(5,3,14,0.94)", backdropFilter: "blur(18px)" }}>
      <div className="relative w-full max-w-5xl max-h-[95vh] flex flex-col rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(160deg,#0b0818 0%,#0f0a22 100%)", border: "1px solid rgba(155,143,239,0.25)", boxShadow: "0 40px 100px rgba(124,111,224,0.3)" }}>

        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#6366f1,#9b8fef,#06b6d4,#10b981,transparent)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(155,143,239,0.12)", background: "rgba(155,143,239,0.04)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#6366f1,#9b8fef)", boxShadow: "0 4px 20px rgba(99,102,241,0.45)" }}>
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[17px] font-black" style={{ color: "#e8d5ff" }}>Provider Intelligence</h2>
              <p className="text-[11px]" style={{ color: "rgba(196,188,247,0.45)" }}>
                {available.length} provider{available.length !== 1 ? "s" : ""} available · {allPlans.length} plans compared
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Tabs */}
            {[
              { id: "table",    label: "Table",   icon: "📋" },
              { id: "chart",    label: "Chart",   icon: "📊" },
              { id: "features", label: "Features", icon: "✨" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                style={{
                  background: activeTab === tab.id ? "rgba(155,143,239,0.2)" : "transparent",
                  border: `1px solid ${activeTab === tab.id ? "rgba(155,143,239,0.4)" : "rgba(255,255,255,0.06)"}`,
                  color: activeTab === tab.id ? "#c4bcf7" : "#475569",
                }}>
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all ml-2">
              <X className="w-4 h-4" style={{ color: "#9b8fef" }} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Provider cards */}
          <div className={`grid gap-3 ${available.length <= 2 ? "grid-cols-2" : available.length === 3 ? "grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}>
            {available.map(({ provider }) => (
              <div key={provider.id} className="rounded-2xl overflow-hidden relative cursor-pointer transition-all hover:scale-[1.02]"
                style={{ background: `${provider.color}08`, border: `1px solid ${filterProvider === provider.id ? provider.color + "60" : provider.color + "22"}` }}
                onClick={() => setFilterProvider(f => f === provider.id ? "all" : provider.id)}>
                <div className="h-0.5" style={{ background: `linear-gradient(90deg,${provider.color},transparent)` }} />
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{provider.logo}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-black truncate" style={{ color: "#e2e8f0" }}>{provider.name}</p>
                      <Stars rating={provider.rating} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { label: "Plans",    value: provider.plans.length },
                      { label: "Uptime",   value: provider.uptime },
                      { label: "Customers",value: provider.customers },
                      { label: "Since",    value: provider.founded },
                    ].map(d => (
                      <div key={d.label} className="text-center rounded-lg py-1 px-1.5"
                        style={{ background: "rgba(255,255,255,0.03)" }}>
                        <p className="text-[11px] font-black mono" style={{ color: provider.color }}>{d.value}</p>
                        <p className="text-[9px]" style={{ color: "rgba(196,188,247,0.35)" }}>{d.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Best value picks */}
          <BestValuePicks available={available} />

          {/* ── TABLE TAB ── */}
          {activeTab === "table" && (
            <div className="space-y-3">
              {/* Controls */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(196,188,247,0.4)" }}>Sort:</span>
                  {[
                    { id: "value", label: "Best Value" },
                    { id: "speed", label: "Fastest" },
                    { id: "price", label: "Cheapest" },
                  ].map(s => (
                    <button key={s.id} onClick={() => setSortBy(s.id)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                      style={{
                        background: sortBy === s.id ? "rgba(155,143,239,0.15)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${sortBy === s.id ? "rgba(155,143,239,0.4)" : "rgba(255,255,255,0.07)"}`,
                        color: sortBy === s.id ? "#c4bcf7" : "#475569",
                      }}>
                      {s.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(196,188,247,0.4)" }}>Filter:</span>
                  <button onClick={() => setFilterProvider("all")}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                    style={{
                      background: filterProvider === "all" ? "rgba(155,143,239,0.15)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${filterProvider === "all" ? "rgba(155,143,239,0.4)" : "rgba(255,255,255,0.07)"}`,
                      color: filterProvider === "all" ? "#c4bcf7" : "#475569",
                    }}>All</button>
                  {available.map(({ provider }) => (
                    <button key={provider.id} onClick={() => setFilterProvider(f => f === provider.id ? "all" : provider.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                      style={{
                        background: filterProvider === provider.id ? `${provider.color}15` : "rgba(255,255,255,0.03)",
                        border: `1px solid ${filterProvider === provider.id ? provider.color + "40" : "rgba(255,255,255,0.07)"}`,
                        color: filterProvider === provider.id ? provider.color : "#475569",
                      }}>
                      {provider.logo} {provider.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(155,143,239,0.14)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "rgba(155,143,239,0.07)", borderBottom: "1px solid rgba(155,143,239,0.12)" }}>
                        {["Provider","Plan","⬇ Download","⬆ Upload","R / month","Contract","Value Score",""].map(h => (
                          <th key={h} className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.15em]" style={{ color: "rgba(196,188,247,0.5)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((pl, i) => {
                        const isTopValue = i === 0 && sortBy === "value";
                        return (
                          <tr key={i} className="transition-all"
                            style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: isTopValue ? `${pl.provider.color}06` : "transparent" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(155,143,239,0.04)"}
                            onMouseLeave={e => e.currentTarget.style.background = isTopValue ? `${pl.provider.color}06` : "transparent"}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{pl.provider.logo}</span>
                                <span className="text-[11px] font-bold" style={{ color: pl.provider.color }}>{pl.provider.name}</span>
                                {isTopValue && <span className="text-[8px] px-1.5 py-0.5 rounded-full font-black" style={{ background: "#f59e0b20", color: "#f59e0b", border: "1px solid #f59e0b30" }}>BEST VALUE</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[12px] font-bold" style={{ color: "#c4bcf7" }}>{pl.label}</td>
                            <td className="px-4 py-3">
                              <span className="text-[14px] font-black mono" style={{ color: "#e8d5ff" }}>{pl.speed}</span>
                            </td>
                            <td className="px-4 py-3 text-[12px] font-semibold mono" style={{ color: "rgba(196,188,247,0.5)" }}>{pl.upload}</td>
                            <td className="px-4 py-3">
                              <span className="text-[15px] font-black" style={{ color: pl.provider.color }}>R{pl.price}</span>
                              <span className="text-[10px] ml-1" style={{ color: "rgba(196,188,247,0.4)" }}>/mo</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[11px] px-2 py-1 rounded-lg font-bold"
                                style={{ background: "rgba(255,255,255,0.05)", color: "#64748b", border: "1px solid rgba(255,255,255,0.06)" }}>
                                {pl.contract} mo
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                                  <div className="h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, pl.valueScore / 5)}%`, background: pl.valueScore > 40 ? "linear-gradient(90deg,#10b981,#06b6d4)" : pl.valueScore > 20 ? "linear-gradient(90deg,#f59e0b,#f97316)" : "#ef4444" }} />
                                </div>
                                <span className="text-[10px] font-black"
                                  style={{ color: pl.valueScore > 40 ? "#10b981" : pl.valueScore > 20 ? "#f59e0b" : "#ef4444" }}>
                                  {pl.valueScore > 40 ? "★★★" : pl.valueScore > 20 ? "★★" : "★"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {pl.provider.id === "touchnet" && (
                                <button onClick={() => onSignUp(pl)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black text-white transition-all hover:scale-105"
                                  style={{ background: "linear-gradient(135deg,#6366f1,#9b8fef)", boxShadow: "0 3px 12px rgba(99,102,241,0.4)" }}>
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

          {/* ── CHART TAB ── */}
          {activeTab === "chart" && (
            <div className="space-y-4">
              <SpeedPriceChart available={available} />

              {/* Per-provider speed bar */}
              <div className="rounded-2xl p-4 space-y-3"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(155,143,239,0.15)" }}>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(196,188,247,0.5)" }}>Max Available Speed per Provider</p>
                {available.map(({ provider }) => {
                  const maxSpeed = Math.max(...provider.plans.map(p => parseInt(p.speed) || 0));
                  const pct = (maxSpeed / 1000) * 100;
                  return (
                    <div key={provider.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span>{provider.logo}</span>
                          <span className="text-[12px] font-bold" style={{ color: provider.color }}>{provider.name}</span>
                        </div>
                        <span className="text-[12px] font-black mono" style={{ color: "#e8d5ff" }}>
                          {maxSpeed >= 1000 ? "1 Gbps" : `${maxSpeed} Mbps`}
                        </span>
                      </div>
                      <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className="h-3 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(pct, 100)}%`, background: `linear-gradient(90deg,${provider.color},${provider.color}88)`, boxShadow: `0 0 10px ${provider.color}55` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price range comparison */}
              <div className="rounded-2xl p-4 space-y-3"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(155,143,239,0.15)" }}>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(196,188,247,0.5)" }}>Price Range (entry → top tier)</p>
                {available.map(({ provider }) => {
                  const prices = provider.plans.map(p => p.price);
                  const minP = Math.min(...prices), maxP = Math.max(...prices);
                  const xMin = (minP / 3500) * 100, xMax = (maxP / 3500) * 100;
                  return (
                    <div key={provider.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span>{provider.logo}</span>
                          <span className="text-[12px] font-bold" style={{ color: provider.color }}>{provider.name}</span>
                        </div>
                        <span className="text-[11px] mono" style={{ color: "rgba(196,188,247,0.6)" }}>R{minP} – R{maxP}</span>
                      </div>
                      <div className="relative h-3 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className="absolute h-3 rounded-full transition-all duration-700"
                          style={{ left: `${xMin}%`, width: `${xMax - xMin}%`, background: `linear-gradient(90deg,${provider.color}aa,${provider.color})`, boxShadow: `0 0 8px ${provider.color}44` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── FEATURES TAB ── */}
          {activeTab === "features" && (
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(155,143,239,0.15)" }}>
              <div className="overflow-x-auto">
                <table className="w-full" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(155,143,239,0.07)", borderBottom: "1px solid rgba(155,143,239,0.12)" }}>
                      <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-[0.15em]" style={{ color: "rgba(196,188,247,0.5)", width: 160 }}>Feature</th>
                      {available.map(({ provider }) => (
                        <th key={provider.id} className="px-4 py-3 text-center text-[9px] font-black uppercase tracking-[0.15em]" style={{ color: provider.color }}>
                          {provider.logo} {provider.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "Uncapped Data",       key: "uncapped" },
                      { feature: "Static IP",           key: "static_ip" },
                      { feature: "24/7 Support",        key: "support_24" },
                      { feature: "Priority Support",    key: "priority" },
                      { feature: "SLA Guarantee",       key: "sla" },
                      { feature: "Free Router",         key: "router" },
                      { feature: "WiFi 6",              key: "wifi6" },
                      { feature: "Gigabit Available",   key: "gigabit" },
                      { feature: "12-month Contract",   key: "short_contract" },
                    ].map((row, ri) => (
                      <tr key={row.key} style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                        <td className="px-4 py-3 text-[12px] font-semibold" style={{ color: "#c4b5fd" }}>{row.feature}</td>
                        {available.map(({ provider }) => {
                          const allFeatures = provider.plans.flatMap(p => p.features?.map(f => f.toLowerCase()) || []);
                          const maxSpeed = Math.max(...provider.plans.map(p => parseInt(p.speed) || 0));
                          const minContract = Math.min(...provider.plans.map(p => p.contract || 24));

                          const checks = {
                            uncapped:       allFeatures.some(f => f.includes("uncapped")),
                            static_ip:      allFeatures.some(f => f.includes("static ip") || f.includes("static")),
                            support_24:     allFeatures.some(f => f.includes("24/7") || f.includes("support")),
                            priority:       allFeatures.some(f => f.includes("priority")),
                            sla:            allFeatures.some(f => f.includes("sla") || f.includes("99.9")),
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
                                    style={{ background: `${provider.color}20`, border: `1px solid ${provider.color}35` }}>✓</span>
                                : <span className="inline-block w-6 h-6 rounded-full text-[12px] text-center leading-6"
                                    style={{ background: "rgba(255,255,255,0.04)", color: "#334155" }}>–</span>
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

// ── Futuristic HUD scan animation ─────────────────────────────────────────────
function ScanAnimation() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
      <div className="relative">
        {[60, 90, 120].map((size, i) => (
          <div key={i} className="absolute rounded-full border"
            style={{
              width: size, height: size,
              top: -size/2, left: -size/2,
              borderColor: `rgba(155,143,239,${0.4 - i * 0.1})`,
              animation: `ping ${1.2 + i * 0.4}s ease-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }} />
        ))}
        <div className="w-3 h-3 rounded-full" style={{ background: "#9b8fef", boxShadow: "0 0 12px rgba(155,143,239,0.8)" }} />
      </div>
    </div>
  );
}

export default function CoverageCheck() {
  const [address, setAddress]           = useState("");
  const [searching, setSearching]       = useState(false);
  const [result, setResult]             = useState(null);
  const [providerResults, setProviderResults] = useState([]);
  const [step, setStep]                 = useState("search");
  const [flyTo, setFlyTo]               = useState(null);
  const [markerPos, setMarkerPos]       = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("standard_50mbps");
  const [submitting, setSubmitting]     = useState(false);
  const [form, setForm]                 = useState({ name: "", email: "", phone: "", notes: "", plan: "standard_50mbps" });
  const [activeProviders, setActiveProviders] = useState(["touchnet", "openserve", "vumatel", "frogfoot", "mfn", "dfa", "linkafrica", "liquid", "herotel"]);
  const [showComparison, setShowComparison]   = useState(false);
  const [sidebarTab, setSidebarTab]     = useState("check"); // check | providers | results
  const [scanAnim, setScanAnim]         = useState(false);
  const [mapLoaded, setMapLoaded]       = useState(false);
  const [mapStyle, setMapStyle]         = useState("dark_blue");

  const toggleProvider = (id) => setActiveProviders(prev =>
    prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
  );

  const extractSuburb = (dn) => dn?.split(",")[0]?.trim() || "";
  const extractProvince = (dn) => {
    const provinces = ["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Limpopo","Mpumalanga","North West","Free State","Northern Cape"];
    return provinces.find(p => dn?.includes(p)) || "";
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!address.trim()) return;
    setSearching(true); setScanAnim(true); setResult(null); setProviderResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", South Africa")}&limit=1&countrycodes=za`,
        { headers: { "User-Agent": "TouchNet-CoverageCheck/1.0" } }
      );
      const data = await res.json();
      if (!data?.[0]) { setResult({ error: "Address not found. Try a suburb or city name." }); return; }
      const lat = parseFloat(data[0].lat), lng = parseFloat(data[0].lon);
      const allResults = checkAllProviders(lat, lng);
      const touchnetResult = allResults.find(r => r.provider.id === "touchnet");
      setResult({ covered: touchnetResult?.covered, zone: touchnetResult?.zone, lat, lng, displayName: data[0].display_name });
      setProviderResults(allResults);
      setFlyTo([lat, lng]);
      setMarkerPos([lat, lng]);
      setStep("result");
      setSidebarTab("results");
      base44.entities.CoverageSearch.create({
        query: address, display_name: data[0].display_name, lat, lng,
        covered: touchnetResult?.covered, nearest_zone: touchnetResult?.zone?.label || "",
        suburb: extractSuburb(data[0].display_name), province: extractProvince(data[0].display_name),
      }).catch(() => {});
    } catch {
      setResult({ error: "Search failed. Please try again." });
    } finally {
      setSearching(false);
      setTimeout(() => setScanAnim(false), 2000);
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
    setFlyTo(null); setMarkerPos(null); setSidebarTab("check");
    setForm({ name: "", email: "", phone: "", notes: "", plan: "standard_50mbps" });
  };

  const availableProviders = providerResults.filter(r => r.covered);
  const unavailableProviders = providerResults.filter(r => !r.covered);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#040e23", fontFamily: "'Inter', sans-serif" }}>

      {/* CSS animations */}
      <style>{`
        @keyframes ping { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scanLine { 0% { top: 0; } 100% { top: 100%; } }
        @keyframes dataFlow { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }
        .slide-in { animation: slideIn 0.3s ease forwards; }
        .fade-up  { animation: fadeUp  0.35s ease forwards; }
      `}</style>

      {/* ── Header HUD ── */}
      <header className="relative z-30 flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ background: "rgba(4,14,35,0.97)", borderBottom: "1px solid rgba(56,189,248,0.18)", backdropFilter: "blur(20px)" }}>
        {/* prismatic top line */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg,#0ea5e9,#38bdf8,#7dd3fc,#10b981,#06b6d4,transparent)" }} />

        <div className="flex items-center gap-4">
          <img src={LOGO_URL} alt="TouchNet" className="h-7 object-contain"
            style={{ filter: "brightness(0) invert(1) drop-shadow(0 0 8px rgba(196,188,247,0.5))" }} />
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(56,189,248,0.07)", border: "1px solid rgba(56,189,248,0.18)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(147,210,255,0.6)", fontFamily: "monospace" }}>
              FIBRE COVERAGE INTELLIGENCE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-3">
            {Object.values(PROVIDERS).map(p => (
              <button key={p.id} onClick={() => toggleProvider(p.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                style={{
                  background: activeProviders.includes(p.id) ? `${p.color}15` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${activeProviders.includes(p.id) ? p.color + "40" : "rgba(255,255,255,0.08)"}`,
                  color: activeProviders.includes(p.id) ? p.color : "#475569",
                  opacity: activeProviders.includes(p.id) ? 1 : 0.5,
                }}>
                <span>{p.logo}</span> {p.name}
              </button>
            ))}
          </div>
          <a href="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
            style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.28)", color: "#7dd3fc" }}>
            Portal <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* ── Main Layout: Sidebar + Full-screen map ── */}
      <div className="flex flex-1 overflow-hidden relative" style={{ height: "calc(100vh - 53px)" }}>

        {/* ── Left Sidebar ── */}
        <div className="relative z-20 flex flex-col flex-shrink-0 overflow-hidden"
          style={{ width: 340, background: "rgba(4,14,35,0.97)", borderRight: "1px solid rgba(56,189,248,0.14)", backdropFilter: "blur(20px)" }}>

          {/* Sidebar tab bar */}
          <div className="flex border-b flex-shrink-0" style={{ borderColor: "rgba(56,189,248,0.12)" }}>
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
                    background: sidebarTab === tab.key ? "rgba(56,189,248,0.1)" : "transparent",
                    borderBottom: sidebarTab === tab.key ? "2px solid #38bdf8" : "2px solid transparent",
                    color: sidebarTab === tab.key ? "#7dd3fc" : "rgba(147,210,255,0.35)",
                    marginBottom: -1,
                  }}>
                  <Icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* ── CHECK TAB ── */}
            {sidebarTab === "check" && (
              <div className="space-y-4 fade-up">
                {/* Hero text */}
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl mb-3"
                    style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.22)" }}>
                    <Globe className="w-3 h-3" style={{ color: "#38bdf8" }} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "#38bdf8" }}>
                      Multi-Provider Coverage Check
                    </span>
                  </div>
                  <h1 className="text-[20px] font-black leading-tight mb-1" style={{ color: "#e0f2fe", fontFamily: "'Space Grotesk',sans-serif" }}>
                    Is Fibre Available<br />
                    <span style={{ background: "linear-gradient(135deg,#38bdf8,#7dd3fc,#10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      At Your Address?
                    </span>
                  </h1>
                  <p className="text-[12px]" style={{ color: "rgba(147,210,255,0.55)" }}>
                    Instantly compare all available providers and plans.
                  </p>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="space-y-2">
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#38bdf8" }} />
                    <input value={address} onChange={e => setAddress(e.target.value)}
                      placeholder="e.g. Sandton City, 25 Rivonia Rd…"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl text-[13px] outline-none transition-all"
                      style={{ background: "rgba(56,189,248,0.07)", border: "1px solid rgba(56,189,248,0.22)", color: "#e0f2fe" }}
                      onFocus={e => e.target.style.borderColor = "rgba(56,189,248,0.55)"}
                      onBlur={e => e.target.style.borderColor = "rgba(56,189,248,0.22)"}
                    />
                  </div>
                  <button type="submit" disabled={searching || !address.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[13px] text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#0284c7,#38bdf8)", boxShadow: "0 6px 24px rgba(56,189,248,0.4)" }}>
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {searching ? "Scanning all providers…" : "Check All Providers"}
                  </button>
                </form>

                {/* Error */}
                {result?.error && (
                  <div className="rounded-2xl p-3 flex items-start gap-2"
                    style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
                    <p className="text-[12px]" style={{ color: "#fbbf24" }}>{result.error}</p>
                  </div>
                )}

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Providers", value: Object.keys(PROVIDERS).length, color: "#38bdf8" },
                    { label: "Zones", value: Object.values(PROVIDERS).reduce((a,p) => a + p.zones.length, 0), color: "#06b6d4" },
                    { label: "Plans", value: Object.values(PROVIDERS).reduce((a,p) => a + p.plans.length, 0), color: "#10b981" },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center relative overflow-hidden"
                      style={{ background: `${s.color}08`, border: `1px solid ${s.color}18` }}>
                      <div className="absolute top-0 left-0 right-0 h-[1px]"
                        style={{ background: `linear-gradient(90deg,${s.color},transparent)` }} />
                      <p className="text-[18px] font-black mono" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "rgba(196,188,247,0.4)" }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Why TouchNet */}
                <div className="rounded-2xl p-4 relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg,rgba(56,189,248,0.07),rgba(16,185,129,0.05))", border: "1px solid rgba(56,189,248,0.18)" }}>
                  <div className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: "linear-gradient(90deg,#38bdf8,#10b981,transparent)" }} />
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#38bdf8" }}>Why Choose TouchNet?</p>
                  <div className="space-y-2">
                    {[
                      { icon: Zap, label: "Fastest speeds up to 1 Gbps", color: "#f59e0b" },
                      { icon: Shield, label: "99.9% uptime SLA guaranteed", color: "#10b981" },
                      { icon: Clock, label: "24/7 local technical support", color: "#06b6d4" },
                      { icon: TrendingUp, label: "Transparent, no hidden fees", color: "#9b8fef" },
                    ].map(({ icon: Icon, label, color }) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                          <Icon className="w-3 h-3" style={{ color }} />
                        </div>
                        <p className="text-[11px]" style={{ color: "rgba(196,188,247,0.7)" }}>{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PROVIDERS TAB ── */}
            {sidebarTab === "providers" && (
              <div className="space-y-3 fade-up">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: "rgba(196,188,247,0.5)" }}>All Providers on Map</p>
                  <button onClick={() => setActiveProviders(Object.keys(PROVIDERS))}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg"
                    style={{ background: "rgba(155,143,239,0.1)", color: "#9b8fef", border: "1px solid rgba(155,143,239,0.2)" }}>
                    Show All
                  </button>
                </div>
                {Object.values(PROVIDERS).map(p => (
                  <div key={p.id} className="rounded-2xl overflow-hidden transition-all"
                    style={{ background: activeProviders.includes(p.id) ? `${p.color}08` : "rgba(255,255,255,0.02)", border: `1px solid ${activeProviders.includes(p.id) ? p.color + "25" : "rgba(255,255,255,0.06)"}` }}>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.logo}</span>
                        <div>
                          <p className="text-[13px] font-black" style={{ color: activeProviders.includes(p.id) ? "#e2e8f0" : "#475569" }}>{p.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Stars rating={p.rating} />
                            <span className="text-[9px]" style={{ color: "#475569" }}>{p.zones.length} zones</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => toggleProvider(p.id)}
                        className="w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0"
                        style={{ background: activeProviders.includes(p.id) ? p.color : "#1e293b", boxShadow: activeProviders.includes(p.id) ? `0 0 12px ${p.glowColor}` : "none" }}>
                        <span className="block w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 mx-auto"
                          style={{ transform: activeProviders.includes(p.id) ? "translateX(5px)" : "translateX(-5px)" }} />
                      </button>
                    </div>
                    {activeProviders.includes(p.id) && (
                      <div className="px-4 pb-3 flex flex-wrap gap-1">
                        {p.plans.map(pl => (
                          <span key={pl.label} className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${p.color}12`, color: p.color, border: `1px solid ${p.color}25` }}>
                            {pl.speed} · R{pl.price}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── RESULTS TAB ── */}
            {sidebarTab === "results" && providerResults.length > 0 && (
              <div className="space-y-3 fade-up">
                <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "rgba(196,188,247,0.5)" }}>
                  Results for {result?.displayName?.split(",")[0]}
                </p>

                {/* Compare CTA */}
                {availableProviders.length > 1 && (
                  <button onClick={() => setShowComparison(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[12px] text-white transition-all hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg,#7c6fe0,#9b8fef)", boxShadow: "0 6px 20px rgba(124,111,224,0.4)" }}>
                    <BarChart3 className="w-4 h-4" />
                    Compare {availableProviders.length} Available Providers
                  </button>
                )}

                {availableProviders.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "#10b981" }}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> {availableProviders.length} Provider{availableProviders.length !== 1 ? "s" : ""} Available
                    </p>
                    {availableProviders.map(({ provider, zone }) => (
                      <div key={provider.id} className="rounded-2xl overflow-hidden slide-in"
                        style={{ background: `${provider.color}08`, border: `1px solid ${provider.color}25` }}>
                        <div className="h-0.5" style={{ background: `linear-gradient(90deg,${provider.color},transparent)` }} />
                        <div className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{provider.logo}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-black" style={{ color: "#e2e8f0" }}>{provider.name}</p>
                              <p className="text-[10px]" style={{ color: provider.color }}>✓ {zone?.label}</p>
                            </div>
                            <Stars rating={provider.rating} />
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {provider.plans.slice(0, 3).map(pl => (
                              <span key={pl.label} className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: `${provider.color}15`, color: provider.color, border: `1px solid ${provider.color}25` }}>
                                {pl.speed} · R{pl.price}
                              </span>
                            ))}
                            {provider.plans.length > 3 && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ color: "#64748b" }}>+{provider.plans.length - 3} more</span>
                            )}
                          </div>
                          {provider.id === "touchnet" && (
                            <button onClick={() => { setStep("form"); setSidebarTab("check"); }}
                              className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black text-white transition-all hover:scale-[1.02]"
                              style={{ background: `linear-gradient(135deg,${provider.color}dd,${provider.color})`, boxShadow: `0 4px 14px ${provider.glowColor}` }}>
                              <Zap className="w-3 h-3" /> Sign Up with TouchNet
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl p-4 text-center"
                    style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <XCircle className="w-8 h-8 mx-auto mb-2" style={{ color: "#ef4444" }} />
                    <p className="text-[13px] font-black" style={{ color: "#ef4444" }}>No Coverage Yet</p>
                    <p className="text-[11px] mt-1" style={{ color: "rgba(196,188,247,0.5)" }}>
                      No providers currently cover this area. Leave your details and we'll notify you!
                    </p>
                  </div>
                )}

                {unavailableProviders.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "#475569" }}>
                      <XCircle className="w-3 h-3" /> {unavailableProviders.length} Not yet available
                    </p>
                    {unavailableProviders.map(({ provider }) => (
                      <div key={provider.id} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <span className="text-base opacity-40">{provider.logo}</span>
                        <p className="text-[12px] text-slate-600">{provider.name}</p>
                        <span className="ml-auto text-[9px]" style={{ color: "#334155" }}>Coming soon</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sign-up / notify form */}
                {step === "form" && (
                  <div className="rounded-2xl overflow-hidden fade-up"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(155,143,239,0.2)" }}>
                    <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#9b8fef,#c4bcf7,transparent)" }} />
                    <div className="p-4">
                      <p className="text-[13px] font-black mb-3" style={{ color: "#c4bcf7" }}>
                        {result?.covered ? "Sign Up with TouchNet" : "Get Notified When Available"}
                      </p>
                      <form onSubmit={handleSubmit} className="space-y-2.5">
                        {[
                          { field: "name", label: "Full Name *", icon: User, placeholder: "John Smith", type: "text", required: true },
                          { field: "email", label: "Email *", icon: Mail, placeholder: "john@email.com", type: "email", required: true },
                          { field: "phone", label: "Phone", icon: Phone, placeholder: "071 234 5678", type: "tel", required: false },
                        ].map(({ field, label, icon: Icon, placeholder, type, required }) => (
                          <div key={field}>
                            <label className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(196,188,247,0.4)" }}>{label}</label>
                            <div className="relative">
                              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(155,143,239,0.4)" }} />
                              <input required={required} type={type} value={form[field]}
                                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                                placeholder={placeholder}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[12px] outline-none"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(155,143,239,0.2)", color: "#e2e8f0" }} />
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setStep("result")}
                            className="px-3 py-2.5 rounded-xl text-[11px] font-bold"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}>
                            ← Back
                          </button>
                          <button type="submit" disabled={submitting}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold text-white disabled:opacity-60"
                            style={{ background: "linear-gradient(135deg,#7c6fe0,#9b8fef)", boxShadow: "0 4px 16px rgba(124,111,224,0.4)" }}>
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
                    style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)" }}>
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                    <p className="text-[14px] font-black" style={{ color: "#10b981" }}>Submitted!</p>
                    <p className="text-[11px] mt-1 mb-3" style={{ color: "rgba(196,188,247,0.5)" }}>We'll contact you within 24 hours.</p>
                    <button onClick={reset}
                      className="text-[11px] font-bold px-4 py-2 rounded-xl"
                      style={{ background: "rgba(155,143,239,0.1)", border: "1px solid rgba(155,143,239,0.2)", color: "#c4bcf7" }}>
                      Check Another Address
                    </button>
                  </div>
                )}

                {step === "result" && result?.covered && (
                  <button onClick={() => setStep("form")}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[12px] text-white transition-all hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 6px 20px rgba(16,185,129,0.3)" }}>
                    <Zap className="w-4 h-4" /> Sign Up with TouchNet Now
                  </button>
                )}
                {step === "result" && !result?.covered && (
                  <button onClick={() => setStep("form")}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[12px] text-white transition-all hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg,#7c6fe0,#9b8fef)", boxShadow: "0 6px 20px rgba(124,111,224,0.35)" }}>
                    <Mail className="w-4 h-4" /> Notify Me When Available
                  </button>
                )}

                <button onClick={reset}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-bold transition-all hover:bg-white/5"
                  style={{ color: "#475569", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <RefreshCw className="w-3.5 h-3.5" /> Check Another Address
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Full-screen Map ── */}
        <div className="flex-1 relative">
          {/* Map container */}
          <MapContainer
            center={[-28.5, 25.5]}
            zoom={6}
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <ZoomControl position="bottomright" />
            <TileLayer
              key={mapStyle}
              url={MAP_STYLES[mapStyle].url}
              attribution={MAP_STYLES[mapStyle].attribution}
              eventHandlers={{ load: () => setMapLoaded(true) }}
            />
            {flyTo && <FlyTo coords={flyTo} />}

            {/* Provider coverage circles */}
            {Object.values(PROVIDERS).map(provider =>
              activeProviders.includes(provider.id) ? (
                <LayerGroup key={provider.id}>
                  {provider.zones.map((zone, i) => (
                    <Circle key={i} center={[zone.lat, zone.lng]} radius={zone.radius}
                      pathOptions={{
                        color: provider.color,
                        fillColor: provider.color,
                        fillOpacity: 0.12,
                        weight: 1.5,
                        dashArray: provider.id !== "touchnet" ? "4,4" : undefined,
                      }}>
                      <Popup>
                        <div style={{ fontFamily: "Inter, sans-serif", minWidth: 160 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 18 }}>{provider.logo}</span>
                            <div>
                              <p style={{ fontWeight: 900, fontSize: 13, color: "#1e293b", margin: 0 }}>{provider.name}</p>
                              <p style={{ fontSize: 10, color: provider.color, margin: 0 }}>{zone.label}</p>
                            </div>
                          </div>
                          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 6 }}>
                            <p style={{ fontSize: 10, color: "#64748b", margin: "0 0 4px" }}>Plans available:</p>
                            {provider.plans.slice(0, 3).map(pl => (
                              <div key={pl.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
                                <span style={{ fontWeight: 700, color: "#334155" }}>{pl.speed}</span>
                                <span style={{ color: provider.color, fontWeight: 800 }}>R{pl.price}/mo</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Popup>
                    </Circle>
                  ))}
                </LayerGroup>
              ) : null
            )}

            {/* Searched location marker + pulse */}
            {markerPos && (
              <>
                <PulseCircle position={markerPos}
                  color={result?.covered ? "#10b981" : "#ef4444"} />
                <Marker position={markerPos}>
                  <Popup>
                    <div style={{ fontFamily: "Inter, sans-serif", minWidth: 180 }}>
                      <p style={{ fontWeight: 900, fontSize: 13, marginBottom: 4, color: "#1e293b" }}>📍 Your Location</p>
                      {availableProviders.length > 0 ? (
                        <div>
                          <p style={{ fontSize: 11, color: "#10b981", fontWeight: 700, marginBottom: 4 }}>
                            ✓ {availableProviders.length} provider{availableProviders.length > 1 ? "s" : ""} available
                          </p>
                          {availableProviders.map(({ provider }) => (
                            <p key={provider.id} style={{ fontSize: 11, color: "#64748b", margin: "1px 0" }}>
                              {provider.logo} {provider.name}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: 11, color: "#ef4444" }}>No coverage yet in this area</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              </>
            )}
          </MapContainer>

          {/* ── Map overlays ── */}

          {/* Scan animation overlay */}
          {scanAnim && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
              <div className="relative">
                {[80, 140, 200, 260].map((size, i) => (
                  <div key={i} className="absolute rounded-full border-2"
                    style={{
                      width: size, height: size,
                      top: -size/2, left: -size/2,
                      borderColor: `rgba(56,189,248,${0.6 - i * 0.12})`,
                      animation: `ping ${0.8 + i * 0.3}s ease-out infinite`,
                      animationDelay: `${i * 0.15}s`,
                    }} />
                ))}
                <div className="w-4 h-4 rounded-full" style={{ background: "#38bdf8", boxShadow: "0 0 20px rgba(56,189,248,1)" }} />
              </div>
            </div>
          )}

          {/* Map style switcher */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5"
            style={{ background: "rgba(4,14,35,0.88)", border: "1px solid rgba(56,189,248,0.25)", borderRadius: 14, padding: "10px 12px", backdropFilter: "blur(12px)" }}>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: "rgba(147,210,255,0.5)", fontFamily: "monospace" }}>MAP VIEW</p>
            {Object.entries(MAP_STYLES).map(([key, style]) => (
              <button key={key} onClick={() => setMapStyle(key)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all hover:bg-white/5 text-left"
                style={{
                  background: mapStyle === key ? "rgba(56,189,248,0.15)" : "transparent",
                  border: `1px solid ${mapStyle === key ? "rgba(56,189,248,0.4)" : "transparent"}`,
                }}>
                <span className="text-sm">{style.icon}</span>
                <span className="text-[11px] font-bold" style={{ color: mapStyle === key ? "#7dd3fc" : "#475569" }}>{style.label}</span>
                {mapStyle === key && <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#38bdf8", boxShadow: "0 0 6px #38bdf8" }} />}
              </button>
            ))}
          </div>

          {/* Top-right HUD: Provider legend */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5"
            style={{ background: "rgba(4,14,35,0.88)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 16, padding: "12px 14px", backdropFilter: "blur(12px)" }}>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: "rgba(147,210,255,0.4)", fontFamily: "monospace" }}>VISIBLE LAYERS</p>
            {Object.values(PROVIDERS).map(p => (
              <button key={p.id} onClick={() => toggleProvider(p.id)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all hover:bg-white/5">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all`}
                  style={{
                    background: activeProviders.includes(p.id) ? p.color : "#1e293b",
                    border: `1.5px solid ${p.color}`,
                    boxShadow: activeProviders.includes(p.id) ? `0 0 8px ${p.glowColor}` : "none",
                  }} />
                <span className="text-[11px] font-bold" style={{ color: activeProviders.includes(p.id) ? "#7dd3fc" : "#334155" }}>
                  {p.logo} {p.name}
                </span>
              </button>
            ))}
            <div className="mt-1 pt-2" style={{ borderTop: "1px solid rgba(56,189,248,0.1)" }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-1 rounded" style={{ background: "#38bdf8" }} />
                <span className="text-[9px]" style={{ color: "rgba(147,210,255,0.4)" }}>Solid = Primary</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded" style={{ background: "repeating-linear-gradient(90deg,#06b6d4 0,#06b6d4 2px,transparent 2px,transparent 4px)" }} />
                <span className="text-[9px]" style={{ color: "rgba(147,210,255,0.4)" }}>Dashed = Wholesale</span>
              </div>
            </div>
          </div>

          {/* Bottom status bar */}
          <div className="absolute bottom-3 left-3 right-16 z-10 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "rgba(4,14,35,0.92)", border: "1px solid rgba(56,189,248,0.2)", backdropFilter: "blur(10px)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-bold" style={{ color: "#7dd3fc" }}>LIVE MAP</span>
              <span className="text-[9px]" style={{ color: "rgba(147,210,255,0.45)" }}>· {activeProviders.length} providers active</span>
            </div>
            {result && !result.error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: result.covered ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)",
                  border: `1px solid ${result.covered ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.25)"}`,
                  backdropFilter: "blur(10px)",
                }}>
                {result.covered
                  ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
                  : <XCircle className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />}
                <span className="text-[11px] font-bold" style={{ color: result.covered ? "#10b981" : "#ef4444" }}>
                  {result.covered ? `${availableProviders.length} providers available` : "No coverage at this location"}
                </span>
              </div>
            )}
            {providerResults.length > 1 && availableProviders.length > 0 && (
              <button onClick={() => setShowComparison(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#0284c7,#38bdf8)", boxShadow: "0 4px 14px rgba(56,189,248,0.4)", backdropFilter: "blur(10px)" }}>
                <BarChart3 className="w-3.5 h-3.5" /> Compare Plans
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Comparison modal ── */}
      {showComparison && (
        <ComparisonModal
          providerResults={providerResults}
          onClose={() => setShowComparison(false)}
          onSignUp={(plan) => {
            setShowComparison(false);
            setSelectedPlan(plan.id || "standard_50mbps");
            setStep("form");
            setSidebarTab("results");
          }}
        />
      )}
    </div>
  );
}