import React from "react";
import { format } from "date-fns";
import { UserPlus, Receipt, TicketCheck, AlertCircle, Zap } from "lucide-react";

const typeStyles = {
  customer: { grad: "linear-gradient(135deg,#3b82f6,#6366f1)" },
  ticket:   { grad: "linear-gradient(135deg,#f59e0b,#f97316)" },
  critical: { grad: "linear-gradient(135deg,#ef4444,#f97316)" },
  invoice:  { grad: "linear-gradient(135deg,#06b6d4,#3b82f6)" },
};

export default function RecentActivity({ customers, tickets, invoices }) {
  const activities = [];
  customers.slice(0, 3).forEach(c => activities.push({ type: "customer", icon: UserPlus, text: c.full_name, sub: "New customer account", date: c.created_date }));
  tickets.slice(0, 3).forEach(t => activities.push({ type: t.priority === "critical" ? "critical" : "ticket", icon: t.priority === "critical" ? AlertCircle : TicketCheck, text: t.subject, sub: `${t.priority} · ${t.status}`, date: t.created_date }));
  invoices.slice(0, 3).forEach(i => activities.push({ type: "invoice", icon: Receipt, text: `Invoice ${i.invoice_number || "#"}`, sub: `R${(i.total || i.amount || 0).toLocaleString()}`, date: i.created_date }));
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  const list = activities.slice(0, 7);

  return (
    <div className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: "#ffffff", border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 2px 16px rgba(99,102,241,0.06)" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[13px] font-bold" style={{ color: "#1e293b" }}>Recent Activity</h3>
          <p className="text-[10px] mt-0.5 mono" style={{ color: "rgba(100,116,139,0.5)" }}>Latest system events</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold mono"
          style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)", color: "#6366f1" }}>
          <Zap className="w-3 h-3" />
          Live
        </div>
      </div>
      <div className="relative">
        <div className="absolute left-[13px] top-3 bottom-3 w-px" style={{ background: "linear-gradient(180deg, rgba(99,102,241,0.2) 0%, transparent 100%)" }} />
        <div className="space-y-0.5">
          {list.map((a, i) => {
            const Icon = a.icon;
            const s = typeStyles[a.type] || typeStyles.ticket;
            return (
              <div key={i} className="flex items-start gap-3 pl-0.5 py-2 rounded-xl transition-all duration-150 cursor-default"
                onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 relative z-10 mt-0.5" style={{ background: s.grad }}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold truncate leading-tight" style={{ color: "#1e293b" }}>{a.text}</p>
                  <p className="text-[10px] mt-0.5 truncate" style={{ color: "#94a3b8" }}>{a.sub}</p>
                </div>
                <p className="text-[10px] flex-shrink-0 pt-0.5 mono" style={{ color: "#94a3b8" }}>
                  {a.date ? format(new Date(a.date), "MMM d") : ""}
                </p>
              </div>
            );
          })}
          {list.length === 0 && <p className="text-[12px] text-center py-8" style={{ color: "#94a3b8" }}>No recent activity</p>}
        </div>
      </div>
    </div>
  );
}