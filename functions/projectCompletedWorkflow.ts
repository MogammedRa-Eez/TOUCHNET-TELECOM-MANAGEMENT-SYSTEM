import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data, old_data } = body;

    // Only trigger on update events where status changed TO "live"
    if (event?.type !== 'update') return Response.json({ skipped: 'not an update' });
    if (data?.status !== 'live') return Response.json({ skipped: 'status not live' });
    if (old_data?.status === 'live') return Response.json({ skipped: 'already was live' });

    const project = data;

    // --- 1. Generate Invoice ---
    const invoiceNumber = `INV-${Date.now()}`;
    const amount = project.annuity_amount || 0;
    const tax = Math.round(amount * 0.15 * 100) / 100;
    const total = Math.round((amount + tax) * 100) / 100;

    // Due date: 7 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const invoice = await base44.asServiceRole.entities.Invoice.create({
      invoice_number: invoiceNumber,
      customer_id: project.customer_id || '',
      customer_name: project.customer_name,
      amount: amount,
      tax: tax,
      total: total,
      status: 'sent',
      due_date: dueDateStr,
      billing_period_start: new Date().toISOString().split('T')[0],
      description: `Monthly service fee — ${project.service_plan || project.project_name} (${project.quote_number})`,
    });

    // --- 2. Link invoice to project ---
    await base44.asServiceRole.entities.FibreProject.update(project.id, {
      invoice_id: invoice.id,
      billing_start_date: new Date().toISOString().split('T')[0],
    });

    // --- 3. Log activity ---
    await base44.asServiceRole.entities.ProjectActivity.create({
      project_id: project.id,
      quote_number: project.quote_number,
      event_type: 'milestone',
      title: 'Project Go-Live — Invoice Generated',
      detail: `Invoice ${invoiceNumber} for R${total.toFixed(2)} created and emailed to ${project.customer_email}`,
      actor: 'system',
      new_value: invoiceNumber,
    });

    // --- 4. Send Gmail email (only if customer_email exists) ---
    if (project.customer_email) {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

      const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px 40px;text-align:center;">
            <div style="display:inline-block;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);border-radius:8px;padding:4px 14px;margin-bottom:16px;">
              <span style="color:#34d399;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">🎉 Service Activated</span>
            </div>
            <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 4px;">Your Fibre Service is Live!</h1>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">${project.project_name} · ${project.quote_number || ''}</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">Dear <strong>${project.customer_name}</strong>,</p>
            <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 28px;">
              We're thrilled to confirm that your fibre service has been successfully activated. Your connection is now live and ready to use.
            </p>

            <!-- Service Details -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                <p style="color:#0f172a;font-size:13px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.06em;">Service Details</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:5px 0;color:#6b7280;font-size:13px;">Project</td>
                    <td style="padding:5px 0;color:#0f172a;font-size:13px;font-weight:600;text-align:right;">${project.project_name}</td>
                  </tr>
                  ${project.service_plan ? `<tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Service Plan</td><td style="padding:5px 0;color:#0f172a;font-size:13px;font-weight:600;text-align:right;">${project.service_plan}</td></tr>` : ''}
                  ${project.site_address ? `<tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Site Address</td><td style="padding:5px 0;color:#0f172a;font-size:13px;font-weight:600;text-align:right;">${project.site_address}</td></tr>` : ''}
                  <tr>
                    <td style="padding:5px 0;color:#6b7280;font-size:13px;">Go-Live Date</td>
                    <td style="padding:5px 0;color:#0f172a;font-size:13px;font-weight:600;text-align:right;">${new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <!-- Invoice Details -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff9f0;border:1px solid #fed7aa;border-radius:8px;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                <p style="color:#92400e;font-size:13px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.06em;">Invoice Generated</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:5px 0;color:#6b7280;font-size:13px;">Invoice Number</td>
                    <td style="padding:5px 0;color:#0f172a;font-size:13px;font-weight:600;text-align:right;">${invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;color:#6b7280;font-size:13px;">Amount (excl. VAT)</td>
                    <td style="padding:5px 0;color:#0f172a;font-size:13px;font-weight:600;text-align:right;">R${amount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;color:#6b7280;font-size:13px;">VAT (15%)</td>
                    <td style="padding:5px 0;color:#0f172a;font-size:13px;font-weight:600;text-align:right;">R${tax.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0 5px;color:#0f172a;font-size:15px;font-weight:700;border-top:1px solid #fed7aa;">Total Due</td>
                    <td style="padding:8px 0 5px;color:#d97706;font-size:18px;font-weight:800;text-align:right;border-top:1px solid #fed7aa;">R${total.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;color:#6b7280;font-size:13px;">Due Date</td>
                    <td style="padding:5px 0;color:#dc2626;font-size:13px;font-weight:700;text-align:right;">${dueDate.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <!-- Banking Details -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                <p style="color:#14532d;font-size:13px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.06em;">Banking Details</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding:3px 0;color:#374151;font-size:13px;">Account Name: <strong>Touchnet Telecommunications (PTY) LTD</strong></td></tr>
                  <tr><td style="padding:3px 0;color:#374151;font-size:13px;">Account Number: <strong>001991264</strong></td></tr>
                  <tr><td style="padding:3px 0;color:#374151;font-size:13px;">Bank: <strong>Standard Bank</strong> · Branch Code: <strong>00 43 05</strong></td></tr>
                  <tr><td style="padding:3px 0;color:#374151;font-size:13px;">Reference: <strong>${invoiceNumber}</strong></td></tr>
                </table>
              </td></tr>
            </table>

            <p style="color:#374151;font-size:14px;margin:0;">Warm regards,<br><strong>TouchNet Telecommunications</strong><br><span style="color:#6b7280;font-size:12px;">010 060 0400 · www.touchnet.co.za</span></p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
            <p style="color:#9ca3af;font-size:11px;margin:0;">151 Katherine Street, Sandton, Johannesburg · This is an automated message.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

      // Encode email
      const emailLines = [
        `To: ${project.customer_email}`,
        `Subject: Your Fibre Service is Live — Invoice ${invoiceNumber}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=UTF-8`,
        ``,
        htmlBody,
      ].join('\r\n');

      const encoded = btoa(unescape(encodeURIComponent(emailLines)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encoded }),
      });
    }

    return Response.json({
      success: true,
      invoice_id: invoice.id,
      invoice_number: invoiceNumber,
      emailed: !!project.customer_email,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});