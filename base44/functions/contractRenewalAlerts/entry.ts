import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const customers = await base44.asServiceRole.entities.Customer.list();
    const today = new Date();

    const THRESHOLDS = [90, 60, 30]; // days before expiry
    const notified = [];
    const skipped = [];

    for (const customer of customers) {
      if (!customer.contract_end_date || !customer.email) { skipped.push(customer.id); continue; }
      if (!["active", "pending"].includes(customer.status)) { skipped.push(customer.id); continue; }

      const endDate = new Date(customer.contract_end_date);
      const daysLeft = Math.round((endDate - today) / (1000 * 60 * 60 * 24));

      const matchedThreshold = THRESHOLDS.find(t => daysLeft <= t && daysLeft > (t - 5));
      if (!matchedThreshold) continue;

      const urgency = matchedThreshold <= 30 ? "🚨 Urgent" : matchedThreshold <= 60 ? "⚠️ Reminder" : "📅 Notice";
      const urgencyColor = matchedThreshold <= 30 ? "#e02347" : matchedThreshold <= 60 ? "#f59e0b" : "#6366f1";

      const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f7ff;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7ff;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;background:#ffffff;box-shadow:0 4px 32px rgba(0,0,0,0.1);">
        <tr><td style="background:linear-gradient(135deg,#0a0a0a,#1a1a1a);padding:28px 32px;">
          <p style="margin:0;font-size:18px;font-weight:900;color:#00d4d4;font-family:'Space Grotesk',sans-serif;">TouchNet</p>
          <p style="margin:4px 0 0;font-size:10px;letter-spacing:0.2em;color:rgba(0,212,212,0.4);text-transform:uppercase;">Contract Renewal Notice</p>
        </td></tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,${urgencyColor},${urgencyColor}44,transparent);"></td></tr>
        <tr><td style="padding:36px 32px 28px;">
          <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;">Hi ${customer.full_name},</p>
          <h1 style="margin:8px 0 20px;font-size:22px;font-weight:900;color:#0f172a;">${urgency} — Contract Renewal</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#475569;">
            Your TouchNet service contract expires in <strong>${daysLeft} days</strong> on 
            <strong>${endDate.toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" })}</strong>.
            ${daysLeft <= 30 ? "Please renew immediately to avoid service interruption." : "We'd love to keep you connected — please get in touch to discuss renewal options."}
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9ff;border:1px solid rgba(99,102,241,0.15);border-radius:12px;margin-bottom:28px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#6366f1;">Account Details</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:5px 0;font-size:13px;color:#64748b;width:40%;">Account</td><td style="padding:5px 0;font-size:13px;font-weight:600;color:#1e293b;">${customer.account_number || "—"}</td></tr>
                <tr><td style="padding:5px 0;font-size:13px;color:#64748b;">Service Plan</td><td style="padding:5px 0;font-size:13px;font-weight:600;color:#1e293b;">${(customer.service_plan || "").replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</td></tr>
                <tr><td style="padding:5px 0;font-size:13px;color:#64748b;">Contract Ends</td><td style="padding:5px 0;font-size:13px;font-weight:600;color:${urgencyColor};">${endDate.toLocaleDateString("en-ZA")}</td></tr>
                <tr><td style="padding:5px 0;font-size:13px;color:#64748b;">Days Remaining</td><td style="padding:5px 0;font-size:13px;font-weight:900;color:${urgencyColor};">${daysLeft} days</td></tr>
              </table>
            </td></tr>
          </table>
          <a href="mailto:sales@touchnet.co.za?subject=Contract%20Renewal%20-%20${encodeURIComponent(customer.account_number || customer.full_name)}" 
             style="display:inline-block;background:linear-gradient(135deg,#00b4b4,#007a7a);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 28px;border-radius:12px;letter-spacing:0.02em;">
            Renew My Contract →
          </a>
          <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">Questions? <a href="mailto:support@touchnet.co.za" style="color:#00b4b4;text-decoration:none;">support@touchnet.co.za</a> · <a href="tel:0100600400" style="color:#00b4b4;text-decoration:none;">010 060 0400</a></p>
        </td></tr>
        <tr><td style="background:#f8f9ff;padding:16px 32px;border-top:1px solid rgba(0,0,0,0.06);">
          <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">TouchNet Telecommunications · 151 Katherine Street, Sandton</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customer.email,
          subject: `${urgency}: Your TouchNet contract expires in ${daysLeft} days`,
          body: emailHtml,
          from_name: "TouchNet Renewals",
        });

        // Create in-app notification
        await base44.asServiceRole.entities.Notification.create({
          user_email: customer.email,
          title: `Contract Renewal — ${daysLeft} days remaining`,
          message: `Your service contract expires on ${endDate.toLocaleDateString("en-ZA")}. Please contact us to renew.`,
          type: daysLeft <= 30 ? "warning" : "info",
          category: "customer",
          is_read: false,
        });

        notified.push({ id: customer.id, name: customer.full_name, daysLeft, threshold: matchedThreshold });
      } catch (emailErr) {
        console.error(`Failed to notify ${customer.email}:`, emailErr.message);
      }
    }

    console.log(`Contract renewal check: ${notified.length} notified, ${skipped.length} skipped`);
    return Response.json({ success: true, notified, skippedCount: skipped.length });

  } catch (error) {
    console.error("contractRenewalAlerts error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});