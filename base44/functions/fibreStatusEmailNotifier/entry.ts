import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const STATUS_CONFIG = {
  lead: {
    subject: "Your Fibre Application Has Been Received",
    heading: "Application Received! 📋",
    color: "#94a3b8",
    message: "We've received your fibre application and our team will be in touch shortly to discuss the next steps.",
    cta: null,
  },
  quoted: {
    subject: "Your Fibre Quote Is Ready",
    heading: "Your Quote Is Ready! 💼",
    color: "#f59e0b",
    message: "We've prepared a quote for your fibre installation. Please log in to your customer portal to review and accept it.",
    cta: "View Your Quote",
  },
  approved: {
    subject: "Your Fibre Order Has Been Approved",
    heading: "Order Approved! ✅",
    color: "#6366f1",
    message: "Great news! Your fibre installation order has been approved and we've placed the order with our infrastructure partner. We'll keep you updated as things progress.",
    cta: null,
  },
  in_progress: {
    subject: "Your Fibre Installation Is Underway",
    heading: "Installation In Progress 🔧",
    color: "#3b82f6",
    message: "Your fibre installation is now actively underway. Our team is working to get you connected as quickly as possible. You can track your progress in the customer portal.",
    cta: "Track Progress",
  },
  testing: {
    subject: "Your Fibre Connection Is Being Tested",
    heading: "Almost There — Testing Now! 📡",
    color: "#8b5cf6",
    message: "We're in the final stretch! Your fibre connection has been installed and our engineers are running quality tests to ensure everything performs perfectly before activation.",
    cta: null,
  },
  live: {
    subject: "🎉 Your Fibre is Live! Welcome to TouchNet",
    heading: "You're Connected! 🎉",
    color: "#10b981",
    message: "Congratulations! Your fibre connection is now live and fully active. You can start enjoying high-speed internet immediately. Log in to your customer portal to manage your account.",
    cta: "Access Your Portal",
  },
  billed: {
    subject: "Your First Invoice Has Been Generated",
    heading: "First Invoice Ready 🧾",
    color: "#059669",
    message: "Your fibre service is active and your first invoice has been generated. Please log in to your customer portal to view and download your invoice.",
    cta: "View Invoice",
  },
  cancelled: {
    subject: "Update on Your TouchNet Fibre Application",
    heading: "Application Update",
    color: "#ef4444",
    message: "We're sorry to inform you that your fibre application has been cancelled. If you believe this is an error or would like to discuss alternatives, please contact our support team.",
    cta: null,
  },
};

const PORTAL_URL = "https://app.base44.com/CustomerPortalMain";

function buildEmailHTML(project, statusCfg) {
  const planLabel = project.service_plan
    ? project.service_plan.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusCfg.subject}</title>
</head>
<body style="margin:0;padding:0;background:#f3f0fd;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f0fd;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;background:#ffffff;box-shadow:0 4px 32px rgba(124,111,224,0.12);">
          
          <!-- Header stripe -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1330,#221a42);padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png"
                         alt="TouchNet" height="36" style="display:block;filter:brightness(0) invert(1);">
                    <p style="margin:6px 0 0;font-size:10px;letter-spacing:0.2em;color:rgba(196,188,247,0.45);font-weight:700;text-transform:uppercase;">Fibre Installation Update</p>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;background:${statusCfg.color}22;border:1px solid ${statusCfg.color}55;color:${statusCfg.color};padding:4px 14px;border-radius:100px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">
                      ${project.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Top accent bar -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,${statusCfg.color},${statusCfg.color}44,transparent);"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 28px;">
              <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;">Hi ${project.customer_name},</p>
              <h1 style="margin:8px 0 20px;font-size:22px;font-weight:900;color:#0f172a;line-height:1.3;">${statusCfg.heading}</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#475569;">${statusCfg.message}</p>

              <!-- Project details box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7ff;border:1px solid rgba(155,143,239,0.2);border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#9b8fef;">Project Details</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:5px 0;font-size:13px;color:#64748b;width:40%;">Project</td>
                        <td style="padding:5px 0;font-size:13px;font-weight:600;color:#1e293b;">${project.project_name}</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;font-size:13px;color:#64748b;">Quote #</td>
                        <td style="padding:5px 0;font-size:13px;font-weight:600;color:#6366f1;font-family:monospace;">${project.quote_number}</td>
                      </tr>
                      ${planLabel ? `<tr>
                        <td style="padding:5px 0;font-size:13px;color:#64748b;">Service Plan</td>
                        <td style="padding:5px 0;font-size:13px;font-weight:600;color:#1e293b;">${planLabel}</td>
                      </tr>` : ""}
                      ${project.site_address ? `<tr>
                        <td style="padding:5px 0;font-size:13px;color:#64748b;">Address</td>
                        <td style="padding:5px 0;font-size:13px;font-weight:600;color:#1e293b;">${project.site_address}</td>
                      </tr>` : ""}
                      ${project.forecasted_go_live_date && project.status !== "live" ? `<tr>
                        <td style="padding:5px 0;font-size:13px;color:#64748b;">Est. Go-Live</td>
                        <td style="padding:5px 0;font-size:13px;font-weight:600;color:#10b981;">${project.forecasted_go_live_date}</td>
                      </tr>` : ""}
                    </table>
                  </td>
                </tr>
              </table>

              ${statusCfg.cta ? `
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td>
                    <a href="${PORTAL_URL}" style="display:inline-block;background:linear-gradient(135deg,#7c6fe0,#9b8fef);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 28px;border-radius:12px;letter-spacing:0.02em;box-shadow:0 4px 16px rgba(124,111,224,0.4);">
                      ${statusCfg.cta} →
                    </a>
                  </td>
                </tr>
              </table>
              ` : ""}

              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                Questions? Contact us at 
                <a href="mailto:support@touchnet.co.za" style="color:#9b8fef;text-decoration:none;">support@touchnet.co.za</a> 
                or call <a href="tel:0100600400" style="color:#9b8fef;text-decoration:none;">010 060 0400</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f7ff;padding:20px 32px;border-top:1px solid rgba(155,143,239,0.12);">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
                TouchNet Telecommunications (PTY) LTD · 151 Katherine Street, Sandton<br>
                <a href="${PORTAL_URL}" style="color:#9b8fef;text-decoration:none;">Customer Portal</a> · 
                <a href="mailto:support@touchnet.co.za" style="color:#9b8fef;text-decoration:none;">support@touchnet.co.za</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data, old_data } = body;

    // Only process update events where status actually changed
    if (event?.type !== "update") {
      return Response.json({ skipped: true, reason: "Not an update event" });
    }

    const newStatus = data?.status;
    const oldStatus = old_data?.status;

    if (!newStatus || newStatus === oldStatus) {
      return Response.json({ skipped: true, reason: "Status unchanged" });
    }

    const project = data;
    const customerEmail = project.customer_email;

    if (!customerEmail) {
      return Response.json({ skipped: true, reason: "No customer email on project" });
    }

    const statusCfg = STATUS_CONFIG[newStatus];
    if (!statusCfg) {
      return Response.json({ skipped: true, reason: `No email template for status: ${newStatus}` });
    }

    // Send email via Gmail connector
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");

    const emailHtml = buildEmailHTML(project, statusCfg);

    // Build RFC 2822 message
    const emailLines = [
      `To: ${customerEmail}`,
      `Subject: ${statusCfg.subject}`,
      "Content-Type: text/html; charset=UTF-8",
      "MIME-Version: 1.0",
      "",
      emailHtml,
    ];
    const rawEmail = emailLines.join("\r\n");
    const encodedEmail = btoa(unescape(encodeURIComponent(rawEmail)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const gmailRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encodedEmail }),
    });

    if (!gmailRes.ok) {
      const errText = await gmailRes.text();
      console.error("Gmail send failed:", errText);
      return Response.json({ success: false, error: errText }, { status: 500 });
    }

    console.log(`Status email sent to ${customerEmail} for project ${project.quote_number}: ${oldStatus} → ${newStatus}`);

    return Response.json({
      success: true,
      to: customerEmail,
      project: project.quote_number,
      statusChange: `${oldStatus} → ${newStatus}`,
    });

  } catch (error) {
    console.error("fibreStatusEmailNotifier error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});