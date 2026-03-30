import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { X, Search, MapPin, CheckCircle2, XCircle, Loader2, Wifi, AlertTriangle } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons for leaflet in vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Coverage zones for South Africa (TouchNet service areas)
// These represent approximate coverage polygons centred on major nodes
const COVERAGE_ZONES = [
  { name: "Sandton CBD",        lat: -26.1070, lng: 28.0567, radiusKm: 5,   speed: "Up to 1 Gbps",   type: "Fibre" },
  { name: "Midrand",            lat: -25.9973, lng: 28.1287, radiusKm: 6,   speed: "Up to 500 Mbps", type: "Fibre" },
  { name: "Fourways",           lat: -26.0183, lng: 28.0096, radiusKm: 5,   speed: "Up to 1 Gbps",   type: "Fibre" },
  { name: "Randburg",           lat: -26.0934, lng: 27.9981, radiusKm: 4,   speed: "Up to 100 Mbps", type: "Fibre" },
  { name: "Johannesburg CBD",   lat: -26.2041, lng: 28.0473, radiusKm: 4,   speed: "Up to 1 Gbps",   type: "Fibre" },
  { name: "Rosebank",           lat: -26.1466, lng: 28.0437, radiusKm: 3,   speed: "Up to 1 Gbps",   type: "Fibre" },
  { name: "Centurion",          lat: -25.8600, lng: 28.1890, radiusKm: 6,   speed: "Up to 500 Mbps", type: "Fibre" },
  { name: "Pretoria East",      lat: -25.7597, lng: 28.2975, radiusKm: 5,   speed: "Up to 100 Mbps", type: "Fibre" },
  { name: "Bryanston",          lat: -26.0700, lng: 28.0170, radiusKm: 4,   speed: "Up to 1 Gbps",   type: "Fibre" },
  { name: "Edenvale",           lat: -26.1444, lng: 28.1584, radiusKm: 4,   speed: "Up to 500 Mbps", type: "Fibre" },
  { name: "Rivonia",            lat: -26.0551, lng: 28.0623, radiusKm: 3.5, speed: "Up to 1 Gbps",   type: "Fibre" },
  { name: "Woodmead",           lat: -26.0733, lng: 28.0878, radiusKm: 3,   speed: "Up to 1 Gbps",   type: "Fibre" },
];

// Haversine distance in km
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function checkCoverage(lat, lng) {
  let closest = null;
  let closestDist = Infinity;
  for (const zone of COVERAGE_ZONES) {
    const d = distanceKm(lat, lng, zone.lat, zone.lng);
    if (d <= zone.radiusKm) return { covered: true, zone, distanceKm: d };
    if (d < closestDist) { closestDist = d; closest = zone; }
  }
  return { covered: false, zone: closest, distanceKm: closestDist };
}

// Helper to fly map to a location
function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 13, { duration: 1.2 }); }, [center]);
  return null;
}

export default function CoverageChecker({ onClose }) {
  const [address, setAddress] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null); // { lat, lng, displayName, covered, zone, distanceKm }
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    setSearching(true);
    setError("");
    setResult(null);

    try {
      const query = encodeURIComponent(address + ", South Africa");
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`);
      const data = await res.json();
      if (!data || data.length === 0) {
        setError("Address not found. Please try a more specific address.");
        setSearching(false);
        return;
      }
      const { lat, lon, display_name } = data[0];
      const coverage = checkCoverage(parseFloat(lat), parseFloat(lon));
      setResult({ lat: parseFloat(lat), lng: parseFloat(lon), displayName: display_name, ...coverage });
    } catch {
      setError("Could not search for address. Please check your connection.");
    } finally {
      setSearching(false);
    }
  };

  const mapCenter = result ? [result.lat, result.lng] : [-26.0, 28.1];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ background: "#fff", maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)", borderBottom: "1px solid rgba(6,182,212,0.2)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)" }}>
              <Wifi className="w-4 h-4" style={{ color: "#22d3ee" }} />
            </div>
            <div>
              <p className="text-[15px] font-black text-white">Fibre Coverage Checker</p>
              <p className="text-[10px] mono" style={{ color: "rgba(148,163,184,0.7)" }}>Check if TouchNet fibre is available at your address</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-6 py-4 flex-shrink-0" style={{ background: "#f8fafc", borderBottom: "1px solid rgba(226,232,240,0.8)" }}>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Enter your street address, suburb or area…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] outline-none text-slate-800 placeholder:text-slate-300"
                style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.2)" }}
              />
            </div>
            <button type="submit" disabled={searching || !address.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)", boxShadow: "0 4px 12px rgba(6,182,212,0.3)" }}>
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {searching ? "Searching…" : "Check"}
            </button>
          </form>

          {/* Result banner */}
          {error && (
            <div className="flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl"
              style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-[12px] text-red-500 font-medium">{error}</p>
            </div>
          )}

          {result && (
            <div className={`flex items-start gap-3 mt-3 px-4 py-3 rounded-xl`}
              style={{
                background: result.covered ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
                border: `1px solid ${result.covered ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`,
              }}>
              {result.covered
                ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                : <XCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
              <div>
                {result.covered ? (
                  <>
                    <p className="text-[13px] font-black text-emerald-700">✓ Fibre Available in Your Area!</p>
                    <p className="text-[12px] text-emerald-600 mt-0.5">
                      You're in the <strong>{result.zone.name}</strong> coverage zone — <strong>{result.zone.speed}</strong> {result.zone.type} available.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[13px] font-black text-amber-700">Coverage Not Yet Available</p>
                    <p className="text-[12px] text-amber-600 mt-0.5">
                      Nearest covered area is <strong>{result.zone?.name}</strong> (~{result.distanceKm.toFixed(1)} km away). We're expanding — contact us to register interest!
                    </p>
                  </>
                )}
                <p className="text-[10px] text-slate-400 mt-1 truncate">{result.displayName}</p>
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 min-h-[340px]">
          <MapContainer center={mapCenter} zoom={10} style={{ width: "100%", height: "100%", minHeight: 340 }} zoomControl={true}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {/* Coverage zones */}
            {COVERAGE_ZONES.map(zone => (
              <Circle
                key={zone.name}
                center={[zone.lat, zone.lng]}
                radius={zone.radiusKm * 1000}
                pathOptions={{ color: "#06b6d4", fillColor: "#06b6d4", fillOpacity: 0.12, weight: 1.5, opacity: 0.5 }}
              >
                <Popup>
                  <div className="text-[12px]">
                    <p className="font-bold text-slate-800">{zone.name}</p>
                    <p className="text-slate-500">{zone.type} · {zone.speed}</p>
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* Searched address marker */}
            {result && (
              <>
                <FlyTo center={[result.lat, result.lng]} />
                <Marker position={[result.lat, result.lng]}>
                  <Popup>
                    <div className="text-[12px]">
                      <p className="font-bold" style={{ color: result.covered ? "#10b981" : "#f59e0b" }}>
                        {result.covered ? "✓ Covered" : "⚠ Not Yet Available"}
                      </p>
                      <p className="text-slate-500 mt-0.5">{address}</p>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}
          </MapContainer>
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-3 flex items-center justify-between flex-shrink-0"
          style={{ background: "#f8fafc", borderTop: "1px solid rgba(226,232,240,0.8)" }}>
          <p className="text-[11px] text-slate-400">Coverage zones are indicative. Contact us to confirm availability at your exact address.</p>
          <a href="mailto:sales@touchnet.co.za"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            Contact Sales
          </a>
        </div>
      </div>
    </div>
  );
}