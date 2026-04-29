import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ALL_PERMISSIONS, useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";
import {
  Plus, Trash2, X, Shield, Users, Check, Save,
  LayoutDashboard, Database, Zap, ChevronRight, UserCheck,
  Search, Lock, Unlock, Eye, Crown, AlertTriangle, Copy, RefreshCw
} from "lucide-react";

const TEAL   = "#00b4b4";
const MAROON = "#8B1A1A";

const DEFAULT_COLORS = [
  "#00b4b4", "#8B1A1A", "#6366f1", "#10b981",
  "#f59e0b", "#0ea5e9", "#ec4899", "#8b5cf6"
];

const PERM_GROUP_META = {
  Pages:   { icon: LayoutDashboard, color: "#00b4b4", desc: "Which pages this role can access" },
  Data:    { icon: Database,        color: "#10b981", desc: "What sensitive data this role can view" },
  Actions: { icon: Zap,             color: "#f59e0b", desc: "What actions this role can perform" },
};

// ── Permission Toggle ─────────────────────────────────────────────────────────
function PermToggle({ perm, checked, onChange, roleColor }) {
  return (
    <button
      onClick={() => onChange(perm.key)}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left group interactive-row"
      style={{
        background: checked ? `${roleColor}12` : "rgba(255,255,255,0.02)",
        border: `1px solid ${checked ? roleColor + "40" : "rgba(255,255,255,0.06)"}`,
      }}>
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: checked ? roleColor + "25" : "rgba(255,255,255,0.04)",
            border: `1px solid ${checked ? roleColor + "50" : "rgba(255,255,255,0.08)"}`,
          }}>
          {checked && <Check className="w-3 h-3" style={{ color: roleColor }} />}
        </div>
        <span className="text-[12px] font-semibold" style={{ color: checked ? "#e0e0e0" : "rgba(255,255,255,0.35)" }}>
          {perm.label}
        </span>
      </div>
      <span className="text-[9px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded-md"
        style={{
          background: checked ? "rgba(139,26,26,0.15)" : `${roleColor}15`,
          color: checked ? "#c23030" : roleColor
        }}>
        {checked ? "Revoke" : "Grant"}
      </span>
    </button>
  );
}

// ── User Assign Row ───────────────────────────────────────────────────────────
function UserAssignRow({ user, assigned, onToggle, roleColor }) {
  const initials = user.full_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??";
  return (
    <button
      onClick={() => onToggle(user.email)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left interactive-row"
      style={{
        background: assigned ? `${roleColor}10` : "rgba(255,255,255,0.02)",
        border: `1px solid ${assigned ? roleColor + "35" : "rgba(255,255,255,0.06)"}`,
      }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black flex-shrink-0"
        style={{
          background: assigned ? roleColor + "20" : "rgba(255,255,255,0.06)",
          color: assigned ? roleColor : "rgba(255,255,255,0.3)",
          border: `1px solid ${assigned ? roleColor + "30" : "rgba(255,255,255,0.08)"}`,
        }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold truncate" style={{ color: assigned ? "#e0e0e0" : "rgba(255,255,255,0.4)" }}>
          {user.full_name}
        </p>
        <p className="text-[10px] truncate mono" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>
          {user.email}
        </p>
      </div>
      <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all"
        style={{
          background: assigned ? roleColor + "25" : "transparent",
          border: `1.5px solid ${assigned ? roleColor : "rgba(255,255,255,0.12)"}`,
        }}>
        {assigned && <Check className="w-3 h-3" style={{ color: roleColor }} />}
      </div>
    </button>
  );
}

// ── Role Editor Panel ─────────────────────────────────────────────────────────
function RoleEditor({ role, users, onSubmit, onDelete, saving, isNew }) {
  const [form, setForm] = useState({
    name: role?.name || "",
    description: role?.description || "",
    color: role?.color || DEFAULT_COLORS[0],
    permissions: role?.permissions || {},
    assigned_user_emails: role?.assigned_user_emails || [],
  });
  const [activeTab, setActiveTab]   = useState("permissions");
  const [userSearch, setUserSearch] = useState("");
  const [permSearch, setPermSearch] = useState("");
  const [saved, setSaved]           = useState(false);

  useEffect(() => {
    setForm({
      name: role?.name || "",
      description: role?.description || "",
      color: role?.color || DEFAULT_COLORS[0],
      permissions: role?.permissions || {},
      assigned_user_emails: role?.assigned_user_emails || [],
    });
    setSaved(false);
  }, [role?.id]);

  const togglePerm = (key) => setForm(f => ({ ...f, permissions: { ...f.permissions, [key]: !f.permissions[key] } }));
  const toggleUser = (email) => setForm(f => {
    const cur = f.assigned_user_emails || [];
    return { ...f, assigned_user_emails: cur.includes(email) ? cur.filter(e => e !== email) : [...cur, email] };
  });
  const setGroupPerms = (group, val) => {
    const perms = { ...form.permissions };
    ALL_PERMISSIONS.filter(p => p.group === group).forEach(p => { perms[p.key] = val; });
    setForm(f => ({ ...f, permissions: perms }));
  };
  const setAllPerms = (val) => {
    const perms = {};
    ALL_PERMISSIONS.forEach(p => { perms[p.key] = val; });
    setForm(f => ({ ...f, permissions: perms }));
  };

  const permCount     = Object.values(form.permissions).filter(Boolean).length;
  const userCount     = form.assigned_user_emails?.length || 0;
  const totalPerms    = ALL_PERMISSIONS.length;
  const permPct       = Math.round((permCount / totalPerms) * 100);

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredPerms = permSearch
    ? ALL_PERMISSIONS.filter(p => p.label.toLowerCase().includes(permSearch.toLowerCase()))
    : null;

  const handleSave = () => {
    onSubmit(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TABS = [
    { key: "permissions", label: "Permissions", icon: Shield,  badge: `${permCount}/${totalPerms}` },
    { key: "users",       label: "Users",        icon: Users,   badge: userCount },
  ];

  // Access level indicator
  const accessLevel = permPct === 0 ? "No Access" : permPct < 30 ? "Limited" : permPct < 70 ? "Standard" : permPct < 100 ? "Elevated" : "Full Access";
  const accessColor = permPct === 0 ? "#64748b" : permPct < 30 ? "#f59e0b" : permPct < 70 ? "#00b4b4" : permPct < 100 ? "#6366f1" : "#10b981";

  return (
    <div className="flex flex-col h-full relative" style={{ background: "#111111" }}>
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-10"
        style={{ background: `linear-gradient(90deg, ${form.color}, ${form.color}88, transparent)` }} />

      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-black uppercase tracking-[0.25em] mono px-2 py-0.5 rounded"
                style={{ background: `${form.color}15`, color: form.color, border: `1px solid ${form.color}30` }}>
                {isNew ? "NEW ROLE" : role?.is_system ? "SYSTEM ROLE" : "CUSTOM ROLE"}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded mono"
                style={{ background: `${accessColor}12`, color: accessColor, border: `1px solid ${accessColor}25` }}>
                {accessLevel}
              </span>
            </div>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Role name…"
              className="w-full bg-transparent text-[22px] font-black outline-none"
              style={{ color: "#f0f0f0", caretColor: form.color, fontFamily: "'Space Grotesk',sans-serif" }}
            />
            <input
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Short description of this role…"
              className="w-full bg-transparent text-[12px] outline-none mt-1"
              style={{ color: "rgba(255,255,255,0.35)", caretColor: form.color }}
            />
          </div>
          {/* Color selector */}
          <div className="flex flex-col items-end gap-2 ml-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${form.color}18`, border: `2px solid ${form.color}50`, boxShadow: `0 0 16px ${form.color}30` }}>
              <Shield className="w-5 h-5" style={{ color: form.color }} />
            </div>
            <div className="flex gap-1">
              {DEFAULT_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-4 h-4 rounded-full transition-all hover:scale-125"
                  style={{
                    background: c,
                    outline: form.color === c ? `2px solid ${c}` : "none",
                    outlineOffset: "2px",
                    opacity: form.color === c ? 1 : 0.35
                  }} />
              ))}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Permissions", value: permCount, max: totalPerms, color: form.color, icon: Lock },
            { label: "Users",       value: userCount, max: users.length, color: "#10b981", icon: Users },
            { label: "Access",      value: `${permPct}%`, max: null,     color: accessColor, icon: Eye },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl px-3 py-2.5 relative overflow-hidden teal-glass"
                style={{ border: `1px solid ${s.color}20` }}>
                <div className="absolute top-0 left-0 right-0 h-[1px]"
                  style={{ background: `linear-gradient(90deg, ${s.color}60, transparent)` }} />
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3 h-3" style={{ color: s.color }} />
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</span>
                </div>
                <p className="text-[18px] font-black mono leading-none" style={{ color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>
                  {s.value}
                </p>
                {s.max !== null && (
                  <div className="mt-1.5 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${s.max ? (Number(s.value) / s.max) * 100 : 0}%`, background: s.color, boxShadow: `0 0 6px ${s.color}80` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex flex-shrink-0 px-6 pt-2 gap-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-bold transition-all relative"
              style={{
                color: isActive ? form.color : "rgba(255,255,255,0.3)",
                borderBottom: isActive ? `2px solid ${form.color}` : "2px solid transparent",
                marginBottom: -1,
              }}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              <span className="px-1.5 py-0.5 rounded-lg text-[9px] font-black mono"
                style={{
                  background: isActive ? `${form.color}20` : "rgba(255,255,255,0.05)",
                  color: isActive ? form.color : "rgba(255,255,255,0.25)"
                }}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-y-auto p-5 content-scroll">

        {/* Permissions tab */}
        {activeTab === "permissions" && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.2)" }} />
                <input value={permSearch} onChange={e => setPermSearch(e.target.value)}
                  placeholder="Search permissions…"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-[11px] outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e0e0e0" }} />
              </div>
              <button onClick={() => setAllPerms(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all hover:scale-105"
                style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                <Unlock className="w-3 h-3" /> All
              </button>
              <button onClick={() => setAllPerms(false)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all hover:scale-105"
                style={{ background: "rgba(139,26,26,0.1)", color: "#c23030", border: "1px solid rgba(139,26,26,0.2)" }}>
                <Lock className="w-3 h-3" /> None
              </button>
            </div>

            {/* Filtered search results */}
            {filteredPerms ? (
              <div className="space-y-1.5">
                {filteredPerms.length === 0
                  ? <p className="text-[11px] text-center py-8" style={{ color: "rgba(255,255,255,0.2)" }}>No matching permissions</p>
                  : filteredPerms.map(perm => (
                    <PermToggle key={perm.key} perm={perm} checked={!!form.permissions[perm.key]} onChange={togglePerm} roleColor={form.color} />
                  ))}
              </div>
            ) : (
              Object.entries(PERM_GROUP_META).map(([group, meta]) => {
                const GroupIcon = meta.icon;
                const groupPerms = ALL_PERMISSIONS.filter(p => p.group === group);
                const grantedCount = groupPerms.filter(p => form.permissions[p.key]).length;
                const allGranted = grantedCount === groupPerms.length;
                const noneGranted = grantedCount === 0;
                const groupPct = Math.round((grantedCount / groupPerms.length) * 100);

                return (
                  <div key={group} className="rounded-2xl overflow-hidden"
                    style={{ border: `1px solid ${meta.color}20`, background: "rgba(255,255,255,0.01)" }}>
                    {/* Group header */}
                    <div className="flex items-center justify-between px-4 py-3"
                      style={{ background: `${meta.color}08`, borderBottom: `1px solid ${meta.color}15` }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}>
                          <GroupIcon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                        </div>
                        <div>
                          <span className="text-[12px] font-black uppercase tracking-wider" style={{ color: meta.color }}>{group}</span>
                          <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>{meta.desc}</p>
                        </div>
                        <span className="ml-1 text-[9px] px-2 py-0.5 rounded-full mono font-black"
                          style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }}>
                          {grantedCount}/{groupPerms.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Mini progress */}
                        <div className="w-16 h-1.5 rounded-full hidden sm:block" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${groupPct}%`, background: meta.color }} />
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => setGroupPerms(group, true)}
                            className="text-[9px] font-bold px-2 py-1 rounded-lg transition-all hover:scale-105"
                            style={{ background: allGranted ? `${meta.color}20` : "rgba(16,185,129,0.08)", color: "#10b981", opacity: allGranted ? 0.5 : 1 }}>
                            All
                          </button>
                          <button onClick={() => setGroupPerms(group, false)}
                            className="text-[9px] font-bold px-2 py-1 rounded-lg transition-all hover:scale-105"
                            style={{ background: noneGranted ? "rgba(139,26,26,0.15)" : "rgba(139,26,26,0.08)", color: "#c23030", opacity: noneGranted ? 0.5 : 1 }}>
                            None
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Permissions list */}
                    <div className="p-3 space-y-1.5">
                      {groupPerms.map(perm => (
                        <PermToggle key={perm.key} perm={perm} checked={!!form.permissions[perm.key]} onChange={togglePerm} roleColor={form.color} />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Users tab */}
        {activeTab === "users" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.2)" }} />
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                placeholder="Search users by name or email…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[11px] outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e0e0e0" }} />
            </div>

            {userCount > 0 && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                style={{ background: `${form.color}08`, border: `1px solid ${form.color}25` }}>
                <UserCheck className="w-4 h-4 flex-shrink-0" style={{ color: form.color }} />
                <p className="text-[11px] font-semibold" style={{ color: form.color }}>
                  {userCount} user{userCount !== 1 ? "s" : ""} currently assigned to this role
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              {filteredUsers.length === 0
                ? <p className="text-[11px] text-center py-12" style={{ color: "rgba(255,255,255,0.2)" }}>No users found</p>
                : filteredUsers.map(u => (
                  <UserAssignRow
                    key={u.email}
                    user={u}
                    assigned={form.assigned_user_emails?.includes(u.email)}
                    onToggle={toggleUser}
                    roleColor={form.color}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-4 flex items-center justify-between gap-3 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.3)" }}>
        <div>
          {!isNew && !role?.is_system && (
            <button
              onClick={() => { if (confirm(`Delete role "${role.name}"? This cannot be undone.`)) onDelete(role.id); }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
              style={{ background: "rgba(139,26,26,0.1)", color: "#c23030", border: "1px solid rgba(139,26,26,0.2)" }}>
              <Trash2 className="w-3.5 h-3.5" /> Delete Role
            </button>
          )}
          {role?.is_system && (
            <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <Lock className="w-3 h-3" style={{ color: "#f59e0b" }} />
              <span className="text-[10px] font-bold" style={{ color: "#f59e0b" }}>System role — protected</span>
            </div>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={!form.name.trim() || saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[12px] font-black text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
          style={{
            background: saved ? "linear-gradient(135deg,#10b981,#059669)" : `linear-gradient(135deg, ${form.color}dd, ${form.color})`,
            boxShadow: `0 4px 20px ${form.color}44`,
          }}>
          {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? "Saving…" : saved ? "Saved!" : isNew ? "Create Role" : "Save Changes"}
        </button>
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

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => base44.entities.Role.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

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

  const handleSubmit = (form) => { setSaving(true); isNew ? createMut.mutate(form) : updateMut.mutate({ id: selectedId, data: form }); };
  const handleNewRole = () => { setSelectedId(null); setIsNew(true); };

  if (rbacLoading) return null;
  if (!can("roles_management")) return <AccessDenied />;

  const selectedRole = roles.find(r => r.id === selectedId) || null;
  const showEditor   = isNew || selectedId;
  const permCount    = (r) => Object.values(r.permissions || {}).filter(Boolean).length;
  const totalAssigned = roles.reduce((a, r) => a + (r.assigned_user_emails?.length || 0), 0);

  const filteredRoles = roles.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
      <div className="flex h-full">

        {/* ── LEFT PANEL ── */}
        <div className="flex flex-col flex-shrink-0 overflow-hidden"
          style={{ width: 300, background: "linear-gradient(180deg, #0a0a0a 0%, #111111 100%)", borderRight: "1px solid rgba(0,212,212,0.1)" }}>

          {/* Panel header */}
          <div className="flex-shrink-0 px-4 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(0,180,180,0.12)", border: "1px solid rgba(0,212,212,0.25)", boxShadow: "0 0 12px rgba(0,180,180,0.15)" }}>
                  <Shield className="w-4.5 h-4.5" style={{ color: TEAL }} />
                </div>
                <div>
                  <h1 className="text-[15px] font-black" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>
                    Roles & Access
                  </h1>
                  <p className="text-[10px] mono" style={{ color: "rgba(0,212,212,0.4)" }}>
                    {roles.length} roles · {users.length} users
                  </p>
                </div>
              </div>
              <button onClick={handleNewRole}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 14px rgba(0,180,180,0.35)" }}>
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            </div>

            {/* Stats band */}
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {[
                { label: "Roles",     value: roles.length,   color: TEAL },
                { label: "Users",     value: users.length,   color: "#10b981" },
                { label: "Assigned",  value: totalAssigned,  color: "#6366f1" },
              ].map(s => (
                <div key={s.label} className="text-center py-2 rounded-xl"
                  style={{ background: `${s.color}08`, border: `1px solid ${s.color}18` }}>
                  <p className="text-[16px] font-black mono" style={{ color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</p>
                  <p className="text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(255,255,255,0.25)" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.2)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search roles…"
                className="w-full pl-9 pr-3 py-2 rounded-xl text-[11px] outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#e0e0e0" }} />
            </div>
          </div>

          {/* Role list */}
          <div className="flex-1 overflow-y-auto py-2 px-2 sidebar-scroll">
            {isLoading ? (
              <div className="space-y-2 p-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl shimmer" style={{ background: "rgba(255,255,255,0.04)" }} />
                ))}
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                <Shield className="w-8 h-8 mb-2" style={{ color: "rgba(0,180,180,0.2)" }} />
                <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {search ? "No matching roles" : "No roles yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredRoles.map(role => {
                  const color   = role.color || TEAL;
                  const count   = permCount(role);
                  const uCount  = role.assigned_user_emails?.length || 0;
                  const isActive = selectedId === role.id;
                  const pct = Math.round((count / ALL_PERMISSIONS.length) * 100);

                  return (
                    <button key={role.id}
                      onClick={() => { setSelectedId(role.id); setIsNew(false); }}
                      className="w-full px-3 py-3 rounded-xl text-left transition-all relative overflow-hidden group hover-lift"
                      style={{
                        background: isActive ? `${color}12` : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isActive ? color + "40" : "rgba(255,255,255,0.06)"}`,
                        boxShadow: isActive ? `0 4px 16px ${color}15` : "none",
                      }}>
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full" style={{ background: color }} />
                      )}
                      <div className="flex items-center gap-3 pl-1">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: color + "18", border: `1px solid ${color}30` }}>
                          {role.is_system
                            ? <Crown className="w-4 h-4" style={{ color }} />
                            : <Shield className="w-4 h-4" style={{ color }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[12px] font-bold truncate" style={{ color: isActive ? "#f0f0f0" : "rgba(255,255,255,0.6)" }}>
                              {role.name}
                            </p>
                            {role.is_system && (
                              <span className="text-[8px] font-black px-1 py-0.5 rounded mono"
                                style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
                                SYS
                              </span>
                            )}
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
                        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[9px] mono text-center" style={{ color: "rgba(0,212,212,0.25)", letterSpacing: "0.1em" }}>
              TOUCHNET · RBAC ENGINE · TMS v3.0
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 overflow-hidden">
          {showEditor ? (
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
              {/* Decorative bg */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(0,180,180,0.05) 0%, transparent 70%)" }} />
              <div className="relative flex flex-col items-center gap-4 text-center">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(0,180,180,0.1), transparent 70%)", animation: "pulse-navy 3s ease-in-out infinite" }} />
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
                    style={{ background: "rgba(0,180,180,0.08)", border: "1px solid rgba(0,212,212,0.2)", boxShadow: "0 0 24px rgba(0,180,180,0.12)" }}>
                    <div className="absolute top-2 left-2 w-3 h-3" style={{ borderTop: "1.5px solid rgba(0,212,212,0.4)", borderLeft: "1.5px solid rgba(0,212,212,0.4)" }} />
                    <div className="absolute bottom-2 right-2 w-3 h-3" style={{ borderBottom: "1.5px solid rgba(139,26,26,0.4)", borderRight: "1.5px solid rgba(139,26,26,0.4)" }} />
                    <Shield className="w-9 h-9" style={{ color: TEAL }} />
                  </div>
                </div>
                <div>
                  <p className="text-[16px] font-black" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>
                    Select a Role to Edit
                  </p>
                  <p className="text-[12px] mt-1 max-w-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Click any role from the list to configure its permissions and assign users
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleNewRole}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 active:scale-95"
                    style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 20px rgba(0,180,180,0.3)" }}>
                    <Plus className="w-4 h-4" /> Create New Role
                  </button>
                </div>
                {/* Role count badges */}
                {roles.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {roles.slice(0, 5).map(r => (
                      <button key={r.id}
                        onClick={() => { setSelectedId(r.id); setIsNew(false); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
                        style={{
                          background: `${r.color || TEAL}10`,
                          border: `1px solid ${r.color || TEAL}30`,
                          color: r.color || TEAL
                        }}>
                        <Shield className="w-3 h-3" />
                        {r.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}