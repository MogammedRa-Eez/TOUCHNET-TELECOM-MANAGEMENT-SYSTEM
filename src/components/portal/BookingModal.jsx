import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  X, Calendar, Clock, Wrench, CheckCircle2, ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isBefore, startOfDay, getDay } from "date-fns";

const VISIT_TYPES = [
  { key: "installation", label: "Installation",  icon: "🔧", desc: "New fibre installation visit" },
  { key: "support",      label: "Support Visit",  icon: "🛠️", desc: "On-site technical support" },
  { key: "survey",       label: "Site Survey",    icon: "📏", desc: "Pre-installation site survey" },
  { key: "maintenance",  label: "Maintenance",    icon: "⚙️", desc: "Scheduled maintenance check" },
  { key: "other",        label: "Other",           icon: "📋", desc: "Other visit request" },
];

const TIME_SLOTS = [
  { key: "morning",   label: "Morning",   range: "08:00 – 12:00" },
  { key: "afternoon", label: "Afternoon", range: "13:00 – 17:00" },
  { key: "any",       label: "Any Time",  range: "Flexible" },
];

function MiniCalendar({ selectedDate, onSelect }) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const today = startOfDay(new Date());

  const monthStart = startOfMonth(viewMonth);
  const monthEnd   = endOfMonth(viewMonth);
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad to start on Monday
  const startPad = (getDay(monthStart) + 6) % 7;
  const padDays  = Array(startPad).fill(null);

  const isDisabled = (d) => isBefore(d, today) || getDay(d) === 0 || getDay(d) === 6;

  return (
    <div className="select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-4 h-4" style={{ color: "#64748b" }} />
        </button>
        <span className="text-[13px] font-black" style={{ color: "#1e293b" }}>
          {format(viewMonth, "MMMM yyyy")}
        </span>
        <button onClick={() => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors">
          <ChevronRight className="w-4 h-4" style={{ color: "#64748b" }} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => (
          <div key={d} className="text-center text-[10px] font-black uppercase tracking-wider py-1"
            style={{ color: "#94a3b8" }}>{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-1">
        {padDays.map((_, i) => <div key={`pad-${i}`} />)}
        {days.map(day => {
          const disabled = isDisabled(day);
          const selected = selectedDate && isSameDay(day, selectedDate);
          const isToday  = isSameDay(day, today);
          return (
            <button key={day.toISOString()}
              disabled={disabled}
              onClick={() => !disabled && onSelect(day)}
              className="h-8 w-8 mx-auto rounded-lg text-[12px] font-bold transition-all hover:scale-110 disabled:cursor-not-allowed"
              style={{
                background: selected
                  ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                  : isToday
                    ? "rgba(99,102,241,0.1)"
                    : "transparent",
                color: selected ? "white" : disabled ? "#cbd5e1" : isToday ? "#6366f1" : "#334155",
                boxShadow: selected ? "0 4px 12px rgba(99,102,241,0.35)" : "none",
                border: isToday && !selected ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
              }}>
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function BookingModal({ project, customer, onClose }) {
  const queryClient = useQueryClient();
  const [step,         setStep]         = useState(1); // 1=type, 2=date, 3=confirm
  const [visitType,    setVisitType]    = useState("installation");
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlot,     setTimeSlot]     = useState("any");
  const [notes,        setNotes]        = useState("");

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Booking.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-bookings", project.id] });
      setStep(4); // success
    },
  });

  const handleSubmit = () => {
    createMut.mutate({
      customer_id:          customer.id,
      customer_name:        customer.full_name,
      customer_email:       customer.email,
      project_id:           project.id,
      project_name:         project.project_name,
      quote_number:         project.quote_number,
      visit_type:           visitType,
      preferred_date:       format(selectedDate, "yyyy-MM-dd"),
      preferred_time_slot:  timeSlot,
      notes:                notes,
      status:               "pending",
    });
  };

  const selectedType = VISIT_TYPES.find(v => v.key === visitType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      <div className="relative w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.98)",
          border: "1px solid rgba(99,102,241,0.15)",
          boxShadow: "0 24px 64px rgba(99,102,241,0.15), 0 8px 32px rgba(0,0,0,0.1)",
        }}>

        {/* Top accent */}
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#6366f1,#06b6d4,#8b5cf6)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <Calendar className="w-4 h-4" style={{ color: "#6366f1" }} />
            </div>
            <div>
              <p className="text-[14px] font-black" style={{ color: "#1e293b", fontFamily: "'Space Grotesk',sans-serif" }}>
                Book a Visit
              </p>
              <p className="text-[11px]" style={{ color: "#94a3b8" }}>{project.project_name}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" style={{ color: "#64748b" }} />
          </button>
        </div>

        {/* Step indicator */}
        {step < 4 && (
          <div className="flex items-center gap-2 px-6 py-3" style={{ borderBottom: "1px solid rgba(99,102,241,0.06)" }}>
            {[1,2,3].map(s => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{
                      background: step >= s ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(226,232,240,1)",
                      color: step >= s ? "white" : "#94a3b8",
                    }}>
                    {step > s ? "✓" : s}
                  </div>
                  <span className="text-[10px] font-bold hidden sm:block"
                    style={{ color: step >= s ? "#6366f1" : "#94a3b8" }}>
                    {s === 1 ? "Visit Type" : s === 2 ? "Pick Date" : "Confirm"}
                  </span>
                </div>
                {s < 3 && <div className="flex-1 h-px" style={{ background: step > s ? "#6366f1" : "#e2e8f0" }} />}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="px-6 py-5">

          {/* Step 1 — Visit Type */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-[12px] font-bold" style={{ color: "#475569" }}>What type of visit do you need?</p>
              {VISIT_TYPES.map(type => (
                <button key={type.key}
                  onClick={() => setVisitType(type.key)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01] text-left"
                  style={{
                    background: visitType === type.key ? "rgba(99,102,241,0.08)" : "rgba(248,250,252,0.9)",
                    border: visitType === type.key ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(226,232,240,0.8)",
                    boxShadow: visitType === type.key ? "0 2px 12px rgba(99,102,241,0.1)" : "none",
                  }}>
                  <span className="text-xl flex-shrink-0">{type.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold" style={{ color: visitType === type.key ? "#4f46e5" : "#1e293b" }}>
                      {type.label}
                    </p>
                    <p className="text-[11px]" style={{ color: "#94a3b8" }}>{type.desc}</p>
                  </div>
                  {visitType === type.key && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
              <button onClick={() => setStep(2)}
                className="w-full py-3 rounded-xl text-[13px] font-bold text-white mt-2 transition-all hover:opacity-90 hover:scale-[1.01]"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
                Next: Choose Date →
              </button>
            </div>
          )}

          {/* Step 2 — Date & Time */}
          {step === 2 && (
            <div className="space-y-4">
              <MiniCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />

              {/* Time slot */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#94a3b8" }}>Preferred Time</p>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button key={slot.key}
                      onClick={() => setTimeSlot(slot.key)}
                      className="p-2.5 rounded-xl text-center transition-all hover:scale-105"
                      style={{
                        background: timeSlot === slot.key ? "rgba(99,102,241,0.1)" : "rgba(248,250,252,0.9)",
                        border: timeSlot === slot.key ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(226,232,240,0.8)",
                      }}>
                      <p className="text-[12px] font-bold" style={{ color: timeSlot === slot.key ? "#6366f1" : "#334155" }}>
                        {slot.label}
                      </p>
                      <p className="text-[10px]" style={{ color: "#94a3b8" }}>{slot.range}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#94a3b8" }}>
                  Notes / Access Instructions <span className="normal-case font-normal">(optional)</span>
                </p>
                <textarea
                  className="w-full rounded-xl px-3 py-2.5 text-[12px] resize-none outline-none transition-all"
                  style={{
                    background: "rgba(248,250,252,0.9)",
                    border: "1px solid rgba(226,232,240,0.9)",
                    color: "#334155",
                    minHeight: 72,
                  }}
                  placeholder="e.g. Gate code 1234, contact John on arrival…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl text-[12px] font-bold transition-all hover:bg-slate-100"
                  style={{ border: "1px solid rgba(226,232,240,0.9)", color: "#64748b" }}>
                  ← Back
                </button>
                <button onClick={() => setStep(3)} disabled={!selectedDate}
                  className="flex-2 flex-1 py-3 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
                  Review Booking →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Confirm */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-[12px] font-bold" style={{ color: "#475569" }}>Please confirm your booking details:</p>

              <div className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(99,102,241,0.15)", background: "rgba(248,250,252,0.8)" }}>
                <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6,transparent)" }} />
                {[
                  { label: "Visit Type",   value: `${selectedType?.icon} ${selectedType?.label}` },
                  { label: "Project",      value: project.project_name },
                  { label: "Date",         value: selectedDate ? format(selectedDate, "EEEE, d MMMM yyyy") : "—" },
                  { label: "Time Slot",    value: TIME_SLOTS.find(t => t.key === timeSlot)?.label + " · " + TIME_SLOTS.find(t => t.key === timeSlot)?.range },
                  ...(notes ? [{ label: "Notes", value: notes }] : []),
                ].map(item => (
                  <div key={item.label} className="flex gap-3 px-4 py-2.5"
                    style={{ borderBottom: "1px solid rgba(99,102,241,0.06)" }}>
                    <span className="text-[11px] font-black uppercase tracking-wider w-20 flex-shrink-0 pt-0.5" style={{ color: "#94a3b8" }}>
                      {item.label}
                    </span>
                    <span className="text-[12px] font-semibold" style={{ color: "#1e293b" }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl px-4 py-3"
                style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
                <p className="text-[11px]" style={{ color: "#6366f1" }}>
                  📌 Our team will review and confirm your booking. You'll receive a notification once confirmed.
                </p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl text-[12px] font-bold transition-all hover:bg-slate-100"
                  style={{ border: "1px solid rgba(226,232,240,0.9)", color: "#64748b" }}>
                  ← Back
                </button>
                <button onClick={handleSubmit} disabled={createMut.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
                  {createMut.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                    : "Confirm Booking ✓"}
                </button>
              </div>
            </div>
          )}

          {/* Step 4 — Success */}
          {step === 4 && (
            <div className="flex flex-col items-center text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
                <CheckCircle2 className="w-8 h-8" style={{ color: "#10b981" }} />
              </div>
              <div>
                <p className="text-[17px] font-black" style={{ color: "#1e293b", fontFamily: "'Space Grotesk',sans-serif" }}>
                  Booking Submitted!
                </p>
                <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: "#64748b" }}>
                  Your {selectedType?.label?.toLowerCase()} visit request has been received.<br />
                  We'll confirm the appointment and notify you shortly.
                </p>
              </div>
              <div className="w-full rounded-xl px-4 py-3 text-left"
                style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                <p className="text-[11px] font-bold" style={{ color: "#10b981" }}>
                  📅 Requested: {selectedDate ? format(selectedDate, "d MMMM yyyy") : "—"} · {TIME_SLOTS.find(t => t.key === timeSlot)?.label}
                </p>
              </div>
              <button onClick={onClose}
                className="w-full py-3 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}