import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ALL_PERMISSIONS, useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, Pencil, Trash2, X, Shield, Users, Check, Save,
  LayoutDashboard, Database, Zap, ChevronRight, UserCheck,
  Eye, EyeOff, AlertTriangle, Search, ToggleLeft, ToggleRight
} from "lucide-react";

const DEFAULT_COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6"];

const PERM_GROUP_META = {
  Pages:   { icon: LayoutDashboard, color: "#6366f1", desc: "Which pages users can navigate to" },
  Data:    { icon: Database,        color: "#10b981", desc: "What sensitive data users can view" },
  Actions: { icon: Zap,            color: "#f59e0b", desc: "What actions users can perform" },
};

function PermissionToggle({ perm, checked, onChange, roleColor }) {
  return (
    <button
      onClick={() => onChange(perm.key)}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left group"
      style={{
        background: checked ? `${roleColor}12` : "rgba(7,11,31,0.6)",
        border: `1px solid ${checked ? roleColor + "35" : "rgba(99,102,241,0.08)"}`,
      }}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
          style={{ background: checked ? roleColor + "22" : "rgba(100,116,139,0.08)", border: `1px solid ${checked ? roleColor + "44" : "rgba(100,116,139,0.15)"}` }}>
          {checked && <Check className="w-3 h-3" style={{ color: roleColor }} />}
        </div>
        <span className="text-[12px] font-medium" style={{ color: checked ? "#e2e8f0" : "#64748b" }}>{perm.label}</span>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: checked ? "#ef4444" : roleColor }}>
        {checked ? "Revoke" : "Grant"}
      </span>
    </button>
  );
}

function UserAssignRow({ user, assigned, onToggle, roleColor }) {
  const initials = user.full_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??";
  return (
    <button
      onClick={() => onToggle(user.email)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
      style={{
        background: assigned ? `${roleColor}10` : "rgba(7,11,31,0.6)",
        border: `1px solid ${assigned ? roleColor + "35" : "rgba(99,102,241,0.08)"}`,
      }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0"
        style={{ background: assigned ? roleColor + "22" : "rgba(100,116,139,0.1)", color: assigned ? roleColor : "#475569" }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold truncate" style={{ color: assigned ? "#e2e8f0" : "#64748b" }}>{user.full_name}</p>
        <p className="text-[10px] truncate" style={{ color: "#334155", fontFamily: "monospace" }}>{user.email}</p>
      </div>
      <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
        style={{ background: assigned ? roleColor + "22" : "transparent", border: `1.5px solid ${assigned ? roleColor : "rgba(100,116,139,0.2)"}` }}>
        {assigned && <Check className="w-3 h-3" style={{ color: roleColor }} />}
      </div>
    </button>
  );
}

function RoleEditor({ role, users, onSubmit, onDelete, saving, isNew }) {
  const [form, setForm] = useState({
    name: role?.name || "",
    description: role?.description || "",
    color: role?.color || DEFAULT_COLORS[0],
    permissions: role?.permissions || {},
    assigned_user_emails: role?.assigned_user_emails || [],
  });
  const [activeTab, setActiveTab]     = useState("permissions");
  const [userSearch, setUserSearch]   = useState("");
  const [permSearch, setPermSearch]   = useState("");

  // Reset form when role changes
  useEffect(() => {
    setForm({
      name: role?.name || "",
      description: role?.description || "",
      color: role?.color || DEFAULT_COLORS[0],
      permissions: role?.permissions || {},
      assigned_user_emails: role?.assigned_user_emails || [],
    });
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

  const permCount   = Object.values(form.permissions).filter(Boolean).length;
  const userCount   = form.assigned_user_emails?.length || 0;
  const totalPerms  = ALL_PERMISSIONS.length;
  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredPerms = permSearch
    ? ALL_PERMISSIONS.filter(p => p.label.toLowerCase().includes(permSearch.toLowerCase()))
    : null;

  const TABS = [
    { key: "permissions", label: "Permissions", icon: Shield, badge: `${permCount}/${totalPerms}` },
    { key: "users",       label: "Users",       icon: Users,  badge: userCount },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: "#070b1f" }}>

      {/* Editor header */}
      <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(99,102,241,0.12)" }}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: "rgba(99,102,241,0.5)", fontFamily: "monospace" }}>
          {isNew ? "NEW ROLE" : "EDITING ROLE"}
        </p>

        {/* Name */}
        <input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Role name…"
          className="w-full bg-transparent text-[18px] font-black outline-none mb-1.5"
          style={{ color: "#e2e8f0", caretColor: form.color }}
        />
        <input
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Short description…"
          className="w-full bg-transparent text-[12px] outline-none"
          style={{ color: "#475569", caretColor: form.color }}
        />

        {/* Color picker */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#334155" }}>Color</span>
          <div className="flex gap-1.5 flex-1">
            {DEFAULT_COLORS.map(c => (
              <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                className="w-6 h-6 rounded-full transition-all hover:scale-110"
                style={{ background: c, outline: form.color === c ? `2.5px solid ${c}` : "none", outlineOffset: "2px", opacity: form.color === c ? 1 : 0.45 }} />
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { label: "Permissions", value: permCount, max: totalPerms, color: form.color },
            { label: "Users",       value: userCount, max: users.length, color: "#10b981" },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-3 py-2 relative overflow-hidden"
              style={{ background: "rgba(7,11,31,0.8)", border: "1px solid rgba(99,102,241,0.1)" }}>
              <div className="flex items-end justify-between mb-1">
                <span className="text-[10px]" style={{ color: "#334155" }}>{s.label}</span>
                <span className="text-[14px] font-black mono" style={{ color: s.color }}>{s.value}</span>
              </div>
              <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${s.max ? (s.value / s.max) * 100 : 0}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-shrink-0" style={{ borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-bold transition-all"
              style={{
                borderBottom: isActive ? `2px solid ${form.color}` : "2px solid transparent",
                color: isActive ? form.color : "#475569",
                marginBottom: -1,
              }}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black mono"
                style={{ background: isActive ? form.color + "22" : "rgba(100,116,139,0.1)", color: isActive ? form.color : "#334155" }}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">

        {/* Permissions tab */}
        {activeTab === "permissions" && (
          <div className="space-y-4">
            {/* Search + bulk */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: "#334155" }} />
                <input value={permSearch} onChange={e => setPermSearch(e.target.value)} placeholder="Search permissions…"
                  className="w-full pl-7 pr-3 py-2 rounded-lg text-[11px] outline-none"
                  style={{ background: "rgba(7,11,31,0.8)", border: "1px solid rgba(99,102,241,0.1)", color: "#94a3b8" }} />
              </div>
              <button onClick={() => setAllPerms(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:scale-105"
                style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                <Check className="w-3 h-3" /> All
              </button>
              <button onClick={() => setAllPerms(false)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:scale-105"
                style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                <X className="w-3 h-3" /> None
              </button>
            </div>

            {/* Search results */}
            {filteredPerms ? (
              <div className="space-y-1.5">
                {filteredPerms.length === 0
                  ? <p className="text-[11px] text-center py-4" style={{ color: "#334155" }}>No matching permissions</p>
                  : filteredPerms.map(perm => (
                    <PermissionToggle key={perm.key} perm={perm} checked={!!form.permissions[perm.key]} onChange={togglePerm} roleColor={form.color} />
                  ))}
              </div>
            ) : (
              /* Grouped view */
              Object.entries(PERM_GROUP_META).map(([group, meta]) => {
                const GroupIcon = meta.icon;
                const groupPerms = ALL_PERMISSIONS.filter(p => p.group === group);
                const grantedCount = groupPerms.filter(p => form.permissions[p.key]).length;
                const allGranted = grantedCount === groupPerms.length;
                const noneGranted = grantedCount === 0;

                return (
                  <div key={group} className="rounded-xl overflow-hidden"
                    style={{ border: "1px solid rgba(99,102,241,0.1)" }}>
                    {/* Group header */}
                    <div className="flex items-center justify-between px-3 py-2.5"
                      style={{ background: `${meta.color}08`, borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
                      <div className="flex items-center gap-2">
                        <GroupIcon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                        <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: meta.color }}>{group}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded mono font-bold"
                          style={{ background: `${meta.color}15`, color: meta.color }}>{grantedCount}/{groupPerms.length}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setGroupPerms(group, true)}
                          className="text-[9px] font-bold px-2 py-1 rounded transition-all hover:scale-105"
                          style={{ background: allGranted ? `${meta.color}20` : "rgba(16,185,129,0.08)", color: "#10b981", opacity: allGranted ? 0.5 : 1 }}>
                          Grant all
                        </button>
                        <button onClick={() => setGroupPerms(group, false)}
                          className="text-[9px] font-bold px-2 py-1 rounded transition-all hover:scale-105"
                          style={{ background: noneGranted ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.08)", color: "#ef4444", opacity: noneGranted ? 0.5 : 1 }}>
                          Revoke all
                        </button>
                      </div>
                    </div>
                    {/* Permissions */}
                    <div className="p-2 space-y-1" style={{ background: "rgba(7,11,31,0.4)" }}>
                      {groupPerms.map(perm => (
                        <PermissionToggle key={perm.key} perm={perm} checked={!!form.permissions[perm.key]} onChange={togglePerm} roleColor={form.color} />
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
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: "#334155" }} />
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users…"
                className="w-full pl-7 pr-3 py-2 rounded-lg text-[11px] outline-none"
                style={{ background: "rgba(7,11,31,0.8)", border: "1px solid rgba(99,102,241,0.1)", color: "#94a3b8" }} />
            </div>

            {userCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: `${form.color}08`, border: `1px solid ${form.color}20` }}>
                <UserCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: form.color }} />
                <p className="text-[11px] font-semibold" style={{ color: form.color }}>
                  {userCount} user{userCount !== 1 ? "s" : ""} assigned to this role
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              {filteredUsers.length === 0
                ? <p className="text-[11px] text-center py-8" style={{ color: "#334155" }}>No users found</p>
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

      {/* Footer actions */}
      <div className="px-4 py-3 flex items-center justify-between gap-2 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(99,102,241,0.1)", background: "rgba(7,11,31,0.8)" }}>
        <div>
          {!isNew && !role?.is_system && (
            <button
              onClick={() => { if (confirm(`Delete role "${role.name}"? This cannot be undone.`)) onDelete(role.id); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
              style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)" }}>
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
        </div>
        <button
          onClick={() => onSubmit(form)}
          disabled={!form.name.trim() || saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-black text-white transition-all hover:scale-105 disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${form.color}cc, ${form.color})`, boxShadow: `0 4px 16px ${form.color}44` }}>
          <Save className="w-3.5 h-3.5" />
          {saving ? "Saving…" : isNew ? "Create Role" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default function RolesManagement() {
  const { can, loading: rbacLoading } = useRBAC();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [isNew, setIsNew]           = useState(false);
  const [saving, setSaving]         = useState(false);

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
    onSuccess: (created) => {
      qc.invalidateQueries(["roles"]);
      setIsNew(false);
      setSelectedId(created.id);
      setSaving(false);
    },
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

  const handleSubmit = (form) => {
    setSaving(true);
    if (isNew) {
      createMut.mutate(form);
    } else {
      updateMut.mutate({ id: selectedId, data: form });
    }
  };

  const handleNewRole = () => {
    setSelectedId(null);
    setIsNew(true);
  };

  if (rbacLoading) return null;
  if (!can("roles_management")) return <AccessDenied />;

  const selectedRole = roles.find(r => r.id === selectedId) || null;
  const showEditor   = isNew || selectedId;

  const permCount = (role) => Object.values(role.permissions || {}).filter(Boolean).length;

  return (
    <div className="flex h-full overflow-hidden" style={{ height: "calc(100vh - 60px)" }}>

      {/* ── Left panel: Role list ── */}
      <div className="flex flex-col flex-shrink-0 overflow-hidden"
        style={{ width: 280, background: "#0a0f2e", borderRight: "1px solid rgba(99,102,241,0.12)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
          <div>
            <h1 className="text-[14px] font-black" style={{ color: "#e2e8f0" }}>Roles</h1>
            <p className="text-[10px] mono" style={{ color: "#334155" }}>{roles.length} role{roles.length !== 1 ? "s" : ""} configured</p>
          </div>
          <button onClick={handleNewRole}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 12px rgba(99,102,241,0.35)" }}>
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        {/* Role list */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" style={{ background: "#0d1527" }} />)}
            </div>
          ) : roles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <Shield className="w-8 h-8 mb-2" style={{ color: "#1e293b" }} />
              <p className="text-[12px]" style={{ color: "#334155" }}>No roles yet</p>
              <p className="text-[10px] mt-1" style={{ color: "#1e293b" }}>Create a role to start managing access</p>
            </div>
          ) : (
            <div className="space-y-1">
              {roles.map(role => {
                const color    = role.color || "#06b6d4";
                const count    = permCount(role);
                const uCount   = role.assigned_user_emails?.length || 0;
                const isActive = selectedId === role.id;
                return (
                  <button key={role.id} onClick={() => { setSelectedId(role.id); setIsNew(false); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all relative overflow-hidden"
                    style={{
                      background: isActive ? `${color}10` : "transparent",
                      border: `1px solid ${isActive ? color + "35" : "transparent"}`,
                    }}>
                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full" style={{ background: color }} />
                    )}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: color + "18", border: `1px solid ${color}30` }}>
                      <Shield className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold truncate" style={{ color: isActive ? "#e2e8f0" : "#94a3b8" }}>{role.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] mono" style={{ color: "#334155" }}>{count} perms</span>
                        {uCount > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "#475569" }}>
                            <Users className="w-2.5 h-2.5" /> {uCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isActive ? color : "#1e293b" }} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User count footer */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(99,102,241,0.08)" }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)" }}>
            <Users className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />
            <span className="text-[11px]" style={{ color: "#475569" }}>
              <span className="font-bold" style={{ color: "#6366f1" }}>{users.length}</span> total users in system
            </span>
          </div>
        </div>
      </div>

      {/* ── Right panel: Editor ── */}
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
          <div className="flex flex-col items-center justify-center h-full gap-4"
            style={{ background: "#070b1f" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
              <Shield className="w-8 h-8" style={{ color: "#6366f1" }} />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-bold" style={{ color: "#e2e8f0" }}>Select a Role</p>
              <p className="text-[11px] mt-1" style={{ color: "#334155" }}>Click a role from the list to edit its permissions and users</p>
            </div>
            <button onClick={handleNewRole}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
              <Plus className="w-4 h-4" /> Create New Role
            </button>
          </div>
        )}
      </div>
    </div>
  );
}