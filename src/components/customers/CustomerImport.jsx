import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, X, CheckCircle2, XCircle, Loader2, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CUSTOMER_SCHEMA = {
  type: "object",
  properties: {
    customers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          full_name:        { type: "string" },
          email:            { type: "string" },
          phone:            { type: "string" },
          address:          { type: "string" },
          account_number:   { type: "string" },
          status:           { type: "string", enum: ["active", "suspended", "terminated", "pending"] },
          service_plan:     { type: "string", enum: ["basic_10mbps", "standard_50mbps", "premium_100mbps", "enterprise_500mbps", "dedicated_1gbps"] },
          monthly_rate:     { type: "number" },
          connection_type:  { type: "string", enum: ["fiber", "wireless", "dsl", "satellite"] },
          notes:            { type: "string" },
        },
        required: ["full_name", "email"],
      },
    },
  },
};

export default function CustomerImport({ onClose }) {
  const queryClient = useQueryClient();
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState("upload"); // upload | extracting | preview | importing | done
  const [preview, setPreview] = useState([]);
  const [results, setResults] = useState({ ok: [], failed: [] });

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setStage("upload");
    setPreview([]);
  };

  const extract = async () => {
    setStage("extracting");
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: CUSTOMER_SCHEMA,
    });
    if (result.status !== "success" || !result.output?.customers?.length) {
      toast.error("Could not extract customer data from this file. Check the format and try again.");
      setStage("upload");
      return;
    }
    setPreview(result.output.customers);
    setStage("preview");
  };

  const importAll = async () => {
    setStage("importing");
    const ok = [], failed = [];
    for (const c of preview) {
      try {
        await base44.entities.Customer.create({ ...c, status: c.status || "pending" });
        ok.push(c.full_name);
      } catch (e) {
        failed.push({ name: c.full_name, reason: e.message });
      }
    }
    setResults({ ok, failed });
    setStage("done");
    queryClient.invalidateQueries({ queryKey: ["customers"] });
    if (ok.length) toast.success(`${ok.length} customers imported successfully`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden" style={{ background: "#0a0f2e", border: "1px solid rgba(99,102,241,0.25)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(99,102,241,0.15)" }}>
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-200">Import Customer Pool</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Step 1: Upload */}
          {(stage === "upload" || stage === "extracting") && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Upload a <strong className="text-slate-300">CSV, Excel, or JSON</strong> file containing your customer list. Fields like name, email, phone, service plan, and status will be automatically detected.</p>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors"
                style={{ borderColor: file ? "rgba(99,102,241,0.6)" : "rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.04)" }}>
                <Upload className="w-8 h-8 text-indigo-400" />
                {file ? (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-indigo-300">{file.name}</p>
                    <p className="text-[11px] text-slate-500">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Drag & drop or <span className="text-indigo-400 underline">browse</span></p>
                    <p className="text-[11px] text-slate-600 mt-1">CSV · XLSX · JSON</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.json" className="hidden" onChange={e => handleFile(e.target.files[0])} />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-slate-200">Cancel</Button>
                <Button size="sm" onClick={extract} disabled={!file || stage === "extracting"} className="text-white gap-2" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  {stage === "extracting" ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Extracting...</> : <><Upload className="w-3.5 h-3.5" /> Extract Data</>}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {stage === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <p className="text-xs text-indigo-300"><strong>{preview.length} customers</strong> detected. Review below before importing.</p>
              </div>
              <div className="rounded-xl overflow-hidden max-h-72 overflow-y-auto" style={{ border: "1px solid rgba(99,102,241,0.15)" }}>
                <table className="w-full text-xs">
                  <thead style={{ background: "#070b1f" }}>
                    <tr>
                      {["Name", "Email", "Status", "Plan", "Rate"].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((c, i) => (
                      <tr key={i} style={{ borderTop: "1px solid rgba(99,102,241,0.08)" }} className="hover:bg-white/5">
                        <td className="px-3 py-2 text-slate-300 font-medium">{c.full_name}</td>
                        <td className="px-3 py-2 text-slate-500 font-mono">{c.email}</td>
                        <td className="px-3 py-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize" style={{ background: c.status === "active" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: c.status === "active" ? "#10b981" : "#f59e0b" }}>
                            {c.status || "pending"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-400">{c.service_plan?.replace(/_/g, " ") || "—"}</td>
                        <td className="px-3 py-2 text-slate-300 font-mono">{c.monthly_rate ? `R${c.monthly_rate}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between gap-3">
                <Button variant="ghost" size="sm" onClick={() => setStage("upload")} className="text-slate-400 hover:text-slate-200">← Back</Button>
                <Button size="sm" onClick={importAll} className="text-white gap-2" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Import {preview.length} Customers
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Importing */}
          {stage === "importing" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-sm text-slate-400">Importing customers into database...</p>
            </div>
          )}

          {/* Step 4: Done */}
          {stage === "done" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-4 text-center" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
                  <p className="text-2xl font-bold text-emerald-400">{results.ok.length}</p>
                  <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Imported</p>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
                  <p className="text-2xl font-bold text-red-400">{results.failed.length}</p>
                  <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Failed</p>
                </div>
              </div>
              {results.failed.length > 0 && (
                <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(239,68,68,0.2)" }}>
                  <div className="px-4 py-2" style={{ background: "rgba(239,68,68,0.08)" }}>
                    <p className="text-xs font-bold text-red-400 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Failed Records</p>
                  </div>
                  {results.failed.map((f, i) => (
                    <div key={i} className="px-4 py-2 flex justify-between gap-3 text-xs" style={{ borderTop: "1px solid rgba(239,68,68,0.08)" }}>
                      <span className="text-slate-300">{f.name}</span>
                      <span className="text-red-400">{f.reason}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end">
                <Button size="sm" onClick={onClose} className="text-white" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>Close</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}