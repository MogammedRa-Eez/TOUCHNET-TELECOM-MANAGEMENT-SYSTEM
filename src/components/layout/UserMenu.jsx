import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { LogOut, User, ChevronDown, Settings, Moon, Sun, Bell, Shield, Copy, Check } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function UserMenu() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    base44.auth.me().then((u) => { setUser(u); setName(u?.full_name || ""); }).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setEditOpen(false); } };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => base44.auth.logout();

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ display_name: name });
    setUser((u) => ({ ...u, display_name: name }));
    setSaving(false);
    setEditOpen(false);
  };

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const roleColor = user?.role === "admin" ? "#6366f1" : "#10b981";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all hover:bg-slate-100"
        style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-slate-700 leading-tight">{user?.full_name || "User"}</p>
          <p className="text-[10px] text-slate-400 leading-tight capitalize">{user?.role || "member"}</p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-xl z-50 overflow-hidden"
          style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.1)" }}>

          {/* User info header */}
          <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)", background: "linear-gradient(135deg, #f8fafc, #f0f4ff)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.full_name || "User"}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <button onClick={handleCopyEmail} className="flex items-center gap-1 group" title="Copy email">
                    <p className="text-xs text-slate-400 truncate max-w-[130px] group-hover:text-indigo-500 transition-colors">{user?.email}</p>
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-slate-300 group-hover:text-indigo-400 transition-colors" />}
                  </button>
                </div>
              </div>
            </div>
            {/* Role badge */}
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: `${roleColor}18`, color: roleColor, border: `1px solid ${roleColor}30` }}>
                <Shield className="w-2.5 h-2.5" />
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Member"}
              </span>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {/* Edit Display Name */}
            {!editOpen ? (
              <button
                onClick={() => setEditOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-blue-500" />
                </div>
                Edit Display Name
              </button>
            ) : (
              <div className="px-4 py-3 space-y-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Display Name</p>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setEditOpen(false); setName(user?.full_name || ""); } }}
                  className="w-full text-sm px-3 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300"
                  style={{ background: "#f1f5f9", border: "1px solid rgba(99,102,241,0.3)" }}
                  placeholder="Your name"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 text-xs font-semibold py-1.5 rounded-lg text-white transition-colors"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={() => { setEditOpen(false); setName(user?.full_name || ""); }}
                    className="flex-1 text-xs font-semibold py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                    style={{ border: "1px solid rgba(0,0,0,0.1)" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Settings link */}
            <Link
              to={createPageUrl("UserSettings")}
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
                <Settings className="w-3.5 h-3.5 text-slate-500" />
              </div>
              Settings
            </Link>

            {/* Divider */}
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", margin: "4px 0" }} />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
              <div className="w-6 h-6 rounded-md bg-red-50 flex items-center justify-center">
                <LogOut className="w-3.5 h-3.5 text-red-500" />
              </div>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}