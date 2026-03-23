import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  FileText, Upload, Trash2, Download, Loader2, Image, File, FileCheck, X, Eye
} from "lucide-react";
import { format } from "date-fns";

const DOC_TYPES = [
  { value: "signed_contract",      label: "Signed Contract" },
  { value: "installation_photo",   label: "Installation Photo" },
  { value: "id_copy",              label: "ID Copy" },
  { value: "proof_of_address",     label: "Proof of Address" },
  { value: "other",                label: "Other" },
];

const TYPE_ICON = {
  signed_contract:    <FileCheck className="w-4 h-4 text-indigo-500" />,
  installation_photo: <Image className="w-4 h-4 text-emerald-500" />,
  id_copy:            <FileText className="w-4 h-4 text-orange-500" />,
  proof_of_address:   <FileText className="w-4 h-4 text-blue-500" />,
  other:              <File className="w-4 h-4 text-slate-400" />,
};

const TYPE_COLOR = {
  signed_contract:    "bg-indigo-50 border-indigo-100",
  installation_photo: "bg-emerald-50 border-emerald-100",
  id_copy:            "bg-orange-50 border-orange-100",
  proof_of_address:   "bg-blue-50 border-blue-100",
  other:              "bg-slate-50 border-slate-100",
};

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function PortalDocumentsTab({ customer, user }) {
  const [showUpload, setShowUpload] = useState(false);
  const [docType, setDocType] = useState("other");
  const [docName, setDocName] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["portal-customer-docs", customer.id],
    queryFn: () => base44.entities.CustomerDocument.filter({ customer_id: customer.id }, "-created_date"),
    enabled: !!customer.id,
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.CustomerDocument.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["portal-customer-docs", customer.id] }),
  });

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    if (!docName) setDocName(f.name.replace(/\.[^/.]+$/, ""));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !docName.trim()) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.CustomerDocument.create({
      customer_id: customer.id,
      customer_name: customer.full_name,
      document_type: docType,
      name: docName.trim(),
      file_url,
      file_size: file.size,
      file_mime: file.type,
      uploaded_by: user?.email || customer.email,
    });
    queryClient.invalidateQueries({ queryKey: ["portal-customer-docs", customer.id] });
    setShowUpload(false);
    setFile(null);
    setDocName("");
    setDocType("other");
    setUploading(false);
  };

  const isImage = (mime) => mime?.startsWith("image/");

  return (
    <div className="space-y-4">
      {/* Upload button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Upload form */}
      {showUpload && (
        <div className="bg-white rounded-2xl border border-indigo-200 shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Upload a Document</h3>
            <button onClick={() => { setShowUpload(false); setFile(null); setDocName(""); }} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleUpload} className="space-y-3">
            {/* File drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-indigo-200 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all"
            >
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileCheck className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-semibold text-indigo-700">{file.name}</span>
                  <span className="text-xs text-slate-400">({formatBytes(file.size)})</span>
                </div>
              ) : (
                <>
                  <Upload className="w-7 h-7 mx-auto mb-2 text-indigo-300" />
                  <p className="text-sm text-slate-500">Click to select a file</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, images, Word docs — up to 10MB</p>
                </>
              )}
              <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Document Name *</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="e.g. Signed Contract Jan 2026"
                value={docName}
                onChange={e => setDocName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Document Type</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                value={docType}
                onChange={e => setDocType(e.target.value)}
              >
                {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setShowUpload(false); setFile(null); setDocName(""); }}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !file}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Uploading…" : "Upload"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Document list */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : docs.length === 0 ? (
        <div className="rounded-2xl p-10 text-center bg-white border border-slate-200 shadow-sm">
          <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-slate-600 mb-1">No Documents Yet</p>
          <p className="text-sm text-slate-400">Upload your signed contracts, installation photos, or ID copies above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Group by type */}
          {DOC_TYPES.map(type => {
            const typeDocs = docs.filter(d => d.document_type === type.value);
            if (typeDocs.length === 0) return null;
            return (
              <div key={type.value}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">{type.label}</p>
                {typeDocs.map(doc => (
                  <div
                    key={doc.id}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-2 border ${TYPE_COLOR[doc.document_type] || TYPE_COLOR.other}`}
                  >
                    <div className="flex-shrink-0">{TYPE_ICON[doc.document_type] || TYPE_ICON.other}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{doc.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {doc.created_date ? format(new Date(doc.created_date), "d MMM yyyy") : ""}
                        {doc.file_size ? ` · ${formatBytes(doc.file_size)}` : ""}
                        {doc.uploaded_by ? ` · ${doc.uploaded_by}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isImage(doc.file_mime) && (
                        <button
                          onClick={() => setPreviewUrl(doc.file_url)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/60 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4 text-slate-500" />
                        </button>
                      )}
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/60 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-slate-500" />
                      </a>
                      <button
                        onClick={() => { if (confirm("Delete this document?")) deleteMut.mutate(doc.id); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Image preview lightbox */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white flex items-center gap-1.5 text-sm font-semibold"
            >
              <X className="w-4 h-4" /> Close
            </button>
            <img src={previewUrl} alt="Preview" className="w-full rounded-2xl shadow-2xl object-contain max-h-[80vh]" />
          </div>
        </div>
      )}
    </div>
  );
}