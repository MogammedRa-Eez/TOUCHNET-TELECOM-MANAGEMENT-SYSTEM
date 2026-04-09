import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, Eye, Pencil, Trash2, FileText, BarChart2, List,
  Mail, Download, Loader2, MessageSquare, RefreshCw,
  CheckCircle2, Clock, TrendingUp, X, Copy, ChevronDown
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QuoteDocument from "@/components/sales/QuoteDocument.jsx";
import { format } from "date-fns";
import QuoteBuilder from "@/components/sales/QuoteBuilder";
import QuotePreview from "@/components/sales/QuotePreview";
import QuotesDashboard from "@/components/sales/QuotesDashboard";
import QuoteNotesPanel from "@/components/sales/QuoteNotesPanel";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const STATUS_CONFIG = {
  draft:    { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.3)",  label: "Draft",    dot: "#94a3b8" },
  sent:     { color: "#74b9ff", bg: "rgba(116,185,255,0.12)", border: "rgba(116,185,255,0.3)",  label: "Sent",     dot: "#74b9ff" },
  viewed:   { color: "#d988fa", bg: "rgba(217,136,250,0.12)", border: "rgba(217,136,250,0.3)",  label: "Viewed",   dot: "#d988fa" },
  accepted: { color: "#57f287", bg: "rgba(87,242,135,0.12)",  border: "rgba(87,242,135,0.3)",   label: "Accepted", dot: "#57f287" },
  declined: { color: "#ff7b7b", bg: "rgba(255,123,123,0.12)", border: "rgba(255,123,123,0.3)",  label: "Declined", dot: "#ff7b7b" },
  expired:  { color: "#ffd460", bg: "rgba(255,212,96,0.12)",  border: "rgba(255,212,96,0.3)",   label: "Expired",  dot: "#ffd460" },
};

function KPICard({ label, value, sub, color, icon: Icon }) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 transition-all hover:scale-[1.02]"
      style={{ background: "rgba(18,14,42,0.97)", border: `1px solid ${color}30`, boxShadow: `0 4px 24px ${color}14` }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg,${color},transparent)` }} />
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle,${color}16,transparent 70%)` }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-2" style={{ color: "rgba(203,181,253,0.55)" }}>{label}</p>
          <p className="text-3xl font-black" style={{ color, fontFamily: "'JetBrains Mono',monospace" }}>{value}</p>
          {sub && <p className="text-[11px] mt-1.5" style={{ color: "rgba(220,232,255,0.55)" }}>{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}16`, border: `1px solid ${color}30` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, color, title, onClick, spin = false }) {
  return (
    <button onClick={onClick} title={title}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
      style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
      <Icon className={`w-3.5 h-3.5 ${spin ? "animate-spin" : ""}`} style={{ color }} />
    </button>
  );
}

function ActionPill({ icon: Icon, color, label, onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
      style={{ background: `${color}12`, border: `1px solid ${color}25`, color }}>
      <Icon className="w-3 h-3" /> {label}
    </button>
  );
}

function QuoteRow({ quote, onPreview, onEdit, onDelete, onEmail, onNotes, onDownload, onDuplicate, onStatusChange, downloading, emailing }) {
  const [expanded, setExpanded] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const sc = STATUS_CONFIG[quote.status] || STATUS_CONFIG.draft;

  return (
    <div style={{ borderBottom: "1px solid rgba(177,151,252,0.08)" }}>
      <div
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all group"
        onClick={() => setExpanded(v => !v)}
        onMouseEnter={e => { if (!expanded) e.currentTarget.style.background = "rgba(177,151,252,0.05)"; }}
        onMouseLeave={e => { if (!expanded) e.currentTarget.style.background = "transparent"; }}
        style={{ background: expanded ? "rgba(177,151,252,0.06)" : "transparent" }}
      >
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sc.dot, boxShadow: `0 0 8px ${sc.dot}` }} />

        <p className="hidden sm:block w-28 text-[11px] font-bold flex-shrink-0" style={{ color: "#b197fc", fontFamily: "'JetBrains Mono',monospace" }}>
          {quote.quote_number || "—"}
        </p>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold truncate" style={{ color: "#f8f4ff" }}>{quote.title}</p>
          <p className="text-[10px] truncate" style={{ color: "rgba(203,181,253,0.55)" }}>
            {quote.customer_name || "No client"}{quote.customer_email ? ` · ${quote.customer_email}` : ""}
          </p>
        </div>

        <div className="relative flex-shrink-0" onClick={e => { e.stopPropagation(); setShowStatusMenu(v => !v); }}>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity"
            style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
            {sc.label}
            <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
          </span>
          {showStatusMenu && (
            <div className="absolute right-0 top-full mt-1 z-50 rounded-xl overflow-hidden w-36"
              style={{ background: "rgba(16,12,36,0.99)", border: "1px solid rgba(177,151,252,0.3)", boxShadow: "0 12px 40px rgba(177,151,252,0.25)" }}>
              {Object.entries(STATUS_CONFIG).map(([k, cfg]) => (
                <button key={k} onClick={e => { e.stopPropagation(); onStatusChange(quote.id, k); setShowStatusMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-left transition-colors hover:bg-white/5"
                  style={{ color: cfg.color }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                  {cfg.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="hidden md:block w-28 text-right text-[13px] font-black flex-shrink-0" style={{ color: "#f0ecff", fontFamily: "'JetBrains Mono',monospace" }}>
          R{(quote.total || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
        </p>

        <p className="hidden lg:block w-24 text-[11px] flex-shrink-0" style={{ color: "rgba(203,181,253,0.45)" }}>
          {quote.valid_until ? format(new Date(quote.valid_until), "d MMM yy") : "—"}
        </p>

        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <ActionBtn icon={Eye}           color="#74b9ff" title="Preview"      onClick={() => onPreview(quote)} />
          <ActionBtn icon={Pencil}        color="#b197fc" title="Edit"         onClick={() => onEdit(quote)} />
          <ActionBtn icon={MessageSquare} color="#d988fa" title="Notes"        onClick={() => onNotes(quote)} />
          {quote.customer_email && (
            <ActionBtn icon={emailing ? Loader2 : Mail} color="#57f287" title="Email" onClick={() => onEmail(quote)} spin={emailing} />
          )}
          <ActionBtn icon={downloading ? Loader2 : Download} color="#00e5ff" title="PDF" onClick={() => onDownload(quote)} spin={downloading} />
          <ActionBtn icon={Copy}          color="#ffd460" title="Duplicate"    onClick={() => onDuplicate(quote)} />
          <ActionBtn icon={Trash2}        color="#ff7b7b" title="Delete"       onClick={() => onDelete(quote.id)} />
        </div>

        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          style={{ color: "rgba(177,151,252,0.4)" }} />
      </div>

      {expanded && (
        <div className="px-5 pb-4 pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3"
          style={{ background: "rgba(177,151,252,0.03)", borderTop: `1px solid ${sc.color}14` }}>
          {[
            { label: "Salesperson", value: quote.salesperson_name || "—" },
            { label: "Contract",    value: quote.contract_months ? `${quote.contract_months} months` : "—" },
            { label: "Subtotal",    value: `R${(quote.subtotal || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` },
            { label: "Created",     value: quote.created_date ? format(new Date(quote.created_date), "d MMM yyyy") : "—" },
          ].map(d => (
            <div key={d.label} className="rounded-xl px-3 py-2.5"
              style={{ background: "rgba(177,151,252,0.07)", border: "1px solid rgba(177,151,252,0.15)" }}>
              <p className="text-[9px] uppercase tracking-wider font-bold mb-0.5" style={{ color: "rgba(203,181,253,0.5)" }}>{d.label}</p>
              <p className="text-[12px] font-bold" style={{ color: "#f0ecff" }}>{d.value}</p>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-4 flex gap-2 flex-wrap pt-1">
            <ActionPill icon={Eye}      color="#74b9ff" label="Preview"       onClick={() => onPreview(quote)} />
            <ActionPill icon={Pencil}   color="#b197fc" label="Edit"          onClick={() => onEdit(quote)} />
            {quote.customer_email && <ActionPill icon={Mail} color="#57f287" label="Email Client" onClick={() => onEmail(quote)} />}
            <ActionPill icon={Download} color="#00e5ff" label="Download PDF"  onClick={() => onDownload(quote)} />
            <ActionPill icon={Copy}     color="#ffd460" label="Duplicate"     onClick={() => onDuplicate(quote)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Quotes() {
  const { can, loading: rbacLoading } = useRBAC();
  const [view, setView]               = useState("list");
  const [showBuilder, setShowBuilder] = useState(false);
  const [editing, setEditing]         = useState(null);
  const [previewing, setPreviewing]   = useState(null);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notesQuote, setNotesQuote]   = useState(null);
  const [sendingEmailId, setSendingEmailId] = useState(null);
  const [downloadingId, setDownloadingId]   = useState(null);
  const [confirmDelete, setConfirmDelete]   = useState(null);
  const hiddenDocRef = useRef(null);
  const [pdfQuote, setPdfQuote]       = useState(null);
  const queryClient = useQueryClient();

  const { data: quotes = [], isLoading, refetch } = useQuery({
    queryKey: ["quotes"],
    queryFn:  () => base44.entities.Quote.list("-created_date"),
    enabled:  !rbacLoading && can("customers"),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn:  () => base44.entities.Customer.list(),
  });

  const saveMut = useMutation({
    mutationFn: (data) => data.id ? base44.entities.Quote.update(data.id, data) : base44.entities.Quote.create(data),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ["quotes"] }); setShowBuilder(false); setEditing(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Quote.delete(id),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ["quotes"] }); toast.success("Quote deleted"); },
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Quote.update(id, { status }),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ["quotes"] }),
  });

  if (!rbacLoading && !can("customers")) return <AccessDenied />;

  const handleDownloadPDF = async (quote) => {
    setDownloadingId(quote.id);
    setPdfQuote(quote);
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
    toast.success("PDF downloaded");
  };

  const handleSave = async (data) => {
    const isNew = !data.id;
    await saveMut.mutateAsync(data);
    if (isNew) {
      try {
        const allUsers = await base44.entities.User.list();
        const currentUser = await base44.auth.me();
        const others = allUsers.filter(u => u.email !== currentUser?.email && u.role !== "user");
        await Promise.all(others.map(u =>
          base44.entities.Notification.create({
            user_email: u.email,
            title: `New quote created: ${data.title}`,
            message: `${currentUser?.full_name || "An employee"} created quote "${data.title}" (${data.quote_number}) for ${data.customer_name || "a client"}.`,
            type: "info", category: "customer", is_read: false, link_page: "Quotes",
          })
        ));
      } catch (_) {}
    }
    toast.success(isNew ? "Quote created!" : "Quote updated!");
  };

  const handleSendEmail = async (quote) => {
    if (!quote.customer_email) return;
    setSendingEmailId(quote.id);

    const contractMonths = quote.contract_months || 24;
    const appBaseUrl = 'https://app.base44.com/apps/69a157d4dbdca56a3bccf4d3';
    const quoteLink = `${appBaseUrl}/quote?id=${quote.id}`;
    const includedItems = (quote.line_items || []).filter(i => !i.optional || i.included);
    const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

    const lineItemsHtml = includedItems.length > 0 ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:0;">
        <tr style="background:#1e293b;">
          <th style="padding:10px 14px;text-align:left;color:#f8fafc;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;width:55%;">Description</th>
          <th style="padding:10px 14px;text-align:center;color:#f8fafc;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;width:10%;">Qty</th>
          <th style="padding:10px 14px;text-align:right;color:#f8fafc;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;width:15%;">Unit</th>
          <th style="padding:10px 14px;text-align:right;color:#f8fafc;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;width:20%;">Total/mo</th>
        </tr>
        ${includedItems.map((item, idx) => `
          <tr style="background:${idx % 2 === 0 ? '#f8fafc' : '#ffffff'};border-bottom:1px solid #e2e8f0;">
            <td style="padding:12px 14px;vertical-align:top;">
              <div style="font-weight:700;color:#0f172a;font-size:13px;">${item.description || ''}</div>
              ${item.detail ? `<div style="font-size:11px;color:#64748b;margin-top:3px;">${item.detail}</div>` : ''}
            </td>
            <td style="padding:12px 14px;text-align:center;color:#334155;font-size:13px;vertical-align:top;">${item.quantity || 1}</td>
            <td style="padding:12px 14px;text-align:right;color:#334155;font-size:13px;vertical-align:top;">R ${(item.unit_price || 0).toFixed(2)}</td>
            <td style="padding:12px 14px;text-align:right;font-weight:700;color:#0f172a;font-size:13px;vertical-align:top;">R ${((item.quantity || 1) * (item.unit_price || 0)).toFixed(2)}</td>
          </tr>
        `).join('')}
        ${quote.discount_percent > 0 ? `
          <tr style="background:#f1f5f9;border-bottom:1px solid #e2e8f0;">
            <td colspan="3" style="padding:10px 14px;text-align:right;font-size:13px;color:#334155;font-weight:600;">Discount (${quote.discount_percent}%)</td>
            <td style="padding:10px 14px;text-align:right;font-size:13px;color:#16a34a;font-weight:700;">- R ${(quote.discount_amount || 0).toFixed(2)}</td>
          </tr>` : ''}
        <tr style="background:#f1f5f9;">
          <td colspan="3" style="padding:14px;text-align:right;font-weight:700;font-size:14px;color:#0f172a;">Total ZAR excl. VAT</td>
          <td style="padding:14px;text-align:right;">
            <div style="font-size:18px;font-weight:800;color:#0f172a;">R ${(quote.subtotal || quote.total || 0).toFixed(2)}</div>
            <div style="font-size:11px;color:#64748b;margin-top:2px;">per month · ${contractMonths} months</div>
          </td>
        </tr>
      </table>` : '';

    const sectionsHtml = (quote.sections || []).map(s => {
      if (s.type === 'divider') return `<hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />`;
      return `<div style="margin-bottom:18px;">
        ${s.heading ? `<div style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.06em;">${s.heading}</div>` : ''}
        ${s.type === 'text' && s.content ? `<div style="font-size:13px;color:#334155;line-height:1.7;white-space:pre-line;">${s.content}</div>` : ''}
        ${(s.type === 'link' || s.type === 'file') && s.url ? `<a href="${s.url}" style="display:inline-block;padding:8px 16px;background:#e11d48;color:#fff;font-size:12px;font-weight:700;text-decoration:none;border-radius:6px;">${s.label || 'Open Link'}</a>` : ''}
        ${s.type === 'image' && s.image_url ? `<img src="${s.image_url}" style="width:100%;max-height:220px;object-fit:cover;border-radius:6px;" />` : ''}
      </div>`;
    }).join('');

    const htmlBody = `<!DOCTYPE html>
<html><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px;">
<table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr><td style="background:#0f172a;padding:28px 36px;text-align:center;">
    <img src="${LOGO_URL}" alt="TouchNet" style="height:44px;object-fit:contain;display:block;margin:0 auto 16px;" />
    <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 4px;">${quote.title}</h1>
    <p style="color:rgba(255,255,255,0.45);font-size:12px;margin:0;">Ref: ${quote.quote_number || '—'} &nbsp;·&nbsp; ${contractMonths}-month contract</p>
  </td></tr>

  <!-- Info strip -->
  <tr><td>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #e2e8f0;">
      <tr>
        <td style="padding:18px 24px;width:50%;border-right:1px solid #e2e8f0;vertical-align:top;">
          <p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 4px;">Prepared For</p>
          <p style="font-size:14px;font-weight:700;color:#0f172a;margin:0;">${quote.customer_company || quote.customer_name}</p>
          ${quote.customer_company ? `<p style="font-size:12px;color:#475569;margin:2px 0 0;">${quote.customer_name}</p>` : ''}
          ${quote.customer_email ? `<p style="font-size:12px;color:#e11d48;margin:4px 0 0;">${quote.customer_email}</p>` : ''}
        </td>
        <td style="padding:18px 24px;width:50%;vertical-align:top;">
          <p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 4px;">From</p>
          <p style="font-size:14px;font-weight:700;color:#0f172a;margin:0;">${quote.salesperson_name || 'TouchNet Sales'}</p>
          <p style="font-size:12px;color:#e11d48;margin:2px 0 0;">Touchnet · www.touchnet.co.za</p>
          <p style="font-size:12px;color:#475569;margin:2px 0 0;">010 060 0400</p>
          ${quote.valid_until ? `<p style="font-size:11px;color:#b91c1c;margin:6px 0 0;font-weight:600;">Valid until: ${quote.valid_until}</p>` : ''}
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Cover message -->
  <tr><td style="padding:24px 36px 16px;">
    <p style="font-size:14px;color:#374151;line-height:1.7;margin:0;">Dear <strong>${quote.customer_name}</strong>,</p>
    <p style="font-size:13px;color:#6b7280;line-height:1.7;margin:12px 0 0;">${quote.cover_message || 'Please find your quotation below. We look forward to doing business with you.'}</p>
  </td></tr>

  <!-- Line items -->
  ${includedItems.length > 0 ? `<tr><td style="padding:0 36px 24px;">${lineItemsHtml}</td></tr>` : ''}

  <!-- Content sections -->
  ${sectionsHtml ? `<tr><td style="padding:0 36px 8px;">${sectionsHtml}</td></tr>` : ''}

  <!-- CTA button -->
  <tr><td style="padding:16px 36px 24px;text-align:center;">
    <a href="${quoteLink}" style="display:inline-block;padding:14px 36px;background:#e11d48;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;">
      View &amp; Accept Quote →
    </a>
    <p style="font-size:11px;color:#9ca3af;margin:10px 0 0;">Or open: <a href="${quoteLink}" style="color:#6366f1;">${quoteLink}</a></p>
  </td></tr>

  <!-- Banking details -->
  <tr><td style="padding:0 36px 24px;">
    <table width="100%" cellpadding="12" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
      <tr><td>
        <p style="font-size:11px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px;">Banking Details</p>
        <p style="font-size:12px;color:#334155;margin:2px 0;">Account Name: <strong>Touchnet Telecommunications (PTY) LTD</strong></p>
        <p style="font-size:12px;color:#334155;margin:2px 0;">Account Number: <strong>001991264</strong> &nbsp;·&nbsp; Standard Bank</p>
        <p style="font-size:12px;color:#334155;margin:2px 0;">Branch Code: <strong>00 43 05</strong> (Rosebank)</p>
      </td></tr>
    </table>
  </td></tr>

  <!-- Terms -->
  ${quote.terms ? `<tr><td style="padding:0 36px 28px;border-top:1px solid #e2e8f0;">
    <p style="font-size:11px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.08em;margin:16px 0 8px;">Terms &amp; Conditions</p>
    <p style="font-size:11px;color:#475569;line-height:1.7;white-space:pre-line;">${quote.terms}</p>
  </td></tr>` : ''}

  <!-- Footer -->
  <tr><td style="background:#f8fafc;padding:16px 36px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="font-size:11px;color:#94a3b8;margin:0;">© TouchNet Telecommunications · 151 Katherine Street, Sandton, Johannesburg</p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;

    await base44.functions.invoke('sendQuoteEmailGmail', {
      to: quote.customer_email,
      subject: `Quote: ${quote.title} [${quote.quote_number}]`,
      body: htmlBody,
      quote_id: quote.id,
      quote_number: quote.quote_number,
    });
    queryClient.invalidateQueries({ queryKey: ["quotes"] });
    setSendingEmailId(null);
    toast.success(`Quote emailed to ${quote.customer_email}`);
  };

  const handleDuplicate = async (quote) => {
    const { id, ...rest } = quote;
    await base44.entities.Quote.create({ ...rest, quote_number: `${quote.quote_number || "Q"}-COPY`, status: "draft", sent_at: null, viewed_at: null, responded_at: null, signature_data_url: null, customer_feedback: null });
    queryClient.invalidateQueries({ queryKey: ["quotes"] });
    toast.success("Quote duplicated as draft");
  };

  const filtered = quotes.filter(q => {
    const matchSearch = !search ||
      q.title?.toLowerCase().includes(search.toLowerCase()) ||
      q.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      q.quote_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalAccepted = quotes.filter(q => q.status === "accepted").reduce((s, q) => s + (q.total || 0), 0);
  const totalPending  = quotes.filter(q => ["sent","viewed"].includes(q.status)).reduce((s, q) => s + (q.total || 0), 0);
  const convRate      = quotes.length > 0 ? Math.round((quotes.filter(q => q.status === "accepted").length / quotes.length) * 100) : 0;

  return (
    <div className="p-5 lg:p-8 space-y-6 max-w-[1600px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "#f8f4ff", fontFamily: "'Space Grotesk',sans-serif" }}>
            Quotes & Proposals
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(203,181,253,0.5)", fontFamily: "'JetBrains Mono',monospace" }}>
            {quotes.length} quotes · {quotes.filter(q => q.status === "accepted").length} accepted · {convRate}% conversion
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(177,151,252,0.25)" }}>
            {[
              { key: "list",      label: "List",      icon: List },
              { key: "dashboard", label: "Analytics", icon: BarChart2 },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setView(key)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold transition-all"
                style={{
                  background: view === key ? "linear-gradient(135deg,#9b6dff,#b197fc)" : "rgba(177,151,252,0.06)",
                  color: view === key ? "#fff" : "rgba(203,181,253,0.6)",
                }}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
          <button onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
            style={{ background: "rgba(177,151,252,0.08)", border: "1px solid rgba(177,151,252,0.22)", color: "#b197fc" }}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => { setEditing(null); setShowBuilder(true); }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#9b6dff,#b197fc)", boxShadow: "0 4px 20px rgba(177,151,252,0.45)" }}>
            <Plus className="w-4 h-4" /> New Quote
          </button>
        </div>
      </div>

      {/* Analytics View */}
      {view === "dashboard" && <QuotesDashboard quotes={quotes} />}

      {/* List View */}
      {view === "list" && (
        <div className="space-y-5">
          {/* KPI Strip */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <KPICard label="Total Quotes"   value={quotes.length}  icon={FileText}    color="#b197fc" sub={`${filtered.length} shown`} />
              <KPICard label="In Pipeline"    value={quotes.filter(q=>["sent","viewed","draft"].includes(q.status)).length} icon={Clock} color="#74b9ff" sub="Awaiting response" />
              <KPICard label="Accepted Value" value={`R${(totalAccepted/1000).toFixed(1)}k`} icon={CheckCircle2} color="#57f287" sub="Monthly recurring" />
              <KPICard label="Pipeline Value" value={`R${(totalPending/1000).toFixed(1)}k`}  icon={TrendingUp}   color="#ffd460" sub="Potential MRR" />
            </div>
          )}

          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2 items-center">
            {[
              { key: "all", label: `All (${quotes.length})`, color: "#b197fc" },
              ...Object.entries(STATUS_CONFIG).map(([k, c]) => ({
                key: k, label: `${c.label} (${quotes.filter(q => q.status === k).length})`, color: c.color,
              })),
            ].map(f => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)}
                className="px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all hover:scale-105"
                style={{
                  background: statusFilter === f.key ? `${f.color}18` : "rgba(177,151,252,0.06)",
                  border: `1px solid ${statusFilter === f.key ? f.color + "45" : "rgba(177,151,252,0.14)"}`,
                  color: statusFilter === f.key ? f.color : "rgba(203,181,253,0.55)",
                }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(177,151,252,0.45)" }} />
            <input
              className="w-full pl-11 pr-10 py-3 text-[13px] outline-none rounded-xl transition-all"
              style={{ background: "rgba(177,151,252,0.07)", border: "1px solid rgba(177,151,252,0.26)", color: "#f0ecff" }}
              placeholder="Search by title, client, quote number…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4" style={{ color: "rgba(177,151,252,0.5)" }} />
              </button>
            )}
          </div>

          {/* Quote table */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(12,8,30,0.97)", border: "1px solid rgba(177,151,252,0.22)", boxShadow: "0 8px 40px rgba(177,151,252,0.1)" }}>
            <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#b197fc,#74b9ff,#00e5ff,transparent)" }} />

            {/* Column headers */}
            <div className="flex items-center gap-3 px-4 py-2.5"
              style={{ background: "rgba(177,151,252,0.08)", borderBottom: "1px solid rgba(177,151,252,0.14)" }}>
              <div className="w-2 flex-shrink-0" />
              <p className="hidden sm:block w-28 text-[9px] font-black uppercase tracking-[0.18em] flex-shrink-0" style={{ color: "rgba(203,181,253,0.55)" }}>Quote #</p>
              <p className="flex-1 text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(203,181,253,0.55)" }}>Title / Client</p>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] flex-shrink-0 w-24" style={{ color: "rgba(203,181,253,0.55)" }}>Status</p>
              <p className="hidden md:block w-28 text-right text-[9px] font-black uppercase tracking-[0.18em] flex-shrink-0" style={{ color: "rgba(203,181,253,0.55)" }}>Total</p>
              <p className="hidden lg:block w-24 text-[9px] font-black uppercase tracking-[0.18em] flex-shrink-0" style={{ color: "rgba(203,181,253,0.55)" }}>Valid Until</p>
              <div className="w-52 flex-shrink-0" />
              <div className="w-4 flex-shrink-0" />
            </div>

            {isLoading ? (
              <div className="p-4 space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: "rgba(177,151,252,0.08)", border: "1px solid rgba(177,151,252,0.2)" }}>
                  <FileText className="w-6 h-6" style={{ color: "#b197fc" }} />
                </div>
                <p className="font-bold text-[13px]" style={{ color: "#cbb5fd" }}>No quotes found</p>
                <p className="text-[11px] mt-1" style={{ color: "rgba(203,181,253,0.45)" }}>Try adjusting your filters or create a new quote</p>
                <button onClick={() => { setEditing(null); setShowBuilder(true); }}
                  className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#9b6dff,#b197fc)", boxShadow: "0 4px 14px rgba(177,151,252,0.4)" }}>
                  <Plus className="w-4 h-4" /> Create Quote
                </button>
              </div>
            ) : (
              filtered.map(q => (
                <QuoteRow
                  key={q.id}
                  quote={q}
                  onPreview={setPreviewing}
                  onEdit={q => { setEditing(q); setShowBuilder(true); }}
                  onDelete={id => setConfirmDelete(id)}
                  onEmail={handleSendEmail}
                  onNotes={setNotesQuote}
                  onDownload={handleDownloadPDF}
                  onDuplicate={handleDuplicate}
                  onStatusChange={(id, status) => statusMut.mutate({ id, status })}
                  downloading={downloadingId === q.id}
                  emailing={sendingEmailId === q.id}
                />
              ))
            )}

            {!isLoading && filtered.length > 0 && (
              <div className="px-4 py-2.5 flex items-center justify-between"
                style={{ background: "rgba(177,151,252,0.05)", borderTop: "1px solid rgba(177,151,252,0.1)" }}>
                <p className="text-[11px]" style={{ color: "rgba(203,181,253,0.45)", fontFamily: "'JetBrains Mono',monospace" }}>
                  {filtered.length} of {quotes.length} quotes
                </p>
                <p className="text-[11px] font-bold" style={{ color: "#57f287", fontFamily: "'JetBrains Mono',monospace" }}>
                  {convRate}% conversion rate
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showBuilder && (
        <QuoteBuilder
          quote={editing}
          customers={customers}
          onSave={handleSave}
          onClose={() => { setShowBuilder(false); setEditing(null); }}
          onPreview={(q) => setPreviewing(q)}
        />
      )}

      {pdfQuote && (
        <div style={{ position: "fixed", left: "-9999px", top: 0, width: 900, zIndex: -1 }}>
          <QuoteDocument quote={pdfQuote} docRef={hiddenDocRef} />
        </div>
      )}

      {notesQuote && <QuoteNotesPanel quote={notesQuote} onClose={() => setNotesQuote(null)} />}

      {previewing && (
        <QuotePreview
          quote={previewing}
          onClose={() => setPreviewing(null)}
          onEdit={() => { setEditing(previewing); setPreviewing(null); setShowBuilder(true); }}
          onSendEmail={handleSendEmail}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Quote?"
          message="This will permanently remove the quote. This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => { deleteMut.mutate(confirmDelete); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}