import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  RefreshCw, Upload, Download, CheckCircle, AlertTriangle,
  Loader2, ExternalLink, Settings, ChevronDown, ChevronUp,
  Zap, Receipt, Play, Info, X
} from "lucide-react";

// ── Demo simulation (no real API calls) ──────────────────────────────────────
function runDemo(setLog, setDemoRunning, setDemoResult) {
  setDemoRunning(true);
  setLog([]);
  setDemoResult(null);

  const steps = [
    { delay: 400,  text: "🔑 Authenticating with Sage OAuth2 (refresh_token grant)…", color: "#6366f1" },
    { delay: 900,  text: "✅ Access token obtained — expires in 3600s", color: "#10b981" },
    { delay: 1400, text: "📋 Fetching paid invoices from local billing system…", color: "#6366f1" },
    { delay: 1900, text: "   Found 3 paid invoices ready to sync", color: "#1e293b" },
    { delay: 2400, text: "🔍 Checking Sage contacts for INV-2024-001 (Acme Corp)…", color: "#6366f1" },
    { delay: 2800, text: "   Contact exists in Sage (contact_id: sgc_ac8f2b)", color: "#10b981" },
    { delay: 3200, text: "📤 Pushing INV-2024-001 → Sage Sales Invoices…", color: "#6366f1" },
    { delay: 3700, text: "   ✅ INV-2024-001 synced → sage_id: si_91a3de (R 4,500)", color: "#10b981" },
    { delay: 4100, text: "🔍 Checking Sage contacts for INV-2024-002 (Beta Ltd)…", color: "#6366f1" },
    { delay: 4500, text: "   Contact not found — creating new Sage contact…", color: "#f59e0b" },
    { delay: 5000, text: "   ✅ Contact created → sage_id: sgc_bt7c19", color: "#10b981" },
    { delay: 5400, text: "📤 Pushing INV-2024-002 → Sage Sales Invoices…", color: "#6366f1" },
    { delay: 5900, text: "   ✅ INV-2024-002 synced → sage_id: si_44bc71 (R 12,800)", color: "#10b981" },
    { delay: 6300, text: "🔍 Checking Sage contacts for INV-2024-003 (Gamma Inc)…", color: "#6366f1" },
    { delay: 6700, text: "   Contact exists in Sage (contact_id: sgc_gm5d4a)", color: "#10b981" },
    { delay: 7100, text: "📤 Pushing INV-2024-003 → Sage Sales Invoices…", color: "#6366f1" },
    { delay: 7600, text: "   ✅ INV-2024-003 synced → sage_id: si_f2e88c (R 7,200)", color: "#10b981" },
    { delay: 8100, text: "🎉 Sync complete! 3 invoices pushed, 0 errors.", color: "#10b981" },
  ];

  steps.forEach(({ delay, text, color }) => {
    setTimeout(() => {
      setLog(prev => [...prev, { text, color }]);
    }, delay);
  });

  setTimeout(() => {
    setDemoRunning(false);
    setDemoResult({
      success: true,
      total_paid: 3,
      invoices_pushed: 3,
      invoices_skipped: 0,
      errors: [],
      pushed_invoices: [
        { number: "INV-2024-001", customer: "Acme Corp",  amount: 4500,  sage_id: "si_91a3de" },
        { number: "INV-2024-002", customer: "Beta Ltd",   amount: 12800, sage_id: "si_44bc71" },
        { number: "INV-2024-003", customer: "Gamma Inc",  amount: 7200,  sage_id: "si_f2e88c" },
      ]
    });
  }, 8600);
}

// ── Sub-component: Config panel ───────────────────────────────────────────────
function ConfigSection({ businessId, refreshToken, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(99,102,241,0.12)" }}>
      <button
        onClick={() => setShow(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
        style={{ background: show ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.03)" }}
      >
        <span className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: "#1e293b" }}>
          <Settings className="w-4 h-4" style={{ color: "#6366f1" }} />
          Sage OAuth2 Configuration
        </span>
        {show ? <ChevronUp className="w-4 h-4" style={{ color: "#94a3b8" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "#94a3b8" }} />}
      </button>
      {show && (
        <div className="p-4 space-y-3" style={{ background: "#fafbff", borderTop: "1px solid rgba(99,102,241,0.08)" }}>
          <div className="flex items-start gap-2 p-3 rounded-lg text-[11px]" style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", color: "#0891b2" }}>
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>These values are read from your environment secrets (<code className="font-mono">SAGE_BUSINESS_ID</code>, <code className="font-mono">SAGE_REFRESH_TOKEN</code>). Displayed here for reference only — edit them in your App Settings → Environment Variables.</span>
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1" style={{ color: "#64748b" }}>SAGE_BUSINESS_ID</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={businessId}
                readOnly
                className="flex-1 text-[12px] font-mono px-3 py-2 rounded-lg outline-none"
                style={{ background: "#f1f5f9", border: "1px solid rgba(99,102,241,0.1)", color: "#475569" }}
              />
              {businessId ? <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#10b981" }} /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#f59e0b" }} />}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1" style={{ color: "#64748b" }}>SAGE_REFRESH_TOKEN</label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={refreshToken}
                readOnly
                className="flex-1 text-[12px] font-mono px-3 py-2 rounded-lg outline-none"
                style={{ background: "#f1f5f9", border: "1px solid rgba(99,102,241,0.1)", color: "#475569" }}
              />
              {refreshToken ? <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#10b981" }} /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#f59e0b" }} />}
            </div>
          </div>
          <div className="text-[10px] pt-1" style={{ color: "#94a3b8" }}>
            OAuth2 flow: <span className="font-mono">grant_type=refresh_token</span> → <code className="font-mono">https://oauth.accounting.sage.com/token</code> → short-lived access token used per request.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SageSyncPanel() {
  const [status, setStatus]               = useState(null);
  const [result, setResult]               = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [activeAction, setActiveAction]   = useState(null);

  // Demo
  const [demoOpen, setDemoOpen]   = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoLog, setDemoLog]     = useState([]);
  const [demoResult, setDemoResult] = useState(null);
  const logEndRef = React.useRef(null);

  React.useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [demoLog]);

  async function checkConnection() {
    setActiveAction("status"); setStatus("loading"); setResult(null);
    const res = await base44.functions.invoke("sageSync", { action: "status" });
    if (res.data?.connected) {
      setConnectionStatus(true);
      setResult({ message: `Connected. Business: ${res.data?.business?.name || "OK"}` });
      setStatus("success");
    } else {
      setConnectionStatus(false);
      setResult({ message: res.data?.error || "Could not connect. Check credentials." });
      setStatus("error");
    }
    setActiveAction(null);
  }

  async function pushPaidInvoices() {
    setActiveAction("push_paid"); setStatus("loading"); setResult(null);
    const res = await base44.functions.invoke("sageSync", { action: "push_paid" });
    const d = res.data;
    if (d?.success) {
      setStatus("success");
      setResult({ message: `Pushed ${d.invoices_pushed} paid invoice(s) to Sage. ${d.invoices_skipped} already synced.`, errors: d.errors, pushed: d.pushed_invoices });
    } else {
      setStatus("error");
      setResult({ message: d?.error || "Push failed", errors: d?.errors });
    }
    setActiveAction(null);
  }

  async function runSync(action) {
    setActiveAction(action); setStatus("loading"); setResult(null);
    const res = await base44.functions.invoke("sageSync", { action });
    const d = res.data;
    if (d?.success) {
      setStatus("success");
      setResult({
        message: action === "pull"
          ? `Pulled ${d.customers_synced} customers & ${d.invoices_synced} invoices from Sage.`
          : `Pushed ${d.customers_pushed} customers & ${d.invoices_pushed} invoices to Sage.`,
        errors: d.errors
      });
    } else {
      setStatus("error");
      setResult({ message: d?.error || "Sync failed", errors: d?.errors });
    }
    setActiveAction(null);
  }

  const loading = status === "loading";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid rgba(99,102,241,0.12)", boxShadow: "0 2px 16px rgba(99,102,241,0.06)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(99,102,241,0.08)", background: "rgba(99,102,241,0.03)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
            <img src="https://logo.clearbit.com/sage.com" alt="Sage" className="w-5 h-5 rounded" onError={e => e.target.style.display='none'} />
          </div>
          <div>
            <h3 className="text-[14px] font-bold" style={{ color: "#1e293b" }}>Sage Business Cloud</h3>
            <p className="text-[11px] mono" style={{ color: "#94a3b8" }}>Automated paid-invoice sync · OAuth2</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connectionStatus !== null && (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: connectionStatus ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)", color: connectionStatus ? "#059669" : "#ef4444", border: `1px solid ${connectionStatus ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"}` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: connectionStatus ? "#10b981" : "#ef4444" }} />
              {connectionStatus ? "Connected" : "Disconnected"}
            </span>
          )}
          <a href="https://accounting.sage.com" target="_blank" rel="noopener noreferrer"
            className="text-[11px] flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors"
            style={{ color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.04)" }}>
            Open Sage <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Config section */}
        <ConfigSection
          businessId={import.meta.env?.VITE_SAGE_BUSINESS_ID || "••••••••••••••••"}
          refreshToken={import.meta.env?.VITE_SAGE_REFRESH_TOKEN || "••••••••••••••••••••••••"}
        />

        {/* PRIMARY ACTION: Push Paid Invoices */}
        <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.12)" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-bold flex items-center gap-2" style={{ color: "#1e293b" }}>
                <Receipt className="w-4 h-4" style={{ color: "#6366f1" }} />
                Push Paid Invoices → Sage
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>Automatically syncs all locally-paid invoices to Sage as Sales Invoices. Skips already-synced records. Creates missing contacts automatically.</p>
            </div>
          </div>
          <button
            onClick={pushPaidInvoices}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[13px] font-bold text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
            {activeAction === "push_paid" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {activeAction === "push_paid" ? "Pushing Paid Invoices…" : "Sync Paid Invoices to Sage"}
          </button>
        </div>

        {/* Secondary actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={checkConnection} disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition disabled:opacity-50"
            style={{ border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.05)", color: "#6366f1" }}>
            {activeAction === "status" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Test Connection
          </button>
          <button onClick={() => runSync("pull")} disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition disabled:opacity-50"
            style={{ border: "1px solid rgba(6,182,212,0.2)", background: "rgba(6,182,212,0.05)", color: "#0891b2" }}>
            {activeAction === "pull" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Pull from Sage
          </button>
          <button onClick={() => runSync("push")} disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition disabled:opacity-50"
            style={{ border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.05)", color: "#059669" }}>
            {activeAction === "push" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Full Push
          </button>
        </div>

        {/* Result message */}
        {result && (
          <div className="rounded-xl p-4 text-[12px]"
            style={{ background: status === "success" ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)", border: `1px solid ${status === "success" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, color: status === "success" ? "#065f46" : "#7f1d1d" }}>
            <p className="font-semibold flex items-center gap-2">
              {status === "success" ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
              {result.message}
            </p>
            {result.pushed?.length > 0 && (
              <div className="mt-3 space-y-1">
                {result.pushed.map((inv, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] px-3 py-1.5 rounded-lg" style={{ background: "rgba(16,185,129,0.06)" }}>
                    <span className="font-mono font-semibold">{inv.number}</span>
                    <span style={{ color: "#64748b" }}>{inv.customer}</span>
                    <span className="font-bold" style={{ color: "#059669" }}>R {inv.amount?.toLocaleString()}</span>
                    <span className="font-mono text-[10px]" style={{ color: "#94a3b8" }}>→ {inv.sage_id}</span>
                  </div>
                ))}
              </div>
            )}
            {result.errors?.length > 0 && (
              <ul className="mt-2 space-y-1 list-disc pl-4">
                {result.errors.map((e, i) => <li key={i} className="opacity-75">{e}</li>)}
              </ul>
            )}
          </div>
        )}

        {/* ── DEMO SECTION ── */}
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(245,158,11,0.2)" }}>
          <button onClick={() => setDemoOpen(v => !v)} className="w-full flex items-center justify-between px-4 py-3"
            style={{ background: "rgba(245,158,11,0.05)" }}>
            <span className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "#b45309" }}>
              <Play className="w-4 h-4" />
              Demo: Simulate Paid Invoice Sync
            </span>
            {demoOpen ? <ChevronUp className="w-4 h-4" style={{ color: "#d97706" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "#d97706" }} />}
          </button>

          {demoOpen && (
            <div className="p-4 space-y-3" style={{ background: "#fffdf5", borderTop: "1px solid rgba(245,158,11,0.12)" }}>
              <p className="text-[11px]" style={{ color: "#92400e" }}>
                This simulation walks through the full OAuth2 + Sage push flow using dummy data — no real API calls are made. Use it to understand how the sync module works before connecting live credentials.
              </p>

              <button
                onClick={() => { setDemoLog([]); setDemoResult(null); runDemo(setDemoLog, setDemoRunning, setDemoResult); }}
                disabled={demoRunning}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-bold text-white transition disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 4px 12px rgba(245,158,11,0.3)" }}>
                {demoRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {demoRunning ? "Running demo…" : "▶ Run Demo"}
              </button>

              {(demoLog.length > 0 || demoResult) && (
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(245,158,11,0.15)" }}>
                  {/* Terminal log */}
                  <div className="px-4 py-2 flex items-center gap-2" style={{ background: "#1e1b18" }}>
                    <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><span className="w-2.5 h-2.5 rounded-full bg-green-400" /></div>
                    <span className="text-[10px] font-mono" style={{ color: "#6b7280" }}>sage-sync-demo — stdout</span>
                  </div>
                  <div className="p-4 font-mono text-[11px] space-y-1 max-h-64 overflow-y-auto op-scroll" style={{ background: "#0f0e0c" }}>
                    {demoLog.map((line, i) => (
                      <div key={i} style={{ color: line.color }}>{line.text}</div>
                    ))}
                    {demoRunning && <div className="flex items-center gap-2" style={{ color: "#94a3b8" }}><Loader2 className="w-3 h-3 animate-spin" /> processing…</div>}
                    <div ref={logEndRef} />
                  </div>

                  {/* Demo result table */}
                  {demoResult && (
                    <div className="p-4 space-y-3" style={{ background: "rgba(16,185,129,0.04)", borderTop: "1px solid rgba(16,185,129,0.15)" }}>
                      <p className="text-[12px] font-bold flex items-center gap-2" style={{ color: "#065f46" }}>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        Demo complete — {demoResult.invoices_pushed} invoices synced to Sage
                      </p>
                      <div className="space-y-1">
                        {demoResult.pushed_invoices.map((inv, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px] px-3 py-2 rounded-lg" style={{ background: "#f0fdf4", border: "1px solid rgba(16,185,129,0.15)" }}>
                            <span className="font-mono font-bold" style={{ color: "#6366f1" }}>{inv.number}</span>
                            <span style={{ color: "#64748b" }}>{inv.customer}</span>
                            <span className="font-bold" style={{ color: "#059669" }}>R {inv.amount.toLocaleString()}</span>
                            <span className="font-mono text-[10px]" style={{ color: "#94a3b8" }}>sage: {inv.sage_id}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info footer */}
        <div className="text-[10px] pt-1 space-y-1" style={{ borderTop: "1px solid rgba(99,102,241,0.08)", color: "#94a3b8" }}>
          <p><strong style={{ color: "#64748b" }}>Sync Paid Invoices</strong> — pushes invoices with status <code className="font-mono bg-slate-100 px-1 rounded text-slate-600">paid</code> to Sage as Sales Invoices. Missing contacts are created automatically.</p>
          <p><strong style={{ color: "#64748b" }}>OAuth2</strong> — uses <code className="font-mono bg-slate-100 px-1 rounded text-slate-600">SAGE_REFRESH_TOKEN</code> to obtain a short-lived access token on every request. No manual token management needed.</p>
        </div>
      </div>
    </div>
  );
}