import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Popup, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import { X, MapPin, RefreshCw, Search, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const STATIC_PROVIDERS = [
  { name: "Openserve", color: "#6366f1", zones: [
    [-25.7479, 28.2293, "Pretoria East"], [-26.2041, 28.0473, "Johannesburg South"],
    [-33.9249, 18.4241, "Cape Town CBD"], [-29.8587, 31.0218, "Durban CBD"],
  ]},
  { name: "Vumatel", color: "#10b981", zones: [
    [-26.1041, 28.1073, "Sandton"], [-26.0274, 28.1527, "Fourways"],
    [-29.8587, 31.0218, "Durban North"], [-26.0765, 28.0556, "Randburg"],
  ]},
  { name: "Frogfoot", color: "#f59e0b", zones: [
    [-25.8579, 28.1893, "Centurion"], [-26.0241, 28.2173, "Midrand"],
    [-26.2309, 28.2772, "Alberton"],
  ]},
  { name: "DFA", color: "#ef4444", zones: [
    [-26.2041, 28.0473, "Johannesburg CBD"], [-25.7479, 28.2293, "Pretoria"],
    [-29.8587, 31.0218, "Durban"], [-33.9249, 18.4241, "Cape Town"],
  ]},
  { name: "MFN", color: "#a855f7", zones: [
    [-26.1041, 28.1073, "Sandton"], [-26.0241, 28.2173, "Midrand"],
    [-25.8579, 28.1893, "Centurion"],
  ]},
];

const STATUS_COLORS = { live: "#9b8fef", billed: "#10b981" };

const MAP_STYLES = [
  { id: "dark",   label: "Dark",    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png" },
  { id: "street", label: "Street",  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
];

function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords) map.flyTo(coords, 13, { duration: 1.2 }); }, [coords, map]);
  return null;
}

export default function CoverageChecker({ onClose }) {
  const [activeProviders, setActiveProviders] = useState(
    Object.fromEntries(STATIC_PROVIDERS.map(p => [p.name, true]))
  );
  const [showTouchNet, setShowTouchNet] = useState(true);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [flyTo, setFlyTo] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [mapStyle, setMapStyle] = useState("dark");
  const [legendOpen, setLegendOpen] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.FibreProject.filter({ coverage_synced: true });
      setProjects(data.filter(p => ["live", "billed"].includes(p.status) && p.coverage_lat && p.coverage_lng));
    } catch (e) {
      console.error("Failed to load coverage projects", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ", South Africa")}&limit=1`,
        { headers: { "User-Agent": "TouchNet-CoverageMap/1.0" } }
      );
      const data = await res.json();
      if (data?.[0]) setFlyTo([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setSearchLoading(false);
    }
  };

  const toggle = (name) => setActiveProviders(prev => ({ ...prev, [name]: !prev[name] }));
  const liveCount   = projects.filter(p => p.status === "live").length;
  const billedCount = projects.filter(p => p.status === "billed").length;
  const currentStyle = MAP_STYLES.find(s => s.id === mapStyle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ background: "rgba(10,5,25,0.8)", backdropFilter: "blur(10px)" }}>
      <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "#1a1330", border: "1px solid rgba(155,143,239,0.25)", boxShadow: "0 24px 80px rgba(124,111,224,0.3)", height: "90vh", maxHeight: 760 }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(155,143,239,0.15)", background: "rgba(155,143,239,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(155,143,239,0.15)", border: "1px solid rgba(155,143,239,0.3)" }}>
              <MapPin className="w-4 h-4" style={{ color: "#9b8fef" }} />
            </div>
            <div>
              <h2 className="text-[14px] font-black" style={{ color: "#c4bcf7" }}>Fibre Coverage Map</h2>
              <p className="text-[10px]" style={{ color: "rgba(196,188,247,0.4)", fontFamily: "monospace" }}>South Africa · Interactive</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchProjects} disabled={loading}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} style={{ color: "#9b8fef" }} />
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/10">
              <X className="w-4 h-4" style={{ color: "#9b8fef" }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar */}
          <div className="flex flex-col w-56 flex-shrink-0 overflow-y-auto"
            style={{ borderRight: "1px solid rgba(155,143,239,0.12)", background: "rgba(26,19,48,0.8)" }}>

            {/* Search */}
            <div className="p-3" style={{ borderBottom: "1px solid rgba(155,143,239,0.1)" }}>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: "rgba(196,188,247,0.4)" }}>Search</p>
              <form onSubmit={handleSearch} className="flex gap-1.5">
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="e.g. Sandton"
                  className="flex-1 px-2.5 py-2 rounded-lg text-[12px] outline-none"
                  style={{ background: "rgba(155,143,239,0.08)", border: "1px solid rgba(155,143,239,0.2)", color: "#c4bcf7" }} />
                <button type="submit" disabled={searchLoading}
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                  style={{ background: "rgba(155,143,239,0.2)", border: "1px solid rgba(155,143,239,0.3)" }}>
                  {searchLoading
                    ? <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ color: "#9b8fef" }} />
                    : <Search className="w-3.5 h-3.5" style={{ color: "#9b8fef" }} />}
                </button>
              </form>
            </div>

            {/* Map style */}
            <div className="p-3" style={{ borderBottom: "1px solid rgba(155,143,239,0.1)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-3.5 h-3.5" style={{ color: "#9b8fef" }} />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(196,188,247,0.4)" }}>Map Style</p>
              </div>
              <div className="flex gap-1.5">
                {MAP_STYLES.map(s => (
                  <button key={s.id} onClick={() => setMapStyle(s.id)}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                    style={{
                      background: mapStyle === s.id ? "rgba(155,143,239,0.2)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${mapStyle === s.id ? "rgba(155,143,239,0.4)" : "rgba(255,255,255,0.08)"}`,
                      color: mapStyle === s.id ? "#c4bcf7" : "#64748b",
                    }}>{s.label}</button>
                ))}
              </div>
            </div>

            {/* Layers */}
            <div className="p-3 flex-1">
              <button className="w-full flex items-center justify-between mb-2" onClick={() => setLegendOpen(v => !v)}>
                <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(196,188,247,0.4)" }}>Layers</p>
                {legendOpen ? <ChevronUp className="w-3 h-3" style={{ color: "#9b8fef" }} /> : <ChevronDown className="w-3 h-3" style={{ color: "#9b8fef" }} />}
              </button>
              {legendOpen && (
                <div className="space-y-1.5">
                  <button onClick={() => setShowTouchNet(v => !v)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all"
                    style={{ background: showTouchNet ? "rgba(155,143,239,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${showTouchNet ? "rgba(155,143,239,0.25)" : "rgba(255,255,255,0.06)"}` }}>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: "#9b8fef" }} />
                      <span className="text-[11px] font-bold" style={{ color: showTouchNet ? "#c4bcf7" : "#475569" }}>TouchNet</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(155,143,239,0.15)", color: "#9b8fef" }}>
                      {liveCount + billedCount}
                    </span>
                  </button>
                  {STATIC_PROVIDERS.map(p => (
                    <button key={p.name} onClick={() => toggle(p.name)}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all"
                      style={{ background: activeProviders[p.name] ? `${p.color}12` : "rgba(255,255,255,0.03)", border: `1px solid ${activeProviders[p.name] ? p.color + "30" : "rgba(255,255,255,0.06)"}` }}>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                        <span className="text-[11px] font-bold" style={{ color: activeProviders[p.name] ? "#c4bcf7" : "#475569" }}>{p.name}</span>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${p.color}15`, color: p.color }}>{p.zones.length}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected project */}
            {selectedProject && (
              <div className="p-3" style={{ borderTop: "1px solid rgba(155,143,239,0.12)" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(196,188,247,0.4)" }}>Selected</p>
                  <button onClick={() => setSelectedProject(null)}><X className="w-3 h-3" style={{ color: "#9b8fef" }} /></button>
                </div>
                <div className="rounded-xl p-3" style={{ background: "rgba(155,143,239,0.08)", border: "1px solid rgba(155,143,239,0.15)" }}>
                  <p className="text-[12px] font-bold" style={{ color: "#c4bcf7" }}>{selectedProject.project_name}</p>
                  {selectedProject.site_address && <p className="text-[10px] mt-1" style={{ color: "rgba(196,188,247,0.5)" }}>{selectedProject.site_address}</p>}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[selectedProject.status] }} />
                    <span className="text-[10px] font-bold capitalize" style={{ color: STATUS_COLORS[selectedProject.status] }}>{selectedProject.status}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="p-3" style={{ borderTop: "1px solid rgba(155,143,239,0.1)" }}>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg px-2 py-2 text-center" style={{ background: "rgba(155,143,239,0.08)", border: "1px solid rgba(155,143,239,0.15)" }}>
                  <p className="text-[16px] font-black" style={{ color: "#9b8fef" }}>{liveCount}</p>
                  <p className="text-[9px]" style={{ color: "rgba(196,188,247,0.4)" }}>Live</p>
                </div>
                <div className="rounded-lg px-2 py-2 text-center" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
                  <p className="text-[16px] font-black" style={{ color: "#10b981" }}>{billedCount}</p>
                  <p className="text-[9px]" style={{ color: "rgba(196,188,247,0.4)" }}>Billed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            <MapContainer center={[-28.5, 25.5]} zoom={6} zoomControl={false} style={{ height: "100%", width: "100%" }}>
              <ZoomControl position="bottomright" />
              <TileLayer url={currentStyle.url} attribution='&copy; OpenStreetMap contributors' />
              {flyTo && <FlyTo coords={flyTo} />}

              {STATIC_PROVIDERS.filter(p => activeProviders[p.name]).map(p =>
                p.zones.map(([lat, lng, label], i) => (
                  <Circle key={`${p.name}-${i}`} center={[lat, lng]} radius={12000}
                    pathOptions={{ color: p.color, fillColor: p.color, fillOpacity: 0.15, weight: 2 }}>
                    <Popup>
                      <p style={{ fontWeight: 700, marginBottom: 2 }}>{p.name}</p>
                      <p style={{ fontSize: 11, color: "#64748b" }}>{label}</p>
                    </Popup>
                  </Circle>
                ))
              )}

              {showTouchNet && projects.map(project => (
                <Circle key={project.id}
                  center={[project.coverage_lat, project.coverage_lng]}
                  radius={8000}
                  eventHandlers={{ click: () => setSelectedProject(project) }}
                  pathOptions={{ color: STATUS_COLORS[project.status] || "#9b8fef", fillColor: STATUS_COLORS[project.status] || "#9b8fef", fillOpacity: 0.28, weight: 2.5 }}>
                  <Popup>
                    <div style={{ minWidth: 160 }}>
                      <p style={{ fontWeight: 700, marginBottom: 4 }}>{project.project_name}</p>
                      {project.site_address && <p style={{ fontSize: 11, color: "#64748b" }}>{project.site_address}</p>}
                      <p style={{ fontSize: 11, marginTop: 4 }}>
                        Status: <strong style={{ color: STATUS_COLORS[project.status], textTransform: "capitalize" }}>{project.status}</strong>
                      </p>
                    </div>
                  </Popup>
                </Circle>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}