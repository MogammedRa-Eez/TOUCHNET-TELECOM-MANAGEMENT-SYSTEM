import React from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

export default function CoverageChecker({ onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.3)", boxShadow: "0 40px 100px rgba(0,0,0,0.7)" }}>
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.5),#8B1A1A,transparent)" }} />
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <p className="text-[14px] font-black" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk', sans-serif" }}>
              Fibre Coverage Check
            </p>
            <p className="text-[10px] mono mt-0.5" style={{ color: "rgba(0,212,212,0.5)" }}>
              Check if your address is covered
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(0,180,180,0.1)", border: "1px solid rgba(0,212,212,0.25)" }}>
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="#00d4d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-[14px] font-bold mb-2" style={{ color: "#e0e0e0" }}>
              Check fibre availability at your address
            </p>
            <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>
              View all available providers, plans, and pricing for any South African address on our interactive coverage map.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-bold"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
              Cancel
            </button>
            <Link to="/CoverageCheck" onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold text-white"
              style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 16px rgba(0,180,180,0.35)" }}>
              Open Coverage Map →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}