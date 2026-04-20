import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Search, X, Users, UserCog, TicketCheck, Network, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

const ENTITY_CONFIG = [
  { key: "customers",  label: "Customers",  entity: "Customer",  icon: Users,      page: "Customers",    nameField: "full_name", subField: "email" },
  { key: "employees",  label: "Staff",      entity: "Employee",  icon: UserCog,    page: "Employees",    nameField: "full_name", subField: "role" },
  { key: "tickets",    label: "Tickets",    entity: "Ticket",    icon: TicketCheck,page: "Tickets",      nameField: "subject",   subField: "status" },
  { key: "projects",   label: "Projects",   entity: "FibreProject", icon: Network, page: "FibreProjects",nameField: "project_name", subField: "quote_number" },
];

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      const q = query.toLowerCase();
      const allResults = [];

      await Promise.all(
        ENTITY_CONFIG.map(async (cfg) => {
          const records = await base44.entities[cfg.entity].list();
          records
            .filter((r) => {
              const name = (r[cfg.nameField] || "").toLowerCase();
              const sub = (r[cfg.subField] || "").toLowerCase();
              return name.includes(q) || sub.includes(q);
            })
            .slice(0, 3)
            .forEach((r) => {
              allResults.push({ ...cfg, record: r });
            });
        })
      );

      setResults(allResults);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item) => {
    navigate(createPageUrl(item.page));
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <div
        className="flex items-center gap-2 rounded-xl px-3.5 py-2 w-64 transition-all"
        style={{
          background: open ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)",
          border: `1px solid ${open ? "rgba(0,212,212,0.5)" : "rgba(255,255,255,0.15)"}`,
          boxShadow: open ? "0 0 0 3px rgba(0,180,180,0.12)" : "none",
        }}
      >
        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: open ? "#00d4d4" : "rgba(255,255,255,0.45)" }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search..."
          className="bg-transparent text-sm outline-none w-full"
          style={{ color: "#f0f0f0", caretColor: "#00d4d4" }}
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); }} style={{ color: "rgba(255,255,255,0.4)" }} className="hover:opacity-80">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" style={{ color: "#00b4b4" }} />}
      </div>

      {open && query && (
        <div
          className="absolute top-full mt-2 left-0 w-80 rounded-xl shadow-2xl z-50 overflow-hidden"
          style={{ background: "#fff", border: "1px solid rgba(30,45,107,0.12)" }}
        >
          {results.length === 0 && !loading && (
            <div className="px-4 py-6 text-center text-sm text-slate-400">No results found</div>
          )}
          {results.length > 0 && (
            <div className="py-1">
              {ENTITY_CONFIG.map((cfg) => {
                const group = results.filter((r) => r.key === cfg.key);
                if (!group.length) return null;
                const Icon = cfg.icon;
                return (
                  <div key={cfg.key}>
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest" style={{ background: "#f8f9fc" }}>
                      {cfg.label}
                    </div>
                    {group.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "rgba(192,21,42,0.08)" }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: "#c0152a" }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{item.record[cfg.nameField]}</p>
                          <p className="text-xs text-slate-400 truncate">{item.record[cfg.subField]}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}