import React, { useState } from "react";
import { Monitor, Wifi, WifiOff, Shield, ShieldOff, RefreshCw, AlertCircle } from "lucide-react";

const STATUS_CFG = {
  Online:    { color: "#10b981", bg: "rgba(16,185,129,0.1)",  label: "Online"    },
  Offline:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   label: "Offline"   },
  Isolated:  { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Isolated"  },
  Unknown:   { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", label: "Unknown"   },
};

function getStatus(ep) {
  const s = ep.status || ep.Status || ep.hostStatus || ep.HostStatus || "Unknown";
  if (typeof s === "number") return s === 1 ? "Online" : "Offline";
  return s;
}

function getName(ep) {
  return ep.hostName || ep.HostName || ep.name || ep.Name || ep.hostname || "Unknown Host";
}

function getIp(ep) {
  return ep.ip || ep.Ip || ep.ipAddress || ep.IpAddress || ep.lastIp || "—";
}

function getOs(ep) {
  return ep.os || ep.Os || ep.osName || ep.OsName || ep.operatingSystem || "—";
}

function getId(ep) {
  return ep.id || ep.Id || ep.hostId || ep.HostId;
}

export default function CynetEndpoints({ endpoints, loading, onRefresh, onRemediate }) {
  const [search, setSearch] = useState("");
  const [confirming, setConfirming] = useState(null); // { id, action }

  const filtered = endpoints.filter(ep =>
    getName(ep).toLowerCase().includes(search.toLowerCase()) ||
    getIp(ep).toLowerCase().includes(search.toLowerCase())
  );

  const online  = endpoints.filter(ep => getStatus(ep) === "Online").length;
  const offline = endpoints.filter(ep => getStatus(ep) === "Offline").length;
  const isolated = endpoints.filter(ep => getStatus(ep) === "Isolated").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5" style={{ color: "#6366f1" }} />
          <h2 className="text-[15px] font-black" style={{ color: "#1e293b" }}>Endpoints</h2>
        </div>
        <button onClick={onRefresh} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
          style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", color: "#06b6d4" }}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Online",   value: online,   color: "#10b981" },
          { label: "Offline",  value: offline,  color: "#ef4444" },
          { label: "Isolated", value: isolated, color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-4 py-3 text-center"
            style={{ background: `${s.color}0a`, border: `1px solid ${s.color}20` }}>
            <p className="text-[17px] font-black mono" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "#94a3b8" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by hostname or IP…"
        className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
        style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }}
      />

      {/* Confirm dialog */}
      {confirming && (
        <div className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[13px] font-bold text-red-600">Confirm: {confirming.action === "isolate" ? "Isolate" : "Unisolate"} host?</p>
            <p className="text-[11px] text-red-400 mt-0.5">{confirming.name}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setConfirming(null)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
            <button onClick={() => { onRemediate(confirming.action, confirming.id); setConfirming(null); }}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>Confirm</button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(99,102,241,0.2)", borderTopColor: "#6366f1" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(226,232,240,0.8)" }}>
          <Monitor className="w-8 h-8 mx-auto mb-2" style={{ color: "#94a3b8" }} />
          <p className="font-bold text-slate-600">No endpoints found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ep, idx) => {
            const status = getStatus(ep);
            const cfg = STATUS_CFG[status] || STATUS_CFG.Unknown;
            const id = getId(ep) || idx;
            const isIsolated = status === "Isolated";

            return (
              <div key={id} className="rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ background: "rgba(255,255,255,0.95)", border: `1px solid ${cfg.color}15`, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.color}25` }}>
                  {status === "Online" ? <Wifi className="w-4 h-4" style={{ color: cfg.color }} />
                    : status === "Isolated" ? <ShieldOff className="w-4 h-4" style={{ color: cfg.color }} />
                    : <WifiOff className="w-4 h-4" style={{ color: cfg.color }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold truncate" style={{ color: "#1e293b" }}>{getName(ep)}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                      {cfg.label}
                    </span>
                    <span className="text-[10px] mono" style={{ color: "#64748b" }}>{getIp(ep)}</span>
                    <span className="text-[10px]" style={{ color: "#94a3b8" }}>{getOs(ep)}</span>
                  </div>
                </div>
                {/* Remediation buttons */}
                <div className="flex gap-1.5 flex-shrink-0">
                  {!isIsolated ? (
                    <button
                      onClick={() => setConfirming({ id, action: "isolate", name: getName(ep) })}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:scale-105"
                      style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b" }}>
                      <ShieldOff className="w-3 h-3" /> Isolate
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirming({ id, action: "unisolate", name: getName(ep) })}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:scale-105"
                      style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981" }}>
                      <Shield className="w-3 h-3" /> Unisolate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}