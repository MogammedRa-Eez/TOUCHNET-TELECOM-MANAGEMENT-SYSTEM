import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, Wifi, BarChart3, Network,
  Users, Shield, Activity, Zap, Globe, Server, Cpu
} from "lucide-react";

const SLIDES = [
  {
    id: 0,
    image: "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/631fb93cf_generated_image.png",
    tag: "FIBRE INFRASTRUCTURE",
    tagline: "NETWORK · LAYER 1",
    title: "Built on Pure Fibre",
    subtitle: "TouchNet designs, deploys and manages fibre infrastructure across South Africa — from the first feasibility survey to full go-live, every stage tracked and approved in real time through a single intelligent platform.",
    accent: "#06b6d4",
    accentDim: "rgba(6,182,212,0.18)",
    glow: "rgba(6,182,212,0.4)",
    icon: Wifi,
    stat: { value: "99.9%", label: "Network Uptime" },
    bullets: ["Last-mile fibre delivery", "Full OLT management", "Milestone-based tracking"],
  },
  {
    id: 1,
    image: "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/83b55f11a_generated_image.png",
    tag: "NETWORK OPERATIONS",
    tagline: "MONITORING · 24/7",
    title: "Eyes on Every Node",
    subtitle: "Live topology maps, per-node health scores, bandwidth utilisation graphs and instant multi-channel alerting — the TouchNet NOC dashboard gives your operations team total visibility into the network at all times.",
    accent: "#6366f1",
    accentDim: "rgba(99,102,241,0.18)",
    glow: "rgba(99,102,241,0.4)",
    icon: Activity,
    stat: { value: "< 2 min", label: "Alert Response" },
    bullets: ["Real-time node health", "Threshold-based alerts", "Bandwidth analytics"],
  },
  {
    id: 2,
    image: "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/e3ad5454a_generated_image.png",
    tag: "CORE BACKBONE",
    tagline: "CAPACITY · 10 GBPS",
    title: "Powering the Edge",
    subtitle: "A high-capacity, fully redundant fibre backbone engineered for enterprise throughput. TouchNet's core network is built to scale with South Africa's fastest-growing ISPs and enterprise clients without compromise.",
    accent: "#8b5cf6",
    accentDim: "rgba(139,92,246,0.18)",
    glow: "rgba(139,92,246,0.4)",
    icon: Zap,
    stat: { value: "10 Gbps", label: "Core Throughput" },
    bullets: ["N+1 redundancy", "Multi-PoP architecture", "Low-latency routing"],
  },
  {
    id: 3,
    image: "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/02a300a58_generated_image.png",
    tag: "SMART CITY COVERAGE",
    tagline: "COVERAGE · NATIONAL",
    title: "Connecting Communities",
    subtitle: "From Johannesburg to Cape Town, TouchNet's expanding fibre grid connects businesses, residential complexes and public infrastructure — managed end-to-end through one intelligent, cloud-native operations platform.",
    accent: "#10b981",
    accentDim: "rgba(16,185,129,0.18)",
    glow: "rgba(16,185,129,0.4)",
    icon: Globe,
    stat: { value: "500+", label: "Active Clients" },
    bullets: ["Metro & suburban reach", "ISP & enterprise ready", "24/7 field support"],
  },
  {
    id: 4,
    image: "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/486c3c913_generated_image.png",
    tag: "CUSTOMER PLATFORM",
    tagline: "PORTAL · SELF-SERVICE",
    title: "Your Customers, Empowered",
    subtitle: "The TouchNet Customer Portal gives every client a real-time window into their service — live project milestones, billing history, support tickets and account management, beautifully delivered from a single self-service hub.",
    accent: "#f59e0b",
    accentDim: "rgba(245,158,11,0.18)",
    glow: "rgba(245,158,11,0.4)",
    icon: Users,
    stat: { value: "24/7", label: "Self-Service Access" },
    bullets: ["Project milestone tracking", "Invoice & payment history", "Instant support ticketing"],
  },
];

const DURATION = 9000;

// Horizontal scan line that loops top to bottom
function ScanBeam({ color }) {
  const [y, setY] = useState(-2);
  useEffect(() => {
    let raf;
    let pos = -2;
    const step = () => {
      pos += 0.18;
      if (pos > 102) pos = -2;
      setY(pos);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div
      className="absolute left-0 right-0 pointer-events-none z-10"
      style={{
        top: `${y}%`,
        height: 2,
        background: `linear-gradient(90deg, transparent 0%, ${color}55 20%, ${color}99 50%, ${color}55 80%, transparent 100%)`,
        filter: `blur(1px)`,
        transition: "background 0.6s ease",
      }}
    />
  );
}

export default function CinematicShowcase() {
  const [current, setCurrent]     = useState(0);
  const [phase, setPhase]         = useState("idle");
  const [progress, setProgress]   = useState(0);
  const [glitchOn, setGlitchOn]   = useState(false);
  const progressRef  = useRef(null);
  const progressVal  = useRef(0);
  const transiting   = useRef(false);

  const startProgress = useCallback(() => {
    progressVal.current = 0;
    setProgress(0);
    clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      progressVal.current += 100 / (DURATION / 60);
      if (progressVal.current >= 100) {
        clearInterval(progressRef.current);
        progressVal.current = 100;
      }
      setProgress(Math.min(progressVal.current, 100));
    }, 60);
  }, []);

  const transitionTo = useCallback((nextIdx) => {
    if (transiting.current) return;
    transiting.current = true;
    clearInterval(progressRef.current);

    // glitch flash
    setGlitchOn(true);
    setTimeout(() => setGlitchOn(false), 150);

    setPhase("exit");
    setTimeout(() => {
      setCurrent(nextIdx);
      setPhase("enter");
      setTimeout(() => {
        setPhase("idle");
        startProgress();
        transiting.current = false;
      }, 700);
    }, 350);
  }, [startProgress]);

  // Auto-advance — continuous loop
  useEffect(() => {
    startProgress();
    const interval = setInterval(() => {
      setCurrent(prev => {
        const next = (prev + 1) % SLIDES.length;
        transitionTo(next);
        return prev; // setCurrent handled inside transitionTo
      });
    }, DURATION);
    return () => {
      clearInterval(interval);
      clearInterval(progressRef.current);
    };
  }, []); // eslint-disable-line

  const slide  = SLIDES[current];
  const Icon   = slide.icon;

  // Per-phase image animation
  const imgTransform = {
    idle:  "scale(1.07) translateX(0px)",
    exit:  "scale(1.13) translateX(-16px)",
    enter: "scale(1.0)  translateX(0px)",
  }[phase];
  const imgOpacity = phase === "exit" ? 0 : 1;
  const imgTransition = phase === "enter"
    ? "opacity 0.7s ease, transform 9s linear"
    : "opacity 0.35s ease-in, transform 0.35s ease-in";

  const textY = phase === "exit" ? "16px" : "0px";
  const textOpacity = phase === "exit" ? 0 : 1;
  const textTransition = phase === "exit"
    ? "opacity 0.25s ease-in, transform 0.25s ease-in"
    : "opacity 0.6s cubic-bezier(0.16,1,0.3,1) 0.25s, transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.25s";

  return (
    <div className="relative w-full max-w-5xl mx-auto select-none" style={{ perspective: "1400px" }}>

      {/* Ambient outer glow */}
      <div
        className="absolute -inset-[3px] rounded-3xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${slide.accent}50 0%, transparent 45%, ${slide.accent}20 100%)`,
          filter: "blur(2px)",
          transition: "background 1s ease",
          zIndex: 0,
        }}
      />
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          boxShadow: `0 0 120px ${slide.glow}, 0 60px 120px rgba(0,0,0,0.8)`,
          transition: "box-shadow 1s ease",
          zIndex: 0,
        }}
      />

      <div className="relative rounded-3xl overflow-hidden" style={{ zIndex: 1 }}>

        {/* ══ IMAGE VIEWPORT ══ */}
        <div className="relative h-[380px] sm:h-[520px] overflow-hidden" style={{ background: "#020810" }}>

          {/* Actual image */}
          <img
            key={current}
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: imgOpacity, transform: imgTransform, transition: imgTransition, willChange: "transform, opacity" }}
          />

          {/* Glitch flash layer */}
          <div className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-75"
            style={{ background: `${slide.accent}25`, opacity: glitchOn ? 1 : 0, mixBlendMode: "screen" }} />

          {/* Vignette + bottom dark fade */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "linear-gradient(to top, rgba(2,8,16,0.98) 0%, rgba(2,8,16,0.55) 40%, rgba(2,8,16,0.08) 75%, transparent 100%)"
          }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "linear-gradient(to right, rgba(2,8,16,0.45) 0%, transparent 30%, transparent 70%, rgba(2,8,16,0.35) 100%)"
          }} />

          {/* Colour tint accent */}
          <div className="absolute inset-0 pointer-events-none transition-all duration-1000" style={{
            background: `radial-gradient(ellipse at 75% 35%, ${slide.accent}10 0%, transparent 55%)`,
          }} />

          {/* Scanline overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 3px)",
          }} />

          {/* Animated scan beam */}
          <ScanBeam color={slide.accent} />

          {/* HUD corner brackets */}
          {[
            { top: 14, left: 14, style: "2px 0 0 2px" },
            { top: 14, right: 14, style: "2px 2px 0 0" },
            { bottom: 14, left: 14, style: "0 0 2px 2px" },
            { bottom: 14, right: 14, style: "0 2px 2px 0" },
          ].map((b, i) => (
            <div key={i} className="absolute w-6 h-6 pointer-events-none transition-all duration-700"
              style={{
                top: b.top, bottom: b.bottom, left: b.left, right: b.right,
                borderStyle: "solid",
                borderColor: `${slide.accent}90`,
                borderWidth: b.style,
              }} />
          ))}

          {/* ── TOP-LEFT TAG ── */}
          <div className="absolute top-5 left-6 z-10 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: `${slide.accent}18`, border: `1px solid ${slide.accent}55`, backdropFilter: "blur(16px)" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: slide.accent, boxShadow: `0 0 8px ${slide.accent}` }} />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: slide.accent }}>{slide.tag}</span>
            </div>
          </div>

          {/* ── TOP-RIGHT TOUCHNET badge ── */}
          <div className="absolute top-5 right-6 z-10 flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(16px)" }}>
              <Cpu className="w-3 h-3 text-white/40" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/40" style={{ fontFamily: "monospace" }}>TOUCHNET · TMS v2</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: "0 0 6px #34d399" }} />
              <span className="text-[9px] font-bold text-emerald-400 tracking-widest uppercase" style={{ fontFamily: "monospace" }}>NETWORK LIVE</span>
            </div>
          </div>

          {/* ── NAV BUTTONS ── */}
          {[{ dir: -1, pos: "left-4" }, { dir: 1, pos: "right-4" }].map(({ dir, pos }) => (
            <button key={dir}
              onClick={() => transitionTo((current + dir + SLIDES.length) % SLIDES.length)}
              className={`absolute top-1/2 -translate-y-1/2 ${pos} z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95`}
              style={{
                background: "rgba(0,0,0,0.5)",
                border: `1px solid ${slide.accent}45`,
                backdropFilter: "blur(16px)",
                boxShadow: `0 0 20px ${slide.accent}18`,
              }}>
              {dir === -1
                ? <ChevronLeft  className="w-5 h-5 text-white/80" />
                : <ChevronRight className="w-5 h-5 text-white/80" />}
            </button>
          ))}

          {/* ── BOTTOM CONTENT ── */}
          <div
            className="absolute bottom-0 left-0 right-0 px-6 sm:px-8 pb-8 z-10"
            style={{ opacity: textOpacity, transform: `translateY(${textY})`, transition: textTransition }}
          >
            {/* Bullet row */}
            <div className="hidden sm:flex flex-wrap gap-2 mb-5">
              {slide.bullets.map(b => (
                <div key={b} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
                  <span className="w-1 h-1 rounded-full" style={{ background: slide.accent }} />
                  <span className="text-[11px] text-white/70 font-semibold">{b}</span>
                </div>
              ))}
            </div>

            {/* Title + stat */}
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: slide.accentDim, border: `1px solid ${slide.accent}55` }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: slide.accent }} />
                  </div>
                  <h3 className="text-2xl sm:text-[32px] font-black text-white tracking-tight leading-none">
                    {slide.title}
                  </h3>
                </div>
                <p className="text-sm sm:text-[14.5px] text-slate-300/90 max-w-2xl leading-relaxed">
                  {slide.subtitle}
                </p>
              </div>

              {/* Stat chip */}
              <div className="hidden sm:flex flex-col items-center min-w-[100px] px-5 py-3.5 rounded-2xl flex-shrink-0"
                style={{ background: slide.accentDim, border: `1px solid ${slide.accent}45`, backdropFilter: "blur(16px)" }}>
                <span className="text-2xl font-black" style={{ color: slide.accent, textShadow: `0 0 20px ${slide.accent}` }}>
                  {slide.stat.value}
                </span>
                <span className="text-[10px] text-white/40 mt-0.5 font-bold tracking-wider uppercase text-center">
                  {slide.stat.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ══ PROGRESS / NAV STRIP ══ */}
        <div
          className="flex divide-x"
          style={{
            background: "linear-gradient(to bottom, #030b15, #020810)",
            borderTop: `1px solid ${slide.accent}25`,
            divideColor: "rgba(255,255,255,0.04)",
            transition: "border-color 0.8s ease",
          }}
        >
          {SLIDES.map((s, i) => {
            const isActive = i === current;
            const isPast   = i < current;
            return (
              <button
                key={s.id}
                onClick={() => transitionTo(i)}
                className="flex-1 px-3 sm:px-5 py-4 text-left group transition-colors hover:bg-white/[0.025]"
              >
                {/* Progress line */}
                <div className="h-[2px] rounded-full overflow-hidden mb-2.5" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: isPast ? "100%" : isActive ? `${progress}%` : "0%",
                      background: isActive
                        ? `linear-gradient(90deg, ${s.accent}dd, ${s.accent})`
                        : isPast ? "rgba(255,255,255,0.25)" : "transparent",
                      transition: isActive ? "none" : "width 0.5s ease",
                      boxShadow: isActive ? `0 0 10px ${s.accent}` : "none",
                    }}
                  />
                </div>

                {/* Slide label */}
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-500"
                    style={{
                      background: isActive ? s.accent : isPast ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)",
                      boxShadow: isActive ? `0 0 8px ${s.accent}` : "none",
                    }} />
                  <p className="text-[9px] sm:text-[10px] font-black tracking-[0.16em] uppercase truncate transition-all duration-500"
                    style={{ color: isActive ? s.accent : isPast ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)" }}>
                    {s.tag}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}