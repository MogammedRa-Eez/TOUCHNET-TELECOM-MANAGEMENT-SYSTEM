import React from "react";
import {
  Wifi, Zap, Calendar, CheckCircle2, Clock, DollarSign,
  Shield, Phone, Mail, MapPin, Hash, ArrowRight, AlertCircle
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

const PLAN_DETAILS = {
  basic_10mbps: {
    label: "Basic 10 Mbps",
    color: "#06b6d4",
    down: 10, up: 5,
    features: ["10 Mbps Download", "5 Mbps Upload", "Uncapped Data", "Email Support", "99.5% Uptime SLA"],
    description: "Perfect for light browsing, email, and social media for 1–2 users.",
  },
  standard_50mbps: {
    label: "Standard 50 Mbps",
    color: "#6366f1",
    down: 50, up: 25,
    features: ["50 Mbps Download", "25 Mbps Upload", "Uncapped Data", "Priority Support", "99.7% Uptime SLA", "Free Router"],
    description: "Ideal for streaming HD video, remote work, and families up to 4 devices.",
  },
  premium_100mbps: {
    label: "Premium 100 Mbps",
    color: "#8b5cf6",
    down: 100, up: 50,
    features: ["100 Mbps Download", "50 Mbps Upload", "Uncapped Data", "24/7 Phone Support", "99.9% Uptime SLA", "Free Router + Static IP"],
    description: "For power users, small offices, and bandwidth-intensive applications.",
  },
  enterprise_500mbps: {
    label: "Enterprise 500 Mbps",
    color: "#f59e0b",
    down: 500, up: 250,
    features: ["500 Mbps Download", "250 Mbps Upload", "Uncapped Data", "Dedicated Account Manager", "99.95% Uptime SLA", "Free Router + 2× Static IPs", "Business Priority Queue"],
    description: "Designed for businesses with multiple users and cloud-heavy workflows.",
  },
  dedicated_1gbps: {
    label: "Dedicated 1 Gbps",
    color: "#10b981",
    down: 1000, up: 1000,
    features: ["1 Gbps Symmetric", "Uncapped Data", "24/7 NOC Monitoring", "Dedicated Account Manager", "99.99% Uptime SLA", "Free Router + 4× Static IPs", "Dedicated Bandwidth", "SLA Credits"],
    description: "Enterprise-grade dedicated fibre for mission-critical business operations.",
  },
};

function DetailRow({ icon: Icon, label, value, color = "#64748b" }) {
  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid rgba(226,232,240,0.6)" }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <span className="text-[12px] flex-1" style={{ color: "#64748b" }}>{label}</span>
      <span className="text-[12px] font-bold" style={{ color: "#1e293b" }}>{value}</span>
    </div>
  );
}

export default function PortalServicePlanTab({ customer }) {
  const plan = PLAN_DETAILS[customer?.service_plan];
  const color = plan?.color || "#6366f1";

  const contractEndDate = customer?.contract_end_date ? new Date(customer.contract_end_date) : null;
  const daysLeft = contractEndDate ? differenceInDays(contractEndDate, new Date()) : null;

  const contractStatus = daysLeft === null
    ? null
    : daysLeft < 0
      ? { label: "Expired", color: "#ef4444", bg: "rgba(239,68,68,0.08)" }
      : daysLeft < 30
        ? { label: `Expires in ${daysLeft} days`, color: "#f59e0b", bg: "rgba(245,158,11,0.08)" }
        : { label: `${daysLeft} days remaining`, color: "#10b981", bg: "rgba(16,185,129,0.08)" };

  return (
    <div className="space-y-5">

      {/* Plan Hero Card */}
      <div className="rounded-2xl overflow-hidden relative"
        style={{
          background: `linear-gradient(135deg, ${color}10, rgba(99,102,241,0.05))`,
          border: `1px solid ${color}25`,
          boxShadow: `0 8px 40px ${color}12`,
        }}>
        <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${color}, ${color}55, transparent)` }} />
        <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
          style={{ background: `radial-gradient(circle at 80% 20%, ${color}12, transparent 65%)` }} />
        <div className="relative p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
              <Wifi className="w-7 h-7" style={{ color }} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#94a3b8" }}>Current Plan</p>
              <h2 className="text-[22px] font-black mt-0.5" style={{ color: "#0f172a", fontFamily: "'Space Grotesk',sans-serif" }}>
                {plan?.label || customer?.service_plan?.replace(/_/g, " ") || "Service Plan"}
              </h2>
              {plan?.description && (
                <p className="text-[12px] mt-1.5" style={{ color: "#475569" }}>{plan.description}</p>
              )}
            </div>
            {customer?.monthly_rate && (
              <div className="hidden sm:flex flex-col items-end flex-shrink-0">
                <p className="text-[28px] font-black mono" style={{ color }}>R{customer.monthly_rate}</p>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "#94a3b8" }}>per month</p>
              </div>
            )}
          </div>

          {/* Speed indicators */}
          {plan && (
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.7)", border: `1px solid ${color}20` }}>
                <div className="flex items-center gap-2 mb-1">
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" style={{ color }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#94a3b8" }}>Download</span>
                </div>
                <p className="text-[24px] font-black mono" style={{ color }}>{plan.down >= 1000 ? `${plan.down / 1000} Gbps` : `${plan.down} Mbps`}</p>
              </div>
              <div className="rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.7)", border: `1px solid ${color}20` }}>
                <div className="flex items-center gap-2 mb-1">
                  <ArrowRight className="w-3.5 h-3.5 -rotate-90" style={{ color: "#06b6d4" }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#94a3b8" }}>Upload</span>
                </div>
                <p className="text-[24px] font-black mono" style={{ color: "#06b6d4" }}>{plan.up >= 1000 ? `${plan.up / 1000} Gbps` : `${plan.up} Mbps`}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plan Features */}
      {plan?.features && (
        <div className="rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(99,102,241,0.1)" }}>
          <div className="h-[2px] -mx-5 -mt-5 mb-5 rounded-t-2xl"
            style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
          <p className="text-[13px] font-black mb-3" style={{ color: "#1e293b" }}>What's Included</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {plan.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color }} />
                <span className="text-[12px]" style={{ color: "#475569" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contract & Account Details */}
      <div className="rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(99,102,241,0.1)" }}>
        <div className="h-[2px] -mx-5 -mt-5 mb-5 rounded-t-2xl"
          style={{ background: "linear-gradient(90deg,#6366f1,#06b6d4,transparent)" }} />
        <p className="text-[13px] font-black mb-1" style={{ color: "#1e293b" }}>Account & Contract Details</p>

        {contractStatus && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl"
            style={{ background: contractStatus.bg, border: `1px solid ${contractStatus.color}25` }}>
            {daysLeft < 30 && daysLeft >= 0
              ? <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: contractStatus.color }} />
              : <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: contractStatus.color }} />}
            <span className="text-[12px] font-semibold" style={{ color: contractStatus.color }}>{contractStatus.label}</span>
          </div>
        )}

        <div>
          {customer?.account_number && (
            <DetailRow icon={Hash} label="Account Number" value={`#${customer.account_number}`} color="#6366f1" />
          )}
          {customer?.connection_type && (
            <DetailRow icon={Wifi} label="Connection Type" value={customer.connection_type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())} color="#06b6d4" />
          )}
          {customer?.installation_date && (
            <DetailRow icon={Calendar} label="Installation Date" value={format(new Date(customer.installation_date), "dd MMM yyyy")} color="#10b981" />
          )}
          {customer?.contract_end_date && (
            <DetailRow icon={Clock} label="Contract End Date" value={format(new Date(customer.contract_end_date), "dd MMM yyyy")} color={daysLeft < 30 ? "#f59e0b" : "#6366f1"} />
          )}
          {customer?.monthly_rate && (
            <DetailRow icon={DollarSign} label="Monthly Rate" value={`R${customer.monthly_rate}/month`} color="#10b981" />
          )}
          {customer?.assigned_node && (
            <DetailRow icon={Shield} label="Network Node" value={customer.assigned_node} color="#8b5cf6" />
          )}
          {customer?.address && (
            <DetailRow icon={MapPin} label="Service Address" value={customer.address} color="#f59e0b" />
          )}
          {customer?.phone && (
            <DetailRow icon={Phone} label="Contact Number" value={customer.phone} color="#06b6d4" />
          )}
          {customer?.email && (
            <DetailRow icon={Mail} label="Email" value={customer.email} color="#6366f1" />
          )}
        </div>
      </div>

      {/* Support CTA */}
      <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4"
        style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(99,102,241,0.1)" }}>
        <div className="flex-1">
          <p className="text-[13px] font-black" style={{ color: "#1e293b" }}>Want to upgrade your plan?</p>
          <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>
            Contact our sales team or raise a support ticket to discuss plan upgrades.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <a href="tel:0100600400"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
            style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
            <Phone className="w-3.5 h-3.5" /> 010 060 0400
          </a>
          <a href="mailto:support@touchnet.co.za"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
            style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)" }}>
            <Mail className="w-3.5 h-3.5" /> Email Us
          </a>
        </div>
      </div>
    </div>
  );
}