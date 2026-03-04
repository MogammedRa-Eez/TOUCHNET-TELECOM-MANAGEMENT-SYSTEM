import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";
import {
  Plus, Search, Pencil, Trash2, ChevronUp, ChevronDown,
  ChevronsUpDown, X, Save, Package, CheckSquare, Sliders
} from "lucide-react";

const statusColors = {
  online: { bg: "rgba(16,185,129,0.15)", color: "#10b981", border: "rgba(16,185,129,0.3)" },
  offline: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", border: "rgba(239,68,68,0.3)" },
  degraded: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "rgba(245,158,11,0.3)" },
  maintenance: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "rgba(59,130,246,0.3)" },
};

const NODE_TYPES = ["core_router", "distribution_switch", "access_point", "olt", "bts", "server"];

// ─── Node Edit Modal ──────────────────────────────────────────────────────────
function NodeEditModal({ node, allNodes, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...node });
  const [customFields, setCustomFields] = useState(node.custom_fields ? Object.entries(node.custom_fields) : []);
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");

  const addCustomField = () => {
    if (!newKey.trim()) return;
    setCustomFields(prev => [...prev, [newKey.trim(), newVal]]);
    setNewKey(""); setNewVal("");
  };

  const removeCustomField = (idx) => setCustomFields(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    const custom_fields = Object.fromEntries(customFields.filter(([k]) => k));
    onSubmit({ ...form, custom_fields });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: "#0d1527", border: "1px solid rgba(6,182,212,0.2)" }}>
        <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(6,182,212,0.1)" }}>
          <h2 className="text-[15px] font-semibold text-white">Edit Node — <span className="text-cyan-400">{node.name}</span></h2>
          <button onClick={onCancel} className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Name *</Label>
              <Input value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} required className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger className="bg-transparent border-slate-700 text-slate-300"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0d1527] border-slate-700 text-slate-200">
                  {NODE_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">IP Address</Label>
              <Input value={form.ip_address || ""} onChange={e => setForm({ ...form, ip_address: e.target.value })} className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Location</Label>
              <Input value={form.location || ""} onChange={e => setForm({ ...form, location: e.target.value })} className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger className="bg-transparent border-slate-700 text-slate-300"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0d1527] border-slate-700 text-slate-200">
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="degraded">Degraded</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Firmware Version</Label>
              <Input value={form.firmware_version || ""} onChange={e => setForm({ ...form, firmware_version: e.target.value })} className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Uptime (%)</Label>
              <Input type="number" step="0.1" max="100" value={form.uptime_percent || ""} onChange={e => setForm({ ...form, uptime_percent: parseFloat(e.target.value) })} className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Bandwidth Util. (%)</Label>
              <Input type="number" max="100" value={form.bandwidth_utilization || ""} onChange={e => setForm({ ...form, bandwidth_utilization: parseFloat(e.target.value) })} className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Connected Customers</Label>
              <Input type="number" value={form.connected_customers || ""} onChange={e => setForm({ ...form, connected_customers: parseInt(e.target.value) })} className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Max Capacity</Label>
              <Input type="number" value={form.max_capacity || ""} onChange={e => setForm({ ...form, max_capacity: parseInt(e.target.value) })} className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-[11px] font-medium text-slate-400">Parent Node</Label>
              <Select value={form.parent_node_id || "none"} onValueChange={v => setForm({ ...form, parent_node_id: v === "none" ? "" : v })}>
                <SelectTrigger className="bg-transparent border-slate-700 text-slate-300"><SelectValue placeholder="No parent" /></SelectTrigger>
                <SelectContent className="bg-[#0d1527] border-slate-700 text-slate-200">
                  <SelectItem value="none">No parent (top-level)</SelectItem>
                  {allNodes.filter(n => n.id !== node.id).map(n => (
                    <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Fields */}
          <div className="pt-2" style={{ borderTop: "1px solid rgba(6,182,212,0.1)" }}>
            <p className="text-[11px] font-semibold text-cyan-400 mb-3 flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5" /> Custom Fields</p>
            <div className="space-y-2 mb-3">
              {customFields.map(([k, v], idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input value={k} onChange={e => setCustomFields(prev => prev.map((f, i) => i === idx ? [e.target.value, f[1]] : f))} className="bg-transparent border-slate-700 text-slate-200 text-[12px] h-8 flex-1" placeholder="Key" />
                  <Input value={v} onChange={e => setCustomFields(prev => prev.map((f, i) => i === idx ? [f[0], e.target.value] : f))} className="bg-transparent border-slate-700 text-slate-200 text-[12px] h-8 flex-1" placeholder="Value" />
                  <button type="button" onClick={() => removeCustomField(idx)} className="text-slate-500 hover:text-red-400 p-1"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="New key" className="bg-transparent border-slate-700 text-slate-200 text-[12px] h-8 flex-1" />
              <Input value={newVal} onChange={e => setNewVal(e.target.value)} placeholder="Value" className="bg-transparent border-slate-700 text-slate-200 text-[12px] h-8 flex-1" />
              <Button type="button" size="sm" onClick={addCustomField} className="h-8 bg-cyan-700 hover:bg-cyan-600 text-white text-[11px]"><Plus className="w-3 h-3 mr-1" />Add</Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="border-slate-700 text-slate-300 hover:bg-slate-800">Cancel</Button>
            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white"><Save className="w-3.5 h-3.5 mr-1.5" />Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Bulk Action Bar ──────────────────────────────────────────────────────────
function BulkActionBar({ count, onBulkStatus, onBulkFirmware, onClear }) {
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkFirmware, setBulkFirmware] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.25)" }}>
      <span className="text-[12px] font-semibold text-cyan-400"><CheckSquare className="inline w-3.5 h-3.5 mr-1" />{count} selected</span>
      <div className="flex items-center gap-2 ml-auto flex-wrap">
        <Select value={bulkStatus} onValueChange={setBulkStatus}>
          <SelectTrigger className="h-8 w-40 bg-transparent border-slate-700 text-slate-300 text-[12px]"><SelectValue placeholder="Set status…" /></SelectTrigger>
          <SelectContent className="bg-[#0d1527] border-slate-700 text-slate-200">
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="degraded">Degraded</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" disabled={!bulkStatus} onClick={() => { onBulkStatus(bulkStatus); setBulkStatus(""); }} className="h-8 bg-cyan-700 hover:bg-cyan-600 text-white text-[11px]">Apply Status</Button>
        <div className="flex items-center gap-1">
          <Input value={bulkFirmware} onChange={e => setBulkFirmware(e.target.value)} placeholder="Firmware version…" className="h-8 w-40 bg-transparent border-slate-700 text-slate-200 text-[12px]" />
          <Button size="sm" disabled={!bulkFirmware.trim()} onClick={() => { onBulkFirmware(bulkFirmware.trim()); setBulkFirmware(""); }} className="h-8 bg-purple-700 hover:bg-purple-600 text-white text-[11px]">Set Firmware</Button>
        </div>
        <Button size="sm" variant="ghost" onClick={onClear} className="h-8 text-slate-400 hover:text-slate-200 text-[11px]"><X className="w-3 h-3 mr-1" />Clear</Button>
      </div>
    </div>
  );
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────
function SortIcon({ field, sortKey, sortDir }) {
  if (sortKey !== field) return <ChevronsUpDown className="w-3 h-3 text-slate-600" />;
  return sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-cyan-400" /> : <ChevronDown className="w-3 h-3 text-cyan-400" />;
}

// ─── Main Inventory Page ──────────────────────────────────────────────────────
export default function Inventory() {
  const { can, loading: rbacLoading } = useRBAC();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [selected, setSelected] = useState(new Set());
  const [editing, setEditing] = useState(null);

  if (!rbacLoading && !can("network")) return <AccessDenied />;

  const { data: nodes = [], isLoading } = useQuery({
    queryKey: ["network-nodes"],
    queryFn: () => base44.entities.NetworkNode.list(),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NetworkNode.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-nodes"] });
      setEditing(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.NetworkNode.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-nodes"] });
      setSelected(prev => { const s = new Set(prev); return s; });
    },
  });

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    let list = nodes.filter(n => {
      const q = search.toLowerCase();
      const matchSearch = !search || n.name?.toLowerCase().includes(q) || n.ip_address?.includes(q) || n.location?.toLowerCase().includes(q) || n.firmware_version?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || n.status === statusFilter;
      const matchType = typeFilter === "all" || n.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
    list = [...list].sort((a, b) => {
      let av = a[sortKey] ?? "", bv = b[sortKey] ?? "";
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return list;
  }, [nodes, search, statusFilter, typeFilter, sortKey, sortDir]);

  const allSelected = filtered.length > 0 && filtered.every(n => selected.has(n.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map(n => n.id)));
  };
  const toggleOne = (id) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const bulkUpdate = (patch) => {
    const ids = [...selected].filter(id => filtered.some(n => n.id === id));
    ids.forEach(id => updateMut.mutate({ id, data: patch }));
    setSelected(new Set());
  };

  const colHeader = (label, key) => (
    <th className="px-4 py-3 text-left cursor-pointer select-none hover:text-slate-200 transition-colors" onClick={() => handleSort(key)}>
      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
        {label} <SortIcon field={key} sortKey={sortKey} sortDir={sortDir} />
      </div>
    </th>
  );

  const anyCustomFields = nodes.some(n => n.custom_fields && Object.keys(n.custom_fields).length > 0);

  return (
    <div className="p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Package className="w-5 h-5 text-cyan-400" />Node Inventory</h1>
          <p className="text-[11px] mt-0.5 text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {nodes.length} total nodes · {nodes.filter(n => n.status === "online").length} online
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4 flex flex-col sm:flex-row gap-3" style={{ background: "#0d1527", border: "1px solid rgba(6,182,212,0.12)" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input placeholder="Search name, IP, location, firmware…" className="pl-10 bg-transparent border-slate-700 text-slate-200 placeholder-slate-600" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-transparent border-slate-700 text-slate-300"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="bg-[#0d1527] border-slate-700 text-slate-200">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="degraded">Degraded</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48 bg-transparent border-slate-700 text-slate-300"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent className="bg-[#0d1527] border-slate-700 text-slate-200">
            <SelectItem value="all">All Types</SelectItem>
            {NODE_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <BulkActionBar
          count={selected.size}
          onBulkStatus={(s) => bulkUpdate({ status: s })}
          onBulkFirmware={(f) => bulkUpdate({ firmware_version: f })}
          onClear={() => setSelected(new Set())}
        />
      )}

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: "#0d1527", border: "1px solid rgba(6,182,212,0.12)" }}>
        {isLoading ? (
          <div className="py-16 text-center text-slate-500 text-sm">Loading inventory…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-10 h-10 mx-auto mb-3 text-slate-700" />
            <p className="text-[13px] text-slate-500">No nodes match your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ borderBottom: "1px solid rgba(6,182,212,0.1)" }}>
                <tr>
                  <th className="px-4 py-3 w-10">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} className="border-slate-600 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600" />
                  </th>
                  {colHeader("Name", "name")}
                  {colHeader("Type", "type")}
                  {colHeader("Status", "status")}
                  {colHeader("IP Address", "ip_address")}
                  {colHeader("Location", "location")}
                  {colHeader("Uptime %", "uptime_percent")}
                  {colHeader("BW Util %", "bandwidth_utilization")}
                  {colHeader("Customers", "connected_customers")}
                  {colHeader("Firmware", "firmware_version")}
                  {anyCustomFields && <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500">Custom Fields</th>}
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map(node => {
                  const sc = statusColors[node.status] || statusColors.online;
                  const isChecked = selected.has(node.id);
                  const customEntries = node.custom_fields ? Object.entries(node.custom_fields) : [];
                  return (
                    <tr key={node.id} className={`transition-colors hover:bg-white/[0.03] ${isChecked ? "bg-cyan-900/10" : ""}`}>
                      <td className="px-4 py-3">
                        <Checkbox checked={isChecked} onCheckedChange={() => toggleOne(node.id)} className="border-slate-600 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600" />
                      </td>
                      <td className="px-4 py-3 text-[13px] font-semibold text-slate-200">{node.name}</td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{node.type?.replace(/_/g, " ")}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                          {node.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-400 font-mono">{node.ip_address || "—"}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-400">{node.location || "—"}</td>
                      <td className="px-4 py-3 text-[12px] font-mono" style={{ color: (node.uptime_percent || 0) > 95 ? "#10b981" : "#f59e0b" }}>
                        {node.uptime_percent?.toFixed(1) ?? "—"}%
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full overflow-hidden bg-slate-800">
                            <div className="h-full rounded-full" style={{ width: `${node.bandwidth_utilization || 0}%`, background: (node.bandwidth_utilization || 0) > 80 ? "#ef4444" : "#06b6d4" }} />
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">{node.bandwidth_utilization ?? 0}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-400 font-mono">{node.connected_customers ?? "—"}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-400 font-mono">{node.firmware_version || "—"}</td>
                      {anyCustomFields && (
                        <td className="px-4 py-3">
                          {customEntries.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[180px]">
                              {customEntries.map(([k, v]) => (
                                <span key={k} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700" title={`${k}: ${v}`}>
                                  <span className="text-slate-500">{k}:</span> {v}
                                </span>
                              ))}
                            </div>
                          ) : <span className="text-slate-700 text-[11px]">—</span>}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-slate-800" onClick={() => setEditing(node)}>
                            <Pencil className="w-3.5 h-3.5 text-slate-400" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-900/20" onClick={() => { if (confirm(`Delete ${node.name}?`)) deleteMut.mutate(node.id); }}>
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-2 text-[11px] text-slate-600 font-mono" style={{ borderTop: "1px solid rgba(6,182,212,0.06)" }}>
              Showing {filtered.length} of {nodes.length} nodes
            </div>
          </div>
        )}
      </div>

      {editing && (
        <NodeEditModal
          node={editing}
          allNodes={nodes}
          onSubmit={(data) => updateMut.mutate({ id: editing.id, data })}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}