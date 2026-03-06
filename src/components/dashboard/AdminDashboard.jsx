import React from "react";
import { Users, DollarSign, TicketCheck, Wifi, Globe } from "lucide-react";
import KPICard from "./KPICard";
import RevenueChart from "./RevenueChart";
import TicketOverview from "./TicketOverview";
import NetworkHealth from "./NetworkHealth";
import RecentActivity from "./RecentActivity";
import UserActivityPanel from "./UserActivityPanel";
import NetworkGlobe from "./NetworkGlobe";

export default function AdminDashboard({ customers, invoices, tickets, nodes }) {
  const activeCustomers = customers.filter(c => c.status === "active").length;
  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((a, i) => a + (i.total || i.amount || 0), 0);
  const openTickets = tickets.filter(t => !["resolved", "closed"].includes(t.status)).length;
  const onlineNodes = nodes.filter(n => n.status === "online").length;
  const offlineNodes = nodes.filter(n => n.status === "offline").length;
  const degradedNodes = nodes.filter(n => n.status === "degraded").length;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Role Badge */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: "rgba(192,21,42,0.12)", color: "#c0152a", border: "1px solid rgba(192,21,42,0.25)" }}>
          ADMIN — FULL ACCESS
        </span>
      </div>

      {/* Hero Globe Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(135deg, #070b1f 0%, #0f1845 60%, #070b1f 100%)", border: "1px solid rgba(26,37,80,0.4)", minHeight: 360 }}>
          <div className="absolute top-4 left-5 z-10">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-300 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Network Coverage</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 ml-6">Drag to rotate</p>
          </div>
          <div className="absolute bottom-4 left-5 z-10 flex flex-col gap-1">
            {[
              { color: "#34d399", label: `${onlineNodes} Online` },
              { color: "#fbbf24", label: `${degradedNodes} Degraded` },
              { color: "#ef4444", label: `${offlineNodes} Offline` },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                <span className="text-[10px] text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
              </div>
            ))}
          </div>
          <div className="w-full" style={{ height: 360 }}>
            <NetworkGlobe nodes={nodes} />
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4 content-start">
          <KPICard title="Active Customers" value={activeCustomers.toLocaleString()} subtitle={`${customers.length} total accounts`} icon={Users} color="blue" trend="up" trendValue="+12%" />
          <KPICard title="Monthly Revenue" value={`R${totalRevenue.toLocaleString()}`} subtitle="From paid invoices" icon={DollarSign} color="emerald" trend="up" trendValue="+8.5%" />
          <KPICard title="Open Tickets" value={openTickets} subtitle={`${tickets.length} total tickets`} icon={TicketCheck} color="amber" trend={openTickets > 10 ? "up" : "down"} trendValue={openTickets > 10 ? "High" : "Normal"} />
          <KPICard title="Network Nodes" value={`${onlineNodes}/${nodes.length}`} subtitle="Currently online" icon={Wifi} color="violet" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><RevenueChart invoices={invoices} /></div>
        <TicketOverview tickets={tickets} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <NetworkHealth nodes={nodes} />
        <RecentActivity customers={customers} tickets={tickets} invoices={invoices} />
      </div>

      <UserActivityPanel customers={customers} tickets={tickets} invoices={invoices} />
    </div>
  );
}