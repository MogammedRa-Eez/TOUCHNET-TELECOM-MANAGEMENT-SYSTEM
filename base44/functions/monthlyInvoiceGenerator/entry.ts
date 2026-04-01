/**
 * Monthly Invoice Generator
 * - Runs on the 1st of each month
 * - Creates invoices for all active customers with a monthly_rate
 * - Sends invoice email via Gmail connector
 * - Admin-only endpoint
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PLAN_LABELS = {
  basic_10mbps:       "Basic 10 Mbps Internet Service",
  standard_50mbps:    "Standard 50 Mbps Internet Service",
  premium_100mbps:    "Premium 100 Mbps Internet Service",
  enterprise_500mbps: "Enterprise 500 Mbps Internet Service",
  dedicated_1gbps:    "Dedicated 1 Gbps Internet Service",
};

const TAX_RATE = 0.15; // 15% VAT

function padNum(n, len = 6) {
  return String(n).padStart(len, "0");
}

function buildInvoiceNumber(customerId, date) {
  const d = new Date(date);
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `INV-${ym}-${customerId.slice(-5).toUpperCase()}`;
}

function billingPeriod(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const fmt = (dt) => dt.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

function dueDate(date, days = 30) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildEmailHtml(customer, invoice, period) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #f0f9ff; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0891b2, #06b6d4); padding: 32px 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">TouchNet</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px;">Telecommunications (PTY) LTD</p>
    </div>
    
    <!-- Invoice header -->
    <div style="padding: 32px 40px 0;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="margin: 0; font-size: 22px; color: #1e293b; font-weight: 900;">TAX INVOICE</h2>
          <p style="margin: 4px 0 0; color: #6366f1; font-size: 14px; font-weight: 700; font-family: monospace;">${invoice.invoice_number}</p>
        </div>
        <div style="text-align: right;">
          <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 8px 16px; display: inline-block;">
            <p style="margin: 0; color: #10b981; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;">Payment Due</p>
            <p style="margin: 4px 0 0; color: #10b981; font-size: 14px; font-weight: 700;">${invoice.due_date}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bill to -->
    <div style="padding: 24px 40px 0;">
      <p style="margin: 0 0 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8;">Bill To</p>
      <p style="margin: 0; font-size: 15px; font-weight: 800; color: #1e293b;">${customer.full_name}</p>
      <p style="margin: 2px 0 0; color: #64748b; font-size: 13px;">${customer.email}</p>
      ${customer.account_number ? `<p style="margin: 4px 0 0; color: #94a3b8; font-size: 12px; font-family: monospace;">Account #${customer.account_number}</p>` : ""}
    </div>

    <!-- Line items -->
    <div style="margin: 24px 40px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(99,102,241,0.15);">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: rgba(248,250,252,1);">
            <th style="padding: 12px 16px; text-align: left; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8;">Description</th>
            <th style="padding: 12px 16px; text-align: right; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 16px; border-top: 1px solid rgba(226,232,240,0.8);">
              <p style="margin: 0; font-size: 14px; font-weight: 700; color: #1e293b;">${PLAN_LABELS[customer.service_plan] || customer.service_plan?.replace(/_/g, " ")}</p>
              <p style="margin: 4px 0 0; font-size: 11px; color: #94a3b8;">Billing Period: ${period.start} – ${period.end}</p>
            </td>
            <td style="padding: 16px; text-align: right; border-top: 1px solid rgba(226,232,240,0.8); font-size: 14px; font-weight: 700; color: #1e293b; font-family: monospace;">R${invoice.amount.toFixed(2)}</td>
          </tr>
          <tr style="background: rgba(248,250,252,0.5);">
            <td style="padding: 10px 16px; font-size: 12px; color: #64748b;">VAT (15%)</td>
            <td style="padding: 10px 16px; text-align: right; font-size: 12px; color: #64748b; font-family: monospace;">R${invoice.tax.toFixed(2)}</td>
          </tr>
          <tr style="background: linear-gradient(135deg, rgba(99,102,241,0.05), rgba(6,182,212,0.04));">
            <td style="padding: 14px 16px; font-size: 16px; font-weight: 900; color: #1e293b; border-top: 2px solid rgba(99,102,241,0.15);">TOTAL DUE</td>
            <td style="padding: 14px 16px; text-align: right; font-size: 18px; font-weight: 900; color: #6366f1; font-family: monospace; border-top: 2px solid rgba(99,102,241,0.15);">R${invoice.total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Banking details -->
    <div style="margin: 0 40px 24px; padding: 20px; background: rgba(248,250,252,0.8); border-radius: 12px; border: 1px solid rgba(226,232,240,0.8);">
      <p style="margin: 0 0 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8;">Banking Details</p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        ${[
          ["Account Name", "Touchnet Telecommunications (PTY) LTD"],
          ["Account Number", "001991264"],
          ["Bank", "Standard Bank"],
          ["Branch Code", "00 43 05"],
          ["Reference", invoice.invoice_number],
        ].map(([k, v]) => `
          <div>
            <p style="margin: 0; font-size: 10px; color: #94a3b8;">${k}</p>
            <p style="margin: 2px 0 0; font-size: 12px; font-weight: 700; color: #334155;">${v}</p>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 20px 40px; border-top: 1px solid rgba(226,232,240,0.8); text-align: center;">
      <p style="margin: 0; font-size: 11px; color: #94a3b8;">Questions? Contact us at <a href="mailto:support@touchnet.co.za" style="color: #06b6d4;">support@touchnet.co.za</a> or call <strong>010 060 0400</strong></p>
      <p style="margin: 6px 0 0; font-size: 10px; color: #cbd5e1;">151 Katherine Street, Sandton · www.touchnet.co.za · VAT No: 4160204895</p>
    </div>
  </div>
</body>
</html>`;
}

async function sendInvoiceEmail(accessToken, toEmail, customerName, invoice, period) {
  const subject = `TouchNet Invoice ${invoice.invoice_number} – R${invoice.total.toFixed(2)} due ${invoice.due_date}`;
  const html = buildEmailHtml({ full_name: customerName, email: toEmail, ...invoice._customer }, invoice, period);

  // Build RFC 2822 MIME message
  const boundary = "----=_Part_boundary_001";
  const mime = [
    `From: TouchNet Billing <noreply@touchnet.co.za>`,
    `To: ${customerName} <${toEmail}>`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    `Dear ${customerName},\n\nPlease find your invoice ${invoice.invoice_number} for R${invoice.total.toFixed(2)} attached.\nDue date: ${invoice.due_date}\n\nBanking: Standard Bank | Acc: 001991264 | Branch: 004305 | Ref: ${invoice.invoice_number}\n\nThank you,\nTouchNet`,
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

  const user = await base44.auth.me();
  if (user?.role !== "admin") {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const now = new Date();
  const period = billingPeriod(now);

  // Get all active customers with a monthly rate
  const customers = await base44.asServiceRole.entities.Customer.filter({ status: "active" });
  const billable = customers.filter(c => c.monthly_rate && c.monthly_rate > 0 && c.email);

  if (billable.length === 0) {
    return Response.json({ message: "No billable active customers found.", created: 0 });
  }

  // Get existing invoices this month to avoid duplicates
  const existingInvoices = await base44.asServiceRole.entities.Invoice.list("-created_date", 500);
  const existingThisMonth = existingInvoices.filter(inv => {
    return inv.billing_period_start === period.start;
  });
  const alreadyBilledIds = new Set(existingThisMonth.map(i => i.customer_id));

  const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");

  let created = 0;
  let skipped = 0;
  let emailed = 0;
  const errors = [];

  for (const customer of billable) {
    if (alreadyBilledIds.has(customer.id)) {
      skipped++;
      continue;
    }

    const subtotal = customer.monthly_rate;
    const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));
    const invoiceNumber = buildInvoiceNumber(customer.id, now);
    const due = dueDate(now, 30);

    const invoiceData = {
      invoice_number: invoiceNumber,
      customer_id: customer.id,
      customer_name: customer.full_name,
      description: PLAN_LABELS[customer.service_plan] || `Internet Service – ${customer.service_plan?.replace(/_/g, " ")}`,
      amount: subtotal,
      tax,
      total,
      status: "sent",
      due_date: due,
      billing_period_start: period.start,
      billing_period_end: period.end,
    };

    const created_invoice = await base44.asServiceRole.entities.Invoice.create(invoiceData);
    created++;

    // Send email
    const emailSent = await sendInvoiceEmail(
      accessToken,
      customer.email,
      customer.full_name,
      { ...created_invoice, _customer: customer },
      period
    );
    if (emailSent) emailed++;
    else errors.push(`Email failed for ${customer.email}`);
  }

  return Response.json({
    message: `Monthly billing complete.`,
    period: `${period.start} – ${period.end}`,
    billable: billable.length,
    created,
    skipped,
    emailed,
    errors,
  });
});