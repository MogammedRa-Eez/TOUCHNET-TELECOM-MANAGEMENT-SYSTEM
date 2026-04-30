import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";

function avatarColor(email = "") {
  const colors = ["#6366f1","#06b6d4","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6"];
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function InlineTicketComments({ ticketId }) {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.ChatMessage.filter({ room: `ticket_${ticketId}` }, "-created_date", 50)
      .then(msgs => setComments([...msgs].reverse()));
  }, [ticketId]);

  useEffect(() => {
    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.type === "create" && event.data?.room === `ticket_${ticketId}`) {
        setComments(prev => [...prev, event.data]);
      }
    });
    return unsub;
  }, [ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    await base44.entities.ChatMessage.create({
      sender_email: user?.email || "unknown",
      sender_name: user?.full_name || user?.email || "Staff",
      content: input.trim(),
      room: `ticket_${ticketId}`,
    });
    setInput("");
    setSending(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-3.5 h-3.5" style={{ color: "#00b4b4" }} />
        <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
          Internal Comments ({comments.length})
        </p>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto slim-scroll">
        {comments.length === 0 && (
          <p className="text-[11px] text-center py-4" style={{ color: "rgba(255,255,255,0.2)" }}>No comments yet</p>
        )}
        {comments.map((msg, i) => {
          const isOwn = msg.sender_email === user?.email;
          const color = avatarColor(msg.sender_email);
          return (
            <div key={msg.id || i} className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                style={{ background: color }}>
                {msg.sender_name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className={`max-w-[80%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                <div className="px-3 py-2 rounded-xl text-[12px] leading-relaxed"
                  style={{
                    background: isOwn ? "rgba(0,180,180,0.15)" : "rgba(255,255,255,0.06)",
                    border: isOwn ? "1px solid rgba(0,180,180,0.3)" : "1px solid rgba(255,255,255,0.08)",
                    color: "#e0e0e0",
                  }}>
                  {msg.content}
                </div>
                <p className="text-[9px] mt-0.5 px-1" style={{ color: "rgba(255,255,255,0.2)" }}>
                  {isOwn ? "You" : msg.sender_name} · {msg.created_date ? format(new Date(msg.created_date), "HH:mm") : ""}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add internal comment…"
          className="flex-1 px-3 py-2 rounded-xl text-[12px] outline-none"
          style={{ background: "#252525", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0" }}
        />
        <button type="submit" disabled={!input.trim() || sending}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)" }}>
          {sending ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
        </button>
      </form>
    </div>
  );
}