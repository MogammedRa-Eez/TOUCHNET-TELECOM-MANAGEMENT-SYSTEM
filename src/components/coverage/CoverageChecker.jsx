import React, { useState } from "react";
import { X, MapPin, Search, Loader2, CheckCircle2, XCircle } from "lucide-react";
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
        prompt: `Does the address "${address}" fall within a typical South African fibre internet coverage area? 
        Respond with a JSON object with: { covered: boolean, confidence: "high"|"medium"|"low", message: string, suggested_plan: string|null }`,
        response_json_schema: {
          type: "object",
          properties: {
            covered: { type: "boolean" },
            confidence: { type: "string" },
            message: { type: "string" },
            suggested_plan: { type: "string" }
          }
        }
      });
      setResult(res);
      try {
        await base44.entities.CoverageSearch.create({
          address: address.trim(),
          covered: res.covered,
          confidence: res.confidence,
        });
      } catch (_) {}
    } catch (e) {
      setResult({ covered: false, confidence: "low", message: "Unable to check coverage at this time. Please contact us directly.", suggested_plan: null });
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(4,3,15,0.88)", backdropFilter: "blur(14px)" }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(175deg,#0d0a20,#090618)",
          border: "1px solid rgba(0,229,255,0.3)",
          boxShadow: "0 24px 64px rgba(0,229,255,0.15)",
        }}>
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#0891b2,#06b6d4,#00e5ff,transparent)" }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(0,229,255,0.12)", border: "1px solid rgba(0,229,255,0.3)" }}>
                <MapPin className="w-5 h-5" style={{ color: "#00e5ff" }} />
              </div>
              <div>
                <p className="text-[15px] font-black" style={{ color: "#e8d5ff" }}>Coverage Checker</p>
                <p className="text-[11px]" style={{ color: "rgba(196,181,253,0.5)" }}>Check fibre availability at your address</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-white/5"
              style={{ color: "rgba(196,181,253,0.5)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={e => e.key === "Enter" && checkCoverage()}
              placeholder="Enter your full address…"
              className="flex-1 px-4 py-3 rounded-xl text-[13px] outline-none"
              style={{ background: "rgba(177,151,252,0.1)", border: "1px solid rgba(177,151,252,0.3)", color: "#f0ecff" }}
            />
            <button onClick={checkCoverage} disabled={loading || !address.trim()}
              className="px-4 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)", boxShadow: "0 4px 14px rgba(6,182,212,0.35)" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>

          {result && (
            <div className="rounded-xl p-4"
              style={{
                background: result.covered ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${result.covered ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
              }}>
              <div className="flex items-start gap-3">
                {result.covered
                  ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#10b981" }} />
                  : <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />}
                <div>
                  <p className="text-[13px] font-bold mb-1" style={{ color: result.covered ? "#10b981" : "#ef4444" }}>
                    {result.covered ? "Coverage Available!" : "No Coverage Found"}
                  </p>
                  <p className="text-[12px] leading-relaxed" style={{ color: "rgba(220,232,255,0.75)" }}>{result.message}</p>
                  {result.suggested_plan && (
                    <p className="text-[11px] mt-2 font-bold" style={{ color: "#00e5ff" }}>
                      Suggested plan: {result.suggested_plan}
                    </p>
                  )}
                  <p className="text-[10px] mt-1 uppercase tracking-wider font-bold" style={{ color: "rgba(196,181,253,0.4)" }}>
                    Confidence: {result.confidence}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}