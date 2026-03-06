import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DOC_TYPES = [
  { value: "vendor_quote", label: "Vendor Quote" },
  { value: "purchase_order", label: "Purchase Order" },
  { value: "site_survey", label: "Site Survey" },
  { value: "planning_lla", label: "Planning / LLA" },
  { value: "wayleave", label: "Wayleave" },
  { value: "handover_doc", label: "Handover Document" },
  { value: "client_takeon_form", label: "Client Take-On Form" },
  { value: "contract", label: "Contract" },
  { value: "other", label: "Other" },
];

export default function ProjectDocumentPanel({ project }) {
  const qc = useQueryClient();
  const fileRef = useRef();
  const [docType, setDocType] = useState("vendor_quote");
  const [uploading, setUploading] = useState(false);

  const { data: docs = [] } = useQuery({
    queryKey: ["project-docs", project.id],
    queryFn: () => base44.entities.ProjectDocument.filter({ project_id: project.id }),
  });

  const deleteDoc = useMutation({
    mutationFn: (id) => base44.entities.ProjectDocument.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project-docs", project.id] }),
  });

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.ProjectDocument.create({
      project_id: project.id,
      quote_number: project.quote_number,
      document_type: docType,
      name: file.name,
      file_url,
    });
    qc.invalidateQueries({ queryKey: ["project-docs", project.id] });
    setUploading(false);
    fileRef.current.value = "";
  };

  return (
    <div className="p-5">
      {/* Upload */}
      <div className="flex items-center gap-3 mb-5 p-4 rounded-xl" style={{ background: "rgba(99,102,241,0.06)", border: "1px dashed rgba(99,102,241,0.25)" }}>
        <Select value={docType} onValueChange={setDocType}>
          <SelectTrigger className="w-44 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DOC_TYPES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
        <Button size="sm" onClick={() => fileRef.current.click()} disabled={uploading}
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff" }}>
          <Upload className="w-3.5 h-3.5 mr-1" />
          {uploading ? "Uploading..." : "Upload Document"}
        </Button>
      </div>

      {/* Document List */}
      {docs.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg"
              style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.1)" }}>
              <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{doc.name}</p>
                <p className="text-[10px] text-slate-400">{DOC_TYPES.find(d => d.value === doc.document_type)?.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="ghost" className="h-7 px-2"><Download className="w-3.5 h-3.5" /></Button>
                </a>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-red-400 hover:text-red-600"
                  onClick={() => deleteDoc.mutate(doc.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}