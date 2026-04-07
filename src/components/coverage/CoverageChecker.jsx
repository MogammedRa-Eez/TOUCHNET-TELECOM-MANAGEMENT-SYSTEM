import React, { useState } from "react";
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import { X, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

const PROVIDERS = [
  { name: "Openserve",  color: "#6366f1", zones: [[-25.7479, 28.2293], [-26.2041, 28.0473], [-33.9249, 18.4241]] },
  { name: "Vumatel",   color: "#10b981", zones: [[-25.7879, 28.2773], [-26.1041, 28.1073], [-29.8587, 31.0218]] },
  { name: "Frogfoot",  color: "#f59e0b", zones: [[-25.8579, 28.1893], [-26.0241, 28.2173]] },
  { name: "TouchNet",  color: "#ef4444", zones: [[-25.7679, 28.2493], [-26.1741, 28.0873], [-33.8649, 18.5041]] },
];

export default function CoverageChecker({ onClose }) {
  const [activeProviders, setActiveProviders] = useState(
    Object.fromEntries(PROVIDERS.map(p => [p.name, true]))
  );

  const toggle = (name) => setActiveProviders(prev => ({ ...prev, [name]: !prev[name] }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,5,25,0.75)", backdropFilter: "blur(8px)" }}>
      <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden"
        style={{ background: "#1a1330", border: "1px solid rgba(155,143,239,0.25)", boxShadow: "0 20px 60px rgba(124,111,224,0.25)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(155,143,239,0.15)" }}>
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5" style={{ color: "#9b8fef" }} />
            <h2 className="text-[15px] font-black" style={{ color: "#c4bcf7" }}>Fibre Coverage Map</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10">
            <X className="w-4 h-4" style={{ color: "#9b8fef" }} />
          </button>
        </div>

        {/* Provider toggles */}
        <div className="flex items-center gap-2 px-5 py-3 flex-wrap"
          style={{ borderBottom: "1px solid rgba(155,143,239,0.1)" }}>
          {PROVIDERS.map(p => (
            <button key={p.name}
              onClick={() => toggle(p.name)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
              style={{
                background: activeProviders[p.name] ? `${p.color}18` : "rgba(255,255,255,0.04)",
                border: `1px solid ${activeProviders[p.name] ? p.color + "40" : "rgba(255,255,255,0.08)"}`,
                color: activeProviders[p.name] ? p.color : "#64748b",
              }}>
              <span className="w-2 h-2 rounded-full" style={{ background: activeProviders[p.name] ? p.color : "#334155" }} />
              {p.name}
            </button>
          ))}
        </div>

        {/* Map */}
        <div style={{ height: 480 }}>
          <MapContainer center={[-28.5, 25.5]} zoom={5} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {PROVIDERS.filter(p => activeProviders[p.name]).map(p =>
              p.zones.map((coords, i) => (
                <Circle key={`${p.name}-${i}`}
                  center={coords}
                  radius={15000}
                  pathOptions={{ color: p.color, fillColor: p.color, fillOpacity: 0.2, weight: 2 }}>
                  <Popup>{p.name} Coverage Zone</Popup>
                </Circle>
              ))
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}