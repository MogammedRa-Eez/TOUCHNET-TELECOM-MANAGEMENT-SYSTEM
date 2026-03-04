import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Wifi, Calendar, MapPin, Phone, Mail, Clock, Shield,
  FileText, AlertTriangle, CheckCircle, ArrowUpCircle, Lock, Save, Pencil
} from "lucide-react";
import { format } from "date-fns";

const SERVICE_PLAN_LABELS = {
  basic_10mbps: "Basic 10 Mbps",
  standard_50mbps: "Standard 50 Mbps",
  premium_100mbps: "Premium 100 Mbps",
  enterprise_500mbps: "Enterprise 500 Mbps",
  dedicated_1gbps: "Dedicated 1 Gbps",
};

const SERVICE_PLAN_SPEEDS = {
  basic_10mbps: 10,
  standard_50mbps: 50,
  premium_100mbps: 100,
  enterprise_500mbps: 500,
  dedicated_1gbps: 1000,
};

export default function CustomerProfileDetail({ customer, invoices, tickets, isAdmin }) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [adminNotes, setAdminNotes] = useState(customer.admin_notes || "");
  const queryClient = useQueryClient();

  const updateMut = useMutation({
    mutationFn: (data) => base44.entities.Customer.update(customer.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-customer"] });
      setEditingNotes(false);
    },
  });

  const resolvedTickets = tickets.filter(t => ["resolved", "closed"].includes(t.status));
  const criticalTickets = tickets.filter(t => t.priority === "critical");
  const avgResolutionRate = tickets.length > 0 ? Math.round((resolvedTickets.length / tickets.length) * 100) : 0;
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.total || i.amount || 0), 0);
  const contractDaysLeft = customer.contract_end_date
    ? Math.ceil((new Date(customer.contract_end_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-5">
      {/* Contact & Account Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" /> Account Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow icon={<Mail className="w-4 h-4 text-blue-400" />} label="Email" value={customer.email} />
          <DetailRow icon={<Phone className="w-4 h-4 text-emerald-400" />} label="Phone" value={customer.phone} />
          <DetailRow icon={<MapPin className="w-4 h-4 text-red-400" />} label="Address" value={customer.address} />
          <DetailRow icon={<Shield className="w-4 h-4 text-purple-400" />} label="Account #" value={customer.account_number} mono />
          <DetailRow
            icon={<Calendar className="w-4 h-4 text-blue-400" />}
            label="Member Since"
            value={customer.installation_date ? format(new Date(customer.installation_date), "dd MMM yyyy") : null}
          />
          <DetailRow
            icon={<Calendar className="w-4 h-4 text-orange-400" />}
            label="Contract Ends"
            value={customer.contract_end_date ? format(new Date(customer.contract_end_date), "dd MMM yyyy") : null}
            extra={contractDaysLeft !== null && (
              <span className={`text-[10px] ml-2 px-2 py-0.5 rounded-full font-semibold ${contractDaysLeft < 30 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                {contractDaysLeft > 0 ? `${contractDaysLeft}d left` : "Expired"}
              </span>
            )}
          />
          <DetailRow icon={<Wifi className="w-4 h-4 text-cyan-400" />} label="Assigned Node" value={customer.assigned_node} />
          <DetailRow icon={<Wifi className="w-4 h-4 text-indigo-400" />} label="Connection Type" value={customer.connection_type} capitalize />
        </div>
      </div>

      {/* Service Plan Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-blue-400" /> Service Plan
        </h3>
        <div className="flex items-center gap-4 mb-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Wifi className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-800">{SERVICE_PLAN_LABELS[customer.service_plan] || customer.service_plan?.replace(/_/g, " ")}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {SERVICE_PLAN_SPEEDS[customer.service_plan] ? `Up to ${SERVICE_PLAN_SPEEDS[customer.service_plan]} Mbps` : ""}
              {" · "}{customer.connection_type || "—"} connection
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-bold text-blue-700">R{customer.monthly_rate?.toFixed(2) || "0.00"}</p>
            <p className="text-[10px] text-slate-400">per month</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="Total Paid" value={`R${totalPaid.toFixed(2)}`} color="text-emerald-600" />
          <StatBox label="Current Balance" value={`R${(customer.balance || 0).toFixed(2)}`} color={(customer.balance || 0) < 0 ? "text-red-600" : "text-emerald-600"} />
          <StatBox label="Invoices" value={invoices.length} color="text-blue-600" />
        </div>
      </div>

      {/* Interaction History Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" /> Support History
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <StatBox label="Total Tickets" value={tickets.length} color="text-blue-600" />
          <StatBox label="Resolved" value={resolvedTickets.length} color="text-emerald-600" />
          <StatBox label="Critical Issues" value={criticalTickets.length} color={criticalTickets.length > 0 ? "text-red-600" : "text-slate-400"} />
          <StatBox label="Resolution Rate" value={`${avgResolutionRate}%`} color={avgResolutionRate > 75 ? "text-emerald-600" : "text-orange-500"} />
        </div>
        {/* Past issues timeline */}
        {tickets.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Recent Issues</p>
            {tickets.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  t.status === "resolved" || t.status === "closed" ? "bg-emerald-400" :
                  t.priority === "critical" ? "bg-red-500" :
                  t.priority === "high" ? "bg-orange-400" : "bg-blue-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{t.subject}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{t.category?.replace(/_/g, " ")} · {t.status?.replace(/_/g, " ")}</p>
                </div>
                <span className="text-[10px] text-slate-300 flex-shrink-0">
                  {t.created_date ? format(new Date(t.created_date), "dd MMM yy") : ""}
                </span>
              </div>
            ))}
          </div>
        )}
        {tickets.length === 0 && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <p className="text-xs text-emerald-700">No support issues on record.</p>
          </div>
        )}
      </div>

      {/* Admin-only Notes */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-amber-700 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Admin Notes
              <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-semibold ml-1">Admin Only</span>
            </h3>
            {!editingNotes && (
              <button
                onClick={() => setEditingNotes(true)}
                className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium">
                <Pencil className="w-3 h-3" /> Edit
              </button>
            )}
          </div>
          {editingNotes ? (
            <div className="space-y-2">
              <textarea
                className="w-full rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
                rows={4}
                placeholder="Add internal remarks about this customer..."
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setAdminNotes(customer.admin_notes || ""); setEditingNotes(false); }}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  onClick={() => updateMut.mutate({ admin_notes: adminNotes })}
                  disabled={updateMut.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60">
                  <Save className="w-3 h-3" />
                  {updateMut.isPending ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 rounded-lg p-3 min-h-[60px] border border-amber-100">
              {adminNotes ? (
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{adminNotes}</p>
              ) : (
                <p className="text-sm text-amber-400 italic">No admin notes yet. Click Edit to add remarks.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value, mono, capitalize, extra }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
        <div className="flex items-center">
          <p className={`text-sm text-slate-700 font-medium ${mono ? "font-mono" : ""} ${capitalize ? "capitalize" : ""}`}>
            {value || "—"}
          </p>
          {extra}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-center">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}