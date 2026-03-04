import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Receipt, TicketCheck, Wifi, LogOut, AlertCircle,
  CheckCircle, Clock, XCircle, ArrowUpCircle, TrendingUp,
  Activity, CreditCard, HeadphonesIcon
} from "lucide-react";
import { format, parseISO } from "date-fns";

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

export default function CustomerPortal() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => base44.auth.redirectToLogin(window.location.pathname))
      .finally(() => setLoadingUser(false));
  }, []);

  // Match customer by email
  const { data: customers = [], isLoading: loadingCustomer } = useQuery({
    queryKey: ["portal-customer", user?.email],
    queryFn: () => base44.entities.Customer.filter({ email: user?.email }),
    enabled: !!user?.email,
  });

  const customer = customers[0] || null;

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 p-6">
        <img src={LOGO_URL} alt="Logo" className="h-12 object-contain mb-2" />
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-1">Account Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">
            No customer account is linked to <strong>{user?.email}</strong>. Please contact support.
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
    );
  }

  const sc = statusColor[customer.status] || statusColor.pending;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <img src={LOGO_URL} alt="Logo" className="h-9 object-contain" />
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-700">{customer.full_name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-100 hover:text-red-600 transition-colors border border-slate-200">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Account overview card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #dc2626, #1e2a4a)" }}>
                {customer.full_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{customer.full_name}</h1>
                <p className="text-sm text-slate-400">{customer.email}</p>
                {customer.account_number && (
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Acct# {customer.account_number}</p>
                )}
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${sc.bg} ${sc.text} ${sc.border}`}>
              {customer.status}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <InfoItem label="Service Plan" value={customer.service_plan?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} icon={<Wifi className="w-4 h-4 text-blue-500" />} />
            <InfoItem label="Connection" value={customer.connection_type || "—"} />
            <InfoItem label="Monthly Rate" value={`R${customer.monthly_rate?.toFixed(2) || "0.00"}`} />
            <InfoItem label="Balance" value={`R${(customer.balance || 0).toFixed(2)}`} valueClass={(customer.balance || 0) < 0 ? "text-red-600 font-bold" : "text-emerald-600 font-bold"} />
          </div>

          {customer.address && (
            <p className="mt-4 text-sm text-slate-500">📍 {customer.address}</p>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="invoices">
          <TabsList className="bg-white border border-slate-200 rounded-xl p-1">
            <TabsTrigger value="invoices" className="gap-1.5 data-[state=active]:bg-slate-800 data-[state=active]:text-white rounded-lg">
              <Receipt className="w-4 h-4" /> Invoices
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-1.5 data-[state=active]:bg-slate-800 data-[state=active]:text-white rounded-lg">
              <TicketCheck className="w-4 h-4" /> Support Tickets
            </TabsTrigger>
          </TabsList>

          {/* Invoices */}
          <TabsContent value="invoices" className="mt-4 space-y-3">
            {invoices.length === 0 ? (
              <Empty icon={<Receipt className="w-8 h-8 text-slate-300" />} text="No invoices found" />
            ) : invoices.map(inv => {
              const ic = invoiceStatusColor[inv.status] || invoiceStatusColor.draft;
              return (
                <div key={inv.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4 flex-wrap shadow-sm">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{inv.invoice_number || `Invoice`}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{inv.description || inv.billing_period_start ? `Period: ${inv.billing_period_start || ""} — ${inv.billing_period_end || ""}` : "—"}</p>
                    {inv.due_date && <p className="text-xs text-slate-400">Due: {inv.due_date}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800">R{(inv.total || inv.amount || 0).toFixed(2)}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ic.bg} ${ic.text}`}>{inv.status}</span>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Tickets */}
          <TabsContent value="tickets" className="mt-4 space-y-3">
            {tickets.length === 0 ? (
              <Empty icon={<TicketCheck className="w-8 h-8 text-slate-300" />} text="No support tickets found" />
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
    </div>
  );
}

function InfoItem({ label, value, icon, valueClass = "text-slate-800" }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
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
    <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}