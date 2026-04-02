import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, X, Send, ChevronDown, Minimize2 } from "lucide-react";
import { format } from "date-fns";

const ROOMS = [
  { key: "general",   label: "# general" },
  { key: "technical", label: "# technical" },
  { key: "sales",     label: "# sales" },
  { key: "projects",  label: "# projects" },
];

function timeLabel(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  if (diffMs < 60000) return "just now";
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
  if (d.toDateString() === now.toDateString()) return format(d, "HH:mm");
  return format(d, "d MMM HH:mm");
}

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

const AVATAR_COLORS = ["#6366f1","#06b6d4","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6"];
function avatarColor(email = "") {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function EmployeeChat({ user }) {
  const [open, setOpen]       = useState(false);
  const [minimized, setMin]   = useState(false);
  const [room, setRoom]       = useState("general");
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread]   = useState(0);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  // Load initial messages for room
  useEffect(() => {
    if (!open) return;
    base44.entities.ChatMessage.filter({ room }, "-created_date", 50)
      .then(msgs => setMessages([...msgs].reverse()));
  }, [room, open]);

  // Real-time subscription
  useEffect(() => {
    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.type === "create" && event.data?.room === room) {
        setMessages(prev => [...prev, event.data]);
        if (!open || minimized) {
          setUnread(u => u + 1);
        }
      }
    });
    return unsub;
  }, [room, open, minimized]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, minimized]);

  // Clear unread on open
  useEffect(() => {
    if (open && !minimized) setUnread(0);
  }, [open, minimized]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    await base44.entities.ChatMessage.create({
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      content: input.trim(),
      room,
    });
    setInput("");
    setSending(false);
    inputRef.current?.focus();
  };

  const handleOpen = () => {
    setOpen(true);
    setMin(false);
    setUnread(0);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95"
          style={{
            background: "linear-gradient(135deg,#06b6d4,#0891b2)",
            boxShadow: "0 4px 20px rgba(6,182,212,0.45)",
          }}
          title="Team Chat"
        >
          <MessageSquare className="w-5 h-5 text-white" />
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 text-[9px] font-black text-white rounded-full flex items-center justify-center"
              style={{ background: "#ef4444", boxShadow: "0 2px 8px rgba(239,68,68,0.6)" }}>
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width: 360,
            height: minimized ? "auto" : 520,
            background: "rgba(255,255,255,0.98)",
            border: "1px solid rgba(6,182,212,0.2)",
            boxShadow: "0 24px 64px rgba(6,182,212,0.18), 0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          {/* Top accent */}
          <div className="h-[2px] flex-shrink-0"
            style={{ background: "linear-gradient(90deg,#06b6d4,#6366f1,#8b5cf6,transparent)" }} />

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", borderBottom: "1px solid rgba(6,182,212,0.15)" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)" }}>
              <MessageSquare className="w-4 h-4" style={{ color: "#06b6d4" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-black text-white">Team Chat</p>
              <p className="text-[10px] mono" style={{ color: "rgba(6,182,212,0.7)" }}>
                {ROOMS.find(r => r.key === room)?.label}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMin(v => !v)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
                {minimized
                  ? <ChevronDown className="w-4 h-4 text-slate-400 rotate-180" />
                  : <Minimize2 className="w-4 h-4 text-slate-400" />}
              </button>
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Room tabs */}
              <div className="flex gap-0.5 px-3 py-2 flex-shrink-0 overflow-x-auto"
                style={{ background: "#f8fafc", borderBottom: "1px solid rgba(6,182,212,0.08)" }}>
                {ROOMS.map(r => (
                  <button key={r.key} onClick={() => setRoom(r.key)}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0"
                    style={{
                      background: room === r.key ? "rgba(6,182,212,0.12)" : "transparent",
                      color: room === r.key ? "#06b6d4" : "#94a3b8",
                      border: room === r.key ? "1px solid rgba(6,182,212,0.25)" : "1px solid transparent",
                    }}>
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
                style={{ scrollbarWidth: "thin" }}>
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                    <MessageSquare className="w-8 h-8 mb-2" style={{ color: "#cbd5e1" }} />
                    <p className="text-[12px] font-semibold text-slate-400">No messages yet</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">Be the first to say something!</p>
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isOwn = msg.sender_email === user.email;
                  const prevMsg = messages[i - 1];
                  const showAvatar = !prevMsg || prevMsg.sender_email !== msg.sender_email;
                  const color = avatarColor(msg.sender_email);

                  return (
                    <div key={msg.id || i} className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-7 h-7 mt-0.5">
                        {showAvatar && (
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                            style={{ background: color }}>
                            {getInitials(msg.sender_name)}
                          </div>
                        )}
                      </div>

                      <div className={`flex flex-col max-w-[72%] ${isOwn ? "items-end" : "items-start"}`}>
                        {showAvatar && (
                          <p className="text-[10px] font-bold mb-1 px-1"
                            style={{ color: isOwn ? "#6366f1" : "#64748b" }}>
                            {isOwn ? "You" : msg.sender_name || msg.sender_email}
                          </p>
                        )}
                        <div className="px-3 py-2 rounded-2xl text-[13px] leading-relaxed"
                          style={{
                            background: isOwn
                              ? "linear-gradient(135deg,#06b6d4,#0891b2)"
                              : "rgba(241,245,249,0.9)",
                            color: isOwn ? "#fff" : "#1e293b",
                            borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                            border: isOwn ? "none" : "1px solid rgba(226,232,240,0.8)",
                            boxShadow: isOwn ? "0 2px 12px rgba(6,182,212,0.25)" : "none",
                          }}>
                          {msg.content}
                        </div>
                        <p className="text-[9px] mt-1 px-1 mono"
                          style={{ color: "#cbd5e1" }}>
                          {timeLabel(msg.created_date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend}
                className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
                style={{ borderTop: "1px solid rgba(226,232,240,0.8)", background: "#f8fafc" }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={`Message ${ROOMS.find(r => r.key === room)?.label}…`}
                  className="flex-1 px-3 py-2 rounded-xl text-[13px] outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(226,232,240,0.9)",
                    color: "#1e293b",
                  }}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 2px 10px rgba(6,182,212,0.35)" }}>
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}