import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AICustomerSummary({ customer }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const generate = async () => {
    if (summary) { setOpen(true); return; }
    setLoading(true);
    try {
      const [invoices, tickets, projects] = await Promise.all([
        base44.entities.Invoice.filter({ customer_id: customer.id }),
        base44.entities.Ticket.filter({ customer_id: customer.id }),
        base44.entities.FibreProject.filter({ customer_id: customer.id }),
      ]);

      const totalPaid = invoices.filter(i => i.status === "paid").reduce((a, i) => a + (i.total || 0), 0);
      const overdueCount = invoices.filter(i => i.status === "overdue").length;
      const openTickets = tickets.filter(t => !["resolved","closed"].includes(t.status)).length;
      const activeProjects = projects.filter(p => !["cancelled","billed"].includes(p.status)).length;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a concise executive summary for a customer of a South African ISP called TouchNet.

Customer: ${customer.full_name}
Email: ${customer.email}
Status: ${customer.status}
Service Plan: ${customer.service_plan}
Monthly Rate: R${customer.monthly_rate || 0}
Balance: R${customer.balance || 0}
Installation Date: ${customer.installation_date || "unknown"}
Contract End: ${customer.contract_end_date || "unknown"}

Billing Summary:
- Total invoices: ${invoices.length}
- Total paid: R${totalPaid.toFixed(2)}
- Overdue invoices: ${overdueCount}

Support:
- Total tickets: ${tickets.length}
- Open tickets: ${openTickets}

Projects:
- Total projects: ${projects.length}
- Active projects: ${activeProjects}

Write a 3-5 sentence executive summary covering account health, billing performance, support history, and any risks. Be factual and concise. Use markdown.`
      });
      setSummary(result);
      setOpen(true);
    } catch {
      setSummary("Unable to generate summary at this time.");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={generate} disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105 disabled:opacity-50"
        style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)", color: "#a855f7" }}>
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        {loading ? "Generating…" : "AI Summary"}
      </button>

      {open && summary && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{ background: "#1a1a1a", border: "1px solid rgba(168,85,247,0.3)", boxShadow: "0 24px 80px rgba(0,0,0,0.7)" }}>
            <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#a855f7,#00b4b4,transparent)" }} />
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: "#a855f7" }} />
                <p className="text-[14px] font-black" style={{ color: "#f0f0f0" }}>AI Customer Summary</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.25)" }}>
                  {customer.full_name}
                </span>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5"
                style={{ color: "rgba(255,255,255,0.4)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <div className="prose prose-sm prose-invert max-w-none text-[13px] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.65)" }}>
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
              <button onClick={() => { setSummary(null); generate(); }}
                className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
                style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)", color: "#a855f7" }}>
                <Sparkles className="w-3.5 h-3.5" /> Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}