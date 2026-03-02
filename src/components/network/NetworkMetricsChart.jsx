import React, { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine
} from "recharts";
import { Activity, Gauge, AlertTriangle } from "lucide-react";

// Simulate real-time metric data per node
function generateMetricHistory(node, points = 20) {
  const bwBase = node.bandwidth_utilization || 30;
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => {
    const t = new Date(now - (points - 1 - i) * 30000);
    const timeLabel = t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const bwNoise = (Math.sin(i * 0.6) + Math.random() * 0.5) * 12;
    const latNoise = Math.random() * 8 + Math.sin(i * 0.8) * 5;
    const plNoise = Math.max(0, Math.random() * 1.5 - 0.5);
    return {
      time: timeLabel,
      bandwidth: Math.min(100, Math.max(0, bwBase + bwNoise)),
      latency: Math.max(1, 15 + latNoise + (node.status === "degraded" ? 30 : 0)),
      packetLoss: parseFloat(Math.max(0, plNoise + (node.status === "offline" ? 5 : 0)).toFixed(2)),
    };
  });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-xl"
      style={{ background: "#1e2a4a", border: "1px solid rgba(220,38,38,0.3)", color: "#fff" }}>
      <p className="font-semibold mb-1 text-slate-300">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}{p.unit}</strong></p>
      ))}
    </div>
  );
};

const THRESHOLDS = { bandwidth: 80, latency: 50, packetLoss: 1 };

export default function NetworkMetricsChart({ node }) {
  const [data, setData] = useState(() => generateMetricHistory(node));
  const intervalRef = useRef(null);

  useEffect(() => {
    setData(generateMetricHistory(node));
    intervalRef.current = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1];
        const now = new Date();
        const bwDelta = (Math.random() - 0.45) * 6;
        const newPoint = {
          time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          bandwidth: Math.min(100, Math.max(0, last.bandwidth + bwDelta)),
          latency: Math.max(1, last.latency + (Math.random() - 0.5) * 4 + (node.status === "degraded" ? 1 : 0)),
          packetLoss: parseFloat(Math.max(0, last.packetLoss + (Math.random() - 0.8) * 0.3).toFixed(2)),
        };
        return [...prev.slice(1), newPoint];
      });
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [node.id, node.status]);

  const latest = data[data.length - 1];
  const alerts = [];
  if (latest.bandwidth > THRESHOLDS.bandwidth) alerts.push(`Bandwidth at ${latest.bandwidth.toFixed(1)}% (threshold: ${THRESHOLDS.bandwidth}%)`);
  if (latest.latency > THRESHOLDS.latency) alerts.push(`Latency ${latest.latency.toFixed(1)}ms (threshold: ${THRESHOLDS.latency}ms)`);
  if (latest.packetLoss > THRESHOLDS.packetLoss) alerts.push(`Packet loss ${latest.packetLoss.toFixed(2)}% (threshold: ${THRESHOLDS.packetLoss}%)`);

  const metrics = [
    {
      key: "bandwidth", label: "Bandwidth", unit: "%", color: "#dc2626",
      threshold: THRESHOLDS.bandwidth, value: latest.bandwidth, chartType: "area",
      gradId: "bwGrad", gradColor: "#dc2626",
    },
    {
      key: "latency", label: "Latency", unit: "ms", color: "#3b82f6",
      threshold: THRESHOLDS.latency, value: latest.latency, chartType: "line",
    },
    {
      key: "packetLoss", label: "Packet Loss", unit: "%", color: "#f59e0b",
      threshold: THRESHOLDS.packetLoss, value: latest.packetLoss, chartType: "area",
      gradId: "plGrad", gradColor: "#f59e0b",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="rounded-lg px-4 py-3 flex items-start gap-3"
          style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)" }}>
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-red-400 mb-1">Active Alerts</p>
            {alerts.map((a, i) => <p key={i} className="text-xs text-red-300">{a}</p>)}
          </div>
        </div>
      )}

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((m) => {
          const over = m.value > m.threshold;
          return (
            <div key={m.key} className="rounded-lg p-3 text-center"
              style={{
                background: over ? `rgba(${m.color.replace('#','').match(/.{2}/g).map(x=>parseInt(x,16)).join(',')},0.1)` : "rgba(255,255,255,0.04)",
                border: `1px solid ${over ? m.color + "66" : "rgba(255,255,255,0.08)"}`,
              }}>
              <p className="text-lg font-bold" style={{ color: over ? m.color : "#e2e8f0", fontFamily: "'JetBrains Mono', monospace" }}>
                {m.value.toFixed(1)}<span className="text-xs font-normal text-slate-500">{m.unit}</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="space-y-4">
        {metrics.map((m) => (
          <div key={m.key} className="rounded-lg p-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{m.label} ({m.unit})</p>
              <span className="text-[10px] font-mono text-slate-600">threshold: {m.threshold}{m.unit}</span>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              {m.chartType === "area" ? (
                <AreaChart data={data} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
                  <defs>
                    <linearGradient id={m.gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={m.gradColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={m.gradColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" tick={{ fontSize: 8, fill: "#475569" }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 8, fill: "#475569" }} domain={[0, 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={m.threshold} stroke={m.color} strokeDasharray="4 2" strokeWidth={1} />
                  <Area type="monotone" dataKey={m.key} name={m.label} unit={m.unit}
                    stroke={m.color} strokeWidth={1.5} fill={`url(#${m.gradId})`} dot={false} />
                </AreaChart>
              ) : (
                <LineChart data={data} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" tick={{ fontSize: 8, fill: "#475569" }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 8, fill: "#475569" }} domain={[0, 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={m.threshold} stroke={m.color} strokeDasharray="4 2" strokeWidth={1} />
                  <Line type="monotone" dataKey={m.key} name={m.label} unit={m.unit}
                    stroke={m.color} strokeWidth={1.5} dot={false} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}