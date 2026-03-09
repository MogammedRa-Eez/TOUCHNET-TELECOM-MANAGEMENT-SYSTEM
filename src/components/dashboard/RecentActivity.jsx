import React from "react";
import { format } from "date-fns";
import { UserPlus, Receipt, TicketCheck, AlertCircle, Clock } from "lucide-react";

const typeStyles = {
  customer: { dot: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)" },
  ticket:   { dot: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
  critical: { dot: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.25)" },
  invoice:  { dot: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)" },
};

export default function RecentActivity({ customers, tickets, invoices }) {
  const activities = [];

  customers.slice(0, 3).forEach(c => activities.push({
    type: "customer", icon: UserPlus,
    text: c.full_name, sub: "New customer account",
    date: c.created_date,
  }));

  tickets.slice(0, 3).forEach(t => activities.push({
    type: t.priority === "critical" ? "critical" : "ticket",
    icon: t.priority === "critical" ? AlertCircle : TicketCheck,
    text: t.subject, sub: `${t.priority} · ${t.status}`,
    date: t.created_date,
  }));

  invoices.slice(0, 3).forEach(i => activities.push({
    type: "invoice", icon: Receipt,
    text: `Invoice ${i.invoice_number || "#"}`,
    sub: `R${(i.total || i.amount || 0).toLocaleString()}`,
    date: i.created_date,
  }));

  activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  const list = activities.slice(0, 7);

  return (
    <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 0% 100%, rgba(99,102,241,0.03) 0%, transparent 70%)" }} />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[14px] font-bold text-slate-800">Recent Activity</h3>
          <p className="text-[11px] mt-0.5 text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Latest system events</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <Clock className="w-3 h-3" />
          Live
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px" style={{ background: "linear-gradient(180deg, rgba(99,102,241,0.3) 0%, rgba(99,102,241,0.05) 100%)" }} />

        <div className="space-y-1">
          {list.map((a, i) => {
            const Icon = a.icon;
            const s    = typeStyles[a.type] || typeStyles.ticket;
            return (
              <div key={i} className="flex items-start gap-3 pl-1 py-2.5 rounded-xl transition-colors hover:bg-slate-50 group">
                {/* Timeline dot */}
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 relative z-10" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <Icon className="w-3 h-3" style={{ color: s.dot }} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[12px] font-semibold text-slate-700 truncate leading-tight">{a.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{a.sub}</p>
                </div>
                <p className="text-[10px] text-slate-400 flex-shrink-0 pt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {a.date ? format(new Date(a.date), "MMM d") : ""}
                </p>
              </div>
            );
          })}
          {list.length === 0 && (
            <p className="text-[12px] text-slate-400 text-center py-6">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}