import { ShieldOff } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="text-center">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <ShieldOff className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-[15px] font-bold text-white mb-1">Access Denied</h2>
        <p className="text-[12px] text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          You don't have permission to view this page.
        </p>
      </div>
    </div>
  );
}