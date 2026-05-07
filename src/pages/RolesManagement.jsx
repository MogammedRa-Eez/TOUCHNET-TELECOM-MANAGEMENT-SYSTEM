import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ALL_PERMISSIONS, useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Plus, Trash2, Shield, Users, Check, Save,
  LayoutDashboard, Database, Zap, Search, Lock, Unlock,
  Crown, UserCheck, X, Eye, ChevronRight, AlertTriangle, UserX,
  GripVertical, LayoutGrid
} from "lucide-react";

const TEAL   = "#00b4b4";
const MAROON = "#8B1A1A";

const DEFAULT_COLORS = [
  "#00b4b4", "#8B1A1A", "#6366f1", "#10b981",
  "#f59e0b", "#0ea5e9", "#ec4899", "#8b5cf6"
];

const PERM_GROUPS = {
  Pages:   { icon: LayoutDashboard, color: "#00b4b4", desc: "Which pages this role can access" },
  Data:    { icon: Database,        color: "#10b981", desc: "Sensitive data visibility" },
  Actions: { icon: Zap,             color: "#f59e0b", desc: "What actions this role can perform" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const permCount  = (r) => Object.values(r?.permissions || {}).filter(Boolean).length;
const accessLabel = (pct) =>
  pct === 0 ? "No Access" : pct < 30 ? "Limited" : pct < 70 ? "Standard" : pct < 100 ? "Elevated" : "Full Access";
const accessColor = (pct) =>
  pct === 0 ? "#64748b" : pct < 30 ? "#f59e0b" : pct < 70 ? "#00b4b4" : pct < 100 ? "#6366f1" : "#10b981";

// ── PermToggle ────────────────────────────────────────────────────────────────
function PermToggle({ perm, checked, onChange, color }) {
  return (
    <button onClick={() => onChange(perm.key)}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left"
      style={{
        background: checked ? `${color}10` : "rgba(255,255,255,0.02)",
        border: `1px solid ${checked ? color + "35" : "rgba(255,255,255,0.06)"}`,
      }}>
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
          style={{ background: checked ? color + "25" : "rgba(255,255,255,0.04)", border: `1px solid ${checked ? color + "50" : "rgba(255,255,255,0.08)"}` }}>
          {checked && <Check className="w-3 h-3" style={{ color }} />}
        </div>
        <span className="text-[12px] font-medium" style={{ color: checked ? "#e0e0e0" : "rgba(255,255,255,0.35)" }}>
          {perm.label}
        </span>
      </div>
      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
        style={{ background: checked ? "rgba(139,26,26,0.12)" : `${color}12`, color: checked ? "#c23030" : color, opacity: 0.7 }}>
        {checked ? "Revoke" : "Grant"}
      </span>
    </button>
  );
}

// ── RoleEditor ────────────────────────────────────────────────────────────────
function RoleEditor({ role, users, onSubmit, onDelete, saving, isNew, onClose }) {
  const [form, setForm] = useState({
    name:                 role?.name || "",
    description:          role?.description || "",
    color:                role?.color || DEFAULT_COLORS[0],
    permissions:          role?.permissions || {},
    assigned_user_emails: role?.assigned_user_emails || [],
  });
  const [tab, setTab]           = useState("permissions");
  const [userSearch, setSearch] = useState("");
  const [saved, setSaved]       = useState(false);

  React.useEffect(() => {
    setForm({
      name:                 role?.name || "",
      description:          role?.description || "",
      color:                role?.color || DEFAULT_COLORS[0],
      permissions:          role?.permissions || {},
      assigned_user_emails: role?.assigned_user_emails || [],
    });
    setSaved(false);
    setTab("permissions");
  }, [role?.id]);

  const togglePerm  = (key) => setForm(f => ({ ...f, permissions: { ...f.permissions, [key]: !f.permissions[key] } }));
  const toggleUser  = (email) => setForm(f => {
    const cur = f.assigned_user_emails || [];
    return { ...f, assigned_user_emails: cur.includes(email) ? cur.filter(e => e !== email) : [...cur, email] };
  });
  const setGroupAll = (group, val) => {
    const p = { ...form.permissions };
    ALL_PERMISSIONS.filter(x => x.group === group).forEach(x => { p[x.key] = val; });
    setForm(f => ({ ...f, permissions: p }));
  };
  const setAll = (val) => {
    const p = {};
    ALL_PERMISSIONS.forEach(x => { p[x.key] = val; });
    setForm(f => ({ ...f, permissions: p }));
  };

  const pCount = permCount(form);
  const pPct   = Math.round((pCount / ALL_PERMISSIONS.length) * 100);
  const uCount = form.assigned_user_emails?.length || 0;

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleSave = () => {
    onSubmit(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#111111" }}>
      {/* Accent top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-10"
        style={{ background: `linear-gradient(90deg, ${form.color}, ${form.color}55, transparent)` }} />

      {/* ── Header ── */}
      <div className="px-6 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-start gap-4">
          {/* Color swatch + icon */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${form.color}18`, border: `2px solid ${form.color}45`, boxShadow: `0 0 20px ${form.color}25` }}>
            {role?.is_system ? <Crown className="w-5 h-5" style={{ color: form.color }} /> : <Shield className="w-5 h-5" style={{ color: form.color }} />}
          </div>

          <div className="flex-1 min-w-0">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Role name…"
              className="w-full bg-transparent text-[20px] font-black outline-none"
              style={{ color: "#f0f0f0", caretColor: form.color, fontFamily: "'Space Grotesk',sans-serif" }} />
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Short description…"
              className="w-full bg-transparent text-[12px] outline-none mt-0.5"
              style={{ color: "rgba(255,255,255,0.3)", caretColor: form.color }} />
          </div>

          {/* Close (mobile) */}
          {onClose && (
            <button onClick={onClose} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Color picker */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.2)" }}>Color</span>
          <div className="flex gap-1.5">
            {DEFAULT_COLORS.map(c => (
              <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                className="w-5 h-5 rounded-full transition-all hover:scale-125"
                style={{ background: c, outline: form.color === c ? `2px solid ${c}` : "none", outlineOffset: 2, opacity: form.color === c ? 1 : 0.35 }} />
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: `${accessColor(pPct)}12`, color: accessColor(pPct), border: `1px solid ${accessColor(pPct)}25` }}>
              {accessLabel(pPct)} · {pPct}%
            </span>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
              style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
              {uCount} user{uCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        {[
          { key: "permissions", label: "Permissions", icon: Shield, badge: `${pCount}/${ALL_PERMISSIONS.length}` },
          { key: "users",       label: "Assign Users", icon: Users, badge: uCount },
        ].map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-5 py-3 text-[12px] font-bold transition-all"
              style={{ color: active ? form.color : "rgba(255,255,255,0.3)", borderBottom: active ? `2px solid ${form.color}` : "2px solid transparent", marginBottom: -1 }}>
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black"
                style={{ background: active ? `${form.color}20` : "rgba(255,255,255,0.05)", color: active ? form.color : "rgba(255,255,255,0.2)" }}>
                {t.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-5 content-scroll">

        {/* PERMISSIONS */}
        {tab === "permissions" && (
          <div className="space-y-4">
            {/* Grant/revoke all */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>Toggle all permissions at once:</p>
              <div className="flex gap-2">
                <button onClick={() => setAll(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
                  style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <Unlock className="w-3 h-3" /> Grant All
                </button>
                <button onClick={() => setAll(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
                  style={{ background: "rgba(139,26,26,0.1)", color: "#c23030", border: "1px solid rgba(139,26,26,0.2)" }}>
                  <Lock className="w-3 h-3" /> Revoke All
                </button>
              </div>
            </div>

            {Object.entries(PERM_GROUPS).map(([group, meta]) => {
              const GroupIcon  = meta.icon;
              const groupPerms = ALL_PERMISSIONS.filter(p => p.group === group);
              const granted    = groupPerms.filter(p => form.permissions[p.key]).length;
              const pct        = Math.round((granted / groupPerms.length) * 100);
              return (
                <div key={group} className="rounded-2xl overflow-hidden"
                  style={{ border: `1px solid ${meta.color}20`, background: "rgba(255,255,255,0.01)" }}>
                  {/* Group header */}
                  <div className="flex items-center justify-between px-4 py-3"
                    style={{ background: `${meta.color}07`, borderBottom: `1px solid ${meta.color}15` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}>
                        <GroupIcon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                      </div>
                      <div>
                        <span className="text-[12px] font-black uppercase tracking-wider" style={{ color: meta.color }}>{group}</span>
                        <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>{meta.desc}</p>
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full mono"
                        style={{ background: `${meta.color}15`, color: meta.color }}>
                        {granted}/{groupPerms.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 rounded-full hidden sm:block" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: meta.color }} />
                      </div>
                      <button onClick={() => setGroupAll(group, true)}
                        className="text-[9px] font-bold px-2 py-1 rounded-lg"
                        style={{ background: "rgba(16,185,129,0.08)", color: "#10b981" }}>All</button>
                      <button onClick={() => setGroupAll(group, false)}
                        className="text-[9px] font-bold px-2 py-1 rounded-lg"
                        style={{ background: "rgba(139,26,26,0.08)", color: "#c23030" }}>None</button>
                    </div>
                  </div>
                  <div className="p-3 space-y-1.5">
                    {groupPerms.map(perm => (
                      <PermToggle key={perm.key} perm={perm} checked={!!form.permissions[perm.key]} onChange={togglePerm} color={form.color} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* USERS */}
        {tab === "users" && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl" style={{ background: "rgba(0,180,180,0.05)", border: "1px solid rgba(0,180,180,0.15)" }}>
              <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                Click a user to toggle their assignment to this role. A user can only belong to one custom role.
              </p>
            </div>

            {/* Summary */}
            {uCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: `${form.color}08`, border: `1px solid ${form.color}25` }}>
                <UserCheck className="w-4 h-4 flex-shrink-0" style={{ color: form.color }} />
                <p className="text-[12px] font-semibold" style={{ color: form.color }}>
                  {uCount} user{uCount !== 1 ? "s" : ""} assigned — {form.assigned_user_emails?.join(", ")}
                </p>
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.2)" }} />
              <input value={userSearch} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[11px] outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e0e0e0" }} />
            </div>

            <div className="space-y-1.5">
              {filteredUsers.length === 0
                ? <p className="text-center py-10 text-[12px]" style={{ color: "rgba(255,255,255,0.2)" }}>No users found</p>
                : filteredUsers.map(u => {
                  const assigned = form.assigned_user_emails?.includes(u.email);
                  const initials = u.full_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
                  return (
                    <button key={u.email} onClick={() => toggleUser(u.email)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                      style={{ background: assigned ? `${form.color}10` : "rgba(255,255,255,0.02)", border: `1px solid ${assigned ? form.color + "35" : "rgba(255,255,255,0.06)"}` }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black flex-shrink-0"
                        style={{ background: assigned ? form.color + "20" : "rgba(255,255,255,0.06)", color: assigned ? form.color : "rgba(255,255,255,0.3)", border: `1px solid ${assigned ? form.color + "30" : "rgba(255,255,255,0.08)"}` }}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold truncate" style={{ color: assigned ? "#e0e0e0" : "rgba(255,255,255,0.45)" }}>{u.full_name}</p>
                        <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>{u.email}</p>
                      </div>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ background: assigned ? form.color + "25" : "transparent", border: `1.5px solid ${assigned ? form.color : "rgba(255,255,255,0.12)"}` }}>
                        {assigned && <Check className="w-3 h-3" style={{ color: form.color }} />}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-4 flex items-center justify-between gap-3 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.25)" }}>
        <div>
          {!isNew && !role?.is_system && (
            <button onClick={() => { if (confirm(`Delete role "${role.name}"?`)) onDelete(role.id); }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
              style={{ background: "rgba(139,26,26,0.1)", color: "#c23030", border: "1px solid rgba(139,26,26,0.2)" }}>
              <Trash2 className="w-3.5 h-3.5" /> Delete Role
            </button>
          )}
          {role?.is_system && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <Lock className="w-3 h-3" style={{ color: "#f59e0b" }} />
              <span className="text-[10px] font-bold" style={{ color: "#f59e0b" }}>System role — protected</span>
            </div>
          )}
        </div>
        <button onClick={handleSave} disabled={!form.name.trim() || saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[12px] font-black text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
          style={{ background: saved ? "linear-gradient(135deg,#10b981,#059669)" : `linear-gradient(135deg, ${form.color}dd, ${form.color})`, boxShadow: `0 4px 20px ${form.color}40` }}>
          {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? "Saving…" : saved ? "Saved!" : isNew ? "Create Role" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ── User Overview Table ───────────────────────────────────────────────────────
function UserOverview({ users, roles, onEditRole }) {
  const [search, setSearch] = useState("");

  const roleMap = {};
  roles.forEach(r => {
    (r.assigned_user_emails || []).forEach(email => { roleMap[email] = r; });
  });

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const unassigned = filtered.filter(u => u.role !== "admin" && !roleMap[u.email]);
  const assigned   = filtered.filter(u => u.role !== "admin" && roleMap[u.email]);
  const admins     = filtered.filter(u => u.role === "admin");

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <h2 className="text-[16px] font-black mb-1" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>User Access Overview</h2>
        <p className="text-[12px] mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>See every user and what role they have assigned.</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.2)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[11px] outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e0e0e0" }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 content-scroll space-y-5">

        {/* Admins */}
        {admins.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
              <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: "#f59e0b" }}>Administrators ({admins.length})</span>
            </div>
            <div className="space-y-1.5">
              {admins.map(u => (
                <UserRow key={u.email} user={u} role={null} isAdmin={true} />
              ))}
            </div>
          </section>
        )}

        {/* Assigned users */}
        {assigned.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
              <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: "#10b981" }}>Role Assigned ({assigned.length})</span>
            </div>
            <div className="space-y-1.5">
              {assigned.map(u => (
                <UserRow key={u.email} user={u} role={roleMap[u.email]} isAdmin={false} onEditRole={onEditRole} />
              ))}
            </div>
          </section>
        )}

        {/* Unassigned users */}
        {unassigned.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
              <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: "#f59e0b" }}>No Role Assigned ({unassigned.length})</span>
            </div>
            <p className="text-[11px] mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
              These users can log in but have no permissions. Assign them to a role.
            </p>
            <div className="space-y-1.5">
              {unassigned.map(u => (
                <UserRow key={u.email} user={u} role={null} isAdmin={false} onEditRole={onEditRole} />
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Users className="w-8 h-8" style={{ color: "rgba(255,255,255,0.1)" }} />
            <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.2)" }}>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function UserRow({ user, role, isAdmin, onEditRole }) {
  const initials = user.full_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  const color    = isAdmin ? "#f59e0b" : role ? (role.color || TEAL) : "#64748b";

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black flex-shrink-0"
        style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold truncate" style={{ color: "#e0e0e0" }}>{user.full_name}</p>
        <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>{user.email}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isAdmin ? (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black"
            style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}>
            <Crown className="w-3 h-3" /> Admin
          </span>
        ) : role ? (
          <button onClick={() => onEditRole(role.id)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all hover:scale-105"
            style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}>
            <Shield className="w-3 h-3" />
            {role.name}
            <ChevronRight className="w-3 h-3" />
          </button>
        ) : (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ background: "rgba(100,116,139,0.1)", color: "#64748b", border: "1px solid rgba(100,116,139,0.2)" }}>
            <UserX className="w-3 h-3" /> No Role
          </span>
        )}
      </div>
    </div>
  );
}

// ── User Role Grid (Drag & Drop) ──────────────────────────────────────────────
function UserRoleGrid({ users, roles, onUpdateRole }) {
  const [search, setSearch] = useState("");
  const [toast, setToast]   = useState(null);

  // Build roleId → role map and email → roleId map
  const roleMap = {};
  roles.forEach(r => {
    (r.assigned_user_emails || []).forEach(email => { roleMap[email] = r.id; });
  });

  // Columns: one per role + "unassigned" + "admin"
  const columns = [
    { id: "__unassigned__", label: "No Role",  color: "#64748b", icon: null },
    ...roles.map(r => ({ id: r.id, label: r.name, color: r.color || TEAL, icon: r.is_system ? "crown" : "shield" })),
  ];

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getUsersForColumn = (colId) => {
    if (colId === "__unassigned__") return filteredUsers.filter(u => u.role !== "admin" && !roleMap[u.email]);
    return filteredUsers.filter(u => u.role !== "admin" && roleMap[u.email] === colId);
  };

  const adminUsers = filteredUsers.filter(u => u.role === "admin");

  const handleDragEnd = async (result) => {
    const { draggableId: userEmail, destination } = result;
    if (!destination) return;

    const targetColId = destination.droppableId;
    const currentRoleId = roleMap[userEmail];

    // No change
    if (targetColId === (currentRoleId || "__unassigned__")) return;

    // Build updates: remove from old role, add to new role
    const updates = [];

    // Remove from old role
    if (currentRoleId) {
      const oldRole = roles.find(r => r.id === currentRoleId);
      if (oldRole) {
        updates.push({
          id: oldRole.id,
          data: { ...oldRole, assigned_user_emails: (oldRole.assigned_user_emails || []).filter(e => e !== userEmail) }
        });
      }
    }

    // Add to new role
    if (targetColId !== "__unassigned__") {
      const newRole = roles.find(r => r.id === targetColId);
      if (newRole) {
        const existing = updates.find(u => u.id === newRole.id);
        if (existing) {
          existing.data.assigned_user_emails = [...(existing.data.assigned_user_emails || []), userEmail];
        } else {
          updates.push({
            id: newRole.id,
            data: { ...newRole, assigned_user_emails: [...(newRole.assigned_user_emails || []), userEmail] }
          });
        }
      }
    }

    const userName = users.find(u => u.email === userEmail)?.full_name || userEmail;
    const targetName = targetColId === "__unassigned__" ? "No Role" : roles.find(r => r.id === targetColId)?.name;
    setToast(`Moved ${userName} → ${targetName}`);
    setTimeout(() => setToast(null), 3000);

    await onUpdateRole(updates);
  };

  return (
    <div className="flex flex-col h-full page-bg">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-[16px] font-black" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>
              User → Role Assignment Board
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Drag any user card into a role column to instantly reassign them.
            </p>
          </div>
          <div className="relative flex-shrink-0 w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.2)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter users…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[11px] outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e0e0e0" }} />
          </div>
        </div>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-5">
          <div className="flex gap-4 h-full" style={{ minWidth: columns.length * 240 }}>

            {/* Admin column (non-droppable) */}
            {adminUsers.length > 0 && (
              <div className="flex flex-col rounded-2xl overflow-hidden flex-shrink-0" style={{ width: 220, background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(245,158,11,0.15)", background: "rgba(245,158,11,0.08)" }}>
                  <div className="flex items-center gap-2">
                    <Crown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#f59e0b" }} />
                    <span className="text-[11px] font-black uppercase tracking-wider truncate" style={{ color: "#f59e0b" }}>Administrators</span>
                    <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>{adminUsers.length}</span>
                  </div>
                  <p className="text-[9px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>Full system access · cannot drag</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5 content-scroll">
                  {adminUsers.map(u => (
                    <UserDragCard key={u.email} user={u} color="#f59e0b" draggable={false} index={0} />
                  ))}
                </div>
              </div>
            )}

            {/* Role columns */}
            {columns.map(col => {
              const colUsers = getUsersForColumn(col.id);
              const isUnassigned = col.id === "__unassigned__";
              return (
                <div key={col.id} className="flex flex-col rounded-2xl overflow-hidden flex-shrink-0"
                  style={{ width: 220, background: `${col.color}06`, border: `1px solid ${col.color}${isUnassigned ? "18" : "25"}` }}>
                  {/* Column header */}
                  <div className="px-3 py-3 flex-shrink-0"
                    style={{ borderBottom: `1px solid ${col.color}18`, background: `${col.color}0a` }}>
                    <div className="flex items-center gap-2">
                      {isUnassigned
                        ? <UserX className="w-3.5 h-3.5 flex-shrink-0" style={{ color: col.color }} />
                        : col.icon === "crown"
                          ? <Crown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: col.color }} />
                          : <Shield className="w-3.5 h-3.5 flex-shrink-0" style={{ color: col.color }} />
                      }
                      <span className="text-[11px] font-black uppercase tracking-wider truncate" style={{ color: col.color }}>{col.label}</span>
                      <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: `${col.color}18`, color: col.color }}>{colUsers.length}</span>
                    </div>
                    {!isUnassigned && (() => {
                      const role = roles.find(r => r.id === col.id);
                      const pct  = role ? Math.round((permCount(role) / ALL_PERMISSIONS.length) * 100) : 0;
                      return (
                        <div className="mt-2">
                          <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: col.color }} />
                          </div>
                          <p className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>{pct}% permissions granted</p>
                        </div>
                      );
                    })()}
                    {isUnassigned && (
                      <p className="text-[9px] mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>Drop here to remove role</p>
                    )}
                  </div>

                  {/* Droppable area */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex-1 overflow-y-auto p-2 space-y-1.5 content-scroll transition-all"
                        style={{
                          minHeight: 80,
                          background: snapshot.isDraggingOver ? `${col.color}12` : "transparent",
                          outline: snapshot.isDraggingOver ? `2px dashed ${col.color}60` : "none",
                          outlineOffset: -4,
                          borderRadius: 8,
                        }}>
                        {colUsers.map((u, index) => (
                          <Draggable key={u.email} draggableId={u.email} index={index}>
                            {(prov, snap) => (
                              <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                                <UserDragCard user={u} color={col.color} dragging={snap.isDragging} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {colUsers.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex flex-col items-center justify-center py-8 gap-1">
                            <div className="w-6 h-6 rounded-full border-2 border-dashed flex items-center justify-center"
                              style={{ borderColor: `${col.color}30` }}>
                              <Plus className="w-3 h-3" style={{ color: `${col.color}40` }} />
                            </div>
                            <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.15)" }}>Drop users here</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl"
          style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.3)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
          <Check className="w-4 h-4" style={{ color: "#10b981" }} />
          <span className="text-[12px] font-bold" style={{ color: "#f0f0f0" }}>{toast}</span>
        </div>
      )}
    </div>
  );
}

function UserDragCard({ user, color, dragging, draggable = true }) {
  const initials = user.full_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all select-none"
      style={{
        background: dragging ? `${color}20` : "rgba(255,255,255,0.04)",
        border: `1px solid ${dragging ? color + "50" : "rgba(255,255,255,0.07)"}`,
        boxShadow: dragging ? `0 8px 24px rgba(0,0,0,0.5), 0 0 0 2px ${color}40` : "none",
        cursor: draggable ? "grab" : "default",
      }}>
      {draggable && <GripVertical className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.15)" }} />}
      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
        style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold truncate leading-tight" style={{ color: "#e0e0e0" }}>{user.full_name}</p>
        <p className="text-[9px] truncate" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>{user.email}</p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RolesManagement() {
  const { can, loading: rbacLoading } = useRBAC();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [isNew, setIsNew]           = useState(false);
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState("");
  const [mainTab, setMainTab]       = useState("roles"); // "roles" | "users" | "grid"

  const { data: roles = [], isLoading } = useQuery({ queryKey: ["roles"], queryFn: () => base44.entities.Role.list() });
  const { data: users = [] }            = useQuery({ queryKey: ["users"], queryFn: () => base44.entities.User.list() });

  const createMut = useMutation({
    mutationFn: (d) => base44.entities.Role.create(d),
    onSuccess: (created) => { qc.invalidateQueries(["roles"]); setIsNew(false); setSelectedId(created.id); setSaving(false); },
    onError: () => setSaving(false),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Role.update(id, data),
    onSuccess: () => { qc.invalidateQueries(["roles"]); setSaving(false); },
    onError: () => setSaving(false),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Role.delete(id),
    onSuccess: () => { qc.invalidateQueries(["roles"]); setSelectedId(null); setIsNew(false); },
  });

  const handleSubmit  = (form) => { setSaving(true); isNew ? createMut.mutate(form) : updateMut.mutate({ id: selectedId, data: form }); };
  const handleNewRole = () => { setSelectedId(null); setIsNew(true); setMainTab("roles"); };
  const handleEditRole = (id) => { setSelectedId(id); setIsNew(false); setMainTab("roles"); };

  const handleGridRoleUpdate = async (updates) => {
    await Promise.all(updates.map(u => updateMut.mutateAsync({ id: u.id, data: u.data })));
    qc.invalidateQueries(["roles"]);
  };

  if (rbacLoading) return null;
  if (!can("roles_management")) return <AccessDenied />;

  const selectedRole = roles.find(r => r.id === selectedId) || null;
  const showEditor   = isNew || selectedId;

  const filteredRoles = roles.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalAssigned = roles.reduce((a, r) => a + (r.assigned_user_emails?.length || 0), 0);
  const unassignedCount = users.filter(u => u.role !== "admin" && !roles.some(r => r.assigned_user_emails?.includes(u.email))).length;

  return (
    <div className="flex h-full overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>

      {/* ── LEFT SIDEBAR ── */}
      <div className="flex flex-col flex-shrink-0" style={{ width: 280, background: "linear-gradient(180deg,#0a0a0a,#111111)", borderRight: "1px solid rgba(0,212,212,0.1)" }}>

        {/* Header */}
        <div className="px-4 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(0,180,180,0.12)", border: "1px solid rgba(0,212,212,0.25)" }}>
                <Shield className="w-4 h-4" style={{ color: TEAL }} />
              </div>
              <div>
                <h1 className="text-[14px] font-black" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>Roles & Access</h1>
                <p className="text-[10px]" style={{ color: "rgba(0,212,212,0.4)" }}>{roles.length} roles · {users.length} users</p>
              </div>
            </div>
            <button onClick={handleNewRole}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-[11px] font-black text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 12px rgba(0,180,180,0.3)" }}>
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>

          {/* Summary chips */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {[
              { label: "Roles",      value: roles.length,   color: TEAL },
              { label: "Assigned",   value: totalAssigned,  color: "#10b981" },
              { label: "No Role",    value: unassignedCount, color: unassignedCount > 0 ? "#f59e0b" : "#64748b" },
            ].map(s => (
              <div key={s.label} className="text-center py-2 rounded-xl"
                style={{ background: `${s.color}08`, border: `1px solid ${s.color}18` }}>
                <p className="text-[15px] font-black" style={{ color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</p>
                <p className="text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(255,255,255,0.25)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,180,180,0.15)" }}>
            {[
              { key: "roles", label: "Roles",   icon: Shield },
              { key: "users", label: "Users",   icon: Users  },
              { key: "grid",  label: "Board",   icon: LayoutGrid },
            ].map(t => {
              const Icon = t.icon;
              const active = mainTab === t.key;
              return (
                <button key={t.key} onClick={() => setMainTab(t.key)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold transition-all"
                  style={{ background: active ? "rgba(0,180,180,0.15)" : "transparent", color: active ? TEAL : "rgba(255,255,255,0.35)" }}>
                  <Icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Roles list (only shown on "roles" tab, not grid/users) */}
        {mainTab === "roles" && (
          <>
            <div className="px-3 pt-3 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.2)" }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roles…"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-[11px] outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#e0e0e0" }} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-2 px-2 sidebar-scroll">
              {isLoading ? (
                <div className="space-y-2 p-2">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl shimmer" style={{ background: "rgba(255,255,255,0.04)" }} />)}
                </div>
              ) : filteredRoles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Shield className="w-6 h-6 mb-1" style={{ color: "rgba(0,180,180,0.2)" }} />
                  <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>{search ? "No matching roles" : "No roles yet"}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredRoles.map(role => {
                    const color   = role.color || TEAL;
                    const count   = permCount(role);
                    const uCount  = role.assigned_user_emails?.length || 0;
                    const pct     = Math.round((count / ALL_PERMISSIONS.length) * 100);
                    const isActive = selectedId === role.id;

                    return (
                      <button key={role.id}
                        onClick={() => { setSelectedId(role.id); setIsNew(false); }}
                        className="w-full px-3 py-3 rounded-xl text-left transition-all relative overflow-hidden group"
                        style={{ background: isActive ? `${color}12` : "rgba(255,255,255,0.02)", border: `1px solid ${isActive ? color + "40" : "rgba(255,255,255,0.06)"}`, boxShadow: isActive ? `0 4px 16px ${color}15` : "none" }}>
                        {isActive && <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full" style={{ background: color }} />}
                        <div className="flex items-center gap-2.5 pl-1">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: color + "18", border: `1px solid ${color}30` }}>
                            {role.is_system ? <Crown className="w-3.5 h-3.5" style={{ color }} /> : <Shield className="w-3.5 h-3.5" style={{ color }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[12px] font-bold truncate" style={{ color: isActive ? "#f0f0f0" : "rgba(255,255,255,0.6)" }}>{role.name}</p>
                              {role.is_system && <span className="text-[8px] font-black px-1 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>SYS</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                              </div>
                              <span className="text-[9px] mono font-bold flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }}>
                                {count}p · {uCount}u
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[9px] mono text-center" style={{ color: "rgba(0,212,212,0.2)", letterSpacing: "0.1em" }}>
            TOUCHNET · RBAC ENGINE · TMS v3.0
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 overflow-hidden relative">

        {/* User Overview tab */}
        {mainTab === "users" && (
          <UserOverview users={users} roles={roles} onEditRole={handleEditRole} />
        )}

        {/* Drag & Drop Grid tab */}
        {mainTab === "grid" && (
          <UserRoleGrid users={users} roles={roles} onUpdateRole={handleGridRoleUpdate} />
        )}

        {/* Roles tab — editor or empty state */}
        {mainTab === "roles" && (
          showEditor ? (
            <RoleEditor
              key={isNew ? "new" : selectedId}
              role={selectedRole}
              users={users}
              onSubmit={handleSubmit}
              onDelete={deleteMut.mutate}
              saving={saving}
              isNew={isNew}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-5 page-bg">
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(0,180,180,0.04) 0%, transparent 70%)" }} />
              <div className="relative flex flex-col items-center gap-4 text-center z-10">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(0,180,180,0.07)", border: "1px solid rgba(0,212,212,0.18)" }}>
                  <Shield className="w-9 h-9" style={{ color: TEAL }} />
                </div>
                <div>
                  <p className="text-[16px] font-black" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>Select a Role to Edit</p>
                  <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Click any role on the left to configure its permissions and assigned users.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleNewRole}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 20px rgba(0,180,180,0.3)" }}>
                    <Plus className="w-4 h-4" /> Create New Role
                  </button>
                  <button onClick={() => setMainTab("users")}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
                    style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Users className="w-4 h-4" /> View Users
                  </button>
                </div>
                {roles.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-sm">
                    {roles.slice(0, 6).map(r => (
                      <button key={r.id} onClick={() => { setSelectedId(r.id); setIsNew(false); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
                        style={{ background: `${r.color || TEAL}10`, border: `1px solid ${r.color || TEAL}30`, color: r.color || TEAL }}>
                        <Shield className="w-3 h-3" /> {r.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}