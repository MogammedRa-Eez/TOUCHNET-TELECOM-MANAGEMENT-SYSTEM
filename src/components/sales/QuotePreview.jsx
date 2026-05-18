import React, { useRef, useState } from "react";
import { X, FileText, Mail, Download, Loader2, Eye, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QuoteDocument from "./QuoteDocument.jsx";

export async function generateQuotePDF(quote, docRef) {
  const el = docRef.current;
  // Temporarily expand for full render
  const prevWidth = el.style.width;
  el.style.width = "900px";
  const canvas = await html2canvas(el, { scale: 2.5, useCORS: true, logging: false, backgroundColor: "#ffffff" });
  el.style.width = prevWidth;

  const imgData  = canvas.toDataURL("image/png");
  const pdf      = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW    = pdf.internal.pageSize.getWidth();
  const pageH    = pdf.internal.pageSize.getHeight();
  const imgH     = (canvas.height * pageW) / canvas.width;
  let yPos = 0, remaining = imgH;
  while (remaining > 0) {
    pdf.addImage(imgData, "PNG", 0, -yPos, pageW, imgH);
    remaining -= pageH;
    if (remaining > 0) { pdf.addPage(); yPos += pageH; }
  }
  return pdf;
}

export default function QuotePreview({ quote, onClose, onEdit, onSendEmail }) {
  const docRef    = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [emailing,    setEmailing]    = useState(false);

  if (!quote) return null;

  const handleDownloadPDF = async () => {
    if (!docRef.current) return;
    setDownloading(true);
    const pdf = await generateQuotePDF(quote, docRef);
    pdf.save(`Quote_${quote.quote_number || "draft"}_${(quote.customer_name || "client").replace(/\s+/g, "_")}.pdf`);
    setDownloading(false);
  };

  const handlePrint = () => window.print();

  const handleEmailWithPDF = async () => {
    if (!onSendEmail) return;
    setEmailing(true);
    await onSendEmail(quote);
    setEmailing(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    >
      <div className="min-h-screen flex flex-col items-center py-6 px-4">

        {/* ── Top Control Bar ── */}
        <div className="w-full max-w-4xl mb-4 flex items-center justify-between gap-3">
          {/* Left: doc info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "rgba(0,180,180,0.1)", border: "1px solid rgba(0,180,180,0.25)" }}>
              <Eye className="w-3.5 h-3.5" style={{ color: "#00b4b4" }} />
              <span className="text-[11px] font-bold mono" style={{ color: "#00b4b4" }}>
                {quote.quote_number || "Draft"} — {quote.customer_name}
              </span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#e0e0e0" }}
              >
                <FileText className="w-3.5 h-3.5" /> Edit Quote
              </button>
            )}

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-105 disabled:opacity-60"
              style={{ background: "rgba(0,180,180,0.12)", border: "1px solid rgba(0,180,180,0.3)", color: "#00d4d4" }}
            >
              {downloading
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</>
                : <><Download className="w-3.5 h-3.5" /> Download PDF</>
              }
            </button>

            {onSendEmail && quote.customer_email && (
              <button
                onClick={handleEmailWithPDF}
                disabled={emailing}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#059669,#047857)", boxShadow: "0 4px 18px rgba(5,150,105,0.35)" }}
              >
                {emailing
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</>
                  : <><Mail className="w-3.5 h-3.5" /> Email to Client</>
                }
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:scale-110"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Document ── */}
        <div className="w-full max-w-4xl rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,180,180,0.15)" }}>
          <QuoteDocument quote={quote} docRef={docRef} />
        </div>

        {/* ── Bottom spacer ── */}
        <div className="h-12" />
      </div>
    </div>
  );
}