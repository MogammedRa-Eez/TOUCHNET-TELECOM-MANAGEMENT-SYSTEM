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

const DEFAULT_SECTIONS = [
  {
    id: "exec_summary",
    type: "text",
    heading: "EXECUTIVE SUMMARY",
    content: "TouchNet, a dynamic and agile Internet Service Provider, has been delivering exceptional ISP and ICT services for over a decade. Over the years, our dedicated team has adapted and innovated, establishing a strong foundation built on cutting-edge technology. We take pride in our collaborations with numerous business partners, which enhance our service offerings and broaden our geographical reach. Our footprint spans across South Africa and extends beyond its borders, ensuring we meet the diverse needs of our clients effectively.",
  },
  {
    id: "contract_24",
    type: "text",
    heading: "24 MONTH CONTRACT",
    content: "Client could be held liable for penalty fees should this contract be cancelled before the 24 month contract lapses.",
  },
  {
    id: "confidentiality",
    type: "text",
    heading: "CONFIDENTIALITY",
    content: "The recipient of the information as per this document agrees to receive the information in confidence and to keep the information confidential, using the same degree of care as is used by the recipient to protect its own confidential information but in no event less than a reasonable degree of care.",
  },
];

const DEFAULT_TERMS = `All pricing excludes VAT.
Installation and once-off fees invoiced on acceptance of quote - payable within 7 days of receipt of invoice
This quotation is valid for 2 weeks. Quote is subject to final feasibility and pricing may be adjusted once final details are known.
Services are provided on a 24-month contract basis unless stated otherwise.
Monthly services are charged for a month in advance.
Once off installation fees cover the Touchnet Service setup and config fee, any additional on-site support for any 3rd party system will be charged at hourly rate call out rate.
TouchNet may charge any additional onsite technical support / resource fees on market related cost.
TouchNet may charge courier fees if applicable.
TouchNet shall not be liable in any way for any 3rd party management fees.
Payments for 'ad hoc' or 'once off' services are due 7 days from date of invoice.
The implementation time frames are technology dependent. The project team will advise of time frames once these are available.
Installation times are only estimated, TouchNet will not be held liable in any way for delays in installation.
90 Days' notice of cancellation from last day of the month.
In the event of early cancellation, the client may be held liable for penalties.
The recipient of the information as per this document agrees to receive the information in confidence.
TouchNet shall not be liable in any way for any consequential damages or theft, whether foreseeable or not.
By accepting this quotation, you hereby agree to the terms and condition laid out on the M.S.A.`;

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
      title: "",
      salesperson_name: "",
      customer_name: "", customer_email: "", customer_phone: "",
      customer_company: "", customer_id: "",
      status: "draft",
      valid_until: "",
      contract_months: 24,
      cover_message: "Thank you for the opportunity to afford you a quotation.",
      sections: DEFAULT_SECTIONS.map(s => ({ ...s, id: uid() })),
      line_items: [],
      discount_percent: 0,
      tax_percent: 0,
      notes: "",
      terms: DEFAULT_TERMS,
      branding_color: "#e11d48",
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
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: "linear-gradient(135deg,#e11d48,#9f1239)", color: "#fff" }}>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5" />
            <h2 className="text-lg font-bold">{quote ? "Edit Quote" : "New Quote"}</h2>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono">{form.quote_number}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 gap-1" onClick={() => onPreview({ ...form, ...totals })}>
              <Eye className="w-4 h-4" /> Preview
            </Button>
            <Button size="sm" className="bg-white text-rose-600 hover:bg-rose-50 gap-1 font-bold" onClick={() => handleSave("draft")} disabled={saving}>
              <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Draft"}
            </Button>
            <Button size="sm" className="bg-emerald-500 text-white hover:bg-emerald-600 gap-1 font-bold" onClick={() => handleSave("sent")} disabled={saving}>
              Send Quote
            </Button>
            <button onClick={onClose} className="ml-2 w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30">
              <X className="w-4 h-4" />
            </button>
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
                  <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. TouchNet Quotation: Fibre Business 100 Mbps" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Salesperson Name</label>
                  <Input value={form.salesperson_name} onChange={e => set("salesperson_name", e.target.value)} placeholder="e.g. Prasheel Thakor" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Valid Until</label>
                  <Input type="date" value={form.valid_until} onChange={e => set("valid_until", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Contract Duration (months)</label>
                  <Input type="number" min="1" value={form.contract_months} onChange={e => set("contract_months", +e.target.value)} placeholder="24" />
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

            <FormSection title="Opening Message">
              <textarea className="w-full min-h-[60px] rounded-md border border-input px-3 py-2 text-sm" value={form.cover_message} onChange={e => set("cover_message", e.target.value)} />
            </FormSection>

            <FormSection title="Line Items" action={
              <div className="flex gap-2">
                <button onClick={() => addItem(false)} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-slate-200 hover:bg-rose-50 hover:border-rose-300">
                  <Plus className="w-3 h-3 text-rose-500" /> Add Item
                </button>
                <button onClick={() => addItem(true)} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-amber-200 hover:bg-amber-50 text-amber-700">
                  <Plus className="w-3 h-3" /> Optional Item
                </button>
              </div>
            }>
              {form.line_items.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No line items yet — add service items above</p>}
              <div className="space-y-2">
                {form.line_items.map(item => <LineItemRow key={item.id} item={item} onUpdate={updateItem} onRemove={removeItem} contractMonths={form.contract_months} />)}
              </div>
              {form.line_items.length > 0 && (
                <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
                  <div className="flex justify-between text-slate-500"><span>Subtotal excl. VAT</span><span className="font-mono">R{totals.subtotal.toFixed(2)}</span></div>
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

            <FormSection title="Content Sections" action={
              <div className="flex flex-wrap gap-1">
                {SECTION_TYPES.map(({ type, icon: Icon, label }) => (
                  <button key={type} onClick={() => addSection(type)} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-slate-200 hover:bg-rose-50 hover:border-rose-300 transition-colors">
                    <Icon className="w-3 h-3 text-rose-500" /> {label}
                  </button>
                ))}
              </div>
            }>
              <div className="space-y-3">
                {form.sections.map(s => <SectionBlock key={s.id} section={s} onUpdate={updateSection} onRemove={removeSection} onImageUpload={handleImageUpload} uploading={uploadingId === s.id} />)}
              </div>
            </FormSection>
          </div>

          {/* RIGHT */}
          <div className="p-6 space-y-6 bg-slate-50 overflow-y-auto">
            <FormSection title="Quote Status">
              <select className="w-full h-9 rounded-md border border-input px-3 text-sm bg-white" value={form.status} onChange={e => set("status", e.target.value)}>
                {["draft","sent","viewed","accepted","declined","expired"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </FormSection>
            <FormSection title="Notes to Client">
              <textarea className="w-full min-h-[80px] rounded-md border border-input px-3 py-2 text-sm bg-white" placeholder="e.g. Thank you for the opportunity..." value={form.notes} onChange={e => set("notes", e.target.value)} />
            </FormSection>
            <FormSection title="Terms & Conditions">
              <textarea className="w-full min-h-[200px] rounded-md border border-input px-3 py-2 text-sm bg-white" value={form.terms} onChange={e => set("terms", e.target.value)} />
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
  const colors = { text: "border-rose-200 bg-rose-50/50", image: "border-emerald-200 bg-emerald-50/50", link: "border-blue-200 bg-blue-50/50", file: "border-amber-200 bg-amber-50/50", divider: "border-slate-200 bg-slate-50" };
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
      {section.type === "text" && <textarea className="w-full min-h-[80px] rounded-md border border-input px-3 py-2 text-xs bg-white" placeholder="Content..." value={section.content} onChange={e => onUpdate(section.id, { content: e.target.value })} />}
      {section.type === "image" && (
        <div className="space-y-2">
          {section.image_url && <img src={section.image_url} alt="" className="w-full max-h-32 object-cover rounded-md" />}
          <input type="file" accept="image/*" className="text-xs" onChange={e => e.target.files[0] && onImageUpload(section.id, e.target.files[0])} />
          {uploading && <p className="text-xs text-rose-500">Uploading…</p>}
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

const FLAT_RATE_PRESETS = [
  { group: "Monthly Data Plans", items: [
    { label: "Basic 50Mbps",  price: 40  },
    { label: "Fast 200Mbps", price: 60  },
    { label: "Giga 1Gbps",   price: 80  },
    { label: "Ultra 2Gbps",  price: 110 },
    { label: "Static IP",    price: 15  },
  ]},
  { group: "ISP Hardware", items: [
    { label: "WiFi 6 Router",   price: 120 },
    { label: "Mesh Node",       price: 100 },
    { label: "Cable Modem",     price: 130 },
    { label: "Network Switch",  price: 110 },
    { label: "Fiber ONT",       price: 140 },
    { label: "Smart Hub",       price: 110 },
    { label: "Power Unit",      price: 150 },
  ]},
  { group: "Service Fees", items: [
    { label: "Setup Fee",  price: 60 },
    { label: "Truck Roll", price: 75 },
    { label: "Tech Visit", price: 45 },
  ]},
];

function LineItemRow({ item, onUpdate, onRemove, contractMonths }) {
  const lineTotal = (item.quantity || 1) * (item.unit_price || 0);

  const handlePreset = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [label, price] = val.split("||");
    onUpdate(item.id, { description: label, unit_price: +price });
    e.target.value = "";
  };

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
        {/* Flat-rate preset picker */}
        <select
          onChange={handlePreset}
          defaultValue=""
          className="ml-auto text-[11px] h-6 rounded border border-slate-200 bg-slate-50 text-slate-600 px-1 cursor-pointer hover:border-rose-300 focus:outline-none"
        >
          <option value="" disabled>⚡ ISP Rate Card</option>
          {FLAT_RATE_PRESETS.map(group => (
            <optgroup key={group.group} label={group.group}>
              {group.items.map(preset => (
                <option key={preset.label} value={`${preset.label}||${preset.price}`}>
                  {preset.label} — R{preset.price}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
      </div>
      <Input placeholder="Item description *" value={item.description} onChange={e => onUpdate(item.id, { description: e.target.value })} className="h-7 text-xs" />
      <Input placeholder="Detail / notes (e.g. *Equipment remains owned by TouchNet)" value={item.detail} onChange={e => onUpdate(item.id, { detail: e.target.value })} className="h-7 text-xs" />
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-[10px] text-slate-400">Qty</label>
          <Input type="number" min="1" value={item.quantity} onChange={e => onUpdate(item.id, { quantity: +e.target.value })} className="h-7 text-xs" />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-slate-400">Monthly Price (R)</label>
          <Input type="number" min="0" value={item.unit_price} onChange={e => onUpdate(item.id, { unit_price: +e.target.value })} className="h-7 text-xs" />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-slate-400">per month × {contractMonths}mo</label>
          <div className="h-7 flex items-center px-2 text-xs font-semibold text-slate-700 font-mono">R{lineTotal.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}