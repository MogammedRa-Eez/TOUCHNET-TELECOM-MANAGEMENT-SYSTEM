import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, X, Search, CheckCircle2, XCircle, Loader2, ArrowRight, ExternalLink } from "lucide-react";

export default function CoverageChecker({ onClose }) {
  const [query,   setQuery]   = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  const check = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a coverage assistant for TouchNet, a South African fibre and wireless ISP operating mainly in Gauteng, Western Cape, and KwaZulu-Natal.
The user is asking about internet coverage at: "${query}".
Based on general knowledge of South African suburbs and typical ISP coverage patterns for TouchNet, Openserve, Vumatel, Frogfoot, MFN, DFA, Link Africa, Liquid Home and Herotel, determine coverage.
Respond strictly with the JSON schema provided.`,
        response_json_schema: {
          type: "object",
          properties: {
            covered:          { type: "boolean" },
            message:          { type: "string" },
            area:             { type: "string" },
            estimate:         { type: "string" },
            providers_likely: { type: "array", items: { type: "string" } },
          },
        },
      });

      base44.entities.CoverageSearch.create({
        query: query.trim(),
        covered: res.covered,
        result_message: res.message,
      }).catch(() => {});

      setResult(res);
    } catch {
      setResult({ covered: false, message: "Unable to check coverage right now. Please try the full Coverage Map.", area: query, providers_likely: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(4,3,15,0.82)", backdropFilter: "blur(10px)" }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden relative"
        style={{
          background: "linear-gradient(175deg, #0d0a20 0%, #090618 100%)",
          border: "1px solid rgba(139,92,246,0.3)",
          boxShadow: "0 32px 80px rgba(139,92,246,0.3), 0 8px 32px rgba(0,0,0,0.7)",
        }}
        onClick={e => e.stopPropagation()}>

        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#6366f1,#06b6d4,#10b981,transparent)" }} />

        <div className="flex items-center justify-between px-6 pt-5 pb-4"
          style={{ borderBottom: "1px solid rgba(139,92,246,0.12)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,rgba(6,182,212,0.2),rgba(99,102,241,0.15))", border: "1px solid rgba(6,182,212,0.3)" }}>
              <MapPin className="w-4 h-4" style={{ color: "#06b6d4" }} />
            </div>
            <div>
              <p className="text-[15px] font-black" style={{ color: "#e8d5ff" }}>Quick Coverage Check</p>
              <p className="text-[10px] mono" style={{ color: "rgba(196,181,253,0.45)" }}>South Africa · Multi-provider</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(196,181,253,0.4)" }} />
              <input
                className="w-full pl-10 pr-4 py-3 rounded-xl text-[13px] outline-none transition-all"
                style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", color: "#e8d5ff" }}
                placeholder="Suburb, city or street address…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && check()}
              />
            </div>
            <button onClick={check} disabled={loading || !query.trim()}
              className="px-4 py-3 rounded-xl font-bold text-[12px] text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
            </button>
          </div>

          {result && (
            <div className="rounded-2xl overflow-hidden"
              style={{
                background: result.covered ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)",
                border: `1px solid ${result.covered ? "rgba(16,185,129,0.28)" : "rgba(239,68,68,0.28)"}`,
              }}>
              <div className="h-[2px]"
                style={{ background: result.covered ? "linear-gradient(90deg,#10b981,#06b6d4,transparent)" : "linear-gradient(90deg,#ef4444,#f97316,transparent)" }} />
              <div className="p-4 flex gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: result.covered ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)" }}>
                  {result.covered
                    ? <CheckCircle2 className="w-5 h-5" style={{ color: "#10b981" }} />
                    : <XCircle className="w-5 h-5" style={{ color: "#ef4444" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-black" style={{ color: result.covered ? "#10b981" : "#ef4444" }}>
                    {result.covered ? "Coverage Available!" : "Not Yet Covered"}
                  </p>
                  {result.area && (
                    <p className="text-[11px] mono mt-0.5" style={{ color: "rgba(196,181,253,0.55)" }}>{result.area}</p>
                  )}
                  <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: "rgba(226,217,243,0.75)" }}>{result.message}</p>
                  {result.providers_likely?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {result.providers_likely.map(p => (
                        <span key={p} className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                          style={{ background: "rgba(139,92,246,0.12)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.25)" }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                  {result.estimate && (
                    <p className="text-[11px] mt-1.5 font-semibold" style={{ color: "rgba(196,181,253,0.6)" }}>{result.estimate}</p>
                  )}
                </div>
              </div>
              <div className="px-4 pb-4">
                <a href="/CoverageCheck"
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
                  <ExternalLink className="w-3.5 h-3.5" />
                  {result.covered ? "View Full Map & Compare Plans" : "View Coverage Map"}
                </a>
              </div>
            </div>
          )}

          {!result && (
            <a href="/CoverageCheck"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-[1.01]"
              style={{ background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.22)", color: "#22d3ee" }}>
              <MapPin className="w-3.5 h-3.5" />
              Open Full Interactive Coverage Map
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}