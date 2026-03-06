import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function NetworkGlobe({ nodes = [] }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 2.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Globe
    const globeGeo = new THREE.SphereGeometry(1, 64, 64);
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x0a1628,
      emissive: 0x0d1f3c,
      shininess: 80,
      transparent: true,
      opacity: 0.95,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // Wireframe overlay
    const wireGeo = new THREE.SphereGeometry(1.005, 24, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    scene.add(new THREE.Mesh(wireGeo, wireMat));

    // Glowing atmosphere
    const atmGeo = new THREE.SphereGeometry(1.12, 32, 32);
    const atmMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(atmGeo, atmMat));

    // Outer glow ring
    const ringGeo = new THREE.TorusGeometry(1.18, 0.012, 8, 80);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.35 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Second ring tilted
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.22, 0.006, 6, 80),
      new THREE.MeshBasicMaterial({ color: 0xa5b4fc, transparent: true, opacity: 0.18 })
    );
    ring2.rotation.x = Math.PI / 6;
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    // Helper: lat/lon to 3D
    function latLonToVec3(lat, lon, r = 1.02) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }

    // Simulated node positions (Africa/southern hemisphere focused)
    const nodePts = [
      { lat: -26.2, lon: 28.0, status: "online" },
      { lat: -33.9, lon: 18.4, status: "online" },
      { lat: -29.8, lon: 31.0, status: "degraded" },
      { lat: -25.7, lon: 28.3, status: "online" },
      { lat: -23.0, lon: 29.5, status: "offline" },
      { lat: -22.9, lon: 30.4, status: "online" },
      { lat: -24.5, lon: 26.8, status: "online" },
      { lat: -28.0, lon: 26.5, status: "maintenance" },
      { lat: -26.7, lon: 27.1, status: "online" },
      { lat: -27.5, lon: 29.9, status: "online" },
      // extra decorative points globally
      { lat: 40.7, lon: -74.0, status: "online" },
      { lat: 51.5, lon: -0.1, status: "online" },
      { lat: 35.7, lon: 139.7, status: "online" },
      { lat: -23.5, lon: -46.6, status: "online" },
      { lat: 1.3, lon: 103.8, status: "online" },
    ];

    const statusColor = {
      online: 0x34d399,
      offline: 0xef4444,
      degraded: 0xfbbf24,
      maintenance: 0x818cf8,
    };

    const dotGroup = new THREE.Group();
    nodePts.forEach((pt) => {
      const pos = latLonToVec3(pt.lat, pt.lon);
      const dotGeo = new THREE.SphereGeometry(0.022, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color: statusColor[pt.status] || 0x34d399 });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      dotGroup.add(dot);

      // Pulse ring
      const pulseGeo = new THREE.RingGeometry(0.03, 0.048, 16);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: statusColor[pt.status] || 0x34d399,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      });
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      pulse.position.copy(pos);
      pulse.lookAt(new THREE.Vector3(0, 0, 0));
      dotGroup.add(pulse);
    });
    scene.add(dotGroup);

    // Connection arcs between nearby nodes
    function arcBetween(p1, p2, color = 0x6366f1) {
      const pts = [];
      for (let t = 0; t <= 1; t += 0.04) {
        const v = new THREE.Vector3().lerpVectors(p1, p2, t);
        v.normalize().multiplyScalar(1.02 + 0.22 * Math.sin(Math.PI * t));
        pts.push(v);
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.TubeGeometry(curve, 20, 0.004, 4, false);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 });
      return new THREE.Mesh(geo, mat);
    }

    const arcPairs = [[0,1],[0,3],[1,2],[3,6],[4,5],[6,8],[8,9],[0,10],[1,12],[3,13]];
    const arcGroup = new THREE.Group();
    arcPairs.forEach(([a, b]) => {
      if (nodePts[a] && nodePts[b]) {
        const p1 = latLonToVec3(nodePts[a].lat, nodePts[a].lon);
        const p2 = latLonToVec3(nodePts[b].lat, nodePts[b].lon);
        arcGroup.add(arcBetween(p1, p2));
      }
    });
    scene.add(arcGroup);

    // Lighting
    scene.add(new THREE.AmbientLight(0x334155, 2));
    const dirLight = new THREE.DirectionalLight(0x6366f1, 3);
    dirLight.position.set(2, 2, 2);
    scene.add(dirLight);
    const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 1.5);
    dirLight2.position.set(-2, -1, -1);
    scene.add(dirLight2);

    // Mouse drag
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotVel = { x: 0, y: 0.0015 };

    const onMouseDown = (e) => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; };
    const onMouseUp = () => { isDragging = false; };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      rotVel.y = dx * 0.005;
      rotVel.x = dy * 0.005;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    mount.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    let frameId;
    let t = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.016;

      // Auto-rotate
      if (!isDragging) {
        rotVel.y *= 0.98;
        rotVel.x *= 0.95;
        globe.rotation.y += 0.0008;
        dotGroup.rotation.y += 0.0008;
        arcGroup.rotation.y += 0.0008;
        wireGeo && scene.children.forEach(c => {
          if (c.geometry?.type === "SphereGeometry" && c.material?.wireframe) {
            c.rotation.y += 0.0008;
          }
        });
      } else {
        globe.rotation.y += rotVel.y;
        globe.rotation.x += rotVel.x;
        dotGroup.rotation.y += rotVel.y;
        dotGroup.rotation.x += rotVel.x;
        arcGroup.rotation.y += rotVel.y;
        arcGroup.rotation.x += rotVel.x;
      }

      // Pulse rings animation
      dotGroup.children.forEach((child, i) => {
        if (child.geometry?.type === "RingGeometry") {
          child.material.opacity = 0.2 + 0.3 * Math.abs(Math.sin(t * 2 + i));
          const s = 1 + 0.3 * Math.abs(Math.sin(t * 1.5 + i));
          child.scale.set(s, s, s);
        }
      });

      ring.rotation.z += 0.002;
      ring2.rotation.z -= 0.001;

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    sceneRef.current = { renderer, frameId };

    return () => {
      cancelAnimationFrame(frameId);
      mount.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {/* Logo centered over the globe */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/8e5c8dcd8_generated_image.png"
          alt="TouchNet Crest"
          className="w-24 h-24 object-contain"
          style={{ filter: "drop-shadow(0 0 12px rgba(192,21,42,0.6))", mixBlendMode: "multiply" }}
          onError={(e) => {
            // fallback to the TouchNet logo if PDF doesn't render as image
            e.target.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";
            e.target.style.filter = "brightness(0) invert(1) drop-shadow(0 0 12px rgba(192,21,42,0.6))";
          }}
        />
      </div>
    </div>
  );
}