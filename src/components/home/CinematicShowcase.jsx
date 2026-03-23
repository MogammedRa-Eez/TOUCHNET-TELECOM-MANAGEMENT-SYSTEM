import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Wifi, BarChart3, Network, Users, Shield, Activity, Zap, Globe } from "lucide-react";

const SLIDES = [
  {
    id: 0,
    image: "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/631fb93cf_generated_image.png",
    tag: "FIBRE INFRASTRUCTURE",
    title: "Built on Pure Fibre",
    subtitle: "TouchNet deploys, monitors and manages fibre infrastructure across South Africa — from the first survey to full go-live, every step tracked in real time.",
    accent: "#06b6d4",
    glow: "rgba(6,182,212,0.35)",
    gradient: "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.02))",
    icon: Wifi,
    stat: { value: "99.9%", label: "Uptime SLA" },
  },
  {
    id: 1,
    image: "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/83b55f11a_generated_image.png",
    tag: "NETWORK OPERATIONS",
    title: "Eyes on Every Node",
    subtitle: "Live network topology maps, per-node health dashboards, bandwidth utilisation graphs and instant alerting — all unified in the TouchNet TMS control centre.",
    accent: "#6366f1",
    glow: "rgba(99,102,241,0.35)",
    gradient: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.02))",
    icon: Activity,
    stat: { value: "< 2 min", label: "Alert Response" },
  },
  {
    id: 2,
    image: "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/e3ad5454a_generated_image.png",
    tag: "CORE BACKBONE",
    title: "Powering Connectivity",
    subtitle: "High-capacity fibre backbone infrastructure designed for resilience. TouchNet's network core delivers enterprise-grade throughput with full redundancy at every layer.",
    accent: "#8b5cf6",
    glow: "rgba(139,92,246,0.35)",
    gradient: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.02))",
    icon: Zap,
    stat: { value: "10 Gbps", label: "Core Capacity" },
  },
  {
    id: 3,
    image: "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/02a300a58_generated_image.png",
    tag: "SMART CITY COVERAGE",
    title: "Connecting Communities",
    subtitle: "From Johannesburg to Cape Town, TouchNet's fibre network connects businesses, homes and public infrastructure — managed end-to-end through one intelligent platform.",
    accent: "#10b981",
    glow: "rgba(16,185,129,0.35)",
    gradient: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.02))",
    icon: Globe,
    stat: { value: "500+", label: "Active Clients" },
  },
];

const FEATURE_PILLS = [
  { icon: BarChart3, label: "Revenue Analytics" },
  { icon: Users,     label: "Customer Portal" },
  { icon: Shield,    label: "Role-Based Access" },
  { icon: Network,   label: "Project Tracking" },
];

const DURATION = 8000; // 8 seconds per slide

export default function CinematicShowcase() {
  const [current, setCurrent]   = useState(0);
  const [prev, setPrev]         = useState(null);
  const [phase, setPhase]       = useState("idle"); // "idle" | "exit" | "enter"
  const [progress, setProgress] = useState(0);
  const [glitch, setGlitch]     = useState(false);
  const timerRef    = useRef(null);
  const progressRef = useRef(null);
  const progressVal = useRef(0);

  const startProgress = () => {
    progressVal.current = 0;
    setProgress(0);
    clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      progressVal.current += 100 / (DURATION / 50);
      setProgress(Math.min(progressVal.current, 100));
    }, 50);
  };

  const transitionTo = (nextIdx) => {
    if (phase !== "idle") return;
    clearTimeout(timerRef.current);
    clearInterval(progressRef.current);

    // Glitch flash
    setGlitch(true);
    setTimeout(() => setGlitch(false), 120);

    setPhase("exit");
    setPrev(current);

    setTimeout(() => {
      setCurrent(nextIdx);
      setPhase("enter");
      setTimeout(() => {
        setPhase("idle");
        startProgress();
      }, 600);
    }, 300);
  };

  const scheduleNext = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      transitionTo((current + 1) % SLIDES.length);
    }, DURATION);
  };

  useEffect(() => {
    startProgress();
    scheduleNext();
    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
    };
  }, [current]);

  const slide = SLIDES[current];
  const Icon  = slide.icon;

  const imgStyle = {
    idle:  { opacity: 1, transform: "scale(1.06)",      transition: "transform 8s linear, opacity 0.1s" },
    exit:  { opacity: 0, transform: "scale(1.12) translateX(-12px)", transition: "all 0.3s ease-in" },
    enter: { opacity: 1, transform: "scale(1.0)",       transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" },
  };

  const textStyle = {
    idle:  { opacity: 1,  transform: "translateY(0px)",   transition: "all 0.5s ease" },
    exit:  { opacity: 0,  transform: "translateY(12px)",  transition: "all 0.25s ease-in" },
    enter: { opacity: 1,  transform: "translateY(0px)",   transition: "all 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s" },
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto" style={{ perspective: "1200px" }}>

      {/* Outer glow ring */}
      <div
        className="absolute -inset-[2px] rounded-3xl pointer-events-none z-10"
        style={{
          background: `linear-gradient(135deg, ${slide.accent}60, transparent 40%, ${slide.accent}30)`,
          transition: "background 0.8s ease",
          filter: "blur(1px)",
        }}
      />

      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          boxShadow: `0 0 100px ${slide.glow}, 0 40px 80px rgba(0,0,0,0.7)`,
          transition: "box-shadow 0.8s ease",
        }}
      >
        {/* ── IMAGE LAYER ── */}
        <div className="relative h-[360px] sm:h-[500px] overflow-hidden" style={{ background: "#030712" }}>
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={imgStyle[phase]}
          />

          {/* Glitch overlay */}
          {glitch && (
            <div className="absolute inset-0 z-20 pointer-events-none" style={{
              background: `${slide.accent}18`,
              animation: "none",
              mixBlendMode: "screen",
            }} />
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to top, rgba(3,7,18,0.97) 0%, rgba(3,7,18,0.5) 45%, rgba(3,7,18,0.1) 100%)"
          }} />
          <div className="absolute inset-0" style={{
            background: `radial-gradient(ellipse at 80% 50%, ${slide.accent}08 0%, transparent 60%)`,
            transition: "background 0.8s ease",
          }} />

          {/* Scanlines */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)",
          }} />

          {/* Corner HUD brackets */}
          {[
            { top: 16, left: 16,  borderW: "2px 0 0 2px" },
            { top: 16, right: 16, borderW: "2px 2px 0 0" },
            { bottom: 16, left: 16,  borderW: "0 0 2px 2px" },
            { bottom: 16, right: 16, borderW: "0 2px 2px 0" },
          ].map((pos, i) => (
            <div key={i} className="absolute w-5 h-5 pointer-events-none"
              style={{ ...pos, borderStyle: "solid", borderColor: `${slide.accent}80`, borderWidth: pos.borderW, transition: "border-color 0.6s ease" }} />
          ))}

          {/* TOP TAG */}
          <div className="absolute top-5 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full z-10"
            style={{
              background: `${slide.accent}18`,
              border: `1px solid ${slide.accent}50`,
              backdropFilter: "blur(12px)",
              transition: "all 0.6s ease",
            }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: slide.accent, boxShadow: `0 0 6px ${slide.accent}` }} />
            <span className="text-[10px] font-black tracking-[0.18em] uppercase" style={{ color: slide.accent }}>{slide.tag}</span>
          </div>

          {/* TOP RIGHT: TOUCHNET badge */}
          <div className="absolute top-5 right-6 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>
            <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase" style={{ fontFamily: "monospace" }}>TOUCHNET · TMS</span>
          </div>

          {/* NAV ARROWS */}
          {[-1, 1].map(dir => (
            <button key={dir}
              onClick={() => transitionTo((current + dir + SLIDES.length) % SLIDES.length)}
              className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all hover:scale-110 active:scale-95"
              style={{
                [dir === -1 ? "left" : "right"]: 16,
                background: "rgba(0,0,0,0.55)",
                border: `1px solid ${slide.accent}40`,
                backdropFilter: "blur(12px)",
                boxShadow: `0 0 16px ${slide.accent}20`,
                transition: "all 0.3s ease",
              }}>
              {dir === -1
                ? <ChevronLeft  className="w-4 h-4 text-white" />
                : <ChevronRight className="w-4 h-4 text-white" />}
            </button>
          ))}

          {/* BOTTOM CONTENT */}
          <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-8 pb-7 z-10">

            {/* Feature pills */}
            <div className="hidden sm:flex flex-wrap gap-2 mb-5">
              {FEATURE_PILLS.map(p => {
                const PIcon = p.icon;
                return (
                  <div key={p.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                    <PIcon className="w-3 h-3 text-slate-300" />
                    <span className="text-[11px] text-slate-300 font-semibold">{p.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Main text + stat */}
            <div className="flex items-end justify-between gap-4" style={textStyle[phase]}>
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${slide.accent}22`, border: `1px solid ${slide.accent}55` }}>
                    <Icon className="w-4 h-4" style={{ color: slide.accent }} />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">{slide.title}</h3>
                </div>
                <p className="text-sm sm:text-[15px] text-slate-300 max-w-2xl leading-relaxed">{slide.subtitle}</p>
              </div>

              {/* Stat chip */}
              <div className="hidden sm:flex flex-col items-center px-5 py-3 rounded-2xl flex-shrink-0"
                style={{
                  background: `${slide.accent}12`,
                  border: `1px solid ${slide.accent}40`,
                  backdropFilter: "blur(12px)",
                }}>
                <span className="text-2xl font-black" style={{ color: slide.accent }}>{slide.stat.value}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 font-semibold tracking-wider uppercase">{slide.stat.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── PROGRESS BAR ROW ── */}
        <div className="flex gap-0 divide-x divide-white/[0.04]"
          style={{ background: "#030712", borderTop: `1px solid ${slide.accent}20`, transition: "border-color 0.6s ease" }}>
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => transitionTo(i)}
              className="flex-1 px-4 py-3.5 text-left group transition-colors hover:bg-white/[0.03]"
            >
              <div className="h-[2px] rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: i < current ? "100%" : i === current ? `${progress}%` : "0%",
                    background: i === current
                      ? `linear-gradient(90deg, ${s.accent}, ${s.accent}cc)`
                      : i < current ? "rgba(255,255,255,0.3)" : "transparent",
                    transition: i === current ? "none" : "width 0.4s ease",
                    boxShadow: i === current ? `0 0 8px ${s.accent}` : "none",
                  }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full flex-shrink-0"
                  style={{ background: i === current ? s.accent : "rgba(255,255,255,0.2)", transition: "background 0.4s ease" }} />
                <p className="text-[10px] font-bold tracking-widest uppercase truncate transition-colors"
                  style={{ color: i === current ? s.accent : "rgba(255,255,255,0.2)", transition: "color 0.4s ease" }}>
                  {s.tag}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}