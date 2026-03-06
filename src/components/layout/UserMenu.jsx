import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { LogOut, User, ChevronDown, Settings } from "lucide-react";

export default function UserMenu() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    base44.auth.me().then((u) => { setUser(u); setName(u?.full_name || ""); }).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
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
    setOpen(false);
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all hover:bg-slate-100"
        style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #c0152a, #1a2550)" }}>
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-slate-700 leading-tight">{user?.full_name || "User"}</p>
          <p className="text-[10px] text-slate-400 leading-tight">{user?.role || "member"}</p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-xl z-50 overflow-hidden"
          style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.1)" }}>
          {/* User info header */}
          <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)", background: "#f8fafc" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #dc2626, #1e2a4a)" }}>
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{user?.full_name || "User"}</p>
                <p className="text-xs text-slate-400 truncate max-w-[140px]">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Edit profile */}
          {!editOpen ? (
            <button
              onClick={() => setEditOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <User className="w-4 h-4 text-slate-400" />
              Change Display Name
            </button>
          ) : (
            <div className="px-4 py-3 space-y-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Display Name</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm px-3 py-1.5 rounded-lg outline-none"
                style={{ background: "#f1f5f9", border: "1px solid rgba(0,0,0,0.1)" }}
                placeholder="Your name"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 text-xs font-semibold py-1.5 rounded-lg text-white transition-colors"
                  style={{ background: "#dc2626" }}>
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

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}