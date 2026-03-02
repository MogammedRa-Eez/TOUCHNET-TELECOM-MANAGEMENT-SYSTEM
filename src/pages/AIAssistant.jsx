import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus, MessageSquare, Loader2, Trash2 } from "lucide-react";
import MessageBubble from "../components/ai/MessageBubble";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";

export default function AIAssistant() {
  const { can, loading: rbacLoading } = useRBAC();
  if (!rbacLoading && !can("ai_assistant")) return <AccessDenied />;

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const unsubRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
  };

  const selectConversation = async (conv) => {
    const full = await base44.agents.getConversation(conv.id);
    setActiveConv(full);
    setMessages(full.messages || []);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    let conv = activeConv;
    if (!conv) {
      conv = await base44.agents.createConversation({
        agent_name: "touchnet_assistant",
        metadata: { name: text.slice(0, 40) },
      });
      setConversations(prev => [conv, ...prev]);
      setActiveConv(conv);
    }

    setMessages(prev => [...prev, { role: "user", content: text }]);
    await base44.agents.addMessage(conv, { role: "user", content: text });
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]" style={{ background: "#0f1a2e" }}>
      {/* Sidebar */}
      <div className="w-64 flex-col hidden lg:flex" style={{ background: "#080f1e", borderRight: "1px solid rgba(6,182,212,0.1)" }}>
        <div className="p-4" style={{ borderBottom: "1px solid rgba(6,182,212,0.08)" }}>
          <Button onClick={createConversation} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-sm">
            <Plus className="w-4 h-4 mr-2" /> New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-[11px] text-slate-600 text-center py-8 mono">No conversations yet</p>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`w-full text-left px-3 py-2.5 rounded-md text-[12px] transition-all flex items-center gap-2 ${
                  activeConv?.id === conv.id
                    ? "text-cyan-300"
                    : "text-slate-500 hover:text-slate-300"
                }`}
                style={activeConv?.id === conv.id ? { background: "rgba(6,182,212,0.1)", borderLeft: "2px solid #06b6d4" } : {}}
              >
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{conv.metadata?.name || "Untitled"}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile new chat */}
        <div className="lg:hidden p-3" style={{ borderBottom: "1px solid rgba(6,182,212,0.08)", background: "#080f1e" }}>
          <Button onClick={createConversation} size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white">
            <Plus className="w-4 h-4 mr-1" /> New Chat
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, #0891b2, #0e7490)", boxShadow: "0 0 30px rgba(6,182,212,0.3)" }}>
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-[16px] font-bold text-white mb-2">TouchNet AI Assistant</h2>
                <p className="text-[12px] text-slate-500 mb-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  Manage customers, invoices, tickets, employees, and network infrastructure.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {[
                    "Show all active customers",
                    "Create a new support ticket",
                    "List overdue invoices",
                    "Check network node status",
                  ].map(q => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="px-3 py-2.5 rounded-lg text-[12px] text-slate-400 hover:text-slate-200 transition-all text-left"
                      style={{ background: "#0d1527", border: "1px solid rgba(6,182,212,0.12)" }}
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

        {/* Input */}
        <div className="p-4" style={{ borderTop: "1px solid rgba(6,182,212,0.1)", background: "#080f1e" }}>
          <div className="max-w-3xl mx-auto flex gap-3">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask TouchNet AI anything..."
              className="flex-1 bg-transparent text-slate-200 placeholder-slate-600"
              style={{ border: "1px solid rgba(6,182,212,0.2)" }}
              disabled={sending}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-5"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}