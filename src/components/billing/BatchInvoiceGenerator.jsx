import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, addDays, startOfMonth, endOfMonth } from "date-fns";
import {
  Zap, Play, Send, CheckCircle2, XCircle, AlertCircle,
  ChevronDown, ChevronUp, FlaskConical, Loader2, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Monthly rate lookup by service plan
const PLAN_RATES = {
  basic_10mbps:      299,
  standard_50mbps:   499,
  premium_100mbps:   799,
  enterprise_500mbps:1499,
  dedicated_1gbps:   2999,
};

const VAT_RATE = 0.15;

function buildInvoicePayload(customer, billingMonth) {
  const rate = customer.monthly_rate || PLAN_RATES[customer.service_plan] || 0;
  if (!rate) throw new Error("No monthly rate or service plan rate found");
  const tax = parseFloat((rate * VAT_RATE).toFixed(2));
  const total = parseFloat((rate + tax).toFixed(2));
  const monthStart = startOfMonth(billingMonth);
  const monthEnd = endOfMonth(billingMonth);
  const dueDate = format(addDays(monthEnd, 7), "yyyy-MM-dd");
  const invoiceNum = `INV-${customer.account_number || customer.id.slice(0, 6).toUpperCase()}-${format(billingMonth, "yyyyMM")}`;
  return {
    invoice_number: invoiceNum,
    customer_id: customer.id,
    customer_name: customer.full_name,
    amount: rate,
    tax,
    total,
    status: "draft",
    description: `Monthly Internet Service – ${customer.service_plan?.replace(/_/g, " ") || "Plan"} – ${format(billingMonth, "MMMM yyyy")}`,
    billing_period_start: format(monthStart, "yyyy-MM-dd"),
    billing_period_end: format(monthEnd, "yyyy-MM-dd"),
    due_date: dueDate,
  };
}

// ─── Demo customers for the demo run ───────────────────────────────────────────
const DEMO_CUSTOMERS = [
  { id: "demo-1", full_name: "Acme Corp",      email: "acme@demo.com",   account_number: "AC001", service_plan: "enterprise_500mbps", monthly_rate: 1499 },
  { id: "demo-2", full_name: "Jane Smith",      email: "jane@demo.com",   account_number: "JS002", service_plan: "premium_100mbps",    monthly_rate: 799 },
  { id: "demo-3", full_name: "Bob's Bakery",    email: "bob@demo.com",    account_number: "BB003", service_plan: "standard_50mbps",    monthly_rate: 499 },
  { id: "demo-4", full_name: "No Rate Co",      email: "norate@demo.com", account_number: null,    service_plan: null,                 monthly_rate: null }, // will fail
  { id: "demo-5", full_name: "TechStart (Pty)", email: "tech@demo.com",   account_number: "TS005", service_plan: "dedicated_1gbps",    monthly_rate: 2999 },
];

export default function BatchInvoiceGenerator({ onInvoicesCreated }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [billingMonth, setBillingMonth] = useState(format(new Date(), "yyyy-MM"));
  const [running, setRunning] = useState(false);
  const [sending, setSending] = useState(false);
  const [report, setReport] = useState(null); // { generated, failed, draftIds }
  const [demoMode, setDemoMode] = useState(false);

  const { data: allCustomers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list(),
  });

  const activeCustomers = allCustomers.filter(c => c.status === "active");

  const runBatch = async (isDemo = false) => {
    setRunning(true);
    setReport(null);
    const customers = isDemo ? DEMO_CUSTOMERS : activeCustomers;
    const month = new Date(billingMonth + "-01");

    const generated = [];
    const failed = [];
    const draftIds = [];

    for (const customer of customers) {
      try {
        const payload = buildInvoicePayload(customer, month);
        if (!isDemo) {
          const created = await base44.entities.Invoice.create(payload);
          draftIds.push(created.id);
        }
        generated.push({ customer: customer.full_name, invoice: payload.invoice_number, total: payload.total });
      } catch (err) {
        failed.push({ customer: customer.full_name, reason: err.message });
      }
    }

    if (!isDemo) {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      onInvoicesCreated?.();
    }

    setReport({ generated, failed, draftIds, isDemo });
    setRunning(false);
    setDemoMode(isDemo);
  };

  const sendAllDrafts = async () => {
    if (!report?.draftIds?.length) return;
    setSending(true);
    for (const id of report.draftIds) {
      await base44.entities.Invoice.update(id, { status: "sent" });
      // Send email notification
      const inv = report.generated.find((_, i) => report.draftIds[i] === id);
      if (inv) {
        await base44.integrations.Core.SendEmail({
          to: allCustomers.find(c => c.id === id)?.email || "",
          subject: `Your Invoice is Ready – ${inv.invoice}`,
          body: `Dear ${inv.customer},\n\nPlease find your invoice ${inv.invoice} for R${inv.total?.toFixed(2)}.\n\nKind regards,\nTouchNet`,
        }).catch(() => {});
      }
    }
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    setSending(false);
    setReport(prev => ({ ...prev, sent: true }));
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "#0a0f2e", border: "1px solid rgba(99,102,241,0.2)" }}>
      {/* Header toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)" }}>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-200">Batch Invoice Generator</p>
            <p className="text-[11px] text-slate-500">Auto-generate monthly invoices for all active customers</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      {open && (
        <div className="border-t px-5 pb-5 pt-4 space-y-5" style={{ borderColor: "rgba(99,102,241,0.12)" }}>
          {/* Controls */}
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Billing Month</label>
              <input
                type="month"
                value={billingMonth}
                onChange={e => setBillingMonth(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm text-slate-200 bg-slate-800 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="text-[12px] text-slate-400 pb-2">
              <span className="text-indigo-400 font-bold">{activeCustomers.length}</span> active customers found
            </div>
            <div className="flex gap-2 ml-auto flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => runBatch(true)}
                disabled={running}
                className="border-amber-600/40 text-amber-400 hover:bg-amber-900/20 text-xs gap-1.5"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                Demo Run
              </Button>
              <Button
                size="sm"
                onClick={() => runBatch(false)}
                disabled={running || activeCustomers.length === 0}
                className="text-white text-xs gap-1.5"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {running ? "Generating..." : "Generate Drafts"}
              </Button>
            </div>
          </div>

          {/* Report */}
          {report && (
            <div className="space-y-4">
              {report.isDemo && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}>
                  <FlaskConical className="w-3.5 h-3.5" />
                  Demo mode — no real invoices were created. This is a simulation using sample customers.
                </div>
              )}

              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <StatBox label="Generated" value={report.generated.length} color="#10b981" />
                <StatBox label="Failed" value={report.failed.length} color="#ef4444" />
                <StatBox label="Total Value" value={`R${report.generated.reduce((s, i) => s + (i.total || 0), 0).toLocaleString()}`} color="#6366f1" />
              </div>

              {/* Generated list */}
              {report.generated.length > 0 && (
                <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(16,185,129,0.2)" }}>
                  <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(16,185,129,0.08)" }}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">Successfully Generated ({report.generated.length})</span>
                  </div>
                  <div className="divide-y" style={{ divideColor: "rgba(16,185,129,0.08)" }}>
                    {report.generated.map((g, i) => (
                      <div key={i} className="px-4 py-2.5 flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-300">{g.customer}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-slate-500 font-mono">{g.invoice}</span>
                          <span className="text-xs font-semibold text-emerald-400">R{g.total?.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failed list */}
              {report.failed.length > 0 && (
                <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(239,68,68,0.2)" }}>
                  <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(239,68,68,0.08)" }}>
                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs font-bold text-red-400">Failed ({report.failed.length})</span>
                  </div>
                  {report.failed.map((f, i) => (
                    <div key={i} className="px-4 py-2.5 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-300">{f.customer}</span>
                      <span className="text-[11px] text-red-400">{f.reason}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Send all button (only for real runs with drafts) */}
              {!report.isDemo && report.draftIds?.length > 0 && !report.sent && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-lg" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                  <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-300 font-semibold mb-0.5">Review drafts before sending</p>
                    <p className="text-[11px] text-slate-500">Check invoices in the table below and fix any errors, then send all to customers.</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={sendAllDrafts}
                    disabled={sending}
                    className="text-white text-xs gap-1.5 flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
                  >
                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {sending ? "Sending..." : "Send All"}
                  </Button>
                </div>
              )}

              {report.sent && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <p className="text-xs text-emerald-400 font-semibold">All invoices have been sent to customers and marked as "sent".</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="rounded-lg px-4 py-3 text-center" style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">{label}</p>
    </div>
  );
}