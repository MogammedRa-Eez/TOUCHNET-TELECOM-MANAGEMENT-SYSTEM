import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ALL_PERMISSIONS, useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, X, Shield, Users, Check } from "lucide-react";

const PERM_GROUPS = ["Pages", "Data", "Actions"];

const DEFAULT_COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

function RoleForm({ role, users, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: role?.name || "",
    description: role?.description || "",
    color: role?.color || DEFAULT_COLORS[0],
    permissions: role?.permissions || {},
    assigned_user_emails: role?.assigned_user_emails || [],
  });

  const togglePerm = (key) => setForm(f => ({
    ...f,
    permissions: { ...f.permissions, [key]: !f.permissions[key] }
  }));

  const toggleUser = (email) => setForm(f => {
    const cur = f.assigned_user_emails || [];
    return {
      ...f,
      assigned_user_emails: cur.includes(email) ? cur.filter(e => e !== email) : [...cur, email]
    };
  });

  const setAllPerms = (val) => {
    const perms = {};
    ALL_PERMISSIONS.forEach(p => { perms[p.key] = val; });
    setForm(f => ({ ...f, permissions: perms }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: "#0d1527", border: "1px solid rgba(6,182,212,0.2)" }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid rgba(6,182,212,0.1)" }}>
          <h2 className="text-[15px] font-semibold text-white">{role ? "Edit Role" : "Create Role"}</h2>
          <button onClick={onCancel} className="p-1.5 rounded-md text-slate-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-slate-400">Role Name *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-slate-400">Description</Label>
              <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-transparent border-slate-700 text-slate-200" />
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-[11px] text-slate-400">Color</Label>
            <div className="flex gap-2">
              {DEFAULT_COLORS.map(c => (
                <button key={c} onClick={() => setForm({...form, color: c})} className="w-7 h-7 rounded-full transition-all" style={{ background: c, outline: form.color === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }} />
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-slate-400">Permissions</Label>
              <div className="flex gap-2">
                <button onClick={() => setAllPerms(true)} className="text-[10px] text-cyan-400 hover:text-cyan-300">Grant All</button>
                <span className="text-slate-600">·</span>
                <button onClick={() => setAllPerms(false)} className="text-[10px] text-red-400 hover:text-red-300">Revoke All</button>
              </div>
            </div>
            {PERM_GROUPS.map(group => (
              <div key={group}>
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{group}</p>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_PERMISSIONS.filter(p => p.group === group).map(perm => (
                    <div key={perm.key} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "#070d1a", border: "1px solid rgba(6,182,212,0.08)" }}>
                      <span className="text-[12px] text-slate-400">{perm.label}</span>
                      <Switch checked={!!form.permissions[perm.key]} onCheckedChange={() => togglePerm(perm.key)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Assign users */}
          {users.length > 0 && (
            <div className="space-y-2">
              <Label className="text-[11px] text-slate-400">Assign Users</Label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {users.map(u => (
                  <div key={u.email} className="flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer"
                    style={{ background: form.assigned_user_emails?.includes(u.email) ? "rgba(6,182,212,0.08)" : "#070d1a", border: "1px solid rgba(6,182,212,0.08)" }}
                    onClick={() => toggleUser(u.email)}>
                    <div>
                      <p className="text-[12px] text-slate-300">{u.full_name}</p>
                      <p className="text-[10px] text-slate-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{u.email}</p>
                    </div>
                    {form.assigned_user_emails?.includes(u.email) && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onCancel} className="border-slate-700 text-slate-300 hover:bg-slate-800">Cancel</Button>
            <Button onClick={() => onSubmit(form)} disabled={!form.name} className="bg-cyan-600 hover:bg-cyan-500 text-white">
              {role ? "Update Role" : "Create Role"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RolesManagement() {
  const { can, loading: rbacLoading } = useRBAC();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

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
    onSuccess: () => { qc.invalidateQueries(["roles"]); setShowForm(false); }
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Role.update(id, data),
    onSuccess: () => { qc.invalidateQueries(["roles"]); setShowForm(false); setEditing(null); }
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Role.delete(id),
    onSuccess: () => qc.invalidateQueries(["roles"])
  });

  const handleSubmit = (form) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, data: form });
    } else {
      createMut.mutate(form);
    }
  };

  if (rbacLoading) return null;
  if (!can("roles_management")) return <AccessDenied />;

  const permCount = (role) => Object.values(role.permissions || {}).filter(Boolean).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Roles & Permissions</h1>
          <p className="text-[11px] mt-0.5" style={{ color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>
            Define access control for each role
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm">
          <Plus className="w-4 h-4 mr-2" /> New Role
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-44 rounded-xl bg-slate-800" />)}
        </div>
      ) : roles.length === 0 ? (
        <div className="rounded-xl py-16 text-center text-slate-500" style={{ background: "#0d1527", border: "1px solid rgba(6,182,212,0.12)" }}>
          <Shield className="w-10 h-10 mx-auto mb-3 text-slate-700" />
          <p className="text-[13px]">No roles created yet</p>
          <p className="text-[11px] text-slate-600 mt-1">Create your first role to start assigning permissions</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {roles.map(role => {
            const color = role.color || "#06b6d4";
            const count = permCount(role);
            const userCount = role.assigned_user_emails?.length || 0;
            return (
              <div key={role.id} className="rounded-xl p-5 group transition-all" style={{ background: "#0d1527", border: "1px solid rgba(6,182,212,0.12)" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = color + "55"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(6,182,212,0.12)"}>
                {/* Accent bar */}
                <div className="h-[2px] -mt-5 -mx-5 mb-4 rounded-tl-xl rounded-tr-xl" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: color + "22", border: `1px solid ${color}44` }}>
                      <Shield className="w-4 h-4" style={{ color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-200 text-[13px]">{role.name}</h3>
                      <p className="text-[11px] text-slate-600">{role.description || "No description"}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="rounded-lg px-3 py-2 text-center" style={{ background: "#070d1a", border: "1px solid rgba(6,182,212,0.08)" }}>
                    <p className="text-[16px] font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{count}</p>
                    <p className="text-[10px] text-slate-600">Permissions</p>
                  </div>
                  <div className="rounded-lg px-3 py-2 text-center" style={{ background: "#070d1a", border: "1px solid rgba(6,182,212,0.08)" }}>
                    <p className="text-[16px] font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{userCount}</p>
                    <p className="text-[10px] text-slate-600">Users</p>
                  </div>
                </div>

                {/* Permission badges */}
                <div className="flex flex-wrap gap-1 mb-4 min-h-[28px]">
                  {ALL_PERMISSIONS.filter(p => role.permissions?.[p.key]).slice(0, 5).map(p => (
                    <span key={p.key} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: color + "18", color, fontFamily: "'JetBrains Mono', monospace" }}>
                      {p.label}
                    </span>
                  ))}
                  {count > 5 && <span className="text-[10px] px-1.5 py-0.5 rounded text-slate-600" style={{ background: "#070d1a" }}>+{count - 5} more</span>}
                </div>

                <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(6,182,212,0.08)" }}>
                  <div className="flex items-center gap-1 text-[11px] text-slate-600">
                    <Users className="w-3 h-3" />
                    {userCount} assigned
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-slate-800" onClick={() => { setEditing(role); setShowForm(true); }}>
                      <Pencil className="w-3.5 h-3.5 text-slate-500" />
                    </Button>
                    {!role.is_system && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-900/20" onClick={() => { if (confirm("Delete this role?")) deleteMut.mutate(role.id); }}>
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <RoleForm
          role={editing}
          users={users}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}