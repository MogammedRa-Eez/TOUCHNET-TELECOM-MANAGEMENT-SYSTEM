import React, { useRef, useState } from "react";
import { X, FileText, Mail, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QuoteDocument from "./QuoteDocument.jsx";

export async function generateQuotePDF(quote, docRef) {
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
  return pdf;
}

export default function QuotePreview({ quote, onClose, onEdit, onSendEmail }) {
  const docRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);

  if (!quote) return null;

  const handleDownloadPDF = async () => {
    if (!docRef.current) return;
    setDownloading(true);
    const pdf = await generateQuotePDF(quote, docRef);
    pdf.save(`${quote.quote_number || "quote"}_${quote.customer_name || "client"}.pdf`);
    setDownloading(false);
  };

  const handleEmailWithPDF = async () => {
    if (!onSendEmail) return;
    setEmailing(true);
    await onSendEmail(quote);
    setEmailing(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="min-h-screen flex flex-col items-center py-8 px-4">
        {/* Controls */}
        <div className="w-full max-w-3xl flex items-center justify-between mb-4">
          <div className="flex gap-2 flex-wrap">
            {onEdit && (
              <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5 bg-white">
                <FileText className="w-4 h-4" /> Edit
              </Button>
            )}
            <Button size="sm" variant="outline" className="gap-1.5 bg-white" onClick={handleDownloadPDF} disabled={downloading}>
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {downloading ? "Generating…" : "Download PDF"}
            </Button>
            {onSendEmail && quote.customer_email && (
              <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleEmailWithPDF} disabled={emailing}>
                {emailing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {emailing ? "Sending…" : "Email to Client"}
              </Button>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quote Document */}
        <div className="w-full max-w-3xl shadow-2xl">
          <QuoteDocument quote={quote} docRef={docRef} />
        </div>
      </div>
    </div>
  );
}