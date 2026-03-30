import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Pencil, Trash2, FileText, BarChart2, List, Mail, Download, Loader2, MessageSquare } from "lucide-react";
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QuoteDocument from "@/components/sales/QuoteDocument";
import { format } from "date-fns";
import QuoteBuilder from "@/components/sales/QuoteBuilder";
import QuotePreview from "@/components/sales/QuotePreview";
import QuotesDashboard from "@/components/sales/QuotesDashboard";
import QuoteNotesPanel from "@/components/sales/QuoteNotesPanel";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";

const STATUS_CONFIG = {
  draft:    { color: "#94a3b8", bg: "rgba(148,163,184,0.1)",  label: "Draft" },
  sent:     { color: "#3b82f6", bg: "rgba(59,130,246,0.1)",   label: "Sent" },
  viewed:   { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",   label: "Viewed" },
  accepted: { color: "#10b981", bg: "rgba(16,185,129,0.1)",   label: "Accepted" },
  declined: { color: "#ef4444", bg: "rgba(239,68,68,0.1)",    label: "Declined" },
  expired:  { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   label: "Expired" },
};

export default function Quotes() {
  const { can, loading: rbacLoading } = useRBAC();
  const [view, setView] = useState("list"); // "list" | "dashboard"
  const [showBuilder, setShowBuilder] = useState(false);
  const [editing, setEditing] = useState(null);
  const [previewing, setPreviewing] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notesQuote, setNotesQuote] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const hiddenDocRef = useRef(null);
  const [pdfQuote, setPdfQuote] = useState(null);
  const queryClient = useQueryClient();

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["quotes"],
    queryFn: () => base44.entities.Quote.list("-created_date"),
    enabled: !rbacLoading && can("customers"),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list(),
  });

  const saveMut = useMutation({
    mutationFn: (data) => data.id ? base44.entities.Quote.update(data.id, data) : base44.entities.Quote.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["quotes"] }); setShowBuilder(false); setEditing(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Quote.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quotes"] }),
  });

  if (!rbacLoading && !can("customers")) return <AccessDenied />;

  const handleDownloadPDF = async (quote) => {
    setDownloadingId(quote.id);
    setPdfQuote(quote);
    // Wait for render
    await new Promise(r => setTimeout(r, 300));
    if (hiddenDocRef.current) {
      const canvas = await html2canvas(hiddenDocRef.current, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      let yPos = 0, remaining = imgHeight;
      while (remaining > 0) {
        pdf.addImage(imgData, "PNG", 0, -yPos, pageWidth, imgHeight);
        remaining -= pageHeight;
        if (remaining > 0) { pdf.addPage(); yPos += pageHeight; }
      }
      pdf.save(`${quote.quote_number || "quote"}_${quote.customer_name || "client"}.pdf`);
    }
    setPdfQuote(null);
    setDownloadingId(null);
  };

  const handleSave = async (data) => {
    const isNew = !data.id;
    await saveMut.mutateAsync(data);
    // Notify all employees about a new quote being created
    if (isNew) {
      try {
        const allUsers = await base44.entities.User.list();
        const currentUser = await base44.auth.me();
        const others = allUsers.filter(u => u.email !== currentUser?.email);
        await Promise.all(others.map(u =>
          base44.entities.Notification.create({
            user_email: u.email,
            title: `New quote created: ${data.title}`,
            message: `${currentUser?.full_name || "An employee"} created a new quote "${data.title}" (${data.quote_number}) for ${data.customer_name || "a client"}. Open Quotes to add internal notes or adjustments.`,
            type: "info",
            category: "customer",
            is_read: false,
            link_page: "Quotes",
          })
        ));
      } catch (_) { /* non-critical */ }
    }
  };

  const handleSendEmail = async (quote) => {
    if (!quote.customer_email) return;
    setSendingEmail(true);

    const contractMonths = quote.contract_months || 24;
    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px 40px;text-align:center;">
            <div style="display:inline-block;background:rgba(6,182,212,0.15);border:1px solid rgba(6,182,212,0.4);border-radius:8px;padding:4px 14px;margin-bottom:16px;">
              <span style="color:#22d3ee;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Quote Proposal</span>
            </div>
            <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 4px;">${quote.title}</h1>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">Ref: ${quote.quote_number || '—'}</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">Dear <strong>${quote.customer_name}</strong>,</p>
            <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 28px;">${quote.cover_message || 'Please find your quote attached below. We look forward to doing business with you.'}</p>

            <!-- Quote details box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:28px;">
              <tr>
                <td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:6px 0;color:#6b7280;font-size:13px;">Quote Number</td>
                      <td style="padding:6px 0;color:#0f172a;font-size:13px;font-weight:600;text-align:right;">${quote.quote_number || '—'}</td>
                    </tr>
                    ${quote.valid_until ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Valid Until</td><td style="padding:6px 0;color:#0f172a;font-size:13px;font-weight:600;text-align:right;">${format(new Date(quote.valid_until), "d MMMM yyyy")}</td></tr>` : ''}
                    <tr>
                      <td style="padding:6px 0;color:#6b7280;font-size:13px;">Contract Term</td>
                      <td style="padding:6px 0;color:#0f172a;font-size:13px;font-weight:600;text-align:right;">${contractMonths} months</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 0 6px;color:#0f172a;font-size:15px;font-weight:700;border-top:1px solid #e2e8f0;">Total (excl. VAT)</td>
                      <td style="padding:12px 0 6px;font-size:18px;font-weight:800;color:#0891b2;text-align:right;border-top:1px solid #e2e8f0;">R${(quote.subtotal || quote.total || 0).toFixed(2)}/mo</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 28px;">Please review the full quote and let us know if you have any questions or require any adjustments.</p>

            <p style="color:#374151;font-size:14px;margin:0;">Warm regards,<br><strong>${quote.salesperson_name || 'TouchNet Sales Team'}</strong><br><span style="color:#6b7280;font-size:12px;">TouchNet Telecommunications</span></p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
            <p style="color:#9ca3af;font-size:11px;margin:0;">151 Katherine Street, Sandton · 010 060 0400 · www.touchnet.co.za</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

    await base44.functions.invoke('sendQuoteEmailGmail', {
      to: quote.customer_email,
      subject: `Quote: ${quote.title} [${quote.quote_number}]`,
      body: htmlBody,
      quote_id: quote.id,
    });

    queryClient.invalidateQueries({ queryKey: ["quotes"] });
    setSendingEmail(false);
    alert("Quote emailed via Gmail to " + quote.customer_email);
  };

  const filtered = quotes.filter(q => {
    const matchSearch = !search || q.title?.toLowerCase().includes(search.toLowerCase()) || q.customer_name?.toLowerCase().includes(search.toLowerCase()) || q.quote_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalAccepted = quotes.filter(q => q.status === "accepted").reduce((s, q) => s + (q.total || 0), 0);
  const totalPending = quotes.filter(q => ["sent","viewed"].includes(q.status)).reduce((s, q) => s + (q.total || 0), 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Quotes & Proposals</h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">Create and send professional quotes to clients</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button onClick={() => setView("list")} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${view === "list" ? "bg-slate-800 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button onClick={() => setView("dashboard")} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${view === "dashboard" ? "bg-slate-800 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
              <BarChart2 className="w-3.5 h-3.5" /> Dashboard
            </button>
          </div>
          <Button onClick={() => { setEditing(null); setShowBuilder(true); }} className="gap-2 text-white" style={{ background: "linear-gradient(135deg,#e11d48,#9f1239)" }}>
            <Plus className="w-4 h-4" /> New Quote
          </Button>
        </div>
      </div>

      {/* Dashboard View */}
      {view === "dashboard" && <QuotesDashboard quotes={quotes} />}

      {view === "list" && <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Quotes", value: quotes.length, color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
          { label: "Pending / Sent", value: quotes.filter(q => ["sent","viewed","draft"].includes(q.status)).length, color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
          { label: "Accepted Value", value: `R${totalAccepted.toLocaleString()}`, color: "#10b981", bg: "rgba(16,185,129,0.08)" },
          { label: "Pipeline Value", value: `R${totalPending.toLocaleString()}`, color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 border" style={{ background: k.bg, borderColor: k.color + "30" }}>
            <p className="text-2xl font-bold font-mono" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs text-slate-500 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search quotes…" className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="h-9 rounded-md border border-input px-3 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quote #</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Valid Until</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16 text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                No quotes found
              </td></tr>
            ) : filtered.map(q => {
              const sc = STATUS_CONFIG[q.status] || STATUS_CONFIG.draft;
              return (
                <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-indigo-600">{q.quote_number}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 truncate max-w-[200px]">{q.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-700 font-medium">{q.customer_name}</p>
                    {q.customer_email && <p className="text-xs text-slate-400">{q.customer_email}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}40` }}>{sc.label}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">R{(q.total || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{q.valid_until ? format(new Date(q.valid_until), "d MMM yyyy") : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 relative" onClick={() => setNotesQuote(q)} title="Internal Notes">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewing(q)} title="Preview">
                        <Eye className="w-3.5 h-3.5 text-indigo-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownloadPDF(q)} title="Download PDF" disabled={downloadingId === q.id}>
                        {downloadingId === q.id ? <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" /> : <Download className="w-3.5 h-3.5 text-cyan-500" />}
                      </Button>
                      {q.customer_email && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSendEmail(q)} title="Email client">
                          <Mail className="w-3.5 h-3.5 text-emerald-500" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(q); setShowBuilder(true); }}>
                        <Pencil className="w-3.5 h-3.5 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { if (confirm("Delete this quote?")) deleteMut.mutate(q.id); }}>
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      </div>}

      {showBuilder && (
        <QuoteBuilder
          quote={editing}
          customers={customers}
          onSave={handleSave}
          onClose={() => { setShowBuilder(false); setEditing(null); }}
          onPreview={(q) => { setPreviewing(q); }}
        />
      )}

      {/* Hidden render target for PDF generation */}
      {pdfQuote && (
        <div style={{ position: "fixed", left: "-9999px", top: 0, width: 900, zIndex: -1 }}>
          <QuoteDocument quote={pdfQuote} docRef={hiddenDocRef} />
        </div>
      )}

      {notesQuote && (
        <QuoteNotesPanel quote={notesQuote} onClose={() => setNotesQuote(null)} />
      )}

      {previewing && (
        <QuotePreview
          quote={previewing}
          onClose={() => setPreviewing(null)}
          onEdit={() => { setEditing(previewing); setPreviewing(null); setShowBuilder(true); }}
          onSendEmail={handleSendEmail}
        />
      )}
    </div>
  );
}