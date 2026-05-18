import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import QuoteAcceptancePanel from "@/components/portal/QuoteAcceptancePanel";

const LOGO_DARK  = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";
const LOGO_WHITE = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/b3b518de6_Touchnet_LogoLongWhite.png";
const CREST_URL  = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/639b91697_Touchnet-CrestDesogm_CrestFinalFullWhite.png";

const BRAND   = "#00b4b4";
const ACCENT  = "#8B1A1A";
const DARK    = "#0a0f1a";

export default function QuoteView() {
  const [quote, setQuote]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const params      = new URLSearchParams(window.location.search);
    const quoteId     = params.get("id");
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
      <div style={{ minHeight: "100vh", background: DARK, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
        {/* Animated crest glow */}
        <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute", inset: -20, borderRadius: "50%",
            background: `radial-gradient(circle, ${BRAND}25, transparent 70%)`,
            animation: "pulse 2s infinite",
          }} />
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: `linear-gradient(135deg, ${BRAND}20, ${ACCENT}10)`,
            border: `1px solid ${BRAND}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img src={CREST_URL} alt="Crest" style={{ width: 52, height: 52, objectFit: "contain", opacity: 0.85 }} />
          </div>
        </div>
        <img src={LOGO_WHITE} alt="TouchNet" style={{ height: 32, objectFit: "contain", opacity: 0.8 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Loader2 style={{ width: 16, height: 16, color: BRAND, animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: `${BRAND}99`, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em" }}>
            Loading your quote…
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: DARK, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        {/* Background grid */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(0,212,212,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <div style={{ position: "relative", maxWidth: 480, width: "100%" }}>
          <div style={{
            background: "#141414", border: `1px solid ${ACCENT}35`,
            borderRadius: 20, overflow: "hidden",
            boxShadow: `0 8px 40px rgba(0,0,0,0.6)`,
          }}>
            <div style={{ height: 3, background: `linear-gradient(90deg,${ACCENT},${BRAND},transparent)` }} />
            <div style={{ padding: "36px 32px", textAlign: "center" }}>
              <img src={LOGO_WHITE} alt="TouchNet" style={{ height: 28, objectFit: "contain", marginBottom: 24, opacity: 0.8 }} />
              <div style={{
                width: 60, height: 60, borderRadius: 16,
                background: `${ACCENT}15`, border: `1px solid ${ACCENT}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <AlertCircle style={{ width: 28, height: 28, color: ACCENT }} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "#f0f0f0", margin: "0 0 10px", fontFamily: "'Space Grotesk', sans-serif" }}>
                Quote Not Found
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: 0 }}>{error}</p>
              <div style={{ marginTop: 24, padding: "14px 20px", background: `${BRAND}08`, border: `1px solid ${BRAND}20`, borderRadius: 12 }}>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "0 0 6px" }}>Need assistance?</p>
                <a href="mailto:sales@touchnet.co.za" style={{ fontSize: 13, color: BRAND, fontWeight: 700, textDecoration: "none" }}>
                  sales@touchnet.co.za
                </a>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", margin: "0 8px" }}>·</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>010 060 0400</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      {/* ── Top bar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 30,
        background: DARK,
        borderBottom: `1px solid ${BRAND}20`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}>
        {/* Accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg,${BRAND},${BRAND}99,${ACCENT},${BRAND},transparent)`, backgroundSize: "300% auto" }} />
        <div style={{
          maxWidth: 760, margin: "0 auto", padding: "12px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={CREST_URL} alt="Crest" style={{ height: 32, objectFit: "contain", opacity: 0.8 }} />
            <div>
              <img src={LOGO_WHITE} alt="TouchNet" style={{ height: 22, objectFit: "contain", opacity: 0.9, display: "block" }} />
              <p style={{ fontSize: 8, color: `${BRAND}70`, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.2em", textTransform: "uppercase", margin: "2px 0 0" }}>
                SECURE QUOTE PORTAL
              </p>
            </div>
          </div>

          {/* Quote status chip */}
          {quote && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {["accepted", "declined"].includes(quote.status) ? (
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 12px", borderRadius: 20,
                  background: quote.status === "accepted" ? "rgba(16,185,129,0.12)" : "rgba(139,26,26,0.12)",
                  border: `1px solid ${quote.status === "accepted" ? "rgba(16,185,129,0.3)" : "rgba(139,26,26,0.3)"}`,
                }}>
                  <CheckCircle2 style={{ width: 12, height: 12, color: quote.status === "accepted" ? "#10b981" : "#a52020" }} />
                  <span style={{
                    fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em",
                    color: quote.status === "accepted" ? "#10b981" : "#a52020",
                  }}>
                    {quote.status}
                  </span>
                </div>
              ) : (
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 12px", borderRadius: 20,
                  background: `${BRAND}10`, border: `1px solid ${BRAND}25`,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: BRAND, boxShadow: `0 0 6px ${BRAND}`, display: "inline-block" }} />
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: BRAND }}>
                    {quote.status === "viewed" ? "VIEWED" : "AWAITING RESPONSE"}
                  </span>
                </div>
              )}
              <a href="https://www.touchnet.co.za" target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
                <ExternalLink style={{ width: 10, height: 10 }} />
                touchnet.co.za
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ── Quote Content ── */}
      <QuoteAcceptancePanel
        quote={quote}
        onClose={() => {}}
        onResponded={() => {
          base44.entities.Quote.filter({ id: quote.id }).then(r => r[0] && setQuote(r[0]));
        }}
        embedded={true}
      />

      {/* ── Footer ── */}
      <div style={{
        background: DARK,
        borderTop: `1px solid ${BRAND}15`,
        padding: "20px 24px",
        textAlign: "center",
        marginTop: 24,
      }}>
        <img src={LOGO_WHITE} alt="TouchNet" style={{ height: 20, objectFit: "contain", opacity: 0.35, display: "inline-block" }} />
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>
          © TouchNet Telecommunications (PTY) LTD · 151 Katherine Street, Sandton, Johannesburg
          &nbsp;·&nbsp; 010 060 0400 &nbsp;·&nbsp; www.touchnet.co.za
        </p>
        <p style={{ fontSize: 9, color: "rgba(255,255,255,0.12)", marginTop: 4 }}>
          This quote was sent securely via the TouchNet TMS platform. If you did not request this, please contact us.
        </p>
      </div>
    </div>
  );
}