import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// SLA hours per priority
const SLA_HOURS = { critical: 2, high: 8, medium: 24, low: 72 };

// Senior technician escalation contacts per department
const ESCALATION_CONTACTS = {
  technical:      { name: "Senior Technical Lead", email: "tech-lead@touchnet.co.za" },
  cyber_security: { name: "Security Operations Lead", email: "soc-lead@touchnet.co.za" },
  sales:          { name: "Sales Manager", email: "sales-manager@touchnet.co.za" },
  finance:        { name: "Finance Manager", email: "finance@touchnet.co.za" },
  projects:       { name: "Projects Lead", email: "projects@touchnet.co.za" },
  hr:             { name: "HR Manager", email: "hr@touchnet.co.za" },
};

function getSLADeadline(ticket) {
  if (ticket.sla_deadline) return new Date(ticket.sla_deadline);
  const hours = SLA_HOURS[ticket.priority] || 24;
  const created = new Date(ticket.created_date);
  return new Date(created.getTime() + hours * 60 * 60 * 1000);
}

function isBreached(ticket) {
  if (["resolved", "closed", "escalated"].includes(ticket.status)) return false;
  return new Date() > getSLADeadline(ticket);
}

function hoursOverdue(ticket) {
  const deadline = getSLADeadline(ticket);
  const diff = (new Date() - deadline) / (1000 * 60 * 60);
  return Math.round(diff * 10) / 10;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Support both scheduled (no auth) and manual (admin only) invocations
  const body = await req.json().catch(() => ({}));
  const { action = "run", manual = false } = body;

  if (manual) {
    const user = await base44.auth.me().catch(() => null);
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }
  }

  if (action === "status") {
    // Return current SLA config and breach overview
    const tickets = await base44.asServiceRole.entities.Ticket.list();
    const active = tickets.filter(t => !["resolved", "closed"].includes(t.status));
    const breached = active.filter(isBreached);
    const nearBreaching = active.filter(t => {
      if (isBreached(t)) return false;
      const deadline = getSLADeadline(t);
      const minutesLeft = (deadline - new Date()) / 60000;
      return minutesLeft < 60; // within 1 hour
    });
    return Response.json({
      sla_config: SLA_HOURS,
      total_active: active.length,
      breached: breached.length,
      near_breach: nearBreaching.length,
      breached_tickets: breached.map(t => ({
        id: t.id,
        ticket_number: t.ticket_number,
        subject: t.subject,
        priority: t.priority,
        status: t.status,
        hours_overdue: hoursOverdue(t),
        customer_name: t.customer_name,
        assigned_to: t.assigned_to,
      }))
    });
  }

  // Main escalation run
  const tickets = await base44.asServiceRole.entities.Ticket.list();
  const toEscalate = tickets.filter(t =>
    !["resolved", "closed", "escalated"].includes(t.status) && isBreached(t)
  );

  const results = { escalated: 0, emails_sent: 0, notifications_created: 0, errors: [], escalated_tickets: [] };

  for (const ticket of toEscalate) {
    const escalationContact = ESCALATION_CONTACTS[ticket.department] || ESCALATION_CONTACTS.technical;
    const overdueHrs = hoursOverdue(ticket);
    const slaHours = SLA_HOURS[ticket.priority] || 24;

    // 1. Update ticket status to escalated
    await base44.asServiceRole.entities.Ticket.update(ticket.id, {
      status: "escalated",
      assigned_to: escalationContact.name,
      resolution_notes: `AUTO-ESCALATED: SLA breach — ${overdueHrs}h overdue (${slaHours}h SLA for ${ticket.priority} priority). Escalated to ${escalationContact.name}.`,
    }).catch(e => results.errors.push(`Update ${ticket.ticket_number}: ${e.message}`));

    // 2. Email the escalation contact
    const emailBody = `
URGENT: SLA BREACH — TICKET ESCALATED

Ticket: ${ticket.ticket_number || ticket.id}
Subject: ${ticket.subject}
Customer: ${ticket.customer_name || "—"}
Priority: ${ticket.priority?.toUpperCase()}
Department: ${ticket.department}
Overdue by: ${overdueHrs} hours (SLA: ${slaHours}h)
Previous Assignee: ${ticket.assigned_to || "Unassigned"}

This ticket has been automatically escalated to you as it has breached the ${ticket.priority} priority SLA of ${slaHours} hours.

Please take immediate action.

— TouchNet Workflow Engine
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: escalationContact.email,
      subject: `[ESCALATED] ${ticket.ticket_number} — SLA Breach (${ticket.priority?.toUpperCase()})`,
      body: emailBody,
    }).catch(e => results.errors.push(`Email ${ticket.ticket_number}: ${e.message}`));
    results.emails_sent++;

    // 3. In-app notification to all admins (broadcast via user_email "admin")
    await base44.asServiceRole.entities.Notification.create({
      user_email: escalationContact.email,
      title: `SLA Breach: ${ticket.ticket_number}`,
      message: `${ticket.priority?.toUpperCase()} ticket "${ticket.subject}" is ${overdueHrs}h overdue. Escalated to ${escalationContact.name}.`,
      type: "error",
      category: "ticket",
      link_page: "Tickets",
      is_read: false,
    }).catch(e => results.errors.push(`Notification ${ticket.ticket_number}: ${e.message}`));
    results.notifications_created++;

    results.escalated++;
    results.escalated_tickets.push({
      ticket_number: ticket.ticket_number,
      subject: ticket.subject,
      priority: ticket.priority,
      hours_overdue: overdueHrs,
      escalated_to: escalationContact.name,
    });
  }

  return Response.json({ success: true, run_at: new Date().toISOString(), ...results });
});