import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import { X, MapPin, RefreshCw, Wifi, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import "leaflet/dist/leaflet.css";

const STATIC_PROVIDERS = [
  { name: "Openserve", color: "#6366f1", zones: [[-25.7479, 28.2293], [-26.2041, 28.0473], [-33.9249, 18.4241]] },
  { name: "Vumatel",   color: "#10b981", zones: [[-25.7879, 28.2773], [-26.1041, 28.1073], [-29.8587, 31.0218]] },
  { name: "Frogfoot",  color: "#f59e0b", zones: [[-25.8579, 28.1893], [-26.0241, 28.2173]] },
];

const STATUS_COLORS = {
  live:   "#9b8fef",
  billed: "#10b981",
};

export default function CoverageChecker({ onClose }) {
  const [activeProviders, setActiveProviders] = useState(
    Object.fromEntries(STATIC_PROVIDERS.map(p => [p.name, true]))
  );
  const [showTouchNet, setShowTouchNet] = useState(true);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.FibreProject.filter({ coverage_synced: true });
      const filtered = data.filter(p => ["live", "billed"].includes(p.status) && p.coverage_lat && p.coverage_lng);
      setProjects(filtered);
      setLastSync(new Date());
    } catch (e) {
      console.error("Failed to load coverage projects", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    const unsub = base44.entities.FibreProject.subscribe((event) => {
      if (event.type === "update" && ["live", "billed"].includes(event.data?.status)) {
        fetchProjects();
      }
    });
    return unsub;
  }, []);

  const toggle = (name) => setActiveProviders(prev => ({ ...prev, [name]: !prev[name] }));
  const liveCount   = projects.filter(p => p.status === "live").length;
  const billedCount = projects.filter(p => p.status === "billed").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,5,25,0.75)", backdropFilter: "blur(8px)" }}>
      <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "#1a1330", border: "1px solid rgba(155,143,239,0.25)", boxShadow: "0 20px 60px rgba(124,111,224,0.25)", maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(155,143,239,0.15)" }}>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5" style={{ color: "#9b8fef" }} />
            <h2 className="text-[15px] font-black" style={{ color: "#c4bcf7" }}>Fibre Coverage Map</h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold"
              style={{ background: "rgba(155,143,239,0.1)", border: "1px solid rgba(155,143,239,0.2)", color: "#9b8fef" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync
            </div>
            {lastSync && (
              <span className="text-[10px]" style={{ color: "rgba(196,188,247,0.35)", fontFamily: "monospace" }}>
                {lastSync.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchProjects} disabled={loading}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10 disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} style={{ color: "#9b8fef" }} />
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10">
              <X className="w-4 h-4" style={{ color: "#9b8fef" }} />
            </button>
          </div>
        </div>

        {/* Stats + toggles */}
        <div className="flex items-center gap-3 px-5 py-3 flex-wrap flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(155,143,239,0.1)" }}>
          <div className="flex items-center gap-2 mr-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{ background: "rgba(155,143,239,0.1)", border: "1px solid rgba(155,143,239,0.2)" }}>
              <Wifi className="w-3 h-3" style={{ color: "#9b8fef" }} />
              <span className="text-[11px] font-bold" style={{ color: "#9b8fef", fontFamily: "monospace" }}>{liveCount} Live</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <CheckCircle2 className="w-3 h-3" style={{ color: "#10b981" }} />
              <span className="text-[11px] font-bold" style={{ color: "#10b981", fontFamily: "monospace" }}>{billedCount} Billed</span>
            </div>
          </div>

          <div className="w-px h-5 flex-shrink-0" style={{ background: "rgba(155,143,239,0.15)" }} />

          <button onClick={() => setShowTouchNet(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
            style={{
              background: showTouchNet ? "rgba(155,143,239,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${showTouchNet ? "rgba(155,143,239,0.4)" : "rgba(255,255,255,0.08)"}`,
              color: showTouchNet ? "#c4bcf7" : "#64748b",
            }}>
            <span className="w-2 h-2 rounded-full" style={{ background: showTouchNet ? "#9b8fef" : "#334155" }} />
            TouchNet (Live)
          </button>

          {STATIC_PROVIDERS.map(p => (
            <button key={p.name} onClick={() => toggle(p.name)}
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
        <div style={{ flex: 1, minHeight: 420 }}>
          <MapContainer center={[-28.5, 25.5]} zoom={5} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {STATIC_PROVIDERS.filter(p => activeProviders[p.name]).map(p =>
              p.zones.map((coords, i) => (
                <Circle key={`${p.name}-${i}`} center={coords} radius={15000}
                  pathOptions={{ color: p.color, fillColor: p.color, fillOpacity: 0.18, weight: 2 }}>
                  <Popup><strong>{p.name}</strong> Coverage Zone</Popup>
                </Circle>
              ))
            )}
            {showTouchNet && projects.map(project => (
              <Circle key={project.id}
                center={[project.coverage_lat, project.coverage_lng]}
                radius={8000}
                pathOptions={{
                  color: STATUS_COLORS[project.status] || "#9b8fef",
                  fillColor: STATUS_COLORS[project.status] || "#9b8fef",
                  fillOpacity: 0.25,
                  weight: 2,
                }}>
                <Popup>
                  <div style={{ minWidth: 160 }}>
                    <p style={{ fontWeight: 700, marginBottom: 4 }}>{project.project_name}</p>
                    <p style={{ fontSize: 11, color: "#64748b" }}>{project.site_address}</p>
                    <p style={{ fontSize: 11, marginTop: 4 }}>
                      Status: <strong style={{ color: STATUS_COLORS[project.status] }}>{project.status}</strong>
                    </p>
                    {project.service_plan && (
                      <p style={{ fontSize: 11, color: "#6366f1" }}>{project.service_plan}</p>
                    )}
                  </div>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 flex items-center justify-between flex-shrink-0"
          style={{ borderTop: "1px solid rgba(155,143,239,0.1)" }}>
          <p className="text-[10px]" style={{ color: "rgba(196,188,247,0.3)", fontFamily: "monospace" }}>
            TouchNet zones auto-sync when projects go Live or Billed
          </p>
          <p className="text-[10px]" style={{ color: "rgba(196,188,247,0.3)", fontFamily: "monospace" }}>
            {projects.length} active zone{projects.length !== 1 ? "s" : ""} loaded
          </p>
        </div>
      </div>
    </div>
  );
}