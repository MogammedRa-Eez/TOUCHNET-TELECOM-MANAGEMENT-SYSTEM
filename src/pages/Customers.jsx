import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, User, Wifi, Send } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import CustomerForm from "../components/customers/CustomerForm";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";

const statusColors = {
  active: { bg: "rgba(16,185,129,0.1)", color: "#10b981", border: "rgba(16,185,129,0.3)" },
  pending: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "rgba(245,158,11,0.3)" },
  suspended: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", border: "rgba(239,68,68,0.3)" },
  terminated: { bg: "rgba(100,116,139,0.1)", color: "#64748b", border: "rgba(100,116,139,0.3)" },
};

export default function Customers() {
  const { can, loading: rbacLoading } = useRBAC();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  if (!rbacLoading && !can("customers")) return <AccessDenied />;

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list("-created_date"),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["customers"] }); setShowForm(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["customers"] }); setShowForm(false); setEditing(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Customer.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });

  const handleSubmit = (data) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, data });
    } else {
      createMut.mutate(data);
    }
  };

  const filtered = customers.filter(c => {
    const matchSearch = !search || c.full_name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()) || c.account_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Customer Management</h1>
          <p className="text-[11px] mt-0.5" style={{ color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>Manage subscriber accounts and service plans</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Customer
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4 flex flex-col sm:flex-row gap-3" style={{ background: "#0d1527", border: "1px solid rgba(6,182,212,0.12)" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input placeholder="Search customers..." className="pl-10 bg-transparent border-slate-700 text-slate-200 placeholder-slate-600" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-transparent border-slate-700 text-slate-300"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="bg-[#0d1527] border-slate-700 text-slate-200">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: "#0d1527", border: "1px solid rgba(6,182,212,0.12)" }}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ background: "#080f1e", borderBottom: "1px solid rgba(6,182,212,0.1)" }}>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Customer</TableHead>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Account #</TableHead>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Plan</TableHead>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Connection</TableHead>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Status</TableHead>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Rate</TableHead>
                <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} style={{ borderBottom: "1px solid rgba(6,182,212,0.06)" }}><TableCell colSpan={7}><Skeleton className="h-8 w-full bg-slate-800" /></TableCell></TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    <User className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(c => {
                  const sc = statusColors[c.status] || statusColors.pending;
                  return (
                  <TableRow key={c.id} style={{ borderBottom: "1px solid rgba(6,182,212,0.06)" }} className="hover:bg-cyan-500/5 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-200 text-[13px]">{c.full_name}</p>
                        <p className="text-[11px] text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{c.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-[11px] text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{c.account_number || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5 text-cyan-500" />
                        <span className="text-[12px] text-slate-300">{c.service_plan?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[12px] text-slate-400 capitalize">{c.connection_type || "—"}</TableCell>
                    <TableCell>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontFamily: "'JetBrains Mono', monospace" }}>
                        {c.status}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-[13px] text-slate-200" style={{ fontFamily: "'JetBrains Mono', monospace" }}>R{c.monthly_rate?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-slate-800" onClick={() => { setEditing(c); setShowForm(true); }}>
                          <Pencil className="w-3.5 h-3.5 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-900/20" onClick={() => { if (confirm("Delete this customer?")) deleteMut.mutate(c.id); }}>
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )})
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {showForm && (
        <CustomerForm
          customer={editing}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}