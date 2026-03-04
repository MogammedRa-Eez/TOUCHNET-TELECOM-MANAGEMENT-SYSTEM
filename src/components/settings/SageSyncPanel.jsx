import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Upload, Download, CheckCircle, AlertTriangle, Loader2, ExternalLink } from "lucide-react";

export default function SageSyncPanel() {
  const [status, setStatus] = useState(null); // null | "idle" | "loading" | "success" | "error"
  const [result, setResult] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null); // null | true | false

  async function checkConnection() {
    setStatus("loading");
    setResult(null);
    const res = await base44.functions.invoke("sageSync", { action: "status" });
    if (res.data?.connected) {
      setConnectionStatus(true);
      setResult({ message: `Connected to Sage. Business: ${res.data?.business?.name || "OK"}` });
      setStatus("success");
    } else {
      setConnectionStatus(false);
      setResult({ message: res.data?.error || "Could not connect to Sage. Check your credentials." });
      setStatus("error");
    }
  }

  async function runSync(action) {
    setStatus("loading");
    setResult(null);
    const res = await base44.functions.invoke("sageSync", { action });
    const d = res.data;
    if (d?.success) {
      setStatus("success");
      if (action === "pull") {
        setResult({ message: `Pulled ${d.customers_synced} customers and ${d.invoices_synced} invoices from Sage.`, errors: d.errors });
      } else {
        setResult({ message: `Pushed ${d.customers_pushed} customers and ${d.invoices_pushed} invoices to Sage.`, errors: d.errors });
      }
    } else {
      setStatus("error");
      setResult({ message: d?.error || "Sync failed", errors: d?.errors });
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <img src="https://logo.clearbit.com/sage.com" alt="Sage" className="w-6 h-6 rounded" onError={e => e.target.style.display='none'} />
            Sage Business Cloud Accounting
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Two-way sync of customers and invoices</p>
        </div>
        <a
          href="https://accounting.sage.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
        >
          Open Sage <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Connection status indicator */}
      {connectionStatus !== null && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${connectionStatus ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {connectionStatus ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {connectionStatus ? "Connected to Sage" : "Not connected"}
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={checkConnection}
          disabled={status === "loading"}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium transition disabled:opacity-50"
        >
          {status === "loading" && !result ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Test Connection
        </button>
        <button
          onClick={() => runSync("pull")}
          disabled={status === "loading"}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium transition disabled:opacity-50"
        >
          {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Pull from Sage
        </button>
        <button
          onClick={() => runSync("push")}
          disabled={status === "loading"}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-medium transition disabled:opacity-50"
        >
          {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Push to Sage
        </button>
      </div>

      {/* Result message */}
      {result && (
        <div className={`rounded-xl p-4 border text-sm ${status === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          <p className="font-medium">{result.message}</p>
          {result.errors?.length > 0 && (
            <ul className="mt-2 space-y-1 list-disc pl-4">
              {result.errors.map((e, i) => <li key={i} className="text-xs opacity-80">{e}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Info note */}
      <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-slate-100">
        <p><strong className="text-slate-500">Pull from Sage</strong> — imports Sage contacts & invoices into this app (creates or updates existing records).</p>
        <p><strong className="text-slate-500">Push to Sage</strong> — exports new local customers & invoices that aren't yet in Sage.</p>
        <p>Records are matched by Sage ID. Ensure your <code className="bg-slate-100 px-1 rounded">SAGE_REFRESH_TOKEN</code> and <code className="bg-slate-100 px-1 rounded">SAGE_BUSINESS_ID</code> secrets are set correctly.</p>
      </div>
    </div>
  );
}