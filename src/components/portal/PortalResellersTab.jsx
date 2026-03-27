import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Users, Plus, Gift, TrendingUp, CheckCircle2, Clock, XCircle,
  Phone, Mail, MapPin, ChevronDown, ChevronUp, Loader2, Star,
  DollarSign, Share2, Award, Zap, Info
} from "lucide-react";
import { format } from "date-fns";

const STATUS_CFG = {
  submitted: { color: "#6366f1", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.25)",  label: "Submitted",  icon: Clock       },
  contacted: { color: "#06b6d4", bg: "rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.25)",   label: "Contacted",  icon: Phone       },
  quoted:    { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  label: "Quoted",     icon: Zap         },
  converted: { color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  label: "Converted!", icon: CheckCircle2},
  lost:      { color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)",    label: "Lost",       icon: XCircle     },
};

const REWARD_STATUS_CFG = {
  pending:   { color: "#f59e0b", label: "Reward Pending"   },
  approved:  { color: "#6366f1", label: "Reward Approved"  },
  paid:      { color: "#10b981", label: "Reward Paid"      },
  forfeited: { color: "#ef4444", label: "Forfeited"        },
};

const PLAN_LABELS = {
  basic_10mbps:       "Basic 10 Mbps",
  standard_50mbps:    "Standard 50 Mbps",
  premium_100mbps:    "Premium 100 Mbps",
  enterprise_500mbps: "Enterprise 500 Mbps",
  dedicated_1gbps:    "Dedicated 1 Gbps",
};

const REWARD_TIERS = [
  { conversions: 1,  reward: 250,  label: "Starter",   color: "#06b6d4", icon: "🌱" },
  { conversions: 3,  reward: 300,  label: "Active",    color: "#6366f1", icon: "⚡" },
  { conversions: 5,  reward: 400,  label: "Pro",       color: "#f59e0b", icon: "🔥" },
  { conversions: 10, reward: 500,  label: "Elite",     color: "#10b981", icon: "💎" },
];

const EMPTY_FORM = {
  referred_name: "", referred_email: "", referred_phone: "",
  referred_address: "", service_interest: "standard_50mbps", notes: "",
};

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl px-4 py-4 gap-1 relative overflow-hidden"
      style={{ background: "rgba(255,255,255,0.9)", border: `1px solid ${color}20`, boxShadow: `0 2px 16px ${color}10` }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}44, transparent)` }} />
      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <p className="text-[20px] font-black mono leading-none" style={{ color }}>{value}</p>
      <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-center leading-tight" style={{ color: "#94a3b8" }}>{label}</p>
    </div>
  );
}

function RewardTierCard({ tier, currentCount }) {
  const reached  = currentCount >= tier.conversions;
  const isNext   = !reached && (currentCount < tier.conversions);
  const progress = Math.min((currentCount / tier.conversions) * 100, 100);

  return (
    <div className="rounded-2xl p-4 relative overflow-hidden transition-all"
      style={{
        background: reached ? `${tier.color}08` : "rgba(248,250,252,0.9)",
        border: `1px solid ${reached ? tier.color + "30" : "rgba(226,232,240,0.8)"}`,
        boxShadow: reached ? `0 4px 20px ${tier.color}15` : "none",
      }}>
      {reached && <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${tier.color}, transparent)` }} />}

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{tier.icon}</span>
          <div>
            <p className="text-[13px] font-black" style={{ color: reached ? tier.color : "#334155" }}>{tier.label}</p>
            <p className="text-[10px]" style={{ color: "#94a3b8" }}>{tier.conversions} conversion{tier.conversions > 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[14px] font-black mono" style={{ color: reached ? tier.color : "#64748b" }}>
            R{tier.reward}
          </p>
          <p className="text-[9px] font-bold uppercase" style={{ color: "#94a3b8" }}>per referral</p>
        </div>
      </div>

      <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(226,232,240,0.8)" }}>
        <div className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${progress}%`, background: reached ? `linear-gradient(90deg, ${tier.color}, ${tier.color}88)` : "rgba(148,163,184,0.4)" }} />
      </div>
      {reached && (
        <div className="flex items-center gap-1 mt-1.5">
          <CheckCircle2 className="w-3 h-3" style={{ color: tier.color }} />
          <span className="text-[9px] font-bold" style={{ color: tier.color }}>Tier unlocked</span>
        </div>
      )}
    </div>
  );
}

function ReferralCard({ referral }) {
  const [open, setOpen] = useState(false);
  const sc  = STATUS_CFG[referral.status]       || STATUS_CFG.submitted;
  const rsc = REWARD_STATUS_CFG[referral.reward_status] || REWARD_STATUS_CFG.pending;
  const Icon = sc.icon;

  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{ background: "rgba(255,255,255,0.95)", border: `1px solid ${sc.color}18`, boxShadow: "0 2px 16px rgba(99,102,241,0.06)" }}>
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${sc.color}, transparent)` }} />

      <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        onClick={() => setOpen(v => !v)}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
          <Icon className="w-4 h-4" style={{ color: sc.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold truncate" style={{ color: "#1e293b" }}>{referral.referred_name}</p>
          <p className="text-[11px] truncate" style={{ color: "#94a3b8" }}>{referral.referred_email}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide"
            style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
            {sc.label}
          </span>
          {referral.reward_amount > 0 && (
            <span className="text-[10px] font-black px-2 py-1 rounded-full"
              style={{ background: `${rsc.color}10`, color: rsc.color, border: `1px solid ${rsc.color}25` }}>
              R{referral.reward_amount}
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4" style={{ color: "#94a3b8" }} />
                : <ChevronDown className="w-4 h-4" style={{ color: "#94a3b8" }} />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 grid grid-cols-2 gap-2"
          style={{ borderTop: "1px solid rgba(226,232,240,0.5)" }}>
          {[
            { label: "Phone",    value: referral.referred_phone   || "—" },
            { label: "Address",  value: referral.referred_address || "—" },
            { label: "Plan",     value: PLAN_LABELS[referral.service_interest] || "—" },
            { label: "Submitted",value: referral.created_date ? format(new Date(referral.created_date), "d MMM yyyy") : "—" },
            { label: "Reward Type", value: referral.reward_type?.replace(/_/g, " ") || "—" },
            { label: "Reward Status", value: rsc.label, color: rsc.color },
          ].map(item => (
            <div key={item.label} className="rounded-xl px-3 py-2.5"
              style={{ background: "rgba(248,250,252,0.8)", border: "1px solid rgba(226,232,240,0.6)" }}>
              <p className="text-[9px] uppercase tracking-wider font-black" style={{ color: "#94a3b8" }}>{item.label}</p>
              <p className="text-[12px] font-bold capitalize mt-0.5 truncate" style={{ color: item.color || "#334155" }}>{item.value}</p>
            </div>
          ))}
          {referral.notes && (
            <div className="col-span-2 rounded-xl px-3 py-2.5"
              style={{ background: "rgba(248,250,252,0.8)", border: "1px solid rgba(226,232,240,0.6)" }}>
              <p className="text-[9px] uppercase tracking-wider font-black mb-0.5" style={{ color: "#94a3b8" }}>Notes</p>
              <p className="text-[11px]" style={{ color: "#475569" }}>{referral.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReferralForm({ customer, onSuccess, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Referral.create(data),
    onSuccess,
  });

  const validate = () => {
    const e = {};
    if (!form.referred_name.trim())  e.referred_name  = "Required";
    if (!form.referred_email.trim()) e.referred_email = "Required";
    if (!/\S+@\S+\.\S+/.test(form.referred_email)) e.referred_email = "Valid email required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    createMut.mutate({
      ...form,
      referrer_customer_id: customer.id,
      referrer_name:        customer.full_name,
      referrer_email:       customer.email,
      status:               "submitted",
      reward_status:        "pending",
    });
  };

  const field = (key, label, type = "text", placeholder = "") => (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-all"
        style={{
          background: "rgba(248,250,252,0.9)",
          border: `1px solid ${errors[key] ? "#ef4444" : "rgba(226,232,240,0.9)"}`,
          color: "#1e293b",
        }}
      />
      {errors[key] && <p className="text-[10px] text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {field("referred_name",  "Full Name *",   "text", "John Smith")}
        {field("referred_email", "Email *",       "email","john@example.com")}
        {field("referred_phone", "Phone Number",  "tel",  "+27 71 234 5678")}
        {field("referred_address","Address / Area","text", "Sandton, Johannesburg")}
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>Interested Service Plan</label>
        <select
          value={form.service_interest}
          onChange={e => setForm(f => ({ ...f, service_interest: e.target.value }))}
          className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
          style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }}>
          {Object.entries(PLAN_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>Additional Notes</label>
        <textarea
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Any extra info about this lead…"
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none resize-none"
          style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)", color: "#1e293b" }}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:bg-slate-100"
          style={{ border: "1px solid rgba(226,232,240,0.9)", color: "#64748b" }}>
          Cancel
        </button>
        <button type="submit" disabled={createMut.isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
          {createMut.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</> : <><Share2 className="w-4 h-4" />Submit Referral</>}
        </button>
      </div>
    </form>
  );
}

export default function PortalResellersTab({ customer }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ["portal-referrals", customer.id],
    queryFn: () => base44.entities.Referral.filter({ referrer_customer_id: customer.id }, "-created_date"),
    enabled: !!customer.id,
  });

  const totalConverted    = referrals.filter(r => r.status === "converted").length;
  const totalEarned       = referrals.filter(r => r.reward_status === "paid").reduce((a, r) => a + (r.reward_amount || 0), 0);
  const pendingRewards    = referrals.filter(r => r.reward_status === "approved" || (r.status === "converted" && r.reward_status === "pending")).reduce((a, r) => a + (r.reward_amount || 0), 0);
  const activeReferrals   = referrals.filter(r => !["converted","lost"].includes(r.status)).length;

  // Current reward tier based on conversions
  const currentTier = [...REWARD_TIERS].reverse().find(t => totalConverted >= t.conversions) || null;

  return (
    <div className="space-y-5">

      {/* Hero banner */}
      <div className="rounded-3xl overflow-hidden relative"
        style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.06))", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 4px 32px rgba(99,102,241,0.08)" }}>
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4,transparent)" }} />
        <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
          style={{ background: "radial-gradient(circle at 80% 20%, rgba(99,102,241,0.12), transparent 65%)" }} />
        <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <Award className="w-6 h-6" style={{ color: "#6366f1" }} />
          </div>
          <div className="flex-1">
            <h2 className="text-[17px] font-black" style={{ color: "#1e293b", fontFamily: "'Space Grotesk',sans-serif" }}>
              TouchNet Reseller Programme
            </h2>
            <p className="text-[12px] mt-1" style={{ color: "#64748b" }}>
              Earn rewards for every successful referral. The more you convert, the higher your reward per referral.
            </p>
          </div>
          {currentTier && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl flex-shrink-0"
              style={{ background: `${currentTier.color}10`, border: `1px solid ${currentTier.color}25` }}>
              <span className="text-xl">{currentTier.icon}</span>
              <div>
                <p className="text-[11px] font-black" style={{ color: currentTier.color }}>{currentTier.label} Reseller</p>
                <p className="text-[9px] mono font-bold" style={{ color: currentTier.color }}>R{currentTier.reward}/conversion</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatPill icon={Users}       label="Total Referrals"   value={referrals.length}      color="#6366f1" />
        <StatPill icon={CheckCircle2}label="Converted"         value={totalConverted}          color="#10b981" />
        <StatPill icon={TrendingUp}  label="Active Leads"      value={activeReferrals}         color="#f59e0b" />
        <StatPill icon={DollarSign}  label="Total Earned"      value={`R${totalEarned}`}       color="#06b6d4" />
      </div>

      {/* Pending rewards banner */}
      {pendingRewards > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <Gift className="w-5 h-5 flex-shrink-0" style={{ color: "#10b981" }} />
          <p className="text-[12px] font-semibold flex-1" style={{ color: "#10b981" }}>
            You have <strong>R{pendingRewards}</strong> in approved rewards awaiting payout. Contact support to process.
          </p>
        </div>
      )}

      {/* Reward tiers */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-3" style={{ color: "#94a3b8" }}>
          Reward Tiers — {totalConverted} conversion{totalConverted !== 1 ? "s" : ""} so far
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {REWARD_TIERS.map(tier => (
            <RewardTierCard key={tier.label} tier={tier} currentCount={totalConverted} />
          ))}
        </div>
        <div className="flex items-start gap-2 mt-2.5 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.12)" }}>
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#6366f1" }} />
          <p className="text-[11px]" style={{ color: "#64748b" }}>
            Rewards are credited once a referred lead signs a contract and pays their first invoice. Reward tier is based on your total lifetime conversions.
          </p>
        </div>
      </div>

      {/* Referral list + add button */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: "#94a3b8" }}>
            My Referrals ({referrals.length})
          </p>
          {!showForm && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
              <Plus className="w-3.5 h-3.5" /> Add Referral
            </button>
          )}
        </div>

        {/* Inline form */}
        {showForm && (
          <div className="rounded-2xl overflow-hidden mb-4"
            style={{ background: "rgba(255,255,255,0.98)", border: "1px solid rgba(99,102,241,0.2)", boxShadow: "0 4px 24px rgba(99,102,241,0.1)" }}>
            <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6,transparent)" }} />
            <div className="px-5 py-4">
              <p className="text-[14px] font-black mb-4" style={{ color: "#1e293b", fontFamily: "'Space Grotesk',sans-serif" }}>
                New Referral
              </p>
              <ReferralForm
                customer={customer}
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ["portal-referrals", customer.id] });
                  setShowForm(false);
                }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#6366f1" }} />
          </div>
        ) : referrals.length === 0 && !showForm ? (
          <div className="rounded-2xl p-10 text-center"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px dashed rgba(99,102,241,0.2)" }}>
            <Share2 className="w-8 h-8 mx-auto mb-3" style={{ color: "#a5b4fc" }} />
            <p className="text-[13px] font-bold" style={{ color: "#334155" }}>No referrals yet</p>
            <p className="text-[11px] mt-1 mb-4" style={{ color: "#94a3b8" }}>Start earning by referring friends and businesses!</p>
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
              <Plus className="w-4 h-4" /> Add Your First Referral
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map(r => <ReferralCard key={r.id} referral={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}