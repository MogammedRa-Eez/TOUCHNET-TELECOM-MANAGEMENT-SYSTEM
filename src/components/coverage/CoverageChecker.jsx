import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { X, MapPin, Search, Wifi, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const PROVIDERS = [
  { name: "Openserve",  color: "#6366f1", radius: 15000 },
  { name: "Vumatel",   color: "#10b981", radius: 12000 },
  { name: "Frogfoot",  color: "#f59e0b", radius: 10000 },
  { name: "TouchNet",  color: "#ef4444", radius: 18000 },
];

// Default center: South Africa
const DEFAULT_CENTER = [-26.2041, 28.0473];

export default function CoverageChecker({ onClose }) {
  const [address, setAddress]     = useState("");
  const [coords, setCoords]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [coverage, setCoverage]   = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    setError("");
    setCoverage(null);
    setCoords(null);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=za&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();

    if (!data.length) {
      setError("Address not found. Please try a more specific address.");
      setLoading(false);
      return;
    }

    const { lat, lon } = data[0];
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    setCoords([latNum, lonNum]);

    // Simulate coverage check — in production, replace with real API calls
    const available = PROVIDERS.filter(() => Math.random() > 0.4);
    setCoverage(available);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.15)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)", borderBottom: "1px solid rgba(6,182,212,0.2)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-[15px]">Coverage Checker</p>
              <p className="text-cyan-100 text-[11px]">Check fibre availability at your address</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] outline-none"
                style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(99,102,241,0.18)", color: "#1e293b" }}
                placeholder="Enter your address (e.g. 12 Main St, Sandton)"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading}
              className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Check
            </button>
          </form>

          {error && (
            <p className="text-[12px] font-semibold text-red-500 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" /> {error}
            </p>
          )}

          {/* Coverage results */}
          {coverage && (
            <div className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(99,102,241,0.12)" }}>
              <div className="px-4 py-3"
                style={{ background: coverage.length > 0 ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)", borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
                <div className="flex items-center gap-2">
                  {coverage.length > 0
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <XCircle className="w-4 h-4 text-red-400" />}
                  <p className="text-[13px] font-black" style={{ color: "#1e293b" }}>
                    {coverage.length > 0
                      ? `${coverage.length} provider${coverage.length > 1 ? "s" : ""} available in your area!`
                      : "No fibre coverage at this address yet"}
                  </p>
                </div>
              </div>
              {coverage.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 py-3">
                  {coverage.map(p => (
                    <div key={p.name} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-bold"
                      style={{ background: `${p.color}12`, border: `1px solid ${p.color}30`, color: p.color }}>
                      <Wifi className="w-3.5 h-3.5" /> {p.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Map */}
          <div className="rounded-2xl overflow-hidden" style={{ height: 300, border: "1px solid rgba(99,102,241,0.12)" }}>
            <MapContainer
              center={coords || DEFAULT_CENTER}
              zoom={coords ? 13 : 6}
              key={coords ? coords.join(",") : "default"}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              />
              {coords && (
                <>
                  <Marker position={coords}>
                    <Popup>{address}</Popup>
                  </Marker>
                  {coverage && coverage.map(p => (
                    <Circle
                      key={p.name}
                      center={coords}
                      radius={p.radius}
                      pathOptions={{ color: p.color, fillColor: p.color, fillOpacity: 0.06, weight: 1.5 }}
                    />
                  ))}
                </>
              )}
            </MapContainer>
          </div>

          {/* Provider legend */}
          <div className="flex flex-wrap gap-3">
            {PROVIDERS.map(p => (
              <div key={p.name} className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "#64748b" }}>
                <span className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}