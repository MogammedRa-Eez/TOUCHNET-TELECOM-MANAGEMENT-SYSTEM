import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data, old_data } = body;

    if (event?.type !== "update") return Response.json({ skipped: true, reason: "Not an update" });

    const newStatus = data?.status;
    const oldStatus = old_data?.status;

    if (newStatus !== "active" || oldStatus === "active") {
      return Response.json({ skipped: true, reason: "Status did not change to active" });
    }

    const customer = data;
    if (!customer.email) return Response.json({ skipped: true, reason: "No customer email" });

    const PLAN_LABELS = {
      basic_10mbps: "Basic 10 Mbps", standard_50mbps: "Standard 50 Mbps",
      premium_100mbps: "Premium 100 Mbps", enterprise_500mbps: "Enterprise 500 Mbps",
      dedicated_1gbps: "Dedicated 1 Gbps",
    };

    const planLabel = PLAN_LABELS[customer.service_plan] || (customer.service_plan || "").replace(/_/g," ");

    const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0fdf9;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf9;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;background:#ffffff;box-shadow:0 4px 32px rgba(0,180,180,0.1);">
        <tr><td style="background:linear-gradient(135deg,#0a1a1a,#0f2222);padding:32px;">
          <p style="margin:0;font-size:20px;font-weight:900;color:#00d4d4;font-family:'Space Grotesk',sans-serif;">TouchNet</p>
          <p style="margin:4px 0 0;font-size:10px;letter-spacing:0.2em;color:rgba(0,212,212,0.4);text-transform:uppercase;">Welcome to the Network</p>
        </td></tr>
        <tr><td style="height:4px;background:linear-gradient(90deg,#00b4b4,#00d4d4,#10b981,transparent);"></td></tr>
        <tr><td style="padding:40px 32px 28px;text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">🎉</div>
          <h1 style="margin:0 0 12px;font-size:26px;font-weight:900;color:#0f172a;">Welcome to TouchNet, ${customer.full_name.split(" ")[0]}!</h1>
          <p style="margin:0 0 28px;font-size:16px;line-height:1.7;color:#475569;">
            Your account is now <strong style="color:#10b981;">active</strong> and you're officially part of the TouchNet family. 
            We're excited to keep you connected with fast, reliable internet.
          </p>
        </td></tr>
        <tr><td style="padding:0 32px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#f0fdf9,#ecfdf5);border:1px solid rgba(16,185,129,0.2);border-radius:16px;margin-bottom:28px;">
            <tr><td style="padding:24px;">
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#10b981;">Your Account Details</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:6px 0;font-size:13px;color:#64748b;width:45%;">Account Number</td><td style="padding:6px 0;font-size:13px;font-weight:700;color:#0f172a;font-family:monospace;">${customer.account_number || "—"}</td></tr>
                ${planLabel ? `<tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Service Plan</td><td style="padding:6px 0;font-size:13px;font-weight:700;color:#0f172a;">${planLabel}</td></tr>` : ""}
                ${customer.monthly_rate ? `<tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Monthly Rate</td><td style="padding:6px 0;font-size:13px;font-weight:700;color:#10b981;">R${customer.monthly_rate}/month</td></tr>` : ""}
                ${customer.address ? `<tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Service Address</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#0f172a;">${customer.address}</td></tr>` : ""}
              </table>
            </td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="padding-right:8px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8faff;border:1px solid rgba(99,102,241,0.12);border-radius:12px;">
                  <tr><td style="padding:16px 20px;text-align:center;">
                    <p style="margin:0;font-size:20px;margin-bottom:6px;">🌐</p>
                    <p style="margin:0;font-size:12px;font-weight:700;color:#0f172a;">Customer Portal</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#64748b;">Manage bills, tickets & more</p>
                  </td></tr>
                </table>
              </td>
              <td style="padding-left:8px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8faff;border:1px solid rgba(99,102,241,0.12);border-radius:12px;">
                  <tr><td style="padding:16px 20px;text-align:center;">
                    <p style="margin:0;font-size:20px;margin-bottom:6px;">🎁</p>
                    <p style="margin:0;font-size:12px;font-weight:700;color:#0f172a;">Refer & Earn</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#64748b;">Earn rewards for referrals</p>
                  </td></tr>
                </table>
              </td>
            </tr>
          </table>

          <a href="https://touchnet.co.za/CustomerPortalMain" style="display:block;text-align:center;background:linear-gradient(135deg,#00b4b4,#007a7a);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:16px 32px;border-radius:12px;">
            Access Your Customer Portal →
          </a>

          <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;text-align:center;">
            Need help? <a href="mailto:support@touchnet.co.za" style="color:#00b4b4;text-decoration:none;">support@touchnet.co.za</a> · <a href="tel:0100600400" style="color:#00b4b4;text-decoration:none;">010 060 0400</a>
          </p>
        </td></tr>
        <tr><td style="background:#f8f9ff;padding:16px 32px;border-top:1px solid rgba(0,0,0,0.06);">
          <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">TouchNet Telecommunications (PTY) LTD · 151 Katherine Street, Sandton, 2196</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: customer.email,
      subject: `🎉 Welcome to TouchNet, ${customer.full_name.split(" ")[0]}! Your account is now active`,
      body: emailHtml,
      from_name: "TouchNet",
    });

    console.log(`Welcome email sent to ${customer.email}`);
    return Response.json({ success: true, to: customer.email });

  } catch (error) {
    console.error("welcomeEmailTrigger error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});