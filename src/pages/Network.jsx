import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, Wifi, WifiOff, AlertTriangle, Wrench, Server, X, Activity, TrendingUp, GitFork, RefreshCw, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";
import NetworkMetricsChart from "@/components/network/NetworkMetricsChart";
import NetworkTrends from "@/components/network/NetworkTrends";
import NetworkTopology from "@/components/network/NetworkTopology";

const statusConfig = {
  online:      { bg: "rgba(16,185,129,0.12)",  color: "#10b981", border: "rgba(16,185,129,0.3)",  icon: Wifi,          dot: "#34d399" },
  offline:     { bg: "rgba(224,35,71,0.12)",   color: "#e02347", border: "rgba(224,35,71,0.3)",   icon: WifiOff,       dot: "#ff3358" },
  degraded:    { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b", border: "rgba(245,158,11,0.3)",  icon: AlertTriangle, dot: "#fbbf24" },
  maintenance: { bg: "rgba(0,180,180,0.12)",   color: "#00b4b4", border: "rgba(0,180,180,0.3)",   icon: Wrench,        dot: "#00d4d4" },
};

function NodeForm({ node, onSubmit, onCancel, allNodes = [] }) {
  const [form, setForm] = useState(node || {
    name: "", type: "access_point", location: "", ip_address: "",
    status: "online", uptime_percent: 99.9, bandwidth_utilization: 0,
    connected_customers: 0, max_capacity: 100, firmware_version: "", parent_node_id: "",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }}>
      <div className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: "#1a1a1a", border: "1px solid rgba(0,180,180,0.25)", boxShadow: "0 24px 80px rgba(0,0,0,0.7)" }}>
        <div className="h-[2px] rounded-t-2xl" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,#e02347,transparent)" }} />
        <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 className="text-[15px] font-black" style={{ color: "#00b4b4" }}>{node ? "Edit Node" : "Add Network Node"}</h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: "rgba(255,255,255,0.4)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "name",        label: "Name *",        type: "text",   req: true },
              { key: "ip_address",  label: "IP Address",    type: "text",   placeholder: "192.168.1.1" },
              { key: "location",    label: "Location",      type: "text" },
              { key: "uptime_percent", label: "Uptime (%)", type: "number", step: "0.1", max: "100" },
              { key: "bandwidth_utilization", label: "Bandwidth Util (%)", type: "number", max: "100" },
              { key: "connected_customers",   label: "Connected Customers", type: "number" },
              { key: "max_capacity",          label: "Max Capacity",        type: "number" },
              { key: "firmware_version",      label: "Firmware Version",    type: "text" },
            ].map(({ key, label, type, req, step, max, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-[11px] font-bold block" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</label>
                <input type={type} required={req} step={step} max={max} placeholder={placeholder}
                  value={form[key] ?? ""}
                  onChange={e => setForm({...form, [key]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value})}
                  className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                  style={{ background: "#252525", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0" }} />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold block" style={{ color: "rgba(255,255,255,0.4)" }}>Type *</label>
              <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                <SelectTrigger style={{ background: "#252525", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0" }}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["core_router","distribution_switch","access_point","olt","bts","server"].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g," ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold block" style={{ color: "rgba(255,255,255,0.4)" }}>Status</label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger style={{ background: "#252525", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0" }}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["online","offline","degraded","maintenance"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-bold block" style={{ color: "rgba(255,255,255,0.4)" }}>Parent Node</label>
              <Select value={form.parent_node_id || "none"} onValueChange={v => setForm({...form, parent_node_id: v === "none" ? "" : v})}>
                <SelectTrigger style={{ background: "#252525", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0" }}><SelectValue placeholder="No parent" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent (top-level)</SelectItem>
                  {allNodes.filter(n => n.id !== node?.id).map(n => <SelectItem key={n.id} value={n.id}>{n.name} ({n.type?.replace(/_/g," ")})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-[12px] font-bold hover:scale-105 transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#b0b0b0" }}>Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl text-[12px] font-bold text-white hover:scale-105 transition-all"
              style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 14px rgba(0,180,180,0.3)" }}>
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
  const [editing,  setEditing]  = useState(null);
  const [search,   setSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab,    setActiveTab]    = useState("nodes");
  const queryClient = useQueryClient();

  const { data: nodes = [], isLoading } = useQuery({ queryKey: ["network-nodes"], queryFn: () => base44.entities.NetworkNode.list(), enabled: !rbacLoading && can("network") });
  const createMut = useMutation({ mutationFn: (data) => base44.entities.NetworkNode.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["network-nodes"] }); setShowForm(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => base44.entities.NetworkNode.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["network-nodes"] }); setShowForm(false); setEditing(null); } });
  const deleteMut = useMutation({ mutationFn: (id) => base44.entities.NetworkNode.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["network-nodes"] }) });

  if (!rbacLoading && !can("network")) return <AccessDenied />;
  const handleSubmit = (data) => { if (editing) { updateMut.mutate({ id: editing.id, data }); toast.success("Node updated"); } else { createMut.mutate(data); toast.success("Node added"); } };

  const onlineCount  = nodes.filter(n => n.status === "online").length;
  const offlineCount = nodes.filter(n => n.status === "offline").length;
  const degraded     = nodes.filter(n => n.status === "degraded").length;
  const avgUptime    = nodes.length ? (nodes.reduce((a,n) => a + (n.uptime_percent||0), 0) / nodes.length).toFixed(1) : "—";
  const avgBw        = nodes.length ? Math.round(nodes.reduce((a,n) => a + (n.bandwidth_utilization||0), 0) / nodes.length) : 0;

  const filtered = nodes.filter(n => {
    const matchSearch = !search || n.name?.toLowerCase().includes(search.toLowerCase()) || n.ip_address?.includes(search) || n.location?.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (statusFilter === "all" || n.status === statusFilter);
  });

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-[1600px] mx-auto">

      {/* ── Ticker ── */}
      <div className="relative overflow-hidden rounded-xl h-8 flex items-center"
        style={{ background: "rgba(0,180,180,0.04)", border: "1px solid rgba(0,180,180,0.12)" }}>
        <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg,#111111,transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg,#111111,transparent)" }} />
        <div className="ticker-track flex items-center gap-10 px-6 whitespace-nowrap">
          {["NETWORK INFRASTRUCTURE","LIVE NODE MONITORING","BANDWIDTH ANALYTICS","UPTIME TRACKING","TOPOLOGY MAPPING","ALERT ENGINE",
            "NETWORK INFRASTRUCTURE","LIVE NODE MONITORING","BANDWIDTH ANALYTICS","UPTIME TRACKING","TOPOLOGY MAPPING","ALERT ENGINE"
          ].map((t, i) => (
            <span key={i} className="text-[9px] font-black uppercase tracking-[0.2em] mono"
              style={{ color: i % 3 === 0 ? "#00b4b4" : i % 3 === 1 ? "rgba(0,180,180,0.4)" : "#e02347" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-5"
        style={{ background: "#181818", border: `1px solid ${offlineCount > 0 ? "rgba(224,35,71,0.3)" : "rgba(0,212,212,0.2)"}`, boxShadow: "0 4px 32px rgba(0,0,0,0.5)" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,#e02347,transparent)" }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,180,180,0.15)", border: "1px solid rgba(0,180,180,0.3)" }}>
                <Activity className="w-4 h-4" style={{ color: "#00b4b4" }} />
              </div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk', sans-serif" }}>Network Infrastructure</h1>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full"
                style={{ background: offlineCount > 0 ? "rgba(224,35,71,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${offlineCount > 0 ? "rgba(224,35,71,0.3)" : "rgba(16,185,129,0.3)"}` }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: offlineCount > 0 ? "#e02347" : "#10b981" }} />
                <span className="text-[9px] font-black mono uppercase tracking-wider" style={{ color: offlineCount > 0 ? "#e02347" : "#10b981" }}>
                  {offlineCount > 0 ? `${offlineCount} OFFLINE` : "ALL SYSTEMS"}
                </span>
              </div>
            </div>
            <p className="text-[11px] mono pl-10" style={{ color: "rgba(255,255,255,0.35)" }}>
              {nodes.length} nodes · {onlineCount} online · {degraded} degraded · avg {avgUptime}% uptime
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ["network-nodes"] })}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#b0b0b0" }}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button onClick={() => { setEditing(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 20px rgba(0,180,180,0.3)" }}>
              <Plus className="w-4 h-4" /> Add Node
            </button>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Nodes", value: nodes.length,    color: "#00b4b4", icon: Server },
          { label: "Online",      value: onlineCount,     color: "#10b981", icon: Wifi },
          { label: "Degraded",    value: degraded,        color: "#f59e0b", icon: AlertTriangle },
          { label: "Offline",     value: offlineCount,    color: "#e02347", icon: WifiOff },
          { label: "Avg Uptime",  value: `${avgUptime}%`, color: "#a855f7", icon: TrendingUp },
        ].map(k => (
          <div key={k.label} className="relative overflow-hidden rounded-2xl px-4 py-3.5 holo-card group transition-all hover:-translate-y-0.5"
            style={{ background: "#181818", border: `1px solid ${k.color}25`, boxShadow: `0 2px 16px rgba(0,0,0,0.4)` }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg,${k.color},transparent)` }} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{k.label}</p>
                <p className="text-2xl font-black mono" style={{ color: k.color, fontFamily: "'JetBrains Mono',monospace" }}>{k.value}</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.color}18`, border: `1px solid ${k.color}30` }}>
                <k.icon className="w-4 h-4" style={{ color: k.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bandwidth bar */}
      {nodes.length > 0 && (
        <div className="rounded-2xl px-5 py-3 flex items-center gap-4 relative overflow-hidden"
          style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#e02347,transparent)" }} />
          <Zap className="w-4 h-4 flex-shrink-0" style={{ color: "#00b4b4" }} />
          <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Avg Bandwidth Utilization</span>
          <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${avgBw}%`, background: avgBw > 80 ? "linear-gradient(90deg,#e02347,#ff3358)" : "linear-gradient(90deg,#00b4b4,#00d4d4)" }} />
          </div>
          <span className="text-[13px] font-black mono flex-shrink-0" style={{ color: avgBw > 80 ? "#e02347" : "#00b4b4", fontFamily: "'JetBrains Mono',monospace" }}>{avgBw}%</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1 w-fit" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {[
          { id: "nodes",    label: "Nodes",           icon: Server },
          { id: "topology", label: "Topology",         icon: GitFork },
          { id: "metrics",  label: "Live Metrics",     icon: Activity },
          { id: "trends",   label: "Trends & Capacity", icon: TrendingUp },
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              style={activeTab === tab.id
                ? { background: "linear-gradient(135deg,#00b4b4,#007a7a)", color: "#ffffff", boxShadow: "0 2px 12px rgba(0,180,180,0.3)" }
                : { color: "rgba(255,255,255,0.4)" }}>
              <TabIcon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "topology" && (
        <div className="rounded-2xl p-6" style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.08)" }}>
          {nodes.length === 0 ? (
            <div className="py-16 text-center">
              <GitFork className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.15)" }} />
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>No nodes to visualize</p>
            </div>
          ) : <NetworkTopology nodes={nodes} />}
        </div>
      )}

      {activeTab === "trends" && (
        <div className="rounded-2xl p-6" style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.08)" }}>
          <NetworkTrends nodes={nodes} />
        </div>
      )}

      {activeTab === "metrics" && (
        <div className="space-y-4">
          {nodes.length === 0 ? (
            <div className="rounded-2xl py-16 text-center" style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Activity className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.15)" }} />
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>No nodes to monitor</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {nodes.map(node => (
                <div key={node.id} className="rounded-2xl p-5" style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full" style={{ background: statusConfig[node.status]?.color || "#64748b" }} />
                    <h3 className="text-sm font-semibold" style={{ color: "#e0e0e0" }}>{node.name}</h3>
                    <span className="text-[10px] mono ml-auto" style={{ color: "rgba(255,255,255,0.3)" }}>{node.ip_address}</span>
                  </div>
                  <NetworkMetricsChart node={node} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "nodes" && (
        <>
          <div className="rounded-2xl p-4 flex flex-col sm:flex-row gap-3" style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} />
              <input placeholder="Search nodes..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-[13px] outline-none"
                style={{ background: "#252525", border: "1px solid rgba(255,255,255,0.1)", color: "#e0e0e0" }} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" style={{ background: "#252525", border: "1px solid rgba(255,255,255,0.1)", color: "#e0e0e0" }}><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {["all","online","offline","degraded","maintenance"].map(s => <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl py-16 text-center" style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Server className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.15)" }} />
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.35)" }}>No network nodes found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(node => {
                const sc = statusConfig[node.status] || statusConfig.online;
                const capacityPct = node.max_capacity ? Math.round((node.connected_customers || 0) / node.max_capacity * 100) : 0;
                return (
                  <div key={node.id} className="rounded-2xl p-5 transition-all duration-200 group holo-card"
                    style={{ background: "linear-gradient(135deg,#181818,#1a1a1a)", border: `1px solid ${sc.color}28`, boxShadow: "0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = sc.color + "55"; e.currentTarget.style.boxShadow = `0 8px 32px ${sc.color}18, 0 0 20px rgba(0,212,212,0.05)`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = `${sc.color}28`; e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.4)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                    <div className="h-[2px] rounded-t-2xl -mt-5 -mx-5 mb-4" style={{ background: `linear-gradient(90deg, ${sc.color}, transparent)` }} />
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: sc.color, boxShadow: `0 0 8px ${sc.color}` }} />
                        <div>
                          <h3 className="font-bold text-[13px]" style={{ color: "#e0e0e0" }}>{node.name}</h3>
                          <p className="text-[10px] mono" style={{ color: "rgba(255,255,255,0.3)" }}>{node.type?.replace(/_/g, " ").toUpperCase()}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg mono" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{node.status}</span>
                    </div>

                    <div className="space-y-2.5 text-[12px]">
                      <div className="flex justify-between">
                        <span style={{ color: "rgba(255,255,255,0.35)" }}>IP Address</span>
                        <span className="mono font-semibold" style={{ color: "#00b4b4" }}>{node.ip_address || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "rgba(255,255,255,0.35)" }}>Location</span>
                        <span style={{ color: "#e0e0e0" }}>{node.location || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "rgba(255,255,255,0.35)" }}>Uptime</span>
                        <span className="mono font-bold" style={{ color: "#10b981" }}>{node.uptime_percent?.toFixed(1) || 0}%</span>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span style={{ color: "rgba(255,255,255,0.35)" }}>Bandwidth</span>
                          <span className="mono" style={{ color: "#e0e0e0" }}>{node.bandwidth_utilization || 0}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${node.bandwidth_utilization || 0}%`, background: node.bandwidth_utilization > 80 ? "#e02347" : "#00b4b4" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span style={{ color: "rgba(255,255,255,0.35)" }}>Capacity</span>
                          <span className="mono" style={{ color: "#e0e0e0" }}>{node.connected_customers || 0}/{node.max_capacity || 0}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${capacityPct}%`, background: capacityPct > 80 ? "#f59e0b" : "#00b4b4" }} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 flex gap-1.5 flex-wrap" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      {["online","degraded","maintenance","offline"].filter(s => s !== node.status).map(s => {
                        const colors = { online: "#10b981", degraded: "#f59e0b", offline: "#e02347", maintenance: "#00b4b4" };
                        return (
                          <button key={s} onClick={() => updateMut.mutate({ id: node.id, data: { status: s } })}
                            className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg transition-all hover:scale-105"
                            style={{ background: `${colors[s]}15`, border: `1px solid ${colors[s]}30`, color: colors[s] }}>
                            → {s}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-end gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="h-7 w-7 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(0,180,180,0.1)", border: "1px solid rgba(0,180,180,0.2)" }}
                        onClick={() => setActiveTab("metrics")}>
                        <Activity className="w-3.5 h-3.5" style={{ color: "#00b4b4" }} />
                      </button>
                      <button className="h-7 w-7 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                        onClick={() => { setEditing(node); setShowForm(true); }}>
                        <Pencil className="w-3.5 h-3.5" style={{ color: "#b0b0b0" }} />
                      </button>
                      <button className="h-7 w-7 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(224,35,71,0.1)", border: "1px solid rgba(224,35,71,0.2)" }}
                        onClick={() => { if (window.confirm("Delete this node?")) { deleteMut.mutate(node.id); toast.success("Node deleted"); } }}>
                        <Trash2 className="w-3.5 h-3.5" style={{ color: "#e02347" }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {showForm && <NodeForm node={editing} allNodes={nodes} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditing(null); }} />}
    </div>
  );
}