import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TicketCheck } from "lucide-react";

const ITEMS = [
  { key: "open",        name: "Open",        color: "#f59e0b", bg: "rgba(245,158,11,0.08)"  },
  { key: "in_progress", name: "In Progress", color: "#7c3aed", bg: "rgba(124,58,237,0.08)"  },
  { key: "escalated",   name: "Escalated",   color: "#ef4444", bg: "rgba(239,68,68,0.08)"   },
  { key: "resolved",    name: "Resolved",    color: "#10b981", bg: "rgba(16,185,129,0.08)"  },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg px-3 py-2 shadow-xl text-[11px]" style={{ background: "#1a2235", border: `1px solid ${p.payload.color}44`, color: "#e2e8f0", fontFamily: "'JetBrains Mono', monospace" }}>
      <span style={{ color: p.payload.color }}>{p.name}:</span> {p.value}
    </div>
  );
};

export default function TicketOverview({ tickets }) {
  const counts = Object.fromEntries(ITEMS.map(i => [i.key, tickets.filter(t => t.status === i.key).length]));
  const data   = ITEMS.map(i => ({ ...i, value: counts[i.key] })).filter(d => d.value > 0);
  const total  = tickets.length;

  return (
    <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "#111827", border: "1px solid rgba(124,58,237,0.14)", boxShadow: "0 4px 24px rgba(0,0,0,0.35)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(124,58,237,0.04) 0%, transparent 70%)" }} />

      <div className="flex items-center gap-2 mb-5">
        <TicketCheck className="w-4 h-4" style={{ color: "#a78bfa" }} />
        <div>
          <h3 className="text-[14px] font-bold" style={{ color: "#e2e8f0" }}>Ticket Status</h3>
          <p className="text-[11px] mono" style={{ color: "rgba(148,163,184,0.5)" }}>Active support tickets</p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="w-36 h-36 relative flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.length ? data : [{ name: "None", value: 1, color: "#1e2a42" }]}
                innerRadius={42}
                outerRadius={62}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
                startAngle={90}
                endAngle={-270}
              >
                {(data.length ? data : [{ color: "#1e2a42" }]).map((entry, i) => (
                  <Cell key={i} fill={entry.color} style={{ filter: `drop-shadow(0 0 4px ${entry.color}66)` }} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-[22px] font-extrabold text-white mono">{total}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>Total</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          {ITEMS.map(item => {
            const val = counts[item.key];
            const pct = total ? Math.round((val / total) * 100) : 0;
            return (
              <div key={item.key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color, boxShadow: `0 0 4px ${item.color}88` }} />
                    <span className="text-[11px] font-medium" style={{ color: "#94a3b8" }}>{item.name}</span>
                  </div>
                  <span className="text-[12px] font-bold text-white mono">{val}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: item.color, boxShadow: `0 0 4px ${item.color}55`, transition: "width 0.7s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}