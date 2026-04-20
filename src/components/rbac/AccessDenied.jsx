import { ShieldOff } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="text-center">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(224,35,71,0.1)", border: "1px solid rgba(224,35,71,0.25)" }}>
          <ShieldOff className="w-7 h-7" style={{ color: "#e02347" }} />
        </div>
        <h2 className="text-[15px] font-bold mb-1" style={{ color: "#f0f0f0" }}>Access Denied</h2>
        <p className="text-[12px] mono" style={{ color: "rgba(255,255,255,0.35)" }}>
          You don't have permission to view this page.
        </p>
      </div>
    </div>
  );
}