import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TicketCheck } from "lucide-react";

const ITEMS = [
  { key: "open",        name: "Open",        color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  { key: "in_progress", name: "In Progress", color: "#6366f1", bg: "rgba(99,102,241,0.1)"  },
  { key: "escalated",   name: "Escalated",   color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
  { key: "resolved",    name: "Resolved",    color: "#10b981", bg: "rgba(16,185,129,0.1)"  },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-xl px-3 py-2 shadow-xl text-[11px]" style={{ background: "rgba(15,23,42,0.9)", border: `1px solid ${p.payload.color}55`, backdropFilter: "blur(8px)", color: "#f1f5f9", fontFamily: "'JetBrains Mono', monospace" }}>
      <span style={{ color: p.payload.color }}>{p.name}:</span> {p.value}
    </div>
  );
};

export default function TicketOverview({ tickets }) {
  const counts = Object.fromEntries(ITEMS.map(i => [i.key, tickets.filter(t => t.status === i.key).length]));
  const data   = ITEMS.map(i => ({ ...i, value: counts[i.key] })).filter(d => d.value > 0);
  const total  = tickets.length;

  return (
    <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(245,158,11,0.03) 0%, transparent 70%)" }} />

      <div className="flex items-center gap-2 mb-5">
        <TicketCheck className="w-4 h-4 text-amber-500" />
        <div>
          <h3 className="text-[14px] font-bold text-slate-800">Ticket Status</h3>
          <p className="text-[11px] text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Active support tickets</p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Donut */}
        <div className="w-36 h-36 relative flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.length ? data : [{ name: "None", value: 1, color: "#e2e8f0" }]}
                innerRadius={42}
                outerRadius={62}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
                startAngle={90}
                endAngle={-270}
              >
                {(data.length ? data : [{ color: "#e2e8f0" }]).map((entry, i) => (
                  <Cell key={i} fill={entry.color} style={{ filter: `drop-shadow(0 0 4px ${entry.color}88)` }} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-[22px] font-extrabold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{total}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Total</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {ITEMS.map(item => {
            const val = counts[item.key];
            const pct = total ? Math.round((val / total) * 100) : 0;
            return (
              <div key={item.key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color, boxShadow: `0 0 4px ${item.color}88` }} />
                    <span className="text-[11px] font-medium text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-[12px] font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{val}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
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