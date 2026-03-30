import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, X } from "lucide-react";
import { Loader2 } from "lucide-react";

// Fix leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const FIBRE_PROVIDERS = [
  { id: "all",         label: "All Providers", color: null },
  { id: "dfa",         label: "DFA",           color: "#6366f1", description: "Enterprise dark fibre",    speeds: "Up to 10 Gbps"  },
  { id: "mfn",         label: "MFN",           color: "#10b981", description: "Metro fibre",              speeds: "Up to 1 Gbps"   },
  { id: "openfibre",   label: "Open Fibre",    color: "#f59e0b", description: "Open access fibre",        speeds: "Up to 500 Mbps" },
  { id: "vumatel",     label: "Vumatel",       color: "#ef4444", description: "Residential FTTH",         speeds: "Up to 200 Mbps" },
  { id: "frogfoot",    label: "Frogfoot",      color: "#06b6d4", description: "National FTTH",            speeds: "Up to 100 Mbps" },
  { id: "link_africa", label: "Link Africa",   color: "#f97316", description: "Fixed wireless & fibre",   speeds: "Up to 200 Mbps" },
];

const COVERAGE_ZONES = [
  { id: 1,  name: "Sandton CBD",         lat: -26.1076, lng: 28.0567, radius: 3500, providers: ["dfa","mfn","openfibre","vumatel"] },
  { id: 2,  name: "Johannesburg CBD",    lat: -26.2041, lng: 28.0473, radius: 4000, providers: ["dfa","mfn","frogfoot"] },
  { id: 3,  name: "Midrand",             lat: -25.9986, lng: 28.1284, radius: 4500, providers: ["dfa","vumatel","link_africa"] },
  { id: 4,  name: "Rosebank",            lat: -26.1467, lng: 28.0436, radius: 2500, providers: ["dfa","mfn","openfibre"] },
  { id: 5,  name: "Pretoria CBD",        lat: -25.7479, lng: 28.2293, radius: 5000, providers: ["dfa","mfn","frogfoot","vumatel"] },
  { id: 6,  name: "Centurion",           lat: -25.8603, lng: 28.1894, radius: 4000, providers: ["dfa","vumatel","openfibre"] },
  { id: 7,  name: "Fourways",            lat: -26.0203, lng: 28.0105, radius: 3000, providers: ["vumatel","frogfoot","openfibre"] },
  { id: 8,  name: "Randburg",            lat: -26.0927, lng: 27.9903, radius: 3500, providers: ["vumatel","link_africa","frogfoot"] },
  { id: 9,  name: "Kempton Park",        lat: -26.1003, lng: 28.2317, radius: 4000, providers: ["vumatel","link_africa","frogfoot"] },
  { id: 10, name: "Hatfield",            lat: -25.7470, lng: 28.2350, radius: 2500, providers: ["mfn","vumatel","openfibre"] },
];

function getDistKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function MapFlyTo({ position }) {
  const map = useMap();
  useEffect(() => { if (position) map.flyTo(position, 14, { duration: 1.2 }); }, [position]);
  return null;
}

export default function CoverageChecker({ onClose }) {
  const [query, setQuery]       = useState("");
  const [searching, setSearching] = useState(false);
  const [pin, setPin]           = useState(null);
  const [result, setResult]     = useState(null);
  const [filter, setFilter]     = useState("all");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResult(null);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", South Africa")}&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (!data.length) { setResult({ found: false }); setSearching(false); return; }
    const lat = parseFloat(data[0].lat), lng = parseFloat(data[0].lon);
    setPin([lat, lng]);
    const covered = COVERAGE_ZONES.filter(z => getDistKm(lat, lng, z.lat, z.lng) * 1000 <= z.radius);
    const allProviders = [...new Set(covered.flatMap(c => c.providers))];
    const nearest = COVERAGE_ZONES.reduce((a, z) => { const d = getDistKm(lat, lng, z.lat, z.lng); return d < a.d ? { z, d } : a; }, { z: null, d: Infinity });
    setResult({ found: true, inCoverage: covered.length > 0, zones: covered, allProviders, nearestName: nearest.z?.name, nearestKm: nearest.d });
    setSearching(false);
  };

  const visibleZones = filter === "all" ? COVERAGE_ZONES : COVERAGE_ZONES.filter(z => z.providers.includes(filter));

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", zIndex: 70000 }}>
      <div className="flex flex-col w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "white", maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[16px] font-black text-white">Fibre Coverage Checker</h2>
              <p className="text-[11px] text-white/70">Check available fibre at any address</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Search bar */}
        <div className="flex gap-2 px-5 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(226,232,240,0.8)", background: "#f8fafc" }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Search address e.g. Sandton City…"
            className="flex-1 px-3 py-2 rounded-xl text-[13px] outline-none"
            style={{ background: "white", border: "1px solid rgba(6,182,212,0.25)", color: "#1e293b" }}
          />
          <button onClick={handleSearch} disabled={searching}
            className="px-4 py-2 rounded-xl text-[13px] font-bold text-white flex items-center gap-2 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)" }}>
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            {searching ? "Searching…" : "Search"}
          </button>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-[12px] font-semibold outline-none"
            style={{ background: "white", border: "1px solid rgba(99,102,241,0.25)", color: "#4f46e5" }}>
            {FIBRE_PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>

        {/* Result banner */}
        {result && (
          <div className="flex-shrink-0 px-5 py-2.5"
            style={{
              background: result.inCoverage ? "rgba(16,185,129,0.06)" : result.found ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)",
              borderBottom: "1px solid rgba(226,232,240,0.6)",
            }}>
            {!result.found
              ? <p className="text-[12px] font-semibold text-amber-700">Address not found. Try a more specific address.</p>
              : result.inCoverage
                ? <p className="text-[13px] font-bold text-emerald-700">✓ Fibre Available — {result.allProviders.join(", ").toUpperCase()}</p>
                : <p className="text-[13px] font-bold text-red-600">✗ No coverage here. Nearest: {result.nearestName} ({result.nearestKm?.toFixed(1)} km away)</p>}
          </div>
        )}

        {/* Map */}
        <div className="flex-1 min-h-0" style={{ minHeight: 360 }}>
          <MapContainer center={[-26.0, 28.05]} zoom={10}
            style={{ height: "100%", width: "100%", minHeight: 360 }}
            scrollWheelZoom>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {pin && <MapFlyTo position={pin} />}
            {visibleZones.map(zone => {
              const p = filter !== "all"
                ? FIBRE_PROVIDERS.find(x => x.id === filter)
                : FIBRE_PROVIDERS.find(x => zone.providers.includes(x.id) && x.id !== "all");
              const color = p?.color || "#6366f1";
              return (
                <Circle key={zone.id} center={[zone.lat, zone.lng]} radius={zone.radius}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.12, weight: 1.5 }}>
                  <Popup>
                    <strong>{zone.name}</strong><br />
                    {zone.providers.map(pid => {
                      const pr = FIBRE_PROVIDERS.find(x => x.id === pid);
                      return pr ? `• ${pr.label} — ${pr.speeds}` : null;
                    }).filter(Boolean).join("\n")}
                  </Popup>
                </Circle>
              );
            })}
            {pin && <Marker position={pin}><Popup>{result?.inCoverage ? "✓ Fibre Available" : "✗ No coverage"}</Popup></Marker>}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}