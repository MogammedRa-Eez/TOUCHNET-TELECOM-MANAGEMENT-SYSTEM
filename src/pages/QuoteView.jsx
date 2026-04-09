import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertCircle } from "lucide-react";
import QuoteAcceptancePanel from "@/components/portal/QuoteAcceptancePanel";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

export default function QuoteView() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const quoteId = params.get("id");
    const quoteNumber = params.get("ref");

    if (!quoteId && !quoteNumber) {
      setError("No quote reference provided.");
      setLoading(false);
      return;
    }

    async function loadQuote() {
      try {
        let found = null;
        if (quoteId) {
          const results = await base44.entities.Quote.filter({ id: quoteId });
          found = results[0] || null;
        } else if (quoteNumber) {
          const results = await base44.entities.Quote.filter({ quote_number: quoteNumber });
          found = results[0] || null;
        }
        if (!found) {
          setError("Quote not found. Please check your link or contact your account manager.");
        } else {
          setQuote(found);
        }
      } catch (e) {
        setError("Failed to load quote. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadQuote();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "linear-gradient(135deg,#f0f9ff 0%,#eef2ff 50%,#f5f3ff 100%)" }}>
        <img src={LOGO_URL} alt="TouchNet" className="h-10 object-contain" />
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#6366f1" }} />
          <span className="text-sm font-semibold" style={{ color: "#6366f1" }}>Loading your quote…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"
        style={{ background: "linear-gradient(135deg,#f0f9ff 0%,#eef2ff 50%,#f5f3ff 100%)" }}>
        <img src={LOGO_URL} alt="TouchNet" className="h-10 object-contain mb-2" />
        <div className="rounded-2xl p-8 max-w-md w-full text-center bg-white shadow-xl border border-red-100">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
          <h2 className="text-lg font-bold mb-2" style={{ color: "#1e293b" }}>Quote Not Found</h2>
          <p className="text-sm" style={{ color: "#64748b" }}>{error}</p>
          <p className="text-sm mt-4" style={{ color: "#94a3b8" }}>
            Contact us at <a href="mailto:sales@touchnet.co.za" className="text-indigo-500 font-semibold">sales@touchnet.co.za</a> or call <strong>010 060 0400</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#f0f9ff 0%,#eef2ff 50%,#f5f3ff 100%)" }}>
      <div className="sticky top-0 z-10 flex items-center justify-center py-3 px-4"
        style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
        <img src={LOGO_URL} alt="TouchNet" className="h-8 object-contain" />
      </div>
      <QuoteAcceptancePanel
        quote={quote}
        onClose={() => {}}
        onResponded={() => {
          base44.entities.Quote.filter({ id: quote.id }).then(r => r[0] && setQuote(r[0]));
        }}
        embedded={true}
      />
    </div>
  );
}