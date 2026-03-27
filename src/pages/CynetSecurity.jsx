import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, AlertTriangle, Monitor, RefreshCw, CheckCircle, XCircle, Loader2, Cpu } from "lucide-react";
import CynetAlerts from "@/components/cynet/CynetAlerts";
import CynetEndpoints from "@/components/cynet/CynetEndpoints";
import { useToast } from "@/components/ui/use-toast";

const TABS = [
  { key: "alerts",    label: "Alerts & Threats", icon: AlertTriangle },
  { key: "endpoints", label: "Endpoints",         icon: Monitor       },
];

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: "rgba(255,255,255,0.95)", border: `1px solid ${color}18`, boxShadow: `0 4px 20px ${color}08` }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}44, transparent)` }} />
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="text-[22px] font-black mono leading-none" style={{ color }}>{value}</p>
          <p className="text-[11px] font-bold mt-1" style={{ color: "#64748b" }}>{label}</p>
          {sub && <p className="text-[10px] mt-0.5" style={{ color: "#94a3b8" }}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export default function CynetSecurity() {
  const [activeTab, setActiveTab]   = useState("alerts");
  const [alerts, setAlerts]         = useState([]);
  const [endpoints, setEndpoints]   = useState([]);
  const [alertsLoading, setAlertsLoading]   = useState(false);
  const [endpointsLoading, setEndpointsLoading] = useState(false);
  const [error, setError]           = useState(null);
  const [remediating, setRemediating] = useState(false);
  const [connected, setConnected]   = useState(null); // null = not tried
  const { toast } = useToast();

  const invoke = (action, payload) =>
    base44.functions.invoke("cynetApi", { action, payload });

  const fetchAlerts = useCallback(async () => {
    setAlertsLoading(true);
    setError(null);
    try {
      const res = await invoke("get_alerts");
      const raw = res.data?.data || res.data || [];
      const list = Array.isArray(raw) ? raw : (raw.items || raw.results || raw.data || []);
      setAlerts(list);
      setConnected(true);
    } catch (e) {
      setError(e.message);
      setConnected(false);
    } finally {
      setAlertsLoading(false);
    }
  }, []);

  const fetchEndpoints = useCallback(async () => {
    setEndpointsLoading(true);
    setError(null);
    try {
      const res = await invoke("get_endpoints");
      const raw = res.data?.data || res.data || [];
      const list = Array.isArray(raw) ? raw : (raw.items || raw.results || raw.data || []);
      setEndpoints(list);
      setConnected(true);
    } catch (e) {
      setError(e.message);
      setConnected(false);
    } finally {
      setEndpointsLoading(false);
    }
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === "alerts"    && alerts.length === 0)    fetchAlerts();
    if (key === "endpoints" && endpoints.length === 0) fetchEndpoints();
  };

  const handleConnect = async () => {
    await Promise.all([fetchAlerts(), fetchEndpoints()]);
  };

  const handleRemediate = async (action, hostId) => {
    setRemediating(true);
    try {
      const cynetAction = action === "isolate" ? "remediate_isolate" : "remediate_unisolate";
      await invoke(cynetAction, { hostId });
      toast({ title: `Host ${action}d successfully`, description: `Action completed on host ${hostId}` });
      fetchEndpoints();
    } catch (e) {
      toast({ title: "Remediation failed", description: e.message, variant: "destructive" });
    } finally {
      setRemediating(false);
    }
  };

  const criticalCount = alerts.filter(a => (a.severity || a.Severity || "") === "Critical").length;
  const highCount     = alerts.filter(a => (a.severity || a.Severity || "") === "High").length;
  const onlineCount   = endpoints.filter(e => {
    const s = e.status || e.Status || e.hostStatus || "";
    return s === "Online" || s === 1;
  }).length;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(239,68,68,0.1))", border: "1px solid rgba(99,102,241,0.2)" }}>
            <Shield className="w-5 h-5" style={{ color: "#6366f1" }} />
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: "#0f172a", fontFamily: "'Space Grotesk',sans-serif" }}>
              Cynet Security
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              {connected === true  && <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /><span className="text-[11px] font-bold text-emerald-600">Connected</span></>}
              {connected === false && <><span className="w-1.5 h-1.5 rounded-full bg-red-400" /><span className="text-[11px] font-bold text-red-500">Connection Failed</span></>}
              {connected === null  && <span className="text-[11px] text-slate-400">Not connected yet</span>}
            </div>
          </div>
        </div>

        {connected === null && (
          <button onClick={handleConnect}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
            <Cpu className="w-4 h-4" /> Connect to Cynet
          </button>
        )}
        {connected !== null && (
          <button onClick={handleConnect}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
            style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", color: "#06b6d4" }}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh All
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-2xl"
          style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-bold text-red-600">Cynet API Error</p>
            <p className="text-[11px] text-red-400 mt-0.5">{error}</p>
            <p className="text-[11px] text-red-400 mt-1">
              Make sure <code className="bg-red-50 px-1 rounded">CYNET_PASSWORD</code> and <code className="bg-red-50 px-1 rounded">CYNET_BASE_URL</code> are set in your environment variables.
            </p>
          </div>
        </div>
      )}

      {/* KPI cards */}
      {connected === true && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={AlertTriangle} label="Total Alerts"      value={alerts.length}  color="#6366f1" />
          <StatCard icon={XCircle}       label="Critical Alerts"   value={criticalCount}   color="#ef4444" sub={`${highCount} High`} />
          <StatCard icon={Monitor}       label="Total Endpoints"   value={endpoints.length} color="#8b5cf6" />
          <StatCard icon={CheckCircle}   label="Online Endpoints"  value={onlineCount}     color="#10b981" sub={`${endpoints.length - onlineCount} offline`} />
        </div>
      )}

      {/* Tabs */}
      {connected !== null && (
        <div className="rounded-3xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 4px 24px rgba(99,102,241,0.06)" }}>
          {/* Tab bar */}
          <div className="flex" style={{ borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button key={tab.key} onClick={() => handleTabChange(tab.key)}
                  className="flex items-center gap-2 px-5 py-3.5 text-[13px] font-bold transition-all relative"
                  style={{
                    color: isActive ? "#6366f1" : "#64748b",
                    background: isActive ? "rgba(99,102,241,0.05)" : "transparent",
                    borderBottom: isActive ? "2px solid #6366f1" : "2px solid transparent",
                  }}>
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
            {remediating && (
              <div className="ml-auto flex items-center gap-2 px-4">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#6366f1" }} />
                <span className="text-[11px] font-bold" style={{ color: "#6366f1" }}>Running remediation…</span>
              </div>
            )}
          </div>

          <div className="p-5">
            {activeTab === "alerts"    && <CynetAlerts    alerts={alerts}       loading={alertsLoading}    onRefresh={fetchAlerts} />}
            {activeTab === "endpoints" && <CynetEndpoints endpoints={endpoints} loading={endpointsLoading} onRefresh={fetchEndpoints} onRemediate={handleRemediate} />}
          </div>
        </div>
      )}

      {/* Prompt to connect */}
      {connected === null && (
        <div className="rounded-3xl p-12 text-center"
          style={{ background: "rgba(255,255,255,0.9)", border: "1px dashed rgba(99,102,241,0.2)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
            <Shield className="w-7 h-7" style={{ color: "#6366f1" }} />
          </div>
          <h3 className="text-[16px] font-black mb-1" style={{ color: "#1e293b" }}>Connect to Cynet 360</h3>
          <p className="text-[12px] mb-6" style={{ color: "#94a3b8" }}>
            Click "Connect to Cynet" above to load your security alerts, endpoints, and start managing threats.
          </p>
          <p className="text-[11px]" style={{ color: "#94a3b8" }}>
            Requires <code className="bg-slate-100 px-1 rounded">CYNET_USERNAME</code>, <code className="bg-slate-100 px-1 rounded">CYNET_PASSWORD</code>, and <code className="bg-slate-100 px-1 rounded">CYNET_BASE_URL</code> in environment variables.
          </p>
        </div>
      )}
    </div>
  );
}