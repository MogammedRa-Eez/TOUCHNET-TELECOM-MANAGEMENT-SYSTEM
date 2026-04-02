import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data, old_data } = body;

    if (!event || !data) return Response.json({ skipped: true, reason: "no event/data" });

    const entityName = event.entity_name;
    const eventType  = event.type; // create | update | delete

    // ── 1. Smart auto-notifications (built-in logic per entity) ───────────────
    await handleSmartNotifications(base44, entityName, eventType, data, old_data);

    // ── 2. Admin-configured rule-based notifications ──────────────────────────
    const rules = await base44.asServiceRole.entities.NotificationRule.filter({
      entity_name: entityName,
      is_active: true,
    });

    let processed = 0;
    for (const rule of (rules || [])) {
      if (rule.event_type !== "any" && rule.event_type !== eventType) continue;

      if (rule.field_name) {
        const newVal = data[rule.field_name];
        const oldVal = old_data ? old_data[rule.field_name] : undefined;
        if (rule.field_value && newVal !== rule.field_value) continue;
        if (eventType === "update" && oldVal === newVal) continue;
      }

      const recordName = data.full_name || data.customer_name || data.subject ||
        data.invoice_number || data.project_name || data.title || data.id || "Record";

      let message = rule.message_template || "";
      if (!message) {
        if (eventType === "create") message = `New ${entityName} created: ${recordName}`;
        else if (rule.field_name && rule.field_value) message = `${entityName} "${recordName}" — ${rule.field_name} changed to ${rule.field_value}`;
        else message = `${entityName} "${recordName}" was updated`;
      } else {
        message = message.replace("{name}", recordName).replace("{status}", data.status || "").replace("{entity}", entityName);
      }

      if (rule.send_in_app && rule.notify_emails?.length > 0) {
        for (const email of rule.notify_emails) {
          if (!email) continue;
          await base44.asServiceRole.entities.Notification.create({
            user_email: email, title: rule.name, message,
            type: rule.notification_type || "info",
            category: rule.category || "system",
            is_read: false,
          });
        }
      }

      if (rule.send_email && rule.notify_emails?.length > 0) {
        for (const email of rule.notify_emails) {
          if (!email) continue;
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            subject: `TouchNet Alert: ${rule.name}`,
            body: buildEmailBody(rule.name, message),
          });
        }
      }

      processed++;
    }

    return Response.json({ processed });
  } catch (error) {
    console.error("notificationRuleEngine error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SMART NOTIFICATIONS — entity-specific logic
// ─────────────────────────────────────────────────────────────────────────────
async function handleSmartNotifications(base44, entityName, eventType, data, old_data) {
  try {
    switch (entityName) {
      case "Invoice":      await handleInvoice(base44, eventType, data, old_data);     break;
      case "Ticket":       await handleTicket(base44, eventType, data, old_data);      break;
      case "Customer":     await handleCustomer(base44, eventType, data, old_data);    break;
      case "FibreProject": await handleProject(base44, eventType, data, old_data);     break;
      case "Booking":      await handleBooking(base44, eventType, data, old_data);     break;
      case "Quote":        await handleQuote(base44, eventType, data, old_data);       break;
      case "QuoteNote":    await handleQuoteNote(base44, eventType, data, old_data);   break;
      case "Task":         await handleTask(base44, eventType, data, old_data);        break;
      case "ProjectTask":  await handleProjectTask(base44, eventType, data, old_data); break;
    }
  } catch (err) {
    console.error(`Smart notification error [${entityName}]:`, err.message);
  }
}

// ── INVOICE ──────────────────────────────────────────────────────────────────
async function handleInvoice(base44, eventType, data, old_data) {
  const customerEmail = data.customer_email || await getCustomerEmail(base44, data.customer_id);
  const invoiceNum = data.invoice_number || data.id;
  const amount = data.total ? `R${Number(data.total).toFixed(2)}` : (data.amount ? `R${Number(data.amount).toFixed(2)}` : "");
  const statusChanged = old_data && old_data.status !== data.status;

  if (eventType === "create" && customerEmail) {
    await notifyUser(base44, customerEmail, {
      title: "New Invoice Issued",
      message: `Invoice ${invoiceNum} for ${amount} has been issued. Due: ${data.due_date || "N/A"}.`,
      type: "info", category: "billing",
    });
    await sendEmail(base44, customerEmail, `New Invoice ${invoiceNum} — TouchNet`,
      buildCustomerEmailBody("New Invoice Issued",
        `Your invoice <strong>${invoiceNum}</strong> for <strong>${amount}</strong> has been issued.<br>Due: <strong>${data.due_date || "N/A"}</strong>`,
        "#06b6d4"));

  } else if (eventType === "update" && statusChanged && customerEmail) {
    const cfgs = {
      paid:      { title: "Payment Confirmed ✓",          type: "success", msg: `Invoice ${invoiceNum} for ${amount} has been marked as paid. Thank you!`, color: "#10b981" },
      overdue:   { title: "Invoice Overdue — Action Required", type: "error", msg: `Invoice ${invoiceNum} for ${amount} is overdue. Please pay to avoid service interruption.`, color: "#ef4444" },
      cancelled: { title: "Invoice Cancelled",             type: "warning", msg: `Invoice ${invoiceNum} has been cancelled.`, color: "#f59e0b" },
    };
    const cfg = cfgs[data.status];
    if (cfg) {
      await notifyUser(base44, customerEmail, { title: cfg.title, message: cfg.msg, type: cfg.type, category: "billing" });
      if (["paid","overdue"].includes(data.status)) {
        await sendEmail(base44, customerEmail, `${cfg.title} — Invoice ${invoiceNum}`, buildCustomerEmailBody(cfg.title, cfg.msg, cfg.color));
      }
    }
  }

  // Also notify finance employees on new invoice creation
  if (eventType === "create") {
    await notifyDepartment(base44, "finance", {
      title: `New invoice: ${invoiceNum}`,
      message: `Invoice ${invoiceNum} for ${data.customer_name || "a client"} (${amount}) has been created.`,
      type: "info", category: "billing",
    });
  }
}

// ── TICKET ───────────────────────────────────────────────────────────────────
async function handleTicket(base44, eventType, data, old_data) {
  const customerEmail = data.customer_email || await getCustomerEmail(base44, data.customer_id);
  const ticketNum = data.ticket_number || data.id;
  const statusChanged = old_data && old_data.status !== data.status;
  const assigneeChanged = old_data && old_data.assigned_to !== data.assigned_to;

  // Customer: new ticket confirmation
  if (eventType === "create" && customerEmail) {
    await notifyUser(base44, customerEmail, {
      title: "Support Ticket Created",
      message: `Ticket #${ticketNum} has been created: "${data.subject}". We'll respond shortly.`,
      type: "info", category: "ticket",
    });
    await sendEmail(base44, customerEmail, `Support Ticket #${ticketNum} Received`,
      buildCustomerEmailBody("Support Ticket Received",
        `We've received your request.<br><br><strong>Ticket #${ticketNum}:</strong> ${data.subject}<br><br>Our team will get back to you shortly.`,
        "#6366f1"));
  }

  // Customer: status changes
  if (eventType === "update" && statusChanged && customerEmail) {
    const cfgs = {
      in_progress:      { title: "Ticket In Progress",      type: "info",    msg: `Ticket #${ticketNum} is now being worked on.` },
      waiting_customer: { title: "Your Response Needed",    type: "warning", msg: `Our team responded to ticket #${ticketNum} and needs your input.` },
      resolved:         { title: "Ticket Resolved ✓",       type: "success", msg: `Ticket #${ticketNum} resolved. ${data.resolution_notes ? "Note: " + data.resolution_notes : ""}` },
      closed:           { title: "Ticket Closed",           type: "success", msg: `Ticket #${ticketNum} has been closed.` },
      escalated:        { title: "Ticket Escalated",        type: "warning", msg: `Ticket #${ticketNum} was escalated for urgent attention.` },
    };
    const cfg = cfgs[data.status];
    if (cfg) {
      await notifyUser(base44, customerEmail, { title: cfg.title, message: cfg.msg, type: cfg.type, category: "ticket" });
      if (["resolved","waiting_customer","escalated"].includes(data.status)) {
        await sendEmail(base44, customerEmail, `${cfg.title} — Ticket #${ticketNum}`,
          buildCustomerEmailBody(cfg.title, cfg.msg, cfg.type === "success" ? "#10b981" : "#f59e0b"));
      }
    }
  }

  // Assigned employee: ticket assigned or reassigned
  if (data.assigned_to && (eventType === "create" || (eventType === "update" && assigneeChanged))) {
    const empEmail = await getEmployeeEmail(base44, data.assigned_to);
    if (empEmail) {
      await notifyUser(base44, empEmail, {
        title: `Ticket assigned to you: #${ticketNum}`,
        message: `"${data.subject}" (${data.priority} priority, ${data.category}) has been assigned to you.`,
        type: "warning", category: "ticket",
      });
    }
  }

  // Notify technical/support department on new high/critical tickets
  if (eventType === "create" && ["high","critical"].includes(data.priority)) {
    await notifyDepartment(base44, data.department || "technical", {
      title: `${data.priority?.toUpperCase()} priority ticket: #${ticketNum}`,
      message: `"${data.subject}" — ${data.category} | Customer: ${data.customer_name || "Unknown"}`,
      type: data.priority === "critical" ? "error" : "warning",
      category: "ticket",
    });
  }
}

// ── CUSTOMER ──────────────────────────────────────────────────────────────────
async function handleCustomer(base44, eventType, data, old_data) {
  const customerEmail = data.email;
  if (!customerEmail) return;
  const statusChanged = old_data && old_data.status !== data.status;

  if (eventType === "update" && statusChanged) {
    const cfgs = {
      active:     { title: "Account Activated ✓",  msg: "Your TouchNet account is now active. Welcome!", type: "success", color: "#10b981" },
      suspended:  { title: "Account Suspended",    msg: "Your account has been suspended. Contact support.", type: "error",   color: "#ef4444" },
      terminated: { title: "Account Terminated",   msg: "Your account has been terminated.", type: "error",   color: "#ef4444" },
      pending:    { title: "Account Under Review", msg: "Your account is under review. We'll notify you when it's ready.", type: "warning", color: "#f59e0b" },
    };
    const cfg = cfgs[data.status];
    if (cfg) {
      await notifyUser(base44, customerEmail, { title: cfg.title, message: cfg.msg, type: cfg.type, category: "customer" });
      await sendEmail(base44, customerEmail, `Account Update — ${cfg.title}`, buildCustomerEmailBody(cfg.title, cfg.msg, cfg.color));
    }
  }
}

// ── FIBRE PROJECT ─────────────────────────────────────────────────────────────
async function handleProject(base44, eventType, data, old_data) {
  const customerEmail = data.customer_email;
  const statusChanged = old_data && old_data.status !== data.status;
  const projectName = data.project_name || data.quote_number;

  if (customerEmail) {
    if (eventType === "create") {
      await notifyUser(base44, customerEmail, {
        title: "Project Created",
        message: `Your fibre project "${projectName}" has been created and is being set up.`,
        type: "info", category: "network",
      });
    } else if (eventType === "update" && statusChanged) {
      const cfgs = {
        approved:    { title: "Project Approved ✓",         type: "success", msg: `Great news! Your project "${projectName}" has been approved and will begin shortly.` },
        in_progress: { title: "Installation In Progress",   type: "info",    msg: `Installation for "${projectName}" is now in progress.` },
        testing:     { title: "Service Testing Started",    type: "info",    msg: `Your connection for "${projectName}" is being tested.` },
        live:        { title: "🎉 Service Is Live!",        type: "success", msg: `Your fibre service for "${projectName}" is now live! Welcome to TouchNet.` },
        billed:      { title: "Billing Commenced",          type: "info",    msg: `Billing has commenced for "${projectName}". Check your invoices.` },
        cancelled:   { title: "Project Cancelled",          type: "warning", msg: `Project "${projectName}" has been cancelled. Please contact us for details.` },
      };
      const cfg = cfgs[data.status];
      if (cfg) {
        await notifyUser(base44, customerEmail, { title: cfg.title, message: cfg.msg, type: cfg.type, category: "network" });
        if (["live","approved","cancelled"].includes(data.status)) {
          await sendEmail(base44, customerEmail, `${cfg.title} — ${projectName}`,
            buildCustomerEmailBody(cfg.title, cfg.msg, cfg.type === "success" ? "#10b981" : "#f59e0b"));
        }
      }
    }
  }

  // Notify assigned engineer
  if (data.assigned_engineer && eventType === "update") {
    const engEmail = await getEmployeeEmail(base44, data.assigned_engineer);
    const assigneeChanged = old_data && old_data.assigned_engineer !== data.assigned_engineer;
    if (engEmail && assigneeChanged) {
      await notifyUser(base44, engEmail, {
        title: `Project assigned to you: ${projectName}`,
        message: `You have been assigned as engineer for "${projectName}" (${data.customer_name}).`,
        type: "info", category: "network",
      });
    }
  }

  // Notify projects department on new project
  if (eventType === "create") {
    await notifyDepartment(base44, "projects", {
      title: `New project: ${projectName}`,
      message: `New fibre project for ${data.customer_name} has been created.`,
      type: "info", category: "network",
    });
  }
}

// ── BOOKING ───────────────────────────────────────────────────────────────────
async function handleBooking(base44, eventType, data, old_data) {
  const customerEmail = data.customer_email;
  const statusChanged = old_data && old_data.status !== data.status;

  if (customerEmail) {
    if (eventType === "create") {
      await notifyUser(base44, customerEmail, {
        title: "Booking Request Received",
        message: `Your ${data.visit_type} booking request for ${data.preferred_date} has been received. We'll confirm shortly.`,
        type: "info", category: "system",
      });
    } else if (eventType === "update" && statusChanged) {
      const cfgs = {
        confirmed:    { title: "Visit Confirmed ✓", msg: `Your ${data.visit_type} visit has been confirmed for ${data.confirmed_date || data.preferred_date}${data.confirmed_time ? " at " + data.confirmed_time : ""}. Engineer: ${data.assigned_engineer || "TBA"}.`, type: "success" },
        rescheduled:  { title: "Visit Rescheduled",  msg: `Your visit has been rescheduled to ${data.confirmed_date || "a new date"}. We'll follow up with details.`, type: "warning" },
        completed:    { title: "Visit Completed ✓",  msg: `Your ${data.visit_type} visit has been completed. Thank you!`, type: "success" },
        cancelled:    { title: "Visit Cancelled",    msg: `Your ${data.visit_type} booking has been cancelled. Contact us to rebook.`, type: "warning" },
      };
      const cfg = cfgs[data.status];
      if (cfg) {
        await notifyUser(base44, customerEmail, { title: cfg.title, message: cfg.msg, type: cfg.type, category: "system" });
        if (["confirmed","rescheduled"].includes(data.status)) {
          await sendEmail(base44, customerEmail, `${cfg.title} — ${data.visit_type} Visit`,
            buildCustomerEmailBody(cfg.title, cfg.msg, cfg.type === "success" ? "#10b981" : "#f59e0b"));
        }
      }
    }
  }

  // Notify projects dept on new booking
  if (eventType === "create") {
    await notifyDepartment(base44, "projects", {
      title: `New booking request: ${data.customer_name}`,
      message: `${data.customer_name} requested a ${data.visit_type} visit on ${data.preferred_date}.`,
      type: "info", category: "system",
    });
  }
}

// ── QUOTE ─────────────────────────────────────────────────────────────────────
async function handleQuote(base44, eventType, data, old_data) {
  const statusChanged = old_data && old_data.status !== data.status;

  // Notify sales dept on new quote
  if (eventType === "create") {
    await notifyDepartment(base44, "sales", {
      title: `New quote: ${data.title}`,
      message: `Quote ${data.quote_number} for ${data.customer_name} has been created by ${data.salesperson_name || "a team member"}.`,
      type: "info", category: "customer",
    });
  }

  // Customer-facing: quote sent / accepted / declined
  if (eventType === "update" && statusChanged && data.customer_email) {
    const cfgs = {
      sent:     { title: "You Have a New Quote",    msg: `${data.salesperson_name || "Our team"} has sent you a proposal: "${data.title}". Log in to your portal to review it.`, type: "info",    send: true },
      accepted: { title: "Quote Accepted ✓",        msg: `Quote "${data.title}" has been accepted. Our team will contact you to begin the process.`, type: "success", send: false },
      declined: { title: "Quote Declined",          msg: `Quote "${data.title}" has been declined. Please contact us if you'd like to discuss alternatives.`, type: "warning", send: false },
    };
    const cfg = cfgs[data.status];
    if (cfg) {
      await notifyUser(base44, data.customer_email, { title: cfg.title, message: cfg.msg, type: cfg.type, category: "customer" });
      if (cfg.send) {
        await sendEmail(base44, data.customer_email, `${cfg.title} — TouchNet`,
          buildCustomerEmailBody(cfg.title, cfg.msg + `<br><br>Quote valid until: <strong>${data.valid_until || "N/A"}</strong>`, "#6366f1"));
      }
    }

    // Notify salesperson when customer responds
    if (["accepted","declined"].includes(data.status) && data.salesperson_name) {
      const salesEmail = await getEmployeeEmail(base44, data.salesperson_name);
      if (salesEmail) {
        await notifyUser(base44, salesEmail, {
          title: `Quote ${data.status}: ${data.title}`,
          message: `${data.customer_name} has ${data.status} your quote "${data.title}" (${data.quote_number}).${data.customer_feedback ? " Feedback: " + data.customer_feedback : ""}`,
          type: data.status === "accepted" ? "success" : "warning",
          category: "customer",
        });
      }
    }
  }
}

// ── QUOTE NOTE ────────────────────────────────────────────────────────────────
async function handleQuoteNote(base44, eventType, data, old_data) {
  if (eventType !== "create") return;

  // Notify employees only (never customers/clients)
  const allUsers = await base44.asServiceRole.entities.User.list();
  const others = allUsers.filter(u => u.email !== data.author_email && u.role !== "user");
  const typeLabel = data.note_type ? data.note_type.charAt(0).toUpperCase() + data.note_type.slice(1) : "Note";

  for (const u of others) {
    await notifyUser(base44, u.email, {
      title: `Internal ${typeLabel} on quote ${data.quote_number || data.quote_title}`,
      message: `${data.author_name || data.author_email} added a ${data.note_type} on "${data.quote_title}": ${(data.content || "").slice(0, 120)}${data.content?.length > 120 ? "…" : ""}`,
      type: data.note_type === "flag" ? "warning" : data.note_type === "approval" ? "success" : "info",
      category: "customer",
    });
  }
}

// ── TASK ──────────────────────────────────────────────────────────────────────
async function handleTask(base44, eventType, data, old_data) {
  const assigneeEmail = data.assigned_to_email;
  const statusChanged = old_data && old_data.status !== data.status;

  if (assigneeEmail) {
    if (eventType === "create") {
      await notifyUser(base44, assigneeEmail, {
        title: `New task assigned: ${data.title}`,
        message: `You have a new ${data.priority} priority task: "${data.title}". Due: ${data.due_date || "No due date"}.`,
        type: data.priority === "critical" ? "error" : data.priority === "high" ? "warning" : "info",
        category: "system",
      });
    } else if (eventType === "update" && statusChanged) {
      if (data.status === "completed") {
        // Notify the assigner that the task is done
        if (data.assigned_by) {
          await notifyUser(base44, data.assigned_by, {
            title: `Task completed: ${data.title}`,
            message: `${data.assigned_to_name} completed the task "${data.title}".`,
            type: "success", category: "system",
          });
        }
      }
    }
  }
}

// ── PROJECT TASK ───────────────────────────────────────────────────────────────
async function handleProjectTask(base44, eventType, data, old_data) {
  const statusChanged = old_data && old_data.status !== data.status;
  if (!statusChanged && eventType !== "create") return;

  if (data.assigned_to) {
    const empEmail = await getEmployeeEmail(base44, data.assigned_to);
    if (empEmail && eventType === "create") {
      await notifyUser(base44, empEmail, {
        title: `Project task assigned: ${data.title}`,
        message: `You have a new project task: "${data.title}" on project ${data.quote_number}.`,
        type: "info", category: "network",
      });
    }
    if (empEmail && eventType === "update" && data.status === "awaiting_approval") {
      await notifyDepartment(base44, "projects", {
        title: `Task awaiting approval: ${data.title}`,
        message: `Task "${data.title}" on project ${data.quote_number} is awaiting approval.`,
        type: "warning", category: "network",
      });
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function notifyUser(base44, email, { title, message, type, category }) {
  await base44.asServiceRole.entities.Notification.create({
    user_email: email, title, message, type, category, is_read: false,
  });
}

async function notifyDepartment(base44, department, { title, message, type, category }) {
  try {
    const employees = await base44.asServiceRole.entities.Employee.filter({ department, status: "active" });
    if (!employees?.length) return;
    await Promise.all(employees.map(emp =>
      emp.email ? notifyUser(base44, emp.email, { title, message, type, category }) : Promise.resolve()
    ));
  } catch (err) {
    console.error("notifyDepartment error:", err.message);
  }
}

async function getCustomerEmail(base44, customerId) {
  if (!customerId) return null;
  try {
    const rows = await base44.asServiceRole.entities.Customer.filter({ id: customerId });
    return rows?.[0]?.email || null;
  } catch { return null; }
}

async function getEmployeeEmail(base44, nameOrEmail) {
  if (!nameOrEmail) return null;
  if (nameOrEmail.includes("@")) return nameOrEmail;
  try {
    const rows = await base44.asServiceRole.entities.Employee.filter({ full_name: nameOrEmail });
    return rows?.[0]?.email || null;
  } catch { return null; }
}

async function sendEmail(base44, to, subject, body) {
  try {
    await base44.asServiceRole.integrations.Core.SendEmail({ to, subject, body });
  } catch (err) {
    console.error("sendEmail error:", err.message);
  }
}

function buildEmailBody(title, message) {
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:32px;">
  <div style="max-width:520px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px 28px;">
      <h2 style="margin:0;color:white;font-size:18px;">${title}</h2>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">TouchNet Automated Alert</p>
    </div>
    <div style="padding:24px 28px;">
      <p style="color:#1e293b;font-size:15px;margin:0 0 16px;">${message}</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">TouchNet Operations Platform — automated notification.</p>
    </div>
  </div></body></html>`;
}

function buildCustomerEmailBody(title, message, accentColor = "#6366f1") {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f4f7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px 36px;text-align:center;">
            <div style="display:inline-block;background:${accentColor}22;border:1px solid ${accentColor}44;border-radius:6px;padding:3px 12px;margin-bottom:14px;">
              <span style="color:${accentColor};font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">TouchNet Customer Portal</span>
            </div>
            <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0;">${title}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 36px;">
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">${message}</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">For support: <strong>010 060 0400</strong></p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 36px;text-align:center;">
            <p style="color:#9ca3af;font-size:11px;margin:0;">TouchNet Telecommunications · 151 Katherine Street, Sandton</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table></body></html>`;
}