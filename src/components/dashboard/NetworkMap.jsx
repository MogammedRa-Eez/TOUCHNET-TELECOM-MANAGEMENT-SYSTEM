import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import NodeSidePanel from "./NodeSidePanel";
import { Layers, Thermometer } from "lucide-react";

// Static node positions — merged with live DB nodes by name match
const STATIC_NODES = [
  { lat: -26.2,  lon:  28.0,  status: "online",      label: "Johannesburg", latency: 12,  signal: 95 },
  { lat: -33.9,  lon:  18.4,  status: "online",      label: "Cape Town",    latency: 18,  signal: 90 },
  { lat: -29.8,  lon:  31.0,  status: "degraded",    label: "Durban",       latency: 145, signal: 42 },
  { lat: -25.7,  lon:  28.3,  status: "online",      label: "Pretoria",     latency: 14,  signal: 93 },
  { lat: -23.0,  lon:  29.5,  status: "offline",     label: "Polokwane",    latency: 999, signal: 0  },
  { lat: -22.9,  lon:  30.4,  status: "online",      label: "Limpopo Node", latency: 32,  signal: 78 },
  { lat: -24.5,  lon:  26.8,  status: "online",      label: "Gaborone",     latency: 28,  signal: 82 },
  { lat: -28.0,  lon:  26.5,  status: "maintenance", label: "Bloemfontein", latency: 88,  signal: 55 },
  { lat: -26.7,  lon:  27.1,  status: "online",      label: "West Rand",    latency: 16,  signal: 91 },
  { lat: -27.5,  lon:  29.9,  status: "online",      label: "Ermelo",       latency: 44,  signal: 72 },
  { lat:  40.7,  lon: -74.0,  status: "online",      label: "New York",     latency: 210, signal: 88 },
  { lat:  51.5,  lon:  -0.1,  status: "online",      label: "London",       latency: 185, signal: 87 },
  { lat:  35.7,  lon: 139.7,  status: "online",      label: "Tokyo",        latency: 290, signal: 85 },
  { lat: -23.5,  lon: -46.6,  status: "online",      label: "São Paulo",    latency: 230, signal: 80 },
  { lat:   1.3,  lon: 103.8,  status: "online",      label: "Singapore",    latency: 195, signal: 89 },
];

const STATUS_COLOR = {
  online:      "#10b981",
  offline:     "#ef4444",
  degraded:    "#f59e0b",
  maintenance: "#8b5cf6",
};

const TILE_LAYERS = {
  dark:     { url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",       label: "Dark" },
  satellite:{ url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", label: "Satellite" },
  topo:     { url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",  label: "Minimal" },
};

function makeIcon(color, selected = false) {
  const size  = selected ? 22 : 16;
  const pulse = selected ? `<div style="position:absolute;inset:-6px;border-radius:50%;border:2px solid ${color};opacity:0.5;animation:ping 1.2s infinite;"></div>` : "";
  return L.divIcon({
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      ${pulse}
      <div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid rgba(255,255,255,0.85);box-shadow:0 0 ${selected ? 14 : 8}px ${color}88;"></div>
    </div>`,
    className: "",
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Adds the ping keyframe once
function PingStyle() {
  useEffect(() => {
    if (document.getElementById("map-ping-style")) return;
    const s = document.createElement("style");
    s.id = "map-ping-style";
    s.textContent = `@keyframes ping { 0%{transform:scale(1);opacity:.6} 70%{transform:scale(1.8);opacity:0} 100%{transform:scale(1.8);opacity:0} }`;
    document.head.appendChild(s);
  }, []);
  return null;
}

// Cluster lines between nearby SA nodes
function ClusterLines({ nodes }) {
  const map = useMap();
  useEffect(() => {
    const saNodes = nodes.filter(n => n.lat < 0 && n.lon > 15 && n.lon < 35);
    const lines = [];
    for (let i = 0; i < saNodes.length - 1; i++) {
      const a = saNodes[i], b = saNodes[i + 1];
      const line = L.polyline([[a.lat, a.lon], [b.lat, b.lon]], {
        color: "#6366f1",
        weight: 1.5,
        opacity: 0.3,
        dashArray: "4 6",
      }).addTo(map);
      lines.push(line);
    }
    return () => lines.forEach(l => map.removeLayer(l));
  }, [map, nodes]);
  return null;
}

export default function NetworkMap({ nodes: dbNodes = [] }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [tileKey, setTileKey]           = useState("dark");

  // Merge static positions with DB nodes
  const mergedNodes = STATIC_NODES.map(sn => {
    const dbNode = dbNodes.find(d => d.name?.toLowerCase().includes(sn.label.split(" ")[0].toLowerCase()));
    return {
      ...sn,
      status: dbNode?.status || sn.status,
      dbNode: dbNode || null,
    };
  });

  const tile = TILE_LAYERS[tileKey];

  const statusCounts = {
    online:      mergedNodes.filter(n => n.status === "online").length,
    offline:     mergedNodes.filter(n => n.status === "offline").length,
    degraded:    mergedNodes.filter(n => n.status === "degraded").length,
    maintenance: mergedNodes.filter(n => n.status === "maintenance").length,
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ minHeight: 380 }}>
      <PingStyle />

      <MapContainer
        center={[-28, 25]}
        zoom={5}
        style={{ width: "100%", height: "100%", minHeight: 380, background: "#060d1f" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url={tile.url} opacity={0.85} />
        <ClusterLines nodes={mergedNodes} />

        {mergedNodes.map((node, i) => (
          <Marker
            key={i}
            position={[node.lat, node.lon]}
            icon={makeIcon(STATUS_COLOR[node.status] || "#10b981", selectedNode?.label === node.label)}
            eventHandlers={{ click: () => setSelectedNode(node) }}
          />
        ))}
      </MapContainer>

      {/* Top-left: Status legend */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5 px-3 py-2.5 rounded-xl"
        style={{ background: "rgba(6,10,25,0.88)", border: "1px solid rgba(99,102,241,0.25)", backdropFilter: "blur(8px)" }}>
        {Object.entries(STATUS_COLOR).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
            <span className="text-[10px] text-slate-300 capitalize" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {status} <span className="text-slate-500">({statusCounts[status]})</span>
            </span>
          </div>
        ))}
      </div>

      {/* Top-right: tile switcher */}
      <div className="absolute top-3 right-3 z-[1000] flex gap-1.5">
        {Object.entries(TILE_LAYERS).map(([key, { label }]) => (
          <button key={key} onClick={() => setTileKey(key)}
            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all"
            style={{
              background: tileKey === key ? "rgba(99,102,241,0.4)" : "rgba(6,10,25,0.82)",
              border: `1px solid ${tileKey === key ? "rgba(99,102,241,0.7)" : "rgba(99,102,241,0.2)"}`,
              color: tileKey === key ? "#a5b4fc" : "#64748b",
              backdropFilter: "blur(6px)",
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Bottom: click hint */}
      {!selectedNode && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] px-3 py-1.5 rounded-full text-[10px] text-slate-400 pointer-events-none"
          style={{ background: "rgba(6,10,25,0.75)", border: "1px solid rgba(99,102,241,0.2)", backdropFilter: "blur(6px)", fontFamily: "'JetBrains Mono', monospace" }}>
          Click a node to view details
        </div>
      )}

      {/* Side panel */}
      {selectedNode && (
        <div className="absolute inset-y-0 right-0 z-[1000]" style={{ width: 300 }}>
          <NodeSidePanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        </div>
      )}
    </div>
  );
}