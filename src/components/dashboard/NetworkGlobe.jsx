import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const NODE_PTS = [
  { lat: -26.2, lon: 28.0,  status: "online",      label: "Johannesburg",  latency: 12,  signal: 95 },
  { lat: -33.9, lon: 18.4,  status: "online",      label: "Cape Town",     latency: 18,  signal: 90 },
  { lat: -29.8, lon: 31.0,  status: "degraded",    label: "Durban",        latency: 145, signal: 42 },
  { lat: -25.7, lon: 28.3,  status: "online",      label: "Pretoria",      latency: 14,  signal: 93 },
  { lat: -23.0, lon: 29.5,  status: "offline",     label: "Polokwane",     latency: 999, signal: 0  },
  { lat: -22.9, lon: 30.4,  status: "online",      label: "Limpopo Node",  latency: 32,  signal: 78 },
  { lat: -24.5, lon: 26.8,  status: "online",      label: "Gaborone",      latency: 28,  signal: 82 },
  { lat: -28.0, lon: 26.5,  status: "maintenance", label: "Bloemfontein",  latency: 88,  signal: 55 },
  { lat: -26.7, lon: 27.1,  status: "online",      label: "West Rand",     latency: 16,  signal: 91 },
  { lat: -27.5, lon: 29.9,  status: "online",      label: "Ermelo",        latency: 44,  signal: 72 },
  { lat:  40.7, lon: -74.0, status: "online",      label: "New York",      latency: 210, signal: 88 },
  { lat:  51.5, lon: -0.1,  status: "online",      label: "London",        latency: 185, signal: 87 },
  { lat:  35.7, lon: 139.7, status: "online",      label: "Tokyo",         latency: 290, signal: 85 },
  { lat: -23.5, lon: -46.6, status: "online",      label: "São Paulo",     latency: 230, signal: 80 },
  { lat:   1.3, lon: 103.8, status: "online",      label: "Singapore",     latency: 195, signal: 89 },
];

function latencyColor(latency, signal) {
  if (signal === 0 || latency >= 500) return new THREE.Color(0xef4444); // red – dead
  if (latency <= 30 && signal >= 85)   return new THREE.Color(0x34d399); // green – excellent
  if (latency <= 80 && signal >= 65)   return new THREE.Color(0xfbbf24); // yellow – fair
  return new THREE.Color(0xf97316);                                        // orange – poor
}

// Simplified continent outlines [lon, lat]
const CONTINENT_POLYGONS = [
  // Africa
  [[-17,15],[-12,8],[-9,5],[-5,5],[0,5],[8,4],[9,0],[10,-5],[12,-17],[14,-23],
   [17,-29],[20,-36],[27,-35],[33,-28],[36,-22],[40,-11],[44,-11],[48,-12],
   [51,12],[44,11],[42,13],[42,15],[37,22],[34,28],[32,31],[35,37],[37,37],
   [24,37],[10,37],[9,33],[8,28],[3,25],[0,17],[-2,15],[-8,15],[-17,15]],
  // Europe
  [[-9,37],[-8,44],[-2,44],[0,43],[5,44],[8,47],[10,48],[14,48],[16,49],
   [18,50],[20,55],[14,57],[12,58],[14,65],[16,68],[18,70],[25,71],[28,70],
   [30,68],[28,65],[30,60],[25,58],[24,55],[28,53],[22,52],[22,50],[26,47],
   [30,47],[30,45],[22,44],[18,42],[16,41],[15,38],[12,38],[12,42],[5,44],
   [0,43],[-5,43],[-9,39],[-9,37]],
  // Asia
  [[30,47],[35,37],[37,37],[40,38],[44,40],[48,42],[52,47],[55,50],[60,54],
   [65,55],[70,55],[75,55],[80,54],[85,53],[90,50],[95,48],[100,48],[105,52],
   [110,55],[115,58],[120,52],[125,48],[130,48],[135,38],[140,36],[142,38],
   [145,44],[145,48],[142,52],[140,55],[132,48],[130,42],[125,40],[120,32],
   [120,24],[115,22],[110,20],[105,10],[100,5],[100,0],[104,-1],[108,-7],
   [115,-8],[120,-8],[128,-3],[132,0],[125,5],[120,10],[110,18],[100,22],
   [95,28],[88,27],[85,27],[80,28],[75,32],[72,22],[68,24],[62,25],[58,22],
   [55,25],[52,30],[50,30],[44,33],[42,38],[40,38],[38,36],[36,35],[34,32],
   [35,28],[38,22],[43,12],[51,12],[44,11],[42,15],[37,22],[34,28],[32,31],[30,38],[30,47]],
  // North America
  [[-168,72],[-155,72],[-140,72],[-130,72],[-125,72],[-120,68],[-115,62],
   [-120,58],[-130,55],[-132,52],[-128,50],[-124,48],[-123,46],[-125,40],
   [-122,38],[-118,34],[-110,30],[-105,28],[-100,26],[-97,22],[-90,16],
   [-85,12],[-82,8],[-76,10],[-72,14],[-68,18],[-62,22],[-62,28],
   [-68,38],[-70,42],[-70,44],[-67,47],[-63,46],[-64,50],[-67,54],
   [-72,58],[-68,62],[-65,68],[-68,72],[-72,75],[-85,78],[-100,80],
   [-120,80],[-140,78],[-168,72]],
  // South America
  [[-82,8],[-78,8],[-75,10],[-65,0],[-52,-4],[-50,-5],[-48,-5],[-44,-3],
   [-38,-5],[-36,-8],[-35,-12],[-38,-16],[-40,-22],[-42,-23],[-44,-24],
   [-46,-26],[-48,-28],[-50,-30],[-52,-33],[-54,-36],[-56,-40],[-58,-46],
   [-62,-52],[-66,-55],[-68,-52],[-66,-46],[-65,-42],[-64,-40],
   [-68,-38],[-72,-36],[-74,-30],[-72,-28],[-70,-20],[-72,-15],[-76,-8],
   [-78,0],[-78,5],[-75,8],[-82,8]],
  // Australia
  [[114,-22],[114,-30],[118,-34],[122,-34],[126,-34],[130,-34],[134,-36],
   [138,-38],[142,-38],[146,-38],[148,-36],[150,-34],[152,-30],[152,-26],
   [150,-24],[148,-20],[142,-18],[138,-16],[134,-12],[130,-12],[126,-14],
   [122,-18],[118,-18],[114,-22]],
];

function createContinentTexture() {
  const W = 2048, H = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  function toXY(lon, lat) {
    return [(lon + 180) / 360 * W, (90 - lat) / 180 * H];
  }
  ctx.fillStyle = 'rgba(99,102,241,0.07)';
  ctx.strokeStyle = 'rgba(129,140,248,0.55)';
  ctx.lineWidth = 2.5;
  CONTINENT_POLYGONS.forEach(pts => {
    ctx.beginPath();
    pts.forEach(([lon, lat], i) => {
      const [x, y] = toXY(lon, lat);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
  return new THREE.CanvasTexture(canvas);
}

function latLonToVec3(lat, lon, r = 1.02) {
  const phi   = (90 - lat)   * (Math.PI / 180);
  const theta = (lon + 180)  * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

export default function NetworkGlobe({ nodes = [] }) {
  const mountRef   = useRef(null);
  const sceneRef   = useRef(null);
  const [tooltip,     setTooltip]     = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const heatmapRef = useRef(null); // THREE.Group ref so we can toggle

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width  = mount.clientWidth;
    const height = mount.clientHeight;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 2.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Globe
    const globeGeo = new THREE.SphereGeometry(1, 64, 64);
    const globeMat = new THREE.MeshPhongMaterial({ color: 0x0a1628, emissive: 0x0d1f3c, shininess: 80, transparent: true, opacity: 0.95 });
    const globe    = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // Wireframe
    const wireMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.005, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.08 })
    );
    scene.add(wireMesh);

    // Atmosphere
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.12, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.06, side: THREE.BackSide })
    ));

    // Rings
    const ring  = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.012, 8, 80), new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.35 }));
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.006, 6, 80), new THREE.MeshBasicMaterial({ color: 0xa5b4fc, transparent: true, opacity: 0.18 }));
    ring2.rotation.x = Math.PI / 6;
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    // ── HEATMAP LAYER ──────────────────────────────────────────────
    const heatmapGroup = new THREE.Group();
    heatmapGroup.visible = false;
    NODE_PTS.forEach((pt) => {
      const center = latLonToVec3(pt.lat, pt.lon, 1.015);
      const col    = latencyColor(pt.latency, pt.signal);
      // blob radius proportional to "badness"
      const blobR  = 0.08 + 0.12 * Math.min(1, (pt.latency > 500 ? 500 : pt.latency) / 500);

      const geo = new THREE.CircleGeometry(blobR, 32);
      const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.38, side: THREE.DoubleSide, depthWrite: false });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(center);
      mesh.lookAt(new THREE.Vector3(0, 0, 0));
      mesh.rotateX(Math.PI); // face outward
      heatmapGroup.add(mesh);

      // Soft outer glow ring
      const glowGeo = new THREE.RingGeometry(blobR, blobR + 0.04, 32);
      const glowMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false });
      const glow    = new THREE.Mesh(glowGeo, glowMat);
      glow.position.copy(center);
      glow.lookAt(new THREE.Vector3(0, 0, 0));
      glow.rotateX(Math.PI);
      heatmapGroup.add(glow);
    });
    scene.add(heatmapGroup);
    heatmapRef.current = heatmapGroup;
    // ──────────────────────────────────────────────────────────────

    // Nodes
    const statusColor = { online: 0x34d399, offline: 0xef4444, degraded: 0xfbbf24, maintenance: 0x818cf8 };
    const dotMeshes   = [];
    const dotGroup    = new THREE.Group();
    NODE_PTS.forEach((pt) => {
      const pos    = latLonToVec3(pt.lat, pt.lon);
      const dot    = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 8, 8),
        new THREE.MeshBasicMaterial({ color: statusColor[pt.status] || 0x34d399 })
      );
      dot.position.copy(pos);
      dot.userData = { label: pt.label, status: pt.status, latency: pt.latency, signal: pt.signal };
      dotGroup.add(dot);
      dotMeshes.push(dot);

      const pulse = new THREE.Mesh(
        new THREE.RingGeometry(0.03, 0.048, 16),
        new THREE.MeshBasicMaterial({ color: statusColor[pt.status] || 0x34d399, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
      );
      pulse.position.copy(pos);
      pulse.lookAt(new THREE.Vector3(0, 0, 0));
      dotGroup.add(pulse);
    });
    scene.add(dotGroup);

    // Arcs
    function arcBetween(p1, p2, color = 0x6366f1) {
      const pts = [];
      for (let t = 0; t <= 1; t += 0.04) {
        const v = new THREE.Vector3().lerpVectors(p1, p2, t);
        v.normalize().multiplyScalar(1.02 + 0.22 * Math.sin(Math.PI * t));
        pts.push(v);
      }
      const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.004, 4, false);
      return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 }));
    }
    const arcGroup = new THREE.Group();
    [[0,1],[0,3],[1,2],[3,6],[4,5],[6,8],[8,9],[0,10],[1,12],[3,13]].forEach(([a, b]) => {
      if (NODE_PTS[a] && NODE_PTS[b]) {
        arcGroup.add(arcBetween(latLonToVec3(NODE_PTS[a].lat, NODE_PTS[a].lon), latLonToVec3(NODE_PTS[b].lat, NODE_PTS[b].lon)));
      }
    });
    scene.add(arcGroup);

    // Lighting
    scene.add(new THREE.AmbientLight(0x334155, 2));
    const dl1 = new THREE.DirectionalLight(0x6366f1, 3); dl1.position.set(2, 2, 2); scene.add(dl1);
    const dl2 = new THREE.DirectionalLight(0x8b5cf6, 1.5); dl2.position.set(-2, -1, -1); scene.add(dl2);

    // Raycaster / drag
    const raycaster = new THREE.Raycaster();
    const mouseVec  = new THREE.Vector2();
    let isDragging  = false;
    let prevMouse   = { x: 0, y: 0 };
    let rotVel      = { x: 0, y: 0.0015 };

    const onMouseDown  = (e) => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; };
    const onMouseUp    = () => { isDragging = false; };
    const onMouseMove  = (e) => {
      const rect = mount.getBoundingClientRect();
      mouseVec.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      const worldDots = dotMeshes.map((d) => { const c = d.clone(); c.position.copy(d.position).applyMatrix4(dotGroup.matrixWorld); return c; });
      const hits = raycaster.intersectObjects(worldDots);
      if (hits.length > 0) {
        const idx  = worldDots.indexOf(hits[0].object);
        const data = dotMeshes[idx]?.userData;
        if (data) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, ...data });
      } else {
        setTooltip(null);
      }
      if (!isDragging) return;
      rotVel.y = (e.clientX - prevMouse.x) * 0.005;
      rotVel.x = (e.clientY - prevMouse.y) * 0.005;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseLeave = () => setTooltip(null);
    mount.addEventListener("mousedown",  onMouseDown);
    mount.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mouseup",   onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    let frameId, t = 0;
    const allRotating = [globe, dotGroup, arcGroup, wireMesh, heatmapGroup];
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.016;
      if (!isDragging) {
        rotVel.y *= 0.98; rotVel.x *= 0.95;
        allRotating.forEach(o => { o.rotation.y += 0.0008; });
      } else {
        allRotating.forEach(o => { o.rotation.y += rotVel.y; o.rotation.x += rotVel.x; });
      }
      dotGroup.children.forEach((child, i) => {
        if (child.geometry?.type === "RingGeometry") {
          child.material.opacity = 0.2 + 0.3 * Math.abs(Math.sin(t * 2 + i));
          const s = 1 + 0.3 * Math.abs(Math.sin(t * 1.5 + i));
          child.scale.set(s, s, s);
        }
      });
      ring.rotation.z  += 0.002;
      ring2.rotation.z -= 0.001;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => { if (!mount) return; const w = mount.clientWidth, h = mount.clientHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); };
    window.addEventListener("resize", onResize);

    sceneRef.current = { renderer, frameId };
    return () => {
      cancelAnimationFrame(frameId);
      mount.removeEventListener("mousedown",  onMouseDown);
      mount.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mouseup",   onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize",    onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Sync heatmap visibility with state
  useEffect(() => {
    if (heatmapRef.current) heatmapRef.current.visible = showHeatmap;
  }, [showHeatmap]);

  const statusLabel  = { online: "Online", offline: "Offline", degraded: "Degraded", maintenance: "Maintenance" };
  const statusColors = { online: "#34d399", offline: "#ef4444", degraded: "#fbbf24", maintenance: "#818cf8" };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl" style={{ minHeight: 320 }}>
      {/* Galaxy background */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, #0d1b3e 0%, #060d1f 55%, #020508 100%)" }}>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="glow"><feGaussianBlur stdDeviation="1.2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          {Array.from({ length: 120 }, (_, i) => {
            const x  = ((i * 137.5) % 100).toFixed(2);
            const y  = ((i * 73.1 + 13) % 100).toFixed(2);
            const r  = (0.5 + (i % 5) * 0.3).toFixed(1);
            const op = (0.3 + (i % 7) * 0.1).toFixed(2);
            return <circle key={i} cx={`${x}%`} cy={`${y}%`} r={r} fill="white" opacity={op} />;
          })}
          {[{cx:18,cy:22},{cx:72,cy:14},{cx:85,cy:68},{cx:30,cy:80},{cx:60,cy:55}].map((s,i) => (
            <circle key={`b${i}`} cx={`${s.cx}%`} cy={`${s.cy}%`} r="1.5" fill="#a5b4fc" opacity="0.7" filter="url(#glow)" />
          ))}
        </svg>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 40% at 20% 30%, rgba(99,102,241,0.08) 0%, transparent 70%), radial-gradient(ellipse 50% 35% at 80% 70%, rgba(139,92,246,0.07) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 55% 50%, rgba(192,21,42,0.05) 0%, transparent 70%)" }} />
      </div>

      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Heatmap Toggle Button */}
      <button
        onClick={() => setShowHeatmap(v => !v)}
        className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
        style={{
          background: showHeatmap ? "rgba(239,68,68,0.25)" : "rgba(10,22,40,0.75)",
          border: `1px solid ${showHeatmap ? "rgba(239,68,68,0.6)" : "rgba(99,102,241,0.35)"}`,
          color: showHeatmap ? "#fca5a5" : "#a5b4fc",
          backdropFilter: "blur(6px)",
        }}>
        <span className={`w-1.5 h-1.5 rounded-full ${showHeatmap ? "bg-red-400" : "bg-indigo-400"}`} />
        {showHeatmap ? "Heatmap ON" : "Heatmap"}
      </button>

      {/* Heatmap Legend */}
      {showHeatmap && (
        <div className="absolute bottom-3 left-3 z-20 px-3 py-2 rounded-lg flex flex-col gap-1.5" style={{ background: "rgba(6,10,25,0.82)", border: "1px solid rgba(99,102,241,0.2)", backdropFilter: "blur(6px)" }}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Latency / Signal</p>
          {[
            { color: "#34d399", label: "Excellent  ≤30ms / ≥85%" },
            { color: "#fbbf24", label: "Fair  ≤80ms / ≥65%" },
            { color: "#f97316", label: "Poor  &gt;80ms / &lt;65%" },
            { color: "#ef4444", label: "Dead  offline / no signal" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}88` }} />
              <span className="text-[10px] text-slate-300" dangerouslySetInnerHTML={{ __html: label }} />
            </div>
          ))}
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div className="absolute pointer-events-none z-20 px-3 py-2 rounded-lg text-xs font-medium shadow-lg"
          style={{ left: tooltip.x + 14, top: tooltip.y - 10, background: "rgba(10,22,40,0.92)", border: `1px solid ${statusColors[tooltip.status] || "#6366f1"}`, color: "#f1f5f9", backdropFilter: "blur(4px)", minWidth: 160 }}>
          <div className="font-semibold text-white mb-1">{tooltip.label}</div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColors[tooltip.status] }} />
            <span style={{ color: statusColors[tooltip.status] }}>{statusLabel[tooltip.status] || tooltip.status}</span>
          </div>
          <div className="space-y-0.5 text-[10px] font-mono" style={{ borderTop: "1px solid rgba(99,102,241,0.2)", paddingTop: 4 }}>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Latency</span>
              <span style={{ color: tooltip.latency >= 500 ? "#ef4444" : tooltip.latency > 80 ? "#f97316" : tooltip.latency > 30 ? "#fbbf24" : "#34d399" }}>
                {tooltip.latency >= 999 ? "—" : `${tooltip.latency} ms`}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Signal</span>
              <span style={{ color: tooltip.signal === 0 ? "#ef4444" : tooltip.signal < 65 ? "#f97316" : "#34d399" }}>
                {tooltip.signal === 0 ? "—" : `${tooltip.signal}%`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/20f8d3d1b_tnet2-removebg-preview.png"
          alt="TouchNet Crest"
          className="w-28 h-28 object-contain"
          style={{ filter: "drop-shadow(0 0 10px rgba(192,21,42,0.4))", opacity: 0.55 }}
        />
      </div>
    </div>
  );
}