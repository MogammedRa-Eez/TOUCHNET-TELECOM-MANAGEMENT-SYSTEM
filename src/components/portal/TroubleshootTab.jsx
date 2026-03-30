import React, { useState } from "react";
import {
  Wifi, Router, RefreshCw, CheckCircle2, XCircle, AlertTriangle,
  ChevronDown, ChevronUp, ChevronRight, Zap, Monitor, Phone,
  RotateCcw, Power, Cable, Signal, HelpCircle, ArrowRight
} from "lucide-react";

const GUIDES = [
  {
    id: "no_internet",
    icon: Wifi,
    color: "#ef4444",
    title: "No Internet Connection",
    desc: "Completely offline — can't browse or stream",
    steps: [
      { title: "Check all cables", detail: "Ensure the fibre cable from the wall is firmly plugged into your ONT/router. Look for any visible damage or loose connections.", icon: Cable },
      { title: "Check lights on your ONT/router", detail: "Your ONT (white box) should have a green PON or LOS light. If LOS is red, there's a physical fibre issue — contact support. If power light is off, check the power cable.", icon: Power },
      { title: "Restart your router", detail: "Unplug the router power cable, wait 30 seconds, then plug it back in. Wait 2 minutes for it to fully reconnect before testing.", icon: RotateCcw },
      { title: "Restart your ONT", detail: "If you have a separate ONT (optical network terminal), power it off, wait 60 seconds, then restart it before the router.", icon: RefreshCw },
      { title: "Test with a wired device", detail: "Connect a laptop directly to the router using an ethernet cable. If wired works but WiFi doesn't, the issue is your WiFi — not the connection.", icon: Monitor },
      { title: "Still no luck?", detail: "Submit a support ticket below — our team typically responds within 2 hours for connectivity issues.", icon: HelpCircle, action: true },
    ],
  },
  {
    id: "slow_speed",
    icon: Zap,
    color: "#f59e0b",
    title: "Slow Internet Speed",
    desc: "Connection works but speeds are lower than expected",
    steps: [
      { title: "Run a speed test", detail: "Visit fast.com or speedtest.net to check your current speeds. Note the results. Compare to your plan speed (e.g. 100Mbps plan should get ~90+ Mbps on wired).", icon: Signal },
      { title: "Test wired vs WiFi", detail: "Connect via ethernet cable and rerun the speed test. WiFi speeds are typically 20-40% slower than wired — this is normal. If wired is also slow, proceed.", icon: Cable },
      { title: "Reduce connected devices", detail: "Many devices streaming/downloading simultaneously will reduce speeds. Disconnect other devices and retest.", icon: Monitor },
      { title: "Restart your router", detail: "Unplug the router, wait 30 seconds, plug back in. Wait 2 minutes and retest speeds.", icon: RotateCcw },
      { title: "Check router placement", detail: "Move your router to a central location, away from walls, microwaves, and other electronics. Avoid placing it in a cabinet or behind the TV.", icon: Router },
      { title: "Check for background downloads", detail: "Computers often run Windows/app updates in the background. Check Task Manager (Windows) or Activity Monitor (Mac) for high network usage.", icon: Monitor },
      { title: "Persistent slow speeds?", detail: "If speeds are consistently below 50% of your plan, log a support ticket with your speed test results so our team can investigate.", icon: HelpCircle, action: true },
    ],
  },
  {
    id: "wifi_issues",
    icon: Router,
    color: "#8b5cf6",
    title: "WiFi Not Working / Dropping",
    desc: "WiFi disconnects frequently or devices can't connect",
    steps: [
      { title: "Restart your router", detail: "Unplug the router power, wait 30 seconds, plug it back in. Allow 2 minutes for it to fully boot before reconnecting devices.", icon: RotateCcw },
      { title: "Forget and reconnect to the network", detail: "On your device, go to WiFi settings, find your network, tap 'Forget', then reconnect and re-enter the password.", icon: Wifi },
      { title: "Check WiFi password", detail: "Ensure you're entering the correct password. The WiFi name (SSID) and password are usually on a sticker on the bottom of your router.", icon: Router },
      { title: "Move closer to the router", detail: "WiFi signal degrades with distance and walls. Move closer to the router and test. If signal improves, consider a WiFi extender.", icon: Signal },
      { title: "Check the 2.4GHz vs 5GHz band", detail: "Most modern routers broadcast two bands. 5GHz is faster but shorter range. 2.4GHz is slower but better range. Try connecting to the other band.", icon: Wifi },
      { title: "Check max connected devices", detail: "Basic routers handle 10-20 devices. If you have many devices, older devices may get dropped. Check your router admin panel.", icon: Monitor },
      { title: "Still dropping?", detail: "This may indicate a router hardware fault. Submit a support ticket and our team can arrange a router replacement if needed.", icon: HelpCircle, action: true },
    ],
  },
  {
    id: "ont_lights",
    icon: Power,
    color: "#06b6d4",
    title: "Understanding ONT/Router Lights",
    desc: "Decode what the lights on your devices mean",
    steps: [
      { title: "Power light (green) ✓", detail: "Device is powered on and running normally.", icon: CheckCircle2 },
      { title: "Power light (off) ✗", detail: "Device has no power. Check the power adapter and wall socket. Try a different wall socket.", icon: XCircle },
      { title: "PON/Fibre light (green) ✓", detail: "Fibre signal is being received correctly. This is the most important light.", icon: CheckCircle2 },
      { title: "LOS light (red) ✗", detail: "Loss of Signal — the fibre cable is not getting a signal. Check the green fibre cable is plugged in. Do not bend or kink the fibre cable. Log a support ticket if LOS stays red after checking connections.", icon: XCircle },
      { title: "Internet/WAN light (green) ✓", detail: "Successfully connected to the internet. All good!", icon: CheckCircle2 },
      { title: "Internet/WAN light (red/off) ✗", detail: "The ONT is receiving signal but the internet connection failed. Try restarting. If it persists, there may be a provisioning issue — contact support.", icon: AlertTriangle },
      { title: "WiFi light (green) ✓", detail: "WiFi is broadcasting normally. Devices should be able to connect.", icon: CheckCircle2 },
    ],
  },
  {
    id: "cant_stream",
    icon: Monitor,
    color: "#10b981",
    title: "Streaming / Video Call Issues",
    desc: "Buffering, lag, or poor video quality on Netflix, Zoom, etc.",
    steps: [
      { title: "Check your speed", detail: "Netflix HD requires 5 Mbps, 4K needs 25 Mbps. Zoom HD video needs 3 Mbps up/down. Run a speed test at fast.com.", icon: Signal },
      { title: "Use wired instead of WiFi", detail: "For streaming and video calls, connect your device directly to the router via ethernet for a more stable connection.", icon: Cable },
      { title: "Close other bandwidth-heavy apps", detail: "Other devices streaming, gaming, or downloading can cause buffering. Pause or close them during your stream/call.", icon: Monitor },
      { title: "Lower stream quality temporarily", detail: "On Netflix, go to Account → Playback Settings and reduce to Medium or Low. On YouTube, manually select a lower quality (480p or 720p).", icon: Zap },
      { title: "Restart the streaming app/browser", detail: "Close the app or browser tab completely and reopen. Clear the cache in your browser if using a web browser.", icon: RefreshCw },
      { title: "Check the streaming service status", detail: "Visit downdetector.com to check if Netflix, YouTube, or Zoom are having outages. Sometimes the problem is on their end.", icon: HelpCircle },
    ],
  },
  {
    id: "new_device",
    icon: Phone,
    color: "#6366f1",
    title: "Connect a New Device",
    desc: "Set up a new phone, laptop, TV, or smart device on your network",
    steps: [
      { title: "Find your WiFi name and password", detail: "Check the sticker on the bottom or back of your router. Look for 'SSID' (WiFi name) and 'Password' or 'WPA Key'.", icon: Router },
      { title: "Connect on phone/tablet", detail: "Go to Settings → WiFi → Select your network name → Enter password → Connect.", icon: Phone },
      { title: "Connect on laptop (Windows)", detail: "Click the WiFi icon in the taskbar → Select your network → Enter password → Connect.", icon: Monitor },
      { title: "Connect on laptop (Mac)", detail: "Click the WiFi icon in the menu bar → Select your network → Enter password → Join.", icon: Monitor },
      { title: "Connect a smart TV", detail: "Go to TV Settings → Network → WiFi → Select your network → Enter password. If the TV has an ethernet port, use a cable for better performance.", icon: Monitor },
      { title: "Connect via ethernet (best performance)", detail: "Plug an ethernet cable from any LAN port on your router to the device. This gives maximum speed and stability — no password needed.", icon: Cable },
      { title: "Device still won't connect?", detail: "Restart both the router and the device. If a specific device won't connect, it may have network settings that need to be reset.", icon: HelpCircle },
    ],
  },
];

function GuideCard({ guide, onOpenTicket }) {
  const [open, setOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const Icon = guide.icon;

  const toggleStep = (i) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: "rgba(255,255,255,0.97)",
        border: `1px solid ${open ? guide.color + "30" : "rgba(226,232,240,0.8)"}`,
        boxShadow: open ? `0 4px 24px ${guide.color}12` : "0 1px 6px rgba(0,0,0,0.04)",
      }}>
      {/* Top accent when open */}
      {open && <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${guide.color}, transparent)` }} />}

      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50"
      >
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${guide.color}12`, border: `1px solid ${guide.color}20` }}>
          <Icon className="w-5 h-5" style={{ color: guide.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-black" style={{ color: "#1e293b" }}>{guide.title}</p>
          <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>{guide.desc}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {open && completedSteps.size > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${guide.color}12`, color: guide.color, border: `1px solid ${guide.color}25` }}>
              {completedSteps.size}/{guide.steps.length}
            </span>
          )}
          {open
            ? <ChevronUp className="w-4 h-4" style={{ color: "#94a3b8" }} />
            : <ChevronDown className="w-4 h-4" style={{ color: "#94a3b8" }} />}
        </div>
      </button>

      {/* Steps */}
      {open && (
        <div className="px-5 pb-5 space-y-2">
          <div className="w-full h-1.5 rounded-full mb-4" style={{ background: "rgba(226,232,240,0.8)" }}>
            <div className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${(completedSteps.size / guide.steps.length) * 100}%`,
                background: `linear-gradient(90deg, ${guide.color}, ${guide.color}99)`,
              }} />
          </div>

          {guide.steps.map((step, i) => {
            const StepIcon = step.icon;
            const done = completedSteps.has(i);
            const isAction = step.action;
            return (
              <div key={i}
                className="flex items-start gap-3 rounded-xl p-3.5 transition-all cursor-pointer"
                style={{
                  background: done ? `${guide.color}08` : "rgba(248,250,252,0.9)",
                  border: `1px solid ${done ? guide.color + "20" : "rgba(226,232,240,0.8)"}`,
                }}
                onClick={() => !isAction && toggleStep(i)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {done
                    ? <CheckCircle2 className="w-5 h-5" style={{ color: guide.color }} />
                    : <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: "rgba(203,213,225,1)" }}>
                        <span className="text-[9px] font-black" style={{ color: "#94a3b8" }}>{i + 1}</span>
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StepIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: done ? guide.color : "#64748b" }} />
                    <p className="text-[13px] font-bold" style={{ color: done ? guide.color : "#334155" }}>{step.title}</p>
                  </div>
                  <p className="text-[12px] leading-relaxed" style={{ color: "#64748b" }}>{step.detail}</p>
                  {isAction && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onOpenTicket(); }}
                      className="mt-2 flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                      style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)" }}>
                      Submit a Support Ticket <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {!isAction && (
                  <span className="text-[9px] font-bold flex-shrink-0 mt-0.5" style={{ color: done ? guide.color : "#cbd5e1" }}>
                    {done ? "✓ Done" : "Tap"}
                  </span>
                )}
              </div>
            );
          })}

          {completedSteps.size === guide.steps.filter(s => !s.action).length && completedSteps.size > 0 && (
            <div className="rounded-xl p-3 flex items-center gap-3 mt-2"
              style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <p className="text-[12px] font-semibold" style={{ color: "#059669" }}>
                Great job! If your issue is resolved, you're all set. If not, please submit a support ticket.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TroubleshootTab({ onOpenTicket }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl p-5"
        style={{
          background: "linear-gradient(135deg,rgba(99,102,241,0.07),rgba(6,182,212,0.05))",
          border: "1px solid rgba(99,102,241,0.15)",
        }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <Wifi className="w-6 h-6" style={{ color: "#6366f1" }} />
          </div>
          <div>
            <h2 className="text-[16px] font-black" style={{ color: "#1e293b" }}>Self-Service Troubleshooter</h2>
            <p className="text-[12px] mt-1" style={{ color: "#64748b" }}>
              Resolve most connectivity and device issues yourself with our step-by-step guides. Tap any issue to get started — check off each step as you go.
            </p>
          </div>
        </div>

        {/* Quick tips strip */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "Most issues resolved by restarting your router", icon: RotateCcw, color: "#6366f1" },
            { label: "Always test wired before WiFi for accurate diagnosis", icon: Cable, color: "#06b6d4" },
            { label: "Log a ticket if steps don't fix the problem", icon: HelpCircle, color: "#f59e0b" },
          ].map((tip, i) => {
            const TipIcon = tip.icon;
            return (
              <div key={i} className="rounded-xl p-3 flex flex-col gap-1.5"
                style={{ background: `${tip.color}08`, border: `1px solid ${tip.color}15` }}>
                <TipIcon className="w-4 h-4" style={{ color: tip.color }} />
                <p className="text-[10px] leading-tight" style={{ color: "#64748b" }}>{tip.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guides */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] px-1" style={{ color: "#94a3b8" }}>
          Select your issue to begin
        </p>
        {GUIDES.map(guide => (
          <GuideCard key={guide.id} guide={guide} onOpenTicket={onOpenTicket} />
        ))}
      </div>

      {/* CTA at bottom */}
      <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4"
        style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(239,68,68,0.15)" }}>
        <div className="flex-1">
          <p className="text-[13px] font-black" style={{ color: "#1e293b" }}>Still having trouble?</p>
          <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>
            Our technical team is ready to help. Submit a support ticket and we'll get back to you quickly.
          </p>
        </div>
        <button
          onClick={onOpenTicket}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-bold text-white transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
          <ChevronRight className="w-4 h-4" /> Contact Support
        </button>
      </div>
    </div>
  );
}