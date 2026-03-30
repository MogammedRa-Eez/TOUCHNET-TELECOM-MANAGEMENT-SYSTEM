import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { X, MapPin, Search, Loader2, CheckCircle2, XCircle, ChevronDown, Wifi } from "lucide-react";

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const FIBRE_PROVIDERS = [
  { id: "all",         label: "All Providers",             color: null },
  { id: "dfa",         label: "DFA (Dark Fibre Africa)",   color: "#6366f1", description: "Enterprise-grade dark fibre infrastructure",  speeds: "Up to 10 Gbps"  },
  { id: "mfn",         label: "MFN (Metro Fibre Networx)", color: "#10b981", description: "Metro fibre across major business districts", speeds: "Up to 1 Gbps"   },
  { id: "openfibre",   label: "Open Fibre",                color: "#f59e0b", description: "Open access fibre network",                   speeds: "Up to 500 Mbps" },
  { id: "vumatel",     label: "Vumatel",                   color: "#ef4444", description: "Residential & business FTTH",                 speeds: "Up to 200 Mbps" },
  { id: "octotel",     label: "Octotel",                   color: "#8b5cf6", description: "Cape Town focused open fibre",                speeds: "Up to 1 Gbps"   },
  { id: "frogfoot",    label: "Frogfoot",                  color: "#06b6d4", description: "National FTTH open access network",           speeds: "Up to 100 Mbps" },
  { id: "link_africa", label: "Link Africa",               color: "#f97316", description: "Fixed wireless & fibre hybrid",               speeds: "Up to 200 Mbps" },
];

const COVERAGE_ZONES = [
  { id: 1,  name: "Sandton CBD",         lat: -26.1076, lng: 28.0567, radius: 3500, providers: ["dfa", "mfn", "openfibre", "vumatel"] },
  { id: 2,  name: "Johannesburg CBD",    lat: -26.2041, lng: 28.0473, radius: 4000, providers: ["dfa", "mfn", "frogfoot"] },
  { id: 3,  name: "Midrand",             lat: -25.9986, lng: 28.1284, radius: 4500, providers: ["dfa", "vumatel", "link_africa"] },
  { id: 4,  name: "Rosebank",            lat: -26.1467, lng: 28.0436, radius: 2500, providers: ["dfa", "mfn", "openfibre"] },
  { id: 5,  name: "Pretoria CBD",        lat: -25.7479, lng: 28.2293, radius: 5000, providers: ["dfa", "mfn", "frogfoot", "vumatel"] },
  { id: 6,  name: "Centurion",           lat: -25.8603, lng: 28.1894, radius: 4000, providers: ["dfa", "vumatel", "openfibre"] },
  { id: 7,  name: "Fourways",            lat: -26.0203, lng: 28.0105, radius: 3000, providers: ["vumatel", "frogfoot", "openfibre"] },
  { id: 8,  name: "Randburg",            lat: -26.0927, lng: 27.9903, radius: 3500, providers: ["vumatel", "link_africa", "frogfoot"] },
  { id: 9,  name: "Germiston",           lat: -26.2251, lng: 28.1686, radius: 3000, providers: ["dfa", "mfn", "openfibre"] },
  { id: 10, name: "Bedfordview",         lat: -26.1762, lng: 28.1377, radius: 2500, providers: ["dfa", "vumatel"] },
  { id: 11, name: "Woodmead",            lat: -26.0695, lng: 28.0982, radius: 2000, providers: ["dfa", "mfn", "openfibre"] },
  { id: 12, name: "Bryanston",           lat: -26.0699, lng: 28.0192, radius: 2500, providers: ["vumatel", "frogfoot"] },
  { id: 13, name: "Sunninghill",         lat: -26.0392, lng: 28.0827, radius: 2000, providers: ["dfa", "openfibre", "vumatel"] },
  { id: 14, name: "Kempton Park",        lat: -26.1003, lng: 28.2317, radius: 4000, providers: ["vumatel", "link_africa", "frogfoot"] },
  { id: 15, name: "Hatfield (Pretoria)", lat: -25.7470, lng: 28.2350, radius: 2500, providers: ["mfn", "vumatel", "openfibre"] },
];

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function checkCoverage(lat, lng) {
  const covered = [];
  let nearest = null;
  let nearestDist = Infinity;
  for (const zone of COVERAGE_ZONES) {
    const dist = getDistanceKm(lat, lng, zone.lat, zone.lng);
    const distM = dist * 1000;
    if (distM <= zone.radius) covered.push({ zone, distM });
    if (distM < nearestDist) { nearestDist = distM; nearest = { zone, distKm: dist }; }
  }
  return { covered, nearest };
}

function MapFlyTo({ position }) {
  const map = useMap();
  useEffect(() => { if (position) map.flyTo(position, 14, { duration: 1.2 }); }, [position]);
  return null;
}

function ProviderDropdown({ providers }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen(v => !v);
  };

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-provider-dropdown]")) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div data-provider-dropdown="true" className="relative inline-block">
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
        style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", color: "#6366f1" }}
      >
        <Wifi className="w-3 h-3" />
        {providers.length} Provider{providers.length !== 1 ? "s" : ""} Available
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div style={{
          position: "fixed",
          top: dropPos.top,
          left: dropPos.left,
          zIndex: 999999,
          background: "white",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 12,
          minWidth: 280,
          boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(226,232,240,0.8)", background: "#f8fafc" }}>
            <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", margin: 0 }}>
              Fibre Networks Available
            </p>
          </div>
          {providers.map(pid => {
            const p = FIBRE_PROVIDERS.find(x => x.id === pid);
            if (!p) return null;
            return (
              <div key={pid} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderBottom: "1px solid rgba(226,232,240,0.5)" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, flexShrink: 0, marginTop: 3 }} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", margin: 0 }}>{p.label}</p>
                  <p style={{ fontSize: 10, color: "#94a3b8", margin: "2px 0 0" }}>{p.description}</p>
                  <p style={{ fontSize: 10, fontWeight: 700, color: p.color, margin: "2px 0 0" }}>{p.speeds}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CoverageChecker({ onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [pinPosition, setPinPosition] = useState(null);
  const [coverageResult, setCoverageResult] = useState(null);
  const [filterProvider, setFilterProvider] = useState("all");

  const mapCenter = [-26.0, 28.05];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setCoverageResult(null);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ", South Africa")}&limit=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json();
    if (!data.length) {
      setCoverageResult({ found: false, error: "Address not found. Try a more specific address." });
      setSearching(false);
      return;
    }
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    setPinPosition([lat, lng]);
    const { covered, nearest } = checkCoverage(lat, lng);
    const allProviders = [...new Set(covered.flatMap(c => c.zone.providers))];
    setCoverageResult({ found: true, inCoverage: covered.length > 0, zones: covered.map(c => c.zone), allProviders, nearest: covered.length === 0 ? nearest : null });
    setSearching(false);
  };

  const visibleZones = filterProvider === "all" ? COVERAGE_ZONES : COVERAGE_ZONES.filter(z => z.providers.includes(filterProvider));

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", zIndex: 70000 }}>
      <div className="relative flex flex-col w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl" style={{ background: "white", maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[16px] font-black text-white">Fibre Coverage Checker</h2>
              <p className="text-[11px] text-white/70">Check available fibre networks at any address</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(226,232,240,0.8)", background: "#f8fafc" }}>
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Search an address e.g. Sandton City, Johannesburg…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] outline-none"
                style={{ background: "white", border: "1px solid rgba(6,182,212,0.25)", color: "#1e293b" }}
              />
            </div>
            <button onClick={handleSearch} disabled={searching}
              className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-white flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)", boxShadow: "0 3px 10px rgba(6,182,212,0.3)" }}>
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {searching ? "Searching…" : "Search"}
            </button>
          </div>
          <div className="relative flex-shrink-0">
            <select
              value={filterProvider}
              onChange={e => setFilterProvider(e.target.value)}
              className="w-full sm:w-auto h-[42px] pl-3 pr-8 rounded-xl text-[12px] font-semibold outline-none appearance-none cursor-pointer"
              style={{ background: "white", border: "1px solid rgba(99,102,241,0.25)", color: "#4f46e5" }}
            >
              {FIBRE_PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "#6366f1" }} />
          </div>
        </div>

        {/* Coverage result banner */}
        {coverageResult && (
          <div className="flex-shrink-0 px-5 py-3" style={{
            background: coverageResult.inCoverage ? "rgba(16,185,129,0.06)" : coverageResult.found ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)",
            borderBottom: "1px solid rgba(226,232,240,0.6)",
          }}>
            {!coverageResult.found ? (
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <p className="text-[12px] font-semibold text-amber-700">{coverageResult.error}</p>
              </div>
            ) : coverageResult.inCoverage ? (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <p className="text-[13px] font-bold text-emerald-700">
                    Fibre Available! — {coverageResult.zones.length} zone{coverageResult.zones.length > 1 ? "s" : ""} cover this address.
                  </p>
                </div>
                <ProviderDropdown providers={coverageResult.allProviders} />
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-[13px] font-bold text-red-600">No fibre coverage at this address yet.</p>
                </div>
                {coverageResult.nearest && (
                  <p className="text-[11px] text-slate-500 ml-6">
                    Nearest covered area: <strong className="text-slate-700">{coverageResult.nearest.zone.name}</strong> — {coverageResult.nearest.distKm.toFixed(1)} km away
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-2 px-5 py-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(226,232,240,0.6)", background: "rgba(248,250,252,0.7)" }}>
          {FIBRE_PROVIDERS.filter(p => p.id !== "all").map(p => (
            <div key={p.id} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
              <span className="text-[10px] font-semibold" style={{ color: "#64748b" }}>{p.label.split(" (")[0]}</span>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="flex-1 min-h-0" style={{ minHeight: 360 }}>
          <MapContainer center={mapCenter} zoom={10} style={{ height: "100%", width: "100%", minHeight: 360 }} scrollWheelZoom>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {pinPosition && <MapFlyTo position={pinPosition} />}
            {visibleZones.map(zone => {
              const primaryProvider = filterProvider !== "all"
                ? FIBRE_PROVIDERS.find(p => p.id === filterProvider)
                : FIBRE_PROVIDERS.find(p => zone.providers.includes(p.id) && p.id !== "all");
              const color = primaryProvider?.color || "#6366f1";
              return (
                <Circle key={zone.id} center={[zone.lat, zone.lng]} radius={zone.radius}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.12, weight: 1.5, opacity: 0.7 }}>
                  <Popup>
                    <div style={{ minWidth: 180 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: "#1e293b" }}>{zone.name}</p>
                      <p style={{ fontSize: 10, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Available Networks</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {zone.providers.map(pid => {
                          const p = FIBRE_PROVIDERS.find(x => x.id === pid);
                          if (!p) return null;
                          return (
                            <div key={pid} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0, marginTop: 3 }} />
                              <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: "#334155", margin: 0 }}>{p.label.split(" (")[0]}</p>
                                <p style={{ fontSize: 10, color: p.color, margin: 0, fontWeight: 600 }}>{p.speeds}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Popup>
                </Circle>
              );
            })}
            {pinPosition && (
              <Marker position={pinPosition}>
                <Popup>
                  <div style={{ maxWidth: 220 }}>
                    <p style={{ fontWeight: 700, fontSize: 12, color: "#1e293b", marginBottom: 4 }}>Searched Location</p>
                    {coverageResult?.inCoverage ? (
                      <>
                        <p style={{ fontSize: 11, color: "#059669", fontWeight: 700, marginBottom: 6 }}>✓ Fibre Available</p>
                        <p style={{ fontSize: 10, color: "#64748b", marginBottom: 4, fontWeight: 700, textTransform: "uppercase" }}>Networks:</p>
                        {coverageResult.allProviders.map(pid => {
                          const p = FIBRE_PROVIDERS.find(x => x.id === pid);
                          if (!p) return null;
                          return (
                            <div key={pid} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                              <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color }} />
                              <span style={{ fontSize: 11, fontWeight: 600, color: "#334155" }}>{p.label.split(" (")[0]}</span>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <p style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>✗ No coverage</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}