import React from "react";
import { TicketCheck, AlertTriangle, Clock, CheckCircle, MessageSquare, User } from "lucide-react";
import KPICard from "./KPICard";
import TicketOverview from "./TicketOverview";

export default function SupportDashboard({ tickets = [], customers = [] }) {
  const open = tickets.filter(t => t.status === "open").length;
  const inProgress = tickets.filter(t => t.status === "in_progress").length;
  const escalated = tickets.filter(t => t.status === "escalated").length;
  const resolved = tickets.filter(t => ["resolved", "closed"].includes(t.status)).length;
  const critical = tickets.filter(t => t.priority === "critical" && !["resolved", "closed"].includes(t.status)).length;
  const waitingCustomer = tickets.filter(t => t.status === "waiting_customer").length;

  const PRIORITY_COLORS = { low: "#10b981", medium: "#3b82f6", high: "#f59e0b", critical: "#ef4444" };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: "rgba(245,158,11,0.12)", color: "#d97706", border: "1px solid rgba(245,158,11,0.25)" }}>
          SUPPORT — HELPDESK & TICKETS
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Open Tickets" value={open} subtitle="Needs attention" icon={TicketCheck} color="amber" />
        <KPICard title="In Progress" value={inProgress} subtitle="Being handled" icon={Clock} color="blue" />
        <KPICard title="Escalated" value={escalated} subtitle="Urgent" icon={AlertTriangle} color="rose" trend={escalated > 0 ? "up" : "down"} trendValue={escalated > 0 ? "Action needed" : "Clear"} />
        <KPICard title="Resolved" value={resolved} subtitle="Closed tickets" icon={CheckCircle} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <TicketOverview tickets={tickets} />
        </div>

        {/* Active tickets list */}
        <div className="lg:col-span-2 rounded-xl p-6" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h3 className="text-[13px] font-semibold text-slate-700 mb-1">Active Tickets</h3>
          <p className="text-[11px] mb-4" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>Open & in-progress</p>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {tickets.filter(t => !["resolved", "closed"].includes(t.status)).slice(0, 12).map(t => (
              <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors" style={{ border: "1px solid rgba(0,0,0,0.05)" }}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: PRIORITY_COLORS[t.priority] || "#94a3b8" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{t.subject}</p>
                  <p className="text-[11px] text-slate-400">{t.customer_name || "Unknown"} • {t.category}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: (PRIORITY_COLORS[t.priority] || "#94a3b8") + "22", color: PRIORITY_COLORS[t.priority] || "#94a3b8" }}>
                    {t.priority}
                  </span>
                  <span className="text-[10px] text-slate-400">{t.assigned_to || "Unassigned"}</span>
                </div>
              </div>
            ))}
            {tickets.filter(t => !["resolved", "closed"].includes(t.status)).length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60" />
                <p className="text-sm">All tickets resolved!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Waiting on customer */}
      {waitingCustomer > 0 && (
        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
          <MessageSquare className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800">{waitingCustomer} ticket{waitingCustomer > 1 ? "s" : ""} waiting on customer response</p>
            <p className="text-xs text-blue-600">Follow up to keep SLAs on track.</p>
          </div>
        </div>
      )}
    </div>
  );
}