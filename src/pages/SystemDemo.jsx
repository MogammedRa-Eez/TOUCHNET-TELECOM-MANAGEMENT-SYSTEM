import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Receipt, TicketCheck, Network, UserCog, Bot, Shield,
  Package, Mail, LayoutDashboard, ArrowRight, CheckCircle2,
  Clock, AlertTriangle, Wifi, Building2, HeartHandshake,
  TrendingUp, Star, PhoneCall, FileText, Zap, Globe,
  ChevronRight, Play, Pause, RotateCcw, Eye, Send,
  CreditCard, Bell, Search, Settings, Database, Lock,
  Activity, BarChart3, MapPin, Cpu, Radio, ChevronDown
} from "lucide-react";

// ─── DEMO DATA ───────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  {
    id: "sales",
    label: "Sales",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.25)",
    icon: TrendingUp,
    persona: { name: "Lebo Dlamini", role: "Sales Executive", avatar: "LD" },
    journey: [
      { step: "New Lead Received", icon: Users, desc: "Potential client John Doe enquires about 100Mbps Fibre", detail: "Lead captured via website form and auto-assigned to Lebo", status: "done" },
      { step: "Quote Generated", icon: FileText, desc: "Lebo creates a fibre project quote: R2,450/month annuity", detail: "System auto-generates quote number Q-2024-0147 and logs it", status: "done" },
      { step: "Customer Onboarded", icon: CheckCircle2, desc: "John Doe approves quote. Customer record created", detail: "Account ACC-0089 created. Service plan: premium_100mbps", status: "done" },
      { step: "Project Kicked Off", icon: Zap, desc: "Fibre project P-0147 launched in Projects module", detail: "Engineer assigned. Forecasted go-live: 21 days", status: "active" },
      { step: "Commission Logged", icon: Receipt, desc: "R490 commission flagged for Lebo in HR Dashboard", detail: "Linked to invoice INV-2024-0147 once billing is active", status: "pending" },
    ],
    highlight: "From lead to live in 21 days — all tracked in one system."
  },
  {
    id: "projects",
    label: "Projects",
    color: "#0891b2",
    bg: "rgba(8,145,178,0.08)",
    border: "rgba(8,145,178,0.25)",
    icon: Network,
    persona: { name: "Sipho Nkosi", role: "Project Engineer", avatar: "SN" },
    journey: [
      { step: "Project Assigned", icon: Network, desc: "Sipho receives new Fibre project P-0147 for John Doe", detail: "Site address: 14 Maple St, Sandton. Engineer notified via system", status: "done" },
      { step: "Site Survey Booked", icon: MapPin, desc: "Site survey milestone created and scheduled", detail: "Survey date: 2 days out. Notes logged with GPS coordinates", status: "done" },
      { step: "Vendor Quote Approved", icon: FileText, desc: "Openserve quote uploaded and pending management approval", detail: "ApprovalRequest sent to Director. Status: Approved in 4 hours", status: "done" },
      { step: "Civil & Optical Build", icon: Cpu, desc: "Milestones tracked: Civil → Optical → Test & Handover", detail: "Each milestone updated with dates and completion notes", status: "active" },
      { step: "Go-Live & Handover", icon: CheckCircle2, desc: "Circuit ID assigned, monitoring IP set, cutover booked", detail: "IRIS monitoring activated. Finance notified to start billing", status: "pending" },
    ],
    highlight: "Every build stage tracked — no step falls through the cracks."
  },
  {
    id: "technical",
    label: "Technical",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.25)",
    icon: Radio,
    persona: { name: "Ayanda Zulu", role: "NOC Technician", avatar: "AZ" },
    journey: [
      { step: "Network Alert Fires", icon: AlertTriangle, desc: "Node BTS-Sandton-01 drops to 87% uptime — anomaly detected", detail: "System auto-creates a Critical ticket TKT-0562 and alerts NOC", status: "done" },
      { step: "Ticket Auto-Assigned", icon: TicketCheck, desc: "Ayanda receives ticket with full node diagnostics", detail: "IP: 197.84.12.5 | Bandwidth: 94% | 23 customers affected", status: "done" },
      { step: "Remote Diagnosis", icon: Cpu, desc: "Ayanda logs into Network module — node flagged as Degraded", detail: "Bandwidth utilisation graph shows spike at 02:14 AM", status: "done" },
      { step: "Escalation & Fix", icon: Radio, desc: "Firmware rollback initiated. Node restored to Online", detail: "Resolution time: 47 minutes. SLA met. Customers notified", status: "active" },
      { step: "Incident Report", icon: FileText, desc: "Ticket resolved. Post-mortem notes added for audit trail", detail: "Network health restored to 99.1%. Slack alert sent to managers", status: "pending" },
    ],
    highlight: "Outage detected, diagnosed and resolved — all within one platform."
  },
  {
    id: "finance",
    label: "Finance",
    color: "#059669",
    bg: "rgba(5,150,105,0.08)",
    border: "rgba(5,150,105,0.25)",
    icon: Receipt,
    persona: { name: "Priya Patel", role: "Finance Manager", avatar: "PP" },
    journey: [
      { step: "Monthly Billing Run", icon: Receipt, desc: "Priya triggers billing run for 312 active customers", detail: "Batch invoice generator creates invoices in under 60 seconds", status: "done" },
      { step: "Sage Sync", icon: Database, desc: "All invoices synced to Sage Business Cloud automatically", detail: "312 invoices pushed. 2 flagged for review (address mismatch)", status: "done" },
      { step: "Overdue Alerts", icon: Bell, desc: "System flags 18 accounts overdue > 30 days", detail: "Auto-emails sent. Accounts highlighted in Billing dashboard", status: "done" },
      { step: "Suspension Workflow", icon: Lock, desc: "3 accounts exceed 60-day threshold — status set to Suspended", detail: "Technical notified. Service suspended until payment received", status: "active" },
      { step: "Financial Reports", icon: BarChart3, desc: "Dashboard shows: R1.2M MRR, 94% collection rate, R48K outstanding", detail: "Revenue chart updated in real-time. Export to PDF available", status: "pending" },
    ],
    highlight: "From invoicing to Sage sync in minutes — zero manual data entry."
  },
  {
    id: "hr",
    label: "HR",
    color: "#d97706",
    bg: "rgba(217,119,6,0.08)",
    border: "rgba(217,119,6,0.25)",
    icon: HeartHandshake,
    persona: { name: "Zanele Mokoena", role: "HR Manager", avatar: "ZM" },
    journey: [
      { step: "Employee Onboarding", icon: UserCog, desc: "New employee Sipho Nkosi added with full profile", detail: "Department, role, salary, hire date all captured. Avatar uploaded", status: "done" },
      { step: "Task Assignment", icon: CheckCircle2, desc: "Zanele assigns onboarding tasks to Sipho via Task Manager", detail: "5 tasks created: ID docs, IT setup, induction, tools, buddy assigned", status: "done" },
      { step: "Leave & Attendance", icon: Clock, desc: "HR Dashboard shows attendance, tasks, and department KPIs", detail: "Sipho's tasks 3/5 complete. Department average: 87% on-time delivery", status: "done" },
      { step: "Performance Review", icon: Star, desc: "Quarterly review flagged for Lebo Dlamini — Sales dept", detail: "Linked to ticket resolution rate, project deliveries, billing targets", status: "active" },
      { step: "Salary Processing", icon: CreditCard, desc: "Salary data exported securely — visible only to HR & Admin", detail: "Role-based access ensures only authorised staff see salary figures", status: "pending" },
    ],
    highlight: "People management fully integrated — tasks, salaries, reviews in one place."
  },
  {
    id: "cyber",
    label: "Cyber Security",
    color: "#dc2626",
    bg: "rgba(220,38,38,0.08)",
    border: "rgba(220,38,38,0.25)",
    icon: Shield,
    persona: { name: "Marcus Webb", role: "Security Analyst", avatar: "MW" },
    journey: [
      { step: "Role-Based Access Setup", icon: Shield, desc: "Marcus configures roles: Admin, Manager, Staff, Field Tech", detail: "Each role has granular permissions per module (view/edit/delete)", status: "done" },
      { step: "Access Audit", icon: Eye, desc: "Review confirms no Staff-level users can access Finance data", detail: "Salary fields hidden. Delete permissions only for Admins", status: "done" },
      { step: "Threat Detected", icon: AlertTriangle, desc: "Unusual login pattern detected for user jsmith@tnet.co.za", detail: "Ticket TKT-0578 created: Category = Security. Priority = Critical", status: "done" },
      { step: "Account Isolated", icon: Lock, desc: "Marcus suspends account and forces password reset", detail: "User role temporarily set to restricted. Audit log preserved", status: "active" },
      { step: "Incident Closed", icon: CheckCircle2, desc: "Investigation complete. No data exfiltration confirmed", detail: "Post-incident report filed. MFA policy updated for all users", status: "pending" },
    ],
    highlight: "Granular RBAC ensures every user sees exactly what they need — nothing more."
  },
];

const CLIENT_JOURNEY = [
  { step: "Service Enquiry", icon: PhoneCall, desc: "Maria visits touchnet.co.za and submits an enquiry for 50Mbps Fibre", detail: "Auto-response sent. Lead captured in CRM within seconds.", color: "#6366f1" },
  { step: "Quote & Approval", icon: FileText, desc: "Sales sends tailored quote: R1,850/month. Maria signs contract online", detail: "Contract date logged. Project Q-2024-0203 kicked off automatically.", color: "#0891b2" },
  { step: "Installation Updates", icon: Cpu, desc: "Maria receives SMS updates as project milestones are completed", detail: "Site survey done ✓ | Civil complete ✓ | Go-live scheduled 15 Mar", color: "#7c3aed" },
  { step: "Service Goes Live", icon: Wifi, desc: "Maria's fibre is live! Welcome email sent with network credentials", detail: "Account ACC-0112 activated. Billing starts 1st of next month.", color: "#059669" },
  { step: "Monthly Invoice", icon: Receipt, desc: "Maria logs into the client portal and views her invoice", detail: "Invoice INV-2024-0203: R1,850. PDF downloadable. EFT details shown.", color: "#d97706" },
  { step: "Support Ticket", icon: TicketCheck, desc: "Maria reports intermittent connectivity. Ticket TKT-0591 created", detail: "Auto-assigned to NOC. SLA: 4 hours. Maria receives real-time updates.", color: "#dc2626" },
  { step: "Issue Resolved", icon: CheckCircle2, desc: "Technician identifies faulty ONT and replaces it. Ticket closed.", detail: "Resolution: 2.5 hours. Maria rates experience: ⭐⭐⭐⭐⭐", color: "#059669" },
];

const STATS = [
  { label: "Active Customers", value: "312", icon: Users, color: "#6366f1" },
  { label: "Monthly Revenue", value: "R1.2M", icon: TrendingUp, color: "#059669" },
  { label: "Open Tickets", value: "47", icon: TicketCheck, color: "#d97706" },
  { label: "Network Uptime", value: "99.1%", icon: Wifi, color: "#0891b2" },
  { label: "Active Projects", value: "23", icon: Network, color: "#7c3aed" },
  { label: "Staff Members", value: "31", icon: UserCog, color: "#dc2626" },
];

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function StepBadge({ status }) {
  if (status === "done") return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.12)", color: "#059669", border: "1px solid rgba(16,185,129,0.3)" }}>DONE</span>;
  if (status === "active") return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.3)" }}>ACTIVE</span>;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(100,116,139,0.1)", color: "#64748b", border: "1px solid rgba(100,116,139,0.2)" }}>NEXT</span>;
}

function JourneyStep({ step, index, total, color, autoPlay }) {
  const Icon = step.icon;
  const isLast = index === total - 1;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * (autoPlay ? 0.6 : 0.08) }}
      className="flex gap-3"
    >
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: step.status === "done" ? "rgba(16,185,129,0.12)" : step.status === "active" ? `${color}18` : "rgba(100,116,139,0.08)", border: `1.5px solid ${step.status === "done" ? "rgba(16,185,129,0.35)" : step.status === "active" ? color + "55" : "rgba(100,116,139,0.15)"}` }}>
          <Icon className="w-3.5 h-3.5" style={{ color: step.status === "done" ? "#059669" : step.status === "active" ? color : "#94a3b8" }} />
        </div>
        {!isLast && <div className="w-px flex-1 my-1" style={{ background: "rgba(99,102,241,0.12)" }} />}
      </div>
      <div className="pb-4 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[13px] font-semibold text-slate-800">{step.step}</span>
          <StepBadge status={step.status} />
        </div>
        <p className="text-[12px] text-slate-600 mb-1">{step.desc}</p>
        <p className="text-[11px] font-mono" style={{ color: "rgba(99,102,241,0.6)" }}>{step.detail}</p>
      </div>
    </motion.div>
  );
}

function DeptCard({ dept, isSelected, onClick }) {
  const Icon = dept.icon;
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 text-center"
      style={{
        background: isSelected ? dept.bg : "rgba(255,255,255,0.6)",
        border: `1.5px solid ${isSelected ? dept.border : "rgba(99,102,241,0.1)"}`,
        boxShadow: isSelected ? `0 4px 20px ${dept.color}20` : "none",
        minWidth: 80,
      }}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: isSelected ? dept.bg : "rgba(99,102,241,0.05)", border: `1px solid ${isSelected ? dept.border : "rgba(99,102,241,0.1)"}` }}>
        <Icon className="w-4 h-4" style={{ color: isSelected ? dept.color : "#94a3b8" }} />
      </div>
      <span className="text-[11px] font-semibold" style={{ color: isSelected ? dept.color : "#64748b" }}>{dept.label}</span>
    </button>
  );
}

function StatCard({ stat }) {
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 flex items-center gap-3"
      style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 2px 12px rgba(99,102,241,0.06)" }}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${stat.color}14`, border: `1px solid ${stat.color}30` }}>
        <Icon className="w-4.5 h-4.5" style={{ color: stat.color, width: 18, height: 18 }} />
      </div>
      <div>
        <p className="text-[18px] font-bold text-slate-800 leading-none">{stat.value}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{stat.label}</p>
      </div>
    </motion.div>
  );
}

function ClientJourneySection() {
  const [activeStep, setActiveStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (activeStep >= CLIENT_JOURNEY.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setActiveStep(s => s + 1), 2000);
    return () => clearTimeout(t);
  }, [playing, activeStep]);

  const step = CLIENT_JOURNEY[activeStep];
  const Icon = step.icon;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(99,102,241,0.12)", boxShadow: "0 4px 24px rgba(99,102,241,0.08)" }}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(99,102,241,0.08)", background: "rgba(99,102,241,0.03)" }}>
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: "#6366f1" }} /> Client Journey: Maria Ferreira
          </h3>
          <p className="text-[12px] text-slate-500 mt-0.5">From first enquiry to loyal customer — see how the system supports the experience end-to-end</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveStep(0); setPlaying(false); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.06)", color: "#6366f1" }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPlaying(p => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}
          >
            {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {playing ? "Pause" : "Auto-play"}
          </button>
        </div>
      </div>

      <div className="p-6 grid lg:grid-cols-2 gap-6">
        {/* Step progress */}
        <div className="space-y-1">
          {CLIENT_JOURNEY.map((s, i) => {
            const SIcon = s.icon;
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            return (
              <button
                key={i}
                onClick={() => { setActiveStep(i); setPlaying(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200"
                style={{
                  background: isActive ? `${s.color}10` : isDone ? "rgba(16,185,129,0.05)" : "transparent",
                  border: `1px solid ${isActive ? s.color + "40" : isDone ? "rgba(16,185,129,0.2)" : "transparent"}`,
                }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: isDone ? "rgba(16,185,129,0.12)" : isActive ? `${s.color}15` : "rgba(100,116,139,0.08)", border: `1.5px solid ${isDone ? "rgba(16,185,129,0.3)" : isActive ? s.color + "50" : "rgba(100,116,139,0.12)"}` }}>
                  {isDone ? <CheckCircle2 className="w-3 h-3" style={{ color: "#059669" }} /> : <SIcon className="w-3 h-3" style={{ color: isActive ? s.color : "#94a3b8" }} />}
                </div>
                <span className="text-[12px] font-semibold" style={{ color: isActive ? s.color : isDone ? "#059669" : "#64748b" }}>{s.step}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" style={{ color: s.color }} />}
              </button>
            );
          })}
        </div>

        {/* Active step detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl p-5 flex flex-col justify-center"
            style={{ background: `${step.color}08`, border: `1.5px solid ${step.color}30` }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${step.color}15`, border: `1.5px solid ${step.color}35` }}>
              <Icon className="w-5 h-5" style={{ color: step.color }} />
            </div>
            <div className="text-[11px] font-bold mono mb-1" style={{ color: step.color + "aa" }}>STEP {activeStep + 1} OF {CLIENT_JOURNEY.length}</div>
            <h4 className="text-[16px] font-bold text-slate-800 mb-2">{step.step}</h4>
            <p className="text-[13px] text-slate-600 mb-3">{step.desc}</p>
            <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(99,102,241,0.1)" }}>
              <p className="text-[11px] font-mono text-slate-500">{step.detail}</p>
            </div>
            {activeStep < CLIENT_JOURNEY.length - 1 && (
              <button
                onClick={() => setActiveStep(s => s + 1)}
                className="mt-4 self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                style={{ background: `${step.color}15`, border: `1px solid ${step.color}35`, color: step.color }}
              >
                Next step <ArrowRight className="w-3 h-3" />
              </button>
            )}
            {activeStep === CLIENT_JOURNEY.length - 1 && (
              <div className="mt-4 flex items-center gap-2 text-[12px] font-semibold" style={{ color: "#059669" }}>
                <CheckCircle2 className="w-4 h-4" /> Journey Complete — Happy Customer!
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function SystemDemo() {
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0]);
  const [autoPlay, setAutoPlay] = useState(false);

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 md:p-8 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.08) 50%, rgba(6,182,212,0.06) 100%)",
            border: "1px solid rgba(99,102,241,0.2)",
            boxShadow: "0 8px 32px rgba(99,102,241,0.1)"
          }}
        >
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold mono mb-4" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#6366f1" }}>
              <Activity className="w-3 h-3" /> SYSTEM OVERVIEW · LIVE DEMO
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">TouchNet Management Platform</h1>
            <p className="text-[14px] text-slate-500 max-w-2xl mx-auto">
              A fully integrated ISP operations platform connecting Sales, Projects, Technical, Finance, HR and Cyber Security — with a seamless client experience end-to-end.
            </p>
          </div>
        </motion.div>

        {/* ── LIVE STATS ── */}
        <div>
          <h2 className="text-[13px] font-bold text-slate-500 mono uppercase mb-3">System Snapshot — Live Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {STATS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <StatCard stat={s} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── DEPARTMENT JOURNEYS ── */}
        <div>
          <h2 className="text-[13px] font-bold text-slate-500 mono uppercase mb-3">Department Workflows</h2>

          {/* Dept selector */}
          <div className="flex gap-2 flex-wrap mb-4">
            {DEPARTMENTS.map(d => (
              <DeptCard
                key={d.id}
                dept={d}
                isSelected={selectedDept.id === d.id}
                onClick={() => setSelectedDept(d)}
              />
            ))}
          </div>

          {/* Dept panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDept.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(99,102,241,0.12)", boxShadow: "0 4px 24px rgba(99,102,241,0.08)" }}
            >
              {/* Panel header */}
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${selectedDept.border}`, background: selectedDept.bg }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: selectedDept.bg, border: `1.5px solid ${selectedDept.border}` }}>
                    {React.createElement(selectedDept.icon, { className: "w-4 h-4", style: { color: selectedDept.color } })}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-800">{selectedDept.label} Department</h3>
                    <p className="text-[11px]" style={{ color: selectedDept.color + "aa" }}>
                      👤 {selectedDept.persona.name} · {selectedDept.persona.role}
                    </p>
                  </div>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-[11px] font-semibold italic text-slate-400 max-w-xs">"{selectedDept.highlight}"</p>
                </div>
              </div>

              {/* Steps grid */}
              <div className="p-6 grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 mono uppercase mb-3">Workflow Journey</p>
                  <div>
                    {selectedDept.journey.map((step, i) => (
                      <JourneyStep key={i} step={step} index={i} total={selectedDept.journey.length} color={selectedDept.color} autoPlay={autoPlay} />
                    ))}
                  </div>
                </div>

                {/* System modules involved */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 mono uppercase mb-3">Modules Used</p>
                  <div className="space-y-2">
                    {[
                      { icon: LayoutDashboard, label: "Dashboard", desc: "Real-time KPIs and overviews" },
                      { icon: Users, label: "Customers", desc: "CRM and account management" },
                      { icon: Receipt, label: "Billing", desc: "Invoicing, Sage sync, statements" },
                      { icon: TicketCheck, label: "Tickets", desc: "SLA-driven support workflow" },
                      { icon: Network, label: "Network", desc: "Node monitoring and topology" },
                      { icon: UserCog, label: "Employees & HR", desc: "Staff, tasks, performance" },
                      { icon: Shield, label: "Roles & RBAC", desc: "Access control per user" },
                      { icon: Bot, label: "AI Assistant", desc: "Natural language operations" },
                    ].map((m, i) => {
                      const Icon = m.icon;
                      return (
                        <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.08)" }}>
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#6366f1" }} />
                          <span className="text-[12px] font-semibold text-slate-700 w-28">{m.label}</span>
                          <span className="text-[11px] text-slate-400">{m.desc}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quote callout */}
                  <div className="mt-4 rounded-xl p-4" style={{ background: selectedDept.bg, border: `1px solid ${selectedDept.border}` }}>
                    <div className="flex items-start gap-2">
                      <Star className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: selectedDept.color }} />
                      <p className="text-[12px] font-semibold italic" style={{ color: selectedDept.color }}>{selectedDept.highlight}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── CLIENT JOURNEY ── */}
        <ClientJourneySection />

        {/* ── SYSTEM ARCHITECTURE ── */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(99,102,241,0.12)", boxShadow: "0 4px 24px rgba(99,102,241,0.08)" }}>
          <h3 className="text-[15px] font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Database className="w-4 h-4" style={{ color: "#6366f1" }} /> How It All Connects
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { from: "Sales CRM", to: "Fibre Projects", arrow: true, color: "#6366f1" },
              { from: "Projects", to: "Technical NOC", arrow: true, color: "#0891b2" },
              { from: "Go-Live", to: "Billing / Sage", arrow: true, color: "#7c3aed" },
              { from: "Customers", to: "AI Assistant", arrow: true, color: "#059669" },
              { from: "Tickets", to: "NOC + SLA", arrow: true, color: "#d97706" },
              { from: "Employees", to: "HR Dashboard", arrow: true, color: "#dc2626" },
              { from: "RBAC Roles", to: "All Modules", arrow: true, color: "#0891b2" },
              { from: "Network Nodes", to: "Alert → Ticket", arrow: true, color: "#7c3aed" },
            ].map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background: `${c.color}08`, border: `1px solid ${c.color}25` }}
              >
                <span className="text-[11px] font-semibold text-slate-600">{c.from}</span>
                <ArrowRight className="w-3 h-3 mx-1 flex-shrink-0" style={{ color: c.color }} />
                <span className="text-[11px] font-semibold" style={{ color: c.color }}>{c.to}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center pb-4">
          <p className="text-[11px] text-slate-400 mono">TOUCHNET · NOVA AI PLATFORM · INTEGRATED ISP MANAGEMENT SYSTEM</p>
        </div>
      </div>
    </div>
  );
}