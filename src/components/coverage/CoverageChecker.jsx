import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, X, Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function CoverageChecker({ onClose }) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const checkCoverage = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      await base44.entities.CoverageSearch.create({ address: address.trim() });

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a coverage checker for a South African ISP called TouchNet. 
        A customer is asking if fibre or wireless internet is available at: "${address}".
        Based on typical South African ISP coverage patterns (Johannesburg, Pretoria, Cape Town, Durban, and surrounding areas have good coverage), 
        provide a realistic coverage assessment. 
        Return JSON with: { covered: boolean, coverage_type: "fibre" | "wireless" | "none", strength: "excellent" | "good" | "fair" | "none", message: string }`,
        response_json_schema: {
          type: "object",
          properties: {
            covered: { type: "boolean" },
            coverage_type: { type: "string" },
            strength: { type: "string" },
            message: { type: "string" }
          }
        }
      });
      setResult(res);
    } catch {
      setResult({ covered: false, coverage_type: "none", strength: "none", message: "Unable to check coverage at this time. Please contact us directly." });
    } finally {
      setLoading(false);
    }
  };

  const strengthColor = {
    excellent: "#10b981",
    good: "#00b4b4",
    fair: "#f59e0b",
    none: "#e02347",
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "#1a1a1a", border: "1px solid rgba(0,180,180,0.3)", boxShadow: "0 24px 80px rgba(0,0,0,0.7)" }}>
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,#e02347,transparent)" }} />

        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(224,35,71,0.15)", border: "1px solid rgba(224,35,71,0.3)" }}>
              <MapPin className="w-4 h-4" style={{ color: "#e02347" }} />
            </div>
            <div>
              <p className="text-[14px] font-black" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>Coverage Checker</p>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>Check if we service your area</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
              Enter your address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} />
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                onKeyDown={e => e.key === "Enter" && checkCoverage()}
                placeholder="e.g. 123 Main Street, Sandton, Johannesburg"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-[13px] outline-none"
                style={{ background: "#252525", border: "1px solid rgba(255,255,255,0.12)", color: "#f0f0f0" }}
              />
            </div>
          </div>

          <button
            onClick={checkCoverage}
            disabled={loading || !address.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 20px rgba(0,180,180,0.3)" }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Checking coverage…" : "Check Coverage"}
          </button>

          {result && (
            <div className="rounded-xl p-4 space-y-3"
              style={{
                background: result.covered ? "rgba(0,180,180,0.07)" : "rgba(224,35,71,0.07)",
                border: `1px solid ${result.covered ? "rgba(0,180,180,0.3)" : "rgba(224,35,71,0.3)"}`,
              }}>
              <div className="flex items-center gap-3">
                {result.covered
                  ? <CheckCircle2 className="w-6 h-6 flex-shrink-0" style={{ color: "#10b981" }} />
                  : <XCircle className="w-6 h-6 flex-shrink-0" style={{ color: "#e02347" }} />}
                <div>
                  <p className="text-[14px] font-black" style={{ color: result.covered ? "#10b981" : "#e02347" }}>
                    {result.covered ? "Coverage Available!" : "No Coverage"}
                  </p>
                  {result.covered && (
                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: strengthColor[result.strength] || "#00b4b4" }}>
                      {result.coverage_type?.replace(/_/g, " ")} · {result.strength} signal
                    </p>
                  )}
                </div>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{result.message}</p>
              {!result.covered && (
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Contact us to register your interest and we'll notify you when coverage expands to your area.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}