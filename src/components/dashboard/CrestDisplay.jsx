import React, { useEffect, useRef } from "react";

const CREST_URL = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/3c5164b25_Touchnet-CrestDesogm_CrestFinalFullWhite.png";

export default function CrestDisplay({ nodes = [] }) {
  const canvasRef = useRef(null);
  const onlineNodes   = nodes.filter(n => n.status === "online").length;
  const degradedNodes = nodes.filter(n => n.status === "degraded").length;
  const offlineNodes  = nodes.filter(n => n.status === "offline").length;
  const avgUptime     = nodes.length
    ? (nodes.reduce((a, n) => a + (n.uptime_percent || 0), 0) / nodes.length).toFixed(1)
    : "—";

  // Canvas network particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const NUM = 38;
    const pts = Array.from({ length: NUM }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2.5 + 1,
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const DIST = 120;

      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        p.pulse += 0.03;
      });

      // Draw connections
      pts.forEach((a, i) => {
        pts.slice(i + 1).forEach(b => {
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < DIST) {
            const alpha = (1 - d / DIST) * 0.35;
            // Teal for nodes near centre, maroon for outer
            const distFromCentre = Math.sqrt((a.x - cx) ** 2 + (a.y - cy) ** 2);
            const isTeal = distFromCentre < canvas.width * 0.35;
            ctx.strokeStyle = isTeal
              ? `rgba(0,212,212,${alpha})`
              : `rgba(139,26,26,${alpha * 0.7})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        });
        // Draw node dot
        const pulse = Math.sin(a.pulse) * 0.5 + 0.5;
        const distFromCentre = Math.sqrt((a.x - cx) ** 2 + (a.y - cy) ** 2);
        const isTeal = distFromCentre < canvas.width * 0.35;
        const color = isTeal ? `rgba(0,212,212,${0.4 + pulse * 0.6})` : `rgba(0,180,180,${0.2 + pulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r * (0.8 + pulse * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = isTeal ? "#00d4d4" : "#00b4b4";
        ctx.shadowBlur = 6 * pulse;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden select-none"
      style={{ background: "linear-gradient(135deg, #060c0c 0%, #080f0f 40%, #0c0c0c 70%, #101010 100%)" }}>

      <style>{`
        @keyframes crest-float {
          0%,100% { transform: translateY(0px) rotateX(5deg) rotateY(0deg); }
          25%      { transform: translateY(-14px) rotateX(3deg) rotateY(4deg); }
          50%      { transform: translateY(-24px) rotateX(5deg) rotateY(0deg); }
          75%      { transform: translateY(-14px) rotateX(3deg) rotateY(-4deg); }
        }
        @keyframes ring-rotate-cw  { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
        @keyframes ring-rotate-ccw { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes data-node-pulse {
          0%,100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.8); }
        }
        @keyframes scan-line {
          0%   { top: 0%; opacity: 0.7; }
          85%  { opacity: 0.7; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes scan-line-h {
          0%   { left: -100%; opacity: 0; }
          10%  { opacity: 0.5; }
          90%  { opacity: 0.5; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes shimmer-crest {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes glass-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes crest-holo {
          0%   { background-position: 0% 50%; opacity: 0.4; }
          50%  { background-position: 100% 50%; opacity: 1; }
          100% { background-position: 0% 50%; opacity: 0.4; }
        }
        @keyframes beacon-ping {
          0%   { transform: scale(1); opacity: 0.8; }
          70%  { transform: scale(2.8); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes ticker-glow {
          0%,100% { text-shadow: 0 0 8px rgba(0,212,212,0.4); }
          50%      { text-shadow: 0 0 24px rgba(0,212,212,1), 0 0 48px rgba(0,180,180,0.5); }
        }
        @keyframes hex-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes data-stream {
          0%   { stroke-dashoffset: 200; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @keyframes corner-blink {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
      `}</style>

      {/* ── Network particle canvas ── */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* ── Background glows ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div style={{ position:"absolute", top:"-15%", left:"-5%", width:"70%", height:"70%", background:"radial-gradient(circle, rgba(0,180,180,0.18) 0%, transparent 60%)" }}/>
        <div style={{ position:"absolute", bottom:"-5%", right:"-5%", width:"55%", height:"55%", background:"radial-gradient(circle, rgba(139,26,26,0.14) 0%, transparent 60%)" }}/>
        <div style={{ position:"absolute", top:"30%", right:"10%", width:"30%", height:"30%", background:"radial-gradient(circle, rgba(0,212,212,0.08) 0%, transparent 70%)" }}/>
      </div>

      {/* ── Scan lines ── */}
      <div className="absolute left-0 right-0 pointer-events-none z-20" style={{ height:2, background:"linear-gradient(90deg,transparent,rgba(0,212,212,0.6),transparent)", animation:"scan-line 5s linear infinite" }}/>
      <div className="absolute top-0 bottom-0 pointer-events-none z-20" style={{ width:2, background:"linear-gradient(180deg,transparent,rgba(0,212,212,0.25),transparent)", animation:"scan-line-h 8s linear infinite" }}/>

      {/* ── Corner HUD brackets ── */}
      {[
        {top:12,left:12, bt:"2px solid rgba(0,212,212,0.9)", bl:"2px solid rgba(0,212,212,0.9)"},
        {top:12,right:12, bt:"2px solid rgba(139,26,26,0.8)", br:"2px solid rgba(139,26,26,0.8)"},
        {bottom:12,left:12, bb:"2px solid rgba(0,212,212,0.6)", bl:"2px solid rgba(0,212,212,0.6)"},
        {bottom:12,right:12, bb:"2px solid rgba(139,26,26,0.5)", br:"2px solid rgba(139,26,26,0.5)"},
      ].map((b,i) => (
        <div key={i} className="absolute pointer-events-none z-30" style={{
          width:24, height:24,
          top:b.top, left:b.left, right:b.right, bottom:b.bottom,
          borderTop:b.bt, borderLeft:b.bl, borderBottom:b.bb, borderRight:b.br,
          animation:"corner-blink 2s ease-in-out infinite",
          animationDelay:`${i*0.4}s`,
        }}/>
      ))}

      {/* ── MAIN 3D crest area — ENLARGED ── */}
      <div className="relative flex items-center justify-center z-10" style={{ perspective:"1000px", width:460, height:460 }}>

        {/* Outermost ring with hex tick marks */}
        <div className="absolute rounded-full" style={{
          width:450, height:450,
          border:"1px dashed rgba(0,180,180,0.2)",
          animation:"ring-rotate-cw 40s linear infinite",
        }}>
          {Array.from({length:24}).map((_,i) => (
            <div key={i} className="absolute" style={{
              width: i%6===0 ? 10 : i%3===0 ? 7 : 4,
              height: i%6===0 ? 3 : 2,
              background: i%6===0 ? "rgba(0,212,212,0.9)" : i%3===0 ? "rgba(0,212,212,0.5)" : "rgba(0,180,180,0.2)",
              left:"50%", top:0,
              transformOrigin:`${i%6===0?5:3.5}px 225px`,
              transform:`rotate(${i*15}deg)`,
              borderRadius:2,
              boxShadow: i%6===0 ? "0 0 6px rgba(0,212,212,0.8)" : "none",
            }}/>
          ))}
        </div>

        {/* Outer ring — slow CW — with data nodes */}
        <div className="absolute rounded-full" style={{
          width:380, height:380,
          border:"1.5px solid rgba(0,180,180,0.28)",
          animation:"ring-rotate-ccw 22s linear infinite",
          boxShadow:"0 0 40px rgba(0,180,180,0.08), inset 0 0 40px rgba(0,180,180,0.05)",
        }}>
          {[0,51.4,102.8,154.2,205.7,257.1,308.5].map((deg,i) => (
            <div key={i} className="absolute" style={{
              width: i===0 ? 12 : 8,
              height: i===0 ? 12 : 8,
              borderRadius:"50%",
              background: i===0 ? "#00d4d4" : i%2===0 ? "rgba(0,212,212,0.7)" : "rgba(0,180,180,0.45)",
              boxShadow: i===0 ? "0 0 16px #00d4d4, 0 0 32px rgba(0,212,212,0.5)" : "0 0 8px rgba(0,212,212,0.6)",
              left:"50%", top:0,
              marginLeft: i===0?-6:-4, marginTop: i===0?-6:-4,
              transformOrigin:`${i===0?6:4}px 190px`,
              transform:`rotate(${deg}deg)`,
              animation:`data-node-pulse ${1.4+i*0.25}s ease-in-out infinite`,
              animationDelay:`${i*0.2}s`,
            }}/>
          ))}
        </div>

        {/* Middle ring — maroon nodes */}
        <div className="absolute rounded-full" style={{
          width:300, height:300,
          border:"1.5px solid rgba(0,180,180,0.22)",
          animation:"ring-rotate-cw 15s linear infinite",
        }}>
          {[0,60,120,180,240,300].map((deg,i) => (
            <div key={i} className="absolute" style={{
              width:7, height:7,
              borderRadius:"50%",
              background: i%2===0 ? "rgba(139,26,26,0.8)" : "rgba(0,180,180,0.6)",
              boxShadow: i%2===0 ? "0 0 10px rgba(139,26,26,0.9)" : "0 0 8px rgba(0,180,180,0.7)",
              left:"50%", top:0,
              marginLeft:-3.5, marginTop:-3.5,
              transformOrigin:"3.5px 150px",
              transform:`rotate(${deg}deg)`,
            }}/>
          ))}
        </div>

        {/* Inner fast ring */}
        <div className="absolute rounded-full" style={{
          width:228, height:228,
          border:"2px solid rgba(139,26,26,0.4)",
          animation:"ring-rotate-ccw 8s linear infinite",
          boxShadow:"0 0 20px rgba(139,26,26,0.1)",
        }}>
          {[0,90,180,270].map((deg,i) => (
            <div key={i} className="absolute" style={{
              width:7, height:7,
              borderRadius:"50%",
              background:"rgba(139,26,26,0.8)",
              boxShadow:"0 0 12px rgba(139,26,26,1)",
              left:"50%", top:0,
              marginLeft:-3.5, marginTop:-3.5,
              transformOrigin:"3.5px 114px",
              transform:`rotate(${deg}deg)`,
            }}/>
          ))}
        </div>

        {/* Centre glow platform */}
        <div className="absolute rounded-full" style={{
          width:240, height:240,
          background:"radial-gradient(circle, rgba(0,212,212,0.14) 0%, rgba(0,180,180,0.07) 50%, transparent 100%)",
          border:"1px solid rgba(0,212,212,0.25)",
          boxShadow:"0 0 80px rgba(0,180,180,0.28), 0 0 160px rgba(0,180,180,0.1)",
        }}/>

        {/* Beacon pings */}
        {[0, 1.2, 2.4].map((delay,i) => (
          <div key={i} className="absolute rounded-full" style={{
            width:240, height:240,
            border:`${2-i*0.4}px solid rgba(0,212,212,${0.4-i*0.1})`,
            animation:"beacon-ping 3.5s ease-out infinite",
            animationDelay:`${delay}s`,
          }}/>
        ))}

        {/* ── Spinning glass conic ring ── */}
        <div style={{
          position:"absolute",
          width:260, height:260,
          borderRadius:"50%",
          background:"conic-gradient(from 0deg, transparent 0%, rgba(0,212,212,0.5) 8%, rgba(255,255,255,0.7) 14%, rgba(0,212,212,0.4) 20%, transparent 30%, rgba(139,26,26,0.3) 55%, rgba(255,255,255,0.4) 62%, rgba(139,26,26,0.25) 68%, transparent 80%, rgba(0,212,212,0.3) 92%, rgba(255,255,255,0.5) 96%, transparent 100%)",
          animation:"glass-rotate 5s linear infinite",
          WebkitMaskImage:"radial-gradient(circle, transparent 53%, black 56%, black 100%)",
          maskImage:"radial-gradient(circle, transparent 53%, black 56%, black 100%)",
          pointerEvents:"none",
          zIndex:9,
        }}/>
        {/* Counter-rotating glass ring */}
        <div style={{
          position:"absolute",
          width:244, height:244,
          borderRadius:"50%",
          background:"conic-gradient(from 180deg, transparent 0%, rgba(0,180,180,0.3) 12%, rgba(255,255,255,0.4) 18%, transparent 28%, rgba(0,212,212,0.2) 60%, rgba(255,255,255,0.3) 66%, transparent 78%)",
          animation:"glass-rotate 9s linear infinite reverse",
          WebkitMaskImage:"radial-gradient(circle, transparent 60%, black 63%, black 100%)",
          maskImage:"radial-gradient(circle, transparent 60%, black 63%, black 100%)",
          pointerEvents:"none",
          zIndex:9,
        }}/>

        {/* ── THE CREST — floating 3D — MUCH LARGER ── */}
        <div style={{
          position:"relative",
          zIndex:10,
          animation:"crest-float 7s ease-in-out infinite",
          transformStyle:"preserve-3d",
          filter:"drop-shadow(0 0 48px rgba(0,212,212,0.85)) drop-shadow(0 20px 60px rgba(0,0,0,0.9)) drop-shadow(0 0 120px rgba(0,180,180,0.45))",
        }}>
          {/* Holo shimmer */}
          <div style={{
            position:"absolute", inset:-12,
            background:"linear-gradient(135deg, transparent 0%, rgba(0,212,212,0.2) 25%, rgba(255,255,255,0.35) 50%, rgba(0,212,212,0.15) 75%, transparent 100%)",
            backgroundSize:"300% 300%",
            animation:"crest-holo 4s ease-in-out infinite",
            borderRadius:"50%",
            pointerEvents:"none",
            zIndex:12,
          }}/>
          {/* Main shimmer sweep */}
          <div style={{
            position:"absolute", inset:0,
            background:"linear-gradient(115deg,transparent 25%,rgba(255,255,255,0.3) 50%,transparent 75%)",
            backgroundSize:"200% 100%",
            animation:"shimmer-crest 3s ease-in-out infinite",
            borderRadius:"50%",
            pointerEvents:"none",
            zIndex:13,
          }}/>
          <img
            src={CREST_URL}
            alt="TouchNet Crest"
            style={{
              width:210, height:210,
              objectFit:"contain",
              opacity:0.98,
              position:"relative",
              zIndex:10,
            }}
          />
        </div>

        {/* Corner brackets */}
        {[
          {top:0,left:0,style:{borderTop:"2.5px solid rgba(0,212,212,0.8)",borderLeft:"2.5px solid rgba(0,212,212,0.8)"}},
          {top:0,right:0,style:{borderTop:"2.5px solid rgba(139,26,26,0.7)",borderRight:"2.5px solid rgba(139,26,26,0.7)"}},
          {bottom:0,left:0,style:{borderBottom:"2.5px solid rgba(0,212,212,0.5)",borderLeft:"2.5px solid rgba(0,212,212,0.5)"}},
          {bottom:0,right:0,style:{borderBottom:"2.5px solid rgba(139,26,26,0.45)",borderRight:"2.5px solid rgba(139,26,26,0.45)"}},
        ].map((b,i) => (
          <div key={i} className="absolute pointer-events-none" style={{ width:22, height:22, ...b }}/>
        ))}
      </div>

      {/* ── Brand wordmark ── */}
      <div className="flex flex-col items-center gap-1.5 mt-1 z-10">
        <div className="flex items-center gap-3">
          <div className="h-px w-16" style={{background:"linear-gradient(90deg,transparent,rgba(0,212,212,0.6))"}}/>
          <p className="text-[10px] font-black uppercase tracking-[0.4em]"
            style={{color:"rgba(0,212,212,0.7)",fontFamily:"'JetBrains Mono',monospace", animation:"ticker-glow 2.5s ease-in-out infinite"}}>
            BUILD · CONNECT · PROTECT
          </p>
          <div className="h-px w-16" style={{background:"linear-gradient(90deg,rgba(0,212,212,0.6),transparent)"}}/>
        </div>
        <p className="text-[8px] font-black uppercase tracking-[0.3em]"
          style={{color:"rgba(255,255,255,0.25)",fontFamily:"'JetBrains Mono',monospace"}}>
          TOUCHNET TMS v3.0
        </p>
      </div>

      {/* ── Node telemetry HUD — top left ── */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl"
          style={{background:"rgba(10,10,10,0.95)",border:"1px solid rgba(0,180,180,0.45)",backdropFilter:"blur(16px)",boxShadow:"0 4px 24px rgba(0,0,0,0.6), 0 0 20px rgba(0,180,180,0.08)"}}>
          <span className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{background:"#34d399",boxShadow:"0 0 10px #34d399"}}/>
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.25em]" style={{color:"rgba(0,180,180,0.7)",fontFamily:"'JetBrains Mono',monospace"}}>TOUCHNET GLOBAL</p>
            <p className="text-[12px] font-black" style={{color:"#00d4d4",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.06em"}}>LIVE TELEMETRY</p>
          </div>
        </div>

        {nodes.length > 0 && (
          <div className="px-3.5 py-3 rounded-xl flex flex-col gap-2"
            style={{background:"rgba(10,10,10,0.93)",border:"1px solid rgba(0,180,180,0.28)",backdropFilter:"blur(16px)",boxShadow:"0 4px 20px rgba(0,0,0,0.6)"}}>
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-[8px] font-black uppercase tracking-[0.22em]" style={{color:"rgba(0,180,180,0.6)",fontFamily:"'JetBrains Mono',monospace"}}>Node Status</p>
              <span className="text-[8px] font-black px-2 py-0.5 rounded-md" style={{background:"rgba(52,211,153,0.15)",color:"#34d399",border:"1px solid rgba(52,211,153,0.35)"}}>
                {nodes.length} NODES
              </span>
            </div>
            {[
              {label:"Online",   value:onlineNodes,   color:"#34d399", glow:"rgba(52,211,153,0.7)"},
              {label:"Degraded", value:degradedNodes, color:"#fbbf24", glow:"rgba(251,191,36,0.7)"},
              {label:"Offline",  value:offlineNodes,  color:"#ef4444", glow:"rgba(239,68,68,0.7)"},
            ].map(({label,value,color,glow}) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:color,boxShadow:`0 0 8px ${glow}`}}/>
                    <span className="text-[11px] font-semibold" style={{color:"rgba(255,255,255,0.55)"}}>{label}</span>
                  </div>
                  <span className="text-[13px] font-black" style={{color,fontFamily:"'JetBrains Mono',monospace"}}>{value}</span>
                </div>
                <div className="h-[3px] rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.07)"}}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{width:`${nodes.length>0?(value/nodes.length)*100:0}%`,background:`linear-gradient(90deg,${color},${color}88)`,boxShadow:`0 0 6px ${color}80`}}/>
                </div>
              </div>
            ))}
            <div className="mt-1 pt-2 flex items-center justify-between" style={{borderTop:"1px solid rgba(0,180,180,0.2)"}}>
              <span className="text-[9px] uppercase tracking-wider" style={{color:"rgba(255,255,255,0.35)",fontFamily:"monospace"}}>Avg Uptime</span>
              <span className="text-[14px] font-black" style={{fontFamily:"'JetBrains Mono',monospace",color:"#34d399",textShadow:"0 0 16px rgba(52,211,153,0.6)"}}>{avgUptime}<span className="text-[9px] ml-0.5" style={{color:"rgba(52,211,153,0.45)"}}>%</span></span>
            </div>
          </div>
        )}
      </div>

      {/* ── Status chips — bottom right ── */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 items-end">
        {[
          {color:"#34d399", label:`${onlineNodes} Online`,     glow:"rgba(52,211,153,0.7)"},
          {color:"#fbbf24", label:`${degradedNodes} Degraded`, glow:"rgba(251,191,36,0.7)"},
          {color:"#ef4444", label:`${offlineNodes} Offline`,   glow:"rgba(239,68,68,0.7)"},
        ].map(({color,label,glow}) => (
          <div key={label} className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl"
            style={{background:`rgba(10,10,10,0.9)`,border:`1px solid ${color}40`,backdropFilter:"blur(12px)",boxShadow:`0 0 12px ${color}15`}}>
            <span className="text-[11px] font-bold" style={{color:"rgba(255,255,255,0.6)"}}>{label}</span>
            <span className="w-2.5 h-2.5 rounded-full status-breathe" style={{background:color,boxShadow:`0 0 10px ${glow}`}}/>
          </div>
        ))}
      </div>

      {/* ── Vignette ── */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{boxShadow:"inset 0 0 100px rgba(6,12,12,0.65)"}}/>
    </div>
  );
}