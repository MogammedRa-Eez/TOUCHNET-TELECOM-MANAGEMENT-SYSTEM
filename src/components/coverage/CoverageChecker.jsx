import React, { useState } from "react";
import { X, MapPin, Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function CoverageChecker({ onClose }) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const checkCoverage = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a coverage checker for TouchNet Telecommunications, a South African fibre internet provider operating primarily in Gauteng (Johannesburg, Sandton, Midrand, Pretoria, Centurion, Randburg, Roodepoort and surrounding areas).

The user has entered this address: "${address}"

Determine if this address is likely within a South African urban/suburban area where fibre internet coverage would be available.

Respond with a JSON object only:
{
  "covered": true or false,
  "confidence": "high", "medium", or "low",
  "area": "detected area name",
  "message": "short friendly message to the customer"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            covered: { type: "boolean" },
            confidence: { type: "string" },
            area: { type: "string" },
            message: { type: "string" },
          },
        },
      });
      setResult(res);
    } catch {
      setResult({ covered: false, confidence: "low", area: "", message: "Unable to check coverage at this time. Please contact us directly." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: "white", boxShadow: "0 24px 64px rgba(6,182,212,0.2)" }}
        onClick={e => e.stopPropagation()}>

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
              <p className="text-[11px]" style={{ color: "#94a3b8" }}>Check fibre availability at your address</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={e => e.key === "Enter" && checkCoverage()}
              placeholder="Enter your address or area…"
              className="flex-1 px-4 py-3 rounded-xl text-[13px] outline-none"
              style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(6,182,212,0.2)", color: "#1e293b" }}
              autoFocus
            />
            <button
              onClick={checkCoverage}
              disabled={loading || !address.trim()}
              className="px-4 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 4px 16px rgba(6,182,212,0.3)" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>

          {loading && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)" }}>
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: "#06b6d4" }} />
              <p className="text-[13px]" style={{ color: "#0891b2" }}>Checking coverage…</p>
            </div>
          )}

          {result && !loading && (
            <div className="rounded-2xl overflow-hidden"
              style={{
                border: `1px solid ${result.covered ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"}`,
                background: result.covered ? "rgba(16,185,129,0.04)" : "rgba(239,68,68,0.04)",
              }}>
              <div className="h-[2px]"
                style={{ background: `linear-gradient(90deg, ${result.covered ? "#10b981" : "#ef4444"}, transparent)` }} />
              <div className="flex items-start gap-3 p-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: result.covered ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)",
                    border: `1px solid ${result.covered ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"}`,
                  }}>
                  {result.covered
                    ? <CheckCircle2 className="w-5 h-5" style={{ color: "#10b981" }} />
                    : <XCircle className="w-5 h-5" style={{ color: "#ef4444" }} />}
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-black" style={{ color: result.covered ? "#059669" : "#dc2626" }}>
                    {result.covered ? "Coverage Available!" : "Not Yet Covered"}
                  </p>
                  {result.area && (
                    <p className="text-[11px] font-semibold mt-0.5" style={{ color: "#64748b" }}>{result.area}</p>
                  )}
                  <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: "#475569" }}>{result.message}</p>
                  {result.covered && (
                    <p className="text-[11px] mt-2 font-semibold" style={{ color: "#06b6d4" }}>
                      Contact us today to get connected! 📞 010 060 0400
                    </p>
                  )}
                  {!result.covered && (
                    <p className="text-[11px] mt-2" style={{ color: "#94a3b8" }}>
                      We're expanding rapidly. Register your interest and we'll notify you when coverage reaches your area.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}