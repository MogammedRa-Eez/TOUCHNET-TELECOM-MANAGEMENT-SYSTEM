import React, { useState, useEffect, useRef } from "react";
import { MapPin, X, Search, Loader2, Wifi, ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { base44 } from "@/api/base44Client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
    if (coords) map.flyTo(coords, 15, { duration: 1.2 });
  }, [coords]);
  return null;
}

function ProviderBadge({ name, plans }) {
  const [open, setOpen] = useState(false);
  const color = PROVIDER_COLORS[name] || PROVIDER_COLORS["Other"];
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${color}30`, background: `${color}08` }}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Wifi className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold" style={{ color: "#1e293b" }}>{name}</p>
          <p className="text-[10px]" style={{ color: "#94a3b8" }}>{plans.length} plan{plans.length !== 1 ? "s" : ""} available</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
          {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-1.5" style={{ borderTop: `1px solid ${color}15` }}>
          {plans.map((plan, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: "rgba(255,255,255,0.7)", border: `1px solid ${color}20` }}>
              <span className="text-[12px] font-semibold" style={{ color: "#334155" }}>{plan.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold mono" style={{ color }}>{plan.speed}</span>
                {plan.price && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
                    R{plan.price}/mo
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CoverageChecker({ onClose }) {
  const [address, setAddress] = useState("");
  const [coords, setCoords]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col"
        style={{ background: "white", border: "1px solid rgba(6,182,212,0.2)", boxShadow: "0 24px 80px rgba(6,182,212,0.2)", maxHeight: "90vh" }}>

        <div className="h-[3px] flex-shrink-0" style={{ background: "linear-gradient(90deg,#06b6d4,#6366f1,#8b5cf6)" }} />

        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(226,232,240,0.6)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
              <MapPin className="w-4 h-4" style={{ color: "#06b6d4" }} />
            </div>
            <div>
              <p className="text-[15px] font-black" style={{ color: "#1e293b" }}>Fibre Coverage Checker</p>
              <p className="text-[10px]" style={{ color: "#94a3b8" }}>Check providers & plans at any South African address</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(226,232,240,0.4)" }}>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              className="flex-1 rounded-xl px-4 py-2.5 text-[13px] outline-none"
              style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }}
              placeholder="e.g. 10 Sandton Drive, Sandton, Johannesburg"
              value={address}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={e => e.key === "Enter" && checkCoverage()}
            />
            <button onClick={checkCoverage} disabled={loading || !address.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 4px 12px rgba(6,182,212,0.3)", whiteSpace: "nowrap" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? "Checking…" : "Check"}
            </button>
          </div>
          {error && <p className="text-[11px] mt-2 text-red-500">{error}</p>}
        </div>

        <div className="flex-shrink-0" style={{ height: 260 }}>
          <MapContainer center={coords || [-29.0, 25.0]} zoom={coords ? 15 : 5}
            style={{ width: "100%", height: "100%" }} zoomControl={true}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {coords && (
              <>
                <FlyTo coords={coords} />
                <Marker position={coords}>
                  <Popup>
                    <strong style={{ fontSize: 12 }}>{address}</strong>
                    {result && (
                      <div style={{ marginTop: 4, fontSize: 11, color: result.covered ? "#059669" : "#dc2626" }}>
                        {result.covered ? "✓ Fibre available" : "✗ No fibre coverage"}
                      </div>
                    )}
                  </Popup>
                </Marker>
                {availableProviders.map((p, i) => {
                  const color = PROVIDER_COLORS[p.name] || PROVIDER_COLORS["Other"];
                  return (
                    <Circle key={i} center={coords} radius={300 + i * 120}
                      pathOptions={{ color, fillColor: color, fillOpacity: 0.06, weight: 1.5, dashArray: "4 4" }} />
                  );
                })}
              </>
            )}
          </MapContainer>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!result && !loading && (
            <div className="text-center py-6">
              <MapPin className="w-8 h-8 mx-auto mb-2" style={{ color: "#cbd5e1" }} />
              <p className="text-[12px]" style={{ color: "#94a3b8" }}>Enter an address above to see fibre coverage and available providers.</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: "#06b6d4" }} />
              <p className="text-[12px] font-semibold" style={{ color: "#64748b" }}>Checking fibre coverage…</p>
              <p className="text-[10px] mt-1" style={{ color: "#94a3b8" }}>Geocoding address & looking up providers</p>
            </div>
          )}

          {result && (
            <>
              <div className="rounded-2xl p-4 flex items-center gap-3"
                style={{
                  background: result.covered ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)",
                  border: `1px solid ${result.covered ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                }}>
                {result.covered
                  ? <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                  : <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />}
                <div>
                  <p className="text-[14px] font-black" style={{ color: result.covered ? "#059669" : "#dc2626" }}>
                    {result.covered ? "Fibre Coverage Available" : "No Fibre Coverage Found"}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#64748b" }}>{result.summary}</p>
                </div>
              </div>

              {availableProviders.length > 0 && (
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "#94a3b8" }}>
                    Available Providers ({availableProviders.length})
                  </p>
                  <div className="space-y-2">
                    {availableProviders.map((p, i) => (
                      <ProviderBadge key={i} name={p.name} plans={p.plans || []} />
                    ))}
                  </div>
                </div>
              )}

              {unavailableProviders.length > 0 && (
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "#94a3b8" }}>
                    Not Available Here
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}