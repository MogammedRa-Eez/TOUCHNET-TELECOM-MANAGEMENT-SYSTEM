import React from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * Dark-themed confirmation dialog.
 * Usage: <ConfirmDialog title="..." message="..." onConfirm={fn} onCancel={fn} danger />
 */
export default function ConfirmDialog({ title, message, onConfirm, onCancel, danger = true, confirmLabel = "Delete" }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(4,3,15,0.88)", backdropFilter: "blur(14px)" }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(175deg,#0d0a20,#090618)",
          border: `1px solid ${danger ? "rgba(239,68,68,0.35)" : "rgba(139,92,246,0.35)"}`,
          boxShadow: `0 24px 64px ${danger ? "rgba(239,68,68,0.2)" : "rgba(139,92,246,0.2)"}`,
        }}>
        <div className="h-[3px]" style={{ background: danger ? "linear-gradient(90deg,#ef4444,#f97316,transparent)" : "linear-gradient(90deg,#6366f1,#8b5cf6,transparent)" }} />
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: danger ? "rgba(239,68,68,0.12)" : "rgba(139,92,246,0.12)", border: `1px solid ${danger ? "rgba(239,68,68,0.3)" : "rgba(139,92,246,0.3)"}` }}>
              <AlertTriangle className="w-5 h-5" style={{ color: danger ? "#ef4444" : "#a78bfa" }} />
            </div>
            <div>
              <p className="text-[15px] font-black" style={{ color: "#e8d5ff" }}>{title}</p>
              <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "rgba(196,181,253,0.65)" }}>{message}</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
              style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}>
              Cancel
            </button>
            <button onClick={onConfirm}
              className="px-4 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
              style={{
                background: danger ? "linear-gradient(135deg,#dc2626,#ef4444)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                boxShadow: danger ? "0 4px 14px rgba(239,68,68,0.35)" : "0 4px 14px rgba(99,102,241,0.35)",
              }}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}