import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Download, Mail, Loader2, CheckCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";

const COMPANY = {
  name: "TouchNet ISP",
  address: "123 Fibre Street, Johannesburg, 2000",
  phone: "+27 11 000 0000",
  email: "billing@touchnet.co.za",
  reg: "Reg. No: 2023/123456/07",
  vat: "VAT No: 4580123456",
  bank: "First National Bank",
  account: "62012345678",
  branch: "250655",
};

function generatePDF(invoice, customer) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const margin = 18;
  let y = 0;

  // ── Header bar ──────────────────────────────────────────────────
  doc.setFillColor(30, 27, 75); // indigo-950
  doc.rect(0, 0, W, 40, "F");

  // Accent stripe
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 40, W, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY.name, margin, 18);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(199, 197, 255);
  doc.text(COMPANY.address, margin, 25);
  doc.text(`${COMPANY.phone}  |  ${COMPANY.email}`, margin, 30);
  doc.text(`${COMPANY.reg}  |  ${COMPANY.vat}`, margin, 35);

  // INVOICE label top-right
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("INVOICE", W - margin, 20, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(199, 197, 255);
  doc.text(invoice.invoice_number || "—", W - margin, 27, { align: "right" });

  // ── Invoice meta block ──────────────────────────────────────────
  y = 52;
  const issueDate = invoice.billing_period_start
    ? format(new Date(invoice.billing_period_start), "dd MMM yyyy")
    : format(new Date(), "dd MMM yyyy");
  const dueDate = invoice.due_date
    ? format(new Date(invoice.due_date), "dd MMM yyyy")
    : "—";

  // Left: Bill To
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("BILL TO", margin, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.text(invoice.customer_name || "—", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  if (customer?.email) doc.text(customer.email, margin, y), (y += 4.5);
  if (customer?.phone) doc.text(customer.phone, margin, y), (y += 4.5);
  if (customer?.address) {
    const lines = doc.splitTextToSize(customer.address, 80);
    doc.text(lines, margin, y);
    y += lines.length * 4.5;
  }

  // Right: Invoice details
  const detailX = W - margin - 65;
  let dy = 52;
  const rows = [
    ["Invoice #", invoice.invoice_number || "—"],
    ["Issue Date", issueDate],
    ["Due Date", dueDate],
    ["Account #", customer?.account_number || "—"],
    ["Plan", customer?.service_plan?.replace(/_/g, " ") || invoice.description?.slice(0, 20) || "—"],
  ];
  rows.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(label, detailX, dy);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    doc.text(String(val), detailX + 25, dy);
    dy += 6;
  });

  // ── Items table ─────────────────────────────────────────────────
  y = Math.max(y, dy) + 10;

  // Table header
  doc.setFillColor(240, 243, 255);
  doc.rect(margin, y, W - margin * 2, 8, "F");
  doc.setFillColor(99, 102, 241);
  doc.rect(margin, y, 2, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("DESCRIPTION", margin + 4, y + 5.5);
  doc.text("QTY", W - margin - 55, y + 5.5, { align: "right" });
  doc.text("UNIT PRICE", W - margin - 30, y + 5.5, { align: "right" });
  doc.text("AMOUNT", W - margin, y + 5.5, { align: "right" });
  y += 10;

  // Single line item
  const description = invoice.description || "Internet Service — Monthly Subscription";
  const unitPrice = invoice.amount || 0;
  const lineLines = doc.splitTextToSize(description, 100);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(lineLines, margin + 4, y + 4.5);
  doc.text("1", W - margin - 55, y + 4.5, { align: "right" });
  doc.text(`R${unitPrice.toFixed(2)}`, W - margin - 30, y + 4.5, { align: "right" });
  doc.text(`R${unitPrice.toFixed(2)}`, W - margin, y + 4.5, { align: "right" });
  y += lineLines.length * 5 + 8;

  // Separator
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, W - margin, y);
  y += 8;

  // ── Totals ──────────────────────────────────────────────────────
  const totX = W - margin - 70;
  const totVal = W - margin;

  const subtotal = invoice.amount || 0;
  const tax = invoice.tax || 0;
  const total = invoice.total || subtotal + tax;

  const totRows = [
    ["Subtotal", `R${subtotal.toFixed(2)}`, false],
    ["VAT (15%)", `R${tax.toFixed(2)}`, false],
    ["TOTAL DUE", `R${total.toFixed(2)}`, true],
  ];
  totRows.forEach(([label, val, bold]) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 11 : 9);
    doc.setTextColor(bold ? 30 : 71, bold ? 41 : 85, bold ? 59 : 105);
    doc.text(label, totX, y);
    if (bold) {
      doc.setTextColor(99, 102, 241);
    }
    doc.text(val, totVal, y, { align: "right" });
    y += bold ? 9 : 6;
  });

  // Total accent line
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.line(totX, y, totVal, y);
  y += 8;

  // ── Status badge ────────────────────────────────────────────────
  if (invoice.status === "paid") {
    doc.setFillColor(16, 185, 129, 0.12);
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.8);
    doc.roundedRect(totX, y, totVal - totX, 10, 2, 2, "D");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(5, 150, 105);
    doc.text("✓ PAID", totX + (totVal - totX) / 2, y + 7, { align: "center" });
    y += 16;
  }

  // ── Banking details ──────────────────────────────────────────────
  y += 6;
  doc.setFillColor(248, 249, 255);
  doc.rect(margin, y, W - margin * 2, 24, "F");
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, W - margin * 2, 24, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("BANKING DETAILS", margin + 4, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8.5);
  doc.text(`Bank: ${COMPANY.bank}`, margin + 4, y + 12);
  doc.text(`Account: ${COMPANY.account}`, margin + 4, y + 17);
  doc.text(`Branch: ${COMPANY.branch}`, margin + 4, y + 22);
  doc.setFont("helvetica", "bold");
  doc.text("Reference:", margin + 70, y + 12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(99, 102, 241);
  doc.text(invoice.invoice_number || "—", margin + 70, y + 17);
  y += 30;

  // ── Notes / terms ────────────────────────────────────────────────
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Payment is due within 30 days of invoice date. Late payments attract a 2% monthly interest charge.", margin, y);
  doc.text("For queries: billing@touchnet.co.za  |  www.touchnet.co.za", margin, y + 4.5);

  // ── Footer ────────────────────────────────────────────────────────
  const pageH = 297;
  doc.setFillColor(30, 27, 75);
  doc.rect(0, pageH - 12, W, 12, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(199, 197, 255);
  doc.text(`${COMPANY.name}  |  ${COMPANY.reg}  |  ${COMPANY.vat}`, W / 2, pageH - 5, { align: "center" });

  return doc;
}

export default function InvoicePDFModal({ invoice, customer, onClose }) {
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState(null);

  const customerEmail = customer?.email || "";

  function handleDownload() {
    const doc = generatePDF(invoice, customer);
    doc.save(`${invoice.invoice_number || "invoice"}.pdf`);
  }

  async function handleEmail() {
    setEmailLoading(true);
    setEmailError(null);
    const doc = generatePDF(invoice, customer);
    const pdfDataUri = doc.output("datauristring");

    // Send via email integration
    const body = `
Dear ${invoice.customer_name},

Please find your invoice details below:

Invoice Number: ${invoice.invoice_number || "—"}
Amount Due: R${(invoice.total || invoice.amount || 0).toFixed(2)}
Due Date: ${invoice.due_date ? format(new Date(invoice.due_date), "dd MMM yyyy") : "—"}

Service: ${invoice.description || "Internet Service — Monthly Subscription"}

Banking Details:
  Bank: ${COMPANY.bank}
  Account: ${COMPANY.account}
  Branch: ${COMPANY.branch}
  Reference: ${invoice.invoice_number || "—"}

Please use your invoice number as the payment reference.

For any queries, please contact us at ${COMPANY.email} or call ${COMPANY.phone}.

Kind regards,
${COMPANY.name} Billing Team
    `.trim();

    try {
      await base44.integrations.Core.SendEmail({
        to: customerEmail,
        subject: `Invoice ${invoice.invoice_number} from ${COMPANY.name}`,
        body,
      });
      setEmailSent(true);
    } catch (e) {
      setEmailError(e.message || "Failed to send email.");
    }
    setEmailLoading(false);
  }

  const previewLines = [
    { label: "Invoice #", value: invoice.invoice_number || "—" },
    { label: "Customer", value: invoice.customer_name },
    { label: "Email", value: customerEmail || "No email on file" },
    { label: "Issue Date", value: invoice.billing_period_start ? format(new Date(invoice.billing_period_start), "dd MMM yyyy") : format(new Date(), "dd MMM yyyy") },
    { label: "Due Date", value: invoice.due_date ? format(new Date(invoice.due_date), "dd MMM yyyy") : "—" },
    { label: "Subtotal", value: `R${(invoice.amount || 0).toFixed(2)}` },
    { label: "VAT", value: `R${(invoice.tax || 0).toFixed(2)}` },
    { label: "Total Due", value: `R${(invoice.total || invoice.amount || 0).toFixed(2)}`, bold: true },
    { label: "Status", value: invoice.status?.toUpperCase(), status: true },
    { label: "Description", value: invoice.description || "Internet Service — Monthly Subscription" },
  ];

  const statusColor = invoice.status === "paid" ? "#10b981" : invoice.status === "overdue" ? "#ef4444" : "#6366f1";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" style={{ border: "1px solid rgba(99,102,241,0.15)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ background: "linear-gradient(135deg,#1e1b4b,#2e1065)", borderBottom: "3px solid #6366f1" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.3)" }}>
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-white">{COMPANY.name}</h2>
              <p className="text-[10px] text-indigo-300 font-mono">{invoice.invoice_number || "Invoice"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview */}
        <div className="p-6 space-y-2 max-h-[55vh] overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3 mono" style={{ color: "#94a3b8" }}>Invoice Preview</p>
          {previewLines.map((row, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg" style={{ background: i % 2 === 0 ? "rgba(99,102,241,0.03)" : "transparent" }}>
              <span className="text-[12px] font-medium" style={{ color: "#94a3b8" }}>{row.label}</span>
              <span className={`text-[12px] ${row.bold ? "font-black text-[14px]" : "font-semibold"}`}
                style={{ color: row.bold ? "#6366f1" : row.status ? statusColor : "#1e293b", fontFamily: row.bold || row.status ? "'JetBrains Mono',monospace" : "inherit" }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 space-y-3" style={{ borderTop: "1px solid rgba(99,102,241,0.1)", background: "rgba(99,102,241,0.02)" }}>
          {emailError && (
            <div className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{emailError}</div>
          )}
          {emailSent && (
            <div className="flex items-center gap-2 text-[12px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <CheckCircle className="w-4 h-4" /> Invoice emailed to {customerEmail}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={handleEmail}
              disabled={emailLoading || !customerEmail || emailSent}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all disabled:opacity-50"
              style={{ background: emailSent ? "rgba(16,185,129,0.1)" : "rgba(6,182,212,0.08)", border: `1px solid ${emailSent ? "rgba(16,185,129,0.3)" : "rgba(6,182,212,0.25)"}`, color: emailSent ? "#059669" : "#0891b2" }}>
              {emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : emailSent ? <CheckCircle className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
              {emailSent ? "Email Sent!" : emailLoading ? "Sending…" : "Email to Customer"}
            </button>
          </div>
          {!customerEmail && (
            <p className="text-[11px] text-center" style={{ color: "#94a3b8" }}>No email address on file for this customer.</p>
          )}
        </div>
      </div>
    </div>
  );
}