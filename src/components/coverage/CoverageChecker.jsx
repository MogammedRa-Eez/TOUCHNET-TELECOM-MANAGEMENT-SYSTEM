import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import {
  X, MapPin, CheckCircle2, XCircle, Loader2, Wifi, Zap,
  ChevronRight, BarChart3, Search, Info, Check, Minus
} from "lucide-react";
import { base44 } from "@/api/base44Client";

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const FIBRE_PROVIDERS = [
  {
    id: "vumatel", name: "Vumatel", color: "#f59e0b", logo: "V",
    areas: ["Sandton", "Rosebank", "Fourways", "Midrand", "Centurion", "Bryanston", "Randburg", "Northriding"],
    plans: [
      { speed: "20/10 Mbps", price: 499, label: "Basic" },
      { speed: "50/25 Mbps", price: 699, label: "Standard" },
      { speed: "100/50 Mbps", price: 899, label: "Premium" },
      { speed: "200/100 Mbps", price: 1299, label: "Ultra" },
    ],
  },
  {
    id: "openserve", name: "Openserve", color: "#3b82f6", logo: "O",
    areas: ["Johannesburg CBD", "Soweto", "Germiston", "Benoni", "Boksburg", "Springs", "Alberton"],
    plans: [
      { speed: "10/10 Mbps", price: 399, label: "Basic" },
      { speed: "50/50 Mbps", price: 699, label: "Standard" },
      { speed: "100/100 Mbps", price: 999, label: "Premium" },
      { speed: "1 Gbps", price: 1799, label: "Giga" },
    ],
  },
  {
    id: "frogfoot", name: "Frogfoot", color: "#10b981", logo: "F",
    areas: ["Pretoria", "Centurion", "Hatfield", "Menlyn", "Lynnwood", "Garsfontein"],
    plans: [
      { speed: "25/25 Mbps", price: 549, label: "Starter" },
      { speed: "50/50 Mbps", price: 749, label: "Standard" },
      { speed: "100/100 Mbps", price: 949, label: "Premium" },
      { speed: "200/200 Mbps", price: 1349, label: "Ultra" },
    ],
  },
  {
    id: "metrofibre", name: "MetroFibre", color: "#8b5cf6", logo: "M",
    areas: ["Midrand", "Waterfall", "Kyalami", "Sunninghill", "Rivonia", "Morningside"],
    plans: [
      { speed: "20/20 Mbps", price: 449, label: "Home 20" },
      { speed: "50/50 Mbps", price: 649, label: "Home 50" },
      { speed: "100/100 Mbps", price: 849, label: "Home 100" },
      { speed: "500/500 Mbps", price: 1499, label: "Home 500" },
      { speed: "1 Gbps", price: 1999, label: "Home Giga" },
    ],
  },
];

const TOUCHNET_PLANS = [
  { key: "basic_10mbps", label: "Basic", speed: "10 Mbps", price: 399, color: "#06b6d4", popular: false,
    features: ["Uncapped", "Email Support", "99.5% SLA", "Standard Install"] },
  { key: "standard_50mbps", label: "Standard", speed: "50 Mbps", price: 599, color: "#6366f1", popular: true,
    features: ["Uncapped", "Priority Support", "99.7% SLA", "Free Router", "Static IP Option"] },
  { key: "premium_100mbps", label: "Premium", speed: "100 Mbps", price: 799, color: "#8b5cf6", popular: false,
    features: ["Uncapped", "24/7 Phone Support", "99.9% SLA", "Free Router", "Static IP Included"] },
  { key: "enterprise_500mbps", label: "Enterprise", speed: "500 Mbps", price: 1299, color: "#f59e0b", popular: false,
    features: ["Uncapped", "Dedicated Account Manager", "99.95% SLA", "Free Router", "2× Static IPs", "Business Queue"] },
  { key: "dedicated_1gbps", label: "Dedicated 1G", speed: "1 Gbps", price: 1899, color: "#10b981", popular: false,
    features: ["Uncapped", "NOC 24/7 Monitoring", "Dedicated Account Manager", "99.99% SLA", "4× Static IPs", "Dedicated Bandwidth", "SLA Credits"] },
];

const ALL_FEATURES = [
  "Uncapped","Email Support","Priority Support","24/7 Phone Support",
  "Dedicated Account Manager","NOC 24/7 Monitoring","Free Router",
  "Static IP Option","Static IP Included","2× Static IPs","4× Static IPs",
  "Business Queue","Dedicated Bandwidth","SLA Credits",
  "99.5% SLA","99.7% SLA","99.9% SLA","99.95% SLA","99.99% SLA",
];

const COVERAGE_ZONES = [
  { lat: -26.1076, lng: 28.0567, radius: 8000,  provider: "vumatel",    label: "Sandton / Rosebank" },
  { lat: -26.0274, lng: 28.0040, radius: 10000, provider: "vumatel",    label: "Fourways / Bryanston" },
  { lat: -25.9989, lng: 28.1269, radius: 6000,  provider: "openserve",  label: "Midrand" },
  { lat: -26.2041, lng: 28.0473, radius: 12000, provider: "openserve",  label: "Johannesburg CBD" },
  { lat: -25.8553, lng: 28.1884, radius: 9000,  provider: "frogfoot",   label: "Pretoria / Hatfield" },
  { lat: -25.8600, lng: 28.1600, radius: 7000,  provider: "frogfoot",   label: "Menlyn / Lynnwood" },
  { lat: -26.0270, lng: 28.1130, radius: 7500,  provider: "metrofibre", label: "Waterfall / Kyalami" },
  { lat: -26.0598, lng: 28.0600, radius: 6000,  provider: "metrofibre", label: "Sunninghill / Rivonia" },
];

const PROVIDER_COLORS = { vumatel: "#f59e0b", openserve: "#3b82f6", frogfoot: "#10b981", metrofibre: "#8b5cf6" };

async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ", South Africa")}&format=json&limit=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

function getProvidersAtPoint(lat, lng) {
  return COVERAGE_ZONES.filter(zone => {
    const d = Math.sqrt(
      Math.pow((lat - zone.lat) * 111320, 2) +
      Math.pow((lng - zone.lng) * 111320 * Math.cos(lat * Math.PI / 180), 2)
    );
    return d <= zone.radius;
  });
}

function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords) map.flyTo([coords.lat, coords.lng], 13, { duration: 1.5 }); }, [coords]);
  return null;
}

function PlanCompareTable({ selectedPlans, onTogglePlan }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ fontSize: 12 }}>
        <thead>
          <tr>
            <th className="text-left py-3 px-4 sticky left-0 z-10"
              style={{ color: "#94a3b8", background: "#f8fafc", minWidth: 140, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Feature
            </th>
            {TOUCHNET_PLANS.map(plan => {
              const sel = selectedPlans.includes(plan.key);
              return (
                <th key={plan.key} className="px-3 py-3 text-center" style={{ minWidth: 120 }}>
                  <button onClick={() => onTogglePlan(plan.key)} className="w-full rounded-xl px-2 py-2 transition-all"
                    style={{ background: sel ? `${plan.color}15` : "rgba(241,245,249,0.8)", border: `2px solid ${sel ? plan.color : "rgba(226,232,240,0.8)"}` }}>
                    <p style={{ fontWeight: 900, fontSize: 13, color: sel ? plan.color : "#94a3b8" }}>{plan.label}</p>
                    <p style={{ fontWeight: 900, fontSize: 16, color: sel ? plan.color : "#64748b", fontFamily: "monospace" }}>R{plan.price}</p>
                    <p style={{ fontSize: 10, color: "#94a3b8" }}>{plan.speed}</p>
                    {plan.popular && (
                      <span style={{ display: "inline-block", marginTop: 4, fontSize: 9, fontWeight: 700,
                        padding: "2px 6px", borderRadius: 9999, background: `${plan.color}20`, color: plan.color }}>
                        POPULAR
                      </span>
                    )}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {ALL_FEATURES.map((feature, i) => (
            <tr key={feature} style={{ background: i % 2 === 0 ? "rgba(248,250,252,0.5)" : "white" }}>
              <td className="py-2 px-4 sticky left-0 z-10"
                style={{ color: "#475569", fontSize: 11, fontWeight: 600, background: i % 2 === 0 ? "rgba(248,250,252,0.95)" : "white" }}>
                {feature}
              </td>
              {TOUCHNET_PLANS.map(plan => {
                const has = plan.features.includes(feature);
                const sel = selectedPlans.includes(plan.key);
                return (
                  <td key={plan.key} className="py-2 px-3 text-center">
                    {has
                      ? <Check className="w-4 h-4 mx-auto" style={{ color: sel ? plan.color : "#10b981" }} />
                      : <Minus className="w-3 h-3 mx-auto" style={{ color: "#e2e8f0" }} />}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr style={{ background: "rgba(99,102,241,0.04)", borderTop: "2px solid rgba(99,102,241,0.1)" }}>
            <td className="py-3 px-4 sticky left-0 z-10"
              style={{ fontWeight: 900, fontSize: 12, color: "#1e293b", background: "rgba(248,250,252,0.98)" }}>
              Monthly Price
            </td>
            {TOUCHNET_PLANS.map(plan => {
              const sel = selectedPlans.includes(plan.key);
              return (
                <td key={plan.key} className="py-3 px-3 text-center">
                  <p style={{ fontWeight: 900, fontSize: 15, color: sel ? plan.color : "#64748b", fontFamily: "monospace" }}>R{plan.price}</p>
                  <p style={{ fontSize: 9, color: "#94a3b8" }}>per month</p>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function CoverageChecker({ onClose }) {
  const [address, setAddress] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [activeTab, setActiveTab] = useState("map");
  const [selectedPlans, setSelectedPlans] = useState(["standard_50mbps", "premium_100mbps"]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    setSearching(true);
    const coords = await geocodeAddress(address);
    if (coords) {
      const zones = getProvidersAtPoint(coords.lat, coords.lng);
      setSearchResult({ coords, zones, covered: zones.length > 0 });
    } else {
      setSearchResult({ coords: null, zones: [], covered: false, notFound: true });
    }
    setSearching(false);
  };

  const togglePlan = (key) => {
    setSelectedPlans(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const TABS = [
    { key: "map", label: "Coverage Map", icon: MapPin },
    { key: "providers", label: "Fibre Providers", icon: Wifi },
    { key: "compare", label: "Compare Plans", icon: BarChart3 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-5xl flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#f8fafc", border: "1px solid rgba(6,182,212,0.2)", maxHeight: "95vh" }}>

        {/* Header */}
        <div className="flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)", borderBottom: "1px solid rgba(6,182,212,0.2)" }}>
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#06b6d4,#6366f1,#8b5cf6,#10b981)" }} />
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)" }}>
                <MapPin className="w-5 h-5" style={{ color: "#06b6d4" }} />
              </div>
              <div>
                <p className="text-[15px] font-black text-white">Fibre Coverage & Plans</p>
                <p className="text-[11px]" style={{ color: "rgba(6,182,212,0.7)" }}>Check coverage · Compare providers · Find your plan</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex px-5 gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-bold rounded-t-xl transition-all"
                  style={{ background: active ? "#f8fafc" : "transparent", color: active ? "#1e293b" : "rgba(255,255,255,0.45)" }}>
                  <Icon className="w-3.5 h-3.5" />{tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>

          {/* MAP TAB */}
          {activeTab === "map" && (
            <div className="flex flex-col" style={{ height: "100%", minHeight: 540 }}>
              <div className="flex-shrink-0 px-5 py-4"
                style={{ background: "white", borderBottom: "1px solid rgba(226,232,240,0.8)" }}>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
                    <input value={address} onChange={e => setAddress(e.target.value)}
                      placeholder="Enter your address to check coverage…"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] outline-none"
                      style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }} />
                  </div>
                  <button type="submit" disabled={searching || !address.trim()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-60 flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)", boxShadow: "0 4px 12px rgba(6,182,212,0.3)" }}>
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Check
                  </button>
                </form>
                {searchResult && (
                  <div className="mt-3 rounded-xl px-4 py-3 flex items-start gap-3"
                    style={{
                      background: searchResult.notFound ? "rgba(245,158,11,0.07)" : searchResult.covered ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)",
                      border: `1px solid ${searchResult.notFound ? "rgba(245,158,11,0.25)" : searchResult.covered ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"}`,
                    }}>
                    {searchResult.notFound ? (
                      <><Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
                        <p className="text-[12px]" style={{ color: "#92400e" }}>Address not found. Try a more specific address including suburb and city.</p></>
                    ) : searchResult.covered ? (
                      <><CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#10b981" }} />
                        <div>
                          <p className="text-[13px] font-bold" style={{ color: "#059669" }}>
                            Fibre Available! {searchResult.zones.length} provider{searchResult.zones.length > 1 ? "s" : ""} in your area
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {[...new Set(searchResult.zones.map(z => z.provider))].map(pid => {
                              const p = FIBRE_PROVIDERS.find(x => x.id === pid);
                              return p ? (
                                <span key={pid} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                  style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}30` }}>
                                  {p.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div></>
                    ) : (
                      <><XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
                        <div>
                          <p className="text-[13px] font-bold" style={{ color: "#dc2626" }}>Not currently in a covered area</p>
                          <p className="text-[11px] mt-0.5" style={{ color: "#ef4444" }}>Call 010 060 0400 — we may be expanding to your area soon.</p>
                        </div></>
                    )}
                  </div>
                )}
              </div>

              {/* Map */}
              <div className="relative flex-1" style={{ minHeight: 380 }}>
                <MapContainer center={[-26.05, 28.05]} zoom={11}
                  style={{ height: "100%", width: "100%", minHeight: 380 }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  {COVERAGE_ZONES.map((zone, i) => (
                    <Circle key={i} center={[zone.lat, zone.lng]} radius={zone.radius}
                      pathOptions={{ color: PROVIDER_COLORS[zone.provider], fillColor: PROVIDER_COLORS[zone.provider], fillOpacity: 0.15, weight: 2, opacity: 0.6 }}>
                      <Popup>
                        <div style={{ fontFamily: "sans-serif", minWidth: 140 }}>
                          <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 4px 0" }}>{zone.label}</p>
                          <span style={{ background: PROVIDER_COLORS[zone.provider], color: "white", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                            {FIBRE_PROVIDERS.find(x => x.id === zone.provider)?.name}
                          </span>
                        </div>
                      </Popup>
                    </Circle>
                  ))}
                  {searchResult?.coords && (
                    <>
                      <FlyTo coords={searchResult.coords} />
                      <Marker position={[searchResult.coords.lat, searchResult.coords.lng]}>
                        <Popup>
                          <div style={{ fontFamily: "sans-serif" }}>
                            <p style={{ fontWeight: 700, fontSize: 12, margin: "0 0 4px" }}>Your Location</p>
                            <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
                              {searchResult.covered ? `${searchResult.zones.length} provider(s) available` : "No coverage"}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    </>
                  )}
                </MapContainer>
                {/* Legend */}
                <div className="absolute bottom-4 left-4 z-[1000] rounded-xl px-3 py-2.5 shadow-lg"
                  style={{ background: "rgba(255,255,255,0.96)", border: "1px solid rgba(226,232,240,0.8)" }}>
                  <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: 6 }}>Providers</p>
                  {FIBRE_PROVIDERS.map(p => (
                    <div key={p.id} className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PROVIDERS TAB */}
          {activeTab === "providers" && (
            <div className="p-5 space-y-4">
              <p style={{ fontSize: 13, color: "#64748b" }}>TouchNet is an ISP that uses the following fibre network providers. Coverage depends on which network is available at your address.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FIBRE_PROVIDERS.map(provider => (
                  <div key={provider.id} className="rounded-2xl overflow-hidden"
                    style={{ background: "white", border: `1px solid ${provider.color}25`, boxShadow: `0 4px 20px ${provider.color}08` }}>
                    <div className="h-[3px]" style={{ background: `linear-gradient(90deg,${provider.color},transparent)` }} />
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-[14px]"
                          style={{ background: `linear-gradient(135deg,${provider.color},${provider.color}99)` }}>
                          {provider.logo}
                        </div>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 900, color: "#1e293b" }}>{provider.name}</p>
                          <p style={{ fontSize: 11, color: "#94a3b8" }}>{provider.areas.length} covered areas</p>
                        </div>
                      </div>
                      <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: 6 }}>Covered Areas</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {provider.areas.map(area => (
                          <span key={area} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 9999, background: `${provider.color}10`, color: provider.color, border: `1px solid ${provider.color}20` }}>
                            {area}
                          </span>
                        ))}
                      </div>
                      <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: 6 }}>Available Plans</p>
                      <div className="space-y-1.5">
                        {provider.plans.map(plan => (
                          <div key={plan.speed} className="flex items-center justify-between rounded-lg px-3 py-2"
                            style={{ background: `${provider.color}07`, border: `1px solid ${provider.color}15` }}>
                            <div className="flex items-center gap-2">
                              <Zap className="w-3 h-3" style={{ color: provider.color }} />
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{plan.label}</span>
                              <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{plan.speed}</span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 900, color: provider.color, fontFamily: "monospace" }}>R{plan.price}/mo</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMPARE TAB */}
          {activeTab === "compare" && (
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#6366f1" }} />
                <p style={{ fontSize: 12, color: "#475569" }}>Click any plan header to highlight it. Compare features side-by-side to find the right plan for you.</p>
              </div>
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "white", border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 2px 16px rgba(99,102,241,0.06)" }}>
                <PlanCompareTable selectedPlans={selectedPlans} onTogglePlan={togglePlan} />
              </div>
              <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4"
                style={{ background: "linear-gradient(135deg,rgba(6,182,212,0.08),rgba(99,102,241,0.06))", border: "1px solid rgba(6,182,212,0.15)" }}>
                <div className="flex-1">
                  <p style={{ fontSize: 14, fontWeight: 900, color: "#1e293b" }}>Ready to connect?</p>
                  <p style={{ fontSize: 12, marginTop: 2, color: "#64748b" }}>
                    Call us on <strong style={{ color: "#06b6d4" }}>010 060 0400</strong> or email <strong style={{ color: "#6366f1" }}>sales@touchnet.co.za</strong>
                  </p>
                </div>
                <button onClick={onClose}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-bold text-white transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 4px 16px rgba(6,182,212,0.3)" }}>
                  Get Connected <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}