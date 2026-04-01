import React, { useState } from "react";
import { X, MapPin, CheckCircle2, XCircle, Loader2 } from "lucide-react";
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
      prompt: `You are a coverage checker for TouchNet, a fibre ISP based in South Africa (Gauteng/Johannesburg area).
Given this address: "${address}"
Determine if this address is likely within a fibre coverage area in Gauteng, South Africa.
Return a JSON response with: covered (boolean), message (string with friendly explanation), areas_nearby (array of nearby served areas if covered, or empty array).`,
      response_json_schema: {
        type: "object",
        properties: {
          covered: { type: "boolean" },
          message: { type: "string" },
          areas_nearby: { type: "array", items: { type: "string" } }
        }
      }
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#fff", border: "1px solid rgba(6,182,212,0.2)" }}>
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#06b6d4,#0891b2,transparent)" }} />
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(6,182,212,0.1)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
              <MapPin className="w-4 h-4" style={{ color: "#06b6d4" }} />
            </div>
            <div>
              <p className="text-[14px] font-black" style={{ color: "#1e293b" }}>Fibre Coverage Checker</p>
              <p className="text-[11px]" style={{ color: "#94a3b8" }}>Check if your area is covered</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="p-5">
          <form onSubmit={checkCoverage} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: "#94a3b8" }}>
                Your Address
              </label>
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. 151 Katherine Street, Sandton"
                className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !address.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)", boxShadow: "0 4px 16px rgba(6,182,212,0.3)" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              {loading ? "Checking coverage…" : "Check Coverage"}
            </button>
          </form>

          {result && (
            <div className="mt-4 rounded-xl p-4"
              style={{
                background: result.covered ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)",
                border: `1px solid ${result.covered ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
              }}>
              <div className="flex items-start gap-3">
                {result.covered
                  ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#10b981" }} />
                  : <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />}
                <div>
                  <p className="text-[13px] font-bold mb-1" style={{ color: result.covered ? "#059669" : "#dc2626" }}>
                    {result.covered ? "Coverage Available!" : "Not Currently Covered"}
                  </p>
                  <p className="text-[12px]" style={{ color: "#475569" }}>{result.message}</p>
                  {result.areas_nearby?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {result.areas_nearby.map((area, i) => (
                        <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(6,182,212,0.1)", color: "#0891b2", border: "1px solid rgba(6,182,212,0.2)" }}>
                          {area}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-4 text-center">
          <p className="text-[11px]" style={{ color: "#94a3b8" }}>
            For more info, contact us at{" "}
            <a href="tel:0100600400" className="font-bold" style={{ color: "#06b6d4" }}>010 060 0400</a>
          </p>
        </div>
      </div>
    </div>
  );
}