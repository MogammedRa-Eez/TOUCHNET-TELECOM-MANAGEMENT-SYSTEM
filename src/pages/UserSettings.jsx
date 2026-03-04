import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, Save, CheckCircle, BellRing } from "lucide-react";
import SageSyncPanel from "@/components/settings/SageSyncPanel";

const DEFAULT_PREFS = {
  slack_enabled: true,
  notify_offline: true,
  notify_degraded: false,
  notify_maintenance: false,
  notify_back_online: true,
  inapp_network: true,
  inapp_billing: true,
  inapp_ticket: true,
  inapp_customer: false,
  inapp_system: true,
};

const INAPP_OPTIONS = [
  { key: "inapp_network", label: "Network events", description: "Node status changes and alerts", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { key: "inapp_billing", label: "Billing updates", description: "Invoice created, paid or overdue", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { key: "inapp_ticket", label: "Ticket updates", description: "New tickets and status changes", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  { key: "inapp_customer", label: "Customer events", description: "New or updated customer accounts", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  { key: "inapp_system", label: "System notifications", description: "General system alerts and updates", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
];

const EVENT_OPTIONS = [
  { key: "notify_offline", label: "Node goes offline", description: "Alert when a node status changes to offline", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  { key: "notify_degraded", label: "Node degraded", description: "Alert when a node enters degraded state", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  { key: "notify_maintenance", label: "Node in maintenance", description: "Alert when a node enters maintenance mode", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { key: "notify_back_online", label: "Node back online", description: "Alert when a node recovers and comes back online", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
];

export default function UserSettings() {
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u?.notification_preferences) {
        setPrefs({ ...DEFAULT_PREFS, ...u.notification_preferences });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggle = (key) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ notification_preferences: prefs });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">User Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your notification preferences and alert configurations.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #dc2626, #1e2a4a)" }}>
          {(user?.full_name || user?.email || "U").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-slate-800">{user?.full_name || "—"}</p>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{user?.role || "user"}</span>
        </div>
      </div>

      {/* Slack Notifications */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#4A154B] flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Slack Notifications</p>
              <p className="text-xs text-slate-400">Send alerts to your Slack workspace</p>
            </div>
          </div>
          <button
            onClick={() => toggle("slack_enabled")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${prefs.slack_enabled ? "bg-emerald-500" : "bg-slate-200"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${prefs.slack_enabled ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>

        {/* Event Types */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Trigger Events</p>
          {EVENT_OPTIONS.map((opt) => (
            <div
              key={opt.key}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                prefs.slack_enabled ? `${opt.bg} ${opt.border}` : "bg-slate-50 border-slate-200 opacity-50"
              }`}>
              <div>
                <p className={`text-sm font-medium ${prefs.slack_enabled ? opt.color : "text-slate-400"}`}>{opt.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{opt.description}</p>
              </div>
              <button
                disabled={!prefs.slack_enabled}
                onClick={() => toggle(opt.key)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  prefs[opt.key] && prefs.slack_enabled ? "bg-emerald-500" : "bg-slate-300"
                }`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  prefs[opt.key] && prefs.slack_enabled ? "translate-x-4" : "translate-x-0.5"
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* In-App Notifications */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <BellRing className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">In-App Notifications</p>
              <p className="text-xs text-slate-400">Choose which events trigger in-app alerts</p>
            </div>
          </div>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Notification Categories</p>
          {INAPP_OPTIONS.map((opt) => (
            <div key={opt.key} className={`flex items-center justify-between p-3 rounded-lg border ${opt.bg} ${opt.border}`}>
              <div>
                <p className={`text-sm font-medium ${opt.color}`}>{opt.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{opt.description}</p>
              </div>
              <button
                onClick={() => toggle(opt.key)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${prefs[opt.key] ? "bg-emerald-500" : "bg-slate-300"}`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${prefs[opt.key] ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: saved ? "#10b981" : "#dc2626" }}>
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}