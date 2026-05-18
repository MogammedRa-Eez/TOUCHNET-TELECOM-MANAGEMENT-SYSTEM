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
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      color: "#0f172a",
      maxWidth: "100%",
    }}>

      {/* ── Premium Header ── */}
      <div style={{
        background: `linear-gradient(135deg, ${DARK} 0%, #0f1f2e 50%, ${DARK} 100%)`,
        padding: "0",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Accent top bar */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${BRAND}, ${BRAND_DARK}, ${ACCENT}, ${BRAND})`, backgroundSize: "300% auto" }} />

        {/* Dot grid overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.15,
          backgroundImage: "radial-gradient(circle, rgba(0,212,212,0.5) 1px, transparent 1px)",
          backgroundSize: "22px 22px", pointerEvents: "none",
        }} />

        <div style={{ padding: "32px 40px 28px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Logo + company */}
            <div>
              <img src={LOGO_URL} alt="TouchNet" style={{ height: 44, objectFit: "contain", display: "block", marginBottom: 12 }} crossOrigin="anonymous" />
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em" }}>{COMPANY.company}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", whiteSpace: "pre-line", lineHeight: 1.6, marginTop: 2 }}>{COMPANY.address}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 16 }}>
                <span style={{ fontSize: 11, color: BRAND }}>{COMPANY.website}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{COMPANY.phone}</span>
              </div>
            </div>

            {/* Quote badge */}
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end", marginBottom: 8 }}>
                <img src={CREST_URL} alt="Crest" style={{ height: 40, opacity: 0.6 }} crossOrigin="anonymous" />
                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#ffffff", letterSpacing: "-1px", lineHeight: 1 }}>QUOTATION</div>
                  <div style={{ fontSize: 13, color: BRAND, fontWeight: 700, marginTop: 3, letterSpacing: "0.04em" }}>
                    {quote.quote_number || "—"}
                  </div>
                </div>
              </div>
              <div style={{
                display: "inline-block", padding: "5px 14px", borderRadius: 20,
                background: status.bg, color: status.color,
                fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
              }}>
                {status.label}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Info Strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: `3px solid ${BRAND}22` }}>
        {/* FROM */}
        <div style={{ padding: "22px 28px", borderRight: "1px solid #e2e8f0", background: "#fafbfc" }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: BRAND, marginBottom: 8 }}>PREPARED BY</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{quote.salesperson_name || COMPANY.name}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, marginTop: 2 }}>{COMPANY.company}</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>{COMPANY.email}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>{COMPANY.phone}</div>
        </div>

        {/* FOR */}
        <div style={{ padding: "22px 28px", borderRight: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: BRAND, marginBottom: 8 }}>PREPARED FOR</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{quote.customer_company || quote.customer_name}</div>
          {quote.customer_company && (
            <div style={{ fontSize: 12, color: "#334155", marginTop: 3 }}>{quote.customer_name}</div>
          )}
          {quote.customer_email && (
            <div style={{ fontSize: 11, color: ACCENT, marginTop: 8 }}>{quote.customer_email}</div>
          )}
          {quote.customer_phone && (
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{quote.customer_phone}</div>
          )}
        </div>

        {/* DETAILS */}
        <div style={{ padding: "22px 28px", background: "#fafbfc" }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: BRAND, marginBottom: 8 }}>QUOTE DETAILS</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Issue Date</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              {quote.created_date ? format(new Date(quote.created_date), "d MMMM yyyy") : format(new Date(), "d MMMM yyyy")}
            </div>
          </div>
          {quote.valid_until && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Valid Until</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#b91c1c" }}>{format(new Date(quote.valid_until), "d MMMM yyyy")}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Contract Term</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{contractMonths} months</div>
          </div>
        </div>
      </div>

      {/* ── Title & Cover ── */}
      <div style={{ padding: "28px 40px 16px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{
          display: "inline-block", padding: "3px 10px", borderRadius: 4,
          background: `${BRAND}15`, color: BRAND,
          fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: 10,
        }}>
          PROPOSAL
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px", lineHeight: 1.25 }}>{quote.title}</div>
        {quote.cover_message && (
          <div style={{ marginTop: 14, fontSize: 14, color: "#475569", lineHeight: 1.8, maxWidth: 680, borderLeft: `3px solid ${BRAND}`, paddingLeft: 16 }}>
            {quote.cover_message}
          </div>
        )}
      </div>

      {/* ── Line Items ── */}
      {includedItems.length > 0 && (
        <div style={{ padding: "20px 40px 8px" }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: BRAND, marginBottom: 12 }}>SERVICE ITEMS</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: DARK }}>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "#ffffff", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", width: "55%" }}>Description</th>
                <th style={{ padding: "12px 16px", textAlign: "center", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", width: "8%" }}>Qty</th>
                <th style={{ padding: "12px 16px", textAlign: "right", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", width: "17%" }}>Unit Price</th>
                <th style={{ padding: "12px 16px", textAlign: "right", color: BRAND, fontWeight: 800, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", width: "20%" }}>Total / mo</th>
              </tr>
            </thead>
            <tbody>
              {includedItems.map((item, idx) => (
                <tr key={item.id} style={{ background: idx % 2 === 0 ? "#f8fafc" : "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{item.description}</div>
                    {item.detail && <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, lineHeight: 1.6 }}>{item.detail}</div>}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center", color: "#334155", fontWeight: 600, verticalAlign: "top" }}>{item.quantity}</td>
                  <td style={{ padding: "14px 16px", textAlign: "right", color: "#334155", fontWeight: 600, verticalAlign: "top" }}>R {(item.unit_price || 0).toFixed(2)}</td>
                  <td style={{ padding: "14px 16px", textAlign: "right", fontWeight: 800, color: "#0f172a", verticalAlign: "top" }}>R {((item.quantity || 1) * (item.unit_price || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 0 }}>
            <tbody>
              {quote.discount_percent > 0 && (
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "10px 16px", textAlign: "right", color: "#64748b", fontSize: 12, fontWeight: 600 }}>Discount ({quote.discount_percent}%)</td>
                  <td style={{ padding: "10px 16px", textAlign: "right", color: "#16a34a", fontSize: 13, fontWeight: 700, width: 180 }}>- R {(quote.discount_amount || 0).toFixed(2)}</td>
                </tr>
              )}
              <tr style={{ background: `${BRAND}10`, borderBottom: `2px solid ${BRAND}30` }}>
                <td style={{ padding: "16px 16px", textAlign: "right", color: "#0f172a", fontSize: 14, fontWeight: 800 }}>Total ZAR excluding VAT</td>
                <td style={{ padding: "16px 16px", textAlign: "right", width: 180 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: DARK }}>R {subtotal.toFixed(2)}</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 3, fontWeight: 600 }}>per month · {contractMonths}-month contract</div>
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
        <div style={{ margin: "0 40px 24px", padding: "16px 20px", background: "#f8fafc", borderLeft: `4px solid ${BRAND}`, borderRadius: "0 8px 8px 0" }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: BRAND, marginBottom: 8 }}>NOTES</div>
          <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.7 }}>{quote.notes}</div>
        </div>
      )}

      {/* ── Banking Details ── */}
      <div style={{ margin: "0 40px 24px", padding: "20px 24px", background: `${DARK}`, borderRadius: 8, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${BRAND},${ACCENT},${BRAND})` }} />
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: BRAND, marginBottom: 12 }}>BANKING DETAILS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px" }}>
          {[
            ["Account Name", BANKING.accountName],
            ["Bank", BANKING.bank],
            ["Account Number", BANKING.accountNumber],
            ["Branch / Code", `${BANKING.branch} · ${BANKING.branchCode}`],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, minWidth: 110, flexShrink: 0 }}>{label}:</div>
              <div style={{ fontSize: 11, color: "#ffffff", fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Terms ── */}
      <div style={{ margin: "0 40px", padding: "20px 0 8px", borderTop: "2px solid #e2e8f0" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748b", marginBottom: 12 }}>TERMS &amp; CONDITIONS</div>
        <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.9, whiteSpace: "pre-line" }}>{terms}</div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        background: DARK, marginTop: 24,
        padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={CREST_URL} alt="Crest" style={{ height: 32, opacity: 0.5 }} crossOrigin="anonymous" />
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase" }}>TouchNet Telecommunications (PTY) LTD</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{COMPANY.reg} · {COMPANY.website}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, color: BRAND, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>BUILD · CONNECT · PROTECT</div>
          {quote.quote_number && (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>Ref: {quote.quote_number}</div>
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