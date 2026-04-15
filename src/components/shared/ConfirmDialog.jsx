import React from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * Dark-themed confirmation dialog.
 * Usage: <ConfirmDialog title="..." message="..." onConfirm={fn} onCancel={fn} danger />
 */
export default function ConfirmDialog({ title, message, onConfirm, onCancel, danger = true, confirmLabel = "Delete" }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(15,26,61,0.55)", backdropFilter: "blur(12px)" }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "#ffffff",
          border: `1px solid ${danger ? "rgba(196,30,58,0.25)" : "rgba(30,45,110,0.2)"}`,
          boxShadow: `0 20px 60px ${danger ? "rgba(196,30,58,0.15)" : "rgba(30,45,110,0.15)"}`,
        }}>
        <div className="h-[3px]" style={{ background: danger ? "linear-gradient(90deg,#c41e3a,#e02347,transparent)" : "linear-gradient(90deg,#1e2d6e,#4a5fa8,transparent)" }} />
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: danger ? "rgba(196,30,58,0.08)" : "rgba(30,45,110,0.08)", border: `1px solid ${danger ? "rgba(196,30,58,0.2)" : "rgba(30,45,110,0.15)"}` }}>
              <AlertTriangle className="w-5 h-5" style={{ color: danger ? "#c41e3a" : "#1e2d6e" }} />
            </div>
            <div>
              <p className="text-[15px] font-black" style={{ color: "#1e2d6e" }}>{title}</p>
              <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "rgba(30,45,110,0.55)" }}>{message}</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
              style={{ background: "rgba(30,45,110,0.06)", border: "1px solid rgba(30,45,110,0.14)", color: "#1e2d6e" }}>
              Cancel
            </button>
            <button onClick={onConfirm}
              className="px-4 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
              style={{
                background: danger ? "linear-gradient(135deg,#c41e3a,#e02347)" : "linear-gradient(135deg,#1e2d6e,#2a3d8f)",
                boxShadow: danger ? "0 4px 14px rgba(196,30,58,0.3)" : "0 4px 14px rgba(30,45,110,0.25)",
              }}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}