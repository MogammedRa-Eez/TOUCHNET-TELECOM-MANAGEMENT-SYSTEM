import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Image, Link, FileText, Type, Minus, Eye, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";

const SECTION_TYPES = [
  { type: "text", icon: Type, label: "Text Block" },
  { type: "image", icon: Image, label: "Image" },
  { type: "link", icon: Link, label: "Link / Button" },
  { type: "file", icon: FileText, label: "File Attachment" },
  { type: "divider", icon: Minus, label: "Divider" },
];

function uid() { return Math.random().toString(36).slice(2, 9); }

function calcTotals(items, discountPct, taxPct) {
  const subtotal = items.filter(i => !i.optional || i.included).reduce((s, i) => s + (i.quantity || 1) * (i.unit_price || 0), 0);
  const discountAmount = subtotal * ((discountPct || 0) / 100);
  const taxAmount = (subtotal - discountAmount) * ((taxPct || 0) / 100);
  return { subtotal, discountAmount, taxAmount, total: subtotal - discountAmount + taxAmount };
}

export default function QuoteBuilder({ quote, customers = [], onSave, onClose, onPreview }) {
  const [form, setForm] = useState(() => {
    const defaults = {
      quote_number: `QT-${Date.now().toString().slice(-6)}`,
      title: "", customer_name: "", customer_email: "", customer_phone: "",
      customer_company: "", customer_id: "", status: "draft", valid_until: "",
      cover_message: "", sections: [], line_items: [], discount_percent: 0,
      tax_percent: 15, notes: "", branding_color: "#6366f1",
      terms: "Payment is due within 30 days of acceptance. Prices are valid for the duration stated.",
    };
    return quote ? { ...defaults, ...quote } : defaults;
  });
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const selectCustomer = (id) => {
    const c = customers.find(c => c.id === id);
    if (c) setForm(f => ({ ...f, customer_id: c.id, customer_name: c.full_name, customer_email: c.email || "", customer_phone: c.phone || "", customer_company: "" }));
  };

  const addSection = (type) => set("sections", [...form.sections, { id: uid(), type, heading: "", content: "", url: "", label: "", image_url: "" }]);
  const updateSection = (id, changes) => set("sections", form.sections.map(s => s.id === id ? { ...s, ...changes } : s));
  const removeSection = (id) => set("sections", form.sections.filter(s => s.id !== id));

  const addItem = (optional = false) => set("line_items", [...form.line_items, { id: uid(), description: "", detail: "", quantity: 1, unit_price: 0, optional, included: true }]);
  const updateItem = (id, changes) => set("line_items", form.line_items.map(i => i.id === id ? { ...i, ...changes } : i));
  const removeItem = (id) => set("line_items", form.line_items.filter(i => i.id !== id));

  const totals = calcTotals(form.line_items, form.discount_percent, form.tax_percent);

  const handleImageUpload = async (sectionId, file) => {
    setUploadingId(sectionId);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updateSection(sectionId, { image_url: file_url });
    setUploadingId(null);
  };

  const handleSave = async (status = form.status) => {
    setSaving(true);
    await onSave({ ...form, ...totals, status });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
      <div className="flex flex-col w-full max-w-5xl mx-auto my-4 rounded-2xl overflow-hidden bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: `linear-gradient(135deg,${form.branding_color},#8b5cf6)`, color: "#fff" }}>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5" />
            <h2 className="text-lg font-bold">{quote ? "Edit Quote" : "New Quote"}</h2>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono">{form.quote_number}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 gap-1" onClick={() => onPreview({ ...form, ...totals })}>
              <Eye className="w-4 h-4" /> Preview
            </Button>
            <Button size="sm" className="bg-white text-indigo-600 hover:bg-indigo-50 gap-1 font-bold" onClick={() => handleSave("draft")} disabled={saving}>
              <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Draft"}
            </Button>
            <Button size="sm" className="bg-emerald-500 text-white hover:bg-emerald-600 gap-1 font-bold" onClick={() => handleSave("sent")} disabled={saving}>
              Send Quote
            </Button>
            <button onClick={onClose} className="ml-2 w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3">
          {/* LEFT */}
          <div className="lg:col-span-2 p-6 space-y-6 border-r overflow-y-auto">
            <FormSection title="Quote Details">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Quote Title *</label>
                  <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Fibre Connectivity Proposal – Greenpoint Office" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Valid Until</label>
                  <Input type="date" value={form.valid_until} onChange={e => set("valid_until", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Brand Colour</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.branding_color} onChange={e => set("branding_color", e.target.value)} className="w-10 h-9 rounded cursor-pointer border border-slate-200" />
                    <span className="text-xs text-slate-400 font-mono">{form.branding_color}</span>
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection title="Client Details">
              <div className="grid grid-cols-2 gap-3">
                {customers.length > 0 && (
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Select Existing Customer</label>
                    <select className="w-full h-9 rounded-md border border-input px-3 text-sm bg-white" value={form.customer_id} onChange={e => selectCustomer(e.target.value)}>
                      <option value="">— or enter manually below —</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}{c.email ? ` (${c.email})` : ""}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Contact Name *</label>
                  <Input value={form.customer_name} onChange={e => set("customer_name", e.target.value)} placeholder="John Smith" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Company</label>
                  <Input value={form.customer_company} onChange={e => set("customer_company", e.target.value)} placeholder="Acme Corp" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Email</label>
                  <Input type="email" value={form.customer_email} onChange={e => set("customer_email", e.target.value)} placeholder="john@acme.com" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Phone</label>
                  <Input value={form.customer_phone} onChange={e => set("customer_phone", e.target.value)} placeholder="+27 71 000 0000" />
                </div>
              </div>
            </FormSection>

            <FormSection title="Cover Message">
              <textarea className="w-full min-h-[80px] rounded-md border border-input px-3 py-2 text-sm" placeholder="Personalised intro shown at the top of the quote — thank the client, set context..." value={form.cover_message} onChange={e => set("cover_message", e.target.value)} />
            </FormSection>

            <FormSection title="Content Sections" action={
              <div className="flex flex-wrap gap-1">
                {SECTION_TYPES.map(({ type, icon: Icon, label }) => (
                  <button key={type} onClick={() => addSection(type)} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 transition-colors">
                    <Icon className="w-3 h-3 text-indigo-500" /> {label}
                  </button>
                ))}
              </div>
            }>
              {form.sections.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Add text blocks, images, links or files to enrich your proposal</p>}
              <div className="space-y-3">
                {form.sections.map(s => <SectionBlock key={s.id} section={s} onUpdate={updateSection} onRemove={removeSection} onImageUpload={handleImageUpload} uploading={uploadingId === s.id} />)}
              </div>
            </FormSection>

            <FormSection title="Pricing" action={
              <div className="flex gap-2">
                <button onClick={() => addItem(false)} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300">
                  <Plus className="w-3 h-3 text-indigo-500" /> Add Item
                </button>
                <button onClick={() => addItem(true)} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-amber-200 hover:bg-amber-50 text-amber-700">
                  <Plus className="w-3 h-3" /> Optional Item
                </button>
              </div>
            }>
              {form.line_items.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No line items yet</p>}
              <div className="space-y-2">
                {form.line_items.map(item => <LineItemRow key={item.id} item={item} onUpdate={updateItem} onRemove={removeItem} />)}
              </div>
              {form.line_items.length > 0 && (
                <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
                  <div className="flex justify-between text-slate-500"><span>Subtotal</span><span className="font-mono">R{totals.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between items-center gap-2 text-slate-500">
                    <span>Discount</span>
                    <div className="flex items-center gap-1">
                      <Input type="number" min="0" max="100" value={form.discount_percent} onChange={e => set("discount_percent", +e.target.value)} className="w-14 h-6 text-xs text-right" />
                      <span className="text-xs">% = -R{totals.discountAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center gap-2 text-slate-500">
                    <span>VAT</span>
                    <div className="flex items-center gap-1">
                      <Input type="number" min="0" max="100" value={form.tax_percent} onChange={e => set("tax_percent", +e.target.value)} className="w-14 h-6 text-xs text-right" />
                      <span className="text-xs">% = R{totals.taxAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800 text-base border-t pt-2 mt-2 font-mono">
                    <span>TOTAL</span><span>R{totals.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </FormSection>
          </div>

          {/* RIGHT */}
          <div className="p-6 space-y-6 bg-slate-50 overflow-y-auto">
            <FormSection title="Notes to Client">
              <textarea className="w-full min-h-[80px] rounded-md border border-input px-3 py-2 text-sm bg-white" placeholder="Any additional notes..." value={form.notes} onChange={e => set("notes", e.target.value)} />
            </FormSection>
            <FormSection title="Terms & Conditions">
              <textarea className="w-full min-h-[120px] rounded-md border border-input px-3 py-2 text-sm bg-white" value={form.terms} onChange={e => set("terms", e.target.value)} />
            </FormSection>
            <FormSection title="Quote Status">
              <select className="w-full h-9 rounded-md border border-input px-3 text-sm bg-white" value={form.status} onChange={e => set("status", e.target.value)}>
                {["draft","sent","viewed","accepted","declined","expired"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </FormSection>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, children, action }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function SectionBlock({ section, onUpdate, onRemove, onImageUpload, uploading }) {
  const colors = { text: "border-indigo-200 bg-indigo-50/50", image: "border-emerald-200 bg-emerald-50/50", link: "border-blue-200 bg-blue-50/50", file: "border-amber-200 bg-amber-50/50", divider: "border-slate-200 bg-slate-50" };
  const icons = { text: Type, image: Image, link: Link, file: FileText, divider: Minus };
  const Icon = icons[section.type] || Type;

  if (section.type === "divider") return (
    <div className={`rounded-lg border px-3 py-2 flex items-center justify-between ${colors.divider}`}>
      <div className="flex items-center gap-2 text-xs text-slate-400"><Minus className="w-3 h-3" /> Section Divider</div>
      <button onClick={() => onRemove(section.id)} className="text-slate-300 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
    </div>
  );

  return (
    <div className={`rounded-lg border p-3 space-y-2 ${colors[section.type] || colors.text}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><Icon className="w-3 h-3" /><span className="capitalize">{section.type}</span></div>
        <button onClick={() => onRemove(section.id)} className="text-slate-300 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
      </div>
      <Input placeholder="Heading (optional)" value={section.heading} onChange={e => onUpdate(section.id, { heading: e.target.value })} className="bg-white h-7 text-xs" />
      {section.type === "text" && <textarea className="w-full min-h-[60px] rounded-md border border-input px-3 py-2 text-xs bg-white" placeholder="Content..." value={section.content} onChange={e => onUpdate(section.id, { content: e.target.value })} />}
      {section.type === "image" && (
        <div className="space-y-2">
          {section.image_url && <img src={section.image_url} alt="" className="w-full max-h-32 object-cover rounded-md" />}
          <input type="file" accept="image/*" className="text-xs" onChange={e => e.target.files[0] && onImageUpload(section.id, e.target.files[0])} />
          {uploading && <p className="text-xs text-indigo-500">Uploading…</p>}
          <Input placeholder="Or paste image URL" value={section.image_url} onChange={e => onUpdate(section.id, { image_url: e.target.value })} className="bg-white h-7 text-xs" />
          <textarea className="w-full rounded-md border border-input px-3 py-1.5 text-xs bg-white" placeholder="Caption (optional)" value={section.content} onChange={e => onUpdate(section.id, { content: e.target.value })} rows={2} />
        </div>
      )}
      {(section.type === "link" || section.type === "file") && (
        <div className="space-y-1.5">
          <Input placeholder={section.type === "file" ? "File URL or paste link" : "https://..."} value={section.url} onChange={e => onUpdate(section.id, { url: e.target.value })} className="bg-white h-7 text-xs" />
          <Input placeholder="Button / link label" value={section.label} onChange={e => onUpdate(section.id, { label: e.target.value })} className="bg-white h-7 text-xs" />
          <textarea className="w-full rounded-md border border-input px-3 py-1.5 text-xs bg-white" placeholder="Description" value={section.content} onChange={e => onUpdate(section.id, { content: e.target.value })} rows={2} />
        </div>
      )}
    </div>
  );
}

function LineItemRow({ item, onUpdate, onRemove }) {
  return (
    <div className={`rounded-lg border p-3 space-y-2 ${item.optional ? "border-amber-200 bg-amber-50/50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center gap-2">
        {item.optional && <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">OPTIONAL</span>}
        {item.optional && (
          <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
            <input type="checkbox" checked={item.included} onChange={e => onUpdate(item.id, { included: e.target.checked })} className="rounded" />
            Include
          </label>
        )}
        <button onClick={() => onRemove(item.id)} className="ml-auto text-slate-300 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
      </div>
      <Input placeholder="Item description *" value={item.description} onChange={e => onUpdate(item.id, { description: e.target.value })} className="h-7 text-xs" />
      <Input placeholder="Detail / notes" value={item.detail} onChange={e => onUpdate(item.id, { detail: e.target.value })} className="h-7 text-xs" />
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-[10px] text-slate-400">Qty</label>
          <Input type="number" min="1" value={item.quantity} onChange={e => onUpdate(item.id, { quantity: +e.target.value })} className="h-7 text-xs" />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-slate-400">Unit Price (R)</label>
          <Input type="number" min="0" value={item.unit_price} onChange={e => onUpdate(item.id, { unit_price: +e.target.value })} className="h-7 text-xs" />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-slate-400">Line Total</label>
          <div className="h-7 flex items-center px-2 text-xs font-semibold text-slate-700 font-mono">R{((item.quantity || 1) * (item.unit_price || 0)).toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}