import React from "react";
import { X } from "lucide-react";

export default function CoverageChecker({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(10,15,40,0.75)", backdropFilter: "blur(16px)" }}
    >
      <div
        className="relative w-full max-w-6xl rounded-2xl overflow-hidden"
        style={{
          height: "90vh",
          border: "1px solid rgba(30,45,110,0.3)",
          boxShadow: "0 24px 80px rgba(30,45,110,0.3)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:scale-110"
          style={{
            background: "rgba(15,26,61,0.85)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#ffffff",
          }}
        >
          <X className="w-4 h-4" />
        </button>
        <iframe
          src="/CoverageCheck"
          title="Coverage Check"
          className="w-full h-full border-0"
          style={{ borderRadius: "inherit" }}
        />
      </div>
    </div>
  );
}