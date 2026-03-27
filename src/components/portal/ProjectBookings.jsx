import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";

const STATUS_CFG = {
  pending:     { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  label: "Pending Review",  icon: Clock         },
  confirmed:   { color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  label: "Confirmed",        icon: CheckCircle2  },
  rescheduled: { color: "#6366f1", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.25)",  label: "Rescheduled",      icon: RefreshCw     },
  completed:   { color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)",   label: "Completed",        icon: CheckCircle2  },
  cancelled:   { color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)",    label: "Cancelled",        icon: XCircle       },
};

const VISIT_ICONS = {
  installation: "🔧", support: "🛠️", survey: "📏", maintenance: "⚙️", other: "📋",
};

export default function ProjectBookings({ projectId }) {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["portal-bookings", projectId],
    queryFn: () => base44.entities.Booking.filter({ project_id: projectId }, "-created_date"),
    enabled: !!projectId,
  });

  if (isLoading) return null;
  if (bookings.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.25)" }}>Booked Visits</p>
      {bookings.map(booking => {
        const sc   = STATUS_CFG[booking.status] || STATUS_CFG.pending;
        const Icon = sc.icon;
        return (
          <div key={booking.id}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
            <span className="text-lg flex-shrink-0">{VISIT_ICONS[booking.visit_type] || "📋"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold capitalize" style={{ color: "rgba(255,255,255,0.85)" }}>
                {booking.visit_type?.replace(/_/g, " ")} visit
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <Calendar className="w-3 h-3 flex-shrink-0" style={{ color: sc.color }} />
                <p className="text-[10px]" style={{ color: sc.color }}>
                  {booking.confirmed_date
                    ? `Confirmed: ${format(new Date(booking.confirmed_date), "d MMM yyyy")}${booking.confirmed_time ? ` at ${booking.confirmed_time}` : ""}`
                    : `Requested: ${format(new Date(booking.preferred_date), "d MMM yyyy")} · ${booking.preferred_time_slot}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg flex-shrink-0"
              style={{ background: `${sc.color}15`, border: `1px solid ${sc.color}25` }}>
              <Icon className="w-3 h-3" style={{ color: sc.color }} />
              <span className="text-[9px] font-black uppercase" style={{ color: sc.color }}>{sc.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}