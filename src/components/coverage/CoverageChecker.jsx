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
          border: "1px solid rgba(177,151,252,0.35)",
          boxShadow: "0 32px 80px rgba(177,151,252,0.35), 0 8px 32px rgba(0,0,0,0.7)",
        }}
        onClick={e => e.stopPropagation()}>

        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#b197fc,#00e5ff,#57f287,transparent)" }} />

        <div className="flex items-center justify-between px-6 pt-5 pb-4"
          style={{ borderBottom: "1px solid rgba(177,151,252,0.16)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,rgba(0,229,255,0.2),rgba(177,151,252,0.15))", border: "1px solid rgba(0,229,255,0.35)" }}>
              <MapPin className="w-4 h-4" style={{ color: "#00e5ff" }} />
            </div>
            <div>
              <p className="text-[15px] font-black" style={{ color: "#f8f4ff" }}>Quick Coverage Check</p>
              <p className="text-[10px] mono" style={{ color: "rgba(233,213,255,0.45)" }}>South Africa · Multi-provider</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ border: "1px solid rgba(255,255,255,0.14)" }}>
            <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.55)" }} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(233,213,255,0.4)" }} />
              <input
                className="w-full pl-10 pr-4 py-3 rounded-xl text-[13px] outline-none transition-all"
                style={{ background: "rgba(177,151,252,0.1)", border: "1px solid rgba(177,151,252,0.32)", color: "#f0ecff" }}
                placeholder="Suburb, city or street address…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && check()}
              />
            </div>
            <button onClick={check} disabled={loading || !query.trim()}
              className="px-4 py-3 rounded-xl font-bold text-[12px] text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#9b6dff,#b197fc)", boxShadow: "0 4px 18px rgba(177,151,252,0.5)" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
            </button>
          </div>

          {result && (
            <div className="rounded-2xl overflow-hidden"
              style={{
                background: result.covered ? "rgba(87,242,135,0.06)" : "rgba(255,123,123,0.06)",
                border: `1px solid ${result.covered ? "rgba(87,242,135,0.32)" : "rgba(255,123,123,0.32)"}`,
              }}>
              <div className="h-[2px]"
                style={{ background: result.covered ? "linear-gradient(90deg,#57f287,#00e5ff,transparent)" : "linear-gradient(90deg,#ff7b7b,#ff6eb4,transparent)" }} />
              <div className="p-4 flex gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: result.covered ? "rgba(87,242,135,0.15)" : "rgba(255,123,123,0.15)" }}>
                  {result.covered
                    ? <CheckCircle2 className="w-5 h-5" style={{ color: "#57f287" }} />
                    : <XCircle className="w-5 h-5" style={{ color: "#ff7b7b" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-black" style={{ color: result.covered ? "#57f287" : "#ff7b7b" }}>
                    {result.covered ? "Coverage Available!" : "Not Yet Covered"}
                  </p>
                  {result.area && (
                    <p className="text-[11px] mono mt-0.5" style={{ color: "rgba(233,213,255,0.55)" }}>{result.area}</p>
                  )}
                  <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: "rgba(240,236,255,0.8)" }}>{result.message}</p>
                  {result.providers_likely?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {result.providers_likely.map(p => (
                        <span key={p} className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                          style={{ background: "rgba(177,151,252,0.16)", color: "#e9d5ff", border: "1px solid rgba(177,151,252,0.32)" }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                  {result.estimate && (
                    <p className="text-[11px] mt-1.5 font-semibold" style={{ color: "rgba(233,213,255,0.65)" }}>{result.estimate}</p>
                  )}
                </div>
              </div>
              <div className="px-4 pb-4">
                <a href="/CoverageCheck"
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg,#9b6dff,#b197fc)", boxShadow: "0 4px 14px rgba(177,151,252,0.45)" }}>
                  <ExternalLink className="w-3.5 h-3.5" />
                  {result.covered ? "View Full Map & Compare Plans" : "View Coverage Map"}
                </a>
              </div>
            </div>
          )}

          {!result && (
            <a href="/CoverageCheck"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-[1.01]"
              style={{ background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.28)", color: "#67f2ff" }}>
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