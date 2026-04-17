import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Pencil, Trash2, Wifi, WifiOff, AlertTriangle, Wrench, Server, X, Activity, TrendingUp, GitFork, RefreshCw, Zap, Shield, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,26,61,0.55)", backdropFilter: "blur(12px)" }}>
      <div className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.15)" }}>
        <div className="h-[3px] rounded-t-2xl" style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,#c41e3a,transparent)" }} />
        <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(30,45,110,0.1)" }}>
          <h2 className="text-[15px] font-black" style={{ color: "#1e2d6e" }}>{node ? "Edit Node" : "Add Network Node"}</h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg transition-colors" style={{ color: "rgba(30,45,110,0.5)" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(30,45,110,0.07)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="space-y-1.5">
              <Label>Type *</Label>
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
              <Label>IP Address</Label>
              <Input value={form.ip_address} onChange={e => setForm({...form, ip_address: e.target.value})} placeholder="192.168.1.1" />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
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
              <Label>Uptime (%)</Label>
              <Input type="number" step="0.1" max="100" value={form.uptime_percent} onChange={e => setForm({...form, uptime_percent: parseFloat(e.target.value)})} />
            </div>
            <div className="space-y-1.5">
              <Label>Bandwidth Utilization (%)</Label>
              <Input type="number" max="100" value={form.bandwidth_utilization} onChange={e => setForm({...form, bandwidth_utilization: parseFloat(e.target.value)})} />
            </div>
            <div className="space-y-1.5">
              <Label>Connected Customers</Label>
              <Input type="number" value={form.connected_customers} onChange={e => setForm({...form, connected_customers: parseInt(e.target.value)})} />
            </div>
            <div className="space-y-1.5">
              <Label>Max Capacity</Label>
              <Input type="number" value={form.max_capacity} onChange={e => setForm({...form, max_capacity: parseInt(e.target.value)})} />
            </div>
            <div className="space-y-1.5">
              <Label>Firmware Version</Label>
              <Input value={form.firmware_version} onChange={e => setForm({...form, firmware_version: e.target.value})} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Parent Node (for topology)</Label>
              <Select value={form.parent_node_id || "none"} onValueChange={v => setForm({...form, parent_node_id: v === "none" ? "" : v})}>
                <SelectTrigger><SelectValue placeholder="No parent (top-level)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent (top-level)</SelectItem>
                  {allNodes.filter(n => n.id !== node?.id).map(n => (
                    <SelectItem key={n.id} value={n.id}>{n.name} ({n.type?.replace(/_/g, " ")})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
              style={{ background: "rgba(30,45,110,0.06)", border: "1px solid rgba(30,45,110,0.15)", color: "#1e2d6e" }}>
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)", boxShadow: "0 4px 14px rgba(30,45,110,0.25)" }}>
              {node ? "Update Node" : "Add Node"}
            </button>
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
  const [tick, setTick] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const { data: nodes = [], isLoading } = useQuery({
    queryKey: ["network-nodes"],
    queryFn: () => base44.entities.NetworkNode.list(),
    enabled: !rbacLoading && can("network"),
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

  if (!rbacLoading && !can("network")) return <AccessDenied />;

  const handleSubmit = (data) => {
    if (editing) { updateMut.mutate({ id: editing.id, data }); toast.success("Node updated"); }
    else { createMut.mutate(data); toast.success("Node added"); }
  };

  const onlineCount  = nodes.filter(n => n.status === "online").length;
  const offlineCount = nodes.filter(n => n.status === "offline").length;
  const degraded     = nodes.filter(n => n.status === "degraded").length;
  const avgUptime    = nodes.length ? (nodes.reduce((a,n) => a + (n.uptime_percent||0), 0) / nodes.length).toFixed(1) : "—";
  const avgBw        = nodes.length ? Math.round(nodes.reduce((a,n) => a + (n.bandwidth_utilization||0), 0) / nodes.length) : 0;

  const filtered = nodes.filter(n => {
    const matchSearch = !search || n.name?.toLowerCase().includes(search.toLowerCase()) || n.ip_address?.includes(search) || n.location?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || n.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-[1600px] mx-auto">

      {/* ── Futuristic Header ── */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-5 bracket-card"
        style={{ background: "rgba(255,255,255,0.96)", border: "1px solid rgba(30,45,110,0.12)", boxShadow: "0 4px 24px rgba(30,45,110,0.08)" }}>
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,#c41e3a,transparent)" }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(30,45,110,0.07)", border: "1px solid rgba(30,45,110,0.15)" }}>
                <Activity className="w-4 h-4" style={{ color: "#1e2d6e" }} />
              </div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: "#0f1a3d", fontFamily: "'Space Grotesk', sans-serif" }}>Network Infrastructure</h1>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: offlineCount > 0 ? "rgba(196,30,58,0.08)" : "rgba(5,150,105,0.08)", border: `1px solid ${offlineCount > 0 ? "rgba(196,30,58,0.25)" : "rgba(5,150,105,0.25)"}` }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: offlineCount > 0 ? "#c41e3a" : "#059669" }} />
                <span className="text-[9px] font-black mono uppercase tracking-wider" style={{ color: offlineCount > 0 ? "#c41e3a" : "#059669" }}>
                  {offlineCount > 0 ? `${offlineCount} OFFLINE` : "ALL SYSTEMS"}
                </span>
              </div>
            </div>
            <p className="text-[11px] mono pl-10" style={{ color: "rgba(30,45,110,0.5)" }}>
              {nodes.length} nodes · {onlineCount} online · {degraded} degraded · avg {avgUptime}% uptime
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ["network-nodes"] })}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
              style={{ background: "rgba(30,45,110,0.06)", border: "1px solid rgba(30,45,110,0.15)", color: "#1e2d6e" }}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button onClick={() => { setEditing(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)", boxShadow: "0 4px 20px rgba(30,45,110,0.3)" }}>
              <Plus className="w-4 h-4" /> Add Node
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Nodes",  value: nodes.length,  color: "#1e2d6e", icon: Server },
          { label: "Online",       value: onlineCount,   color: "#34d399", icon: Wifi },
          { label: "Degraded",     value: degraded,      color: "#fbbf24", icon: AlertTriangle },
          { label: "Offline",      value: offlineCount,  color: "#ef4444", icon: WifiOff },
          { label: "Avg Uptime",   value: `${avgUptime}%`, color: "#818cf8", icon: TrendingUp },
        ].map(k => (
          <div key={k.label} className="relative overflow-hidden rounded-2xl px-4 py-3.5 holo-card group transition-all hover:-translate-y-0.5"
            style={{ background: "#ffffff", border: `1px solid ${k.color}25`, boxShadow: `0 2px 10px ${k.color}10` }}>
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg,${k.color},transparent)` }} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] mb-0.5" style={{ color: "rgba(30,45,110,0.4)" }}>{k.label}</p>
                <p className="text-2xl font-black mono" style={{ color: k.color, fontFamily: "'JetBrains Mono',monospace" }}>{k.value}</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.color}12`, border: `1px solid ${k.color}22` }}>
                <k.icon className="w-4 h-4" style={{ color: k.color }} />
              </div>
            </div>
            {/* live bar */}
            <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: `${k.color}15` }}>
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, k.value || 0)}%`, background: `linear-gradient(90deg,${k.color},${k.color}88)` }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Avg Bandwidth live indicator ── */}
      {nodes.length > 0 && (
        <div className="rounded-2xl px-5 py-3 flex items-center gap-4 relative overflow-hidden"
          style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(30,45,110,0.12)", boxShadow: "0 2px 10px rgba(30,45,110,0.06)" }}>
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#4a5fa8,#c41e3a,transparent)" }} />
          <Zap className="w-4 h-4 flex-shrink-0" style={{ color: "#1e2d6e" }} />
          <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: "rgba(30,45,110,0.55)" }}>Avg Bandwidth Utilization</span>
          <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(30,45,110,0.08)" }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${avgBw}%`, background: avgBw > 80 ? "linear-gradient(90deg,#c41e3a,#e02347)" : "linear-gradient(90deg,#1e2d6e,#4a5fa8)" }} />
          </div>
          <span className="text-[13px] font-black mono flex-shrink-0" style={{ color: avgBw > 80 ? "#c41e3a" : "#1e2d6e", fontFamily: "'JetBrains Mono',monospace" }}>{avgBw}%</span>
        </div>
      )}


      {/* ── Tabs ── */}
      <div className="flex gap-1 rounded-xl p-1 w-fit" style={{ background: "rgba(30,45,110,0.06)", border: "1px solid rgba(30,45,110,0.15)" }}>
        {[
          { id: "nodes", label: "Nodes", icon: Server },
          { id: "topology", label: "Topology", icon: GitFork },
          { id: "metrics", label: "Live Metrics", icon: Activity },
          { id: "trends", label: "Trends & Capacity", icon: TrendingUp },
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all`}
              style={activeTab === tab.id
                ? { background: "linear-gradient(135deg,#1e2d6e,#2a3d8f)", color: "#ffffff" }
                : { color: "rgba(30,45,110,0.55)" }}>
              <TabIcon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Topology Tab */}
      {activeTab === "topology" && (
        <div className="rounded-2xl p-6" style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.12)", boxShadow: "0 4px 24px rgba(30,45,110,0.07)" }}>
          {nodes.length === 0 ? (
            <div className="py-16 text-center" style={{ color: "rgba(30,45,110,0.4)" }}>
              <GitFork className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(30,45,110,0.25)" }} />
              <p className="text-[13px]">No nodes to visualize</p>
            </div>
          ) : (
            <NetworkTopology nodes={nodes} />
          )}
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === "trends" && (
        <div className="rounded-2xl p-6" style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.12)", boxShadow: "0 4px 24px rgba(30,45,110,0.07)" }}>
          <NetworkTrends nodes={nodes} />
        </div>
      )}

      {/* Live Metrics Tab */}
      {activeTab === "metrics" && (
        <div className="space-y-4">
          {nodes.length === 0 ? (
            <div className="rounded-2xl py-16 text-center" style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.12)", color: "rgba(30,45,110,0.4)" }}>
              <Activity className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(30,45,110,0.25)" }} />
              <p className="text-[13px]">No nodes to monitor</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {nodes.map(node => (
                <div key={node.id} className="rounded-2xl p-5" style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.12)", boxShadow: "0 2px 12px rgba(30,45,110,0.06)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2 h-2 rounded-full ${statusConfig[node.status]?.dot || "bg-slate-400"}`} />
                    <h3 className="text-sm font-semibold" style={{ color: "#0f1a3d" }}>{node.name}</h3>
                    <span className="text-[10px] font-mono ml-auto" style={{ color: "rgba(30,45,110,0.45)" }}>{node.ip_address}</span>
                  </div>
                  <NetworkMetricsChart node={node} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters (nodes tab only) */}
      {activeTab === "nodes" && <div className="rounded-2xl p-4 flex flex-col sm:flex-row gap-3" style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.12)", boxShadow: "0 2px 8px rgba(30,45,110,0.06)" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
          <Input placeholder="Search nodes..." className="pl-10" style={{ background: "#f8f9fd", borderColor: "rgba(30,45,110,0.2)", color: "#0f1a3d" }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" style={{ borderColor: "rgba(30,45,110,0.2)", color: "#1e2d6e" }}><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
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
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={{ background: "#ffffff", border: "1px solid rgba(30,45,110,0.12)" }}>
          <Server className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(30,45,110,0.25)" }} />
          <p className="text-[13px]" style={{ color: "rgba(30,45,110,0.5)" }}>No network nodes found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(node => {
            const sc = statusConfig[node.status] || statusConfig.online;
            const capacityPct = node.max_capacity ? Math.round((node.connected_customers || 0) / node.max_capacity * 100) : 0;
            return (
              <div key={node.id} className="rounded-2xl p-5 transition-all duration-200 group hover:-translate-y-1 holo-card bracket-card"
                style={{ background: "#ffffff", border: `1px solid rgba(30,45,110,0.12)`, boxShadow: "0 2px 12px rgba(30,45,110,0.06)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = sc.border; e.currentTarget.style.boxShadow = `0 6px 24px ${sc.color}18`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(30,45,110,0.12)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(30,45,110,0.06)"; }}
              >
                {/* Top accent */}
                <div className="h-[3px] rounded-t-2xl -mt-5 -mx-5 mb-4" style={{ background: `linear-gradient(90deg, ${sc.color}, transparent)` }} />
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: sc.color, boxShadow: `0 0 6px ${sc.color}` }} />
                    <div>
                      <h3 className="font-bold text-[13px]" style={{ color: "#0f1a3d" }}>{node.name}</h3>
                      <p className="text-[10px] mono" style={{ color: "rgba(30,45,110,0.45)" }}>{node.type?.replace(/_/g, " ").toUpperCase()}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg mono" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{node.status}</span>
                </div>

                <div className="space-y-2.5 text-[12px]">
                  <div className="flex justify-between">
                    <span style={{ color: "rgba(30,45,110,0.5)" }}>IP Address</span>
                    <span className="mono font-semibold" style={{ color: "#1e2d6e" }}>{node.ip_address || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "rgba(30,45,110,0.5)" }}>Location</span>
                    <span style={{ color: "#1e2d6e" }}>{node.location || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "rgba(30,45,110,0.5)" }}>Uptime</span>
                    <span className="mono font-bold" style={{ color: "#059669" }}>{node.uptime_percent?.toFixed(1) || 0}%</span>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span style={{ color: "rgba(30,45,110,0.5)" }}>Bandwidth</span>
                      <span className="mono" style={{ color: "#1e2d6e" }}>{node.bandwidth_utilization || 0}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(30,45,110,0.08)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${node.bandwidth_utilization || 0}%`, background: node.bandwidth_utilization > 80 ? "#c41e3a" : "#1e2d6e" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span style={{ color: "rgba(30,45,110,0.5)" }}>Capacity</span>
                      <span className="mono" style={{ color: "#1e2d6e" }}>{node.connected_customers || 0}/{node.max_capacity || 0}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(30,45,110,0.08)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${capacityPct}%`, background: capacityPct > 80 ? "#d97706" : "#4a5fa8" }} />
                    </div>
                  </div>
                </div>

                  {/* Quick status selector */}
                <div className="mt-3 pt-3 flex gap-1.5 flex-wrap" style={{ borderTop: "1px solid rgba(30,45,110,0.07)" }}>
                  {["online","degraded","maintenance","offline"].filter(s => s !== node.status).map(s => {
                    const colors = { online: "#34d399", degraded: "#fbbf24", offline: "#ef4444", maintenance: "#818cf8" };
                    return (
                      <button key={s} onClick={() => updateMut.mutate({ id: node.id, data: { status: s } })}
                        className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg transition-all hover:scale-105"
                        style={{ background: `${colors[s]}12`, border: `1px solid ${colors[s]}30`, color: colors[s] }}>
                        → {s}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(30,45,110,0.07)", border: "1px solid rgba(30,45,110,0.15)" }}
                    title="Live Metrics" onClick={() => setActiveTab("metrics")}>
                    <Activity className="w-3.5 h-3.5" style={{ color: "#1e2d6e" }} />
                  </button>
                  <button className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(100,116,139,0.08)", border: "1px solid rgba(100,116,139,0.2)" }}
                    onClick={() => { setEditing(node); setShowForm(true); }}>
                    <Pencil className="w-3.5 h-3.5" style={{ color: "#64748b" }} />
                  </button>
                  <button className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}
                    onClick={() => { if (window.confirm("Delete this node?")) { deleteMut.mutate(node.id); toast.success("Node deleted"); } }}>
                    <Trash2 className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
                  </button>
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