import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { base44 } from "@/api/base44Client";

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

// Accurate continent outlines [lon, lat]
const CONTINENT_POLYGONS = [
  // Africa
  [[-5.4,35.8],[-2.2,35.1],[0,35.9],[3,37.1],[5,37],[8,37],[10,37],[12,37],
   [15,37],[18,37],[22,37],[25,37],[30,31.5],[32,31],[34,30],[35,27],[37,22],
   [41,15],[43,12],[44,11],[48,8],[51,12],[50,15],[44,11],[43,12],[42,15],
   [40,20],[37,22],[34,28],[32,31],[35,37],
   [43,11],[45,10],[48,8],[50,12],[44,15],[42,13],[41,15],[40,20],
   [51,12],[50,15],[44,12],
   // back to outline
   [51,12],[48,8],[45,2],[42,-1],[40,-5],[38,-10],[36,-17],[35,-20],
   [33,-25],[30,-30],[27,-35],[23,-34],[20,-35],[18,-33],[17,-30],
   [15,-27],[14,-23],[13,-18],[12,-14],[10,-8],[9,-3],[8,2],[6,5],
   [4,5],[2,5],[0,5],[-2,5],[-5,5],[-8,4],[-10,5],[-12,7],[-14,10],
   [-16,12],[-17,15],[-16,18],[-17,21],[-17,25],[-14,28],[-10,30],
   [-6,33],[-5,35],[-5.4,35.8]],

  // Europe (simplified but recognisable)
  [[-9,39],[-9,44],[-8,44],[-4,44],[0,43],[3,43],[5,43],[8,44],[10,44],
   [12,44],[14,44],[14,41],[16,41],[18,40],[20,38],[22,38],[24,38],
   [26,41],[28,41],[30,43],[32,46],[30,47],[28,46],[26,45],[24,44],
   [22,44],[20,44],[18,46],[16,47],[14,48],[16,50],[18,50],[20,52],
   [20,54],[18,55],[16,55],[14,57],[12,58],[14,60],[16,62],[14,65],
   [16,68],[18,70],[22,71],[26,71],[28,70],[30,68],[28,65],[26,62],
   [28,60],[24,58],[22,56],[24,55],[26,55],[28,54],[26,52],[24,50],
   [22,50],[20,48],[18,46],[16,45],[14,44],[12,42],[12,38],[14,38],
   [16,38],[18,40],[20,38],[22,38],
   // Iberia / France coast
   [24,38],[22,36],[18,36],[15,38],[12,38],[10,42],[8,44],[3,44],
   [0,43],[-2,44],[-4,44],[-6,43],[-8,43],[-9,39]],

  // Asia (mainland)
  [[26,42],[28,41],[30,43],[32,47],[34,47],[36,47],[38,47],[40,43],
   [42,42],[44,41],[46,42],[48,42],[50,45],[52,47],[54,50],[56,52],
   [58,54],[60,55],[62,54],[64,54],[66,54],[68,52],[70,52],[72,54],
   [74,55],[76,55],[78,54],[80,54],[82,54],[84,52],[86,50],[88,49],
   [90,50],[92,52],[94,52],[96,50],[98,48],[100,48],[102,50],[104,52],
   [106,54],[108,55],[110,55],[112,52],[114,50],[116,48],[118,50],
   [120,52],[122,52],[124,50],[126,48],[128,48],[130,46],[132,44],
   [134,42],[136,40],[138,38],[140,38],[142,40],[144,44],[146,46],
   [148,46],[146,48],[144,50],[142,52],[140,54],[138,52],[136,50],
   [134,48],[132,46],[130,44],[128,42],[126,40],[124,38],[122,36],
   [120,32],[120,28],[118,24],[116,22],[114,22],[112,20],[110,18],
   [108,16],[106,14],[104,10],[102,6],[100,4],[100,2],[102,0],[104,-2],
   [106,-6],[108,-8],[110,-8],[112,-8],[114,-6],[116,-4],[118,-2],
   [118,2],[116,6],[114,10],[112,14],[110,18],
   [100,4],[98,2],[96,4],[94,6],[92,8],[90,10],[88,10],[86,10],
   [84,14],[82,16],[80,18],[78,20],[76,22],[74,24],[72,22],[70,22],
   [68,24],[66,25],[64,24],[62,24],[60,22],[58,22],[56,24],[54,26],
   [52,28],[50,30],[48,30],[46,30],[44,32],[42,36],[40,38],[38,36],
   [36,34],[34,32],[34,28],[36,24],[38,22],[40,18],[42,14],[44,12],
   [43,11],[42,14],[40,14],[38,12],[36,12],[34,12],[32,14],[30,16],
   [28,14],[26,14],[26,16],[24,16],[22,18],[22,22],[24,24],[24,28],
   [26,30],[28,32],[30,32],[32,32],[34,28],
   [26,42]],

  // North America
  [[-140,60],[-136,60],[-132,58],[-130,56],[-128,52],[-124,50],
   [-122,48],[-124,46],[-124,42],[-122,38],[-120,36],[-118,34],
   [-116,32],[-112,30],[-110,28],[-106,26],[-104,24],[-100,22],
   [-97,20],[-94,18],[-90,16],[-86,14],[-84,12],[-82,10],[-80,8],
   [-78,8],[-76,10],[-74,12],[-72,14],[-70,16],[-68,18],[-66,20],
   [-64,22],[-62,24],[-60,26],[-60,28],[-62,30],[-64,32],[-66,34],
   [-68,36],[-70,40],[-70,42],[-68,44],[-67,46],[-65,48],[-64,50],
   [-66,52],[-68,54],[-70,56],[-68,58],[-66,60],[-64,62],[-66,64],
   [-68,66],[-68,70],[-70,72],[-72,74],[-76,76],[-80,78],[-90,80],
   [-100,82],[-110,82],[-120,82],[-130,80],[-140,78],[-148,76],
   [-156,72],[-160,70],[-164,68],[-166,66],[-168,64],[-166,62],
   [-162,60],[-158,58],[-154,57],[-152,58],[-148,60],[-144,60],
   [-140,60]],

  // Greenland
  [[-44,83],[-26,83],[-20,80],[-18,76],[-20,72],[-24,68],[-28,65],
   [-32,64],[-38,65],[-42,66],[-46,68],[-50,70],[-52,72],[-54,74],
   [-52,76],[-48,78],[-46,80],[-44,83]],

  // South America
  [[-82,8],[-80,8],[-78,8],[-76,10],[-74,10],[-72,12],[-70,12],
   [-68,12],[-66,10],[-64,10],[-62,10],[-60,8],[-58,8],[-56,6],
   [-54,4],[-52,4],[-50,2],[-50,0],[-48,-2],[-46,-4],[-44,-4],
   [-42,-4],[-40,-2],[-38,-4],[-36,-6],[-35,-8],[-35,-10],[-36,-12],
   [-38,-14],[-38,-16],[-40,-18],[-40,-20],[-42,-22],[-44,-24],
   [-46,-24],[-48,-26],[-50,-28],[-50,-30],[-52,-32],[-52,-34],
   [-54,-36],[-56,-38],[-56,-40],[-58,-42],[-58,-44],[-60,-46],
   [-62,-48],[-64,-50],[-64,-52],[-64,-54],[-66,-54],[-68,-54],
   [-68,-52],[-68,-48],[-68,-44],[-66,-42],[-66,-40],[-68,-38],
   [-70,-36],[-72,-34],[-72,-30],[-72,-26],[-70,-20],[-70,-16],
   [-72,-14],[-74,-12],[-76,-10],[-76,-6],[-78,-2],[-78,2],
   [-78,6],[-80,8],[-82,8]],

  // Australia
  [[114,-22],[116,-20],[118,-18],[120,-18],[122,-18],[124,-18],
   [126,-16],[128,-14],[130,-12],[132,-12],[134,-12],[136,-12],
   [136,-14],[138,-16],[140,-18],[142,-18],[144,-18],[146,-18],
   [148,-20],[150,-22],[152,-24],[152,-26],[152,-28],[150,-30],
   [150,-32],[152,-34],[152,-36],[150,-38],[148,-38],[146,-38],
   [144,-38],[142,-38],[140,-36],[138,-36],[136,-36],[134,-36],
   [132,-34],[130,-32],[128,-34],[126,-34],[124,-32],[122,-34],
   [120,-34],[118,-32],[116,-30],[114,-28],[114,-24],[114,-22]],

  // New Zealand (South Island)
  [[166,-46],[168,-46],[170,-44],[172,-42],[172,-40],[170,-38],
   [168,-38],[166,-40],[166,-42],[166,-46]],
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

const LATENCY_THRESHOLD = 200; // ms — alert if exceeded

export default function NetworkGlobe({ nodes = [] }) {
  const mountRef   = useRef(null);
  const sceneRef   = useRef(null);
  const [tooltip,     setTooltip]     = useState(null);
  const [pinnedNode,  setPinnedNode]  = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const heatmapRef = useRef(null);
  const [alerts, setAlerts] = useState([]);
  const [liveNodes, setLiveNodes] = useState(NODE_PTS.map(n => ({ ...n })));
  const alertRingsRef = useRef([]);
  const dotGroupRef = useRef(null);
  const dotMeshesRef = useRef([]);
  const [cmdState, setCmdState] = useState({}); // { [nodeLabel]: { loading, result, error } }

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
    const globeMat = new THREE.MeshPhongMaterial({ color: 0x3730a3, emissive: 0x1e1b4b, shininess: 80, transparent: true, opacity: 0.75 });
    const globe    = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // Continent overlay
    const continentGeo = new THREE.SphereGeometry(1.003, 64, 64);
    const continentMat = new THREE.MeshBasicMaterial({ map: createContinentTexture(), transparent: true, opacity: 1, depthWrite: false });
    const continentMesh = new THREE.Mesh(continentGeo, continentMat);
    scene.add(continentMesh);

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
    const alertRings  = [];
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

      // Alert ring — hidden by default, shown when node is critical
      const isAlert = pt.status === "offline" || pt.latency >= LATENCY_THRESHOLD;
      const alertRing = new THREE.Mesh(
        new THREE.RingGeometry(0.055, 0.085, 32),
        new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: isAlert ? 0.7 : 0, side: THREE.DoubleSide })
      );
      alertRing.position.copy(pos);
      alertRing.lookAt(new THREE.Vector3(0, 0, 0));
      alertRing.userData.isAlert = isAlert;
      dotGroup.add(alertRing);
      alertRings.push(alertRing);
    });
    scene.add(dotGroup);
    dotGroupRef.current   = dotGroup;
    dotMeshesRef.current  = dotMeshes;
    alertRingsRef.current = alertRings;

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

    // Lighting
    scene.add(new THREE.AmbientLight(0xc7d2fe, 3));
    const dl1 = new THREE.DirectionalLight(0x6366f1, 4); dl1.position.set(2, 2, 2); scene.add(dl1);
    const dl2 = new THREE.DirectionalLight(0xa5b4fc, 2); dl2.position.set(-2, -1, -1); scene.add(dl2);

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
          if (child.userData.isAlert) {
            // Fast red pulse for alert rings
            child.material.opacity = 0.4 + 0.6 * Math.abs(Math.sin(t * 5 + i));
            const s = 1 + 0.5 * Math.abs(Math.sin(t * 4 + i));
            child.scale.set(s, s, s);
          } else {
            child.material.opacity = 0.2 + 0.3 * Math.abs(Math.sin(t * 2 + i));
            const s = 1 + 0.3 * Math.abs(Math.sin(t * 1.5 + i));
            child.scale.set(s, s, s);
          }
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

  // ── Real-time node simulation + alert detection ──────────────────
  useEffect(() => {
    const INTERVAL = 4000; // simulate every 4s
    const timer = setInterval(() => {
      setLiveNodes(prev => {
        const updated = prev.map(node => {
          // Randomly fluctuate latency ±15%, occasional spike/drop
          const spike  = Math.random() < 0.05; // 5% chance of big spike
          const recover= Math.random() < 0.08; // 8% chance of recovery
          let newLatency = node.latency;
          if (recover && node.latency > 100) {
            newLatency = Math.max(10, node.latency * 0.6 + Math.random() * 10);
          } else if (spike) {
            newLatency = Math.min(1200, node.latency * (1.5 + Math.random()));
          } else {
            const delta = (Math.random() - 0.5) * 0.3 * node.latency;
            newLatency = Math.max(5, node.latency + delta);
          }
          newLatency = Math.round(newLatency);

          // Offline nodes occasionally come back
          let newStatus = node.status;
          if (node.status === "offline" && Math.random() < 0.1) newStatus = "degraded";
          else if (node.status === "online" && newLatency > 400 && Math.random() < 0.15) newStatus = "degraded";
          else if (node.status === "degraded" && newLatency < 80 && Math.random() < 0.2) newStatus = "online";

          return { ...node, latency: newLatency, status: newStatus };
        });

        // Sync dot userData for live tooltip
        updated.forEach((node, i) => {
          if (dotMeshesRef.current[i]) {
            dotMeshesRef.current[i].userData.latency = node.latency;
            dotMeshesRef.current[i].userData.status  = node.status;
          }
        });

        // Detect newly critical nodes
        const newAlerts = [];
        updated.forEach((node, i) => {
          const prev_node = prev[i];
          const nowCritical   = node.status === "offline" || node.latency >= LATENCY_THRESHOLD;
          const wasCritical   = prev_node.status === "offline" || prev_node.latency >= LATENCY_THRESHOLD;
          if (nowCritical && !wasCritical) {
            newAlerts.push({
              id: Date.now() + i,
              label: node.label,
              type: node.status === "offline" ? "offline" : "latency",
              latency: node.latency,
              status: node.status,
            });
          }
          // Update Three.js alert rings
          if (alertRingsRef.current[i]) {
            alertRingsRef.current[i].userData.isAlert = nowCritical;
            if (!nowCritical) alertRingsRef.current[i].material.opacity = 0;
          }
        });

        if (newAlerts.length > 0) {
          setAlerts(a => [...newAlerts, ...a].slice(0, 6));
        }
        return updated;
      });
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  // Auto-dismiss alerts after 8s
  useEffect(() => {
    if (alerts.length === 0) return;
    const t = setTimeout(() => setAlerts(a => a.slice(0, -1)), 8000);
    return () => clearTimeout(t);
  }, [alerts]);

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
        ctx.fillStyle = `rgba(255,255,255,${op.toFixed(2)})`;
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
    <div className="relative w-full h-full overflow-hidden rounded-xl" style={{ minHeight: 320 }}>
      {/* System-themed background */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, #e0e7ff 0%, #eef2ff 55%, #f0f2f8 100%)" }}>
        <canvas ref={starsCanvasRef} className="absolute inset-0 w-full h-full opacity-20" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 40% at 20% 30%, rgba(99,102,241,0.12) 0%, transparent 70%), radial-gradient(ellipse 50% 35% at 80% 70%, rgba(139,92,246,0.1) 0%, transparent 70%)" }} />
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

      {/* Alert Feed */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none" style={{ maxWidth: 220 }}>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-2 px-2.5 py-2 rounded-lg text-[10px] font-semibold animate-bounce"
            style={{
              background: alert.type === "offline" ? "rgba(239,68,68,0.92)" : "rgba(251,191,36,0.92)",
              border: `1px solid ${alert.type === "offline" ? "rgba(220,38,38,0.8)" : "rgba(245,158,11,0.8)"}`,
              color: alert.type === "offline" ? "#fff" : "#1c1917",
              boxShadow: `0 2px 12px ${alert.type === "offline" ? "rgba(239,68,68,0.5)" : "rgba(251,191,36,0.4)"}`,
              backdropFilter: "blur(6px)",
            }}
          >
            <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-white opacity-90 animate-pulse" />
            <span>
              <span className="font-bold">{alert.label}</span>
              {alert.type === "offline"
                ? " went offline"
                : ` latency critical: ${alert.latency}ms`}
            </span>
          </div>
        ))}
      </div>

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