import React from "react";
import { X, Zap, DollarSign, CheckCircle2, ArrowLeftRight } from "lucide-react";

const PROVIDER_COLORS = {
  "Openserve":   "#0ea5e9",
  "Vumatel":     "#8b5cf6",
  "MetroFibre":  "#10b981",
  "Frogfoot":    "#f59e0b",
  "Evotel":      "#ef4444",
  "Link Africa": "#06b6d4",
  "Other":       "#64748b",
};

const COMMON_BENEFITS = [
  "Uncapped Data",
  "No Speed Throttling",
  "24/7 Support",
  "Static IP",
  "Free Installation",
  "Router Included",
  "SLA Guarantee",
  "Business Grade",
];

function getSpeed(speedStr) {
  if (!speedStr) return 0;
  const n = parseInt(speedStr.replace(/[^0-9]/g, ""));
  return isNaN(n) ? 0 : n;
}

function SpeedBar({ speed, maxSpeed, color }) {
  const pct = maxSpeed > 0 ? Math.min((speed / maxSpeed) * 100, 100) : 0;
  return (
    <div className="w-full h-2 rounded-full mt-1" style={{ background: "rgba(226,232,240,0.8)" }}>
      <div className="h-2 rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)`, boxShadow: `0 0 8px ${color}60` }} />
    </div>
  );
}

function inferBenefits(plan) {
  const name = (plan.name || "").toLowerCase();
  const speed = getSpeed(plan.speed);
  const benefits = [];
  if (name.includes("uncapped") || speed >= 10) benefits.push("Uncapped Data");
  if (speed >= 50) benefits.push("No Speed Throttling");
  benefits.push("24/7 Support");
  if (name.includes("business") || name.includes("enterprise") || speed >= 200) benefits.push("Business Grade");
  if (name.includes("static") || name.includes("business")) benefits.push("Static IP");
  if (!name.includes("install fee")) benefits.push("Free Installation");
  if (speed >= 100) benefits.push("SLA Guarantee");
  if (name.includes("router") || name.includes("equipment")) benefits.push("Router Included");
  return benefits;
}

export default function PlanCompare({ plans, onClose }) {
  const [a, b] = plans;
  if (!a || !b) return null;

  const colorA = PROVIDER_COLORS[a.providerName] || PROVIDER_COLORS["Other"];
  const colorB = PROVIDER_COLORS[b.providerName] || PROVIDER_COLORS["Other"];
  const speedA = getSpeed(a.plan.speed);
  const speedB = getSpeed(b.plan.speed);
  const priceA = parseFloat(a.plan.price) || 0;
  const priceB = parseFloat(b.plan.price) || 0;
  const maxSpeed = Math.max(speedA, speedB, 1);

  const fasterPlan  = speedA > speedB ? "A" : speedB > speedA ? "B" : null;
  const cheaperPlan = priceA > 0 && priceB > 0 ? (priceA < priceB ? "A" : priceB < priceA ? "B" : null) : null;
  const benefitsA   = inferBenefits(a.plan);
  const benefitsB   = inferBenefits(b.plan);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(12px)" }}>
      <div className="w-full rounded-3xl overflow-hidden flex flex-col"
        style={{
          maxWidth: 720,
          maxHeight: "90vh",
          background: "white",
          border: "1px solid rgba(99,102,241,0.2)",
          boxShadow: "0 32px 100px rgba(99,102,241,0.2)",
        }}>

        <div className="h-[3px] flex-shrink-0" style={{ background: `linear-gradient(90deg, ${colorA}, #6366f1, ${colorB})` }} />
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(226,232,240,0.6)" }}>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5" style={{ color: "#6366f1" }} />
            <p className="text-[16px] font-black" style={{ color: "#1e293b" }}>Plan Comparison</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3 px-6 pt-5 pb-4">
            {[{ item: a, color: colorA }, { item: b, color: colorB }].map(({ item, color }, i) => (
              <div key={i} className="rounded-2xl p-4"
                style={{ background: `${color}08`, border: `1px solid ${color}25` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <span className="text-[11px] font-black" style={{ color }}>{item.providerName[0]}</span>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color }}>{item.providerName}</p>
                <p className="text-[15px] font-black mt-0.5" style={{ color: "#1e293b" }}>{item.plan.name}</p>
              </div>
            ))}
          </div>

          <div className="px-6 pb-6 space-y-4">
            {/* Speed */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(226,232,240,0.8)" }}>
              <div className="px-4 py-2.5 flex items-center gap-2"
                style={{ background: "rgba(248,250,252,0.8)", borderBottom: "1px solid rgba(226,232,240,0.6)" }}>
                <Zap className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />
                <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#475569" }}>Speed</p>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-100">
                {[
                  { item: a, color: colorA, speed: speedA, badge: fasterPlan === "A" },
                  { item: b, color: colorB, speed: speedB, badge: fasterPlan === "B" },
                ].map(({ item, color, speed, badge }, i) => (
                  <div key={i} className="px-4 py-3 relative">
                    {badge && (
                      <span className="absolute top-2 right-3 text-[9px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>FASTER</span>
                    )}
                    <p className="text-[24px] font-black mono" style={{ color }}>{item.plan.speed || "—"}</p>
                    <SpeedBar speed={speed} maxSpeed={maxSpeed} color={color} />
                  </div>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(226,232,240,0.8)" }}>
              <div className="px-4 py-2.5 flex items-center gap-2"
                style={{ background: "rgba(248,250,252,0.8)", borderBottom: "1px solid rgba(226,232,240,0.6)" }}>
                <DollarSign className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
                <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#475569" }}>Monthly Price</p>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-100">
                {[
                  { item: a, color: colorA, price: priceA, badge: cheaperPlan === "A" },
                  { item: b, color: colorB, price: priceB, badge: cheaperPlan === "B" },
                ].map(({ item, color, price, badge }, i) => (
                  <div key={i} className="px-4 py-3 relative">
                    {badge && (
                      <span className="absolute top-2 right-3 text-[9px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(16,185,129,0.12)", color: "#059669", border: "1px solid rgba(16,185,129,0.25)" }}>CHEAPER</span>
                    )}
                    <p className="text-[24px] font-black mono" style={{ color: price ? "#1e293b" : "#94a3b8" }}>
                      {price ? `R${price}` : "—"}
                    </p>
                    {price > 0 && <p className="text-[10px] mt-0.5" style={{ color: "#94a3b8" }}>per month</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Value ratio */}
            {speedA > 0 && speedB > 0 && priceA > 0 && priceB > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(226,232,240,0.8)" }}>
                <div className="px-4 py-2.5"
                  style={{ background: "rgba(248,250,252,0.8)", borderBottom: "1px solid rgba(226,232,240,0.6)" }}>
                  <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#475569" }}>Value (Mbps per Rand)</p>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-100">
                  {[
                    { color: colorA, ratio: (speedA / priceA), better: (speedA / priceA) > (speedB / priceB) },
                    { color: colorB, ratio: (speedB / priceB), better: (speedB / priceB) > (speedA / priceA) },
                  ].map(({ color, ratio, better }, i) => (
                    <div key={i} className="px-4 py-3 relative">
                      {better && (
                        <span className="absolute top-2 right-3 text-[9px] font-black px-2 py-0.5 rounded-full"
                          style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>BEST VALUE</span>
                      )}
                      <p className="text-[22px] font-black mono" style={{ color }}>{ratio.toFixed(3)}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "#94a3b8" }}>Mbps / R</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(226,232,240,0.8)" }}>
              <div className="px-4 py-2.5 flex items-center gap-2"
                style={{ background: "rgba(248,250,252,0.8)", borderBottom: "1px solid rgba(226,232,240,0.6)" }}>
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
                <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#475569" }}>Included Benefits</p>
              </div>
              {COMMON_BENEFITS.map((benefit, i) => {
                const hasA = benefitsA.includes(benefit);
                const hasB = benefitsB.includes(benefit);
                if (!hasA && !hasB) return null;
                return (
                  <div key={i} className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    style={{ borderTop: i > 0 ? "1px solid rgba(226,232,240,0.4)" : "none" }}>
                    <div className="flex justify-end pr-3">
                      {hasA
                        ? <CheckCircle2 className="w-4 h-4" style={{ color: colorA }} />
                        : <div className="w-4 h-4 rounded-full" style={{ background: "rgba(226,232,240,0.8)" }} />}
                    </div>
                    <p className="text-[11px] font-semibold text-center px-3" style={{ color: "#475569", whiteSpace: "nowrap" }}>{benefit}</p>
                    <div className="flex justify-start pl-3">
                      {hasB
                        ? <CheckCircle2 className="w-4 h-4" style={{ color: colorB }} />
                        : <div className="w-4 h-4 rounded-full" style={{ background: "rgba(226,232,240,0.8)" }} />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Verdict */}
            {(fasterPlan || cheaperPlan) && (
              <div className="rounded-2xl p-4"
                style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.07),rgba(139,92,246,0.05))", border: "1px solid rgba(99,102,241,0.15)" }}>
                <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "#6366f1" }}>Quick Verdict</p>
                <div className="space-y-1.5 text-[12px]" style={{ color: "#475569" }}>
                  {fasterPlan && (
                    <p>⚡ <strong style={{ color: fasterPlan === "A" ? colorA : colorB }}>
                      {fasterPlan === "A" ? a.plan.name : b.plan.name}
                    </strong> is faster ({fasterPlan === "A" ? a.plan.speed : b.plan.speed} vs {fasterPlan === "A" ? b.plan.speed : a.plan.speed})</p>
                  )}
                  {cheaperPlan && (
                    <p>💰 <strong style={{ color: cheaperPlan === "A" ? colorA : colorB }}>
                      {cheaperPlan === "A" ? a.plan.name : b.plan.name}
                    </strong> is cheaper (R{cheaperPlan === "A" ? priceA : priceB} vs R{cheaperPlan === "A" ? priceB : priceA}/mo)</p>
                  )}
                  {benefitsA.length !== benefitsB.length && (
                    <p>✅ <strong style={{ color: benefitsA.length > benefitsB.length ? colorA : colorB }}>
                      {benefitsA.length > benefitsB.length ? a.plan.name : b.plan.name}
                    </strong> has more included benefits</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}