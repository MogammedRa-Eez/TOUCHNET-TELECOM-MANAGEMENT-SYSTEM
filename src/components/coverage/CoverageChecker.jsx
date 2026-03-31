import React, { useState, useEffect, useRef } from "react";
import { MapPin, X, Search, Loader2, Wifi, ChevronDown, ChevronUp, CheckCircle2, XCircle, ArrowLeftRight } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { base44 } from "@/api/base44Client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import PlanCompare from "./PlanCompare";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const PROVIDER_COLORS = {
  "Openserve":   "#0ea5e9",
  "Vumatel":     "#8b5cf6",
  "MetroFibre":  "#10b981",
  "Frogfoot":    "#f59e0b",
  "Evotel":      "#ef4444",
  "Link Africa": "#06b6d4",
  "Other":       "#64748b",
};

function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 16, { duration: 1.4 });
  }, [coords]);
  return null;
}

function ProviderBadge({ name, plans, selectedPlans, onTogglePlan }) {
  const [open, setOpen] = useState(false);
  const color = PROVIDER_COLORS[name] || PROVIDER_COLORS["Other"];

  return (
    <div className="rounded-xl overflow-hidden transition-all"
      style={{ border: `1px solid ${color}35`, background: `${color}07` }}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/60 transition-colors">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Wifi className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold" style={{ color: "#1e293b" }}>{name}</p>
          <p className="text-[11px]" style={{ color: "#94a3b8" }}>{plans.length} plan{plans.length !== 1 ? "s" : ""} available</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2" style={{ borderTop: `1px solid ${color}15` }}>
          <p className="text-[10px] font-black uppercase tracking-widest mt-3 mb-2" style={{ color: "#94a3b8" }}>Available Plans</p>
          {plans.length === 0 && <p className="text-[12px]" style={{ color: "#94a3b8" }}>No plan details available</p>}
          {plans.map((plan, i) => {
            const key = `${name}__${plan.name}__${i}`;
            const isSelected = selectedPlans.some(s => s.key === key);
            const canAdd = selectedPlans.length < 2 || isSelected;
            return (
              <div key={i} className="rounded-xl px-4 py-3"
                style={{
                  background: isSelected ? `${color}12` : "rgba(255,255,255,0.85)",
                  border: `1px solid ${isSelected ? color + "40" : color + "20"}`,
                  boxShadow: isSelected ? `0 0 0 2px ${color}25` : "none",
                }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold" style={{ color: "#334155" }}>{plan.name}</p>
                    <p className="text-[11px] font-bold mono mt-0.5" style={{ color }}>{plan.speed}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {plan.price && (
                      <div className="text-right">
                        <p className="text-[16px] font-black mono" style={{ color }}>R{plan.price}</p>
                        <p className="text-[9px] uppercase tracking-wider" style={{ color: "#94a3b8" }}>per month</p>
                      </div>
                    )}
                    <button
                      disabled={!canAdd}
                      onClick={() => onTogglePlan({ key, providerName: name, plan })}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: isSelected ? `${color}18` : "rgba(99,102,241,0.08)",
                        color: isSelected ? color : "#6366f1",
                        border: `1px solid ${isSelected ? color + "30" : "rgba(99,102,241,0.2)"}`,
                      }}>
                      {isSelected ? (
                        <><XCircle className="w-3 h-3" /> Remove</>
                      ) : (
                        <><ArrowLeftRight className="w-3 h-3" /> Compare</>
                      )}
                    </button>
                  </div>
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
  const [address, setAddress]             = useState("");
  const [coords, setCoords]               = useState(null);
  const [loading, setLoading]             = useState(false);
  const [result, setResult]               = useState(null);
  const [error, setError]                 = useState(null);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [showCompare, setShowCompare]     = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const togglePlan = (item) => {
    setSelectedPlans(prev => {
      const exists = prev.find(s => s.key === item.key);
      if (exists) return prev.filter(s => s.key !== item.key);
      if (prev.length >= 2) return prev;
      return [...prev, item];
    });
  };

  const geocodeAddress = async (addr) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&countrycodes=za&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (!data.length) throw new Error("Address not found. Please try a more specific address.");
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  };

  const checkCoverage = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCoords(null);
    setSelectedPlans([]);
    try {
      const latLng = await geocodeAddress(address);
      setCoords(latLng);
      const text = await base44.integrations.Core.InvokeLLM({
        add_context_from_internet: true,
        model: "gemini_3_flash",
        prompt: `For the South African address "${address}" (lat: ${latLng[0].toFixed(4)}, lon: ${latLng[1].toFixed(4)}), which fibre network providers cover this area?

Respond ONLY with a JSON object, no markdown, no extra text. Use this exact format:
{"covered":true,"summary":"Brief coverage summary for this area","providers":[{"name":"Openserve","available":true,"plans":[{"name":"Home 50","speed":"50Mbps","price":"599"}]},{"name":"Vumatel","available":false,"plans":[]}]}

Include all of these providers: Openserve, Vumatel, MetroFibre, Frogfoot, Evotel, Link Africa. Be realistic about actual fibre coverage for this specific location in South Africa.`,
      });
      const jsonMatch = typeof text === "string" ? text.match(/\{[\s\S]*\}/) : null;
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : JSON.stringify(text));
      setResult(parsed);
    } catch (e) {
      setError(e.message || "Failed to check coverage. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const availableProviders   = result?.providers?.filter(p => p.available)  || [];
  const unavailableProviders = result?.providers?.filter(p => !p.available) || [];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 lg:p-6"
        style={{ background: "rgba(15,23,42,0.75)", backdropFilter: "blur(10px)" }}>
        <div className="w-full rounded-3xl overflow-hidden flex flex-col lg:flex-row"
          style={{
            background: "white",
            border: "1px solid rgba(6,182,212,0.2)",
            boxShadow: "0 32px 100px rgba(6,182,212,0.25)",
            maxHeight: "95vh",
            maxWidth: 1100,
            height: "90vh",
          }}>

          {/* LEFT: Map */}
          <div className="flex flex-col" style={{ flex: "1 1 60%", minWidth: 0 }}>
            <div className="h-[3px] flex-shrink-0" style={{ background: "linear-gradient(90deg,#06b6d4,#6366f1,#8b5cf6)" }} />
            <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(226,232,240,0.6)", background: "rgba(248,250,252,0.5)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
                  <MapPin className="w-4 h-4" style={{ color: "#06b6d4" }} />
                </div>
                <div>
                  <p className="text-[15px] font-black" style={{ color: "#1e293b" }}>Fibre Coverage Checker</p>
                  <p className="text-[10px]" style={{ color: "#94a3b8" }}>South African address lookup with real-time provider data</p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(226,232,240,0.5)" }}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
                  <input
                    ref={inputRef}
                    className="w-full rounded-xl pl-9 pr-4 py-2.5 text-[13px] outline-none"
                    style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }}
                    placeholder="e.g. 10 Sandton Drive, Sandton, Johannesburg"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && checkCoverage()}
                  />
                </div>
                <button onClick={checkCoverage} disabled={loading || !address.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 4px 12px rgba(6,182,212,0.3)", whiteSpace: "nowrap" }}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {loading ? "Checking…" : "Check Coverage"}
                </button>
              </div>
              {error && <p className="text-[11px] mt-2 text-red-500 font-medium">{error}</p>}
            </div>

            {/* MAP */}
            <div className="flex-1 relative" style={{ minHeight: 0 }}>
              <MapContainer
                center={coords || [-29.0, 25.0]}
                zoom={coords ? 16 : 5}
                style={{ width: "100%", height: "100%" }}
                zoomControl={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {coords && (
                  <>
                    <FlyTo coords={coords} />
                    <Marker position={coords}>
                      <Popup>
                        <div style={{ fontFamily: "sans-serif", fontSize: 12, maxWidth: 200 }}>
                          <strong>{address}</strong>
                          {result && (
                            <div style={{ marginTop: 6, color: result.covered ? "#059669" : "#dc2626", fontWeight: 700 }}>
                              {result.covered ? "✓ Fibre Available" : "✗ No Coverage"}
                            </div>
                          )}
                          {result?.summary && (
                            <div style={{ marginTop: 4, color: "#64748b", fontSize: 11 }}>{result.summary}</div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                    {availableProviders.map((p, i) => {
                      const color = PROVIDER_COLORS[p.name] || PROVIDER_COLORS["Other"];
                      return (
                        <Circle key={i} center={coords} radius={400 + i * 150}
                          pathOptions={{ color, fillColor: color, fillOpacity: 0.07, weight: 2, dashArray: "6 5" }} />
                      );
                    })}
                  </>
                )}
              </MapContainer>

              {result && availableProviders.length > 0 && (
                <div className="absolute bottom-4 left-4 z-[1000] rounded-2xl px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}>
                  <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: "#94a3b8" }}>Coverage Circles</p>
                  {availableProviders.map((p, i) => {
                    const color = PROVIDER_COLORS[p.name] || PROVIDER_COLORS["Other"];
                    return (
                      <div key={i} className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-1.5 rounded-full" style={{ background: color, opacity: 0.7 }} />
                        <span className="text-[11px] font-semibold" style={{ color: "#475569" }}>{p.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)" }}>
                  <Loader2 className="w-8 h-8 animate-spin mb-3" style={{ color: "#06b6d4" }} />
                  <p className="text-[14px] font-bold" style={{ color: "#1e293b" }}>Checking fibre coverage…</p>
                  <p className="text-[11px] mt-1" style={{ color: "#94a3b8" }}>Geocoding address & looking up providers</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col overflow-hidden"
            style={{ flex: "0 0 380px", borderLeft: "1px solid rgba(226,232,240,0.7)", background: "rgba(248,250,252,0.4)" }}>
            <div className="px-5 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(226,232,240,0.6)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-black" style={{ color: "#1e293b" }}>Coverage Results</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#94a3b8" }}>
                    {result ? `${availableProviders.length} provider${availableProviders.length !== 1 ? "s" : ""} available` : "Search an address to see results"}
                  </p>
                </div>
                {selectedPlans.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)" }}>
                      {selectedPlans.length}/2
                    </span>
                    {selectedPlans.length === 2 && (
                      <button onClick={() => setShowCompare(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white transition-all hover:scale-105 active:scale-95"
                        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 3px 10px rgba(99,102,241,0.3)" }}>
                        <ArrowLeftRight className="w-3.5 h-3.5" /> Compare
                      </button>
                    )}
                  </div>
                )}
              </div>
              {selectedPlans.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {selectedPlans.map((s, i) => {
                    const color = PROVIDER_COLORS[s.providerName] || PROVIDER_COLORS["Other"];
                    return (
                      <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold"
                        style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}>
                        <span>{s.providerName} — {s.plan.name}</span>
                        <button onClick={() => togglePlan(s)} className="hover:opacity-60"><X className="w-3 h-3" /></button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {!result && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.15)" }}>
                    <MapPin className="w-7 h-7" style={{ color: "#06b6d4" }} />
                  </div>
                  <p className="text-[14px] font-bold mb-1" style={{ color: "#1e293b" }}>Check Your Coverage</p>
                  <p className="text-[12px]" style={{ color: "#94a3b8" }}>
                    Enter any South African address to see which fibre providers are available and their plans.
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Loader2 className="w-7 h-7 animate-spin mb-3" style={{ color: "#06b6d4" }} />
                  <p className="text-[13px] font-semibold" style={{ color: "#475569" }}>Fetching provider data…</p>
                </div>
              )}

              {result && (
                <>
                  <div className="rounded-2xl p-4 flex items-start gap-3"
                    style={{
                      background: result.covered ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)",
                      border: `1px solid ${result.covered ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
                    }}>
                    {result.covered
                      ? <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                      : <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-[14px] font-black leading-tight" style={{ color: result.covered ? "#059669" : "#dc2626" }}>
                        {result.covered ? "Fibre Coverage Available" : "No Fibre Coverage Found"}
                      </p>
                      <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "#64748b" }}>{result.summary}</p>
                    </div>
                  </div>

                  {availableProviders.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>
                          Available ({availableProviders.length})
                        </p>
                        <p className="text-[9px]" style={{ color: "#94a3b8" }}>— tap a plan to compare</p>
                      </div>
                      <div className="space-y-2">
                        {availableProviders.map((p, i) => (
                          <ProviderBadge key={i} name={p.name} plans={p.plans || []}
                            selectedPlans={selectedPlans} onTogglePlan={togglePlan} />
                        ))}
                      </div>
                    </div>
                  )}

                  {unavailableProviders.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-2 px-1" style={{ color: "#94a3b8" }}>
                        Not Available ({unavailableProviders.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {unavailableProviders.map((p, i) => (
                          <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold"
                            style={{ background: "rgba(241,245,249,0.9)", color: "#94a3b8", border: "1px solid rgba(226,232,240,0.8)" }}>
                            <XCircle className="w-3 h-3" /> {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl px-4 py-3 text-center"
                    style={{ background: "rgba(6,182,212,0.05)", border: "1px dashed rgba(6,182,212,0.2)" }}>
                    <p className="text-[11px]" style={{ color: "#94a3b8" }}>Search a different address to compare coverage areas</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCompare && selectedPlans.length === 2 && (
        <PlanCompare plans={selectedPlans} onClose={() => setShowCompare(false)} />
      )}
    </>
  );
}