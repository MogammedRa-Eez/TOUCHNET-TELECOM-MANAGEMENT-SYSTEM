import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import QuoteAcceptancePanel from "@/components/portal/QuoteAcceptancePanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Receipt, TicketCheck, Wifi, WifiOff, AlertTriangle, LogOut, AlertCircle,
  CheckCircle, Clock, XCircle, ArrowUpCircle, TrendingUp,
  Activity, CreditCard, HeadphonesIcon, Download, Filter,
  ArrowUpDown, ChevronDown, ChevronUp, Calendar, DollarSign, Zap, Signal
} from "lucide-react";
import { format } from "date-fns";
import CustomerProfileDetail from "@/components/portal/CustomerProfileDetail";
import SubmitTicketForm from "@/components/portal/SubmitTicketForm";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

const statusColor = {
  active:    { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  pending:   { bg: "bg-yellow-100",  text: "text-yellow-700",  border: "border-yellow-200" },
  suspended: { bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200" },
  terminated:{ bg: "bg-slate-100",   text: "text-slate-500",   border: "border-slate-200" },
};

const invoiceStatusColor = {
  paid:      { bg: "bg-emerald-100", text: "text-emerald-700" },
  sent:      { bg: "bg-blue-100",    text: "text-blue-700" },
  overdue:   { bg: "bg-red-100",     text: "text-red-700" },
  draft:     { bg: "bg-slate-100",   text: "text-slate-500" },
  cancelled: { bg: "bg-slate-100",   text: "text-slate-400" },
};

const ticketStatusIcon = {
  open:             <AlertCircle className="w-4 h-4 text-blue-500" />,
  in_progress:      <ArrowUpCircle className="w-4 h-4 text-yellow-500" />,
  waiting_customer: <Clock className="w-4 h-4 text-orange-500" />,
  escalated:        <AlertCircle className="w-4 h-4 text-red-500" />,
  resolved:         <CheckCircle className="w-4 h-4 text-emerald-500" />,
  closed:           <XCircle className="w-4 h-4 text-slate-400" />,
};

const priorityColor = {
  low:      "bg-slate-100 text-slate-500",
  medium:   "bg-blue-100 text-blue-600",
  high:     "bg-orange-100 text-orange-600",
  critical: "bg-red-100 text-red-600",
};

const NODE_STATUS_CFG = {
  online:      { label: "Online",      color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", Icon: Wifi },
  degraded:    { label: "Degraded",    color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", Icon: AlertTriangle },
  offline:     { label: "Offline",     color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", Icon: WifiOff },
  maintenance: { label: "Maintenance", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)", Icon: Clock },
};

export default function CustomerPortal() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(u => { setUser(u); setIsAdmin(u?.role === "admin"); })
      .catch(() => base44.auth.redirectToLogin(window.location.pathname))
      .finally(() => setLoadingUser(false));
  }, []);

  const { data: customers = [], isLoading: loadingCustomer } = useQuery({
    queryKey: ["portal-customer", user?.email],
    queryFn: () => base44.entities.Customer.filter({ email: user?.email }),
    enabled: !!user?.email,
  });

  const customer = customers[0] || null;

  const { data: nodes = [] } = useQuery({
    queryKey: ["portal-node", customer?.assigned_node],
    queryFn: () => base44.entities.NetworkNode.filter({ name: customer?.assigned_node }),
    enabled: !!customer?.assigned_node,
  });
  const node = nodes[0] || null;

  const { data: invoices = [] } = useQuery({
    queryKey: ["portal-invoices", customer?.id],
    queryFn: () => base44.entities.Invoice.filter({ customer_id: customer?.id }, "-created_date"),
    enabled: !!customer?.id,
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ["portal-tickets", customer?.id],
    queryFn: () => base44.entities.Ticket.filter({ customer_id: customer?.id }, "-created_date"),
    enabled: !!customer?.id,
  });

  const handleLogout = () => base44.auth.logout("/");

  if (loadingUser || loadingCustomer) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg,#f0f2fc,#faf4ff)" }}>
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6" style={{ background: "linear-gradient(160deg,#f0f2fc,#faf4ff)" }}>
        <img src={LOGO_URL} alt="Logo" className="h-12 object-contain mb-2" />
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl" style={{ border: "1px solid rgba(99,102,241,0.15)" }}>
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-1">Account Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">No customer account linked to <strong>{user?.email}</strong>. Contact support.</p>
          <button onClick={handleLogout} className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
    );
  }

  const nodeCfg = NODE_STATUS_CFG[node?.status || "online"] || NODE_STATUS_CFG.online;
  const statusMap = { active: { color: "#10b981", bg: "rgba(16,185,129,0.1)" }, suspended: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" }, pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" }, terminated: { color: "#94a3b8", bg: "rgba(148,163,184,0.1)" } };
  const sc = statusMap[customer.status] || statusMap.pending;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#f0f2fc 0%,#f4f6ff 50%,#faf4ff 100%)", fontFamily: "'Inter',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap'); .mono{font-family:'JetBrains Mono',monospace!important}`}</style>

      {/* Top bar */}
      <header className="sticky top-0 z-20 px-5 py-3 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.92)", borderBottom: "1px solid rgba(99,102,241,0.1)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="Logo" className="h-8 object-contain" />
          <div className="hidden sm:block h-5 w-px bg-slate-200" />
          <div className="hidden sm:block">
            <p className="text-[13px] font-bold text-slate-800 leading-tight">{customer.full_name}</p>
            <p className="text-[10px] text-slate-400 mono">{customer.account_number ? `#${customer.account_number}` : customer.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold mono" style={{ background: nodeCfg.bg, border: `1px solid ${nodeCfg.border}`, color: nodeCfg.color }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: nodeCfg.color }} />
            {nodeCfg.label}
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors border border-slate-200">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-5 space-y-5">

        {/* Hero account card */}
        <div className="rounded-3xl p-6 overflow-hidden relative" style={{ background: "linear-gradient(135deg,#312e81,#4c1d95,#1e1b4b)", boxShadow: "0 8px 40px rgba(99,102,241,0.25)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
                {customer.full_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">{customer.full_name}</h1>
                <p className="text-[12px] text-white/50 mono mt-0.5">{customer.email}</p>
                {customer.account_number && <p className="text-[10px] text-white/30 mono mt-0.5">Account #{customer.account_number}</p>}
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold capitalize" style={{ background: `${sc.bg}`, color: sc.color, border: `1px solid ${sc.color}33` }}>
              {customer.status}
            </span>
          </div>
          <div className="relative mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Service Plan", value: customer.service_plan?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "—" },
              { label: "Connection", value: customer.connection_type?.replace(/_/g, " ") || "—" },
              { label: "Monthly Rate", value: `R${customer.monthly_rate?.toFixed(2) || "0.00"}` },
              { label: "Balance", value: `R${(customer.balance || 0).toFixed(2)}`, valueStyle: { color: (customer.balance || 0) < 0 ? "#fca5a5" : "#6ee7b7" } },
            ].map(item => (
              <div key={item.label} className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <p className="text-[9px] text-white/40 mono uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-[14px] font-bold text-white mono" style={item.valueStyle}>{item.value}</p>
              </div>
            ))}
          </div>
          {customer.address && <p className="relative mt-3 text-[11px] text-white/40">📍 {customer.address}</p>}
        </div>

        {/* Network Uptime panel */}
        <NetworkUptimePanel node={node} customer={customer} />

        {/* Activity Dashboard */}
        <ActivityDashboard customer={customer} invoices={invoices} tickets={tickets} />

        {/* Tabs */}
        <Tabs defaultValue="invoices">
          <TabsList className="rounded-2xl p-1 gap-1" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(99,102,241,0.12)" }}>
            <TabsTrigger value="invoices" className="gap-1.5 rounded-xl data-[state=active]:text-white text-[12px] font-semibold" style={{}}>
              <Receipt className="w-3.5 h-3.5" /> Invoices
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-1.5 rounded-xl data-[state=active]:text-white text-[12px] font-semibold">
              <TicketCheck className="w-3.5 h-3.5" /> Support
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-1.5 rounded-xl data-[state=active]:text-white text-[12px] font-semibold">
              <User className="w-3.5 h-3.5" /> Profile
            </TabsTrigger>
          </TabsList>

          {/* Invoices */}
          <TabsContent value="invoices" className="mt-4">
            <InvoiceSection invoices={invoices} customer={customer} />
          </TabsContent>

          {/* Profile & History */}
          <TabsContent value="profile" className="mt-4">
            <CustomerProfileDetail
              customer={customer}
              invoices={invoices}
              tickets={tickets}
              isAdmin={isAdmin}
            />
          </TabsContent>

          {/* Tickets */}
          <TabsContent value="tickets" className="mt-4 space-y-3">
            <div className="flex justify-end">
              <button
                onClick={() => setShowTicketForm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(90deg, #dc2626, #b91c1c)" }}>
                <TicketCheck className="w-4 h-4" /> New Ticket
              </button>
            </div>
            {tickets.length === 0 ? (
              <Empty icon={<TicketCheck className="w-8 h-8 text-slate-300" />} text="No support tickets yet — submit one above!" />
            ) : tickets.map(t => (
              <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-2">
                    {ticketStatusIcon[t.status] || <AlertCircle className="w-4 h-4 text-slate-400" />}
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{t.subject}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{t.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${priorityColor[t.priority] || "bg-slate-100 text-slate-500"}`}>{t.priority}</span>
                    <span className="text-xs text-slate-400 capitalize">{t.status?.replace(/_/g, " ")}</span>
                  </div>
                </div>
                {t.resolution_notes && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500"><strong className="text-slate-600">Resolution:</strong> {t.resolution_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </main>

      {showTicketForm && customer && (
        <SubmitTicketForm customer={customer} onClose={() => setShowTicketForm(false)} />
      )}
    </div>
  );
}

function InvoiceSection({ invoices, customer }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [expanded, setExpanded] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const filtered = invoices
    .filter(i => statusFilter === "all" || i.status === statusFilter)
    .sort((a, b) => {
      let va, vb;
      if (sortBy === "date") { va = new Date(a.created_date); vb = new Date(b.created_date); }
      else if (sortBy === "amount") { va = a.total || a.amount || 0; vb = b.total || b.amount || 0; }
      else if (sortBy === "due") { va = a.due_date ? new Date(a.due_date) : 0; vb = b.due_date ? new Date(b.due_date) : 0; }
      return sortDir === "desc" ? vb - va : va - vb;
    });

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortBy(field); setSortDir("desc"); }
  };

  const downloadInvoice = async (inv) => {
    setDownloading(inv.id);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(30, 42, 74);
      doc.text("INVOICE", 20, 25);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Invoice #: ${inv.invoice_number || inv.id}`, 20, 38);
      doc.text(`Date: ${inv.created_date ? format(new Date(inv.created_date), "dd MMM yyyy") : "—"}`, 20, 45);
      if (inv.due_date) doc.text(`Due Date: ${format(new Date(inv.due_date), "dd MMM yyyy")}`, 20, 52);
      doc.setFontSize(11);
      doc.setTextColor(30);
      doc.text("Bill To:", 20, 65);
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(customer.full_name, 20, 72);
      doc.text(customer.email, 20, 78);
      if (customer.address) doc.text(customer.address, 20, 84);
      doc.setDrawColor(200);
      doc.line(20, 95, 190, 95);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Description", 20, 103);
      doc.text("Amount", 160, 103);
      doc.setDrawColor(220);
      doc.line(20, 107, 190, 107);
      doc.setTextColor(30);
      doc.text(inv.description || `Service: ${customer.service_plan?.replace(/_/g, " ") || "Internet Service"}`, 20, 115);
      doc.text(`R${(inv.amount || 0).toFixed(2)}`, 160, 115);
      if (inv.tax) {
        doc.setTextColor(100);
        doc.text("Tax", 20, 123);
        doc.text(`R${inv.tax.toFixed(2)}`, 160, 123);
      }
      doc.line(20, 128, 190, 128);
      doc.setFontSize(12);
      doc.setTextColor(30, 42, 74);
      doc.text("Total", 20, 137);
      doc.text(`R${(inv.total || inv.amount || 0).toFixed(2)}`, 160, 137);
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Status: ${inv.status?.toUpperCase()}`, 20, 150);
      if (inv.paid_date) doc.text(`Paid on: ${format(new Date(inv.paid_date), "dd MMM yyyy")}`, 20, 157);
      if (inv.payment_method) doc.text(`Payment Method: ${inv.payment_method?.replace(/_/g, " ")}`, 20, 164);
      doc.save(`Invoice-${inv.invoice_number || inv.id}.pdf`);
    } finally {
      setDownloading(null);
    }
  };

  const SortBtn = ({ field, label, icon }) => (
    <button
      onClick={() => toggleSort(field)}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${sortBy === field ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
      {icon}{label}
      {sortBy === field && (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
    </button>
  );

  if (invoices.length === 0) return <Empty icon={<Receipt className="w-8 h-8 text-slate-300" />} text="No invoices found" />;

  return (
    <div className="space-y-3">
      {/* Filters & Sort */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          {["all", "paid", "sent", "overdue", "draft", "cancelled"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors capitalize ${statusFilter === s ? "bg-slate-800 text-white border-slate-800" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Sort:</span>
          <SortBtn field="date" label="Date" icon={<Calendar className="w-3 h-3" />} />
          <SortBtn field="amount" label="Amount" icon={<DollarSign className="w-3 h-3" />} />
          <SortBtn field="due" label="Due" icon={<Clock className="w-3 h-3" />} />
        </div>
      </div>

      {/* Invoice cards */}
      {filtered.length === 0 ? (
        <Empty icon={<Receipt className="w-8 h-8 text-slate-300" />} text="No invoices match your filter" />
      ) : filtered.map(inv => {
        const ic = invoiceStatusColor[inv.status] || invoiceStatusColor.draft;
        const isExpanded = expanded === inv.id;
        return (
          <div key={inv.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 flex items-center justify-between gap-4 flex-wrap">
              <button className="flex-1 text-left" onClick={() => setExpanded(isExpanded ? null : inv.id)}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{inv.invoice_number || "Invoice"}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {inv.billing_period_start ? `Period: ${inv.billing_period_start} — ${inv.billing_period_end || ""}` : inv.description || "—"}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {inv.due_date && <span className="text-[10px] text-slate-400">Due: {inv.due_date}</span>}
                      {inv.created_date && <span className="text-[10px] text-slate-400">Issued: {format(new Date(inv.created_date), "dd MMM yyyy")}</span>}
                    </div>
                  </div>
                </div>
              </button>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800">R{(inv.total || inv.amount || 0).toFixed(2)}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ic.bg} ${ic.text}`}>{inv.status}</span>
                <button
                  onClick={() => downloadInvoice(inv)}
                  disabled={downloading === inv.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-white hover:bg-slate-700 transition-colors disabled:opacity-60">
                  <Download className="w-3.5 h-3.5" />
                  {downloading === inv.id ? "..." : "PDF"}
                </button>
                <button onClick={() => setExpanded(isExpanded ? null : inv.id)} className="text-slate-400 hover:text-slate-600">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Expanded: Payment History */}
            {isExpanded && (
              <div className="border-t border-slate-100 px-4 pb-4 pt-3 bg-slate-50">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Payment Details</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase">Subtotal</p>
                    <p className="text-sm font-semibold text-slate-800">R{(inv.amount || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase">Tax</p>
                    <p className="text-sm font-semibold text-slate-800">R{(inv.tax || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase">Total</p>
                    <p className="text-sm font-bold text-slate-800">R{(inv.total || inv.amount || 0).toFixed(2)}</p>
                  </div>
                </div>
                {inv.status === "paid" ? (
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-700">Payment Received</p>
                      <p className="text-xs text-emerald-600">
                        {inv.paid_date ? `Paid on ${format(new Date(inv.paid_date), "dd MMM yyyy")}` : "Payment date not recorded"}
                        {inv.payment_method ? ` via ${inv.payment_method.replace(/_/g, " ")}` : ""}
                      </p>
                    </div>
                  </div>
                ) : inv.status === "overdue" ? (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-red-700">Payment Overdue</p>
                      <p className="text-xs text-red-600">
                        {inv.due_date ? `Was due on ${inv.due_date}` : "Please contact support to arrange payment."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                    <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <p className="text-xs text-blue-700">
                      {inv.status === "draft" ? "Invoice not yet sent." : `Payment pending${inv.due_date ? ` — due ${inv.due_date}` : ""}.`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ActivityDashboard({ customer, invoices, tickets }) {
  const totalBilled = invoices.reduce((s, i) => s + (i.total || i.amount || 0), 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.total || i.amount || 0), 0);
  const outstanding = invoices.filter(i => ["sent", "overdue"].includes(i.status)).reduce((s, i) => s + (i.total || i.amount || 0), 0);
  const openTickets = tickets.filter(t => !["resolved", "closed"].includes(t.status)).length;

  // Build a combined timeline of recent events
  const events = [
    ...invoices.slice(0, 5).map(i => ({
      id: i.id,
      date: i.created_date,
      icon: <CreditCard className="w-3.5 h-3.5 text-blue-500" />,
      iconBg: "bg-blue-50 border-blue-100",
      title: `Invoice ${i.invoice_number || ""}`,
      desc: `R${(i.total || i.amount || 0).toFixed(2)} — ${i.status}`,
      badge: i.status === "paid" ? "text-emerald-600 bg-emerald-50" : i.status === "overdue" ? "text-red-600 bg-red-50" : "text-blue-600 bg-blue-50",
    })),
    ...tickets.slice(0, 5).map(t => ({
      id: t.id,
      date: t.created_date,
      icon: <HeadphonesIcon className="w-3.5 h-3.5 text-purple-500" />,
      iconBg: "bg-purple-50 border-purple-100",
      title: t.subject,
      desc: `${t.category} · ${t.priority} priority`,
      badge: t.status === "resolved" ? "text-emerald-600 bg-emerald-50" : "text-purple-600 bg-purple-50",
      status: t.status,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  const stats = [
    { label: "Total Billed", value: `R${totalBilled.toFixed(2)}`, icon: <TrendingUp className="w-4 h-4 text-blue-500" />, bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Total Paid", value: `R${totalPaid.toFixed(2)}`, icon: <CheckCircle className="w-4 h-4 text-emerald-500" />, bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Outstanding", value: `R${outstanding.toFixed(2)}`, icon: <AlertCircle className="w-4 h-4 text-orange-500" />, bg: "bg-orange-50", border: "border-orange-100" },
    { label: "Open Tickets", value: openTickets, icon: <Activity className="w-4 h-4 text-purple-500" />, bg: "bg-purple-50", border: "border-purple-100" },
  ];

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`${s.bg} ${s.border} border rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{s.label}</p>
              {s.icon}
            </div>
            <p className="text-lg font-bold text-slate-800">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity Timeline */}
      {events.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-slate-700 text-sm">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {events.map((e, idx) => (
              <div key={e.id + idx} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${e.iconBg}`}>
                  {e.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-medium text-slate-700 truncate">{e.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize flex-shrink-0 ${e.badge}`}>
                      {e.status || (e.desc.includes("paid") ? "paid" : e.desc.split("—")[1]?.trim())}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{e.desc}</p>
                  {e.date && (
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      {format(new Date(e.date), "dd MMM yyyy, HH:mm")}
                    </p>
                  )}
                </div>
                {idx < events.length - 1 && (
                  <div className="absolute left-[27px] top-7 w-px h-3 bg-slate-100" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NetworkUptimePanel({ node, customer }) {
  const cfg = NODE_STATUS_CFG[node?.status || "online"] || NODE_STATUS_CFG.online;
  const Icon = cfg.Icon;
  const uptime = node?.uptime_percent ?? null;
  const bw = node?.bandwidth_utilization ?? null;

  // Build fake 24-hour uptime bar (mostly up if online, some gaps if degraded)
  const bars = Array.from({ length: 48 }, (_, i) => {
    if (!node) return "ok";
    if (node.status === "offline") return i > 40 ? "down" : "ok";
    if (node.status === "degraded") return [10,11,22,23,35].includes(i) ? "warn" : "ok";
    if (node.status === "maintenance") return [30,31,32,33].includes(i) ? "maint" : "ok";
    return "ok";
  });

  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 2px 16px rgba(99,102,241,0.08)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            <Icon className="w-4 h-4" style={{ color: cfg.color }} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-800">Network Status</p>
            <p className="text-[10px] text-slate-400 mono">{node?.name || customer?.assigned_node || "Your connection"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.color }} />
          {cfg.label}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Uptime", value: uptime != null ? `${uptime.toFixed(1)}%` : "—", color: uptime >= 99 ? "#10b981" : uptime >= 95 ? "#f59e0b" : "#ef4444" },
          { label: "Bandwidth Used", value: bw != null ? `${bw}%` : "—", color: bw < 70 ? "#10b981" : bw < 90 ? "#f59e0b" : "#ef4444" },
          { label: "Node Type", value: node?.type?.replace(/_/g, " ") || "—", color: "#6366f1" },
          { label: "Location", value: node?.location || "—", color: "#64748b" },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-3 py-2.5" style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.08)" }}>
            <p className="text-[9px] mono uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
            <p className="text-[14px] font-black mono" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 24h uptime bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] text-slate-400 mono">Last 24h uptime</p>
          <p className="text-[10px] text-slate-400 mono">Now →</p>
        </div>
        <div className="flex gap-0.5">
          {bars.map((b, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm h-5"
              style={{
                background: b === "ok" ? "#10b981" : b === "warn" ? "#f59e0b" : b === "down" ? "#ef4444" : "#8b5cf6",
                opacity: b === "ok" ? 0.7 : 1
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-slate-300 mono">24h ago</span>
          <span className="text-[9px] text-slate-300 mono">Now</span>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon, valueClass = "text-slate-800" }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.08)" }}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
      </div>
      <p className={`text-sm font-semibold capitalize ${valueClass}`}>{value || "—"}</p>
    </div>
  );
}

function Empty({ icon, text }) {
  return (
    <div className="rounded-xl p-10 text-center" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(99,102,241,0.08)" }}>
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}