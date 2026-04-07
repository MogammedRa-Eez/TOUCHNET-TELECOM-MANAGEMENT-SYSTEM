import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  X, MapPin, CheckCircle2, XCircle, Loader2, Wifi, ChevronDown,
  ChevronUp, BarChart2, ArrowRight, Star, Zap, Phone, Globe
} from "lucide-react";

// Fix leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const PROVIDERS = [
  {
    id: "touchnet", name: "TouchNet", color: "#7c6fe0", logo: "TN",
    coverage: [
      { lat: -26.107567, lng: 28.056702, radius: 8000, area: "Sandton / Bryanston" },
      { lat: -26.195246, lng: 28.034088, radius: 6000, area: "Johannesburg CBD" },
      { lat: -25.904747, lng: 28.186557, radius: 7000, area: "Midrand" },
      { lat: -25.860929, lng: 28.188553, radius: 5000, area: "Centurion" },
    ],
    plans: [
      { name: "Basic",      speed: "10 Mbps",  price: 399,  upload: "5 Mbps",   contention: "1:50", sla: "Best Effort" },
      { name: "Standard",   speed: "50 Mbps",  price: 699,  upload: "25 Mbps",  contention: "1:20", sla: "Best Effort" },
      { name: "Premium",    speed: "100 Mbps", price: 999,  upload: "50 Mbps",  contention: "1:10", sla: "99.5%" },
      { name: "Enterprise", speed: "500 Mbps", price: 2499, upload: "250 Mbps", contention: "1:5",  sla: "99.9%" },
      { name: "Dedicated",  speed: "1 Gbps",   price: 4999, upload: "1 Gbps",   contention: "1:1",  sla: "99.99%" },
    ],
    tech: "FTTH", contact: "0861 TOUCHNET", website: "touchnet.co.za", rating: 4.5,
  },
  {
    id: "openserve", name: "Openserve", color: "#0891b2", logo: "OS",
    coverage: [
      { lat: -26.107567, lng: 28.056702, radius: 12000, area: "Sandton / Fourways" },
      { lat: -26.195246, lng: 28.034088, radius: 10000, area: "Johannesburg South" },
      { lat: -25.745723, lng: 28.187664, radius: 9000,  area: "Pretoria" },
      { lat: -26.036808, lng: 28.029083, radius: 7000,  area: "Randburg" },
    ],
    plans: [
      { name: "Home 10",  speed: "10 Mbps",  price: 349, upload: "10 Mbps",  contention: "1:40", sla: "Best Effort" },
      { name: "Home 25",  speed: "25 Mbps",  price: 549, upload: "25 Mbps",  contention: "1:20", sla: "Best Effort" },
      { name: "Home 50",  speed: "50 Mbps",  price: 749, upload: "50 Mbps",  contention: "1:10", sla: "99%" },
      { name: "Home 100", speed: "100 Mbps", price: 999, upload: "100 Mbps", contention: "1:5",  sla: "99.5%" },
    ],
    tech: "FTTH / FTTB", contact: "0800 000 123", website: "openserve.co.za", rating: 3.8,
  },
  {
    id: "vumatel", name: "Vumatel", color: "#10b981", logo: "VM",
    coverage: [
      { lat: -26.053520, lng: 28.026240, radius: 10000, area: "Randburg / Northcliff" },
      { lat: -26.107567, lng: 28.056702, radius: 6000,  area: "Sandton" },
      { lat: -26.173049, lng: 28.076116, radius: 8000,  area: "Rosebank / Houghton" },
    ],
    plans: [
      { name: "25 Mbps",  speed: "25 Mbps",  price: 499,  upload: "25 Mbps",  contention: "1:30", sla: "Best Effort" },
      { name: "50 Mbps",  speed: "50 Mbps",  price: 699,  upload: "50 Mbps",  contention: "1:15", sla: "99%" },
      { name: "100 Mbps", speed: "100 Mbps", price: 899,  upload: "100 Mbps", contention: "1:8",  sla: "99.5%" },
      { name: "200 Mbps", speed: "200 Mbps", price: 1299, upload: "200 Mbps", contention: "1:4",  sla: "99.9%" },
    ],
    tech: "FTTH", contact: "0861 VUMATEL", website: "vumatel.co.za", rating: 4.2,
  },
  {
    id: "frogfoot", name: "Frogfoot", color: "#f59e0b", logo: "FF",
    coverage: [
      { lat: -25.860929, lng: 28.188553, radius: 8000, area: "Centurion / Irene" },
      { lat: -25.745723, lng: 28.187664, radius: 6000, area: "Pretoria East" },
      { lat: -25.904747, lng: 28.186557, radius: 5000, area: "Midrand" },
    ],
    plans: [
      { name: "25 Mbps",  speed: "25 Mbps",  price: 449, upload: "12 Mbps", contention: "1:25", sla: "Best Effort" },
      { name: "50 Mbps",  speed: "50 Mbps",  price: 649, upload: "25 Mbps", contention: "1:12", sla: "99%" },
      { name: "100 Mbps", speed: "100 Mbps", price: 849, upload: "50 Mbps", contention: "1:6",  sla: "99.5%" },
    ],
    tech: "FTTH", contact: "0861 FROGFOOT", website: "frogfoot.com", rating: 4.0,
  },
];

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getAvailableProviders(lat, lng) {
  return PROVIDERS.filter(p => p.coverage.some(z => getDistance(lat, lng, z.lat, z.lng) <= z.radius));
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className="w-3 h-3" style={{ color: s <= Math.round(rating) ? "#f59e0b" : "#e2e8f0", fill: s <= Math.round(rating) ? "#f59e0b" : "transparent" }} />
      ))}
      <span className="text-[10px] font-bold ml-1" style={{ color: "#64748b" }}>{rating}</span>
    </div>
  );
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords) map.flyTo([coords.lat, coords.lng], 14, { duration: 1.2 }); }, [coords, map]);
  return null;
}

function ProviderCard({ provider, selected, onToggle, compareList, onCompareToggle }) {
  const cheapest = provider.plans.reduce((a, b) => a.price < b.price ? a : b);
  const fastest  = provider.plans.reduce((a, b) => parseInt(a.speed) > parseInt(b.speed) ? a : b);
  const inCompare = compareList.includes(provider.id);

  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{ border: `2px solid ${selected ? provider.color : "rgba(226,232,240,0.8)"}`, background: selected ? `${provider.color}06` : "rgba(255,255,255,0.98)", boxShadow: selected ? `0 4px 20px ${provider.color}20` : "0 2px 8px rgba(0,0,0,0.04)" }}>
      <button className="w-full flex items-center gap-3 px-4 py-3 text-left" onClick={onToggle}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black text-white flex-shrink-0" style={{ background: provider.color }}>{provider.logo}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-black" style={{ color: "#1e293b" }}>{provider.name}</p>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${provider.color}15`, color: provider.color }}>{provider.tech}</span>
          </div>
          <p className="text-[10px]" style={{ color: "#94a3b8" }}>From R{cheapest.price}/mo · Up to {fastest.speed}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onCompareToggle(provider.id); }}
            className="text-[10px] font-bold px-2 py-1 rounded-lg transition-all"
            style={{ background: inCompare ? provider.color : "rgba(226,232,240,0.8)", color: inCompare ? "#fff" : "#64748b" }}>
            {inCompare ? "✓ Compare" : "+ Compare"}
          </button>
          {selected ? <ChevronUp className="w-4 h-4" style={{ color: provider.color }} /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
        </div>
      </button>
      {selected && (
        <div style={{ borderTop: `1px solid ${provider.color}20` }}>
          <div className="px-4 py-2 flex flex-wrap gap-3">
            <StarRating rating={provider.rating} />
            <span className="text-[10px] flex items-center gap-1" style={{ color: "#64748b" }}><Phone className="w-3 h-3" /> {provider.contact}</span>
            <span className="text-[10px] flex items-center gap-1" style={{ color: "#64748b" }}><Globe className="w-3 h-3" /> {provider.website}</span>
          </div>
          <div className="px-3 pb-3 space-y-1.5">
            {provider.plans.map(plan => (
              <div key={plan.name} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.7)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold" style={{ color: "#1e293b" }}>{plan.name}</p>
                  <p className="text-[10px]" style={{ color: "#94a3b8" }}>↑ {plan.upload} · {plan.contention} · SLA: {plan.sla}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[14px] font-black" style={{ color: provider.color }}>R{plan.price}</p>
                  <p className="text-[10px] font-semibold" style={{ color: "#64748b" }}>{plan.speed}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ComparePanel({ compareList, onClose }) {
  const providers = PROVIDERS.filter(p => compareList.includes(p.id));
  if (providers.length < 2) return null;
  const allSpeeds = [...new Set(providers.flatMap(p => p.plans.map(pl => pl.speed)))].sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-white" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#7c6fe0,#10b981,#0891b2)" }} />
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(226,232,240,0.8)" }}>
          <div className="flex items-center gap-2"><BarChart2 className="w-5 h-5" style={{ color: "#7c6fe0" }} /><h2 className="text-[15px] font-black" style={{ color: "#1e293b" }}>Provider Comparison</h2></div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100"><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(243,240,253,0.6)" }}>
                <th className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider" style={{ color: "#64748b", width: 160 }}>Feature</th>
                {providers.map(p => (
                  <th key={p.id} className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-white" style={{ background: p.color }}>{p.logo}</div>
                      <span className="text-[12px] font-black" style={{ color: "#1e293b" }}>{p.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid rgba(226,232,240,0.5)" }}>
                <td className="px-4 py-3 text-[11px] font-bold" style={{ color: "#64748b" }}>Technology</td>
                {providers.map(p => <td key={p.id} className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: p.color }}>{p.tech}</td>)}
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(226,232,240,0.5)" }}>
                <td className="px-4 py-3 text-[11px] font-bold" style={{ color: "#64748b" }}>Rating</td>
                {providers.map(p => <td key={p.id} className="px-4 py-3"><div className="flex justify-center"><StarRating rating={p.rating} /></div></td>)}
              </tr>
              <tr style={{ background: "rgba(243,240,253,0.4)" }}>
                <td colSpan={providers.length + 1} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest" style={{ color: "#9b8fef" }}>Plans & Pricing</td>
              </tr>
              {allSpeeds.map(speed => (
                <tr key={speed} style={{ borderBottom: "1px solid rgba(226,232,240,0.4)" }}>
                  <td className="px-4 py-3"><div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} /><span className="text-[12px] font-bold" style={{ color: "#1e293b" }}>{speed}</span></div></td>
                  {providers.map(p => {
                    const plan = p.plans.find(pl => pl.speed === speed);
                    return (
                      <td key={p.id} className="px-4 py-3 text-center">
                        {plan ? (
                          <div>
                            <p className="text-[14px] font-black" style={{ color: p.color }}>R{plan.price}<span className="text-[10px] font-normal text-slate-400">/mo</span></p>
                            <p className="text-[10px]" style={{ color: "#94a3b8" }}>↑ {plan.upload} · SLA: {plan.sla}</p>
                          </div>
                        ) : <span className="text-[11px]" style={{ color: "#cbd5e1" }}>—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr style={{ borderBottom: "1px solid rgba(226,232,240,0.5)" }}>
                <td className="px-4 py-3 text-[11px] font-bold" style={{ color: "#64748b" }}>Contact</td>
                {providers.map(p => <td key={p.id} className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: p.color }}>{p.contact}</td>)}
              </tr>
              <tr>
                <td className="px-4 py-3 text-[11px] font-bold" style={{ color: "#64748b" }}>Website</td>
                {providers.map(p => <td key={p.id} className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: p.color }}>{p.website}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function CoverageChecker({ onClose }) {
  const [selectedProviders, setSelectedProviders] = useState(new Set());
  const [pinCoords, setPinCoords] = useState(null);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [address, setAddress] = useState("");
  const [searching, setSearching] = useState(false);
  const [flyTo, setFlyTo] = useState(null);
  const [showAllProviders, setShowAllProviders] = useState(true);

  const defaultCenter = [-26.107567, 28.056702];

  const handleMapClick = (lat, lng) => {
    setPinCoords({ lat, lng });
    setAvailableProviders(getAvailableProviders(lat, lng));
  };

  const handleAddressSearch = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    setSearching(true);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", South Africa")}&limit=1`);
    const data = await res.json();
    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      setPinCoords({ lat, lng });
      setFlyTo({ lat, lng });
      setAvailableProviders(getAvailableProviders(lat, lng));
    }
    setSearching(false);
  };

  const toggleProvider = (id) => setSelectedProviders(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleCompare  = (id) => setCompareList(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev);

  const displayedProviders = (showAllProviders || !pinCoords) ? PROVIDERS : availableProviders;

  return (
    <>
      {showCompare && compareList.length >= 2 && <ComparePanel compareList={compareList} onClose={() => setShowCompare(false)} />}

      <div className="fixed inset-0 z-50 flex flex-col lg:flex-row overflow-hidden" style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(10px)" }}>

        {/* Left panel */}
        <div className="w-full lg:w-[380px] flex flex-col flex-shrink-0 bg-white overflow-hidden" style={{ maxHeight: "100vh" }}>
          <div className="h-[3px] flex-shrink-0" style={{ background: "linear-gradient(90deg,#7c6fe0,#9b8fef,#c4bcf7)" }} />

          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(155,143,239,0.15)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(155,143,239,0.1)", border: "1px solid rgba(155,143,239,0.2)" }}>
                <MapPin className="w-4 h-4" style={{ color: "#7c6fe0" }} />
              </div>
              <div>
                <p className="text-[14px] font-black" style={{ color: "#1a1330" }}>Fibre Coverage Map</p>
                <p className="text-[10px]" style={{ color: "#94a3b8" }}>Click map or search to check your area</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(226,232,240,0.8)" }}>
            <form onSubmit={handleAddressSearch} className="flex gap-2">
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Search address (e.g. Sandton City)"
                className="flex-1 rounded-xl px-3 py-2 text-[13px] outline-none"
                style={{ background: "rgba(243,240,253,0.8)", border: "1px solid rgba(155,143,239,0.2)", color: "#1a1330" }} />
              <button type="submit" disabled={searching}
                className="px-4 py-2 rounded-xl text-white text-[12px] font-bold flex items-center gap-1.5 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#7c6fe0,#9b8fef)" }}>
                {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />} Go
              </button>
            </form>
          </div>

          {pinCoords && (
            <div className="mx-4 my-2 px-4 py-3 rounded-xl flex-shrink-0"
              style={{ background: availableProviders.length > 0 ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.06)", border: `1px solid ${availableProviders.length > 0 ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"}` }}>
              <div className="flex items-center gap-2">
                {availableProviders.length > 0
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                <p className="text-[12px] font-bold" style={{ color: availableProviders.length > 0 ? "#059669" : "#dc2626" }}>
                  {availableProviders.length > 0 ? `${availableProviders.length} provider${availableProviders.length > 1 ? "s" : ""} available` : "No fibre coverage here"}
                </p>
              </div>
            </div>
          )}

          {compareList.length >= 2 && (
            <div className="mx-4 mb-2 flex-shrink-0">
              <button onClick={() => setShowCompare(true)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold text-white"
                style={{ background: "linear-gradient(135deg,#7c6fe0,#9b8fef)", boxShadow: "0 4px 14px rgba(124,111,224,0.35)" }}>
                <BarChart2 className="w-4 h-4" /> Compare {compareList.length} Providers <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {pinCoords && availableProviders.length > 0 && (
            <div className="mx-4 mb-2 flex gap-1.5 flex-shrink-0">
              <button onClick={() => setShowAllProviders(false)} className="flex-1 py-1.5 rounded-xl text-[11px] font-bold"
                style={{ background: !showAllProviders ? "rgba(16,185,129,0.12)" : "rgba(241,245,249,0.8)", border: `1px solid ${!showAllProviders ? "rgba(16,185,129,0.3)" : "rgba(226,232,240,0.8)"}`, color: !showAllProviders ? "#059669" : "#64748b" }}>
                Available ({availableProviders.length})
              </button>
              <button onClick={() => setShowAllProviders(true)} className="flex-1 py-1.5 rounded-xl text-[11px] font-bold"
                style={{ background: showAllProviders ? "rgba(155,143,239,0.12)" : "rgba(241,245,249,0.8)", border: `1px solid ${showAllProviders ? "rgba(155,143,239,0.3)" : "rgba(226,232,240,0.8)"}`, color: showAllProviders ? "#7c6fe0" : "#64748b" }}>
                All ({PROVIDERS.length})
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 pt-1">
            {displayedProviders.map(provider => (
              <ProviderCard key={provider.id} provider={provider} selected={selectedProviders.has(provider.id)} onToggle={() => toggleProvider(provider.id)} compareList={compareList} onCompareToggle={toggleCompare} />
            ))}
          </div>

          {/* Legend */}
          <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(226,232,240,0.8)" }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: "#94a3b8" }}>Coverage Legend</p>
            <div className="flex flex-wrap gap-2">
              {PROVIDERS.map(p => (
                <div key={p.id} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm opacity-60" style={{ background: p.color }} />
                  <span className="text-[10px] font-semibold" style={{ color: "#475569" }}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative min-h-[300px]">
          <MapContainer center={defaultCenter} zoom={11} style={{ width: "100%", height: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>' />
            <MapClickHandler onMapClick={handleMapClick} />
            {flyTo && <FlyTo coords={flyTo} />}

            {PROVIDERS.map(provider =>
              provider.coverage.map((zone, i) => (
                <Circle key={`${provider.id}-${i}`} center={[zone.lat, zone.lng]} radius={zone.radius}
                  pathOptions={{ color: provider.color, fillColor: provider.color, fillOpacity: 0.12, weight: 1.5, opacity: 0.6 }}>
                  <Popup>
                    <div style={{ minWidth: 150 }}>
                      <div className="flex items-center gap-2 mb-1">
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: provider.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#fff" }}>{provider.logo}</div>
                        <strong style={{ color: provider.color }}>{provider.name}</strong>
                      </div>
                      <p style={{ fontSize: 11, color: "#475569" }}>{zone.area}</p>
                      <p style={{ fontSize: 11, color: "#94a3b8" }}>Radius: {(zone.radius / 1000).toFixed(1)} km</p>
                      <p style={{ fontSize: 11, color: "#475569" }}>Plans from R{provider.plans[0].price}/mo</p>
                    </div>
                  </Popup>
                </Circle>
              ))
            )}

            {pinCoords && (
              <Marker position={[pinCoords.lat, pinCoords.lng]}>
                <Popup>
                  <strong>📍 Selected Location</strong><br />
                  <span style={{ fontSize: 11, color: "#475569" }}>
                    {availableProviders.length > 0 ? availableProviders.map(p => p.name).join(", ") + " available" : "No fibre coverage here"}
                  </span>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </>
  );
}