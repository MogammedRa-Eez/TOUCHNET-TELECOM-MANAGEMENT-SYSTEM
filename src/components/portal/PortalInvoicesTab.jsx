import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Receipt, Download, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";

const STATUS_COLOR = {
  paid:      { bg: "bg-emerald-100", text: "text-emerald-700" },
  sent:      { bg: "bg-blue-100",    text: "text-blue-700" },
  overdue:   { bg: "bg-red-100",     text: "text-red-700" },
  draft:     { bg: "bg-slate-100",   text: "text-slate-500" },
  cancelled: { bg: "bg-slate-100",   text: "text-slate-400" },
};

export default function PortalInvoicesTab({ customer }) {
  const [expanded, setExpanded] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["portal-invoices-main", customer.id],
    queryFn: () => base44.entities.Invoice.filter({ customer_id: customer.id }, "-created_date"),
    enabled: !!customer.id,
  });

  const downloadPDF = async (inv) => {
    setDownloading(inv.id);
    const doc = new jsPDF();

    // Header
    doc.setFillColor(49, 46, 129);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 20, 22);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Touchnet Telecommunications (PTY) LTD", 130, 15);
    doc.text("151 Katherine Street, Sandton", 130, 21);
    doc.text("010 060 0400 · www.touchnet.co.za", 130, 27);

    // Invoice details
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.text(`Invoice #: ${inv.invoice_number || inv.id}`, 20, 48);
    doc.text(`Date: ${inv.created_date ? format(new Date(inv.created_date), "dd MMM yyyy") : "—"}`, 20, 55);
    if (inv.due_date) doc.text(`Due Date: ${format(new Date(inv.due_date), "dd MMM yyyy")}`, 20, 62);
    doc.text(`Status: ${inv.status?.toUpperCase() || "—"}`, 20, 69);

    // Billed to
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 130, 48);
    doc.setFont("helvetica", "normal");
    doc.text(customer.full_name, 130, 55);
    doc.text(customer.email, 130, 61);
    if (customer.address) {
      const lines = doc.splitTextToSize(customer.address, 65);
      doc.text(lines, 130, 67);
    }

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 80, 190, 80);

    // Table header
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 83, 170, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Description", 22, 89);
    doc.text("Amount", 155, 89);

    // Row
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    const desc = inv.description || `Service: ${customer.service_plan?.replace(/_/g, " ") || "Internet Service"}`;
    const descLines = doc.splitTextToSize(desc, 120);
    doc.text(descLines, 22, 100);
    doc.text(`R${(inv.amount || 0).toFixed(2)}`, 155, 100);

    if (inv.tax) {
      const taxY = 100 + descLines.length * 6 + 4;
      doc.setTextColor(80);
      doc.text("VAT (15%)", 22, taxY);
      doc.text(`R${inv.tax.toFixed(2)}`, 155, taxY);
    }

    // Total
    doc.setDrawColor(99, 102, 241);
    const totalY = 130;
    doc.line(20, totalY - 5, 190, totalY - 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(49, 46, 129);
    doc.text("TOTAL", 22, totalY + 2);
    doc.text(`R${(inv.total || inv.amount || 0).toFixed(2)}`, 155, totalY + 2);

    // Banking
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30);
    doc.text("Banking Details", 20, 155);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    doc.text("Account Name: Touchnet Telecommunications (PTY) LTD", 20, 163);
    doc.text("Account Number: 001991264", 20, 169);
    doc.text("Bank: Standard Bank · Branch Code: 00 43 05", 20, 175);
    doc.text(`Reference: ${inv.invoice_number || inv.id}`, 20, 181);

    doc.save(`Invoice-${inv.invoice_number || inv.id}.pdf`);
    setDownloading(null);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  if (invoices.length === 0) {
    return (
      <div className="rounded-2xl p-10 text-center bg-white border border-slate-200 shadow-sm">
        <Receipt className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p className="font-semibold text-slate-600 mb-1">No Invoices</p>
        <p className="text-sm text-slate-400">Your invoice history will appear here once billing begins.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-slate-600">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}</p>
        <p className="text-xs text-slate-400">Click an invoice to expand details</p>
      </div>

      {invoices.map(inv => {
        const sc = STATUS_COLOR[inv.status] || STATUS_COLOR.draft;
        const isOpen = expanded === inv.id;
        return (
          <div key={inv.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              className="w-full p-4 flex items-center gap-4 text-left hover:bg-slate-50 transition-colors"
              onClick={() => setExpanded(isOpen ? null : inv.id)}
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Receipt className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{inv.invoice_number || "Invoice"}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {inv.description || `Service period${inv.billing_period_start ? `: ${inv.billing_period_start}` : ""}`}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-bold text-slate-800 font-mono text-sm">
                  R{(inv.total || inv.amount || 0).toFixed(2)}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${sc.bg} ${sc.text}`}>
                  {inv.status}
                </span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-slate-100 px-4 pb-4 pt-3 bg-slate-50">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {[
                    { label: "Subtotal", value: `R${(inv.amount || 0).toFixed(2)}` },
                    { label: "VAT",      value: `R${(inv.tax || 0).toFixed(2)}` },
                    { label: "Total",    value: `R${(inv.total || inv.amount || 0).toFixed(2)}` },
                    { label: "Due",      value: inv.due_date ? format(new Date(inv.due_date), "dd MMM yyyy") : "—" },
                  ].map(item => (
                    <div key={item.label} className="bg-white rounded-lg p-3 border border-slate-200">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                    </div>
                  ))}
                </div>

                {inv.status === "paid" && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5 mb-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <p className="text-xs text-emerald-700 font-medium">
                      Paid{inv.paid_date ? ` on ${format(new Date(inv.paid_date), "dd MMM yyyy")}` : ""}
                      {inv.payment_method ? ` via ${inv.payment_method.replace(/_/g, " ")}` : ""}
                    </p>
                  </div>
                )}
                {inv.status === "overdue" && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 mb-3">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-700 font-medium">
                      Payment overdue{inv.due_date ? ` — was due ${inv.due_date}` : ""}. Please contact support.
                    </p>
                  </div>
                )}
                {["sent", "draft"].includes(inv.status) && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 mb-3">
                    <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <p className="text-xs text-blue-700 font-medium">
                      Payment pending{inv.due_date ? ` — due ${inv.due_date}` : ""}.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => downloadPDF(inv)}
                  disabled={downloading === inv.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                >
                  {downloading === inv.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  {downloading === inv.id ? "Generating…" : "Download PDF Invoice"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}