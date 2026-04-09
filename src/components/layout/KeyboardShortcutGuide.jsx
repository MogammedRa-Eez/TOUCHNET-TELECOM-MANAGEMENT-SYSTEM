import React, { useEffect } from "react";
import { X, Keyboard } from "lucide-react";

const SECTIONS = [
  {
    title: "Global",
    shortcuts: [
      { keys: ["N"], description: "Open quick actions menu" },
      { keys: ["?"], description: "Toggle keyboard shortcuts guide" },
      { keys: ["Esc"], description: "Close any open modal or menu" },
    ],
  },
  {
    title: "Billing",
    shortcuts: [
      { keys: ["Click row"], description: "Expand invoice details" },
      { keys: ["✓ Paid button"], description: "Mark invoice as paid instantly" },
      { keys: ["S badge"], description: "Hover to see Sage sync status" },
    ],
  },
  {
    title: "Quotes",
    shortcuts: [
      { keys: ["Click row"], description: "Expand quote details" },
      { keys: ["↓ Status"], description: "Change quote status inline" },
    ],
  },
];

export default function KeyboardShortcutGuide({ onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(4,3,15,0.88)", backdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(175deg,#0d0a20,#090618)",
          border: "1px solid rgba(139,92,246,0.35)",
          boxShadow: "0 24px 64px rgba(139,92,246,0.2)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4,transparent)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
              <Keyboard className="w-4 h-4" style={{ color: "#818cf8" }} />
            </div>
            <div>
              <p className="text-[14px] font-black" style={{ color: "#e8d5ff" }}>Keyboard Shortcuts</p>
              <p className="text-[10px] mono" style={{ color: "rgba(148,163,184,0.6)" }}>Press ? to toggle · Esc to close</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Shortcuts */}
        <div className="p-6 space-y-5">
          {SECTIONS.map(section => (
            <div key={section.title}>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: "rgba(196,181,253,0.4)" }}>
                {section.title}
              </p>
              <div className="space-y-2">
                {section.shortcuts.map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 px-3 py-2 rounded-xl"
                    style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}>
                    <span className="text-[12px]" style={{ color: "rgba(203,181,253,0.7)" }}>{s.description}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {s.keys.map((k, ki) => (
                        <React.Fragment key={ki}>
                          <kbd className="px-2 py-1 rounded-md text-[10px] font-black"
                            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#818cf8", fontFamily: "'JetBrains Mono',monospace" }}>
                            {k}
                          </kbd>
                          {ki < s.keys.length - 1 && (
                            <span className="text-[10px]" style={{ color: "rgba(203,181,253,0.3)" }}>+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3" style={{ borderTop: "1px solid rgba(139,92,246,0.1)", background: "rgba(99,102,241,0.04)" }}>
          <p className="text-[10px] text-center" style={{ color: "rgba(196,181,253,0.3)" }}>
            TouchNet TMS · Keyboard Navigation Guide
          </p>
        </div>
      </div>
    </div>
  );
}