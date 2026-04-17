import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import RegionDrilldownSidebar from "./RegionDrilldownSidebar";

// ── Weather city definitions ──────────────────────────────────────────────────
const WEATHER_CITIES = [
  { lat: -26.2, lon:  28.0, label: "Johannesburg" },
  { lat: -33.9, lon:  18.4, label: "Cape Town"    },
  { lat:  51.5, lon:  -0.1, label: "London"       },
  { lat:  40.7, lon: -74.0, label: "New York"     },
  { lat:  35.7, lon: 139.7, label: "Tokyo"        },
  { lat: -23.5, lon: -46.6, label: "São Paulo"    },
  { lat:   1.3, lon: 103.8, label: "Singapore"    },
  { lat:  48.9, lon:   2.3, label: "Paris"        },
  { lat: -33.9, lon: 151.2, label: "Sydney"       },
  { lat:  55.8, lon:  37.6, label: "Moscow"       },
  { lat:  25.2, lon:  55.3, label: "Dubai"        },
  { lat:  19.1, lon:  72.9, label: "Mumbai"       },
];

function weatherInfo(code) {
  if (code === 0)   return { icon: "☀️",  label: "Clear",         effect: "clear"        };
  if (code <= 2)    return { icon: "⛅",  label: "Partly Cloudy", effect: "partly_cloud" };
  if (code === 3)   return { icon: "☁️",  label: "Overcast",      effect: "cloud"        };
  if (code <= 49)   return { icon: "🌫️",  label: "Fog",           effect: "fog"          };
  if (code <= 57)   return { icon: "🌦️",  label: "Drizzle",       effect: "rain"         };
  if (code <= 67)   return { icon: "🌧️",  label: "Rain",          effect: "rain"         };
  if (code <= 77)   return { icon: "❄️",  label: "Snow",          effect: "snow"         };
  if (code <= 82)   return { icon: "🌧️",  label: "Showers",       effect: "rain"         };
  if (code <= 86)   return { icon: "🌨️",  label: "Snow Showers",  effect: "snow"         };
  if (code <= 99)   return { icon: "⛈️",  label: "Thunderstorm",  effect: "thunder"      };
  return                   { icon: "🌡️",  label: "Unknown",       effect: "none"         };
}

// ── Network node definitions ──────────────────────────────────────────────────
const NODE_PTS = [
  { lat: -26.2, lon:  28.0, status: "online",      label: "Johannesburg", latency: 12,  signal: 95 },
  { lat: -33.9, lon:  18.4, status: "online",      label: "Cape Town",    latency: 18,  signal: 90 },
  { lat: -29.8, lon:  31.0, status: "degraded",    label: "Durban",       latency: 145, signal: 42 },
  { lat: -25.7, lon:  28.3, status: "online",      label: "Pretoria",     latency: 14,  signal: 93 },
  { lat: -23.0, lon:  29.5, status: "offline",     label: "Polokwane",    latency: 999, signal: 0  },
  { lat: -22.9, lon:  30.4, status: "online",      label: "Limpopo Node", latency: 32,  signal: 78 },
  { lat: -24.5, lon:  26.8, status: "online",      label: "Gaborone",     latency: 28,  signal: 82 },
  { lat: -28.0, lon:  26.5, status: "maintenance", label: "Bloemfontein", latency: 88,  signal: 55 },
  { lat: -26.7, lon:  27.1, status: "online",      label: "West Rand",    latency: 16,  signal: 91 },
  { lat: -27.5, lon:  29.9, status: "online",      label: "Ermelo",       latency: 44,  signal: 72 },
  { lat:  40.7, lon: -74.0, status: "online",      label: "New York",     latency: 210, signal: 88 },
  { lat:  51.5, lon:  -0.1, status: "online",      label: "London",       latency: 185, signal: 87 },
  { lat:  35.7, lon: 139.7, status: "online",      label: "Tokyo",        latency: 290, signal: 85 },
  { lat: -23.5, lon: -46.6, status: "online",      label: "São Paulo",    latency: 230, signal: 80 },
  { lat:   1.3, lon: 103.8, status: "online",      label: "Singapore",    latency: 195, signal: 89 },
];

const ARC_PAIRS = [[0,1],[0,3],[1,2],[3,6],[4,5],[6,8],[8,9],[0,10],[1,12],[3,13],[2,7],[10,11],[11,12],[13,14]];

const STATUS_HEX = { online: 0x34d399, offline: 0xef4444, degraded: 0xfbbf24, maintenance: 0x818cf8 };
const STATUS_CSS = { online: "#34d399", offline: "#ef4444", degraded: "#fbbf24", maintenance: "#818cf8" };

function latencyColor(latency, signal) {
  if (signal === 0 || latency >= 500) return new THREE.Color(0xef4444);
  if (latency <= 30 && signal >= 85)  return new THREE.Color(0x34d399);
  if (latency <= 80 && signal >= 65)  return new THREE.Color(0xfbbf24);
  return new THREE.Color(0xf97316);
}

function latLonToVec3(lat, lon, r = 1.02) {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

function makeRadialTexture(color, alpha = 0.6, size = 128) {
  const c   = document.createElement("canvas");
  c.width   = c.height = size;
  const ctx = c.getContext("2d");
  const g   = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  g.addColorStop(0,   `rgba(${color},${alpha})`);
  g.addColorStop(0.5, `rgba(${color},${(alpha * 0.35).toFixed(2)})`);
  g.addColorStop(1,   `rgba(${color},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

// ── Arc curve builder ─────────────────────────────────────────────────────────
function buildArcPoints(p1, p2, lift = 0.28) {
  const pts = [];
  for (let t = 0; t <= 1; t += 0.025) {
    const v = new THREE.Vector3().lerpVectors(p1, p2, t);
    v.normalize().multiplyScalar(1.01 + lift * Math.sin(Math.PI * t));
    pts.push(v);
  }
  return pts;
}

// ── Weather effect builder ────────────────────────────────────────────────────
function buildWeatherEffect(lat, lon, effect) {
  const group  = new THREE.Group();
  const center = latLonToVec3(lat, lon, 1.015);
  const faceOut = (mesh, pos) => { mesh.position.copy(pos); mesh.lookAt(new THREE.Vector3(0,0,0)); mesh.rotateX(Math.PI); };

  if (effect === "clear") {
    const tex = makeRadialTexture("255,220,80", 0.3);
    const m   = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    faceOut(m, latLonToVec3(lat, lon, 1.016)); group.add(m);
  }
  if (effect === "partly_cloud") {
    const tex = makeRadialTexture("230,240,255", 0.45);
    const m   = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    faceOut(m, latLonToVec3(lat, lon, 1.017)); group.add(m);
  }
  if (effect === "cloud" || effect === "fog") {
    const opacity = effect === "fog" ? 0.55 : 0.65;
    const size    = effect === "fog" ? 0.28 : 0.22;
    const color   = effect === "fog" ? "200,200,200" : "220,230,255";
    const tex = makeRadialTexture(color, opacity);
    for (let k = 0; k < 3; k++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size * 0.7),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
      faceOut(m, latLonToVec3(lat + (k-1)*0.8, lon + (k-1)*0.8, 1.018)); group.add(m);
    }
  }
  if (effect === "rain") {
    const cloudTex = makeRadialTexture("100,130,180", 0.6);
    const cm = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.17),
      new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    faceOut(cm, latLonToVec3(lat, lon, 1.019)); group.add(cm);
    const outward = center.clone().normalize();
    const right   = new THREE.Vector3().crossVectors(outward, new THREE.Vector3(0,1,0)).normalize();
    const up2     = new THREE.Vector3().crossVectors(right, outward).normalize();
    for (let i = 0; i < 14; i++) {
      const angle  = (i / 14) * Math.PI * 2;
      const r      = 0.03 + Math.random() * 0.07;
      const offset = right.clone().multiplyScalar(Math.cos(angle) * r).add(up2.clone().multiplyScalar(Math.sin(angle) * r));
      const sp = center.clone().add(offset).normalize().multiplyScalar(1.022);
      const ep = sp.clone().normalize().multiplyScalar(1.007);
      const geo  = new THREE.BufferGeometry().setFromPoints([sp, ep]);
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x7ab8f5, transparent: true, opacity: 0.7 }));
      line.userData.rainLine = true; line.userData.phase = Math.random() * Math.PI * 2;
      group.add(line);
    }
  }
  if (effect === "snow") {
    const cloudTex = makeRadialTexture("200,220,240", 0.5);
    const cm = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.15),
      new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    faceOut(cm, latLonToVec3(lat, lon, 1.019)); group.add(cm);
    const outward = center.clone().normalize();
    const right   = new THREE.Vector3().crossVectors(outward, new THREE.Vector3(0,1,0)).normalize();
    const up2     = new THREE.Vector3().crossVectors(right, outward).normalize();
    for (let i = 0; i < 12; i++) {
      const angle  = (i / 12) * Math.PI * 2;
      const r      = 0.03 + Math.random() * 0.07;
      const offset = right.clone().multiplyScalar(Math.cos(angle) * r).add(up2.clone().multiplyScalar(Math.sin(angle) * r));
      const pos = center.clone().add(offset).normalize().multiplyScalar(1.015 + Math.random() * 0.006);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.003, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0xddeeff, transparent: true, opacity: 0.85 }));
      dot.position.copy(pos); dot.userData.snowDot = true; dot.userData.phase = Math.random() * Math.PI * 2;
      group.add(dot);
    }
  }
  if (effect === "thunder") {
    const cloudTex = makeRadialTexture("50,50,70", 0.75);
    const cm = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.19),
      new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    faceOut(cm, latLonToVec3(lat, lon, 1.019)); group.add(cm);
    const flashTex = makeRadialTexture("255,255,160", 0.9);
    const fm = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16),
      new THREE.MeshBasicMaterial({ map: flashTex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    faceOut(fm, latLonToVec3(lat, lon, 1.020));
    fm.userData.lightning = true; fm.userData.phase = Math.random() * Math.PI * 2;
    group.add(fm);
  }
  group.userData.effect = effect;
  return group;
}

// ── Fetch live weather ────────────────────────────────────────────────────────
async function fetchWeatherAll() {
  const lats = WEATHER_CITIES.map(c => c.lat).join(",");
  const lons = WEATHER_CITIES.map(c => c.lon).join(",");
  const url  = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current_weather=true&hourly=relative_humidity_2m,apparent_temperature,wind_speed_10m&forecast_days=1`;
  const res  = await fetch(url);
  const json = await res.json();
  const arr  = Array.isArray(json) ? json : [json];
  return WEATHER_CITIES.map((city, i) => {
    const d = arr[i] || {}; const cw = d.current_weather || {};
    return { ...city, temp: cw.temperature ?? null, windspeed: d.hourly?.wind_speed_10m?.[0] ?? cw.windspeed ?? null,
      code: cw.weathercode ?? null, humidity: d.hourly?.relative_humidity_2m?.[0] ?? null,
      feelsLike: d.hourly?.apparent_temperature?.[0] ?? null, is_day: cw.is_day ?? 1 };
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function NetworkGlobe({ nodes = [], onNodeSelect }) {
  const mountRef        = useRef(null);
  const sceneRef        = useRef(null);
  const heatmapRef      = useRef(null);
  const weatherGroupRef = useRef(null);
  const allRotatingRef  = useRef([]);
  const starsCanvasRef  = useRef(null);
  const packetsRef      = useRef([]);  // { mesh, arcPts, progress, speed }
  const scanRingRef     = useRef(null);

  const [tooltip,          setTooltip]          = useState(null);
  const [selectedNode,     setSelectedNode]     = useState(null);
  const [showHeatmap,      setShowHeatmap]      = useState(false);
  const [showWeather,      setShowWeather]      = useState(false);
  const [weatherPanelOpen, setWeatherPanelOpen] = useState(true);
  const [weatherData,      setWeatherData]      = useState([]);
  const [weatherLoading,   setWeatherLoading]   = useState(false);
  const [weatherError,     setWeatherError]     = useState(null);
  const [networkStats,     setNetworkStats]     = useState({ online: 0, offline: 0, degraded: 0, maintenance: 0, avgLatency: 0 });

  // Compute stats on mount
  useEffect(() => {
    const counts = { online: 0, offline: 0, degraded: 0, maintenance: 0 };
    let latSum = 0; let latCount = 0;
    NODE_PTS.forEach(n => {
      counts[n.status] = (counts[n.status] || 0) + 1;
      if (n.latency < 999) { latSum += n.latency; latCount++; }
    });
    setNetworkStats({ ...counts, avgLatency: latCount ? Math.round(latSum / latCount) : 0 });
  }, []);

  // ── Load weather ──────────────────────────────────────────────────────────
  const loadWeather = useCallback(() => {
    setWeatherLoading(true); setWeatherError(null);
    fetchWeatherAll()
      .then(data => { setWeatherData(data); setWeatherLoading(false); })
      .catch(() => { setWeatherError("Failed to load weather."); setWeatherLoading(false); });
  }, []);

  useEffect(() => {
    if (!showWeather || weatherData.length > 0) return;
    loadWeather();
  }, [showWeather]);

  // ── Rebuild weather 3D effects ────────────────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current?.scene;
    if (!scene) return;
    if (weatherGroupRef.current) {
      scene.remove(weatherGroupRef.current);
      allRotatingRef.current = allRotatingRef.current.filter(o => o !== weatherGroupRef.current);
      weatherGroupRef.current = null;
    }
    if (!showWeather || weatherData.length === 0) return;
    const wg = new THREE.Group();
    weatherData.forEach(city => {
      if (city.code === null) return;
      wg.add(buildWeatherEffect(city.lat, city.lon, weatherInfo(city.code).effect));
    });
    wg.rotation.y = allRotatingRef.current[0]?.rotation?.y ?? 0;
    scene.add(wg);
    weatherGroupRef.current = wg;
    allRotatingRef.current.push(wg);
  }, [weatherData, showWeather]);

  // ── Three.js scene ────────────────────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const W = mount.clientWidth, H = mount.clientHeight;
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(42, W / H, 0.1, 1000);
    camera.position.set(0, 0, 2.9);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    sceneRef.current = { renderer, scene };

    // ── Textures ────────────────────────────────────────────────────────────
    const loader   = new THREE.TextureLoader();
    const earthDay = loader.load("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg");
    const earthBump= loader.load("https://unpkg.com/three-globe/example/img/earth-topology.png");
    const earthSpec= loader.load("https://unpkg.com/three-globe/example/img/earth-water.png");

    // ── Earth ───────────────────────────────────────────────────────────────
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({ map: earthDay, bumpMap: earthBump, bumpScale: 0.06,
        specularMap: earthSpec, specular: new THREE.Color(0x3355aa), shininess: 30 })
    );
    scene.add(globe);

    // ── Atmosphere layers ───────────────────────────────────────────────────
    // Inner glow
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.015, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x44aaff, transparent: true, opacity: 0.06, side: THREE.BackSide })));
    // Mid atmosphere
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.06, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x2255cc, transparent: true, opacity: 0.04, side: THREE.BackSide })));
    // Outer haze
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.14, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x1133aa, transparent: true, opacity: 0.025, side: THREE.BackSide })));

    // Night side dark overlay
    const nightMesh = new THREE.Mesh(new THREE.SphereGeometry(1.002, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x000820, transparent: true, opacity: 0.32, side: THREE.FrontSide, depthWrite: false }));
    scene.add(nightMesh);

    // ── Grid wireframe ──────────────────────────────────────────────────────
    const wireMesh = new THREE.Mesh(new THREE.SphereGeometry(1.007, 36, 18),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.03 }));
    scene.add(wireMesh);

    // ── Orbital rings ───────────────────────────────────────────────────────
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.4 });
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.22 });
    const ringMat3 = new THREE.MeshBasicMaterial({ color: 0xa5b4fc, transparent: true, opacity: 0.14 });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.014, 8, 100), ringMat1);
    ring1.rotation.x = Math.PI / 2; scene.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.24, 0.007, 6, 100), ringMat2);
    ring2.rotation.x = Math.PI / 5; ring2.rotation.y = Math.PI / 4; scene.add(ring2);
    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.004, 6, 100), ringMat3);
    ring3.rotation.x = -Math.PI / 4; ring3.rotation.z = Math.PI / 6; scene.add(ring3);

    // ── Scanning ring (sweeps around globe) ─────────────────────────────────
    const scanRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.12, 0.006, 8, 100),
      new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.55 })
    );
    scanRing.rotation.x = Math.PI / 2;
    scene.add(scanRing);
    scanRingRef.current = scanRing;

    // ── Heatmap group ───────────────────────────────────────────────────────
    const heatmapGroup = new THREE.Group();
    heatmapGroup.visible = false;
    NODE_PTS.forEach(pt => {
      const center = latLonToVec3(pt.lat, pt.lon, 1.015);
      const col    = latencyColor(pt.latency, pt.signal);
      const blobR  = 0.07 + 0.13 * Math.min(1, (pt.latency > 500 ? 500 : pt.latency) / 500);
      const mesh   = new THREE.Mesh(new THREE.CircleGeometry(blobR, 32),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false }));
      mesh.position.copy(center); mesh.lookAt(new THREE.Vector3(0,0,0)); mesh.rotateX(Math.PI);
      heatmapGroup.add(mesh);
      const glow = new THREE.Mesh(new THREE.RingGeometry(blobR, blobR + 0.05, 32),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }));
      glow.position.copy(center); glow.lookAt(new THREE.Vector3(0,0,0)); glow.rotateX(Math.PI);
      heatmapGroup.add(glow);
    });
    scene.add(heatmapGroup);
    heatmapRef.current = heatmapGroup;

    // ── Node dots + beacon spikes ───────────────────────────────────────────
    const dotMeshes = [];
    const dotGroup  = new THREE.Group();
    NODE_PTS.forEach(pt => {
      const pos    = latLonToVec3(pt.lat, pt.lon, 1.02);
      const col    = STATUS_HEX[pt.status] || 0x34d399;
      const outDir = pos.clone().normalize();

      // Core dot
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 10),
        new THREE.MeshBasicMaterial({ color: col }));
      dot.position.copy(pos);
      dot.userData = { label: pt.label, status: pt.status, latency: pt.latency, signal: pt.signal };
      dotGroup.add(dot);
      dotMeshes.push(dot);

      // Beacon spike (vertical line outward)
      const spikeEnd = pos.clone().add(outDir.clone().multiplyScalar(0.06));
      const spikeGeo = new THREE.BufferGeometry().setFromPoints([pos, spikeEnd]);
      const spike    = new THREE.Line(spikeGeo, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.7 }));
      dotGroup.add(spike);

      // Outer ring pulse
      const pulse = new THREE.Mesh(new THREE.RingGeometry(0.028, 0.045, 18),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }));
      pulse.position.copy(pos); pulse.lookAt(new THREE.Vector3(0,0,0));
      dotGroup.add(pulse);

      // Second wider pulse ring
      const pulse2 = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.065, 18),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false }));
      pulse2.position.copy(pos); pulse2.lookAt(new THREE.Vector3(0,0,0));
      dotGroup.add(pulse2);

      // Halo glow (corona)
      const haloTex = makeRadialTexture(
        pt.status === "online" ? "52,211,153" : pt.status === "offline" ? "239,68,68" : pt.status === "degraded" ? "251,191,36" : "129,140,248",
        0.5, 64
      );
      const halo = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1),
        new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
      halo.position.copy(pos); halo.lookAt(new THREE.Vector3(0,0,0)); halo.rotateX(Math.PI);
      dotGroup.add(halo);
    });
    scene.add(dotGroup);

    // ── Glowing arcs ────────────────────────────────────────────────────────
    const arcGroup = new THREE.Group();
    const arcDataList = []; // store arc point lists for packet travel

    const arcColors = [0x6366f1, 0x06b6d4, 0x8b5cf6, 0x34d399, 0xf59e0b];
    ARC_PAIRS.forEach(([a, b], idx) => {
      if (!NODE_PTS[a] || !NODE_PTS[b]) return;
      const p1  = latLonToVec3(NODE_PTS[a].lat, NODE_PTS[a].lon, 1.02);
      const p2  = latLonToVec3(NODE_PTS[b].lat, NODE_PTS[b].lon, 1.02);
      const pts = buildArcPoints(p1, p2, 0.24);
      arcDataList.push(pts);

      const col  = arcColors[idx % arcColors.length];
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.005, 5, false),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.45 })
      );
      arcGroup.add(tube);

      // Glow tube (slightly larger, lower opacity)
      const glowTube = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.012, 5, false),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.1, depthWrite: false })
      );
      arcGroup.add(glowTube);
    });
    scene.add(arcGroup);

    // ── Data packets travelling arcs ────────────────────────────────────────
    const packetGroup = new THREE.Group();
    const packetMat   = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.95 });
    const packetGeo   = new THREE.SphereGeometry(0.014, 6, 6);
    const packets     = arcDataList.map((pts, i) => {
      const mesh = new THREE.Mesh(packetGeo, packetMat.clone());
      mesh.material.color.setHex(arcColors[i % arcColors.length]);
      packetGroup.add(mesh);
      return { mesh, arcPts: pts, progress: Math.random(), speed: 0.003 + Math.random() * 0.004 };
    });
    scene.add(packetGroup);
    packetsRef.current = packets;

    // ── Nebula particle cloud ───────────────────────────────────────────────
    const particleCount = 400;
    const pPositions    = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r     = 1.5 + Math.random() * 1.0;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      pPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    const particles = new THREE.Points(pGeo,
      new THREE.PointsMaterial({ color: 0x6688cc, size: 0.012, transparent: true, opacity: 0.35, sizeAttenuation: true }));
    scene.add(particles);

    // ── Lighting ────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const sunLight = new THREE.DirectionalLight(0xfff8e0, 3.8);
    sunLight.position.set(3, 1.5, 2); scene.add(sunLight);
    const fillLight = new THREE.DirectionalLight(0x3344aa, 0.6);
    fillLight.position.set(-2, -1, -1); scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0x06b6d4, 0.4);
    rimLight.position.set(0, 2, -2); scene.add(rimLight);

    // ── Base rotating objects ────────────────────────────────────────────────
    const baseRotating = [globe, nightMesh, wireMesh, dotGroup, arcGroup, packetGroup, heatmapGroup, ring1, ring2, ring3, particles];
    allRotatingRef.current = baseRotating;

    // ── Interaction ──────────────────────────────────────────────────────────
    const raycaster  = new THREE.Raycaster();
    const mouseVec   = new THREE.Vector2();
    let isDragging   = false;
    let prevMouse    = { x: 0, y: 0 };
    let rotVel       = { x: 0, y: 0.0008 };
    let camZ         = 2.9;

    let didDrag = false;
    const onMouseDown  = e => { isDragging = true; didDrag = false; prevMouse = { x: e.clientX, y: e.clientY }; mount.style.cursor = "grabbing"; };
    const onMouseUp    = () => { isDragging = false; mount.style.cursor = "grab"; };
    const onClick = e => {
      if (didDrag) return;
      const rect = mount.getBoundingClientRect();
      const mv = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width)  * 2 - 1,
       -((e.clientY - rect.top)  / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(mv, camera);
      const hits = raycaster.intersectObjects(dotMeshes.map(d => { const c = d.clone(); c.position.copy(d.position).applyMatrix4(dotGroup.matrixWorld); return c; }));
      if (hits.length > 0) {
        const worldDots = dotMeshes.map(d => { const c = d.clone(); c.position.copy(d.position).applyMatrix4(dotGroup.matrixWorld); return c; });
        const idx  = worldDots.indexOf(hits[0].object);
        const data = dotMeshes[idx]?.userData;
        if (data) {
          const nodePt = NODE_PTS.find(n => n.label === data.label);
          setSelectedNode(nodePt || data);
        }
      }
    };
    const onMouseMove  = e => {
      const rect = mount.getBoundingClientRect();
      mouseVec.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouseVec.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      const worldDots = dotMeshes.map(d => { const c = d.clone(); c.position.copy(d.position).applyMatrix4(dotGroup.matrixWorld); return c; });
      const hits = raycaster.intersectObjects(worldDots);
      if (hits.length > 0) {
        const idx = worldDots.indexOf(hits[0].object);
        const data = dotMeshes[idx]?.userData;
        if (data) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, ...data });
      } else { setTooltip(null); }
      if (!isDragging) return;
      rotVel.y = (e.clientX - prevMouse.x) * 0.006;
      rotVel.x = (e.clientY - prevMouse.y) * 0.006;
      if (Math.abs(e.clientX - prevMouse.x) > 3 || Math.abs(e.clientY - prevMouse.y) > 3) didDrag = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onWheel = e => {
      e.preventDefault();
      camZ = Math.min(4.5, Math.max(1.8, camZ + e.deltaY * 0.003));
      camera.position.z = camZ;
    };
    const onMouseLeave = () => setTooltip(null);

    // Touch support
    let lastTouchDist = null;
    const onTouchStart = e => {
      if (e.touches.length === 1) { isDragging = true; prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
      if (e.touches.length === 2) { lastTouchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }
    };
    const onTouchMove = e => {
      if (e.touches.length === 1 && isDragging) {
        rotVel.y = (e.touches[0].clientX - prevMouse.x) * 0.006;
        rotVel.x = (e.touches[0].clientY - prevMouse.y) * 0.006;
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      if (e.touches.length === 2 && lastTouchDist) {
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        camZ = Math.min(4.5, Math.max(1.8, camZ - (dist - lastTouchDist) * 0.01));
        camera.position.z = camZ;
        lastTouchDist = dist;
      }
    };
    const onTouchEnd = () => { isDragging = false; lastTouchDist = null; };

    mount.addEventListener("mousedown",   onMouseDown);
    mount.addEventListener("click",       onClick);
    mount.addEventListener("mouseleave",  onMouseLeave);
    mount.addEventListener("wheel",       onWheel, { passive: false });
    mount.addEventListener("touchstart",  onTouchStart, { passive: true });
    mount.addEventListener("touchmove",   onTouchMove,  { passive: true });
    mount.addEventListener("touchend",    onTouchEnd);
    window.addEventListener("mouseup",    onMouseUp);
    window.addEventListener("mousemove",  onMouseMove);

    // ── Animation ────────────────────────────────────────────────────────────
    let frameId, t = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.016;

      const rotating = allRotatingRef.current;
      if (!isDragging) {
        rotVel.y *= 0.97; rotVel.x *= 0.94;
        rotVel.y += 0.00018; // base auto-rotate
        rotating.forEach(o => { o.rotation.y += rotVel.y; o.rotation.x = Math.max(-0.5, Math.min(0.5, o.rotation.x + rotVel.x)); });
      } else {
        rotating.forEach(o => { o.rotation.y += rotVel.y; o.rotation.x = Math.max(-0.5, Math.min(0.5, o.rotation.x + rotVel.x)); });
      }

      // Scanning ring sweep
      if (scanRingRef.current) {
        scanRingRef.current.rotation.y = t * 0.8;
        scanRingRef.current.material.opacity = 0.3 + 0.25 * Math.abs(Math.sin(t * 0.5));
      }

      // Ring counter-rotations
      ring1.rotation.z += 0.003;
      ring2.rotation.z -= 0.0015;
      ring3.rotation.z += 0.001;
      ring3.rotation.x -= 0.0005;

      // Node dot pulses (two rings per node)
      let ringIdx = 0;
      dotGroup.children.forEach(child => {
        if (child.geometry?.type === "RingGeometry") {
          const phase = ringIdx * 0.4;
          const s = 1 + 0.35 * Math.abs(Math.sin(t * 1.8 + phase));
          child.material.opacity = 0.18 + 0.28 * Math.abs(Math.sin(t * 2 + phase));
          child.scale.set(s, s, s);
          ringIdx++;
        }
      });

      // Data packets along arcs — arc points are in local space, packetGroup rotates with globe
      packetsRef.current.forEach(p => {
        p.progress = (p.progress + p.speed) % 1;
        const arcIdx = Math.floor(p.progress * (p.arcPts.length - 1));
        const frac   = p.progress * (p.arcPts.length - 1) - arcIdx;
        const ptA    = p.arcPts[arcIdx];
        const ptB    = p.arcPts[arcIdx + 1] || p.arcPts[arcIdx];
        if (ptA && ptB) {
          p.mesh.position.lerpVectors(ptA, ptB, frac);
        }
        p.mesh.material.opacity = 0.6 + 0.4 * Math.abs(Math.sin(t * 4 + p.progress * 10));
      });

      // Weather animations
      const wg = weatherGroupRef.current;
      if (wg) {
        wg.traverse(child => {
          if (child.userData.rainLine) child.material.opacity = 0.25 + 0.75 * Math.abs(Math.sin(t * 5 + child.userData.phase));
          if (child.userData.snowDot)  child.material.opacity = 0.35 + 0.55 * Math.abs(Math.sin(t * 1.5 + child.userData.phase));
          if (child.userData.lightning) {
            const fl = Math.sin(t * 3.5 + child.userData.phase);
            child.material.opacity = fl > 0.82 ? 0.95 : 0.04;
            if (fl > 0.82) child.userData.phase += 1.1;
          }
        });
      }

      // Nebula drift
      particles.rotation.y += 0.00015;
      particles.rotation.x += 0.00005;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      mount.removeEventListener("mousedown",  onMouseDown);
      mount.removeEventListener("click",      onClick);
      mount.removeEventListener("mouseleave", onMouseLeave);
      mount.removeEventListener("wheel",      onWheel);
      mount.removeEventListener("touchstart", onTouchStart);
      mount.removeEventListener("touchmove",  onTouchMove);
      mount.removeEventListener("touchend",   onTouchEnd);
      window.removeEventListener("mouseup",   onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize",    onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  useEffect(() => { if (heatmapRef.current) heatmapRef.current.visible = showHeatmap; }, [showHeatmap]);

  // ── Stars canvas ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;
    const ctx   = canvas.getContext("2d");
    const stars = Array.from({ length: 200 }, (_, i) => ({
      x: ((i * 137.5) % 100), y: ((i * 73.1 + 13) % 100),
      r: 0.3 + (i % 5) * 0.3, phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 1.4, base: 0.2 + (i % 7) * 0.09
    }));
    let raf;
    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const now = performance.now() / 1000;
      stars.forEach(s => {
        const op = s.base + 0.45 * Math.abs(Math.sin(now * s.speed + s.phase));
        ctx.beginPath(); ctx.arc(s.x/100*w, s.y/100*h, s.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(200,220,255,${op.toFixed(2)})`; ctx.fill();
      });
      // Nebula glow spots
      [[18,22],[72,14],[85,68],[30,80],[60,55],[45,35],[90,45]].forEach(([cx,cy]) => {
        const op = 0.35 + 0.5 * Math.abs(Math.sin(now * 0.7 + cx));
        const grad = ctx.createRadialGradient(cx/100*w, cy/100*h, 0, cx/100*w, cy/100*h, 5);
        grad.addColorStop(0, `rgba(165,180,252,${op.toFixed(2)})`);
        grad.addColorStop(1, "rgba(165,180,252,0)");
        ctx.beginPath(); ctx.arc(cx/100*w, cy/100*h, 5, 0, Math.PI*2);
        ctx.fillStyle = grad; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener("resize", resize); draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div className="relative w-full h-full flex overflow-hidden" style={{ minHeight: 520 }}>

      {/* ── Deep space background — blends with navy brand ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 40% 45%, #0d1535 0%, #080e25 50%, #040a1a 100%)" }}>
        <canvas ref={starsCanvasRef} className="absolute inset-0 w-full h-full opacity-80" />
        {/* Brand-aligned navy/crimson nebula accents */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 55% 45% at 10% 15%, rgba(30,45,110,0.18) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 88% 82%, rgba(196,30,58,0.1) 0%, transparent 60%), radial-gradient(ellipse 40% 35% at 75% 15%, rgba(74,95,168,0.08) 0%, transparent 55%)" }} />
        {/* Subtle grid — matches page-bg */}
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(74,95,168,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(74,95,168,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        {/* Bottom fade to blend with dashboard bg */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: "linear-gradient(transparent, rgba(15,22,55,0.3))" }} />
      </div>

      {/* Three.js mount */}
      <div ref={mountRef} className="absolute inset-0" style={{ cursor: "grab" }} />

      {/* ── Corner bracket accents (brand aesthetic) ── */}
      <div className="absolute top-2 left-2 w-5 h-5 pointer-events-none z-10" style={{ borderTop: "2px solid rgba(74,95,168,0.5)", borderLeft: "2px solid rgba(74,95,168,0.5)" }} />
      <div className="absolute top-2 right-2 w-5 h-5 pointer-events-none z-10" style={{ borderTop: "2px solid rgba(196,30,58,0.4)", borderRight: "2px solid rgba(196,30,58,0.4)" }} />
      <div className="absolute bottom-2 left-2 w-5 h-5 pointer-events-none z-10" style={{ borderBottom: "2px solid rgba(74,95,168,0.3)", borderLeft: "2px solid rgba(74,95,168,0.3)" }} />
      <div className="absolute bottom-2 right-2 w-5 h-5 pointer-events-none z-10" style={{ borderBottom: "2px solid rgba(196,30,58,0.3)", borderRight: "2px solid rgba(196,30,58,0.3)" }} />

      {/* ── HUD: Left side — node telemetry ── */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {/* Title chip */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(15,26,61,0.88)", border: "1px solid rgba(74,95,168,0.35)", backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(30,45,110,0.3)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.22em]" style={{ color: "rgba(164,181,255,0.55)", fontFamily: "'JetBrains Mono',monospace" }}>TOUCHNET GLOBAL</p>
            <p className="text-[11px] font-black" style={{ color: "#a4b5ff", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.06em" }}>LIVE TELEMETRY</p>
          </div>
        </div>

        {/* Status counts */}
        <div className="px-3 py-2.5 rounded-xl flex flex-col gap-1.5"
          style={{ background: "rgba(15,26,61,0.85)", border: "1px solid rgba(74,95,168,0.25)", backdropFilter: "blur(12px)", boxShadow: "0 4px 16px rgba(30,45,110,0.25)" }}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(164,181,255,0.45)", fontFamily: "'JetBrains Mono',monospace" }}>Node Status</p>
            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md" style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
              {NODE_PTS.length} NODES
            </span>
          </div>
          {[
            { key: "online",      label: "Online",      color: "#34d399", glow: "rgba(52,211,153,0.6)"  },
            { key: "degraded",    label: "Degraded",    color: "#fbbf24", glow: "rgba(251,191,36,0.6)"  },
            { key: "maintenance", label: "Maintenance", color: "#818cf8", glow: "rgba(129,140,248,0.6)" },
            { key: "offline",     label: "Offline",     color: "#ef4444", glow: "rgba(239,68,68,0.6)"   },
          ].map(({ key, label, color, glow }) => {
            const count = networkStats[key] || 0;
            const pct   = NODE_PTS.length > 0 ? (count / NODE_PTS.length) * 100 : 0;
            return (
              <div key={key} className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${glow}` }} />
                    <span className="text-[10px]" style={{ color: "rgba(200,210,255,0.65)" }}>{label}</span>
                  </div>
                  <span className="text-[11px] font-black" style={{ color, fontFamily: "'JetBrains Mono',monospace" }}>{count}</span>
                </div>
                {/* Mini progress bar */}
                <div className="h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(74,95,168,0.15)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                </div>
              </div>
            );
          })}
          <div className="mt-1.5 pt-2 flex items-center justify-between" style={{ borderTop: "1px solid rgba(74,95,168,0.18)" }}>
            <span className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(164,181,255,0.4)", fontFamily: "monospace" }}>Avg Latency</span>
            <span className="text-[12px] font-black" style={{ fontFamily: "'JetBrains Mono',monospace", color: networkStats.avgLatency < 50 ? "#34d399" : networkStats.avgLatency < 150 ? "#fbbf24" : "#f97316" }}>
              {networkStats.avgLatency}<span className="text-[9px] ml-0.5" style={{ color: "rgba(164,181,255,0.4)" }}>ms</span>
            </span>
          </div>
        </div>

        {/* Hint */}
        <div className="px-2.5 py-1.5 rounded-xl flex items-center gap-1.5"
          style={{ background: "rgba(15,26,61,0.7)", border: "1px solid rgba(74,95,168,0.15)", backdropFilter: "blur(8px)" }}>
          <span className="text-[8px]" style={{ color: "rgba(164,181,255,0.35)", fontFamily: "monospace" }}>⟳ drag · ⊕ zoom · ◎ hover · ✦ click node</span>
        </div>
      </div>

      {/* ── HUD: Top right — controls ── */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button onClick={() => setShowHeatmap(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105"
          style={{
            background: showHeatmap ? "rgba(196,30,58,0.18)" : "rgba(15,26,61,0.85)",
            border: `1px solid ${showHeatmap ? "rgba(196,30,58,0.5)" : "rgba(74,95,168,0.35)"}`,
            color: showHeatmap ? "#e87088" : "#a4b5ff",
            backdropFilter: "blur(12px)",
            boxShadow: showHeatmap ? "0 4px 16px rgba(196,30,58,0.2)" : "0 4px 16px rgba(30,45,110,0.2)",
            fontFamily: "'JetBrains Mono',monospace",
            letterSpacing: "0.12em",
          }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: showHeatmap ? "#e87088" : "#a4b5ff", boxShadow: showHeatmap ? "0 0 6px #e87088" : "0 0 6px #a4b5ff" }} />
          {showHeatmap ? "HEAT ON" : "HEATMAP"}
        </button>
        <button onClick={() => setShowWeather(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105"
          style={{
            background: showWeather ? "rgba(30,45,110,0.3)" : "rgba(15,26,61,0.85)",
            border: `1px solid ${showWeather ? "rgba(74,95,168,0.6)" : "rgba(74,95,168,0.25)"}`,
            color: "#a4b5ff",
            backdropFilter: "blur(12px)",
            boxShadow: showWeather ? "0 4px 16px rgba(30,45,110,0.3)" : "none",
            fontFamily: "'JetBrains Mono',monospace",
            letterSpacing: "0.12em",
          }}>
          <span className="text-[12px]">🌍</span>
          {showWeather ? "WTHR ON" : "WEATHER"}
        </button>
      </div>

      {/* ── Heatmap Legend ── */}
      {showHeatmap && !showWeather && (
        <div className="absolute bottom-4 left-4 z-20 px-3 py-2.5 rounded-xl flex flex-col gap-1.5"
          style={{ background: "rgba(15,26,61,0.88)", border: "1px solid rgba(74,95,168,0.25)", backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(30,45,110,0.3)" }}>
          <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: "rgba(164,181,255,0.45)", fontFamily: "'JetBrains Mono',monospace" }}>Latency · Signal</p>
          {[
            { color: "#34d399", label: "Excellent ≤30ms / ≥85%" },
            { color: "#fbbf24", label: "Fair ≤80ms / ≥65%"      },
            { color: "#f97316", label: "Poor >80ms / <65%"       },
            { color: "#ef4444", label: "Offline / No signal"     },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}88` }} />
              <span className="text-[10px]" style={{ color: "rgba(200,210,255,0.6)" }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Scan line overlay effect ── */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(30,45,110,0.012) 3px, rgba(30,45,110,0.012) 4px)"
      }} />

      {/* ── Weather Panel — blended with brand ── */}
      {showWeather && (
        <div className="absolute bottom-0 left-0 right-0 z-20"
          style={{ background: "rgba(10,16,42,0.96)", borderTop: "1px solid rgba(74,95,168,0.3)", backdropFilter: "blur(16px)" }}>
          {/* Accent top line */}
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#1e2d6e,#4a5fa8,#c41e3a,transparent)" }} />
          <div className="flex items-center justify-between px-4 py-2 cursor-pointer select-none"
            style={{ borderBottom: weatherPanelOpen ? "1px solid rgba(74,95,168,0.15)" : "none" }}
            onClick={() => setWeatherPanelOpen(v => !v)}>
            <div className="flex items-center gap-2">
              <span className="text-sm">🌍</span>
              <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "#a4b5ff", fontFamily: "'JetBrains Mono',monospace" }}>Live Global Weather</span>
              {weatherLoading && <span className="text-[10px] animate-pulse" style={{ color: "rgba(164,181,255,0.5)" }}>Loading…</span>}
              {!weatherLoading && weatherData.length > 0 && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-md font-black" style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)", fontFamily: "monospace", letterSpacing: "0.1em" }}>LIVE</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!weatherLoading && weatherPanelOpen && (
                <button onClick={e => { e.stopPropagation(); setWeatherData([]); loadWeather(); }}
                  className="text-[10px] px-2 py-0.5 rounded-lg font-bold transition-all hover:scale-105"
                  style={{ color: "#a4b5ff", border: "1px solid rgba(74,95,168,0.3)", background: "rgba(30,45,110,0.15)", fontFamily: "monospace" }}>
                  ↻
                </button>
              )}
              <span className="text-[12px]" style={{ color: "#a4b5ff" }}>{weatherPanelOpen ? "▼" : "▲"}</span>
            </div>
          </div>

          {weatherPanelOpen && (
            <>
              {weatherError && <p className="text-[11px] px-4 py-2" style={{ color: "#e87088" }}>{weatherError}</p>}
              <div className="flex gap-2.5 px-4 py-3 overflow-x-auto slim-scroll">
                {weatherLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-28 h-24 rounded-xl animate-pulse" style={{ background: "rgba(30,45,110,0.12)" }} />
                    ))
                  : weatherData.map((city, i) => {
                      const info = city.code !== null ? weatherInfo(city.code) : { icon: "—", label: "—" };
                      const temp = city.temp !== null ? `${Math.round(city.temp)}°C` : "—";
                      const wind = city.windspeed !== null ? `${Math.round(city.windspeed)} km/h` : null;
                      const hum  = city.humidity  !== null ? `${Math.round(city.humidity)}%`  : null;
                      return (
                        <div key={i} className="flex-shrink-0 rounded-xl px-3 py-2.5 flex flex-col gap-1 min-w-[110px] relative overflow-hidden"
                          style={{ background: "rgba(30,45,110,0.12)", border: "1px solid rgba(74,95,168,0.22)", boxShadow: "0 2px 12px rgba(30,45,110,0.2)" }}>
                          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, rgba(74,95,168,0.6), transparent)` }} />
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold truncate max-w-[70px]" style={{ color: "rgba(220,230,255,0.85)" }}>{city.label}</span>
                            <span className="text-base leading-none">{info.icon}</span>
                          </div>
                          <div className="text-[18px] font-black leading-none" style={{ color: "#a4b5ff", fontFamily: "'JetBrains Mono',monospace" }}>{temp}</div>
                          <div className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(164,181,255,0.45)", fontFamily: "monospace" }}>{info.label}</div>
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            {wind && <div className="text-[9px]" style={{ color: "rgba(164,181,255,0.45)" }}>💨 {wind}</div>}
                            {hum  && <div className="text-[9px]" style={{ color: "rgba(164,181,255,0.45)" }}>💧 {hum}</div>}
                          </div>
                        </div>
                      );
                    })
                }
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Node tooltip — brand styled ── */}
      {tooltip && (
        <div className="absolute pointer-events-none z-30 rounded-2xl text-xs"
          style={{
            left: tooltip.x + 18, top: tooltip.y - 16,
            background: "rgba(10,16,42,0.97)",
            border: `1px solid ${STATUS_CSS[tooltip.status] || "#4a5fa8"}55`,
            backdropFilter: "blur(16px)",
            minWidth: 175,
            boxShadow: `0 0 28px ${STATUS_CSS[tooltip.status] || "#4a5fa8"}28, 0 12px 40px rgba(10,16,42,0.6)`,
          }}>
          {/* Brand accent bar */}
          <div className="h-[2px] rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${STATUS_CSS[tooltip.status] || "#4a5fa8"}, rgba(196,30,58,0.6), transparent)` }} />
          <div className="px-3.5 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: STATUS_CSS[tooltip.status], boxShadow: `0 0 10px ${STATUS_CSS[tooltip.status]}` }} />
              <span className="font-black text-[13px]" style={{ color: "#e8ecf8", fontFamily: "'Space Grotesk',sans-serif" }}>{tooltip.label}</span>
            </div>
            <div className="text-[9px] font-black uppercase tracking-[0.18em] mb-2.5 px-1.5 py-0.5 rounded-md inline-block"
              style={{ background: `${STATUS_CSS[tooltip.status]}18`, color: STATUS_CSS[tooltip.status], border: `1px solid ${STATUS_CSS[tooltip.status]}30`, fontFamily: "monospace" }}>
              {tooltip.status}
            </div>
            {showWeather && (() => {
              const city = weatherData.find(c => c.label === tooltip.label);
              if (!city || city.temp === null) return null;
              const info = weatherInfo(city.code);
              return (
                <div className="flex items-center gap-2 mb-2.5 pb-2.5" style={{ borderBottom: "1px solid rgba(74,95,168,0.2)" }}>
                  <span className="text-base">{info.icon}</span>
                  <span className="text-[12px] font-black" style={{ color: "#a4b5ff", fontFamily: "'JetBrains Mono',monospace" }}>{Math.round(city.temp)}°C</span>
                  <span className="text-[9px]" style={{ color: "rgba(164,181,255,0.45)" }}>{info.label}</span>
                </div>
              );
            })()}
            <div className="space-y-1.5" style={{ borderTop: "1px solid rgba(74,95,168,0.12)", paddingTop: 8 }}>
              {[
                { label: "Latency", value: tooltip.latency >= 999 ? "DEAD" : `${tooltip.latency} ms`, color: tooltip.latency >= 500 ? "#ef4444" : tooltip.latency > 80 ? "#f97316" : tooltip.latency > 30 ? "#fbbf24" : "#34d399" },
                { label: "Signal",  value: tooltip.signal === 0 ? "—" : `${tooltip.signal}%`,         color: tooltip.signal === 0 ? "#ef4444" : tooltip.signal < 65 ? "#f97316" : "#34d399" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between gap-4 items-center">
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(164,181,255,0.4)", fontFamily: "monospace" }}>{label}</span>
                  <span className="text-[11px] font-black" style={{ color, fontFamily: "'JetBrains Mono',monospace" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}