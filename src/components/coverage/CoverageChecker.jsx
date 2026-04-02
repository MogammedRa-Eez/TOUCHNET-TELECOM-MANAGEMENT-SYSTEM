import React, { useState } from "react";
import { X, MapPin, CheckCircle2, XCircle, Loader2, Wifi } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function CoverageChecker({ onClose }) {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkCoverage = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    setResult(null);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a coverage checker for TouchNet, a South African fibre ISP operating in Gauteng (Sandton, Johannesburg, Midrand, Centurion, Pretoria areas).
Given the address: "${address}"
Determine if this address is likely within TouchNet's coverage area.
Respond with covered: true if it's in Gauteng/Johannesburg metro area, false otherwise.
Also provide a short friendly message and suggested plan if covered.`,
      response_json_schema: {
        type: "object",
        properties: {
          covered: { type: "boolean" },
          message: { type: "string" },
          suggested_plan: { type: "string" },
          estimated_speed: { type: "string" },
        }
      }
    });

    setResult(res);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,10,0.6)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "rgba(255,255,255,0.98)", border: "1px solid rgba(6,182,212,0.2)" }}>

        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#06b6d4,#6366f1,transparent)" }} />
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(6,182,212,0.1)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
              <MapPin className="w-4 h-4" style={{ color: "#06b6d4" }} />
            </div>
            <div>
              <p className="text-[14px] font-black" style={{ color: "#0f172a" }}>Coverage Checker</p>
              <p className="text-[10px]" style={{ color: "#94a3b8" }}>Check if TouchNet serves your area</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <form onSubmit={checkCoverage} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "#94a3b8" }}>
                Your Address
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. 15 Rivonia Road, Sandton"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !address.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 4px 16px rgba(6,182,212,0.3)" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              {loading ? "Checking coverage…" : "Check Coverage"}
            </button>
          </form>

          {result && (
            <div className="rounded-2xl overflow-hidden"
              style={{
                border: `1px solid ${result.covered ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
                background: result.covered ? "rgba(16,185,129,0.05)" : "rgba(239,68,68,0.04)",
              }}>
              <div className="h-[2px]"
                style={{ background: result.covered ? "linear-gradient(90deg,#10b981,transparent)" : "linear-gradient(90deg,#ef4444,transparent)" }} />
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {result.covered
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-[13px] font-bold mb-1"
                      style={{ color: result.covered ? "#059669" : "#dc2626" }}>
                      {result.covered ? "Coverage Available!" : "Outside Coverage Area"}
                    </p>
                    <p className="text-[12px] leading-relaxed" style={{ color: "#475569" }}>{result.message}</p>

                    {result.covered && result.suggested_plan && (
                      <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.15)" }}>
                        <Wifi className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#06b6d4" }} />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#06b6d4" }}>Recommended Plan</p>
                          <p className="text-[12px] font-semibold" style={{ color: "#0f172a" }}>{result.suggested_plan}</p>
                          {result.estimated_speed && (
                            <p className="text-[11px]" style={{ color: "#64748b" }}>{result.estimated_speed}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {result.covered && (
                      <a href="mailto:sales@touchnet.co.za?subject=Coverage%20Enquiry"
                        className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-2 rounded-xl text-white transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                        Contact Sales →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}