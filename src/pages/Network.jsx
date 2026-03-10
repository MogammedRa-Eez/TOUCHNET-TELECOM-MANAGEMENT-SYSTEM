import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Pencil, Trash2, Wifi, WifiOff, AlertTriangle, Wrench, Server, X, BarChart2, Activity, TrendingUp, GitFork } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";
import NetworkMetricsChart from "@/components/network/NetworkMetricsChart";
import NetworkTrends from "@/components/network/NetworkTrends";
import NetworkTopology from "@/components/network/NetworkTopology";

const statusConfig = {
  online: { bg: "rgba(16,185,129,0.1)", color: "#10b981", border: "rgba(16,185,129,0.3)", dot: "bg-emerald-500", icon: Wifi },
  offline: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", border: "rgba(239,68,68,0.3)", dot: "bg-red-500", icon: WifiOff },
  degraded: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "rgba(245,158,11,0.3)", dot: "bg-amber-500", icon: AlertTriangle },
  maintenance: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "rgba(59,130,246,0.3)", dot: "bg-blue-500", icon: Wrench },
};

function NodeForm({ node, onSubmit, onCancel, allNodes = [] }) {
  const [form, setForm] = useState(node || {
    name: "", type: "access_point", location: "", ip_address: "",
    status: "online", uptime_percent: 99.9, bandwidth_utilization: 0,
    connected_customers: 0, max_capacity: 100, firmware_version: "",
    parent_node_id: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: "#0d1527", border: "1px solid rgba(6,182,212,0.2)" }}>
        <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(6,182,212,0.1)" }}>
          <h2 className="text-[15px] font-semibold text-white">{node ? "Edit Node" : "Add Network Node"}</h2>
          <button onClick={onCancel} className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Name *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Type *</Label>
              <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                <SelectTrigger className="bg-transparent border-slate-700 text-slate-300"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0d1527] border-slate-700 text-slate-200">
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
              <Label className="text-[11px] font-medium text-slate-400">IP Address</Label>
              <Input value={form.ip_address} onChange={e => setForm({...form, ip_address: e.target.value})} placeholder="192.168.1.1" className="bg-transparent border-slate-700 text-slate-200 placeholder-slate-600" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Location</Label>
              <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
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
              <Label className="text-[11px] font-medium text-slate-400">Uptime (%)</Label>
              <Input type="number" step="0.1" max="100" value={form.uptime_percent} onChange={e => setForm({...form, uptime_percent: parseFloat(e.target.value)})} className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Bandwidth Utilization (%)</Label>
              <Input type="number" max="100" value={form.bandwidth_utilization} onChange={e => setForm({...form, bandwidth_utilization: parseFloat(e.target.value)})} className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Connected Customers</Label>
              <Input type="number" value={form.connected_customers} onChange={e => setForm({...form, connected_customers: parseInt(e.target.value)})} className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Max Capacity</Label>
              <Input type="number" value={form.max_capacity} onChange={e => setForm({...form, max_capacity: parseInt(e.target.value)})} className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-400">Firmware Version</Label>
              <Input value={form.firmware_version} onChange={e => setForm({...form, firmware_version: e.target.value})} className="bg-transparent border-slate-700 text-slate-200" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-[11px] font-medium text-slate-400">Parent Node (for topology)</Label>
              <Select value={form.parent_node_id || "none"} onValueChange={v => setForm({...form, parent_node_id: v === "none" ? "" : v})}>
                <SelectTrigger className="bg-transparent border-slate-700 text-slate-300"><SelectValue placeholder="No parent (top-level)" /></SelectTrigger>
                <SelectContent className="bg-[#0d1527] border-slate-700 text-slate-200">
                  <SelectItem value="none">No parent (top-level)</SelectItem>
                  {allNodes.filter(n => n.id !== node?.id).map(n => (
                    <SelectItem key={n.id} value={n.id}>{n.name} ({n.type?.replace(/_/g, " ")})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="border-slate-700 text-slate-300 hover:bg-slate-800">Cancel</Button>
            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white">{node ? "Update" : "Add Node"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Network() {
  const { can, loading: rbacLoading } = useRBAC();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("nodes");
  const [monitoringNode, setMonitoringNode] = useState(null);
  const queryClient = useQueryClient();

  if (!rbacLoading && !can("network")) return <AccessDenied />;

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
          <h1 className="text-xl font-bold" style={{ color: "#1e293b" }}>Network Infrastructure</h1>
          <p className="text-[11px] mt-0.5 mono" style={{ color: "rgba(100,116,139,0.55)" }}>Monitor and manage network nodes</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="text-white text-sm" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <Plus className="w-4 h-4 mr-2" /> Add Node
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1 w-fit" style={{ background: "#0a0f2e", border: "1px solid rgba(99,102,241,0.15)" }}>
        {[
          { id: "nodes", label: "Nodes", icon: Server },
          { id: "topology", label: "Topology", icon: GitFork },
          { id: "metrics", label: "Live Metrics", icon: Activity },
          { id: "trends", label: "Trends & Capacity", icon: TrendingUp },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.id ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
              style={activeTab === tab.id ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)" } : {}}>
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Topology Tab */}
      {activeTab === "topology" && (
        <div className="rounded-xl p-6" style={{ background: "#070b1f", border: "1px solid rgba(99,102,241,0.15)" }}>
          {nodes.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <GitFork className="w-10 h-10 mx-auto mb-3 text-slate-700" />
              <p className="text-[13px]">No nodes to visualize</p>
            </div>
          ) : (
            <NetworkTopology nodes={nodes} />
          )}
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === "trends" && (
        <div className="rounded-xl p-6" style={{ background: "#0a0f2e", border: "1px solid rgba(99,102,241,0.15)" }}>
          <NetworkTrends nodes={nodes} />
        </div>
      )}

      {/* Live Metrics Tab */}
      {activeTab === "metrics" && (
        <div className="space-y-4">
          {nodes.length === 0 ? (
            <div className="rounded-xl py-16 text-center text-slate-500" style={{ background: "#0a0f2e", border: "1px solid rgba(99,102,241,0.15)" }}>
              <Activity className="w-10 h-10 mx-auto mb-3 text-slate-700" />
              <p className="text-[13px]">No nodes to monitor</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {nodes.map(node => (
                <div key={node.id} className="rounded-xl p-5" style={{ background: "#0a0f2e", border: "1px solid rgba(99,102,241,0.15)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2 h-2 rounded-full ${statusConfig[node.status]?.dot || "bg-slate-500"}`} />
                    <h3 className="text-sm font-semibold text-slate-200">{node.name}</h3>
                    <span className="text-[10px] font-mono text-slate-500 ml-auto">{node.ip_address}</span>
                  </div>
                  <NetworkMetricsChart node={node} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters (nodes tab only) */}
      {activeTab === "nodes" && <div className="rounded-xl p-4 flex flex-col sm:flex-row gap-3" style={{ background: "#0a0f2e", border: "1px solid rgba(99,102,241,0.15)" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input placeholder="Search nodes..." className="pl-10 bg-transparent border-slate-700 text-slate-200 placeholder-slate-600" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-transparent border-slate-700 text-slate-300"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="bg-[#0d1527] border-slate-700 text-slate-200">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="degraded">Degraded</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>}

      {/* Node cards (nodes tab only) */}
      {activeTab === "nodes" && (isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl bg-slate-800" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl py-16 text-center text-slate-500" style={{ background: "#0a0f2e", border: "1px solid rgba(99,102,241,0.15)" }}>
          <Server className="w-10 h-10 mx-auto mb-3 text-slate-700" />
          <p className="text-[13px]">No network nodes found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(node => {

            const sc = statusConfig[node.status] || statusConfig.online;
            const capacityPct = node.max_capacity ? Math.round((node.connected_customers || 0) / node.max_capacity * 100) : 0;
            return (
              <div key={node.id} className="rounded-xl p-5 transition-all duration-200 group" style={{ background: "#0a0f2e", border: `1px solid rgba(99,102,241,0.12)` }}
                onMouseEnter={e => e.currentTarget.style.borderColor = sc.border}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(6,182,212,0.12)"}
              >
                {/* Top accent */}
                <div className="h-[2px] rounded-t-xl -mt-5 -mx-5 mb-4 rounded-tl-xl rounded-tr-xl" style={{ background: `linear-gradient(90deg, ${sc.color}, transparent)` }} />
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${sc.dot} animate-pulse`} />
                    <div>
                      <h3 className="font-semibold text-slate-200 text-[13px]">{node.name}</h3>
                      <p className="text-[10px] text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{node.type?.replace(/_/g, " ").toUpperCase()}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontFamily: "'JetBrains Mono', monospace" }}>{node.status}</span>
                </div>

                <div className="space-y-2.5 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">IP Address</span>
                    <span className="text-slate-300" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{node.ip_address || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Location</span>
                    <span className="text-slate-300">{node.location || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Uptime</span>
                    <span className="text-emerald-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{node.uptime_percent?.toFixed(1) || 0}%</span>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">Bandwidth</span>
                      <span className="text-slate-300" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{node.bandwidth_utilization || 0}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${node.bandwidth_utilization || 0}%`, background: node.bandwidth_utilization > 80 ? "#ef4444" : "#06b6d4" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">Capacity</span>
                      <span className="text-slate-300" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{node.connected_customers || 0}/{node.max_capacity || 0}</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${capacityPct}%`, background: capacityPct > 80 ? "#f59e0b" : "#8b5cf6" }} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-blue-900/20" title="Live Metrics" onClick={() => { setActiveTab("metrics"); }}>
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-slate-800" onClick={() => { setEditing(node); setShowForm(true); }}>
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-900/20" onClick={() => { if (confirm("Delete this node?")) deleteMut.mutate(node.id); }}>
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {showForm && (
        <NodeForm
          node={editing}
          allNodes={nodes}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}