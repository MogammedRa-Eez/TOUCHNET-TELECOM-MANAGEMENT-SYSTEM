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
    id: "touchnet", name: "TouchNet", color: "#a855f7", logo: "🔮", glowColor: "rgba(168,85,247,0.4)",
    zones: [
      { lat: -26.1041, lng: 28.1073, label: "Sandton",       radius: 10000 },
      { lat: -26.0274, lng: 28.1527, label: "Fourways",      radius: 9000  },
      { lat: -25.8579, lng: 28.1893, label: "Centurion",     radius: 11000 },
      { lat: -26.0765, lng: 28.0556, label: "Randburg",      radius: 9000  },
      { lat: -25.9025, lng: 28.4211, label: "Kempton Park",  radius: 9000  },
      { lat: -25.7479, lng: 28.2293, label: "Pretoria East", radius: 11000 },
      { lat: -26.2041, lng: 28.0473, label: "JHB South",     radius: 10000 },
      { lat: -26.1367, lng: 28.2411, label: "Bedfordview",   radius: 8000  },
      { lat: -26.2309, lng: 28.2772, label: "Alberton",      radius: 8000  },
      { lat: -33.9249, lng: 18.4241, label: "Cape Town CBD", radius: 10000 },
      { lat: -29.8587, lng: 31.0218, label: "Durban North",  radius: 10000 },
      { lat: -29.1197, lng: 26.2140, label: "Bloemfontein",  radius: 9000  },
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
  dark_blue: { label: "Dark",      icon: "🌌", url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",                                 attribution: "&copy; OpenStreetMap &copy; CARTO" },
  light:     { label: "Light",     icon: "☀️", url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",                                attribution: "&copy; OpenStreetMap &copy; CARTO" },
  voyager:   { label: "Street",    icon: "🗺️", url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",                      attribution: "&copy; OpenStreetMap &copy; CARTO" },
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
  const [address, setAddress]         = useState("");
  const [searching, setSearching]     = useState(false);
  const [results, setResults]         = useState([]);
  const [flyTo, setFlyTo]             = useState(null);
  const [markerPos, setMarkerPos]     = useState(null);
  const [error, setError]             = useState(null);
  const [activeProviders, setActive]  = useState(Object.keys(PROVIDERS));
  const [showCompare, setShowCompare] = useState(false);
  const [mapStyle, setMapStyle]       = useState("dark_blue");

  const available = results.filter(r => r.covered);

  const toggleProvider = (id) =>
    setActive(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    setSearching(true); setError(null); setResults([]);
    try {
      const res = await fetch(
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
      style={{ background: "rgba(8,5,16,0.95)", backdropFilter: "blur(20px)" }}>

      <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: "linear-gradient(160deg,#0a0d15 0%,#0e0a1e 100%)",
          border: "1px solid rgba(16,185,129,0.25)",
          boxShadow: "0 32px 80px rgba(16,185,129,0.15), 0 0 0 1px rgba(168,85,247,0.1)",
          height: "88vh", maxHeight: 680,
        }}>

        <div className="h-[2px] flex-shrink-0" style={{ background: "linear-gradient(90deg,#10b981,#34d399,#a855f7,#e879f9,#dc2626,transparent)", boxShadow: "0 0 14px rgba(16,185,129,0.5)" }} />

        <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0 relative z-10"
          style={{ borderBottom: "1px solid rgba(16,185,129,0.15)", background: "rgba(16,185,129,0.05)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 4px 20px rgba(16,185,129,0.5)" }}>
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-black" style={{ color: "#6ee7b7" }}>Coverage Intelligence Map</h2>
              <p className="text-[10px]" style={{ color: "rgba(110,231,183,0.5)", fontFamily: "monospace" }}>
                {Object.keys(PROVIDERS).length} providers · Real-time check
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all"
            style={{ border: "1px solid rgba(16,185,129,0.25)" }}>
            <X className="w-4 h-4" style={{ color: "#6ee7b7" }} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden relative z-10">
          {/* Sidebar */}
          <div className="w-56 flex-shrink-0 flex flex-col overflow-y-auto"
            style={{ borderRight: "1px solid rgba(16,185,129,0.12)", background: "rgba(8,5,16,0.92)" }}>

            {/* Search */}
            <div className="p-3" style={{ borderBottom: "1px solid rgba(16,185,129,0.1)" }}>
              <form onSubmit={handleSearch} className="space-y-2">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#10b981" }} />
                  <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter address…"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[12px] outline-none"
                    style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.25)", color: "#e9d5ff" }} />
                </div>
                <button type="submit" disabled={searching || !address.trim()}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 4px 18px rgba(16,185,129,0.4)" }}>
                  {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  {searching ? "Scanning…" : "Check Coverage"}
                </button>
              </form>
              {error && <p className="text-[10px] mt-2" style={{ color: "#fca5a5" }}>{error}</p>}
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="p-3 space-y-2" style={{ borderBottom: "1px solid rgba(16,185,129,0.1)" }}>
                <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(110,231,183,0.6)" }}>Coverage Results</p>
                {results.map(({ provider, covered, zone }) => (
                  <div key={provider.id} className="flex items-center gap-2 px-2 py-1.5 rounded-xl"
                    style={{ background: covered ? `${provider.color}12` : "rgba(255,255,255,0.02)", border: `1px solid ${covered ? provider.color + "35" : "rgba(255,255,255,0.05)"}` }}>
                    <span className="text-base">{provider.logo}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold truncate" style={{ color: covered ? "#e9d5ff" : "#4b5563" }}>{provider.name}</p>
                      {covered && <p className="text-[9px]" style={{ color: provider.color }}>✓ {zone?.label}</p>}
                    </div>
                    {covered
                      ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: provider.color }} />
                      : <XCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#374151" }} />}
                  </div>
                ))}
                {available.length > 1 && (
                  <button onClick={() => setShowCompare(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-black text-white transition-all hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 16px rgba(168,85,247,0.4)" }}>
                    <BarChart3 className="w-3.5 h-3.5" /> Compare Plans
                  </button>
                )}
                {available.some(r => r.provider.id === "touchnet") && (
                  <a href="/CoverageCheck"
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-black text-white transition-all hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 4px 16px rgba(16,185,129,0.4)", textDecoration: "none", display: "flex" }}>
                    <Zap className="w-3.5 h-3.5" /> Sign Up Now
                  </a>
                )}
              </div>
            )}

            {/* Map style */}
            <div className="p-3" style={{ borderBottom: "1px solid rgba(16,185,129,0.1)" }}>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: "rgba(110,231,183,0.6)" }}>Map View</p>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(MAP_STYLES).map(([key, style]) => (
                  <button key={key} onClick={() => setMapStyle(key)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                    style={{
                      background: mapStyle === key ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${mapStyle === key ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.05)"}`,
                      color: mapStyle === key ? "#6ee7b7" : "#4b5563",
                    }}>
                    <span>{style.icon}</span> {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Layer toggles */}
            <div className="p-3 flex-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: "rgba(110,231,183,0.6)" }}>Map Layers</p>
              <div className="space-y-1.5">
                {Object.values(PROVIDERS).map(p => (
                  <button key={p.id} onClick={() => toggleProvider(p.id)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-xl transition-all"
                    style={{ background: activeProviders.includes(p.id) ? `${p.color}10` : "transparent", border: `1px solid ${activeProviders.includes(p.id) ? p.color + "30" : "rgba(255,255,255,0.04)"}` }}>
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all"
                      style={{
                        background: activeProviders.includes(p.id) ? p.color : "#1f2937",
                        border: `1.5px solid ${p.color}`,
                        boxShadow: activeProviders.includes(p.id) ? `0 0 10px ${p.glowColor}` : "none",
                      }} />
                    <span className="text-[11px] font-bold" style={{ color: activeProviders.includes(p.id) ? "#d8b4fe" : "#4b5563" }}>
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
                    pathOptions={{ color: available.length > 0 ? "#10b981" : "#dc2626", fillColor: available.length > 0 ? "#10b981" : "#dc2626", fillOpacity: 0.2, weight: 2, dashArray: "5,5" }} />
                  <Circle center={markerPos} radius={1400}
                    pathOptions={{ color: available.length > 0 ? "#10b981" : "#dc2626", fillColor: "transparent", weight: 1, opacity: 0.3 }} />
                  <Marker position={markerPos}>
                    <Popup>
                      <p style={{ fontWeight: 900, fontSize: 12, marginBottom: 4, color: "#1e293b" }}>📍 Your Location</p>
                      {available.length > 0
                        ? <p style={{ color: "#10b981", fontSize: 11, fontWeight: 700 }}>✓ {available.length} provider{available.length > 1 ? "s" : ""} available</p>
                        : <p style={{ color: "#dc2626", fontSize: 11 }}>No coverage yet</p>}
                    </Popup>
                  </Marker>
                </>
              )}
            </MapContainer>

            {results.length > 0 && (
              <div className="absolute bottom-10 right-3 z-[999] rounded-xl px-3 py-2"
                style={{ background: "rgba(10,13,21,0.97)", border: `1px solid ${available.length > 0 ? "rgba(16,185,129,0.4)" : "rgba(220,38,38,0.35)"}`, backdropFilter: "blur(12px)" }}>
                <div className="flex items-center gap-2">
                  {available.length > 0
                    ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
                    : <XCircle className="w-3.5 h-3.5" style={{ color: "#dc2626" }} />}
                  <span className="text-[11px] font-bold" style={{ color: available.length > 0 ? "#34d399" : "#f87171" }}>
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
          style={{ background: "rgba(8,5,16,0.97)", backdropFilter: "blur(24px)" }}>
          <div className="w-full max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden flex flex-col"
            style={{ background: "linear-gradient(160deg,#0a0d15,#0e0a1e)", border: "1px solid rgba(16,185,129,0.25)", boxShadow: "0 32px 80px rgba(16,185,129,0.15)" }}>
            <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#10b981,#34d399,#a855f7,#e879f9,#dc2626,transparent)" }} />
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(16,185,129,0.15)" }}>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5" style={{ color: "#10b981" }} />
                <div>
                  <h3 className="text-[15px] font-black" style={{ color: "#6ee7b7" }}>Plan Comparison</h3>
                  <p className="text-[10px]" style={{ color: "rgba(110,231,183,0.5)" }}>{available.length} providers available</p>
                </div>
              </div>
              <button onClick={() => setShowCompare(false)} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10">
                <X className="w-4 h-4" style={{ color: "#6ee7b7" }} />
              </button>
            </div>
            <div className="overflow-auto flex-1 p-5">
              <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Provider", "Plan", "Download", "Price/mo", "Value"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-[9px] font-black uppercase tracking-wider"
                        style={{ color: "rgba(110,231,183,0.7)", borderBottom: "1px solid rgba(16,185,129,0.15)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {available.flatMap(({ provider }) =>
                    provider.plans.map((plan, pi) => {
                      const vs = Math.round((parseInt(plan.speed) / plan.price) * 100);
                      return (
                        <tr key={`${provider.id}-${pi}`} style={{ borderBottom: "1px solid rgba(16,185,129,0.06)" }}
                          className="transition-all hover:bg-white/[0.02]">
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">{provider.logo}</span>
                              <span className="text-[11px] font-bold" style={{ color: provider.color }}>{provider.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-[12px] font-bold" style={{ color: "rgba(216,180,254,0.7)" }}>{plan.label}</td>
                          <td className="px-3 py-2.5 text-[13px] font-black mono" style={{ color: "#e9d5ff" }}>{plan.speed}</td>
                          <td className="px-3 py-2.5 text-[14px] font-black" style={{ color: provider.color }}>R{plan.price}</td>
                          <td className="px-3 py-2.5">
                            <div className="w-12 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                              <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, vs / 4)}%`, background: vs > 40 ? "#10b981" : vs > 20 ? "#f59e0b" : "#dc2626" }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(16,185,129,0.12)" }}>
                <a href="/CoverageCheck"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[12px] font-black text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 4px 20px rgba(16,185,129,0.4)", textDecoration: "none" }}>
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