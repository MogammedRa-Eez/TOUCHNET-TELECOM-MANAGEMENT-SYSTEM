import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function TicketOverview({ tickets }) {
  const statusCounts = {
    open: tickets.filter(t => t.status === "open").length,
    in_progress: tickets.filter(t => t.status === "in_progress").length,
    escalated: tickets.filter(t => t.status === "escalated").length,
    resolved: tickets.filter(t => t.status === "resolved").length,
  };

  const data = [
    { name: "Open", value: statusCounts.open, color: "#f59e0b" },
    { name: "In Progress", value: statusCounts.in_progress, color: "#3b82f6" },
    { name: "Escalated", value: statusCounts.escalated, color: "#ef4444" },
    { name: "Resolved", value: statusCounts.resolved, color: "#22c55e" },
  ].filter(d => d.value > 0);

  const total = tickets.length;

  return (
    <div className="rounded-xl p-6" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <h3 className="text-[13px] font-semibold text-slate-700 mb-1">Ticket Status</h3>
      <p className="text-[11px] mb-4" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>Active support tickets</p>
      
      <div className="flex items-center gap-6">
        <div className="w-32 h-32 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.length ? data : [{ name: "None", value: 1, color: "#e2e8f0" }]}
                innerRadius={35}
                outerRadius={55}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {(data.length ? data : [{ color: "#e2e8f0" }]).map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{total}</p>
               <p className="text-[10px]" style={{ color: "#94a3b8" }}>Total</p>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          {data.map(item => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-[12px] text-slate-400">{item.name}</span>
              </div>
              <span className="text-[12px] font-semibold text-slate-200" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}