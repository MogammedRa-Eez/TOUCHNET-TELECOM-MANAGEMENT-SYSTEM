import React from "react";
import { format } from "date-fns";

const LOGO_URL = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/b3b518de6_Touchnet_LogoLongWhite.png";
const LOGO_DARK = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";
const CREST_URL = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/639b91697_Touchnet-CrestDesogm_CrestFinalFullWhite.png";

const BRAND = "#00b4b4";
const BRAND_DARK = "#007a7a";
const ACCENT = "#8B1A1A";
const DARK = "#0a0f1a";

const COMPANY = {
  name: "Prasheel Thakor",
  company: "Touchnet Telecommunications",
  address: "151 Katherine Street, Sandown\nSandton, Johannesburg, 2196",
  website: "www.touchnet.co.za",
  email: "sales@touchnet.co.za",
  phone: "010 060 0400",
  reg: "Reg No: 2019/123456/07",
};

const BANKING = {
  accountName: "Touchnet Telecommunications (PTY) LTD",
  accountNumber: "001991264",
  accountType: "Current Account",
  bank: "Standard Bank",
  branch: "Rosebank",
  branchCode: "00 43 05",
};

export const DEFAULT_TERMS = `All pricing excludes VAT.
Installation and once-off fees invoiced on acceptance of quote - payable within 7 days of receipt of invoice
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
  draft:    { bg: "#e2e8f0", color: "#1e293b", label: "DRAFT" },
  sent:     { bg: "#dbeafe", color: "#1d4ed8", label: "SENT" },
  viewed:   { bg: "#ede9fe", color: "#5b21b6", label: "VIEWED" },
  accepted: { bg: "#dcfce7", color: "#15803d", label: "ACCEPTED" },
  declined: { bg: "#fee2e2", color: "#b91c1c", label: "DECLINED" },
  expired:  { bg: "#fef3c7", color: "#92400e", label: "EXPIRED" },
};

export default function QuoteDocument({ quote, docRef }) {
  if (!quote) return null;

  const includedItems = (quote.line_items || []).filter(i => !i.optional || i.included);
  const optionalItems = (quote.line_items || []).filter(i => i.optional && !i.included);
  const contractMonths = quote.contract_months || 24;
  const terms = quote.terms || DEFAULT_TERMS;
  const status = STATUS_CONFIG[quote.status] || STATUS_CONFIG.draft;
  const subtotal = quote.subtotal || quote.total || 0;

  return (
    <div ref={docRef} className="quote-doc" style={{
      background: "#ffffff",
      fontFamily: "'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      color: "#1a1a1a",
      maxWidth: "100%",
      lineHeight: 1.5,
    }}>

      {/* ── Premium Header ── */}
      <div style={{
        background: `linear-gradient(135deg, ${DARK} 0%, #0f1f2e 50%, ${DARK} 100%)`,
        padding: "0",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      }}>
        {/* Accent top bar */}
        <div style={{ height: 5, background: `linear-gradient(90deg, ${BRAND}, ${BRAND_DARK}, ${ACCENT}, ${BRAND})`, backgroundSize: "300% auto" }} />

        {/* Dot grid overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.12,
          backgroundImage: "radial-gradient(circle, rgba(0,212,212,0.4) 1px, transparent 1px)",
          backgroundSize: "24px 24px", pointerEvents: "none",
        }} />

        <div style={{ padding: "40px 48px 36px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 32 }}>
            {/* Logo + company */}
            <div>
              <img src={LOGO_URL} alt="TouchNet" style={{ height: 48, objectFit: "contain", display: "block", marginBottom: 16 }} crossOrigin="anonymous" />
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.04em" }}>{COMPANY.company}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", whiteSpace: "pre-line", lineHeight: 1.7, marginTop: 4 }}>{COMPANY.address}</div>
              <div style={{ marginTop: 10, display: "flex", gap: 20 }}>
                <span style={{ fontSize: 12, color: BRAND, fontWeight: 600 }}>{COMPANY.website}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>{COMPANY.phone}</span>
              </div>
            </div>

            {/* Quote badge */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "flex-end", marginBottom: 12 }}>
                <img src={CREST_URL} alt="Crest" style={{ height: 44, opacity: 0.65 }} crossOrigin="anonymous" />
                <div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#ffffff", letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 2 }}>QUOTATION</div>
                  <div style={{ fontSize: 14, color: BRAND, fontWeight: 800, letterSpacing: "0.05em", fontFamily: "'JetBrains Mono',monospace" }}>
                    {quote.quote_number || "—"}
                  </div>
                </div>
              </div>
              <div style={{
                display: "inline-block", padding: "6px 16px", borderRadius: 6,
                background: status.bg, color: status.color,
                fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
              }}>
                {status.label}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Info Strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: `2px solid #e8eef5` }}>
        {/* FROM */}
        <div style={{ padding: "28px 36px", borderRight: "1px solid #eef2f7", background: "#fafbfd" }}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: BRAND, marginBottom: 10 }}>PREPARED BY</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>{quote.salesperson_name || COMPANY.name}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, marginTop: 3 }}>{COMPANY.company}</div>
          <div style={{ fontSize: 12, color: "#5a6b7f", marginTop: 10, lineHeight: 1.6 }}>
            <div>{COMPANY.email}</div>
            <div style={{ marginTop: 3 }}>{COMPANY.phone}</div>
          </div>
        </div>

        {/* FOR */}
        <div style={{ padding: "28px 36px", borderRight: "1px solid #eef2f7", background: "#ffffff" }}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: BRAND, marginBottom: 10 }}>PREPARED FOR</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>{quote.customer_company || quote.customer_name}</div>
          {quote.customer_company && (
            <div style={{ fontSize: 13, color: "#334155", marginTop: 4 }}>{quote.customer_name}</div>
          )}
          {quote.customer_email && (
            <div style={{ fontSize: 12, color: ACCENT, marginTop: 10, fontWeight: 600 }}>{quote.customer_email}</div>
          )}
          {quote.customer_phone && (
            <div style={{ fontSize: 12, color: "#5a6b7f", marginTop: 3, fontWeight: 600 }}>{quote.customer_phone}</div>
          )}
        </div>

        {/* DETAILS */}
        <div style={{ padding: "28px 36px", background: "#fafbfd" }}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: BRAND, marginBottom: 10 }}>QUOTE DETAILS</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: "#7a8696", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Issue Date</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>
              {quote.created_date ? format(new Date(quote.created_date), "d MMMM yyyy") : format(new Date(), "d MMMM yyyy")}
            </div>
          </div>
          {quote.valid_until && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: "#7a8696", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Valid Until</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#c41e3a" }}>{format(new Date(quote.valid_until), "d MMMM yyyy")}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 10, color: "#7a8696", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Contract Term</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{contractMonths} months</div>
          </div>
        </div>
      </div>

      {/* ── Title & Cover ── */}
      <div style={{ padding: "36px 48px 20px", borderBottom: "1px solid #f0f4f8" }}>
        <div style={{
          display: "inline-block", padding: "4px 12px", borderRadius: 5,
          background: `${BRAND}12`, color: BRAND,
          fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: 12,
        }}>
          PROPOSAL
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.6px", lineHeight: 1.2, marginBottom: 16 }}>{quote.title}</div>
        {quote.cover_message && (
          <div style={{ marginTop: 0, fontSize: 14, color: "#404a55", lineHeight: 1.85, maxWidth: 700, borderLeft: `4px solid ${BRAND}`, paddingLeft: 18 }}>
            {quote.cover_message}
          </div>
        )}
      </div>

      {/* ── Line Items ── */}
      {includedItems.length > 0 && (
        <div style={{ padding: "28px 48px 12px" }}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: BRAND, marginBottom: 14 }}>SERVICE ITEMS</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#0a0a0a" }}>
                <th style={{ padding: "14px 18px", textAlign: "left", color: "#ffffff", fontWeight: 800, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", width: "55%" }}>Description</th>
                <th style={{ padding: "14px 18px", textAlign: "center", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", width: "8%" }}>Qty</th>
                <th style={{ padding: "14px 18px", textAlign: "right", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", width: "17%" }}>Unit Price</th>
                <th style={{ padding: "14px 18px", textAlign: "right", color: BRAND, fontWeight: 800, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", width: "20%" }}>Total / mo</th>
              </tr>
            </thead>
            <tbody>
              {includedItems.map((item, idx) => (
                <tr key={item.id} style={{ background: idx % 2 === 0 ? "#fafbfd" : "#ffffff", borderBottom: "1px solid #e8ecf1" }}>
                  <td style={{ padding: "16px 18px", verticalAlign: "top" }}>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{item.description}</div>
                    {item.detail && <div style={{ fontSize: 12, color: "#6a7380", marginTop: 5, lineHeight: 1.7 }}>{item.detail}</div>}
                  </td>
                  <td style={{ padding: "16px 18px", textAlign: "center", color: "#3a4450", fontWeight: 700, verticalAlign: "top", fontSize: 12 }}>{item.quantity}</td>
                  <td style={{ padding: "16px 18px", textAlign: "right", color: "#3a4450", fontWeight: 700, verticalAlign: "top", fontSize: 12 }}>R {(item.unit_price || 0).toFixed(2)}</td>
                  <td style={{ padding: "16px 18px", textAlign: "right", fontWeight: 800, color: "#0f172a", verticalAlign: "top", fontSize: 13 }}>R {((item.quantity || 1) * (item.unit_price || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 0 }}>
            <tbody>
              {quote.discount_percent > 0 && (
                <tr style={{ borderBottom: "1px solid #e8ecf1" }}>
                  <td style={{ padding: "12px 18px", textAlign: "right", color: "#5a6b7f", fontSize: 13, fontWeight: 700 }}>Discount ({quote.discount_percent}%)</td>
                  <td style={{ padding: "12px 18px", textAlign: "right", color: "#059669", fontSize: 14, fontWeight: 800, width: 180 }}>- R {(quote.discount_amount || 0).toFixed(2)}</td>
                </tr>
              )}
              <tr style={{ background: `${BRAND}08`, borderTop: "2px solid #e8ecf1", borderBottom: `3px solid ${BRAND}` }}>
                <td style={{ padding: "18px 18px", textAlign: "right", color: "#0f172a", fontSize: 15, fontWeight: 800 }}>Total ZAR excluding VAT</td>
                <td style={{ padding: "18px 18px", textAlign: "right", width: 180 }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#0a0a0a", lineHeight: 1.1 }}>R {subtotal.toFixed(2)}</div>
                  <div style={{ fontSize: 11, color: "#5a6b7f", marginTop: 4, fontWeight: 700 }}>per month · {contractMonths}-month contract</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ── Rich Sections ── */}
      {(quote.sections || []).length > 0 && (
        <div style={{ padding: "20px 40px 8px", borderTop: "1px solid #f1f5f9" }}>
          {(quote.sections || []).map(s => <RichSection key={s.id} section={s} brand={BRAND} accent={ACCENT} />)}
        </div>
      )}

      {/* ── Optional Add-ons ── */}
      {optionalItems.length > 0 && (
        <div style={{ padding: "8px 40px 24px" }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#d97706", marginBottom: 10 }}>OPTIONAL ADD-ONS</div>
          <div style={{ border: "1px solid #fcd34d", borderRadius: 8, overflow: "hidden", background: "#fffbeb" }}>
            {optionalItems.map((item, idx) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderBottom: idx < optionalItems.length - 1 ? "1px solid #fde68a" : "none", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{item.description}</div>
                  {item.detail && <div style={{ fontSize: 11, color: "#78716c", marginTop: 3 }}>{item.detail}</div>}
                </div>
                <div style={{ fontWeight: 800, color: "#92400e", fontSize: 14, whiteSpace: "nowrap", marginLeft: 16 }}>
                  R {((item.quantity || 1) * (item.unit_price || 0)).toFixed(2)}/mo
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Notes ── */}
      {quote.notes && (
        <div style={{ margin: "0 48px 28px", padding: "18px 22px", background: "#fafbfd", borderLeft: `5px solid ${BRAND}`, borderRadius: "0 6px 6px 0" }}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: BRAND, marginBottom: 10 }}>NOTES</div>
          <div style={{ fontSize: 13, color: "#3a4450", lineHeight: 1.8 }}>{quote.notes}</div>
        </div>
      )}

      {/* ── Banking Details ── */}
      <div style={{ margin: "0 48px 28px", padding: "22px 26px", background: `${DARK}`, borderRadius: 8, position: "relative", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,${BRAND},${ACCENT},${BRAND})` }} />
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: BRAND, marginBottom: 14 }}>BANKING DETAILS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
          {[
            ["Account Name", BANKING.accountName],
            ["Bank", BANKING.bank],
            ["Account Number", BANKING.accountNumber],
            ["Branch / Code", `${BANKING.branch} · ${BANKING.branchCode}`],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 700, minWidth: 120, flexShrink: 0 }}>{label}:</div>
              <div style={{ fontSize: 12, color: "#ffffff", fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Terms ── */}
      <div style={{ margin: "0 48px", padding: "24px 0 12px", borderTop: "2px solid #e8ecf1" }}>
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: "#5a6b7f", marginBottom: 14 }}>TERMS &amp; CONDITIONS</div>
        <div style={{ fontSize: 12, color: "#404a55", lineHeight: 2, whiteSpace: "pre-line" }}>{terms}</div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        background: DARK, marginTop: 32,
        padding: "24px 48px", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: `2px solid rgba(0,212,212,0.15)`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src={CREST_URL} alt="Crest" style={{ height: 36, opacity: 0.55 }} crossOrigin="anonymous" />
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>TouchNet Telecommunications (PTY) LTD</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{COMPANY.reg} · {COMPANY.website}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: BRAND, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>BUILD · CONNECT · PROTECT</div>
          {quote.quote_number && (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3, fontWeight: 600 }}>Ref: {quote.quote_number}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function RichSection({ section, brand, accent }) {
  if (section.type === "divider") return <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "16px 0" }} />;
  return (
    <div style={{ marginBottom: 22 }}>
      {section.heading && (
        <div style={{
          fontSize: 11, fontWeight: 800, color: "#0f172a", marginBottom: 10,
          textTransform: "uppercase", letterSpacing: "0.1em",
          borderBottom: `2px solid ${brand}`, paddingBottom: 6, display: "inline-block",
        }}>{section.heading}</div>
      )}
      {section.type === "text" && section.content && (
        <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.8, whiteSpace: "pre-line" }}>{section.content}</div>
      )}
      {section.type === "image" && section.image_url && (
        <div>
          <img src={section.image_url} alt={section.heading || ""} style={{ width: "100%", borderRadius: 6, objectFit: "cover", maxHeight: 260 }} />
          {section.content && <div style={{ fontSize: 11, color: "#64748b", textAlign: "center", marginTop: 6 }}>{section.content}</div>}
        </div>
      )}
      {(section.type === "link" || section.type === "file") && section.url && (
        <div>
          {section.content && <div style={{ fontSize: 13, color: "#334155", marginBottom: 8 }}>{section.content}</div>}
          <a href={section.url} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#ffffff", background: brand, textDecoration: "none" }}>
            {section.type === "file" ? "Download File" : (section.label || "Open Link")}
          </a>
        </div>
      )}
    </div>
  );
}