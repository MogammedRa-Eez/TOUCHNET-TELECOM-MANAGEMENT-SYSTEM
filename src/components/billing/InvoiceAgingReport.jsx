import React from "react";
import { AlertCircle, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

const BUCKETS = [
  { label: "Current",  min: 0,   max: 30,  color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)",  icon: CheckCircle2 },
  { label: "31–60 Days", min: 31, max: 60, color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)",  icon: Clock },
  { label: "61–90 Days", min: 61, max: 90, color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.2)",  icon: AlertCircle },
  { label: "90+ Days",   min: 91, max: Infinity, color: "#e02347", bg: "rgba(224,35,71,0.08)", border: "rgba(224,35,71,0.2)", icon: AlertCircle },
];

export default function InvoiceAgingReport({ invoices }) {
  const overdueInvoices = invoices.filter(i => i.status === "overdue" && i.due_date);
  const today = new Date();

  const buckets = BUCKETS.map(bucket => {
    const items = overdueInvoices.filter(inv => {
      const days = differenceInDays(today, parseISO(inv.due_date));
      return days >= bucket.min && days <= bucket.max;
    });
    const total = items.reduce((a, i) => a + (i.total || i.amount || 0), 0);
    return { ...bucket, items, total, count: items.length };
  });

  const grandTotal = buckets.reduce((a, b) => a + b.total, 0);

  if (overdueInvoices.length === 0) return null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#181818", border: "1px solid rgba(224,35,71,0.2)", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
      <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#e02347,#f97316,#f59e0b,transparent)" }} />
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(224,35,71,0.12)", border: "1px solid rgba(224,35,71,0.3)" }}>
            <TrendingUp className="w-4 h-4" style={{ color: "#e02347" }} />
          </div>
          <div>
            <p className="text-[13px] font-black" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>Invoice Aging Report</p>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{overdueInvoices.length} overdue · R{grandTotal.toLocaleString()} total outstanding</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4">
        {buckets.map(bucket => {
          const Icon = bucket.icon;
          const pct = grandTotal > 0 ? (bucket.total / grandTotal) * 100 : 0;
          return (
            <div key={bucket.label} className="rounded-xl p-4 relative overflow-hidden"
              style={{ background: bucket.bg, border: `1px solid ${bucket.border}` }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg,${bucket.color},transparent)` }} />
              <Icon className="w-4 h-4 mb-2" style={{ color: bucket.color }} />
              <p className="text-[22px] font-black mono leading-none mb-0.5" style={{ color: bucket.color, fontFamily: "'JetBrains Mono',monospace" }}>
                {bucket.count}
              </p>
              <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>{bucket.label}</p>
              <p className="text-[13px] font-bold" style={{ color: bucket.color }}>R{bucket.total.toLocaleString()}</p>
              {grandTotal > 0 && (
                <>
                  <div className="mt-2 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: bucket.color }} />
                  </div>
                  <p className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{pct.toFixed(0)}% of outstanding</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Per-invoice breakdown for worst buckets */}
      {buckets[3].items.length > 0 && (
        <div className="mx-4 mb-4 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(224,35,71,0.2)" }}>
          <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(224,35,71,0.08)", borderBottom: "1px solid rgba(224,35,71,0.15)" }}>
            <AlertCircle className="w-3.5 h-3.5" style={{ color: "#e02347" }} />
            <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#e02347" }}>90+ Day Critical — Immediate Action Required</p>
          </div>
          {buckets[3].items.slice(0, 5).map(inv => (
            <div key={inv.id} className="flex items-center justify-between px-4 py-2.5 data-row">
              <div>
                <p className="text-[12px] font-bold" style={{ color: "#f0f0f0" }}>{inv.customer_name}</p>
                <p className="text-[10px] mono" style={{ color: "rgba(255,255,255,0.3)" }}>{inv.invoice_number} · Due {inv.due_date}</p>
              </div>
              <p className="text-[13px] font-black mono" style={{ color: "#e02347" }}>R{(inv.total || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}