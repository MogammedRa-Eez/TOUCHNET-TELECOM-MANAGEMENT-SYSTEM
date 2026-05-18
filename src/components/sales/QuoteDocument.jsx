import React from "react";
import { format } from "date-fns";

/* ── Brand & Assets ──────────────────────────────────── */
const LOGO_WHITE = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/b3b518de6_Touchnet_LogoLongWhite.png";
const LOGO_DARK  = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";
const CREST_URL  = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/639b91697_Touchnet-CrestDesogm_CrestFinalFullWhite.png";

const TEAL    = "#00b4b4";
const TEAL_L  = "#00d4d4";
const MAROON  = "#8B1A1A";
const DARK    = "#0a0f1a";
const DARK2   = "#111827";
const MID     = "#1e2d3d";

const COMPANY = {
  name:    "Prasheel Thakor",
  company: "Touchnet Telecommunications",
  address: "151 Katherine Street, Sandown\nSandton, Johannesburg, 2196",
  website: "www.touchnet.co.za",
  email:   "sales@touchnet.co.za",
  phone:   "010 060 0400",
  reg:     "Reg No: 2019/123456/07",
  vat:     "VAT No: 4590286674",
};

const BANKING = {
  accountName:  "Touchnet Telecommunications (PTY) LTD",
  bank:         "Standard Bank",
  accountNumber:"001991264",
  branch:       "Rosebank",
  branchCode:   "00 43 05",
  accountType:  "Current Account",
};

export const DEFAULT_TERMS = `All pricing excludes VAT.
Installation and once-off fees invoiced on acceptance of quote - payable within 7 days of receipt of invoice.
This quotation is valid for 2 weeks. Quote is subject to final feasibility and pricing may be adjusted once final details are known.
Services are provided on a 24-month contract basis unless stated otherwise.
Monthly services are charged for a month in advance.
Once off installation fees cover the Touchnet Service setup and config fee, any additional on-site support for any 3rd party system will be charged at hourly rate call out rate.
TouchNet may charge any additional onsite technical support / resource fees on market related cost.
TouchNet may charge courier fees if applicable.
TouchNet shall not be liable in any way for any 3rd party management fees.
Payments for 'ad hoc' or 'once off' services are due 7 days from date of invoice.
The implementation time frames are technology dependent. The project team will advise of time frames once these are available.
Installation times are only estimated, TouchNet will not be held liable in any way for delays in installation.
90 Days' notice of cancellation from last day of the month.
In the event of early cancellation, the client may be held liable for penalties.
The recipient of the information as per this document agrees to receive the information in confidence.
TouchNet shall not be liable in any way for any consequential damages or theft, whether foreseeable or not.
By accepting this quotation, you hereby agree to the terms and condition laid out on the M.S.A.`;

const STATUS_CONFIG = {
  draft:    { bg: "#e2e8f0", color: "#1e293b", label: "DRAFT",    dot: "#94a3b8" },
  sent:     { bg: "#dbeafe", color: "#1d4ed8", label: "SENT",     dot: "#3b82f6" },
  viewed:   { bg: "#ede9fe", color: "#5b21b6", label: "VIEWED",   dot: "#8b5cf6" },
  accepted: { bg: "#dcfce7", color: "#15803d", label: "ACCEPTED", dot: "#22c55e" },
  declined: { bg: "#fee2e2", color: "#b91c1c", label: "DECLINED", dot: "#ef4444" },
  expired:  { bg: "#fef3c7", color: "#92400e", label: "EXPIRED",  dot: "#f59e0b" },
};

/* ── Helper ─────────────────────────────────────────── */
function fmt(n) { return (n || 0).toFixed(2); }

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function QuoteDocument({ quote, docRef }) {
  if (!quote) return null;

  const includedItems  = (quote.line_items || []).filter(i => !i.optional || i.included);
  const optionalItems  = (quote.line_items || []).filter(i => i.optional && !i.included);
  const contractMonths = quote.contract_months || 24;
  const terms          = quote.terms || DEFAULT_TERMS;
  const status         = STATUS_CONFIG[quote.status] || STATUS_CONFIG.draft;
  const subtotal       = quote.subtotal ?? quote.total ?? 0;
  const issueDate      = quote.created_date ? format(new Date(quote.created_date), "d MMMM yyyy") : format(new Date(), "d MMMM yyyy");

  return (
    <div
      ref={docRef}
      className="quote-doc"
      style={{
        background: "#ffffff",
        fontFamily: "'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: "#1a1a1a",
        width: "100%",
        lineHeight: 1.5,
        boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
      }}
    >

      {/* ════════════════════════════════════════════════
          HEADER — dark brand panel
          ════════════════════════════════════════════════ */}
      <div style={{ background: `linear-gradient(160deg, ${DARK} 0%, ${MID} 50%, ${DARK} 100%)`, position: "relative", overflow: "hidden" }}>

        {/* Top accent bar */}
        <div style={{ height: 5, background: `linear-gradient(90deg, ${TEAL}, ${TEAL_L}, rgba(255,255,255,0.6), ${TEAL}, ${MAROON}, ${TEAL})`, backgroundSize: "400% auto" }} />

        {/* Dot-grid watermark */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.1,
          backgroundImage: `radial-gradient(circle, ${TEAL_L} 1px, transparent 1px)`,
          backgroundSize: "22px 22px", pointerEvents: "none",
        }} />

        {/* Right-side crest watermark */}
        <div style={{
          position: "absolute", right: -20, top: -20, width: 220, height: 220,
          backgroundImage: `url(${CREST_URL})`, backgroundSize: "contain",
          backgroundRepeat: "no-repeat", backgroundPosition: "center",
          opacity: 0.06, pointerEvents: "none",
        }} />

        <div style={{ padding: "44px 52px 40px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>

            {/* LEFT — Logo + Company */}
            <div>
              <img src={LOGO_WHITE} alt="TouchNet" crossOrigin="anonymous"
                style={{ height: 52, objectFit: "contain", display: "block", marginBottom: 20,
                  filter: "drop-shadow(0 0 12px rgba(0,212,212,0.3))" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: "0.04em" }}>{COMPANY.company}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", whiteSpace: "pre-line", lineHeight: 1.7 }}>{COMPANY.address}</span>
                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: "6px 20px" }}>
                  <span style={{ fontSize: 12, color: TEAL_L, fontWeight: 700 }}>{COMPANY.website}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>{COMPANY.phone}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{COMPANY.email}</span>
                </div>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>{COMPANY.vat}</span>
              </div>
            </div>

            {/* RIGHT — Quote badge */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              {/* Crest + QUOTATION */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "flex-end", marginBottom: 14 }}>
                <img src={CREST_URL} alt="Crest" crossOrigin="anonymous"
                  style={{ height: 52, opacity: 0.7, filter: "drop-shadow(0 0 10px rgba(0,212,212,0.4))" }} />
                <div>
                  <div style={{ fontSize: 34, fontWeight: 900, color: "#ffffff", letterSpacing: "-1px", lineHeight: 1, textTransform: "uppercase" }}>Quotation</div>
                  <div style={{ fontSize: 15, color: TEAL_L, fontWeight: 800, letterSpacing: "0.06em", marginTop: 4, fontFamily: "monospace" }}>
                    {quote.quote_number || "—"}
                  </div>
                </div>
              </div>
              {/* Status pill */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "7px 18px", borderRadius: 8,
                background: status.bg, color: status.color,
                fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase",
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: status.dot, flexShrink: 0, display: "inline-block" }} />
                {status.label}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${TEAL}44, transparent, ${MAROON}33)` }} />
      </div>

      {/* ════════════════════════════════════════════════
          INFO STRIP — Prepared By · For · Details
          ════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: `3px solid ${TEAL}` }}>

        {/* Prepared By */}
        <div style={{ padding: "28px 36px", borderRight: `1px solid #e8ecf3`, background: "#f7f9fc" }}>
          <div style={sectionLabelStyle(TEAL)}>PREPARED BY</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 2 }}>{quote.salesperson_name || COMPANY.name}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: MAROON }}>{COMPANY.company}</div>
          <div style={{ marginTop: 10, fontSize: 12, color: "#5a6b7f", lineHeight: 1.7 }}>
            <div>{COMPANY.email}</div>
            <div>{COMPANY.phone}</div>
          </div>
        </div>

        {/* Prepared For */}
        <div style={{ padding: "28px 36px", borderRight: `1px solid #e8ecf3`, background: "#ffffff" }}>
          <div style={sectionLabelStyle(TEAL)}>PREPARED FOR</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a", lineHeight: 1.3 }}>{quote.customer_company || quote.customer_name}</div>
          {quote.customer_company && (
            <div style={{ fontSize: 13, color: "#334155", marginTop: 3, fontWeight: 600 }}>{quote.customer_name}</div>
          )}
          {quote.customer_email && (
            <div style={{ fontSize: 12, color: MAROON, marginTop: 10, fontWeight: 700 }}>{quote.customer_email}</div>
          )}
          {quote.customer_phone && (
            <div style={{ fontSize: 12, color: "#5a6b7f", marginTop: 3, fontWeight: 600 }}>{quote.customer_phone}</div>
          )}
        </div>

        {/* Quote Details */}
        <div style={{ padding: "28px 36px", background: "#f7f9fc" }}>
          <div style={sectionLabelStyle(TEAL)}>QUOTE DETAILS</div>
          <InfoRow label="Issue Date"    value={issueDate} />
          {quote.valid_until && (
            <InfoRow label="Valid Until" value={format(new Date(quote.valid_until), "d MMMM yyyy")} valueColor="#c41e3a" />
          )}
          <InfoRow label="Contract Term" value={`${contractMonths} months`} />
          {quote.quote_number && (
            <InfoRow label="Reference" value={quote.quote_number} valueColor={TEAL} mono />
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          TITLE & COVER MESSAGE
          ════════════════════════════════════════════════ */}
      <div style={{ padding: "36px 52px 24px", borderBottom: `1px solid #eef2f7`, background: "#ffffff" }}>
        {/* Proposal chip */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 14px", borderRadius: 4,
          background: `${TEAL}14`, border: `1px solid ${TEAL}40`, color: TEAL,
          fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase",
          marginBottom: 14,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: TEAL, display: "inline-block" }} />
          COMMERCIAL PROPOSAL
        </div>

        <div style={{ fontSize: 30, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.8px", lineHeight: 1.2, marginBottom: 18 }}>
          {quote.title}
        </div>

        {quote.cover_message && (
          <div style={{
            fontSize: 14, color: "#3a4450", lineHeight: 1.9, maxWidth: 720,
            borderLeft: `5px solid ${TEAL}`, paddingLeft: 20,
            background: `${TEAL}05`, paddingTop: 12, paddingBottom: 12, paddingRight: 16,
            borderRadius: "0 6px 6px 0",
          }}>
            {quote.cover_message}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════
          SERVICE LINE ITEMS
          ════════════════════════════════════════════════ */}
      {includedItems.length > 0 && (
        <div style={{ padding: "32px 52px 16px" }}>
          <div style={sectionLabelStyle(TEAL, true)}>SERVICE ITEMS</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: `linear-gradient(135deg, ${DARK}, ${MID})` }}>
                <th style={th("left", "55%")}>Description</th>
                <th style={th("center", "8%")}>Qty</th>
                <th style={th("right", "17%")}>Unit Price</th>
                <th style={{ ...th("right", "20%"), color: TEAL_L }}>Total / mo</th>
              </tr>
            </thead>
            <tbody>
              {includedItems.map((item, idx) => (
                <tr key={item.id || idx} style={{
                  background: idx % 2 === 0 ? "#f9fbfd" : "#ffffff",
                  borderBottom: "1px solid #e8ecf3",
                }}>
                  <td style={td("left")}>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{item.description}</div>
                    {item.detail && <div style={{ fontSize: 12, color: "#6a7380", marginTop: 5, lineHeight: 1.7 }}>{item.detail}</div>}
                  </td>
                  <td style={{ ...td("center"), color: "#3a4450", fontWeight: 700 }}>{item.quantity}</td>
                  <td style={{ ...td("right"), color: "#3a4450", fontWeight: 700 }}>R {fmt(item.unit_price)}</td>
                  <td style={{ ...td("right"), fontWeight: 800, color: "#0f172a", fontSize: 14 }}>
                    R {fmt((item.quantity || 1) * (item.unit_price || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {quote.discount_percent > 0 && (
                <tr style={{ borderBottom: "1px solid #e8ecf3", background: "#f9fbfd" }}>
                  <td style={{ padding: "12px 18px", textAlign: "right", color: "#5a6b7f", fontSize: 13, fontWeight: 700 }}>
                    Discount ({quote.discount_percent}%)
                  </td>
                  <td style={{ padding: "12px 18px", textAlign: "right", color: "#059669", fontSize: 14, fontWeight: 800, width: 180 }}>
                    − R {fmt(quote.discount_amount)}
                  </td>
                </tr>
              )}
              <tr style={{
                background: `linear-gradient(90deg, ${TEAL}06, ${TEAL}0e)`,
                borderTop: `2px solid #e8ecf3`,
                borderBottom: `4px solid ${TEAL}`,
              }}>
                <td style={{ padding: "20px 18px", textAlign: "right", color: "#0f172a", fontSize: 15, fontWeight: 800 }}>
                  Total ZAR excluding VAT
                </td>
                <td style={{ padding: "20px 18px", textAlign: "right", width: 200 }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: DARK, letterSpacing: "-0.5px" }}>R {fmt(subtotal)}</div>
                  <div style={{ fontSize: 11, color: "#5a6b7f", marginTop: 4, fontWeight: 700 }}>
                    per month · {contractMonths}-month contract
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          RICH CONTENT SECTIONS
          ════════════════════════════════════════════════ */}
      {(quote.sections || []).length > 0 && (
        <div style={{ padding: "24px 52px 8px", borderTop: "1px solid #eef2f7" }}>
          {(quote.sections || []).map((s, i) => (
            <RichSection key={s.id || i} section={s} brand={TEAL} accent={MAROON} />
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════
          OPTIONAL ADD-ONS
          ════════════════════════════════════════════════ */}
      {optionalItems.length > 0 && (
        <div style={{ padding: "12px 52px 28px" }}>
          <div style={sectionLabelStyle("#d97706", true)}>OPTIONAL ADD-ONS</div>
          <div style={{ border: "1px solid #fde68a", borderRadius: 8, overflow: "hidden", background: "#fffdf5" }}>
            {optionalItems.map((item, idx) => (
              <div key={item.id || idx} style={{
                display: "flex", justifyContent: "space-between", padding: "14px 18px",
                borderBottom: idx < optionalItems.length - 1 ? "1px solid #fde68a" : "none",
                alignItems: "flex-start", background: idx % 2 === 0 ? "#fffdf5" : "#ffffff",
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{item.description}</div>
                  {item.detail && <div style={{ fontSize: 11, color: "#78716c", marginTop: 3 }}>{item.detail}</div>}
                </div>
                <div style={{ fontWeight: 800, color: "#92400e", fontSize: 14, whiteSpace: "nowrap", marginLeft: 20 }}>
                  R {fmt((item.quantity || 1) * (item.unit_price || 0))}/mo
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          NOTES
          ════════════════════════════════════════════════ */}
      {quote.notes && (
        <div style={{ margin: "8px 52px 28px" }}>
          <div style={sectionLabelStyle(TEAL)}>NOTES</div>
          <div style={{
            padding: "18px 22px", background: "#f7fbfc",
            borderLeft: `5px solid ${TEAL}`, borderRadius: "0 8px 8px 0",
            fontSize: 13, color: "#3a4450", lineHeight: 1.85,
          }}>
            {quote.notes}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          BANKING DETAILS
          ════════════════════════════════════════════════ */}
      <div style={{ margin: "0 52px 32px", borderRadius: 10, overflow: "hidden", boxShadow: "0 4px 20px rgba(10,15,26,0.25)" }}>
        <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, ${MID} 100%)`, padding: "22px 28px", position: "relative" }}>
          {/* Top bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4,
            background: `linear-gradient(90deg, ${TEAL}, ${TEAL_L}, ${MAROON})` }} />
          {/* Dot grid */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.07,
            backgroundImage: `radial-gradient(circle, ${TEAL_L} 1px, transparent 1px)`,
            backgroundSize: "18px 18px", pointerEvents: "none",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={sectionLabelStyle(TEAL_L)}>BANKING DETAILS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 32px", marginTop: 4 }}>
              {[
                ["Account Name",   BANKING.accountName],
                ["Bank",          BANKING.bank],
                ["Account No.",   BANKING.accountNumber],
                ["Branch / Code", `${BANKING.branch} · ${BANKING.branchCode}`],
                ["Account Type",  BANKING.accountType],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, minWidth: 110, flexShrink: 0 }}>{label}:</span>
                  <span style={{ fontSize: 12, color: "#ffffff", fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Payment instruction strip */}
        <div style={{
          background: `${TEAL}10`, borderTop: `1px solid ${TEAL}30`,
          padding: "10px 28px", display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: TEAL, flexShrink: 0, display: "inline-block" }} />
          <span style={{ fontSize: 11, color: "#3a4450", fontWeight: 600 }}>
            Please use your <strong>quote number ({quote.quote_number || "—"})</strong> as the payment reference.
          </span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          TERMS & CONDITIONS
          ════════════════════════════════════════════════ */}
      <div style={{ margin: "0 52px", padding: "24px 0 12px", borderTop: "2px solid #e8ecf3" }}>
        <div style={sectionLabelStyle("#5a6b7f")}>TERMS &amp; CONDITIONS</div>
        <div style={{ fontSize: 11.5, color: "#404a55", lineHeight: 2, whiteSpace: "pre-line" }}>{terms}</div>
      </div>

      {/* ════════════════════════════════════════════════
          SIGNATURE BLOCK (if accepted)
          ════════════════════════════════════════════════ */}
      {quote.status === "accepted" && (
        <div style={{ margin: "24px 52px 0", padding: "20px 24px", borderRadius: 8, border: `1px solid ${TEAL}33`, background: `${TEAL}05` }}>
          <div style={sectionLabelStyle("#059669")}>ACCEPTED</div>
          {quote.signature_data_url && (
            <img src={quote.signature_data_url} alt="Signature" style={{ maxHeight: 80, marginBottom: 8, borderBottom: "1px solid #ccc" }} />
          )}
          <div style={{ fontSize: 12, color: "#5a6b7f", marginTop: 6 }}>
            Accepted by <strong style={{ color: "#0f172a" }}>{quote.customer_name}</strong>
            {quote.responded_at && ` on ${format(new Date(quote.responded_at), "d MMMM yyyy")}`}
          </div>
          {quote.customer_feedback && (
            <div style={{ marginTop: 8, fontSize: 13, color: "#334155", fontStyle: "italic" }}>"{quote.customer_feedback}"</div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════════ */}
      <div style={{
        background: `linear-gradient(135deg, ${DARK} 0%, ${MID} 100%)`,
        marginTop: 36, padding: "28px 52px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: `4px solid ${TEAL}33`,
        position: "relative", overflow: "hidden",
      }}>
        {/* Dot grid bg */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.07,
          backgroundImage: `radial-gradient(circle, ${TEAL_L} 1px, transparent 1px)`,
          backgroundSize: "18px 18px", pointerEvents: "none",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative", zIndex: 1 }}>
          <img src={CREST_URL} alt="Crest" crossOrigin="anonymous"
            style={{ height: 40, opacity: 0.6, filter: "drop-shadow(0 0 8px rgba(0,212,212,0.4))" }} />
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              TouchNet Telecommunications (PTY) LTD
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 3 }}>
              {COMPANY.reg} · {COMPANY.vat} · {COMPANY.website}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 11, color: TEAL_L, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            BUILD · CONNECT · PROTECT
          </div>
          {quote.quote_number && (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 4, fontFamily: "monospace" }}>
              Ref: {quote.quote_number}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

/* ── InfoRow helper ─────────────────────────────────── */
function InfoRow({ label, value, valueColor, mono }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, color: "#7a8696", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: valueColor || "#1a1a1a", fontFamily: mono ? "monospace" : "inherit" }}>{value}</div>
    </div>
  );
}

/* ── Style helpers ──────────────────────────────────── */
function sectionLabelStyle(color, withBar = false) {
  return {
    fontSize: 10, fontWeight: 900, letterSpacing: "0.18em",
    textTransform: "uppercase", color,
    marginBottom: withBar ? 16 : 10,
    ...(withBar ? { borderBottom: `2px solid ${color}33`, paddingBottom: 8 } : {}),
  };
}
function th(align, width) {
  return {
    padding: "15px 18px", textAlign: align, color: "#ffffff",
    fontWeight: 800, fontSize: 11, letterSpacing: "0.1em",
    textTransform: "uppercase", width,
  };
}
function td(align) {
  return { padding: "15px 18px", textAlign: align, verticalAlign: "top", fontSize: 13 };
}

/* ── Rich Section ───────────────────────────────────── */
function RichSection({ section, brand, accent }) {
  if (section.type === "divider") {
    return <hr style={{ border: "none", borderTop: "1px solid #e8ecf3", margin: "18px 0" }} />;
  }
  return (
    <div style={{ marginBottom: 24 }}>
      {section.heading && (
        <div style={{
          fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 10,
          textTransform: "uppercase", letterSpacing: "0.1em",
          borderBottom: `2px solid ${brand}40`, paddingBottom: 7, display: "inline-block",
        }}>
          {section.heading}
        </div>
      )}
      {section.type === "text" && section.content && (
        <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.85, whiteSpace: "pre-line" }}>
          {section.content}
        </div>
      )}
      {section.type === "image" && section.image_url && (
        <div>
          <img src={section.image_url} alt={section.heading || ""} style={{ width: "100%", borderRadius: 8, objectFit: "cover", maxHeight: 280 }} />
          {section.content && <div style={{ fontSize: 11, color: "#64748b", textAlign: "center", marginTop: 7 }}>{section.content}</div>}
        </div>
      )}
      {(section.type === "link" || section.type === "file") && section.url && (
        <div>
          {section.content && <div style={{ fontSize: 13, color: "#334155", marginBottom: 10 }}>{section.content}</div>}
          <a href={section.url} target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px",
              borderRadius: 7, fontSize: 12, fontWeight: 800, color: "#ffffff",
              background: `linear-gradient(135deg, ${brand}, ${brand}bb)`,
              textDecoration: "none", letterSpacing: "0.04em",
            }}>
            {section.type === "file" ? "Download File" : (section.label || "Open Link")} →
          </a>
        </div>
      )}
    </div>
  );
}