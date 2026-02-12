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
    setForm(prev => ({
      ...prev,
      customer_id: id,
      customer_name: cust?.full_name || "",
      amount: cust?.monthly_rate || prev.amount,
      total: (cust?.monthly_rate || prev.amount) + (prev.tax || 0),
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{invoice ? "Edit Invoice" : "New Invoice"}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-medium text-slate-600">Customer *</Label>
              <Select value={form.customer_id} onValueChange={handleCustomerChange}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name} — {c.account_number || c.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Amount ($)</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={e => handleAmountChange(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Tax ($)</Label>
              <Input type="number" step="0.01" value={form.tax} onChange={e => handleTaxChange(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Total ($)</Label>
              <Input type="number" value={form.total} readOnly className="bg-slate-50" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Status</Label>
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
              <Label className="text-xs font-medium text-slate-600">Due Date</Label>
              <Input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Payment Method</Label>
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
            <Label className="text-xs font-medium text-slate-600">Description</Label>
            <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{invoice ? "Update" : "Create Invoice"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}