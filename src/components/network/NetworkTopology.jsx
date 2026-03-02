import React, { useRef, useEffect, useState, useCallback } from "react";
import { AlertTriangle, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

const STATUS_COLORS = {
  online: "#10b981",
  offline: "#ef4444",
  degraded: "#f59e0b",
  maintenance: "#3b82f6",
};

const TYPE_TIER = {
  core_router: 0,
  server: 0,
  distribution_switch: 1,
  olt: 1,
  bts: 2,
  access_point: 2,
};

const TYPE_SHAPES = {
  core_router: "diamond",
  server: "rect",
  distribution_switch: "hexagon",
  olt: "hexagon",
  bts: "circle",
  access_point: "circle",
};

function buildGraph(nodes) {
  // Assign positions using a layered layout
  const tiers = {};
  nodes.forEach(n => {
    const tier = TYPE_TIER[n.type] ?? 2;
    if (!tiers[tier]) tiers[tier] = [];
    tiers[tier].push(n);
  });

  const tierKeys = Object.keys(tiers).sort((a, b) => a - b);
  const positions = {};
  const W = 900, H = 500;
  const marginX = 80, marginY = 80;

  tierKeys.forEach((tier, ti) => {
    const tier_nodes = tiers[tier];
    const y = marginY + (ti / Math.max(tierKeys.length - 1, 1)) * (H - 2 * marginY);
    tier_nodes.forEach((n, i) => {
      const x = marginX + (i / Math.max(tier_nodes.length - 1, 1)) * (W - 2 * marginX);
      positions[n.id] = { x: tier_nodes.length === 1 ? W / 2 : x, y };
    });
  });

  // Build edges from parent_node_id
  const edges = [];
  nodes.forEach(n => {
    if (n.parent_node_id) {
      const parent = nodes.find(p => p.id === n.parent_node_id);
      if (parent) edges.push({ from: n.parent_node_id, to: n.id, node: n });
    }
  });

  // Detect single points of failure: nodes with >1 child and no redundant path
  const childCount = {};
  edges.forEach(e => {
    childCount[e.from] = (childCount[e.from] || 0) + 1;
  });
  const spof = new Set(Object.entries(childCount).filter(([, c]) => c >= 2).map(([id]) => id));

  return { positions, edges, spof };
}

function drawShape(ctx, shape, x, y, r, fillColor, strokeColor, lineWidth = 2) {
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = fillColor;

  if (shape === "circle") {
    ctx.arc(x, y, r, 0, Math.PI * 2);
  } else if (shape === "diamond") {
    ctx.moveTo(x, y - r * 1.3);
    ctx.lineTo(x + r * 1.1, y);
    ctx.lineTo(x, y + r * 1.3);
    ctx.lineTo(x - r * 1.1, y);
    ctx.closePath();
  } else if (shape === "rect") {
    ctx.roundRect(x - r, y - r * 0.8, r * 2, r * 1.6, 6);
  } else if (shape === "hexagon") {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = x + r * Math.cos(angle);
      const py = y + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();
}

export default function NetworkTopology({ nodes }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const W = 900, H = 500;
  const { positions, edges, spof } = buildGraph(nodes);

  const getCanvasPos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: ((e.clientX - rect.left) * scaleX - pan.x) / zoom,
      y: ((e.clientY - rect.top) * scaleY - pan.y) / zoom,
    };
  }, [pan, zoom]);

  const getNodeAt = useCallback((x, y) => {
    for (const n of nodes) {
      const pos = positions[n.id];
      if (!pos) continue;
      const dx = x - pos.x, dy = y - pos.y;
      if (Math.sqrt(dx * dx + dy * dy) < 28) return n;
    }
    return null;
  }, [nodes, positions]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#0a0f1e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid dots
    ctx.fillStyle = "rgba(6,182,212,0.08)";
    for (let gx = 0; gx < canvas.width; gx += 30) {
      for (let gy = 0; gy < canvas.height; gy += 30) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Tier labels
    const tierLabels = { 0: "CORE", 1: "DISTRIBUTION", 2: "ACCESS" };
    const marginY = 80;
    const tiers = {};
    nodes.forEach(n => {
      const tier = TYPE_TIER[n.type] ?? 2;
      tiers[tier] = true;
    });
    const tierKeys = Object.keys(tiers).sort();
    tierKeys.forEach((tier, ti) => {
      const y = marginY + (ti / Math.max(tierKeys.length - 1, 1)) * (H - 2 * marginY);
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(6,182,212,0.25)";
      ctx.fillText(tierLabels[tier] || `TIER ${tier}`, 8, y + 4);
      // Dashed tier line
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = "rgba(6,182,212,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(W - 20, y);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Edges
    edges.forEach(({ from, to, node: edgeNode }) => {
      const pf = positions[from];
      const pt = positions[to];
      if (!pf || !pt) return;
      const isOffline = edgeNode?.status === "offline";
      const isDegraded = edgeNode?.status === "degraded";

      ctx.beginPath();
      if (isOffline) {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "rgba(239,68,68,0.4)";
      } else if (isDegraded) {
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = "rgba(245,158,11,0.5)";
      } else {
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(6,182,212,0.3)";
      }
      ctx.lineWidth = 1.5;
      ctx.moveTo(pf.x, pf.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Animate-like flow dots along edge (static representation)
      if (!isOffline) {
        const mx = (pf.x + pt.x) / 2, my = (pf.y + pt.y) / 2;
        ctx.beginPath();
        ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isOffline ? "rgba(239,68,68,0.4)" : "rgba(6,182,212,0.6)";
        ctx.fill();
      }
    });

    // Nodes
    nodes.forEach(n => {
      const pos = positions[n.id];
      if (!pos) return;
      const color = STATUS_COLORS[n.status] || "#64748b";
      const shape = TYPE_SHAPES[n.type] || "circle";
      const isHov = hovered?.id === n.id;
      const isSel = selected?.id === n.id;
      const isSPOF = spof.has(n.id);
      const r = n.type === "core_router" || n.type === "server" ? 22 : 18;

      // Glow
      if (isHov || isSel) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
      }

      // SPOF warning ring
      if (isSPOF) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r + 8, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(245,158,11,0.5)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      drawShape(ctx, shape, pos.x, pos.y, r,
        `${color}22`,
        isSel ? color : isHov ? `${color}cc` : `${color}77`,
        isSel ? 2.5 : 1.5
      );

      ctx.shadowBlur = 0;

      // Inner dot
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      ctx.font = `${isHov || isSel ? "bold " : ""}11px Inter, sans-serif`;
      ctx.fillStyle = isHov || isSel ? "#ffffff" : "#cbd5e1";
      ctx.textAlign = "center";
      ctx.fillText(n.name, pos.x, pos.y + r + 14);

      // Bandwidth bar
      if (n.bandwidth_utilization !== undefined) {
        const bw = Math.min(n.bandwidth_utilization || 0, 100);
        const barW = 36, barH = 3;
        const bx = pos.x - barW / 2, by = pos.y + r + 18;
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(bx, by, barW, barH);
        ctx.fillStyle = bw > 80 ? "#ef4444" : bw > 60 ? "#f59e0b" : "#06b6d4";
        ctx.fillRect(bx, by, (bw / 100) * barW, barH);
      }
    });

    ctx.restore();
  }, [nodes, positions, edges, spof, zoom, pan, hovered, selected]);

  useEffect(() => { draw(); }, [draw]);

  const handleMouseMove = useCallback((e) => {
    if (dragging && dragStart) {
      setPan(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
      return;
    }
    const pos = getCanvasPos(e);
    setHovered(getNodeAt(pos.x, pos.y));
    canvasRef.current.style.cursor = getNodeAt(pos.x, pos.y) ? "pointer" : dragging ? "grabbing" : "grab";
  }, [dragging, dragStart, getCanvasPos, getNodeAt]);

  const handleMouseDown = useCallback((e) => {
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseUp = useCallback((e) => {
    const dx = Math.abs(e.clientX - (dragStart?.x || 0));
    const dy = Math.abs(e.clientY - (dragStart?.y || 0));
    if (dx < 4 && dy < 4) {
      const pos = getCanvasPos(e);
      const n = getNodeAt(pos.x, pos.y);
      setSelected(prev => prev?.id === n?.id ? null : n);
    }
    setDragging(false);
    setDragStart(null);
  }, [dragStart, getCanvasPos, getNodeAt]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setZoom(z => Math.min(3, Math.max(0.4, z - e.deltaY * 0.001)));
  }, []);

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const spofNodes = nodes.filter(n => spof.has(n.id));
  const offlineNodes = nodes.filter(n => n.status === "offline");

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {(spofNodes.length > 0 || offlineNodes.length > 0) && (
        <div className="space-y-2">
          {offlineNodes.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-red-300"><strong className="text-red-200">Offline:</strong> {offlineNodes.map(n => n.name).join(", ")}</span>
            </div>
          )}
          {spofNodes.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-amber-300"><strong className="text-amber-200">Single Points of Failure (dashed ring):</strong> {spofNodes.map(n => n.name).join(", ")}</span>
            </div>
          )}
        </div>
      )}

      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden" style={{ border: "1px solid rgba(6,182,212,0.15)" }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full"
          style={{ display: "block" }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { setDragging(false); setHovered(null); }}
          onWheel={handleWheel}
        />

        {/* Zoom controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          {[
            { icon: ZoomIn, action: () => setZoom(z => Math.min(3, z + 0.2)) },
            { icon: ZoomOut, action: () => setZoom(z => Math.max(0.4, z - 0.2)) },
            { icon: Maximize2, action: resetView },
          ].map(({ icon: Icon, action }, i) => (
            <button key={i} onClick={action}
              className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
              style={{ background: "rgba(13,21,39,0.9)", border: "1px solid rgba(6,182,212,0.2)" }}>
              <Icon className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex gap-3 flex-wrap">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[10px] text-slate-400 capitalize" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected node detail */}
      {selected && (
        <div className="rounded-xl p-4 flex flex-wrap gap-6" style={{ background: "#0d1527", border: `1px solid ${STATUS_COLORS[selected.status]}44` }}>
          <div>
            <p className="text-[10px] text-slate-500 font-mono">NODE</p>
            <p className="text-sm font-semibold text-white">{selected.name}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-mono">TYPE</p>
            <p className="text-sm text-slate-300">{selected.type?.replace(/_/g, " ")}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-mono">IP</p>
            <p className="text-sm text-slate-300 font-mono">{selected.ip_address || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-mono">UPTIME</p>
            <p className="text-sm font-mono" style={{ color: STATUS_COLORS[selected.status] }}>{selected.uptime_percent?.toFixed(1) || 0}%</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-mono">BANDWIDTH</p>
            <p className="text-sm font-mono text-slate-300">{selected.bandwidth_utilization || 0}%</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-mono">CUSTOMERS</p>
            <p className="text-sm font-mono text-slate-300">{selected.connected_customers || 0}/{selected.max_capacity || 0}</p>
          </div>
          {spof.has(selected.id) && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <p className="text-sm text-amber-300">Single Point of Failure</p>
            </div>
          )}
        </div>
      )}

      <p className="text-[10px] text-slate-600 text-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Scroll to zoom · Drag to pan · Click node for details · Assign parent nodes in node settings to show connections
      </p>
    </div>
  );
}