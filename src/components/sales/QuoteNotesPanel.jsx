import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Plus, MessageSquare, Wrench, Flag, CheckCircle2, Circle, Send, Loader2, Lock } from "lucide-react";
import { format } from "date-fns";

const TYPE_CFG = {
  note:       { label: "Note",       color: "#6366f1", bg: "rgba(99,102,241,0.1)",  icon: MessageSquare },
  adjustment: { label: "Adjustment", color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  icon: Wrench        },
  flag:       { label: "Flag",       color: "#ef4444", bg: "rgba(239,68,68,0.1)",   icon: Flag          },
  approval:   { label: "Approval",   color: "#10b981", bg: "rgba(16,185,129,0.1)",  icon: CheckCircle2  },
};

export default function QuoteNotesPanel({ quote, onClose }) {
  const [user, setUser] = useState(null);
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState("note");
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["quote-notes", quote.id],
    queryFn: () => base44.entities.QuoteNote.filter({ quote_id: quote.id }, "-created_date"),
    enabled: !!quote.id,
    refetchInterval: 15000,
  });

  const addMut = useMutation({
    mutationFn: async (data) => {
      const note = await base44.entities.QuoteNote.create(data);
      // Notify employees only — never notify customers/clients
      const allUsers = await base44.entities.User.list();
      const others = allUsers.filter(u => u.email !== data.author_email && u.role !== "user");
      await Promise.all(others.map(u =>
        base44.entities.Notification.create({
          user_email: u.email,
          title: `Internal note on quote ${quote.quote_number || quote.title}`,
          message: `${data.author_name || data.author_email} added a ${data.note_type} on quote "${quote.title}": ${data.content.slice(0, 100)}${data.content.length > 100 ? "…" : ""}`,
          type: data.note_type === "flag" ? "warning" : data.note_type === "adjustment" ? "info" : "info",
          category: "system",
          is_read: false,
        })
      ));
      return note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-notes", quote.id] });
      setContent("");
    },
  });

  const toggleResolveMut = useMutation({
    mutationFn: ({ id, is_resolved }) => base44.entities.QuoteNote.update(id, { is_resolved }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quote-notes", quote.id] }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    addMut.mutate({
      quote_id:     quote.id,
      quote_number: quote.quote_number || "",
      quote_title:  quote.title || "",
      author_email: user.email,
      author_name:  user.full_name || user.email,
      note_type:    noteType,
      content:      content.trim(),
      is_resolved:  false,
    });
  };

  const unresolved = notes.filter(n => !n.is_resolved).length;

  return (
    <div className="fixed inset-0 z-[60] flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-md flex flex-col h-full shadow-2xl"
        style={{ background: "#fff" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#1e293b,#0f172a)", borderBottom: "1px solid rgba(99,102,241,0.2)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}>
              <Lock className="w-4 h-4" style={{ color: "#818cf8" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-black text-white">Internal Notes</p>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider"
                  style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}>
                  EMPLOYEES ONLY
                </span>
              </div>
              <p className="text-[10px] mt-0.5 font-mono" style={{ color: "rgba(148,163,184,0.8)" }}>
                {quote.quote_number} · {quote.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unresolved > 0 && (
              <span className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white"
                style={{ background: "#ef4444" }}>{unresolved}</span>
            )}
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Note type tabs */}
        <div className="flex gap-1 px-4 py-3 flex-shrink-0"
          style={{ background: "#f8fafc", borderBottom: "1px solid rgba(226,232,240,0.8)" }}>
          {Object.entries(TYPE_CFG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button key={key} onClick={() => setNoteType(key)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                style={{
                  background: noteType === key ? cfg.bg : "transparent",
                  color: noteType === key ? cfg.color : "#94a3b8",
                  border: `1px solid ${noteType === key ? cfg.color + "40" : "transparent"}`,
                }}>
                <Icon className="w-3 h-3" />{cfg.label}
              </button>
            );
          })}
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.12)" }}>
                <MessageSquare className="w-5 h-5" style={{ color: "#a5b4fc" }} />
              </div>
              <p className="text-[13px] font-semibold text-slate-500">No internal notes yet</p>
              <p className="text-[11px] text-slate-400 mt-1">Add a note below — only employees can see these.</p>
            </div>
          ) : (
            notes.map(note => {
              const cfg = TYPE_CFG[note.note_type] || TYPE_CFG.note;
              const Icon = cfg.icon;
              const initials = (note.author_name || note.author_email || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
              const isOwn = user?.email === note.author_email;
              return (
                <div key={note.id}
                  className="rounded-2xl p-4 relative"
                  style={{
                    background: note.is_resolved ? "rgba(248,250,252,0.8)" : "rgba(255,255,255,0.98)",
                    border: `1px solid ${note.is_resolved ? "rgba(226,232,240,0.6)" : cfg.color + "25"}`,
                    boxShadow: note.is_resolved ? "none" : "0 2px 12px rgba(0,0,0,0.04)",
                    opacity: note.is_resolved ? 0.6 : 1,
                  }}>
                  {/* Type badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center"
                        style={{ background: cfg.bg }}>
                        <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</span>
                    </div>
                    {/* Resolve toggle */}
                    <button
                      onClick={() => toggleResolveMut.mutate({ id: note.id, is_resolved: !note.is_resolved })}
                      className="flex items-center gap-1 text-[10px] font-bold transition-all hover:opacity-70"
                      style={{ color: note.is_resolved ? "#10b981" : "#94a3b8" }}>
                      {note.is_resolved
                        ? <><CheckCircle2 className="w-3.5 h-3.5" /> Resolved</>
                        : <><Circle className="w-3.5 h-3.5" /> Resolve</>}
                    </button>
                  </div>

                  {/* Content */}
                  <p className="text-[13px] text-slate-700 leading-relaxed">{note.content}</p>

                  {/* Author + time */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white flex-shrink-0"
                      style={{ background: isOwn ? "#6366f1" : "#64748b" }}>
                      {initials}
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: "#64748b" }}>
                      {note.author_name || note.author_email}
                      {isOwn && <span className="ml-1 text-[9px]" style={{ color: "#a5b4fc" }}>(you)</span>}
                    </span>
                    <span className="text-[10px] mono ml-auto" style={{ color: "#94a3b8" }}>
                      {note.created_date ? format(new Date(note.created_date), "d MMM, HH:mm") : ""}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add note form */}
        <div className="flex-shrink-0 p-4" style={{ borderTop: "1px solid rgba(226,232,240,0.8)", background: "#f8fafc" }}>
          {!user ? (
            <p className="text-xs text-slate-400 text-center py-2">Loading user…</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={`Add a ${TYPE_CFG[noteType]?.label?.toLowerCase() || "note"}…`}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl text-[13px] resize-none outline-none text-slate-800 placeholder:text-slate-300"
                style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(226,232,240,0.9)" }}
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "#94a3b8" }}>
                  <Lock className="w-3 h-3" />
                  <span>Visible to employees only · Other employees will be notified</span>
                </div>
                <button type="submit" disabled={!content.trim() || addMut.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                  {addMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Post
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}