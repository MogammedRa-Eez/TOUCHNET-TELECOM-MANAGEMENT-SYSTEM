import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Zap, UserCheck } from "lucide-react";

// Region keyword → assigned engineer
const REGION_ASSIGNMENTS = {
  "johannesburg": "Sipho Dlamini",
  "joburg": "Sipho Dlamini",
  "jhb": "Sipho Dlamini",
  "pretoria": "Sipho Dlamini",
  "gauteng": "Sipho Dlamini",
  "cape town": "Anri van der Berg",
  "cpt": "Anri van der Berg",
  "western cape": "Anri van der Berg",
  "durban": "Thabo Nkosi",
  "kwazulu": "Thabo Nkosi",
  "kzn": "Thabo Nkosi",
  "polokwane": "Lerato Mokoena",
  "limpopo": "Lerato Mokoena",
  "bloemfontein": "Lerato Mokoena",
  "free state": "Lerato Mokoena",
  "ermelo": "Thabo Nkosi",
  "gaborone": "Sipho Dlamini",
  "west rand": "Sipho Dlamini",
};

const QUICK_TEMPLATES = [
  { label: "No Connectivity", text: "Customer is experiencing a complete loss of internet connectivity. All lights on the CPE device are normal. Remote ping to the device is failing. Please investigate the upstream link and check for any port errors on the OLT." },
  { label: "Slow Speed", text: "Customer is reporting speeds significantly below their subscribed plan. Speed tests show degraded throughput. Please check bandwidth utilisation on the assigned node, verify QoS profiles, and inspect for any traffic shaping issues." },
  { label: "Intermittent Drops", text: "Customer is reporting intermittent connection drops throughout the day. The connection restores itself after a few minutes. Please review interface error counters on the access switch and check for any physical layer issues on the fibre run." },
  { label: "Hardware Fault", text: "Customer's CPE device appears to be faulty. LEDs indicate an error state and the device is not registering on the OLT. A replacement unit needs to be dispatched and an onsite technician visit scheduled." },
  { label: "DNS Issues", text: "Customer can ping IP addresses but is unable to resolve domain names. DNS resolution appears to be failing. Please verify DNS server configuration on the customer's profile and check upstream DNS availability." },
  { label: "After-Hours Outage", text: "Customer has reported a complete outage outside of business hours. This has been logged as a critical ticket. The on-call engineer has been notified and will investigate immediately." },
];

function detectRegionAssignment(text) {
  const lower = (text || "").toLowerCase();
  for (const [keyword, assignee] of Object.entries(REGION_ASSIGNMENTS)) {
    if (lower.includes(keyword)) return assignee;
  }
  return null;
}

export default function TicketForm({ ticket, customers, onSubmit, onCancel }) {
  const [form, setForm] = useState(ticket || {
    subject: "", description: "", customer_id: "", customer_name: "",
    status: "open", priority: "medium", category: "general",
    department: "technical", assigned_to: "", resolution_notes: "",
  });

  const handleCustomerChange = (id) => {
    const cust = customers.find(c => c.id === id);
    setForm({ ...form, customer_id: id, customer_name: cust?.full_name || "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const ticketNum = form.ticket_number || `TKT-${Date.now().toString(36).toUpperCase()}`;
    onSubmit({ ...form, ticket_number: ticketNum });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{ticket ? "Edit Ticket" : "New Support Ticket"}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Subject *</Label>
            <Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Description *</Label>
            <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Customer</Label>
              <Select value={form.customer_id} onValueChange={handleCustomerChange}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Category</Label>
              <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="connectivity">Connectivity</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                  <SelectItem value="speed_issue">Speed Issue</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Department</Label>
              <Select value={form.department} onValueChange={v => setForm({...form, department: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="cyber_security">Cyber Security</SelectItem>
                  <SelectItem value="projects">Projects</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Assigned To</Label>
              <Input value={form.assigned_to} onChange={e => setForm({...form, assigned_to: e.target.value})} placeholder="Employee name" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="waiting_customer">Waiting Customer</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {(form.status === "resolved" || form.status === "closed") && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Resolution Notes</Label>
              <Textarea value={form.resolution_notes} onChange={e => setForm({...form, resolution_notes: e.target.value})} rows={2} />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{ticket ? "Update" : "Create Ticket"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}