import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Wifi, WifiOff, AlertTriangle, TicketCheck, Receipt, Download, LogOut, AlertCircle, CheckCircle, Clock, ArrowUpCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

const NODE_STATUS = {
  online:      { icon: Wifi,          color: "#10b981", bg: "#ecfdf5", border: "#6ee7b7", label: "Online" },
  degraded:    { icon: AlertTriangle, color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", label: "Degraded" },
  offline:     { icon: WifiOff,       color: "#ef4444", bg: "#fef2f2", border: "#fca5a5", label: "Offline" },
  maintenance: { icon: Clock,         color: "#8b5cf6", bg: "#f5f3ff", border: "#c4b5fd", label: "Maintenance" },
};

const TICKET_STATUS = {
  open:             { icon: AlertCircle,   color: "#3b82f6", label: "Open" },
  in_progress:      { icon: ArrowUpCircle, color: "#f59e0b", label: "In Progress" },
  waiting_customer: { icon: Clock,         color: "#f97316", label: "Waiting on You" },
  escalated:        { icon: AlertTriangle, color: "#ef4444", label: "Escalated" },
  resolved:         { icon: CheckCircle,   color: "#10b981", label: "Resolved" },
  closed:           { icon: XCircle,       color: "#94a3b8", label: "Closed" },
};

const PRIORITY_STYLES = {
  low:      "bg-slate-100 text-slate-500",
  medium:   "bg-blue-100 text-blue-600",
  high:     "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function CustomerSelfService() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => base44.auth.redirectToLogin(window.location.pathname))
      .finally(() => setLoadingUser(false));
  }, []);

  const { data: customers = [], isLoading: loadingCustomer } = useQuery({
    queryKey: ["ssc-customer", user?.email],
    queryFn: () => base44.entities.Customer.filter({ email: user?.email }),
    enabled: !!user?.email,
  });
  const customer = customers[0] || null;

  const { data: nodes = [] } = useQuery({
    queryKey: ["ssc-node", customer?.assigned_node],
    queryFn: () => base44.entities.NetworkNode.filter({ name: customer?.assigned_node }),
    enabled: !!customer?.assigned_node,
  });
  const node = nodes[0] || null;

  const { data: tickets = [] } = useQuery({
    queryKey: ["ssc-tickets", customer?.id],
    queryFn: () => base44.entities.Ticket.filter({ customer_id: customer?.id }, "-created_date", 20),
    enabled: !!customer?.id,
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["ssc-invoices", customer?.id],
    queryFn: () => base44.entities.Invoice.filter({ customer_id: customer?.id }, "-created_date", 6),
    enabled: !!customer?.id,
  });

  const openTickets = tickets.filter(t => !["resolved", "closed"].includes(t.status));

  const downloadInvoice = async (inv) => {
    setDownloading(inv.id);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFontSize(20); doc.setTextColor(30, 42, 74);
      doc.text("INVOICE", 20, 25);
      doc.setFontSize(10); doc.setTextColor(100);
      doc.text(`Invoice #: ${inv.invoice_number || inv.id}`, 20, 38);
      doc.text(`Date: ${inv.created_date ? format(new Date(inv.created_date), "dd MMM yyyy") : "—"}`, 20, 45);
      if (inv.due_date) doc.text(`Due: ${format(new Date(inv.due_date), "dd MMM yyyy")}`, 20, 52);
      doc.setFontSize(11); doc.setTextColor(30);
      doc.text("Bill To:", 20, 65);
      doc.setFontSize(10); doc.setTextColor(60);
      doc.text(customer.full_name, 20, 72);
      doc.text(customer.email, 20, 78);
      doc.setDrawColor(200); doc.line(20, 90, 190, 90);
      doc.setTextColor(100);
      doc.text("Description", 20, 98); doc.text("Amount", 160, 98);
      doc.line(20, 102, 190, 102);
      doc.setTextColor(30);
      doc.text(inv.description || `Internet Service – ${customer.service_plan?.replace(/_/g, " ") || ""}`, 20, 110);
      doc.text(`R${(inv.amount || 0).toFixed(2)}`, 160, 110);
      if (inv.tax) { doc.setTextColor(100); doc.text("Tax (VAT)", 20, 118); doc.text(`R${inv.tax.toFixed(2)}`, 160, 118); }
      doc.line(20, 123, 190, 123);
      doc.setFontSize(12); doc.setTextColor(30, 42, 74);
      doc.text("Total", 20, 132); doc.text(`R${(inv.total || inv.amount || 0).toFixed(2)}`, 160, 132);
      doc.setFontSize(9); doc.setTextColor(120);
      doc.text(`Status: ${inv.status?.toUpperCase()}`, 20, 145);
      if (inv.paid_date) doc.text(`Paid: ${format(new Date(inv.paid_date), "dd MMM yyyy")}`, 20, 152);
      doc.save(`Invoice-${inv.invoice_number || inv.id}.pdf`);
    } finally { setDownloading(null); }
  };

  if (loadingUser || loadingCustomer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 p-6">
        <img src={LOGO_URL} alt="Logo" className="h-10 object-contain" />
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-sm w-full text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800 mb-1">No Account Found</h2>
          <p className="text-sm text-slate-500 mb-5">No account is linked to <strong>{user?.email}</strong>. Please contact support.</p>
          <button onClick={() => base44.auth.logout("/")} className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={LOGO_URL} alt="Logo" className="h-8 object-contain" />
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{customer.full_name}</p>
            <p className="text-[11px] text-slate-400 font-mono">{customer.account_number ? `Acct# ${customer.account_number}` : customer.email}</p>
          </div>
        </div>
        <button onClick={() => base44.auth.logout("/")} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </header>

      <main className="max-w-3xl mx-auto p-5 space-y-5">

        {/* Network Status */}
        <Section title="Network Status" icon={<Wifi className="w-4 h-4" />}>
          <NetworkStatusCard customer={customer} node={node} />
        </Section>

        {/* Open Tickets */}
        <Section title={`Open Tickets (${openTickets.length})`} icon={<TicketCheck className="w-4 h-4" />}>
          {openTickets.length === 0 ? (
            <EmptyState icon={<CheckCircle className="w-7 h-7 text-emerald-400" />} text="No open tickets — all clear!" />
          ) : (
            <div className="space-y-2">
              {openTickets.map(t => <TicketRow key={t.id} ticket={t} />)}
            </div>
          )}
        </Section>

        {/* Monthly Invoices */}
        <Section title="Recent Invoices" icon={<Receipt className="w-4 h-4" />}>
          {invoices.length === 0 ? (
            <EmptyState icon={<Receipt className="w-7 h-7 text-slate-300" />} text="No invoices found" />
          ) : (
            <div className="space-y-2">
              {invoices.map(inv => (
                <div key={inv.id} className="flex items-center gap-3 bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{inv.invoice_number || "Invoice"}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {inv.created_date ? format(new Date(inv.created_date), "MMMM yyyy") : "—"}
                      {inv.due_date ? ` · Due ${inv.due_date}` : ""}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-700 flex-shrink-0">R{(inv.total || inv.amount || 0).toFixed(2)}</span>
                  <InvoiceStatusBadge status={inv.status} />
                  <button
                    onClick={() => downloadInvoice(inv)}
                    disabled={downloading === inv.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 transition-colors flex-shrink-0">
                    <Download className="w-3 h-3" />
                    {downloading === inv.id ? "..." : "PDF"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>
      </main>
    </div>
  );
}

function NetworkStatusCard({ customer, node }) {
  const status = node?.status || "online";
  const cfg = NODE_STATUS[status] || NODE_STATUS.online;
  const Icon = cfg.icon;
  return (
    <div className="rounded-xl border p-4 flex items-center gap-4" style={{ background: cfg.bg, borderColor: cfg.border }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.border }}>
        <Icon className="w-6 h-6" style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-slate-800">{node?.name || customer.assigned_node || "Your Connection"}</p>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.border, color: cfg.color }}>{cfg.label}</span>
        </div>
        <p className="text-sm text-slate-500 mt-0.5">{customer.service_plan?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "Internet Service"}</p>
        {node?.location && <p className="text-xs text-slate-400 mt-0.5">📍 {node.location}</p>}
        {node?.bandwidth_utilization != null && (
          <p className="text-xs text-slate-500 mt-1">Bandwidth utilisation: <strong>{node.bandwidth_utilization}%</strong></p>
        )}
      </div>
      {!customer.assigned_node && (
        <p className="text-xs text-slate-400 italic">No node assigned</p>
      )}
    </div>
  );
}

function TicketRow({ ticket }) {
  const cfg = TICKET_STATUS[ticket.status] || TICKET_STATUS.open;
  const Icon = cfg.icon;
  return (
    <div className="flex items-start gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3">
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: cfg.color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{ticket.subject}</p>
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{ticket.description}</p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.medium}`}>{ticket.priority}</span>
        <span className="text-[10px] text-slate-400">{cfg.label}</span>
      </div>
    </div>
  );
}

function InvoiceStatusBadge({ status }) {
  const map = {
    paid:      "bg-emerald-100 text-emerald-700",
    sent:      "bg-blue-100 text-blue-700",
    overdue:   "bg-red-100 text-red-700",
    draft:     "bg-slate-100 text-slate-500",
    cancelled: "bg-slate-100 text-slate-400",
  };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${map[status] || map.draft}`}>{status}</span>;
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <span className="text-slate-500">{icon}</span>
        <h2 className="text-sm font-bold text-slate-700">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      {icon}
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}