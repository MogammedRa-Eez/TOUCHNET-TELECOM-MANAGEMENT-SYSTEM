import React from "react";
import { format } from "date-fns";
import { UserPlus, Receipt, TicketCheck, Wifi, AlertCircle } from "lucide-react";

export default function RecentActivity({ customers, tickets, invoices }) {
  const activities = [];

  customers.slice(0, 3).forEach(c => {
    activities.push({
      type: "customer",
      icon: UserPlus,
      color: "bg-blue-500",
      text: `New customer: ${c.full_name}`,
      date: c.created_date,
    });
  });

  tickets.slice(0, 3).forEach(t => {
    activities.push({
      type: "ticket",
      icon: t.priority === "critical" ? AlertCircle : TicketCheck,
      color: t.priority === "critical" ? "bg-red-500" : "bg-amber-500",
      text: `${t.subject}`,
      date: t.created_date,
    });
  });

  invoices.slice(0, 3).forEach(i => {
    activities.push({
      type: "invoice",
      icon: Receipt,
      color: "bg-emerald-500",
      text: `Invoice ${i.invoice_number || '#'} — $${i.total?.toFixed(2) || i.amount?.toFixed(2)}`,
      date: i.created_date,
    });
  });

  activities.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="rounded-xl p-6" style={{ background: "#0d1527", border: "1px solid rgba(6,182,212,0.12)" }}>
      <h3 className="text-[13px] font-semibold text-slate-200 mb-1">Recent Activity</h3>
      <p className="text-[11px] mb-4" style={{ color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>Latest system events</p>
      
      <div className="space-y-3">
        {activities.slice(0, 6).map((a, i) => {
          const Icon = a.icon;
          return (
            <div key={i} className="flex items-start gap-3 py-2" style={{ borderBottom: "1px solid rgba(6,182,212,0.06)" }}>
              <div className={`w-7 h-7 rounded-md ${a.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-slate-300 truncate">{a.text}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#334155", fontFamily: "'JetBrains Mono', monospace" }}>{a.date ? format(new Date(a.date), "MMM d, h:mm a") : ""}</p>
              </div>
            </div>
          );
        })}
        {activities.length === 0 && (
          <p className="text-[12px] text-slate-600 text-center py-4">No recent activity</p>
        )}
      </div>
    </div>
  );
}