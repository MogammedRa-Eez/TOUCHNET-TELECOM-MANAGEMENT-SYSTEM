import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Popup, ZoomControl, useMap, Marker } from "react-leaflet";
import L from "leaflet";
import {
  X, MapPin, Search, Loader2, CheckCircle2, XCircle,
  RefreshCw, ChevronDown, ChevronUp, Layers
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const COVERAGE_ZONES = [
  { lat: -26.1041, lng: 28.1073, label: "Sandton", radius: 10000 },
  { lat: -26.0274, lng: 28.1527, label: "Fourways", radius: 9000 },
  { lat: -25.8579, lng: 28.1893, label: "Centurion", radius: 11000 },
  { lat: -26.0765, lng: 28.0556, label: "Randburg", radius: 9000 },
  { lat: -26.1715, lng: 27.9681, label: "Krugersdorp", radius: 8000 },
  { lat: -25.9025, lng: 28.4211, label: "Kempton Park", radius: 9000 },
  { lat: -25.7479, lng: 28.2293, label: "Pretoria East", radius: 11000 },
  { lat: -26.2041, lng: 28.0473, label: "Johannesburg South", radius: 10000 },
  { lat: -26.1367, lng: 28.2411, label: "Bedfordview", radius: 8000 },
  { lat: -26.2309, lng: 28.2772, label: "Alberton", radius: 8000 },
  { lat: -33.9249, lng: 18.4241, label: "Cape Town CBD", radius: 10000 },
  { lat: -33.9321, lng: 18.8602, label: "Stellenbosch", radius: 8000 },
  { lat: -29.8587, lng: 31.0218, label: "Durban North", radius: 10000 },
  { lat: -29.1197, lng: 26.2140, label: "Bloemfontein", radius: 9000 },
];

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const checkCoverage = (lat, lng) => {
  for (const zone of COVERAGE_ZONES) {
    const dist = haversineDistance(lat, lng, zone.lat, zone.lng);
    if (dist <= zone.radius) return { covered: true, zone };
  }
  return { covered: false, zone: null };
};

function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords) map.flyTo(coords, 14, { duration: 1.2 }); }, [coords, map]);
  return null;
}

export default function CoverageChecker({ onClose }) {
  const [address, setAddress] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [flyTo, setFlyTo] = useState(null);
  const [markerPos, setMarkerPos] = useState(null);
  const [legendOpen, setLegendOpen] = useState(true);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    setSearching(true);
    setResult(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", South Africa")}&limit=1&countrycodes=za`,
        { headers: { "User-Agent": "TouchNet-CoverageCheck/1.0" } }
      );
      const data = await res.json();
      if (!data?.[0]) {
        setResult({ error: "Address not found. Please try a more specific address." });
        return;
      }
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      const coverage = checkCoverage(lat, lng);
      setResult({ ...coverage, lat, lng, displayName: data[0].display_name });
      setFlyTo([lat, lng]);
      setMarkerPos([lat, lng]);

      // Log search analytics
      base44.entities.CoverageSearch.create({
        query: address,
        display_name: data[0].display_name,
        lat, lng,
        covered: coverage.covered,
        nearest_zone: coverage.zone?.label || "",
      }).catch(() => {});
    } catch {
      setResult({ error: "Search failed. Please try again." });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ background: "rgba(10,5,25,0.85)", backdropFilter: "blur(12px)" }}>
      <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "#1a1330", border: "1px solid rgba(155,143,239,0.25)", boxShadow: "0 24px 80px rgba(124,111,224,0.3)", height: "88vh", maxHeight: 700 }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(155,143,239,0.15)", background: "rgba(155,143,239,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(155,143,239,0.15)", border: "1px solid rgba(155,143,239,0.3)" }}>
              <MapPin className="w-4 h-4" style={{ color: "#9b8fef" }} />
            </div>
            <div>
              <h2 className="text-[14px] font-black" style={{ color: "#c4bcf7" }}>Coverage Checker</h2>
              <p className="text-[10px]" style={{ color: "rgba(196,188,247,0.4)", fontFamily: "monospace" }}>
                {COVERAGE_ZONES.length} zones · South Africa
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/10">
            <X className="w-4 h-4" style={{ color: "#9b8fef" }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar */}
          <div className="w-60 flex-shrink-0 flex flex-col overflow-y-auto"
            style={{ borderRight: "1px solid rgba(155,143,239,0.12)", background: "rgba(26,19,48,0.8)" }}>

            {/* Search */}
            <div className="p-4" style={{ borderBottom: "1px solid rgba(155,143,239,0.1)" }}>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: "rgba(196,188,247,0.4)" }}>Check an Address</p>
              <form onSubmit={handleSearch} className="space-y-2">
                <input value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Sandton City Mall"
                  className="w-full px-3 py-2.5 rounded-xl text-[12px] outline-none"
                  style={{ background: "rgba(155,143,239,0.08)", border: "1px solid rgba(155,143,239,0.2)", color: "#c4bcf7" }} />
                <button type="submit" disabled={searching || !address.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#7c6fe0,#9b8fef)", boxShadow: "0 4px 14px rgba(124,111,224,0.35)" }}>
                  {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  {searching ? "Searching…" : "Check Coverage"}
                </button>
              </form>
            </div>

            {/* Result */}
            {result && !result.error && (
              <div className="p-4" style={{ borderBottom: "1px solid rgba(155,143,239,0.1)" }}>
                <div className="rounded-xl p-3"
                  style={{
                    background: result.covered ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)",
                    border: `1px solid ${result.covered ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.25)"}`,
                  }}>
                  <div className="flex items-center gap-2 mb-2">
                    {result.covered
                      ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#10b981" }} />
                      : <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#ef4444" }} />}
                    <span className="text-[12px] font-black" style={{ color: result.covered ? "#10b981" : "#ef4444" }}>
                      {result.covered ? "Coverage Available!" : "Not Covered Yet"}
                    </span>
                  </div>
                  {result.covered && result.zone && (
                    <p className="text-[10px]" style={{ color: "rgba(196,188,247,0.6)" }}>
                      Zone: <strong style={{ color: "#c4bcf7" }}>{result.zone.label}</strong>
                    </p>
                  )}
                  {!result.covered && (
                    <p className="text-[10px]" style={{ color: "rgba(196,188,247,0.5)" }}>
                      We're expanding rapidly. Register interest on the coverage page.
                    </p>
                  )}
                  {result.displayName && (
                    <p className="text-[9px] mt-1.5 truncate" style={{ color: "rgba(196,188,247,0.3)", fontFamily: "monospace" }}>
                      {result.displayName}
                    </p>
                  )}
                </div>
              </div>
            )}

            {result?.error && (
              <div className="p-4" style={{ borderBottom: "1px solid rgba(155,143,239,0.1)" }}>
                <div className="rounded-xl p-3 flex items-start gap-2"
                  style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
                  <p className="text-[11px]" style={{ color: "#fbbf24" }}>{result.error}</p>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="p-4 flex-1">
              <button className="w-full flex items-center justify-between mb-3"
                onClick={() => setLegendOpen(v => !v)}>
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" style={{ color: "#9b8fef" }} />
                  <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(196,188,247,0.4)" }}>Coverage Zones</p>
                </div>
                {legendOpen
                  ? <ChevronUp className="w-3.5 h-3.5" style={{ color: "#9b8fef" }} />
                  : <ChevronDown className="w-3.5 h-3.5" style={{ color: "#9b8fef" }} />}
              </button>
              {legendOpen && (
                <div className="space-y-1.5">
                  {COVERAGE_ZONES.map((zone, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                      style={{ background: "rgba(155,143,239,0.05)", border: "1px solid rgba(155,143,239,0.08)" }}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: "#9b8fef", boxShadow: "0 0 6px rgba(155,143,239,0.5)" }} />
                      <span className="text-[11px]" style={{ color: "rgba(196,188,247,0.6)" }}>{zone.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            <MapContainer
              center={[-28.5, 25.5]}
              zoom={6}
              zoomControl={false}
              style={{ height: "100%", width: "100%" }}>
              <ZoomControl position="bottomright" />
              <TileLayer
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {flyTo && <FlyTo coords={flyTo} />}

              {COVERAGE_ZONES.map((zone, i) => (
                <Circle key={i} center={[zone.lat, zone.lng]} radius={zone.radius}
                  pathOptions={{ color: "#9b8fef", fillColor: "#9b8fef", fillOpacity: 0.18, weight: 1.5 }}>
                  <Popup>
                    <p style={{ fontWeight: 700, marginBottom: 2, fontSize: 12 }}>TouchNet Coverage</p>
                    <p style={{ fontSize: 11, color: "#64748b" }}>{zone.label}</p>
                  </Popup>
                </Circle>
              ))}

              {markerPos && (
                <Marker position={markerPos}>
                  <Popup>
                    <p style={{ fontWeight: 700, fontSize: 12 }}>Your Address</p>
                    {result?.covered
                      ? <p style={{ fontSize: 11, color: "#10b981" }}>✓ Coverage Available</p>
                      : <p style={{ fontSize: 11, color: "#ef4444" }}>No coverage yet</p>}
                  </Popup>
                </Marker>
              )}
            </MapContainer>

            {/* Map overlay legend */}
            <div className="absolute bottom-10 left-3 z-[999] rounded-xl px-3 py-2"
              style={{ background: "rgba(26,19,48,0.92)", border: "1px solid rgba(155,143,239,0.2)", backdropFilter: "blur(10px)" }}>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: "#9b8fef", opacity: 0.7 }} />
                <span className="text-[10px] font-bold" style={{ color: "#c4bcf7" }}>TouchNet Fibre Coverage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}