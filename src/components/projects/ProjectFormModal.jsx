import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export default function ProjectFormModal({ onClose, onSave, saving }) {
  const [form, setForm] = useState({
    quote_number: "",
    project_name: "",
    customer_name: "",
    customer_email: "",
    site_address: "",
    service_plan: "",
    annuity_amount: "",
    once_off_amount: "",
    forecasted_go_live_date: "",
    status: "lead",
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      annuity_amount: parseFloat(form.annuity_amount) || 0,
      once_off_amount: parseFloat(form.once_off_amount) || 0,
      current_task_index: 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.2)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
          <h2 className="font-bold text-slate-800">New Fibre Project</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Quote Number *</label>
              <Input required value={form.quote_number} onChange={e => set("quote_number", e.target.value)} placeholder="QT-2024-001" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Project Name *</label>
              <Input required value={form.project_name} onChange={e => set("project_name", e.target.value)} placeholder="Project name" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Customer Name *</label>
              <Input required value={form.customer_name} onChange={e => set("customer_name", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Customer Email</label>
              <Input type="email" value={form.customer_email} onChange={e => set("customer_email", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Site Address</label>
            <Input value={form.site_address} onChange={e => set("site_address", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Service Plan</label>
              <Input value={form.service_plan} onChange={e => set("service_plan", e.target.value)} placeholder="e.g. 100Mbps Fibre" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Status</label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["lead","quoted","approved","in_progress"].map(s => (
                    <SelectItem key={s} value={s}>{s.replace("_"," ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Annuity Amount (R/mo)</label>
              <Input type="number" value={form.annuity_amount} onChange={e => set("annuity_amount", e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Once-Off Amount (R)</label>
              <Input type="number" value={form.once_off_amount} onChange={e => set("once_off_amount", e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Forecasted Go-Live Date</label>
            <Input type="date" value={form.forecasted_go_live_date} onChange={e => set("forecasted_go_live_date", e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff" }}>
              {saving ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}