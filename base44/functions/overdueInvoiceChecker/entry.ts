/**
 * Overdue Invoice Checker
 * - Runs daily
 * - Finds all "sent" invoices where due_date < today
 * - Marks them as "overdue"
 * - Sends a reminder email to the customer via Gmail
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function buildReminderHtml(customerName, invoice) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff5f5; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.15);">

    <!-- Alert header -->
    <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 28px 36px; text-align: center;">
      <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em;">Payment Overdue</p>
      <h1 style="color: white; margin: 6px 0 0; font-size: 22px; font-weight: 900;">Action Required</h1>
    </div>

    <div style="padding: 32px 36px;">
      <p style="margin: 0 0 16px; color: #1e293b; font-size: 15px;">Dear <strong>${customerName}</strong>,</p>
      <p style="margin: 0 0 20px; color: #64748b; font-size: 13px; line-height: 1.6;">
        This is a reminder that the following invoice is now overdue. Please arrange payment as soon as possible to avoid service interruption.
      </p>

      <!-- Invoice summary -->
      <div style="background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <p style="margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8;">Invoice #</p>
            <p style="margin: 4px 0 0; font-size: 14px; font-weight: 800; color: #6366f1; font-family: monospace;">${invoice.invoice_number}</p>
          </div>
          <div>
            <p style="margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8;">Amount Due</p>
            <p style="margin: 4px 0 0; font-size: 18px; font-weight: 900; color: #ef4444; font-family: monospace;">R${(invoice.total || invoice.amount || 0).toFixed(2)}</p>
          </div>
          <div>
            <p style="margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8;">Was Due</p>
            <p style="margin: 4px 0 0; font-size: 13px; font-weight: 700; color: #ef4444;">${invoice.due_date}</p>
          </div>
          <div>
            <p style="margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8;">Description</p>
            <p style="margin: 4px 0 0; font-size: 12px; font-weight: 600; color: #334155;">${invoice.description || "Internet Service"}</p>
          </div>
        </div>
      </div>

      <!-- Banking -->
      <div style="background: rgba(248,250,252,0.9); border-radius: 10px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0 0 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8;">Payment Details</p>
        ${[
          ["Account Name", "Touchnet Telecommunications (PTY) LTD"],
          ["Account Number", "001991264"],
          ["Bank", "Standard Bank · Branch: 004305"],
          ["Reference", invoice.invoice_number],
        ].map(([k, v]) => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 12px; color: #94a3b8;">${k}</span>
            <span style="font-size: 12px; font-weight: 700; color: #334155;">${v}</span>
          </div>
        `).join("")}
      </div>

      <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
        Questions? Email <a href="mailto:accounts@touchnet.co.za" style="color: #06b6d4;">accounts@touchnet.co.za</a> or call <strong>010 060 0400</strong>
      </p>
    </div>

    <div style="padding: 16px 36px; border-top: 1px solid rgba(226,232,240,0.8); text-align: center; background: rgba(248,250,252,0.5);">
      <p style="margin: 0; font-size: 10px; color: #cbd5e1;">TouchNet Telecommunications · 151 Katherine Street, Sandton</p>
    </div>
  </div>
</body>
</html>`;
}

async function sendReminderEmail(accessToken, toEmail, customerName, invoice) {
  const subject = `OVERDUE: TouchNet Invoice ${invoice.invoice_number} – R${(invoice.total || invoice.amount || 0).toFixed(2)}`;
  const html = buildReminderHtml(customerName, invoice);

  const boundary = "----=_Overdue_boundary_001";
  const mime = [
    `From: TouchNet Accounts <accounts@touchnet.co.za>`,
    `To: ${customerName} <${toEmail}>`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    `Dear ${customerName},\n\nYour invoice ${invoice.invoice_number} for R${(invoice.total || invoice.amount || 0).toFixed(2)} is overdue.\n\nPlease pay using:\nAccount: 001991264 | Standard Bank | Branch: 004305 | Reference: ${invoice.invoice_number}\n\nContact accounts@touchnet.co.za or 010 060 0400.\n\nTouchNet`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    ``,
    html,
    ``,
    `--${boundary}--`,
  ].join("\r\n");

  const encoded = btoa(unescape(encodeURIComponent(mime)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw: encoded }),
  });

  return res.ok;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // This runs as a scheduled job — authenticate as service role
  const today = new Date().toISOString().slice(0, 10);

  // Find all "sent" invoices with a due_date in the past
  const allInvoices = await base44.asServiceRole.entities.Invoice.filter({ status: "sent" });
  const overdueInvoices = allInvoices.filter(inv => inv.due_date && inv.due_date < today);

  if (overdueInvoices.length === 0) {
    return Response.json({ message: "No overdue invoices found.", marked: 0 });
  }

  const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");

  let marked = 0;
  let emailed = 0;
  const errors = [];

  for (const invoice of overdueInvoices) {
    // Mark as overdue
    await base44.asServiceRole.entities.Invoice.update(invoice.id, { status: "overdue" });
    marked++;

    // Look up customer email to send reminder
    if (invoice.customer_id) {
      const customers = await base44.asServiceRole.entities.Customer.filter({ id: invoice.customer_id });
      const customer = customers[0];
      if (customer?.email) {
        const sent = await sendReminderEmail(accessToken, customer.email, customer.full_name, invoice);
        if (sent) emailed++;
        else errors.push(`Email failed for ${customer.email}`);
      }
    }
  }

  return Response.json({
    message: "Overdue check complete.",
    checked: allInvoices.length,
    marked,
    emailed,
    errors,
  });
});