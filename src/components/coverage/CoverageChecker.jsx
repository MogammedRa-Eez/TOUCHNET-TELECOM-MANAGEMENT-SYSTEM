import React from "react";
import { X } from "lucide-react";
import CoverageCheck from "@/pages/CoverageCheck";

export default function CoverageChecker({ onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden" style={{ background: "rgba(15,26,61,0.6)", backdropFilter: "blur(8px)" }}>
      <div className="absolute inset-4 rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ background: "#eef0f7" }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:scale-110"
          style={{ background: "rgba(196,30,58,0.1)", border: "1px solid rgba(196,30,58,0.2)", color: "#c41e3a" }}
        >
          <X className="w-4 h-4" />
        </button>
        <CoverageCheck />
      </div>
    </div>
  );
}