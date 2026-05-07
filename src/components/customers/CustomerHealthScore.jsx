import React from "react";
import { Heart, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

function computeScore(customer, invoices = [], tickets = []) {
  let score = 100;
  const reasons = [];

  if (customer.status === "suspended")  { score -= 30; reasons.push({ text: "Account suspended", color: "#e02347" }); }
  if (customer.status === "terminated") { score -= 60; reasons.push({ text: "Account terminated", color: "#e02347" }); }
  if (customer.balance < 0)             { score -= 20; reasons.push({ text: `Negative balance: R${Math.abs(customer.balance)}`, color: "#f97316" }); }
  if (!customer.service_plan)           { score -= 10; reasons.push({ text: "No service plan", color: "#f59e0b" }); }

  const custInvoices = invoices.filter(i => i.customer_id === customer.id);
  const overdueCount = custInvoices.filter(i => i.status === "overdue").length;
  if (overdueCount > 0) { score -= Math.min(overdueCount * 10, 25); reasons.push({ text: `${overdueCount} overdue invoice(s)`, color: "#e02347" }); }

  const custTickets = tickets.filter(t => t.customer_id === customer.id && !["resolved","closed"].includes(t.status));
  if (custTickets.length > 2) { score -= 10; reasons.push({ text: `${custTickets.length} open tickets`, color: "#f59e0b" }); }
  const criticalTickets = custTickets.filter(t => t.priority === "critical");
  if (criticalTickets.length > 0) { score -= 15; reasons.push({ text: `${criticalTickets.length} critical ticket(s)`, color: "#e02347" }); }

  if (customer.contract_end_date) {
    const daysLeft = differenceInDays(parseISO(customer.contract_end_date), new Date());
    if (daysLeft < 0)  { score -= 15; reasons.push({ text: "Contract expired", color: "#e02347" }); }
    else if (daysLeft < 30) { score -= 8; reasons.push({ text: `Contract expires in ${daysLeft} days`, color: "#f59e0b" }); }
  }

  score = Math.max(0, Math.min(100, score));
  const { color, label } =
    score >= 80 ? { color: "#10b981", label: "Healthy" } :
    score >= 60 ? { color: "#f59e0b", label: "At Risk" } :
    score >= 40 ? { color: "#f97316", label: "Poor" } :
                  { color: "#e02347", label: "Critical" };

  return { score, color, label, reasons };
}

export default function CustomerHealthScore({ customer, invoices = [], tickets = [], compact = false }) {
  const { score, color, label, reasons } = computeScore(customer, invoices, tickets);

  const Icon = score >= 80 ? CheckCircle2 : score >= 60 ? Heart : score >= 40 ? AlertTriangle : TrendingDown;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color, boxShadow: `0 0 6px ${color}80` }} />
        </div>
        <span className="text-[9px] font-bold w-14 text-right" style={{ color }}>{label} ({score})</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#181818", border: `1px solid ${color}25`, boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg,${color},${color}55,transparent)` }} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <p className="text-[12px] font-black" style={{ color: "#f0f0f0" }}>Customer Health Score</p>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>Auto-calculated from account activity</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[32px] font-black mono leading-none" style={{ color, fontFamily: "'JetBrains Mono',monospace" }}>{score}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color }}>{label}</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="relative h-3 rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
            style={{ width: `${score}%`, background: `linear-gradient(90deg,${color},${color}aa)`, boxShadow: `0 0 8px ${color}60` }} />
          {/* Grade markers */}
          {[40, 60, 80].map(mark => (
            <div key={mark} className="absolute top-0 bottom-0 w-px" style={{ left: `${mark}%`, background: "rgba(255,255,255,0.12)" }} />
          ))}
        </div>

        {reasons.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Score Detractors</p>
            {reasons.map((r, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: `${r.color}0a`, border: `1px solid ${r.color}20` }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: r.color }} />
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>{r.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
            <p className="text-[11px]" style={{ color: "#10b981" }}>No issues detected — account is in great shape!</p>
          </div>
        )}
      </div>
    </div>
  );
}