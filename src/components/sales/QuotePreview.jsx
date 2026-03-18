import React, { useRef, useState } from "react";
import { X, ExternalLink, FileText, Mail, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

const DEFAULT_TERMS = `All pricing excludes VAT.
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
  draft:    { bg: "#f1f5f9", color: "#64748b", label: "Draft" },
  sent:     { bg: "#eff6ff", color: "#3b82f6", label: "Sent" },
  viewed:   { bg: "#f5f3ff", color: "#8b5cf6", label: "Viewed" },
  accepted: { bg: "#f0fdf4", color: "#16a34a", label: "Accepted" },
  declined: { bg: "#fef2f2", color: "#ef4444", label: "Declined" },
  expired:  { bg: "#fffbeb", color: "#f59e0b", label: "Expired" },
};

export default function QuotePreview({ quote, onClose, onEdit, onSendEmail }) {
  if (!quote) return null;
  const docRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const status = STATUS_CONFIG[quote.status] || STATUS_CONFIG.draft;

  const handleDownloadPDF = async () => {
    if (!docRef.current) return;
    setDownloading(true);
    const canvas = await html2canvas(docRef.current, { scale: 2, useCORS: true, logging: false });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let yPos = 0;
    let remaining = imgHeight;
    while (remaining > 0) {
      pdf.addImage(imgData, "PNG", 0, -yPos, imgWidth, imgHeight);
      remaining -= pageHeight;
      if (remaining > 0) { pdf.addPage(); yPos += pageHeight; }
    }
    pdf.save(`${quote.quote_number || "quote"}_${quote.customer_name || "client"}.pdf`);
    setDownloading(false);
  };
  const includedItems = (quote.line_items || []).filter(i => !i.optional || i.included);
  const optionalItems = (quote.line_items || []).filter(i => i.optional && !i.included);
  const contractMonths = quote.contract_months || 24;
  const terms = quote.terms || DEFAULT_TERMS;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="min-h-screen flex flex-col items-center py-8 px-4">
        {/* Controls */}
        <div className="w-full max-w-3xl flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {onEdit && (
              <Button size="sm" variant="outline" onClick={onEdit} className="gap-1 bg-white">
                <FileText className="w-4 h-4" /> Edit
              </Button>
            )}
            {onSendEmail && quote.customer_email && (
              <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onSendEmail(quote)}>
                <Mail className="w-4 h-4" /> Email to Client
              </Button>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quote Document */}
        <div className="w-full max-w-3xl bg-white shadow-2xl" style={{ fontFamily: "'Times New Roman', serif" }}>
          {/* Logo Header */}
          <div className="px-10 pt-8 pb-6 border-b border-slate-200">
            <div className="border border-slate-200 inline-block p-6 mb-2">
              <img src={LOGO_URL} alt="TouchNet" className="h-16 object-contain" />
            </div>
          </div>

          {/* Info Strip: FROM / FOR / QUOTE DETAILS */}
          <div className="grid grid-cols-3 border-b border-slate-200">
            {/* FROM */}
            <div className="px-8 py-6 border-r border-slate-200">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">FROM</p>
              <p className="font-bold text-sm">{quote.salesperson_name || COMPANY.name}</p>
              <p className="font-bold text-sm">{COMPANY.company}</p>
              <p className="text-sm text-slate-600 whitespace-pre-line mt-1">{COMPANY.address}</p>
              <a href={`https://${COMPANY.website}`} className="text-sm" style={{ color: "#e11d48" }}>{COMPANY.website}</a>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-3 mb-1">PHONE</p>
              <p className="text-sm" style={{ color: "#e11d48" }}>{COMPANY.phone}</p>
            </div>

            {/* FOR */}
            <div className="px-8 py-6 border-r border-slate-200">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">FOR</p>
              <p className="font-bold text-sm">{quote.customer_company || quote.customer_name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-3 mb-1">TO</p>
              <p className="text-sm text-slate-700">{quote.customer_name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2 mb-1">EMAIL</p>
              <p className="text-sm" style={{ color: "#e11d48" }}>{quote.customer_email}</p>
              {quote.customer_phone && (
                <>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2 mb-1">PHONE</p>
                  <p className="text-sm text-slate-700">{quote.customer_phone}</p>
                </>
              )}
            </div>

            {/* Quote Meta */}
            <div className="px-8 py-6">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">QUOTE NUMBER</p>
              <p className="text-sm font-semibold text-slate-800">{quote.quote_number}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-3 mb-1">DATE</p>
              <p className="text-sm text-slate-700">
                {quote.created_date ? format(new Date(quote.created_date), "d MMMM yyyy") : format(new Date(), "d MMMM yyyy")}
              </p>
              {quote.valid_until && (
                <>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-3 mb-1">EXPIRY DATE</p>
                  <p className="text-sm text-slate-700">{format(new Date(quote.valid_until), "d MMMM yyyy")}</p>
                </>
              )}
              <div className="mt-3">
                <span className="text-xs font-semibold px-2 py-1 rounded" style={{ background: status.bg, color: status.color }}>
                  {status.label}
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="px-10 pt-8 pb-4">
            <h1 className="text-2xl font-bold text-slate-900">{quote.title}</h1>
          </div>

          {/* Cover Message */}
          {quote.cover_message && (
            <div className="px-10 pb-4">
              <p className="text-sm text-slate-700 leading-relaxed">{quote.cover_message}</p>
            </div>
          )}

          {/* Line Items Table */}
          {includedItems.length > 0 && (
            <div className="px-10 pb-6">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {includedItems.map(item => (
                    <tr key={item.id} className="border border-slate-200">
                      <td className="p-4" style={{ width: "70%" }}>
                        <p className="font-bold text-slate-900">{item.description}</p>
                        {item.detail && <p className="text-xs text-slate-500 mt-1">{item.detail}</p>}
                      </td>
                      <td className="p-4 text-right align-top border-l border-slate-200" style={{ width: "30%" }}>
                        <p className="font-semibold text-slate-800">{(item.unit_price || 0).toFixed(2)}</p>
                        <p className="text-xs text-slate-500">x {item.quantity}</p>
                        <p className="font-bold text-slate-900">{((item.quantity || 1) * (item.unit_price || 0)).toFixed(2)}</p>
                        <p className="text-xs text-slate-500">per month</p>
                        <p className="text-xs text-slate-500">(for {contractMonths} months)</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <table className="w-full text-sm border-collapse mt-0">
                <tbody>
                  {quote.discount_percent > 0 && (
                    <tr className="border border-slate-200 border-t-0">
                      <td className="p-4 text-right font-semibold text-slate-600">Discount ({quote.discount_percent}%)</td>
                      <td className="p-4 text-right border-l border-slate-200" style={{ width: "30%" }}>
                        <span className="font-semibold text-emerald-600">-R{(quote.discount_amount || 0).toFixed(2)}</span>
                      </td>
                    </tr>
                  )}
                  <tr className="border border-slate-200 border-t-0">
                    <td className="p-4 text-right font-bold text-slate-800">Total ZAR excluding VAT</td>
                    <td className="p-4 text-right border-l border-slate-200" style={{ width: "30%" }}>
                      <p className="font-bold text-lg text-slate-900">R{(quote.subtotal || quote.total || 0).toFixed(2)}</p>
                      <p className="text-xs text-slate-500">per month</p>
                      <p className="text-xs text-slate-500">(for {contractMonths} months)</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Rich Sections */}
          <div className="px-10 space-y-6 pb-6">
            {(quote.sections || []).map(s => <RichSection key={s.id} section={s} />)}
          </div>

          {/* Optional Add-ons */}
          {optionalItems.length > 0 && (
            <div className="px-10 pb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-2">Optional Add-ons</h3>
              <div className="border border-slate-200 rounded p-4 space-y-2 bg-amber-50">
                {optionalItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.description}</p>
                      {item.detail && <p className="text-xs text-slate-500">{item.detail}</p>}
                    </div>
                    <span className="font-mono font-semibold">R{((item.quantity || 1) * (item.unit_price || 0)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {quote.notes && (
            <div className="px-10 pb-6">
              <p className="font-bold text-sm text-slate-800 mb-2">{quote.notes}</p>
            </div>
          )}

          {/* Banking Details */}
          <div className="px-10 pb-6">
            <h3 className="font-bold text-sm text-slate-900 mb-2">BANKING DETAILS</h3>
            <p className="text-sm text-slate-700">Account Name: {BANKING.accountName}</p>
            <p className="text-sm text-slate-700">Account Number: {BANKING.accountNumber}</p>
            <p className="text-sm text-slate-700">Account Type: {BANKING.accountType}</p>
            <p className="text-sm text-slate-700">Bank: {BANKING.bank}</p>
            <p className="text-sm text-slate-700">Branch: {BANKING.branch}</p>
            <p className="text-sm text-slate-700">Branch Code: {BANKING.branchCode}</p>
          </div>

          {/* Terms & Conditions */}
          <div className="px-10 pb-10 border-t border-slate-200 pt-6">
            <h3 className="font-bold text-sm text-slate-900 mb-3">TERMS &amp; CONDITIONS</h3>
            <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{terms}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RichSection({ section }) {
  if (section.type === "divider") return <hr className="border-slate-200" />;

  return (
    <div>
      {section.heading && <h2 className="font-bold text-sm text-slate-900 mb-2">{section.heading}</h2>}
      {section.type === "text" && section.content && (
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{section.content}</p>
      )}
      {section.type === "image" && section.image_url && (
        <div>
          <img src={section.image_url} alt={section.heading || ""} className="w-full rounded object-cover max-h-64" />
          {section.content && <p className="text-xs text-slate-400 text-center mt-2">{section.content}</p>}
        </div>
      )}
      {(section.type === "link" || section.type === "file") && (
        <div>
          {section.content && <p className="text-sm text-slate-700 mb-2">{section.content}</p>}
          {section.url && (
            <a href={section.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-white"
              style={{ background: "#e11d48" }}>
              {section.type === "file" ? <FileText className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
              {section.label || (section.type === "file" ? "Download File" : "Open Link")}
            </a>
          )}
        </div>
      )}
    </div>
  );
}