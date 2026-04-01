import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BookOpen, Plus, X, Save, Trash2, Loader2, ChevronDown, ChevronUp, Edit2 } from "lucide-react";

const CATEGORIES = ["connectivity", "billing", "installation", "speed_issue", "hardware", "security", "general"];

const BLANK = { title: "", category: "general", content: "", keywords: [], is_active: true };

export default function KnowledgeBaseAdmin() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null); // null = new, id = editing
  const [form, setForm]         = useState(BLANK);
  const [expanded, setExpanded] = useState(null);
  const [kwInput, setKwInput]   = useState("");
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["kb-articles"],
    queryFn: () => base44.entities.KnowledgeBase.list("-created_date"),
  });

  const saveMut = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.KnowledgeBase.update(editing, data)
      : base44.entities.KnowledgeBase.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kb-articles"] });
      setShowForm(false);
      setEditing(null);
      setForm(BLANK);
      setKwInput("");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.KnowledgeBase.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kb-articles"] }),
  });

  const openEdit = (article) => {
    setEditing(article.id);
    setForm({ title: article.title, category: article.category, content: article.content, keywords: article.keywords || [], is_active: article.is_active !== false });
    setShowForm(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm(BLANK);
    setKwInput("");
    setShowForm(true);
  };

  const addKeyword = (e) => {
    if (e.key === "Enter" && kwInput.trim()) {
      e.preventDefault();
      setForm(f => ({ ...f, keywords: [...(f.keywords || []), kwInput.trim()] }));
      setKwInput("");
    }
  };

  const removeKw = (kw) => setForm(f => ({ ...f, keywords: f.keywords.filter(k => k !== kw) }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" style={{ color: "#6366f1" }} />
          <h2 className="text-[15px] font-black" style={{ color: "#1e293b" }}>Knowledge Base</h2>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)" }}>
            {articles.length} articles
          </span>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
          <Plus className="w-3.5 h-3.5" /> Add Article
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.98)", border: "1px solid rgba(99,102,241,0.2)", boxShadow: "0 4px 24px rgba(99,102,241,0.1)" }}>
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }} />
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-800 text-[14px]">{editing ? "Edit Article" : "New KB Article"}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "#94a3b8" }}>Title *</label>
                <input
                  className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none text-slate-800 placeholder:text-slate-400"
                  style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)" }}
                  placeholder="e.g. How to restart your ONT"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "#94a3b8" }}>Category</label>
                <select
                  className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none text-slate-800"
                  style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)" }}
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "#94a3b8" }}>Content / Solution Steps *</label>
                <textarea
                  className="w-full rounded-xl px-3 py-2.5 text-[13px] resize-none outline-none text-slate-800 placeholder:text-slate-400"
                  style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)" }}
                  rows={6}
                  placeholder="Describe the solution or troubleshooting steps…"
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "#94a3b8" }}>Keywords (press Enter to add)</label>
                <input
                  className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none text-slate-800 placeholder:text-slate-400"
                  style={{ background: "rgba(248,250,252,0.9)", border: "1px solid rgba(226,232,240,0.9)" }}
                  placeholder="e.g. no internet, disconnected"
                  value={kwInput}
                  onChange={e => setKwInput(e.target.value)}
                  onKeyDown={addKeyword}
                />
                {form.keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.keywords.map(kw => (
                      <span key={kw}
                        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer"
                        style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)" }}
                        onClick={() => removeKw(kw)}>
                        {kw} <X className="w-2.5 h-2.5" />
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="kb-active" checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded" />
                <label htmlFor="kb-active" className="text-[12px] font-semibold text-slate-600">Active (used by AI)</label>
              </div>
              <button
                onClick={() => saveMut.mutate(form)}
                disabled={saveMut.isPending || !form.title.trim() || !form.content.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
                {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saveMut.isPending ? "Saving…" : "Save Article"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Articles list */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#6366f1" }} />
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-2xl p-10 text-center"
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(99,102,241,0.1)" }}>
          <BookOpen className="w-10 h-10 mx-auto mb-3" style={{ color: "#cbd5e1" }} />
          <p className="font-bold text-slate-500 mb-1">No KB Articles Yet</p>
          <p className="text-sm text-slate-400">Add articles above so the AI can suggest solutions to customers.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {articles.map(a => {
            const isEx = expanded === a.id;
            return (
              <div key={a.id} className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 1px 8px rgba(99,102,241,0.05)" }}>
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: a.is_active ? "rgba(99,102,241,0.1)" : "rgba(226,232,240,0.6)", border: "1px solid rgba(99,102,241,0.15)" }}>
                    <BookOpen className="w-4 h-4" style={{ color: a.is_active ? "#6366f1" : "#94a3b8" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-[13px] truncate">{a.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-2 py-0.5 rounded capitalize"
                        style={{ background: "rgba(241,245,249,0.9)", color: "#64748b" }}>
                        {a.category?.replace(/_/g," ")}
                      </span>
                      {!a.is_active && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>Inactive</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => openEdit(a)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                      <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button onClick={() => deleteMut.mutate(a.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                    <button onClick={() => setExpanded(isEx ? null : a.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                      {isEx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                </div>
                {isEx && (
                  <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(226,232,240,0.8)" }}>
                    <p className="text-[12px] leading-relaxed text-slate-600 mt-3 whitespace-pre-line">{a.content}</p>
                    {a.keywords?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {a.keywords.map(kw => (
                          <span key={kw} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.15)" }}>
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}