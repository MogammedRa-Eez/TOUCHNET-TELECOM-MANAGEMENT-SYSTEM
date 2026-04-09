import React from "react";
import { X } from "lucide-react";
import CoverageCheck from "@/pages/CoverageCheck";

export default function CoverageChecker({ onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
      <div className="absolute inset-4 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:scale-110"
          style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
        >
          <X className="w-4 h-4" />
        </button>
        <CoverageCheck />
      </div>
    </div>
  );
}