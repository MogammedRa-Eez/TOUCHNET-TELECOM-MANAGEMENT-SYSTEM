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

// Earth texture URLs (NASA Blue Marble)
const EARTH_DAY_TEXTURE   = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
const EARTH_BUMP_TEXTURE  = "https://unpkg.com/three-globe/example/img/earth-topology.png";
const EARTH_SPEC_TEXTURE  = "https://unpkg.com/three-globe/example/img/earth-water.png";
const EARTH_NIGHT_TEXTURE = "https://unpkg.com/three-globe/example/img/earth-night.jpg";

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

    // Load Earth textures
    const loader = new THREE.TextureLoader();
    const earthDay   = loader.load(EARTH_DAY_TEXTURE);
    const earthBump  = loader.load(EARTH_BUMP_TEXTURE);
    const earthSpec  = loader.load(EARTH_SPEC_TEXTURE);

    // Globe with real Earth texture
    const globeGeo = new THREE.SphereGeometry(1, 64, 64);
    const globeMat = new THREE.MeshPhongMaterial({
      map: earthDay,
      bumpMap: earthBump,
      bumpScale: 0.05,
      specularMap: earthSpec,
      specular: new THREE.Color(0x4466aa),
      shininess: 25,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // Thin atmosphere glow (blue halo around the Earth)
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.02, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.08, side: THREE.BackSide })
    ));

    // Outer atmosphere
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.10, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x2266cc, transparent: true, opacity: 0.04, side: THREE.BackSide })
    ));

    // Cloud / overlay mesh (reuse continentMesh variable name for rotating group sync)
    const continentMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.004, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })
    );
    scene.add(continentMesh);

    // Thin wireframe grid on top
    const wireMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.006, 36, 18),
      new THREE.MeshBasicMaterial({ color: 0x88aaff, wireframe: true, transparent: true, opacity: 0.04 })
    );
    scene.add(wireMesh);

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

    // ── 3D WIFI ICON (center of globe) ──────────────────────────────
    const wifiGroup = new THREE.Group();
    const wifiMat = new THREE.MeshPhongMaterial({
      color: 0xc7d2fe, emissive: 0xa5b4fc, emissiveIntensity: 1.8,
      transparent: true, opacity: 1, shininess: 200
    });
    function makeWifiArc(radius, tubeR) {
      const pts = [];
      for (let a = Math.PI * 0.18; a <= Math.PI * 0.82; a += 0.035) {
        pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
      }
      return new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, tubeR, 8, false),
        wifiMat
      );
    }
    wifiGroup.add(makeWifiArc(0.52, 0.024));
    wifiGroup.add(makeWifiArc(0.36, 0.024));
    wifiGroup.add(makeWifiArc(0.20, 0.024));
    const wifiDot = new THREE.Mesh(new THREE.SphereGeometry(0.034, 12, 12), wifiMat);
    wifiDot.position.set(0, -0.08, 0);
    wifiGroup.add(wifiDot);
    wifiGroup.position.set(0, -0.18, 0);
    scene.add(wifiGroup);
    // ─────────────────────────────────────────────────────────────────

    // Realistic lighting — sun from one side, soft fill from the other
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sunLight = new THREE.DirectionalLight(0xfff5e0, 3.5);
    sunLight.position.set(3, 1.5, 2);
    scene.add(sunLight);
    const fillLight = new THREE.DirectionalLight(0x8899cc, 0.5);
    fillLight.position.set(-2, -1, -1);
    scene.add(fillLight);

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
    const allRotating = [globe, continentMesh, dotGroup, arcGroup, wireMesh, heatmapGroup, wifiGroup];
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

  const starsCanvasRef = useRef(null);
  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const stars = Array.from({ length: 160 }, (_, i) => ({
      x: ((i * 137.5) % 100),
      y: ((i * 73.1 + 13) % 100),
      r: 0.4 + (i % 5) * 0.28,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.2,
      base: 0.25 + (i % 7) * 0.09,
    }));
    let raf;
    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const now = performance.now() / 1000;
      stars.forEach(s => {
        const op = s.base + 0.45 * Math.abs(Math.sin(now * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x / 100 * w, s.y / 100 * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${op.toFixed(2)})`;
        ctx.fill();
      });
      // bright glowing stars
      [[18,22],[72,14],[85,68],[30,80],[60,55]].forEach(([cx,cy]) => {
        const op = 0.45 + 0.55 * Math.abs(Math.sin(now * 0.8 + cx));
        const grad = ctx.createRadialGradient(cx/100*w, cy/100*h, 0, cx/100*w, cy/100*h, 4);
        grad.addColorStop(0, `rgba(165,180,252,${op.toFixed(2)})`);
        grad.addColorStop(1, 'rgba(165,180,252,0)');
        ctx.beginPath();
        ctx.arc(cx/100*w, cy/100*h, 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl" style={{ minHeight: 520 }}>
      {/* Futuristic deep-space background */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 40%, #0a1628 0%, #050d1a 50%, #020810 100%)" }}>
        {/* Star field */}
        <canvas ref={starsCanvasRef} className="absolute inset-0 w-full h-full opacity-90" />
        {/* Nebula glows */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 55% 45% at 15% 25%, rgba(6,182,212,0.07) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 85% 75%, rgba(99,102,241,0.09) 0%, transparent 65%), radial-gradient(ellipse 40% 35% at 70% 20%, rgba(139,92,246,0.06) 0%, transparent 60%)" }} />
        {/* Subtle grid lines */}
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        {/* Horizon glow at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: "linear-gradient(to top, rgba(6,182,212,0.06) 0%, transparent 100%)" }} />
      </div>

      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Heatmap Toggle Button */}
      <button
        onClick={() => setShowHeatmap(v => !v)}
        className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
        style={{
          background: showHeatmap ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.75)",
          border: `1px solid ${showHeatmap ? "rgba(239,68,68,0.4)" : "rgba(99,102,241,0.3)"}`,
          color: showHeatmap ? "#dc2626" : "#6366f1",
          backdropFilter: "blur(6px)",
          boxShadow: "0 2px 8px rgba(99,102,241,0.1)",
        }}>
        <span className={`w-1.5 h-1.5 rounded-full ${showHeatmap ? "bg-red-400" : "bg-indigo-400"}`} />
        {showHeatmap ? "Heatmap ON" : "Heatmap"}
      </button>

      {/* Heatmap Legend */}
      {showHeatmap && (
        <div className="absolute bottom-3 left-3 z-20 px-3 py-2 rounded-lg flex flex-col gap-1.5" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(99,102,241,0.2)", backdropFilter: "blur(6px)", boxShadow: "0 2px 12px rgba(99,102,241,0.1)" }}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Latency / Signal</p>
          {[
            { color: "#34d399", label: "Excellent  ≤30ms / ≥85%" },
            { color: "#fbbf24", label: "Fair  ≤80ms / ≥65%" },
            { color: "#f97316", label: "Poor  &gt;80ms / &lt;65%" },
            { color: "#ef4444", label: "Dead  offline / no signal" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}88` }} />
              <span className="text-[10px] text-slate-600" dangerouslySetInnerHTML={{ __html: label }} />
            </div>
          ))}
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div className="absolute pointer-events-none z-20 px-3 py-2 rounded-lg text-xs font-medium shadow-lg"
          style={{ left: tooltip.x + 14, top: tooltip.y - 10, background: "rgba(255,255,255,0.95)", border: `1px solid ${statusColors[tooltip.status] || "#6366f1"}`, color: "#1e293b", backdropFilter: "blur(4px)", minWidth: 160, boxShadow: "0 4px 20px rgba(99,102,241,0.15)" }}>
          <div className="font-semibold text-slate-800 mb-1">{tooltip.label}</div>
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


    </div>
  );
}