import React, { useState, useEffect, useRef } from "react";
import { X, MapPin, CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import "leaflet/dist/leaflet.css";

const NODE_STATUS_CFG = {
  online:      { color: "#10b981", border: "#059669", label: "Online",      emoji: "✅" },
  degraded:    { color: "#f59e0b", border: "#d97706", label: "Degraded",    emoji: "⚠️" },
  maintenance: { color: "#6366f1", border: "#4f46e5", label: "Maintenance", emoji: "🔧" },
  offline:     { color: "#ef4444", border: "#dc2626", label: "Offline",     emoji: "🔴" },
};

async function geocodeLocation(locationStr) {
  if (!locationStr) return null;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationStr)}&limit=1`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await res.json();
  if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  return null;
}

export default function CoverageChecker({ onClose }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const nodeMarkersRef = useRef([]);
  const [address, setAddress] = useState("");
  const [searchStatus, setSearchStatus] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [nodesLoading, setNodesLoading] = useState(true);
  const [overlayReady, setOverlayReady] = useState(false);
  const [statusCounts, setStatusCounts] = useState({});

  useEffect(() => {
    base44.entities.NetworkNode.list()
      .then(data => {
        setNodes(data);
        const counts = {};
        data.forEach(n => { counts[n.status] = (counts[n.status] || 0) + 1; });
        setStatusCounts(counts);
      })
      .catch(() => setNodes([]))
      .finally(() => setNodesLoading(false));
  }, []);

  useEffect(() => {
    async function initMap() {
      const L = await import("leaflet");
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
          placeSearchMarker(L, e.latlng.lat, e.latlng.lng, "Clicked location");
          setSearchStatus("covered");
        });
      }
    }
    initMap();
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (nodesLoading || !mapInstanceRef.current || nodes.length === 0) return;
    plotNodeMarkers();
  }, [nodesLoading, nodes]);

  const plotNodeMarkers = async () => {
    const L = await import("leaflet");
    nodeMarkersRef.current.forEach(m => m.remove());
    nodeMarkersRef.current = [];

    const results = await Promise.all(
      nodes.map(async (node) => {
        if (!node.location) return null;
        const coords = await geocodeLocation(node.location);
        return coords ? { node, coords } : null;
      })
    );

    results.filter(Boolean).forEach(({ node, coords }) => {
      const cfg = NODE_STATUS_CFG[node.status] || NODE_STATUS_CFG.online;
      const pulse = ["degraded", "offline"].includes(node.status);
      const iconHtml = `
        <div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
          ${pulse ? `<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ${cfg.color};animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;opacity:0.6;"></div>` : ""}
          <div style="width:32px;height:32px;border-radius:50%;background:${cfg.color};border:2.5px solid ${cfg.border};display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 8px ${cfg.color}66;cursor:pointer;">${cfg.emoji}</div>
        </div>
        <style>@keyframes ping{75%,100%{transform:scale(1.6);opacity:0;}}</style>
      `;
      const icon = L.divIcon({ html: iconHtml, className: "", iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -22] });
      const marker = L.marker([coords.lat, coords.lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="font-family:'Exo 2',sans-serif;min-width:180px;">
            <div style="font-weight:800;font-size:13px;color:#0f172a;margin-bottom:4px;">${node.name}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="background:${cfg.color}18;color:${cfg.color};border:1px solid ${cfg.color}40;border-radius:6px;padding:2px 8px;font-size:10px;font-weight:700;text-transform:uppercase;">${cfg.label}</span>
              <span style="font-size:10px;color:#64748b;text-transform:capitalize;">${node.type?.replace(/_/g," ") || ""}</span>
            </div>
            ${node.location ? `<div style="font-size:11px;color:#64748b;margin-bottom:2px;">📍 ${node.location}</div>` : ""}
            ${node.uptime_percent != null ? `<div style="font-size:11px;color:#64748b;">⬆ Uptime: <strong>${node.uptime_percent}%</strong></div>` : ""}
            ${node.bandwidth_utilization != null ? `<div style="font-size:11px;color:#64748b;">📶 Bandwidth: <strong>${node.bandwidth_utilization}%</strong></div>` : ""}
            ${node.connected_customers != null ? `<div style="font-size:11px;color:#64748b;">👥 Customers: <strong>${node.connected_customers}</strong></div>` : ""}
            ${node.status === "maintenance" && node.last_maintenance ? `<div style="font-size:10px;color:#6366f1;margin-top:4px;">🔧 Last maintenance: ${node.last_maintenance}</div>` : ""}
          </div>
        `);
      nodeMarkersRef.current.push(marker);
    });
    setOverlayReady(true);
  };

  const placeSearchMarker = async (L, lat, lng, label) => {
    if (!mapInstanceRef.current) return;
    if (markerRef.current) markerRef.current.remove();
    const icon = L.divIcon({
      html: `<div style="width:20px;height:20px;background:#6366f1;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(99,102,241,0.5);"></div>`,
      className: "", iconSize: [20, 20], iconAnchor: [10, 10],
    });
    markerRef.current = L.marker([lat, lng], { icon })
      .addTo(mapInstanceRef.current)
      .bindPopup(`<div style="font-family:'Exo 2',sans-serif;font-size:12px;font-weight:700;color:#6366f1;">📍 ${label}</div>`)
      .openPopup();
  };

  const handleSearch = async () => {
    if (!address.trim()) return;
    setSearchStatus("loading");
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
    const data = await res.json();
    if (data && data.length > 0) {
      const L = await import("leaflet");
      mapInstanceRef.current.setView([parseFloat(data[0].lat), parseFloat(data[0].lon)], 14);
      placeSearchMarker(L, parseFloat(data[0].lat), parseFloat(data[0].lon), address);
      setSearchStatus("covered");
    } else {
      setSearchStatus("not_found");
    }
  };

  const alertNodes = nodes.filter(n => ["offline", "degraded", "maintenance"].includes(n.status));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col"
        style={{ background: "rgba(255,255,255,0.99)", border: "1px solid rgba(6,182,212,0.2)", boxShadow: "0 32px 80px rgba(6,182,212,0.15)", maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,rgba(6,182,212,0.07),rgba(99,102,241,0.05))", borderBottom: "1px solid rgba(6,182,212,0.12)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 4px 14px rgba(6,182,212,0.35)" }}>
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-black" style={{ color: "#0f172a" }}>Coverage & Network Status</h2>
              <p className="text-[11px]" style={{ color: "#64748b" }}>Live fibre node overlay · Click the map or search an address</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Status summary strip */}
        <div className="flex items-center gap-2 px-6 py-2.5 flex-wrap flex-shrink-0"
          style={{ background: "rgba(248,250,252,0.9)", borderBottom: "1px solid rgba(226,232,240,0.6)" }}>
          <span className="text-[10px] font-black uppercase tracking-wider mr-1" style={{ color: "#94a3b8" }}>Network:</span>
          {Object.entries(NODE_STATUS_CFG).map(([key, cfg]) =>
            statusCounts[key] > 0 && (
              <span key={key} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}25` }}>
                {cfg.emoji} {statusCounts[key]} {cfg.label}
              </span>
            )
          )}
          {nodesLoading && <span className="flex items-center gap-1 text-[10px]" style={{ color: "#94a3b8" }}><Loader2 className="w-3 h-3 animate-spin" /> Loading nodes…</span>}
          {overlayReady && (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-bold" style={{ color: "#10b981" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live overlay active
            </span>
          )}
        </div>

        {/* Alerts banner */}
        {alertNodes.length > 0 && (
          <div className="px-6 py-2.5 flex items-start gap-2 flex-shrink-0"
            style={{ background: "rgba(245,158,11,0.07)", borderBottom: "1px solid rgba(245,158,11,0.18)" }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold" style={{ color: "#92400e" }}>
                {alertNodes.filter(n => n.status === "offline").length > 0 && `${alertNodes.filter(n => n.status === "offline").length} node(s) offline. `}
                {alertNodes.filter(n => n.status === "maintenance").length > 0 && `${alertNodes.filter(n => n.status === "maintenance").length} node(s) under scheduled maintenance. `}
                {alertNodes.filter(n => n.status === "degraded").length > 0 && `${alertNodes.filter(n => n.status === "degraded").length} node(s) degraded. `}
                Affected zones are marked on the map.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {alertNodes.slice(0, 5).map(n => {
                  const cfg = NODE_STATUS_CFG[n.status];
                  return (
                    <span key={n.id} className="text-[10px] px-2 py-0.5 rounded-md font-semibold"
                      style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}25` }}>
                      {n.name}
                    </span>
                  );
                })}
                {alertNodes.length > 5 && <span className="text-[10px] text-slate-400">+{alertNodes.length - 5} more</span>}
              </div>
            </div>
          </div>
        )}

        {/* Search bar */}
        <div className="px-6 py-3 flex gap-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(226,232,240,0.5)" }}>
          <input
            className="flex-1 px-4 py-2.5 rounded-xl text-[13px] outline-none"
            style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }}
            placeholder="Enter address to check coverage…"
            value={address}
            onChange={e => setAddress(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} disabled={searchStatus === "loading"}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 4px 12px rgba(6,182,212,0.3)" }}>
            {searchStatus === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            Check
          </button>
        </div>

        {/* Map */}
        <div ref={mapRef} style={{ flex: 1, minHeight: 320 }} />

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-3 flex items-center gap-4 flex-wrap"
          style={{ background: "rgba(248,250,252,0.9)", borderTop: "1px solid rgba(226,232,240,0.6)" }}>
          <div className="flex items-center gap-3 flex-wrap flex-1">
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#94a3b8" }}>Legend:</span>
            {Object.entries(NODE_STATUS_CFG).map(([key, cfg]) => (
              <span key={key} className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: cfg.color }}>
                {cfg.emoji} {cfg.label}
              </span>
            ))}
          </div>
          {searchStatus && searchStatus !== "loading" && (
            <div className="flex items-center gap-2">
              {searchStatus === "covered"
                ? <><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span className="text-[12px] font-semibold text-emerald-600">Area covered — contact us to connect!</span></>
                : <><XCircle className="w-4 h-4 text-red-400" /><span className="text-[12px] font-semibold text-red-500">Address not found. Try clicking the map.</span></>}
            </div>
          )}
          {!searchStatus && <p className="text-[11px]" style={{ color: "#94a3b8" }}>Click the map to check any location</p>}
        </div>
      </div>
    </div>
  );
}