import React from "react";
import { AlertTriangle, Clock, TrendingDown } from "lucide-react";
import { differenceInDays } from "date-fns";

function getRiskLevel(customer) {
  const today = new Date();
  let risk = 0;
  const reasons = [];

  if (customer.status === "suspended") { risk += 50; reasons.push("Account suspended"); }
  if (customer.balance < 0) { risk += 30; reasons.push(`Negative balance: R${Math.abs(customer.balance).toFixed(0)}`); }
  if (customer.contract_end_date) {
    const daysLeft = differenceInDays(new Date(customer.contract_end_date), today);
    if (daysLeft < 0)  { risk += 40; reasons.push("Contract expired"); }
    else if (daysLeft <= 30)  { risk += 30; reasons.push(`Contract ends in ${daysLeft}d`); }
    else if (daysLeft <= 60)  { risk += 20; reasons.push(`Contract ends in ${daysLeft}d`); }
    else if (daysLeft <= 90)  { risk += 10; reasons.push(`Contract ends in ${daysLeft}d`); }
  }

  risk = Math.min(100, risk);
  const level = risk >= 70 ? "critical" : risk >= 40 ? "high" : risk >= 20 ? "medium" : "low";
  const color = { critical: "#e02347", high: "#f97316", medium: "#f59e0b", low: "#10b981" }[level];
  return { risk, level, color, reasons };
}

export default function ChurnRiskPanel({ customers }) {
  const atRisk = customers
    .map(c => ({ ...c, ...getRiskLevel(c) }))
    .filter(c => c.risk >= 20)
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 10);

  if (atRisk.length === 0) return null;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "#181818", border: "1px solid rgba(245,158,11,0.2)" }}>
      <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#f59e0b,#e02347,transparent)" }} />
      <div className="px-5 py-3 flex items-center gap-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(245,158,11,0.04)" }}>
        <TrendingDown className="w-4 h-4" style={{ color: "#f59e0b" }} />
        <p className="text-[13px] font-black" style={{ color: "#f0f0f0" }}>Churn Risk Dashboard</p>
        <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full"
          style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
          {atRisk.length} at risk
        </span>
      </div>
      <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        {atRisk.map(c => (
          <div key={c.id} className="flex items-center gap-4 px-5 py-3 fx-data-row">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] flex-shrink-0"
              style={{ background: `${c.color}18`, border: `1px solid ${c.color}30`, color: c.color }}>
              {c.full_name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold truncate" style={{ color: "#e0e0e0" }}>{c.full_name}</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {c.reasons.map(r => (
                  <span key={r} className="text-[9px] px-1.5 py-0.5 rounded-md font-bold"
                    style={{ background: `${c.color}12`, color: c.color, border: `1px solid ${c.color}25` }}>{r}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3 h-3" style={{ color: c.color }} />
                <span className="text-[11px] font-black uppercase" style={{ color: c.color }}>{c.level}</span>
              </div>
              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full" style={{ width: `${c.risk}%`, background: c.color }} />
              </div>
              <span className="text-[9px] mono mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{c.risk}% risk</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}