import React, { useState, useRef } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, Eye, Pencil, Trash2, FileText, BarChart2, List,
  Mail, Download, Loader2, MessageSquare, RefreshCw,
  CheckCircle2, Clock, TrendingUp, X, Copy, ChevronDown, Zap
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
  sent:     { color: "#22d3ee", bg: "rgba(34,211,238,0.12)",  border: "rgba(34,211,238,0.3)",   label: "Sent",     dot: "#22d3ee" },
  viewed:   { color: "#a855f7", bg: "rgba(168,85,247,0.12)",  border: "rgba(168,85,247,0.3)",   label: "Viewed",   dot: "#c084fc" },
  accepted: { color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)",   label: "Accepted", dot: "#34d399" },
  declined: { color: "#e02347", bg: "rgba(224,35,71,0.12)",   border: "rgba(224,35,71,0.3)",    label: "Declined", dot: "#ff3358" },
  expired:  { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)",   label: "Expired",  dot: "#fbbf24" },
};

function KPICard({ label, value, sub, color, icon: Icon }) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 group cursor-default transition-all duration-300 hover:-translate-y-1 holo-card"
      style={{
        background: "#181818",
        border: `1px solid ${color}30`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
      }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}55, transparent)` }} />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full pointer-events-none transition-all duration-500 group-hover:scale-150 opacity-60"
        style={{ background: `radial-gradient(circle, ${color}18, transparent 70%)` }} />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
          <p className="text-3xl font-black mono leading-none" style={{ color, fontFamily: "'JetBrains Mono',monospace" }}>{value}</p>
          {sub && <p className="text-[11px] mt-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>{sub}</p>}
        </div>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
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
      style={{ background: `${color}10`, border: `1px solid ${color}22` }}>
      <Icon className={`w-3.5 h-3.5 ${spin ? "animate-spin" : ""}`} style={{ color }} />
    </button>
  );
}

function ActionPill({ icon: Icon, color, label, onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
      style={{ background: `${color}10`, border: `1px solid ${color}22`, color }}>
      <Icon className="w-3 h-3" /> {label}
    </button>
  );
}

function QuoteRow({ quote, onPreview, onEdit, onDelete, onEmail, onNotes, onDownload, onDuplicate, onStatusChange, downloading, emailing }) {
  const [expanded, setExpanded] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const sc = STATUS_CONFIG[quote.status] || STATUS_CONFIG.draft;

  return (
    <div className="group" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all duration-150"
        onClick={() => setExpanded(v => !v)}
        onMouseEnter={e => { if (!expanded) e.currentTarget.style.background = "rgba(0,180,180,0.04)"; }}
        onMouseLeave={e => { if (!expanded) e.currentTarget.style.background = expanded ? `${sc.color}06` : "transparent"; }}
        style={{ background: expanded ? `${sc.color}06` : "transparent" }}
      >
        {/* Status beacon */}
        <div className="status-beacon flex-shrink-0">
          <span className="w-2.5 h-2.5 rounded-full block"
            style={{ background: sc.dot, boxShadow: `0 0 7px ${sc.dot}` }} />
        </div>

        {/* Quote # */}
        <p className="hidden sm:block w-28 text-[11px] font-bold flex-shrink-0 mono"
          style={{ color: "#00b4b4", fontFamily: "'JetBrains Mono',monospace" }}>
          {quote.quote_number || "—"}
        </p>

        {/* Title / client */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold truncate" style={{ color: "#e0e0e0" }}>{quote.title}</p>
          <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
            {quote.customer_name || "No client"}{quote.customer_email ? ` · ${quote.customer_email}` : ""}
          </p>
        </div>

        {/* Status pill (clickable dropdown) */}
        <div className="relative flex-shrink-0" onClick={e => { e.stopPropagation(); setShowStatusMenu(v => !v); }}>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity"
            style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
            {sc.label}
            <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
          </span>
          {showStatusMenu && (
            <div className="absolute right-0 top-full mt-1 z-50 rounded-xl overflow-hidden w-36"
              style={{ background: "#1e1e1e", border: "1px solid rgba(0,180,180,0.25)", boxShadow: "0 12px 40px rgba(0,0,0,0.6)" }}>
              {Object.entries(STATUS_CONFIG).map(([k, cfg]) => (
                <button key={k} onClick={e => { e.stopPropagation(); onStatusChange(quote.id, k); setShowStatusMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold text-left transition-all"
                  style={{ color: cfg.color }}
                  onMouseEnter={e => e.currentTarget.style.background = `${cfg.color}12`}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                  {cfg.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Total */}
        <p className="hidden md:block w-28 text-right text-[14px] font-black flex-shrink-0 mono"
          style={{ color: "#10b981", fontFamily: "'JetBrains Mono',monospace" }}>
          R{(quote.total || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
        </p>

        {/* Valid until */}
        <p className="hidden lg:block w-24 text-[11px] flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>
          {quote.valid_until ? format(new Date(quote.valid_until), "d MMM yy") : "—"}
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <ActionBtn icon={Eye}           color="#1e2d6e" title="Preview"      onClick={() => onPreview(quote)} />
          <ActionBtn icon={Pencil}        color="#4a5fa8" title="Edit"         onClick={() => onEdit(quote)} />
          <ActionBtn icon={MessageSquare} color="#8b5cf6" title="Notes"        onClick={() => onNotes(quote)} />
          {quote.customer_email && (
            <ActionBtn icon={emailing ? Loader2 : Mail} color="#059669" title="Email" onClick={() => onEmail(quote)} spin={emailing} />
          )}
          <ActionBtn icon={downloading ? Loader2 : Download} color="#0ea5e9" title="PDF" onClick={() => onDownload(quote)} spin={downloading} />
          <ActionBtn icon={Copy}          color="#d97706" title="Duplicate"    onClick={() => onDuplicate(quote)} />
          <ActionBtn icon={Trash2}        color="#c41e3a" title="Delete"       onClick={() => onDelete(quote.id)} />
        </div>

        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          style={{ color: "rgba(30,45,110,0.35)" }} />
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-4 pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3"
          style={{ background: "rgba(0,0,0,0.2)", borderTop: `1px solid ${sc.color}20` }}>
          {[
            { label: "Salesperson", value: quote.salesperson_name || "—" },
            { label: "Contract",    value: quote.contract_months ? `${quote.contract_months} months` : "—" },
            { label: "Subtotal",    value: `R${(quote.subtotal || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` },
            { label: "Created",     value: quote.created_date ? format(new Date(quote.created_date), "d MMM yyyy") : "—" },
          ].map(d => (
            <div key={d.label} className="rounded-xl px-3 py-2.5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-[9px] uppercase tracking-wider font-bold mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{d.label}</p>
              <p className="text-[12px] font-bold" style={{ color: "#e0e0e0" }}>{d.value}</p>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-4 flex gap-2 flex-wrap pt-1">
            <ActionPill icon={Eye}      color="#1e2d6e" label="Preview"       onClick={() => onPreview(quote)} />
            <ActionPill icon={Pencil}   color="#4a5fa8" label="Edit"          onClick={() => onEdit(quote)} />
            {quote.customer_email && <ActionPill icon={Mail} color="#059669" label="Email Client" onClick={() => onEmail(quote)} />}
            <ActionPill icon={Download} color="#0ea5e9" label="Download PDF"  onClick={() => onDownload(quote)} />
            <ActionPill icon={Copy}     color="#d97706" label="Duplicate"     onClick={() => onDuplicate(quote)} />
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
    const appBaseUrl = window.location.origin;
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
<html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;"><tr><td align="center" style="padding:32px 16px;">

<!-- Outer wrapper -->
<table width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 48px rgba(0,0,0,0.5);">

  <!-- ── HEADER ── -->
  <tr><td style="background:linear-gradient(160deg,#0a0f1a 0%,#1e2d3d 60%,#0a0f1a 100%);padding:0;position:relative;">
    <div style="height:5px;background:linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.5),#00b4b4,#8B1A1A,#00b4b4);"></div>
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="padding:36px 40px 32px;vertical-align:middle;">
        <img src="${LOGO_URL}" alt="TouchNet" style="height:44px;object-fit:contain;display:block;margin-bottom:18px;" />
        <div style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;margin-bottom:6px;">${quote.title}</div>
        <div style="font-size:12px;color:rgba(0,212,212,0.7);font-family:monospace;letter-spacing:0.08em;">
          Ref: ${quote.quote_number || '—'} &nbsp;·&nbsp; ${contractMonths}-month contract
        </div>
      </td>
      <td style="padding:36px 40px 32px;text-align:right;vertical-align:middle;min-width:160px;">
        <div style="font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:4px;">STATUS</div>
        <div style="display:inline-block;padding:7px 16px;border-radius:6px;background:rgba(0,212,212,0.12);border:1px solid rgba(0,212,212,0.3);color:#00d4d4;font-size:11px;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;">
          ${(quote.status || 'DRAFT').toUpperCase()}
        </div>
        ${quote.valid_until ? `<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:10px;">Valid until:<br/><strong style="color:#ff6b6b;">${quote.valid_until}</strong></div>` : ''}
      </td>
    </tr></table>
    <div style="height:3px;background:linear-gradient(90deg,rgba(0,180,180,0.4),transparent,rgba(139,26,26,0.3));"></div>
  </td></tr>

  <!-- ── INFO STRIP ── -->
  <tr><td style="border-bottom:3px solid #00b4b4;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="padding:22px 28px;width:50%;border-right:1px solid #eef2f7;vertical-align:top;background:#f7f9fc;">
        <div style="font-size:10px;font-weight:900;color:#00b4b4;text-transform:uppercase;letter-spacing:0.16em;margin-bottom:8px;">PREPARED FOR</div>
        <div style="font-size:15px;font-weight:800;color:#0f172a;line-height:1.3;">${quote.customer_company || quote.customer_name}</div>
        ${quote.customer_company ? `<div style="font-size:12px;color:#334155;margin-top:3px;font-weight:600;">${quote.customer_name}</div>` : ''}
        ${quote.customer_email ? `<div style="font-size:12px;color:#8B1A1A;margin-top:8px;font-weight:700;">${quote.customer_email}</div>` : ''}
        ${quote.customer_phone ? `<div style="font-size:12px;color:#5a6b7f;margin-top:3px;">${quote.customer_phone}</div>` : ''}
      </td>
      <td style="padding:22px 28px;width:50%;vertical-align:top;background:#ffffff;">
        <div style="font-size:10px;font-weight:900;color:#00b4b4;text-transform:uppercase;letter-spacing:0.16em;margin-bottom:8px;">PREPARED BY</div>
        <div style="font-size:15px;font-weight:800;color:#0f172a;">${quote.salesperson_name || 'TouchNet Sales'}</div>
        <div style="font-size:12px;color:#8B1A1A;margin-top:2px;font-weight:700;">Touchnet Telecommunications</div>
        <div style="font-size:12px;color:#5a6b7f;margin-top:8px;line-height:1.6;">
          sales@touchnet.co.za<br/>010 060 0400 · www.touchnet.co.za
        </div>
      </td>
    </tr></table>
  </td></tr>

  <!-- ── GREETING ── -->
  <tr><td style="padding:28px 36px 20px;background:#ffffff;border-bottom:1px solid #eef2f7;">
    <p style="font-size:14px;color:#1a1a1a;line-height:1.7;margin:0 0 10px;">Dear <strong>${quote.customer_name}</strong>,</p>
    <p style="font-size:13px;color:#4a5568;line-height:1.8;margin:0;padding:12px 18px;background:#f7fbfc;border-left:4px solid #00b4b4;border-radius:0 6px 6px 0;">
      ${quote.cover_message || 'Please find your quotation below. We look forward to doing business with you.'}
    </p>
  </td></tr>

  <!-- ── LINE ITEMS ── -->
  ${includedItems.length > 0 ? `
  <tr><td style="padding:24px 36px;">
    <div style="font-size:10px;font-weight:900;color:#00b4b4;text-transform:uppercase;letter-spacing:0.16em;margin-bottom:12px;">SERVICE ITEMS</div>
    ${lineItemsHtml}
  </td></tr>` : ''}

  <!-- ── RICH SECTIONS ── -->
  ${sectionsHtml ? `<tr><td style="padding:8px 36px 16px;">${sectionsHtml}</td></tr>` : ''}

  <!-- ── CTA ── -->
  <tr><td style="padding:28px 36px 32px;text-align:center;background:#f7f9fc;border-top:2px solid #e8ecf3;border-bottom:2px solid #e8ecf3;">
    <p style="font-size:13px;color:#374151;margin:0 0 18px;line-height:1.7;">
      Please review your quote and let us know your decision. Click the button below to view, accept or decline your quote online.
    </p>
    <a href="${quoteLink}" style="display:inline-block;padding:18px 48px;background:linear-gradient(135deg,#00b4b4,#007a7a);color:#ffffff;font-size:15px;font-weight:900;text-decoration:none;border-radius:10px;letter-spacing:0.04em;box-shadow:0 6px 24px rgba(0,180,180,0.4);">
      View &amp; Accept Quote →
    </a>
    <p style="font-size:11px;color:#9ca3af;margin:14px 0 0;">
      Or copy this link: <a href="${quoteLink}" style="color:#00b4b4;word-break:break-all;">${quoteLink}</a>
    </p>
  </td></tr>

  <!-- ── BANKING ── -->
  <tr><td style="padding:24px 36px;background:#ffffff;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;">
      <tr><td style="background:linear-gradient(135deg,#0a0f1a,#1e2d3d);padding:18px 22px;border-top:4px solid #00b4b4;position:relative;">
        <div style="font-size:10px;font-weight:900;color:#00d4d4;text-transform:uppercase;letter-spacing:0.16em;margin-bottom:12px;">BANKING DETAILS</div>
        <table width="100%" cellpadding="3" cellspacing="0">
          <tr>
            <td style="font-size:11px;color:rgba(255,255,255,0.4);width:130px;">Account Name:</td>
            <td style="font-size:12px;color:#ffffff;font-weight:700;">Touchnet Telecommunications (PTY) LTD</td>
          </tr>
          <tr>
            <td style="font-size:11px;color:rgba(255,255,255,0.4);">Bank:</td>
            <td style="font-size:12px;color:#ffffff;font-weight:700;">Standard Bank</td>
          </tr>
          <tr>
            <td style="font-size:11px;color:rgba(255,255,255,0.4);">Account No.:</td>
            <td style="font-size:12px;color:#ffffff;font-weight:700;">001991264</td>
          </tr>
          <tr>
            <td style="font-size:11px;color:rgba(255,255,255,0.4);">Branch Code:</td>
            <td style="font-size:12px;color:#ffffff;font-weight:700;">00 43 05 (Rosebank)</td>
          </tr>
        </table>
      </td></tr>
      <tr><td style="background:rgba(0,180,180,0.08);border-top:1px solid rgba(0,180,180,0.2);padding:10px 22px;">
        <span style="font-size:11px;color:#3a4450;font-weight:600;">
          ● Please use <strong>${quote.quote_number || 'your quote number'}</strong> as the payment reference.
        </span>
      </td></tr>
    </table>
  </td></tr>

  <!-- ── TERMS ── -->
  ${quote.terms ? `
  <tr><td style="padding:20px 36px 28px;border-top:1px solid #eef2f7;">
    <div style="font-size:10px;font-weight:900;color:#5a6b7f;text-transform:uppercase;letter-spacing:0.16em;margin-bottom:10px;">TERMS &amp; CONDITIONS</div>
    <div style="font-size:11px;color:#475569;line-height:1.9;white-space:pre-line;">${quote.terms}</div>
  </td></tr>` : ''}

  <!-- ── FOOTER ── -->
  <tr><td style="background:linear-gradient(135deg,#0a0f1a,#1e2d3d);padding:24px 36px;text-align:center;border-top:3px solid rgba(0,180,180,0.2);">
    <div style="font-size:12px;color:#00d4d4;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:6px;">
      BUILD · CONNECT · PROTECT
    </div>
    <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-bottom:4px;">
      © TouchNet Telecommunications (PTY) LTD · 151 Katherine Street, Sandton, Johannesburg
    </div>
    <div style="font-size:10px;color:rgba(255,255,255,0.18);">
      This quote was sent securely. If you did not request this, please ignore this email.
    </div>
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

      {/* ── Ticker ── */}
      <div className="relative overflow-hidden rounded-xl h-8 flex items-center"
        style={{ background: "rgba(0,180,180,0.04)", border: "1px solid rgba(0,180,180,0.12)" }}>
        <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg,#111111,transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg,#111111,transparent)" }} />
        <div className="ticker-track flex items-center gap-8 px-4 whitespace-nowrap">
          {["QUOTES & PROPOSALS","DIGITAL SIGNATURE","PDF GENERATION","EMAIL DELIVERY","PIPELINE TRACKING","CONVERSION ANALYTICS","TOUCHNET SALES",
            "QUOTES & PROPOSALS","DIGITAL SIGNATURE","PDF GENERATION","EMAIL DELIVERY","PIPELINE TRACKING","CONVERSION ANALYTICS","TOUCHNET SALES",
          ].map((t, i) => (
            <span key={i} className="text-[9px] font-black uppercase tracking-[0.2em] mono"
              style={{ color: i % 3 === 0 ? "#00b4b4" : i % 3 === 1 ? "rgba(0,180,180,0.4)" : "#e02347" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-5"
        style={{ background: "#181818", border: "1px solid rgba(0,180,180,0.2)", boxShadow: "0 4px 32px rgba(0,0,0,0.5)" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,#e02347,transparent)" }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,180,180,0.15)", border: "1px solid rgba(0,180,180,0.3)" }}>
                <FileText className="w-4 h-4" style={{ color: "#00b4b4" }} />
              </div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>Quotes & Proposals</h1>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10b981" }} />
                <span className="text-[9px] font-black mono uppercase tracking-wider" style={{ color: "#10b981" }}>LIVE</span>
              </div>
            </div>
            <p className="text-[11px] mt-0.5 mono pl-10" style={{ color: "rgba(255,255,255,0.35)" }}>
              {quotes.length} quotes · {quotes.filter(q => q.status === "accepted").length} accepted · <span style={{ color: "#10b981", fontWeight: 700 }}>{convRate}%</span> conversion
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex rounded-xl overflow-hidden p-1" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {[{ key: "list", label: "List", icon: List }, { key: "dashboard", label: "Analytics", icon: BarChart2 }].map(({ key, label, icon: Ic }) => (
                <button key={key} onClick={() => setView(key)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold transition-all"
                  style={{ background: view === key ? "linear-gradient(135deg,#00b4b4,#007a7a)" : "transparent", color: view === key ? "#fff" : "rgba(255,255,255,0.4)" }}>
                  <Ic className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
            <button onClick={() => refetch()} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#b0b0b0" }}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button onClick={() => { setEditing(null); setShowBuilder(true); }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 20px rgba(0,180,180,0.3)" }}>
              <Plus className="w-4 h-4" /> New Quote
            </button>
          </div>
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
              <KPICard label="Total Quotes"   value={quotes.length}  icon={FileText}    color="#1e2d6e" sub={`${filtered.length} shown`} />
              <KPICard label="In Pipeline"    value={quotes.filter(q=>["sent","viewed","draft"].includes(q.status)).length} icon={Clock} color="#0ea5e9" sub="Awaiting response" />
              <KPICard label="Accepted Value" value={`R${(totalAccepted/1000).toFixed(1)}k`} icon={CheckCircle2} color="#059669" sub="Monthly recurring" />
              <KPICard label="Pipeline Value" value={`R${(totalPending/1000).toFixed(1)}k`}  icon={TrendingUp}   color="#d97706" sub="Potential MRR" />
            </div>
          )}

          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2 items-center">
            {[
              { key: "all", label: `All (${quotes.length})`, color: "#00b4b4" },
              ...Object.entries(STATUS_CONFIG).map(([k, c]) => ({
                key: k, label: `${c.label} (${quotes.filter(q => q.status === k).length})`, color: c.color,
              })),
            ].map(f => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)}
                className="px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all hover:scale-105"
                style={{
                  background: statusFilter === f.key ? `${f.color}15` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${statusFilter === f.key ? f.color + "50" : "rgba(255,255,255,0.08)"}`,
                  color: statusFilter === f.key ? f.color : "rgba(255,255,255,0.35)",
                }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} />
            <input
              className="w-full pl-11 pr-10 py-3 text-[13px] outline-none rounded-xl transition-all"
              style={{ background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)", color: "#e0e0e0" }}
              placeholder="Search by title, client, quote number…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
              </button>
            )}
          </div>

          {/* Quote table */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
            <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,#e02347,transparent)" }} />

            {/* Column headers */}
            <div className="flex items-center gap-3 px-4 py-2.5"
              style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="w-2.5 flex-shrink-0" />
              <p className="hidden sm:block w-28 text-[9px] font-black uppercase tracking-[0.18em] flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>Quote #</p>
              <p className="flex-1 text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.3)" }}>Title / Client</p>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] flex-shrink-0 w-24" style={{ color: "rgba(255,255,255,0.3)" }}>Status</p>
              <p className="hidden md:block w-28 text-right text-[9px] font-black uppercase tracking-[0.18em] flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>Total</p>
              <p className="hidden lg:block w-24 text-[9px] font-black uppercase tracking-[0.18em] flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>Valid Until</p>
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
                  style={{ background: "rgba(0,180,180,0.1)", border: "1px solid rgba(0,180,180,0.2)" }}>
                  <FileText className="w-6 h-6" style={{ color: "#00b4b4" }} />
                </div>
                <p className="font-bold text-[13px]" style={{ color: "#f0f0f0" }}>No quotes found</p>
                <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Try adjusting your filters or create a new quote</p>
                <button onClick={() => { setEditing(null); setShowBuilder(true); }}
                  className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 14px rgba(0,180,180,0.3)" }}>
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
                style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-[11px] mono" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {filtered.length} of {quotes.length} quotes
                </p>
                <p className="text-[11px] font-bold mono" style={{ color: "#10b981" }}>
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