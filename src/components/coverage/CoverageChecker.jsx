import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, X, Search, CheckCircle2, XCircle, Loader2, ChevronRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const CREST = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/639b91697_Touchnet-CrestDesogm_CrestFinalFullWhite.png";

const PROVIDERS_QUICK = [
  { name:"TouchNet",   color:"#00b4b4", type:"fibre",    zones:[{lat:-26.1041,lng:28.1073,r:10000},{lat:-25.8579,lng:28.1893,r:11000},{lat:-26.0274,lng:28.1527,r:9000},{lat:-33.9249,lng:18.4241,r:10000},{lat:-29.8587,lng:31.0218,r:10000}] },
  { name:"Openserve",  color:"#06b6d4", type:"fibre",    zones:[{lat:-26.1041,lng:28.1073,r:14000},{lat:-25.7479,lng:28.2293,r:16000},{lat:-26.2041,lng:28.0473,r:15000},{lat:-33.9249,lng:18.4241,r:14000},{lat:-29.8587,lng:31.0218,r:13000}] },
  { name:"Vumatel",    color:"#f59e0b", type:"fibre",    zones:[{lat:-26.1041,lng:28.1073,r:9000},{lat:-26.0274,lng:28.1527,r:8500},{lat:-33.9249,lng:18.4241,r:10000},{lat:-25.8579,lng:28.1893,r:8000}] },
  { name:"Frogfoot",   color:"#10b981", type:"fibre",    zones:[{lat:-26.0274,lng:28.1527,r:7500},{lat:-25.9025,lng:28.4211,r:8000},{lat:-26.2309,lng:28.2772,r:7500},{lat:-25.8579,lng:28.1893,r:7500}] },
  { name:"Octotel",    color:"#8b5cf6", type:"fibre",    zones:[{lat:-33.9249,lng:18.4241,r:9000},{lat:-33.8668,lng:18.6302,r:8000},{lat:-33.9602,lng:18.4732,r:7500}] },
  { name:"Dark Fibre", color:"#fb923c", type:"fibre",    zones:[{lat:-26.1041,lng:28.1073,r:12000},{lat:-26.2041,lng:28.0473,r:14000},{lat:-33.9249,lng:18.4241,r:13000},{lat:-29.8587,lng:31.0218,r:12000}] },
  { name:"Herotel",    color:"#f472b6", type:"wireless", zones:[{lat:-29.1197,lng:26.214,r:10000},{lat:-28.7282,lng:24.7499,r:9000},{lat:-23.9045,lng:29.4686,r:8000}] },
  { name:"MetroFibre", color:"#0ea5e9", type:"fibre",    zones:[{lat:-26.1041,lng:28.1073,r:8500},{lat:-26.0274,lng:28.1527,r:8000},{lat:-33.9249,lng:18.4241,r:9000}] },
];

const haversine = (la1,lo1,la2,lo2) => {
  const R=6371000,dL=(la2-la1)*Math.PI/180,dO=(lo2-lo1)*Math.PI/180;
  const a=Math.sin(dL/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dO/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
};

async function geocodeAddress(query) {
  const url=`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query+", South Africa")}&format=json&limit=1&countrycodes=za`;
  const res=await fetch(url,{headers:{"Accept-Language":"en"}});
  const data=await res.json();
  if (!data?.length) throw new Error("Address not found");
  return {lat:parseFloat(data[0].lat),lng:parseFloat(data[0].lon),displayName:data[0].display_name};
}

export default function CoverageChecker({ onClose }) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);

  const check = async (e) => {
    e?.preventDefault();
    if (!address.trim()) return;
    setLoading(true); setResult(null); setError(null);
    try {
      const geo = await geocodeAddress(address);
      const available = PROVIDERS_QUICK.filter(p =>
        p.zones.some(z => haversine(geo.lat,geo.lng,z.lat,z.lng) <= z.r)
      );
      setResult({available, displayName:geo.displayName, lat:geo.lat, lng:geo.lng});
      base44.entities.CoverageSearch.create({
        query:address.trim(), display_name:geo.displayName,
        lat:geo.lat, lng:geo.lng, covered:available.length>0
      }).catch(()=>{});
    } catch {
      setError("Address not found. Try a suburb or city name.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{background:"rgba(0,0,0,0.88)",backdropFilter:"blur(20px)"}}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{background:"#1a1a1a",border:"1px solid rgba(0,212,212,0.25)",boxShadow:"0 32px 80px rgba(0,0,0,0.7)"}}>
        <div className="h-[2px]" style={{background:"linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.4),#8B1A1A,transparent)"}}/>

        <div className="flex items-center justify-between px-5 py-4"
          style={{borderBottom:"1px solid rgba(255,255,255,0.07)",background:"rgba(255,255,255,0.02)"}}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{background:"linear-gradient(135deg,rgba(0,180,180,0.18),rgba(139,26,26,0.08))",border:"1px solid rgba(0,212,212,0.25)"}}>
              <img src={CREST} alt="TN" className="w-6 h-6 object-contain" style={{opacity:0.9}}/>
            </div>
            <div>
              <p className="text-[14px] font-black" style={{color:"#f0f0f0",fontFamily:"'Space Grotesk',sans-serif"}}>Coverage Checker</p>
              <p className="text-[10px]" style={{color:"rgba(0,212,212,0.5)",fontFamily:"'JetBrains Mono',monospace"}}>FIBRE · WIRELESS · SOUTH AFRICA</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/CoverageCheck"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:scale-105"
              style={{background:"rgba(0,180,180,0.1)",border:"1px solid rgba(0,212,212,0.2)",color:"#00d4d4"}}
              onClick={onClose}>
              Full Map <ChevronRight className="w-3 h-3"/>
            </Link>
            {onClose && (
              <button onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/5"
                style={{border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.5)"}}>
                <X className="w-3.5 h-3.5"/>
              </button>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <form onSubmit={check} className="space-y-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest block mb-1.5" style={{color:"rgba(255,255,255,0.35)"}}>Enter your address or suburb</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{color:"rgba(0,212,212,0.6)"}}/>
                <input value={address} onChange={e=>setAddress(e.target.value)}
                  placeholder="e.g. 12 Rivonia Rd, Sandton…"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-[13px] outline-none transition-all"
                  style={{background:"#252525",border:"1px solid rgba(255,255,255,0.1)",color:"#f0f0f0"}}
                  onFocus={e=>e.target.style.borderColor="rgba(0,212,212,0.5)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              </div>
            </div>
            <button type="submit" disabled={loading||!address.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              style={{background:"linear-gradient(135deg,#00b4b4,#007a7a)",boxShadow:"0 6px 24px rgba(0,180,180,0.4)",border:"1px solid rgba(0,212,212,0.3)"}}>
              <div className="absolute inset-0 pointer-events-none" style={{background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)",backgroundSize:"200% 100%",animation:"shimmer 2s infinite"}}/>
              {loading?<Loader2 className="w-4 h-4 animate-spin relative z-10"/>:<Search className="w-4 h-4 relative z-10"/>}
              <span className="relative z-10">{loading?"Checking coverage…":"Check Coverage"}</span>
            </button>
          </form>

          {error && (
            <div className="rounded-xl px-4 py-3 flex items-center gap-2"
              style={{background:"rgba(139,26,26,0.1)",border:"1px solid rgba(139,26,26,0.3)"}}>
              <XCircle className="w-4 h-4 flex-shrink-0" style={{color:"#c23030"}}/>
              <p className="text-[12px]" style={{color:"#c23030"}}>{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="rounded-xl p-4"
                style={{background:result.available.length>0?"rgba(0,180,180,0.07)":"rgba(139,26,26,0.07)",border:`1px solid ${result.available.length>0?"rgba(0,180,180,0.3)":"rgba(139,26,26,0.3)"}`}}>
                <div className="flex items-start gap-3">
                  {result.available.length>0
                    ?<CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{color:"#10b981"}}/>
                    :<XCircle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{color:"#8B1A1A"}}/>}
                  <div className="min-w-0">
                    <p className="text-[14px] font-black" style={{color:result.available.length>0?"#10b981":"#8B1A1A"}}>
                      {result.available.length>0?`${result.available.length} Provider${result.available.length>1?"s":""} Available!`:"No Coverage Found"}
                    </p>
                    <p className="text-[11px] mt-0.5 truncate" style={{color:"rgba(255,255,255,0.35)"}}>
                      {result.displayName?.split(",").slice(0,3).join(",")}
                    </p>
                  </div>
                </div>
              </div>

              {result.available.length>0 && (
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{color:"rgba(255,255,255,0.25)"}}>Available at this address</p>
                  {result.available.map(p=>(
                    <div key={p.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{background:`${p.color}0d`,border:`1px solid ${p.color}28`}}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:p.color,boxShadow:`0 0 8px ${p.color}`}}/>
                      <span className="flex-1 text-[12px] font-bold" style={{color:"#e0e0e0"}}>{p.name}</span>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase"
                        style={{background:p.type==="fibre"?"rgba(0,180,180,0.12)":"rgba(14,165,233,0.12)",color:p.type==="fibre"?"#00d4d4":"#38bdf8",border:`1px solid ${p.type==="fibre"?"rgba(0,180,180,0.25)":"rgba(14,165,233,0.25)"}`}}>
                        {p.type==="fibre"?"FTTH":"FWA"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <Link to="/CoverageCheck" onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-black text-white transition-all hover:scale-[1.02]"
                style={{background:"linear-gradient(135deg,#8B1A1A,#a52020)",boxShadow:"0 4px 18px rgba(139,26,26,0.4)",border:"1px solid rgba(139,26,26,0.35)"}}>
                <Zap className="w-4 h-4"/> View Full Map & Feasibility Report
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}