import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

export default function InvoiceForm({ invoice, customers, onSubmit, onCancel }) {
  const [form, setForm] = useState(invoice || {
    customer_id: "", customer_name: "", amount: 0, tax: 0, total: 0,
    status: "draft", due_date: "", payment_method: "bank_transfer",
    billing_period_start: "", billing_period_end: "", description: "",
  });

  const handleCustomerChange = (id) => {
    const cust = customers.find(c => c.id === id);
    const seq = String(Date.now()).slice(-4);
    const prefix = cust?.account_number || "INV";
    const invoiceNum = form.invoice_number || `${prefix}-${seq}`;
    setForm(prev => ({
      ...prev,
      customer_id: id,
      customer_name: cust?.full_name || "",
      amount: cust?.monthly_rate || prev.amount,
      total: (cust?.monthly_rate || prev.amount) + (prev.tax || 0),
      invoice_number: invoiceNum,
    }));
  };

  const handleAmountChange = (amount) => {
    const amt = parseFloat(amount) || 0;
    setForm(prev => ({ ...prev, amount: amt, total: amt + (prev.tax || 0) }));
  };

  const handleTaxChange = (tax) => {
    const t = parseFloat(tax) || 0;
    setForm(prev => ({ ...prev, tax: t, total: (prev.amount || 0) + t }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const invNum = form.invoice_number || `INV-${Date.now().toString(36).toUpperCase()}`;
    onSubmit({ ...form, invoice_number: invNum });
  };

  // Show the auto-generated invoice number preview
  const invoiceNumPreview = form.invoice_number || (form.customer_id ? `${customers.find(c=>c.id===form.customer_id)?.account_number || "INV"}-XXXX` : "—");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(4,3,15,0.85)", backdropFilter: "blur(12px)" }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: "linear-gradient(175deg,#0d0a20 0%,#090618 100%)", border: "1px solid rgba(139,92,246,0.28)", boxShadow: "0 32px 80px rgba(139,92,246,0.25)" }}>
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4,transparent)" }} />
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(139,92,246,0.14)" }}>
          <h2 className="text-[16px] font-black" style={{ color: "#e8d5ff" }}>{invoice ? "Edit Invoice" : "New Invoice"}</h2>
          <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ border: "1px solid rgba(255,255,255,0.1)" }}><X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(196,181,253,0.55)" }}>Customer *</Label>
              <Select value={form.customer_id} onValueChange={handleCustomerChange}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name} — {c.account_number || c.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(196,181,253,0.55)" }}>Invoice Number</Label>
              <Input
                value={form.invoice_number || invoiceNumPreview}
                onChange={e => setForm({...form, invoice_number: e.target.value})}
                placeholder="Auto-generated from account number"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(196,181,253,0.55)" }}>Amount (R)</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={e => handleAmountChange(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(196,181,253,0.55)" }}>Tax (R)</Label>
              <Input type="number" step="0.01" value={form.tax} onChange={e => handleTaxChange(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(196,181,253,0.55)" }}>Total (R)</Label>
              <Input type="number" value={form.total} readOnly style={{ background: "rgba(139,92,246,0.05)", opacity: 0.7 }} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(196,181,253,0.55)" }}>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(196,181,253,0.55)" }}>Due Date</Label>
              <Input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(196,181,253,0.55)" }}>Payment Method</Label>
              <Select value={form.payment_method} onValueChange={v => setForm({...form, payment_method: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(196,181,253,0.55)" }}>Description</Label>
            <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-105" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}>Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>{invoice ? "Update Invoice" : "Create Invoice"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}