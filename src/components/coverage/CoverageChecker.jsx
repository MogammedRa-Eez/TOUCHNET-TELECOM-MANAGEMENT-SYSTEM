import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Popup, ZoomControl, useMap, Marker, LayerGroup } from "react-leaflet";
import L from "leaflet";
import { X, MapPin, Search, Loader2, CheckCircle2, XCircle, BarChart3, Zap, ArrowUpRight, Globe } from "lucide-react";
import { base44 } from "@/api/base44Client";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const PROVIDERS = {
  touchnet: {
    id: "touchnet", name: "TouchNet", color: "#38bdf8", logo: "🔮", glowColor: "rgba(56,189,248,0.4)",
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton",      radius: 10000 },
      { lat: -26.0274, lng: 28.1527, label: "Fourways",     radius: 9000  },
      { lat: -25.8579, lng: 28.1893, label: "Centurion",    radius: 11000 },
      { lat: -26.0765, lng: 28.0556, label: "Randburg",     radius: 9000  },
      { lat: -25.9025, lng: 28.4211, label: "Kempton Park", radius: 9000  },
      { lat: -25.7479, lng: 28.2293, label: "Pretoria East",radius: 11000 },
      { lat: -26.2041, lng: 28.0473, label: "JHB South",   radius: 10000 },
      { lat: -26.1367, lng: 28.2411, label: "Bedfordview",  radius: 8000  },
      { lat: -26.2309, lng: 28.2772, label: "Alberton",     radius: 8000  },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town CBD",radius: 10000 },
      { lat: -29.8587, lng: 31.0218, label: "Durban North", radius: 10000 },
      { lat: -29.1197, lng: 26.2140, label: "Bloemfontein", radius: 9000  },
    ],
    plans: [
      { label: "Basic",      speed: "10 Mbps",  price: 399  },
      { label: "Standard",   speed: "50 Mbps",  price: 599  },
      { label: "Premium",    speed: "100 Mbps", price: 899  },
      { label: "Enterprise", speed: "500 Mbps", price: 1499 },
      { label: "Gigabit",    speed: "1 Gbps",   price: 2999 },
    ],
  },
  openserve: {
    id: "openserve", name: "Openserve", color: "#06b6d4", logo: "🌐", glowColor: "rgba(6,182,212,0.35)",
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton",      radius: 12000 },
      { lat: -25.7479, lng: 28.2293, label: "Pretoria",     radius: 15000 },
      { lat: -26.2041, lng: 28.0473, label: "Johannesburg", radius: 14000 },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town",    radius: 13000 },
      { lat: -29.8587, lng: 31.0218, label: "Durban",       radius: 12000 },
    ],
    plans: [
      { label: "Lite", speed: "10 Mbps",  price: 349  },
      { label: "Home", speed: "50 Mbps",  price: 549  },
      { label: "Fast", speed: "100 Mbps", price: 799  },
      { label: "Giga", speed: "1 Gbps",   price: 2699 },
    ],
  },
  vumatel: {
    id: "vumatel", name: "Vumatel", color: "#f59e0b", logo: "⚡", glowColor: "rgba(245,158,11,0.35)",
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton",   radius: 8000 },
      { lat: -26.0274, lng: 28.1527, label: "Fourways",  radius: 7500 },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town", radius: 9000 },
      { lat: -26.0765, lng: 28.0556, label: "Randburg",  radius: 7000 },
    ],
    plans: [
      { label: "Basic", speed: "25 Mbps",  price: 459  },
      { label: "Value", speed: "50 Mbps",  price: 649  },
      { label: "Speed", speed: "200 Mbps", price: 1099 },
    ],
  },
  frogfoot: {
    id: "frogfoot", name: "Frogfoot", color: "#10b981", logo: "🐸", glowColor: "rgba(16,185,129,0.35)",
    zones: [
      { lat: -26.0274, lng: 28.1527, label: "Northriding",  radius: 7000 },
      { lat: -25.9025, lng: 28.4211, label: "Kempton Park", radius: 7500 },
      { lat: -26.2309, lng: 28.2772, label: "Alberton",     radius: 7000 },
      { lat: -26.1367, lng: 28.2411, label: "Bedfordview",  radius: 6500 },
    ],
    plans: [
      { label: "Starter", speed: "10 Mbps",  price: 299 },
      { label: "Home",    speed: "25 Mbps",  price: 449 },
      { label: "Fast",    speed: "100 Mbps", price: 749 },
    ],
  },
};

const MAP_STYLES = {
  dark_blue: { label: "Dark Blue", icon: "🌌", url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",                                                         attribution: "&copy; OpenStreetMap &copy; CARTO" },
  light:     { label: "Light",     icon: "☀️", url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",                                                        attribution: "&copy; OpenStreetMap &copy; CARTO" },
  voyager:   { label: "Street",    icon: "🗺️", url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",                                              attribution: "&copy; OpenStreetMap &copy; CARTO" },
  satellite: { label: "Satellite", icon: "🛰️", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attribution: "Tiles &copy; Esri" },
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
      if (haversineDistance(lat, lng, zone.lat, zone.lng) <= zone.radius)
        return { provider: p, covered: true, zone };
    }
    return { provider: p, covered: false, zone: null };
  });

function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords) map.flyTo(coords, 13, { duration: 1.4 }); }, [coords, map]);
  return null;
}

export default function CoverageChecker({ onClose }) {
  const [address, setAddress]        = useState("");
  const [searching, setSearching]    = useState(false);
  const [results, setResults]        = useState([]);
  const [flyTo, setFlyTo]            = useState(null);
  const [markerPos, setMarkerPos]    = useState(null);
  const [error, setError]            = useState(null);
  const [activeProviders, setActive] = useState(Object.keys(PROVIDERS));
  const [showCompare, setShowCompare]= useState(false);
  const [mapStyle, setMapStyle]      = useState("dark_blue");

  const available = results.filter(r => r.covered);

  const toggleProvider = (id) =>
    setActive(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    setSearching(true); setError(null); setResults([]);
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", South Africa")}&limit=1&countrycodes=za`,
        { headers: { "User-Agent": "TouchNet-CoverageCheck/1.0" } }
      );
      const data = await res.json();
      if (!data?.[0]) { setError("Address not found. Try a suburb or city."); return; }
      const lat = parseFloat(data[0].lat), lng = parseFloat(data[0].lon);
      const allResults = checkAllProviders(lat, lng);
      setResults(allResults);
      setFlyTo([lat, lng]);
      setMarkerPos([lat, lng]);
      base44.entities.CoverageSearch.create({
        query: address, display_name: data[0].display_name, lat, lng,
        covered: allResults.some(r => r.provider.id === "touchnet" && r.covered),
      }).catch(() => {});
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ background: "rgba(2,8,18,0.93)", backdropFilter: "blur(16px)" }}>

      <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col"
        style={{ background: "linear-gradient(160deg,#040e23 0%,#071428 100%)", border: "1px solid rgba(56,189,248,0.25)", boxShadow: "0 32px 80px rgba(56,189,248,0.18)", height: "88vh", maxHeight: 680 }}>

        <div className="h-[2px] flex-shrink-0" style={{ background: "linear-gradient(90deg,#0284c7,#38bdf8,#7dd3fc,#10b981,transparent)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(56,189,248,0.12)", background: "rgba(56,189,248,0.04)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#0284c7,#38bdf8)", boxShadow: "0 4px 16px rgba(56,189,248,0.4)" }}>
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-black" style={{ color: "#7dd3fc" }}>Coverage Intelligence Map</h2>
              <p className="text-[10px]" style={{ color: "rgba(147,210,255,0.45)", fontFamily: "monospace" }}>
                {Object.keys(PROVIDERS).length} providers · Real-time check
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
            <X className="w-4 h-4" style={{ color: "#38bdf8" }} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar */}
          <div className="w-56 flex-shrink-0 flex flex-col overflow-y-auto"
            style={{ borderRight: "1px solid rgba(56,189,248,0.12)", background: "rgba(4,14,35,0.9)" }}>

            {/* Search */}
            <div className="p-3" style={{ borderBottom: "1px solid rgba(56,189,248,0.08)" }}>
              <form onSubmit={handleSearch} className="space-y-2">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#38bdf8" }} />
                  <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter address…"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[12px] outline-none"
                    style={{ background: "rgba(56,189,248,0.07)", border: "1px solid rgba(56,189,248,0.22)", color: "#e0f2fe" }} />
                </div>
                <button type="submit" disabled={searching || !address.trim()}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#0284c7,#38bdf8)", boxShadow: "0 4px 14px rgba(56,189,248,0.35)" }}>
                  {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  {searching ? "Scanning…" : "Check"}
                </button>
              </form>
              {error && <p className="text-[10px] mt-2" style={{ color: "#f59e0b" }}>{error}</p>}
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="p-3 space-y-2" style={{ borderBottom: "1px solid rgba(56,189,248,0.08)" }}>
                <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(147,210,255,0.45)" }}>Coverage Results</p>
                {results.map(({ provider, covered, zone }) => (
                  <div key={provider.id} className="flex items-center gap-2 px-2 py-1.5 rounded-xl"
                    style={{ background: covered ? `${provider.color}12` : "rgba(255,255,255,0.02)", border: `1px solid ${covered ? provider.color + "30" : "rgba(255,255,255,0.05)"}` }}>
                    <span className="text-base">{provider.logo}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold truncate" style={{ color: covered ? "#e0f2fe" : "#334155" }}>{provider.name}</p>
                      {covered && <p className="text-[9px]" style={{ color: provider.color }}>✓ {zone?.label}</p>}
                    </div>
                    {covered
                      ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: provider.color }} />
                      : <XCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#334155" }} />}
                  </div>
                ))}
                {available.length > 1 && (
                  <button onClick={() => setShowCompare(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-black text-white transition-all hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg,#0284c7,#38bdf8)", boxShadow: "0 4px 12px rgba(56,189,248,0.35)" }}>
                    <BarChart3 className="w-3.5 h-3.5" /> Compare Plans
                  </button>
                )}
                {available.some(r => r.provider.id === "touchnet") && (
                  <a href="/CoverageCheck"
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-black text-white transition-all hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 4px 12px rgba(16,185,129,0.35)", textDecoration: "none", display: "flex" }}>
                    <Zap className="w-3.5 h-3.5" /> Sign Up Now
                  </a>
                )}
              </div>
            )}

            {/* Map style switcher */}
            <div className="p-3" style={{ borderBottom: "1px solid rgba(56,189,248,0.08)" }}>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: "rgba(147,210,255,0.45)" }}>Map View</p>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(MAP_STYLES).map(([key, style]) => (
                  <button key={key} onClick={() => setMapStyle(key)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                    style={{
                      background: mapStyle === key ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${mapStyle === key ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.05)"}`,
                      color: mapStyle === key ? "#7dd3fc" : "#475569",
                    }}>
                    <span>{style.icon}</span> {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Layer toggles */}
            <div className="p-3 flex-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: "rgba(147,210,255,0.45)" }}>Map Layers</p>
              <div className="space-y-1.5">
                {Object.values(PROVIDERS).map(p => (
                  <button key={p.id} onClick={() => toggleProvider(p.id)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-xl transition-all"
                    style={{ background: activeProviders.includes(p.id) ? `${p.color}10` : "transparent", border: `1px solid ${activeProviders.includes(p.id) ? p.color + "25" : "rgba(255,255,255,0.04)"}` }}>
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: activeProviders.includes(p.id) ? p.color : "#1e293b", border: `1.5px solid ${p.color}`, boxShadow: activeProviders.includes(p.id) ? `0 0 8px ${p.glowColor}` : "none" }} />
                    <span className="text-[11px] font-bold" style={{ color: activeProviders.includes(p.id) ? "#7dd3fc" : "#334155" }}>
                      {p.logo} {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            <MapContainer center={[-28.5, 25.5]} zoom={6} zoomControl={false} style={{ height: "100%", width: "100%" }}>
              <ZoomControl position="bottomright" />
              <TileLayer key={mapStyle} url={MAP_STYLES[mapStyle].url} attribution={MAP_STYLES[mapStyle].attribution} />
              {flyTo && <FlyTo coords={flyTo} />}

              {Object.values(PROVIDERS).map(provider =>
                activeProviders.includes(provider.id) ? (
                  <LayerGroup key={provider.id}>
                    {provider.zones.map((zone, i) => (
                      <Circle key={i} center={[zone.lat, zone.lng]} radius={zone.radius}
                        pathOptions={{ color: provider.color, fillColor: provider.color, fillOpacity: 0.12, weight: 1.5, dashArray: provider.id !== "touchnet" ? "4,4" : undefined }}>
                        <Popup>
                          <div style={{ fontFamily: "Inter,sans-serif", minWidth: 150 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                              <span style={{ fontSize: 16 }}>{provider.logo}</span>
                              <div>
                                <p style={{ fontWeight: 900, fontSize: 12, color: "#1e293b", margin: 0 }}>{provider.name}</p>
                                <p style={{ fontSize: 10, color: provider.color, margin: 0 }}>{zone.label}</p>
                              </div>
                            </div>
                            {provider.plans.slice(0, 2).map(pl => (
                              <div key={pl.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
                                <span style={{ color: "#334155" }}>{pl.speed}</span>
                                <span style={{ color: provider.color, fontWeight: 800 }}>R{pl.price}/mo</span>
                              </div>
                            ))}
                          </div>
                        </Popup>
                      </Circle>
                    ))}
                  </LayerGroup>
                ) : null
              )}

              {markerPos && (
                <>
                  <Circle center={markerPos} radius={600}
                    pathOptions={{ color: available.length > 0 ? "#10b981" : "#ef4444", fillColor: available.length > 0 ? "#10b981" : "#ef4444", fillOpacity: 0.2, weight: 2, dashArray: "5,5" }} />
                  <Circle center={markerPos} radius={1400}
                    pathOptions={{ color: available.length > 0 ? "#10b981" : "#ef4444", fillColor: "transparent", weight: 1, opacity: 0.3 }} />
                  <Marker position={markerPos}>
                    <Popup>
                      <p style={{ fontWeight: 900, fontSize: 12, marginBottom: 4, color: "#1e293b" }}>📍 Your Location</p>
                      {available.length > 0
                        ? <p style={{ color: "#10b981", fontSize: 11, fontWeight: 700 }}>✓ {available.length} provider{available.length > 1 ? "s" : ""} available</p>
                        : <p style={{ color: "#ef4444", fontSize: 11 }}>No coverage yet</p>}
                    </Popup>
                  </Marker>
                </>
              )}
            </MapContainer>

            {results.length > 0 && (
              <div className="absolute bottom-10 right-3 z-[999] rounded-xl px-3 py-2"
                style={{ background: "rgba(4,14,35,0.92)", border: `1px solid ${available.length > 0 ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, backdropFilter: "blur(10px)" }}>
                <div className="flex items-center gap-2">
                  {available.length > 0
                    ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
                    : <XCircle className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />}
                  <span className="text-[11px] font-bold" style={{ color: available.length > 0 ? "#10b981" : "#ef4444" }}>
                    {available.length > 0 ? `${available.length} available` : "No coverage"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison modal */}
      {showCompare && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: "rgba(2,8,18,0.95)", backdropFilter: "blur(20px)" }}>
          <div className="w-full max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden flex flex-col"
            style={{ background: "linear-gradient(160deg,#040e23,#071428)", border: "1px solid rgba(56,189,248,0.25)", boxShadow: "0 32px 80px rgba(56,189,248,0.2)" }}>
            <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#0284c7,#38bdf8,#10b981,transparent)" }} />
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(56,189,248,0.12)" }}>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5" style={{ color: "#38bdf8" }} />
                <div>
                  <h3 className="text-[15px] font-black" style={{ color: "#7dd3fc" }}>Plan Comparison</h3>
                  <p className="text-[10px]" style={{ color: "rgba(147,210,255,0.45)" }}>{available.length} providers available at your address</p>
                </div>
              </div>
              <button onClick={() => setShowCompare(false)} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10">
                <X className="w-4 h-4" style={{ color: "#38bdf8" }} />
              </button>
            </div>
            <div className="overflow-auto flex-1 p-5">
              <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Provider", "Plan", "Download", "Price/mo", "Value"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-[9px] font-black uppercase tracking-wider"
                        style={{ color: "rgba(147,210,255,0.45)", borderBottom: "1px solid rgba(56,189,248,0.12)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {available.flatMap(({ provider }) =>
                    provider.plans.map((plan, pi) => {
                      const vs = Math.round((parseInt(plan.speed) / plan.price) * 100);
                      return (
                        <tr key={`${provider.id}-${pi}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                          className="transition-all hover:bg-white/[0.02]">
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">{provider.logo}</span>
                              <span className="text-[11px] font-bold" style={{ color: provider.color }}>{provider.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-[12px] font-bold" style={{ color: "#94a3b8" }}>{plan.label}</td>
                          <td className="px-3 py-2.5 text-[13px] font-black" style={{ color: "#e0f2fe", fontFamily: "monospace" }}>{plan.speed}</td>
                          <td className="px-3 py-2.5 text-[14px] font-black" style={{ color: provider.color }}>R{plan.price}</td>
                          <td className="px-3 py-2.5">
                            <div className="w-12 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                              <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, vs / 4)}%`, background: vs > 40 ? "#10b981" : vs > 20 ? "#f59e0b" : "#ef4444" }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(56,189,248,0.1)" }}>
                <a href="/CoverageCheck"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[12px] font-black text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#0284c7,#38bdf8)", boxShadow: "0 4px 16px rgba(56,189,248,0.35)", textDecoration: "none" }}>
                  <ArrowUpRight className="w-4 h-4" /> Full Coverage Page & Sign Up
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}