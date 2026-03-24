import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, CheckCircle2, XCircle, FileText, ExternalLink, Download, ChevronDown, ChevronUp, Printer } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

const BANKING = {
  accountName: "Touchnet Telecommunications (PTY) LTD",
  accountNumber: "001991264",
  bank: "Standard Bank",
  branchCode: "00 43 05",
};

export default function QuoteAcceptancePanel({ quote, onClose, onResponded, embedded = false }) {
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const docRef = useRef(null);
  const queryClient = useQueryClient();

  // Mark as viewed when opened (if still "sent")
  useEffect(() => {
    if (quote.status === "sent") {
      base44.entities.Quote.update(quote.id, { status: "viewed", viewed_at: new Date().toISOString() })
        .then(() => queryClient.invalidateQueries({ queryKey: ["portal-quotes"] }));
    }
  }, [quote.id]);

  const respondMutation = useMutation({
    mutationFn: ({ status, feedback }) =>
      base44.entities.Quote.update(quote.id, {
        status,
        responded_at: new Date().toISOString(),
        customer_feedback: feedback,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-quotes"] });
      onResponded?.();
      onClose();
    },
  });

  const handleRespond = async (decision) => {
    setSubmitting(true);
    await respondMutation.mutateAsync({ status: decision, feedback });
    setSubmitting(false);
  };

  const handlePrint = () => {
    if (!docRef.current) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html><head><title>Quote ${quote.quote_number || ""}</title>
      <style>body{margin:0;font-family:'Times New Roman',serif;}@media print{body{margin:0;}}</style>
      </head><body>${docRef.current.outerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => { printWindow.print(); };
  };

  const handleDownloadPDF = async () => {
    if (!docRef.current) return;
    setDownloading(true);
    const canvas = await html2canvas(docRef.current, { scale: 2, useCORS: true, logging: false });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    let yPos = 0;
    let remaining = imgHeight;
    while (remaining > 0) {
      pdf.addImage(imgData, "PNG", 0, -yPos, pageWidth, imgHeight);
      remaining -= pageHeight;
      if (remaining > 0) { pdf.addPage(); yPos += pageHeight; }
    }
    pdf.save(`${quote.quote_number || "quote"}_${quote.customer_name || "client"}.pdf`);
    setDownloading(false);
  };

  const includedItems = (quote.line_items || []).filter(i => !i.optional || i.included);
  const contractMonths = quote.contract_months || 24;
  const alreadyResponded = ["accepted", "declined"].includes(quote.status);
  const isExpired = quote.status === "expired" || (quote.valid_until && new Date(quote.valid_until) < new Date());

  return (
    <div className={embedded ? "" : "fixed inset-0 z-50 flex flex-col overflow-y-auto"} style={embedded ? {} : { background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className={embedded ? "flex flex-col items-center py-4" : "min-h-screen flex flex-col items-center py-8 px-4"}>
        {/* Toolbar */}
        <div className="w-full max-w-3xl flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 border border-slate-200 disabled:opacity-60"
            >
              <Download className="w-4 h-4" /> {downloading ? "Generating…" : "Download PDF"}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 border border-slate-200"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quote Document */}
        <div ref={docRef} className="w-full max-w-3xl bg-white shadow-2xl" style={{ fontFamily: "'Times New Roman', serif" }}>
          {/* Logo Header */}
          <div className="px-10 pt-8 pb-6 border-b border-slate-200">
            <img src={LOGO_URL} alt="TouchNet" className="h-16 object-contain" />
          </div>

          {/* Info Strip */}
          <div className="grid grid-cols-3 border-b border-slate-200">
            <div className="px-8 py-6 border-r border-slate-200">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">FROM</p>
              <p className="font-bold text-sm">{quote.salesperson_name || "TouchNet Sales"}</p>
              <p className="font-bold text-sm">Touchnet</p>
              <p className="text-sm text-slate-600 mt-1">151 Katherine Street<br />Sandton, Johannesburg</p>
              <p className="text-sm mt-1" style={{ color: "#e11d48" }}>www.touchnet.co.za</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-3 mb-1">PHONE</p>
              <p className="text-sm" style={{ color: "#e11d48" }}>010 060 0400</p>
            </div>
            <div className="px-8 py-6 border-r border-slate-200">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">FOR</p>
              <p className="font-bold text-sm">{quote.customer_company || quote.customer_name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-3 mb-1">TO</p>
              <p className="text-sm text-slate-700">{quote.customer_name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2 mb-1">EMAIL</p>
              <p className="text-sm" style={{ color: "#e11d48" }}>{quote.customer_email}</p>
            </div>
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
            </div>
          </div>

          {/* Title & Cover */}
          <div className="px-10 pt-8 pb-4">
            <h1 className="text-2xl font-bold text-slate-900">{quote.title}</h1>
            {quote.cover_message && <p className="text-sm text-slate-700 leading-relaxed mt-2">{quote.cover_message}</p>}
          </div>

          {/* Line Items */}
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
                        <p className="font-semibold">R{(item.unit_price || 0).toFixed(2)}</p>
                        <p className="text-xs text-slate-500">x {item.quantity}</p>
                        <p className="font-bold">R{((item.quantity || 1) * (item.unit_price || 0)).toFixed(2)}</p>
                        <p className="text-xs text-slate-500">per month ({contractMonths} months)</p>
                      </td>
                    </tr>
                  ))}
                  {quote.discount_percent > 0 && (
                    <tr className="border border-slate-200 border-t-0">
                      <td className="p-4 text-right font-semibold text-slate-600">Discount ({quote.discount_percent}%)</td>
                      <td className="p-4 text-right border-l border-slate-200">
                        <span className="font-semibold text-emerald-600">-R{(quote.discount_amount || 0).toFixed(2)}</span>
                      </td>
                    </tr>
                  )}
                  <tr className="border border-slate-200 border-t-0">
                    <td className="p-4 text-right font-bold text-slate-800">Total ZAR excluding VAT</td>
                    <td className="p-4 text-right border-l border-slate-200">
                      <p className="font-bold text-lg text-slate-900">R{(quote.subtotal || quote.total || 0).toFixed(2)}</p>
                      <p className="text-xs text-slate-500">per month ({contractMonths} months)</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Rich Sections */}
          {(quote.sections || []).length > 0 && (
            <div className="px-10 space-y-6 pb-6">
              {quote.sections.map(s => {
                if (s.type === "divider") return <hr key={s.id} className="border-slate-200" />;
                return (
                  <div key={s.id}>
                    {s.heading && <h2 className="font-bold text-sm text-slate-900 mb-2">{s.heading}</h2>}
                    {s.type === "text" && s.content && <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{s.content}</p>}
                    {s.type === "image" && s.image_url && <img src={s.image_url} alt={s.heading || ""} className="w-full rounded object-cover max-h-64" />}
                    {(s.type === "link" || s.type === "file") && s.url && (
                      <a href={s.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-white"
                        style={{ background: "#e11d48" }}>
                        <ExternalLink className="w-4 h-4" />
                        {s.label || "Open Link"}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Banking Details */}
          <div className="px-10 pb-6">
            <h3 className="font-bold text-sm text-slate-900 mb-2">BANKING DETAILS</h3>
            <p className="text-sm text-slate-700">Account Name: {BANKING.accountName}</p>
            <p className="text-sm text-slate-700">Account Number: {BANKING.accountNumber}</p>
            <p className="text-sm text-slate-700">Bank: {BANKING.bank} · Branch Code: {BANKING.branchCode}</p>
          </div>

          {/* Terms */}
          {quote.terms && (
            <div className="px-10 pb-8 border-t border-slate-200 pt-5">
              <button className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2" onClick={() => setShowTerms(v => !v)}>
                Terms &amp; Conditions {showTerms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showTerms && <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{quote.terms}</p>}
            </div>
          )}
        </div>

        {/* Response Panel */}
        <div className="w-full max-w-3xl mt-4 bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          {alreadyResponded ? (
            <div className={`flex items-center gap-3 rounded-xl p-4 ${quote.status === "accepted" ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
              {quote.status === "accepted"
                ? <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                : <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />}
              <div>
                <p className={`font-bold text-sm ${quote.status === "accepted" ? "text-emerald-700" : "text-red-700"}`}>
                  You {quote.status === "accepted" ? "accepted" : "declined"} this quote
                  {quote.responded_at ? ` on ${format(new Date(quote.responded_at), "d MMM yyyy")}` : ""}.
                </p>
                {quote.customer_feedback && (
                  <p className="text-xs text-slate-600 mt-1">Your message: "{quote.customer_feedback}"</p>
                )}
              </div>
            </div>
          ) : isExpired ? (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <FileText className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm font-semibold text-amber-700">This quote has expired. Contact your account manager to request an updated quote.</p>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-slate-800 text-base mb-1">Your Response</h3>
              <p className="text-sm text-slate-500 mb-4">Accept or decline this quote. You can include a message below.</p>
              <textarea
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 resize-none mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                rows={3}
                placeholder="Optional: add a message, question, or comments…"
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleRespond("accepted")}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {submitting ? "Submitting…" : "Accept Quote"}
                </button>
                <button
                  onClick={() => handleRespond("declined")}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}
                >
                  <XCircle className="w-5 h-5" />
                  {submitting ? "Submitting…" : "Decline Quote"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}