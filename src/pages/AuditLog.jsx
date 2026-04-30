import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Shield, Search, RefreshCw, Clock, User, Database, Filter } from "lucide-react";
import { format } from "date-fns";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";

const ENTITY_COLORS = {
  Customer: "#10b981", Invoice: "#f59e0b", Ticket: "#00b4b4",
  FibreProject: "#a855f7", Employee: "#e02347", NetworkNode: "#06b6d4",
  Role: "#8b5cf6", Quote: "#f97316",
};

const EVENT_ICONS = { create: "✚", update: "✎", delete: "✕" };
const EVENT_COLORS = { create: "#10b981", update: "#f59e0b", delete: "#e02347" };

const ENTITIES_TO_WATCH = [
  "Customer", "Invoice", "Ticket", "FibreProject", "Employee",
  "NetworkNode", "Role", "Quote", "ProjectTask"
];

export default function AuditLog() {
  const { isAdmin, loading: rbacLoading } = useRBAC();
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");

  // Fetch recent records from each entity to build an audit-like view
  const { data: activities = [], isLoading, refetch } = useQuery({
    queryKey: ["audit-log"],
    queryFn: async () => {
      const results = await Promise.all(
        ENTITIES_TO_WATCH.map(async (entity) => {
          try {
            const records = await base44.entities[entity].list("-updated_date", 30);
            return records.map(r => ({
              entity,
              id: r.id,
              name: r.full_name || r.subject || r.project_name || r.invoice_number || r.quote_number || r.name || r.title || r.id,
              actor: r.created_by || "System",
              created_date: r.created_date,
              updated_date: r.updated_date,
              isNew: r.created_date === r.updated_date || !r.updated_date,
            }));
          } catch {
            return [];
          }
        })
      );
      return results.flat().sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date));
    },
    enabled: !rbacLoading && isAdmin,
    refetchInterval: 30000,
  });

  if (!rbacLoading && !isAdmin) return <AccessDenied />;

  const filtered = activities.filter(a => {
    const matchEntity = entityFilter === "all" || a.entity === entityFilter;
    const matchSearch = !search || a.name?.toLowerCase().includes(search.toLowerCase()) || a.actor?.toLowerCase().includes(search.toLowerCase()) || a.entity?.toLowerCase().includes(search.toLowerCase());
    return matchEntity && matchSearch;
  });

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-5"
        style={{ background: "linear-gradient(135deg,#141414,#1a1a1a)", border: "1px solid rgba(0,180,180,0.28)" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.5),#8B1A1A,transparent)" }} />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(0,180,180,0.15)", border: "1px solid rgba(0,180,180,0.4)" }}>
              <Shield className="w-5 h-5" style={{ color: "#00b4b4" }} />
            </div>
            <div>
              <h1 className="text-xl font-black" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#f0f0f0" }}>Audit Log</h1>
              <p className="text-[11px] mono" style={{ color: "rgba(255,255,255,0.35)" }}>
                {filtered.length} recent activity records across all entities
              </p>
            </div>
          </div>
          <button onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#b0b0b0" }}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, actor or entity…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] outline-none"
            style={{ background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)", color: "#e0e0e0" }} />
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          <Filter className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
          {["all", ...ENTITIES_TO_WATCH].map(e => (
            <button key={e} onClick={() => setEntityFilter(e)}
              className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105"
              style={{
                background: entityFilter === e ? `${ENTITY_COLORS[e] || "rgba(0,180,180,1)"}18` : "rgba(255,255,255,0.04)",
                border: entityFilter === e ? `1px solid ${ENTITY_COLORS[e] || "rgba(0,180,180,1)"}50` : "1px solid rgba(255,255,255,0.08)",
                color: entityFilter === e ? (ENTITY_COLORS[e] || "#00b4b4") : "rgba(255,255,255,0.35)",
              }}>
              {e === "all" ? "All" : e}
            </button>
          ))}
        </div>
      </div>

      {/* Log Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "#181818", border: "1px solid rgba(0,212,212,0.15)" }}>
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.3),transparent)" }} />
        <div className="flex items-center gap-3 px-5 py-2.5"
          style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {["Event", "Entity", "Record", "Actor", "Timestamp"].map(h => (
            <p key={h} className="text-[9px] font-black uppercase tracking-wider flex-1"
              style={{ color: "rgba(255,255,255,0.3)" }}>{h}</p>
          ))}
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>Loading audit log…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Shield className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.1)" }} />
            <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>No records found</p>
          </div>
        ) : filtered.map((a, i) => {
          const event = a.isNew ? "create" : "update";
          const entityColor = ENTITY_COLORS[a.entity] || "#00b4b4";
          const ts = a.updated_date || a.created_date;
          return (
            <div key={`${a.entity}-${a.id}-${i}`} className="flex items-center gap-3 px-5 py-3 fx-data-row"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex-1">
                <span className="text-[11px] font-black px-2 py-0.5 rounded-md"
                  style={{ background: `${EVENT_COLORS[event]}15`, color: EVENT_COLORS[event], border: `1px solid ${EVENT_COLORS[event]}30` }}>
                  {EVENT_ICONS[event]} {event}
                </span>
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md capitalize"
                  style={{ background: `${entityColor}12`, color: entityColor, border: `1px solid ${entityColor}25` }}>
                  {a.entity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold truncate" style={{ color: "#e0e0e0" }}>{a.name || "—"}</p>
              </div>
              <div className="flex-1 flex items-center gap-1.5">
                <User className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />
                <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{a.actor || "—"}</p>
              </div>
              <div className="flex-1 flex items-center gap-1.5">
                <Clock className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.2)" }} />
                <p className="text-[11px] mono" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {ts ? format(new Date(ts), "dd MMM yy HH:mm") : "—"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}