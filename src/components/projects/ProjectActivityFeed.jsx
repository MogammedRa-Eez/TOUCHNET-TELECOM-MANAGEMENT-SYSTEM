import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { formatDistanceToNow } from "date-fns";
import { GitBranch, FileText, CheckCircle2, MessageSquare, Milestone, RefreshCw, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const EVENT_STYLES = {
  status_change:   { icon: GitBranch,    color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
  task_update:     { icon: CheckCircle2, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  document_upload: { icon: FileText,     color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  approval:        { icon: CheckCircle2, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  milestone:       { icon: Milestone,    color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  field_update:    { icon: RefreshCw,    color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
  note:            { icon: MessageSquare, color: "#64748b", bg: "rgba(100,116,139,0.1)" },
};

export default function ProjectActivityFeed({ project }) {
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [posting, setPosting] = useState(false);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["project-activity", project.id],
    queryFn: () => base44.entities.ProjectActivity.filter({ project_id: project.id }, "-created_date", 50),
  });

  const addNote = useMutation({
    mutationFn: (data) => base44.entities.ProjectActivity.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project-activity", project.id] });
      setNote("");
    },
  });

  const handlePostNote = async () => {
    if (!note.trim()) return;
    setPosting(true);
    const user = await base44.auth.me().catch(() => null);
    await addNote.mutateAsync({
      project_id: project.id,
      quote_number: project.quote_number,
      event_type: "note",
      title: note.trim(),
      actor: user?.email || "System",
    });
    setPosting(false);
  };

  if (isLoading) return (
    <div className="p-6 space-y-3">
      {[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-slate-100 animate-pulse" />)}
    </div>
  );

  return (
    <div className="p-6 flex flex-col gap-4">
      {/* Add note */}
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          style={{ borderColor: "rgba(99,102,241,0.2)" }}
          placeholder="Add a note or comment..."
          value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handlePostNote()}
        />
        <Button size="sm" disabled={!note.trim() || posting} onClick={handlePostNote}
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff" }}>
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Feed */}
      {activities.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No activity yet</p>
          <p className="text-xs mt-1">Status changes, task updates and notes will appear here</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />

          <div className="space-y-4">
            {activities.map(act => {
              const style = EVENT_STYLES[act.event_type] || EVENT_STYLES.note;
              const Icon = style.icon;
              const timeAgo = act.created_date
                ? formatDistanceToNow(new Date(act.created_date), { addSuffix: true })
                : "";
              return (
                <div key={act.id} className="flex gap-3 relative">
                  {/* Icon bubble */}
                  <div className="relative z-10 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: style.bg, border: `1.5px solid ${style.color}33` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: style.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm text-slate-800 leading-snug">{act.title}</p>
                    {act.detail && (
                      <p className="text-xs text-slate-500 mt-0.5">{act.detail}</p>
                    )}
                    {(act.old_value || act.new_value) && (
                      <div className="flex items-center gap-1.5 mt-1">
                        {act.old_value && <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded line-through">{act.old_value}</span>}
                        {act.old_value && act.new_value && <span className="text-[10px] text-slate-300">→</span>}
                        {act.new_value && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-semibold">{act.new_value}</span>}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {act.actor && <span className="text-[10px] text-slate-400 font-medium">{act.actor}</span>}
                      {act.actor && timeAgo && <span className="text-[10px] text-slate-300">·</span>}
                      <span className="text-[10px] text-slate-400">{timeAgo}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}