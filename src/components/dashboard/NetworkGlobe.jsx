import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// ── Weather city definitions ─────────────────────────────────────────────────
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

// WMO weather code → emoji + label + effect type
function weatherInfo(code) {
  if (code === 0)       return { icon: "☀️",  label: "Clear",         effect: "clear"       };
  if (code <= 2)        return { icon: "⛅",  label: "Partly Cloudy", effect: "partly_cloud" };
  if (code === 3)       return { icon: "☁️",  label: "Overcast",      effect: "cloud"        };
  if (code <= 49)       return { icon: "🌫️",  label: "Fog",           effect: "fog"          };
  if (code <= 57)       return { icon: "🌦️",  label: "Drizzle",       effect: "rain"         };
  if (code <= 67)       return { icon: "🌧️",  label: "Rain",          effect: "rain"         };
  if (code <= 77)       return { icon: "❄️",  label: "Snow",          effect: "snow"         };
  if (code <= 82)       return { icon: "🌧️",  label: "Showers",       effect: "rain"         };
  if (code <= 86)       return { icon: "🌨️",  label: "Snow Showers",  effect: "snow"         };
  if (code <= 99)       return { icon: "⛈️",  label: "Thunderstorm",  effect: "thunder"      };
  return                       { icon: "🌡️",  label: "Unknown",       effect: "none"         };
}

// ── Network node definitions ─────────────────────────────────────────────────
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

function latencyColor(latency, signal) {
  if (signal === 0 || latency >= 500) return new THREE.Color(0xef4444);
  if (latency <= 30 && signal >= 85)  return new THREE.Color(0x34d399);
  if (latency <= 80 && signal >= 65)  return new THREE.Color(0xfbbf24);
  return new THREE.Color(0xf97316);
}

const EARTH_DAY_TEXTURE  = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
const EARTH_BUMP_TEXTURE = "https://unpkg.com/three-globe/example/img/earth-topology.png";
const EARTH_SPEC_TEXTURE = "https://unpkg.com/three-globe/example/img/earth-water.png";

function latLonToVec3(lat, lon, r = 1.02) {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

// ── Build a canvas-based texture for circular cloud/fog blob ─────────────────
function makeRadialTexture(color, alpha = 0.6) {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  g.addColorStop(0, `rgba(${color},${alpha})`);
  g.addColorStop(0.5, `rgba(${color},${(alpha * 0.4).toFixed(2)})`);
  g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

// ── Build weather effect group for a single city ──────────────────────────────
function buildWeatherEffect(lat, lon, effect) {
  const group = new THREE.Group();
  const center = latLonToVec3(lat, lon, 1.015);

  // Helper: face-outward orientation
  const faceOut = (mesh, pos) => {
    mesh.position.copy(pos);
    mesh.lookAt(new THREE.Vector3(0, 0, 0));
    mesh.rotateX(Math.PI);
  };

  if (effect === "clear") {
    // Subtle warm golden glow disc
    const tex  = makeRadialTexture("255,220,80", 0.25);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.22),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide })
    );
    faceOut(mesh, latLonToVec3(lat, lon, 1.016));
    group.add(mesh);
  }

  if (effect === "partly_cloud") {
    // Small semi-transparent white puff
    const tex  = makeRadialTexture("230,240,255", 0.45);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.18, 0.18),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide })
    );
    faceOut(mesh, latLonToVec3(lat, lon, 1.017));
    group.add(mesh);
  }

  if (effect === "cloud" || effect === "fog") {
    const opacity = effect === "fog" ? 0.55 : 0.65;
    const size    = effect === "fog" ? 0.28 : 0.22;
    const color   = effect === "fog" ? "200,200,200" : "220,230,255";
    const tex  = makeRadialTexture(color, opacity);
    // Multiple overlapping cloud puffs for a fluffy look
    for (let k = 0; k < 3; k++) {
      const offLat = lat + (k - 1) * 0.8;
      const offLon = lon + (k - 1) * 0.8;
      const puffPos = latLonToVec3(offLat, offLon, 1.018);
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size * 0.7),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide })
      );
      faceOut(mesh, puffPos);
      group.add(mesh);
    }
  }

  if (effect === "rain") {
    // Cloud base
    const cloudTex = makeRadialTexture("120,150,200", 0.55);
    const cloudMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.24, 0.16),
      new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, depthWrite: false, side: THREE.DoubleSide })
    );
    faceOut(cloudMesh, latLonToVec3(lat, lon, 1.019));
    group.add(cloudMesh);

    // Rain streaks — short blue lines radiating slightly inward from surface
    const outward = center.clone().normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(outward, up).normalize();
    const up2   = new THREE.Vector3().crossVectors(right, outward).normalize();

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r     = 0.04 + Math.random() * 0.06;
      const offset = right.clone().multiplyScalar(Math.cos(angle) * r)
                           .add(up2.clone().multiplyScalar(Math.sin(angle) * r));
      const startPt = center.clone().add(offset).normalize().multiplyScalar(1.022);
      const endPt   = startPt.clone().normalize().multiplyScalar(1.008);

      const geo = new THREE.BufferGeometry().setFromPoints([startPt, endPt]);
      const line = new THREE.Line(geo,
        new THREE.LineBasicMaterial({ color: 0x7ab8f5, transparent: true, opacity: 0.7 })
      );
      line.userData.rainLine = true;
      line.userData.phase    = Math.random() * Math.PI * 2;
      group.add(line);
    }
  }

  if (effect === "snow") {
    // Cloud
    const cloudTex = makeRadialTexture("200,220,240", 0.5);
    const cloudMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.15),
      new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, depthWrite: false, side: THREE.DoubleSide })
    );
    faceOut(cloudMesh, latLonToVec3(lat, lon, 1.019));
    group.add(cloudMesh);

    // Snowflake sprites (tiny white dots)
    const outward = center.clone().normalize();
    const up      = new THREE.Vector3(0, 1, 0);
    const right   = new THREE.Vector3().crossVectors(outward, up).normalize();
    const up2     = new THREE.Vector3().crossVectors(right, outward).normalize();

    for (let i = 0; i < 10; i++) {
      const angle  = (i / 10) * Math.PI * 2;
      const r      = 0.03 + Math.random() * 0.07;
      const offset = right.clone().multiplyScalar(Math.cos(angle) * r)
                          .add(up2.clone().multiplyScalar(Math.sin(angle) * r));
      const pos = center.clone().add(offset).normalize().multiplyScalar(1.015 + Math.random() * 0.006);
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.003, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0xddeeff, transparent: true, opacity: 0.85 })
      );
      dot.position.copy(pos);
      dot.userData.snowDot  = true;
      dot.userData.phase    = Math.random() * Math.PI * 2;
      group.add(dot);
    }
  }

  if (effect === "thunder") {
    // Dark storm cloud
    const cloudTex = makeRadialTexture("60,60,80", 0.7);
    const cloudMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.26, 0.18),
      new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, depthWrite: false, side: THREE.DoubleSide })
    );
    faceOut(cloudMesh, latLonToVec3(lat, lon, 1.019));
    group.add(cloudMesh);

    // Lightning flash disc
    const flashTex  = makeRadialTexture("255,255,160", 0.8);
    const flashMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.14, 0.14),
      new THREE.MeshBasicMaterial({ map: flashTex, transparent: true, depthWrite: false, side: THREE.DoubleSide })
    );
    faceOut(flashMesh, latLonToVec3(lat, lon, 1.020));
    flashMesh.userData.lightning = true;
    flashMesh.userData.phase     = Math.random() * Math.PI * 2;
    group.add(flashMesh);
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
    const d  = arr[i] || {};
    const cw = d.current_weather || {};
    return {
      ...city,
      temp:      cw.temperature  ?? null,
      windspeed: d.hourly?.wind_speed_10m?.[0] ?? cw.windspeed ?? null,
      code:      cw.weathercode  ?? null,
      humidity:  d.hourly?.relative_humidity_2m?.[0]  ?? null,
      feelsLike: d.hourly?.apparent_temperature?.[0]  ?? null,
      is_day:    cw.is_day ?? 1,
    };
  });
}

export default function NetworkGlobe({ nodes = [] }) {
  const mountRef       = useRef(null);
  const sceneRef       = useRef(null);
  const heatmapRef     = useRef(null);
  const weatherGroupRef = useRef(null);   // THREE.Group with all weather effects
  const allRotatingRef = useRef([]);       // kept in sync so animate() always sees latest
  const starsCanvasRef = useRef(null);

  const [tooltip,        setTooltip]        = useState(null);
  const [showHeatmap,    setShowHeatmap]    = useState(false);
  const [showWeather,    setShowWeather]    = useState(false);
  const [weatherData,    setWeatherData]    = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError,   setWeatherError]   = useState(null);

  // ── Load / refresh weather ───────────────────────────────────────────────
  const loadWeather = useCallback(() => {
    setWeatherLoading(true);
    setWeatherError(null);
    fetchWeatherAll()
      .then(data => { setWeatherData(data); setWeatherLoading(false); })
      .catch(() => { setWeatherError("Failed to load weather data."); setWeatherLoading(false); });
  }, []);

  useEffect(() => {
    if (!showWeather) return;
    if (weatherData.length > 0) return;
    loadWeather();
  }, [showWeather]);

  // ── Rebuild weather effects on the globe when data arrives ───────────────
  useEffect(() => {
    const scene = sceneRef.current?.scene;
    if (!scene) return;

    // Remove old weather group
    if (weatherGroupRef.current) {
      scene.remove(weatherGroupRef.current);
      // Remove from rotating array
      allRotatingRef.current = allRotatingRef.current.filter(o => o !== weatherGroupRef.current);
      weatherGroupRef.current = null;
    }

    if (!showWeather || weatherData.length === 0) return;

    const wg = new THREE.Group();
    weatherData.forEach(city => {
      if (city.code === null) return;
      const info  = weatherInfo(city.code);
      const effect = buildWeatherEffect(city.lat, city.lon, info.effect);
      wg.add(effect);
    });

    // Match the current globe rotation so it snaps in sync
    const globeRotY = allRotatingRef.current[0]?.rotation?.y ?? 0;
    wg.rotation.y = globeRotY;

    scene.add(wg);
    weatherGroupRef.current = wg;
    allRotatingRef.current.push(wg);
  }, [weatherData, showWeather]);

  // ── Three.js scene ───────────────────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const width  = mount.clientWidth;
    const height = mount.clientHeight;
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 2.8);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Store scene ref so weather effect builder can access it
    sceneRef.current = { renderer, scene };

    const loader    = new THREE.TextureLoader();
    const earthDay  = loader.load(EARTH_DAY_TEXTURE);
    const earthBump = loader.load(EARTH_BUMP_TEXTURE);
    const earthSpec = loader.load(EARTH_SPEC_TEXTURE);

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({ map: earthDay, bumpMap: earthBump, bumpScale: 0.05, specularMap: earthSpec, specular: new THREE.Color(0x4466aa), shininess: 25 })
    );
    scene.add(globe);
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.02, 32, 32), new THREE.MeshBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.08, side: THREE.BackSide })));
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.10, 32, 32), new THREE.MeshBasicMaterial({ color: 0x2266cc, transparent: true, opacity: 0.04, side: THREE.BackSide })));
    const continentMesh = new THREE.Mesh(new THREE.SphereGeometry(1.004, 64, 64), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
    scene.add(continentMesh);
    const wireMesh = new THREE.Mesh(new THREE.SphereGeometry(1.006, 36, 18), new THREE.MeshBasicMaterial({ color: 0x88aaff, wireframe: true, transparent: true, opacity: 0.04 }));
    scene.add(wireMesh);

    const ring  = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.012, 8, 80), new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.35 }));
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.006, 6, 80), new THREE.MeshBasicMaterial({ color: 0xa5b4fc, transparent: true, opacity: 0.18 }));
    ring2.rotation.x = Math.PI / 6;
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    // Heatmap
    const heatmapGroup = new THREE.Group();
    heatmapGroup.visible = false;
    NODE_PTS.forEach(pt => {
      const center = latLonToVec3(pt.lat, pt.lon, 1.015);
      const col    = latencyColor(pt.latency, pt.signal);
      const blobR  = 0.08 + 0.12 * Math.min(1, (pt.latency > 500 ? 500 : pt.latency) / 500);
      const mesh   = new THREE.Mesh(new THREE.CircleGeometry(blobR, 32), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.38, side: THREE.DoubleSide, depthWrite: false }));
      mesh.position.copy(center); mesh.lookAt(new THREE.Vector3(0,0,0)); mesh.rotateX(Math.PI);
      heatmapGroup.add(mesh);
      const glow = new THREE.Mesh(new THREE.RingGeometry(blobR, blobR + 0.04, 32), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }));
      glow.position.copy(center); glow.lookAt(new THREE.Vector3(0,0,0)); glow.rotateX(Math.PI);
      heatmapGroup.add(glow);
    });
    scene.add(heatmapGroup);
    heatmapRef.current = heatmapGroup;

    // Nodes
    const statusColor = { online: 0x34d399, offline: 0xef4444, degraded: 0xfbbf24, maintenance: 0x818cf8 };
    const dotMeshes   = [];
    const dotGroup    = new THREE.Group();
    NODE_PTS.forEach(pt => {
      const pos = latLonToVec3(pt.lat, pt.lon);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), new THREE.MeshBasicMaterial({ color: statusColor[pt.status] || 0x34d399 }));
      dot.position.copy(pos);
      dot.userData = { label: pt.label, status: pt.status, latency: pt.latency, signal: pt.signal };
      dotGroup.add(dot);
      dotMeshes.push(dot);
      const pulse = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.048, 16), new THREE.MeshBasicMaterial({ color: statusColor[pt.status] || 0x34d399, transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
      pulse.position.copy(pos); pulse.lookAt(new THREE.Vector3(0,0,0));
      dotGroup.add(pulse);
    });
    scene.add(dotGroup);

    // Arcs
    function arcBetween(p1, p2, color = 0x6366f1) {
      const pts = [];
      for (let t2 = 0; t2 <= 1; t2 += 0.04) {
        const v = new THREE.Vector3().lerpVectors(p1, p2, t2);
        v.normalize().multiplyScalar(1.02 + 0.22 * Math.sin(Math.PI * t2));
        pts.push(v);
      }
      return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.004, 4, false), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 }));
    }
    const arcGroup = new THREE.Group();
    [[0,1],[0,3],[1,2],[3,6],[4,5],[6,8],[8,9],[0,10],[1,12],[3,13]].forEach(([a, b]) => {
      if (NODE_PTS[a] && NODE_PTS[b]) arcGroup.add(arcBetween(latLonToVec3(NODE_PTS[a].lat, NODE_PTS[a].lon), latLonToVec3(NODE_PTS[b].lat, NODE_PTS[b].lon)));
    });
    scene.add(arcGroup);

    // Wifi icon
    const wifiGroup = new THREE.Group();
    const wifiMat   = new THREE.MeshPhongMaterial({ color: 0xc7d2fe, emissive: 0xa5b4fc, emissiveIntensity: 1.8, transparent: true, opacity: 1, shininess: 200 });
    function makeWifiArc(radius, tubeR) {
      const pts = [];
      for (let a = Math.PI * 0.18; a <= Math.PI * 0.82; a += 0.035) pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
      return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, tubeR, 8, false), wifiMat);
    }
    wifiGroup.add(makeWifiArc(0.52, 0.024));
    wifiGroup.add(makeWifiArc(0.36, 0.024));
    wifiGroup.add(makeWifiArc(0.20, 0.024));
    const wifiDot = new THREE.Mesh(new THREE.SphereGeometry(0.034, 12, 12), wifiMat);
    wifiDot.position.set(0, -0.08, 0);
    wifiGroup.add(wifiDot);
    wifiGroup.position.set(0, -0.18, 0);
    scene.add(wifiGroup);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sunLight = new THREE.DirectionalLight(0xfff5e0, 3.5);
    sunLight.position.set(3, 1.5, 2);
    scene.add(sunLight);
    const fillLight = new THREE.DirectionalLight(0x8899cc, 0.5);
    fillLight.position.set(-2, -1, -1);
    scene.add(fillLight);

    const baseRotating = [globe, continentMesh, dotGroup, arcGroup, wireMesh, heatmapGroup, wifiGroup];
    allRotatingRef.current = baseRotating;

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouseVec  = new THREE.Vector2();
    let isDragging = false, prevMouse = { x: 0, y: 0 }, rotVel = { x: 0, y: 0.0015 };
    const onMouseDown  = e => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; };
    const onMouseUp    = () => { isDragging = false; };
    const onMouseMove  = e => {
      const rect = mount.getBoundingClientRect();
      mouseVec.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouseVec.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      const worldDots = dotMeshes.map(d => { const c = d.clone(); c.position.copy(d.position).applyMatrix4(dotGroup.matrixWorld); return c; });
      const hits = raycaster.intersectObjects(worldDots);
      if (hits.length > 0) {
        const idx  = worldDots.indexOf(hits[0].object);
        const data = dotMeshes[idx]?.userData;
        if (data) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, ...data });
      } else { setTooltip(null); }
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
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.016;
      const rotating = allRotatingRef.current;
      if (!isDragging) {
        rotVel.y *= 0.98; rotVel.x *= 0.95;
        rotating.forEach(o => { o.rotation.y += 0.0008; });
      } else {
        rotating.forEach(o => { o.rotation.y += rotVel.y; o.rotation.x += rotVel.x; });
      }

      // Pulse network dots
      dotGroup.children.forEach((child, i) => {
        if (child.geometry?.type === "RingGeometry") {
          child.material.opacity = 0.2 + 0.3 * Math.abs(Math.sin(t * 2 + i));
          const s = 1 + 0.3 * Math.abs(Math.sin(t * 1.5 + i));
          child.scale.set(s, s, s);
        }
      });

      // Animate weather particles
      const wg = weatherGroupRef.current;
      if (wg) {
        wg.traverse(child => {
          // Rain lines: flicker opacity
          if (child.userData.rainLine) {
            child.material.opacity = 0.3 + 0.7 * Math.abs(Math.sin(t * 4 + child.userData.phase));
          }
          // Snow dots: gentle float up/down in opacity
          if (child.userData.snowDot) {
            child.material.opacity = 0.4 + 0.5 * Math.abs(Math.sin(t * 1.5 + child.userData.phase));
          }
          // Lightning flash: random burst
          if (child.userData.lightning) {
            const flash = Math.sin(t * 3 + child.userData.phase);
            child.material.opacity = flash > 0.85 ? 0.9 : 0.05;
            if (flash > 0.85) child.userData.phase += 0.8; // stagger next flash
          }
        });
      }

      ring.rotation.z  += 0.002;
      ring2.rotation.z -= 0.001;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => { if (!mount) return; const w = mount.clientWidth, h = mount.clientHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); };
    window.addEventListener("resize", onResize);

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

  useEffect(() => { if (heatmapRef.current) heatmapRef.current.visible = showHeatmap; }, [showHeatmap]);

  // Stars canvas
  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const stars = Array.from({ length: 160 }, (_, i) => ({ x: ((i * 137.5) % 100), y: ((i * 73.1 + 13) % 100), r: 0.4 + (i % 5) * 0.28, phase: Math.random() * Math.PI * 2, speed: 0.6 + Math.random() * 1.2, base: 0.25 + (i % 7) * 0.09 }));
    let raf;
    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const now = performance.now() / 1000;
      stars.forEach(s => { const op = s.base + 0.45 * Math.abs(Math.sin(now * s.speed + s.phase)); ctx.beginPath(); ctx.arc(s.x / 100 * w, s.y / 100 * h, s.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(200,220,255,${op.toFixed(2)})`; ctx.fill(); });
      [[18,22],[72,14],[85,68],[30,80],[60,55]].forEach(([cx,cy]) => {
        const op = 0.45 + 0.55 * Math.abs(Math.sin(now * 0.8 + cx));
        const grad = ctx.createRadialGradient(cx/100*w, cy/100*h, 0, cx/100*w, cy/100*h, 4);
        grad.addColorStop(0, `rgba(165,180,252,${op.toFixed(2)})`); grad.addColorStop(1, "rgba(165,180,252,0)");
        ctx.beginPath(); ctx.arc(cx/100*w, cy/100*h, 4, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener("resize", resize); draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  const statusLabel  = { online: "Online", offline: "Offline", degraded: "Degraded", maintenance: "Maintenance" };
  const statusColors = { online: "#34d399", offline: "#ef4444", degraded: "#fbbf24", maintenance: "#818cf8" };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl" style={{ minHeight: 520 }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 40%, #0a1628 0%, #050d1a 50%, #020810 100%)" }}>
        <canvas ref={starsCanvasRef} className="absolute inset-0 w-full h-full opacity-90" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 55% 45% at 15% 25%, rgba(6,182,212,0.07) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 85% 75%, rgba(99,102,241,0.09) 0%, transparent 65%)" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: "linear-gradient(to top, rgba(6,182,212,0.06) 0%, transparent 100%)" }} />
      </div>

      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* ── Controls ─────────────────────────────────────────────────── */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <button
          onClick={() => setShowHeatmap(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
          style={{ background: showHeatmap ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.75)", border: `1px solid ${showHeatmap ? "rgba(239,68,68,0.4)" : "rgba(99,102,241,0.3)"}`, color: showHeatmap ? "#dc2626" : "#6366f1", backdropFilter: "blur(6px)", boxShadow: "0 2px 8px rgba(99,102,241,0.1)" }}>
          <span className={`w-1.5 h-1.5 rounded-full ${showHeatmap ? "bg-red-400" : "bg-indigo-400"}`} />
          {showHeatmap ? "Heatmap ON" : "Heatmap"}
        </button>
        <button
          onClick={() => setShowWeather(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
          style={{ background: showWeather ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.75)", border: `1px solid ${showWeather ? "rgba(6,182,212,0.5)" : "rgba(6,182,212,0.3)"}`, color: "#0891b2", backdropFilter: "blur(6px)", boxShadow: "0 2px 8px rgba(6,182,212,0.1)" }}>
          <span className="text-sm">🌍</span>
          {showWeather ? "Weather ON" : "Weather"}
        </button>
      </div>

      {/* ── Heatmap Legend ────────────────────────────────────────────── */}
      {showHeatmap && !showWeather && (
        <div className="absolute bottom-3 left-3 z-20 px-3 py-2 rounded-lg flex flex-col gap-1.5" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(99,102,241,0.2)", backdropFilter: "blur(6px)", boxShadow: "0 2px 12px rgba(99,102,241,0.1)" }}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Latency / Signal</p>
          {[{ color: "#34d399", label: "Excellent ≤30ms / ≥85%" }, { color: "#fbbf24", label: "Fair ≤80ms / ≥65%" }, { color: "#f97316", label: "Poor >80ms / <65%" }, { color: "#ef4444", label: "Dead offline / no signal" }].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}88` }} />
              <span className="text-[10px] text-slate-600">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Live Weather Panel ───────────────────────────────────────── */}
      {showWeather && (
        <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden"
          style={{ background: "rgba(5,13,26,0.88)", borderTop: "1px solid rgba(6,182,212,0.25)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: "rgba(6,182,212,0.15)" }}>
            <div className="flex items-center gap-2">
              <span className="text-sm">🌍</span>
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#06b6d4" }}>Live Global Weather</span>
              {weatherLoading && <span className="text-[10px] animate-pulse" style={{ color: "#94a3b8" }}>Loading…</span>}
              {!weatherLoading && weatherData.length > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" }}>LIVE · Visual effects on globe</span>
              )}
            </div>
            {!weatherLoading && (
              <button onClick={() => { setWeatherData([]); loadWeather(); }}
                className="text-[10px] px-2 py-0.5 rounded" style={{ color: "#06b6d4", border: "1px solid rgba(6,182,212,0.25)", background: "rgba(6,182,212,0.06)" }}>
                ↻ Refresh
              </button>
            )}
          </div>
          {weatherError && <p className="text-[11px] text-red-400 px-4 py-2">{weatherError}</p>}
          <div className="flex gap-3 overflow-x-auto px-4 py-3" style={{ scrollbarWidth: "none" }}>
            {weatherLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-28 h-24 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
                ))
              : weatherData.map((city, i) => {
                  const info  = city.code !== null ? weatherInfo(city.code) : { icon: "—", label: "—" };
                  const temp  = city.temp !== null ? `${Math.round(city.temp)}°C` : "—";
                  const wind  = city.windspeed !== null ? `${Math.round(city.windspeed)} km/h` : null;
                  const hum   = city.humidity  !== null ? `${Math.round(city.humidity)}%`  : null;
                  return (
                    <div key={i} className="flex-shrink-0 rounded-xl px-3 py-2.5 flex flex-col gap-1 min-w-[110px]"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(6,182,212,0.15)", boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold truncate max-w-[70px]" style={{ color: "#e2e8f0" }}>{city.label}</span>
                        <span className="text-lg leading-none">{info.icon}</span>
                      </div>
                      <div className="text-[20px] font-black leading-none" style={{ color: "#06b6d4", fontFamily: "'JetBrains Mono',monospace" }}>{temp}</div>
                      <div className="text-[9px]" style={{ color: "#64748b" }}>{info.label}</div>
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        {wind && <div className="text-[9px]" style={{ color: "#475569" }}>💨 {wind}</div>}
                        {hum  && <div className="text-[9px]" style={{ color: "#475569" }}>💧 {hum}</div>}
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>
      )}

      {/* ── Node tooltip ─────────────────────────────────────────────── */}
      {tooltip && (
        <div className="absolute pointer-events-none z-30 px-3 py-2 rounded-lg text-xs font-medium shadow-lg"
          style={{ left: tooltip.x + 14, top: tooltip.y - 10, background: "rgba(255,255,255,0.95)", border: `1px solid ${statusColors[tooltip.status] || "#6366f1"}`, color: "#1e293b", backdropFilter: "blur(4px)", minWidth: 160, boxShadow: "0 4px 20px rgba(99,102,241,0.15)" }}>
          <div className="font-semibold text-slate-800 mb-1">{tooltip.label}</div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColors[tooltip.status] }} />
            <span style={{ color: statusColors[tooltip.status] }}>{statusLabel[tooltip.status] || tooltip.status}</span>
          </div>
          {showWeather && (() => {
            const city = weatherData.find(c => c.label === tooltip.label);
            if (!city || city.temp === null) return null;
            const info = weatherInfo(city.code);
            return (
              <div className="mt-1 pt-1 flex items-center gap-2" style={{ borderTop: "1px solid rgba(99,102,241,0.15)" }}>
                <span className="text-base">{info.icon}</span>
                <span className="text-[11px] font-bold" style={{ color: "#0891b2" }}>{Math.round(city.temp)}°C</span>
                <span className="text-[10px]" style={{ color: "#64748b" }}>{info.label}</span>
              </div>
            );
          })()}
          <div className="space-y-0.5 text-[10px] font-mono mt-1" style={{ borderTop: "1px solid rgba(99,102,241,0.2)", paddingTop: 4 }}>
            <div className="flex justify-between gap-4"><span className="text-slate-400">Latency</span>
              <span style={{ color: tooltip.latency >= 500 ? "#ef4444" : tooltip.latency > 80 ? "#f97316" : tooltip.latency > 30 ? "#fbbf24" : "#34d399" }}>
                {tooltip.latency >= 999 ? "—" : `${tooltip.latency} ms`}
              </span>
            </div>
            <div className="flex justify-between gap-4"><span className="text-slate-400">Signal</span>
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