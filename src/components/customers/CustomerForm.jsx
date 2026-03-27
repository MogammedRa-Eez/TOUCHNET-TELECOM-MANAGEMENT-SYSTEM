import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { toTitleCase } from "@/utils/nameUtils";

const plans = [
  { value: "basic_10mbps", label: "Basic — 10 Mbps", rate: 29.99 },
  { value: "standard_50mbps", label: "Standard — 50 Mbps", rate: 49.99 },
  { value: "premium_100mbps", label: "Premium — 100 Mbps", rate: 79.99 },
  { value: "enterprise_500mbps", label: "Enterprise — 500 Mbps", rate: 199.99 },
  { value: "dedicated_1gbps", label: "Dedicated — 1 Gbps", rate: 499.99 },
];

export default function CustomerForm({ customer, onSubmit, onCancel }) {
  const [form, setForm] = useState(customer || {
    full_name: "", email: "", phone: "", address: "",
    service_plan: "basic_10mbps", connection_type: "fiber",
    status: "pending", monthly_rate: 29.99, notes: "",
  });

  const handlePlanChange = (val) => {
    const plan = plans.find(p => p.value === val);
    setForm({ ...form, service_plan: val, monthly_rate: plan?.rate || form.monthly_rate });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const acctNum = form.account_number || `TN-${Date.now().toString(36).toUpperCase()}`;
    onSubmit({ ...form, account_number: acctNum });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{customer ? "Edit Customer" : "New Customer"}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Full Name *</Label>
              <Input value={form.full_name} onChange={e => setForm({...form, full_name: toTitleCase(e.target.value)})} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Email *</Label>
              <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Phone</Label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Address</Label>
              <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Service Plan *</Label>
              <Select value={form.service_plan} onValueChange={handlePlanChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {plans.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Connection Type</Label>
              <Select value={form.connection_type} onValueChange={v => setForm({...form, connection_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fiber">Fiber</SelectItem>
                  <SelectItem value="wireless">Wireless</SelectItem>
                  <SelectItem value="dsl">DSL</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Monthly Rate ($)</Label>
              <Input type="number" step="0.01" value={form.monthly_rate} onChange={e => setForm({...form, monthly_rate: parseFloat(e.target.value)})} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{customer ? "Update" : "Create Customer"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}