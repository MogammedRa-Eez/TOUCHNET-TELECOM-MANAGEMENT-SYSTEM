import React, { useRef, useState, useEffect } from "react";
import { RotateCcw, PenLine } from "lucide-react";

export default function SignaturePad({ onSignature, disabled }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const lastPos = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    if (disabled) return;
    e.preventDefault();
    setDrawing(true);
    setHasSignature(true);
    const canvas = canvasRef.current;
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e) => {
    if (!drawing || disabled) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    setDrawing(false);
    lastPos.current = null;
    // Notify parent with data URL
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onSignature?.(dataUrl);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignature?.(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <PenLine className="w-4 h-4" style={{ color: "#6366f1" }} />
          <span className="text-sm font-bold" style={{ color: "#334155" }}>Sign Here</span>
        </div>
        {hasSignature && !disabled && (
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors hover:bg-red-50"
            style={{ color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <RotateCcw className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      <div
        className="rounded-xl overflow-hidden relative"
        style={{
          border: `2px dashed ${hasSignature ? "#6366f1" : "rgba(99,102,241,0.3)"}`,
          background: disabled ? "#f8fafc" : "#ffffff",
          cursor: disabled ? "not-allowed" : "crosshair",
          transition: "border-color 0.2s",
        }}
      >
        {!hasSignature && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm" style={{ color: "rgba(148,163,184,0.8)" }}>Draw your signature above</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={700}
          height={160}
          className="w-full block"
          style={{ touchAction: "none" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>

      {/* Signature line label */}
      <div className="px-4">
        <div className="border-t border-slate-300" />
        <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "#94a3b8" }}>
          Authorised Signature &amp; Date: {new Date().toLocaleDateString("en-ZA")}
        </p>
      </div>
    </div>
  );
}