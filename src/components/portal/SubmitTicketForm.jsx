import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SubmitTicketForm({ customer, onClose }) {
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    description: "",
    category: "general",
    priority: "medium",
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Ticket.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-tickets", customer.id] });
      setSubmitted(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMut.mutate({
      ...form,
      customer_id: customer.id,
      customer_name: customer.full_name,
      status: "open",
      ticket_number: `TKT-${Date.now().toString().slice(-6)}`,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Submit a Support Ticket</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-10 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">Ticket Submitted!</h3>
            <p className="text-sm text-slate-500 mb-6">Our team will get back to you shortly.</p>
            <Button onClick={onClose} className="bg-slate-800 text-white hover:bg-slate-700">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 text-sm text-slate-600">
              Submitting as <strong>{customer.full_name}</strong> · Acct# {customer.account_number || customer.id.slice(0,8)}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject *</Label>
              <Input
                required
                placeholder="Brief description of the issue"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Details *</Label>
              <textarea
                required
                rows={4}
                placeholder="Please describe your issue in detail..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger className="border-slate-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="connectivity">Connectivity</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="speed_issue">Speed Issue</SelectItem>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                  <SelectTrigger className="border-slate-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="border-slate-200">Cancel</Button>
              <Button
                type="submit"
                disabled={createMut.isPending}
                className="bg-slate-800 text-white hover:bg-slate-700 gap-2"
              >
                {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Ticket
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}