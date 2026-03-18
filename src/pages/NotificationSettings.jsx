import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Bell, Trash2, Pencil, Mail, MonitorSmartphone, ChevronDown, ChevronUp } from "lucide-react";
import { useRBAC } from "@/components/rbac/RBACContext";
import AccessDenied from "@/components/rbac/AccessDenied";
import NotificationRuleForm from "@/components/notifications/NotificationRuleForm";

const ENTITY_COLORS = {
  Ticket:       { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  Customer:     { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Invoice:      { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  FibreProject: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
};

const TYPE_CONFIG = {
  info:    { label: "Info",    className: "bg-blue-100 text-blue-700" },
  warning: { label: "Warning", className: "bg-amber-100 text-amber-700" },
  error:   { label: "Error",   className: "bg-red-100 text-red-700" },
  success: { label: "Success", className: "bg-emerald-100 text-emerald-700" },
};

const DEFAULT_RULES = [
  {
    name: "New Critical Ticket",
    entity_name: "Ticket",
    event_type: "create",
    field_name: "priority",
    field_value: "critical",
    send_in_app: true,
    send_email: false,
    notification_type: "error",
    category: "ticket",
    message_template: "New critical ticket raised: {name}",
    is_active: true,
    notify_emails: [],
  },
  {
    name: "Invoice Overdue",
    entity_name: "Invoice",
    event_type: "update",
    field_name: "status",
    field_value: "overdue",
    send_in_app: true,
    send_email: true,
    notification_type: "warning",
    category: "billing",
    message_template: "Invoice {name} is now overdue",
    is_active: true,
    notify_emails: [],
  },
  {
    name: "Customer Suspended",
    entity_name: "Customer",
    event_type: "update",
    field_name: "status",
    field_value: "suspended",
    send_in_app: true,
    send_email: false,
    notification_type: "warning",
    category: "customer",
    message_template: "Customer {name} has been suspended",
    is_active: true,
    notify_emails: [],
  },
  {
    name: "Project Gone Live",
    entity_name: "FibreProject",
    event_type: "update",
    field_name: "status",
    field_value: "live",
    send_in_app: true,
    send_email: true,
    notification_type: "success",
    category: "system",
    message_template: "Fibre project {name} is now live!",
    is_active: true,
    notify_emails: [],
  },
];

export default function NotificationSettings() {
  const { can, loading: rbacLoading } = useRBAC();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["notification_rules"],
    queryFn: () => base44.entities.NotificationRule.list("-created_date", 100),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.NotificationRule.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notification_rules"] }); setShowForm(false); setEditing(null); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NotificationRule.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notification_rules"] }); setShowForm(false); setEditing(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.NotificationRule.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification_rules"] }),
  });

  const toggleActive = (rule) => updateMut.mutate({ id: rule.id, data: { is_active: !rule.is_active } });

  const seedDefaults = async () => {
    for (const r of DEFAULT_RULES) await base44.entities.NotificationRule.create(r);
    qc.invalidateQueries({ queryKey: ["notification_rules"] });
  };

  if (rbacLoading) return null;
  if (!can("roles_management")) return <AccessDenied />;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notification Rules</h1>
          <p className="text-sm text-slate-500 mt-0.5">Automate in-app and email alerts based on entity changes</p>
        </div>
        <div className="flex gap-2">
          {rules.length === 0 && !isLoading && (
            <Button variant="outline" size="sm" onClick={seedDefaults}>
              Load Default Rules
            </Button>
          )}
          <Button size="sm" className="gap-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> Add Rule
          </Button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {["Ticket", "Customer", "Invoice", "FibreProject"].map(entity => {
          const count = rules.filter(r => r.entity_name === entity).length;
          const c = ENTITY_COLORS[entity];
          return (
            <div key={entity} className={`rounded-xl px-4 py-3 border ${c.bg} ${c.border}`}>
              <p className={`text-xs font-semibold ${c.text}`}>{entity}</p>
              <p className={`text-2xl font-bold ${c.text}`}>{count}</p>
              <p className="text-xs text-slate-400">rules</p>
            </div>
          );
        })}
      </div>

      {/* Rules list */}
      <div className="space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)
        ) : rules.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-dashed border-slate-200 text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-medium">No notification rules yet</p>
            <p className="text-sm">Click "Load Default Rules" to get started</p>
          </div>
        ) : (
          rules.map(rule => {
            const ec = ENTITY_COLORS[rule.entity_name] || {};
            const tc = TYPE_CONFIG[rule.notification_type] || TYPE_CONFIG.info;
            return (
              <div key={rule.id} className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-all ${!rule.is_active ? "opacity-50" : ""}`}
                style={{ borderColor: "rgba(99,102,241,0.1)" }}>
                <Switch checked={!!rule.is_active} onCheckedChange={() => toggleActive(rule)} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800 text-sm">{rule.name}</span>
                    <Badge className={`text-[10px] px-1.5 py-0 border ${ec.bg || "bg-slate-50"} ${ec.text || "text-slate-500"} ${ec.border || "border-slate-200"}`}>
                      {rule.entity_name}
                    </Badge>
                    <Badge className={`text-[10px] px-1.5 py-0 ${tc.className}`}>{tc.label}</Badge>
                    <span className="text-[11px] text-slate-400 font-mono">{rule.event_type}</span>
                    {rule.field_name && (
                      <span className="text-[11px] text-slate-400">
                        when <span className="font-semibold text-slate-600">{rule.field_name}</span>
                        {rule.field_value && <> = <span className="font-semibold text-slate-600">{rule.field_value}</span></>}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    {rule.send_in_app && <span className="flex items-center gap-1"><MonitorSmartphone className="w-3 h-3" /> In-App</span>}
                    {rule.send_email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> Email</span>}
                    {rule.notify_emails?.length > 0 && (
                      <span>→ {rule.notify_emails.slice(0, 2).join(", ")}{rule.notify_emails.length > 2 ? ` +${rule.notify_emails.length - 2}` : ""}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(rule); setShowForm(true); }}>
                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { if (confirm("Delete this rule?")) deleteMut.mutate(rule.id); }}>
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <NotificationRuleForm
          rule={editing}
          onSave={(data) => editing ? updateMut.mutate({ id: editing.id, data }) : createMut.mutate(data)}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}