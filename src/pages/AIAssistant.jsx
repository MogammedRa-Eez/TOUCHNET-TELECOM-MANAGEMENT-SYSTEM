import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus, MessageSquare, Loader2, Bot, Sparkles } from "lucide-react";
import MessageBubble from "../components/ai/MessageBubble";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";

const QUICK_PROMPTS = [
  "Show all active customers",
  "Create a new support ticket",
  "List overdue invoices",
  "Check network node status",
  "Show critical open tickets",
  "List employees by department",
];

export default function AIAssistant() {
  const { can, loading: rbacLoading } = useRBAC();
  if (!rbacLoading && !can("ai_assistant")) return <AccessDenied />;

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv]       = useState(null);
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState("");
  const [sending, setSending]             = useState(false);
  const [loading, setLoading]             = useState(true);
  const messagesEndRef = useRef(null);
  const unsubRef       = useRef(null);
  const inputRef       = useRef(null);

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => {
    if (unsubRef.current) unsubRef.current();
    if (activeConv) {
      unsubRef.current = base44.agents.subscribeToConversation(activeConv.id, (data) => {
        setMessages(data.messages || []);
      });
    }
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, [activeConv?.id]);

  const loadConversations = async () => {
    setLoading(true);
    const convs = await base44.agents.listConversations({ agent_name: "touchnet_assistant" });
    setConversations(convs || []);
    setLoading(false);
  };

  const createConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: "touchnet_assistant",
      metadata: { name: `Session ${new Date().toLocaleString()}` },
    });
    setConversations(prev => [conv, ...prev]);
    setActiveConv(conv);
    setMessages(conv.messages || []);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const selectConversation = async (conv) => {
    const full = await base44.agents.getConversation(conv.id);
    setActiveConv(full);
    setMessages(full.messages || []);
  };

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    setInput("");
    setSending(true);

    let conv = activeConv;
    if (!conv) {
      conv = await base44.agents.createConversation({
        agent_name: "touchnet_assistant",
        metadata: { name: msg.slice(0, 40) },
      });
      setConversations(prev => [conv, ...prev]);
      setActiveConv(conv);
    }

    setMessages(prev => [...prev, { role: "user", content: msg }]);
    await base44.agents.addMessage(conv, { role: "user", content: msg });
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div
      className="flex h-[calc(100vh-60px)] overflow-hidden"
      style={{ background: "linear-gradient(160deg,#f0f2fc 0%,#f4f6ff 50%,#faf4ff 100%)" }}
    >

      {/* ── LEFT PANEL: Conversation list ── */}
      <aside
        className="hidden lg:flex w-64 flex-col flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.9)", borderRight: "1px solid rgba(99,102,241,0.1)", backdropFilter: "blur(20px)" }}
      >
        {/* Header */}
        <div className="p-4" style={{ borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 12px rgba(99,102,241,0.35)" }}
            >
              <Bot className="w-4.5 h-4.5 text-white w-5 h-5" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-900">TouchNet AI</p>
              <p className="text-[9px] text-slate-400 mono">Powered by AI</p>
            </div>
          </div>
          <button
            onClick={createConversation}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-[13px] font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-[11px] text-slate-400 mono">No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => {
              const isActive = activeConv?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-[12px] transition-all duration-150 flex items-center gap-2 ${
                    isActive
                      ? "text-indigo-700 font-semibold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                  style={isActive ? { background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" } : {}}
                >
                  <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-indigo-500" : "text-slate-300"}`} />
                  <span className="truncate">{conv.metadata?.name || "Untitled"}</span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── MAIN CHAT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Chat header */}
        <div
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.8)", borderBottom: "1px solid rgba(99,102,241,0.08)", backdropFilter: "blur(16px)" }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-[13px] font-bold text-slate-800">
              {activeConv?.metadata?.name || "TouchNet AI Assistant"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold mono"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#059669" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ready
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-8 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-lg w-full">
                <div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 8px 32px rgba(99,102,241,0.35)" }}
                >
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-[18px] font-black text-slate-900 mb-2">How can I help you today?</h2>
                <p className="text-[12px] text-slate-400 mb-8 mono leading-relaxed">
                  Manage customers, invoices, tickets, employees & network infrastructure — just ask.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {QUICK_PROMPTS.map(q => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="px-4 py-3 rounded-2xl text-[12px] text-slate-600 hover:text-indigo-700 transition-all duration-150 text-left group"
                      style={{
                        background: "rgba(255,255,255,0.9)",
                        border: "1px solid rgba(99,102,241,0.12)",
                        boxShadow: "0 2px 8px rgba(99,102,241,0.06)"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.border = "1px solid rgba(99,102,241,0.3)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.12)"; }}
                      onMouseLeave={e => { e.currentTarget.style.border = "1px solid rgba(99,102,241,0.12)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(99,102,241,0.06)"; }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => <MessageBubble key={i} message={msg} />)
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div
          className="px-5 py-4 flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.85)", borderTop: "1px solid rgba(99,102,241,0.08)", backdropFilter: "blur(16px)" }}
        >
          <div className="max-w-3xl mx-auto flex gap-2.5 items-center">
            {/* Mobile new chat */}
            <button
              onClick={createConversation}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
            >
              <Plus className="w-4 h-4" />
            </button>

            <div
              className="flex-1 flex items-center gap-2 px-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(99,102,241,0.2)", boxShadow: "0 2px 12px rgba(99,102,241,0.08)", height: 48 }}
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask TouchNet AI anything…"
                disabled={sending}
                className="flex-1 border-0 bg-transparent text-slate-800 placeholder-slate-400 text-[13px] focus:ring-0 focus-visible:ring-0 shadow-none p-0 h-auto"
              />
            </div>

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || sending}
              className="w-12 h-12 flex items-center justify-center rounded-2xl text-white flex-shrink-0 transition-all duration-150 disabled:opacity-40 hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}