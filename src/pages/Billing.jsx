import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, Receipt, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import InvoiceForm from "../components/billing/InvoiceForm";
import KPICard from "../components/dashboard/KPICard";

const statusColors = {
  draft: { bg: "rgba(100,116,139,0.1)", color: "#64748b", border: "rgba(100,116,139,0.3)" },
  sent: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "rgba(59,130,246,0.3)" },
  paid: { bg: "rgba(16,185,129,0.1)", color: "#10b981", border: "rgba(16,185,129,0.3)" },
  overdue: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", border: "rgba(239,68,68,0.3)" },
  cancelled: { bg: "rgba(100,116,139,0.08)", color: "#475569", border: "rgba(100,116,139,0.2)" },
};

export default function Billing() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => base44.entities.Invoice.list("-created_date"),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list(),
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
          <h1 className="text-2xl font-bold text-slate-800">Billing & Invoices</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage invoices and track payments</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200">
          <Plus className="w-4 h-4 mr-2" /> Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Total Collected" value={`$${totalPaid.toLocaleString()}`} icon={CheckCircle2} color="emerald" />
        <KPICard title="Overdue" value={`$${totalOverdue.toLocaleString()}`} icon={AlertCircle} color="rose" />
        <KPICard title="Pending" value={`$${totalPending.toLocaleString()}`} icon={DollarSign} color="amber" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
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

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-100">
                <TableHead className="font-semibold">Invoice #</TableHead>
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Due Date</TableHead>
                <TableHead className="font-semibold">Payment</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>)
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(inv => (
                  <TableRow key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-mono text-sm">{inv.invoice_number || "—"}</TableCell>
                    <TableCell className="font-medium">{inv.customer_name}</TableCell>
                    <TableCell className="font-semibold">${inv.total?.toFixed(2) || inv.amount?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusColors[inv.status]} text-xs`}>{inv.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{inv.due_date ? format(new Date(inv.due_date), "MMM d, yyyy") : "—"}</TableCell>
                    <TableCell className="text-sm capitalize">{inv.payment_method?.replace(/_/g, " ") || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(inv); setShowForm(true); }}>
                          <Pencil className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { if (confirm("Delete this invoice?")) deleteMut.mutate(inv.id); }}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

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