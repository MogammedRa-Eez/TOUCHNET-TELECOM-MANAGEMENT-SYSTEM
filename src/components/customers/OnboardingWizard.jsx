import React, { useState } from "react";
import { X, Check, User, Wifi, MapPin, Mail, Loader2, ChevronRight, ChevronLeft, Receipt, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addMonths, format } from "date-fns";

const STEPS = [
  { id: 1, label: "Client Details",    icon: User },
  { id: 2, label: "Service Plan",      icon: Wifi },
  { id: 3, label: "Installation Site", icon: MapPin },
  { id: 4, label: "Invoice Setup",     icon: Receipt },
  { id: 5, label: "Network Profile",   icon: Activity },
  { id: 6, label: "Welcome Email",     icon: Mail },
];

const SERVICE_PLANS = [
  { value: "basic_10mbps",       label: "Basic 10 Mbps",       price: 299  },
  { value: "standard_50mbps",    label: "Standard 50 Mbps",    price: 599  },
  { value: "premium_100mbps",    label: "Premium 100 Mbps",    price: 999  },
  { value: "enterprise_500mbps", label: "Enterprise 500 Mbps", price: 2499 },
  { value: "dedicated_1gbps",    label: "Dedicated 1 Gbps",    price: 4999 },
];

const CONNECTION_TYPES = ["fiber", "wireless", "dsl", "satellite"];
const CONTRACT_OPTIONS = [12, 24, 36];

const NODE_TYPES = [
  { value: "access_point",        label: "Access Point" },
  { value: "olt",                 label: "OLT (Optical)" },
  { value: "bts",                 label: "BTS (Wireless)" },
  { value: "distribution_switch", label: "Distribution Switch" },
];

const MONITORING_PRESETS = [
  { value: "standard",    label: "Standard Monitoring",    desc: "Ping every 5 min, bandwidth alerts at 80%",  uptime: 99, bw_threshold: 80 },
  { value: "high",        label: "High-Availability",      desc: "Ping every 1 min, critical alerts on drop",  uptime: 99.9, bw_threshold: 70 },
  { value: "enterprise",  label: "Enterprise SLA",         desc: "Continuous monitoring, 24/7 on-call alert",  uptime: 99.99, bw_threshold: 60 },
];

const EMPTY = {
  // Step 1
  full_name: "", email: "", phone: "", company: "",
  // Step 2
  service_plan: "", connection_type: "fiber", monthly_rate: "", contract_months: 24,
  // Step 3
  address: "", assigned_node: "", installation_notes: "",
  // Step 4 — Invoice
  invoice_due_days: 30, invoice_description: "", create_invoice: true,
  // Step 5 — Network node
  create_node: true, node_name: "", node_type: "access_point", node_location: "", monitoring_preset: "standard",
};

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 overflow-x-auto pb-1">
      {STEPS.map((step, idx) => {
        const done   = step.id < current;
        const active = step.id === current;
        const Icon   = step.icon;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: done ? "#06b6d4" : active ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.06)",
                  border: done || active ? "none" : "1px solid rgba(255,255,255,0.12)",
                  boxShadow: active ? "0 0 20px rgba(99,102,241,0.5)" : done ? "0 0 12px rgba(6,182,212,0.4)" : "none",
                }}
              >
                {done ? <Check className="w-3.5 h-3.5 text-white" /> : <Icon className="w-3.5 h-3.5" style={{ color: active ? "#fff" : "rgba(255,255,255,0.3)" }} />}
              </div>
              <p className="text-[9px] font-bold mt-1 uppercase tracking-wider hidden lg:block"
                style={{ color: active ? "#a78bfa" : done ? "#06b6d4" : "rgba(255,255,255,0.2)" }}>
                {step.label}
              </p>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="w-8 sm:w-10 h-[2px] mx-0.5 mb-4 rounded-full transition-all duration-500 flex-shrink-0"
                style={{ background: done ? "rgba(6,182,212,0.6)" : "rgba(255,255,255,0.07)" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.4)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
  borderRadius: 8,
};

function ToggleCard({ enabled, onToggle, title, desc }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full text-left px-4 py-3 rounded-xl transition-all"
      style={{
        background: enabled ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${enabled ? "rgba(99,102,241,0.45)" : "rgba(255,255,255,0.08)"}`,
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-white">{title}</p>
        <div className="w-9 h-5 rounded-full flex items-center transition-all px-0.5"
          style={{ background: enabled ? "#6366f1" : "rgba(255,255,255,0.1)" }}>
          <div className="w-4 h-4 rounded-full bg-white transition-all duration-200"
            style={{ transform: enabled ? "translateX(16px)" : "translateX(0)" }} />
        </div>
      </div>
      <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{desc}</p>
    </button>
  );
}

const buildEmailBody = (d) => `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:36px 40px;text-align:center;">
            <div style="display:inline-block;background:rgba(6,182,212,0.15);border:1px solid rgba(6,182,212,0.4);border-radius:6px;padding:4px 14px;margin-bottom:16px;">
              <span style="color:#22d3ee;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Welcome to TouchNet</span>
            </div>
            <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0;">We're excited to connect you!</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
              Dear <strong>${d.full_name}</strong>,<br><br>
              Welcome to <strong>TouchNet Telecommunications</strong>! Your account has been created and your fibre installation is now being arranged. Here's a summary of your service setup:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${d.company ? `<tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Company</td><td style="padding:5px 0;color:#0f172a;font-weight:600;text-align:right;font-size:13px;">${d.company}</td></tr>` : ""}
                  <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Service Plan</td><td style="padding:5px 0;color:#0f172a;font-weight:600;text-align:right;font-size:13px;">${SERVICE_PLANS.find(p => p.value === d.service_plan)?.label || d.service_plan}</td></tr>
                  <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Connection Type</td><td style="padding:5px 0;color:#0f172a;font-weight:600;text-align:right;font-size:13px;text-transform:capitalize;">${d.connection_type}</td></tr>
                  <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Monthly Rate</td><td style="padding:5px 0;color:#0891b2;font-weight:700;text-align:right;font-size:14px;">R${parseFloat(d.monthly_rate || 0).toFixed(2)}/month</td></tr>
                  <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Contract Term</td><td style="padding:5px 0;color:#0f172a;font-weight:600;text-align:right;font-size:13px;">${d.contract_months} months</td></tr>
                  <tr><td style="padding:8px 0 4px;color:#6b7280;font-size:13px;border-top:1px solid #e2e8f0;">Installation Address</td><td style="padding:8px 0 4px;color:#0f172a;font-weight:600;text-align:right;font-size:13px;border-top:1px solid #e2e8f0;">${d.address}</td></tr>
                  ${d.assigned_node ? `<tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Assigned Node</td><td style="padding:5px 0;color:#0f172a;font-weight:600;text-align:right;font-size:13px;">${d.assigned_node}</td></tr>` : ""}
                </table>
              </td></tr>
            </table>
            ${d.installation_notes ? `<p style="color:#6b7280;font-size:13px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:24px;"><strong>Installation Notes:</strong> ${d.installation_notes}</p>` : ""}
            <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 8px;">Our team will be in touch shortly to confirm your installation date. If you have any questions, reply to this email or call us at <strong>010 060 0400</strong>.</p>
            <p style="color:#374151;font-size:14px;margin:24px 0 0;">Warm regards,<br><strong>TouchNet Onboarding Team</strong><br><span style="color:#9ca3af;font-size:12px;">TouchNet Telecommunications (PTY) LTD</span></p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
            <p style="color:#9ca3af;font-size:11px;margin:0;">151 Katherine Street, Sandton · 010 060 0400 · www.touchnet.co.za</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export default function OnboardingWizard({ onClose, onComplete }) {
  const [step, setStep]     = useState(1);
  const [data, setData]     = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [done, setDone]     = useState(false);
  const [summary, setSummary] = useState(null);
  const queryClient         = useQueryClient();

  const set = (field, val) => setData(d => ({ ...d, [field]: val }));

  const handleNext = () => setStep(s => s + 1);

  const handleFinish = async () => {
    setSending(true);
    const plan     = SERVICE_PLANS.find(p => p.value === data.service_plan);
    const rate     = parseFloat(data.monthly_rate || plan?.price || 0);
    const tax      = parseFloat((rate * 0.15).toFixed(2));
    const total    = parseFloat((rate + tax).toFixed(2));
    const now      = new Date();
    const dueDate  = format(addMonths(now, 0).setDate(parseInt(data.invoice_due_days, 10) < 31 ? parseInt(data.invoice_due_days, 10) : 30), "yyyy-MM-dd");
    const invoiceNum = `INV-${Date.now().toString().slice(-7)}`;
    const accNum     = `TN-${Date.now().toString().slice(-6)}`;

    // 1. Create customer
    const customer = await base44.entities.Customer.create({
      full_name:       data.full_name,
      email:           data.email,
      phone:           data.phone,
      address:         data.address,
      status:          "pending",
      service_plan:    data.service_plan,
      connection_type: data.connection_type,
      monthly_rate:    rate,
      contract_months: data.contract_months,
      assigned_node:   data.assigned_node,
      notes:           data.installation_notes,
      account_number:  accNum,
    });

    const results = { customer: true, invoice: false, node: false };

    // 2. Create initial invoice
    if (data.create_invoice) {
      const billingStart = format(now, "yyyy-MM-dd");
      const billingEnd   = format(addMonths(now, 1), "yyyy-MM-dd");
      await base44.entities.Invoice.create({
        invoice_number:       invoiceNum,
        customer_id:          customer.id,
        customer_name:        data.full_name,
        amount:               rate,
        tax:                  tax,
        total:                total,
        status:               "sent",
        due_date:             dueDate,
        billing_period_start: billingStart,
        billing_period_end:   billingEnd,
        description:          data.invoice_description || `${plan?.label || data.service_plan} — Monthly Service`,
      });
      results.invoice = true;
    }

    // 3. Create network monitoring node
    if (data.create_node) {
      const preset  = MONITORING_PRESETS.find(p => p.value === data.monitoring_preset);
      const nodeName = data.node_name || `${data.full_name.split(" ")[0].toUpperCase()}-NODE`;
      await base44.entities.NetworkNode.create({
        name:                  nodeName,
        type:                  data.node_type,
        location:              data.node_location || data.address,
        status:                "maintenance",
        uptime_percent:        preset?.uptime || 99,
        bandwidth_utilization: 0,
        connected_customers:   1,
        max_capacity:          100,
        custom_fields: {
          monitoring_preset:   data.monitoring_preset,
          bw_alert_threshold:  preset?.bw_threshold || 80,
          customer_id:         customer.id,
          customer_name:       data.full_name,
        },
      });
      results.node = true;
    }

    // 4. Send welcome email
    await base44.functions.invoke("sendQuoteEmailGmail", {
      to:      data.email,
      subject: `Welcome to TouchNet — Your Service is Being Arranged`,
      body:    buildEmailBody(data),
    });

    queryClient.invalidateQueries({ queryKey: ["customers"] });
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({ queryKey: ["network-nodes"] });

    setSummary({ ...results, invoiceNum, accNum });
    setSending(false);
    setDone(true);
    toast.success(`${data.full_name} onboarded successfully!`);
    setTimeout(() => { onComplete?.(); onClose(); }, 3000);
  };

  const canNext = () => {
    if (step === 1) return data.full_name.trim() && data.email.trim() && data.phone.trim();
    if (step === 2) return data.service_plan && data.connection_type && data.monthly_rate;
    if (step === 3) return data.address.trim();
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2,8,16,0.88)", backdropFilter: "blur(12px)" }}>
      <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(175deg,#0d1829 0%,#0a1220 100%)", border: "1px solid rgba(99,102,241,0.25)", boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 60px rgba(99,102,241,0.1)" }}>

        <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg,#6366f1,#06b6d4,#8b5cf6)" }} />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: "#6366f1", fontFamily: "monospace" }}>TOUCHNET · ONBOARDING</p>
              <h2 className="text-xl font-black text-white">New Customer Wizard</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>

          <StepIndicator current={step} />

          {/* ── STEP CONTENT ── */}
          {done ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", boxShadow: "0 0 30px rgba(16,185,129,0.3)" }}>
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Customer Onboarded!</h3>
              <p className="text-sm text-white/50 mb-5">Welcome email sent to <span className="text-emerald-400 font-semibold">{data.email}</span></p>
              {summary && (
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                  {[
                    { label: "Customer", ok: summary.customer, detail: summary.accNum },
                    { label: "Invoice",  ok: summary.invoice,  detail: summary.invoice  ? summary.invoiceNum : "Skipped" },
                    { label: "Node",     ok: summary.node,     detail: summary.node     ? "Created"           : "Skipped" },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl p-3" style={{ background: item.ok ? "rgba(16,185,129,0.1)" : "rgba(100,116,139,0.08)", border: `1px solid ${item.ok ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)"}` }}>
                      <div className="flex items-center justify-center mb-1">
                        {item.ok ? <Check className="w-4 h-4 text-emerald-400" /> : <span className="text-white/30 text-xs">—</span>}
                      </div>
                      <p className="text-[10px] font-bold uppercase text-white/40">{item.label}</p>
                      <p className="text-[10px] font-mono mt-0.5" style={{ color: item.ok ? "#34d399" : "#64748b" }}>{item.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 min-h-[280px]">

              {/* STEP 1 — Client Details */}
              {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup label="Full Name *">
                    <Input value={data.full_name} onChange={e => set("full_name", e.target.value)} placeholder="Jane Smith" style={inputStyle} className="placeholder:text-white/20" />
                  </FieldGroup>
                  <FieldGroup label="Email Address *">
                    <Input type="email" value={data.email} onChange={e => set("email", e.target.value)} placeholder="jane@company.co.za" style={inputStyle} className="placeholder:text-white/20" />
                  </FieldGroup>
                  <FieldGroup label="Phone Number *">
                    <Input value={data.phone} onChange={e => set("phone", e.target.value)} placeholder="+27 82 000 0000" style={inputStyle} className="placeholder:text-white/20" />
                  </FieldGroup>
                  <FieldGroup label="Company (optional)">
                    <Input value={data.company} onChange={e => set("company", e.target.value)} placeholder="Acme Corp" style={inputStyle} className="placeholder:text-white/20" />
                  </FieldGroup>
                </div>
              )}

              {/* STEP 2 — Service Plan */}
              {step === 2 && (
                <>
                  <FieldGroup label="Service Plan *">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                      {SERVICE_PLANS.map(plan => (
                        <button key={plan.value} onClick={() => { set("service_plan", plan.value); set("monthly_rate", String(plan.price)); }}
                          className="text-left px-4 py-3 rounded-xl transition-all"
                          style={{
                            background: data.service_plan === plan.value ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                            border: `1px solid ${data.service_plan === plan.value ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.08)"}`,
                            boxShadow: data.service_plan === plan.value ? "0 0 20px rgba(99,102,241,0.2)" : "none",
                          }}>
                          <p className="text-sm font-bold text-white">{plan.label}</p>
                          <p className="text-xs mt-0.5 font-mono" style={{ color: "#06b6d4" }}>R{plan.price}/mo</p>
                        </button>
                      ))}
                    </div>
                  </FieldGroup>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <FieldGroup label="Connection Type *">
                      <div className="flex flex-wrap gap-2 mt-1">
                        {CONNECTION_TYPES.map(t => (
                          <button key={t} onClick={() => set("connection_type", t)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider capitalize transition-all"
                            style={{
                              background: data.connection_type === t ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.04)",
                              border: `1px solid ${data.connection_type === t ? "rgba(6,182,212,0.5)" : "rgba(255,255,255,0.08)"}`,
                              color: data.connection_type === t ? "#22d3ee" : "rgba(255,255,255,0.4)",
                            }}>{t}</button>
                        ))}
                      </div>
                    </FieldGroup>
                    <FieldGroup label="Monthly Rate (R) *">
                      <Input type="number" value={data.monthly_rate} onChange={e => set("monthly_rate", e.target.value)} placeholder="999.00" style={inputStyle} className="placeholder:text-white/20" />
                    </FieldGroup>
                    <FieldGroup label="Contract Term">
                      <div className="flex gap-2 mt-1">
                        {CONTRACT_OPTIONS.map(m => (
                          <button key={m} onClick={() => set("contract_months", m)}
                            className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                            style={{
                              background: data.contract_months === m ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
                              border: `1px solid ${data.contract_months === m ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                              color: data.contract_months === m ? "#a78bfa" : "rgba(255,255,255,0.4)",
                            }}>{m} mo</button>
                        ))}
                      </div>
                    </FieldGroup>
                  </div>
                </>
              )}

              {/* STEP 3 — Installation Site */}
              {step === 3 && (
                <div className="space-y-4">
                  <FieldGroup label="Installation Address *">
                    <textarea value={data.address} onChange={e => set("address", e.target.value)}
                      placeholder="12 Example Street, Sandton, Johannesburg, 2196"
                      rows={3} className="w-full rounded-lg px-3 py-2 text-sm resize-none outline-none placeholder:text-white/20 text-white"
                      style={{ ...inputStyle, lineHeight: 1.6 }} />
                  </FieldGroup>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldGroup label="Assigned Network Node">
                      <Input value={data.assigned_node} onChange={e => set("assigned_node", e.target.value)} placeholder="e.g. NODE-JHB-04" style={inputStyle} className="placeholder:text-white/20" />
                    </FieldGroup>
                  </div>
                  <FieldGroup label="Installation Notes">
                    <textarea value={data.installation_notes} onChange={e => set("installation_notes", e.target.value)}
                      placeholder="Access instructions, special requirements, contact person on site…"
                      rows={3} className="w-full rounded-lg px-3 py-2 text-sm resize-none outline-none placeholder:text-white/20 text-white"
                      style={{ ...inputStyle, lineHeight: 1.6 }} />
                  </FieldGroup>
                </div>
              )}

              {/* STEP 4 — Invoice Setup */}
              {step === 4 && (
                <div className="space-y-4">
                  <ToggleCard
                    enabled={data.create_invoice}
                    onToggle={() => set("create_invoice", !data.create_invoice)}
                    title="Auto-create initial invoice"
                    desc="Automatically generate and send the first month's invoice upon onboarding"
                  />
                  {data.create_invoice && (
                    <>
                      {/* Invoice preview card */}
                      <div className="rounded-xl p-4" style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.2)" }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "rgba(99,102,241,0.7)" }}>Invoice Preview</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                          {[
                            { label: "Customer", value: data.full_name || "—" },
                            { label: "Amount (excl. tax)", value: `R${parseFloat(data.monthly_rate || 0).toFixed(2)}` },
                            { label: "VAT (15%)", value: `R${(parseFloat(data.monthly_rate || 0) * 0.15).toFixed(2)}` },
                            { label: "Total", value: `R${(parseFloat(data.monthly_rate || 0) * 1.15).toFixed(2)}` },
                            { label: "Due in", value: `${data.invoice_due_days} days` },
                            { label: "Status", value: "Sent" },
                          ].map(row => (
                            <div key={row.label} className="flex justify-between">
                              <span style={{ color: "rgba(255,255,255,0.35)" }}>{row.label}</span>
                              <span className="font-bold text-white">{row.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FieldGroup label="Due in (days)">
                          <Input type="number" min="1" max="90" value={data.invoice_due_days} onChange={e => set("invoice_due_days", e.target.value)} style={inputStyle} className="placeholder:text-white/20" />
                        </FieldGroup>
                        <FieldGroup label="Invoice Description (optional)">
                          <Input value={data.invoice_description} onChange={e => set("invoice_description", e.target.value)}
                            placeholder="Monthly service fee" style={inputStyle} className="placeholder:text-white/20" />
                        </FieldGroup>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STEP 5 — Network Monitoring Profile */}
              {step === 5 && (
                <div className="space-y-4">
                  <ToggleCard
                    enabled={data.create_node}
                    onToggle={() => set("create_node", !data.create_node)}
                    title="Create network monitoring node"
                    desc="Automatically provision a monitoring profile for this client's connection"
                  />
                  {data.create_node && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FieldGroup label="Node Name">
                          <Input value={data.node_name}
                            onChange={e => set("node_name", e.target.value)}
                            placeholder={`${(data.full_name || "CLIENT").split(" ")[0].toUpperCase()}-NODE`}
                            style={inputStyle} className="placeholder:text-white/20" />
                        </FieldGroup>
                        <FieldGroup label="Node Type">
                          <div className="grid grid-cols-2 gap-1.5 mt-1">
                            {NODE_TYPES.map(nt => (
                              <button key={nt.value} onClick={() => set("node_type", nt.value)}
                                className="px-3 py-2 rounded-lg text-[11px] font-bold transition-all text-left"
                                style={{
                                  background: data.node_type === nt.value ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.04)",
                                  border: `1px solid ${data.node_type === nt.value ? "rgba(6,182,212,0.5)" : "rgba(255,255,255,0.08)"}`,
                                  color: data.node_type === nt.value ? "#22d3ee" : "rgba(255,255,255,0.4)",
                                }}>{nt.label}</button>
                            ))}
                          </div>
                        </FieldGroup>
                      </div>
                      <FieldGroup label="Node Location (defaults to install address)">
                        <Input value={data.node_location} onChange={e => set("node_location", e.target.value)}
                          placeholder={data.address || "Building / data-centre location"}
                          style={inputStyle} className="placeholder:text-white/20" />
                      </FieldGroup>
                      <FieldGroup label="Monitoring Preset">
                        <div className="space-y-2 mt-1">
                          {MONITORING_PRESETS.map(p => (
                            <button key={p.value} onClick={() => set("monitoring_preset", p.value)}
                              className="w-full text-left px-4 py-3 rounded-xl transition-all"
                              style={{
                                background: data.monitoring_preset === p.value ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                                border: `1px solid ${data.monitoring_preset === p.value ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
                              }}>
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-white">{p.label}</p>
                                <span className="text-[10px] font-mono" style={{ color: "#06b6d4" }}>{p.uptime}% SLA</span>
                              </div>
                              <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{p.desc}</p>
                            </button>
                          ))}
                        </div>
                      </FieldGroup>
                    </>
                  )}
                </div>
              )}

              {/* STEP 6 — Email Preview */}
              {step === 6 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
                    <Mail className="w-5 h-5 flex-shrink-0" style={{ color: "#06b6d4" }} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white/70">To: <span className="text-cyan-400">{data.email}</span></p>
                      <p className="text-xs text-white/40 truncate">Subject: Welcome to TouchNet — Your Service is Being Arranged</p>
                    </div>
                  </div>

                  {/* Summary of what will be created */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Customer", active: true,              icon: User,    color: "#6366f1" },
                      { label: "Invoice",  active: data.create_invoice, icon: Receipt, color: "#10b981" },
                      { label: "Node",     active: data.create_node,   icon: Activity,color: "#06b6d4" },
                    ].map(item => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: item.active ? `${item.color}12` : "rgba(255,255,255,0.03)", border: `1px solid ${item.active ? `${item.color}30` : "rgba(255,255,255,0.06)"}` }}>
                          <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: item.active ? item.color : "#334155" }} />
                          <p className="text-[10px] font-bold" style={{ color: item.active ? item.color : "#334155" }}>{item.label}</p>
                          <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>{item.active ? "Will create" : "Skipped"}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)", height: 200 }}>
                    <iframe srcDoc={buildEmailBody(data)} className="w-full h-full" title="Email Preview"
                      sandbox="allow-same-origin" style={{ background: "#fff" }} />
                  </div>
                  <p className="text-xs text-white/30 text-center">Review above then click <strong className="text-white/50">Send & Complete</strong> to finalise onboarding.</p>
                </div>
              )}
            </div>
          )}

          {/* Footer nav */}
          {!done && (
            <div className="flex items-center justify-between mt-7 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button onClick={() => setStep(s => s - 1)} disabled={step === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-20 disabled:cursor-not-allowed text-white/60 hover:text-white">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              <div className="flex items-center gap-1">
                {STEPS.map(s => (
                  <div key={s.id} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                    style={{ background: s.id === step ? "#6366f1" : s.id < step ? "#06b6d4" : "rgba(255,255,255,0.1)", boxShadow: s.id === step ? "0 0 8px #6366f1" : "none" }} />
                ))}
              </div>

              {step < STEPS.length ? (
                <button onClick={handleNext} disabled={!canNext()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleFinish} disabled={sending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 4px 16px rgba(16,185,129,0.4)" }}>
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {sending ? "Creating…" : "Send & Complete"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}