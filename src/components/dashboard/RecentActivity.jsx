import React from "react";
import { format } from "date-fns";
import { UserPlus, Receipt, TicketCheck, AlertCircle, Zap } from "lucide-react";

const typeStyles = {
  customer: { grad: "linear-gradient(135deg,#00b4b4,#00d4d4)" },
  ticket:   { grad: "linear-gradient(135deg,#f59e0b,#fbbf24)" },
  critical: { grad: "linear-gradient(135deg,#e02347,#ff3358)" },
  invoice:  { grad: "linear-gradient(135deg,#10b981,#34d399)" },
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
      style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg,#00b4b4,#10b981,transparent)" }} />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[13px] font-bold" style={{ color: "#f0f0f0" }}>Recent Activity</h3>
          <p className="text-[10px] mt-0.5 mono" style={{ color: "rgba(255,255,255,0.35)" }}>Latest system events</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold mono neon-border"
          style={{ background: "rgba(0,180,180,0.1)", border: "1px solid rgba(0,180,180,0.3)", color: "#00b4b4" }}>
          <Zap className="w-3 h-3" />
          Live
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[13px] top-3 bottom-3 w-px"
          style={{ background: "linear-gradient(180deg, rgba(0,180,180,0.3) 0%, transparent 100%)" }} />
        <div className="space-y-0.5">
          {list.map((a, i) => {
            const Icon = a.icon;
            const s = typeStyles[a.type] || typeStyles.ticket;
            return (
              <div key={i} className="flex items-start gap-3 pl-0.5 py-2.5 px-2 rounded-xl transition-all duration-150 cursor-default"
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,180,180,0.05)"; e.currentTarget.style.borderColor = "rgba(0,180,180,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 relative z-10 mt-0.5" style={{ background: s.grad }}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold truncate leading-tight" style={{ color: "#e0e0e0" }}>{a.text}</p>
                  <p className="text-[10px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{a.sub}</p>
                </div>
                <p className="text-[10px] flex-shrink-0 pt-0.5 mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {a.date ? format(new Date(a.date), "MMM d") : ""}
                </p>
              </div>
            );
          })}
          {list.length === 0 && <p className="text-[12px] text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>No recent activity</p>}
        </div>
      </div>
    </div>
  );
}