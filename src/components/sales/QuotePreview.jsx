import React from "react";
import { X, ExternalLink, FileText, CheckCircle, Clock, XCircle, Eye, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

const STATUS_CONFIG = {
  draft:    { color: "#94a3b8", label: "Draft" },
  sent:     { color: "#3b82f6", label: "Sent" },
  viewed:   { color: "#8b5cf6", label: "Viewed" },
  accepted: { color: "#10b981", label: "Accepted" },
  declined: { color: "#ef4444", label: "Declined" },
  expired:  { color: "#f59e0b", label: "Expired" },
};

export default function QuotePreview({ quote, onClose, onEdit, onSendEmail }) {
  if (!quote) return null;
  const color = quote.branding_color || "#6366f1";
  const status = STATUS_CONFIG[quote.status] || STATUS_CONFIG.draft;

  const includedItems = (quote.line_items || []).filter(i => !i.optional || i.included);
  const optionalItems = (quote.line_items || []).filter(i => i.optional && !i.included);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="min-h-screen flex flex-col items-center py-8 px-4">
        {/* Controls */}
        <div className="w-full max-w-3xl flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {onEdit && <Button size="sm" variant="outline" onClick={onEdit} className="gap-1"><FileText className="w-4 h-4" /> Edit</Button>}
            {onSendEmail && quote.customer_email && (
              <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onSendEmail(quote)}>
                <Mail className="w-4 h-4" /> Email to Client
              </Button>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white"><X className="w-4 h-4" /></button>
        </div>

        {/* Quote Document */}
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Banner */}
          <div className="px-10 py-8" style={{ background: `linear-gradient(135deg, ${color}, #8b5cf6)`, color: "#fff" }}>
            <div className="flex items-start justify-between">
              <div>
                <img src={LOGO_URL} alt="TouchNet" className="h-8 mb-4 brightness-0 invert" />
                <h1 className="text-2xl font-bold leading-tight">{quote.title}</h1>
                <p className="text-sm opacity-80 mt-1 font-mono">{quote.quote_number}</p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}>
                {status.label}
              </span>
            </div>
          </div>

          {/* Meta Row */}
          <div className="flex flex-wrap gap-6 px-10 py-5 bg-slate-50 border-b text-sm">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Prepared For</p>
              <p className="font-bold text-slate-800">{quote.customer_name}</p>
              {quote.customer_company && <p className="text-slate-500">{quote.customer_company}</p>}
              {quote.customer_email && <p className="text-slate-500">{quote.customer_email}</p>}
              {quote.customer_phone && <p className="text-slate-500">{quote.customer_phone}</p>}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Date</p>
              <p className="text-slate-700">{quote.created_date ? format(new Date(quote.created_date), "d MMM yyyy") : format(new Date(), "d MMM yyyy")}</p>
            </div>
            {quote.valid_until && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Valid Until</p>
                <p className="text-slate-700">{format(new Date(quote.valid_until), "d MMM yyyy")}</p>
              </div>
            )}
          </div>

          <div className="px-10 py-8 space-y-8">
            {/* Cover Message */}
            {quote.cover_message && (
              <div className="rounded-xl p-5 text-sm text-slate-700 leading-relaxed" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                {quote.cover_message}
              </div>
            )}

            {/* Rich Sections */}
            {(quote.sections || []).length > 0 && (
              <div className="space-y-6">
                {quote.sections.map(s => <RichSection key={s.id} section={s} color={color} />)}
              </div>
            )}

            {/* Line Items */}
            {includedItems.length > 0 && (
              <div>
                <h2 className="text-base font-bold text-slate-800 mb-4">Pricing</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2" style={{ borderColor: color }}>
                      <th className="text-left pb-2 font-semibold text-slate-600">Description</th>
                      <th className="text-right pb-2 font-semibold text-slate-600 w-16">Qty</th>
                      <th className="text-right pb-2 font-semibold text-slate-600 w-28">Unit Price</th>
                      <th className="text-right pb-2 font-semibold text-slate-600 w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {includedItems.map(item => (
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="py-3">
                          <p className="font-medium text-slate-800">{item.description}</p>
                          {item.detail && <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>}
                        </td>
                        <td className="py-3 text-right text-slate-600">{item.quantity}</td>
                        <td className="py-3 text-right text-slate-600 font-mono">R{(item.unit_price || 0).toFixed(2)}</td>
                        <td className="py-3 text-right font-semibold text-slate-800 font-mono">R{((item.quantity || 1) * (item.unit_price || 0)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
                  <div className="flex justify-between text-slate-500"><span>Subtotal</span><span className="font-mono">R{(quote.subtotal || 0).toFixed(2)}</span></div>
                  {quote.discount_percent > 0 && (
                    <div className="flex justify-between text-emerald-600"><span>Discount ({quote.discount_percent}%)</span><span className="font-mono">-R{(quote.discount_amount || 0).toFixed(2)}</span></div>
                  )}
                  {quote.tax_percent > 0 && (
                    <div className="flex justify-between text-slate-500"><span>VAT ({quote.tax_percent}%)</span><span className="font-mono">R{(quote.tax_amount || 0).toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between font-bold text-lg text-slate-800 border-t-2 pt-3 mt-3 font-mono" style={{ borderColor: color }}>
                    <span>TOTAL</span><span style={{ color }}>R{(quote.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Optional Items */}
            {optionalItems.length > 0 && (
              <div className="rounded-xl p-5" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                <h3 className="text-sm font-bold text-amber-700 mb-3">Optional Add-ons</h3>
                <div className="space-y-2">
                  {optionalItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium text-slate-700">{item.description}</p>
                        {item.detail && <p className="text-xs text-slate-500">{item.detail}</p>}
                      </div>
                      <span className="font-mono font-semibold text-amber-700">R{((item.quantity || 1) * (item.unit_price || 0)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {quote.notes && (
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">Notes</h3>
                <p className="text-sm text-slate-600 whitespace-pre-line">{quote.notes}</p>
              </div>
            )}

            {/* Terms */}
            {quote.terms && (
              <div className="pt-4 border-t">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Terms & Conditions</h3>
                <p className="text-xs text-slate-500 whitespace-pre-line">{quote.terms}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-10 py-5 text-center text-xs text-slate-400 border-t">
            TouchNet · Professional Fibre & Connectivity Services
          </div>
        </div>
      </div>
    </div>
  );
}

function RichSection({ section, color }) {
  if (section.type === "divider") return <hr className="border-slate-200" />;

  return (
    <div>
      {section.heading && <h2 className="text-base font-bold text-slate-800 mb-2">{section.heading}</h2>}
      {section.type === "text" && section.content && <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{section.content}</p>}
      {section.type === "image" && section.image_url && (
        <div>
          <img src={section.image_url} alt={section.heading || ""} className="w-full rounded-xl object-cover max-h-64" />
          {section.content && <p className="text-xs text-slate-400 text-center mt-2">{section.content}</p>}
        </div>
      )}
      {(section.type === "link" || section.type === "file") && (
        <div className="rounded-xl p-4" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
          {section.content && <p className="text-sm text-slate-700 mb-3">{section.content}</p>}
          {section.url && (
            <a href={section.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: color }}>
              {section.type === "file" ? <FileText className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
              {section.label || (section.type === "file" ? "Download File" : "Open Link")}
            </a>
          )}
        </div>
      )}
    </div>
  );
}