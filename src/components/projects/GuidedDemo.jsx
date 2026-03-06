import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, ChevronRight, ChevronLeft, Play, CheckCircle2, Loader2, Sparkles, Hash, User, Calendar, DollarSign, FileText, Bell, Wrench, Network, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEMO_STEPS = [
  {
    id: "intro",
    icon: Sparkles,
    color: "#6366f1",
    title: "Welcome to the Fibre Project Lifecycle",
    subtitle: "This guided demo walks through a complete fibre installation project from lead to billing.",
    description: "You'll see how a project moves through 7 sequential tasks, from welcoming the client all the way through to TNet billing. Each step is tracked, assigned, and approved — giving full visibility to the whole team.",
    visual: "intro",
  },
  {
    id: "project_created",
    icon: Hash,
    color: "#6366f1",
    title: "Step 1: Project Created",
    subtitle: "A new fibre project is created with a unique Quote Number.",
    description: "When a client is ready to proceed, a project is created. The Quote Number (e.g. Q-2026-042) is the single identifier used across the quote, project, purchase order, and billing — no confusion across departments.",
    highlight: ["Quote Number: Q-2026-042", "Client: Acme Logistics (Pty) Ltd", "Service: 100Mbps Dedicated Fibre", "Site: 14 Industrial Rd, Germiston"],
    visual: "project",
  },
  {
    id: "task1",
    icon: Bell,
    color: "#3b82f6",
    title: "Task 1: Welcome Communication",
    subtitle: "Send the client a welcome email and take-on form.",
    description: "The first task is to send the client a welcome email and share the client take-on form. Once the form is returned and signed, this task is marked complete and the next task unlocks automatically.",
    highlight: ["Welcome email sent to client", "Client take-on form shared", "Document uploaded to project"],
    taskIndex: 0,
    visual: "task",
  },
  {
    id: "task2",
    icon: FileText,
    color: "#8b5cf6",
    title: "Task 2: Vendor Process",
    subtitle: "Obtain and approve the vendor quote, then submit a PO.",
    description: "The vendor (e.g. Vuma, Openserve) provides a quote. This triggers an approval request — a manager must approve the quote before a Purchase Order is submitted. Nothing proceeds without sign-off.",
    highlight: ["Vendor quote received", "Approval request raised → Manager approves", "PO submitted to vendor", "Circuit ID received from vendor"],
    taskIndex: 1,
    visual: "task",
  },
  {
    id: "task3",
    icon: Calendar,
    color: "#f59e0b",
    title: "Tasks 3 & 4: Cutover & Engineer Booking",
    subtitle: "Book the internal cutover slot and schedule the onsite engineer.",
    description: "Two parallel operational tasks: booking the internal cutover date with the NOC team, and scheduling a TNET engineer to be onsite at the client premises for the handover day.",
    highlight: ["Cutover date booked with NOC", "Engineer assigned and scheduled", "Client notified of installation date"],
    taskIndex: 2,
    visual: "task",
  },
  {
    id: "task5",
    icon: Network,
    color: "#10b981",
    title: "Task 5: IRIS Monitoring Setup",
    subtitle: "Add the client device to IRIS for live network monitoring.",
    description: "Once the circuit is up, the client's device IP is added to the IRIS monitoring platform. From this point, the TNET NOC team can see the client's link status in real time.",
    highlight: ["Monitoring IP: 196.35.12.44", "Device added to IRIS", "Link status: Online ✓"],
    taskIndex: 4,
    visual: "task",
  },
  {
    id: "task6",
    icon: CheckCircle2,
    color: "#6366f1",
    title: "Task 6: Activate Contract",
    subtitle: "Activate the client contract in the billing system.",
    description: "A second approval is required here — the go-live approval. Once granted, the client contract is activated, the activation email is sent, and the service is officially live.",
    highlight: ["Go-live approval granted", "Contract activated", "Activation email sent to client", "Status → Live"],
    taskIndex: 5,
    visual: "task",
  },
  {
    id: "task7",
    icon: Receipt,
    color: "#059669",
    title: "Task 7: TNet Billing",
    subtitle: "Commence billing — annuity and once-off.",
    description: "The final task. Once billing starts, the project is marked as Billed and appears in the Revenue Forecast. The annuity amount feeds into the monthly recurring revenue report.",
    highlight: ["Annuity: R8,500/mo", "Once-Off: R12,000", "Billing commenced", "Status → Billed ✓"],
    taskIndex: 6,
    visual: "task",
  },
  {
    id: "reports",
    icon: DollarSign,
    color: "#f59e0b",
    title: "Reports & Forecasting",
    subtitle: "See the full pipeline and revenue forecast at a glance.",
    description: "The Reports view shows you the forecasted go-live dates, monthly annuity vs once-off revenue, pipeline by status, and a full table of billed projects — giving management real-time visibility into the business.",
    highlight: ["Monthly go-live forecast", "Annuity vs Once-Off revenue chart", "Pipeline by status", "Billed projects table"],
    visual: "report",
  },
  {
    id: "done",
    icon: Sparkles,
    color: "#10b981",
    title: "That's the Full Process!",
    subtitle: "From lead to billing — fully tracked, approved, and visible.",
    description: "Every project follows the same 7-step workflow. Nothing falls through the cracks because each task must be completed before the next unlocks. Approvals are built in at key decision points, and the full audit trail lives on the project.",
    visual: "done",
  },
];

const TASK_LABELS = [
  "Welcome Communication",
  "Vendor Process",
  "Internal Cutover Booking",
  "Engineer Onsite Booking",
  "IRIS Monitoring",
  "Activate Contract",
  "TNet Billing",
];

function StepVisual({ step }) {
  if (step.visual === "intro") {
    return (
      <div className="rounded-2xl p-6 space-y-3" style={{ background: "linear-gradient(135deg,#0f1845,#1e2a4a)" }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-mono">LIVE SYSTEM DEMO</span>
        </div>
        {["Lead → Quoted", "Quoted → Approved", "Approved → In Progress", "In Progress → Testing", "Testing → Live", "Live → Billed"].map((stage, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-300 text-[10px] font-bold">{i + 1}</span>
            </div>
            <div className="h-px flex-1" style={{ background: "rgba(99,102,241,0.4)" }} />
            <span className="text-slate-300 text-xs">{stage}</span>
          </div>
        ))}
      </div>
    );
  }

  if (step.visual === "project") {
    return (
      <div className="rounded-2xl p-5 space-y-3" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.15)" }}>
        <div className="flex items-center gap-2 mb-1">
          <Hash className="w-4 h-4 text-indigo-500" />
          <span className="text-indigo-600 font-mono font-bold text-sm">Q-2026-042</span>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>approved</span>
        </div>
        <p className="font-bold text-slate-800">Acme Logistics (Pty) Ltd</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[["Service Plan", "100Mbps Dedicated"], ["Site", "Germiston"], ["Engineer", "Sipho Dlamini"], ["Vendor", "Vuma Fibre"]].map(([k, v]) => (
            <div key={k}>
              <p className="text-slate-400">{k}</p>
              <p className="text-slate-700 font-medium">{v}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg px-3 py-2" style={{ background: "#f0fdf4" }}>
            <p className="text-[9px] text-slate-400 uppercase">Annuity/mo</p>
            <p className="text-sm font-bold text-emerald-600">R8,500</p>
          </div>
          <div className="rounded-lg px-3 py-2" style={{ background: "#fffbeb" }}>
            <p className="text-[9px] text-slate-400 uppercase">Once-Off</p>
            <p className="text-sm font-bold text-amber-600">R12,000</p>
          </div>
        </div>
      </div>
    );
  }

  if (step.visual === "task") {
    const active = step.taskIndex ?? 0;
    return (
      <div className="rounded-2xl p-4 space-y-2" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.15)" }}>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Task Progress</p>
        {TASK_LABELS.map((label, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <div key={i} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 ${current ? "border" : ""}`}
              style={{ background: current ? "rgba(99,102,241,0.07)" : "transparent", borderColor: current ? "rgba(99,102,241,0.3)" : "transparent" }}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-emerald-500" : current ? "bg-indigo-500" : "bg-slate-200"}`}>
                {done ? <CheckCircle2 className="w-3 h-3 text-white" /> : <span className="text-[9px] font-bold text-white">{i + 1}</span>}
              </div>
              <span className={`text-xs ${done ? "line-through text-slate-400" : current ? "text-indigo-700 font-semibold" : "text-slate-400"}`}>{label}</span>
              {current && <span className="ml-auto text-[9px] text-indigo-500 font-semibold">ACTIVE</span>}
            </div>
          );
        })}
      </div>
    );
  }

  if (step.visual === "report") {
    return (
      <div className="rounded-2xl p-5 space-y-3" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.15)" }}>
        <div className="grid grid-cols-2 gap-2">
          {[["Pipeline", "8 projects", "#6366f1"], ["Annuity", "R68,000/mo", "#10b981"], ["Once-Off", "R94,500", "#f59e0b"], ["WIP Value", "R127,000", "#8b5cf6"]].map(([l, v, c]) => (
            <div key={l} className="rounded-lg p-3" style={{ background: "#f8faff" }}>
              <p className="text-[9px] text-slate-400 uppercase">{l}</p>
              <p className="text-sm font-bold" style={{ color: c }}>{v}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-[10px] text-slate-400 mb-2">Pipeline by Status</p>
          {[["Lead", 2, "#94a3b8"], ["In Progress", 3, "#3b82f6"], ["Live", 2, "#10b981"], ["Billed", 1, "#059669"]].map(([s, n, c]) => (
            <div key={s} className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-slate-400 w-20">{s}</span>
              <div className="flex-1 h-3 rounded-full" style={{ background: "#f1f5f9" }}>
                <div className="h-3 rounded-full" style={{ width: `${(n / 8) * 100}%`, background: c }} />
              </div>
              <span className="text-[10px] font-bold text-slate-600">{n}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step.visual === "done") {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg,#0f1845,#1e2a4a)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(16,185,129,0.2)" }}>
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <p className="text-white font-bold text-lg mb-2">Process Complete</p>
        <p className="text-slate-400 text-sm">7 tasks · Approvals built-in · Full audit trail</p>
        <div className="flex justify-center gap-4 mt-4">
          {["Welcome", "Vendor", "Cutover", "Engineer", "IRIS", "Contract", "Billing"].map((t, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export default function GuidedDemo({ onClose }) {
  const [step, setStep] = useState(0);
  const current = DEMO_STEPS[step];
  const Icon = current.icon;
  const isLast = step === DEMO_STEPS.length - 1;
  const isFirst = step === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#f8faff", border: "1px solid rgba(99,102,241,0.2)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#0f1845,#1e2a4a)" }}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-white text-sm font-semibold">Fibre Project Guided Demo</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-xs font-mono">{step + 1} / {DEMO_STEPS.length}</span>
            <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full" style={{ background: "#e2e8f0" }}>
          <div className="h-1 transition-all duration-500" style={{ width: `${((step + 1) / DEMO_STEPS.length) * 100}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }} />
        </div>

        <div className="p-6 space-y-5">
          {/* Step header */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${current.color}20` }}>
              <Icon className="w-6 h-6" style={{ color: current.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-slate-800 text-lg leading-tight">{current.title}</h2>
              <p className="text-sm text-indigo-600 font-medium mt-0.5">{current.subtitle}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">{current.description}</p>

          {/* Highlights */}
          {current.highlight && (
            <div className="space-y-1.5">
              {current.highlight.map((h, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: current.color }} />
                  <span className="text-sm text-slate-700">{h}</span>
                </div>
              ))}
            </div>
          )}

          {/* Visual */}
          <StepVisual step={current} />

          {/* Navigation */}
          <div className="flex justify-between items-center pt-2">
            <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={isFirst} className="gap-1.5">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <div className="flex gap-1">
              {DEMO_STEPS.map((_, i) => (
                <button key={i} onClick={() => setStep(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === step ? "w-4" : ""}`}
                  style={{ background: i === step ? current.color : "#cbd5e1" }} />
              ))}
            </div>
            {isLast ? (
              <Button onClick={onClose} style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff" }} className="gap-1.5">
                Done <CheckCircle2 className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={() => setStep(s => s + 1)} style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff" }} className="gap-1.5">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}