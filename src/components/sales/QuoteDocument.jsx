import React from "react";
import { format } from "date-fns";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

const COMPANY = {
  name: "Prasheel Thakor",
  company: "Touchnet",
  address: "151 Katherine Street\nSandown\nSandton\nJohannesburg",
  website: "www.touchnet.co.za",
  phone: "010 060 0400",
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
  draft:    { bg: "#e2e8f0", color: "#1e293b", label: "Draft" },
  sent:     { bg: "#dbeafe", color: "#1d4ed8", label: "Sent" },
  viewed:   { bg: "#ede9fe", color: "#5b21b6", label: "Viewed" },
  accepted: { bg: "#dcfce7", color: "#15803d", label: "Accepted" },
  declined: { bg: "#fee2e2", color: "#b91c1c", label: "Declined" },
  expired:  { bg: "#fef3c7", color: "#92400e", label: "Expired" },
};

const styles = {
  label: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: 6,
  },
  value: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: 500,
    lineHeight: 1.5,
  },
  boldValue: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: 700,
    lineHeight: 1.5,
  },
  accent: {
    color: "#e11d48",
    fontSize: 14,
    fontWeight: 500,
  },
};

export default function QuoteDocument({ quote, docRef }) {
  if (!quote) return null;

  const includedItems = (quote.line_items || []).filter(i => !i.optional || i.included);
  const optionalItems = (quote.line_items || []).filter(i => i.optional && !i.included);
  const contractMonths = quote.contract_months || 24;
  const terms = quote.terms || DEFAULT_TERMS;
  const status = STATUS_CONFIG[quote.status] || STATUS_CONFIG.draft;

  return (
    <div ref={docRef} style={{ background: "#ffffff", fontFamily: "'Segoe UI', Arial, sans-serif", color: "#0f172a" }}>

      {/* ── Header ── */}
      <div style={{ padding: "32px 40px 24px", borderBottom: "2px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ border: "1px solid #e2e8f0", padding: 12, display: "inline-block" }}>
          <img src={LOGO_URL} alt="TouchNet" style={{ height: 56, objectFit: "contain", display: "block" }} crossOrigin="anonymous" />
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>QUOTATION</div>
          {quote.quote_number && (
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e11d48", marginTop: 2 }}>{quote.quote_number}</div>
          )}
          <div style={{ marginTop: 8, display: "inline-block", padding: "4px 12px", borderRadius: 6, background: status.bg, color: status.color, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {status.label}
          </div>
        </div>
      </div>

      {/* ── Info Strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "2px solid #e2e8f0" }}>
        {/* FROM */}
        <div style={{ padding: "24px 32px", borderRight: "1px solid #e2e8f0" }}>
          <div style={styles.label}>FROM</div>
          <div style={styles.boldValue}>{quote.salesperson_name || COMPANY.name}</div>
          <div style={{ ...styles.boldValue, color: "#e11d48" }}>{COMPANY.company}</div>
          <div style={{ ...styles.value, marginTop: 6, color: "#334155", whiteSpace: "pre-line" }}>{COMPANY.address}</div>
          <div style={{ marginTop: 8 }}>
            <div style={styles.label}>WEBSITE</div>
            <div style={styles.accent}>{COMPANY.website}</div>
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={styles.label}>PHONE</div>
            <div style={styles.accent}>{COMPANY.phone}</div>
          </div>
        </div>

        {/* FOR */}
        <div style={{ padding: "24px 32px", borderRight: "1px solid #e2e8f0" }}>
          <div style={styles.label}>PREPARED FOR</div>
          <div style={{ ...styles.boldValue, fontSize: 15, color: "#0f172a" }}>{quote.customer_company || quote.customer_name}</div>
          {quote.customer_company && (
            <div style={{ ...styles.value, marginTop: 4, color: "#334155" }}>{quote.customer_name}</div>
          )}
          {quote.customer_email && (
            <div style={{ marginTop: 10 }}>
              <div style={styles.label}>EMAIL</div>
              <div style={styles.accent}>{quote.customer_email}</div>
            </div>
          )}
          {quote.customer_phone && (
            <div style={{ marginTop: 8 }}>
              <div style={styles.label}>PHONE</div>
              <div style={styles.value}>{quote.customer_phone}</div>
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div style={{ padding: "24px 32px" }}>
          <div style={styles.label}>QUOTE DATE</div>
          <div style={styles.value}>
            {quote.created_date ? format(new Date(quote.created_date), "d MMMM yyyy") : format(new Date(), "d MMMM yyyy")}
          </div>
          {quote.valid_until && (
            <div style={{ marginTop: 10 }}>
              <div style={styles.label}>VALID UNTIL</div>
              <div style={{ ...styles.value, color: "#b91c1c", fontWeight: 600 }}>{format(new Date(quote.valid_until), "d MMMM yyyy")}</div>
            </div>
          )}
          <div style={{ marginTop: 10 }}>
            <div style={styles.label}>CONTRACT TERM</div>
            <div style={styles.value}>{contractMonths} months</div>
          </div>
        </div>
      </div>

      {/* ── Title ── */}
      <div style={{ padding: "28px 40px 12px" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>{quote.title}</div>
        {quote.cover_message && (
          <div style={{ marginTop: 12, fontSize: 14, color: "#334155", lineHeight: 1.7, maxWidth: 680 }}>{quote.cover_message}</div>
        )}
      </div>

      {/* ── Line Items ── */}
      {includedItems.length > 0 && (
        <div style={{ padding: "8px 40px 24px", background: "#ffffff" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#1e293b" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "#f8fafc", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", width: "65%" }}>Description</th>
                <th style={{ padding: "12px 16px", textAlign: "right", color: "#f8fafc", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Qty</th>
                <th style={{ padding: "12px 16px", textAlign: "right", color: "#f8fafc", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Unit Price</th>
                <th style={{ padding: "12px 16px", textAlign: "right", color: "#f8fafc", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Total/mo</th>
              </tr>
            </thead>
            <tbody>
              {includedItems.map((item, idx) => (
                <tr key={item.id} style={{ background: idx % 2 === 0 ? "#f8fafc" : "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{item.description}</div>
                    {item.detail && <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, lineHeight: 1.5 }}>{item.detail}</div>}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right", color: "#334155", fontWeight: 600, verticalAlign: "top" }}>{item.quantity}</td>
                  <td style={{ padding: "14px 16px", textAlign: "right", color: "#334155", fontWeight: 600, verticalAlign: "top" }}>R {(item.unit_price || 0).toFixed(2)}</td>
                  <td style={{ padding: "14px 16px", textAlign: "right", fontWeight: 700, color: "#0f172a", verticalAlign: "top" }}>R {((item.quantity || 1) * (item.unit_price || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 0 }}>
            <tbody>
              {quote.discount_percent > 0 && (
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "10px 16px", textAlign: "right", color: "#334155", fontSize: 13, fontWeight: 600 }}>Discount ({quote.discount_percent}%)</td>
                  <td style={{ padding: "10px 16px", textAlign: "right", color: "#16a34a", fontSize: 14, fontWeight: 700, width: 160 }}>- R {(quote.discount_amount || 0).toFixed(2)}</td>
                </tr>
              )}
              <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px 16px", textAlign: "right", color: "#0f172a", fontSize: 14, fontWeight: 700 }}>Total ZAR excluding VAT</td>
                <td style={{ padding: "12px 16px", textAlign: "right", width: 160 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>R {(quote.subtotal || quote.total || 0).toFixed(2)}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>per month · {contractMonths} months</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ── Rich Sections ── */}
      <div style={{ padding: "0 40px 24px" }}>
        {(quote.sections || []).map(s => <RichSection key={s.id} section={s} />)}
      </div>

      {/* ── Optional Add-ons ── */}
      {optionalItems.length > 0 && (
        <div style={{ padding: "0 40px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Optional Add-ons</div>
          <div style={{ border: "1px solid #fbbf24", borderRadius: 8, padding: 16, background: "#fffbeb" }}>
            {optionalItems.map(item => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #fde68a" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{item.description}</div>
                  {item.detail && <div style={{ fontSize: 12, color: "#78716c", marginTop: 2 }}>{item.detail}</div>}
                </div>
                <div style={{ fontWeight: 700, color: "#92400e", fontSize: 14, whiteSpace: "nowrap", marginLeft: 16 }}>
                  R {((item.quantity || 1) * (item.unit_price || 0)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Notes ── */}
      {quote.notes && (
        <div style={{ padding: "0 40px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Notes</div>
          <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.7 }}>{quote.notes}</div>
        </div>
      )}

      {/* ── Banking Details ── */}
      <div style={{ margin: "0 40px 24px", padding: "20px 24px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>Banking Details</div>
        {[
          ["Account Name", BANKING.accountName],
          ["Account Number", BANKING.accountNumber],
          ["Account Type", BANKING.accountType],
          ["Bank", BANKING.bank],
          ["Branch", BANKING.branch],
          ["Branch Code", BANKING.branchCode],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", gap: 12, marginBottom: 6 }}>
            <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600, minWidth: 140 }}>{label}:</div>
            <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Terms ── */}
      <div style={{ margin: "0 40px", padding: "20px 0 40px", borderTop: "2px solid #e2e8f0" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>Terms &amp; Conditions</div>
        <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.8, whiteSpace: "pre-line" }}>{terms}</div>
      </div>
    </div>
  );
}

function RichSection({ section }) {
  if (section.type === "divider") return <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "16px 0" }} />;
  return (
    <div style={{ marginBottom: 20 }}>
      {section.heading && (
        <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{section.heading}</div>
      )}
      {section.type === "text" && section.content && (
        <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.7, whiteSpace: "pre-line" }}>{section.content}</div>
      )}
      {section.type === "image" && section.image_url && (
        <div>
          <img src={section.image_url} alt={section.heading || ""} style={{ width: "100%", borderRadius: 6, objectFit: "cover", maxHeight: 260 }} />
          {section.content && <div style={{ fontSize: 12, color: "#64748b", textAlign: "center", marginTop: 6 }}>{section.content}</div>}
        </div>
      )}
      {(section.type === "link" || section.type === "file") && section.url && (
        <div>
          {section.content && <div style={{ fontSize: 14, color: "#334155", marginBottom: 8 }}>{section.content}</div>}
          <a href={section.url} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 700, color: "#ffffff", background: "#e11d48", textDecoration: "none" }}>
            {section.type === "file" ? "Download File" : "Open Link"}
          </a>
        </div>
      )}
    </div>
  );
}