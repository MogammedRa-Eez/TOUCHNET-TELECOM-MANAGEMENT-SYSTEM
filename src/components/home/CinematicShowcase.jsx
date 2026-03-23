import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Wifi, BarChart3, Network, Users, Shield, Activity } from "lucide-react";

const SLIDES = [
  {
    id: 0,
    image: "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/9949fb685_generated_image.png",
    tag: "FIBRE INFRASTRUCTURE",
    title: "Connecting South Africa",
    subtitle: "End-to-end fibre network deployment and monitoring, from the first lead to go-live.",
    accent: "#06b6d4",
    glow: "rgba(6,182,212,0.4)",
    icon: Wifi,
  },
  {
    id: 1,
    image: "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/d39c56c2e_generated_image.png",
    tag: "NETWORK OPERATIONS",
    title: "Real-Time Visibility",
    subtitle: "Live dashboards, node health monitoring, and instant alerting across your entire network.",
    accent: "#6366f1",
    glow: "rgba(99,102,241,0.4)",
    icon: Activity,
  },
  {
    id: 2,
    image: "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/650f683a5_generated_image.png",
    tag: "FIELD OPERATIONS",
    title: "From Plan to Activation",
    subtitle: "Track engineers, milestones, approvals and go-lives — all in one unified platform.",
    accent: "#8b5cf6",
    glow: "rgba(139,92,246,0.4)",
    icon: Network,
  },
];

const FEATURE_PILLS = [
  { icon: BarChart3,  label: "Revenue Analytics" },
  { icon: Users,      label: "Customer Portal" },
  { icon: Shield,     label: "Role-Based Access" },
  { icon: Network,    label: "Project Tracking" },
];

export default function CinematicShowcase() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  const goTo = (idx) => {
    if (animating || idx === current) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setProgress(0);
      setAnimating(false);
    }, 400);
  };

  const next = () => goTo((current + 1) % SLIDES.length);
  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);

  // Auto-advance every 5s
  useEffect(() => {
    setProgress(0);
    clearInterval(timerRef.current);
    clearInterval(progressRef.current);

    let p = 0;
    progressRef.current = setInterval(() => {
      p += 1;
      setProgress(p);
      if (p >= 100) clearInterval(progressRef.current);
    }, 50); // 50ms * 100 = 5000ms

    timerRef.current = setTimeout(() => {
      setCurrent(c => (c + 1) % SLIDES.length);
      setProgress(0);
    }, 5000);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
    };
  }, [current]);

  const slide = SLIDES[current];
  const Icon = slide.icon;

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden"
      style={{ boxShadow: `0 0 80px ${slide.glow}, 0 32px 64px rgba(0,0,0,0.6)`, transition: "box-shadow 0.6s ease" }}>

      {/* Main image */}
      <div className="relative h-[340px] sm:h-[440px] overflow-hidden">
        <img
          key={slide.id}
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? "scale(1.04)" : "scale(1)",
            transition: "opacity 0.4s ease, transform 0.6s ease",
          }}
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to top, rgba(6,8,20,0.95) 0%, rgba(6,8,20,0.55) 50%, rgba(6,8,20,0.15) 100%)"
        }} />

        {/* Scan line effect */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        }} />

        {/* Accent border glow */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
          border: `1px solid ${slide.accent}40`,
          boxShadow: `inset 0 0 60px ${slide.accent}10`,
        }} />

        {/* Top-left tag */}
        <div className="absolute top-5 left-5 flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: `${slide.accent}20`, border: `1px solid ${slide.accent}50`, backdropFilter: "blur(8px)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: slide.accent }} />
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: slide.accent }}>{slide.tag}</span>
        </div>

        {/* TouchNet watermark */}
        <div className="absolute top-5 right-5 opacity-40">
          <span className="text-[10px] font-bold tracking-widest text-white uppercase" style={{ fontFamily: "monospace" }}>TOUCHNET · TMS</span>
        </div>

        {/* Nav arrows */}
        <button onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <button onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
          <ChevronRight className="w-4 h-4 text-white" />
        </button>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {FEATURE_PILLS.map(p => {
              const PIcon = p.icon;
              return (
                <div key={p.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                  <PIcon className="w-3 h-3 text-slate-300" />
                  <span className="text-[11px] text-slate-300 font-medium">{p.label}</span>
                </div>
              );
            })}
          </div>

          {/* Main text */}
          <div style={{ opacity: animating ? 0 : 1, transform: animating ? "translateY(8px)" : "translateY(0)", transition: "all 0.4s ease" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${slide.accent}25`, border: `1px solid ${slide.accent}50` }}>
                <Icon className="w-3.5 h-3.5" style={{ color: slide.accent }} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">{slide.title}</h3>
            </div>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">{slide.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Progress + dots bar */}
      <div className="px-6 py-4 flex items-center gap-4"
        style={{ background: "rgba(6,8,20,0.95)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {SLIDES.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)} className="flex-1 group">
            <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: i < current ? "100%" : i === current ? `${progress}%` : "0%",
                  background: i === current ? slide.accent : "rgba(255,255,255,0.4)",
                  transition: i === current ? "none" : "width 0.3s ease",
                }}
              />
            </div>
            <p className="text-[10px] mt-1.5 font-semibold text-left truncate transition-colors"
              style={{ color: i === current ? slide.accent : "rgba(255,255,255,0.25)" }}>
              {s.tag}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}