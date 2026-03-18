import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, Receipt, DollarSign, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import InvoiceForm from "../components/billing/InvoiceForm";
import BatchInvoiceGenerator from "../components/billing/BatchInvoiceGenerator";
import KPICard from "../components/dashboard/KPICard";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";
import InvoicePDFModal from "@/components/billing/InvoicePDFModal";

const statusColors = {
  draft: { bg: "rgba(100,116,139,0.1)", color: "#64748b", border: "rgba(100,116,139,0.3)" },
  sent: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "rgba(59,130,246,0.3)" },
  paid: { bg: "rgba(16,185,129,0.1)", color: "#10b981", border: "rgba(16,185,129,0.3)" },
  overdue: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", border: "rgba(239,68,68,0.3)" },
  cancelled: { bg: "rgba(100,116,139,0.08)", color: "#475569", border: "rgba(100,116,139,0.2)" },
};

export default function Billing() {
  const { can, loading: rbacLoading, isAdmin } = useRBAC();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pdfInvoice, setPdfInvoice] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => base44.entities.Invoice.list("-created_date"),
    enabled: !rbacLoading && can("billing"),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list(),
    enabled: !rbacLoading && can("billing"),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Invoice.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["invoices"] }); setShowForm(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Invoice.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["invoices"] }); setShowForm(false); setEditing(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Invoice.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });

  if (!rbacLoading && !can("billing")) return <AccessDenied />;

  const handleSubmit = (data) => {
    if (editing) updateMut.mutate({ id: editing.id, data });
    else createMut.mutate(data);
  };

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((a, i) => a + (i.total || 0), 0);
  const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((a, i) => a + (i.total || 0), 0);
  const totalPending = invoices.filter(i => ["draft", "sent"].includes(i.status)).reduce((a, i) => a + (i.total || 0), 0);

  const filtered = invoices.filter(i => {
    const matchSearch = !search || i.customer_name?.toLowerCase().includes(search.toLowerCase()) || i.invoice_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#1e293b" }}>Billing & Invoices</h1>
          <p className="text-[11px] mt-0.5 mono" style={{ color: "rgba(100,116,139,0.55)" }}>Manage invoices and track payments</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditing(null); setShowForm(true); }} className="text-white text-sm" style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
            <Plus className="w-4 h-4 mr-2" /> Create Invoice
          </Button>
        )}
      </div>

      {isAdmin && <BatchInvoiceGenerator onInvoicesCreated={() => queryClient.invalidateQueries({ queryKey: ["invoices"] })} />}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Total Collected" value={`R${totalPaid.toLocaleString()}`} icon={CheckCircle2} color="emerald" />
        <KPICard title="Overdue" value={`R${totalOverdue.toLocaleString()}`} icon={AlertCircle} color="rose" />
        <KPICard title="Pending" value={`R${totalPending.toLocaleString()}`} icon={DollarSign} color="amber" />
      </div>

      <div className="rounded-xl p-4 flex flex-col sm:flex-row gap-3 bg-white" style={{ border: "1px solid rgba(99,102,241,0.1)" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search invoices..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid rgba(99,102,241,0.1)" }}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ background: "#f8f9ff", borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Invoice #</TableHead>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Customer</TableHead>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Amount</TableHead>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Status</TableHead>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Due Date</TableHead>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Payment</TableHead>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(inv => {
                  const sc = statusColors[inv.status] || statusColors.draft;
                  return (
                  <TableRow key={inv.id} className="transition-colors hover:bg-slate-50">
                    <TableCell className="text-[11px] font-mono text-indigo-600">{inv.invoice_number || "—"}</TableCell>
                    <TableCell className="font-medium text-[13px] text-slate-800">{inv.customer_name}</TableCell>
                    <TableCell className="font-semibold text-[13px] text-slate-800 font-mono">R{inv.total?.toFixed(2) || inv.amount?.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontFamily: "'JetBrains Mono', monospace" }}>{inv.status}</span>
                    </TableCell>
                    <TableCell className="text-[12px] text-slate-500">{inv.due_date ? format(new Date(inv.due_date), "MMM d, yyyy") : "—"}</TableCell>
                    <TableCell className="text-[12px] text-slate-500 capitalize">{inv.payment_method?.replace(/_/g, " ") || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPdfInvoice(inv)} title="Email / Generate PDF">
                          <FileText className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />
                        </Button>
                        {isAdmin && (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-slate-800" onClick={() => { setEditing(inv); setShowForm(true); }}>
                              <Pencil className="w-3.5 h-3.5 text-slate-500" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-900/20" onClick={() => { if (confirm("Delete this invoice?")) deleteMut.mutate(inv.id); }}>
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )})
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pdfInvoice && (
        <InvoicePDFModal
          invoice={pdfInvoice}
          customer={customers.find(c => c.id === pdfInvoice.customer_id)}
          onClose={() => setPdfInvoice(null)}
        />
      )}

      {showForm && (
        <InvoiceForm
          invoice={editing}
          customers={customers}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}