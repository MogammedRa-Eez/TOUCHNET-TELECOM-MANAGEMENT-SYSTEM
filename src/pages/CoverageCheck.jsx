import React, { useState, useEffect, useRef } from "react";
import {
  MapPin, Search, CheckCircle2, XCircle, AlertCircle, Loader2,
  Zap, Send, Phone, Mail, User, ArrowRight, RefreshCw,
  Layers, X, Shield, Clock, TrendingUp,
  Activity, FileText, Download, ChevronRight, Star, Globe
} from "lucide-react";
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { base44 } from "@/api/base44Client";
import { jsPDF } from "jspdf";
import { Link } from "react-router-dom";

const LOGO_TEAL   = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/fa247a9df_Touchnet_LogoLongTeal.png";
const CREST_WHITE = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/639b91697_Touchnet-CrestDesogm_CrestFinalFullWhite.png";

/* ── Provider definitions ─────────────────────────────── */
const PROVIDERS = {
  touchnet: {
    id:"touchnet", name:"TouchNet", emoji:"⬡", color:"#00b4b4",
    tagline:"Premium Uncapped Fibre", type:"fibre",
    plans:[
      { label:"Basic",      speed:"10 Mbps",  price:399,  upload:"5 Mbps",   contract:24 },
      { label:"Standard",   speed:"50 Mbps",  price:599,  upload:"25 Mbps",  contract:24 },
      { label:"Premium",    speed:"100 Mbps", price:899,  upload:"50 Mbps",  contract:24 },
      { label:"Enterprise", speed:"500 Mbps", price:1499, upload:"250 Mbps", contract:24 },
      { label:"Gigabit",    speed:"1 Gbps",   price:2999, upload:"500 Mbps", contract:24 },
    ],
    zones:[
      { lat:-26.1041,lng:28.1073,label:"Sandton",        r:10000 },
      { lat:-26.0274,lng:28.1527,label:"Fourways",        r:9000  },
      { lat:-25.8579,lng:28.1893,label:"Centurion",       r:11000 },
      { lat:-26.0765,lng:28.0556,label:"Randburg",        r:9000  },
      { lat:-26.1715,lng:27.9681,label:"Krugersdorp",     r:8000  },
      { lat:-25.9025,lng:28.4211,label:"Kempton Park",    r:9000  },
      { lat:-25.7479,lng:28.2293,label:"Pretoria East",   r:11000 },
      { lat:-26.2041,lng:28.0473,label:"JHB South",       r:10000 },
      { lat:-26.1367,lng:28.2411,label:"Bedfordview",     r:8000  },
      { lat:-26.2309,lng:28.2772,label:"Alberton",        r:8000  },
      { lat:-33.9249,lng:18.4241,label:"Cape Town CBD",   r:10000 },
      { lat:-29.8587,lng:31.0218,label:"Durban North",    r:10000 },
      { lat:-29.1197,lng:26.214, label:"Bloemfontein",    r:9000  },
    ],
    rating:4.8, uptime:"99.9%",
  },
  openserve: {
    id:"openserve", name:"Openserve", emoji:"🌐", color:"#06b6d4",
    tagline:"Telkom Wholesale FTTH", type:"fibre",
    plans:[
      { label:"10M",  speed:"10 Mbps",  price:349,  upload:"5 Mbps",   contract:24 },
      { label:"50M",  speed:"50 Mbps",  price:549,  upload:"25 Mbps",  contract:24 },
      { label:"100M", speed:"100 Mbps", price:799,  upload:"50 Mbps",  contract:24 },
      { label:"1G",   speed:"1 Gbps",   price:2699, upload:"500 Mbps", contract:24 },
    ],
    zones:[
      { lat:-26.1041,lng:28.1073,label:"Sandton/Midrand", r:14000 },
      { lat:-25.7479,lng:28.2293,label:"Pretoria",        r:16000 },
      { lat:-26.2041,lng:28.0473,label:"Johannesburg",    r:15000 },
      { lat:-33.9249,lng:18.4241,label:"Cape Town",       r:14000 },
      { lat:-29.8587,lng:31.0218,label:"Durban",          r:13000 },
      { lat:-33.0,   lng:27.9,   label:"East London",     r:9000  },
      { lat:-33.9602,lng:25.6022,label:"Port Elizabeth",  r:10000 },
      { lat:-26.3181,lng:27.9175,label:"Vereeniging",     r:8000  },
      { lat:-23.9045,lng:29.4686,label:"Polokwane",       r:8000  },
    ],
    rating:4.1, uptime:"99.5%",
  },
  vumatel: {
    id:"vumatel", name:"Vumatel", emoji:"⚡", color:"#f59e0b",
    tagline:"High-Density Urban FTTH", type:"fibre",
    plans:[
      { label:"25M",  speed:"25 Mbps",  price:459,  upload:"12 Mbps",  contract:12 },
      { label:"50M",  speed:"50 Mbps",  price:649,  upload:"25 Mbps",  contract:12 },
      { label:"200M", speed:"200 Mbps", price:1099, upload:"100 Mbps", contract:12 },
      { label:"1G",   speed:"1 Gbps",   price:2499, upload:"500 Mbps", contract:12 },
    ],
    zones:[
      { lat:-26.1041,lng:28.1073,label:"Sandton",              r:9000  },
      { lat:-26.0274,lng:28.1527,label:"Fourways/Northriding", r:8500  },
      { lat:-26.1887,lng:28.0667,label:"Soweto",               r:11000 },
      { lat:-26.0765,lng:28.0556,label:"Randburg",             r:8000  },
      { lat:-26.1367,lng:28.2411,label:"Bedfordview",          r:7000  },
      { lat:-33.9249,lng:18.4241,label:"Cape Town",            r:10000 },
      { lat:-29.8587,lng:31.0218,label:"Durban",               r:10000 },
      { lat:-25.8579,lng:28.1893,label:"Centurion",            r:8000  },
    ],
    rating:4.5, uptime:"99.7%",
  },
  frogfoot: {
    id:"frogfoot", name:"Frogfoot", emoji:"🐸", color:"#10b981",
    tagline:"Open-Access FTTH Network", type:"fibre",
    plans:[
      { label:"10M",  speed:"10 Mbps",  price:299, upload:"5 Mbps",   contract:12 },
      { label:"25M",  speed:"25 Mbps",  price:449, upload:"12 Mbps",  contract:12 },
      { label:"100M", speed:"100 Mbps", price:749, upload:"50 Mbps",  contract:12 },
      { label:"200M", speed:"200 Mbps", price:999, upload:"100 Mbps", contract:24 },
    ],
    zones:[
      { lat:-26.0274,lng:28.1527,label:"Northriding/Fourways", r:7500 },
      { lat:-25.9025,lng:28.4211,label:"Kempton Park",         r:8000 },
      { lat:-26.2309,lng:28.2772,label:"Alberton",             r:7500 },
      { lat:-26.1367,lng:28.2411,label:"Bedfordview/Edenvale", r:7000 },
      { lat:-26.3044,lng:27.8525,label:"Roodepoort",           r:7000 },
      { lat:-29.1197,lng:26.214, label:"Bloemfontein",         r:9000 },
      { lat:-25.8579,lng:28.1893,label:"Centurion",            r:7500 },
    ],
    rating:4.3, uptime:"99.6%",
  },
  octotel: {
    id:"octotel", name:"Octotel", emoji:"🐙", color:"#8b5cf6",
    tagline:"Cape Town Open-Access Fibre", type:"fibre",
    plans:[
      { label:"10M",  speed:"10 Mbps",  price:299,  upload:"5 Mbps",   contract:12 },
      { label:"50M",  speed:"50 Mbps",  price:499,  upload:"25 Mbps",  contract:12 },
      { label:"100M", speed:"100 Mbps", price:699,  upload:"50 Mbps",  contract:12 },
      { label:"1G",   speed:"1 Gbps",   price:2199, upload:"500 Mbps", contract:24 },
    ],
    zones:[
      { lat:-33.9249,lng:18.4241,label:"Cape Town CBD",         r:9000 },
      { lat:-33.8668,lng:18.6302,label:"Bellville/Tygervalley", r:8000 },
      { lat:-33.9602,lng:18.4732,label:"Rondebosch/Claremont",  r:7500 },
      { lat:-34.0269,lng:18.4641,label:"Lakeside/Muizenberg",   r:7000 },
      { lat:-33.8300,lng:18.6300,label:"Durbanville",           r:7000 },
      { lat:-33.9600,lng:18.8100,label:"Somerset West",         r:7000 },
    ],
    rating:4.5, uptime:"99.7%",
  },
  mfn: {
    id:"mfn", name:"MFN", emoji:"📡", color:"#e879f9",
    tagline:"Metro Fibre Network", type:"fibre",
    plans:[
      { label:"10M",  speed:"10 Mbps",  price:329,  upload:"5 Mbps",   contract:24 },
      { label:"50M",  speed:"50 Mbps",  price:549,  upload:"25 Mbps",  contract:24 },
      { label:"100M", speed:"100 Mbps", price:799,  upload:"50 Mbps",  contract:24 },
      { label:"200M", speed:"200 Mbps", price:1199, upload:"100 Mbps", contract:24 },
    ],
    zones:[
      { lat:-26.1041,lng:28.1073,label:"Sandton",          r:9000  },
      { lat:-26.0765,lng:28.0556,label:"Randburg",         r:8500  },
      { lat:-26.2041,lng:28.0473,label:"Johannesburg CBD", r:10000 },
      { lat:-25.7479,lng:28.2293,label:"Pretoria East",    r:10000 },
      { lat:-25.8579,lng:28.1893,label:"Centurion",        r:9000  },
      { lat:-33.9249,lng:18.4241,label:"Cape Town CBD",    r:8500  },
      { lat:-29.8587,lng:31.0218,label:"Durban",           r:9500  },
    ],
    rating:4.2, uptime:"99.5%",
  },
  dfa: {
    id:"dfa", name:"Dark Fibre Africa", emoji:"🔶", color:"#fb923c",
    tagline:"Open-Access Dark Fibre", type:"fibre",
    plans:[
      { label:"10M",  speed:"10 Mbps",  price:299,  upload:"10 Mbps",  contract:12 },
      { label:"100M", speed:"100 Mbps", price:749,  upload:"100 Mbps", contract:12 },
      { label:"500M", speed:"500 Mbps", price:1599, upload:"500 Mbps", contract:24 },
      { label:"1G",   speed:"1 Gbps",   price:2799, upload:"1 Gbps",   contract:24 },
    ],
    zones:[
      { lat:-26.1041,lng:28.1073,label:"Sandton",          r:12000 },
      { lat:-26.2041,lng:28.0473,label:"Johannesburg CBD", r:14000 },
      { lat:-25.7479,lng:28.2293,label:"Pretoria",         r:15000 },
      { lat:-26.0274,lng:28.1527,label:"Midrand",          r:10000 },
      { lat:-33.9249,lng:18.4241,label:"Cape Town",        r:13000 },
      { lat:-29.8587,lng:31.0218,label:"Durban",           r:12000 },
    ],
    rating:4.4, uptime:"99.8%",
  },
  evotel: {
    id:"evotel", name:"Evotel", emoji:"🚀", color:"#f43f5e",
    tagline:"KZN & Coastal Fibre", type:"fibre",
    plans:[
      { label:"10M",  speed:"10 Mbps",  price:349,  upload:"5 Mbps",   contract:24 },
      { label:"100M", speed:"100 Mbps", price:799,  upload:"50 Mbps",  contract:24 },
      { label:"1G",   speed:"1 Gbps",   price:2499, upload:"500 Mbps", contract:24 },
    ],
    zones:[
      { lat:-29.8587,lng:31.0218,label:"Durban North",     r:10000 },
      { lat:-29.6900,lng:31.0600,label:"Umhlanga",         r:7000  },
      { lat:-30.3600,lng:30.3800,label:"Pietermaritzburg", r:9000  },
      { lat:-33.9602,lng:25.6022,label:"Port Elizabeth",   r:9000  },
    ],
    rating:4.2, uptime:"99.5%",
  },
  metrofibre: {
    id:"metrofibre", name:"MetroFibre Networx", emoji:"🏙️", color:"#0ea5e9",
    tagline:"Urban Fibre — Gauteng & Cape", type:"fibre",
    plans:[
      { label:"10M",  speed:"10 Mbps",  price:349,  upload:"5 Mbps",   contract:24 },
      { label:"100M", speed:"100 Mbps", price:849,  upload:"50 Mbps",  contract:24 },
      { label:"200M", speed:"200 Mbps", price:1249, upload:"100 Mbps", contract:24 },
    ],
    zones:[
      { lat:-26.1041,lng:28.1073,label:"Sandton",      r:8500 },
      { lat:-26.0274,lng:28.1527,label:"Fourways",     r:8000 },
      { lat:-25.9025,lng:28.4211,label:"Kempton Park", r:8000 },
      { lat:-26.3044,lng:27.8525,label:"Roodepoort",   r:7500 },
      { lat:-26.0765,lng:28.0556,label:"Randburg",     r:8000 },
      { lat:-33.9249,lng:18.4241,label:"Cape Town",    r:9000 },
    ],
    rating:4.3, uptime:"99.6%",
  },
  zoom: {
    id:"zoom", name:"Zoom Fibre", emoji:"💨", color:"#a855f7",
    tagline:"Rapid-Deploy Urban Fibre", type:"fibre",
    plans:[
      { label:"25M",  speed:"25 Mbps",  price:399,  upload:"12 Mbps",  contract:12 },
      { label:"100M", speed:"100 Mbps", price:749,  upload:"50 Mbps",  contract:12 },
      { label:"500M", speed:"500 Mbps", price:1599, upload:"250 Mbps", contract:24 },
    ],
    zones:[
      { lat:-26.1041,lng:28.1073,label:"Sandton",   r:8000 },
      { lat:-25.8579,lng:28.1893,label:"Centurion", r:8000 },
      { lat:-29.6900,lng:31.0600,label:"Umhlanga",  r:7000 },
      { lat:-33.9249,lng:18.4241,label:"Cape Town", r:8500 },
    ],
    rating:4.3, uptime:"99.6%",
  },
  herotel: {
    id:"herotel", name:"Herotel", emoji:"🦸", color:"#f472b6",
    tagline:"Rural & Peri-Urban Wireless", type:"wireless",
    plans:[
      { label:"10M",  speed:"10 Mbps",  price:299, upload:"5 Mbps",  contract:12 },
      { label:"50M",  speed:"50 Mbps",  price:649, upload:"25 Mbps", contract:12 },
      { label:"100M", speed:"100 Mbps", price:899, upload:"50 Mbps", contract:24 },
    ],
    zones:[
      { lat:-33.5833,lng:26.8833,label:"Grahamstown",   r:9000  },
      { lat:-28.7282,lng:24.7499,label:"Kimberley",     r:9000  },
      { lat:-29.1197,lng:26.214, label:"Bloemfontein",  r:10000 },
      { lat:-26.8667,lng:26.6667,label:"Potchefstroom", r:8000  },
      { lat:-23.9045,lng:29.4686,label:"Polokwane",     r:8000  },
    ],
    rating:4.1, uptime:"99.2%",
  },
  liquid: {
    id:"liquid", name:"Liquid Home", emoji:"💧", color:"#60a5fa",
    tagline:"Pan-African Fibre & Cloud", type:"fibre",
    plans:[
      { label:"10M",  speed:"10 Mbps",  price:379,  upload:"5 Mbps",   contract:24 },
      { label:"100M", speed:"100 Mbps", price:849,  upload:"50 Mbps",  contract:24 },
      { label:"1G",   speed:"1 Gbps",   price:3199, upload:"500 Mbps", contract:24 },
    ],
    zones:[
      { lat:-26.1041,lng:28.1073,label:"Sandton",     r:11000 },
      { lat:-26.2041,lng:28.0473,label:"Johannesburg", r:13000 },
      { lat:-25.7479,lng:28.2293,label:"Pretoria",    r:14000 },
      { lat:-33.9249,lng:18.4241,label:"Cape Town",   r:12000 },
      { lat:-29.8587,lng:31.0218,label:"Durban",      r:11000 },
    ],
    rating:4.3, uptime:"99.7%",
  },
};

/* ── Haversine ─────────────────────────────────────────── */
const haversine = (la1,lo1,la2,lo2) => {
  const R=6371000, dL=(la2-la1)*Math.PI/180, dO=(lo2-lo1)*Math.PI/180;
  const a=Math.sin(dL/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dO/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
};

const checkAllProviders = (lat,lng) =>
  Object.values(PROVIDERS).map(p => {
    let best=null, bestD=Infinity;
    for (const z of p.zones) {
      const d=haversine(lat,lng,z.lat,z.lng);
      if (d<=z.r && d<bestD) { bestD=d; best=z; }
    }
    return { provider:p, covered:!!best, zone:best };
  }).sort((a,b)=>{
    if (a.covered&&!b.covered) return -1;
    if (!a.covered&&b.covered) return 1;
    return a.provider.name.localeCompare(b.provider.name);
  });

/* ── Fix Leaflet icons ─────────────────────────────────── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapFlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, zoom||14, { duration:1.2 }); }, [center,zoom]);
  return null;
}

async function geocodeAddress(query) {
  const url=`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query+", South Africa")}&format=json&limit=1&countrycodes=za`;
  const res=await fetch(url,{ headers:{ "Accept-Language":"en" } });
  const data=await res.json();
  if (!data?.length) throw new Error("Address not found");
  return { lat:parseFloat(data[0].lat), lng:parseFloat(data[0].lon), displayName:data[0].display_name };
}

/* ── Feasibility Report Modal ──────────────────────────── */
function FeasibilityReport({ address, providerResults, result, onClose, onSignUp }) {
  const [exporting, setExporting] = useState(false);
  const available   = providerResults.filter(r=>r.covered);
  const unavailable = providerResults.filter(r=>!r.covered);
  const fibre       = available.filter(r=>r.provider.type==="fibre");
  const wireless    = available.filter(r=>r.provider.type==="wireless");
  const cheapest    = available.length ? available.reduce((b,r)=> Math.min(...r.provider.plans.map(p=>p.price))<Math.min(...b.provider.plans.map(p=>p.price))?r:b) : null;
  const fastest     = available.length ? available.reduce((b,r)=> Math.max(...r.provider.plans.map(p=>parseInt(p.speed)))>Math.max(...b.provider.plans.map(p=>parseInt(p.speed)))?r:b) : null;

  const exportPDF = async () => {
    setExporting(true);
    try {
      const doc=new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
      const W=210, M=14, cW=W-M*2; let y=0;
      doc.setFillColor(10,15,15); doc.rect(0,0,W,40,"F");
      doc.setFillColor(0,180,180); doc.rect(0,38,W,2,"F");
      doc.setTextColor(0,212,212); doc.setFontSize(18); doc.setFont("helvetica","bold");
      doc.text("TOUCHNET TELECOMMUNICATIONS",M,16);
      doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(180,240,240);
      doc.text("FIBRE FEASIBILITY REPORT",M,23);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-ZA",{day:"2-digit",month:"long",year:"numeric"})}`,M,29);
      doc.text("support@touchnet.co.za  |  +27 11 000 0000",W-M,29,{align:"right"});
      y=48;
      doc.setFillColor(26,26,26); doc.roundedRect(M,y,cW,16,2,2,"F");
      doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(0,180,180);
      doc.text("SITE ADDRESS",M+4,y+6);
      doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(220,220,220);
      doc.text(address||"—",M+4,y+13); y+=22;
      const cov=available.length>0;
      doc.setFillColor(cov?5:139, cov?150:26, cov?105:26, 0.1);
      doc.setFillColor(cov?15:30, cov?30:10, cov?30:10);
      doc.roundedRect(M,y,cW,18,2,2,"F");
      doc.setDrawColor(cov?0:139, cov?180:26, cov?180:26);
      doc.setLineWidth(0.5); doc.roundedRect(M,y,cW,18,2,2,"S");
      doc.setFontSize(11); doc.setFont("helvetica","bold");
      doc.setTextColor(cov?0:255, cov?212:80, cov?212:80);
      doc.text(cov?`✓  ${available.length} Provider${available.length!==1?"s":""} Available`:"✗  No Coverage Found",M+4,y+8);
      doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(150,150,150);
      doc.text(`${fibre.length} FTTH  ·  ${wireless.length} wireless  ·  ${unavailable.length} not available`,M+4,y+14);
      y+=24;
      if (available.length>0) {
        const highlights=[
          { label:"LOWEST PRICE", value:cheapest?`R${Math.min(...cheapest.provider.plans.map(p=>p.price))}/mo`:"—", sub:cheapest?.provider.name||"" },
          { label:"FASTEST SPEED",value:fastest?`${Math.max(...fastest.provider.plans.map(p=>parseInt(p.speed)))} Mbps`:"—", sub:fastest?.provider.name||"" },
          { label:"PROVIDERS",    value:String(available.length), sub:`${fibre.length} FTTH · ${wireless.length} wireless` },
        ];
        const bW=(cW-8)/3;
        highlights.forEach((h,i)=>{
          const bx=M+i*(bW+4);
          doc.setFillColor(26,26,26); doc.roundedRect(bx,y,bW,20,2,2,"F");
          doc.setDrawColor(0,180,180); doc.setLineWidth(0.3); doc.roundedRect(bx,y,bW,20,2,2,"S");
          doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(0,180,180);
          doc.text(h.label,bx+bW/2,y+6,{align:"center"});
          doc.setFontSize(12); doc.setFont("helvetica","bold"); doc.setTextColor(240,240,240);
          doc.text(h.value,bx+bW/2,y+14,{align:"center"});
          doc.setFontSize(7); doc.setFont("helvetica","normal"); doc.setTextColor(120,120,120);
          doc.text(h.sub,bx+bW/2,y+18.5,{align:"center"});
        });
        y+=26;
        doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(0,180,180);
        doc.text("AVAILABLE PROVIDERS & PLANS",M,y); y+=5;
        const cols=[46,16,20,28,28,22,22];
        const hdrs=["Provider","Type","Top Plan","Download","Upload","From","Contract"];
        doc.setFillColor(0,180,180); doc.rect(M,y,cW,7,"F");
        doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255);
        let cx=M+2; hdrs.forEach((h,i)=>{ doc.text(h,cx,y+5); cx+=cols[i]; }); y+=7;
        available.forEach(({ provider },idx)=>{
          const top=[...provider.plans].sort((a,b)=>parseInt(b.speed)-parseInt(a.speed))[0];
          const cp=[...provider.plans].sort((a,b)=>a.price-b.price)[0];
          const rH=8;
          doc.setFillColor(idx%2===0?26:22, idx%2===0?26:22, idx%2===0?26:22);
          doc.rect(M,y,cW,rH,"F");
          doc.setDrawColor(40,40,40); doc.setLineWidth(0.2); doc.line(M,y+rH,M+cW,y+rH);
          doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(220,220,220);
          cx=M+2; doc.text(provider.name,cx,y+5.5); cx+=cols[0];
          doc.setFont("helvetica","normal"); doc.setTextColor(provider.type==="fibre"?0:14, provider.type==="fibre"?180:165, provider.type==="fibre"?180:233);
          doc.text(provider.type==="fibre"?"FTTH":"FWA",cx,y+5.5); cx+=cols[1];
          doc.setTextColor(0,180,180); doc.text(top.label,cx,y+5.5); cx+=cols[2];
          doc.setFont("helvetica","bold"); doc.setTextColor(240,240,240);
          doc.text(top.speed,cx,y+5.5); cx+=cols[3];
          doc.setFont("helvetica","normal"); doc.setTextColor(120,120,120);
          doc.text(top.upload,cx,y+5.5); cx+=cols[4];
          doc.setFont("helvetica","bold"); doc.setTextColor(0,180,180);
          doc.text(`R${cp.price}/mo`,cx,y+5.5); cx+=cols[5];
          doc.setFont("helvetica","normal"); doc.setTextColor(120,120,120);
          doc.text(`${cp.contract} mo`,cx,y+5.5); y+=rH;
        });
        y+=6;
      }
      const tnOk=available.some(r=>r.provider.id==="touchnet");
      doc.setFillColor(tnOk?15:20, tnOk?30:20, tnOk?30:20);
      doc.roundedRect(M,y,cW,26,2,2,"F");
      doc.setDrawColor(0,180,180); doc.setLineWidth(0.5); doc.roundedRect(M,y,cW,26,2,2,"S");
      doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(0,212,212);
      doc.text(tnOk?"TouchNet is available at this address!":"Get Notified When TouchNet is Available",M+4,y+9);
      doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(180,180,180);
      doc.text(tnOk?"Contact us today to get connected with South Africa's premium fibre provider.":"Register your interest and we'll notify you as soon as coverage is available.",M+4,y+16);
      doc.setFont("helvetica","bold"); doc.setTextColor(0,180,180);
      doc.text("sales@touchnet.co.za  |  +27 11 000 0000  |  www.touchnet.co.za",M+4,y+22); y+=30;
      const pH=297;
      doc.setFillColor(0,180,180); doc.rect(0,pH-12,W,12,"F");
      doc.setFontSize(7); doc.setFont("helvetica","normal"); doc.setTextColor(10,15,15);
      doc.text("Coverage data is indicative only. TouchNet Feasibility System — Automated Report",M,pH-6);
      doc.text(`Ref: TN-FSB-${Date.now().toString(36).toUpperCase()}`,W-M,pH-6,{align:"right"});
      const fname=`TouchNet_Feasibility_${(address||"Report").replace(/[^a-z0-9]/gi,"_").slice(0,30)}_${new Date().toISOString().slice(0,10)}.pdf`;
      doc.save(fname);
    } finally { setExporting(false); }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3"
      style={{ background:"rgba(0,0,0,0.88)", backdropFilter:"blur(20px)" }}>
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background:"#1a1a1a", border:"1px solid rgba(0,212,212,0.25)", boxShadow:"0 40px 100px rgba(0,0,0,0.7)" }}>
        <div className="h-[2px]" style={{ background:"linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.4),#8B1A1A,transparent)" }} />
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.02)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background:"rgba(0,180,180,0.12)", border:"1px solid rgba(0,212,212,0.3)" }}>
              <FileText className="w-5 h-5" style={{ color:"#00b4b4" }} />
            </div>
            <div>
              <h2 className="text-[16px] font-black" style={{ color:"#f0f0f0", fontFamily:"'Space Grotesk',sans-serif" }}>Feasibility Report</h2>
              <p className="text-[11px]" style={{ color:"rgba(0,212,212,0.5)" }}>
                📍 {address?.split(",").slice(0,2).join(",")} · {available.length} provider{available.length!==1?"s":""} available
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportPDF} disabled={exporting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 disabled:opacity-60"
              style={{ background:"linear-gradient(135deg,#8B1A1A,#a52020)", boxShadow:"0 4px 14px rgba(139,26,26,0.4)" }}>
              {exporting?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<Download className="w-3.5 h-3.5"/>}
              {exporting?"Generating…":"Export PDF"}
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
              style={{ border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Verdict */}
          <div className="rounded-2xl p-4"
            style={{ background:available.length>0?"rgba(0,180,180,0.07)":"rgba(139,26,26,0.07)", border:`1px solid ${available.length>0?"rgba(0,180,180,0.3)":"rgba(139,26,26,0.3)"}` }}>
            <div className="flex items-center gap-3">
              {available.length>0 ? <CheckCircle2 className="w-8 h-8 flex-shrink-0" style={{color:"#10b981"}}/>
                                  : <XCircle className="w-8 h-8 flex-shrink-0" style={{color:"#8B1A1A"}}/>}
              <div>
                <p className="text-[15px] font-black" style={{color:available.length>0?"#10b981":"#8B1A1A"}}>
                  {available.length>0?`✅ Fibre available — ${available.length} provider${available.length!==1?"s":""} can service this address`:"❌ No fibre coverage found at this address"}
                </p>
                <p className="text-[11px] mt-0.5" style={{color:"rgba(255,255,255,0.4)"}}>
                  {fibre.length} FTTH fibre · {wireless.length} fixed wireless · {unavailable.length} not yet available
                </p>
              </div>
            </div>
          </div>

          {/* KPI strip */}
          {available.length>0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:"Lowest Price",  emoji:"💰", value:cheapest?`R${Math.min(...cheapest.provider.plans.map(p=>p.price))}/mo`:"—", sub:cheapest?.provider.name, color:"#10b981" },
                { label:"Fastest Speed", emoji:"⚡", value:fastest?`${Math.max(...fastest.provider.plans.map(p=>parseInt(p.speed)))} Mbps`:"—", sub:fastest?.provider.name, color:"#00b4b4" },
                { label:"Providers",     emoji:"🏢", value:available.length, sub:`${fibre.length} fibre · ${wireless.length} wireless`, color:"#8B1A1A" },
              ].map(h=>(
                <div key={h.label} className="rounded-2xl p-3 text-center relative overflow-hidden"
                  style={{background:`${h.color}0d`,border:`1px solid ${h.color}28`}}>
                  <div className="absolute top-0 left-0 right-0 h-[1px]" style={{background:`linear-gradient(90deg,${h.color},transparent)`}}/>
                  <p className="text-xl mb-1">{h.emoji}</p>
                  <p className="text-[9px] uppercase tracking-wider font-black mb-1" style={{color:"rgba(255,255,255,0.3)"}}>{h.label}</p>
                  <p className="text-[15px] font-black mono" style={{color:h.color,fontFamily:"'JetBrains Mono',monospace"}}>{h.value}</p>
                  <p className="text-[10px] mt-0.5" style={{color:"rgba(255,255,255,0.35)"}}>{h.sub}</p>
                </div>
              ))}
            </div>
          )}

          {/* Provider table */}
          {available.length>0 && (
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider mb-2" style={{color:"rgba(0,212,212,0.4)"}}>Available Providers & Plans</p>
              <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.08)"}}>
                <table className="w-full text-left" style={{borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:"rgba(0,180,180,0.06)",borderBottom:"1px solid rgba(0,212,212,0.1)"}}>
                      {["Provider","Type","Fastest","Download","Upload","From","Contract"].map(h=>(
                        <th key={h} className="px-3 py-2.5 text-[9px] font-black uppercase tracking-[0.12em]" style={{color:"rgba(0,212,212,0.45)"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {available.map(({provider})=>{
                      const top=[...provider.plans].sort((a,b)=>parseInt(b.speed)-parseInt(a.speed))[0];
                      const cp=[...provider.plans].sort((a,b)=>a.price-b.price)[0];
                      return (
                        <tr key={provider.id} style={{borderTop:"1px solid rgba(255,255,255,0.05)"}}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(0,180,180,0.04)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{provider.emoji}</span>
                              <div>
                                <p className="text-[12px] font-black" style={{color:provider.color}}>{provider.name}</p>
                                <p className="text-[9px]" style={{color:"rgba(255,255,255,0.3)"}}>{provider.tagline}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase"
                              style={{background:provider.type==="fibre"?"rgba(0,180,180,0.1)":"rgba(14,165,233,0.1)", color:provider.type==="fibre"?"#00b4b4":"#38bdf8", border:provider.type==="fibre"?"1px solid rgba(0,180,180,0.25)":"1px solid rgba(14,165,233,0.25)"}}>
                              {provider.type==="fibre"?"FTTH":"FWA"}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-[12px] font-bold" style={{color:"#e0e0e0"}}>{top.label}</td>
                          <td className="px-3 py-3 text-[13px] font-black mono" style={{color:"#f0f0f0",fontFamily:"'JetBrains Mono',monospace"}}>{top.speed}</td>
                          <td className="px-3 py-3 text-[11px] mono" style={{color:"rgba(255,255,255,0.4)",fontFamily:"'JetBrains Mono',monospace"}}>{top.upload}</td>
                          <td className="px-3 py-3">
                            <span className="text-[14px] font-black" style={{color:provider.color}}>R{cp.price}</span>
                            <span className="text-[10px] ml-1" style={{color:"rgba(255,255,255,0.3)"}}>/mo</span>
                          </td>
                          <td className="px-3 py-3 text-[11px]" style={{color:"rgba(255,255,255,0.4)"}}>{cp.contract} mo</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Unavailable */}
          {unavailable.length>0 && (
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider mb-2" style={{color:"rgba(255,255,255,0.2)"}}>Not Yet Available ({unavailable.length})</p>
              <div className="flex flex-wrap gap-2">
                {unavailable.map(({provider})=>(
                  <div key={provider.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                    style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
                    <span className="text-sm opacity-30">{provider.emoji}</span>
                    <p className="text-[11px]" style={{color:"rgba(255,255,255,0.25)"}}>{provider.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TouchNet CTA */}
          {available.some(r=>r.provider.id==="touchnet") && (
            <div className="rounded-2xl p-4 flex items-center gap-4"
              style={{background:"linear-gradient(135deg,rgba(0,180,180,0.08),rgba(139,26,26,0.04))",border:"1px solid rgba(0,212,212,0.18)"}}>
              <div>
                <p className="text-[13px] font-black" style={{color:"#f0f0f0"}}>TouchNet is available at this address!</p>
                <p className="text-[11px] mt-0.5" style={{color:"rgba(255,255,255,0.4)"}}>Get connected with SA's premium fibre provider.</p>
              </div>
              <button onClick={onSignUp}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-black text-white"
                style={{background:"linear-gradient(135deg,#00b4b4,#007a7a)",boxShadow:"0 4px 16px rgba(0,180,180,0.4)"}}>
                <Zap className="w-4 h-4"/> Sign Up Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function CoverageCheck() {
  const [address,         setAddress]         = useState("");
  const [searching,       setSearching]       = useState(false);
  const [result,          setResult]          = useState(null);
  const [providerResults, setProviderResults] = useState([]);
  const [step,            setStep]            = useState("search");
  const [form,            setForm]            = useState({ name:"", email:"", phone:"", plan:"standard_50mbps" });
  const [submitting,      setSubmitting]      = useState(false);
  const [activeProviders, setActiveProviders] = useState(Object.keys(PROVIDERS));
  const [showReport,      setShowReport]      = useState(false);
  const [sidebarTab,      setSidebarTab]      = useState("check");
  const [scanAnim,        setScanAnim]        = useState(false);
  const [filterType,      setFilterType]      = useState("all");
  const [flyTarget,       setFlyTarget]       = useState(null);
  const [selectedProvider,setSelectedProvider]= useState(null);

  const doSearch = (lat,lng,displayName) => {
    setSearching(false); setScanAnim(true);
    const allResults = checkAllProviders(lat,lng);
    const tn = allResults.find(r=>r.provider.id==="touchnet");
    setResult({ covered:tn?.covered, zone:tn?.zone, lat, lng, displayName });
    setProviderResults(allResults);
    setStep("result"); setSidebarTab("results"); setShowReport(false);
    setFlyTarget({ center:[lat,lng], zoom:14 });
    base44.entities.CoverageSearch.create({
      query:address||displayName, display_name:displayName, lat, lng,
      covered:tn?.covered, nearest_zone:tn?.zone?.label||""
    }).catch(()=>{});
    setTimeout(()=>setScanAnim(false),2200);
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!address.trim()) return;
    setSearching(true); setScanAnim(true); setResult(null); setProviderResults([]);
    try {
      const geo = await geocodeAddress(address);
      doSearch(geo.lat, geo.lng, geo.displayName);
    } catch {
      setResult({ error:"Address not found. Try a suburb, street, or city name." });
      setScanAnim(false);
    } finally { setSearching(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()||!form.email.trim()) return;
    setSubmitting(true);
    try {
      await base44.entities.Referral.create({
        referrer_customer_id:"website_lead", referrer_name:"Coverage Check Lead",
        referrer_email:"website@touchnet.co.za",
        referred_name:form.name, referred_email:form.email, referred_phone:form.phone,
        referred_address:result?.displayName, service_interest:form.plan, status:"submitted",
      });
      setStep("success");
    } finally { setSubmitting(false); }
  };

  const reset = () => {
    setStep("search"); setResult(null); setProviderResults([]); setAddress("");
    setSidebarTab("check"); setShowReport(false); setSelectedProvider(null);
    setFlyTarget({ center:[-29.0,26.0], zoom:6 });
    setForm({ name:"", email:"", phone:"", plan:"standard_50mbps" });
  };

  const toggleProvider = (id) =>
    setActiveProviders(prev=>prev.includes(id)?prev.filter(p=>p!==id):[...prev,id]);

  const availableProviders = providerResults.filter(r=>r.covered);
  const filteredProviders  = filterType==="all" ? Object.values(PROVIDERS) : Object.values(PROVIDERS).filter(p=>p.type===filterType);

  return (
    <div className="flex flex-col" style={{ height:"100vh", background:"#111111", fontFamily:"'Inter',sans-serif" }}>
      <style>{`
        @keyframes ping-teal { 0%{transform:scale(1);opacity:0.8}100%{transform:scale(3);opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.3s ease forwards; }
        .leaflet-container { background:#1a1a1a !important; font-family:'Inter',sans-serif !important; }
        .leaflet-tile { filter: brightness(0.85) saturate(0.7) invert(1) hue-rotate(180deg); }
        .leaflet-popup-content-wrapper {
          background:#1e1e1e !important; border:1px solid rgba(0,212,212,0.25) !important;
          border-radius:14px !important; box-shadow:0 8px 30px rgba(0,0,0,0.5) !important;
          color:#f0f0f0 !important;
        }
        .leaflet-popup-tip { background:#1e1e1e !important; }
        .leaflet-popup-close-button { color:rgba(255,255,255,0.5) !important; }
        .leaflet-control-zoom a {
          background:#1e1e1e !important; border-color:rgba(0,212,212,0.2) !important;
          color:#00b4b4 !important; font-weight:800;
        }
        .leaflet-control-zoom a:hover { background:#252525 !important; }
        .leaflet-control-attribution { background:rgba(17,17,17,0.85) !important; color:rgba(255,255,255,0.3) !important; font-size:9px !important; }
        .leaflet-control-attribution a { color:rgba(0,180,180,0.6) !important; }
      `}</style>

      {/* ── Top bar ─────────────────────────────── */}
      <header className="relative flex items-center justify-between px-5 py-3 flex-shrink-0 z-30"
        style={{ background:"rgba(10,10,10,0.98)", borderBottom:"1px solid rgba(0,212,212,0.12)", backdropFilter:"blur(20px)" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background:"linear-gradient(90deg,#8B1A1A,#00b4b4,#00d4d4,rgba(255,255,255,0.5),#00b4b4,transparent)", backgroundSize:"300% auto", animation:"border-rotate 6s ease infinite" }} />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background:"linear-gradient(135deg,rgba(0,180,180,0.15),rgba(139,26,26,0.08))", border:"1px solid rgba(0,212,212,0.25)" }}>
              <img src={CREST_WHITE} alt="TN" className="w-6 h-6 object-contain" style={{ opacity:0.9 }}/>
            </div>
            <img src={LOGO_TEAL} alt="TouchNet" className="h-6 object-contain" style={{ opacity:0.95 }}/>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background:"rgba(0,180,180,0.06)", border:"1px solid rgba(0,180,180,0.15)" }}>
            <Globe className="w-3 h-3" style={{ color:"#00b4b4" }}/>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color:"rgba(0,212,212,0.6)", fontFamily:"'JetBrains Mono',monospace" }}>FIBRE COVERAGE & FEASIBILITY</span>
          </div>
        </div>
        <Link to="/"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
          style={{ background:"rgba(0,180,180,0.08)", border:"1px solid rgba(0,180,180,0.2)", color:"#00b4b4" }}>
          Portal <ArrowRight className="w-3.5 h-3.5"/>
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ─────────────────────────── */}
        <div className="relative z-20 flex flex-col flex-shrink-0 overflow-hidden"
          style={{ width:350, background:"rgba(16,16,16,0.98)", borderRight:"1px solid rgba(0,212,212,0.1)" }}>

          {/* Tabs */}
          <div className="flex flex-shrink-0" style={{ borderBottom:"1px solid rgba(0,212,212,0.1)" }}>
            {[
              { key:"check",     label:"Check",   icon:Search },
              { key:"providers", label:"Layers",  icon:Layers },
              ...(providerResults.length>0?[{ key:"results", label:`Results (${availableProviders.length})`, icon:Activity }]:[]),
            ].map(tab=>{
              const Icon=tab.icon;
              return (
                <button key={tab.key} onClick={()=>setSidebarTab(tab.key)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-black uppercase tracking-wider transition-all"
                  style={{
                    background:sidebarTab===tab.key?"rgba(0,180,180,0.08)":"transparent",
                    borderBottom:sidebarTab===tab.key?"2px solid #00b4b4":"2px solid transparent",
                    color:sidebarTab===tab.key?"#00d4d4":"rgba(255,255,255,0.25)",
                    marginBottom:-1,
                  }}>
                  <Icon className="w-3.5 h-3.5"/> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 slim-scroll">

            {/* CHECK TAB */}
            {sidebarTab==="check" && (
              <div className="space-y-4 fade-up">
                <div>
                  <h1 className="text-[18px] font-black leading-tight mb-1" style={{ color:"#f0f0f0", fontFamily:"'Space Grotesk',sans-serif" }}>Fibre Feasibility Check</h1>
                  <p className="text-[12px]" style={{ color:"rgba(255,255,255,0.35)" }}>Search any SA address to see all available fibre and wireless providers, plans and pricing.</p>
                </div>
                <form onSubmit={handleSearch} className="space-y-2">
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"rgba(0,212,212,0.6)" }}/>
                    <input value={address} onChange={e=>setAddress(e.target.value)}
                      placeholder="e.g. 12 Rivonia Rd, Sandton…"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-[13px] outline-none transition-all"
                      style={{ background:"#252525", border:"1px solid rgba(255,255,255,0.1)", color:"#f0f0f0" }}
                      onFocus={e=>e.target.style.borderColor="rgba(0,212,212,0.5)"}
                      onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"} />
                  </div>
                  <button type="submit" disabled={searching||!address.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[13px] text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 relative overflow-hidden"
                    style={{ background:"linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow:"0 6px 24px rgba(0,180,180,0.4)", border:"1px solid rgba(0,212,212,0.3)" }}>
                    <div className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)", backgroundSize:"200% 100%", animation:"shimmer 2s infinite" }}/>
                    {searching?<Loader2 className="w-4 h-4 animate-spin relative z-10"/>:<Search className="w-4 h-4 relative z-10"/>}
                    <span className="relative z-10">{searching?"Checking coverage…":"Run Feasibility Check"}</span>
                  </button>
                </form>
                {result?.error && (
                  <div className="rounded-xl p-3 flex items-start gap-2" style={{ background:"rgba(139,26,26,0.1)", border:"1px solid rgba(139,26,26,0.3)" }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color:"#8B1A1A" }}/>
                    <p className="text-[12px]" style={{ color:"#c23030" }}>{result.error}</p>
                  </div>
                )}
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label:"Providers", value:Object.keys(PROVIDERS).length, color:"#00b4b4" },
                    { label:"FTTH",      value:Object.values(PROVIDERS).filter(p=>p.type==="fibre").length, color:"#10b981" },
                    { label:"Wireless",  value:Object.values(PROVIDERS).filter(p=>p.type==="wireless").length, color:"#0ea5e9" },
                  ].map(s=>(
                    <div key={s.label} className="rounded-xl p-3 text-center relative overflow-hidden"
                      style={{ background:`${s.color}0d`, border:`1px solid ${s.color}20` }}>
                      <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background:`linear-gradient(90deg,${s.color},transparent)` }}/>
                      <p className="text-[22px] font-black mono" style={{ color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>{s.value}</p>
                      <p className="text-[9px] uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.3)" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                {/* Why TouchNet card */}
                <div className="rounded-2xl p-4 relative overflow-hidden"
                  style={{ background:"linear-gradient(135deg,rgba(0,180,180,0.06),rgba(139,26,26,0.04))", border:"1px solid rgba(0,212,212,0.12)" }}>
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background:"linear-gradient(90deg,#00b4b4,#8B1A1A,transparent)" }}/>
                  <div className="absolute top-3 left-3 w-4 h-4" style={{ borderTop:"1px solid rgba(0,212,212,0.35)", borderLeft:"1px solid rgba(0,212,212,0.35)" }}/>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color:"rgba(0,212,212,0.5)" }}>Why Choose TouchNet?</p>
                  {[
                    { icon:Zap,       label:"Up to 1 Gbps uncapped fibre", color:"#f59e0b" },
                    { icon:Shield,    label:"99.9% uptime SLA guaranteed",  color:"#10b981" },
                    { icon:Clock,     label:"24/7 local technical support", color:"#00b4b4" },
                    { icon:TrendingUp,label:"No hidden fees or throttling", color:"#8B1A1A" },
                  ].map(({ icon:Icon, label, color })=>(
                    <div key={label} className="flex items-center gap-2 mb-2 last:mb-0">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background:`${color}15`, border:`1px solid ${color}28` }}>
                        <Icon className="w-3 h-3" style={{ color }}/>
                      </div>
                      <p className="text-[11px]" style={{ color:"rgba(255,255,255,0.55)" }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROVIDERS/LAYERS TAB */}
            {sidebarTab==="providers" && (
              <div className="space-y-3 fade-up">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-wider" style={{ color:"rgba(0,212,212,0.4)" }}>Coverage Layers</p>
                  <button onClick={()=>setActiveProviders(Object.keys(PROVIDERS))}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg"
                    style={{ background:"rgba(0,180,180,0.08)", color:"#00b4b4", border:"1px solid rgba(0,180,180,0.2)" }}>
                    Show All
                  </button>
                </div>
                <div className="flex gap-1.5">
                  {[{ k:"all",l:"All"},{ k:"fibre",l:"FTTH"},{ k:"wireless",l:"Wireless"}].map(f=>(
                    <button key={f.k} onClick={()=>setFilterType(f.k)}
                      className="flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                      style={{ background:filterType===f.k?"rgba(0,180,180,0.12)":"rgba(255,255,255,0.03)", border:`1px solid ${filterType===f.k?"rgba(0,212,212,0.3)":"rgba(255,255,255,0.07)"}`, color:filterType===f.k?"#00d4d4":"rgba(255,255,255,0.3)" }}>
                      {f.l}
                    </button>
                  ))}
                </div>
                {filteredProviders.map(p=>(
                  <div key={p.id}
                    className="rounded-xl overflow-hidden transition-all cursor-pointer"
                    style={{ background:activeProviders.includes(p.id)?`${p.color}0d`:"rgba(255,255,255,0.02)", border:`1px solid ${activeProviders.includes(p.id)?p.color+"28":"rgba(255,255,255,0.06)"}` }}
                    onClick={()=>toggleProvider(p.id)}>
                    <div className="flex items-center justify-between px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{p.emoji}</span>
                        <div>
                          <p className="text-[12px] font-black" style={{ color:activeProviders.includes(p.id)?"#f0f0f0":"rgba(255,255,255,0.25)" }}>{p.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                              style={{ background:p.type==="fibre"?"rgba(0,180,180,0.12)":"rgba(14,165,233,0.12)", color:p.type==="fibre"?"#00b4b4":"#38bdf8" }}>
                              {p.type==="fibre"?"FTTH":"FWA"}
                            </span>
                            <span className="text-[9px]" style={{ color:"rgba(255,255,255,0.25)" }}>{p.zones.length} zones</span>
                            <span className="text-[9px]" style={{ color:"rgba(255,255,255,0.2)" }}>★{p.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-9 h-5 rounded-full transition-all duration-200 relative flex-shrink-0"
                        style={{ background:activeProviders.includes(p.id)?p.color:"rgba(255,255,255,0.1)" }}>
                        <span className="block w-3.5 h-3.5 bg-white rounded-full shadow absolute top-0.5 transition-all duration-200"
                          style={{ left:activeProviders.includes(p.id)?"calc(100% - 17px)":"2px" }}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* RESULTS TAB */}
            {sidebarTab==="results" && providerResults.length>0 && (
              <div className="space-y-3 fade-up">
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color:"rgba(0,212,212,0.4)" }}>
                  Feasibility · {result?.displayName?.split(",").slice(0,2).join(",")}
                </p>
                <button onClick={()=>setShowReport(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[12px] text-white transition-all hover:scale-[1.02] relative overflow-hidden"
                  style={{ background:"linear-gradient(135deg,#8B1A1A,#a52020)", boxShadow:"0 6px 20px rgba(139,26,26,0.4)", border:"1px solid rgba(139,26,26,0.35)" }}>
                  <div className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)", backgroundSize:"200% 100%", animation:"shimmer 2s infinite" }}/>
                  <FileText className="w-4 h-4 relative z-10"/> <span className="relative z-10">View Full Feasibility Report</span>
                </button>
                <div className="rounded-xl p-3"
                  style={{ background:availableProviders.length>0?"rgba(0,180,180,0.07)":"rgba(139,26,26,0.07)", border:`1px solid ${availableProviders.length>0?"rgba(0,180,180,0.25)":"rgba(139,26,26,0.25)"}` }}>
                  <div className="flex items-center gap-2">
                    {availableProviders.length>0
                      ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color:"#10b981" }}/>
                      : <XCircle className="w-5 h-5 flex-shrink-0" style={{ color:"#8B1A1A" }}/>}
                    <div>
                      <p className="text-[12px] font-black" style={{ color:availableProviders.length>0?"#10b981":"#8B1A1A" }}>
                        {availableProviders.length>0?`${availableProviders.length} providers available`:"No coverage found"}
                      </p>
                      <p className="text-[10px]" style={{ color:"rgba(255,255,255,0.3)" }}>
                        {availableProviders.filter(r=>r.provider.type==="fibre").length} FTTH · {availableProviders.filter(r=>r.provider.type==="wireless").length} wireless
                      </p>
                    </div>
                  </div>
                </div>
                {availableProviders.length>0 && (
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.2)" }}>Available at this address</p>
                    {availableProviders.map(({ provider, zone })=>(
                      <div key={provider.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                        style={{ background:`${provider.color}0d`, border:`1px solid ${provider.color}25` }}>
                        <span className="text-lg flex-shrink-0">{provider.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-black" style={{ color:"#f0f0f0" }}>{provider.name}</p>
                          <p className="text-[9px] truncate" style={{ color:provider.color }}>✓ {zone?.label}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[11px] font-black mono" style={{ color:provider.color }}>R{Math.min(...provider.plans.map(p=>p.price))}</p>
                          <p className="text-[8px]" style={{ color:"rgba(255,255,255,0.3)" }}>/mo from</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {step==="result" && (
                  <div className="space-y-2 pt-1">
                    {result?.covered
                      ? <button onClick={()=>setStep("form")}
                          className="w-full py-2.5 rounded-xl font-black text-[12px] text-white"
                          style={{ background:"linear-gradient(135deg,#10b981,#059669)" }}>
                          <Zap className="w-4 h-4 inline mr-1"/> Sign Up with TouchNet
                        </button>
                      : <button onClick={()=>setStep("form")}
                          className="w-full py-2.5 rounded-xl font-black text-[12px] text-white"
                          style={{ background:"linear-gradient(135deg,#00b4b4,#007a7a)" }}>
                          <Mail className="w-4 h-4 inline mr-1"/> Notify Me When Available
                        </button>}
                    <button onClick={reset}
                      className="w-full py-2 rounded-xl text-[11px] font-bold"
                      style={{ color:"rgba(255,255,255,0.35)", border:"1px solid rgba(255,255,255,0.08)" }}>
                      <RefreshCw className="w-3.5 h-3.5 inline mr-1"/> New Search
                    </button>
                  </div>
                )}
                {step==="form" && (
                  <div className="rounded-2xl overflow-hidden" style={{ background:"#1e1e1e", border:"1px solid rgba(0,212,212,0.15)" }}>
                    <div className="h-[2px]" style={{ background:"linear-gradient(90deg,#00b4b4,#8B1A1A,transparent)" }}/>
                    <form onSubmit={handleSubmit} className="p-4 space-y-2.5">
                      <p className="text-[12px] font-black" style={{ color:"#00d4d4" }}>{result?.covered?"Connect with TouchNet":"Get notified when available"}</p>
                      {[
                        { field:"name",  label:"Full Name *", icon:User,  type:"text",  placeholder:"John Smith",     req:true },
                        { field:"email", label:"Email *",     icon:Mail,  type:"email", placeholder:"john@email.com", req:true },
                        { field:"phone", label:"Phone",       icon:Phone, type:"tel",   placeholder:"071 234 5678",   req:false },
                      ].map(({ field, label, icon:Icon, type, placeholder, req })=>(
                        <div key={field}>
                          <label className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{ color:"rgba(255,255,255,0.3)" }}>{label}</label>
                          <div className="relative">
                            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color:"rgba(0,212,212,0.45)" }}/>
                            <input required={req} type={type} value={form[field]}
                              onChange={e=>setForm(f=>({...f,[field]:e.target.value}))}
                              placeholder={placeholder}
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[12px] outline-none"
                              style={{ background:"#252525", border:"1px solid rgba(255,255,255,0.1)", color:"#f0f0f0" }}/>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={()=>setStep("result")}
                          className="px-3 py-2 rounded-xl text-[11px] font-bold"
                          style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)" }}>← Back</button>
                        <button type="submit" disabled={submitting}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-bold text-white disabled:opacity-60"
                          style={{ background:"linear-gradient(135deg,#00b4b4,#007a7a)" }}>
                          {submitting?<Loader2 className="w-4 h-4 animate-spin"/>:<Send className="w-4 h-4"/>}
                          {submitting?"Submitting…":result?.covered?"Get Connected":"Notify Me"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                {step==="success" && (
                  <div className="rounded-2xl p-4 text-center" style={{ background:"rgba(0,180,180,0.07)", border:"1px solid rgba(0,180,180,0.25)" }}>
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2" style={{ color:"#10b981" }}/>
                    <p className="text-[13px] font-black" style={{ color:"#10b981" }}>Submitted!</p>
                    <p className="text-[11px] mt-1 mb-3" style={{ color:"rgba(255,255,255,0.4)" }}>We'll be in touch within 24 hours.</p>
                    <button onClick={reset}
                      className="text-[11px] font-bold px-4 py-2 rounded-xl"
                      style={{ background:"rgba(0,180,180,0.08)", border:"1px solid rgba(0,180,180,0.2)", color:"#00b4b4" }}>
                      Check Another Address
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── MAP ─────────────────────────────── */}
        <div className="flex-1 relative">
          <MapContainer
            center={[-29.0, 26.0]}
            zoom={6}
            style={{ width:"100%", height:"100%" }}
            zoomControl={true}
            attributionControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {/* Coverage circles */}
            {Object.values(PROVIDERS).map(provider=>
              activeProviders.includes(provider.id)
                ? provider.zones.map((zone,zi)=>{
                    const cheapPlan=[...provider.plans].sort((a,b)=>a.price-b.price)[0];
                    const fastPlan =[...provider.plans].sort((a,b)=>parseInt(b.speed)-parseInt(a.speed))[0];
                    return (
                      <Circle
                        key={`${provider.id}-${zi}`}
                        center={[zone.lat,zone.lng]}
                        radius={zone.r}
                        pathOptions={{
                          color:provider.color,
                          fillColor:provider.color,
                          fillOpacity:provider.id==="touchnet"?0.20:0.10,
                          weight:provider.id==="touchnet"?2.5:1.5,
                          opacity:provider.id==="touchnet"?0.75:0.50,
                          dashArray:provider.type==="wireless"?"6 4":null,
                        }}>
                        <Popup>
                          <div style={{ fontFamily:"'Inter',sans-serif", minWidth:210 }}>
                            <div className="h-[2px] -mx-3 -mt-3 mb-3" style={{ background:`linear-gradient(90deg,${provider.color},transparent)` }}/>
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                              <span style={{ fontSize:24 }}>{provider.emoji}</span>
                              <div>
                                <p style={{ fontWeight:900, fontSize:14, color:provider.color, margin:0 }}>{provider.name}</p>
                                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0 }}>{zone.label} · {provider.type==="fibre"?"FTTH Fibre":"Fixed Wireless"}</p>
                              </div>
                            </div>
                            <div style={{ background:`${provider.color}14`, borderRadius:8, padding:8, marginBottom:8, border:`1px solid ${provider.color}28` }}>
                              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:5 }}>
                                <span style={{ color:"rgba(255,255,255,0.4)" }}>Fastest plan</span>
                                <span style={{ fontWeight:900, color:provider.color, fontFamily:"monospace" }}>{fastPlan.speed}</span>
                              </div>
                              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:5 }}>
                                <span style={{ color:"rgba(255,255,255,0.4)" }}>Upload</span>
                                <span style={{ fontWeight:600, color:"rgba(255,255,255,0.55)", fontFamily:"monospace" }}>{fastPlan.upload}</span>
                              </div>
                              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}>
                                <span style={{ color:"rgba(255,255,255,0.4)" }}>Starting from</span>
                                <span style={{ fontWeight:900, color:"#10b981", fontFamily:"monospace" }}>R{cheapPlan.price}/mo</span>
                              </div>
                            </div>
                            <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"rgba(255,255,255,0.3)" }}>
                              <span>{provider.plans.length} plans · {provider.uptime} uptime</span>
                              <span style={{ color:provider.type==="fibre"?"#00b4b4":"#38bdf8", fontWeight:700 }}>{provider.type==="fibre"?"FTTH":"FWA"}</span>
                            </div>
                          </div>
                        </Popup>
                      </Circle>
                    );
                  })
                : null
            )}

            {/* Result marker */}
            {result && !result.error && (
              <Marker
                position={[result.lat, result.lng]}
                icon={L.divIcon({
                  className:"",
                  html:`<div style="position:relative">
                    <div style="width:26px;height:26px;border-radius:50%;background:${availableProviders.length>0?"#10b981":"#8B1A1A"};border:3px solid white;box-shadow:0 2px 12px rgba(0,0,0,0.6),0 0 0 6px ${availableProviders.length>0?"rgba(16,185,129,0.2)":"rgba(139,26,26,0.2)"}"></div>
                    <div style="position:absolute;top:-4px;left:-4px;width:34px;height:34px;border-radius:50%;border:2px solid ${availableProviders.length>0?"rgba(16,185,129,0.5)":"rgba(139,26,26,0.5)"};animation:ping-teal 1.5s ease-out infinite"></div>
                  </div>`,
                  iconSize:[26,26], iconAnchor:[13,13],
                })}>
                <Popup>
                  <div style={{ fontFamily:"'Inter',sans-serif", minWidth:220 }}>
                    <p style={{ fontWeight:900, fontSize:13, marginBottom:8, color:"#f0f0f0" }}>📍 {result.displayName?.split(",").slice(0,2).join(",")}</p>
                    {availableProviders.length>0
                      ? <>
                          <p style={{ fontSize:11, color:"#10b981", fontWeight:700, marginBottom:6 }}>✅ {availableProviders.length} provider{availableProviders.length>1?"s":""} available</p>
                          {availableProviders.slice(0,6).map(({ provider })=>(
                            <div key={provider.id} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                              <span>{provider.emoji}</span>
                              <span style={{ fontSize:12, color:"#e0e0e0", fontWeight:600 }}>{provider.name}</span>
                              <span style={{ fontSize:9, color:provider.color, marginLeft:"auto", fontWeight:800 }}>R{Math.min(...provider.plans.map(p=>p.price))}/mo</span>
                            </div>
                          ))}
                        </>
                      : <p style={{ fontSize:11, color:"#8B1A1A", fontWeight:700 }}>❌ No coverage at this location</p>}
                  </div>
                </Popup>
              </Marker>
            )}

            {flyTarget && <MapFlyTo center={flyTarget.center} zoom={flyTarget.zoom}/>}
          </MapContainer>

          {/* Scan animation overlay */}
          {scanAnim && (
            <div className="absolute inset-0 pointer-events-none z-[500] flex items-center justify-center">
              <div className="relative">
                {[80,140,200,270].map((size,i)=>(
                  <div key={i} className="absolute rounded-full"
                    style={{ width:size, height:size, top:-size/2, left:-size/2, border:`2px solid rgba(0,212,212,${0.55-i*0.12})`, animation:`ping-teal ${0.8+i*0.3}s ease-out infinite`, animationDelay:`${i*0.15}s` }}/>
                ))}
                <div className="w-5 h-5 rounded-full" style={{ background:"#00b4b4", boxShadow:"0 0 24px rgba(0,180,180,0.9)" }}/>
              </div>
            </div>
          )}

          {/* Legend panel */}
          <div className="absolute top-3 right-3 z-[400] rounded-2xl overflow-hidden slim-scroll"
            style={{ background:"rgba(16,16,16,0.97)", border:"1px solid rgba(0,212,212,0.18)", boxShadow:"0 4px 24px rgba(0,0,0,0.5)", backdropFilter:"blur(16px)", maxHeight:"calc(100vh - 120px)", overflowY:"auto" }}>
            <div className="h-[2px]" style={{ background:"linear-gradient(90deg,#00b4b4,#8B1A1A,transparent)" }}/>
            <p className="text-[8px] font-black uppercase tracking-[0.22em] px-3 pt-2.5 pb-1" style={{ color:"rgba(0,212,212,0.4)", fontFamily:"'JetBrains Mono',monospace" }}>COVERAGE LAYERS</p>
            {Object.values(PROVIDERS).map(p=>(
              <button key={p.id} onClick={()=>toggleProvider(p.id)}
                className="flex items-center gap-2 px-3 py-1.5 w-full transition-all text-left"
                style={{ background:"transparent" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background:activeProviders.includes(p.id)?p.color:"rgba(255,255,255,0.1)", border:`1.5px solid ${p.color}`, boxShadow:activeProviders.includes(p.id)?`0 0 8px ${p.color}80`:"none" }}/>
                <span className="text-[11px] font-bold" style={{ color:activeProviders.includes(p.id)?"#f0f0f0":"rgba(255,255,255,0.25)" }}>{p.emoji} {p.name}</span>
                <span className="text-[8px] ml-auto font-bold" style={{ color:p.type==="fibre"?"#00b4b4":"#38bdf8" }}>{p.type==="fibre"?"FTTH":"FWA"}</span>
              </button>
            ))}
            <div className="h-2"/>
          </div>

          {/* Bottom status bar */}
          <div className="absolute bottom-3 left-3 right-3 z-[400] flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background:"rgba(16,16,16,0.95)", border:"1px solid rgba(0,212,212,0.15)", backdropFilter:"blur(10px)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:"#00b4b4", boxShadow:"0 0 6px #00b4b4" }}/>
              <span className="text-[10px] font-bold mono" style={{ color:"#00b4b4" }}>LIVE COVERAGE MAP</span>
              <span className="text-[9px]" style={{ color:"rgba(255,255,255,0.3)" }}>· {activeProviders.length}/{Object.keys(PROVIDERS).length} layers · click circles for info</span>
            </div>
            {result && !result.error && providerResults.length>0 && (
              <>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background:availableProviders.length>0?"rgba(0,180,180,0.09)":"rgba(139,26,26,0.08)", border:`1px solid ${availableProviders.length>0?"rgba(0,180,180,0.3)":"rgba(139,26,26,0.25)"}`, backdropFilter:"blur(10px)" }}>
                  {availableProviders.length>0 ? <CheckCircle2 className="w-3.5 h-3.5" style={{color:"#10b981"}}/> : <XCircle className="w-3.5 h-3.5" style={{color:"#8B1A1A"}}/>}
                  <span className="text-[11px] font-bold" style={{ color:availableProviders.length>0?"#10b981":"#c23030" }}>
                    {availableProviders.length>0?`${availableProviders.length} providers available`:"No coverage here"}
                  </span>
                </div>
                <button onClick={()=>setShowReport(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-white transition-all hover:scale-105 relative overflow-hidden"
                  style={{ background:"linear-gradient(135deg,#8B1A1A,#a52020)", boxShadow:"0 4px 14px rgba(139,26,26,0.4)", border:"1px solid rgba(139,26,26,0.35)" }}>
                  <div className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)", backgroundSize:"200% 100%", animation:"shimmer 2s infinite" }}/>
                  <FileText className="w-3.5 h-3.5 relative z-10"/> <span className="relative z-10">Feasibility Report</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showReport && providerResults.length>0 && (
        <FeasibilityReport
          address={result?.displayName}
          providerResults={providerResults}
          result={result}
          onClose={()=>setShowReport(false)}
          onSignUp={()=>{ setShowReport(false); setStep("form"); setSidebarTab("results"); }}
        />
      )}
    </div>
  );
}