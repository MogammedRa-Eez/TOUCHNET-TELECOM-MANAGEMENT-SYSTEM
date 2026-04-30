import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AITicketTriage({ ticket, onApply }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const analyse = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a support ticket triage assistant for a South African ISP called TouchNet.
Analyse this support ticket and suggest the best category, department, and priority.

Subject: ${ticket.subject}
Description: ${ticket.description || "(none)"}

Categories available: connectivity, billing, installation, speed_issue, hardware, security, general
Departments available: technical, sales, finance, cyber_security, projects, hr
Priorities: low, medium, high, critical

Return JSON with: { category: string, department: string, priority: string, reason: string }`,
        response_json_schema: {
          type: "object",
          properties: {
            category: { type: "string" },
            department: { type: "string" },
            priority: { type: "string" },
            reason: { type: "string" }
          }
        }
      });
      setSuggestion(result);
    } catch {
      toast.error("AI triage failed");
    } finally {
      setLoading(false);
    }
  };

  const PRIORITY_COLORS = { low: "#64748b", medium: "#00b4b4", high: "#f97316", critical: "#e02347" };

  return (
    <div className="rounded-xl p-4 space-y-3"
      style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: "#a855f7" }} />
          <span className="text-[12px] font-black uppercase tracking-wider" style={{ color: "#a855f7" }}>AI Triage</span>
        </div>
        {!suggestion && (
          <button onClick={analyse} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7" }}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {loading ? "Analysing…" : "Auto-Triage"}
          </button>
        )}
      </div>

      {suggestion && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Priority", value: suggestion.priority, color: PRIORITY_COLORS[suggestion.priority] || "#64748b" },
              { label: "Category", value: suggestion.category?.replace(/_/g, " "), color: "#00b4b4" },
              { label: "Department", value: suggestion.department?.replace(/_/g, " "), color: "#a855f7" },
            ].map(item => (
              <div key={item.label} className="rounded-lg p-2 text-center"
                style={{ background: `${item.color}12`, border: `1px solid ${item.color}30` }}>
                <p className="text-[9px] uppercase tracking-wider font-bold mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{item.label}</p>
                <p className="text-[11px] font-black capitalize" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
          {suggestion.reason && (
            <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              {suggestion.reason}
            </p>
          )}
          <button onClick={() => { onApply(suggestion); setSuggestion(null); toast.success("AI suggestions applied"); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105 w-full justify-center"
            style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7" }}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Apply Suggestions
          </button>
        </div>
      )}
    </div>
  );
}