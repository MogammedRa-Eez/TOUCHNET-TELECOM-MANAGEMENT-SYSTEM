import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus, Bot, Trash2, MessageSquare } from "lucide-react";
import MessageBubble from "@/components/ai/MessageBubble";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";

const AGENT_NAME = "touchnet_assistant";

export default function AIAssistant() {
  const { can, loading: rbacLoading } = useRBAC();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const bottomRef = useRef(null);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!rbacLoading && can("ai_assistant")) {
      loadConversations();
    }
  }, [rbacLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, []);

  const loadConversations = async () => {
    setLoadingConvs(true);
    const convs = await base44.agents.listConversations({ agent_name: AGENT_NAME });
    setConversations(convs || []);
    setLoadingConvs(false);
  };

  const selectConversation = async (conv) => {
    if (unsubRef.current) unsubRef.current();
    const full = await base44.agents.getConversation(conv.id);
    setActiveConversation(full);
    setMessages(full.messages || []);
    unsubRef.current = base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages(data.messages || []);
    });
  };

  const newConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: AGENT_NAME,
      metadata: { name: `Chat ${new Date().toLocaleString()}` },
    });
    setConversations(prev => [conv, ...prev]);
    await selectConversation(conv);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeConversation || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    await base44.agents.addMessage(activeConversation, { role: "user", content: text });
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!rbacLoading && !can("ai_assistant")) return <AccessDenied />;

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col border-r" style={{ background: "#fff", borderColor: "rgba(99,102,241,0.1)" }}>
        <div className="p-3 border-b" style={{ borderColor: "rgba(99,102,241,0.1)" }}>
          <Button onClick={newConversation} className="w-full text-white text-sm" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            <Plus className="w-4 h-4 mr-2" /> New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConvs ? (
            <p className="text-xs text-slate-400 text-center mt-4">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-slate-400 text-center mt-4">No conversations yet</p>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className="w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-all"
                style={activeConversation?.id === conv.id
                  ? { background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)" }
                  : { color: "#64748b", border: "1px solid transparent" }
                }
              >
                <MessageSquare className="w-3.5 h-3.5 inline mr-2 opacity-60" />
                {conv.metadata?.name || "Chat"}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#f0f3ff" }}>
        {!activeConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">TouchNet AI Assistant</h2>
            <p className="text-slate-500 text-sm text-center max-w-md">Manage customers, invoices, tickets, employees, and network infrastructure using natural language.</p>
            <Button onClick={newConversation} className="text-white" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <Plus className="w-4 h-4 mr-2" /> Start a New Chat
            </Button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.filter(m => m.role !== "system").map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {sending && (
                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white" style={{ borderColor: "rgba(99,102,241,0.1)" }}>
              <div className="flex gap-2 max-w-4xl mx-auto">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about customers, billing, tickets..."
                  className="flex-1"
                  disabled={sending}
                />
                <Button onClick={sendMessage} disabled={sending || !input.trim()} className="text-white" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}