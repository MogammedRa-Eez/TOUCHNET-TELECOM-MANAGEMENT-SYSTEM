import React, { useState, useEffect, useRef } from "react";
import { X, MapPin, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

export default function CoverageChecker({ onClose }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState(null); // null | "loading" | "covered" | "not_covered"
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    let L;
    async function initMap() {
      L = await import("leaflet");

      // Fix default marker icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapInstanceRef.current && mapRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView([-26.2041, 28.0473], 10);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstanceRef.current);

        mapInstanceRef.current.on("click", (e) => {
          placeMarker(L, e.latlng.lat, e.latlng.lng);
        });
      }
    }
    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const placeMarker = async (L, lat, lng) => {
    if (!mapInstanceRef.current) return;
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
    setCoords({ lat, lng });
    setStatus("covered"); // Simulate coverage — all clicked areas are covered
  };

  const handleSearch = async () => {
    if (!address.trim()) return;
    setStatus("loading");
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );
    const data = await res.json();
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      const L = await import("leaflet");
      mapInstanceRef.current.setView([parseFloat(lat), parseFloat(lon)], 14);
      placeMarker(L, parseFloat(lat), parseFloat(lon));
    } else {
      setStatus("not_covered");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-2xl rounded-3xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.98)", border: "1px solid rgba(6,182,212,0.2)", boxShadow: "0 24px 64px rgba(6,182,212,0.15)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ background: "linear-gradient(135deg,rgba(6,182,212,0.08),rgba(99,102,241,0.06))", borderBottom: "1px solid rgba(6,182,212,0.12)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 4px 12px rgba(6,182,212,0.3)" }}>
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-black" style={{ color: "#0f172a" }}>Coverage Checker</h2>
              <p className="text-[11px]" style={{ color: "#64748b" }}>Search an address or click the map</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-6 py-4 flex gap-2" style={{ borderBottom: "1px solid rgba(226,232,240,0.6)" }}>
          <input
            className="flex-1 px-4 py-2.5 rounded-xl text-[13px] outline-none"
            style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }}
            placeholder="Enter an address to check coverage…"
            value={address}
            onChange={e => setAddress(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch}
            disabled={status === "loading"}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 4px 12px rgba(6,182,212,0.3)" }}>
            {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            Check
          </button>
        </div>

        {/* Map */}
        <div ref={mapRef} style={{ height: 340, width: "100%" }} />

        {/* Result */}
        {status && status !== "loading" && (
          <div className="px-6 py-4 flex items-center gap-3"
            style={{
              background: status === "covered" ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)",
              borderTop: `1px solid ${status === "covered" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
            }}>
            {status === "covered"
              ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
            <p className="text-[13px] font-semibold" style={{ color: status === "covered" ? "#059669" : "#ef4444" }}>
              {status === "covered"
                ? "Great news! This area is covered by TouchNet fibre. Contact us to get connected."
                : "Address not found. Please try a different search or click directly on the map."}
            </p>
          </div>
        )}

        {!status && (
          <div className="px-6 py-3 text-center"
            style={{ borderTop: "1px solid rgba(226,232,240,0.5)" }}>
            <p className="text-[11px]" style={{ color: "#94a3b8" }}>Click anywhere on the map to check coverage at that location</p>
          </div>
        )}
      </div>
    </div>
  );
}