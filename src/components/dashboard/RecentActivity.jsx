import React from "react";
import { format } from "date-fns";
import { UserPlus, Receipt, TicketCheck, AlertCircle, Zap } from "lucide-react";

const typeStyles = {
  customer: { dot: "#3b82f6", bg: "rgba(59,130,246,0.12)",  grad: "linear-gradient(135deg,#3b82f6,#6366f1)" },
  ticket:   { dot: "#f59e0b", bg: "rgba(245,158,11,0.12)",  grad: "linear-gradient(135deg,#f59e0b,#f97316)" },
  critical: { dot: "#ef4444", bg: "rgba(239,68,68,0.12)",   grad: "linear-gradient(135deg,#ef4444,#f97316)" },
  invoice:  { dot: "#10b981", bg: "rgba(16,185,129,0.12)",  grad: "linear-gradient(135deg,#10b981,#06b6d4)" },
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
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.88)",
        border: "1px solid rgba(255,255,255,0.95)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 0% 100%, rgba(99,102,241,0.03) 0%, transparent 70%)" }} />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-bold text-slate-800">Recent Activity</h3>
          <p className="text-[10px] mt-0.5 text-slate-400 mono">Latest system events</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold mono"
          style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", color: "#6366f1" }}>
          <Zap className="w-3 h-3" />
          Live
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[13px] top-3 bottom-3 w-px" style={{ background: "linear-gradient(180deg, rgba(99,102,241,0.25) 0%, transparent 100%)" }} />
        <div className="space-y-0.5">
          {list.map((a, i) => {
            const Icon = a.icon;
            const s    = typeStyles[a.type] || typeStyles.ticket;
            return (
              <div
                key={i}
                className="flex items-start gap-3 pl-0.5 py-2 rounded-xl transition-all duration-150 hover:bg-slate-50 group cursor-default"
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 relative z-10 mt-0.5"
                  style={{ background: s.grad }}
                >
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-700 truncate leading-tight">{a.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{a.sub}</p>
                </div>
                <p className="text-[10px] text-slate-400 flex-shrink-0 pt-0.5 mono">
                  {a.date ? format(new Date(a.date), "MMM d") : ""}
                </p>
              </div>
            );
          })}
          {list.length === 0 && (
            <p className="text-[12px] text-slate-400 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}