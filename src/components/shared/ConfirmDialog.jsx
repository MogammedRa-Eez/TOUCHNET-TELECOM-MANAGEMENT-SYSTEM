import React from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ title, message, onConfirm, onCancel, danger = true, confirmLabel = "Delete" }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "#1a1a1a",
          border: `1px solid ${danger ? "rgba(224,35,71,0.35)" : "rgba(0,180,180,0.3)"}`,
          boxShadow: `0 20px 60px ${danger ? "rgba(224,35,71,0.2)" : "rgba(0,180,180,0.15)"}`,
        }}>
        <div className="h-[2px]" style={{ background: danger ? "linear-gradient(90deg,#e02347,#ff3358,transparent)" : "linear-gradient(90deg,#00b4b4,#00d4d4,transparent)" }} />
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: danger ? "rgba(224,35,71,0.12)" : "rgba(0,180,180,0.12)", border: `1px solid ${danger ? "rgba(224,35,71,0.3)" : "rgba(0,180,180,0.3)"}` }}>
              <AlertTriangle className="w-5 h-5" style={{ color: danger ? "#e02347" : "#00b4b4" }} />
            </div>
            <div>
              <p className="text-[15px] font-black" style={{ color: "#f0f0f0" }}>{title}</p>
              <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{message}</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#b0b0b0" }}>
              Cancel
            </button>
            <button onClick={onConfirm}
              className="px-4 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
              style={{
                background: danger ? "linear-gradient(135deg,#e02347,#ff3358)" : "linear-gradient(135deg,#00b4b4,#007a7a)",
                boxShadow: danger ? "0 4px 14px rgba(224,35,71,0.35)" : "0 4px 14px rgba(0,180,180,0.3)",
              }}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}