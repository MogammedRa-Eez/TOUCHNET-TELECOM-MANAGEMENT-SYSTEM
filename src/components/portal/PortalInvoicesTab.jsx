import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Receipt, Download, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Clock, Loader2, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";

const STATUS_CFG = {
  paid:      { color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", label: "Paid" },
  sent:      { color: "#06b6d4", bg: "rgba(6,182,212,0.12)",  border: "rgba(6,182,212,0.25)",  label: "Pending" },
  overdue:   { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.25)",  label: "Overdue" },
  draft:     { color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.2)", label: "Draft" },
  cancelled: { color: "#475569", bg: "rgba(71,85,105,0.1)",   border: "rgba(71,85,105,0.2)",   label: "Cancelled" },
};

export default function PortalInvoicesTab({ customer }) {
  const [expanded,    setExpanded]    = useState(null);
  const [downloading, setDownloading] = useState(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["portal-invoices-main", customer.id],
    queryFn: () => base44.entities.Invoice.filter({ customer_id: customer.id }, "-created_date"),
    enabled: !!customer.id,
  });

  const downloadPDF = async (inv) => {
    setDownloading(inv.id);
    const doc = new jsPDF();
    doc.setFillColor(49, 46, 129);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 20, 22);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("Touchnet Telecommunications (PTY) LTD", 130, 15);
    doc.text("151 Katherine Street, Sandton", 130, 21);
    doc.text("010 060 0400 · www.touchnet.co.za", 130, 27);
    doc.setTextColor(30, 30, 30); doc.setFontSize(10);
    doc.text(`Invoice #: ${inv.invoice_number || inv.id}`, 20, 48);
    doc.text(`Date: ${inv.created_date ? format(new Date(inv.created_date), "dd MMM yyyy") : "—"}`, 20, 55);
    if (inv.due_date) doc.text(`Due Date: ${format(new Date(inv.due_date), "dd MMM yyyy")}`, 20, 62);
    doc.text(`Status: ${inv.status?.toUpperCase() || "—"}`, 20, 69);
    doc.setFont("helvetica", "bold"); doc.text("Bill To:", 130, 48);
    doc.setFont("helvetica", "normal");
    doc.text(customer.full_name, 130, 55); doc.text(customer.email, 130, 61);
    if (customer.address) { const lines = doc.splitTextToSize(customer.address, 65); doc.text(lines, 130, 67); }
    doc.setDrawColor(200, 200, 200); doc.line(20, 80, 190, 80);
    doc.setFillColor(248, 250, 252); doc.rect(20, 83, 170, 8, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(80, 80, 80);
    doc.text("Description", 22, 89); doc.text("Amount", 155, 89);
    doc.setFont("helvetica", "normal"); doc.setTextColor(30, 30, 30); doc.setFontSize(10);
    const desc = inv.description || `Service: ${customer.service_plan?.replace(/_/g, " ") || "Internet Service"}`;
    const descLines = doc.splitTextToSize(desc, 120);
    doc.text(descLines, 22, 100); doc.text(`R${(inv.amount || 0).toFixed(2)}`, 155, 100);
    if (inv.tax) { const taxY = 100 + descLines.length * 6 + 4; doc.setTextColor(80); doc.text("VAT (15%)", 22, taxY); doc.text(`R${inv.tax.toFixed(2)}`, 155, taxY); }
    doc.setDrawColor(99, 102, 241); doc.line(20, 125, 190, 125);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(49, 46, 129);
    doc.text("TOTAL", 22, 134); doc.text(`R${(inv.total || inv.amount || 0).toFixed(2)}`, 155, 134);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(30);
    doc.text("Banking Details", 20, 155);
    doc.setFont("helvetica", "normal"); doc.setTextColor(60);
    doc.text("Account Name: Touchnet Telecommunications (PTY) LTD", 20, 163);
    doc.text("Account Number: 001991264", 20, 169);
    doc.text("Bank: Standard Bank · Branch Code: 00 43 05", 20, 175);
    doc.text(`Reference: ${inv.invoice_number || inv.id}`, 20, 181);
    doc.save(`Invoice-${inv.invoice_number || inv.id}.pdf`);
    setDownloading(null);
  };

  if (isLoading) return (
    <div className="flex justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#06b6d4" }} />
        <p className="text-xs mono" style={{ color: "rgba(6,182,212,0.5)" }}>Loading invoices…</p>
      </div>
    </div>
  );

  if (invoices.length === 0) return (
    <div className="rounded-2xl p-12 text-center"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(6,182,212,0.12)" }}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
        <Receipt className="w-6 h-6" style={{ color: "#06b6d4" }} />
      </div>
      <p className="font-bold text-white/60 mb-1">No Invoices Yet</p>
      <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Your invoice history will appear here once billing begins.</p>
    </div>
  );

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((a, i) => a + (i.total || 0), 0);
  const totalOwed = invoices.filter(i => ["sent","overdue"].includes(i.status)).reduce((a, i) => a + (i.total || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Invoices", value: invoices.length,                        color: "#6366f1" },
          { label: "Total Paid",     value: `R${totalPaid.toLocaleString()}`,        color: "#10b981" },
          { label: "Outstanding",    value: `R${totalOwed.toLocaleString()}`,        color: totalOwed > 0 ? "#ef4444" : "#64748b" },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-4 py-3 text-center"
            style={{ background: `${s.color}0a`, border: `1px solid ${s.color}20` }}>
            <p className="text-[15px] font-black mono" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Invoice list */}
      {invoices.map(inv => {
        const sc     = STATUS_CFG[inv.status] || STATUS_CFG.draft;
        const isOpen = expanded === inv.id;
        return (
          <div key={inv.id} className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${sc.color}20` }}>
            <button
              className="w-full p-4 flex items-center gap-4 text-left transition-colors"
              style={{ background: isOpen ? `${sc.color}05` : "transparent" }}
              onClick={() => setExpanded(isOpen ? null : inv.id)}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
                <Receipt className="w-4 h-4" style={{ color: sc.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-[13px]">{inv.invoice_number || "Invoice"}</p>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {inv.description || `Service period${inv.billing_period_start ? `: ${inv.billing_period_start}` : ""}`}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-black text-white mono text-[14px]">
                  R{(inv.total || inv.amount || 0).toFixed(2)}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                  {sc.label}
                </span>
                {isOpen
                  ? <ChevronUp className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
                  : <ChevronDown className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />}
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-2" style={{ borderTop: `1px solid ${sc.color}15` }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {[
                    { label: "Subtotal", value: `R${(inv.amount || 0).toFixed(2)}` },
                    { label: "VAT 15%",  value: `R${(inv.tax || 0).toFixed(2)}` },
                    { label: "Total",    value: `R${(inv.total || inv.amount || 0).toFixed(2)}` },
                    { label: "Due Date", value: inv.due_date ? format(new Date(inv.due_date), "dd MMM yyyy") : "—" },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl p-3"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{item.label}</p>
                      <p className="text-[13px] font-black mono text-white mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Status message */}
                {inv.status === "paid" && (
                  <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 mb-3"
                    style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <p className="text-[12px] text-emerald-400 font-medium">
                      Paid{inv.paid_date ? ` on ${format(new Date(inv.paid_date), "dd MMM yyyy")}` : ""}
                      {inv.payment_method ? ` via ${inv.payment_method.replace(/_/g, " ")}` : ""}
                    </p>
                  </div>
                )}
                {inv.status === "overdue" && (
                  <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 mb-3"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-[12px] text-red-400 font-medium">
                      Payment overdue{inv.due_date ? ` — was due ${inv.due_date}` : ""}. Please contact support.
                    </p>
                  </div>
                )}
                {["sent","draft"].includes(inv.status) && (
                  <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 mb-3"
                    style={{ background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.18)" }}>
                    <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "#06b6d4" }} />
                    <p className="text-[12px] font-medium" style={{ color: "#22d3ee" }}>
                      Payment pending{inv.due_date ? ` — due ${inv.due_date}` : ""}.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => downloadPDF(inv)}
                  disabled={downloading === inv.id}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
                  {downloading === inv.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  {downloading === inv.id ? "Generating PDF…" : "Download PDF Invoice"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}