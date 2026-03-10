import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TicketCheck } from "lucide-react";

const ITEMS = [
  { key: "open",        name: "Open",        color: "#f59e0b" },
  { key: "in_progress", name: "In Progress", color: "#6366f1" },
  { key: "escalated",   name: "Escalated",   color: "#ef4444" },
  { key: "resolved",    name: "Resolved",    color: "#10b981" },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg px-3 py-2 shadow-lg text-[11px]" style={{ background: "#ffffff", border: `1px solid ${p.payload.color}40`, color: "#1e293b", fontFamily: "'JetBrains Mono', monospace", boxShadow: "0 4px 16px rgba(99,102,241,0.12)" }}>
      <span style={{ color: p.payload.color }}>{p.name}:</span> {p.value}
    </div>
  );
};

export default function TicketOverview({ tickets }) {
  const counts = Object.fromEntries(ITEMS.map(i => [i.key, tickets.filter(t => t.status === i.key).length]));
  const data   = ITEMS.map(i => ({ ...i, value: counts[i.key] })).filter(d => d.value > 0);
  const total  = tickets.length;

  return (
    <div className="rounded-2xl p-6 relative overflow-hidden"
      style={{ background: "#ffffff", border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 2px 16px rgba(99,102,241,0.06)" }}>
      <div className="flex items-center gap-2 mb-5">
        <TicketCheck className="w-4 h-4" style={{ color: "#6366f1" }} />
        <div>
          <h3 className="text-[14px] font-bold" style={{ color: "#1e293b" }}>Ticket Status</h3>
          <p className="text-[11px] mono" style={{ color: "rgba(100,116,139,0.5)" }}>Active support tickets</p>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <div className="w-36 h-36 relative flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.length ? data : [{ name: "None", value: 1, color: "rgba(99,102,241,0.08)" }]}
                innerRadius={42} outerRadius={62} paddingAngle={4} dataKey="value" strokeWidth={0} startAngle={90} endAngle={-270}
              >
                {(data.length ? data : [{ color: "rgba(99,102,241,0.08)" }]).map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-[22px] font-extrabold mono" style={{ color: "#1e293b" }}>{total}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>Total</p>
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
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-[11px] font-medium" style={{ color: "#64748b" }}>{item.name}</span>
                  </div>
                  <span className="text-[12px] font-bold mono" style={{ color: "#1e293b" }}>{val}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(99,102,241,0.07)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: item.color, transition: "width 0.7s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}