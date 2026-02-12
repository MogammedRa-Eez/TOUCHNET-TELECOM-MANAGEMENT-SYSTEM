import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Pencil, Trash2, Wifi, WifiOff, AlertTriangle, Wrench, Server, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  online: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Wifi, dot: "bg-emerald-500" },
  offline: { color: "bg-red-50 text-red-700 border-red-200", icon: WifiOff, dot: "bg-red-500" },
  degraded: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertTriangle, dot: "bg-amber-500" },
  maintenance: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: Wrench, dot: "bg-blue-500" },
};

function NodeForm({ node, onSubmit, onCancel }) {
  const [form, setForm] = useState(node || {
    name: "", type: "access_point", location: "", ip_address: "",
    status: "online", uptime_percent: 99.9, bandwidth_utilization: 0,
    connected_customers: 0, max_capacity: 100, firmware_version: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{node ? "Edit Node" : "Add Network Node"}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Name *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Type *</Label>
              <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="core_router">Core Router</SelectItem>
                  <SelectItem value="distribution_switch">Distribution Switch</SelectItem>
                  <SelectItem value="access_point">Access Point</SelectItem>
                  <SelectItem value="olt">OLT</SelectItem>
                  <SelectItem value="bts">BTS</SelectItem>
                  <SelectItem value="server">Server</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">IP Address</Label>
              <Input value={form.ip_address} onChange={e => setForm({...form, ip_address: e.target.value})} placeholder="192.168.1.1" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Location</Label>
              <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="degraded">Degraded</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Uptime (%)</Label>
              <Input type="number" step="0.1" max="100" value={form.uptime_percent} onChange={e => setForm({...form, uptime_percent: parseFloat(e.target.value)})} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Bandwidth Utilization (%)</Label>
              <Input type="number" max="100" value={form.bandwidth_utilization} onChange={e => setForm({...form, bandwidth_utilization: parseFloat(e.target.value)})} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Connected Customers</Label>
              <Input type="number" value={form.connected_customers} onChange={e => setForm({...form, connected_customers: parseInt(e.target.value)})} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Max Capacity</Label>
              <Input type="number" value={form.max_capacity} onChange={e => setForm({...form, max_capacity: parseInt(e.target.value)})} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Firmware Version</Label>
              <Input value={form.firmware_version} onChange={e => setForm({...form, firmware_version: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{node ? "Update" : "Add Node"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Network() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: nodes = [], isLoading } = useQuery({
    queryKey: ["network-nodes"],
    queryFn: () => base44.entities.NetworkNode.list(),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.NetworkNode.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["network-nodes"] }); setShowForm(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NetworkNode.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["network-nodes"] }); setShowForm(false); setEditing(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.NetworkNode.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["network-nodes"] }),
  });

  const handleSubmit = (data) => {
    if (editing) updateMut.mutate({ id: editing.id, data });
    else createMut.mutate(data);
  };

  const filtered = nodes.filter(n => {
    const matchSearch = !search || n.name?.toLowerCase().includes(search.toLowerCase()) || n.ip_address?.includes(search) || n.location?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || n.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Network Infrastructure</h1>
          <p className="text-sm text-slate-400 mt-0.5">Monitor and manage network nodes</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Add Node
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search nodes..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="degraded">Degraded</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Node cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center text-slate-400">
          <Server className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>No network nodes found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(node => {
            const sc = statusConfig[node.status] || statusConfig.online;
            const capacityPct = node.max_capacity ? Math.round((node.connected_customers || 0) / node.max_capacity * 100) : 0;
            return (
              <div key={node.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${sc.dot} animate-pulse`} />
                    <div>
                      <h3 className="font-semibold text-slate-800">{node.name}</h3>
                      <p className="text-xs text-slate-400">{node.type?.replace(/_/g, " ").toUpperCase()}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`${sc.color} text-xs`}>{node.status}</Badge>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">IP Address</span>
                    <span className="font-mono text-xs text-slate-600">{node.ip_address || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location</span>
                    <span className="text-slate-600">{node.location || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Uptime</span>
                    <span className="text-slate-600">{node.uptime_percent?.toFixed(1) || 0}%</span>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Bandwidth</span>
                      <span className="text-slate-600">{node.bandwidth_utilization || 0}%</span>
                    </div>
                    <Progress value={node.bandwidth_utilization || 0} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Capacity</span>
                      <span className="text-slate-600">{node.connected_customers || 0}/{node.max_capacity || 0}</span>
                    </div>
                    <Progress value={capacityPct} className="h-1.5" />
                  </div>
                </div>

                <div className="flex justify-end gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(node); setShowForm(true); }}>
                    <Pencil className="w-4 h-4 text-slate-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { if (confirm("Delete this node?")) deleteMut.mutate(node.id); }}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <NodeForm
          node={editing}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}