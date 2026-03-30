import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Wifi, Eye, EyeOff, Save, RotateCcw, Users, Shield,
  CheckCircle2, AlertTriangle, Loader2, RefreshCw, Power,
  Signal, Monitor
} from "lucide-react";

export default function WiFiSettingsPanel({ customer }) {
  const routerId = customer?.assigned_node || customer?.id;

  const [settings, setSettings]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(null);
  const [rebooting, setRebooting]   = useState(false);
  const [toast, setToast]           = useState(null);

  // Main WiFi form
  const [ssid, setSsid]             = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);

  // Guest form
  const [guestEnabled, setGuestEnabled]   = useState(false);
  const [guestSsid, setGuestSsid]         = useState("");
  const [guestPass, setGuestPass]         = useState("");
  const [showGuestPass, setShowGuestPass] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadSettings = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("wifiSettings", { action: "get", router_id: routerId });
    const data = res.data;
    setSettings(data);
    setSsid(data.ssid || "");
    setPassword("");
    setGuestEnabled(data.guest_enabled || false);
    setGuestSsid(data.guest_ssid || "");
    setGuestPass("");
    setLoading(false);
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
      showToast(res.data.demo ? "Updated (demo mode)" : "WiFi settings saved!");
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
      showToast(res.data.demo ? "Guest network updated (demo mode)" : "Guest network saved!");
      setGuestPass("");
      await loadSettings();
    } else {
      showToast("Failed to update guest network", "error");
    }
  };

  const reboot = async () => {
    if (!window.confirm("Are you sure you want to reboot your router? Your internet will be down for ~2 minutes.")) return;
    setRebooting(true);
    const res = await base44.functions.invoke("wifiSettings", { action: "reboot", router_id: routerId });
    setRebooting(false);
    if (res.data?.success) showToast("Router reboot initiated. Please wait ~2 minutes.");
    else showToast("Failed to send reboot command", "error");
  };

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-5 h-5 animate-spin mr-2" style={{ color: "#6366f1" }} />
      <span className="text-[12px] font-semibold" style={{ color: "#64748b" }}>Loading WiFi settings…</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-[12px] font-semibold"
          style={{
            background: toast.type === "error" ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
            border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"}`,
            color: toast.type === "error" ? "#ef4444" : "#059669",
          }}>
          {toast.type === "error"
            ? <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Status strip */}
      {settings && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Signal",   value: settings.signal_strength ? `${settings.signal_strength}%` : "—", icon: Signal,  color: "#10b981" },
            { label: "Devices",  value: settings.connected_devices ?? "—",                                icon: Monitor, color: "#6366f1" },
            { label: "Band",     value: settings.band || "—",                                             icon: Wifi,    color: "#06b6d4" },
            { label: "Channel",  value: settings.channel || "Auto",                                       icon: Shield,  color: "#f59e0b" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl px-3 py-2.5 flex items-center gap-2.5"
                style={{ background: `${s.color}08`, border: `1px solid ${s.color}18` }}>
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.color }} />
                <div>
                  <p className="text-[14px] font-black mono leading-none" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "#94a3b8" }}>{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main WiFi */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 2px 16px rgba(99,102,241,0.06)" }}>
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#6366f1,#06b6d4,transparent)" }} />
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <Wifi className="w-4 h-4" style={{ color: "#6366f1" }} />
            </div>
            <div>
              <p className="text-[13px] font-black" style={{ color: "#1e293b" }}>Main WiFi Network</p>
              <p className="text-[10px]" style={{ color: "#94a3b8" }}>Update your network name and password</p>
            </div>
            <button onClick={loadSettings} className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "#94a3b8" }}>Network Name (SSID)</label>
              <input
                value={ssid}
                onChange={e => setSsid(e.target.value)}
                placeholder="e.g. HomeNetwork_5G"
                className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none"
                style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "#94a3b8" }}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full rounded-xl px-3 py-2.5 pr-10 text-[13px] outline-none"
                  style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }}
                />
                <button onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] mt-1" style={{ color: "#94a3b8" }}>Minimum 8 characters recommended</p>
            </div>
            <button
              onClick={saveMain}
              disabled={saving === "main" || !ssid.trim()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
              {saving === "main" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving === "main" ? "Saving…" : "Save WiFi Settings"}
            </button>
          </div>
        </div>
      </div>

      {/* Guest Network */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(16,185,129,0.15)", boxShadow: "0 2px 16px rgba(16,185,129,0.05)" }}>
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#10b981,#06b6d4,transparent)" }} />
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <Users className="w-4 h-4" style={{ color: "#10b981" }} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-black" style={{ color: "#1e293b" }}>Guest Network</p>
              <p className="text-[10px]" style={{ color: "#94a3b8" }}>Isolated network for visitors</p>
            </div>
            {/* Toggle */}
            <button
              onClick={() => setGuestEnabled(v => !v)}
              className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
              style={{ background: guestEnabled ? "#10b981" : "#e2e8f0" }}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${guestEnabled ? "left-5.5" : "left-0.5"}`}
                style={{ left: guestEnabled ? "22px" : "2px" }} />
            </button>
          </div>

          {guestEnabled && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "#94a3b8" }}>Guest Network Name (SSID)</label>
                <input
                  value={guestSsid}
                  onChange={e => setGuestSsid(e.target.value)}
                  placeholder="e.g. HomeNetwork_Guest"
                  className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none"
                  style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "#94a3b8" }}>Guest Password</label>
                <div className="relative">
                  <input
                    type={showGuestPass ? "text" : "password"}
                    value={guestPass}
                    onChange={e => setGuestPass(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="w-full rounded-xl px-3 py-2.5 pr-10 text-[13px] outline-none"
                    style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }}
                  />
                  <button onClick={() => setShowGuestPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showGuestPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!guestEnabled && (
            <p className="text-[12px] italic" style={{ color: "#94a3b8" }}>Guest network is disabled. Toggle to enable.</p>
          )}

          <button
            onClick={saveGuest}
            disabled={saving === "guest"}
            className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}>
            {saving === "guest" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving === "guest" ? "Saving…" : "Save Guest Settings"}
          </button>
        </div>
      </div>

      {/* Router Reboot */}
      <div className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
        style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(239,68,68,0.15)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <Power className="w-4 h-4" style={{ color: "#ef4444" }} />
          </div>
          <div>
            <p className="text-[13px] font-black" style={{ color: "#1e293b" }}>Reboot Router</p>
            <p className="text-[10px]" style={{ color: "#94a3b8" }}>Remotely restart your router (~2 min downtime)</p>
          </div>
        </div>
        <button
          onClick={reboot}
          disabled={rebooting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-60 flex-shrink-0"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
          {rebooting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
          {rebooting ? "Rebooting…" : "Reboot"}
        </button>
      </div>
    </div>
  );
}