import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  Wifi, Eye, EyeOff, Save, RotateCcw, Users, Shield,
  CheckCircle2, AlertTriangle, Loader2, RefreshCw, Power,
  Signal, Monitor, Smartphone, Laptop, Tv, Lock, Unlock,
  Radio, ChevronDown, X, Zap, Activity, Clock
} from "lucide-react";

// ── Animated signal bars ─────────────────────────────────────────────────────
function SignalBars({ strength = 0 }) {
  const bars = [20, 40, 65, 85, 100];
  return (
    <div className="flex items-end gap-[3px] h-5">
      {bars.map((threshold, i) => {
        const active = strength >= threshold;
        const height = [8, 11, 14, 17, 20][i];
        return (
          <div key={i}
            className="w-2 rounded-sm transition-all duration-700"
            style={{
              height,
              background: active
                ? strength >= 80 ? "#10b981" : strength >= 50 ? "#f59e0b" : "#ef4444"
                : "rgba(203,213,225,0.4)",
              boxShadow: active && strength >= 80 ? "0 0 6px rgba(16,185,129,0.5)" : "none",
            }}
          />
        );
      })}
    </div>
  );
}

// ── Circular speed gauge ─────────────────────────────────────────────────────
function SpeedGauge({ label, value, max, color, unit = "Mbps" }) {
  const pct = Math.min(1, value / max);
  const r = 28, circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(203,213,225,0.3)" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 4px ${color}88)` }}
        />
        <text x="36" y="38" textAnchor="middle" fontSize="12" fontWeight="900" fill={color}>{value}</text>
        <text x="36" y="50" textAnchor="middle" fontSize="7" fill="#94a3b8">{unit}</text>
      </svg>
      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{label}</p>
    </div>
  );
}

// ── Device icon picker ────────────────────────────────────────────────────────
function DeviceIcon({ type }) {
  const map = { phone: Smartphone, laptop: Laptop, desktop: Monitor, tv: Tv, default: Wifi };
  const Icon = map[type] || map.default;
  return <Icon className="w-3.5 h-3.5" />;
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-[12px] font-semibold animate-fade-up"
      style={{
        background: type === "error" ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
        border: `1px solid ${type === "error" ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"}`,
        color: type === "error" ? "#ef4444" : "#059669",
      }}>
      {type === "error"
        ? <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{msg}</span>
      <button onClick={onDismiss}><X className="w-3.5 h-3.5 opacity-50 hover:opacity-100" /></button>
    </div>
  );
}

const MOCK_DEVICES = [
  { name: "iPhone 15 Pro", type: "phone", signal: 92, ip: "192.168.1.101", band: "5GHz", connected: "2h 14m" },
  { name: "MacBook Air", type: "laptop", signal: 78, ip: "192.168.1.102", band: "5GHz", connected: "5h 03m" },
  { name: "Samsung TV", type: "tv", signal: 55, ip: "192.168.1.103", band: "2.4GHz", connected: "12h 20m" },
  { name: "iPad", type: "phone", signal: 85, ip: "192.168.1.104", band: "5GHz", connected: "44m" },
  { name: "Desktop PC", type: "desktop", signal: 99, ip: "192.168.1.105", band: "Wired", connected: "3d 7h" },
];

const CHANNELS_24 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const CHANNELS_5  = [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 149, 153, 157, 161, 165];
const SECURITY_MODES = ["WPA3-Personal", "WPA2-Personal", "WPA2/WPA3 Mixed", "WPA2-Enterprise"];
const TABS = ["Status", "WiFi", "Guest", "Devices", "Advanced"];

export default function WiFiSettingsPanel({ customer }) {
  const routerId = customer?.assigned_node || customer?.id;
  const [activeTab, setActiveTab] = useState("Status");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [rebooting, setRebooting] = useState(false);
  const [toast, setToast] = useState(null);
  const [speedTesting, setSpeedTesting] = useState(false);
  const [speedResult, setSpeedResult] = useState(null);
  const [uptime, setUptime] = useState(0);

  // WiFi form
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [band, setBand] = useState("2.4GHz + 5GHz");
  const [channel, setChannel] = useState("Auto");
  const [security, setSecurity] = useState("WPA2-Personal");
  const [txPower, setTxPower] = useState(100);

  // Guest form
  const [guestEnabled, setGuestEnabled] = useState(false);
  const [guestSsid, setGuestSsid] = useState("");
  const [guestPass, setGuestPass] = useState("");
  const [showGuestPass, setShowGuestPass] = useState(false);
  const [guestMaxClients, setGuestMaxClients] = useState(10);
  const [guestIsolate, setGuestIsolate] = useState(true);

  // Devices
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Uptime counter
  useEffect(() => {
    const t = setInterval(() => setUptime(u => u + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmtUptime = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("wifiSettings", { action: "get", router_id: routerId });
      const data = res.data;
      setSettings(data);
      setSsid(data.ssid || "");
      setPassword("");
      setGuestEnabled(data.guest_enabled || false);
      setGuestSsid(data.guest_ssid || "");
      setBand(data.band || "2.4GHz + 5GHz");
      setChannel(data.channel || "Auto");
    } catch (e) {
      showToast("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (routerId) loadSettings(); }, [routerId]);

  const saveMain = async () => {
    if (!ssid.trim()) return;
    setSaving("main");
    const payload = { action: "update_main", router_id: routerId, ssid };
    if (password) payload.password = password;
    const res = await base44.functions.invoke("wifiSettings", payload);
    setSaving(null);
    if (res.data?.success) {
      showToast(res.data.demo ? "Settings saved (demo mode)" : "WiFi settings saved!");
      setPassword("");
      await loadSettings();
    } else {
      showToast("Failed to update settings", "error");
    }
  };

  const saveGuest = async () => {
    setSaving("guest");
    const payload = { action: "update_guest", router_id: routerId, guest_enabled: guestEnabled, guest_ssid: guestSsid };
    if (guestPass) payload.guest_password = guestPass;
    const res = await base44.functions.invoke("wifiSettings", payload);
    setSaving(null);
    if (res.data?.success) {
      showToast(res.data.demo ? "Guest network saved (demo mode)" : "Guest network saved!");
      setGuestPass("");
      await loadSettings();
    } else {
      showToast("Failed to update guest network", "error");
    }
  };

  const reboot = async () => {
    if (!window.confirm("Reboot your router? Internet will be down ~2 minutes.")) return;
    setRebooting(true);
    const res = await base44.functions.invoke("wifiSettings", { action: "reboot", router_id: routerId });
    setRebooting(false);
    if (res.data?.success) showToast("Reboot initiated. Please wait ~2 minutes.");
    else showToast("Failed to send reboot command", "error");
  };

  const runSpeedTest = async () => {
    setSpeedTesting(true);
    setSpeedResult(null);
    // Simulate a speed test with progressive results
    await new Promise(r => setTimeout(r, 2500));
    const plan = customer?.service_plan || "standard_50mbps";
    const maxDown = { basic_10mbps: 10, standard_50mbps: 50, premium_100mbps: 100, enterprise_500mbps: 500, dedicated_1gbps: 1000 }[plan] || 50;
    const download = Math.round(maxDown * (0.85 + Math.random() * 0.12));
    const upload = Math.round(download * (0.3 + Math.random() * 0.2));
    const ping = Math.round(8 + Math.random() * 20);
    setSpeedResult({ download, upload, ping, timestamp: new Date().toLocaleTimeString() });
    setSpeedTesting(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-10">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Wifi className="w-8 h-8" style={{ color: "#6366f1" }} />
          <div className="absolute -inset-2 rounded-full border-2 border-indigo-300 border-t-transparent animate-spin" />
        </div>
        <span className="text-[12px] font-semibold" style={{ color: "#64748b" }}>Loading router data…</span>
      </div>
    </div>
  );

  const tabContent = {
    Status: (
      <div className="space-y-4">
        {/* Live metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Signal", value: settings?.signal_strength ?? 0, icon: Signal,  color: "#10b981", render: () => <SignalBars strength={settings?.signal_strength ?? 0} /> },
            { label: "Devices",value: settings?.connected_devices ?? MOCK_DEVICES.length, icon: Monitor, color: "#6366f1", render: (v) => <p className="text-[22px] font-black mono" style={{ color: "#6366f1" }}>{v}</p> },
            { label: "Band",   value: settings?.band || "—",          icon: Radio,   color: "#06b6d4", render: (v) => <p className="text-[13px] font-black" style={{ color: "#06b6d4" }}>{v}</p> },
            { label: "Channel",value: settings?.channel || "Auto",    icon: Shield,  color: "#f59e0b", render: (v) => <p className="text-[22px] font-black mono" style={{ color: "#f59e0b" }}>{v}</p> },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl px-4 py-3 relative overflow-hidden"
                style={{ background: `${s.color}06`, border: `1px solid ${s.color}18` }}>
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon className="w-3 h-3" style={{ color: s.color }} />
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: s.color + "80" }}>{s.label}</p>
                </div>
                {s.render(s.value)}
              </div>
            );
          })}
        </div>

        {/* Uptime + Speed Test */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 relative overflow-hidden"
            style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" style={{ color: "#6366f1" }} />
              <p className="text-[12px] font-black" style={{ color: "#334155" }}>Router Uptime</p>
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[26px] font-black mono" style={{ color: "#6366f1", fontFamily: "monospace" }}>{fmtUptime(uptime)}</p>
            <p className="text-[10px] mt-1" style={{ color: "#94a3b8" }}>Since last page load · Router may differ</p>
            <button onClick={reboot} disabled={rebooting}
              className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
              {rebooting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Power className="w-3 h-3" />}
              {rebooting ? "Rebooting…" : "Reboot Router"}
            </button>
          </div>

          <div className="rounded-2xl p-4 relative overflow-hidden"
            style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4" style={{ color: "#06b6d4" }} />
              <p className="text-[12px] font-black" style={{ color: "#334155" }}>Speed Test</p>
            </div>
            {speedResult ? (
              <div className="flex items-center justify-around">
                <SpeedGauge label="Download" value={speedResult.download} max={1000} color="#06b6d4" />
                <SpeedGauge label="Upload" value={speedResult.upload} max={500} color="#8b5cf6" />
                <SpeedGauge label="Ping" value={speedResult.ping} max={200} color="#10b981" unit="ms" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 gap-3">
                {speedTesting ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-12 h-12">
                      <Activity className="w-12 h-12" style={{ color: "rgba(6,182,212,0.2)" }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#06b6d4" }} />
                      </div>
                    </div>
                    <p className="text-[11px] font-semibold animate-pulse" style={{ color: "#06b6d4" }}>Testing your connection…</p>
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] text-center" style={{ color: "#94a3b8" }}>Check your actual network speeds</p>
                    <button onClick={runSpeedTest}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
                      style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 4px 14px rgba(6,182,212,0.35)" }}>
                      <Zap className="w-3.5 h-3.5" /> Run Speed Test
                    </button>
                  </>
                )}
              </div>
            )}
            {speedResult && (
              <p className="text-[9px] text-center mt-2" style={{ color: "#94a3b8" }}>Tested at {speedResult.timestamp}</p>
            )}
          </div>
        </div>
      </div>
    ),

    WiFi: (
      <div className="space-y-4">
        {/* SSID */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5" style={{ color: "#94a3b8" }}>Network Name (SSID)</label>
          <input value={ssid} onChange={e => setSsid(e.target.value)} placeholder="e.g. HomeNetwork_5G"
            className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none"
            style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }} />
        </div>

        {/* Password */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5" style={{ color: "#94a3b8" }}>Password</label>
          <div className="relative">
            <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full rounded-xl px-3 py-2.5 pr-10 text-[13px] outline-none"
              style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }} />
            <button onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-1.5 flex gap-1">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300" style={{
                  background: i <= 1 ? (password.length < 6 ? "#ef4444" : password.length < 10 ? "#f59e0b" : "#10b981")
                    : i <= 2 ? (password.length >= 8 ? (password.length < 10 ? "#f59e0b" : "#10b981") : "rgba(226,232,240,0.8)")
                    : i <= 3 ? (password.length >= 10 && /[A-Z]/.test(password) ? "#10b981" : "rgba(226,232,240,0.8)")
                    : (password.length >= 12 && /[^a-zA-Z0-9]/.test(password) ? "#10b981" : "rgba(226,232,240,0.8)")
                }} />
              ))}
              <span className="text-[9px] ml-1 font-bold" style={{ color: password.length < 6 ? "#ef4444" : password.length < 10 ? "#f59e0b" : "#10b981" }}>
                {password.length < 6 ? "Weak" : password.length < 10 ? "Fair" : "Strong"}
              </span>
            </div>
          )}
        </div>

        {/* Band selector */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5" style={{ color: "#94a3b8" }}>Frequency Band</label>
          <div className="grid grid-cols-3 gap-2">
            {["2.4GHz", "5GHz", "2.4GHz + 5GHz"].map(b => (
              <button key={b} onClick={() => setBand(b)}
                className="py-2.5 px-2 rounded-xl text-[11px] font-bold transition-all"
                style={{
                  background: band === b ? "rgba(99,102,241,0.12)" : "rgba(248,250,252,0.9)",
                  border: `1px solid ${band === b ? "rgba(99,102,241,0.4)" : "rgba(226,232,240,0.9)"}`,
                  color: band === b ? "#6366f1" : "#64748b",
                  boxShadow: band === b ? "0 0 12px rgba(99,102,241,0.15)" : "none",
                }}>
                {b === "2.4GHz + 5GHz" ? "Dual Band" : b}
              </button>
            ))}
          </div>
        </div>

        {/* Security */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5" style={{ color: "#94a3b8" }}>Security Mode</label>
          <div className="relative">
            <select value={security} onChange={e => setSecurity(e.target.value)}
              className="w-full appearance-none rounded-xl px-3 py-2.5 text-[13px] outline-none pr-8"
              style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }}>
              {SECURITY_MODES.map(m => <option key={m}>{m}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
              <Lock className="w-3.5 h-3.5" style={{ color: security.includes("WPA3") ? "#10b981" : "#94a3b8" }} />
              <ChevronDown className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
            </div>
          </div>
          {security.includes("WPA3") && (
            <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: "#10b981" }}>
              <CheckCircle2 className="w-3 h-3" /> WPA3 provides the strongest available WiFi security
            </p>
          )}
        </div>

        {/* TX Power */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#94a3b8" }}>Transmit Power</label>
            <span className="text-[11px] font-black mono" style={{ color: "#6366f1" }}>{txPower}%</span>
          </div>
          <input type="range" min="25" max="100" step="25" value={txPower} onChange={e => setTxPower(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: "#6366f1" }} />
          <div className="flex justify-between mt-1">
            {["Low", "Medium", "High", "Max"].map(l => (
              <span key={l} className="text-[9px]" style={{ color: "#94a3b8" }}>{l}</span>
            ))}
          </div>
        </div>

        <button onClick={saveMain} disabled={saving === "main" || !ssid.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}>
          {saving === "main" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving === "main" ? "Applying Settings…" : "Save WiFi Settings"}
        </button>
      </div>
    ),

    Guest: (
      <div className="space-y-4">
        {/* Enable toggle */}
        <div className="rounded-2xl px-5 py-4 flex items-center justify-between"
          style={{ background: guestEnabled ? "rgba(16,185,129,0.06)" : "rgba(248,250,252,0.9)", border: `1px solid ${guestEnabled ? "rgba(16,185,129,0.25)" : "rgba(226,232,240,0.9)"}`, transition: "all 0.3s" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: guestEnabled ? "rgba(16,185,129,0.15)" : "rgba(99,102,241,0.08)", border: `1px solid ${guestEnabled ? "rgba(16,185,129,0.3)" : "rgba(99,102,241,0.15)"}` }}>
              <Users className="w-4 h-4" style={{ color: guestEnabled ? "#10b981" : "#94a3b8" }} />
            </div>
            <div>
              <p className="text-[13px] font-black" style={{ color: "#1e293b" }}>Guest Network</p>
              <p className="text-[10px]" style={{ color: guestEnabled ? "#10b981" : "#94a3b8" }}>{guestEnabled ? "Active — visitors can connect" : "Disabled"}</p>
            </div>
          </div>
          <button onClick={() => setGuestEnabled(v => !v)}
            className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
            style={{ background: guestEnabled ? "#10b981" : "#e2e8f0", boxShadow: guestEnabled ? "0 0 12px rgba(16,185,129,0.4)" : "none" }}>
            <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300"
              style={{ left: guestEnabled ? "26px" : "2px" }} />
          </button>
        </div>

        {guestEnabled && (
          <div className="space-y-3 animate-fade-up">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5" style={{ color: "#94a3b8" }}>Guest Network Name</label>
              <input value={guestSsid} onChange={e => setGuestSsid(e.target.value)} placeholder="e.g. HomeNetwork_Guest"
                className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none"
                style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5" style={{ color: "#94a3b8" }}>Guest Password</label>
              <div className="relative">
                <input type={showGuestPass ? "text" : "password"} value={guestPass} onChange={e => setGuestPass(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full rounded-xl px-3 py-2.5 pr-10 text-[13px] outline-none"
                  style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }} />
                <button onClick={() => setShowGuestPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showGuestPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {/* Max clients slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#94a3b8" }}>Max Guest Clients</label>
                <span className="text-[11px] font-black mono" style={{ color: "#10b981" }}>{guestMaxClients} devices</span>
              </div>
              <input type="range" min="1" max="30" value={guestMaxClients} onChange={e => setGuestMaxClients(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: "#10b981" }} />
            </div>
            {/* Client isolation */}
            <div className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)" }}>
              <div>
                <p className="text-[12px] font-bold" style={{ color: "#334155" }}>Client Isolation</p>
                <p className="text-[10px]" style={{ color: "#94a3b8" }}>Prevent guests from seeing each other's devices</p>
              </div>
              <button onClick={() => setGuestIsolate(v => !v)}
                className="relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0"
                style={{ background: guestIsolate ? "#6366f1" : "#e2e8f0" }}>
                <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300"
                  style={{ left: guestIsolate ? "22px" : "2px" }} />
              </button>
            </div>
          </div>
        )}

        <button onClick={saveGuest} disabled={saving === "guest"}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}>
          {saving === "guest" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving === "guest" ? "Saving…" : "Save Guest Settings"}
        </button>
      </div>
    ),

    Devices: (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] font-black" style={{ color: "#334155" }}>{MOCK_DEVICES.length} connected devices</p>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        {MOCK_DEVICES.map((device, i) => (
          <button key={i} onClick={() => setSelectedDevice(selectedDevice?.name === device.name ? null : device)}
            className="w-full rounded-xl px-4 py-3 flex items-center gap-3 text-left transition-all"
            style={{
              background: selectedDevice?.name === device.name ? "rgba(99,102,241,0.08)" : "rgba(248,250,252,0.9)",
              border: `1px solid ${selectedDevice?.name === device.name ? "rgba(99,102,241,0.25)" : "rgba(226,232,240,0.9)"}`,
            }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
              <DeviceIcon type={device.type} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold truncate" style={{ color: "#1e293b" }}>{device.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] mono" style={{ color: "#94a3b8" }}>{device.ip}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                  style={{ background: device.band === "Wired" ? "rgba(16,185,129,0.12)" : "rgba(99,102,241,0.1)", color: device.band === "Wired" ? "#10b981" : "#6366f1" }}>
                  {device.band}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <SignalBars strength={device.signal} />
              <span className="text-[9px]" style={{ color: "#94a3b8" }}>{device.connected}</span>
            </div>
          </button>
        ))}
        {selectedDevice && (
          <div className="rounded-xl px-4 py-3 mt-2"
            style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.05))", border: "1px solid rgba(99,102,241,0.2)" }}>
            <p className="text-[11px] font-black mb-2" style={{ color: "#6366f1" }}>Device Details — {selectedDevice.name}</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Signal",    value: `${selectedDevice.signal}%` },
                { label: "Band",      value: selectedDevice.band },
                { label: "Connected", value: selectedDevice.connected },
              ].map(d => (
                <div key={d.label} className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.6)" }}>
                  <p className="text-[14px] font-black" style={{ color: "#334155" }}>{d.value}</p>
                  <p className="text-[9px]" style={{ color: "#94a3b8" }}>{d.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ),

    Advanced: (
      <div className="space-y-4">
        <div className="rounded-2xl p-4" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4" style={{ color: "#f59e0b" }} />
            <p className="text-[12px] font-black" style={{ color: "#92400e" }}>Advanced Settings</p>
          </div>
          <p className="text-[11px]" style={{ color: "#78350f" }}>Incorrect settings may disrupt your connection. Proceed with caution.</p>
        </div>
        {/* Channel selector */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5" style={{ color: "#94a3b8" }}>WiFi Channel</label>
          <div className="flex flex-wrap gap-1.5">
            {["Auto", ...(band.includes("5GHz") ? CHANNELS_5.slice(0, 8) : CHANNELS_24)].map(ch => (
              <button key={ch} onClick={() => setChannel(String(ch))}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                style={{
                  background: String(channel) === String(ch) ? "rgba(99,102,241,0.15)" : "rgba(248,250,252,0.9)",
                  border: `1px solid ${String(channel) === String(ch) ? "rgba(99,102,241,0.4)" : "rgba(226,232,240,0.9)"}`,
                  color: String(channel) === String(ch) ? "#6366f1" : "#64748b",
                }}>
                {ch}
              </button>
            ))}
          </div>
        </div>
        {/* Reboot */}
        <div className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
          style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <Power className="w-4 h-4" style={{ color: "#ef4444" }} />
            </div>
            <div>
              <p className="text-[13px] font-black" style={{ color: "#1e293b" }}>Reboot Router</p>
              <p className="text-[10px]" style={{ color: "#94a3b8" }}>~2 min downtime</p>
            </div>
          </div>
          <button onClick={reboot} disabled={rebooting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-105 disabled:opacity-60"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
            {rebooting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
            {rebooting ? "Rebooting…" : "Reboot"}
          </button>
        </div>
      </div>
    ),
  };

  return (
    <div className="space-y-4">
      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "rgba(241,245,249,0.9)", border: "1px solid rgba(226,232,240,0.8)" }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 rounded-xl text-[11px] font-bold transition-all"
            style={{
              background: activeTab === tab ? "#fff" : "transparent",
              color: activeTab === tab ? "#6366f1" : "#94a3b8",
              boxShadow: activeTab === tab ? "0 1px 6px rgba(99,102,241,0.12)" : "none",
              border: activeTab === tab ? "1px solid rgba(99,102,241,0.15)" : "1px solid transparent",
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>{tabContent[activeTab]}</div>
    </div>
  );
}