import React, { useState } from "react";
import { MapPin, X, Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function CoverageChecker({ onClose }) {
  const [address, setAddress] = useState("");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  const checkCoverage = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Is the address "${address}" likely within a typical South African fibre/wireless ISP coverage area? Respond with a JSON object: { "covered": true/false, "message": "brief explanation", "alternatives": ["suggestion1"] }`,
        response_json_schema: {
          type: "object",
          properties: {
            covered:      { type: "boolean" },
            message:      { type: "string" },
            alternatives: { type: "array", items: { type: "string" } },
          },
        },
      });
      setResult(res);
    } catch {
      setResult({ covered: false, message: "Could not check coverage. Please contact support.", alternatives: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: "white", border: "1px solid rgba(6,182,212,0.2)", boxShadow: "0 24px 64px rgba(6,182,212,0.15)" }}>
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#06b6d4,#6366f1,transparent)" }} />

        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(226,232,240,0.6)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
              <MapPin className="w-4 h-4" style={{ color: "#06b6d4" }} />
            </div>
            <p className="text-[15px] font-black" style={{ color: "#1e293b" }}>Coverage Checker</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-[12px]" style={{ color: "#64748b" }}>
            Enter an address to check if fibre or wireless service is available in that area.
          </p>

          <div className="flex gap-2">
            <input
              className="flex-1 rounded-xl px-3 py-2.5 text-[13px] outline-none"
              style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }}
              placeholder="e.g. 123 Main St, Sandton, Johannesburg"
              value={address}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={e => e.key === "Enter" && checkCoverage()}
            />
            <button onClick={checkCoverage} disabled={loading || !address.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 3px 10px rgba(6,182,212,0.3)" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Check
            </button>
          </div>

          {result && (
            <div className="rounded-2xl p-4"
              style={{
                background: result.covered ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)",
                border: `1px solid ${result.covered ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
              }}>
              <div className="flex items-center gap-2 mb-2">
                {result.covered
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  : <XCircle className="w-5 h-5 text-red-400" />}
                <p className="text-[13px] font-bold" style={{ color: result.covered ? "#059669" : "#dc2626" }}>
                  {result.covered ? "Coverage Available" : "No Coverage Found"}
                </p>
              </div>
              <p className="text-[12px]" style={{ color: "#475569" }}>{result.message}</p>
              {result.alternatives?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {result.alternatives.map((a, i) => (
                    <p key={i} className="text-[11px]" style={{ color: "#64748b" }}>• {a}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}