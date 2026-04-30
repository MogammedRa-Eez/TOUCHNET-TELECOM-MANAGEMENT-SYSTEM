import React, { useEffect, useRef } from "react";

const CREST_URL = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/3c5164b25_Touchnet-CrestDesogm_CrestFinalFullWhite.png";

export default function CrestDisplay({ nodes = [] }) {
  const onlineNodes    = nodes.filter(n => n.status === "online").length;
  const degradedNodes  = nodes.filter(n => n.status === "degraded").length;
  const offlineNodes   = nodes.filter(n => n.status === "offline").length;
  const avgUptime      = nodes.length
    ? (nodes.reduce((a, n) => a + (n.uptime_percent || 0), 0) / nodes.length).toFixed(1)
    : "—";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden select-none"
      style={{ background: "linear-gradient(135deg, #080d0d 0%, #0a0f0f 40%, #0f0f0f 70%, #111111 100%)" }}>

      <style>{`
        @keyframes crest-float {
          0%,100% { transform: translateY(0px) rotateX(6deg) rotateY(0deg); }
          25%      { transform: translateY(-10px) rotateX(4deg) rotateY(3deg); }
          50%      { transform: translateY(-18px) rotateX(6deg) rotateY(0deg); }
          75%      { transform: translateY(-10px) rotateX(4deg) rotateY(-3deg); }
        }
        @keyframes crest-glow-pulse {
          0%,100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 1;    transform: scale(1.12); }
        }
        @keyframes ring-rotate-cw  { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
        @keyframes ring-rotate-ccw { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes ring-rotate-med { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
        @keyframes data-node-pulse {
          0%,100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.5); }
        }
        @keyframes scan-line {
          0%   { top: 0%; opacity: 0.6; }
          80%  { opacity: 0.6; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes shimmer-crest {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes particle-orbit {
          from { transform: rotate(0deg) translateX(var(--orbit-r)) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg); }
        }
        @keyframes beacon-ping {
          0%   { transform: scale(1); opacity: 0.7; }
          70%  { transform: scale(2.4); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes ticker-glow {
          0%,100% { text-shadow: 0 0 8px rgba(0,212,212,0.4); }
          50%      { text-shadow: 0 0 20px rgba(0,212,212,0.9), 0 0 40px rgba(0,180,180,0.4); }
        }
      `}</style>

      {/* ── Ambient background glows ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ position:"absolute", top:"-20%", left:"-10%", width:"60%", height:"60%", background:"radial-gradient(circle, rgba(0,180,180,0.12) 0%, transparent 65%)" }}/>
        <div style={{ position:"absolute", bottom:"-10%", right:"-5%", width:"50%", height:"50%", background:"radial-gradient(circle, rgba(139,26,26,0.09) 0%, transparent 65%)" }}/>
        <div className="absolute inset-0" style={{ backgroundImage:"radial-gradient(circle, rgba(0,212,212,0.045) 1px, transparent 1px)", backgroundSize:"28px 28px" }}/>
      </div>

      {/* ── Scan line ── */}
      <div className="absolute left-0 right-0 pointer-events-none z-10" style={{ height:2, background:"linear-gradient(90deg,transparent,rgba(0,212,212,0.45),transparent)", animation:"scan-line 4s linear infinite" }}/>

      {/* ── MAIN 3D crest area ── */}
      <div className="relative flex items-center justify-center" style={{ perspective:"900px", width:320, height:320 }}>

        {/* Outer ring — slow CW */}
        <div className="absolute rounded-full" style={{
          width:310, height:310,
          border:"1px dashed rgba(0,180,180,0.18)",
          animation:"ring-rotate-cw 28s linear infinite",
        }}>
          {/* Tick marks on outer ring */}
          {Array.from({length:12}).map((_,i)=>(
            <div key={i} className="absolute" style={{
              width:6, height:2,
              background: i%3===0 ? "rgba(0,212,212,0.7)" : "rgba(0,180,180,0.25)",
              left:"50%", top:0,
              transformOrigin:"3px 155px",
              transform:`rotate(${i*30}deg)`,
              borderRadius:1,
            }}/>
          ))}
        </div>

        {/* Middle ring — CCW */}
        <div className="absolute rounded-full" style={{
          width:250, height:250,
          border:"1px solid rgba(0,180,180,0.22)",
          animation:"ring-rotate-ccw 18s linear infinite",
          boxShadow:"0 0 30px rgba(0,180,180,0.06), inset 0 0 30px rgba(0,180,180,0.04)",
        }}>
          {/* Orbiting data nodes */}
          {[0,72,144,216,288].map((deg,i)=>(
            <div key={i} className="absolute" style={{
              width:8, height:8,
              borderRadius:"50%",
              background: i===0?"#00d4d4":i===1?"rgba(0,212,212,0.6)":"rgba(0,180,180,0.4)",
              boxShadow: i===0?"0 0 10px #00d4d4, 0 0 20px rgba(0,212,212,0.4)":"0 0 6px rgba(0,180,180,0.6)",
              left:"50%", top:0,
              marginLeft:-4, marginTop:-4,
              transformOrigin:"4px 125px",
              transform:`rotate(${deg}deg)`,
              animation:`data-node-pulse ${1.2+i*0.3}s ease-in-out infinite`,
              animationDelay:`${i*0.24}s`,
            }}/>
          ))}
        </div>

        {/* Inner ring — CW fast */}
        <div className="absolute rounded-full" style={{
          width:180, height:180,
          border:"1.5px solid rgba(139,26,26,0.3)",
          animation:"ring-rotate-cw 10s linear infinite",
        }}>
          {[0,90,180,270].map((deg,i)=>(
            <div key={i} className="absolute" style={{
              width:5, height:5,
              borderRadius:"50%",
              background:"rgba(139,26,26,0.6)",
              boxShadow:"0 0 8px rgba(139,26,26,0.8)",
              left:"50%", top:0,
              marginLeft:-2.5, marginTop:-2.5,
              transformOrigin:"2.5px 90px",
              transform:`rotate(${deg}deg)`,
            }}/>
          ))}
        </div>

        {/* Centre glow platform */}
        <div className="absolute rounded-full" style={{
          width:148, height:148,
          background:"radial-gradient(circle, rgba(0,212,212,0.08) 0%, rgba(0,180,180,0.04) 50%, transparent 100%)",
          border:"1px solid rgba(0,212,212,0.15)",
          boxShadow:"0 0 40px rgba(0,180,180,0.15), 0 0 80px rgba(0,180,180,0.06)",
        }}/>

        {/* ── Beacon ping ── */}
        <div className="absolute rounded-full" style={{
          width:148, height:148,
          border:"2px solid rgba(0,212,212,0.35)",
          animation:"beacon-ping 3s ease-out infinite",
        }}/>
        <div className="absolute rounded-full" style={{
          width:148, height:148,
          border:"2px solid rgba(0,212,212,0.2)",
          animation:"beacon-ping 3s ease-out infinite",
          animationDelay:"1s",
        }}/>

        {/* ── THE CREST — floating 3D ── */}
        <div style={{
          position:"relative",
          zIndex:10,
          animation:"crest-float 6s ease-in-out infinite",
          transformStyle:"preserve-3d",
          filter:"drop-shadow(0 0 24px rgba(0,212,212,0.5)) drop-shadow(0 12px 40px rgba(0,0,0,0.7)) drop-shadow(0 0 60px rgba(0,180,180,0.2))",
        }}>
          {/* Shimmer overlay */}
          <div style={{
            position:"absolute", inset:0,
            background:"linear-gradient(115deg,transparent 30%,rgba(0,212,212,0.18) 50%,transparent 70%)",
            backgroundSize:"200% 100%",
            animation:"shimmer-crest 3s ease-in-out infinite",
            borderRadius:"50%",
            pointerEvents:"none",
            zIndex:11,
          }}/>
          <img
            src={CREST_URL}
            alt="TouchNet Crest"
            style={{
              width:112, height:112,
              objectFit:"contain",
              opacity:0.95,
              position:"relative",
              zIndex:10,
            }}
          />
        </div>

        {/* ── Corner bracket accents ── */}
        {[
          {top:0,left:0,style:{borderTop:"2px solid rgba(0,212,212,0.6)",borderLeft:"2px solid rgba(0,212,212,0.6)"}},
          {top:0,right:0,style:{borderTop:"2px solid rgba(139,26,26,0.5)",borderRight:"2px solid rgba(139,26,26,0.5)"}},
          {bottom:0,left:0,style:{borderBottom:"2px solid rgba(0,212,212,0.35)",borderLeft:"2px solid rgba(0,212,212,0.35)"}},
          {bottom:0,right:0,style:{borderBottom:"2px solid rgba(139,26,26,0.3)",borderRight:"2px solid rgba(139,26,26,0.3)"}},
        ].map((b,i)=>(
          <div key={i} className="absolute pointer-events-none" style={{ width:18, height:18, ...b }}/>
        ))}
      </div>

      {/* ── Brand wordmark ── */}
      <div className="flex flex-col items-center gap-1 mt-2 z-10">
        <div className="flex items-center gap-2">
          <div className="h-px w-10" style={{background:"linear-gradient(90deg,transparent,rgba(0,212,212,0.4))"}}/>
          <p className="text-[9px] font-black uppercase tracking-[0.35em]"
            style={{color:"rgba(0,212,212,0.5)",fontFamily:"'JetBrains Mono',monospace", animation:"ticker-glow 2.5s ease-in-out infinite"}}>
            BUILD · CONNECT · PROTECT
          </p>
          <div className="h-px w-10" style={{background:"linear-gradient(90deg,rgba(0,212,212,0.4),transparent)"}}/>
        </div>
        <p className="text-[7px] font-black uppercase tracking-[0.28em]"
          style={{color:"rgba(255,255,255,0.18)",fontFamily:"'JetBrains Mono',monospace"}}>
          TOUCHNET TMS v3.0
        </p>
      </div>

      {/* ── Node telemetry HUD ── */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{background:"rgba(15,15,15,0.92)",border:"1px solid rgba(0,180,180,0.3)",backdropFilter:"blur(12px)",boxShadow:"0 4px 20px rgba(0,0,0,0.5)"}}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{background:"#34d399",boxShadow:"0 0 8px #34d399"}}/>
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.22em]" style={{color:"rgba(0,180,180,0.6)",fontFamily:"'JetBrains Mono',monospace"}}>TOUCHNET GLOBAL</p>
            <p className="text-[11px] font-black" style={{color:"#00d4d4",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.06em"}}>LIVE TELEMETRY</p>
          </div>
        </div>

        {nodes.length > 0 && (
          <div className="px-3 py-2.5 rounded-xl flex flex-col gap-1.5"
            style={{background:"rgba(15,15,15,0.90)",border:"1px solid rgba(0,180,180,0.18)",backdropFilter:"blur(12px)",boxShadow:"0 4px 16px rgba(0,0,0,0.5)"}}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[8px] font-black uppercase tracking-[0.2em]" style={{color:"rgba(0,180,180,0.5)",fontFamily:"'JetBrains Mono',monospace"}}>Node Status</p>
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md" style={{background:"rgba(52,211,153,0.12)",color:"#34d399",border:"1px solid rgba(52,211,153,0.25)"}}>
                {nodes.length} NODES
              </span>
            </div>
            {[
              {label:"Online",      value:onlineNodes,   color:"#34d399", glow:"rgba(52,211,153,0.6)"  },
              {label:"Degraded",    value:degradedNodes, color:"#fbbf24", glow:"rgba(251,191,36,0.6)"  },
              {label:"Offline",     value:offlineNodes,  color:"#ef4444", glow:"rgba(239,68,68,0.6)"   },
            ].map(({label,value,color,glow})=>(
              <div key={label} className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:color,boxShadow:`0 0 6px ${glow}`}}/>
                    <span className="text-[10px]" style={{color:"rgba(255,255,255,0.5)"}}>{label}</span>
                  </div>
                  <span className="text-[11px] font-black" style={{color,fontFamily:"'JetBrains Mono',monospace"}}>{value}</span>
                </div>
                <div className="h-[2px] rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.06)"}}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{width:`${nodes.length>0?(value/nodes.length)*100:0}%`,background:`linear-gradient(90deg,${color},${color}88)`}}/>
                </div>
              </div>
            ))}
            <div className="mt-1.5 pt-2 flex items-center justify-between" style={{borderTop:"1px solid rgba(0,180,180,0.15)"}}>
              <span className="text-[9px] uppercase tracking-wider" style={{color:"rgba(255,255,255,0.35)",fontFamily:"monospace"}}>Avg Uptime</span>
              <span className="text-[12px] font-black" style={{fontFamily:"'JetBrains Mono',monospace",color:"#34d399"}}>{avgUptime}<span className="text-[9px] ml-0.5" style={{color:"rgba(52,211,153,0.4)"}}>%</span></span>
            </div>
          </div>
        )}
      </div>

      {/* ── Status chips — bottom right ── */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 items-end">
        {[
          {color:"#34d399", label:`${onlineNodes} Online`,   glow:"rgba(52,211,153,0.6)"},
          {color:"#fbbf24", label:`${degradedNodes} Degraded`, glow:"rgba(251,191,36,0.6)"},
          {color:"#ef4444", label:`${offlineNodes} Offline`,  glow:"rgba(239,68,68,0.6)"},
        ].map(({color,label,glow})=>(
          <div key={label} className="flex items-center gap-2 px-2.5 py-1 rounded-lg"
            style={{background:`${color}10`,border:`1px solid ${color}25`,backdropFilter:"blur(8px)"}}>
            <span className="text-[9px] mono font-bold" style={{color:"rgba(255,255,255,0.5)"}}>{label}</span>
            <span className="w-2 h-2 rounded-full status-breathe" style={{background:color,boxShadow:`0 0 8px ${glow}`}}/>
          </div>
        ))}
      </div>

      {/* ── Vignette ── */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{boxShadow:"inset 0 0 80px rgba(8,14,37,0.5)"}}/>
    </div>
  );
}