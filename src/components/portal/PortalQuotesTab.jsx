import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { FileText, CheckCircle, XCircle, Clock, Eye, Loader2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import QuoteAcceptancePanel from "@/components/portal/QuoteAcceptancePanel";

const STATUS_CONFIG = {
  draft:    { label: "Draft",    color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
  sent:     { label: "Sent",     color: "#6366f1", bg: "rgba(99,102,241,0.1)"  },
  viewed:   { label: "Viewed",   color: "#8b5cf6", bg: "rgba(139,92,246,0.1)"  },
  accepted: { label: "Accepted", color: "#10b981", bg: "rgba(16,185,129,0.1)"  },
  declined: { label: "Declined", color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
  expired:  { label: "Expired",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
};

const STATUS_ICON = {
  accepted: CheckCircle,
  declined: XCircle,
  expired:  Clock,
};

// Inline wrapper: fetches the full quote object and renders the acceptance panel
function QuoteDetailView({ quote, onBack }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-lg border border-slate-200">
      <QuoteAcceptancePanel quote={quote} onClose={onBack} />
    </div>
  );
}

export default function PortalQuotesTab({ customer }) {
  const [selected, setSelected] = useState(null);

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["portal-quotes", customer.id],
    queryFn: () => base44.entities.Quote.filter({ customer_id: customer.id }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (selected) {
    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Quotes
        </button>
        <QuoteDetailView quote={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
          <FileText className="w-6 h-6 text-indigo-400" />
        </div>
        <p className="text-sm font-semibold text-slate-600">No quotes yet</p>
        <p className="text-xs text-slate-400 mt-1">Quotes sent to you will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {quotes.map(quote => {
        const cfg = STATUS_CONFIG[quote.status] || STATUS_CONFIG.draft;
        const StatusIcon = STATUS_ICON[quote.status] || Eye;
        const total = quote.total ?? quote.subtotal ?? 0;

        return (
          <div
            key={quote.id}
            className="rounded-2xl p-5 bg-white flex flex-col sm:flex-row sm:items-center gap-4"
            style={{ border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 2px 12px rgba(99,102,241,0.05)" }}
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
              <FileText className="w-4 h-4" style={{ color: cfg.color }} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-slate-800 truncate">{quote.title}</p>
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  <StatusIcon className="w-3 h-3" />
                  {cfg.label}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {quote.quote_number && (
                  <span className="text-[11px] text-slate-400 font-mono">#{quote.quote_number}</span>
                )}
                {quote.valid_until && (
                  <span className="text-[11px] text-slate-400">
                    Valid until {format(new Date(quote.valid_until), "d MMM yyyy")}
                  </span>
                )}
                {total > 0 && (
                  <span className="text-[11px] font-bold text-indigo-600">
                    R{total.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>

            {/* Action */}
            <button
              onClick={() => setSelected(quote.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}
            >
              <Eye className="w-3.5 h-3.5" /> View Quote
            </button>
          </div>
        );
      })}
    </div>
  );
}