import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wifi, Receipt, TicketCheck, LogOut, AlertCircle, Loader2, FolderOpen } from "lucide-react";
import PortalProjectsTab from "@/components/portal/PortalProjectsTab";
import PortalInvoicesTab from "@/components/portal/PortalInvoicesTab";
import PortalTicketsTab from "@/components/portal/PortalTicketsTab";
import PortalDocumentsTab from "@/components/portal/PortalDocumentsTab";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

export default function CustomerPortalMain() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => base44.auth.redirectToLogin(window.location.pathname))
      .finally(() => setAuthLoading(false));
  }, []);

  const { data: customers = [], isLoading: customerLoading } = useQuery({
    queryKey: ["portal-customer-main", user?.email],
    queryFn: () => base44.entities.Customer.filter({ email: user.email }),
    enabled: !!user?.email,
  });

  const customer = customers[0] || null;

  if (authLoading || customerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f0f4ff" }}>
        <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6" style={{ background: "linear-gradient(160deg,#f0f2fc,#faf4ff)" }}>
        <img src={LOGO_URL} alt="Logo" className="h-12 object-contain mb-2" />
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl border border-slate-200">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-1">Account Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">
            No customer account is linked to <strong>{user?.email}</strong>. Please contact support.
          </p>
          <button
            onClick={() => base44.auth.logout("/")}
            className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#f0f2fc 0%,#f4f6ff 50%,#faf4ff 100%)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-20 px-5 py-3 flex items-center justify-between"
        style={{ background: "rgba(255,255,255,0.92)", borderBottom: "1px solid rgba(99,102,241,0.1)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="Logo" className="h-8 object-contain" />
          <div className="hidden sm:block h-5 w-px bg-slate-200" />
          <div className="hidden sm:block">
            <p className="text-[13px] font-bold text-slate-800 leading-tight">{customer.full_name}</p>
            <p className="text-[10px] text-slate-400 font-mono">
              {customer.account_number ? `#${customer.account_number}` : customer.email}
            </p>
          </div>
        </div>
        <button
          onClick={() => base44.auth.logout("/")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors border border-slate-200"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-5 space-y-5">
        {/* Welcome hero */}
        <div
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#312e81,#4c1d95,#1e1b4b)", boxShadow: "0 8px 40px rgba(99,102,241,0.25)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize: "32px 32px" }}
          />
          <div className="relative flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              {customer.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Welcome back, {customer.full_name.split(" ")[0]}!</h1>
              <p className="text-sm text-white/50 mt-0.5">
                {customer.service_plan?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "Customer"} ·{" "}
                <span className="capitalize">{customer.status}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="projects">
          <TabsList
            className="rounded-2xl p-1 gap-1 w-full sm:w-auto"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(99,102,241,0.12)" }}
          >
            <TabsTrigger value="projects" className="gap-1.5 rounded-xl data-[state=active]:text-white text-[12px] font-semibold">
              <Wifi className="w-3.5 h-3.5" /> Fibre Projects
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-1.5 rounded-xl data-[state=active]:text-white text-[12px] font-semibold">
              <Receipt className="w-3.5 h-3.5" /> Invoices
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-1.5 rounded-xl data-[state=active]:text-white text-[12px] font-semibold">
              <TicketCheck className="w-3.5 h-3.5" /> Support
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-1.5 rounded-xl data-[state=active]:text-white text-[12px] font-semibold">
              <FolderOpen className="w-3.5 h-3.5" /> Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-4">
            <PortalProjectsTab customer={customer} />
          </TabsContent>

          <TabsContent value="invoices" className="mt-4">
            <PortalInvoicesTab customer={customer} />
          </TabsContent>

          <TabsContent value="tickets" className="mt-4">
            <PortalTicketsTab customer={customer} user={user} />
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <PortalDocumentsTab customer={customer} user={user} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}