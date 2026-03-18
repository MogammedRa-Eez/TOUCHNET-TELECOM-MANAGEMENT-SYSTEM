import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Trash2 } from "lucide-react";

const ENTITIES = ["Customer", "Ticket", "Invoice", "FibreProject"];
const EVENT_TYPES = ["any", "create", "update"];
const NOTIF_TYPES = ["info", "warning", "error", "success"];
const CATEGORIES = ["system", "billing", "ticket", "customer", "network"];

const FIELD_SUGGESTIONS = {
  Customer:     ["status", "service_plan", "balance"],
  Ticket:       ["status", "priority", "category", "assigned_to"],
  Invoice:      ["status", "payment_method"],
  FibreProject: ["status", "assigned_engineer"],
};

const VALUE_SUGGESTIONS = {
  status: ["active", "suspended", "terminated", "pending", "open", "in_progress", "resolved", "closed", "paid", "overdue", "sent", "draft", "live", "cancelled"],
  priority: ["low", "medium", "high", "critical"],
};

export default function NotificationRuleForm({ rule, onSave, onClose }) {
  const [form, setForm] = useState(() => ({
    name: "",
    entity_name: "Ticket",
    event_type: "update",
    field_name: "",
    field_value: "",
    notify_emails: [],
    send_email: false,
    send_in_app: true,
    notification_type: "info",
    category: "system",
    message_template: "",
    is_active: true,
    ...(rule || {}),
  }));
  const [newEmail, setNewEmail] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addEmail = () => {
    const e = newEmail.trim().toLowerCase();
    if (e && !form.notify_emails.includes(e)) {
      set("notify_emails", [...form.notify_emails, e]);
    }
    setNewEmail("");
  };

  const removeEmail = (e) => set("notify_emails", form.notify_emails.filter(x => x !== e));

  const handleSubmit = (ev) => {
    ev.preventDefault();
    onSave(form);
  };

  const fieldSuggestions = FIELD_SUGGESTIONS[form.entity_name] || [];
  const valueSuggestions = VALUE_SUGGESTIONS[form.field_name] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <h2 className="text-base font-bold text-slate-800">{rule ? "Edit Rule" : "New Notification Rule"}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Rule Name *</label>
            <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Invoice Overdue Alert" required />
          </div>

          {/* Entity + Event */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Entity *</label>
              <select className="w-full h-9 rounded-md border border-input px-3 text-sm" value={form.entity_name} onChange={e => set("entity_name", e.target.value)}>
                {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Event Type</label>
              <select className="w-full h-9 rounded-md border border-input px-3 text-sm" value={form.event_type} onChange={e => set("event_type", e.target.value)}>
                {EVENT_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          {/* Field condition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Watch Field <span className="font-normal text-slate-400">(optional)</span></label>
              <select className="w-full h-9 rounded-md border border-input px-3 text-sm" value={form.field_name} onChange={e => set("field_name", e.target.value)}>
                <option value="">— any change —</option>
                {fieldSuggestions.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">When Value Equals <span className="font-normal text-slate-400">(optional)</span></label>
              {valueSuggestions.length > 0 ? (
                <select className="w-full h-9 rounded-md border border-input px-3 text-sm" value={form.field_value} onChange={e => set("field_value", e.target.value)}>
                  <option value="">— any value —</option>
                  {valueSuggestions.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              ) : (
                <Input value={form.field_value} onChange={e => set("field_value", e.target.value)} placeholder="e.g. overdue" />
              )}
            </div>
          </div>

          {/* Notification appearance */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Alert Type</label>
              <select className="w-full h-9 rounded-md border border-input px-3 text-sm" value={form.notification_type} onChange={e => set("notification_type", e.target.value)}>
                {NOTIF_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Category</label>
              <select className="w-full h-9 rounded-md border border-input px-3 text-sm" value={form.category} onChange={e => set("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Message template */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Message Template <span className="font-normal text-slate-400">(use {"{name}"}, {"{status}"}, {"{entity}"})</span></label>
            <Input value={form.message_template} onChange={e => set("message_template", e.target.value)} placeholder="Leave blank for auto-generated message" />
          </div>

          {/* Delivery */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Delivery</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">In-App Notification</span>
              <Switch checked={!!form.send_in_app} onCheckedChange={v => set("send_in_app", v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Email Notification</span>
              <Switch checked={!!form.send_email} onCheckedChange={v => set("send_email", v)} />
            </div>
          </div>

          {/* Recipient emails */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Recipient Emails</label>
            <div className="flex gap-2">
              <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addEmail())} placeholder="user@example.com" type="email" />
              <Button type="button" size="sm" variant="outline" onClick={addEmail}><Plus className="w-4 h-4" /></Button>
            </div>
            {form.notify_emails.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.notify_emails.map(email => (
                  <span key={email} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs px-2.5 py-0.5">
                    {email}
                    <button type="button" onClick={() => removeEmail(email)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-semibold text-slate-700">Rule Active</span>
            <Switch checked={!!form.is_active} onCheckedChange={v => set("is_active", v)} />
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t flex-shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSubmit}>
            {rule ? "Save Changes" : "Create Rule"}
          </Button>
        </div>
      </div>
    </div>
  );
}