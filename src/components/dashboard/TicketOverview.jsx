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
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800 mb-1">Ticket Status</h3>
      <p className="text-xs text-slate-400 mb-4">Active support tickets</p>
      
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
              <p className="text-xl font-bold text-slate-800">{total}</p>
              <p className="text-[10px] text-slate-400">Total</p>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          {data.map(item => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-slate-600">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}