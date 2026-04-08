import React, { useState } from "react";
import {
  X, User, Mail, Phone, MapPin, Wifi, Calendar, DollarSign,
  FileText, TicketCheck, Send, Pencil, Trash2, Shield, Activity,
  Clock, ChevronRight, ExternalLink, AlertTriangle, CheckCircle, Zap
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_CFG = {
  active:     { color: "#10b981", bg: "rgba(16,185,129,0.12)",  label: "Active",     glow: "rgba(16,185,129,0.4)" },
  pending:    { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  label: "Pending",    glow: "rgba(245,158,11,0.4)" },
  suspended:  { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   label: "Suspended",  glow: "rgba(239,68,68,0.4)" },
  terminated: { color: "#64748b", bg: "rgba(100,116,139,0.12)", label: "Terminated", glow: "rgba(100,116,139,0.4)" },
};

const PLAN_LABELS = {
  basic_10mbps:       "Basic 10 Mbps",
  standard_50mbps:    "Standard 50 Mbps",
  premium_100mbps:    "Premium 100 Mbps",
  enterprise_500mbps: "Enterprise 500 Mbps",
  dedicated_1gbps:    "Dedicated 1 Gbps",
};

const CONN_ICONS = { fiber: "🔵", wireless: "📡", dsl: "🟡", satellite: "🛰️" };

function StatPill({ label, value, color }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl py-3 px-2"
      style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
      <span className="text-lg font-black mono" style={{ color }}>{value}</span>
      <span className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "rgba(196,181,253,0.5)" }}>{label}</span>
    </div>
  );
}

export default function CustomerDetailPanel({ customer, onClose, onEdit, onDelete, isAdmin }) {
  const sc = STATUS_CFG[customer.status] || STATUS_CFG.pending;

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices", customer.id],
    queryFn: () => base44.entities.Invoice.filter({ customer_id: customer.id }, "-created_date", 5),
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ["tickets", customer.id],
    queryFn: () => base44.entities.Ticket.filter({ customer_id: customer.id }, "-created_date", 5),
  });

  const totalPaid    = invoices.filter(i => i.status === "paid").reduce((a, i) => a + (i.total || 0), 0);
  const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((a, i) => a + (i.total || 0), 0);
  const openTickets  = tickets.filter(t => !["resolved", "closed"].includes(t.status)).length;
  const initials     = customer.full_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??";

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1" style={{ background: "rgba(2,8,20,0.55)", backdropFilter: "blur(6px)" }} />

      {/* Panel */}
      <div
        className="w-full max-w-md h-full overflow-y-auto flex flex-col"
        style={{
          background: "linear-gradient(175deg, #0d1829 0%, #080f1c 100%)",
          borderLeft: "1px solid rgba(6,182,212,0.2)",
          boxShadow: "-24px 0 80px rgba(0,0,0,0.5)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${sc.color}, rgba(99,102,241,0.8), #06b6d4)` }} />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-start justify-between flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-xl"
              style={{ background: `linear-gradient(135deg, ${sc.color}30, ${sc.color}10)`, border: `1px solid ${sc.color}40`, color: sc.color, boxShadow: `0 0 20px ${sc.glow}` }}>
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-black text-white leading-tight">{customer.full_name}</h2>
              <p className="text-[11px] mono mt-0.5" style={{ color: "#06b6d4" }}>{customer.account_number || "—"}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.color, boxShadow: `0 0 6px ${sc.color}` }} />
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: sc.color }}>{sc.label}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        {/* Stats row */}
        <div className="px-6 py-4 grid grid-cols-3 gap-2 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <StatPill label="Paid" value={`R${(totalPaid/1000).toFixed(1)}k`} color="#10b981" />
          <StatPill label="Overdue" value={`R${totalOverdue.toLocaleString()}`} color="#ef4444" />
          <StatPill label="Open Tickets" value={openTickets} color="#f59e0b" />
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-4 space-y-5 overflow-y-auto">

          {/* Contact info */}
          <Section title="Contact Information" icon={User}>
            <InfoRow icon={Mail} label="Email" value={customer.email} mono />
            <InfoRow icon={Phone} label="Phone" value={customer.phone || "—"} />
            <InfoRow icon={MapPin} label="Address" value={customer.address || "—"} />
          </Section>

          {/* Service */}
          <Section title="Service Details" icon={Wifi}>
            <InfoRow icon={Zap} label="Plan" value={PLAN_LABELS[customer.service_plan] || customer.service_plan || "—"} />
            <InfoRow icon={Activity} label="Connection" value={`${CONN_ICONS[customer.connection_type] || ""} ${customer.connection_type || "—"}`} />
            <InfoRow icon={DollarSign} label="Monthly Rate" value={`R${customer.monthly_rate?.toFixed(2) || "0.00"}`} highlight />
            <InfoRow icon={Shield} label="Node" value={customer.assigned_node || "Unassigned"} mono />
            {customer.contract_end_date && (
              <InfoRow icon={Calendar} label="Contract Ends" value={format(new Date(customer.contract_end_date), "dd MMM yyyy")} />
            )}
          </Section>

          {/* Recent invoices */}
          <Section title="Recent Invoices" icon={FileText}>
            {invoices.length === 0 ? (
              <p className="text-xs py-2" style={{ color: "rgba(255,255,255,0.25)" }}>No invoices yet</p>
            ) : invoices.slice(0, 4).map(inv => {
              const iColors = { paid: "#10b981", overdue: "#ef4444", sent: "#06b6d4", draft: "#64748b", cancelled: "#64748b" };
              const c = iColors[inv.status] || "#64748b";
              return (
                <div key={inv.id} className="flex items-center justify-between py-2"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <p className="text-[11px] font-bold mono" style={{ color: "#94a3b8" }}>{inv.invoice_number || "—"}</p>
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{inv.due_date ? format(new Date(inv.due_date), "dd MMM yy") : "—"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-black mono" style={{ color: "#e2e8f0" }}>R{inv.total?.toFixed(2)}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase" style={{ background: `${c}18`, color: c, border: `1px solid ${c}30` }}>{inv.status}</span>
                  </div>
                </div>
              );
            })}
          </Section>

          {/* Recent tickets */}
          <Section title="Recent Tickets" icon={TicketCheck}>
            {tickets.length === 0 ? (
              <p className="text-xs py-2" style={{ color: "rgba(255,255,255,0.25)" }}>No tickets</p>
            ) : tickets.slice(0, 3).map(t => {
              const pColors = { critical: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#10b981" };
              const pc = pColors[t.priority] || "#64748b";
              return (
                <div key={t.id} className="flex items-start gap-2 py-2"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: pc, boxShadow: `0 0 5px ${pc}` }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-white/70 truncate">{t.subject}</p>
                    <p className="text-[10px] capitalize" style={{ color: "rgba(255,255,255,0.3)" }}>{t.status?.replace(/_/g, " ")} · {t.category}</p>
                  </div>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: `${pc}18`, color: pc, border: `1px solid ${pc}30` }}>{t.priority}</span>
                </div>
              );
            })}
          </Section>

          {/* Notes */}
          {customer.notes && (
            <Section title="Notes" icon={FileText}>
              <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{customer.notes}</p>
            </Section>
          )}
        </div>

        {/* Footer actions */}
        {isAdmin && (
          <div className="px-6 py-4 flex gap-2 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
            <button
              onClick={() => { toast.promise(base44.users.inviteUser(customer.email, "user"), { loading: "Sending invite…", success: "Invite sent!", error: "Failed" }); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
              style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#818cf8" }}>
              <Send className="w-3.5 h-3.5" /> Invite Portal
            </button>
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
              style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)", color: "#22d3ee" }}>
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color: "#06b6d4" }} />
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(6,182,212,0.6)" }}>{title}</p>
      </div>
      <div className="space-y-0">{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, mono, highlight }) {
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="flex items-center gap-2">
        <Icon className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(100,116,139,0.5)" }} />
        <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
      </div>
      <span className={`text-[12px] font-semibold ${mono ? "mono" : ""} max-w-[200px] truncate text-right`}
        style={{ color: highlight ? "#06b6d4" : "rgba(255,255,255,0.75)" }}>
        {value}
      </span>
    </div>
  );
}