import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data, old_data } = body;
    if (!event || !data) {
      return Response.json({ skipped: true, reason: "no event/data" });
    }

    const entityName = event.entity_name;
    const eventType  = event.type; // create | update | delete

    // ── Customer-facing auto-notifications ──────────────────────────────────
    // These fire for Invoice and Ticket changes that directly involve the customer,
    // notifying the customer's linked user account (if they have a portal login).
    await handleCustomerNotifications(base44, entityName, eventType, data, old_data);

    // ── Admin rule-based notifications ─────────────────────────────────────
    const rules = await base44.asServiceRole.entities.NotificationRule.filter({
      entity_name: entityName,
      is_active: true,
    });

    if (!rules || rules.length === 0) {
      return Response.json({ processed: 0 });
    }

    let processed = 0;

    for (const rule of rules) {
      // Check event type match
      if (rule.event_type !== "any" && rule.event_type !== eventType) continue;

      // Check field/value conditions
      if (rule.field_name) {
        const newVal = data[rule.field_name];
        const oldVal = old_data ? old_data[rule.field_name] : undefined;
        if (rule.field_value) {
          if (newVal !== rule.field_value) continue;
          if (eventType === "update" && oldVal === newVal) continue;
        } else {
          if (eventType === "update" && oldVal === newVal) continue;
        }
      }

      // Build notification message
      const recordName =
        data.full_name || data.customer_name || data.subject ||
        data.invoice_number || data.project_name || data.title || data.id || "Record";

      let message = rule.message_template || "";
      if (!message) {
        if (eventType === "create") {
          message = `New ${entityName} created: ${recordName}`;
        } else if (rule.field_name && rule.field_value) {
          message = `${entityName} "${recordName}" — ${rule.field_name} changed to ${rule.field_value}`;
        } else if (rule.field_name) {
          message = `${entityName} "${recordName}" — ${rule.field_name} updated to ${data[rule.field_name]}`;
        } else {
          message = `${entityName} "${recordName}" was updated`;
        }
      } else {
        message = message
          .replace("{name}", recordName)
          .replace("{status}", data.status || "")
          .replace("{entity}", entityName);
      }

      // Send in-app notifications
      if (rule.send_in_app && rule.notify_emails?.length > 0) {
        for (const email of rule.notify_emails) {
          if (!email) continue;
          await base44.asServiceRole.entities.Notification.create({
            user_email: email,
            title: rule.name,
            message,
            type: rule.notification_type || "info",
            category: rule.category || "system",
            is_read: false,
            link_page: rule.category === "billing" ? "Billing" : rule.category === "ticket" ? "Tickets" : rule.category === "network" ? "Network" : undefined,
          });
        }
      }

      // Send email notifications
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
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ── Customer-facing notifications ──────────────────────────────────────────────
async function handleCustomerNotifications(base44, entityName, eventType, data, old_data) {
  try {
    if (entityName === "Invoice") {
      const customerEmail = data.customer_email || await getCustomerEmail(base44, data.customer_id);
      if (!customerEmail) return;

      const statusChanged = old_data && old_data.status !== data.status;
      const invoiceNum = data.invoice_number || data.id;
      const amount = data.total ? `R${Number(data.total).toFixed(2)}` : (data.amount ? `R${Number(data.amount).toFixed(2)}` : "");

      if (eventType === "create") {
        // New invoice issued to the customer
        await createCustomerNotif(base44, customerEmail, {
          title: "New Invoice Issued",
          message: `Invoice ${invoiceNum} for ${amount} has been issued to your account. Due date: ${data.due_date || "N/A"}.`,
          type: "info",
          category: "billing",
        });
        // Send email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customerEmail,
          subject: `New Invoice ${invoiceNum} — TouchNet`,
          body: buildCustomerEmailBody(
            "New Invoice Issued",
            `Your invoice <strong>${invoiceNum}</strong> for <strong>${amount}</strong> has been issued.<br>Due date: <strong>${data.due_date || "N/A"}</strong><br><br>Please log in to your customer portal to view and download your invoice.`,
            "#06b6d4"
          ),
        });

      } else if (eventType === "update" && statusChanged) {
        if (data.status === "paid") {
          await createCustomerNotif(base44, customerEmail, {
            title: "Payment Confirmed ✓",
            message: `Invoice ${invoiceNum} for ${amount} has been marked as paid. Thank you for your payment!`,
            type: "success",
            category: "billing",
          });
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: customerEmail,
            subject: `Payment Confirmed — Invoice ${invoiceNum}`,
            body: buildCustomerEmailBody(
              "Payment Confirmed ✓",
              `Your payment for invoice <strong>${invoiceNum}</strong> (${amount}) has been confirmed.<br><br>Thank you for your prompt payment. Your service remains active.`,
              "#10b981"
            ),
          });
        } else if (data.status === "overdue") {
          await createCustomerNotif(base44, customerEmail, {
            title: "Invoice Overdue — Action Required",
            message: `Invoice ${invoiceNum} for ${amount} is now overdue. Please make payment to avoid service interruption.`,
            type: "error",
            category: "billing",
          });
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: customerEmail,
            subject: `⚠️ Invoice Overdue — ${invoiceNum}`,
            body: buildCustomerEmailBody(
              "Invoice Overdue",
              `Invoice <strong>${invoiceNum}</strong> for <strong>${amount}</strong> is now overdue.<br><br>Please make payment as soon as possible to avoid service interruption. Contact our support team if you have any queries.`,
              "#ef4444"
            ),
          });
        } else if (data.status === "cancelled") {
          await createCustomerNotif(base44, customerEmail, {
            title: "Invoice Cancelled",
            message: `Invoice ${invoiceNum} has been cancelled. Please contact support if this is unexpected.`,
            type: "warning",
            category: "billing",
          });
        }
      }

    } else if (entityName === "Ticket") {
      const customerEmail = data.customer_email || await getCustomerEmail(base44, data.customer_id);
      if (!customerEmail) return;

      const ticketNum = data.ticket_number || data.id;
      const statusChanged = old_data && old_data.status !== data.status;

      if (eventType === "create") {
        await createCustomerNotif(base44, customerEmail, {
          title: "Support Ticket Created",
          message: `Your support ticket #${ticketNum} has been created: "${data.subject}". Our team will respond shortly.`,
          type: "info",
          category: "ticket",
        });
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customerEmail,
          subject: `Support Ticket Created — #${ticketNum}`,
          body: buildCustomerEmailBody(
            "Support Ticket Received",
            `We've received your support request.<br><br><strong>Ticket #${ticketNum}:</strong> ${data.subject}<br><br>Our team will review your ticket and get back to you shortly. You can track the status of your ticket in your customer portal.`,
            "#6366f1"
          ),
        });

      } else if (eventType === "update" && statusChanged) {
        const statusMessages = {
          in_progress:      { msg: `Your ticket #${ticketNum} is now being worked on by our team.`, type: "info",    title: "Ticket In Progress" },
          waiting_customer: { msg: `Our team has responded to ticket #${ticketNum} and is waiting for your input. Please check the ticket for details.`, type: "warning", title: "Your Response Needed" },
          resolved:         { msg: `Your support ticket #${ticketNum} has been resolved! ${data.resolution_notes ? "Resolution: " + data.resolution_notes : ""}`, type: "success", title: "Ticket Resolved ✓" },
          closed:           { msg: `Ticket #${ticketNum} has been closed. Thank you for contacting us.`, type: "success", title: "Ticket Closed" },
          escalated:        { msg: `Ticket #${ticketNum} has been escalated to a senior team member for urgent attention.`, type: "warning", title: "Ticket Escalated" },
        };
        const cfg = statusMessages[data.status];
        if (cfg) {
          await createCustomerNotif(base44, customerEmail, {
            title: cfg.title,
            message: cfg.msg,
            type: cfg.type,
            category: "ticket",
          });
          if (["resolved", "waiting_customer", "escalated"].includes(data.status)) {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: customerEmail,
              subject: `${cfg.title} — Ticket #${ticketNum}`,
              body: buildCustomerEmailBody(cfg.title, cfg.msg.replace(/\n/g, "<br>"), cfg.type === "success" ? "#10b981" : cfg.type === "warning" ? "#f59e0b" : "#6366f1"),
            });
          }
        }
      }

    } else if (entityName === "Customer") {
      const customerEmail = data.email;
      if (!customerEmail) return;
      const statusChanged = old_data && old_data.status !== data.status;

      if (eventType === "update" && statusChanged) {
        const statusMsg = {
          active:     { title: "Account Activated ✓",    msg: "Your TouchNet account is now active. Welcome aboard! Your service is ready to use.", type: "success", color: "#10b981" },
          suspended:  { title: "Account Suspended",      msg: "Your account has been temporarily suspended. Please contact support for assistance.", type: "error",   color: "#ef4444" },
          terminated: { title: "Account Terminated",     msg: "Your account has been terminated. Please contact us if you believe this is an error.", type: "error",   color: "#ef4444" },
          pending:    { title: "Account Under Review",   msg: "Your account is currently under review. We'll notify you once it's activated.", type: "warning", color: "#f59e0b" },
        };
        const cfg = statusMsg[data.status];
        if (cfg) {
          await createCustomerNotif(base44, customerEmail, {
            title: cfg.title,
            message: cfg.msg,
            type: cfg.type,
            category: "customer",
          });
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: customerEmail,
            subject: `Account Update — ${cfg.title}`,
            body: buildCustomerEmailBody(cfg.title, cfg.msg, cfg.color),
          });
        }
      }
    }
  } catch (err) {
    // Non-fatal — log but don't break the main flow
    console.error("Customer notification error:", err.message);
  }
}

async function getCustomerEmail(base44, customerId) {
  if (!customerId) return null;
  try {
    const customers = await base44.asServiceRole.entities.Customer.filter({ id: customerId });
    return customers?.[0]?.email || null;
  } catch {
    return null;
  }
}

async function createCustomerNotif(base44, email, { title, message, type, category }) {
  await base44.asServiceRole.entities.Notification.create({
    user_email: email,
    title,
    message,
    type,
    category,
    is_read: false,
    link_page: category === "billing" ? "CustomerPortalMain" : category === "ticket" ? "CustomerPortalMain" : undefined,
  });
}

function buildEmailBody(title, message) {
  return `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px;">
  <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg,#6366f1,#8b5cf6); padding: 24px 28px;">
      <h2 style="margin:0; color:white; font-size: 18px;">${title}</h2>
      <p style="margin:4px 0 0; color:rgba(255,255,255,0.8); font-size:13px;">TouchNet Automated Alert</p>
    </div>
    <div style="padding: 24px 28px;">
      <p style="color:#1e293b; font-size:15px; margin:0 0 16px;">${message}</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;">
      <p style="color:#94a3b8; font-size:12px; margin:0;">This is an automated notification from TouchNet Operations Platform.</p>
    </div>
  </div>
</body>
</html>`;
}

function buildCustomerEmailBody(title, message, accentColor = "#6366f1") {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Helvetica Neue',Arial,sans-serif;">
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
            <p style="color:#9ca3af;font-size:12px;margin:0;">You are receiving this because you are a registered TouchNet customer.<br>
            For support, contact us at <strong>010 060 0400</strong> or reply to this email.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 36px;text-align:center;">
            <p style="color:#9ca3af;font-size:11px;margin:0;">TouchNet Telecommunications · 151 Katherine Street, Sandton</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}