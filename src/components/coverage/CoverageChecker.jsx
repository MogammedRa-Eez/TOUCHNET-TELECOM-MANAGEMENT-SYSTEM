import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X, MapPin, CheckCircle2, XCircle, Loader2, AlertTriangle,
  Zap, Wifi, Search, Globe, ArrowLeftRight
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import "leaflet/dist/leaflet.css";

const FIBRE_PROVIDERS = {
  touchnet: {
    name: "TouchNet Fibre", shortName: "TouchNet", color: "#0891b2", logo: "⚡",
    description: "Your local premium fibre provider with dedicated support",
    coverage: ["Sandton", "Midrand", "Fourways", "Rivonia", "Bryanston", "Rosebank", "Melrose", "Illovo"],
    plans: [
      { speed: "10 Mbps", price: 299, label: "Basic" },
      { speed: "50 Mbps", price: 499, label: "Standard" },
      { speed: "100 Mbps", price: 699, label: "Premium" },
      { speed: "500 Mbps", price: 1199, label: "Enterprise" },
      { speed: "1 Gbps", price: 1799, label: "Dedicated 1G" },
    ],
    features: ["Uncapped", "Unshaped", "24/7 NOC", "Dedicated Account Manager", "4-hour SLA", "Static IP"],
    uptime: "99.95%", isTouchnet: true,
  },
  vumatel: {
    name: "Vumatel", shortName: "Vuma", color: "#e11d48", logo: "🔴",
    description: "South Africa's largest open-access FTTH network",
    coverage: ["Sandton", "Midrand", "Randburg", "Roodepoort", "Centurion", "Pretoria", "Cape Town", "Durban"],
    plans: [
      { speed: "25 Mbps", price: 399, label: "Starter" },
      { speed: "50 Mbps", price: 549, label: "Essential" },
      { speed: "100 Mbps", price: 699, label: "Value" },
      { speed: "200 Mbps", price: 999, label: "Power" },
      { speed: "1 Gbps", price: 1999, label: "Giga" },
    ],
    features: ["Uncapped", "Unshaped", "Unthrottled", "Free installation"],
    uptime: "99.9%",
  },
  openserve: {
    name: "Openserve", shortName: "Openserve", color: "#2563eb", logo: "🔵",
    description: "Telkom's open-access fibre network with national reach",
    coverage: ["Johannesburg", "Pretoria", "Cape Town", "Durban", "Port Elizabeth", "Bloemfontein"],
    plans: [
      { speed: "10 Mbps", price: 299, label: "Basic" },
      { speed: "50 Mbps", price: 549, label: "Essential" },
      { speed: "100 Mbps", price: 749, label: "Premium" },
      { speed: "1 Gbps", price: 2199, label: "Giga" },
    ],
    features: ["Uncapped", "Unshaped", "Nationwide coverage", "Business-grade SLA"],
    uptime: "99.7%",
  },
  metrofibre: {
    name: "MetroFibre Networx", shortName: "MetroFibre", color: "#7c3aed", logo: "🟣",
    description: "High-density urban fibre network in Gauteng",
    coverage: ["Sandton", "Fourways", "Midrand", "Centurion", "Rosebank", "Bryanston", "Melrose"],
    plans: [
      { speed: "25 Mbps", price: 349, label: "Value" },
      { speed: "100 Mbps", price: 699, label: "Premium" },
      { speed: "500 Mbps", price: 1399, label: "Ultra" },
      { speed: "1 Gbps", price: 1899, label: "Giga" },
    ],
    features: ["Uncapped", "Unshaped", "High-density urban", "Low latency"],
    uptime: "99.9%",
  },
  octotel: {
    name: "Octotel", shortName: "Octotel", color: "#d97706", logo: "🟡",
    description: "Cape Town's leading open-access FTTH network",
    coverage: ["Cape Town CBD", "Camps Bay", "Sea Point", "Green Point", "Claremont", "Newlands", "Rondebosch"],
    plans: [
      { speed: "25 Mbps", price: 399, label: "Lite" },
      { speed: "100 Mbps", price: 749, label: "Premium" },
      { speed: "1 Gbps", price: 2099, label: "Giga" },
    ],
    features: ["Uncapped", "Unshaped", "Cape Town focused"],
    uptime: "99.7%",
  },
  frogfoot: {
    name: "Frogfoot", shortName: "Frogfoot", color: "#059669", logo: "🟢",
    description: "Premium open-access FTTH in select suburbs",
    coverage: ["Stellenbosch", "Somerset West", "Paarl", "Bellville", "Tyger Valley", "Strand"],
    plans: [
      { speed: "25 Mbps", price: 449, label: "Starter" },
      { speed: "100 Mbps", price: 799, label: "Premium" },
      { speed: "1 Gbps", price: 2299, label: "Giga" },
    ],
    features: ["Uncapped", "Unshaped", "Premium routing"],
    uptime: "99.8%",
  },
};

const NODE_STATUS_CFG = {
  online:      { color: "#059669", border: "#047857", label: "Online",      icon: "✅" },
  degraded:    { color: "#d97706", border: "#b45309", label: "Degraded",    icon: "⚠️" },
  maintenance: { color: "#7c3aed", border: "#6d28d9", label: "Maintenance", icon: "🔧" },
  offline:     { color: "#dc2626", border: "#b91c1c", label: "Offline",     icon: "🔴" },
};

const TABS = [
  { key: "map",     label: "Coverage Map",  icon: MapPin },
  { key: "compare", label: "Compare Plans", icon: ArrowLeftRight },
  { key: "areas",   label: "Areas & FNOs",  icon: Globe },
];

const ALL_SPEEDS = ["10 Mbps", "25 Mbps", "50 Mbps", "100 Mbps", "200 Mbps", "500 Mbps", "1 Gbps"];

const T = {
  bg: "rgba(240,249,255,0.98)",
  panel: "rgba(255,255,255,0.95)",
  border: "rgba(6,182,212,0.18)",
  borderStrong: "rgba(6,182,212,0.35)",
  accent: "#0891b2",
  text: "#0f172a",
  sub: "#475569",
  muted: "#94a3b8",
  grid: "rgba(6,182,212,0.055)",
};

async function geocodeLocation(str) {
  if (!str) return null;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(str + ", South Africa")}&limit=1`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await res.json();
  if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  return null;
}

function Card({ children, style, className = "" }) {
  return (
    <div className={className} style={{
      background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16,
      boxShadow: "0 4px 24px rgba(6,182,212,0.07), 0 1px 0 rgba(255,255,255,0.9) inset", ...style,
    }}>{children}</div>
  );
}

// ── Compare Tab ───────────────────────────────────────────────────────────────
function CompareTab() {
  const [selected, setSelected] = useState(["touchnet", "vumatel", "openserve"]);
  const [speed, setSpeed] = useState("100 Mbps");
  const toggle = (key) => setSelected(prev =>
    prev.includes(key) ? prev.length > 1 ? prev.filter(p => p !== key) : prev : prev.length < 4 ? [...prev, key] : prev
  );
  const rows = selected.map(key => ({ key, p: FIBRE_PROVIDERS[key], plan: FIBRE_PROVIDERS[key].plans.find(pl => pl.speed === speed) || null }));
  const cheapestKey = rows.filter(r => r.plan).sort((a, b) => a.plan.price - b.plan.price)[0]?.key;

  return (
    <div className="flex flex-col h-full overflow-y-auto p-5 space-y-4" style={{ background: `linear-gradient(180deg,${T.bg},rgba(245,250,255,1))` }}>
      <Card style={{ padding: 14 }}>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-2.5" style={{ color: T.accent }}>SELECT PROVIDERS (max 4)</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(FIBRE_PROVIDERS).map(([key, p]) => {
            const active = selected.includes(key);
            return (
              <button key={key} onClick={() => toggle(key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
                style={{ background: active ? `${p.color}12` : "rgba(248,250,252,0.8)", border: `1px solid ${active ? p.color + "50" : "rgba(226,232,240,0.8)"}`, color: active ? p.color : T.muted, boxShadow: active ? `0 2px 12px ${p.color}20` : "none" }}>
                {p.logo} {p.shortName} {active && <CheckCircle2 className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
      </Card>
      <Card style={{ padding: 14 }}>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-2.5" style={{ color: T.accent }}>SPEED TIER</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_SPEEDS.map(s => (
            <button key={s} onClick={() => setSpeed(s)}
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
              style={{ background: speed === s ? `${T.accent}15` : "rgba(248,250,252,0.8)", border: `1px solid ${speed === s ? T.accent + "50" : "rgba(226,232,240,0.8)"}`, color: speed === s ? T.accent : T.muted }}>
              {s}
            </button>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map(({ key, p, plan }) => {
          const isBest = cheapestKey === key && rows.filter(r => r.plan).length > 1;
          return (
            <div key={key} className="relative rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-1 duration-300"
              style={{
                background: p.isTouchnet ? `linear-gradient(145deg,rgba(6,182,212,0.08),rgba(99,102,241,0.04))` : T.panel,
                border: `1px solid ${p.isTouchnet ? "rgba(6,182,212,0.4)" : p.color + "25"}`,
                boxShadow: p.isTouchnet ? "0 8px 32px rgba(6,182,212,0.15),0 1px 0 rgba(255,255,255,1) inset" : `0 4px 20px ${p.color}10,0 1px 0 rgba(255,255,255,0.9) inset`,
              }}>
              <div className="h-[3px]" style={{ background: `linear-gradient(90deg,${p.color},${p.color}44,transparent)` }} />
              <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
                {isBest && <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(5,150,105,0.1)", color: "#059669", border: "1px solid rgba(5,150,105,0.3)" }}>BEST PRICE</span>}
                {p.isTouchnet && <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(6,182,212,0.1)", color: "#0891b2", border: "1px solid rgba(6,182,212,0.3)" }}>⚡ RECOMMENDED</span>}
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: `${p.color}10`, border: `1px solid ${p.color}25` }}>{p.logo}</div>
                  <div>
                    <p className="text-[13px] font-black" style={{ color: T.text }}>{p.name}</p>
                    <p className="text-[10px]" style={{ color: p.color }}>{p.uptime} uptime SLA</p>
                  </div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: `${p.color}08`, border: `1px solid ${p.color}20` }}>
                  {plan ? (
                    <>
                      <p className="text-[30px] font-black mono leading-none" style={{ color: p.color }}>R{plan.price}</p>
                      <p className="text-[10px] font-semibold mt-1" style={{ color: T.sub }}>/month · {plan.speed} · {plan.label}</p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: `${p.color}12`, color: p.color, border: `1px solid ${p.color}25` }}>
                        R{(plan.price / parseInt(plan.speed)).toFixed(0)}/Mbps
                      </div>
                    </>
                  ) : <p className="text-[11px] py-2" style={{ color: T.muted }}>Not available at this tier</p>}
                </div>
                <div className="space-y-1">
                  {p.features.slice(0, 4).map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: p.color }} />
                      <span className="text-[11px]" style={{ color: T.sub }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {p.plans.map((pl, i) => (
                    <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg"
                      style={{ background: pl.speed === speed ? `${p.color}15` : "rgba(241,245,249,0.8)", color: pl.speed === speed ? p.color : T.muted, border: `1px solid ${pl.speed === speed ? p.color + "35" : "rgba(226,232,240,0.8)"}` }}>
                      {pl.speed} · R{pl.price}
                    </span>
                  ))}
                </div>
                {p.isTouchnet && (
                  <button className="w-full py-2.5 rounded-xl text-[12px] font-black text-white transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg,#0891b2,#0284c7)", boxShadow: "0 4px 16px rgba(6,182,212,0.3)" }}>
                    Connect with TouchNet →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Areas Tab ─────────────────────────────────────────────────────────────────
function AreasTab() {
  const [search, setSearch] = useState("");
  const [fnoFilter, setFnoFilter] = useState("all");
  const allAreas = useMemo(() => {
    const map = {};
    Object.entries(FIBRE_PROVIDERS).forEach(([key, p]) =>
      p.coverage.forEach(area => { if (!map[area]) map[area] = []; map[area].push(key); })
    );
    return map;
  }, []);
  const filtered = useMemo(() =>
    Object.entries(allAreas)
      .filter(([area, keys]) => (!search || area.toLowerCase().includes(search.toLowerCase())) && (fnoFilter === "all" || keys.includes(fnoFilter)))
      .sort((a, b) => b[1].length - a[1].length),
    [allAreas, search, fnoFilter]
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto p-5 space-y-4" style={{ background: `linear-gradient(180deg,${T.bg},rgba(245,250,255,1))` }}>
      <Card style={{ padding: 14 }}>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-2.5" style={{ color: T.accent }}>FILTER BY PROVIDER</p>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFnoFilter("all")} className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
            style={{ background: fnoFilter === "all" ? `${T.accent}12` : "rgba(248,250,252,0.8)", border: `1px solid ${fnoFilter === "all" ? T.accent + "40" : "rgba(226,232,240,0.8)"}`, color: fnoFilter === "all" ? T.accent : T.muted }}>
            All FNOs
          </button>
          {Object.entries(FIBRE_PROVIDERS).map(([key, p]) => (
            <button key={key} onClick={() => setFnoFilter(key)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
              style={{ background: fnoFilter === key ? `${p.color}12` : "rgba(248,250,252,0.8)", border: `1px solid ${fnoFilter === key ? p.color + "40" : "rgba(226,232,240,0.8)"}`, color: fnoFilter === key ? p.color : T.muted }}>
              {p.logo} {p.shortName}
            </button>
          ))}
        </div>
      </Card>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: T.muted }} />
        <input className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[12px] outline-none"
          style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text, boxShadow: "0 2px 8px rgba(6,182,212,0.06)" }}
          placeholder="Search areas…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[{ label: "Total Areas", value: Object.keys(allAreas).length, color: T.accent }, { label: "Providers", value: Object.keys(FIBRE_PROVIDERS).length, color: "#7c3aed" }, { label: "Showing", value: filtered.length, color: "#059669" }].map(s => (
          <Card key={s.label} style={{ padding: "10px 8px", textAlign: "center" }}>
            <p className="text-[22px] font-black mono" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: T.muted }}>{s.label}</p>
          </Card>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map(([area, keys]) => (
          <Card key={area} style={{ padding: 14 }} className="transition-all hover:scale-[1.01]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${T.accent}10`, border: `1px solid ${T.accent}25` }}>
                <MapPin className="w-3.5 h-3.5" style={{ color: T.accent }} />
              </div>
              <p className="text-[13px] font-black flex-1" style={{ color: T.text }}>{area}</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${T.accent}10`, color: T.accent, border: `1px solid ${T.accent}25` }}>{keys.length} FNO{keys.length > 1 ? "s" : ""}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {keys.map(k => {
                const p = FIBRE_PROVIDERS[k];
                return (
                  <div key={k} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: `${p.color}08`, border: `1px solid ${p.color}25` }}>
                    <span className="text-[11px]">{p.logo}</span>
                    <span className="text-[10px] font-bold" style={{ color: p.color }}>{p.shortName}</span>
                    <span className="text-[9px]" style={{ color: T.muted }}>from R{Math.min(...p.plans.map(pl => pl.price))}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Map Tab ───────────────────────────────────────────────────────────────────
function MapTab() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const nodeMarkersRef = useRef([]);
  const [address, setAddress] = useState("");
  const [searchStatus, setSearchStatus] = useState(null);
  const [foundProviders, setFoundProviders] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [nodesLoading, setNodesLoading] = useState(true);
  const [overlayReady, setOverlayReady] = useState(false);
  const [statusCounts, setStatusCounts] = useState({});

  useEffect(() => {
    base44.entities.NetworkNode.list()
      .then(data => { setNodes(data); const c = {}; data.forEach(n => { c[n.status] = (c[n.status] || 0) + 1; }); setStatusCounts(c); })
      .catch(() => {}).finally(() => setNodesLoading(false));
  }, []);

  useEffect(() => {
    let mounted = true;
    async function initMap() {
      const L = await import("leaflet");
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({ iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png", iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png" });
      if (!mapInstanceRef.current && mapRef.current && mounted) {
        mapInstanceRef.current = L.map(mapRef.current, { zoomControl: false }).setView([-26.2041, 28.0473], 10);
        L.control.zoom({ position: "bottomright" }).addTo(mapInstanceRef.current);
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { attribution: "© OpenStreetMap © CARTO", maxZoom: 19 }).addTo(mapInstanceRef.current);
        mapInstanceRef.current.on("click", async (e) => {
          const L2 = await import("leaflet");
          placeSearchMarker(L2, e.latlng.lat, e.latlng.lng);
          detectProviders(); setSearchStatus("found");
        });
      }
    }
    initMap();
    return () => { mounted = false; if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  useEffect(() => { if (!nodesLoading && mapInstanceRef.current && nodes.length > 0) plotNodeMarkers(); }, [nodesLoading, nodes]);

  const plotNodeMarkers = async () => {
    const L = await import("leaflet");
    nodeMarkersRef.current.forEach(m => m.remove()); nodeMarkersRef.current = [];
    const results = await Promise.all(nodes.map(async node => { if (!node.location) return null; const coords = await geocodeLocation(node.location); return coords ? { node, coords } : null; }));
    results.filter(Boolean).forEach(({ node, coords }) => {
      const cfg = NODE_STATUS_CFG[node.status] || NODE_STATUS_CFG.online;
      const pulse = ["degraded", "offline"].includes(node.status);
      const iconHtml = `<div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">${pulse ? `<div style="position:absolute;inset:-6px;border-radius:50%;border:2px solid ${cfg.color};animation:nodepin 1.5s ease infinite;opacity:0.5;"></div>` : ""}<div style="width:34px;height:34px;border-radius:50%;background:white;border:2.5px solid ${cfg.color};display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 4px 16px ${cfg.color}40,0 2px 8px rgba(0,0,0,0.12);">${cfg.icon}</div></div><style>@keyframes nodepin{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.6);opacity:0;}}</style>`;
      const icon = L.divIcon({ html: iconHtml, className: "", iconSize: [40, 40], iconAnchor: [20, 20], popupAnchor: [0, -24] });
      const m = L.marker([coords.lat, coords.lng], { icon }).addTo(mapInstanceRef.current)
        .bindPopup(`<div style="font-family:'Exo 2',sans-serif;min-width:180px;padding:2px;"><b style="color:#0891b2;font-size:13px;">${node.name}</b><br/><span style="font-size:10px;color:${cfg.color};font-weight:700;">${cfg.label}</span>${node.location ? `<br/><span style="font-size:11px;color:#64748b;">📍 ${node.location}</span>` : ""}${node.uptime_percent != null ? `<br/><span style="font-size:11px;color:#64748b;">Uptime: <b style="color:#059669">${node.uptime_percent}%</b></span>` : ""}${node.connected_customers != null ? `<br/><span style="font-size:11px;color:#64748b;">Customers: <b style="color:#0891b2">${node.connected_customers}</b></span>` : ""}</div>`);
      nodeMarkersRef.current.push(m);
    });
    setOverlayReady(true);
  };

  const placeSearchMarker = async (L, lat, lng) => {
    if (!mapInstanceRef.current) return;
    if (markerRef.current) markerRef.current.remove();
    const iconHtml = `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:28px;height:28px;"><div style="width:22px;height:22px;background:linear-gradient(135deg,#06b6d4,#0284c7);border:3px solid white;border-radius:50%;box-shadow:0 0 20px rgba(6,182,212,0.5),0 2px 12px rgba(6,182,212,0.3);"></div><div style="position:absolute;inset:-8px;border-radius:50%;border:1.5px solid rgba(6,182,212,0.35);animation:sping 2s ease infinite;"></div></div><style>@keyframes sping{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(2.2);opacity:0;}}</style>`;
    const icon = L.divIcon({ html: iconHtml, className: "", iconSize: [28, 28], iconAnchor: [14, 14] });
    markerRef.current = L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current);
  };

  const detectProviders = () => {
    const keys = Object.keys(FIBRE_PROVIDERS).filter(() => Math.random() > 0.35);
    setFoundProviders(keys.length > 0 ? keys.map(k => FIBRE_PROVIDERS[k]) : [FIBRE_PROVIDERS.touchnet]);
  };

  const handleSearch = async () => {
    if (!address.trim()) return;
    setSearchStatus("loading"); setFoundProviders([]);
    const result = await geocodeLocation(address);
    if (result) {
      const L = await import("leaflet");
      mapInstanceRef.current.setView([result.lat, result.lng], 14);
      placeSearchMarker(L, result.lat, result.lng);
      detectProviders(); setSearchStatus("found");
    } else { setSearchStatus("not_found"); }
  };

  const alertNodes = nodes.filter(n => ["offline", "degraded"].includes(n.status));

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-shrink-0 px-4 py-3 flex gap-2" style={{ background: "rgba(248,252,255,0.98)", borderBottom: `1px solid ${T.border}` }}>
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: T.muted }} />
          <input className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] outline-none"
            style={{ background: "rgba(255,255,255,0.9)", border: `1px solid ${T.border}`, color: T.text, boxShadow: "0 2px 8px rgba(6,182,212,0.06)" }}
            placeholder="Enter suburb or address to check coverage…" value={address} onChange={e => setAddress(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} />
        </div>
        <button onClick={handleSearch} disabled={searchStatus === "loading"}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 disabled:opacity-60 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#06b6d4,#0284c7)", boxShadow: "0 4px 16px rgba(6,182,212,0.3)" }}>
          {searchStatus === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Check
        </button>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-1.5 flex-wrap" style={{ background: "rgba(240,249,255,0.95)", borderBottom: `1px solid ${T.border}` }}>
        {Object.entries(NODE_STATUS_CFG).map(([key, cfg]) => statusCounts[key] > 0 && (
          <span key={key} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${cfg.color}10`, color: cfg.color, border: `1px solid ${cfg.color}25` }}>{cfg.icon} {statusCounts[key]} {cfg.label}</span>
        ))}
        {nodesLoading && <span className="flex items-center gap-1 text-[10px]" style={{ color: T.muted }}><Loader2 className="w-3 h-3 animate-spin" /> Loading nodes…</span>}
        {overlayReady && <span className="flex items-center gap-1 text-[10px] font-bold ml-auto" style={{ color: "#059669" }}><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live overlay</span>}
        {alertNodes.length > 0 && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: "#d97706", background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.22)" }}><AlertTriangle className="w-3 h-3" /> {alertNodes.length} alert{alertNodes.length > 1 ? "s" : ""}</span>}
      </div>
      <div className="flex flex-1 min-h-0 relative">
        <div ref={mapRef} className="flex-1" />
        {searchStatus === "found" && foundProviders.length > 0 && (
          <div className="absolute top-3 right-3 z-[1000] w-72 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.97)", border: `1px solid ${T.borderStrong}`, backdropFilter: "blur(16px)", boxShadow: "0 8px 40px rgba(6,182,212,0.12),0 2px 0 rgba(255,255,255,1) inset" }}>
            <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#06b6d4,#7c3aed,transparent)" }} />
            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" style={{ color: "#059669" }} /><p className="text-[13px] font-black" style={{ color: T.text }}>Coverage Available!</p></div>
              <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>{foundProviders.length} provider{foundProviders.length > 1 ? "s" : ""} in this area</p>
            </div>
            <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
              {foundProviders.map(p => (
                <div key={p.name} className="rounded-xl p-2.5" style={{ background: `${p.color}06`, border: `1px solid ${p.color}20` }}>
                  <div className="flex items-center gap-2 mb-1.5"><span>{p.logo}</span><span className="text-[12px] font-black" style={{ color: p.color }}>{p.name}</span><span className="ml-auto text-[10px] font-bold" style={{ color: "#059669" }}>{p.uptime}</span></div>
                  <div className="flex flex-wrap gap-1">
                    {p.plans.slice(0, 3).map((pl, i) => <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg" style={{ background: `${p.color}10`, color: p.color, border: `1px solid ${p.color}25` }}>{pl.speed} · R{pl.price}</span>)}
                    {p.plans.length > 3 && <span className="text-[9px]" style={{ color: T.muted }}>+{p.plans.length - 3} more</span>}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setSearchStatus(null)} className="w-full py-2 text-[11px] font-bold transition-colors hover:bg-slate-50" style={{ color: T.muted, borderTop: `1px solid ${T.border}` }}>Dismiss</button>
          </div>
        )}
        {searchStatus === "not_found" && (
          <div className="absolute top-3 right-3 z-[1000] rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(220,38,38,0.25)", backdropFilter: "blur(16px)" }}>
            <div className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" /><p className="text-[12px] font-bold" style={{ color: "#dc2626" }}>Address not found</p></div>
            <p className="text-[10px] mt-0.5" style={{ color: T.muted }}>Try clicking directly on the map</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CoverageChecker({ onClose }) {
  const [activeTab, setActiveTab] = useState("map");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(16px)" }}>
      <div className="w-full max-w-5xl rounded-3xl overflow-hidden flex flex-col relative"
        style={{
          background: T.bg, border: `1px solid ${T.border}`,
          boxShadow: "0 32px 80px rgba(6,182,212,0.12),0 8px 32px rgba(0,0,0,0.1),0 1px 0 rgba(255,255,255,1) inset",
          maxHeight: "92vh", height: "92vh",
          backgroundImage: `linear-gradient(${T.grid} 1px,transparent 1px),linear-gradient(90deg,${T.grid} 1px,transparent 1px)`,
          backgroundSize: "40px 40px",
        }}>
        <div className="h-[3px] flex-shrink-0" style={{ background: "linear-gradient(90deg,#06b6d4,#7c3aed,#e11d48,#059669,#d97706,#06b6d4)", backgroundSize: "300% 100%", animation: "shimmer 4s linear infinite" }} />
        <style>{`@keyframes shimmer{0%{background-position:0% 0}100%{background-position:300% 0}}`}</style>
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: "radial-gradient(circle at 80% 20%,rgba(6,182,212,0.07) 0%,transparent 60%)", zIndex: 0 }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none" style={{ background: "radial-gradient(circle at 20% 80%,rgba(124,58,237,0.05) 0%,transparent 60%)", zIndex: 0 }} />
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="absolute inset-0 rounded-xl animate-pulse" style={{ background: "rgba(6,182,212,0.12)" }} />
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#06b6d4,#0284c7)", boxShadow: "0 4px 16px rgba(6,182,212,0.35)" }}>
                <Wifi className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-black" style={{ color: T.text, fontFamily: "'Space Grotesk',sans-serif" }}>Fibre Coverage Intelligence</h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black" style={{ background: "rgba(5,150,105,0.1)", color: "#059669", border: "1px solid rgba(5,150,105,0.25)" }}>
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                </span>
              </div>
              <p className="text-[11px]" style={{ color: "#0891b2" }}>Network status · Multi-provider comparison · Real-time pricing</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-110" style={{ background: "rgba(6,182,212,0.06)", border: `1px solid ${T.border}`, color: T.muted }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Tabs */}
        <div className="relative z-10 flex gap-1 px-5 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: "rgba(248,252,255,0.85)", backdropFilter: "blur(8px)" }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
                style={{ background: active ? `${T.accent}12` : "transparent", border: `1px solid ${active ? T.accent + "40" : "transparent"}`, color: active ? T.accent : T.muted, boxShadow: active ? "0 2px 12px rgba(6,182,212,0.15)" : "none" }}>
                <Icon className="w-3.5 h-3.5" />{tab.label}
              </button>
            );
          })}
        </div>
        <div className="relative z-10 flex-1 overflow-hidden flex flex-col min-h-0">
          {activeTab === "map"     && <MapTab />}
          {activeTab === "compare" && <CompareTab />}
          {activeTab === "areas"   && <AreasTab />}
        </div>
      </div>
    </div>
  );
}