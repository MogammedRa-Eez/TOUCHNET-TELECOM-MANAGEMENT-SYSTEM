import React, { useState } from "react";
import { CheckSquare, Square, UserCheck, Users, X, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function BulkTicketAssign({ tickets, employees, onDone }) {
  const [selected, setSelected] = useState(new Set());
  const [assignTo, setAssignTo] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const toggleAll = () => {
    if (selected.size === tickets.length) setSelected(new Set());
    else setSelected(new Set(tickets.map(t => t.id)));
  };

  const toggleOne = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleAssign = async () => {
    if (!assignTo || selected.size === 0) return;
    setSaving(true);
    try {
      await Promise.all([...selected].map(id => base44.entities.Ticket.update(id, { assigned_to: assignTo })));
      toast.success(`${selected.size} ticket(s) assigned to ${assignTo}`);
      setSelected(new Set());
      setAssignTo("");
      setOpen(false);
      onDone?.();
    } finally { setSaving(false); }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
        style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8" }}>
        <Users className="w-3.5 h-3.5" /> Bulk Assign
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(16px)" }}>
      <div className="w-full max-w-xl rounded-2xl overflow-hidden"
        style={{ background: "#1a1a1a", border: "1px solid rgba(99,102,241,0.3)", boxShadow: "0 24px 64px rgba(0,0,0,0.7)" }}>
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#6366f1,#818cf8,transparent)" }} />

        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
              <UserCheck className="w-4 h-4" style={{ color: "#818cf8" }} />
            </div>
            <div>
              <p className="text-[13px] font-black" style={{ color: "#f0f0f0" }}>Bulk Assign Tickets</p>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{selected.size} selected</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "rgba(255,255,255,0.4)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Assign to selector */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Assign To</label>
            <select value={assignTo} onChange={e => setAssignTo(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-[12px] outline-none"
              style={{ background: "#252525", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0" }}>
              <option value="">Select employee…</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.full_name}>{emp.full_name} — {emp.department}</option>
              ))}
            </select>
          </div>

          {/* Ticket selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>Select Tickets</label>
              <button onClick={toggleAll} className="text-[10px] font-bold" style={{ color: "#818cf8" }}>
                {selected.size === tickets.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto content-scroll">
              {tickets.filter(t => !["resolved", "closed"].includes(t.status)).map(ticket => {
                const isSelected = selected.has(ticket.id);
                return (
                  <button key={ticket.id} onClick={() => toggleOne(ticket.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                    style={{ background: isSelected ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)", border: `1px solid ${isSelected ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.06)"}` }}>
                    {isSelected ? <CheckSquare className="w-4 h-4 flex-shrink-0" style={{ color: "#818cf8" }} /> : <Square className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold truncate" style={{ color: isSelected ? "#f0f0f0" : "rgba(255,255,255,0.6)" }}>{ticket.subject}</p>
                      <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.25)" }}>{ticket.customer_name} · {ticket.priority}</p>
                    </div>
                    {ticket.assigned_to && (
                      <span className="text-[9px] px-2 py-0.5 rounded-lg flex-shrink-0" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
                        {ticket.assigned_to}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={handleAssign} disabled={saving || selected.size === 0 || !assignTo}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-black text-white transition-all hover:scale-[1.02] disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
            {saving ? "Assigning…" : <><Check className="w-4 h-4" /> Assign {selected.size} Ticket{selected.size !== 1 ? "s" : ""} to {assignTo || "…"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}