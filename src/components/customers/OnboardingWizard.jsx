import React, { useState } from "react";
import { X, Check, User, Wifi, MapPin, Mail, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const STEPS = [
  { id: 1, label: "Client Details",     icon: User },
  { id: 2, label: "Service Plan",       icon: Wifi },
  { id: 3, label: "Installation Site",  icon: MapPin },
  { id: 4, label: "Welcome Email",      icon: Mail },
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

const EMPTY = {
  // Step 1
  full_name: "", email: "", phone: "", company: "",
  // Step 2
  service_plan: "", connection_type: "fiber", monthly_rate: "", contract_months: 24,
  // Step 3
  address: "", assigned_node: "", installation_notes: "",
  // Step 4 — email preview
  email_preview: "",
};

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, idx) => {
        const done    = step.id < current;
        const active  = step.id === current;
        const Icon    = step.icon;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: done ? "#06b6d4" : active ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.06)",
                  border: done || active ? "none" : "1px solid rgba(255,255,255,0.12)",
                  boxShadow: active ? "0 0 20px rgba(99,102,241,0.5)" : done ? "0 0 12px rgba(6,182,212,0.4)" : "none",
                }}
              >
                {done
                  ? <Check className="w-4 h-4 text-white" />
                  : <Icon className="w-4 h-4" style={{ color: active ? "#fff" : "rgba(255,255,255,0.3)" }} />
                }
              </div>
              <p className="text-[10px] font-bold mt-1.5 uppercase tracking-wider hidden sm:block"
                style={{ color: active ? "#a78bfa" : done ? "#06b6d4" : "rgba(255,255,255,0.25)" }}>
                {step.label}
              </p>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="w-12 sm:w-16 h-[2px] mx-1 sm:mx-2 mb-5 rounded-full transition-all duration-500"
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

export default function OnboardingWizard({ onClose, onComplete }) {
  const [step, setStep]       = useState(1);
  const [data, setData]       = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [done, setDone]       = useState(false);
  const queryClient           = useQueryClient();

  const set = (field, val) => setData(d => ({ ...d, [field]: val }));

  // Derive email preview whenever step 4 is reached
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

  const handleNext = () => {
    if (step === 3) {
      // Pre-build email preview before showing step 4
      setData(d => ({ ...d, email_preview: buildEmailBody(d) }));
    }
    setStep(s => s + 1);
  };

  const handleFinish = async () => {
    setSending(true);
    // 1. Create customer record
    const plan = SERVICE_PLANS.find(p => p.value === data.service_plan);
    const customer = await base44.entities.Customer.create({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      status: "pending",
      service_plan: data.service_plan,
      connection_type: data.connection_type,
      monthly_rate: parseFloat(data.monthly_rate || plan?.price || 0),
      assigned_node: data.assigned_node,
      notes: data.installation_notes,
      account_number: `TN-${Date.now().toString().slice(-6)}`,
    });

    // 2. Send welcome email via Gmail
    await base44.functions.invoke("sendQuoteEmailGmail", {
      to: data.email,
      subject: `Welcome to TouchNet — Your Service is Being Arranged`,
      body: buildEmailBody(data),
    });

    queryClient.invalidateQueries({ queryKey: ["customers"] });
    setSending(false);
    setDone(true);
    toast.success(`Welcome email sent to ${data.email}`);
    setTimeout(() => { onComplete?.(); onClose(); }, 2200);
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

        {/* Glow top bar */}
        <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg,#6366f1,#06b6d4,#8b5cf6)" }} />

        <div className="p-7 sm:p-9">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: "#6366f1", fontFamily: "monospace" }}>TOUCHNET · ONBOARDING</p>
              <h2 className="text-xl font-black text-white">New Client Wizard</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>

          {/* Step indicator */}
          <StepIndicator current={step} />

          {/* ── STEP CONTENT ── */}
          {done ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", boxShadow: "0 0 30px rgba(16,185,129,0.3)" }}>
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Client Onboarded!</h3>
              <p className="text-sm text-white/50">Welcome email sent to <span className="text-emerald-400 font-semibold">{data.email}</span></p>
            </div>
          ) : (
            <div className="space-y-4 min-h-[280px]">
              {/* STEP 1 — Client Details */}
              {step === 1 && (
                <>
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
                </>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
                    <textarea
                      value={data.address}
                      onChange={e => set("address", e.target.value)}
                      placeholder="12 Example Street, Sandton, Johannesburg, 2196"
                      rows={3}
                      className="w-full rounded-lg px-3 py-2 text-sm resize-none outline-none placeholder:text-white/20 text-white"
                      style={{ ...inputStyle, lineHeight: 1.6 }}
                    />
                  </FieldGroup>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldGroup label="Assigned Network Node">
                      <Input value={data.assigned_node} onChange={e => set("assigned_node", e.target.value)} placeholder="e.g. NODE-JHB-04" style={inputStyle} className="placeholder:text-white/20" />
                    </FieldGroup>
                  </div>
                  <FieldGroup label="Installation Notes">
                    <textarea
                      value={data.installation_notes}
                      onChange={e => set("installation_notes", e.target.value)}
                      placeholder="Access instructions, special requirements, contact person on site…"
                      rows={3}
                      className="w-full rounded-lg px-3 py-2 text-sm resize-none outline-none placeholder:text-white/20 text-white"
                      style={{ ...inputStyle, lineHeight: 1.6 }}
                    />
                  </FieldGroup>
                </div>
              )}

              {/* STEP 4 — Email Preview */}
              {step === 4 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
                    <Mail className="w-5 h-5 flex-shrink-0" style={{ color: "#06b6d4" }} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white/70">To: <span className="text-cyan-400">{data.email}</span></p>
                      <p className="text-xs text-white/40 truncate">Subject: Welcome to TouchNet — Your Service is Being Arranged</p>
                    </div>
                  </div>
                  <div className="rounded-xl overflow-hidden border" style={{ border: "1px solid rgba(255,255,255,0.08)", height: 260 }}>
                    <iframe
                      srcDoc={buildEmailBody(data)}
                      className="w-full h-full"
                      title="Email Preview"
                      sandbox="allow-same-origin"
                      style={{ background: "#fff" }}
                    />
                  </div>
                  <p className="text-xs text-white/30 text-center">Review the email above. Clicking <strong className="text-white/50">Send & Complete</strong> will create the customer record and send this email.</p>
                </div>
              )}
            </div>
          )}

          {/* Footer nav */}
          {!done && (
            <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={step === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-20 disabled:cursor-not-allowed text-white/60 hover:text-white hover:bg-white/05"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              <div className="flex items-center gap-1.5">
                {STEPS.map(s => (
                  <div key={s.id} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                    style={{ background: s.id === step ? "#6366f1" : s.id < step ? "#06b6d4" : "rgba(255,255,255,0.1)", boxShadow: s.id === step ? "0 0 8px #6366f1" : "none" }} />
                ))}
              </div>

              {step < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={!canNext()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={sending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 4px 16px rgba(16,185,129,0.4)" }}
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {sending ? "Sending…" : "Send & Complete"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}